export interface IUser {
    id: string
    sn: bigint
    fullname: string,
    email: string,
    username?: string,
    status?: string,
    occupation?: string,
    phone?: string,
    is_email_verified: boolean
    is_phone_verified: boolean
    maximum_daily_capacity: number
    created_at: Date;
    updated_at: Date;
    date_of_birth?: Date
}

export interface CreateUserDTO {
    email: string;
    password?: string;
    username?: string;
    fullname: string;
    status?: string;
    occupation?: string;
    phone?: string;
    date_of_birth?: Date;
}

export interface UpdateUserDTO {
    fullname?: string;
    status?: string;
    occupation?: string;
    phone?: string;
    maximum_daily_capacity?: number;
    date_of_birth?: Date;
}

export interface CreateProfileDTO {
    username?: string;
    status?: string;
    occupation?: string;
    phone?: string;
    maximum_daily_capacity?: number;
    date_of_birth?: Date;
}
