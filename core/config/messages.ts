export default class Messages {
    // -------------------------
    // Authentification & Session
    // -------------------------
    static LOGIN_DONE = "Bienvenue.";
    static LOGOUT_DONE = "Vous avez bien été déconnecté.";
    static USER_EMAIL_EXIST = "Cette adresse e-mail est déjà utilisée.";
    static USER_INCORRECT_ORIGIN =
        "Cette adresse e-mail est déjà utilisée par un autre mode de connexion.";
    static INCORRECT_PASSWORD = "Votre mot de passe est incorrect.";
    static USER_INCORRECT_DATA = "Merci de vérifier vos identifiants.";
    static USER_CAN_T_LOG_IN = "Vous ne pouvez pas vous connecter.";
    static USER_NOT_ENABLE = "Votre compte n'est pas actif.";
    static USER_IS_LOGOUT =
        "Votre session n'est plus disponible, merci de vous identifier à nouveau.";
    static NEED_PASSWORD_RESET = "Merci de changer votre mot de passe.";
    static REFRESH_TOKEN_NOT_FOUND =
        "Désolé, nous n'avons pas pu vous ré-identifier, merci de saisir vos informations de connexion.";
    static REFRESH_TOKEN_REVOKED = "Cette session de connexion a été révoquée.";
    static REFRESH_TOKEN_EXPIRED =
        "Cette session de connexion a expiré, merci de vous reconnecter.";
    static REGISTER_IS_DISABLE = "Les inscriptions sont fermées.";
    static ACCOUNT_VERIFIED =
        "Votre compte a été activé, vous pouvez maintenant vous connecter.";
    static TOKEN_INVALID = "Ce lien d'activation est invalide ou a expiré.";
    static TOKEN_ALREADY_USED = "Ce compte est déjà activé.";
    static FORGOT_PASSWORD_SENT = "Si cet e-mail est associé à un compte, vous recevrez un lien de réinitialisation dans quelques instants.";
    static RESET_PASSWORD_INVALID_TOKEN = "Ce lien de réinitialisation est invalide ou a expiré.";
    static RESET_PASSWORD_PASSWORDS_DONT_MATCH = "Les mots de passe ne correspondent pas.";
    static RESET_PASSWORD_TOO_SHORT = "Le mot de passe doit contenir au moins 8 caractères.";
    static RESET_PASSWORD_DONE = "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.";
    static USER_NOT_AUTHED = "Vous n'êtes pas identifié."

    // -------------------------
    // Utilisateurs
    // -------------------------
    static USER_NOT_FOUND = "L'utilisateur n'a pas été trouvé.";
    static USER_CREATED = "L'utilisateur a bien été créé.";
    static USER_UPDATED = "L'utilisateur a été mis à jour.";
    static USER_REMOVED = "L'utilisateur a bien été supprimé.";
    static USER_RESETED = "L'utilisateur a bien été réinitialisé.";
    static USER_SA_CAN_T_BE_REMOVED =
        "Cet utilisateur ne peut pas être supprimé, il s'agit d'un super-administrateur.";
    static USER_CAN_T_BE_REMOVED_HIMSELF =
        "Vous ne pouvez pas vous supprimer vous-même.";
    static USER_SA_CAN_T_BE_RESETED =
        "Cet utilisateur ne peut pas être réinitialisé, il s'agit d'un super-administrateur.";
    static USER_ALREADY_IN_ROLE = "L'utilisateur possède déjà ce rôle.";
    static USER_ADDED_IN_ROLE = "Rôle assigné avec succès.";

    // -------------------------
    // Emails
    // -------------------------
    static MAIL_SUCCESS = "L'e-mail a bien été envoyé.";

    // -------------------------
    // Jobs
    // -------------------------
    static JOB_UPDATED = "Le job a été mis à jour.";
    static JOB_RUNNED = "Le job vient d'être lancé.";


    // -------------------------
    // Notifications
    // -------------------------
    static NOTIFICATION_READED = "Notification lue.";
    static NOTIFICATIONS_READED = "Notifications lues.";
}
