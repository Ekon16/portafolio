import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Experience } from '@/types';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, Trash2, X, Edit2 } from 'lucide-react';

export function ExperienceSection() {
  const { isAdmin, getAuthHeaders } = useAdmin();
  const { t } = useLanguage();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [experienceForm, setExperienceForm] = useState<Partial<Experience>>({
    company: '',
    role: '',
    period: '',
    achievements: ['']
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const res = await fetch('/data/experience.json');
      if (res.ok) {
        const data = await res.json();
        setExperiences(data);
      }
    } catch (error) {
      console.error('Failed to fetch experience', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
      const res = await fetch(`/api/experience/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExperiences(experiences.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete experience', error);
    }
  };

  const handleEdit = (exp: Experience) => {
    setExperienceForm(exp);
    setEditingId(exp.id!);
    setIsEditing(true);
  };

  const handleAddAchievement = () => {
    setExperienceForm({
      ...experienceForm,
      achievements: [...(experienceForm.achievements || []), '']
    });
  };

  const handleAchievementChange = (index: number, value: string) => {
    const newAchievements = [...(experienceForm.achievements || [])];
    newAchievements[index] = value;
    setExperienceForm({ ...experienceForm, achievements: newAchievements });
  };

  const handleRemoveAchievement = (index: number) => {
    const newAchievements = [...(experienceForm.achievements || [])];
    newAchievements.splice(index, 1);
    setExperienceForm({ ...experienceForm, achievements: newAchievements });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/experience/${editingId}` : '/api/experience';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...experienceForm,
          achievements: experienceForm.achievements?.filter(a => a.trim() !== '')
        }),
      });

      if (res.ok) {
        const savedExperience = await res.json();
        if (editingId) {
          setExperiences(experiences.map(e => e.id === editingId ? savedExperience : e));
        } else {
          setExperiences([...experiences, savedExperience]);
        }
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save experience', error);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setExperienceForm({ company: '', role: '', period: '', achievements: [''] });
  };

  return (
    <section id="experience" className="py-24 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.experience.title}</h2>
            {isAdmin && (
              <button
                onClick={() => {
                  resetForm();
                  setIsEditing(true);
                }}
                className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-muted-foreground text-lg">
            {t.experience.subtitle}
          </p>
        </motion.div>

        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{editingId ? 'Edit Experience' : t.experience.addExperience}</h3>
                  <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Company"
                    required
                    value={experienceForm.company}
                    onChange={e => setExperienceForm({...experienceForm, company: e.target.value})}
                    className="w-full px-4 py-2 rounded-md bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    required
                    value={experienceForm.role}
                    onChange={e => setExperienceForm({...experienceForm, role: e.target.value})}
                    className="w-full px-4 py-2 rounded-md bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Period"
                    required
                    value={experienceForm.period}
                    onChange={e => setExperienceForm({...experienceForm, period: e.target.value})}
                    className="w-full px-4 py-2 rounded-md bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary md:col-span-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Achievements</label>
                  {experienceForm.achievements?.map((achievement, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={achievement}
                        onChange={e => handleAchievementChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-md bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Achievement description"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAchievement(index)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddAchievement}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Achievement
                  </button>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
                  >
                    {t.experience.saveExperience}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          {/* Central Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-border" />
          
          {/* Left Line (Mobile) */}
          <div className="md:hidden absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-12 md:space-y-0">
            {experiences.map((exp, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={exp.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex flex-col md:flex-row ${
                    isEven ? 'md:flex-row-reverse' : ''
                  } md:items-center md:justify-between md:mb-12`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary z-10 mt-1.5 md:mt-0" />

                  {/* Spacer for the other side */}
                  <div className="hidden md:block md:w-5/12" />

                  {/* Content Card */}
                  <div className={`pl-16 md:pl-0 md:w-5/12 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                    <div className={`bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow relative group ${
                      isEven ? 'md:mr-8' : 'md:ml-8'
                    }`}>
                      {/* Connecting Line (Desktop) */}
                      <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-8 h-0.5 bg-border ${
                        isEven ? '-right-8' : '-left-8'
                      }`} />

                      <div className={`flex flex-col ${isEven ? 'md:items-end' : 'md:items-start'} mb-4`}>
                        <h3 className="text-xl font-bold">{exp.role}</h3>
                        <div className="text-lg text-primary font-medium">{exp.company}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-mono text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                            {exp.period}
                          </span>
                          {isAdmin && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEdit(exp); }}
                                className="p-1.5 rounded-full bg-blue-100 text-blue-500 hover:bg-blue-200 transition-colors"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(exp.id!); }}
                                className="p-1.5 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <ul className={`space-y-2 ${isEven ? 'md:items-end' : 'md:items-start'}`}>
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className={`flex items-start text-muted-foreground text-sm ${
                            isEven ? 'md:flex-row-reverse md:text-right' : ''
                          }`}>
                            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 ${
                              isEven ? 'ml-2' : 'mr-2'
                            }`} />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
