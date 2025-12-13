import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("tasks", (table) => {
    table.bigIncrements("sn").unsigned().primary(); // internal PK
    table.uuid("id").notNullable().unique();         // external UUID

    // --- Relationships ---
    table.uuid("user_id").notNullable();
    table.uuid("project_id").nullable(); 
    table.bigInteger("streak_chain_sn").unsigned().nullable();

    // --- Core Task Data ---
    table.string("title", 100).notNullable();
    table.text("description").nullable();

    table.integer("effort_estimate_minutes").unsigned().notNullable().defaultTo(0);
    table.enum("energy_required", ["light", "moderate", "intense"]).notNullable().defaultTo("moderate"); // How focused or determined is the user to take the task 

    table.date("due_date").nullable();

    // --- Status and Progress ---
    table.boolean("reminders").notNullable().defaultTo(false);
    table.enum("status", ["not_started", "ongoing", "completed"]).notNullable().defaultTo("not_started");
    table.integer("progress_percentage").unsigned().notNullable().defaultTo(0); 
    table.enum("progress_interval", ["once", "daily", "weekly", "monthly"]).notNullable().defaultTo("once");
    table.enum("urgency", ["low", "medium", "high"]).notNullable().defaultTo("medium");
    table.boolean("is_active").notNullable().defaultTo(true);

    // --- Timestamps ---
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).nullable();

    // --- Indexes and Foreign Keys ---
    table.index(["title", "created_at"], "tasks_title_created_at_index");

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    
    table
      .foreign("streak_chain_sn")
      .references("sn")
      .inTable("streak_chains")
      .onDelete("SET NULL");
      
    // REQUIRED ADDITION: Foreign Key to projects table
    table
      .foreign("project_id")
      .references("id")
      .inTable("projects")
      .onDelete("SET NULL"); // When a project is deleted, tasks are un-assigned.
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("tasks");
}