export interface Project {
  id?: number;
  title: string;
  description: string;
  tags: string[];
  metrics: string;
  link: string;
  github: string;
  image?: string;
  className?: string;
  features?: string[];
}

export interface Experience {
  id?: number;
  company: string;
  role: string;
  period: string;
  achievements: string[];
}

export interface SkillCategory {
  name: string;
  skills: string[];
  icon: string;
}

export interface HeroData {
  en: { name: string; surname: string; role: string };
  es: { name: string; surname: string; role: string };
}

export interface AboutData {
  en: { title: string; description: string; specialization: string };
  es: { title: string; description: string; specialization: string };
}

export interface BusinessData {
  en: { title: string; subtitle: string; cards: { title: string; description: string }[] };
  es: { title: string; subtitle: string; cards: { title: string; description: string }[] };
}

export interface SkillsData {
  en: { title: string; subtitle: string; categories: SkillCategory[] };
  es: { title: string; subtitle: string; categories: SkillCategory[] };
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  link: string;
  content?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}
