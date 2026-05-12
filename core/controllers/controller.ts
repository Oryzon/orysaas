import { Glob } from "glob";

export const controllers = async () => {
    let controllersImport = [];

    let files = new Glob("controllers/**/*", {});

    for await (const file of files) {
        if (file.toLowerCase().endsWith('.ts') && file !== 'controllers/controller.ts') {
            const [exportName] = file.split('.ts');
            let tmp = await import(`../${exportName}`);

            if (tmp.default) {
                controllersImport.push(tmp);
            }
        }
    }

    return controllersImport;
}