import { CheckJwt, Controller, Error, Get, Post } from "../../../decorators";
import { Request, Response } from "express";
import { UserEntity } from "../../../databases/entities/user.entity";
import { UserRepository } from "../../../databases/repositories/user.repository";
import { TokenRepository } from "../../../databases/repositories/token.repository";
import { MailService } from "../../../services/mail.service";
import Messages from "../../../config/messages";
import HttpCode from "../../../config/http-code";
import { Equal } from "typeorm";
import { DateTime } from "luxon";
import { RefreshTokenRepository } from "../../../databases/repositories/refresh-token.repository";

@Controller('auth')
export default class AuthController {

    @Post('/register')
    @Error()
    async register(req: Request, res: Response) {
        const {
            firstname,
            lastname,
            email,
            password
        } = req.body;

        const existing = await UserRepository.findOne({
            where: {
                email
            }
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
        user.canLogIn = false;

        user.hashPassword();

        await UserRepository.save(user);

        const tokenEntity = await TokenRepository.createToken(user, 'verify_account', 24);

        await new MailService().send({
            to: email,
            subject: 'Confirmez votre adresse e-mail',
            template: 'verify-account',
            variables: {
                firstname,
                verificationUrl: `${process.env.APP_URL}/verify?token=${tokenEntity.token}`,
            },
        });

        return res
            .status(HttpCode.OK)
            .send({ message: Messages.USER_CREATED });
    }

    @Post('/login')
    @Error()
    async login(req: Request, res: Response) {
        const {
            email,
            password
        } = req.body;

        let user: UserEntity = await UserRepository.findOne({
            where: {
                email: Equal(email)
            }
        });

        if (!user) {
            throw Messages.USER_INCORRECT_DATA;
        }

        if (!user.checkIfUnencryptedPasswordIsValid(password)) {
            throw Messages.USER_INCORRECT_DATA;
        }

        if (!user.isActive) {
            throw Messages.USER_NOT_ENABLE;
        }

        if (!user.canLogIn) {
            throw Messages.USER_CAN_T_LOG_IN;
        }

        user.lastLogin = DateTime.now().toJSDate();
        await UserRepository.save(user);

        res.status(HttpCode.OK).send({
            message: 'Bon retour parmis nous !',
            token: UserRepository.generateJwtToken(user),
            refreshToken: await RefreshTokenRepository.createToken(user.uuid),
        });
    }

    @Get('/verify')
    @Error()
    async verify(req: Request, res: Response) {
        const { token } = req.query as { token: string };

        const tokenEntity = await TokenRepository.findValid(token, 'verify_account');

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
        user.canLogIn = true;

        await UserRepository.save(user);
        await TokenRepository.markAsUsed(tokenEntity);

        return res
            .status(HttpCode.OK)
            .send({ message: Messages.ACCOUNT_VERIFIED });
    }

    @Post('/logout')
    @CheckJwt()
    @Error()
    async logout(req: Request, res: Response) {
        const { refreshToken } = req.body;

        if (refreshToken) {
            await RefreshTokenRepository.revoke(refreshToken);
        }

        return res
            .status(HttpCode.OK)
            .send({
                message: Messages.LOGOUT_DONE
            });
    }

    @Post('/refresh')
    @Error()
    async refresh(req: Request, res: Response) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res
                .status(HttpCode.UNAUTHORIZED)
                .send({
                    message: Messages.REFRESH_TOKEN_NOT_FOUND
                });
        }

        const entity = await RefreshTokenRepository.findValid(refreshToken);

        if (!entity) {
            return res
                .status(HttpCode.UNAUTHORIZED)
                .send({
                    message: Messages.REFRESH_TOKEN_EXPIRED
                });
        }

        const user = await UserRepository.findOne({
            where: {
                uuid: Equal(entity.userUuid)
            },
            select: {
                uuid: true,
                email: true,
                isActive: true,
                canLogIn: true
            },
        });

        if (!user || !user.isActive || !user.canLogIn) {
            return res
                .status(HttpCode.FORBIDDEN)
                .send({
                    message: Messages.USER_CAN_T_LOG_IN
                });
        }

        return res
            .status(HttpCode.OK)
            .send({
                token: UserRepository.generateJwtToken(user)
            });
    }

    @Post('/forgot-password')
    @Error()
    async forgotPassword(req: Request, res: Response) {
        const { email } = req.body;

        const user = await UserRepository.findOne({
            where: {
                email: Equal(email)
            }
        });

        if (user && user.isActive) {
            const tokenEntity = await TokenRepository.createToken(user, 'reset_password', 1);

            await new MailService().send({
                to: email,
                subject: 'Réinitialisez votre mot de passe',
                template: 'reset-password',
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

    @Post('/reset-password')
    @Error()
    async resetPassword(req: Request, res: Response) {
        const {
            token,
            newPassword,
            confNewPassword
        } = req.body;

        if (!newPassword || newPassword.length < 8) {
            return res
                .status(HttpCode.UNPROCESSABLE_ENTITY)
                .send({
                    message: Messages.RESET_PASSWORD_TOO_SHORT
                });
        }

        if (newPassword !== confNewPassword) {
            return res
                .status(HttpCode.UNPROCESSABLE_ENTITY)
                .send({
                    message: Messages.RESET_PASSWORD_PASSWORDS_DONT_MATCH
                });
        }

        const tokenEntity = await TokenRepository.findValid(token, 'reset_password');

        if (!tokenEntity || tokenEntity.isExpired()) {
            return res
                .status(HttpCode.UNPROCESSABLE_ENTITY)
                .send({
                    message: Messages.RESET_PASSWORD_INVALID_TOKEN
                });
        }

        if (tokenEntity.isUsed()) {
            return res
                .status(HttpCode.UNPROCESSABLE_ENTITY)
                .send({
                    message: Messages.RESET_PASSWORD_INVALID_TOKEN
                });
        }

        const user = tokenEntity.user;

        user.password = newPassword;
        user.hashPassword();

        await UserRepository.save(user);
        await TokenRepository.markAsUsed(tokenEntity);

        return res
            .status(HttpCode.OK)
            .send({
                message: Messages.RESET_PASSWORD_DONE
            });
    }
}