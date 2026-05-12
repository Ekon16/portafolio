import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'motion/react';
import { Menu, X, Terminal, Globe, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: t.nav.about, href: '#about' },
    { name: t.nav.projects, href: '#projects' },
    { name: t.nav.experience, href: '#experience' },
    { name: t.nav.skills, href: '#skills' },
    { name: t.nav.blog, href: '#blog' },
    { name: t.nav.contact, href: '#contact' },
  ];

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const scrollToSection = (href: string) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled || isOpen ? "bg-background/95 backdrop-blur-md border-b border-border py-4" : "bg-transparent py-6"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center space-x-2 group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Go to top">
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Terminal className="w-6 h-6" aria-hidden="true" />
            </div>
            <span className="font-bold text-xl tracking-tight">JoseIgnacio<span className="text-primary">.dev</span></span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </button>
            ))}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-secondary transition-colors flex items-center gap-2 text-sm font-medium"
              aria-label={`Switch language to ${language === 'en' ? 'Spanish' : 'English'}`}
            >
              <Globe className="w-4 h-4" />
              {language.toUpperCase()}
            </button>

            <button 
              onClick={() => scrollToSection('#contact')}
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {t.nav.getInTouch}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-secondary transition-colors flex items-center gap-2 text-sm font-medium"
              aria-label={`Switch language to ${language === 'en' ? 'Spanish' : 'English'}`}
            >
              <Globe className="w-4 h-4" />
              {language.toUpperCase()}
            </button>
            <button
              className="p-2 rounded-md hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background/95 backdrop-blur-md border-b border-border absolute top-full left-0 right-0 shadow-lg"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left px-4 py-3 text-lg font-medium text-foreground hover:text-primary hover:bg-secondary/50 rounded-md transition-colors active:bg-secondary"
                >
                  {item.name}
                </motion.button>
              ))}
              <div className="flex items-center gap-4 px-4 pt-2 border-t border-border">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/50 transition-colors"
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/50 transition-colors"
                  aria-label={`Switch language to ${language === 'en' ? 'Spanish' : 'English'}`}
                >
                  <Globe className="w-4 h-4" />
                  {language.toUpperCase()}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
