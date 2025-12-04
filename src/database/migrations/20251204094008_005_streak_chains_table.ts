import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("streak_chains", (table) => {
        table.bigIncrements("sn").primary();
        table.uuid("id").notNullable().unique();

        table.bigInteger("user_sn").unsigned().notNullable();
        table.string("name", 150).notNullable();

        table.integer("current_count").unsigned().notNullable().defaultTo(0);
        
        table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
        table.timestamp("last_updated_at").notNullable().defaultTo(knex.fn.now());
        table.boolean("is_active").notNullable().defaultTo(true);

        // Foreign key
        table
            .foreign("user_sn")
            .references("sn")
            .inTable("users")
            .onDelete("CASCADE");
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists("streak_chains");
}