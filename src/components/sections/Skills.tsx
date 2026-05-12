import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Code2, Database, Layout, Terminal, Edit, X, Plus } from 'lucide-react';
import type { SkillsData, SkillCategory } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAdmin } from '@/context/AdminContext';
import { useToast } from '@/context/ToastContext';
import { Skeleton } from '@/components/ui/Skeleton';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Database,
  Terminal,
  Code2,
  Layout
};

export function Skills() {
  const { t, language } = useLanguage();
  const { isAdmin, getAuthHeaders } = useAdmin();
  const { addToast } = useToast();
  const [skillsData, setSkillsData] = useState<SkillsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{ title: string; subtitle: string; categories: SkillCategory[] }>({ title: '', subtitle: '', categories: [] });

  useEffect(() => {
    fetch('/api/skills')
      .then(res => res.json())
      .then(data => setSkillsData(data))
      .catch(err => console.error('Failed to fetch skills data', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleEdit = () => {
    setEditForm({
      title: skillsData?.[language]?.title || t.skills.title,
      subtitle: skillsData?.[language]?.subtitle || t.skills.subtitle,
      categories: skillsData?.[language]?.categories || []
    });
    setIsEditing(true);
  };

  const handleSkillChange = (catIndex: number, skillIndex: number, value: string) => {
    const newCategories = [...editForm.categories];
    newCategories[catIndex].skills[skillIndex] = value;
    setEditForm({ ...editForm, categories: newCategories });
  };

  const handleAddSkill = (catIndex: number) => {
    const newCategories = [...editForm.categories];
    newCategories[catIndex].skills.push("New Skill");
    setEditForm({ ...editForm, categories: newCategories });
  };

  const handleRemoveSkill = (catIndex: number, skillIndex: number) => {
    const newCategories = [...editForm.categories];
    newCategories[catIndex].skills.splice(skillIndex, 1);
    setEditForm({ ...editForm, categories: newCategories });
  };

  const handleSave = async () => {
    try {
      const newData = {
        ...skillsData,
        [language]: {
          title: editForm.title,
          subtitle: editForm.subtitle,
          categories: editForm.categories
        }
      };

      await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(newData),
      });

      setSkillsData(newData);
      setIsEditing(false);
      addToast('Skills section updated', 'success');
    } catch (error) {
      addToast('Failed to save skills data', 'error');
      console.error('Failed to save skills data', error);
    }
  };

  const currentCategories = skillsData?.[language]?.categories || [];
  const currentTitle = skillsData?.[language]?.title || t.skills.title;
  const currentSubtitle = skillsData?.[language]?.subtitle || t.skills.subtitle;

  return (
    <section id="skills" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center relative"
        >
          <div className="flex justify-center items-center gap-4 mb-4">
            {isEditing ? (
              <input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="text-3xl font-bold tracking-tight sm:text-4xl text-center p-2 rounded border bg-background"
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
            <textarea
              value={editForm.subtitle}
              onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
              className="text-muted-foreground text-lg max-w-2xl mx-auto w-full p-2 rounded border bg-background text-center"
              rows={2}
              placeholder="Subtitle"
            />
          ) : (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {currentSubtitle}
            </p>
          )}
        </motion.div>

        {isEditing && (
          <div className="mb-8 flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded bg-secondary hover:bg-secondary/80">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <Skeleton className="h-6 w-32" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 rounded-md" />
                  <Skeleton className="h-6 w-24 rounded-md" />
                  <Skeleton className="h-6 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(isEditing ? editForm.categories : currentCategories).map((category: SkillCategory, index: number) => {
            const Icon = iconMap[category.icon] || Code2;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-semibold mb-4">{category.name}</h3>
                
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill: string, skillIndex: number) => (
                    isEditing ? (
                      <div key={skillIndex} className="flex items-center gap-1 bg-secondary rounded-md p-1">
                        <input
                          value={skill}
                          onChange={(e) => handleSkillChange(index, skillIndex, e.target.value)}
                          className="w-24 text-xs bg-transparent border-none focus:outline-none"
                        />
                        <button onClick={() => handleRemoveSkill(index, skillIndex)} className="text-red-500 hover:bg-red-500/10 rounded">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span 
                        key={skill} 
                        className="px-2 py-1 text-xs font-medium rounded-md bg-secondary text-secondary-foreground border border-transparent hover:border-primary/20 transition-colors cursor-default"
                      >
                        {skill}
                      </span>
                    )
                  ))}
                  {isEditing && (
                    <button onClick={() => handleAddSkill(index)} className="px-2 py-1 text-xs font-medium rounded-md border border-dashed border-primary text-primary hover:bg-primary/10">
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}
