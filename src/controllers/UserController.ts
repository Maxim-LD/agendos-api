import { AuthRequest } from "../middlewares/auth-middleware";
import { asyncHandler } from "../middlewares/error-handler";
import { UserService } from "../services/UserService";
import { UpdateUserDTO } from "../types/user";

export class UserController {
    userService: UserService

    constructor() {
        this.userService = new UserService()
    }

    getProfile = asyncHandler(async () => {
        
    })

    updateProfile = asyncHandler(async (req: AuthRequest, res) => {
        const { user_id } = req.user as { user_id: string }
        const { fullname, status,  occupation, phone,
            maximum_daily_capacity, date_of_birth
        } = req.body

        const payload: UpdateUserDTO = {
            fullname,
            status,
            occupation,
            phone,
            maximum_daily_capacity,
            date_of_birth
        }

        const newProfile = await this.userService.updateProfile(user_id, payload)

        return res.status(200).json({
            success: true, 
            message: 'Profile update successfully',
            data: newProfile
        })
    })
}