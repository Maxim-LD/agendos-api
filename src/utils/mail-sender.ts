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
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': config.smtp.apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: 'AGENDOS',
                    email: config.smtp.email
                },
                to: [{ email: options.to }],
                subject: options.subject,
                htmlContent: options.html
            })
        })

        if (!response.ok) {
            const errorBody = await response.text()
            throw new Error(`Brevo API error (${response.status}): ${errorBody}`)
        }

        const result = await response.json()
        logger.info("Email sent via Brevo API:", { messageId: result.messageId })

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