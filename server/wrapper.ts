import express, { Express } from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { pool, db } from "./db";
import { registerEnhancedRoutes } from "./enhanced-routes";
import connectPgSimple from "connect-pg-simple";
import { createServer as createViteServer } from "vite";
import { eq, and, sql } from "drizzle-orm";
import {
  users,
  userDailyActivity,
  userPointsLedger,
  userGameCompletions,
  storyGames,
  videos,
  sessions,
} from "../shared/schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      const body = res.statusCode >= 400 ? "" : "";
      console.log(
        `${new Date().toLocaleTimeString()} [express] ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`
      );
    }
  });
  next();
});

registerEnhancedRoutes(app);

function getSingaporeDate(): string {
  const now = new Date();
  const sgOffset = 8 * 60;
  const utcOffset = now.getTimezoneOffset();
  const sgTime = new Date(now.getTime() + (sgOffset + utcOffset) * 60000);
  return sgTime.toISOString().split("T")[0];
}

function getUserId(req: express.Request): string | null {
  const user = (req as any).user;
  if (user?.claims?.sub) return user.claims.sub;
  if (user?.id) return user.id;
  if ((req.session as any)?.passport?.user) return (req.session as any).passport.user;
  return null;
}

function isAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  (req as any).userId = userId;
  next();
}

app.get("/api/activity/today", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const today = getSingaporeDate();
    const [activity] = await db.select()
      .from(userDailyActivity)
      .where(and(
        eq(userDailyActivity.userId, userId),
        eq(userDailyActivity.activityDate, today)
      ));
    res.json(activity || { 
      readingSeconds: 0, 
      watchingSeconds: 0, 
      playSeconds: 0 
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
});

app.post("/api/activity/track", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { activityType, seconds } = req.body;

    if (!["reading", "watching", "playing"].includes(activityType)) {
      return res.status(400).json({ message: "Invalid activity type" });
    }

    if (typeof seconds !== "number" || seconds <= 0) {
      return res.status(400).json({ message: "Invalid seconds value" });
    }

    const today = getSingaporeDate();
    const [existing] = await db.select()
      .from(userDailyActivity)
      .where(and(
        eq(userDailyActivity.userId, userId),
        eq(userDailyActivity.activityDate, today)
      ));

    let result;
    if (existing) {
      const updates: Record<string, any> = { updatedAt: new Date() };
      
      if (activityType === "reading") {
        updates.readingSeconds = sql`${userDailyActivity.readingSeconds} + ${Math.round(seconds)}`;
      } else if (activityType === "watching") {
        updates.watchingSeconds = sql`${userDailyActivity.watchingSeconds} + ${Math.round(seconds)}`;
      } else if (activityType === "playing") {
        updates.playSeconds = sql`${userDailyActivity.playSeconds} + ${Math.round(seconds)}`;
      }

      await db.update(userDailyActivity)
        .set(updates)
        .where(eq(userDailyActivity.id, existing.id));

      [result] = await db.select()
        .from(userDailyActivity)
        .where(eq(userDailyActivity.id, existing.id));
    } else {
      [result] = await db.insert(userDailyActivity)
        .values({
          userId,
          activityDate: today,
          readingSeconds: activityType === "reading" ? Math.round(seconds) : 0,
          watchingSeconds: activityType === "watching" ? Math.round(seconds) : 0,
          playSeconds: activityType === "playing" ? Math.round(seconds) : 0,
        })
        .returning();
    }
    
    res.json(result);
  } catch (error) {
    console.error("Error tracking activity:", error);
    res.status(500).json({ message: "Failed to track activity" });
  }
});

app.get("/api/points", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    res.json({ points: user?.totalPoints ?? 0 });
  } catch (error) {
    console.error("Error fetching points:", error);
    res.status(500).json({ message: "Failed to fetch points" });
  }
});

app.post("/api/games/:id/complete", isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const gameId = parseInt(req.params.id);
    const { score, gameTimeSeconds } = req.body;

    if (typeof score !== "number" || score < 0 || score > 100) {
      return res.status(400).json({ message: "Invalid score" });
    }

    const [game] = await db.select().from(storyGames).where(eq(storyGames.id, gameId));
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    const pointsReward = game.pointsReward ?? 10;
    const pointsAwarded = Math.round((score / 100) * pointsReward);

    await db.insert(userGameCompletions).values({
      userId,
      gameId,
      score,
      pointsAwarded,
    });

    const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
    const currentPoints = currentUser?.totalPoints ?? 0;
    const newBalance = currentPoints + pointsAwarded;

    await db.update(users)
      .set({ 
        totalPoints: newBalance,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    await db.insert(userPointsLedger).values({
      userId,
      pointsDelta: pointsAwarded,
      sourceType: "game_completion",
      sourceId: gameId,
      balanceAfter: newBalance,
    });

    if (gameTimeSeconds && typeof gameTimeSeconds === "number" && gameTimeSeconds > 0) {
      const today = getSingaporeDate();
      const [existing] = await db.select()
        .from(userDailyActivity)
        .where(and(
          eq(userDailyActivity.userId, userId),
          eq(userDailyActivity.activityDate, today)
        ));

      if (existing) {
        await db.update(userDailyActivity)
          .set({ 
            playSeconds: sql`${userDailyActivity.playSeconds} + ${Math.round(gameTimeSeconds)}`,
            updatedAt: new Date()
          })
          .where(eq(userDailyActivity.id, existing.id));
      } else {
        await db.insert(userDailyActivity).values({
          userId,
          activityDate: today,
          readingSeconds: 0,
          watchingSeconds: 0,
          playSeconds: Math.round(gameTimeSeconds),
        });
      }
    }

    res.json({
      pointsEarned: pointsAwarded,
      totalPoints: newBalance,
      score,
      message: `You earned ${pointsAwarded} points!`,
    });
  } catch (error) {
    console.error("Error completing game:", error);
    res.status(500).json({ message: "Failed to complete game" });
  }
});

if (process.env.NODE_ENV === "production") {
  const publicPath = path.join(__dirname, "..", "dist", "public");
  app.use(express.static(publicPath));
  
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(publicPath, "index.html"));
    }
  });
} else {
  (async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  })();
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`${new Date().toLocaleTimeString()} [express] serving on port ${PORT}`);
});

export default app;
