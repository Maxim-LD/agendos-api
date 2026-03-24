import { badRequestError } from "../errors/factories";
import { AuthRequest } from "../middlewares/auth-middleware";
import { asyncHandler } from "../middlewares/error-handler";
import { TaskService } from "../services/TaskService";
import { CreateTaskDTO } from "../types/task";
import { IUser } from "../types/user";

export class TaskController {
    private taskService: TaskService

    constructor() {
        this.taskService = new TaskService()
    }

    createOnboardTask = asyncHandler(async (req: AuthRequest, res) => {

    })

    createTask = asyncHandler(async (req: AuthRequest, res) => {        
        const user = req.user as IUser
        const { project_id: projectIdParam } = req.params
        const {
            title, description, effort_estimate_minutes,
            energy_required, reminders, due_date,
            progress_interval, urgency
        } = req.body

        if (!projectIdParam || Array.isArray(projectIdParam)) {
            throw badRequestError('Invalid task ID');
        }
    
        const taskPayload: CreateTaskDTO = {
            user_id: user.id,
            user_sn: user.sn,
            project_id: projectIdParam,
            title,
            description,
            effort_estimate_minutes,
            energy_required,
            reminders,
            due_date,
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

    getUserTasks = asyncHandler(async (req: AuthRequest, res) => {
        const user = req.user as IUser
        // if (!user) throw badRequestError("")

        const { data, fromCache } = await this.taskService.handleGetUserTasks(user);

        return res.status(200).json({
            success: true,
            message: "User tasks fetched successfully!",
            data,
            fromCache,
        })
    })

    getUserTaskById = asyncHandler(async (req: AuthRequest, res) => {
        const user = req.user as IUser
        const { id } = req.params 

        if (!id || Array.isArray(id)) {
            throw badRequestError('Invalid ID');
        }

        const task = await this.taskService.handleGetUserTaskById(id, user)

        return res.status(200).json({
            success: true,
            message: "User task fetched successfully!",
            data: task
        })
    })
}