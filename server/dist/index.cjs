"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/index.ts
var index_exports = {};
__export(index_exports, {
  log: () => log
});
module.exports = __toCommonJS(index_exports);
var import_config = require("dotenv/config");
var import_express2 = __toESM(require("express"), 1);

// server/routes.ts
var import_crypto = require("crypto");
var import_bcrypt = __toESM(require("bcrypt"), 1);

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  COURSEWORK_TYPES: () => COURSEWORK_TYPES,
  SUBJECTS: () => SUBJECTS,
  courseworkItems: () => courseworkItems,
  courseworkItemsRelations: () => courseworkItemsRelations,
  insertCourseworkItemSchema: () => insertCourseworkItemSchema,
  insertR2VideoMetadataSchema: () => insertR2VideoMetadataSchema,
  insertStoryGameSchema: () => insertStoryGameSchema,
  insertStorySchema: () => insertStorySchema,
  insertSubscriptionSchema: () => insertSubscriptionSchema,
  insertVideoSchema: () => insertVideoSchema,
  r2VideoMetadata: () => r2VideoMetadata,
  sessions: () => sessions,
  stories: () => stories,
  storyGames: () => storyGames,
  subscriptionRelations: () => subscriptionRelations,
  subscriptions: () => subscriptions,
  updateCourseworkItemSchema: () => updateCourseworkItemSchema,
  updateStoryGameSchema: () => updateStoryGameSchema,
  updateStorySchema: () => updateStorySchema,
  updateVideoSchema: () => updateVideoSchema,
  userActivity: () => userActivity,
  userRelations: () => userRelations,
  users: () => users,
  videoRelations: () => videoRelations,
  videos: () => videos
});
var import_drizzle_orm = require("drizzle-orm");
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_orm2 = require("drizzle-orm");
var import_drizzle_zod = require("drizzle-zod");
var sessions = (0, import_pg_core.pgTable)(
  "sessions",
  {
    sid: (0, import_pg_core.varchar)("sid").primaryKey(),
    sess: (0, import_pg_core.jsonb)("sess").notNull(),
    expire: (0, import_pg_core.timestamp)("expire").notNull()
  },
  (table) => [(0, import_pg_core.index)("IDX_session_expire").on(table.expire)]
);
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  email: (0, import_pg_core.varchar)("email").unique(),
  passwordHash: (0, import_pg_core.varchar)("password_hash", { length: 255 }),
  firstName: (0, import_pg_core.varchar)("first_name"),
  lastName: (0, import_pg_core.varchar)("last_name"),
  profileImageUrl: (0, import_pg_core.varchar)("profile_image_url"),
  points: (0, import_pg_core.integer)("points").default(0).notNull(),
  isAdmin: (0, import_pg_core.boolean)("is_admin").default(false).notNull(),
  isSubscribed: (0, import_pg_core.boolean)("is_subscribed").default(false).notNull(),
  subscriptionPlan: (0, import_pg_core.varchar)("subscription_plan"),
  subscriptionStartDate: (0, import_pg_core.timestamp)("subscription_start_date"),
  subscriptionEndDate: (0, import_pg_core.timestamp)("subscription_end_date"),
  userRole: (0, import_pg_core.varchar)("user_role", { length: 20 }),
  teacherVerificationStatus: (0, import_pg_core.varchar)("teacher_verification_status", { length: 20 }).default("unverified"),
  verificationRequestedAt: (0, import_pg_core.timestamp)("verification_requested_at"),
  bio: (0, import_pg_core.text)("bio"),
  subjectsTaught: (0, import_pg_core.text)("subjects_taught"),
  experienceYears: (0, import_pg_core.integer)("experience_years"),
  reputationScore: (0, import_pg_core.integer)("reputation_score").default(0),
  totalSales: (0, import_pg_core.integer)("total_sales").default(0),
  badges: (0, import_pg_core.jsonb)("badges"),
  emailVerified: (0, import_pg_core.boolean)("email_verified").default(false).notNull(),
  emailVerificationToken: (0, import_pg_core.varchar)("email_verification_token", { length: 255 }),
  emailVerificationExpiry: (0, import_pg_core.timestamp)("email_verification_expiry"),
  agreedToTerms: (0, import_pg_core.boolean)("agreed_to_terms").default(false).notNull(),
  agreedToTermsAt: (0, import_pg_core.timestamp)("agreed_to_terms_at"),
  marketingEmailsOptIn: (0, import_pg_core.boolean)("marketing_emails_opt_in").default(false).notNull(),
  contentAlertsOptIn: (0, import_pg_core.boolean)("content_alerts_opt_in").default(true).notNull(),
  teacherUpdatesOptIn: (0, import_pg_core.boolean)("teacher_updates_opt_in").default(true).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var videos = (0, import_pg_core.pgTable)("videos", {
  id: (0, import_pg_core.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
  title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
  description: (0, import_pg_core.text)("description"),
  duration: (0, import_pg_core.varchar)("duration").notNull(),
  thumbnail: (0, import_pg_core.text)("thumbnail").notNull(),
  videoUrl: (0, import_pg_core.text)("video_url").notNull(),
  category: (0, import_pg_core.varchar)("category").notNull(),
  views: (0, import_pg_core.integer)("views").default(0).notNull(),
  isFeatured: (0, import_pg_core.boolean)("is_featured").default(false).notNull(),
  uploadedBy: (0, import_pg_core.varchar)("uploaded_by").references(() => users.id),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var subscriptions = (0, import_pg_core.pgTable)("subscriptions", {
  id: (0, import_pg_core.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: (0, import_pg_core.varchar)("user_id").references(() => users.id).notNull(),
  plan: (0, import_pg_core.varchar)("plan").notNull(),
  status: (0, import_pg_core.varchar)("status").notNull(),
  startDate: (0, import_pg_core.timestamp)("start_date").notNull(),
  endDate: (0, import_pg_core.timestamp)("end_date"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var userActivity = (0, import_pg_core.pgTable)("user_activity", {
  id: (0, import_pg_core.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: (0, import_pg_core.varchar)("user_id").references(() => users.id).notNull(),
  date: (0, import_pg_core.varchar)("date").notNull(),
  readingTimeSeconds: (0, import_pg_core.integer)("reading_time_seconds").default(0).notNull(),
  watchingTimeSeconds: (0, import_pg_core.integer)("watching_time_seconds").default(0).notNull(),
  playingTimeSeconds: (0, import_pg_core.integer)("playing_time_seconds").default(0).notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var r2VideoMetadata = (0, import_pg_core.pgTable)("r2_video_metadata", {
  id: (0, import_pg_core.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
  r2Key: (0, import_pg_core.varchar)("r2_key").unique().notNull(),
  title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
  description: (0, import_pg_core.text)("description"),
  category: (0, import_pg_core.varchar)("category").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var stories = (0, import_pg_core.pgTable)("stories", {
  id: (0, import_pg_core.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: (0, import_pg_core.varchar)("slug", { length: 255 }).unique().notNull(),
  title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
  excerpt: (0, import_pg_core.text)("excerpt").notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  category: (0, import_pg_core.varchar)("category").notNull(),
  thumbnail: (0, import_pg_core.text)("thumbnail").notNull(),
  thumbnailCredit: (0, import_pg_core.text)("thumbnail_credit"),
  readTime: (0, import_pg_core.varchar)("read_time").notNull(),
  isFeatured: (0, import_pg_core.boolean)("is_featured").default(false).notNull(),
  isPublished: (0, import_pg_core.boolean)("is_published").default(false).notNull(),
  publishedAt: (0, import_pg_core.timestamp)("published_at"),
  authorId: (0, import_pg_core.varchar)("author_id").references(() => users.id),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var userRelations = (0, import_drizzle_orm2.relations)(users, ({ many }) => ({
  videos: many(videos),
  subscriptions: many(subscriptions)
}));
var videoRelations = (0, import_drizzle_orm2.relations)(videos, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [videos.uploadedBy],
    references: [users.id]
  })
}));
var subscriptionRelations = (0, import_drizzle_orm2.relations)(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id]
  })
}));
var insertVideoSchema = (0, import_drizzle_zod.createInsertSchema)(videos).omit({
  id: true,
  createdAt: true
});
var updateVideoSchema = (0, import_drizzle_zod.createInsertSchema)(videos).omit({
  id: true,
  createdAt: true,
  uploadedBy: true,
  views: true
}).partial();
var insertSubscriptionSchema = (0, import_drizzle_zod.createInsertSchema)(subscriptions).omit({
  id: true,
  createdAt: true
});
var insertR2VideoMetadataSchema = (0, import_drizzle_zod.createInsertSchema)(r2VideoMetadata).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertStorySchema = (0, import_drizzle_zod.createInsertSchema)(stories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var updateStorySchema = (0, import_drizzle_zod.createInsertSchema)(stories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).partial();
var storyGames = (0, import_pg_core.pgTable)("story_games", {
  id: (0, import_pg_core.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
  gameType: (0, import_pg_core.varchar)("game_type", { length: 50 }).notNull(),
  // puzzle, match, quiz, whack, timeline
  title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
  description: (0, import_pg_core.text)("description"),
  thumbnail: (0, import_pg_core.text)("thumbnail"),
  funFacts: (0, import_pg_core.text)("fun_facts"),
  howToPlay: (0, import_pg_core.text)("how_to_play"),
  linkedStoryTitle: (0, import_pg_core.varchar)("linked_story_title", { length: 255 }),
  pointsReward: (0, import_pg_core.integer)("points_reward").default(10).notNull(),
  config: (0, import_pg_core.jsonb)("config").notNull(),
  backgroundMusicUrl: (0, import_pg_core.text)("background_music_url"),
  soundEffectsEnabled: (0, import_pg_core.boolean)("sound_effects_enabled").default(true).notNull(),
  isActive: (0, import_pg_core.boolean)("is_active").default(true).notNull(),
  isFeatured: (0, import_pg_core.boolean)("is_featured").default(false).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (table) => [
  (0, import_pg_core.index)("idx_story_games_linked_title").on(table.linkedStoryTitle),
  (0, import_pg_core.index)("idx_story_games_game_type").on(table.gameType)
]);
var insertStoryGameSchema = (0, import_drizzle_zod.createInsertSchema)(storyGames).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var updateStoryGameSchema = (0, import_drizzle_zod.createInsertSchema)(storyGames).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).partial();
var courseworkItems = (0, import_pg_core.pgTable)("coursework_items", {
  id: (0, import_pg_core.integer)("id").primaryKey().generatedAlwaysAsIdentity(),
  teacherId: (0, import_pg_core.varchar)("teacher_id").references(() => users.id).notNull(),
  title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
  description: (0, import_pg_core.text)("description"),
  itemType: (0, import_pg_core.varchar)("item_type", { length: 50 }).notNull(),
  // pdf_worksheet, unit_plan, lesson_bundle, homework_pack, reading_comprehension, project_assignment, video, quiz
  subject: (0, import_pg_core.varchar)("subject", { length: 100 }),
  fileKey: (0, import_pg_core.varchar)("file_key"),
  // R2 file key for uploaded files
  linkUrl: (0, import_pg_core.text)("link_url"),
  // External link (YouTube, etc.)
  linkedArticleId: (0, import_pg_core.integer)("linked_article_id").references(() => stories.id),
  price: (0, import_pg_core.integer)("price").default(0).notNull(),
  // in cents
  salesCount: (0, import_pg_core.integer)("sales_count").default(0).notNull(),
  isPublished: (0, import_pg_core.boolean)("is_published").default(false).notNull(),
  thumbnailUrl: (0, import_pg_core.text)("thumbnail_url"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
}, (table) => [
  (0, import_pg_core.index)("idx_coursework_teacher").on(table.teacherId),
  (0, import_pg_core.index)("idx_coursework_type").on(table.itemType),
  (0, import_pg_core.index)("idx_coursework_subject").on(table.subject)
]);
var courseworkItemsRelations = (0, import_drizzle_orm2.relations)(courseworkItems, ({ one }) => ({
  teacher: one(users, {
    fields: [courseworkItems.teacherId],
    references: [users.id]
  }),
  linkedArticle: one(stories, {
    fields: [courseworkItems.linkedArticleId],
    references: [stories.id]
  })
}));
var insertCourseworkItemSchema = (0, import_drizzle_zod.createInsertSchema)(courseworkItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  salesCount: true
});
var updateCourseworkItemSchema = (0, import_drizzle_zod.createInsertSchema)(courseworkItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  teacherId: true,
  salesCount: true
}).partial();
var COURSEWORK_TYPES = [
  { id: "pdf_worksheet", label: "PDF Worksheet" },
  { id: "unit_plan", label: "Unit Plan" },
  { id: "lesson_bundle", label: "Weekly Lesson Bundle" },
  { id: "homework_pack", label: "Homework Pack" },
  { id: "reading_comprehension", label: "Reading Comprehension Set" },
  { id: "project_assignment", label: "Project-Based Learning Assignment" },
  { id: "video", label: "Educational Video" },
  { id: "quiz", label: "Quiz (tied to NewsPals article)" }
];
var SUBJECTS = [
  "Math",
  "Science",
  "English",
  "History",
  "Geography",
  "Art",
  "Music",
  "Physical Education",
  "Social Studies",
  "Technology",
  "Foreign Language",
  "Other"
];

// server/db.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = __toESM(require("pg"), 1);
var { Pool } = import_pg.default;
var databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "NEON_DATABASE_URL or DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: databaseUrl });
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// server/storage.ts
var import_drizzle_orm3 = require("drizzle-orm");
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.email, email.toLowerCase()));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async updateUserSubscription(userId, isSubscribed, plan) {
    const [user] = await db.update(users).set({
      isSubscribed,
      subscriptionPlan: plan,
      subscriptionStartDate: isSubscribed ? /* @__PURE__ */ new Date() : null,
      subscriptionEndDate: isSubscribed ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3) : null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm3.eq)(users.id, userId)).returning();
    return user;
  }
  async getUserPoints(userId) {
    const user = await this.getUser(userId);
    return user?.points ?? 0;
  }
  async addUserPoints(userId, points) {
    const existingUser = await this.getUser(userId);
    if (!existingUser) {
      const [newUser] = await db.insert(users).values({ id: userId, points }).returning();
      return newUser;
    }
    const [user] = await db.update(users).set({
      points: import_drizzle_orm3.sql`${users.points} + ${points}`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm3.eq)(users.id, userId)).returning();
    return user;
  }
  async getAllVideos() {
    return await db.select().from(videos).orderBy((0, import_drizzle_orm3.desc)(videos.createdAt));
  }
  async getVideoById(id) {
    const [video] = await db.select().from(videos).where((0, import_drizzle_orm3.eq)(videos.id, id));
    return video;
  }
  async getFeaturedVideos() {
    return await db.select().from(videos).orderBy((0, import_drizzle_orm3.desc)(videos.createdAt)).limit(5);
  }
  async createVideo(videoData) {
    const [video] = await db.insert(videos).values(videoData).returning();
    return video;
  }
  async updateVideo(id, videoData) {
    const [video] = await db.update(videos).set(videoData).where((0, import_drizzle_orm3.eq)(videos.id, id)).returning();
    return video;
  }
  async deleteVideo(id) {
    await db.delete(videos).where((0, import_drizzle_orm3.eq)(videos.id, id));
  }
  async incrementVideoViews(id) {
    await db.update(videos).set({ views: import_drizzle_orm3.sql`${videos.views} + 1` }).where((0, import_drizzle_orm3.eq)(videos.id, id));
  }
  async createSubscription(subscriptionData) {
    const [subscription] = await db.insert(subscriptions).values(subscriptionData).returning();
    return subscription;
  }
  async getUserSubscription(userId) {
    const [subscription] = await db.select().from(subscriptions).where((0, import_drizzle_orm3.eq)(subscriptions.userId, userId)).orderBy((0, import_drizzle_orm3.desc)(subscriptions.createdAt)).limit(1);
    return subscription;
  }
  async cancelSubscription(userId) {
    await db.update(subscriptions).set({ status: "cancelled" }).where((0, import_drizzle_orm3.eq)(subscriptions.userId, userId));
  }
  async getTodayActivity(userId) {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const [activity] = await db.select().from(userActivity).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(userActivity.userId, userId), (0, import_drizzle_orm3.eq)(userActivity.date, today)));
    return activity;
  }
  async addActivityTime(userId, activityType, seconds) {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const existing = await this.getTodayActivity(userId);
    if (existing) {
      const updateData = {};
      if (activityType === "reading") {
        updateData.readingTimeSeconds = (existing.readingTimeSeconds || 0) + seconds;
      } else if (activityType === "watching") {
        updateData.watchingTimeSeconds = (existing.watchingTimeSeconds || 0) + seconds;
      } else {
        updateData.playingTimeSeconds = (existing.playingTimeSeconds || 0) + seconds;
      }
      const [updated] = await db.update(userActivity).set(updateData).where((0, import_drizzle_orm3.eq)(userActivity.id, existing.id)).returning();
      return updated;
    } else {
      const insertData = {
        userId,
        date: today,
        readingTimeSeconds: activityType === "reading" ? seconds : 0,
        watchingTimeSeconds: activityType === "watching" ? seconds : 0,
        playingTimeSeconds: activityType === "playing" ? seconds : 0
      };
      const [created] = await db.insert(userActivity).values(insertData).returning();
      return created;
    }
  }
  async getAllR2VideoMetadata() {
    return await db.select().from(r2VideoMetadata).orderBy((0, import_drizzle_orm3.desc)(r2VideoMetadata.createdAt));
  }
  async getR2VideoMetadataByKey(r2Key) {
    const [metadata] = await db.select().from(r2VideoMetadata).where((0, import_drizzle_orm3.eq)(r2VideoMetadata.r2Key, r2Key));
    return metadata;
  }
  async upsertR2VideoMetadata(data) {
    const [metadata] = await db.insert(r2VideoMetadata).values(data).onConflictDoUpdate({
      target: r2VideoMetadata.r2Key,
      set: {
        title: data.title,
        description: data.description,
        category: data.category,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return metadata;
  }
  async deleteR2VideoMetadata(r2Key) {
    await db.delete(r2VideoMetadata).where((0, import_drizzle_orm3.eq)(r2VideoMetadata.r2Key, r2Key));
  }
  async getPublishedStories() {
    return await db.select().from(stories).where((0, import_drizzle_orm3.eq)(stories.isPublished, true)).orderBy((0, import_drizzle_orm3.desc)(stories.publishedAt));
  }
  async getAllStories() {
    return await db.select().from(stories).orderBy((0, import_drizzle_orm3.desc)(stories.createdAt));
  }
  async getStoryById(id) {
    const [story] = await db.select().from(stories).where((0, import_drizzle_orm3.eq)(stories.id, id));
    return story;
  }
  async getStoryBySlug(slug) {
    const [story] = await db.select().from(stories).where((0, import_drizzle_orm3.eq)(stories.slug, slug));
    return story;
  }
  async getFeaturedStory() {
    const [story] = await db.select().from(stories).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(stories.isPublished, true), (0, import_drizzle_orm3.eq)(stories.isFeatured, true))).orderBy((0, import_drizzle_orm3.desc)(stories.publishedAt)).limit(1);
    return story;
  }
  async getFeaturedStories() {
    return await db.select().from(stories).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(stories.isPublished, true), (0, import_drizzle_orm3.eq)(stories.isFeatured, true))).orderBy((0, import_drizzle_orm3.desc)(stories.publishedAt));
  }
  async createStory(storyData) {
    const [story] = await db.insert(stories).values(storyData).returning();
    return story;
  }
  async updateStory(id, storyData) {
    const [story] = await db.update(stories).set({ ...storyData, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(stories.id, id)).returning();
    return story;
  }
  async deleteStory(id) {
    await db.delete(stories).where((0, import_drizzle_orm3.eq)(stories.id, id));
  }
  // Story Games
  async getGamesByStoryTitle(storyTitle) {
    return await db.select().from(storyGames).where((0, import_drizzle_orm3.eq)(storyGames.linkedStoryTitle, storyTitle)).orderBy((0, import_drizzle_orm3.desc)(storyGames.createdAt));
  }
  async getGameById(id) {
    const [game] = await db.select().from(storyGames).where((0, import_drizzle_orm3.eq)(storyGames.id, id));
    return game;
  }
  async getAllGames() {
    return await db.select().from(storyGames).orderBy((0, import_drizzle_orm3.desc)(storyGames.createdAt));
  }
  async getActiveGames() {
    return await db.select().from(storyGames).where((0, import_drizzle_orm3.eq)(storyGames.isActive, true)).orderBy((0, import_drizzle_orm3.desc)(storyGames.createdAt));
  }
  async getFeaturedGames() {
    return await db.select().from(storyGames).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(storyGames.isActive, true), (0, import_drizzle_orm3.eq)(storyGames.isFeatured, true))).orderBy((0, import_drizzle_orm3.desc)(storyGames.createdAt));
  }
  async createGame(gameData) {
    const [game] = await db.insert(storyGames).values(gameData).returning();
    return game;
  }
  async updateGame(id, gameData) {
    const [game] = await db.update(storyGames).set({ ...gameData, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(storyGames.id, id)).returning();
    return game;
  }
  async deleteGame(id) {
    await db.delete(storyGames).where((0, import_drizzle_orm3.eq)(storyGames.id, id));
  }
  // Coursework Marketplace
  async getAllCoursework() {
    return await db.select().from(courseworkItems).orderBy((0, import_drizzle_orm3.desc)(courseworkItems.createdAt));
  }
  async getPublishedCoursework() {
    return await db.select().from(courseworkItems).where((0, import_drizzle_orm3.eq)(courseworkItems.isPublished, true)).orderBy((0, import_drizzle_orm3.desc)(courseworkItems.createdAt));
  }
  async getCourseworkById(id) {
    const [item] = await db.select().from(courseworkItems).where((0, import_drizzle_orm3.eq)(courseworkItems.id, id));
    return item;
  }
  async getCourseworkByTeacher(teacherId) {
    return await db.select().from(courseworkItems).where((0, import_drizzle_orm3.eq)(courseworkItems.teacherId, teacherId)).orderBy((0, import_drizzle_orm3.desc)(courseworkItems.createdAt));
  }
  async createCoursework(item) {
    const [coursework] = await db.insert(courseworkItems).values(item).returning();
    return coursework;
  }
  async updateCoursework(id, item) {
    const [coursework] = await db.update(courseworkItems).set({ ...item, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(courseworkItems.id, id)).returning();
    return coursework;
  }
  async deleteCoursework(id) {
    await db.delete(courseworkItems).where((0, import_drizzle_orm3.eq)(courseworkItems.id, id));
  }
  // Teacher Profile
  async getTeachers() {
    return await db.select().from(users).where((0, import_drizzle_orm3.eq)(users.userRole, "teacher")).orderBy((0, import_drizzle_orm3.desc)(users.totalSales));
  }
  async getTeacherById(id) {
    const [user] = await db.select().from(users).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(users.id, id), (0, import_drizzle_orm3.eq)(users.userRole, "teacher")));
    return user;
  }
  async updateUserRole(userId, role) {
    const [user] = await db.update(users).set({ userRole: role, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(users.id, userId)).returning();
    return user;
  }
  async requestTeacherVerification(userId) {
    const [user] = await db.update(users).set({
      teacherVerificationStatus: "pending",
      verificationRequestedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm3.eq)(users.id, userId)).returning();
    return user;
  }
  async updateTeacherVerificationStatus(userId, status) {
    const [user] = await db.update(users).set({
      teacherVerificationStatus: status,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm3.eq)(users.id, userId)).returning();
    return user;
  }
  async getPendingVerificationRequests() {
    return await db.select().from(users).where((0, import_drizzle_orm3.and)(
      (0, import_drizzle_orm3.eq)(users.userRole, "teacher"),
      (0, import_drizzle_orm3.eq)(users.teacherVerificationStatus, "pending")
    )).orderBy((0, import_drizzle_orm3.desc)(users.verificationRequestedAt));
  }
  async updateTeacherProfile(userId, data) {
    const [user] = await db.update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(users.id, userId)).returning();
    return user;
  }
  async updateUserProfile(userId, data) {
    const [user] = await db.update(users).set({
      firstName: data.firstName,
      lastName: data.lastName,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm3.eq)(users.id, userId)).returning();
    return user;
  }
  async updateUserPassword(userId, passwordHash) {
    await db.update(users).set({
      passwordHash,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm3.eq)(users.id, userId));
  }
  async updateUserNotifications(userId, data) {
    const [user] = await db.update(users).set({
      marketingEmailsOptIn: data.marketingEmailsOptIn,
      contentAlertsOptIn: data.contentAlertsOptIn,
      teacherUpdatesOptIn: data.teacherUpdatesOptIn,
      updatedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm3.eq)(users.id, userId)).returning();
    return user;
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
var import_express_session = __toESM(require("express-session"), 1);
var import_connect_pg_simple = __toESM(require("connect-pg-simple"), 1);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = (0, import_connect_pg_simple.default)(import_express_session.default);
  const databaseUrl2 = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  const sessionStore = new pgStore({
    conString: databaseUrl2,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "session"
  });
  const isProduction = process.env.NODE_ENV === "production";
  return (0, import_express_session.default)({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      maxAge: sessionTtl,
      sameSite: isProduction ? "strict" : "lax"
    }
  });
}
function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
}
var isAuthenticated = async (req, res, next) => {
  if (req.session?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// server/routes.ts
var import_zod_validation_error = require("zod-validation-error");

// server/r2.ts
var import_client_s3 = require("@aws-sdk/client-s3");
var import_s3_request_presigner = require("@aws-sdk/s3-request-presigner");
var R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
var R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
var R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
var R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.warn("R2 credentials not fully configured. Video storage will not work.");
}
var r2Client = new import_client_s3.S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || ""
  }
});
async function listVideos() {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME not configured");
  }
  const command = new import_client_s3.ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME
  });
  const response = await r2Client.send(command);
  const videos2 = (response.Contents || []).filter((obj) => {
    const key = obj.Key || "";
    return key.endsWith(".mp4") || key.endsWith(".webm") || key.endsWith(".mov");
  }).map((obj) => ({
    key: obj.Key || "",
    name: extractVideoName(obj.Key || ""),
    size: obj.Size || 0,
    lastModified: obj.LastModified
  }));
  return videos2;
}
async function getVideoSignedUrl(key, expiresIn = 3600) {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME not configured");
  }
  const command = new import_client_s3.GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key
  });
  const signedUrl = await (0, import_s3_request_presigner.getSignedUrl)(r2Client, command, { expiresIn });
  return signedUrl;
}
function extractVideoName(key) {
  const filename = key.split("/").pop() || key;
  const nameWithoutExt = filename.replace(/\.(mp4|webm|mov)$/i, "");
  return nameWithoutExt.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
async function uploadImageToR2(file, filename, contentType, folder = "story-thumbnails") {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME not configured");
  }
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${folder}/${Date.now()}-${sanitizedFilename}`;
  const command = new import_client_s3.PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType
  });
  await r2Client.send(command);
  return { key };
}
async function getImageSignedUrl(key, expiresIn = 86400) {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME not configured");
  }
  const command = new import_client_s3.GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key
  });
  const signedUrl = await (0, import_s3_request_presigner.getSignedUrl)(r2Client, command, { expiresIn });
  return signedUrl;
}

// server/routes.ts
var import_multer = __toESM(require("multer"), 1);
var BCRYPT_ROUNDS = 12;
var ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
var ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
var timestampsEndpointAvailable = true;
var timestampsLastChecked = 0;
var TIMESTAMPS_RETRY_INTERVAL = 5 * 60 * 1e3;
var adminSessions = /* @__PURE__ */ new Map();
var ADMIN_SESSION_EXPIRY = 24 * 60 * 60 * 1e3;
function generateAdminToken() {
  return (0, import_crypto.randomBytes)(32).toString("hex");
}
function isValidAdminSession(req) {
  const token = req.headers["x-admin-token"] || req.cookies?.adminToken;
  if (!token) return false;
  const session2 = adminSessions.get(token);
  if (!session2) return false;
  if (Date.now() > session2.expiresAt) {
    adminSessions.delete(token);
    return false;
  }
  return true;
}
var upload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});
function getUserIdFromRequest(req) {
  if (req.session?.userId) {
    return req.session.userId;
  }
  return null;
}
async function registerRoutes(httpServer2, app2) {
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/admin/login", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Please log in to your account first" });
      }
      const user = await storage.getUser(req.session.userId);
      const ALLOWED_ADMIN_EMAILS = ["samueljuliustansil@gmail.com", "admin@whypals.com"];
      if (!user || !user.email || !ALLOWED_ADMIN_EMAILS.includes(user.email)) {
        return res.status(403).json({ message: "Access denied: Unauthorized account" });
      }
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      if (password === ADMIN_PASSWORD) {
        const token = generateAdminToken();
        adminSessions.set(token, { expiresAt: Date.now() + ADMIN_SESSION_EXPIRY });
        return res.json({ success: true, token });
      }
      return res.status(401).json({ message: "Invalid password" });
    } catch (error) {
      console.error("Error in admin login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/admin/session", async (req, res) => {
    if (isValidAdminSession(req)) {
      return res.json({ valid: true });
    }
    return res.status(401).json({ valid: false, message: "Session expired or invalid" });
  });
  app2.get("/api/admin/teacher-verifications", async (req, res) => {
    if (!isValidAdminSession(req)) {
      return res.status(401).json({ message: "Admin authentication required" });
    }
    try {
      const pendingTeachers = await storage.getPendingVerificationRequests();
      res.json(pendingTeachers.map((t) => ({ ...t, passwordHash: void 0 })));
    } catch (error) {
      console.error("Error fetching pending verifications:", error);
      res.status(500).json({ message: "Failed to fetch pending verifications" });
    }
  });
  app2.post("/api/admin/teacher-verifications/:userId", async (req, res) => {
    if (!isValidAdminSession(req)) {
      return res.status(401).json({ message: "Admin authentication required" });
    }
    try {
      const { userId } = req.params;
      const { action } = req.body;
      if (!action || !["approve", "reject"].includes(action)) {
        return res.status(400).json({ message: "Action must be 'approve' or 'reject'" });
      }
      const status = action === "approve" ? "verified" : "rejected";
      const user = await storage.updateTeacherVerificationStatus(userId, status);
      res.json({ success: true, user: { ...user, passwordHash: void 0 } });
    } catch (error) {
      console.error("Error updating verification status:", error);
      res.status(500).json({ message: "Failed to update verification status" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, confirmPassword, firstName, lastName, agreedToTerms } = req.body;
      if (!email || !password || !confirmPassword) {
        return res.status(400).json({ message: "Email, password, and password confirmation are required" });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      if (!agreedToTerms) {
        return res.status(400).json({ message: "You must agree to the Terms of Service and Privacy Policy" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
      const passwordHash = await import_bcrypt.default.hash(password, BCRYPT_ROUNDS);
      const user = await storage.upsertUser({
        email: email.toLowerCase(),
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        userRole: null,
        agreedToTerms: true,
        agreedToTermsAt: /* @__PURE__ */ new Date()
      });
      req.session.userId = user.id;
      req.session.authType = "email";
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Registration failed" });
        }
        res.status(201).json({
          success: true,
          user: { ...user, passwordHash: void 0 },
          needsRoleSelection: !user.userRole
        });
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email.toLowerCase());
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const validPassword = await import_bcrypt.default.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.session.userId = user.id;
      req.session.authType = "email";
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({
          success: true,
          user: { ...user, passwordHash: void 0 },
          needsRoleSelection: !user.userRole
        });
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie("connect.sid");
        res.json({ success: true });
      });
    } catch (error) {
      console.error("Error logging out:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });
  app2.get("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
        res.clearCookie("connect.sid");
        res.redirect("/login");
      });
    } catch (error) {
      console.error("Error logging out:", error);
      res.redirect("/login");
    }
  });
  app2.patch("/api/auth/role", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { role } = req.body;
      if (!role || !["teacher", "student"].includes(role)) {
        return res.status(400).json({ message: "Role must be 'teacher' or 'student'" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.userRole) {
        return res.status(400).json({ message: "Role has already been set" });
      }
      const updatedUser = await storage.updateUserRole(userId, role);
      res.json({
        success: true,
        user: { ...updatedUser, passwordHash: void 0 }
      });
    } catch (error) {
      console.error("Error setting role:", error);
      res.status(500).json({ message: "Failed to set role" });
    }
  });
  app2.post("/api/auth/request-verification", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.userRole !== "teacher") {
        return res.status(400).json({ message: "Only teachers can request verification" });
      }
      if (user.teacherVerificationStatus === "verified") {
        return res.status(400).json({ message: "You are already verified" });
      }
      const updatedUser = await storage.requestTeacherVerification(userId);
      res.json({
        success: true,
        user: { ...updatedUser, passwordHash: void 0 },
        message: "Verification request submitted. Our team will review your profile."
      });
    } catch (error) {
      console.error("Error requesting verification:", error);
      res.status(500).json({ message: "Failed to request verification" });
    }
  });
  app2.get("/api/auth/me", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, passwordHash: void 0 });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/videos", async (req, res) => {
    try {
      const videos2 = await storage.getAllVideos();
      res.json(videos2);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });
  app2.get("/api/videos/featured", async (req, res) => {
    try {
      const videos2 = await storage.getFeaturedVideos();
      res.json(videos2);
    } catch (error) {
      console.error("Error fetching featured videos:", error);
      res.status(500).json({ message: "Failed to fetch featured videos" });
    }
  });
  app2.get("/api/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.getVideoById(id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      await storage.incrementVideoViews(id);
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });
  app2.post("/api/videos", isAuthenticated, async (req, res) => {
    try {
      const result = insertVideoSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: (0, import_zod_validation_error.fromZodError)(result.error).message
        });
      }
      const userId = req.session.userId;
      const videoData = result.data;
      const video = await storage.createVideo({
        ...videoData,
        uploadedBy: userId
      });
      res.status(201).json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });
  app2.post("/api/subscribe", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { plan } = req.body;
      if (!plan || !["basic", "premium", "family"].includes(plan)) {
        return res.status(400).json({ message: "Invalid subscription plan" });
      }
      const subscription = await storage.createSubscription({
        userId,
        plan,
        status: "active",
        startDate: /* @__PURE__ */ new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
      });
      const updatedUser = await storage.updateUserSubscription(userId, true, plan);
      res.json({ subscription, user: updatedUser });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });
  app2.delete("/api/subscribe", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      await storage.cancelSubscription(userId);
      const updatedUser = await storage.updateUserSubscription(userId, false);
      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });
  app2.get("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const subscription = await storage.getUserSubscription(userId);
      res.json(subscription || null);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });
  app2.get("/api/activity/today", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const activity = await storage.getTodayActivity(userId);
      res.json(activity || { readingTimeSeconds: 0, watchingTimeSeconds: 0, playingTimeSeconds: 0 });
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });
  app2.post("/api/activity/track", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { activityType, seconds } = req.body;
      if (!["reading", "watching", "playing"].includes(activityType)) {
        return res.status(400).json({ message: "Invalid activity type" });
      }
      if (typeof seconds !== "number" || seconds < 0) {
        return res.status(400).json({ message: "Invalid seconds value" });
      }
      const activity = await storage.addActivityTime(userId, activityType, seconds);
      res.json(activity);
    } catch (error) {
      console.error("Error tracking activity:", error);
      res.status(500).json({ message: "Failed to track activity" });
    }
  });
  app2.get("/api/points", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const points = await storage.getUserPoints(userId);
      res.json({ points });
    } catch (error) {
      console.error("Error fetching points:", error);
      res.status(500).json({ message: "Failed to fetch points" });
    }
  });
  app2.post("/api/points/add", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { points } = req.body;
      if (typeof points !== "number" || points <= 0) {
        return res.status(400).json({ message: "Invalid points value" });
      }
      const user = await storage.addUserPoints(userId, points);
      res.json({ points: user.points });
    } catch (error) {
      console.error("Error adding points:", error);
      res.status(500).json({ message: "Failed to add points" });
    }
  });
  app2.get("/api/r2/videos", isAuthenticated, async (req, res) => {
    try {
      const videos2 = await listVideos();
      res.json(videos2);
    } catch (error) {
      console.error("Error listing R2 videos:", error);
      res.status(500).json({ message: "Failed to list videos from storage" });
    }
  });
  app2.get("/api/r2/videos/:key(*)", isAuthenticated, async (req, res) => {
    try {
      const key = req.params.key;
      if (!key) {
        return res.status(400).json({ message: "Video key is required" });
      }
      const signedUrl = await getVideoSignedUrl(key);
      res.json({ url: signedUrl });
    } catch (error) {
      console.error("Error getting video URL:", error);
      res.status(500).json({ message: "Failed to get video URL" });
    }
  });
  app2.get("/api/r2/metadata", isAuthenticated, async (req, res) => {
    try {
      const metadata = await storage.getAllR2VideoMetadata();
      res.json(metadata);
    } catch (error) {
      console.error("Error fetching R2 metadata:", error);
      res.status(500).json({ message: "Failed to fetch video metadata" });
    }
  });
  app2.get("/api/r2/metadata/:key(*)", isAuthenticated, async (req, res) => {
    try {
      const key = req.params.key;
      const metadata = await storage.getR2VideoMetadataByKey(key);
      res.json(metadata || null);
    } catch (error) {
      console.error("Error fetching R2 metadata:", error);
      res.status(500).json({ message: "Failed to fetch video metadata" });
    }
  });
  app2.post("/api/r2/metadata", async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { r2Key, title, description, category } = req.body;
      if (!r2Key || !title || !category) {
        return res.status(400).json({ message: "r2Key, title, and category are required" });
      }
      const metadata = await storage.upsertR2VideoMetadata({
        r2Key,
        title,
        description: description || null,
        category
      });
      res.json(metadata);
    } catch (error) {
      console.error("Error saving R2 metadata:", error);
      res.status(500).json({ message: "Failed to save video metadata" });
    }
  });
  app2.delete("/api/r2/metadata/:key(*)", async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const key = req.params.key;
      await storage.deleteR2VideoMetadata(key);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting R2 metadata:", error);
      res.status(500).json({ message: "Failed to delete video metadata" });
    }
  });
  app2.get("/api/stories", async (req, res) => {
    try {
      const stories2 = await storage.getPublishedStories();
      res.json(stories2);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });
  app2.get("/api/stories/featured", async (req, res) => {
    try {
      const stories2 = await storage.getFeaturedStories();
      res.json(stories2);
    } catch (error) {
      console.error("Error fetching featured stories:", error);
      res.status(500).json({ message: "Failed to fetch featured stories" });
    }
  });
  app2.get("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        const story2 = await storage.getStoryBySlug(req.params.id);
        if (!story2) {
          return res.status(404).json({ message: "Story not found" });
        }
        return res.json(story2);
      }
      const story = await storage.getStoryById(id);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      res.json(story);
    } catch (error) {
      console.error("Error fetching story:", error);
      res.status(500).json({ message: "Failed to fetch story" });
    }
  });
  app2.post("/api/admin/upload/image", upload.single("image"), async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      const { key } = await uploadImageToR2(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "story-thumbnails"
      );
      const imageUrl = `/api/images/${key}`;
      res.json({ imageUrl, key });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });
  app2.post("/api/admin/upload/game-image", upload.single("image"), async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      const { key } = await uploadImageToR2(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "game-images"
      );
      const imageUrl = `/api/images/${key}`;
      res.json({ imageUrl, key });
    } catch (error) {
      console.error("Error uploading game image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });
  app2.post("/api/admin/upload/story-content-image", upload.single("image"), async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      const { key } = await uploadImageToR2(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "story-content"
      );
      const imageUrl = `/api/images/${key}`;
      res.json({ imageUrl, key });
    } catch (error) {
      console.error("Error uploading story content image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });
  const ALLOWED_IMAGE_FOLDERS = ["story-thumbnails", "game-images", "story-content"];
  app2.get("/api/images/:key(*)", async (req, res) => {
    try {
      const key = req.params.key;
      const isAllowed = ALLOWED_IMAGE_FOLDERS.some((folder) => key.startsWith(`${folder}/`));
      if (!isAllowed) {
        return res.status(403).json({ message: "Access denied" });
      }
      const signedUrl = await getImageSignedUrl(key);
      res.redirect(signedUrl);
    } catch (error) {
      console.error("Error fetching image:", error);
      res.status(500).json({ message: "Failed to fetch image" });
    }
  });
  app2.get("/api/admin/stories", async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const stories2 = await storage.getAllStories();
      res.json(stories2);
    } catch (error) {
      console.error("Error fetching admin stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });
  app2.post("/api/admin/stories", async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const result = insertStorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: (0, import_zod_validation_error.fromZodError)(result.error).message });
      }
      const storyData = result.data;
      const story = await storage.createStory({
        ...storyData,
        authorId: null,
        publishedAt: storyData.isPublished ? /* @__PURE__ */ new Date() : null
      });
      res.status(201).json(story);
    } catch (error) {
      console.error("Error creating story:", error);
      res.status(500).json({ message: "Failed to create story" });
    }
  });
  app2.put("/api/admin/stories/:id", async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const existing = await storage.getStoryById(id);
      if (!existing) {
        return res.status(404).json({ message: "Story not found" });
      }
      const result = updateStorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: (0, import_zod_validation_error.fromZodError)(result.error).message });
      }
      const storyUpdateData = result.data;
      const updateData = { ...storyUpdateData };
      if (storyUpdateData.isPublished && !existing.isPublished) {
        updateData.publishedAt = /* @__PURE__ */ new Date();
      }
      const story = await storage.updateStory(id, updateData);
      res.json(story);
    } catch (error) {
      console.error("Error updating story:", error);
      res.status(500).json({ message: "Failed to update story" });
    }
  });
  app2.delete("/api/admin/stories/:id", async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      await storage.deleteStory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting story:", error);
      res.status(500).json({ message: "Failed to delete story" });
    }
  });
  app2.get("/api/admin/videos", async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const videos2 = await storage.getAllVideos();
      res.json(videos2);
    } catch (error) {
      console.error("Error fetching admin videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });
  app2.post("/api/admin/videos", async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const result = insertVideoSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: (0, import_zod_validation_error.fromZodError)(result.error).message });
      }
      const videoData = result.data;
      const video = await storage.createVideo({
        ...videoData,
        uploadedBy: null
      });
      res.status(201).json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });
  app2.put("/api/admin/videos/:id", async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const existing = await storage.getVideoById(id);
      if (!existing) {
        return res.status(404).json({ message: "Video not found" });
      }
      const result = updateVideoSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: (0, import_zod_validation_error.fromZodError)(result.error).message });
      }
      const videoUpdateData = result.data;
      const video = await storage.updateVideo(id, videoUpdateData);
      res.json(video);
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });
  app2.delete("/api/admin/videos/:id", async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      await storage.deleteVideo(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });
  app2.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getActiveGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });
  app2.get("/api/games/featured", async (req, res) => {
    try {
      const games = await storage.getFeaturedGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching featured games:", error);
      res.status(500).json({ message: "Failed to fetch featured games" });
    }
  });
  app2.get("/api/games/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const game = await storage.getGameById(id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });
  app2.get("/api/games/by-story/:storyTitle", async (req, res) => {
    try {
      const storyTitle = decodeURIComponent(req.params.storyTitle);
      const games = await storage.getGamesByStoryTitle(storyTitle);
      res.json(games);
    } catch (error) {
      console.error("Error fetching games by story:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });
  app2.get("/api/admin/games", async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const games = await storage.getAllGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });
  app2.post("/api/admin/games", async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const result = insertStoryGameSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: (0, import_zod_validation_error.fromZodError)(result.error).message });
      }
      const gameData = result.data;
      const game = await storage.createGame(gameData);
      res.status(201).json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  });
  app2.put("/api/admin/games/:id", async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const existing = await storage.getGameById(id);
      if (!existing) {
        return res.status(404).json({ message: "Game not found" });
      }
      const result = updateStoryGameSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: (0, import_zod_validation_error.fromZodError)(result.error).message });
      }
      const gameData = result.data;
      const game = await storage.updateGame(id, gameData);
      res.json(game);
    } catch (error) {
      console.error("Error updating game:", error);
      res.status(500).json({ message: "Failed to update game" });
    }
  });
  app2.delete("/api/admin/games/:id", async (req, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      await storage.deleteGame(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting game:", error);
      res.status(500).json({ message: "Failed to delete game" });
    }
  });
  app2.post("/api/games/:id/complete", isAuthenticated, async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const { score } = req.body;
      const userId = req.session.userId;
      const game = await storage.getGameById(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      const pointsEarned = Math.round(score / 100 * game.pointsReward);
      const user = await storage.addUserPoints(userId, pointsEarned);
      res.json({
        pointsEarned,
        totalPoints: user.points,
        message: `You earned ${pointsEarned} points!`
      });
    } catch (error) {
      console.error("Error completing game:", error);
      res.status(500).json({ message: "Failed to record game completion" });
    }
  });
  app2.post("/api/text-to-speech", async (req, res) => {
    try {
      const { text: text2 } = req.body;
      if (!text2 || typeof text2 !== "string") {
        return res.status(400).json({ message: "Text is required" });
      }
      if (!ELEVENLABS_API_KEY) {
        return res.status(500).json({ message: "ElevenLabs API key not configured" });
      }
      const shouldTryTimestamps = timestampsEndpointAvailable || Date.now() - timestampsLastChecked > TIMESTAMPS_RETRY_INTERVAL;
      if (shouldTryTimestamps) {
        const timestampsResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/with-timestamps`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
              text: text2,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.5,
                use_speaker_boost: true
              }
            })
          }
        );
        if (timestampsResponse.ok) {
          const data = await timestampsResponse.json();
          const alignment = data.alignment || {};
          const characters = alignment.characters || [];
          const startTimes = alignment.character_start_times_seconds || [];
          const endTimes = alignment.character_end_times_seconds || [];
          const words = [];
          let currentWord = "";
          let wordStart = null;
          for (let i = 0; i < characters.length; i++) {
            const char = characters[i];
            const isLastChar = i === characters.length - 1;
            if (char === " " || isLastChar) {
              if (isLastChar && char !== " ") {
                currentWord += char;
              }
              if (currentWord && wordStart !== null) {
                const wordEnd = char === " " ? endTimes[i - 1] : endTimes[i];
                words.push({
                  word: currentWord,
                  start: wordStart,
                  end: wordEnd
                });
              }
              currentWord = "";
              wordStart = null;
            } else {
              if (wordStart === null) {
                wordStart = startTimes[i];
              }
              currentWord += char;
            }
          }
          const audioBase642 = data.audio_base64;
          return res.json({
            audio: audioBase642,
            words,
            duration: endTimes.length > 0 ? endTimes[endTimes.length - 1] : 0,
            hasWordTiming: words.length > 0
          });
        } else {
          console.log("Timestamps endpoint returned", timestampsResponse.status, "- will retry in 5 minutes");
          timestampsEndpointAvailable = false;
          timestampsLastChecked = Date.now();
        }
      }
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: text2,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.5,
              use_speaker_boost: true
            }
          })
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs API error:", errorText);
        return res.status(response.status).json({ message: "Failed to generate speech" });
      }
      const audioBuffer = await response.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString("base64");
      res.json({
        audio: audioBase64,
        words: [],
        duration: 0,
        hasWordTiming: false
      });
    } catch (error) {
      console.error("Error generating speech:", error);
      res.status(500).json({ message: "Failed to generate speech" });
    }
  });
  app2.get("/api/marketplace", async (req, res) => {
    try {
      const items = await storage.getPublishedCoursework();
      res.json(items);
    } catch (error) {
      console.error("Error fetching marketplace items:", error);
      res.status(500).json({ message: "Failed to fetch marketplace items" });
    }
  });
  app2.get("/api/marketplace/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getCourseworkById(id);
      if (!item || !item.isPublished) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching marketplace item:", error);
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });
  app2.get("/api/marketplace/leaderboard/teachers", async (req, res) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers.slice(0, 10));
    } catch (error) {
      console.error("Error fetching teacher leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/marketplace/leaderboard/products", async (req, res) => {
    try {
      const items = await storage.getPublishedCoursework();
      const sorted = items.sort((a, b) => b.salesCount - a.salesCount);
      res.json(sorted.slice(0, 10));
    } catch (error) {
      console.error("Error fetching product leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/teachers", async (req, res) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });
  app2.get("/api/teachers/:id", async (req, res) => {
    try {
      const teacher = await storage.getTeacherById(req.params.id);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      const items = await storage.getCourseworkByTeacher(req.params.id);
      const publishedItems = items.filter((i) => i.isPublished);
      res.json({ ...teacher, courseworkItems: publishedItems });
    } catch (error) {
      console.error("Error fetching teacher:", error);
      res.status(500).json({ message: "Failed to fetch teacher" });
    }
  });
  app2.post("/api/user/role", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { role } = req.body;
      if (!role || !["teacher", "student"].includes(role)) {
        return res.status(400).json({ message: "Role must be 'teacher' or 'student'" });
      }
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      if (role === "teacher" && currentUser.userRole !== "teacher") {
        await storage.updateUserRole(userId, role);
        await storage.updateTeacherVerificationStatus(userId, "unverified");
        const updatedUser = await storage.getUser(userId);
        res.json({ ...updatedUser, passwordHash: void 0 });
      } else {
        const user = await storage.updateUserRole(userId, role);
        res.json({ ...user, passwordHash: void 0 });
      }
    } catch (error) {
      console.error("Error setting user role:", error);
      res.status(500).json({ message: "Failed to set role" });
    }
  });
  app2.patch("/api/user/profile", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { firstName, lastName } = req.body;
      const user = await storage.updateUserProfile(userId, { firstName, lastName });
      res.json({ ...user, passwordHash: void 0 });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.post("/api/user/change-password", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new passwords are required" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      const user = await storage.getUser(userId);
      if (!user || !user.passwordHash) {
        return res.status(400).json({ message: "Password change not available for this account type" });
      }
      const isValid = await import_bcrypt.default.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      const newHash = await import_bcrypt.default.hash(newPassword, BCRYPT_ROUNDS);
      await storage.updateUserPassword(userId, newHash);
      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
  app2.patch("/api/user/notifications", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { marketingEmailsOptIn, contentAlertsOptIn, teacherUpdatesOptIn } = req.body;
      const user = await storage.updateUserNotifications(userId, {
        marketingEmailsOptIn,
        contentAlertsOptIn,
        teacherUpdatesOptIn
      });
      res.json({ ...user, passwordHash: void 0 });
    } catch (error) {
      console.error("Error updating notifications:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });
  app2.put("/api/teacher/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user || user.userRole !== "teacher") {
        return res.status(403).json({ message: "Teacher access required" });
      }
      const { bio, subjectsTaught, experienceYears } = req.body;
      const updated = await storage.updateTeacherProfile(userId, {
        bio,
        subjectsTaught,
        experienceYears
      });
      res.json(updated);
    } catch (error) {
      console.error("Error updating teacher profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.get("/api/teacher/coursework", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user || user.userRole !== "teacher") {
        return res.status(403).json({ message: "Teacher access required" });
      }
      const items = await storage.getCourseworkByTeacher(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching teacher coursework:", error);
      res.status(500).json({ message: "Failed to fetch coursework" });
    }
  });
  app2.post("/api/teacher/coursework", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user || user.userRole !== "teacher") {
        return res.status(403).json({ message: "Teacher access required" });
      }
      const result = insertCourseworkItemSchema.safeParse({ ...req.body, teacherId: userId });
      if (!result.success) {
        return res.status(400).json({ message: (0, import_zod_validation_error.fromZodError)(result.error).message });
      }
      const item = await storage.createCoursework(result.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating coursework:", error);
      res.status(500).json({ message: "Failed to create coursework" });
    }
  });
  app2.put("/api/teacher/coursework/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      const id = parseInt(req.params.id);
      if (!user || user.userRole !== "teacher") {
        return res.status(403).json({ message: "Teacher access required" });
      }
      const existing = await storage.getCourseworkById(id);
      if (!existing || existing.teacherId !== userId) {
        return res.status(404).json({ message: "Coursework not found" });
      }
      const result = updateCourseworkItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: (0, import_zod_validation_error.fromZodError)(result.error).message });
      }
      const item = await storage.updateCoursework(id, result.data);
      res.json(item);
    } catch (error) {
      console.error("Error updating coursework:", error);
      res.status(500).json({ message: "Failed to update coursework" });
    }
  });
  app2.delete("/api/teacher/coursework/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      const id = parseInt(req.params.id);
      if (!user || user.userRole !== "teacher") {
        return res.status(403).json({ message: "Teacher access required" });
      }
      const existing = await storage.getCourseworkById(id);
      if (!existing || existing.teacherId !== userId) {
        return res.status(404).json({ message: "Coursework not found" });
      }
      await storage.deleteCoursework(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting coursework:", error);
      res.status(500).json({ message: "Failed to delete coursework" });
    }
  });
  return httpServer2;
}

// server/static.ts
var import_express = __toESM(require("express"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
function serveStatic(app2) {
  const distPath = import_path.default.resolve(process.cwd(), "client", "dist");
  if (!import_fs.default.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first with 'npm run build:client'`
    );
  }
  app2.use(import_express.default.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(import_path.default.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var import_http = require("http");
var app = (0, import_express2.default)();
var httpServer = (0, import_http.createServer)(app);
app.use(
  import_express2.default.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(import_express2.default.urlencoded({ extended: false }));
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await registerRoutes(httpServer, app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  serveStatic(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  log
});
