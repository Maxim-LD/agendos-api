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
                user_id: taskInput.user_id,
                project_id: taskInput.project_id,
                title: taskInput.title,
                description: taskInput.description,
                reminders: taskInput.reminders || true,
                progress_interval: taskInput.progress_interval,
                urgency: taskInput.urgency,
                effort_estimate_minutes: taskInput.effort_estimate_minutes,
                energy_required: taskInput.energy_required,
                due_date: taskInput.due_date,
            }

            const exists = await this.taskRepository.findOne('title', taskInput.title, trx)
            if (exists) throw new ConflictError('Task already exist for user!')
                
            // Prevent a user from scheduling tasks that exceed their maximum_daily_capacity.
            
            const newTask = await this.taskRepository.addTask(taskPayload, trx)
            if (!newTask) throw new BadRequestError('Task creation failed!')

            return newTask
        })

    }
}