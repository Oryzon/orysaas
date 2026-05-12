import { AsyncLocalStorage } from "node:async_hooks";

interface ContextData {
    uuid?: string,
}

export const requestContext = new AsyncLocalStorage<ContextData>();

export function setRequestContext(data: ContextData) {
    requestContext.enterWith(data);
}

export function getUserUuid(): string | undefined {
    return requestContext.getStore()?.uuid ?? process.env.UUID_SYSTEM;
}