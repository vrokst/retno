import { pgTable, text, jsonb, timestamp, index, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scriptsTable = pgTable(
  "scripts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: text("session_id"),
    userId: text("user_id"),
    inputText: text("input_text").notNull(),
    inputType: text("input_type").notNull(),
    scripts: jsonb("scripts").notNull(),
    modelUsed: text("model_used"),
    language: text("language").default("English"),
    tone: text("tone").default("Viral & Energetic"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("scripts_session_id_idx").on(table.sessionId),
    index("scripts_created_at_idx").on(table.createdAt),
  ],
);

export const insertScriptSchema = createInsertSchema(scriptsTable).omit({ id: true, createdAt: true });
export const selectScriptSchema = createSelectSchema(scriptsTable);

export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Script = typeof scriptsTable.$inferSelect;
