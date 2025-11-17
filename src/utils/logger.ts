import { createLogger, format, transports } from "winston";
import { config } from "../config";

const { combine, timestamp, json, colorize, simple, errors } = format;

// Define transports based on the environment
const loggerTransports = [];

// In production, log to files and the console with JSON format
if (config.nodeEnv === 'production') {
    // loggerTransports.push(new transports.File({ filename: 'logs/error.log', level: 'error' }));
    // loggerTransports.push(new transports.File({ filename: 'logs/combined.log' }));
    loggerTransports.push(new transports.Console()); // Console transport for production
} else {
    // In development, use a more readable format for the console
    loggerTransports.push(new transports.Console({
        format: combine(
            colorize(),
            simple()
        )
    }));
}

export const logger = createLogger({
    level: config.nodeEnv === 'production' ? 'info' : 'debug',
    format: combine(
        // timestamp(),
        errors({ stack: true }),
        json()
    ),
    transports: loggerTransports
});