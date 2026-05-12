import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/api/hero", (req, res) => {
  res.json({ en: { name: "Jose Ignacio", role: "Data Analyst & Developer" }, es: { name: "Jose Ignacio", role: "Analista de Datos & Desarrollador" } });
});

app.get("/api/status", (req, res) => res.json({ isAvailable: true }));
app.get("/api/projects", (req, res) => res.json([]));
app.get("/api/experience", (req, res) => res.json([]));
app.get("/api/skills", (req, res) => res.json({
  en: { title: "Skills", subtitle: "Technologies", categories: [{ name: "Languages", icon: "Code2", skills: ["TypeScript", "Python"] }] },
  es: { title: "Habilidades", subtitle: "Tecnologías", categories: [{ name: "Lenguajes", icon: "Code2", skills: ["TypeScript", "Python"] }] }
}));
app.get("/api/about", (req, res) => res.json({ en: { title: "About Me", description: "Full Stack Developer & Data Analyst" }, es: { title: "Sobre Mí", description: "Desarrollador Full Stack & Analista de Datos" } }));
app.get("/api/business", (req, res) => res.json({ en: { title: "Why Work With Me" }, es: { title: "Por Qué Trabajar Conmigo" } }));
app.get("/api/blog", (req, res) => res.json([]));

export default app;
