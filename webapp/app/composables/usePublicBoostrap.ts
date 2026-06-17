import type { MenuItemNode } from "~/models/MenuItem";

interface PublicBootstrap {
    menus: {
        header: MenuItemNode[];
        footer: MenuItemNode[];
    };
}

export function usePublicBootstrap() {
    const api = useApi();

    const bootstrap = useState<PublicBootstrap | null>(
        'public-bootstrap',
        () => null,
    );

    const isLoaded = computed(() => !!bootstrap.value);

    const load = async () => {
        if (bootstrap.value) {
            return;
        }

        bootstrap.value = await api.get<PublicBootstrap>('/public/');
    };

    return {
        bootstrap,
        isLoaded,
        load,
    };
}
