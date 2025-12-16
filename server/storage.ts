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

export class Storage {
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

    const columnMap = {
      reading: "readingSeconds",
      watching: "watchingSeconds",
      playing: "playSeconds",
    } as const;

    const column = columnMap[activityType];

    if (existing) {
      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      };
      updateData[column] = sql`${userDailyActivity[column]} + ${seconds}`;
      
      await db.update(userDailyActivity)
        .set(updateData)
        .where(eq(userDailyActivity.id, existing.id));

      const [updated] = await db.select()
        .from(userDailyActivity)
        .where(eq(userDailyActivity.id, existing.id));
      return updated;
    } else {
      const insertData: Record<string, any> = {
        userId,
        activityDate: today,
        readingSeconds: 0,
        watchingSeconds: 0,
        playSeconds: 0,
      };
      insertData[column] = seconds;

      const [newActivity] = await db.insert(userDailyActivity)
        .values(insertData as any)
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

export const storage = new Storage();
