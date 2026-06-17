# OrySaaS

🇬🇧 [English version](README.md)

OrySaaS est un starter/boilerplate SaaS full-stack organisé en monorepo :
- `core` : API Node.js + Express + TypeORM (MariaDB)
- `webapp` : Frontend Nuxt 4 + Vue 3 + Vuetify

Il fournit les fondations pour construire des produits SaaS multi-tenant plus rapidement : authentification, gestion des organisations, notifications, plans/quotas et bien plus, inclus d'emblée.

## Statut

> ⚠️ **En cours de développement — pas encore prêt pour la production.**

OrySaaS est actuellement en développement actif. La base de code n'est pas encore stable, les APIs peuvent évoluer sans préavis et plusieurs fonctionnalités sont encore manquantes ou incomplètes.

Il n'est **pas** destiné à une utilisation publique ou à une intégration tierce à ce stade. Aucun package npm, image Docker ou installation simplifiée n'est disponible pour le moment — il s'agit d'un monorepo brut, pensé pour être cloné et étendu directement.

Si vous tombez sur ce dépôt : libre à vous d'explorer, mais attendez-vous à des coins rugueux.

## Structure du dépôt

```text
orysaas/
  core/      # API (TypeScript, Express, TypeORM, MariaDB)
  webapp/    # Frontend (Nuxt 4, Vue 3, Vuetify)
  shared/    # Constantes et types partagés (rôles d'organisation, etc.)
```

## Fonctionnalités

- **Authentification** — email/mot de passe avec rotation des refresh tokens, vérification du compte par email, réinitialisation du mot de passe par email
- **Connexion sociale** — callbacks OAuth pour Google, Facebook et Microsoft
- **Organisations multi-tenant** — création, modification et suppression logique des organisations ; accès basé sur les rôles (Propriétaire / Administrateur / Membre)
- **Gestion des membres** — invitation par email (avec notification + email transactionnel), modification des rôles, suppression de membres
- **Suppression d'organisation** — flux sécurisé avec code de confirmation à 6 chiffres envoyé par email au propriétaire
- **Profil utilisateur** — mise à jour des informations personnelles, changement de mot de passe (bloqué pour les comptes sociaux)
- **Notifications en temps réel** — flux SSE, pagination par curseur, marquer comme lu / tout marquer comme lu
- **CMS** — édition de pages et de contenus par blocs, gestion des menus et éléments de menu
- **Plans et quotas** — gestion des abonnements et application des quotas
- **Formulaire de contact** — soumission et traitement côté portail
- **Jobs planifiés** — cron/runner de tâches avec endpoints de gestion en cours d'exécution
- **Upload de fichiers** — upload du logo de l'organisation avec stockage local
- **Emails transactionnels** — templates Handlebars pour tous les flux (vérification, réinitialisation, invitation, suppression d'organisation)

## Stack technique

### Backend (`core`)
- TypeScript
- Express
- TypeORM
- MariaDB
- Luxon (gestion des dates)
- Formidable (upload de fichiers)
- Handlebars (templates email)
- jsonwebtoken
- node-cron
- Nodemailer

### Frontend (`webapp`)
- Nuxt 4
- Vue 3 (Composition API)
- Vuetify 4

## Prérequis

- Node.js 20+
- npm 10+
- MariaDB 10.6+
- Docker (optionnel, pour la base de données en local)

## Démarrage

### 1. Installer les dépendances

Depuis la racine du dépôt :

```bash
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp core/.env.example core/.env
cp webapp/.env.example webapp/.env
```

Sous Windows PowerShell :

```powershell
Copy-Item core/.env.example core/.env
Copy-Item webapp/.env.example webapp/.env
```

#### `core/.env` — variables principales

| Variable                                                                    | Description                                                              |
|-----------------------------------------------------------------------------|--------------------------------------------------------------------------|
| `PORT`                                                                      | Port de l'API (défaut : `3001`)                                          |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USERNAME` / `DB_PASSWORD`          | Connexion MariaDB                                                        |
| `JWT_SECRET`                                                                | Secret de signature des tokens JWT — **générer une valeur aléatoire forte** |
| `API_URL`                                                                   | URL de base complète de l'API (ex. `http://localhost:3001/v1`)           |
| `HTTP_URL`                                                                  | URL publique du frontend (ex. `http://localhost:3000`)                   |
| `ALLOWED_ORIGINS`                                                           | Origines CORS autorisées, séparées par des virgules                      |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASS` / `MAIL_FROM`        | Configuration SMTP                                                       |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`                                 | Identifiants OAuth Google                                                |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`                             | Identifiants OAuth Facebook                                              |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` / `MICROSOFT_TENANT_ID`  | Identifiants OAuth Microsoft                                             |
| `PEPPER_REFRESH` / `PEPPER_RESET`                                           | Secrets supplémentaires pour le renforcement des tokens                  |

#### `webapp/.env` — variables principales

| Variable                                        | Description                                         |
|-------------------------------------------------|-----------------------------------------------------|
| `GOOGLE_CLIENT_ID`                              | Client ID Google OAuth (utilisé pour le bouton de connexion) |
| `FACEBOOK_APP_ID`                               | App ID Facebook                                     |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_TENANT_ID`  | Identifiants OAuth Microsoft                        |

### 3. Démarrer une MariaDB locale (optionnel — Docker)

```bash
docker run -p 3306:3306 --name orysaas \
  -e MARIADB_USER=orysaas \
  -e MARIADB_PASSWORD=orysaas \
  -e MARIADB_DATABASE=orysaas \
  -e MARIADB_ROOT_PASSWORD=root \
  -d mariadb:latest
```

Puis mettre à jour les variables `DB_*` dans `core/.env` en conséquence.

### 4. Lancer en développement

Depuis la racine (démarre l'API et le frontend en parallèle) :

```bash
npm run dev
```

URLs locales par défaut :
- Frontend : `http://localhost:3000`
- API : `http://localhost:3001`

## API

- Toutes les routes sont montées sous `/v1/*`.
- Hors production, la liste des routes est disponible à `GET http://localhost:3001/doc`.
- L'authentification utilise un token JWT `Bearer` dans le header `Authorization`.
- Les refresh tokens sont émis à la connexion et renouvelés à chaque utilisation.

## Base de données

TypeORM fonctionne avec `synchronize: true` hors production — le schéma est synchronisé automatiquement pendant le développement.

Pour alimenter la base de données :

```bash
npm run seed -- showcase
```

## Scripts disponibles

| Commande                   | Description                                   |
|----------------------------|-----------------------------------------------|
| `npm run dev`              | Lance backend + frontend en mode watch        |
| `npm run dev:core`         | Lance uniquement le backend                   |
| `npm run dev:webapp`       | Lance uniquement le frontend                  |
| `npm run build`            | Build backend et frontend                     |
| `npm run seed -- <name>`   | Exécute un seeder backend                     |

Commandes par workspace :

```bash
npm --workspace core run dev
npm --workspace core run tsc
npm --workspace webapp run dev
npm --workspace webapp run build
npm --workspace webapp run preview
```

## Flux d'authentification

### Email / mot de passe
1. Inscription → réception d'un email de vérification → activation du compte → connexion.
2. Mot de passe oublié → réception d'un email de réinitialisation (valable 1 heure) → définition d'un nouveau mot de passe.

### Connexion sociale
Après le callback du fournisseur OAuth, le backend redirige avec un paramètre `social_token` dans l'URL. Le middleware Nuxt le consomme, finalise la connexion et nettoie l'URL.

## Suppression logique (soft delete)

Les organisations, membres et invitations suivent un pattern de suppression logique : les enregistrements ne sont jamais supprimés physiquement, ils reçoivent un timestamp `deletedAt` et un UUID `deletedBy`. Un job planifié (à configurer) gère le nettoyage définitif après la période de rétention.

## Checklist production

- [ ] Définir `NODE_ENV=production`
- [ ] Désactiver `synchronize` dans TypeORM et utiliser des migrations
- [ ] Définir un `JWT_SECRET` fort
- [ ] Restreindre `ALLOWED_ORIGINS` à votre domaine uniquement
- [ ] Configurer un vrai serveur SMTP (variables `MAIL_*`)
- [ ] Configurer les identifiants OAuth pour chaque fournisseur activé
- [ ] Mettre en place HTTPS (reverse proxy — nginx, Caddy, etc.)
- [ ] Configurer un gestionnaire de processus (PM2, systemd, Docker)

## Contribuer

1. Créer une branche depuis `develop`
2. Limiter les modifications à une seule problématique
3. Ouvrir une pull request avec le contexte et les étapes de test

## Licence

Aucun fichier de licence n'est fourni pour le moment. Tous droits réservés — OryScorp.