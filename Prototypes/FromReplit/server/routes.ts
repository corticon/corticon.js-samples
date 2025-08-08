import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProjectSchema, insertAssetSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware (disabled for development)
  await setupAuth(app);

  // Ensure test user exists for development
  try {
    const testUser = await storage.getUser('test-user-123');
    if (!testUser) {
      await storage.upsertUser({
        id: 'test-user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });
      console.log('[routes] Created test user for development');
    }
  } catch (error) {
    console.log('[routes] Test user creation/check failed:', error);
  }

  // Auth routes - return mock user for development
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      console.log('Fetching user (development mode)');
      // Return test user for development
      const user = await storage.getUser('test-user-123');
      if (user) {
        console.log('Fetched test user:', user);
        res.json(user);
      } else {
        // Create default test user if it doesn't exist
        const defaultUser = {
          id: 'test-user-123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          theme: 'light',
          language: 'en'
        };
        await storage.upsertUser(defaultUser);
        res.json(defaultUser);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      // Return default user even if database fails
      res.json({
        id: 'test-user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        theme: 'light',
        language: 'en'
      });
    }
  });

  // Update user preferences
  app.patch('/api/auth/user/preferences', async (req: any, res) => {
    try {
      const userId = 'test-user-123'; // Demo user
      const { theme, language } = req.body;

      console.log('Updating preferences for user:', userId, 'with:', { theme, language });

      // First check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        console.error('User not found:', userId);
        return res.status(404).json({ message: "User not found" });
      }

      const user = await storage.updateUserPreferences(userId, { theme, language });
      console.log('Successfully updated user preferences:', user);
      res.json(user);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      console.error("Error stack:", (error as Error).stack);
      res.status(500).json({ message: "Failed to update preferences", error: (error as Error).message });
    }
  });

  // Project routes
  app.get('/api/projects', async (req: any, res) => {
    try {
      const projects = await storage.getProjects('test-user-123');
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', async (req: any, res) => {
    try {
      const userId = 'test-user-123';
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId, userId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects', async (req: any, res) => {
    try {
      const userId = 'test-user-123';
      const projectData = insertProjectSchema.parse({
        ...req.body,
        ownerId: userId,
      });

      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/projects/:id', async (req: any, res) => {
    try {
      const userId = 'test-user-123';
      const projectId = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);

      const project = await storage.updateProject(projectId, projectData, userId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', async (req: any, res) => {
    try {
      const userId = 'test-user-123';
      const projectId = parseInt(req.params.id);
      const deleted = await storage.deleteProject(projectId, userId);

      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Asset routes
  app.get('/api/projects/:projectId/assets', async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const assets = await storage.getAssets(projectId, 'test-user-123');
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.get('/api/assets/:id', async (req: any, res) => {
    try {
      const userId = 'test-user-123';
      const assetId = parseInt(req.params.id);
      const asset = await storage.getAsset(assetId, userId);

      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.json(asset);
    } catch (error) {
      console.error("Error fetching asset:", error);
      res.status(500).json({ message: "Failed to fetch asset" });
    }
  });

  app.post('/api/projects/:projectId/assets', async (req: any, res) => {
    try {
      const userId = 'test-user-123';
      const projectId = parseInt(req.params.projectId);

      const assetData = insertAssetSchema.parse({
        ...req.body,
        projectId,
        createdBy: userId,
      });

      const asset = await storage.createAsset(assetData);
      res.status(201).json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid asset data", errors: error.errors });
      }
      console.error("Error creating asset:", error);
      res.status(500).json({ message: "Failed to create asset" });
    }
  });

  app.put('/api/assets/:id', async (req: any, res) => {
    try {
      const userId = 'test-user-123';
      const assetId = parseInt(req.params.id);
      const assetData = insertAssetSchema.partial().parse(req.body);

      const asset = await storage.updateAsset(assetId, assetData, userId);

      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid asset data", errors: error.errors });
      }
      console.error("Error updating asset:", error);
      res.status(500).json({ message: "Failed to update asset" });
    }
  });

  // Separate endpoint for updating ruleflow workflow data
  app.patch('/api/assets/:id/workflow', async (req: any, res) => {
    try {
      const userId = 'test-user-123';
      const assetId = parseInt(req.params.id);
      const { structuralData, uiData } = req.body;

      const updateData: any = {};
      if (structuralData !== undefined) updateData.structuralData = structuralData;
      if (uiData !== undefined) updateData.uiData = uiData;

      const asset = await storage.updateAsset(assetId, updateData, userId);

      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.json(asset);
    } catch (error) {
      console.error("Error updating workflow:", error);
      res.status(500).json({ message: "Failed to update workflow" });
    }
  });

  app.delete('/api/assets/:id', async (req: any, res) => {
    try {
      const userId = 'test-user-123';
      const assetId = parseInt(req.params.id);
      const deleted = await storage.deleteAsset(assetId, userId);

      if (!deleted) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Collaboration routes
  app.get('/api/assets/:id/collaborators', async (req: any, res) => {
    try {
      const assetId = parseInt(req.params.id);
      const collaborators = await storage.getActiveCollaborators(assetId);
      res.json(collaborators);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
      res.status(500).json({ message: "Failed to fetch collaborators" });
    }
  });

  app.post('/api/assets/:id/collaborate', async (req: any, res) => {
    try {
      const userId = 'test-user-123';
      const assetId = parseInt(req.params.id);
      const { cursor } = req.body;

      const session = await storage.createOrUpdateCollaborationSession({
        assetId,
        userId,
        isActive: true,
        cursor,
      });

      res.json(session);
    } catch (error) {
      console.error("Error updating collaboration session:", error);
      res.status(500).json({ message: "Failed to update collaboration session" });
    }
  });

  app.delete('/api/assets/:id/collaborate', async (req: any, res) => {
    try {
      const userId = 'test-user-123';
      const assetId = parseInt(req.params.id);

      await storage.endCollaborationSession(assetId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error ending collaboration session:", error);
      res.status(500).json({ message: "Failed to end collaboration session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
