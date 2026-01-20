import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cookieParser());
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
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

  app.get("/sitemap.xml", async (req, res) => {
    try {
      const stories = await storage.getPublishedStories();
      const videos = await storage.getAllVideos();
      const games = await storage.getAllGames();

      const baseUrl = `${req.protocol}://${req.get('host')}`;

      const staticRoutes = [
        "/",
        "/videos",
        "/games",
        "/about",
        "/contact"
      ];

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      // Static routes
      staticRoutes.forEach(route => {
        sitemap += `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
      });

      // Stories
      stories.forEach(story => {
        sitemap += `
  <url>
    <loc>${baseUrl}/story/${story.id}</loc>
    <lastmod>${new Date(story.updatedAt || story.publishedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });

      // Videos
      videos.forEach(video => {
        sitemap += `
  <url>
    <loc>${baseUrl}/video/${video.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      });

      // Games
      games.forEach(game => {
        sitemap += `
  <url>
    <loc>${baseUrl}/game/${game.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      });

      sitemap += `
</urlset>`;

      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  const isProduction = process.env.NODE_ENV === "production";
  const root = process.cwd();

  if (!isProduction) {
    const vite = await import("vite").then((m) =>
      m.createServer({
        server: { middlewareMode: true },
        appType: "custom",
        configFile: path.resolve(root, "client/vite.config.ts"),
      })
    );
    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(root, "client/index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
        const { html, dehydratedState, helmet } = await render(url);
        console.log("Helmet title:", helmet?.title?.toString());
        const helmetHead = `
          ${helmet.title.toString()}
          ${helmet.meta.toString()}
          ${helmet.link.toString()}
          ${helmet.script.toString()}
        `;
        console.log("Helmet head injected length:", helmetHead.length);
        const appHtml = template.replace(`<!--app-html-->`, html)
                                .replace(`<!--app-head-->`, helmetHead)
                                .replace(
                                  `<!--app-state-->`,
                                  `<script>window.__REACT_QUERY_STATE__ = ${JSON.stringify(dehydratedState)}</script>`
                                );
        res.status(200).set({ "Content-Type": "text/html" }).end(appHtml);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Production SSR setup would go here
    // For now, we can reuse the logic or set up a proper production build flow
     const dist = path.resolve(root, "client/dist");
     if (fs.existsSync(dist)) {
       app.use(express.static(dist, { index: false }));
       app.use("*", async (req, res, next) => {
         try {
           const url = req.originalUrl;
           const template = fs.readFileSync(path.resolve(dist, "index.html"), "utf-8");
           // In a real prod setup, you'd import the server entry built by Vite
           // const { render } = await import("./dist/server/entry-server.js");
           // For simplicity in this step, we might need a separate server build
           // or just serve static if SSR build isn't fully ready yet.
           // However, to fulfill the request, we should aim for SSR.
           // Let's assume a server build exists or fallback to client-side for now if complexities arise,
           // but the user explicitly requested SSR.
           
           // NOTE: Production SSR requires a server build. 
           // We'll update package.json to build server entry and then use it here.
           // For now, let's keep the structure ready for the build step update.
           res.sendFile(path.resolve(dist, "index.html"));
         } catch (e) {
           next(e);
         }
       });
     }
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "127.0.0.1",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
