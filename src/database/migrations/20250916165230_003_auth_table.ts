import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("auth", (table) => {
    table.bigIncrements("sn").unsigned().primary(); // internal PK
    table.uuid("id").notNullable().unique(); // external UUID reference

    table.bigInteger("user_sn").unsigned().notNullable();
    table.bigInteger("provider_sn").unsigned().notNullable();

    table.string("provider_identity", 255).notNullable();
    table.string("hashed_secret", 255).nullable(); // password hash 
    table.string("reset_token", 255).nullable(); // hashed token
    table.date("reset_token_expiry").nullable(); 

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).nullable();

    // Ensure uniqueness per provider+identity
    table.unique(["provider_sn", "provider_identity"], "auth_provider_identity_unique");

    // Foreign keys
    table
      .foreign("provider_sn", "auth_provider_sn_foreign")
      .references("sn")
      .inTable("providers")
      //.onDelete("CASCADE");

    table
      .foreign("user_sn", "auth_user_sn_foreign")
      .references("sn")
      .inTable("users")
      .onDelete("CASCADE");

    // Indexes for performance
    table.index(["user_sn"], "auth_user_sn_index");
    table.index(["provider_sn"], "auth_provider_sn_index");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("auth");
}
