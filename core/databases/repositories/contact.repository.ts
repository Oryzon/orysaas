import { dataSource } from "../../config/datasource";
import { ContactEntity } from "../entities/contact.entity";

export const ContactRepository = dataSource.getRepository(ContactEntity).extend({

});