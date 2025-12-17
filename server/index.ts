import express from "express";
import session from "express-session";
import path from "path";
import { pool } from "./db";
import { registerActivityRoutes } from "./routes";
import connectPgSimple from "connect-pg-simple";

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const PORT = parseInt(process.env.PORT || (isProduction ? "5000" : "3001"), 10);

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
    },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(
        `${new Date().toLocaleTimeString()} [express] ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`
      );
    }
  });
  next();
});

registerActivityRoutes(app);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/auth/me", (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json({ id: userId, email: "user@example.com" });
});

app.get("/api/stories", async (req, res) => {
  res.json([]);
});

app.get("/api/games", async (req, res) => {
  res.json([]);
});

app.get("/api/videos", async (req, res) => {
  res.json([]);
});

if (isProduction) {
  const clientDistPath = path.resolve(process.cwd(), "client", "dist");
  app.use(express.static(clientDistPath));
  
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>WhyPals Dev</title></head>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h1>WhyPals Backend Running</h1>
          <p>Frontend is served by Vite dev server on the same port via proxy.</p>
          <p>API endpoints available at /api/*</p>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`${new Date().toLocaleTimeString()} [express] serving on port ${PORT}`);
});

export default app;
