import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Edit, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { TerminalGame } from '@/components/ui/TerminalGame';
import type { HeroData } from '@/types';

export function Hero() {
  const { isAdmin, getAuthHeaders } = useAdmin();
  const { t, language } = useLanguage();
  const { addToast } = useToast();
  const [isAvailable, setIsAvailable] = useState(true);
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState({ role: '', name: '', surname: '' });

  useEffect(() => {
    Promise.all([
      fetch('/data/status.json').then(res => res.json()).then(data => setIsAvailable(data.isAvailable)),
      fetch('/data/hero.json').then(res => res.json()).then(data => setHeroData(data)),
    ]).catch(err => console.error('Failed to fetch data', err))
      .finally(() => setIsLoading(false));
  }, []);

  const toggleStatus = async () => {
    try {
      const newStatus = !isAvailable;
      await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ isAvailable: newStatus }),
      });
      setIsAvailable(newStatus);
      addToast(newStatus ? 'Status set to available' : 'Status set to unavailable', 'success');
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleEdit = () => {
    setEditForm({
      role: heroData?.[language]?.role || t.hero.role,
      name: heroData?.[language]?.name || "Jose Ignacio",
      surname: heroData?.[language]?.surname || "Godino"
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const newData = {
        ...heroData,
        [language]: {
          ...heroData?.[language],
          role: editForm.role,
          name: editForm.name,
          surname: editForm.surname
        }
      };

      await fetch('/api/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(newData),
      });

      setHeroData(newData);
      setIsEditing(false);
      addToast('Hero section updated', 'success');
    } catch (error) {
      addToast('Failed to save hero data', 'error');
    }
  };

  const currentRole = heroData?.[language]?.role || t.hero.role;
  const currentName = heroData?.[language]?.name || "Jose Ignacio";
  const currentSurname = heroData?.[language]?.surname || "Godino";

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-20">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-5xl w-full mx-auto z-10 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center lg:text-left space-y-6"
        >
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-6 w-40 mx-auto lg:mx-0" />
              <Skeleton className="h-16 w-full max-w-lg" />
              <Skeleton className="h-6 w-80 mx-auto lg:mx-0" />
              <div className="flex gap-4 pt-4 justify-center lg:justify-start">
                <Skeleton className="h-12 w-32 rounded-md" />
                <Skeleton className="h-12 w-32 rounded-md" />
              </div>
            </div>
          ) : (
          <>
          <div className="inline-flex items-center gap-2">
            <div className="inline-flex items-center rounded-full border border-border bg-secondary/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
              <span className={cn("flex h-2 w-2 rounded-full mr-2 animate-pulse", isAvailable ? "bg-emerald-500" : "bg-red-500")}></span>
              {isAvailable ? t.hero.available : t.hero.unavailable}
            </div>
            {isAdmin && (
              <button onClick={toggleStatus} className="p-1 rounded-full hover:bg-secondary transition-colors" title="Toggle Status">
                <Edit className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          
          <div className="relative group">
            {isEditing ? (
              <div className="space-y-2 mb-4">
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2 rounded border bg-background text-3xl font-bold"
                  placeholder="Name"
                />
                <input
                  value={editForm.surname}
                  onChange={(e) => setEditForm({ ...editForm, surname: e.target.value })}
                  className="w-full p-2 rounded border bg-background text-3xl font-bold text-primary"
                  placeholder="Surname"
                />
              </div>
            ) : (
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                {currentName} <br />
                <span className="text-gradient">{currentSurname}</span>
              </h1>
            )}
          </div>
          
          <div className="relative group">
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full p-2 rounded border bg-background text-xl"
                  rows={3}
                  placeholder="Role / Subtitle"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setIsEditing(false)} className="p-2 rounded bg-secondary hover:bg-secondary/80"><X className="w-4 h-4" /></button>
                  <button onClick={handleSave} className="p-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"><Save className="w-4 h-4" /></button>
                </div>
              </div>
            ) : (
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {currentRole}
                {isAdmin && (
                  <button onClick={handleEdit} className="ml-2 inline-block p-1 rounded hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <button 
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {t.hero.viewProjects}
            </button>
            <button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-transparent px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {t.hero.contactMe}
            </button>
          </div>
          </>
          )}
        </motion.div>

        {/* Interactive Terminal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative w-full max-w-lg mx-auto"
        >
          <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-xs text-muted-foreground font-mono">bash — 80x24</div>
            </div>

            {/* Terminal Game Component */}
            <TerminalGame />
          </div>
          
          {/* Decorative Elements behind terminal */}
          <div className="absolute -z-10 -inset-4 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-2xl opacity-50 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
