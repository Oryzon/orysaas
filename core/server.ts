import { createApp } from "./app";

createApp()
    .then((app) => {
        app.listen(app.get("port"), () => {
            console.log(`Server is listening ${app.get("port")} port.`);
        });
    })
    .catch((err) => {
        console.error("Failed to start server:", err);
        process.exit(1);
    });
