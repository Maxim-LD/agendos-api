import { AuthRequest } from "../middlewares/auth-middleware";
import { asyncHandler } from "../middlewares/error-handler";
import { TaskService } from "../services/TaskService";
import { CreateTaskDTO } from "../types/task";
import { BadRequestError } from "../utils/errors";

export class TaskController {
    private taskService: TaskService

    constructor() {
        this.taskService = new TaskService()
    }

    createTask = asyncHandler(async (req: AuthRequest, res) => {
        const { user_sn } = req.user as { user_sn: bigint }
        const { project_id: projectIdParam } = req.params
        const {
            title, description, effort_estimate_minutes,
            energy_required, reminders, scheduled_date,
            scheduled_time, progress_interval, urgency
        } = req.body
    
        const taskPayload: CreateTaskDTO = {
            user_sn,
            project_id: projectIdParam,
            title,
            description,
            effort_estimate_minutes,
            energy_required,
            reminders,
            scheduled_date,
            scheduled_time,
            progress_interval,
            urgency
        }

        const task = await this.taskService.handleCreateTask(taskPayload)

        return res.status(201).json({
            success: true,
            message: projectIdParam ? 'Task added to project successfully' : 'Task added successfully',
            data: task
        })
    })
}