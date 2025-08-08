# Corticon Studio Web

A modern web-based replacement for Eclipse-based Corticon Studio, providing comprehensive project management and editing capabilities for business rules with real-time collaboration features.

## Features

- **Project Management**: Create, organize, and manage rule projects
- **Asset Editor**: Visual ruleflow editor with drag-and-drop functionality
- **Real-time Collaboration**: Multi-user editing capabilities
- **Professional UI**: Modern interface inspired by Visual Studio Code
- **Cross-browser Support**: Works in all modern browsers

## Tech Stack

- **Frontend**: React with TypeScript, Vite, shadcn/ui, Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Optional Replit OAuth (can run without authentication)

## Quick Start

### Running on Replit
The application is designed to run seamlessly on Replit with automatic environment configuration.

### Running Locally

#### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git

#### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd corticon-studio-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   **Windows (Command Prompt):**
   ```cmd
   copy .env.example .env
   ```

   **Windows (PowerShell):**
   ```powershell
   Copy-Item .env.example .env
   ```

   **Linux/Mac:**
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your database credentials using any text editor.

4. **Set up the database**
   ```bash
   # Create a PostgreSQL database and update DATABASE_URL in .env
   npm run db:push
   ```

5. **Start the development server**

   **Option A - Full Development Server (recommended on Replit):**
   ```bash
   npm run dev
   ```

   **Option B - Standalone Server (for Windows/local development):**
   ```cmd
   npx cross-env NODE_ENV=development tsx server/standalone.ts
   ```

   **Option C - PowerShell:**
   ```powershell
   $env:NODE_ENV="development"; npx tsx server/standalone.ts
   ```

## Frontend Development

### Option A: Full Stack on Replit
The application will be available at `http://localhost:5000`

### Option B: Separate Frontend + Backend (Windows/Local)

1. **Start the backend server** (in one terminal):
   ```cmd
   npx cross-env NODE_ENV=development tsx server/standalone.ts
   ```

2. **Start the frontend development server** (in another terminal):
   ```cmd
   npx tsx frontend-dev.js
   ```

The frontend will be available at `http://localhost:3000` and will proxy API calls to the backend at `http://localhost:5000`

### Option C: Manual Frontend Setup

If the automated frontend setup doesn't work, you can manually serve the client files:

1. **Build the frontend**:
   ```cmd
   npm run build
   ```

2. **Serve static files** (using any static server):
   ```cmd
   npx serve dist/public -p 3000
   ```

### Troubleshooting

#### Common Windows Issues

1. **PowerShell Execution Policy Error**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Node.js PATH Issues**
    - Restart your terminal/command prompt after installing Node.js
    - Verify installation: `node --version` and `npm --version`

3. **Long Path Names (Windows)**
    - Enable long paths in Windows if you get path length errors:
   ```cmd
   # Run as Administrator
   git config --system core.longpaths true
   ```

#### General Issues

1. **Vite configuration issues outside Replit**:
   If you get `import.meta.dirname` errors, use the standalone server:

   **Windows (Command Prompt):**
   ```cmd
   npx cross-env NODE_ENV=development tsx server/standalone.ts
   ```

   **Windows (PowerShell):**
   ```powershell
   $env:NODE_ENV="development"; npx tsx server/standalone.ts
   ```

   **This runs the backend API server without Vite frontend bundling.**

2. **Alternative Windows approaches**:

   **Option 1 - Set environment variable first:**
   ```cmd
   set NODE_ENV=development
   npx tsx server/index.ts
   ```

   **Option 2 - Use PowerShell:**
   ```powershell
   $env:NODE_ENV="development"
   npx tsx server/index.ts
   ```

3. **Make sure you're in the project root directory** where `package.json` is located

4. **Database connection issues**:
    - Verify PostgreSQL is running
    - Check DATABASE_URL format: `postgresql://username:password@localhost:5432/database_name`
    - Ensure the database exists before running `npm run db:push`

5. **Port conflicts**:
    - Backend uses port 5000, frontend uses port 3000
    - If port 5000 is busy, change PORT in `.env` file
    - If port 3000 is busy, modify the port in `frontend-dev.js`

6. **Frontend not loading**:
    - Make sure both backend (port 5000) and frontend (port 3000) are running
    - Check that API proxy is working: `http://localhost:3000/api/auth/user`
    - Clear browser cache if experiencing issues

## Environment Configuration

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
  ```
  # Example format:
  DATABASE_URL=postgresql://username:password@localhost:5432/corticon_studio
  ```

### Optional Variables
- `SESSION_SECRET` - Session encryption key (auto-generated if not provided)
- `PORT` - Server port (defaults to 5000)
- `NODE_ENV` - Environment mode (development/production)

### Authentication (Optional)
The application runs without authentication by default, using a test user. To enable Replit OAuth:
- `REPL_ID` - Your Replit app ID
- `REPLIT_DOMAINS` - Allowed domains for OAuth callbacks
- `ISSUER_URL` - OAuth issuer URL

### Windows-Specific Notes
- Use double quotes around environment variable values if they contain special characters
- PostgreSQL service must be running (check Windows Services or use `pg_ctl status`)
- If using WSL, ensure PostgreSQL is accessible from Windows

## Development Mode

By default, the application runs in development mode with:
- A test user automatically logged in
- No authentication required
- Memory-based sessions
- Hot reload enabled

## Database Schema

The application uses the following main entities:
- **Users**: Authentication and profile information
- **Projects**: Top-level containers for rule assets
- **Assets**: Individual rule components (rulesheets, ruleflows, etc.)
- **Sessions**: Authentication session storage

## API Endpoints

- `GET /api/auth/user` - Get current user information
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id/assets` - List project assets
- `POST /api/projects/:id/assets` - Create new asset
- `GET /api/assets/:id` - Get asset details
- `PATCH /api/assets/:id/workflow` - Update ruleflow data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Add your license information here]
