import { pgTable, varchar, text, boolean, timestamp, integer, serial, jsonb, uuid, date, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  profileImage: text("profile_image"),
  isSubscribed: boolean("is_subscribed").default(false),
  plan: varchar("plan", { length: 50 }),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  userRole: varchar("user_role", { length: 20 }),
  bio: text("bio"),
  subjectsTaught: text("subjects_taught"),
  experienceYears: integer("experience_years"),
  reputationScore: integer("reputation_score").default(0),
  totalSales: integer("total_sales").default(0),
  totalPoints: integer("total_points").default(0),
  points: integer("points").default(0),
  badges: jsonb("badges"),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  emailVerificationExpiry: timestamp("email_verification_expiry"),
  agreedToTerms: boolean("agreed_to_terms").default(false),
  agreedToTermsAt: timestamp("agreed_to_terms_at"),
  marketingEmailsOptIn: boolean("marketing_emails_opt_in").default(false),
  contentAlertsOptIn: boolean("content_alerts_opt_in").default(true),
  teacherUpdatesOptIn: boolean("teacher_updates_opt_in").default(false),
  teacherVerificationStatus: varchar("teacher_verification_status", { length: 50 }),
  verificationRequestedAt: timestamp("verification_requested_at"),
  passwordHash: varchar("password_hash", { length: 255 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  duration: integer("duration"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  viewCount: integer("view_count").default(0),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  plan: varchar("plan", { length: 50 }),
  price: integer("price"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  status: varchar("status", { length: 50 }),
  renewalDate: timestamp("renewal_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

export const storyGames = pgTable("story_games", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  gameType: varchar("game_type", { length: 50 }).notNull(),
  config: jsonb("config"),
  linkedStoryTitle: text("linked_story_title"),
  funFacts: text("fun_facts"),
  howToPlay: text("how_to_play"),
  pointsReward: integer("points_reward").default(10),
  backgroundMusicUrl: text("background_music_url"),
  soundEffectsEnabled: boolean("sound_effects_enabled").default(true),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseworkItems = pgTable("coursework_items", {
  id: serial("id").primaryKey(),
  teacherId: uuid("teacher_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  itemType: varchar("item_type", { length: 100 }),
  subject: varchar("subject", { length: 100 }),
  fileKey: text("file_key"),
  linkUrl: text("link_url"),
  linkedArticleId: integer("linked_article_id"),
  price: integer("price").default(0),
  salesCount: integer("sales_count").default(0),
  isPublished: boolean("is_published").default(false),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userDailyActivity = pgTable("user_daily_activity", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  activityDate: date("activity_date").notNull(),
  readingSeconds: integer("reading_seconds").default(0),
  watchingSeconds: integer("watching_seconds").default(0),
  playSeconds: integer("play_seconds").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  uniqueIndex("user_date_unique_idx").on(table.userId, table.activityDate),
]);

export const userPointsLedger = pgTable("user_points_ledger", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  pointsDelta: integer("points_delta").notNull(),
  sourceType: varchar("source_type", { length: 50 }).notNull(),
  sourceId: integer("source_id"),
  balanceAfter: integer("balance_after").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userGameCompletions = pgTable("user_game_completions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  gameId: integer("game_id").references(() => storyGames.id).notNull(),
  score: integer("score").notNull(),
  pointsAwarded: integer("points_awarded").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users);
export const insertVideoSchema = createInsertSchema(videos);
export const updateVideoSchema = insertVideoSchema.partial();
export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const insertStoryGameSchema = createInsertSchema(storyGames);
export const updateStoryGameSchema = insertStoryGameSchema.partial();
export const insertCourseworkItemSchema = createInsertSchema(courseworkItems);
export const updateCourseworkItemSchema = insertCourseworkItemSchema.partial();
export const insertUserDailyActivitySchema = createInsertSchema(userDailyActivity);
export const insertUserPointsLedgerSchema = createInsertSchema(userPointsLedger);
export const insertUserGameCompletionsSchema = createInsertSchema(userGameCompletions);

// Stories table (for news articles/stories)
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).unique(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  content: text("content"),
  category: varchar("category", { length: 100 }),
  thumbnailUrl: text("thumbnail_url"),
  readingLevel: varchar("reading_level", { length: 50 }),
  readingTimeMinutes: integer("reading_time_minutes"),
  authorId: uuid("author_id"),
  isFeatured: boolean("is_featured").default(false),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStorySchema = createInsertSchema(stories);
export const updateStorySchema = insertStorySchema.partial();

// R2 Video Metadata
export const r2VideoMetadata = pgTable("r2_video_metadata", {
  id: serial("id").primaryKey(),
  r2Key: varchar("r2_key", { length: 500 }).unique().notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports
export type InsertVideo = typeof videos.$inferInsert;
export type InsertStory = typeof stories.$inferInsert;
export type InsertStoryGame = typeof storyGames.$inferInsert;
export type InsertCourseworkItem = typeof courseworkItems.$inferInsert;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type InsertR2VideoMetadata = typeof r2VideoMetadata.$inferInsert;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Story = typeof stories.$inferSelect;
export type StoryGame = typeof storyGames.$inferSelect;
export type CourseworkItem = typeof courseworkItems.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type UserDailyActivity = typeof userDailyActivity.$inferSelect;
export type UserActivity = UserDailyActivity; // Alias
export type UserPointsLedger = typeof userPointsLedger.$inferSelect;
export type UserGameCompletion = typeof userGameCompletions.$inferSelect;
export type R2VideoMetadata = typeof r2VideoMetadata.$inferSelect;

// Alias for userDailyActivity for backward compatibility  
export const userActivity = userDailyActivity;

// Constants for coursework types
export const COURSEWORK_TYPES = [
  "PDF",
  "Unit Plan",
  "Worksheet",
  "Assessment",
  "Presentation",
  "Video",
  "Quiz",
  "Activity",
  "Lesson Plan",
  "Resource Pack",
] as const;

// Constants for subjects
export const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Geography",
  "Art",
  "Music",
  "Physical Education",
  "Technology",
  "Languages",
  "Social Studies",
  "Health",
] as const;
