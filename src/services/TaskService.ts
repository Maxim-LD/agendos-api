import db from "../config/db";
import { TaskRepository } from "../repository/TaskRepository";
import { CreateTaskDTO, ITask } from "../types/task";
import { BadRequestError, ConflictError } from "../utils/errors";

export class TaskService {
    private taskRepository: TaskRepository

    constructor() {
        this.taskRepository = new TaskRepository()
    }

    async handleCreateTask(taskInput: CreateTaskDTO): Promise<ITask> {
        return await db.transaction(async (trx) => {
            const taskPayload: CreateTaskDTO = {
                user_sn: taskInput.user_sn,
                title: taskInput.title,
                description: taskInput.description,
                project_id: taskInput.project_id,
                scheduled_date: taskInput.scheduled_date,
                effort_estimate_minutes: taskInput.effort_estimate_minutes,
                energy_required: taskInput.energy_required,
                reminders: taskInput.reminders,
                progress_interval: taskInput.progress_interval,
                urgency: taskInput.urgency
            }

            // prevent a user from scheduling tasks that exceed their maximum_daily_capacity.
            const exists = await this.taskRepository.exists(taskInput.title, trx)
            if (exists) throw new ConflictError('Task already exist for user!')

            const newTask = await this.taskRepository.create(taskPayload, trx)
            if (!newTask) throw new BadRequestError('Task creation failed!')

            return newTask
        })

    }
}