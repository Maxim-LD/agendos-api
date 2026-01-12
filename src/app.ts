import express from 'express'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import cors from 'cors'
import router from './router'
import compression from 'compression'
import { errorHandler, notFoundHandler } from './middlewares/error-handler'
import { globalRatelimit } from './middlewares/rate-limiter'

const app = express()

const allowedOrigins = [
    "http://localhost:3000",
    'https://agendos.vercel.app',
    'http://agendos.local'
]

// Trust proxy
app.set('trust proxy', 1);

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser())

app.use(compression());
app.use(morgan('dev'))
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}))

app.use(globalRatelimit)

app.use('/api/v1', router)

app.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Welcome to Agendos Backend service'
    })
})

// Handle all other routes that are not found
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

export default app
