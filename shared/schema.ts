import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  points: integer("points").default(0).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isSubscribed: boolean("is_subscribed").default(false).notNull(),
  subscriptionPlan: varchar("subscription_plan"),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  userRole: varchar("user_role", { length: 20 }),
  teacherVerificationStatus: varchar("teacher_verification_status", { length: 20 }).default("unverified"),
  verificationRequestedAt: timestamp("verification_requested_at"),
  bio: text("bio"),
  subjectsTaught: text("subjects_taught"),
  experienceYears: integer("experience_years"),
  reputationScore: integer("reputation_score").default(0),
  totalSales: integer("total_sales").default(0),
  badges: jsonb("badges"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  emailVerificationExpiry: timestamp("email_verification_expiry"),
  agreedToTerms: boolean("agreed_to_terms").default(false).notNull(),
  agreedToTermsAt: timestamp("agreed_to_terms_at"),
  marketingEmailsOptIn: boolean("marketing_emails_opt_in").default(false).notNull(),
  contentAlertsOptIn: boolean("content_alerts_opt_in").default(true).notNull(),
  teacherUpdatesOptIn: boolean("teacher_updates_opt_in").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const videos = pgTable("videos", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  duration: varchar("duration").notNull(),
  thumbnail: text("thumbnail").notNull(),
  videoUrl: text("video_url").notNull(),
  category: varchar("category").notNull(),
  views: integer("views").default(0).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  linkedStoryTitle: varchar("linked_story_title", { length: 255 }),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_videos_linked_title").on(table.linkedStoryTitle),
]);

export const subscriptions = pgTable("subscriptions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  plan: varchar("plan").notNull(),
  status: varchar("status").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userActivity = pgTable("user_activity", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: varchar("date").notNull(),
  readingTimeSeconds: integer("reading_time_seconds").default(0).notNull(),
  watchingTimeSeconds: integer("watching_time_seconds").default(0).notNull(),
  playingTimeSeconds: integer("playing_time_seconds").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const r2VideoMetadata = pgTable("r2_video_metadata", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  r2Key: varchar("r2_key").unique().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stories = pgTable("stories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(),
  thumbnail: text("thumbnail").notNull(),
  thumbnailCredit: text("thumbnail_credit"),
  readTime: varchar("read_time").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  authorId: varchar("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  subscriptions: many(subscriptions),
}));

export const videoRelations = relations(videos, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [videos.uploadedBy],
    references: [users.id],
  }),
}));

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertVideo = typeof videos.$inferInsert;
export type Video = typeof videos.$inferSelect;

export type InsertSubscription = typeof subscriptions.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertUserActivity = typeof userActivity.$inferInsert;
export type UserActivity = typeof userActivity.$inferSelect;

export type InsertR2VideoMetadata = typeof r2VideoMetadata.$inferInsert;
export type R2VideoMetadata = typeof r2VideoMetadata.$inferSelect;

export type InsertStory = typeof stories.$inferInsert;
export type Story = typeof stories.$inferSelect;

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
});

export const updateVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  uploadedBy: true,
  views: true,
}).partial();

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertR2VideoMetadataSchema = createInsertSchema(r2VideoMetadata).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Game templates linked to stories by title for scalability
export const storyGames = pgTable("story_games", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  gameType: varchar("game_type", { length: 50 }).notNull(), // puzzle, match, quiz, whack, timeline
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  funFacts: text("fun_facts"),
  howToPlay: text("how_to_play"),
  linkedStoryTitle: varchar("linked_story_title", { length: 255 }),
  pointsReward: integer("points_reward").default(10).notNull(),
  config: jsonb("config").notNull(),
  backgroundMusicUrl: text("background_music_url"),
  soundEffectsEnabled: boolean("sound_effects_enabled").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_story_games_linked_title").on(table.linkedStoryTitle),
  index("idx_story_games_game_type").on(table.gameType),
]);

export type InsertStoryGame = typeof storyGames.$inferInsert;
export type StoryGame = typeof storyGames.$inferSelect;

export const insertStoryGameSchema = createInsertSchema(storyGames).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateStoryGameSchema = createInsertSchema(storyGames).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Type definitions for game configs
export interface PuzzleGameConfig {
  imageUrl: string;
  gridSize: number; // 3x3, 4x4, etc.
  hintText?: string;
  winMessage?: string;
}

export interface MatchGameConfig {
  pairs: Array<{
    id: string;
    front: string; // text or image URL
    back: string; // matching text or image URL
  }>;
  winMessage?: string;
}

export interface QuizGameConfig {
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }>;
  passingScore?: number;
  winMessage?: string;
}

export interface WhackGameConfig {
  targetImage: string;
  targetLabel: string;
  distractorImages: string[];
  distractorLabels: string[];
  backgroundImage?: string;
  duration: number; // seconds
  winMessage?: string;
}

export interface TimelineGameConfig {
  events: Array<{
    id: string;
    title: string;
    description?: string;
    image?: string;
    order: number;
  }>;
  winMessage?: string;
}

// Teacher Coursework Marketplace
export const courseworkItems = pgTable("coursework_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  teacherId: varchar("teacher_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  itemType: varchar("item_type", { length: 50 }).notNull(), // pdf_worksheet, unit_plan, lesson_bundle, homework_pack, reading_comprehension, project_assignment, video, quiz
  subject: varchar("subject", { length: 100 }),
  fileKey: varchar("file_key"), // R2 file key for uploaded files
  linkUrl: text("link_url"), // External link (YouTube, etc.)
  linkedArticleId: integer("linked_article_id").references(() => stories.id),
  price: integer("price").default(0).notNull(), // in cents
  salesCount: integer("sales_count").default(0).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_coursework_teacher").on(table.teacherId),
  index("idx_coursework_type").on(table.itemType),
  index("idx_coursework_subject").on(table.subject),
]);

export const courseworkItemsRelations = relations(courseworkItems, ({ one }) => ({
  teacher: one(users, {
    fields: [courseworkItems.teacherId],
    references: [users.id],
  }),
  linkedArticle: one(stories, {
    fields: [courseworkItems.linkedArticleId],
    references: [stories.id],
  }),
}));

export type InsertCourseworkItem = typeof courseworkItems.$inferInsert;
export type CourseworkItem = typeof courseworkItems.$inferSelect;

export const insertCourseworkItemSchema = createInsertSchema(courseworkItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  salesCount: true,
});

export const updateCourseworkItemSchema = createInsertSchema(courseworkItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  teacherId: true,
  salesCount: true,
}).partial();

// Coursework item types
export const COURSEWORK_TYPES = [
  { id: 'pdf_worksheet', label: 'PDF Worksheet' },
  { id: 'unit_plan', label: 'Unit Plan' },
  { id: 'lesson_bundle', label: 'Weekly Lesson Bundle' },
  { id: 'homework_pack', label: 'Homework Pack' },
  { id: 'reading_comprehension', label: 'Reading Comprehension Set' },
  { id: 'project_assignment', label: 'Project-Based Learning Assignment' },
  { id: 'video', label: 'Educational Video' },
  { id: 'quiz', label: 'Quiz (tied to NewsPals article)' },
] as const;

export const SUBJECTS = [
  'Math',
  'Science',
  'English',
  'History',
  'Geography',
  'Art',
  'Music',
  'Physical Education',
  'Social Studies',
  'Technology',
  'Foreign Language',
  'Other',
] as const;
