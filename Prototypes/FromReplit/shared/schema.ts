import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  theme: varchar("theme", { length: 10 }).default("dark"),
  language: varchar("language", { length: 5 }).default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Assets table (vocabulary, rulesheets, ruleflow, rulestest)
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'vocabulary', 'rulesheets', 'ruleflow', 'rulestest'
  content: jsonb("content").notNull(),
  structuralData: jsonb("structural_data"), // Business logic: nodes, connections, rules
  uiData: jsonb("ui_data"), // Visual data: positions, colors, fonts, layout
  projectId: integer("project_id").notNull().references(() => projects.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

// Collaboration sessions
export const collaborationSessions = pgTable("collaboration_sessions", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
  cursor: jsonb("cursor"), // Store cursor position and selection
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  assets: many(assets),
  collaborationSessions: many(collaborationSessions),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  assets: many(assets),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  project: one(projects, {
    fields: [assets.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [assets.createdBy],
    references: [users.id],
  }),
  collaborationSessions: many(collaborationSessions),
}));

export const collaborationSessionsRelations = relations(collaborationSessions, ({ one }) => ({
  asset: one(assets, {
    fields: [collaborationSessions.assetId],
    references: [assets.id],
  }),
  user: one(users, {
    fields: [collaborationSessions.userId],
    references: [users.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
});
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;

// Ruleflow structural data schema
export const ruleflowStructuralSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['rulesheets', 'ruleflow', 'text']),
    text: z.string().optional(), // For text nodes
    fontSize: z.number().optional(), // For text nodes
    assetId: z.number().optional(), // Reference to the actual asset
    metadata: z.record(z.any()).optional(), // Additional business logic data
  })),
  connections: z.array(z.object({
    id: z.string(),
    fromNodeId: z.string(),
    toNodeId: z.string(),
    condition: z.string().optional(), // Business rule condition
    priority: z.number().optional(), // Connection priority/order
    metadata: z.record(z.any()).optional(),
  })),
  version: z.string().default("1.0"),
  metadata: z.record(z.any()).optional(),
});

// Ruleflow UI data schema
export const ruleflowUISchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
    size: z.object({
      width: z.number(),
      height: z.number(),
    }),
    style: z.object({
      backgroundColor: z.string().optional(),
      borderColor: z.string().optional(),
      textColor: z.string().optional(),
      fontSize: z.number().optional(),
    }).optional(),
    isVisible: z.boolean().default(true),
  })),
  connections: z.array(z.object({
    id: z.string(),
    fromPoint: z.object({
      x: z.number(),
      y: z.number(),
    }),
    toPoint: z.object({
      x: z.number(),
      y: z.number(),
    }),
    style: z.object({
      color: z.string().optional(),
      thickness: z.number().optional(),
      dashPattern: z.array(z.number()).optional(),
    }).optional(),
    isVisible: z.boolean().default(true),
  })),
  canvas: z.object({
    zoom: z.number().default(1),
    panX: z.number().default(0),
    panY: z.number().default(0),
    gridSize: z.number().default(20),
    backgroundColor: z.string().optional(),
    size: z.object({ 
      width: z.number().default(5000), 
      height: z.number().default(3000) 
    }).optional(), // Virtual canvas size in pixels
    viewport: z.object({
      scrollX: z.number().default(0),
      scrollY: z.number().default(0),
    }).optional(), // Viewport scroll position
  }),
  version: z.string().default("1.0"),
});

export type RuleflowStructuralData = z.infer<typeof ruleflowStructuralSchema>;
export type RuleflowUIData = z.infer<typeof ruleflowUISchema>;

export const insertCollaborationSessionSchema = createInsertSchema(collaborationSessions).omit({
  id: true,
  lastActivity: true,
});
export type InsertCollaborationSession = z.infer<typeof insertCollaborationSessionSchema>;
export type CollaborationSession = typeof collaborationSessions.$inferSelect;
