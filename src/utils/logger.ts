import { createLogger, format, transports } from "winston";
import { config } from "../config";

export const logger = createLogger({
    level: config.nodeEnv === 'production' ? 'info' : 'debug',
    format: format.combine(
        format.errors({ stack: true }),
        format.json()
    ),
    // transports: [
    //     new transports.File({ filename: 'logs/error.log', level: 'error' }),
    //     new transports.File({ filename: 'logs/combined.log' })
    // ]
})

// if (config.nodeEnv === 'production') {

// }

if (config.nodeEnv === 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }))
}