import { dataSource } from "../../config/datasource";
import { NotificationEntity } from "../entities/notification.entity";

export const NotificationRepository = dataSource.getRepository(NotificationEntity).extend({

});