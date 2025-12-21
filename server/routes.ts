import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomBytes, createHash } from "crypto";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { 
  insertVideoSchema, 
  updateVideoSchema, 
  insertStorySchema, 
  updateStorySchema, 
  insertStoryGameSchema, 
  updateStoryGameSchema, 
  insertCourseworkItemSchema, 
  updateCourseworkItemSchema,
  type InsertVideo, 
  type InsertStory, 
  type InsertStoryGame, 
  type InsertCourseworkItem 
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { listVideos, getVideoSignedUrl, getImageUploadUrl, getImageSignedUrl, uploadImageToR2, uploadFileToR2, getFileFromR2 } from "./r2";
import multer from "multer";

const BCRYPT_ROUNDS = 12;

const MURF_API_KEY = process.env.MURF_API_KEY;
const MURF_VOICE_ID = process.env.MURF_VOICE_ID || "en-US-natalie";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
let timestampsEndpointAvailable = true;
let timestampsLastChecked = 0;
const TIMESTAMPS_RETRY_INTERVAL = 5 * 60 * 1000; // Retry timestamps endpoint every 5 minutes

const adminSessions = new Map<string, { expiresAt: number }>();
const ADMIN_SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

function generateAdminToken(): string {
  return randomBytes(32).toString('hex');
}

function isValidAdminSession(req: any): boolean {
  const token = req.headers['x-admin-token'] || req.cookies?.adminToken;
  if (!token) return false;
  
  const session = adminSessions.get(token);
  if (!session) return false;
  
  if (Date.now() > session.expiresAt) {
    adminSessions.delete(token);
    return false;
  }
  
  return true;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Get user ID from session (email/password auth)
function getUserIdFromRequest(req: any): string | null {
  if (req.session?.userId) {
    return req.session.userId;
  }
  return null;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/admin/login', async (req: any, res) => {
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

  app.get('/api/admin/session', async (req: any, res) => {
    if (isValidAdminSession(req)) {
      return res.json({ valid: true });
    }
    return res.status(401).json({ valid: false, message: "Session expired or invalid" });
  });

  // Admin: Get pending teacher verification requests
  app.get('/api/admin/teacher-verifications', async (req: any, res) => {
    if (!isValidAdminSession(req)) {
      return res.status(401).json({ message: "Admin authentication required" });
    }
    try {
      const pendingTeachers = await storage.getPendingVerificationRequests();
      res.json(pendingTeachers.map(t => ({ ...t, passwordHash: undefined })));
    } catch (error) {
      console.error("Error fetching pending verifications:", error);
      res.status(500).json({ message: "Failed to fetch pending verifications" });
    }
  });

  // Admin: Approve or reject teacher verification
  app.post('/api/admin/teacher-verifications/:userId', async (req: any, res) => {
    if (!isValidAdminSession(req)) {
      return res.status(401).json({ message: "Admin authentication required" });
    }
    try {
      const { userId } = req.params;
      const { action } = req.body;
      
      if (!action || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: "Action must be 'approve' or 'reject'" });
      }
      
      const status = action === 'approve' ? 'verified' : 'rejected';
      const user = await storage.updateTeacherVerificationStatus(userId, status);
      res.json({ success: true, user: { ...user, passwordHash: undefined } });
    } catch (error) {
      console.error("Error updating verification status:", error);
      res.status(500).json({ message: "Failed to update verification status" });
    }
  });

  // Email/Password Auth Endpoints
  app.post('/api/auth/register', async (req: any, res) => {
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
      
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      
      const user = await storage.upsertUser({
        email: email.toLowerCase(),
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        userRole: null,
        agreedToTerms: true,
        agreedToTermsAt: new Date(),
      });
      
      req.session.userId = user.id;
      req.session.authType = 'email';
      
      req.session.save((err: any) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Registration failed" });
        }
        res.status(201).json({ 
          success: true, 
          user: { ...user, passwordHash: undefined },
          needsRoleSelection: !user.userRole
        });
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email.toLowerCase());
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      req.session.userId = user.id;
      req.session.authType = 'email';
      
      req.session.save((err: any) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ 
          success: true, 
          user: { ...user, passwordHash: undefined },
          needsRoleSelection: !user.userRole
        });
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/logout', async (req: any, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
      });
    } catch (error) {
      console.error("Error logging out:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.get('/api/auth/logout', async (req: any, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
      });
    } catch (error) {
      console.error("Error logging out:", error);
      res.redirect('/login');
    }
  });

  app.patch('/api/auth/role', async (req: any, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { role } = req.body;
      if (!role || !['teacher', 'student'].includes(role)) {
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
        user: { ...updatedUser, passwordHash: undefined }
      });
    } catch (error) {
      console.error("Error setting role:", error);
      res.status(500).json({ message: "Failed to set role" });
    }
  });

  app.post('/api/auth/request-verification', async (req: any, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.userRole !== 'teacher') {
        return res.status(400).json({ message: "Only teachers can request verification" });
      }
      
      if (user.teacherVerificationStatus === 'verified') {
        return res.status(400).json({ message: "You are already verified" });
      }
      
      const updatedUser = await storage.requestTeacherVerification(userId);
      res.json({ 
        success: true, 
        user: { ...updatedUser, passwordHash: undefined },
        message: "Verification request submitted. Our team will review your profile."
      });
    } catch (error) {
      console.error("Error requesting verification:", error);
      res.status(500).json({ message: "Failed to request verification" });
    }
  });

  app.get('/api/auth/me', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ ...user, passwordHash: undefined });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/videos', async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get('/api/videos/featured', async (req, res) => {
    try {
      const videos = await storage.getFeaturedVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching featured videos:", error);
      res.status(500).json({ message: "Failed to fetch featured videos" });
    }
  });

  app.get('/api/videos/:id', async (req, res) => {
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

  app.post('/api/videos', isAuthenticated, async (req: any, res) => {
    try {
      const result = insertVideoSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      const userId = req.session.userId;
      const videoData = result.data as z.infer<typeof insertVideoSchema>;
      const video = await storage.createVideo({
        ...videoData,
        uploadedBy: userId,
      });
      res.status(201).json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  app.post('/api/subscribe', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { plan } = req.body;

      if (!plan || !['basic', 'premium', 'family'].includes(plan)) {
        return res.status(400).json({ message: "Invalid subscription plan" });
      }

      const subscription = await storage.createSubscription({
        userId,
        plan,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const updatedUser = await storage.updateUserSubscription(userId, true, plan);

      res.json({ subscription, user: updatedUser });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.delete('/api/subscribe', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const subscription = await storage.getUserSubscription(userId);
      res.json(subscription || null);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.get('/api/activity/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const activity = await storage.getTodayActivity(userId);
      res.json(activity || { readingTimeSeconds: 0, watchingTimeSeconds: 0, playingTimeSeconds: 0 });
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  app.post('/api/activity/track', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { activityType, seconds } = req.body;
      
      if (!['reading', 'watching', 'playing'].includes(activityType)) {
        return res.status(400).json({ message: "Invalid activity type" });
      }
      if (typeof seconds !== 'number' || seconds < 0) {
        return res.status(400).json({ message: "Invalid seconds value" });
      }
      
      const activity = await storage.addActivityTime(userId, activityType, seconds);
      res.json(activity);
    } catch (error) {
      console.error("Error tracking activity:", error);
      res.status(500).json({ message: "Failed to track activity" });
    }
  });

  app.get('/api/points', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const points = await storage.getUserPoints(userId);
      res.json({ points });
    } catch (error) {
      console.error("Error fetching points:", error);
      res.status(500).json({ message: "Failed to fetch points" });
    }
  });

  app.post('/api/points/add', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { points } = req.body;
      
      if (typeof points !== 'number' || points <= 0) {
        return res.status(400).json({ message: "Invalid points value" });
      }
      
      const user = await storage.addUserPoints(userId, points);
      res.json({ points: user.points });
    } catch (error) {
      console.error("Error adding points:", error);
      res.status(500).json({ message: "Failed to add points" });
    }
  });

  app.get('/api/r2/videos', isAuthenticated, async (req, res) => {
    try {
      const videos = await listVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error listing R2 videos:", error);
      res.status(500).json({ message: "Failed to list videos from storage" });
    }
  });

  app.get('/api/r2/videos/:key(*)', isAuthenticated, async (req, res) => {
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

  app.get('/api/r2/metadata', isAuthenticated, async (req, res) => {
    try {
      const metadata = await storage.getAllR2VideoMetadata();
      res.json(metadata);
    } catch (error) {
      console.error("Error fetching R2 metadata:", error);
      res.status(500).json({ message: "Failed to fetch video metadata" });
    }
  });

  app.get('/api/r2/metadata/:key(*)', isAuthenticated, async (req, res) => {
    try {
      const key = req.params.key;
      const metadata = await storage.getR2VideoMetadataByKey(key);
      res.json(metadata || null);
    } catch (error) {
      console.error("Error fetching R2 metadata:", error);
      res.status(500).json({ message: "Failed to fetch video metadata" });
    }
  });

  app.post('/api/r2/metadata', async (req: any, res) => {
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
        category,
      });
      res.json(metadata);
    } catch (error) {
      console.error("Error saving R2 metadata:", error);
      res.status(500).json({ message: "Failed to save video metadata" });
    }
  });

  app.delete('/api/r2/metadata/:key(*)', async (req: any, res) => {
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

  // Story routes - public
  app.get('/api/stories', async (req, res) => {
    try {
      const stories = await storage.getPublishedStories();
      res.json(stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.get('/api/stories/featured', async (req, res) => {
    try {
      const stories = await storage.getFeaturedStories();
      res.json(stories);
    } catch (error) {
      console.error("Error fetching featured stories:", error);
      res.status(500).json({ message: "Failed to fetch featured stories" });
    }
  });

  app.get('/api/stories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        const story = await storage.getStoryBySlug(req.params.id);
        if (!story) {
          return res.status(404).json({ message: "Story not found" });
        }
        return res.json(story);
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

  // Image upload for story thumbnails - admin only (server-side upload to avoid CORS)
  app.post('/api/admin/upload/image', upload.single('image'), async (req: any, res) => {
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
        'story-thumbnails'
      );
      
      const imageUrl = `/api/images/${key}`;
      res.json({ imageUrl, key });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Image upload for game images - admin only
  app.post('/api/admin/upload/game-image', upload.single('image'), async (req: any, res) => {
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
        'game-images'
      );
      
      const imageUrl = `/api/images/${key}`;
      res.json({ imageUrl, key });
    } catch (error) {
      console.error("Error uploading game image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Image upload for story content images - admin only
  app.post('/api/admin/upload/story-content-image', upload.single('image'), async (req: any, res) => {
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
        'story-content'
      );
      
      const imageUrl = `/api/images/${key}`;
      res.json({ imageUrl, key });
    } catch (error) {
      console.error("Error uploading story content image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Image upload for video thumbnails - admin only
  app.post('/api/admin/upload/video-thumbnail', upload.single('image'), async (req: any, res) => {
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
        'video-thumbnails'
      );
      
      const imageUrl = `/api/images/${key}`;
      res.json({ imageUrl, key });
    } catch (error) {
      console.error("Error uploading video thumbnail:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Allowed image folders for access
  const ALLOWED_IMAGE_FOLDERS = ['story-thumbnails', 'game-images', 'story-content', 'video-thumbnails'];

  app.get('/api/images/:key(*)', async (req, res) => {
    try {
      const key = req.params.key;
      const isAllowed = ALLOWED_IMAGE_FOLDERS.some(folder => key.startsWith(`${folder}/`));
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

  // Story routes - admin only
  app.get('/api/admin/stories', async (req: any, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const stories = await storage.getAllStories();
      res.json(stories);
    } catch (error) {
      console.error("Error fetching admin stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.post('/api/admin/stories', async (req: any, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const result = insertStorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }

      const storyData = result.data as z.infer<typeof insertStorySchema>;
      const story = await storage.createStory({
        ...storyData,
        authorId: null,
        publishedAt: storyData.isPublished ? new Date() : null,
      });
      res.status(201).json(story);
    } catch (error) {
      console.error("Error creating story:", error);
      res.status(500).json({ message: "Failed to create story" });
    }
  });

  app.put('/api/admin/stories/:id', async (req: any, res) => {
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
        return res.status(400).json({ message: fromZodError(result.error).message });
      }

      const storyUpdateData = result.data as z.infer<typeof updateStorySchema>;
      const updateData: any = { ...storyUpdateData };
      if (storyUpdateData.isPublished && !existing.isPublished) {
        updateData.publishedAt = new Date();
      }

      const story = await storage.updateStory(id, updateData);
      res.json(story);
    } catch (error) {
      console.error("Error updating story:", error);
      res.status(500).json({ message: "Failed to update story" });
    }
  });

  app.delete('/api/admin/stories/:id', async (req: any, res) => {
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

  // Admin Video Routes
  app.get('/api/admin/videos', async (req: any, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching admin videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.post('/api/admin/videos', async (req: any, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const result = insertVideoSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }

      const videoData = result.data as z.infer<typeof insertVideoSchema>;
      const video = await storage.createVideo({
        ...videoData,
        uploadedBy: null,
      });
      res.status(201).json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  app.put('/api/admin/videos/:id', async (req: any, res) => {
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
        return res.status(400).json({ message: fromZodError(result.error).message });
      }

      const videoUpdateData = result.data as z.infer<typeof updateVideoSchema>;
      const video = await storage.updateVideo(id, videoUpdateData);
      res.json(video);
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });

  app.delete('/api/admin/videos/:id', async (req: any, res) => {
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

  // Admin Game Routes
  app.get('/api/games', async (req, res) => {
    try {
      const games = await storage.getActiveGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get('/api/games/featured', async (req, res) => {
    try {
      const games = await storage.getFeaturedGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching featured games:", error);
      res.status(500).json({ message: "Failed to fetch featured games" });
    }
  });

  app.get('/api/games/:id', async (req, res) => {
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

  app.get('/api/games/by-story/:storyTitle', async (req, res) => {
    try {
      const storyTitle = decodeURIComponent(req.params.storyTitle);
      const games = await storage.getGamesByStoryTitle(storyTitle);
      res.json(games);
    } catch (error) {
      console.error("Error fetching games by story:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get('/api/admin/games', async (req: any, res) => {
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

  app.post('/api/admin/games', async (req: any, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const result = insertStoryGameSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }

      const gameData = result.data as z.infer<typeof insertStoryGameSchema>;
      const game = await storage.createGame(gameData);
      res.status(201).json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  app.put('/api/admin/games/:id', async (req: any, res) => {
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
        return res.status(400).json({ message: fromZodError(result.error).message });
      }

      const gameData = result.data as z.infer<typeof updateStoryGameSchema>;
      const game = await storage.updateGame(id, gameData);
      res.json(game);
    } catch (error) {
      console.error("Error updating game:", error);
      res.status(500).json({ message: "Failed to update game" });
    }
  });

  app.delete('/api/admin/games/:id', async (req: any, res) => {
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

  // Points API for games
  app.post('/api/games/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const { score } = req.body;
      const userId = req.session.userId;

      const game = await storage.getGameById(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const pointsEarned = Math.round((score / 100) * game.pointsReward);
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

  app.post('/api/admin/generate-audio', async (req: any, res) => {
    try {
      if (!isValidAdminSession(req)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Text is required" });
      }

      if (!MURF_API_KEY) {
        return res.status(500).json({ message: "Murf API key not configured" });
      }

      // Generate hash of the text to use as key
      const hash = createHash('md5').update(text).digest('hex');
      const audioKey = `tts/${hash}.mp3`;
      const jsonKey = `tts/${hash}.json`;

      // Check if already exists - DISABLED to allow overwrite
      // const existingAudio = await getFileFromR2(audioKey);
      // const existingJson = await getFileFromR2(jsonKey);

      // if (existingAudio && existingJson) {
      //   return res.json({ 
      //     success: true, 
      //     cached: true,
      //     audioUrl: `/api/text-to-speech/audio/${hash}`,
      //     jsonUrl: `/api/text-to-speech/json/${hash}`
      //   });
      // }

      // If not exists, generate from Murf AI
      console.log("Generating audio for text hash:", hash);
      const timestampsResponse = await fetch(
        `https://api.murf.ai/v1/speech/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': MURF_API_KEY,
          },
          body: JSON.stringify({
            text,
            voiceId: MURF_VOICE_ID,
            format: 'MP3',
            encodeAsBase64: true,
            rate: -15 // Slower speed for kids
          }),
        }
      );

      if (!timestampsResponse.ok) {
        const errorText = await timestampsResponse.text();
        console.error("Murf API error:", errorText);
        
        let errorMessage = "Failed to generate speech from Murf AI";
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.errorMessage) {
            errorMessage = errorJson.errorMessage;
          }
        } catch (e) {
          // Keep default message if parsing fails
        }
        
        return res.status(timestampsResponse.status).json({ message: errorMessage });
      }

      const data = await timestampsResponse.json();
      
      // Process timestamps
      // Murf returns wordDurations array with startMs and endMs
      const wordDurations = data.wordDurations || [];
      const words = wordDurations.map((w: any) => ({
        word: w.word,
        start: w.startMs / 1000,
        end: w.endMs / 1000
      }));
      
      const duration = data.audioLengthInSeconds || (words.length > 0 ? words[words.length - 1].end : 0);
      const metadata = {
        words,
        duration,
        hasWordTiming: words.length > 0,
        text
      };

      // Upload to R2
      if (!data.encodedAudio) {
        throw new Error("No audio data received from Murf AI");
      }

      const audioBuffer = Buffer.from(data.encodedAudio, 'base64');
      const jsonBuffer = Buffer.from(JSON.stringify(metadata));

      await uploadFileToR2(audioBuffer, audioKey, 'audio/mpeg');
      await uploadFileToR2(jsonBuffer, jsonKey, 'application/json');

      res.json({
        success: true,
        cached: false,
        audioUrl: `/api/text-to-speech/audio/${hash}`,
        jsonUrl: `/api/text-to-speech/json/${hash}`
      });

    } catch (error) {
      console.error("Error generating speech:", error);
      res.status(500).json({ message: "Failed to generate speech" });
    }
  });

  // Public read-only endpoint that ONLY serves cached content
  app.post('/api/text-to-speech', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Text is required" });
      }

      // Generate hash of the text to find key
      const hash = createHash('md5').update(text).digest('hex');
      const audioKey = `tts/${hash}.mp3`;
      const jsonKey = `tts/${hash}.json`;

      // Check if exists
      const audioBuffer = await getFileFromR2(audioKey);
      const jsonBuffer = await getFileFromR2(jsonKey);

      if (!audioBuffer || !jsonBuffer) {
        // DO NOT GENERATE - Return 404
        return res.status(404).json({ message: "Audio not generated yet" });
      }

      const metadata = JSON.parse(jsonBuffer.toString());
      const audioBase64 = audioBuffer.toString('base64');

      res.json({
        audio: audioBase64,
        words: metadata.words,
        duration: metadata.duration,
        hasWordTiming: metadata.hasWordTiming
      });

    } catch (error) {
      console.error("Error retrieving speech:", error);
      res.status(500).json({ message: "Failed to retrieve speech" });
    }
  });

  // ========== TEACHER COURSEWORK MARKETPLACE ==========
  
  // Public marketplace routes
  app.get('/api/marketplace', async (req, res) => {
    try {
      const items = await storage.getPublishedCoursework();
      res.json(items);
    } catch (error) {
      console.error("Error fetching marketplace items:", error);
      res.status(500).json({ message: "Failed to fetch marketplace items" });
    }
  });

  app.get('/api/marketplace/:id', async (req, res) => {
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

  // Leaderboard - top teachers and products (placeholder data)
  app.get('/api/marketplace/leaderboard/teachers', async (req, res) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers.slice(0, 10));
    } catch (error) {
      console.error("Error fetching teacher leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get('/api/marketplace/leaderboard/products', async (req, res) => {
    try {
      const items = await storage.getPublishedCoursework();
      const sorted = items.sort((a, b) => b.salesCount - a.salesCount);
      res.json(sorted.slice(0, 10));
    } catch (error) {
      console.error("Error fetching product leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Teacher profile routes
  app.get('/api/teachers', async (req, res) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  app.get('/api/teachers/:id', async (req, res) => {
    try {
      const teacher = await storage.getTeacherById(req.params.id);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      const items = await storage.getCourseworkByTeacher(req.params.id);
      const publishedItems = items.filter(i => i.isPublished);
      res.json({ ...teacher, courseworkItems: publishedItems });
    } catch (error) {
      console.error("Error fetching teacher:", error);
      res.status(500).json({ message: "Failed to fetch teacher" });
    }
  });

  // User role change (supports both auth methods)
  app.post('/api/user/role', async (req: any, res) => {
    try {
      // Support session-based authentication
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { role } = req.body;
      if (!role || !['teacher', 'student'].includes(role)) {
        return res.status(400).json({ message: "Role must be 'teacher' or 'student'" });
      }
      
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If changing to teacher, reset verification status
      if (role === 'teacher' && currentUser.userRole !== 'teacher') {
        await storage.updateUserRole(userId, role);
        await storage.updateTeacherVerificationStatus(userId, 'unverified');
        const updatedUser = await storage.getUser(userId);
        res.json({ ...updatedUser, passwordHash: undefined });
      } else {
        const user = await storage.updateUserRole(userId, role);
        res.json({ ...user, passwordHash: undefined });
      }
    } catch (error) {
      console.error("Error setting user role:", error);
      res.status(500).json({ message: "Failed to set role" });
    }
  });

  // User profile update (supports both auth methods)
  app.patch('/api/user/profile', async (req: any, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { firstName, lastName } = req.body;
      const user = await storage.updateUserProfile(userId, { firstName, lastName });
      res.json({ ...user, passwordHash: undefined });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // User password change (supports both auth methods)
  app.post('/api/user/change-password', async (req: any, res) => {
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
      
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
      await storage.updateUserPassword(userId, newHash);
      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // User notification preferences (supports both auth methods)
  app.patch('/api/user/notifications', async (req: any, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { marketingEmailsOptIn, contentAlertsOptIn, teacherUpdatesOptIn } = req.body;
      const user = await storage.updateUserNotifications(userId, {
        marketingEmailsOptIn,
        contentAlertsOptIn,
        teacherUpdatesOptIn,
      });
      res.json({ ...user, passwordHash: undefined });
    } catch (error) {
      console.error("Error updating notifications:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  // Teacher profile update
  app.put('/api/teacher/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.userRole !== 'teacher') {
        return res.status(403).json({ message: "Teacher access required" });
      }
      
      const { bio, subjectsTaught, experienceYears } = req.body;
      const updated = await storage.updateTeacherProfile(userId, {
        bio,
        subjectsTaught,
        experienceYears,
      });
      res.json(updated);
    } catch (error) {
      console.error("Error updating teacher profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Teacher coursework CRUD
  app.get('/api/teacher/coursework', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.userRole !== 'teacher') {
        return res.status(403).json({ message: "Teacher access required" });
      }
      
      const items = await storage.getCourseworkByTeacher(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching teacher coursework:", error);
      res.status(500).json({ message: "Failed to fetch coursework" });
    }
  });

  app.post('/api/teacher/coursework', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.userRole !== 'teacher') {
        return res.status(403).json({ message: "Teacher access required" });
      }
      
      const result = insertCourseworkItemSchema.safeParse({ ...req.body, teacherId: userId });
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      
      const item = await storage.createCoursework(result.data as InsertCourseworkItem);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating coursework:", error);
      res.status(500).json({ message: "Failed to create coursework" });
    }
  });

  app.put('/api/teacher/coursework/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      const id = parseInt(req.params.id);
      
      if (!user || user.userRole !== 'teacher') {
        return res.status(403).json({ message: "Teacher access required" });
      }
      
      const existing = await storage.getCourseworkById(id);
      if (!existing || existing.teacherId !== userId) {
        return res.status(404).json({ message: "Coursework not found" });
      }
      
      const result = updateCourseworkItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      
      const item = await storage.updateCoursework(id, result.data as Partial<InsertCourseworkItem>);
      res.json(item);
    } catch (error) {
      console.error("Error updating coursework:", error);
      res.status(500).json({ message: "Failed to update coursework" });
    }
  });

  app.delete('/api/teacher/coursework/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      const id = parseInt(req.params.id);
      
      if (!user || user.userRole !== 'teacher') {
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

  return httpServer;
}
