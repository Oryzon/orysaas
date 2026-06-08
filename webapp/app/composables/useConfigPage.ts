export const useConfigPage = (title: string) => {
    useHead({
        title: `${title}`,
    });

    useState('pageTitle', () => title).value = title;
}