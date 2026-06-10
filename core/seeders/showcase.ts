import { MenuEntity } from "../databases/entities/menu.entity";
import { MenuRepository } from "../databases/repositories/menu.repository";
import { MenuItemEntity } from "../databases/entities/menu-item.entity";
import { MenuItemRepository } from "../databases/repositories/menu-item.repository";
import { IsNull, Not } from "typeorm";
import { PageEntity } from "../databases/entities/page.entity";
import { PageRepository } from "../databases/repositories/page.repository";
import { BlockEntity } from "../databases/entities/block.entity";
import { BlockRepository } from "../databases/repositories/block.repository";

export async function showcaseSeeders() {
    console.log('Seeding the showcase...');

    await clearMenus();

    // Menu parts - header
    console.log('Recreate the header menu...');

    let menu = new MenuEntity();

    menu.label = "Haut de page";
    menu.key = "header";
    menu.isActive = true;

    await MenuRepository.insert(menu);

    await createMenuItem(menu, 'Accueil', '/accueil', 0);
    await createMenuItem(menu, 'Fonctionnalités', '/fonctionnalites', 1);
    await createMenuItem(menu, 'FAQ', '/foire-aux-questions', 2);
    await createMenuItem(menu, 'Contact', '/contact', 3);

    console.log('Menu header recreated ✓');

    // Menu parts - header
    console.log('Recreate the footer menu...');

    let footerMenu = new MenuEntity();

    footerMenu.label = "Pied de page";
    footerMenu.key = "footer";
    footerMenu.isActive = true;

    await MenuRepository.insert(footerMenu);

    let ressources = await createMenuItem(footerMenu, 'Ressources', '#', 0);
    await createMenuItem(footerMenu, 'Documentation', 'docs', 0, ressources);
    await createMenuItem(footerMenu, 'Changelog', 'changelog', 1, ressources);
    await createMenuItem(footerMenu, 'Roadmap', 'roadmap', 2, ressources);

    let company = await createMenuItem(footerMenu, 'Société', '#', 1);
    await createMenuItem(footerMenu, 'A propos', 'a-propos', 0, company);
    await createMenuItem(footerMenu, 'Contact', 'contact', 1, company);
    await createMenuItem(footerMenu, 'Partenaires', 'nos-partenaires', 2, company);

    let legal = await createMenuItem(footerMenu, 'Légal', '#', 2);
    await createMenuItem(footerMenu, 'CGU', 'conditions-generales-d-utilisations', 0, legal);
    await createMenuItem(footerMenu, 'Confidentialité', 'confidentialite', 1, legal);
    await createMenuItem(footerMenu, 'Mentions légales', 'mentions-legales', 2, legal);
    await createMenuItem(footerMenu, 'RGPD', 'rgpd', 3, legal);

    console.log('Menu footer recreated ✓');

    // Pages parts

    await clearPages();
    await createHome();
    await createFunctionnality();
    await createFaq();

    // Know default page
    await createDefaultPage('Changelog', "Bienvenue sur une page par défaut, n'oubliez pas de mettre a jour le contenu.", "changelog");
    await createDefaultPage('Roadmap', "Bienvenue sur une page par défaut, n'oubliez pas de mettre a jour le contenu.", "roadmap");
    await createDefaultPage('A propos', "Bienvenue sur une page par défaut, n'oubliez pas de mettre a jour le contenu.", "a-propos");
    await createDefaultPage('Partenaires', "Bienvenue sur une page par défaut, n'oubliez pas de mettre a jour le contenu.", "nos-partenaires");
    await createDefaultPage('CGU', "Bienvenue sur une page par défaut, n'oubliez pas de mettre a jour le contenu.", "conditions-generales-d-utilisations");
    await createDefaultPage('Confidentialité', "Bienvenue sur une page par défaut, n'oubliez pas de mettre a jour le contenu.", "confidentialite");
    await createDefaultPage('Mentions légales', "Bienvenue sur une page par défaut, n'oubliez pas de mettre a jour le contenu.", "mentions-legales");
    await createDefaultPage('RGPD', "Bienvenue sur une page par défaut, n'oubliez pas de mettre a jour le contenu.", "rgpd");

    console.log('Showcase seeded ... !');
}

async function clearMenus() {
    console.log('Delete menus...');

    await MenuItemRepository.delete({ uuid: Not(IsNull()) });
    await MenuRepository.delete({ uuid: Not(IsNull()) });

    console.log('Menus deleted... ✓');
}

async function clearPages() {
    console.log('Delete pages...');

    await PageRepository.delete({ uuid: Not(IsNull()) });

    console.log('Pages deleted... ✓');
}

async function createMenuItem(menu: MenuEntity, label: string, url: string, position: number, parent: MenuItemEntity | null = null, target: '_self' | '_blank' = '_self') {
    let entity = new MenuItemEntity();

    entity.menu = menu;
    entity.label = label;
    entity.target = target;
    entity.url = url;
    entity.position = position;
    entity.isVisible = true;

    if (parent) {
        entity.parent = parent;
    }

    await MenuItemRepository.insert(entity);

    return entity;
}

async function createHome() {
    let page = new PageEntity();

    page.title = 'Accueil';
    page.metaTitle = 'Accueil';
    page.metaDescription = 'Accueil';
    page.slug = 'accueil';
    page.isPublished = true;

    await PageRepository.insert(page);

    await createSuperHero(
        page,
        0,
        {
            "versionNo": "1.0",
            "title": "Le début d'une grande aventure",
            "url": "#"
        },
        "Votre base de Saas, prête à décoller.",
        "Auth, paiements, équipes, admin, emails. \nTout est déjà branché. \nVous n'écrivez plus que la partie qui rend votre produit unique.",
        {
            "text":"Démarrer gratuitement 🚀",
            "url": "register",
            "variant": "flat"
        },
        {
            "text": "Voir la démo",
            "url": "demo",
            "variant": "outlined"
        },
        [{"text": "Sans CB"}, {"text": "14 jours d'essai"}, {"text": "Annuler quand vous voulez"}],
        "https://api.oryscorp.fr/v1/image/76cd5758-3121-4812-8917-2790c391b46c.png"
    )
}

async function createFunctionnality() {
    let page = new PageEntity();

    page.title = 'Fonctionnalités';
    page.metaTitle = 'Fonctionnalités';
    page.metaDescription = 'Fonctionnalités';
    page.slug = 'fonctionnalites';
    page.isPublished = true;

    await PageRepository.insert(page);

    await createHeroBloc(page, 0, "Tout ce qu'il faut, rien de plus.", "Les briques qui prennent 3 mois à monter sont là dès le clone.", { text: "", url: "", variant: "flat"});
    await createMultiCards(page, 1, [
        {
            "title": "Authentification complète",
            "icon": "mdi-shield-crown",
            "text": "<p>Email + magic link, Google, GitHub, SSO, 2FA, gestion des sessions, mots de passe oubliés. Tout est déjà câblé.</p>",
            "color": "navbar",
            "width": 8
        }, {
            "title": "Paiements Stripe",
            "icon": "mdi-cash-multiple",
            "text": "<p>Abonnements, factures, taxes, portail client. Webhooks compris.</p>",
            "color": "primary",
            "width": 4
        }, {
            "title": "Équipes & rôles",
            "icon": "mdi-account-multiple-outline",
            "text": "<p><span style=\"background-color: rgb(250, 250, 250); color: rgb(113, 113, 122);\">Multi-tenant, invitations, rôles granulaires (owner, admin, member).</span></p>",
            "color": "",
            "width": 6
        }, {
            "title": "Emails transactionnels",
            "icon": "mdi-email",
            "text": "<p>Configurer votre SMTP</p>",
            "color": "",
            "width": 6
        }
    ])
}

async function createFaq() {
    let page = new PageEntity();

    page.title = 'Foire aux questions';
    page.metaTitle = 'Foire aux questions';
    page.metaDescription = 'Foire aux questions';
    page.slug = 'foire-aux-questions';
    page.isPublished = true;

    await PageRepository.insert(page);

    await createHeroBloc(page, 0, "Les questions qui reviennent.", "Vous avez 30 secondes ? On répond aux dix plus fréquentes.", { text: "", url: "", variant: "flat"});
    await createFaqBloc(page, 1, [
        {
            question: "Qu'est-ce qu'OrySaas exactement ?",
            answer: `<p><strong>OrySaas </strong><span>est un boilerplate moderne : un kit de démarrage qui contient toutes les briques techniques qu'on retrouve dans n'importe quel Saas :</span></p><ol><li data-list=\\"bullet\\"><span class=\\"ql-ui\\" contenteditable=\\"false\\"></span><span>authentification, </span></li><li data-list=\\"bullet\\"><span class=\\"ql-ui\\" contenteditable=\\"false\\"></span><span>paiements, </span></li><li data-list=\\"bullet\\"><span class=\\"ql-ui\\" contenteditable=\\"false\\"></span><span>équipes, </span></li><li data-list=\\"bullet\\"><span class=\\"ql-ui\\" contenteditable=\\"false\\"></span><span>back-office, </span></li><li data-list=\\"bullet\\"><span class=\\"ql-ui\\" contenteditable=\\"false\\"></span><span>emails. </span></li></ol><p><br></p><p><span>Vous </span><strong>clonez</strong><span>, vous </span><strong>configurez</strong><span>, et vous </span><strong>écrivez uniquement le code</strong><span> qui rend votre produit </span><strong><em>unique</em></strong><span>.</span></p>`
        }
    ]);
}

async function createHeroBloc(page: PageEntity, order: number, title: string, subtitle: string, cta: { text: string, url: string, variant: string }) {
    let bloc = new BlockEntity();

    bloc.type = "hero";
    bloc.data = {
        title: title,
        subtitle: subtitle,
        cta: cta
    };
    bloc.page = page;
    bloc.order = order;

    await BlockRepository.insert(bloc);
}

async function createFaqBloc(page: PageEntity, order: number, items: Array<{ question: string, answer: string }>) {
    let bloc = new BlockEntity();

    bloc.type = "faq";
    bloc.data = {
        title: "Général",
        items: items
    };

    bloc.page = page;
    bloc.order = order;

    await BlockRepository.insert(bloc);
}

async function createMultiCards(page: PageEntity, order: number, cards: Array<{
    title: string,
    icon: string,
    text: string,
    color: string,
    width: number,
}>) {
    let bloc = new BlockEntity();

    bloc.type = 'multi-cards';
    bloc.data = {
        cards: cards
    };
    bloc.page = page;
    bloc.order = order;

    await BlockRepository.insert(bloc);
}

async function createSuperHero(
    page: PageEntity,
    order: number,
    lastChanges: { versionNo: string, title: string, url: string },
    title: string,
    subtitle: string,
    primaryButton: {
        text: string,
        url: string,
        variant: string
    },
    secondaryButton: {
        text: string,
        url: string,
        variant: string,
    },
    conditions: Array<{ text: string }>,
    image: string
) {
    let bloc = new BlockEntity();

    bloc.type = 'super-hero';
    bloc.data = {
        lastChanges: lastChanges,
        title: title,
        subtitle: subtitle,
        primaryButton: primaryButton,
        secondaryButton: secondaryButton,
        conditions: conditions,
        image: image
    };
    bloc.page = page;
    bloc.order = order;

    await BlockRepository.insert(bloc);
}

async function createDefaultPage(title: string, metaDescription: string, slug: string) {
    let page = new PageEntity();

    page.title = title;
    page.metaTitle = title;
    page.metaDescription = metaDescription;
    page.slug = slug;
    page.isPublished = true;

    await PageRepository.insert(page);

    await createHeroBloc(page, 0, title, metaDescription, { text: "", url: "", variant: "flat"});
}