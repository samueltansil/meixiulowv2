import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

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

export function registerActivityRoutes(app: Express) {
  app.get("/api/activity/today", isAuthenticated, async (req, res) => {
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

      const activity = await storage.trackActivity(userId, activityType, Math.round(seconds));
      res.json(activity);
    } catch (error) {
      console.error("Error tracking activity:", error);
      res.status(500).json({ message: "Failed to track activity" });
    }
  });

  app.get("/api/activity/history", isAuthenticated, async (req, res) => {
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

  app.get("/api/points", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const points = await storage.getUserPoints(userId);
      res.json({ points });
    } catch (error) {
      console.error("Error fetching points:", error);
      res.status(500).json({ message: "Failed to fetch points" });
    }
  });

  app.get("/api/points/history", isAuthenticated, async (req, res) => {
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

  app.post("/api/games/:id/complete", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const gameId = parseInt(req.params.id);
      const { score } = req.body;

      if (typeof score !== "number" || score < 0 || score > 100) {
        return res.status(400).json({ message: "Invalid score" });
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
}
