# Replit.md

## Overview

This is a modern web-based business rules management system built as a replacement for the Eclipse-based Corticon Studio. The application provides comprehensive project management, real-time collaboration, and powerful editing capabilities for business rules. It follows a full-stack architecture with a React frontend, Express backend, and PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application uses a monolithic full-stack architecture with clear separation between client and server code:

- **Frontend**: React with TypeScript, using Vite for build tooling
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OAuth integration
- **UI Framework**: shadcn/ui components with Tailwind CSS and comprehensive dark/light mode theming
- **State Management**: TanStack Query for server state

## Key Components

### Frontend Architecture
- **Client Directory Structure**: All frontend code is organized under `client/src/`
- **Component System**: Uses shadcn/ui component library with custom theming
- **Routing**: Uses Wouter for client-side routing
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Code Editor**: Monaco Editor integration for rule editing with visual ruleflow editor
- **Drag and Drop**: Cross-browser HTML5 drag-and-drop API implementation with Firefox optimizations
- **State Management**: TanStack Query for API calls and caching

### Backend Architecture
- **Server Structure**: Express.js application with modular route organization
- **Database Layer**: Drizzle ORM with type-safe database operations
- **Authentication**: Replit OAuth with session management
- **API Design**: RESTful endpoints with proper error handling
- **Development Server**: Vite integration for development mode

### Recent Updates  
- **February 4, 2025**: RESOLVED data persistence issue - ruleflow edits now save and load properly when reopening assets
- **February 4, 2025**: Fixed API response parsing in asset loading - now correctly extracts JSON data from Response objects
- **February 4, 2025**: Enhanced asset opening to fetch complete data with structuralData and uiData from individual asset endpoint
- **February 4, 2025**: Successfully implemented fixed tool palette positioning - palette now anchored to ruleflow editor container outside scrollable viewport area
- **February 4, 2025**: Fixed scrolling feedback loop issue with one-time scroll position initialization to prevent dynamic interference with normal scrolling behavior
- **February 4, 2025**: Enabled always-visible scrollbars with overflow:scroll for proper horizontal and vertical canvas navigation
- **February 4, 2025**: Completed stable viewport/canvas architecture - tool palette remains fixed while canvas content scrolls smoothly beneath it
- **February 4, 2025**: Successfully implemented viewport/canvas architecture - separated scrollable viewport from large virtual canvas for scalability
- **February 4, 2025**: Updated mouse coordinate calculations and drag/drop interactions to work with new viewport/canvas coordinate system
- **February 4, 2025**: Enhanced database schema with viewport scroll position (scrollX, scrollY) and canvas dimensions for viewport state persistence
- **February 4, 2025**: Implemented zoom-to-fit functionality - automatically calculates optimal zoom level to display all nodes with 50px padding
- **February 4, 2025**: Fixed canvas boundary clipping using CSS overflow-hidden instead of node repositioning to maintain exact layout integrity
- **February 4, 2025**: Added zoom-to-fit tool to palette with visual icon showing nodes in frame, constrains zoom within 50%-200% limits
- **February 4, 2025**: Enhanced zoom persistence system with one-time initialization to prevent circular dependency issues
- **February 4, 2025**: Resolved runtime errors related to function scope ordering and lexical declarations in zoom system
- **January 31, 2025**: Implemented zoom level persistence - zoom settings saved in database and restored when opening ruleflows
- **January 31, 2025**: Added comprehensive zoom controls with isolated tool palette (unaffected by canvas zoom)
- **January 31, 2025**: Enhanced mouse coordinate adjustments for all interactions at any zoom level (50%-200%)
- **January 31, 2025**: Implemented canvas boundary checking - nodes cannot be moved outside canvas edges
- **January 31, 2025**: Added font size controls for text nodes with + and - buttons on left side
- **January 31, 2025**: Fixed font size functionality - changes now properly apply to text display and save to database
- **January 31, 2025**: Enhanced optimal positioning algorithm with canvas dimension awareness for all node creation
- **January 31, 2025**: Implemented node deletion functionality with automatic connection cleanup
- **January 31, 2025**: Added delete icons to nodes (red X in bottom-right corner, visible on hover)
- **January 31, 2025**: Fixed tab switching issue - deleted nodes no longer reappear when switching tabs
- **January 31, 2025**: Enhanced data synchronization between tab state and database for real-time updates
- **January 31, 2025**: Implemented complete workflow persistence system with separated structural and UI data in JSON format
- **January 31, 2025**: Added database schema for storing ruleflow structural data (nodes, connections, business logic) and UI data (positions, styling)
- **January 31, 2025**: Created comprehensive Zod schemas for data validation and type safety
- **January 31, 2025**: Implemented real-time persistence callbacks that automatically save workflow changes to database
- **January 31, 2025**: Added workflow-specific API endpoint (/api/assets/:id/workflow) for efficient data updates
- **January 30, 2025**: Implemented advanced drag-to-connect workflow with proper edge-to-edge connection anchoring for ruleflow nodes
- **January 30, 2025**: Added floating tool palette with select and connector tools, including visual feedback and status bar integration
- **January 30, 2025**: Created mathematical edge calculation algorithm for proper rectangular node connection points
- **January 30, 2025**: Fixed connection rendering with proper SVG positioning and cross-browser compatibility
- **January 30, 2025**: Implemented real-time connection updates when nodes are dragged, maintaining edge anchoring
- **January 2025**: Successfully implemented complete cross-browser drag-and-drop functionality for ruleflow editor
- **January 2025**: Added support for nested ruleflows - can now drag both rulesheets and ruleflows into canvas
- **January 2025**: Created visual differentiation between node types: blue RS icons for rulesheets, purple RF icons for ruleflows
- **January 2025**: Implemented proper node sizing: rulesheets (150x50px), ruleflows (180x60px) for visual hierarchy
- **January 2025**: Fixed and verified complete drag-and-drop workflow in Firefox with proper event handling
- **January 2025**: Created visual drag-and-drop ruleflow editor with grid-based canvas for asset placement
- **January 2025**: Fixed asset type consistency issue between 'rulesheet' and 'rulesheets' in database and code
- **January 2025**: Added comprehensive cross-browser drag event handling with Firefox-specific optimizations
- **January 2025**: Implemented database storage for user preferences (theme and language) with cross-device synchronization
- **January 2025**: Created API endpoint for preference persistence (/api/auth/user/preferences) with dual storage approach
- **January 2025**: Enhanced ThemeContext and LanguageContext to save preferences to both localStorage and database
- **January 2025**: Implemented complete internationalization with support for English, French, German, and Spanish languages
- **January 2025**: Added language selector to avatar dropdown menu with persistent language preferences
- **January 2025**: Created comprehensive translation system with dynamic UI updates when switching languages
- **January 2025**: Implemented complete dark mode/light mode toggle with proper contrast colors throughout application
- **January 2025**: Added theme toggle to avatar dropdown menu with Sun/Moon icons and localStorage persistence
- **January 2025**: Fixed "Close All" button in editor tabs - now properly closes all open tabs instead of just the last one
- **January 2025**: Added unique IDs to all panel components following pattern: descriptive name + "Id" for easier debugging and communication
- **January 2025**: Fixed status bar positioning to remain visible at bottom of viewport using proper flexbox hierarchy
- **January 2025**: Added comprehensive project management with creation, selection, and deletion functionality
- **January 2025**: Enhanced project explorer with project list view and management dialogs

### Database Schema
The system manages four main entity types:
- **Users**: Authentication and profile information with theme/language preferences
- **Projects**: Top-level containers for rule assets
- **Assets**: Individual rule components with separated data structure:
  - `content`: Legacy JSON content for backward compatibility
  - `structuralData`: Business logic data (nodes, connections, rules, conditions)
  - `uiData`: Visual presentation data (positions, colors, fonts, canvas settings)
- **Collaboration Sessions**: Real-time collaboration tracking
- **Sessions**: Authentication session storage

### Workflow Persistence Architecture
- **Structural Data**: Contains business logic elements like node definitions, connection relationships, rule conditions, and execution priorities
- **UI Data**: Stores visual presentation including node positions, connection styling, canvas zoom/pan state, and visual preferences
- **Real-time Sync**: Changes automatically persist to database through dedicated API endpoints with optimistic updates
- **Type Safety**: Full Zod schema validation ensures data integrity across client-server boundaries

### User Preferences System
- **Dual Storage Approach**: Preferences stored in both localStorage (immediate access) and database (persistence)
- **Cross-Device Sync**: User preferences automatically sync across devices when logged in
- **Theme Persistence**: Dark/light mode choice saved to database
- **Language Persistence**: UI language selection saved to database
- **API Integration**: RESTful endpoint for preference updates with error handling

### Authentication System
- **Provider**: Replit OAuth integration
- **Session Management**: PostgreSQL-based session storage
- **Authorization**: Route-level authentication middleware
- **User Management**: Automatic user creation and profile updates

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit OAuth, sessions stored in PostgreSQL
2. **Project Management**: Users can create, read, update, and delete projects
3. **Asset Management**: Each project contains multiple assets (rules, vocabulary, etc.)
4. **Real-time Editing**: Monaco Editor provides syntax highlighting and validation
5. **Collaboration**: Session tracking for multi-user editing (foundation in place)

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **Backend Framework**: Express.js with TypeScript support
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Replit OAuth client libraries

### UI and Styling
- **Component Library**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with PostCSS
- **Icons**: Lucide React icons
- **Code Editor**: Monaco Editor

### Development Tools
- **Build Tool**: Vite for frontend bundling
- **TypeScript**: Full TypeScript support across the stack
- **Database Migrations**: Drizzle Kit for schema management
- **Development**: Hot reload and error overlay integration

## Deployment Strategy

### Build Process
- **Frontend Build**: Vite builds React app to `dist/public`
- **Backend Build**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle handles schema migrations

### Environment Configuration
- **Database**: Requires `DATABASE_URL` environment variable
- **Authentication**: Requires Replit-specific environment variables
- **Sessions**: Requires `SESSION_SECRET` for session encryption

### Production Deployment
- **Static Assets**: Frontend served from `dist/public`
- **API Server**: Express server handles API routes and serves static files
- **Database**: PostgreSQL database with connection pooling
- **Sessions**: Persistent session storage in PostgreSQL

The application is designed to be deployed on Replit's platform but can be adapted for other hosting environments with proper environment variable configuration.