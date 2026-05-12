import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';

export function Contact() {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      
      if (response.ok) {
        setIsSubmitted(true);
        setFormState({ name: '', email: '', message: '' });
        addToast('Message sent successfully!', 'success');
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        addToast('Failed to send message. Please try again.', 'error');
      }
    } catch (error) {
      addToast('Network error. Please check your connection.', 'error');
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">{t.contact.title}</h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            {t.contact.subtitle}
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-foreground">Email</div>
                <a href="mailto:jigodino11@gmail.com">jigodino11@gmail.com</a>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-foreground">Location</div>
                <span>Madrid, Spain</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-foreground">Phone</div>
                <span>+34 625 18 69 80</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-card border-4 border-border rounded-2xl p-8 shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">{t.contact.name}</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">{t.contact.email}</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">{t.contact.message}</label>
              <textarea
                id="message"
                required
                rows={4}
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                className="w-full p-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                placeholder="Tell me about your project..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-medium shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : isSubmitted ? (
                t.contact.sent
              ) : (
                <>
                  {t.contact.send}
                  <Send className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
