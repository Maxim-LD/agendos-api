import db from "../config/db";
import { TaskRepository } from "../repository/TaskRepository";
import { UserRepository } from "../repository/UserRepository"; 
import { CreateTaskDTO, ITask } from "../types/task";
import { badRequestError, conflictError, forbiddenError, notFoundError } from "../errors/factories";
import { IUser } from "../types/user";
import { getCache, setCache } from "../utils/caching";

export class TaskService {
    private taskRepository: TaskRepository
    private userRepository: UserRepository

    constructor() {
        this.taskRepository = new TaskRepository()
        this.userRepository = new UserRepository()
    }

    async handleCreateTask(data: CreateTaskDTO): Promise<ITask> {
        let user_sn = data.user_sn;
        if (!user_sn && data.user_id) {
            const user = await this.userRepository.findById(data.user_id);
            if (!user) throw notFoundError('User not found');
            user_sn = user.sn;
        }

        return await db.transaction(async (trx) => {
            const taskPayload: CreateTaskDTO = {
                user_sn: user_sn,
                // user_id: data.user_id,
                title: data.title,
                description: data.description,
                reminders: data.reminders || true,
                progress_interval: data.progress_interval,
                urgency: data.urgency,
                effort_estimate_minutes: data.effort_estimate_minutes,
                energy_required: data.energy_required,
                due_date: data.due_date, 
            }

            const exists = await this.taskRepository.findOne('title', data.title, trx)
            if (exists) throw conflictError('Task already exist for user!')
            
            // Prevent a user from scheduling tasks that exceed their maximum_daily_capacity.                          
            if (taskPayload.due_date) {
                const user = await this.userRepository.findOne('sn', taskPayload.user_sn, trx);
                const maxHours = (user?.maximum_daily_capacity || 8);
                const maxMinutes = maxHours * 60;

                const currentDailyEffort = await this.taskRepository.getDailyEffortSum(
                    taskPayload.user_sn, 
                    taskPayload.due_date, 
                    trx
                );

                const newTaskEffort = parseInt(String(taskPayload.effort_estimate_minutes || 0));
                
                if ((currentDailyEffort + newTaskEffort) > maxMinutes) {
                    const available = maxMinutes - currentDailyEffort;
                    throw badRequestError(`Effort Budget Exceeded! You only have ${available > 0 ? available : 0} minutes of capacity left for this date.`);
                }
            }
            
            const newTask = await this.taskRepository.addTask(taskPayload, trx)
            if (!newTask) throw badRequestError('Task creation failed!')

            return newTask
        })
    }

    async handleGetUserTasks(user: IUser): Promise<{ data: ITask[]; fromCache: boolean; }> {
        const isExisting = await this.userRepository.findById(user.id)
        if (!isExisting) throw notFoundError("User does not exist!")
        
        const cachedKey = `tasks:${user.id}`
        const cachedResult = await getCache<ITask[]>(cachedKey)
        if (!cachedResult) {
            const userTasks = await this.taskRepository.findAll('user_sn', isExisting.sn);
            if (!userTasks || userTasks.length === 0) throw notFoundError("No tasks found for user");
                   
            await setCache(cachedKey, userTasks, 3600)
            
            return { data: userTasks, fromCache: false };
        }

        return cachedResult
    }

    async handleGetUserTaskById(id: string, user: IUser): Promise<ITask | null> { 
        const isExisting = await this.userRepository.findById(user.id)
        if (!isExisting) throw notFoundError("User does not exist!")

        const task = await this.taskRepository.findById(id)
        if (!task || (task.user_sn !== isExisting.sn)) throw notFoundError('Task not found for user!')
        
        return task
    }
    async handleUpdateTask(id: number, userId: number, updates: Partial<CreateTaskDTO>) { }
    async handleDeleteTask(id: number, userId: number) { }
}