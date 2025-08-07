import {
  users,
  projects,
  assets,
  collaborationSessions,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Asset,
  type InsertAsset,
  type CollaborationSession,
  type InsertCollaborationSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPreferences(id: string, preferences: { theme?: string; language?: string }): Promise<User>;
  
  // Project operations
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: number, userId: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>, userId: string): Promise<Project | undefined>;
  deleteProject(id: number, userId: string): Promise<boolean>;
  
  // Asset operations
  getAssets(projectId: number, userId: string): Promise<Asset[]>;
  getAsset(id: number, userId: string): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: Partial<InsertAsset>, userId: string): Promise<Asset | undefined>;
  deleteAsset(id: number, userId: string): Promise<boolean>;
  
  // Collaboration operations
  getActiveCollaborators(assetId: number): Promise<(CollaborationSession & { user: User })[]>;
  createOrUpdateCollaborationSession(session: InsertCollaborationSession): Promise<CollaborationSession>;
  endCollaborationSession(assetId: number, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPreferences(id: string, preferences: { theme?: string; language?: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Project operations
  async getProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.ownerId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: number, userId: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.ownerId, userId)));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>, userId: string): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.ownerId, userId)))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.ownerId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Asset operations
  async getAssets(projectId: number, userId: string): Promise<Asset[]> {
    return await db
      .select()
      .from(assets)
      .innerJoin(projects, eq(assets.projectId, projects.id))
      .where(and(
        eq(assets.projectId, projectId),
        eq(projects.ownerId, userId),
        eq(assets.isDeleted, false)
      ))
      .orderBy(asc(assets.type), asc(assets.name))
      .then(rows => rows.map(row => row.assets));
  }

  async getAsset(id: number, userId: string): Promise<Asset | undefined> {
    const [result] = await db
      .select()
      .from(assets)
      .innerJoin(projects, eq(assets.projectId, projects.id))
      .where(and(
        eq(assets.id, id),
        eq(projects.ownerId, userId),
        eq(assets.isDeleted, false)
      ));
    return result?.assets;
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const [newAsset] = await db
      .insert(assets)
      .values(asset)
      .returning();
    return newAsset;
  }

  async updateAsset(id: number, asset: Partial<InsertAsset>, userId: string): Promise<Asset | undefined> {
    const [updatedAsset] = await db
      .update(assets)
      .set({ ...asset, updatedAt: new Date() })
      .where(and(
        eq(assets.id, id),
        eq(assets.createdBy, userId),
        eq(assets.isDeleted, false)
      ))
      .returning();
    return updatedAsset;
  }

  async deleteAsset(id: number, userId: string): Promise<boolean> {
    const [updatedAsset] = await db
      .update(assets)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(and(
        eq(assets.id, id),
        eq(assets.createdBy, userId),
        eq(assets.isDeleted, false)
      ))
      .returning();
    return !!updatedAsset;
  }

  // Collaboration operations
  async getActiveCollaborators(assetId: number): Promise<(CollaborationSession & { user: User })[]> {
    const results = await db
      .select()
      .from(collaborationSessions)
      .innerJoin(users, eq(collaborationSessions.userId, users.id))
      .where(and(
        eq(collaborationSessions.assetId, assetId),
        eq(collaborationSessions.isActive, true)
      ))
      .orderBy(desc(collaborationSessions.lastActivity));

    return results.map(result => ({
      ...result.collaboration_sessions,
      user: result.users,
    }));
  }

  async createOrUpdateCollaborationSession(session: InsertCollaborationSession): Promise<CollaborationSession> {
    const [existingSession] = await db
      .select()
      .from(collaborationSessions)
      .where(and(
        eq(collaborationSessions.assetId, session.assetId),
        eq(collaborationSessions.userId, session.userId)
      ));

    if (existingSession) {
      const [updatedSession] = await db
        .update(collaborationSessions)
        .set({
          isActive: session.isActive,
          cursor: session.cursor,
          lastActivity: new Date(),
        })
        .where(eq(collaborationSessions.id, existingSession.id))
        .returning();
      return updatedSession;
    } else {
      const [newSession] = await db
        .insert(collaborationSessions)
        .values(session)
        .returning();
      return newSession;
    }
  }

  async endCollaborationSession(assetId: number, userId: string): Promise<boolean> {
    const [updatedSession] = await db
      .update(collaborationSessions)
      .set({ isActive: false, lastActivity: new Date() })
      .where(and(
        eq(collaborationSessions.assetId, assetId),
        eq(collaborationSessions.userId, userId)
      ))
      .returning();
    return !!updatedSession;
  }
}

export const storage = new DatabaseStorage();
