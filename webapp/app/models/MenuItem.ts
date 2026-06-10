export interface MenuItem {
    uuid: string;
    menuUuid: string;
    parentUuid: string;
    label: string;
    position: number;
    url: string;
    target: string;
    isVisible: boolean,
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    deletedAt: Date;
    deletedBy: string;
}

export interface MenuItemNode extends MenuItem {
    children: MenuItemNode[];
    isFirst?: boolean;
    isLast?: boolean;
}

export interface MenuItemSelectOption {
    value: string;
    title: string;
    depth: number;
}

export const targets = [
    { title: 'Nouvel onglet', value: '_blank' },
    { title: 'Même onglet', value: '_self' },
]

export function buildMenuTree(items: MenuItem[]): MenuItemNode[] {
    const map = new Map<string, MenuItemNode>();

    // 1. Création des nodes
    for (const item of items) {
        map.set(item.uuid, {
            ...item,
            children: [],
            isFirst: false,
            isLast: false,
        });
    }

    const roots: MenuItemNode[] = [];

    // 2. Construction de l'arbre
    for (const item of items) {
        const node = map.get(item.uuid)!;

        if (item.parentUuid) {
            const parent = map.get(item.parentUuid);
            if (parent) {
                parent.children.push(node);
            } else {
                roots.push(node);
            }
        } else {
            roots.push(node);
        }
    }

    // 3. Tri récursif
    const sortRecursively = (nodes: MenuItemNode[]) => {
        nodes.sort((a, b) => a.position - b.position);
        for (const n of nodes) {
            if (n.children.length > 0) {
                sortRecursively(n.children);
            }
        }
    };

    sortRecursively(roots);

    // 4. Ajout de isFirst / isLast
    const markFirstLast = (nodes: MenuItemNode[]) => {
        nodes.forEach((node, index) => {
            node.isFirst = index === 0;
            node.isLast = index === nodes.length - 1;

            if (node.children.length > 0) {
                markFirstLast(node.children);
            }
        });
    };

    markFirstLast(roots);

    return roots;
}

export function flattenMenuTreeForSelect(
    nodes: MenuItemNode[],
    depth = 0,
): MenuItemSelectOption[] {
    const result: MenuItemSelectOption[] = [];

    for (const node of nodes) {
        const prefix =
            depth === 0
                ? ''
                : `${'-'.repeat(depth)}> `;

        result.push({
            value: node.uuid,
            title: `${prefix}${node.label}`,
            depth,
        });

        if (node.children && node.children.length > 0) {
            result.push(...flattenMenuTreeForSelect(node.children, depth + 1));
        }
    }

    return result;
}