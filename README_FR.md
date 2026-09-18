# OrySaaS

🇬🇧 [English version](README.md)

OrySaaS est un starter/boilerplate SaaS full-stack organisé en monorepo :
- `core` : API Node.js + Express + TypeORM (MariaDB)
- `webapp` : Frontend Nuxt 4 + Vue 3 + Vuetify

Il fournit les fondations pour construire des produits SaaS multi-tenant plus rapidement : authentification, gestion des organisations, notifications, plans/quotas et bien plus, inclus d'emblée.

## Statut

> ✅ **MVP-ready.**

OrySaaS couvre les fondations d'un vrai SaaS multi-tenant — authentification, organisations et rôles, facturation, quotas, notifications, CMS — et est suffisamment solide pour construire de vraies règles métier par-dessus dès aujourd'hui. Le projet continue d'évoluer : les APIs peuvent changer d'une version à l'autre, et certains sujets opérationnels sont volontairement laissés à votre charge, car ils dépendent de comment et où vous hébergez votre produit (sauvegardes, observabilité, CI/CD, déploiement — voir [Déploiement](#déploiement)).

Aucun package npm ni image Docker n'est fourni — il s'agit d'un monorepo brut, pensé pour être cloné et étendu directement.

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

TypeORM fonctionne avec `synchronize: true` hors production (développement et tests) — le schéma est synchronisé automatiquement avec vos entités, rien à faire au quotidien.

En production, `synchronize` est désactivé volontairement (il peut supprimer une colonne qu'il pense obsolète — pas un risque à prendre sur des données réelles). Les changements de schéma passent par des migrations versionnées à la place — voir [Migrations](#migrations) ci-dessous.

Pour alimenter la base de données :

```bash
npm run seed -- showcase
```

## Migrations

Rien ne change pour le développement local : ajoutez une colonne à une entité, lancez l'app ou les tests, `synchronize` s'en occupe. Les migrations n'entrent en jeu qu'au moment de déployer un changement de schéma en production.

### Générer une migration

```bash
cd core
npm run migration:generate -- databases/migrations/NomDescriptif
```

Cette commande se connecte à la base pointée par votre `.env` actuel, la compare à vos entités, et écrit le fichier de migration. Pointez `.env` vers une base qui a déjà le schéma *avant* votre changement (typiquement votre base de dev) pour que le diff généré ne contienne que votre changement — pas un diff contre une base vide.

Relisez la migration générée avant de la committer : le diffing de TypeORM est bon mais pas infaillible, en particulier pour les renommages (il peut générer un drop + create au lieu d'un rename — à corriger à la main le cas échéant).

### Exécuter les migrations (production)

Avant de démarrer la nouvelle version du serveur, contre la base de production :

```bash
cd core
npm run migration:run
```

Ceci applique toutes les migrations pas encore exécutées, suivies dans une table `migrations` gérée par TypeORM lui-même.

> **Ne pas** appeler `dataSource.runMigrations()` depuis le code de démarrage de l'application (`server.ts`/`app.ts`). Si vous faites tourner plus d'une instance, deux instances démarrant en même temps entreraient en concurrence sur la même migration non appliquée. Exécutez-la comme une étape de déploiement à part, une seule fois, avant que les nouvelles instances ne démarrent — voir [Déploiement](#déploiement).

### Revenir en arrière

```bash
npm run migration:revert
```

Annule la dernière migration appliquée en appelant son `down()`. À utiliser uniquement juste après un déploiement raté — pas comme outil d'annulation général une fois que d'autres migrations se sont empilées par-dessus.

### La migration de base

`core/databases/migrations/*-InitialSchema.ts` crée tout le schéma existant au moment où elle a été écrite, à partir de rien. C'est le point de départ — chaque changement d'entité à partir de là reçoit sa propre migration par-dessus.

## Tests

La suite de tests backend (Vitest) exécute des tests d'intégration contre une vraie base MariaDB jetable plutôt que des mocks, pour exercer le même comportement TypeORM/MariaDB qu'en production (colonnes générées, verrous nommés, enums, colonnes JSON, etc.).

La façon la plus simple de la lancer, depuis la racine du dépôt :

```bash
npm test
```

Cette seule commande démarre une MariaDB jetable (`docker-compose.test.yml`, port 3307), lance `tsc` puis toute la suite Vitest contre elle, puis arrête la base ensuite — même en cas d'échec d'un test. Nécessite Docker en local.

Pour un retour plus rapide en itérant sur un seul fichier de test, laissez la base de test tourner et utilisez le mode watch :

```bash
npm run test:db:up      # démarre la MariaDB jetable et la laisse tourner
npm run test:watch      # dans core — tsc, puis Vitest en mode watch
npm run test:db:down    # l'arrête une fois terminé
```

## Scripts disponibles

| Commande                     | Description                                                  |
|-------------------------------|----------------------------------------------------------------|
| `npm run dev`                  | Lance backend + frontend en mode watch                        |
| `npm run dev:core`             | Lance uniquement le backend                                    |
| `npm run dev:webapp`           | Lance uniquement le frontend                                    |
| `npm run build`                 | Build backend et frontend                                       |
| `npm run lint`                  | Lint backend et frontend                                         |
| `npm run format`                | Formate tout le dépôt avec Prettier                              |
| `npm run format:check`          | Vérifie le formatage sans écrire                                 |
| `npm run seed -- <name>`        | Exécute un seeder backend                                        |
| `npm test`                      | Lance la suite de tests backend complète (voir [Tests](#tests))  |
| `npm run test:watch`            | Tests en mode watch contre une base de test déjà démarrée        |
| `npm run test:db:up`            | Démarre la MariaDB de test jetable                                |
| `npm run test:db:down`          | Arrête la base de test                                            |

Commandes par workspace :

```bash
npm --workspace core run dev
npm --workspace core run tsc
npm --workspace core run migration:generate -- databases/migrations/NomDescriptif
npm --workspace core run migration:run
npm --workspace core run migration:revert
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

## Déploiement

Ce dépôt ne fournit volontairement ni Dockerfile ni pipeline CI (voir [Statut](#statut)) — le déploiement reste à votre charge, quelle que soit la façon dont vous choisissez de l'automatiser. Quel que soit le mode ci-dessous, passez d'abord par cette checklist :

- [ ] Définir `NODE_ENV=production`
- [ ] Définir un `JWT_SECRET` fort et aléatoire (ainsi que `PEPPER_REFRESH`/`PEPPER_RESET`)
- [ ] Restreindre `ALLOWED_ORIGINS` à votre/vos vrai(s) domaine(s)
- [ ] Configurer un vrai serveur SMTP (variables `MAIL_*`)
- [ ] Configurer les identifiants OAuth pour chaque fournisseur réellement activé
- [ ] Mettre en place HTTPS (reverse proxy — nginx, Caddy, etc.)

### Mode manuel

1. Sur le serveur : clonez le dépôt, `npm install`, puis renseignez `core/.env` et `webapp/.env` avec les valeurs de production.
2. Build des deux apps : `npm run build`.
3. Appliquez les migrations en attente sur la base de production — une seule fois, avant de démarrer la nouvelle version (voir [Migrations](#migrations)) :
   ```bash
   cd core
   npm run migration:run
   ```
4. Démarrez l'API derrière un gestionnaire de processus (PM2, systemd, …) avec `NODE_ENV=production`, par exemple `node core/build/core/server.js`. Servez le build du `webapp` (`webapp/.output`) de la même façon, ou via `npm --workspace webapp run preview` derrière votre gestionnaire de processus — voir la [doc de déploiement Nuxt](https://nuxt.com/docs/getting-started/deployment) pour l'option adaptée à votre hébergeur.
5. Pointez votre reverse proxy sur les deux : `/v1/*` (et `/doc` si vous le laissez ouvert) vers l'API, le reste vers le frontend.

### Mode automatique (dépendant de votre hébergeur)

La plupart des hébergeurs (Railway, Render, Fly.io, un VPS avec votre propre CI, un Coolify/Dokploy auto-hébergé, …) peuvent exécuter ce même cycle build → migration → démarrage pour vous à chaque push — mais la configuration exacte dépend entièrement de l'hébergeur, il n'existe pas une config unique qui convienne à tous. En général :

- Donnez à votre hébergeur une commande de build (`npm install && npm run build`) et une commande de démarrage par app, correspondant à l'étape 4 ci-dessus.
- Si votre hébergeur propose une étape « release » / « pre-deploy » (exécutée une fois, avant que les nouvelles instances ne reçoivent du trafic), utilisez-la pour lancer `npm --workspace core run migration:run`. C'est l'équivalent automatisé de l'étape 3 — la même règle s'applique : à exécuter une seule fois par déploiement, jamais depuis le code de démarrage de l'app, pour que deux instances démarrant en même temps ne puissent pas entrer en concurrence sur la même migration.
- Si votre hébergeur build à partir d'un Dockerfile, il faudra en écrire un (un simple multi-stage install → build → run suffit) — aucun n'est fourni ici, car il doit correspondre à la façon dont vous comptez réellement faire tourner `core` et `webapp` sur l'hébergeur choisi.

## Contribuer

1. Créer une branche depuis `develop`
2. Limiter les modifications à une seule problématique
3. Ouvrir une pull request avec le contexte et les étapes de test

## Licence

MIT — voir [LICENSE.md](LICENSE.md). Copyright © 2026 OryScorp.