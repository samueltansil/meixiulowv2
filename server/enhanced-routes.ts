import { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import {
  users,
  userDailyActivity,
  userPointsLedger,
  userGameCompletions,
  storyGames,
} from "../shared/schema";

function getSingaporeDate(): string {
  const now = new Date();
  const sgOffset = 8 * 60;
  const utcOffset = now.getTimezoneOffset();
  const sgTime = new Date(now.getTime() + (sgOffset + utcOffset) * 60000);
  return sgTime.toISOString().split("T")[0];
}

function getUserId(req: Request): string | null {
  const user = (req as any).user;
  if (user?.claims?.sub) return user.claims.sub;
  if (user?.id) return user.id;
  if ((req.session as any)?.passport?.user) return (req.session as any).passport.user;
  return null;
}

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  (req as any).userId = userId;
  next();
}

export class EnhancedStorage {
  async getUser(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  }

  async getUserPoints(userId: string): Promise<number> {
    const user = await this.getUser(userId);
    return user?.totalPoints ?? 0;
  }

  async addUserPoints(userId: string, points: number, sourceType: string, sourceId?: number) {
    const currentPoints = await this.getUserPoints(userId);
    const newBalance = currentPoints + points;

    await db.update(users)
      .set({ 
        totalPoints: newBalance,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    await db.insert(userPointsLedger).values({
      userId,
      pointsDelta: points,
      sourceType,
      sourceId: sourceId ?? null,
      balanceAfter: newBalance,
    });

    return { totalPoints: newBalance, pointsAdded: points };
  }

  async getTodayActivity(userId: string) {
    const today = getSingaporeDate();
    const [activity] = await db.select()
      .from(userDailyActivity)
      .where(and(
        eq(userDailyActivity.userId, userId),
        eq(userDailyActivity.activityDate, today)
      ));
    return activity;
  }

  async trackActivity(userId: string, activityType: "reading" | "watching" | "playing", seconds: number) {
    const today = getSingaporeDate();
    const existing = await this.getTodayActivity(userId);

    if (existing) {
      const updates: Record<string, any> = { updatedAt: new Date() };
      
      if (activityType === "reading") {
        updates.readingSeconds = sql`${userDailyActivity.readingSeconds} + ${seconds}`;
      } else if (activityType === "watching") {
        updates.watchingSeconds = sql`${userDailyActivity.watchingSeconds} + ${seconds}`;
      } else if (activityType === "playing") {
        updates.playSeconds = sql`${userDailyActivity.playSeconds} + ${seconds}`;
      }

      await db.update(userDailyActivity)
        .set(updates)
        .where(eq(userDailyActivity.id, existing.id));

      const [updated] = await db.select()
        .from(userDailyActivity)
        .where(eq(userDailyActivity.id, existing.id));
      return updated;
    } else {
      const insertData: any = {
        userId,
        activityDate: today,
        readingSeconds: activityType === "reading" ? seconds : 0,
        watchingSeconds: activityType === "watching" ? seconds : 0,
        playSeconds: activityType === "playing" ? seconds : 0,
      };

      const [newActivity] = await db.insert(userDailyActivity)
        .values(insertData)
        .returning();
      return newActivity;
    }
  }

  async completeGame(userId: string, gameId: number, score: number) {
    const [game] = await db.select().from(storyGames).where(eq(storyGames.id, gameId));
    if (!game) {
      throw new Error("Game not found");
    }

    const pointsReward = game.pointsReward ?? 10;
    const pointsAwarded = Math.round((score / 100) * pointsReward);

    await db.insert(userGameCompletions).values({
      userId,
      gameId,
      score,
      pointsAwarded,
    });

    const result = await this.addUserPoints(userId, pointsAwarded, "game_completion", gameId);

    return {
      pointsAwarded,
      totalPoints: result.totalPoints,
      score,
    };
  }

  async getPointsHistory(userId: string, limit = 20) {
    return db.select()
      .from(userPointsLedger)
      .where(eq(userPointsLedger.userId, userId))
      .orderBy(sql`${userPointsLedger.createdAt} DESC`)
      .limit(limit);
  }

  async getActivityHistory(userId: string, days = 7) {
    return db.select()
      .from(userDailyActivity)
      .where(eq(userDailyActivity.userId, userId))
      .orderBy(sql`${userDailyActivity.activityDate} DESC`)
      .limit(days);
  }
}

const storage = new EnhancedStorage();

export function registerEnhancedRoutes(app: Express) {
  app.get("/api/v2/activity/today", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const activity = await storage.getTodayActivity(userId);
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

  app.post("/api/v2/activity/track", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { activityType, seconds } = req.body;

      if (!["reading", "watching", "playing"].includes(activityType)) {
        return res.status(400).json({ message: "Invalid activity type" });
      }

      if (typeof seconds !== "number" || seconds <= 0) {
        return res.status(400).json({ message: "Invalid seconds value" });
      }

      const activity = await storage.trackActivity(userId, activityType, Math.round(seconds));
      res.json(activity);
    } catch (error) {
      console.error("Error tracking activity:", error);
      res.status(500).json({ message: "Failed to track activity" });
    }
  });

  app.get("/api/v2/activity/history", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const days = parseInt(req.query.days as string) || 7;
      const history = await storage.getActivityHistory(userId, days);
      res.json(history);
    } catch (error) {
      console.error("Error fetching activity history:", error);
      res.status(500).json({ message: "Failed to fetch activity history" });
    }
  });

  app.get("/api/v2/points", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const points = await storage.getUserPoints(userId);
      res.json({ points });
    } catch (error) {
      console.error("Error fetching points:", error);
      res.status(500).json({ message: "Failed to fetch points" });
    }
  });

  app.get("/api/v2/points/history", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const limit = parseInt(req.query.limit as string) || 20;
      const history = await storage.getPointsHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching points history:", error);
      res.status(500).json({ message: "Failed to fetch points history" });
    }
  });

  app.post("/api/v2/games/:id/complete", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const gameId = parseInt(req.params.id);
      const { score, gameTimeSeconds } = req.body;

      if (typeof score !== "number" || score < 0 || score > 100) {
        return res.status(400).json({ message: "Invalid score" });
      }

      if (gameTimeSeconds && typeof gameTimeSeconds === "number" && gameTimeSeconds > 0) {
        await storage.trackActivity(userId, "playing", Math.round(gameTimeSeconds));
      }

      const result = await storage.completeGame(userId, gameId, score);
      res.json({
        pointsEarned: result.pointsAwarded,
        totalPoints: result.totalPoints,
        score: result.score,
        message: `You earned ${result.pointsAwarded} points!`,
      });
    } catch (error) {
      console.error("Error completing game:", error);
      res.status(500).json({ message: "Failed to complete game" });
    }
  });

  app.get("/api/v2/user/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const points = await storage.getUserPoints(userId);
      const activity = await storage.getTodayActivity(userId);
      
      res.json({
        points,
        todayActivity: activity || {
          readingSeconds: 0,
          watchingSeconds: 0,
          playSeconds: 0,
        },
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });
}
