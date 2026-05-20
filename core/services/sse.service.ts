import { Response } from "express";

class SseService {
    private clients = new Map<string, Set<Response>>();

    add(userUuid: string, res: Response): void {
        if (!this.clients.has(userUuid)) {
            this.clients.set(userUuid, new Set());
        }

        this.clients.get(userUuid)!.add(res);
    }

    remove(userUuid: string, res: Response): void {
        const connections = this.clients.get(userUuid);

        if (!connections) {
            return;
        }

        connections.delete(res);

        if (connections.size === 0) {
            this.clients.delete(userUuid);
        }
    }

    push(userUuid: string, event: string, data: unknown): void {
        const connections = this.clients.get(userUuid);

        if (!connections) {
            return;
        }

        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

        for (const res of connections) {
            res.write(payload);
        }
    }

    isConnected(userUuid: string): boolean {
        return (this.clients.get(userUuid)?.size ?? 0) > 0;
    }
}

export const sseService = new SseService();