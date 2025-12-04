import db from "../config/db";
import { secretConfig } from "../config";
import { AuthRepository } from "../repository/AuthRepository";
import { UserRepository } from "../repository/UserRepository";
import { CreateAuthDTO } from "../types/auth";
import { CreateUserDTO, IUser } from "../types/user";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../utils/errors";
import { verifyToken } from "../utils/token";
import { comparePassword, hashPassword } from "../utils/hash";
import { ILoginResponse } from "../types/api-response";
import { TokenService } from "./TokenService";
import { EmailService } from "./EmailService";

export class AuthService {
    private userRepository: UserRepository
    private authRepository: AuthRepository
    private emailSecret = secretConfig.emailSecret

    constructor() {
        this.userRepository = new UserRepository() // instance of the UserRepository class
        this.authRepository = new AuthRepository()
    }

    async registerUser(userInput: CreateUserDTO): Promise<IUser> {
        return await db.transaction(async (trx) => {  
            
            const userPayload: CreateUserDTO  = {
                fullname: userInput.fullname,
                email: userInput.email,
            };
            
            // 1. Check if user exists
            const existingUser = await this.userRepository.findBy('email', userInput.email, trx)
            if (existingUser) throw new ConflictError('User email already exist!')
                         
            // 2. Create user
            const newUser = await this.userRepository.createUser(userPayload, trx)
            if (!newUser) throw new BadRequestError("User creation failed");

            // 3. Create auth record
            const authInput: CreateAuthDTO = {
                user_sn: newUser.sn,
                provider_name: 'email',
                provider_identity: userInput.email,
                secret: userInput.password
            }

            await this.authRepository.createAuthRecord(authInput)

            // Send welcome email
            await EmailService.sendWelcomeEmail(newUser)

            return newUser
        })    
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
                    reset_token: null,
                    reset_token_expiry: null,
                },
                trx
            )          
        })
    }

    async handleEmailVerification(email: string) {
        const user = await this.userRepository.findBy('email', email)
        if (!user) throw new NotFoundError('Account not found!')
        
        if (user.is_email_verified) {
            throw new ConflictError('Email already verified')
        }

        await EmailService.sendVerificationMail(user)
    }

    async verifyEmailToken(emailToken: string) {
        return await db.transaction(async (trx) => {
            
            const payload = verifyToken(emailToken, this.emailSecret)
            const userId = payload.user_id
    
            await this.userRepository.update(
                { id: userId },
                { is_email_verified: true },
                trx
            )        
        })
    }
    
}