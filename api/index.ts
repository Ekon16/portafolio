import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const ADMIN_TOKEN = "demo-token";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "joseigna3002@";

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token === ADMIN_TOKEN) return next();
  res.status(401).json({ error: "Unauthorized" });
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function rateLimit(maxRequests: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
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

function singletonRead(table: string) {
  return async (_req: express.Request, res: express.Response) => {
    try {
      const { data, error } = await supabase.from(table).select("*");
      if (error) return res.status(500).json({ error: error.message });
      const en = data?.find((r: any) => r.language === "en") || {};
      const es = data?.find((r: any) => r.language === "es") || {};
      const { language: _1, ...enClean } = en;
      const { language: _2, ...esClean } = es;
      res.json({ en: enClean, es: esClean });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Database error" });
    }
  };
}

app.get("/api/hero", singletonRead("hero"));
app.get("/api/about", singletonRead("about"));
app.get("/api/skills", singletonRead("skills"));
app.get("/api/business", singletonRead("business"));

app.get("/api/status", async (_req, res) => {
  try {
    const { data, error } = await supabase.from("status").select("*").single();
    if (error && error.code !== "PGRST116") return res.status(500).json({ error: error.message });
    res.json({ isAvailable: data?.is_available ?? true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

app.get("/api/projects", async (_req, res) => {
  try {
    const { data, error } = await supabase.from("projects").select("*").order("id", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

app.get("/api/experience", async (_req, res) => {
  try {
    const { data, error } = await supabase.from("experience").select("*").order("id", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

app.get("/api/blog", async (_req, res) => {
  try {
    const { data, error } = await supabase.from("blog_posts").select("*").order("id", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

app.post("/api/contact", rateLimit(3, 60000), async (req, res) => {
  const { name, email, message: msg } = req.body;
  if (!name || !email || !msg) return res.status(400).json({ error: "All fields required" });
  try {
    const { error } = await supabase.from("contacts").insert({
      id: Date.now(),
      name: sanitize(name),
      email: sanitize(email),
      message: sanitize(msg),
      created_at: new Date().toISOString(),
    });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Database error" });
  }
});

app.post("/api/login", rateLimit(5, 60000), (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

export default app;
