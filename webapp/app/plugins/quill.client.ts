import { QuillEditor } from '@vueup/vue-quill';

declare module 'vue' {
    interface GlobalComponents {
        QuillEditor: typeof QuillEditor;
    }
}

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('QuillEditor', QuillEditor);
});