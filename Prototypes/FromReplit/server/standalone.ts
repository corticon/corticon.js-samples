import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }

            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }

            console.log(`[express] ${logLine}`);
        }
    });

    next();
});

(async () => {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        res.status(status).json({ message });
        throw err;
    });

    // Serve static files from client directory (for development without Vite)
    const clientPath = path.resolve(__dirname, "..", "client");
    console.log(`[standalone] Serving static files from: ${clientPath}`);

    // Serve index.html for all non-API routes (SPA fallback)
    app.get("*", (req, res) => {
        if (!req.path.startsWith("/api")) {
            res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Corticon Studio - Standalone Mode</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .status { color: #28a745; font-weight: bold; }
            .warning { color: #ffc107; font-weight: bold; }
            code { background: #f8f9fa; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 Corticon Studio Server</h1>
            <p class="status">✅ Server is running successfully!</p>
            
            <h2>Standalone Development Mode</h2>
            <p>The server is running in standalone mode without the full Vite development environment.</p>
            
            <h3>API Endpoints Available:</h3>
            <ul>
              <li><strong>GET</strong> <code>/api/auth/user</code> - Get current user</li>
              <li><strong>GET</strong> <code>/api/projects</code> - List projects</li>
              <li><strong>POST</strong> <code>/api/projects</code> - Create project</li>
              <li><strong>GET</strong> <code>/api/projects/:id/assets</code> - List assets</li>
              <li><strong>GET</strong> <code>/api/assets/:id</code> - Get asset details</li>
              <li><strong>PATCH</strong> <code>/api/assets/:id/workflow</code> - Update ruleflow</li>
            </ul>
            
            <h3>Test the API:</h3>
            <p>Open your browser's developer console and try:</p>
            <pre><code>fetch('/api/auth/user').then(r => r.json()).then(console.log)</code></pre>
            
            <p class="warning">⚠️ This is a backend-only mode. For the full application experience with the React frontend, you'll need to set up the complete development environment.</p>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Verify your database connection is working</li>
              <li>Test API endpoints using tools like Postman or curl</li>
              <li>Consider setting up the full development environment for frontend access</li>
            </ol>
          </div>
        </body>
        </html>
      `);
        } else {
            res.status(404).json({ message: "API endpoint not found" });
        }
    });

    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({
        port,
        host: "0.0.0.0",
    }, () => {
        console.log(`[standalone] Server running on http://localhost:${port}`);
        console.log(`[standalone] API available at http://localhost:${port}/api/`);
        console.log(`[standalone] Test with: curl http://localhost:${port}/api/auth/user`);
    });
})();
