import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  hubspotSynced: text("hubspot_synced").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  hubspotSynced: true,
  createdAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export const calculations = pgTable("calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id).notNull(),
  siteCount: integer("site_count").notNull(),
  totalInventoryValue: real("total_inventory_value").notNull(),
  skuCount: integer("sku_count").notNull(),
  industry: text("industry").notNull().default("Other"),
  activePercent: real("active_percent").notNull(),
  obsoletePercent: real("obsolete_percent").notNull(),
  specialPercent: real("special_percent").notNull(),
  activeMaterialIncreases: real("active_material_increases").notNull(),
  activeMaterialDecreases: real("active_material_decreases").notNull(),
  networkOptimization: real("network_optimization").notNull(),
  vmiDisposition: real("vmi_disposition").notNull(),
  deduplication: real("deduplication").notNull(),
  totalReduction: real("total_reduction").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCalculationSchema = createInsertSchema(calculations).omit({
  id: true,
  createdAt: true,
});

export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type Calculation = typeof calculations.$inferSelect;
