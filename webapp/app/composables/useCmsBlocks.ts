// composables/use-cms-blocks.ts

import type { BlockType } from "~/models/Block";

export const useCmsBlocks = () => {
    const blockTypes: BlockType[] = [
        {
            type: 'one-columns',
            label: 'Une colonne',
            icon: 'mdi-view-column',
            description: 'Contenu sur une seule colonne',
            defaultData: {
                title: 'Colonne centrale',
                content: 'Contenu de la colonne.',
                width: 6
            }
        },
        {
            type: 'two-columns',
            label: 'Deux colonnes',
            icon: 'mdi-view-column',
            description: 'Contenu sur deux colonnes',
            defaultData: {
                leftColumn: {
                    title: 'Colonne gauche',
                    content: 'Contenu de la colonne.',
                    width: 6
                },
                rightColumn: {
                    title: 'Colonne droite',
                    content: 'Contenu de la colonne.',
                    width: 6
                }
            }
        },
        {
            type: 'three-columns',
            label: 'Trois colonnes',
            icon: 'mdi-view-column',
            description: 'Contenu sur trois colonnes',
            defaultData: {
                leftColumn: {
                    title: 'Colonne gauche',
                    content: 'Contenu de la colonne.',
                    width: 4
                },
                middleColumn: {
                    title: 'Colonne du milieu',
                    content: 'Contenu de la colonne.',
                    width: 4
                },
                rightColumn: {
                    title: 'Colonne droite',
                    content: 'Contenu de la colonne.',
                    width: 4
                }
            }
        },
        {
            type: 'hero',
            label: 'Hero',
            icon: 'mdi-image-size-select-actual',
            description: 'Section hero avec titre et CTA',
            defaultData: {
                title: 'Titre principal',
                subtitle: 'Sous-titre descriptif',
                cta: {
                    text: 'En savoir plus',
                    url: '#',
                    variant: 'flat'
                }
            }
        },
        {
            type: 'super-hero',
            label: 'Super Hero',
            icon: 'mdi-image-size-select-actual',
            description: 'Section super-hero',
            defaultData: {
                lastChanges: {
                    versionNo: '1.0',
                    title: "Le début d'une grande aventure",
                    url: '#'
                },
                title: 'Titre principal',
                subtitle: 'Sous-titre descriptif',
                primaryButton: {
                        text: 'Démarrer gratuitement',
                        url: 'register',
                        variant: 'flat'
                },
                secondaryButton: {
                    text: 'Voir la démo',
                    url: 'demo',
                    variant: 'flat'
                },
                conditions: [
                    {
                        text: 'Sans CB'
                    }, {
                        text: "14 jours d'essai"
                    }, {
                        text: "Annuler quand vous voulez"
                    }
                ],
            }
        },
        {
            type: 'gallery',
            label: 'Galerie',
            icon: 'mdi-view-gallery',
            description: 'Galerie d\'images',
            defaultData: {
                images: []
            }
        },
        {
            type: 'separator',
            label: 'Séparateur',
            icon: 'mdi-view-gallery',
            description: 'Galerie d\'images',
            defaultData: {
                style: 'line',
                thickness: 'thin',
                color: '',
                spacing: 'medium',
                width: 'narrow',
            }
        },
        {
            type: 'multi-cards',
            label: 'Multi-carte',
            icon: 'mdi-card-multiple',
            description: 'Grille de cartes personnalisables',
            defaultData: {
                cards: [
                    { title: 'Carte 1', icon: 'mdi-star', text: '', color: 'primary', width: 4 },
                    { title: 'Carte 2', icon: 'mdi-heart', text: '', color: 'success', width: 4 },
                    { title: 'Carte 3', icon: 'mdi-lightning-bolt', text: '', color: 'warning', width: 4 },
                ]
            }
        },
        {
            type: 'faq',
            label: 'FAQ',
            icon: 'mdi-frequently-asked-questions',
            description: 'Section questions / réponses',
            defaultData: {
                title: 'Questions fréquentes',
                items: [
                    { question: 'Comment démarrer ?', answer: 'Il suffit de créer un compte et de suivre les étapes de configuration.' },
                    { question: 'Y a-t-il un essai gratuit ?', answer: 'Oui, vous bénéficiez de 14 jours d\'essai gratuit sans carte bancaire.' },
                ]
            }
        },
        {
            type: 'cta',
            label: 'Call to Action',
            icon: 'mdi-cursor-pointer',
            description: 'Section d\'appel à l\'action',
            defaultData: {
                layout: 'centered',
                preTitle: '',
                title: 'Prêt à passer à l\'action ?',
                subtitle: 'Commencez dès aujourd\'hui',
                description: '',
                primaryButton: {
                    text: 'Contactez-nous',
                    url: '/contact'
                },
                secondaryButton: {
                    text: 'En savoir plus',
                    url: '/about'
                },
                background: 'primary'
            }
        }
    ];

    const getBlockType = (type: string): BlockType | undefined => {
        return blockTypes.find(bt => bt.type === type);
    };

    const createNewBlock = (type: string, order: number) => {
        const blockType = getBlockType(type);
        if (!blockType) {
            return null;
        }

        return {
            uuid: null, // Temporaire, sera remplacé par l'API
            type,
            order,
            data: JSON.parse(JSON.stringify(blockType.defaultData)), // Deep clone
            visible: true
        };
    };

    return {
        blockTypes,
        getBlockType,
        createNewBlock
    };
};
