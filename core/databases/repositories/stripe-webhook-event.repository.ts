import { dataSource } from "../../config/datasource";
import { StripeWebhookEventEntity } from "../entities/stripe-webhook-event.entity";

export const StripeWebhookEventRepository = dataSource.getRepository(StripeWebhookEventEntity).extend({
    async markProcessed(eventId: string, type: string): Promise<boolean> {
        try {
            const entity = new StripeWebhookEventEntity();

            entity.stripeEventId = eventId;
            entity.type = type;

            await this.insert(entity);

            return true;
        } catch (error: any) {
            if (error?.driverError?.code === "ER_DUP_ENTRY") {
                return false;
            }

            throw error;
        }
    },
});
