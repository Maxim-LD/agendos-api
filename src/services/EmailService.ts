import { config } from "../config";
import { renderTemplate } from "../templates/renderTemplates";
import { IUser } from "../types/user";
import { sendEmail } from "../utils/mail_sender";
import { TokenService } from "./TokenService";

export class EmailService {
    constructor() {}
    
    static async sendVerificationMail(user: IUser) {
        const token = await TokenService.issueEmailToken({ user_id: user.id, email: user.email })
        const verificationLink = `${config.baseUrl}/auth/verify-email?token=${token}`;
        
        const html = renderTemplate('signup', {
            name: user.fullname,
            link: verificationLink,
            year: new Date().getFullYear().toString()
        })
        
        await sendEmail(
            user.email,
            'Verify Your Email',
            html
        )
    }

    static async sendResetPaswordMail(user: IUser, token: string) {
        const resetLink = `${config.frontendUrl}/auth/reset-password?token=${token}&email=${user.email}`;

        const html = renderTemplate('reset-password', {
            name: user.fullname,
            link: resetLink,
            year: new Date().getFullYear().toString()
        })

        await sendEmail(
            user.email,
            'Reset Your Password',
            html
        )
    }
}