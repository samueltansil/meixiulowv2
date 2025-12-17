# NewsPals - Kids News Platform

## Overview
NewsPals is a full-stack web application providing a safe, engaging, and educational news platform for children. It offers articles, videos, and games within a kid-friendly interface, featuring custom mascots and playful design. The platform aims to educate and entertain, with future plans for a teacher-contributed coursework marketplace and a comprehensive activity and points system to encourage engagement.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Frameworks**: React 18 with TypeScript, Vite for bundling, Wouter for routing.
- **UI/UX**: shadcn/ui (New York style), Radix UI, TailwindCSS v4 for styling and theming, custom fonts (Fredoka, Quicksand), Framer Motion for animations.
- **State Management**: TanStack Query v5 for server state and caching, React Hook Form with Zod for form validation.
- **Design Principles**: Component-based, mobile-first, responsive design, custom hooks for common functionalities (e.g., authentication, UI state).

### Backend
- **Framework**: Express.js with Node.js and TypeScript.
- **Authentication**: Email/password login with bcrypt, `express-session` with PostgreSQL store (connect-pg-simple).
- **API Design**: RESTful endpoints under `/api`, authenticated routes using `isAuthenticated` middleware.
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations, `node-postgres` for connection pooling.
- **Middleware**: JSON/URL-encoded body parsing, custom logging, static file serving.
- **Development**: Vite integration for HMR.

### Data Storage
- **Database**: PostgreSQL as the primary relational database.
- **Schema Design**:
    - **Users**: UUID, email, name, profile image, subscription status, total points, activity tracking, email verification, marketing preferences, user role.
    - **Videos**: Content metadata, media URLs, view counts, linked to users.
    - **Subscriptions**: Plan details, Stripe integration fields, linked to users.
    - **Sessions**: PostgreSQL-backed session data.
    - **Coursework Items**: Teacher-uploaded educational materials, including type, subject, file/link, price, linked to users.
    - **Story Games**: Mini-game templates (Puzzle, Whack-a-Mole, Memory Match, Quiz, Timeline) with configurable JSONB for game-specific settings, linked to stories.
    - **User Daily Activity**: Tracks reading, watching, and play time daily per user (Singapore timezone).
    - **User Points Ledger**: Records points changes with source and balance.
    - **User Game Completions**: Stores game scores and awarded points.
- **Data Access**: Repository pattern via `DatabaseStorage` class, Drizzle ORM, atomic operations, query builders.

### Mini-Games System
- **Templates**: 5 customizable mini-game templates (Puzzle, Whack-a-Mole, Memory Match, Quiz, Timeline).
- **Scoring**: Standardized 0-100 scoring, minimum 10 points, awards proportional points.
- **Audio**: `useGameAudio` hook for background music and sound effects.
- **Admin**: CRUD operations for games via `/api/admin/games` (password protected).
- **Public**: List, detail, and completion endpoints for games.

### Teacher Coursework Marketplace
- **User Roles**: Teachers can upload and sell, Students can browse and "purchase".
- **Coursework Types**: Supports various educational materials (PDF, Unit Plan, Video, Quiz, etc.).
- **Subjects**: Wide range of academic subjects.
- **Monetization**: Placeholder system for teacher earnings and platform commission.
- **API**: Public endpoints for browsing marketplace, teacher profiles, and leaderboards. Protected endpoints for teacher dashboard and coursework management.

### Email Verification & User Settings
- **User Schema Extensions**: `emailVerified`, `emailVerificationToken`, `agreedToTerms`, notification opt-ins.
- **Registration Flow**: Requires agreement to Terms of Service.
- **Settings Features**: Profile editing, notification toggles, privacy policy viewing.
- **API**: Endpoints for profile updates, password changes, notification preferences.
- **Email Verification**: Infrastructure ready for token-based email verification using Resend API.

### Activity Tracking & Points System
- **Tracking**: Monitors user reading, watching, and playing time daily.
- **Timezone**: Uses Asia/Singapore timezone for daily activity reset.
- **Points**: `user_points_ledger` tracks all points changes, `total_points` cached in `users` table.
- **Game Completion**: Records game scores and awarded points in `user_game_completions`.
- **API**: Endpoints for tracking activity, retrieving daily activity, and getting user points.
- **Client-Side Tracking**: Injected script in `dist/public/index.html` handles:
  - Points polling every 10 seconds with automatic navbar updates
  - Fetch interception to refresh points after game completion
  - URL-based activity detection (stories=reading, games=playing, videos=watching)
  - Activity time submission on page navigation and browser close
  - Global `window.whypalsTracker` object for manual control

## Recent Changes (December 2025)
- **Full Portability Migration**: Removed all Replit-specific dependencies
  - Removed Replit Vite plugins (@replit/vite-plugin-cartographer, dev-banner, runtime-error-modal)
  - Replaced Replit OIDC authentication with email/password login using bcrypt
  - Created portable server/auth.ts with PostgreSQL session storage via connect-pg-simple
  - Updated all route handlers to use session-based auth (req.session.userId)
  - Fixed activity tracking SQL query to match schema field names
- **Source-Based Rebuild**: Restored fully portable development and build setup
  - Created frontend entry files: `client/index.html`, `client/src/main.tsx`, `client/src/App.tsx`
  - New TypeScript backend in `server/` replaces legacy bundled artifact
  - All npm scripts are now functional and portable
- Added client-side activity tracking script to fix points display not updating after game completion
- Created React hooks (`useActivityTracker`, `usePoints`, `useActivity`) for source code integration
- Set up server infrastructure files (db.ts, storage.ts, routes.ts) for enhanced tracking

## Development & Build

### Commands
- `npm run dev` - Start development (frontend + backend concurrently)
- `npm run build` - Build both client and server for production
- `npm run start` - Run production server
- `npm run db:push` - Push database schema changes

### Architecture
- **Frontend**: React + Vite, builds to `client/dist/`
- **Backend**: Express + TypeScript, builds to `server/dist/`
- **Dev Mode**: Vite serves on port 5000, proxies API to backend on port 3001
- **Prod Mode**: Express serves static files from `client/dist/` on port 5000

### Environment Variables
See `.env.example` for all required variables including:
- Database: `DATABASE_URL`, `NEON_DATABASE_URL`
- Session: `SESSION_SECRET`
- Storage: `R2_*` variables
- APIs: `ELEVENLABS_API_KEY`

## External Dependencies

- **Authentication**: Email/password with bcrypt (portable, no external dependencies).
- **Payment Processing**: Stripe (prepared for subscription management, placeholder implementation).
- **UI Libraries**: shadcn/ui, Radix UI, Lucide React (icons), date-fns, class-variance-authority (CVA), clsx, tailwind-merge.
- **Development Tools**: TypeScript, ESBuild.
- **Asset Management**: Google Fonts (Fredoka, Quicksand).

## Portability

This project is fully portable and can run on any standard Node.js environment with PostgreSQL:
- No Replit-specific dependencies or plugins
- Standard email/password authentication with PostgreSQL session storage
- All environment variables are standard (DATABASE_URL, SESSION_SECRET, etc.)
- Build scripts work on any platform: `npm run build && npm run start`