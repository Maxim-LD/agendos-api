import dotenv from 'dotenv'

dotenv.config({
    path: `.env.${process.env.NODE_ENV}`
})

interface Config {
    port: number,
    nodeEnv: string,
    baseUrl: string
    frontendUrl: string
    rateLimit: {
        windowMS: number
        maxRequests: number
    }
    smtp: {
        email: string
        password: string
    },
    redisUrl: string
}

interface SecretsConfig {
    saltRounds: number
    secretKey: string
    refreshSecret: string
    emailSecret: string
    tokenExpiry: string
    refreshTokenExpiry: number
}

interface DbConfig {
    database: {
        host: string;
        port: number;
        user: string;
        password: string | undefined;
        database: string;
    }
}

const requiredEnvVars = [
    'PORT',
    'NODE_ENV',
    'DB_PORT',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS',
    'SALT_ROUNDS'
];

// Check for required environment variables
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

export const config: Config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:3200/api/v1',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    redisUrl: process.env.REDIS_URL || '',

    rateLimit: {
        windowMS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100') // limit each IP to 100 requests per windowMs
    },
    smtp: {
        email: process.env.SMTP_EMAIL || '',
        password: process.env.SMTP_PASSWORD || ''
    }
}

export const dbConfig: DbConfig = {
    database: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3307'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'local_todo_db',
    }
}

export const secretConfig: SecretsConfig = {
    saltRounds: Number(process.env.SALT_ROUNDS) || 10,
    secretKey: process.env.SECRET_KEY || '',
    refreshSecret: process.env.REFRESH_SECRET || '',
    emailSecret: process.env.EMAIL_SECRET || '',
    tokenExpiry: process.env.TOKEN_EXPIRY || '',
    refreshTokenExpiry: (Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS) || 5) * 24 * 60 * 60 // days → seconds
};
