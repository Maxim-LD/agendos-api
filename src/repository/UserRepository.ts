import { Knex } from "knex";
import { CreateUserDTO, IUser } from "../types/user";
import { BaseRepository } from "./BaseRepository";
import { v4 as uuidv4 } from "uuid";

export class UserRepository extends BaseRepository<IUser> {
    constructor() {
        super('users', 'sn')
    }

    async findBy(column: string, value: string, trx?: Knex.Transaction): Promise<IUser | null> {
        const query = this.db(this.tableName).where(column, value).first()
        if (trx) query.transacting(trx)
        return query
    }

    async createUser(input: CreateUserDTO, trx?: any): Promise<IUser | null> {
        const userData: Partial<IUser> = {
            id: uuidv4(),
           ...input,
            created_at: new Date(),
            updated_at: new Date(),
        }

        return await this.create(userData)
    }
}