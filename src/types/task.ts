export type EnergyRequired = "light" | "moderate" | "intense";
export type TaskStatus = "not_started" | "ongoing" | "completed";
export type ProgressInterval = "once" | "daily" | "weekly" | "monthly";
export type Urgency = "low" | "medium" | "high";

export interface ITask {
    id: string
    sn: bigint
    user_id: string,
    user_sn: bigint,
    project_sn?: bigint | null,
    project_id?: string,
    title: string,
    description?: string | null,
    status: TaskStatus,
    reminders?: boolean,
    effort_estimate_minutes: number
    progress_percentage: number
    progress_interval: ProgressInterval
    due_date?: Date | string | null
    urgency: Urgency
    is_active: boolean
    created_at: Date;
    updated_at: Date;
}

export interface CreateTaskDTO {
    title: string
    description?: string | null
    user_id?: string,
    user_sn: bigint,
    project_id?: string,
    due_date?: Date | string | null
    effort_estimate_minutes?: number
    energy_required: EnergyRequired
    reminders?: boolean
    progress_interval?: ProgressInterval
    urgency?: Urgency
}