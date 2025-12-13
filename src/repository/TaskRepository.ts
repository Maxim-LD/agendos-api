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
            created_at: new Date(),
            updated_at: new Date(),
        }

        return this.create(taskData, trx)
    }

    async updateTask() {

    }

    async removeTask() {

    }
}