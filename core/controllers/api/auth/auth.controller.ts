import { CheckJwt, Controller, Error, Get, Post } from "../../../decorators";
import { Request, Response } from "express";
import { UserEntity, UserOrigin, } from "../../../databases/entities/user.entity";
import { UserRepository } from "../../../databases/repositories/user.repository";
import { TokenRepository } from "../../../databases/repositories/token.repository";
import { MailService } from "../../../services/mail.service";
import Messages from "../../../config/messages";
import HttpCode from "../../../config/http-code";
import { Equal } from "typeorm";
import { DateTime } from "luxon";
import { RefreshTokenRepository } from "../../../databases/repositories/refresh-token.repository";
import { TokenType } from "../../../databases/entities/token.entity";
import crypto from "crypto";

type OAuthUserData = {
    email?: string;
    firstname?: string;
    lastname?: string;
    name?: string;
};

type OAuthCallbackOptions = {
    origin: UserOrigin;
    code: unknown;
    authError?: unknown;
    getAccessToken: (code: string) => Promise<string | null>;
    getUserData: (accessToken: string) => Promise<OAuthUserData | null>;
};

type OAuthLoginResult =
    | {
          ok: true;
          user: UserEntity;
      }
    | {
          ok: false;
          status: number;
          message: string;
      };

@Controller("auth")
export default class AuthController {
    @Post("/register")
    @Error()
    async register(req: Request, res: Response) {
        const { firstname, lastname, email, password } = req.body;

        const existing = await UserRepository.findOne({
            where: {
                email,
            },
        });

        if (existing) {
            return res
                .status(HttpCode.UNPROCESSABLE_ENTITY)
                .send({ message: Messages.USER_EMAIL_EXIST });
        }

        const user = new UserEntity();

        user.firstname = firstname;
        user.lastname = lastname;
        user.email = email;
        user.password = password;
        user.isActive = false;

        user.hashPassword();

        await UserRepository.save(user);

        const tokenEntity = await TokenRepository.createToken(user, TokenType.verify_account, 24);

        await new MailService().send({
            to: email,
            subject: "Confirmez votre adresse e-mail",
            template: "verify-account",
            variables: {
                firstname,
                verificationUrl: `${process.env.APP_URL}/verify?token=${tokenEntity.token}`,
            },
        });

        return res.status(HttpCode.OK).send({ message: Messages.USER_CREATED });
    }

    @Post("/login")
    @Error()
    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        let user: UserEntity = await UserRepository.findOne({
            where: {
                email: Equal(email),
            },
        });

        if (!user) {
            throw Messages.USER_INCORRECT_DATA;
        }

        if (user.origin !== UserOrigin.LOCAL) {
            throw Messages.USER_INCORRECT_ORIGIN;
        }

        if (!user.checkIfUnencryptedPasswordIsValid(password)) {
            throw Messages.USER_INCORRECT_DATA;
        }

        if (!user.isActive) {
            throw Messages.USER_NOT_ENABLE;
        }

        user.lastLogin = DateTime.now().toJSDate();
        await UserRepository.save(user);

        res.status(HttpCode.OK).send({
            message: "Bon retour parmis nous !",
            token: UserRepository.generateJwtToken(user),
            refreshToken: await RefreshTokenRepository.createToken(user.uuid),
        });
    }

    @Post("/social-login")
    @Error()
    async socialLogin(req: Request, res: Response) {
        const { token } = req.body;

        if (typeof token !== "string") {
            return res.status(HttpCode.BAD_REQUEST).send({
                message: "Token manquant",
            });
        }

        const tokenEntity = await TokenRepository.findValid(
            token,
            TokenType.social_login
        );

        if (!tokenEntity || tokenEntity.isExpired()) {
            return res
                .status(HttpCode.OK)
                .send({ message: Messages.TOKEN_INVALID });
        }

        if (tokenEntity.isUsed()) {
            return res
                .status(HttpCode.OK)
                .send({ message: Messages.TOKEN_ALREADY_USED });
        }

        const user = tokenEntity.user;

        if (!user || !user.isActive) {
            return res.status(HttpCode.FORBIDDEN).send({
                message: Messages.USER_CAN_T_LOG_IN,
            });
        }

        const jwt = UserRepository.generateJwtToken(user);
        const refreshToken = await RefreshTokenRepository.createToken(
            user.uuid,
        );

        await TokenRepository.markAsUsed(tokenEntity);

        return res.status(HttpCode.OK).send({
            token: jwt,
            refreshToken,
        });
    }

    @Get("/verify")
    @Error()
    async verify(req: Request, res: Response) {
        const { token } = req.query as { token: string };

        const tokenEntity = await TokenRepository.findValid(token, TokenType.verify_account);

        if (!tokenEntity || tokenEntity.isExpired()) {
            return res
                .status(HttpCode.OK)
                .send({ message: Messages.TOKEN_INVALID });
        }

        if (tokenEntity.isUsed()) {
            return res
                .status(HttpCode.OK)
                .send({ message: Messages.TOKEN_ALREADY_USED });
        }

        const user = tokenEntity.user;
        user.isActive = true;

        await UserRepository.save(user);
        await TokenRepository.markAsUsed(tokenEntity);

        return res
            .status(HttpCode.OK)
            .send({ message: Messages.ACCOUNT_VERIFIED });
    }

    @Post("/logout")
    @CheckJwt()
    @Error()
    async logout(req: Request, res: Response) {
        const { refreshToken } = req.body;

        if (refreshToken) {
            await RefreshTokenRepository.revoke(refreshToken);
        }

        return res.status(HttpCode.OK).send({
            message: Messages.LOGOUT_DONE,
        });
    }

    @Post("/refresh")
    @Error()
    async refresh(req: Request, res: Response) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(HttpCode.UNAUTHORIZED).send({
                message: Messages.REFRESH_TOKEN_NOT_FOUND,
            });
        }

        const entity = await RefreshTokenRepository.findValid(refreshToken);

        if (!entity) {
            return res.status(HttpCode.UNAUTHORIZED).send({
                message: Messages.REFRESH_TOKEN_EXPIRED,
            });
        }

        const user = await UserRepository.findOne({
            where: {
                uuid: Equal(entity.userUuid),
            },
            select: {
                uuid: true,
                email: true,
                isActive: true,
            },
        });

        if (!user || !user.isActive) {
            return res
                .status(HttpCode.FORBIDDEN)
                .send({
                    message: Messages.USER_CAN_T_LOG_IN
                });
        }

        return res.status(HttpCode.OK).send({
            token: UserRepository.generateJwtToken(user),
        });
    }

    @Post("/forgot-password")
    @Error()
    async forgotPassword(req: Request, res: Response) {
        const { email } = req.body;

        const user = await UserRepository.findOne({
            where: {
                email: Equal(email),
            },
        });

        if (user && user.isActive) {
            const tokenEntity = await TokenRepository.createToken(user, TokenType.reset_password, 1);

            await new MailService().send({
                to: email,
                subject: "Réinitialisez votre mot de passe",
                template: "reset-password",
                variables: {
                    firstname: user.firstname,
                    resetUrl: `${process.env.APP_URL}/reset-password?token=${tokenEntity.token}`,
                },
            });
        }

        return res
            .status(HttpCode.OK)
            .send({ message: Messages.FORGOT_PASSWORD_SENT });
    }

    @Post("/reset-password")
    @Error()
    async resetPassword(req: Request, res: Response) {
        const { token, newPassword, confNewPassword } = req.body;

        if (!newPassword || newPassword.length < 8) {
            return res.status(HttpCode.UNPROCESSABLE_ENTITY).send({
                message: Messages.RESET_PASSWORD_TOO_SHORT,
            });
        }

        if (newPassword !== confNewPassword) {
            return res.status(HttpCode.UNPROCESSABLE_ENTITY).send({
                message: Messages.RESET_PASSWORD_PASSWORDS_DONT_MATCH,
            });
        }

        const tokenEntity = await TokenRepository.findValid(token, TokenType.reset_password);

        if (!tokenEntity || tokenEntity.isExpired()) {
            return res.status(HttpCode.UNPROCESSABLE_ENTITY).send({
                message: Messages.RESET_PASSWORD_INVALID_TOKEN,
            });
        }

        if (tokenEntity.isUsed()) {
            return res.status(HttpCode.UNPROCESSABLE_ENTITY).send({
                message: Messages.RESET_PASSWORD_INVALID_TOKEN,
            });
        }

        const user = tokenEntity.user;

        user.password = newPassword;
        user.hashPassword();

        await UserRepository.save(user);
        await TokenRepository.markAsUsed(tokenEntity);

        return res.status(HttpCode.OK).send({
            message: Messages.RESET_PASSWORD_DONE,
        });
    }

    @Get("/callback/google")
    @Error()
    async googleCallback(req: Request, res: Response) {
        return this.handleOAuthCallback(req, res, {
            origin: UserOrigin.GOOGLE,
            code: req.query.code,
            authError: req.query.error,
            getAccessToken: async (code: string) => {
                const redirectUri =
                    process.env.GOOGLE_REDIRECT_URI ||
                    `${process.env.API_URL}/auth/callback/google`;

                const params = new URLSearchParams();
                params.append("code", code);
                params.append("client_id", process.env.GOOGLE_CLIENT_ID || "");
                params.append(
                    "client_secret",
                    process.env.GOOGLE_CLIENT_SECRET || "",
                );
                params.append("redirect_uri", redirectUri);
                params.append("grant_type", "authorization_code");

                const tokenResponse = await fetch(
                    "https://oauth2.googleapis.com/token",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: params.toString(),
                    },
                );

                const tokenData = (await tokenResponse.json()) as {
                    access_token?: string;
                };

                if (!tokenResponse.ok || !tokenData.access_token) {
                    return null;
                }

                return tokenData.access_token;
            },
            getUserData: async (accessToken: string) => {
                const userResponse = await fetch(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    },
                );

                const userData = (await userResponse.json()) as {
                    email?: string;
                    given_name?: string;
                    family_name?: string;
                    name?: string;
                };

                if (!userResponse.ok) {
                    return null;
                }

                return {
                    email: userData.email,
                    firstname: userData.given_name,
                    lastname: userData.family_name,
                    name: userData.name,
                };
            },
        });
    }

    @Get("/callback/facebook")
    @Error()
    async facebookCallback(req: Request, res: Response) {
        return this.handleOAuthCallback(req, res, {
            origin: UserOrigin.FACEBOOK,
            code: req.query.code,
            authError: req.query.error,
            getAccessToken: async (code: string) => {
                const tokenUrl = new URL(
                    "https://graph.facebook.com/v20.0/oauth/access_token",
                );
                tokenUrl.searchParams.append(
                    "client_id",
                    process.env.FACEBOOK_APP_ID || "",
                );
                tokenUrl.searchParams.append(
                    "client_secret",
                    process.env.FACEBOOK_APP_SECRET || "",
                );
                tokenUrl.searchParams.append(
                    "redirect_uri",
                    `${process.env.API_URL}/auth/callback/facebook`,
                );
                tokenUrl.searchParams.append("code", code);

                const tokenResponse = await fetch(tokenUrl.toString());
                const tokenData = (await tokenResponse.json()) as {
                    access_token?: string;
                };

                if (!tokenResponse.ok || !tokenData.access_token) {
                    return null;
                }

                return tokenData.access_token;
            },
            getUserData: async (accessToken: string) => {
                const userUrl = new URL("https://graph.facebook.com/me");
                userUrl.searchParams.append(
                    "fields",
                    "id,name,email,first_name,last_name",
                );
                userUrl.searchParams.append("access_token", accessToken);

                const userResponse = await fetch(userUrl.toString());
                const userData = (await userResponse.json()) as {
                    email?: string;
                    first_name?: string;
                    last_name?: string;
                    name?: string;
                };

                if (!userResponse.ok) {
                    return null;
                }

                return {
                    email: userData.email,
                    firstname: userData.first_name,
                    lastname: userData.last_name,
                    name: userData.name,
                };
            },
        });
    }

    @Get("/callback/microsoft")
    @Error()
    async microsoftCallback(req: Request, res: Response) {
        return this.handleOAuthCallback(req, res, {
            origin: UserOrigin.MICROSOFT,
            code: req.query.code,
            authError: req.query.error,
            getAccessToken: async (code: string) => {
                const tokenParams = new URLSearchParams({
                    client_id: process.env.MICROSOFT_CLIENT_ID || "",
                    client_secret: process.env.MICROSOFT_CLIENT_SECRET || "",
                    code,
                    redirect_uri: `${process.env.API_URL}/auth/callback/microsoft`,
                    grant_type: "authorization_code",
                });

                const tokenResponse = await fetch(
                    `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: tokenParams.toString(),
                    },
                );

                const tokenData = (await tokenResponse.json()) as {
                    access_token?: string;
                };

                if (!tokenResponse.ok || !tokenData.access_token) {
                    return null;
                }

                return tokenData.access_token;
            },
            getUserData: async (accessToken: string) => {
                const userResponse = await fetch(
                    "https://graph.microsoft.com/v1.0/me",
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    },
                );

                const userData = (await userResponse.json()) as {
                    userPrincipalName?: string;
                    mail?: string;
                    givenName?: string;
                    surname?: string;
                    displayName?: string;
                };

                if (!userResponse.ok) {
                    return null;
                }

                return {
                    email: userData.userPrincipalName || userData.mail,
                    firstname: userData.givenName,
                    lastname: userData.surname,
                    name: userData.displayName,
                };
            },
        });
    }

    private async handleOAuthCallback(
        req: Request,
        res: Response,
        options: OAuthCallbackOptions,
    ) {
        const { origin, code, authError, getAccessToken, getUserData } =
            options;

        if (authError) {
            return res.redirect(`${process.env.HTTP_URL}/login`);
        }

        if (typeof code !== "string") {
            return res.status(HttpCode.BAD_REQUEST).send({
                message: "Code d'autorisation manquant",
            });
        }

        const accessToken = await getAccessToken(code);

        if (!accessToken) {
            return res.status(HttpCode.INTERNAL_ERROR).send({
                message: "Erreur lors de la récupération du token",
            });
        }

        const userData = await getUserData(accessToken);

        if (!userData?.email) {
            return res.status(HttpCode.INTERNAL_ERROR).send({
                message: "Impossible de récupérer les informations utilisateur",
            });
        }

        const userLoginResponse = await this.handleOriginUserLogin(
            res,
            {
                email: userData.email,
                firstname: userData.firstname,
                lastname: userData.lastname,
                name: userData.name,
            },
            origin,
        );

        if (userLoginResponse.ok === false) {
            return (
                res
                    .status(userLoginResponse.status)
                    // .send({
                    //     message: userLoginResponse.message,
                    // })
                    .redirect(
                        `${process.env.HTTP_URL}/login?error=${encodeURIComponent(userLoginResponse.message)}`,
                    )
            );
        }

        return res.redirect(
            await this.buildPortalRedirectUrl(userLoginResponse.user),
        );
    }

    private async handleOriginUserLogin(
        res: Response,
        userData: {
            email: string;
            firstname?: string;
            lastname?: string;
            name?: string;
        },
        origin: UserOrigin,
    ): Promise<OAuthLoginResult> {
        let user = await UserRepository.findOne({
            where: {
                email: Equal(userData.email),
            },
        });

        if (!user) {
            const [firstnameFromName = "", lastnameFromName = ""] = (
                userData.name || ""
            ).split(" ");

            user = new UserEntity();
            user.email = userData.email;
            user.firstname = userData.firstname || firstnameFromName;
            user.lastname = userData.lastname || lastnameFromName;
            user.origin = origin;
            user.password = crypto.randomBytes(32).toString("hex");
            user.isActive = true;

            user.hashPassword();

            await UserRepository.save(user);
        } else if (user.origin && user.origin !== origin) {
            return {
                ok: false,
                status: HttpCode.BAD_REQUEST,
                message: Messages.USER_INCORRECT_ORIGIN,
            };
        }

        if (!user.isActive) {
            throw Messages.USER_NOT_ENABLE;
        }

        user.lastLogin = DateTime.now().toJSDate();
        const savedUser = await UserRepository.save(user);

        return { ok: true, user: savedUser };
    }

    private async buildPortalRedirectUrl(user: UserEntity): Promise<string> {
        const redirectUrl = new URL(`${process.env.HTTP_URL}/portal/dashboard`);

        const accessToken = await TokenRepository.createToken(user, TokenType.social_login);

        redirectUrl.searchParams.set("social_token", accessToken.token);

        return redirectUrl.toString();
    }
}
