import { dataSource } from "../../config/datasource";
import { JobSettingEntity } from "../entities/job-setting.entity";

export const JobSettingRepository = dataSource.getRepository(JobSettingEntity).extend({

});