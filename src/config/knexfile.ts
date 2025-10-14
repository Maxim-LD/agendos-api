import type { Knex } from "knex";
import { dbConfig } from "../config"

const knexConfig: { [key: string]: Knex.Config } = {
    development: {
        client: 'mysql2',
        connection: dbConfig.database,
        pool: {
            min: 2,
            max: 10,
            acquireTimeoutMillis: 30000,
            idleTimeoutMillis: 30000
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './src/database/migrations',
            extension: 'ts'
        },
        seeds: {
            directory: './src/database/seeds',
            extension: 'ts'
        }
    },
    production: {
        client: 'mysql2',
        connection: dbConfig.database,
        pool: {
            min: 2,
            max: 10,
            acquireTimeoutMillis: 30000,
            idleTimeoutMillis: 30000
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './src/database/migrations',
            extension: 'ts'
        },
        seeds: {
            directory: './src/database/seeds',
            extension: 'ts'
        }
    }
}

export default knexConfig