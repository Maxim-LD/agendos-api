import nodemailer from 'nodemailer'
import { config } from '../config'
import { logger } from './logger'
import { Knex } from 'knex'

export interface SendMailOptions {
    to: string
    subject: string
    html: string
}

export const sendEmail = async (options: SendMailOptions, trx?: Knex.Transaction): Promise<void> => {
    try {
        const transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: true,
            connectionTimeout: 10000,
            auth: {
                user: config.smtp.login,
                pass: config.smtp.password
            }
        })

        const mailOptions = {
            from: `'AGENDOS' <${config.smtp.email}>`,
            to: options.to,
            subject: options.subject,
            html: options.html
        }

        const info = await transporter.sendMail(mailOptions)
        logger.info("Email sent:", { response: info.response })

    } catch (error) {
        if (error instanceof Error) {
            if (trx) {
                // The error will be caught by the transaction block and trigger a rollback.
            }
            throw new Error(`Email send failed: ${error.message}`)
        }
        throw error
    }
}