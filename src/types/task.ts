export type EnergyRequired = "low" | "medium" | "high";
export type TaskStatus = "not_started" | "ongoing" | "completed";
export type ProgressInterval = "once" | "daily" | "weekly" | "monthly";
export type Urgency = "low" | "medium" | "high";

export interface ITask {
    id: string
    sn: bigint
    user_sn: bigint,
    project_id?: string | null,
    title: string,
    description?: string | null,
    status: TaskStatus,
    reminders: boolean,
    effort_estimate_minutes: number
    progress_percentage: number
    progress_interval: ProgressInterval
    scheduled_date?: Date | string | null
    scheduled_time?: Date | string | null
    urgency: Urgency
    is_active: boolean
    created_at: Date;
    updated_at: Date;
}

export interface CreateTaskDTO {
    user_sn: bigint
    project_id?: string | null
    title: string
    description?: string | null
    scheduled_date?: Date | string | null
    scheduled_time?: Date | string | null
    effort_estimate_minutes?: number
    energy_required: EnergyRequired
    reminders: boolean
    progress_interval?: ProgressInterval
    urgency?: Urgency
}