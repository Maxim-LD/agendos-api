import { redis } from "../config/redis"
import { logger } from "./logger"

export const getCache = async <T = any>(key: string): Promise<{ data: T; fromCache: true; } | null> => {
    const data = await redis.get(key)
    if (!data) {
        return null;
    }
    return {
        data: JSON.parse(data) as T,
        fromCache: true,
    };
}

export const setCache = async (key: string, value: unknown, expiry = 3600): Promise<void> => {
    await redis.setex(key, expiry, JSON.stringify(value)) 
}

export const deleteCache = async (pattern: string): Promise<void> => {
    const stream = redis.scanStream({
        match: pattern,
        count: 100
    })

    stream.on("data", (keys: string[] = []) => {
    if (keys.length) {
            const pipeline = redis.pipeline();
            keys.forEach((key) => pipeline.del(key));
            pipeline.exec().catch(err => logger.error("Pipeline error:", err));
        }
    });

    stream.on('end', () => {
        logger.info(`Deleted cache with pattern: ${pattern}`)
    })

    stream.on('error', (error) => {
        logger.error('Redis delete error:', { error: error})
    })
}