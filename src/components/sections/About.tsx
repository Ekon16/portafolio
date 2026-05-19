import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';
import { useAdmin } from '@/context/AdminContext';
import { useToast } from '@/context/ToastContext';
import { Download, Edit, Save, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import type { AboutData } from '@/types';

export function About() {
  const { t, language } = useLanguage();
  const { isAdmin, getAuthHeaders } = useAdmin();
  const { addToast } = useToast();
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', specialization: '' });

  useEffect(() => {
    fetch('/data/about.json')
      .then(res => res.json())
      .then(data => setAboutData(data))
      .catch(err => console.error('Failed to fetch about data', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleEdit = () => {
    setEditForm({
      title: aboutData?.[language]?.title || t.about.title,
      description: aboutData?.[language]?.description || t.about.description,
      specialization: aboutData?.[language]?.specialization || "I specialize in turning complex data into actionable insights and securing digital infrastructures..."
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const newData = {
        ...aboutData,
        [language]: {
          ...aboutData?.[language],
          title: editForm.title,
          description: editForm.description,
          specialization: editForm.specialization
        }
      };

      await fetch('/api/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(newData),
      });

      setAboutData(newData);
      setIsEditing(false);
      addToast('About section updated', 'success');
    } catch (error) {
      addToast('Failed to save about data', 'error');
      console.error('Failed to save about data', error);
    }
  };

  const currentTitle = aboutData?.[language]?.title || t.about.title;
  const currentDesc = aboutData?.[language]?.description || t.about.description;
  const currentSpec = aboutData?.[language]?.specialization || "I specialize in turning complex data into actionable insights and securing digital infrastructures. With a unique blend of analytical skills and technical expertise, I help organizations navigate the digital landscape with confidence.";

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
            <img 
              src={`/profile.jpg?v=${new Date().getTime()}`}
              alt="Jose Ignacio Godino" 
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                // Fallback if image not found
                e.currentTarget.src = "https://picsum.photos/800/800";
              }}
            />
          </div>
          {/* Decorative elements */}
          <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full border-2 border-primary/20 rounded-2xl" />
        </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 relative group"
          >
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-36 rounded-md" />
              </div>
            ) : (
            <>
            <div className="flex justify-between items-start">
            {isEditing ? (
              <input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="text-3xl font-bold tracking-tight sm:text-4xl w-full p-2 rounded border bg-background"
                placeholder="Title"
              />
            ) : (
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{currentTitle}</h2>
            )}
            {isAdmin && !isEditing && (
              <button onClick={handleEdit} className="p-2 rounded hover:bg-secondary transition-colors">
                <Edit className="w-5 h-5" />
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full p-2 rounded border bg-background"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Specialization</label>
                <textarea
                  value={editForm.specialization}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                  className="w-full p-2 rounded border bg-background"
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded bg-secondary hover:bg-secondary/80">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</button>
              </div>
            </div>
            ) : (
              <>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {currentDesc}
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {currentSpec}
                </p>
              </>
            )}
          
          <div className="pt-4">
            <a 
              href="/cv.pdf" 
              download="Jose_Ignacio_Godino_CV.pdf"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              {t.about.downloadCV}
            </a>
          </div>
            </>
            )}
        </motion.div>
      </div>
    </section>
  );
}
