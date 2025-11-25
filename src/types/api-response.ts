import { IUser } from "./user";

export interface IApiResponse<T = any> {
    success: boolean,
    message: string,
    data?: T,
    error?: {
        code: string,
        stack?: string
    }
}

export interface ILoginResponse {
    user: IUser;
    accessToken: string;
    refreshToken: string;
}