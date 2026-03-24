import { UserResponseDTO } from "./user";

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
    user?: UserResponseDTO;
    accessToken: string;
    refreshToken: string;
}