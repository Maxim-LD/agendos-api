import { CreateAuthDTO, IAuth } from "../types/auth";
import { hashPassword } from "../utils/hash";
import { BaseRepository } from "./BaseRepository";
import { v4 as uuidv4 } from "uuid";
import { BadRequestError } from "../utils/errors";

export class AuthRepository extends BaseRepository<IAuth> {
    constructor() {
        super('auth', 'sn')
    }

    async createAuthRecord(input: CreateAuthDTO): Promise<IAuth | null> {
        return await this.db.transaction(async (trx) => {
            // Get provider record
            const provider = await this.db('providers').where('name', input.provider_name).first();
            if (!provider) throw new BadRequestError("Unknown provider type!");
    
            if (!input.secret) throw new BadRequestError("Missing secret!")
            const hashedSecret = await hashPassword(input.secret)
            
            const authdata: Partial<IAuth> = {
                id: uuidv4(),
                user_sn: input.user_sn,
                provider_sn: provider.sn,
                provider_identity: input.provider_identity,
                hashed_secret: hashedSecret,
                created_at: new Date(),
                updated_at: new Date()
            }
    
            return await this.create(authdata, trx)
        })
    }
}