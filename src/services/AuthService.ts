import db from "../config/db";
import { config, secretConfig } from "../config";
import { AuthRepository } from "../repository/AuthRepository";
import { UserRepository } from "../repository/UserRepository";
import { CreateAuthDTO } from "../types/auth";
import { CreateUserDTO, IUser } from "../types/user";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../utils/errors";
import { generateToken, verifyToken } from "../utils/token";
import { comparePassword, hashPassword } from "../utils/hash";
import { IApiResponse, ILoginResponse } from "../types/api_response";
import { TokenService } from "./TokenService";
import { EmailService } from "./EmailService";

export class AuthService {
    private userRepository: UserRepository
    private authRepository: AuthRepository
    private emailSecret = secretConfig.emailSecret

    constructor() {
        this.userRepository = new UserRepository()
        this.authRepository = new AuthRepository()
    }

    async registerUser(userInput: CreateUserDTO): Promise<IUser> {
        return await db.transaction(async (trx) => {  
            
            const userPayload: CreateUserDTO  = {
                email: userInput.email,
                username: userInput.username,
                fullname: userInput.fullname,
                status: userInput.status,
                occupation: userInput.occupation,
                phone: userInput.phone,
                date_of_birth: userInput.date_of_birth
            };
            
            // 1. Check if user exists
            const existingUser = await this.userRepository.findByEmail(userInput.email, trx)
            if (existingUser) throw new ConflictError('User email already exist!')
                
            const existingUsername = userInput.username
                ? await this.userRepository.findByUsername(userInput.username, trx)
                : null;
            if (existingUsername) throw new ConflictError("Username already exist!");

            const existingPhone = userInput.phone
                ? await this.userRepository.findByPhone(userInput.phone, trx)
                : null;
            if (existingPhone) throw new ConflictError('Phone number already exist!')
            
            // 2. Create user
            const newUser = await this.userRepository.createUser(userPayload, trx)
            if (!newUser) {
                throw new Error("User creation failed");
            }           

            // 3. Create auth record
            const authInput: CreateAuthDTO = {
                user_sn: newUser.sn,
                provider_name: 'email',
                provider_identity: userInput.email,
                secret: userInput.password
            }
            await this.authRepository.createAuthRecord(authInput)

            // Send verification email
            await EmailService.sendVerificationMail(newUser, trx)

            return newUser
        })    
    }

    async verifyEmailToken(token: string) {
        const payload = verifyToken(token, this.emailSecret)
        const userId = payload.user_id

        await this.userRepository.update(userId, { is_email_verified: true })        
    }

    async handleLogin(key: string, value: string, secret: string): Promise<ILoginResponse> {
        return db.transaction(async (trx) => {
            // 1. Check if user exist
            const user = await this.userRepository.findOne(key, value, trx)
            if (!user) throw new NotFoundError('User does not exist!')
            
            // 2. Check auth record for password match
            const auth = await this.authRepository.findOne('user_sn', user.sn, trx)
            if (!auth) throw new NotFoundError('No auth record for user!')

            // 3. Compare password
            const isMatch = await comparePassword(secret, auth.hashed_secret)
            if (!isMatch) throw new UnauthorizedError('Invalid credentials provided!')
            
            // 4. Generate auth tokens
            const { accessToken, refreshToken } = await TokenService.issueAuthTokens(user)
            
            return { user, accessToken, refreshToken }
        })
    }

    async handleForgotPassword(key: string, value: string): Promise<void> {
        return await db.transaction(async (trx) => {
            // 1. Check if user exists
            const user = await this.userRepository.findOne(key, value, trx)
            if (!user) throw new NotFoundError('Account not found!')
            
            // 2. Generate token
            const { resetToken, resetTokenExpiry } = await TokenService.issueResetToken()
            const hashedToken = await hashPassword(resetToken)

            // 3. Update auth table
            await this.authRepository.update(
                { user_sn: user.sn },
                {
                    reset_token: hashedToken,
                    reset_token_expiry: resetTokenExpiry,
                },
                trx
            )

            // 4. Send reset password email
            await EmailService.sendResetPaswordMail(user, resetToken, trx);
        })
    }

    private async validateResetToken(providedToken: string, storedTokenHash: string | null, expiry: Date | null) {
        if (!storedTokenHash || !expiry) {
            throw new BadRequestError('Invalid or expired token.');
        }

        if (new Date() > expiry) {
            throw new UnauthorizedError('Token has expired!');
        }

        const isTokenValid = await comparePassword(providedToken, storedTokenHash);
        if (!isTokenValid) {
            throw new UnauthorizedError('Invalid token provided.');
        }
    }

    async handleResetPassword(email: string, token: string, secret: string) {
        return await db.transaction(async (trx) => {
            // 1. Find the auth record for the user
            const authRecord = await this.authRepository.findOne('provider_identity', email, trx)
            if (!authRecord || !authRecord.reset_token || !authRecord.reset_token_expiry) {
                throw new BadRequestError('No token set for user.')
            }

            // 2. Validate the reset token against the stored values
            await this.validateResetToken(token, authRecord.reset_token, authRecord.reset_token_expiry);

            // 3. Hash the new password
            const newSecret = await hashPassword(secret)

            // 4. Update the password and invalidate the reset token
            await this.authRepository.update(
                { user_sn: authRecord.user_sn },
                {
                    hashed_secret: newSecret,
                    reset_token: null, // Invalidate the token after use
                    reset_token_expiry: null, // Clear the expiry

                },
                trx
            )          
        })
    }

    
}