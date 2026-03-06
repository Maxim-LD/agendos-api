import db from "../config/db";
import { secretConfig } from "../config";
import { AuthRepository } from "../repository/AuthRepository";
import { UserRepository } from "../repository/UserRepository";
import { CreateAuthDTO } from "../types/auth";
import { CreateUserDTO, IUser } from "../types/user";
import { badRequestError, conflictError, notFoundError, unauthorizedError } from "../errors/factories";
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

    async registerUser(data: CreateUserDTO): Promise<ILoginResponse> {
        return await db.transaction(async (trx) => {  
            
            const userPayload: CreateUserDTO  = {
                fullname: data.fullname,
                email: data.email,
            };
            
            const existingUser = await this.userRepository.findBy('email', data.email, trx)
            if (existingUser) throw conflictError('User email already exist!')
                         
            const newUser = await this.userRepository.createUser(userPayload, trx)
            if (!newUser) throw badRequestError("User creation failed");

            const authInput: CreateAuthDTO = {
                user_sn: newUser.sn,
                provider_name: 'email',
                provider_identity: data.email,
                secret: data.password
            }

            await this.authRepository.createAuthRecord(authInput)

            const { accessToken, refreshToken } = await TokenService.issueAuthTokens(newUser)

            // Send welcome email
            await EmailService.sendWelcomeEmail(newUser)

            return { user: newUser, accessToken, refreshToken }
        })    
    }

    async handleLogin(key: string, value: string, secret: string): Promise<ILoginResponse> {
        return db.transaction(async (trx) => {
            // 1. Check if user exist
            const user = await this.userRepository.findOne(key, value, trx)
            if (!user) throw notFoundError('User does not exist!')
            
            // 2. Check auth record for password match
            const auth = await this.authRepository.findOne('user_sn', user.sn, trx)
            if (!auth) throw notFoundError('No auth record for user!')

            // 3. Compare password
            const isMatch = await comparePassword(secret, auth.hashed_secret)
            if (!isMatch) throw unauthorizedError('Invalid credentials provided!')
            
            // 4. Generate auth tokens
            const { accessToken, refreshToken } = await TokenService.issueAuthTokens(user)
            
            return { user, accessToken, refreshToken }
        })
    }

    async handleForgotPassword(key: string, value: string): Promise<void> {
        return await db.transaction(async (trx) => {
            // 1. Check if user exists
            const user = await this.userRepository.findOne(key, value, trx)
            if (!user) throw notFoundError('Account not found!')
            
            // 2. Generate token
            const { resetToken, resetTokenExpiry } = await TokenService.issueResetToken()
            // console.log(resetToken);
            
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
            throw badRequestError('Invalid or expired token.');
        }

        if (new Date() > expiry) {
            throw unauthorizedError('Token has expired!');
        }

        const isTokenValid = await comparePassword(providedToken, storedTokenHash);
        if (!isTokenValid) {
            throw unauthorizedError('Invalid token provided.');
        }
    }

    async handleResetPassword(email: string, token: string, secret: string) {
        return await db.transaction(async (trx) => {
            // 1. Find the auth record for the user
            const authRecord = await this.authRepository.findOne('provider_identity', email, trx)
            if (!authRecord || !authRecord.reset_token || !authRecord.reset_token_expiry) {
                throw badRequestError('No token set for user.')
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
        if (!user) throw notFoundError('Account not found!')
        
        if (user.is_email_verified) {
            throw conflictError('Email already verified')
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