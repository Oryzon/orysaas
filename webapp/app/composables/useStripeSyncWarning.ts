export const useStripeSyncWarning = () => {
    const { $toast } = useNuxtApp();

    return (stripeSyncError?: string | null) => {
        if (stripeSyncError) {
            $toast(stripeSyncError, { type: "warning" });
        }
    };
};