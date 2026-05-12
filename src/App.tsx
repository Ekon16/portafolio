import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Projects } from '@/components/sections/Projects';
import { ExperienceSection } from '@/components/sections/Experience';
import { Skills } from '@/components/sections/Skills';
import { Blog } from '@/components/sections/Blog';
import { NonTechSummary } from '@/components/sections/NonTechSummary';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/Footer';
import { AdminProvider } from '@/context/AdminContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { BackToTop } from '@/components/ui/BackToTop';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AdminProvider>
          <LanguageProvider>
            <ToastProvider>
              <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30">
                <ScrollProgress />
                <Navbar />
                <main>
                  <Hero />
                  <About />
                  <Projects />
                  <NonTechSummary />
                  <ExperienceSection />
                  <Skills />
                  <Blog />
                  <Contact />
                </main>
                <Footer />
                <BackToTop />
              </div>
            </ToastProvider>
          </LanguageProvider>
        </AdminProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
