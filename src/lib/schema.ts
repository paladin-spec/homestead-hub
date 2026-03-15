import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  date,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ─── Homestead Settings ──────────────────────────────────────────────────────
export const homestead = pgTable("homestead", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().default("My Homestead"),
  location: text("location"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type Homestead = typeof homestead.$inferSelect
export type NewHomestead = typeof homestead.$inferInsert

// ─── Plants ──────────────────────────────────────────────────────────────────
export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  variety: varchar("variety", { length: 255 }),
  location: varchar("location", { length: 255 }),
  plantedDate: date("planted_date"),
  stage: varchar("stage", { length: 50 }).default("seeded").notNull(), // 'seeded' | 'seedling' | 'mature'
  plantCount: integer("plant_count").default(1).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type Plant = typeof plants.$inferSelect
export type NewPlant = typeof plants.$inferInsert

export const plantLogs = pgTable("plant_logs", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id")
    .references(() => plants.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'watering' | 'fertilizing' | 'note'
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow().notNull(),
})

export type PlantLog = typeof plantLogs.$inferSelect
export type NewPlantLog = typeof plantLogs.$inferInsert

export const plantsRelations = relations(plants, ({ many }) => ({
  logs: many(plantLogs),
}))

export const plantLogsRelations = relations(plantLogs, ({ one }) => ({
  plant: one(plants, { fields: [plantLogs.plantId], references: [plants.id] }),
}))

// ─── Chickens ────────────────────────────────────────────────────────────────
export const chickens = pgTable("chickens", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  breed: varchar("breed", { length: 255 }),
  hatchDate: date("hatch_date"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type Chicken = typeof chickens.$inferSelect
export type NewChicken = typeof chickens.$inferInsert

export const eggCollections = pgTable("egg_collections", {
  id: serial("id").primaryKey(),
  count: integer("count").notNull(),
  collectedAt: timestamp("collected_at").defaultNow().notNull(),
  notes: text("notes"),
})

export type EggCollection = typeof eggCollections.$inferSelect
export type NewEggCollection = typeof eggCollections.$inferInsert

export const chickenLogs = pgTable("chicken_logs", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // 'feeding' | 'watering' | 'note'
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow().notNull(),
})

export type ChickenLog = typeof chickenLogs.$inferSelect
export type NewChickenLog = typeof chickenLogs.$inferInsert

// ─── Firewood ─────────────────────────────────────────────────────────────────
export const firewoodEntries = pgTable("firewood_entries", {
  id: serial("id").primaryKey(),
  species: varchar("species", { length: 255 }).notNull(),
  diameterInches: decimal("diameter_inches", { precision: 6, scale: 2 }).notNull(),
  lengthInches: decimal("length_inches", { precision: 6, scale: 2 }).notNull(),
  pieceCount: integer("piece_count").notNull().default(1),
  // Calculated and stored for convenience
  cordsEstimate: decimal("cords_estimate", { precision: 8, scale: 4 }),
  btuEstimate: decimal("btu_estimate", { precision: 12, scale: 2 }),
  notes: text("notes"),
  collectedAt: timestamp("collected_at").defaultNow().notNull(),
})

export type FirewoodEntry = typeof firewoodEntries.$inferSelect
export type NewFirewoodEntry = typeof firewoodEntries.$inferInsert

// ─── Equipment ───────────────────────────────────────────────────────────────
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 255 }),
  make: varchar("make", { length: 255 }),
  model: varchar("model", { length: 255 }),
  year: integer("year"),
  serialNumber: varchar("serial_number", { length: 255 }),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type Equipment = typeof equipment.$inferSelect
export type NewEquipment = typeof equipment.$inferInsert

export const maintenanceLogs = pgTable("maintenance_logs", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id")
    .references(() => equipment.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 255 }).notNull(), // 'oil_change' | 'filter' | 'repair' | 'inspection' | 'other'
  description: text("description").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  performedBy: varchar("performed_by", { length: 255 }),
  nextDueDate: date("next_due_date"),
  performedAt: timestamp("performed_at").defaultNow().notNull(),
  notes: text("notes"),
})

export type MaintenanceLog = typeof maintenanceLogs.$inferSelect
export type NewMaintenanceLog = typeof maintenanceLogs.$inferInsert

export const equipmentRelations = relations(equipment, ({ many }) => ({
  maintenanceLogs: many(maintenanceLogs),
}))

export const maintenanceLogsRelations = relations(maintenanceLogs, ({ one }) => ({
  equipment: one(equipment, {
    fields: [maintenanceLogs.equipmentId],
    references: [equipment.id],
  }),
}))
