import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';
import { useAdmin } from '@/context/AdminContext';
import { Briefcase, Users, TrendingUp, Edit, Save, X } from 'lucide-react';
import type { BusinessData } from '@/types';

export function NonTechSummary() {
  const { t, language } = useLanguage();
  const { isAdmin, getAuthHeaders } = useAdmin();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{ title: string; subtitle: string; cards: { title: string; description: string }[] }>({ title: '', subtitle: '', cards: [] });

  const icons = [Briefcase, Users, TrendingUp];

  useEffect(() => {
    fetch('/api/business')
      .then(res => res.json())
      .then(data => setBusinessData(data))
      .catch(err => console.error('Failed to fetch business data', err));
  }, []);

  const handleEdit = () => {
    setEditForm({
      title: businessData?.[language]?.title || t.nonTech.title,
      subtitle: businessData?.[language]?.subtitle || t.nonTech.subtitle,
      cards: businessData?.[language]?.cards || t.nonTech.cards
    });
    setIsEditing(true);
  };

  const handleCardChange = (index: number, field: string, value: string) => {
    const newCards = [...editForm.cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setEditForm({ ...editForm, cards: newCards });
  };

  const handleSave = async () => {
    try {
      const newData = {
        ...businessData,
        [language]: {
          ...businessData?.[language],
          title: editForm.title,
          subtitle: editForm.subtitle,
          cards: editForm.cards
        }
      };

      await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(newData),
      });

      setBusinessData(newData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save business data', error);
    }
  };

  const currentCards = businessData?.[language]?.cards || t.nonTech.cards;
  const currentTitle = businessData?.[language]?.title || t.nonTech.title;
  const currentSubtitle = businessData?.[language]?.subtitle || t.nonTech.subtitle;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center relative group"
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

        <div className="grid md:grid-cols-3 gap-8">
          {(isEditing ? editForm.cards : currentCards).map((card: { title: string; description: string }, index: number) => {
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      value={editForm[index]?.title || ''}
                      onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                      className="w-full p-2 rounded border bg-background font-semibold"
                      placeholder="Title"
                    />
                    <textarea
                      value={editForm[index]?.description || ''}
                      onChange={(e) => handleCardChange(index, 'description', e.target.value)}
                      className="w-full p-2 rounded border bg-background text-sm"
                      rows={4}
                      placeholder="Description"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-4">{card.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
