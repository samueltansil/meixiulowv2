# WhyPals - Kids Educational Platform

WhyPals is a full-stack web application providing a safe, engaging, and educational news platform for children. It offers articles, videos, and games within a kid-friendly interface, featuring custom mascots and playful design.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (copy and edit)
cp .env.example .env

# Push database schema
npm run db:push

# Development
npm run dev

# Production
npm run build
npm start
```

---

## Project Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS v4, shadcn/ui, Wouter (routing)
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Email/password with bcrypt, express-session, PostgreSQL session storage

### Directory Structure
```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   └── lib/          # Utilities
│   └── dist/             # Production build output
├── server/               # Backend Express application
│   ├── auth.ts           # Authentication setup
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   ├── static.ts         # Static file serving
│   └── dist/             # Production build output
├── shared/               # Shared code (schema, types)
│   └── schema.ts         # Drizzle database schema
├── attached_assets/      # Uploaded files and assets
└── migrations/           # Database migrations
```

---

## Environment Variables

Create a `.env` file in the project root. Reference `.env.example` for the template.

### Required

| Variable | Description | Used By |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Drizzle ORM, session storage |
| `SESSION_SECRET` | Session encryption key (32+ characters recommended) | express-session middleware |

### Optional

| Variable | Description | Used By |
|----------|-------------|---------|
| `NEON_DATABASE_URL` | Alternative PostgreSQL URL (takes precedence over DATABASE_URL) | Database connection |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID | File upload service |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key | File upload service |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key | File upload service |
| `R2_BUCKET_NAME` | Cloudflare R2 bucket name | File upload service |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | Text-to-speech feature |
| `ADMIN_PASSWORD` | Admin panel access password | Admin routes protection |
| `NODE_ENV` | Environment mode (`development` or `production`) | Server behavior |
| `PORT` | Server port (default: 5000) | Express server |

---

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (frontend + backend concurrently) |
| `npm run build` | Build both client and server for production |
| `npm start` | Run production server |
| `npm run dev:client` | Start Vite dev server only |
| `npm run dev:server` | Start backend dev server only |
| `npm run build:client` | Build frontend only |
| `npm run build:server` | Build backend only |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run check` | TypeScript type checking |

---

## Development

### Prerequisites
- Node.js 20.x or later
- PostgreSQL 15+ (local or cloud: Neon, Supabase, Railway, etc.)

### Running Locally
1. Clone the repository
2. Run `npm install`
3. Create `.env` file with at least `DATABASE_URL` and `SESSION_SECRET`
4. Run `npm run db:push` to create database tables
5. Run `npm run dev`
6. Open http://localhost:5000

### Development Mode Behavior
- Vite serves frontend on port 5000 with HMR
- Backend runs on port 3001
- Vite proxies `/api/*` requests to backend

---

## Production Deployment

### Build and Run
```bash
npm install
npm run build
npm start
```

### Server Configuration
- Server binds to `0.0.0.0:PORT` (default PORT=5000)
- Static files served from `client/dist/`
- All `/api/*` routes handled by Express

### Process Management (Optional)
```bash
# Using PM2
pm2 start npm --name "whypals" -- start

# Using systemd (create service file)
# ExecStart=/usr/bin/node /path/to/server/dist/index.cjs
```

### Deployment Platforms
This project can be deployed on any Node.js hosting:
- **Vercel** (with serverless adapter)
- **Railway**
- **Render**
- **DigitalOcean App Platform**
- **AWS EC2/ECS**
- **Any VPS with Node.js**

---

## Database

### Schema Overview
- **users**: User accounts, profiles, points, roles
- **stories**: News articles and educational content
- **videos**: Video content with view tracking
- **story_games**: Mini-games (puzzle, quiz, memory match, etc.)
- **user_daily_activity**: Daily reading/watching/playing time tracking
- **user_points_ledger**: Points transaction history
- **user_game_completions**: Game scores and awards
- **coursework_items**: Teacher marketplace content
- **session**: PostgreSQL session storage

### Migrations
```bash
# Push schema changes to database
npm run db:push

# Force push (use carefully)
npm run db:push --force
```

---

## Features

### For Kids
- Educational news stories with kid-friendly content
- Interactive mini-games (Puzzle, Whack-a-Mole, Memory Match, Quiz, Timeline)
- Video content library
- Points and rewards system
- Activity tracking (reading, watching, playing time)

### For Teachers
- Coursework marketplace
- Upload educational materials
- Teacher verification system

### Admin Panel
- Content management (stories, videos, games)
- User management
- Protected by ADMIN_PASSWORD

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Content
- `GET /api/stories` - List stories
- `GET /api/stories/:slug` - Get story
- `GET /api/videos` - List videos
- `GET /api/games` - List games

### Activity & Points
- `POST /api/activity/track` - Track activity time
- `GET /api/activity/today` - Get today's activity
- `GET /api/points` - Get user points
- `POST /api/games/:id/complete` - Complete game and earn points

---

## Portability Notes

This project is fully portable and has no vendor lock-in:

- **No proprietary authentication** - Uses standard bcrypt + express-session
- **Standard database** - PostgreSQL with Drizzle ORM
- **Standard build tools** - Vite, esbuild, TypeScript
- **All dependencies** - Available on npm

### Files Safe to Ignore/Delete When Exporting
- `.replit` - Replit workspace config (excluded from git)
- `.cache/` - Build cache (excluded from git)
- `replit.md` - Project documentation (can rename/keep)

---

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format: `postgresql://user:password@host:5432/database`
- Ensure PostgreSQL server is running
- Check network/firewall allows connection

### Session Issues
- Ensure `SESSION_SECRET` is set (32+ characters)
- Check PostgreSQL connection for session storage
- Clear browser cookies if login persists incorrectly

### Build Errors
- Run `npm install` to ensure all dependencies installed
- Check Node.js version (20.x required)
- Clear `node_modules` and reinstall if issues persist

---

## License

MIT License
