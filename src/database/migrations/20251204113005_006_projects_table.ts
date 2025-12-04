import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("projects", (table) => {
    // Primary and Public Keys
    table.bigIncrements("sn").unsigned().primary(); // Internal PK 
    table.uuid("id").notNullable().unique();         // External UUID 

    // Relationships
    table.bigInteger("user_sn").unsigned().notNullable(); // FK to users table 

    // Core Project Data
    table.string("name", 150).notNullable();             // Project name 
    table.string("status", 50).notNullable().defaultTo("active"); 
    table.text("description").nullable(); // Added for completeness

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).nullable();

    // Foreign Key Constraint
    table
      .foreign("user_sn")
      .references("sn")
      .inTable("users")
      .onDelete("CASCADE"); // Deleting a user deletes their projects
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("projects");
}