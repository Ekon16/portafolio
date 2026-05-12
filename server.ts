import "express-async-errors";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import multer from "multer";
import dotenv from "dotenv";
import { supabase } from "./src/lib/supabase";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const isMain = process.argv[1] ? path.resolve(process.argv[1]) === __filename : false;

const PORT = parseInt(process.env.PORT || "3000", 10);
const UPLOADS_DIR = process.env.NODE_ENV === "production"
  ? path.join("/tmp", "uploads")
  : path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// --- Express App Setup ---
export const app = express();

const ADMIN_TOKEN = "demo-token";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "joseigna3002@";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.NODE_ENV === "production" ? "*" : "*" }));
app.use(bodyParser.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// --- Global error handler ---
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error. Check that Supabase env vars are configured.' });
});

// --- Middleware ---
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token === ADMIN_TOKEN) return next();
  res.status(401).json({ error: "Unauthorized" });
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const entry = rateLimitMap.get(key);
    if (entry && now < entry.resetTime) {
      if (entry.count >= maxRequests) return res.status(429).json({ error: "Too many requests" });
      entry.count++;
    } else {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    }
    next();
  };
}

function sanitize(s: string): string {
  return s.replace(/[<>{}]/g, "").trim();
}

// --- Upload ---
app.post("/api/upload", requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// --- Singleton read/write helpers ---
function singletonRead(table: string) {
  return async (_req: Request, res: Response) => {
    const { data, error } = await supabase.from(table).select('*');
    if (error) return res.status(500).json({ error: error.message });
    const en = data?.find((r: any) => r.language === 'en') || {};
    const es = data?.find((r: any) => r.language === 'es') || {};
    const { language: _1, ...enClean } = en;
    const { language: _2, ...esClean } = es;
    res.json({ en: enClean, es: esClean });
  };
}
function singletonWrite(table: string) {
  return async (req: Request, res: Response) => {
    const body = req.body;
    for (const lang of ['en', 'es']) {
      if (body[lang]) {
        const { error } = await supabase.from(table).upsert({ language: lang, ...body[lang] }, { onConflict: 'language' });
        if (error) return res.status(500).json({ error: error.message });
      }
    }
    res.json(body);
  };
}

// --- Routes ---
app.get("/api/hero", singletonRead('hero'));
app.post("/api/hero", requireAdmin, singletonWrite('hero'));
app.get("/api/about", singletonRead('about'));
app.post("/api/about", requireAdmin, singletonWrite('about'));
app.get("/api/skills", singletonRead('skills'));
app.post("/api/skills", requireAdmin, singletonWrite('skills'));
app.get("/api/business", singletonRead('business'));
app.post("/api/business", requireAdmin, singletonWrite('business'));

app.get("/api/status", async (_req, res) => {
  const { data, error } = await supabase.from('status').select('*').single();
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
  res.json({ isAvailable: data?.is_available ?? true });
});
app.post("/api/status", requireAdmin, async (req, res) => {
  const { isAvailable } = req.body;
  const { error } = await supabase.from('status').upsert({ id: 1, is_available: isAvailable }, { onConflict: 'id' });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, isAvailable });
});

app.get("/api/projects", async (_req, res) => {
  const { data, error } = await supabase.from('projects').select('*').order('id', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});
app.post("/api/projects", requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('projects').insert({ id: Date.now(), ...req.body }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.put("/api/projects/:id", requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('projects').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.delete("/api/projects/:id", requireAdmin, async (req, res) => {
  const { error } = await supabase.from('projects').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get("/api/experience", async (_req, res) => {
  const { data, error } = await supabase.from('experience').select('*').order('id', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});
app.post("/api/experience", requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('experience').insert({ id: Date.now(), ...req.body }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.put("/api/experience/:id", requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('experience').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.delete("/api/experience/:id", requireAdmin, async (req, res) => {
  const { error } = await supabase.from('experience').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get("/api/blog", async (_req, res) => {
  const { data, error } = await supabase.from('blog_posts').select('*').order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});
app.post("/api/blog", requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('blog_posts').insert({ id: Date.now(), ...req.body, tags: req.body.tags || [] }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.put("/api/blog/:id", requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('blog_posts').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.delete("/api/blog/:id", requireAdmin, async (req, res) => {
  const { error } = await supabase.from('blog_posts').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.post("/api/contact", rateLimit(3, 60000), async (req, res) => {
  const { name, email, message: msg } = req.body;
  if (!name || !email || !msg) return res.status(400).json({ error: "All fields required" });
  const { error } = await supabase.from('contacts').insert({
    id: Date.now(),
    name: sanitize(name),
    email: sanitize(email),
    message: sanitize(msg),
    created_at: new Date().toISOString(),
  });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.post("/api/login", rateLimit(5, 60000), (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// --- Start server (local dev only) ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.get("*", (_req, res) => {
      res.sendFile(path.join(process.cwd(), "index.html"));
    });
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) return res.status(404).json({ error: "Not found" });
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server if this is the main module (not when imported by Vercel API)
if (isMain) {
  startServer();
}
