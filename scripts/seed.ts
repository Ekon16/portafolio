import { supabase } from '../src/lib/supabase';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

function readJSON(file: string) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

async function seed() {
  console.log('Seeding Supabase from local JSON files...');

  // 1. Hero
  const heroData = readJSON('hero.json');
  if (heroData) {
    for (const lang of ['en', 'es']) {
      if (heroData[lang]) {
        await supabase.from('hero').upsert({ language: lang, ...heroData[lang] }, { onConflict: 'language' });
      }
    }
    console.log('  ✓ Hero seeded');
  }

  // 2. About
  const aboutData = readJSON('about.json');
  if (aboutData) {
    for (const lang of ['en', 'es']) {
      if (aboutData[lang]) {
        await supabase.from('about').upsert({ language: lang, ...aboutData[lang] }, { onConflict: 'language' });
      }
    }
    console.log('  ✓ About seeded');
  }

  // 3. Business
  const businessData = readJSON('business.json');
  if (businessData) {
    for (const lang of ['en', 'es']) {
      if (businessData[lang]) {
        await supabase.from('business').upsert({ language: lang, ...businessData[lang] }, { onConflict: 'language' });
      }
    }
    console.log('  ✓ Business seeded');
  }

  // 4. Skills
  const skillsData = readJSON('skills.json');
  if (skillsData) {
    for (const lang of ['en', 'es']) {
      if (skillsData[lang]) {
        await supabase.from('skills').upsert({ language: lang, ...skillsData[lang] }, { onConflict: 'language' });
      }
    }
    console.log('  ✓ Skills seeded');
  }

  // 5. Projects
  const projectsData = readJSON('projects.json');
  if (projectsData && Array.isArray(projectsData)) {
    for (const project of projectsData) {
      await supabase.from('projects').upsert(project, { onConflict: 'id' });
    }
    console.log(`  ✓ ${projectsData.length} projects seeded`);
  }

  // 6. Experience
  const experienceData = readJSON('experience.json');
  if (experienceData && Array.isArray(experienceData)) {
    for (const exp of experienceData) {
      await supabase.from('experience').upsert(exp, { onConflict: 'id' });
    }
    console.log(`  ✓ ${experienceData.length} experiences seeded`);
  }

  // 7. Blog
  const blogData = readJSON('blog.json');
  if (blogData && Array.isArray(blogData)) {
    for (const post of blogData) {
      await supabase.from('blog_posts').upsert(post, { onConflict: 'id' });
    }
    console.log(`  ✓ ${blogData.length} blog posts seeded`);
  }

  // 8. Status
  const statusData = readJSON('status.json');
  if (statusData) {
    await supabase.from('status').upsert({ id: 1, is_available: statusData.isAvailable ?? true }, { onConflict: 'id' });
    console.log('  ✓ Status seeded');
  }

  console.log('\nSeed complete!');
}

seed().catch(console.error);
