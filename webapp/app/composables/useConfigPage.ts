export const useConfigPage = (title: string) => {
    let projectName = useRuntimeConfig().public.title;

    useHead({
        title: `${title} - ${projectName}`,
    });

    useState('pageTitle', () => title).value = title;
}