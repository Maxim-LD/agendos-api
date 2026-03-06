import { Knex } from "knex";
import { CreateTaskDTO, ITask } from "../types/task";
import { BaseRepository } from "./BaseRepository";
import { v4 as uuidv4 } from "uuid";

export class TaskRepository extends BaseRepository<ITask> {
    constructor() {
        super('tasks', 'sn')
    }

    async addTask(input: CreateTaskDTO, trx?: Knex.Transaction): Promise<ITask | null> {
        const taskData: Partial<ITask> = {
            id: uuidv4(),
            ...input,
            status: 'not_started',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        }

        return this.create(taskData, trx)
    }

    async getDailyEffortSum(userSn: bigint, date: Date | string, trx: Knex.Transaction): Promise<number> {
        const query = trx ? trx(this.tableName) : this.db(this.tableName);

        const result = await query
            .sum('effort_estimate_minutes as total')
            .where({ 
                user_sn: userSn, 
                due_date: date, 
                is_active: true     
            })
            .first();

    return result?.total ? parseInt(result.total as string) : 0;
}

    async updateTask() {

    }

    async removeTask() {

    }
}