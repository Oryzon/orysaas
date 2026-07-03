export default class Messages {
    // -------------------------
    // Authentification & Session
    // -------------------------
    static LOGIN_DONE = "Bienvenue.";
    static LOGOUT_DONE = "Vous avez bien été déconnecté.";
    static USER_EMAIL_EXIST = "Cette adresse e-mail est déjà utilisée.";
    static USER_INCORRECT_ORIGIN = "Cette adresse e-mail est déjà utilisée par un autre mode de connexion.";
    static INCORRECT_PASSWORD = "Votre mot de passe est incorrect.";
    static USER_INCORRECT_DATA = "Merci de vérifier vos identifiants.";
    static USER_CAN_T_LOG_IN = "Vous ne pouvez pas vous connecter.";
    static USER_NOT_ENABLE = "Votre compte n'est pas actif.";
    static USER_IS_LOGOUT = "Votre session n'est plus disponible, merci de vous identifier à nouveau.";
    static NEED_PASSWORD_RESET = "Merci de changer votre mot de passe.";
    static REFRESH_TOKEN_NOT_FOUND = "Désolé, nous n'avons pas pu vous ré-identifier, merci de saisir vos informations de connexion.";
    static REFRESH_TOKEN_REVOKED = "Cette session de connexion a été révoquée.";
    static REFRESH_TOKEN_EXPIRED = "Cette session de connexion a expiré, merci de vous reconnecter.";
    static REGISTER_IS_DISABLE = "Les inscriptions sont fermées.";
    static ACCOUNT_VERIFIED = "Votre compte a été activé, vous pouvez maintenant vous connecter.";
    static TOKEN_INVALID = "Ce lien d'activation est invalide ou a expiré.";
    static TOKEN_ALREADY_USED = "Ce compte est déjà activé.";
    static FORGOT_PASSWORD_SENT =
        "Si cet e-mail est associé à un compte, vous recevrez un lien de réinitialisation dans quelques instants.";
    static RESET_PASSWORD_INVALID_TOKEN = "Ce lien de réinitialisation est invalide ou a expiré.";
    static RESET_PASSWORD_PASSWORDS_DONT_MATCH = "Les mots de passe ne correspondent pas.";
    static RESET_PASSWORD_TOO_SHORT = "Le mot de passe doit contenir au moins 8 caractères.";
    static RESET_PASSWORD_DONE = "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.";
    static USER_NOT_AUTHED = "Vous n'êtes pas identifié.";

    // -------------------------
    // Utilisateurs
    // -------------------------
    static USER_NOT_FOUND = "L'utilisateur n'a pas été trouvé.";
    static USER_CREATED = "L'utilisateur a bien été créé.";
    static USER_UPDATED = "L'utilisateur a été mis à jour.";
    static USER_REMOVED = "L'utilisateur a bien été supprimé.";
    static USER_RESETED = "L'utilisateur a bien été réinitialisé.";
    static USER_SA_CAN_T_BE_REMOVED = "Cet utilisateur ne peut pas être supprimé, il s'agit d'un super-administrateur.";
    static USER_CAN_T_BE_REMOVED_HIMSELF = "Vous ne pouvez pas vous supprimer vous-même.";
    static USER_PROFILE_UPDATED = "Votre profil a été mis à jour.";
    static USER_PASSWORD_UPDATED = "Votre mot de passe a été mis à jour.";
    static USER_CANNOT_CHANGE_PASSWORD = "Vous ne pouvez pas modifier votre mot de passe car vous utilisez une connexion sociale.";
    static USER_SA_CAN_T_BE_RESETED = "Cet utilisateur ne peut pas être réinitialisé, il s'agit d'un super-administrateur.";
    static USER_ALREADY_IN_ROLE = "L'utilisateur possède déjà ce rôle.";
    static USER_ADDED_IN_ROLE = "Rôle assigné avec succès.";

    // -------------------------
    // Abonnements
    // -------------------------
    static PLAN_NOT_FOUND = "L'abonnement n'a pas été trouvé.";

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

    // -------------------------
    // Global
    // -------------------------
    static MISSING_PARAMETERS = "Merci de vérifier les paramètres fournis.";
    // OAuth / Social login
    // -------------------------
    static OAUTH_TOKEN_MISSING = "Token manquant";
    static OAUTH_CODE_MISSING = "Code d'autorisation manquant";
    static OAUTH_TOKEN_FETCH_ERROR = "Erreur lors de la récupération du token";
    static OAUTH_USER_FETCH_ERROR = "Impossible de récupérer les informations utilisateur";

    // -------------------------
    // Organizations
    // -------------------------
    static ORGANIZATION_CREATED = "L'organisation a bien été créée.";
    static ORGANIZATION_UPDATED = "L'organisation a été mise à jour.";
    static ORGANIZATION_ALREADY_EXIST =
        "Cette organisation existe déjà.. Si vous pensez qu'il s'agit d'une erreur, merci de contacter le support information.";
    static ORGANIZATION_LOGO_UPDATED = "Le logo a été mis à jour.";
    static ORGANIZATION_LOGO_FILE_MISSING = "Aucun fichier fourni.";
    static ORGANIZATION_SLUG_MISSING = "Slug d'organisation manquant.";
    static ORGANIZATION_NOT_FOUND = "Organisation introuvable.";
    static ORGANIZATION_MEMBER_NOT_FOUND = "Vous n'êtes pas membre de cette organisation.";
    static ORGANIZATION_INVITE_SENT = "L'invitation a bien été envoyée.";
    static ORGANIZATION_INVITE_ALREADY_MEMBER = "Cet utilisateur est déjà membre de l'organisation.";
    static ORGANIZATION_INVITE_ALREADY_PENDING = "Une invitation est déjà en attente pour cet e-mail.";
    static ORGANIZATION_INVITE_NOT_FOUND = "Cette invitation est introuvable ou a expiré.";
    static ORGANIZATION_INVITE_ALREADY_ACCEPTED = "Cette invitation a déjà été acceptée.";
    static ORGANIZATION_INVITE_ACCEPTED = "Vous avez bien rejoint l'organisation.";
    static ORGANIZATION_INVITE_CANCELLED = "L'invitation a été annulée.";
    static ORGANIZATION_INVITE_FORBIDDEN = "Vous n'avez pas les droits pour inviter des membres.";
    static ORGANIZATION_ROLE_INSUFFICIENT = "Vous n'avez pas les droits suffisants pour effectuer cette action.";
    static ORGANIZATION_MEMBER_UPDATED = "Le rôle du membre a été mis à jour.";
    static ORGANIZATION_MEMBER_REMOVED = "Le membre a été retiré de l'organisation.";
    static ORGANIZATION_MEMBER_OWNER_CANT_BE_EDITED = "Le rôle du propriétaire ne peut pas être modifié.";
    static ORGANIZATION_DELETE_CODE_SENT = "Un code de confirmation a été envoyé à votre adresse e-mail.";
    static ORGANIZATION_DELETE_CODE_INVALID = "Le code saisi est invalide ou a expiré.";
    static ORGANIZATION_DELETED = "L'organisation a été supprimée.";

    // -------------------------
    // Settings
    // -------------------------
    static SETTINGS_UPDATED = "Les paramètres ont été mis à jour.";
    static API_KEY_CREATED = "La clé d'API a été créée.";
    static API_KEY_DELETED = "La clé d'API a été supprimée.";

    // -------------------------
    // Permissions
    // -------------------------
    static PERMISSION_UNAUTHORIZED = "Unauthorized";
    static PERMISSION_FORBIDDEN = "Forbidden";
    static PERMISSION_INTERNAL_ERROR = "Internal server error";

    // -------------------------
    // Pages
    // -------------------------
    static PAGE_CREATED = "La page a été créee.";
    static PAGE_UPDATED = "La page a été modifiée.";
    static PAGE_REMOVED = "La page a été supprimée.";

    // -------------------------
    // Menus
    // -------------------------
    static MENU_CREATED = "Menu crée.";
    static MENU_UPDATED = "Le menu a été modifié.";
    static MENU_DELETED = "Le menu a été supprimé.";

    static MENU_ITEM_CREATED = "Le lien de menu a été crée.";
    static MENU_ITEM_MOVED = "Le lien de menu a été déplacé.";
    static MENU_ITEM_UPDATED = "Le lien de menu a été modifié.";
    static MENU_ITEM_REMOVED = "Le lien de menu a été supprimé.";

    static NO_FILE_SENDED = "No file sended.";

    // -------------------------
    // Contacts
    // -------------------------
    static CONTACT_SENDED = "Votre message a bien été envoyé.";
    static CONTACT_ARCHIVED = "Le message a bien été archivé.";

    // -------------------------
    // Quotas
    // -------------------------
    static QUOTA_CREATED = "L'option de quota a été ajoutée.";
    static QUOTA_UPDATED = "L'option de quota a été modifié.";

    // -------------------------
    // Quota Plan
    // -------------------------
    static QUOTA_PLAN_CREATED = "Le quota a été ajouté au plan.";
    static QUOTA_PLAN_UPDATED = "Le quota a été modifié au plan.";
    static QUOTA_PLAN_ALREADY_EXISTS = "Ce quota est déjà lié à ce plan.";
    static QUOTA_PLAN_DELETED = "Le quota a été supprimé du plan.";

    static PLAN_CREATED = "L'abonnement a été ajouté.";
    static PLAN_UPDATED = "L'abonnement a été modifié.";
    static PLAN_DELETED = "L'abonnement a été supprimé.";
}
