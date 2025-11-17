import nodemailer from 'nodemailer'
import { config } from '../config'
import { logger } from './logger'
import { Knex } from 'knex'

export interface SendMailOptions {
    to: string
    subject: string
    html: string
}

let transporter: nodemailer.Transporter;

const initializeTransporter = async () => {
    if (config.nodeEnv === 'development') {
        // In development, use Ethereal to capture emails and prevent sending real ones.
        // You'll get credentials for a test account in the console.
        const testAccount = await nodemailer.createTestAccount();
        // Note: nodemailer.getTestMessageUrl(info) requires the "info" returned by transporter.sendMail(info).
        // Log the test account and instruct how to obtain the preview URL after sending.
        logger.info(
            'Using Ethereal for email in development. Test account created: %s (call nodemailer.getTestMessageUrl(info) with the sendMail result to get a preview URL)',
            testAccount.user
        );
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    } else {
        // In production, use your actual SMTP service.
        // It's recommended to use a transactional email service like AWS SES, SendGrid, etc.
        transporter = nodemailer.createTransport({
            // Example for a generic SMTP provider. Update with your service's details.
            // host: config.smtp.host,
            // port: config.smtp.port,
            secure: config.smtp.secure, // true for 465, false for other ports
            service: 'gmail',
            auth: {
                user: config.smtp.email,
                pass: config.smtp.password
            }
        });
    }
};

initializeTransporter().catch(error => logger.error('Failed to initialize email transporter', error));

export const sendEmail = async (options: SendMailOptions, trx?: Knex.Transaction): Promise<void> => {
    try {
        const info = await transporter.sendMail({
            from: `'AGENDOS' <${config.smtp.email}>`,
            to: options.to,
            subject: options.subject,
            html: options.html
        });
        logger.info("Email sent:", { response: info.response })
    } catch (error) {
        logger.error('Email send failed:', error);
        // Re-throwing the error allows the caller (e.g., a service within a transaction) to handle it.
        throw new Error(`Email send failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}