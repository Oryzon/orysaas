import type { Page } from "~/models/Page";

export interface Block {
    uuid: string;
    pageUuid: string;
    page: Page;
    type: string;
    order: number;
    data: Record<string, any>;
    visible: boolean;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    deletedAt: Date;
    deletedBy: string;
}

export interface BlockType {
    type: string;
    label: string;
    icon: string;
    description: string;
    defaultData: Record<string, any>;
}

export interface HeroData {
    title: string;
    subtitle: string;
    cta: {
        text: string;
        url: string;
        variant: string;
    };
    backgroundImage?: string;
    backgroundPosition?: string;
    backgroundSize?: string;
}

export interface SuperHeroData {
    lastChanges: {
        versionNo: string,
        title: string,
        url: string
    },
    title: string,
    subtitle: string,
    image?: string;
    primaryButton: {
        text: string,
        url: string,
        variant: string
    },
    secondaryButton: {
        text: string,
        url: string,
        variant: string
    },
    conditions: Array<{ text: string }>,
}

export interface OneColumnsData {
    title: string;
    content: string;
    width: number;
}

export interface TwoColumnsData {
    leftColumn: {
        title: string,
        content: string,
        width: number,
    },
    rightColumn: {
        title: string,
        content: string,
        width: number,
    }
}

export interface ThreeColumnsData {
    leftColumn: {
        title: string,
        content: string,
        width: number,
    },
    middleColumn: {
        title: string,
        content: string,
        width: number,
    },
    rightColumn: {
        title: string,
        content: string,
        width: number,
    }
}

export interface GalleryData {
    title?: string;
    isOpenable: boolean;
    showRightColumn?: boolean;
    layout?: 'grid' | 'masonry' | 'slider';
    images?: GalleryImage[];
}

export interface GalleryImage {
    uuid: string;
    url: string;
    alt?: string;
    caption?: string;
    originalName?: string;
    link?: string;
    linkTarget?: boolean;
}

export interface SeparatorData {
    style?: 'line' | 'gradient' | 'dots' | 'wave' | 'ornament';
    thickness?: 'thin' | 'medium' | 'thick';
    color?: string;
    spacing?: 'small' | 'medium' | 'large';
    width?: 'full' | 'narrow' | 'ultranarrow';
}

export interface MultiCardItem {
    title: string;
    icon: string;
    text: string;
    color: string;
    width: number;
}

export interface MultiCardsData {
    cards: MultiCardItem[];
}

export interface FaqData {
    title?: string;
    items: Array<{
        question: string;
        answer: string;
    }>;
}

export interface CtaBlockData {
    layout: 'centered' | 'split' | 'banner' | 'card';
    preTitle?: string;
    title: string;
    subtitle?: string;
    description?: string;
    primaryButton: {
        text: string;
        url: string;
    };
    secondaryButton: {
        text: string;
        url: string;
    };
    background: 'primary' | 'secondary' | 'gradient';
}