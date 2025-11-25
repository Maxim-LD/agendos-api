import { config } from "../config";
import { renderTemplate } from "../templates/renderTemplates";
import { logger } from "../utils/logger";
import { IUser } from "../types/user";
import { sendEmail, SendMailOptions } from "../utils/mail_sender";
import { TokenService } from "./TokenService";
import { Knex } from "knex";

export class EmailService {
    constructor() {}
    
    static async sendWelcomeEmail(user: IUser) {
        try {
            const loginLink = `${config.frontendUrl}/auth/login`

            const html = renderTemplate('signup', {
                name: user.fullname,
                link: loginLink,
                year: new Date().getFullYear().toString()
            })

            const mailOptions: SendMailOptions = {
                to: user.email,
                subject: 'Welcome to Agendos!',
                html: html
            }

            await sendEmail(mailOptions)
          } catch (error: any) {
            logger.warn(`Failed to send welcome email to ${user.email}: ${error.message}`);
        }
    }

    static async sendVerificationMail(user: IUser, trx?: Knex.Transaction) {
        const token = await TokenService.issueEmailToken({ user_id: user.id, email: user.email })
        const verificationLink = `${config.baseUrl}/auth/verify-email?token=${token}`;
        
        const html = renderTemplate('verify-email', {
            name: user.fullname,
            link: verificationLink,
            year: new Date().getFullYear().toString()
        })

        const mailOptions: SendMailOptions = {
            to: user.email,
            subject: 'Verify Your Email', 
            html
        }

        await sendEmail(mailOptions, trx)
    }

    static async sendResetPaswordMail(user: IUser, token: string, trx?: Knex.Transaction) {
        const resetLink = `${config.frontendUrl}/auth/reset-password?token=${token}&email=${user.email}`;

        const html = renderTemplate('reset-password', {
            name: user.fullname,
            link: resetLink,
            year: new Date().getFullYear().toString()
        })

        const mailOptions: SendMailOptions = {
            to: user.email,
            subject: 'Reset Your Password', 
            html
        }

        await sendEmail(mailOptions, trx)
    }
}