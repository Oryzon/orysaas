import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1789759762995 implements MigrationInterface {
    name = "InitialSchema1789759762995";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`user_entity\` (\`uuid\` uuid NOT NULL, \`password\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`firstname\` varchar(255) NULL, \`lastname\` varchar(255) NULL, \`origin\` enum ('local', 'google', 'facebook', 'microsoft') NOT NULL DEFAULT 'local', \`isActive\` tinyint NOT NULL, \`lastLogin\` datetime NULL, \`isSaasAdmin\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, UNIQUE INDEX \`IDX_415c35b9b3b6fe45a3b065030f\` (\`email\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`organization_member_entity\` (\`uuid\` uuid NOT NULL, \`organizationUuid\` uuid NOT NULL, \`memberUuid\` uuid NOT NULL, \`role\` enum ('owner', 'admin', 'member') NOT NULL, \`uniqueKey\` varchar(36) AS (IF(deletedAt IS NULL, memberUuid, uuid)) STORED, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, INDEX \`IDX_bbc62108619523a5a80266a6b1\` (\`organizationUuid\`), INDEX \`IDX_f1e24bcd61f2ece1fb9352635f\` (\`memberUuid\`), UNIQUE INDEX \`IDX_491006cdcc757963e0c8ff7c76\` (\`organizationUuid\`, \`uniqueKey\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `INSERT INTO \`orysaas_test\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, ?, ?, ?, ?)`,
            [
                "orysaas_test",
                "organization_member_entity",
                "GENERATED_COLUMN",
                "uniqueKey",
                "IF(deletedAt IS NULL, memberUuid, uuid)",
            ],
        );
        await queryRunner.query(
            `CREATE TABLE \`organization_invite_entity\` (\`uuid\` uuid NOT NULL, \`organizationUuid\` uuid NOT NULL, \`email\` varchar(255) NOT NULL, \`role\` enum ('owner', 'admin', 'member') NOT NULL, \`token\` varchar(255) NOT NULL, \`expiresAt\` datetime NOT NULL, \`acceptedAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, INDEX \`IDX_a5eb4bf8b21d55f72fcee8b107\` (\`organizationUuid\`), INDEX \`IDX_adfc77f9c61c4c2a11ce7dc6ea\` (\`email\`), UNIQUE INDEX \`IDX_cb96b80d6b58598b0bc2999993\` (\`token\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`quota_entity\` (\`uuid\` uuid NOT NULL, \`key\` varchar(255) NOT NULL, \`unit\` varchar(255) NOT NULL, \`defaultValue\` decimal(10,2) NULL, \`period\` enum ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'LIFETIME') NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, UNIQUE INDEX \`IDX_7fe66fbb79e93e6598c0b165dc\` (\`key\`, \`period\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`quota_plan_entity\` (\`uuid\` uuid NOT NULL, \`quotaUuid\` uuid NOT NULL, \`planUuid\` uuid NOT NULL, \`value\` decimal(10,2) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, INDEX \`IDX_6fa2f54f9f52870ac261c5b0d3\` (\`quotaUuid\`), INDEX \`IDX_e357d7eb3dc4dfcca13074ef99\` (\`planUuid\`), UNIQUE INDEX \`IDX_a245afbad1787b4a321f85a46b\` (\`quotaUuid\`, \`planUuid\`, \`deletedAt\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`plan_entity\` (\`uuid\` uuid NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`isActive\` tinyint NOT NULL, \`isPopular\` tinyint NOT NULL DEFAULT 0, \`slug\` varchar(255) NOT NULL, \`stripeProductId\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`plan_price_entity\` (\`uuid\` uuid NOT NULL, \`billingInterval\` enum ('month', 'year') NOT NULL, \`sellPrice\` decimal(10,2) NOT NULL, \`purchasePrice\` decimal(10,2) NOT NULL, \`trialPeriod\` int NOT NULL DEFAULT '0', \`stripePriceId\` varchar(255) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`planUuid\` uuid NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, INDEX \`IDX_ffcfc1477f91adcd57dd2094ed\` (\`planUuid\`), UNIQUE INDEX \`IDX_5193ad051bd235eb75b19858cf\` (\`planUuid\`, \`billingInterval\`, \`deletedAt\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`subscription_entity\` (\`uuid\` uuid NOT NULL, \`stripeSubscriptionId\` varchar(255) NOT NULL, \`stripeCustomerId\` varchar(255) NOT NULL, \`organizationUuid\` uuid NOT NULL, \`planPriceUuid\` uuid NOT NULL, \`status\` enum ('trialing', 'active', 'past_due', 'canceled', 'unpaid') NOT NULL, \`trialEndsAt\` datetime NULL, \`currentPeriodStart\` datetime NULL, \`currentPeriodEnd\` datetime NULL, \`canceledAt\` datetime NULL, \`trialEndingNotifiedAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, INDEX \`IDX_4495459efe2e0f84f53a98e5df\` (\`organizationUuid\`), INDEX \`IDX_9001b2b05c984dd592074d5239\` (\`planPriceUuid\`), UNIQUE INDEX \`IDX_b3748683e29356e7b58384b3bc\` (\`stripeSubscriptionId\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`invoice_entity\` (\`uuid\` uuid NOT NULL, \`stripeInvoiceId\` varchar(255) NOT NULL, \`organizationUuid\` uuid NOT NULL, \`number\` varchar(255) NULL, \`date\` datetime NOT NULL, \`amount\` float NOT NULL, \`currency\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, \`hostedInvoiceUrl\` varchar(255) NULL, \`invoicePdf\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, INDEX \`IDX_1b06844b82cc7865180e613374\` (\`organizationUuid\`), UNIQUE INDEX \`IDX_9333bb222f58b26401d2a60ffd\` (\`stripeInvoiceId\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`organization_entity\` (\`uuid\` uuid NOT NULL, \`name\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`logoUrl\` varchar(255) NULL, \`legalForm\` varchar(255) NULL, \`siret\` varchar(255) NULL, \`shareCapital\` varchar(255) NULL, \`nafCode\` varchar(255) NULL, \`vatCode\` varchar(255) NULL, \`cityRegistry\` varchar(255) NULL, \`address\` varchar(255) NOT NULL, \`city\` varchar(255) NOT NULL, \`postalCode\` varchar(255) NOT NULL, \`country\` varchar(255) NOT NULL, \`stripeCustomerId\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`api_key_entity\` (\`uuid\` uuid NOT NULL, \`label\` varchar(255) NOT NULL, \`type\` enum ('INTEGRATION', 'CONSUMER') NOT NULL, \`systemKey\` varchar(255) NULL, \`value\` varchar(500) NOT NULL, \`organizationUuid\` uuid NULL, \`expiresAt\` datetime NULL, \`lastUsedAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, INDEX \`IDX_7c69d7bc6fe230c1782ca7a87e\` (\`organizationUuid\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`page_entity\` (\`uuid\` uuid NOT NULL, \`slug\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`metaTitle\` varchar(255) NOT NULL, \`metaDescription\` varchar(255) NOT NULL, \`isPublished\` tinyint NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, UNIQUE INDEX \`IDX_1d1e566c4bd26399d7b0d7cc52\` (\`slug\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`block_entity\` (\`uuid\` uuid NOT NULL, \`pageUuid\` uuid NOT NULL, \`type\` enum ('hero', 'one-columns', 'two-columns', 'three-columns', 'gallery', 'cta', 'testimonials', 'separator', 'super-hero', 'faq', 'multi-cards') NOT NULL, \`order\` int NOT NULL, \`data\` json NOT NULL, \`visible\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, INDEX \`IDX_498bf21af145ef9a6d0d967273\` (\`pageUuid\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`contact_entity\` (\`uuid\` uuid NOT NULL, \`firstname\` varchar(255) NOT NULL, \`lastname\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`company\` varchar(255) NULL, \`subject\` varchar(255) NOT NULL, \`message\` varchar(2500) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`job_setting_entity\` (\`uuid\` uuid NOT NULL, \`name\` varchar(255) NOT NULL, \`expression\` varchar(255) NULL, \`isEnabled\` tinyint NOT NULL DEFAULT 1, \`parameters\` json NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, UNIQUE INDEX \`IDX_4786f503f4e52ea4c967223088\` (\`name\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`job_history_entity\` (\`uuid\` uuid NOT NULL, \`jobUuid\` uuid NOT NULL, \`status\` enum ('SUCCESS', 'FAIL', 'RUNNING') NOT NULL DEFAULT 'RUNNING', \`duration\` int NULL, \`input\` json NULL, \`logs\` json NULL, \`output\` json NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, INDEX \`IDX_5b1f026e8cf0733ee7f31d6b70\` (\`jobUuid\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`menu_entity\` (\`uuid\` uuid NOT NULL, \`key\` varchar(255) NOT NULL, \`label\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`menu_item_entity\` (\`uuid\` uuid NOT NULL, \`menuUuid\` uuid NOT NULL, \`parentUuid\` uuid NULL, \`label\` varchar(190) NOT NULL, \`position\` int NOT NULL DEFAULT '0', \`url\` varchar(255) NOT NULL, \`target\` varchar(20) NOT NULL DEFAULT '_self', \`isVisible\` tinyint NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`notification_entity\` (\`uuid\` uuid NOT NULL, \`userUuid\` uuid NOT NULL, \`type\` varchar(255) NOT NULL, \`payload\` json NOT NULL, \`actions\` json NULL, \`readAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_b1a6182b241d37a0c7d91967af\` (\`userUuid\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`quota_usage_entity\` (\`uuid\` uuid NOT NULL, \`organizationUuid\` uuid NOT NULL, \`quotaKey\` varchar(255) NOT NULL, \`value\` int NOT NULL DEFAULT '0', \`periodStart\` datetime NOT NULL, \`periodEnd\` datetime NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, INDEX \`IDX_6f4437ecdbbc9c767d00117928\` (\`organizationUuid\`), UNIQUE INDEX \`IDX_be6d652cc63bd0ad4838bb16f8\` (\`organizationUuid\`, \`quotaKey\`, \`periodStart\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`refresh_token_entity\` (\`uuid\` uuid NOT NULL, \`userUuid\` varchar(255) NOT NULL, \`ip\` varchar(255) NULL, \`userAgent\` varchar(255) NULL, \`token\` varchar(255) NOT NULL, \`expiresAt\` datetime NOT NULL, \`revokedAt\` datetime NULL, INDEX \`IDX_4f26f4a1fdcc7aa3eec3fc3246\` (\`userUuid\`), UNIQUE INDEX \`IDX_19145ef8b94a816631fd4206a8\` (\`token\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`setting_entity\` (\`key\` varchar(255) NOT NULL, \`value\` varchar(500) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`createdBy\` varchar(255) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`deletedAt\` datetime(6) NULL, \`deletedBy\` varchar(255) NULL, PRIMARY KEY (\`key\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`stripe_webhook_event_entity\` (\`uuid\` uuid NOT NULL, \`stripeEventId\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`receivedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_cee78ad733a35a289140bab06e\` (\`stripeEventId\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`token_entity\` (\`uuid\` uuid NOT NULL, \`token\` varchar(255) NOT NULL, \`type\` enum ('verify_account', 'reset_password', 'invite', 'social_login', 'delete_organization', 'delete_account') NOT NULL, \`expiresAt\` datetime NOT NULL, \`usedAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userUuid\` uuid NULL, UNIQUE INDEX \`IDX_2e3c95fdbb51712c33a126fb79\` (\`token\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `ALTER TABLE \`organization_member_entity\` ADD CONSTRAINT \`FK_bbc62108619523a5a80266a6b16\` FOREIGN KEY (\`organizationUuid\`) REFERENCES \`organization_entity\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`organization_member_entity\` ADD CONSTRAINT \`FK_f1e24bcd61f2ece1fb9352635f5\` FOREIGN KEY (\`memberUuid\`) REFERENCES \`user_entity\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`organization_invite_entity\` ADD CONSTRAINT \`FK_a5eb4bf8b21d55f72fcee8b107e\` FOREIGN KEY (\`organizationUuid\`) REFERENCES \`organization_entity\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`quota_plan_entity\` ADD CONSTRAINT \`FK_6fa2f54f9f52870ac261c5b0d3c\` FOREIGN KEY (\`quotaUuid\`) REFERENCES \`quota_entity\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`quota_plan_entity\` ADD CONSTRAINT \`FK_e357d7eb3dc4dfcca13074ef994\` FOREIGN KEY (\`planUuid\`) REFERENCES \`plan_entity\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`plan_price_entity\` ADD CONSTRAINT \`FK_ffcfc1477f91adcd57dd2094ed9\` FOREIGN KEY (\`planUuid\`) REFERENCES \`plan_entity\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`subscription_entity\` ADD CONSTRAINT \`FK_4495459efe2e0f84f53a98e5df8\` FOREIGN KEY (\`organizationUuid\`) REFERENCES \`organization_entity\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`subscription_entity\` ADD CONSTRAINT \`FK_9001b2b05c984dd592074d52396\` FOREIGN KEY (\`planPriceUuid\`) REFERENCES \`plan_price_entity\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`invoice_entity\` ADD CONSTRAINT \`FK_1b06844b82cc7865180e6133748\` FOREIGN KEY (\`organizationUuid\`) REFERENCES \`organization_entity\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`api_key_entity\` ADD CONSTRAINT \`FK_7c69d7bc6fe230c1782ca7a87e3\` FOREIGN KEY (\`organizationUuid\`) REFERENCES \`organization_entity\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`block_entity\` ADD CONSTRAINT \`FK_498bf21af145ef9a6d0d967273c\` FOREIGN KEY (\`pageUuid\`) REFERENCES \`page_entity\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`job_history_entity\` ADD CONSTRAINT \`FK_5b1f026e8cf0733ee7f31d6b701\` FOREIGN KEY (\`jobUuid\`) REFERENCES \`job_setting_entity\`(\`uuid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`menu_item_entity\` ADD CONSTRAINT \`FK_49cad083abe519f00872fe42417\` FOREIGN KEY (\`menuUuid\`) REFERENCES \`menu_entity\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`menu_item_entity\` ADD CONSTRAINT \`FK_3a2eff14714b97b30e4a96f6a59\` FOREIGN KEY (\`parentUuid\`) REFERENCES \`menu_item_entity\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`notification_entity\` ADD CONSTRAINT \`FK_b1a6182b241d37a0c7d91967af1\` FOREIGN KEY (\`userUuid\`) REFERENCES \`user_entity\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`quota_usage_entity\` ADD CONSTRAINT \`FK_6f4437ecdbbc9c767d00117928c\` FOREIGN KEY (\`organizationUuid\`) REFERENCES \`organization_entity\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`token_entity\` ADD CONSTRAINT \`FK_c960145ffc450cf04a4a119398d\` FOREIGN KEY (\`userUuid\`) REFERENCES \`user_entity\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`token_entity\` DROP FOREIGN KEY \`FK_c960145ffc450cf04a4a119398d\``);
        await queryRunner.query(
            `ALTER TABLE \`quota_usage_entity\` DROP FOREIGN KEY \`FK_6f4437ecdbbc9c767d00117928c\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`notification_entity\` DROP FOREIGN KEY \`FK_b1a6182b241d37a0c7d91967af1\``,
        );
        await queryRunner.query(`ALTER TABLE \`menu_item_entity\` DROP FOREIGN KEY \`FK_3a2eff14714b97b30e4a96f6a59\``);
        await queryRunner.query(`ALTER TABLE \`menu_item_entity\` DROP FOREIGN KEY \`FK_49cad083abe519f00872fe42417\``);
        await queryRunner.query(
            `ALTER TABLE \`job_history_entity\` DROP FOREIGN KEY \`FK_5b1f026e8cf0733ee7f31d6b701\``,
        );
        await queryRunner.query(`ALTER TABLE \`block_entity\` DROP FOREIGN KEY \`FK_498bf21af145ef9a6d0d967273c\``);
        await queryRunner.query(`ALTER TABLE \`api_key_entity\` DROP FOREIGN KEY \`FK_7c69d7bc6fe230c1782ca7a87e3\``);
        await queryRunner.query(`ALTER TABLE \`invoice_entity\` DROP FOREIGN KEY \`FK_1b06844b82cc7865180e6133748\``);
        await queryRunner.query(
            `ALTER TABLE \`subscription_entity\` DROP FOREIGN KEY \`FK_9001b2b05c984dd592074d52396\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`subscription_entity\` DROP FOREIGN KEY \`FK_4495459efe2e0f84f53a98e5df8\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`plan_price_entity\` DROP FOREIGN KEY \`FK_ffcfc1477f91adcd57dd2094ed9\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`quota_plan_entity\` DROP FOREIGN KEY \`FK_e357d7eb3dc4dfcca13074ef994\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`quota_plan_entity\` DROP FOREIGN KEY \`FK_6fa2f54f9f52870ac261c5b0d3c\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`organization_invite_entity\` DROP FOREIGN KEY \`FK_a5eb4bf8b21d55f72fcee8b107e\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`organization_member_entity\` DROP FOREIGN KEY \`FK_f1e24bcd61f2ece1fb9352635f5\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`organization_member_entity\` DROP FOREIGN KEY \`FK_bbc62108619523a5a80266a6b16\``,
        );
        await queryRunner.query(`DROP INDEX \`IDX_2e3c95fdbb51712c33a126fb79\` ON \`token_entity\``);
        await queryRunner.query(`DROP TABLE \`token_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_cee78ad733a35a289140bab06e\` ON \`stripe_webhook_event_entity\``);
        await queryRunner.query(`DROP TABLE \`stripe_webhook_event_entity\``);
        await queryRunner.query(`DROP TABLE \`setting_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_19145ef8b94a816631fd4206a8\` ON \`refresh_token_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_4f26f4a1fdcc7aa3eec3fc3246\` ON \`refresh_token_entity\``);
        await queryRunner.query(`DROP TABLE \`refresh_token_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_be6d652cc63bd0ad4838bb16f8\` ON \`quota_usage_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_6f4437ecdbbc9c767d00117928\` ON \`quota_usage_entity\``);
        await queryRunner.query(`DROP TABLE \`quota_usage_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_b1a6182b241d37a0c7d91967af\` ON \`notification_entity\``);
        await queryRunner.query(`DROP TABLE \`notification_entity\``);
        await queryRunner.query(`DROP TABLE \`menu_item_entity\``);
        await queryRunner.query(`DROP TABLE \`menu_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_5b1f026e8cf0733ee7f31d6b70\` ON \`job_history_entity\``);
        await queryRunner.query(`DROP TABLE \`job_history_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_4786f503f4e52ea4c967223088\` ON \`job_setting_entity\``);
        await queryRunner.query(`DROP TABLE \`job_setting_entity\``);
        await queryRunner.query(`DROP TABLE \`contact_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_498bf21af145ef9a6d0d967273\` ON \`block_entity\``);
        await queryRunner.query(`DROP TABLE \`block_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_1d1e566c4bd26399d7b0d7cc52\` ON \`page_entity\``);
        await queryRunner.query(`DROP TABLE \`page_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_7c69d7bc6fe230c1782ca7a87e\` ON \`api_key_entity\``);
        await queryRunner.query(`DROP TABLE \`api_key_entity\``);
        await queryRunner.query(`DROP TABLE \`organization_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_9333bb222f58b26401d2a60ffd\` ON \`invoice_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_1b06844b82cc7865180e613374\` ON \`invoice_entity\``);
        await queryRunner.query(`DROP TABLE \`invoice_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_b3748683e29356e7b58384b3bc\` ON \`subscription_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_9001b2b05c984dd592074d5239\` ON \`subscription_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_4495459efe2e0f84f53a98e5df\` ON \`subscription_entity\``);
        await queryRunner.query(`DROP TABLE \`subscription_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_5193ad051bd235eb75b19858cf\` ON \`plan_price_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_ffcfc1477f91adcd57dd2094ed\` ON \`plan_price_entity\``);
        await queryRunner.query(`DROP TABLE \`plan_price_entity\``);
        await queryRunner.query(`DROP TABLE \`plan_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_a245afbad1787b4a321f85a46b\` ON \`quota_plan_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_e357d7eb3dc4dfcca13074ef99\` ON \`quota_plan_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_6fa2f54f9f52870ac261c5b0d3\` ON \`quota_plan_entity\``);
        await queryRunner.query(`DROP TABLE \`quota_plan_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_7fe66fbb79e93e6598c0b165dc\` ON \`quota_entity\``);
        await queryRunner.query(`DROP TABLE \`quota_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_cb96b80d6b58598b0bc2999993\` ON \`organization_invite_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_adfc77f9c61c4c2a11ce7dc6ea\` ON \`organization_invite_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_a5eb4bf8b21d55f72fcee8b107\` ON \`organization_invite_entity\``);
        await queryRunner.query(`DROP TABLE \`organization_invite_entity\``);
        await queryRunner.query(
            `DELETE FROM \`orysaas_test\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ? AND \`table\` = ?`,
            ["GENERATED_COLUMN", "uniqueKey", "orysaas_test", "organization_member_entity"],
        );
        await queryRunner.query(`DROP INDEX \`IDX_491006cdcc757963e0c8ff7c76\` ON \`organization_member_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_f1e24bcd61f2ece1fb9352635f\` ON \`organization_member_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_bbc62108619523a5a80266a6b1\` ON \`organization_member_entity\``);
        await queryRunner.query(`DROP TABLE \`organization_member_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_415c35b9b3b6fe45a3b065030f\` ON \`user_entity\``);
        await queryRunner.query(`DROP TABLE \`user_entity\``);
    }
}
