import db from "../config/db";
import { UserRepository } from "../repository/UserRepository";
import { CreateProfileDTO, IUser, UpdateUserDTO } from "../types/user";
import { NotFoundError } from "../utils/errors";

export class UserService {
    userRepository: UserRepository

    constructor() {
        this.userRepository = new UserRepository()
    }

    async profile(email: string, payload: CreateProfileDTO): Promise<IUser | null> {
        return await db.transaction(async (trx) => {
            const existingUser = await this.userRepository.findBy('email', email, trx)
            if (!existingUser) throw new NotFoundError('User not found, Please sign up again!')

            const profilePayload: CreateProfileDTO = {
                username: payload.username,
                status: payload.status,
                occupation: payload.occupation,
                phone: payload.phone,
                maximum_daily_capacity: payload.maximum_daily_capacity,
                date_of_birth: payload.date_of_birth
            }

            const updatedUsers = await this.userRepository.update(
                { email: email },
                profilePayload,
                trx
            )

            if (!updatedUsers || updatedUsers.length === 0) {
                throw new NotFoundError('User could not be updated or found after update.');
            }

            return updatedUsers[0];
        })
    }

    async updateProfile(userId: string, payload: UpdateUserDTO): Promise<IUser | null> {
        return await db.transaction(async (trx) => {
            const existingUser = await this.userRepository.findById(userId)
            if (!existingUser) throw new NotFoundError('User not found!')

            const updatedUsers = await this.userRepository.update(
                { id: userId },
                {
                    fullname: payload.fullname,
                    status: payload.status,
                    occupation: payload.occupation,
                    phone: payload.phone,
                    maximum_daily_capacity: payload.maximum_daily_capacity,
                    date_of_birth: payload.date_of_birth
                },
                trx
            ) 

            if (!updatedUsers || updatedUsers.length === 0) {
                throw new NotFoundError('User could not be updated or found after update.');
            }

            return updatedUsers[0];
        })
    }
}