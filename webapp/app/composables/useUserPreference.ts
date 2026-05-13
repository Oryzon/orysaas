import { useStorage } from "@vueuse/core";

export function useUserPreferences() {
    const menuIsOpen = useStorage('usr_menuIsOpen', false);
    const lastPage = useStorage('usr_lastPage', null as string | null);

    const toggleMenu = () => (menuIsOpen.value = !menuIsOpen.value);

    return {
        menuIsOpen,
        lastPage,
        toggleMenu
    }
}