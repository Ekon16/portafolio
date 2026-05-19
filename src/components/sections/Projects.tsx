import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'motion/react';
import { ExternalLink, Github, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  metrics: string;
  link: string;
  github: string;
  className?: string;
  image?: string;
  features?: string[];
}

export function Projects() {
  const { isAdmin, getAuthHeaders } = useAdmin();
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    title: '',
    description: '',
    tags: [],
    metrics: '',
    link: '#',
    github: '#',
    image: '',
    features: []
  });

  // Filter State
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [tagsInput, setTagsInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/data/projects.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        } else {
          throw new Error('Empty data');
        }
      })
      .catch(err => {
        console.error('Failed to fetch projects, using fallback:', err);
        setProjects([
          {
            id: 1,
            title: "Procurement Analysis Automation",
            description: "Full automation of procurement analysis at Telefónica Tech. Reduced reporting time from 1 day to real-time using Python and Snowflake integration.",
            tags: ["Python", "Snowflake", "SAP", "Automation"],
            metrics: "Reporting time reduced by 99%",
            link: "#",
            github: "#",
            className: "lg:col-span-2",
            image: "https://picsum.photos/seed/analytics/800/600",
            features: [
              "Real-time data synchronization",
              "Automated reporting pipeline",
              "Interactive dashboards"
            ]
          },
          {
            id: 2,
            title: "Infrastructure as Code Implementation",
            description: "Implemented IaC using Ansible at Banco Santander. Streamlined deployment processes and reduced deployment times to minutes.",
            tags: ["Ansible", "DevOps", "IaC", "Database Management"],
            metrics: "Deployment time reduced to minutes",
            link: "#",
            github: "#",
            image: "https://picsum.photos/seed/server/800/600",
            features: [
              "Automated server provisioning",
              "Configuration management",
              "Scalable infrastructure"
            ]
          },
          {
            id: 3,
            title: "IoT Hardware Solutions",
            description: "Prototyping and programming of hardware/software solutions using Arduino microcontrollers for Mobility Friends.",
            tags: ["Arduino", "C++", "IoT", "Hardware"],
            metrics: "Successful prototype deployment",
            link: "#",
            github: "#",
            image: "https://picsum.photos/seed/electronics/800/600",
            features: [
              "Custom hardware design",
              "Real-time sensor data",
              "Low-power optimization"
            ]
          }
        ]);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  const handleEdit = (project: Project) => {
    setProjectForm(project);
    setTagsInput(project.tags.join(', '));
    setFeaturesInput(project.features ? project.features.join('\n') : '');
    setEditingId(project.id);
    setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      setProjectForm(prev => ({ ...prev, image: data.url }));
    } catch (error) {
      console.error('Failed to upload image', error);
      alert('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/projects/${editingId}` : '/api/projects';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...projectForm,
          tags: tagsInput.split(',').map(t => t.trim()).filter(t => t),
          features: featuresInput.split('\n').map(f => f.trim()).filter(f => f)
        }),
      });
      
      const savedProject = await res.json();
      
      if (editingId) {
        setProjects(projects.map(p => p.id === editingId ? savedProject : p));
      } else {
        setProjects([...projects, savedProject]);
      }
      
      setIsEditing(false);
      setEditingId(null);
      setProjectForm({ title: '', description: '', tags: [], metrics: '', link: '#', github: '#', image: '', features: [] });
      setTagsInput('');
      setFeaturesInput('');
    } catch (error) {
      console.error('Failed to save project', error);
    }
  };

  // Derived state for filtering
  const allTags = ['All', ...Array.from(new Set(projects.flatMap(p => p.tags)))];
  const filteredProjects = selectedTag === 'All' 
    ? projects 
    : projects.filter(p => p.tags.includes(selectedTag));

  return (
    <section id="projects" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center relative"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">{t.projects.title}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.projects.subtitle}
          </p>

          {isAdmin && (
            <button
              onClick={() => {
                setProjectForm({ title: '', description: '', tags: [], metrics: '', link: '#', github: '#', image: '', features: [] });
                setTagsInput('');
                setFeaturesInput('');
                setIsEditing(true);
              }}
              className="absolute right-0 top-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Admin Form */}
        <AnimatePresence>
          {isEditing && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="mb-12 bg-card border border-border rounded-xl p-6 shadow-lg overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input
                  type="text"
                  placeholder="Title"
                  value={projectForm.title}
                  onChange={e => setProjectForm({...projectForm, title: e.target.value})}
                  className="p-3 rounded-md bg-background border border-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  className="p-3 rounded-md bg-background border border-input"
                />
                <input
                  type="text"
                  placeholder="Metrics"
                  value={projectForm.metrics}
                  onChange={e => setProjectForm({...projectForm, metrics: e.target.value})}
                  className="p-3 rounded-md bg-background border border-input"
                />
                <input
                  type="text"
                  placeholder="Live Link"
                  value={projectForm.link}
                  onChange={e => setProjectForm({...projectForm, link: e.target.value})}
                  className="p-3 rounded-md bg-background border border-input"
                />
                <input
                  type="text"
                  placeholder="GitHub Link"
                  value={projectForm.github}
                  onChange={e => setProjectForm({...projectForm, github: e.target.value})}
                  className="p-3 rounded-md bg-background border border-input"
                />
                
                <div className="p-3 rounded-md bg-background border border-input md:col-span-2 flex flex-col gap-2">
                  <label className="text-sm text-muted-foreground">Project Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Image URL (or upload below)"
                      value={projectForm.image || ''}
                      onChange={e => setProjectForm({...projectForm, image: e.target.value})}
                      className="flex-1 p-2 rounded-md bg-secondary/50 border border-input"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium"
                    >
                      Upload Image
                    </button>
                  </div>
                  {projectForm.image && (
                    <div className="mt-2 h-32 w-full relative rounded-md overflow-hidden bg-muted">
                      <img src={projectForm.image} alt="Preview" loading="lazy" className="h-full w-full object-contain" />
                    </div>
                  )}
                </div>

                <textarea
                  placeholder="Description"
                  value={projectForm.description}
                  onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                  className="p-3 rounded-md bg-background border border-input md:col-span-2"
                  rows={3}
                  required
                />
                
                <textarea
                  placeholder="Key Features (one per line)"
                  value={featuresInput}
                  onChange={e => setFeaturesInput(e.target.value)}
                  className="p-3 rounded-md bg-background border border-input md:col-span-2"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Save Project
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              layoutId={`project-${project.id}`}
              onClick={() => setSelectedProject(project)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer ${project.className || ''}`}
            >
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img 
                  src={project.image || `https://picsum.photos/seed/${project.id}/800/600`} 
                  alt={project.title}
                  loading="lazy"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                  <p className="text-emerald-400 text-sm font-medium">{project.metrics}</p>
                </div>
                
                {isAdmin && (
                  <div className="absolute top-4 right-4 z-30 flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
                      className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                      className="p-2 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <p className="text-muted-foreground mb-4 line-clamp-3 flex-grow">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md">
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <div className="flex gap-3">
                    {project.github && project.github !== '#' && (
                      <a 
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                    {project.link && project.link !== '#' && (
                      <a 
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  <span className="text-sm font-medium text-primary group-hover:underline">
                    View Details
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Project Modal */}
        <AnimatePresence>
          {selectedProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProject(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-border flex flex-col"
              >
                <div className="relative h-64 sm:h-80 bg-muted flex-shrink-0">
                  <img 
                    src={selectedProject.image || `https://picsum.photos/seed/${selectedProject.id}/800/400`} 
                    alt={selectedProject.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                      <h2 className="text-3xl font-bold">{selectedProject.title}</h2>
                      <div className="flex gap-3">
                        {selectedProject.github && selectedProject.github !== '#' && (
                          <a 
                            href={selectedProject.github} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors font-medium"
                          >
                            <Github className="w-4 h-4" /> {t.projects.code}
                          </a>
                        )}
                        {selectedProject.link && selectedProject.link !== '#' && (
                          <a 
                            href={selectedProject.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                          >
                            <ExternalLink className="w-4 h-4" /> {t.projects.liveDemo}
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-emerald-500 font-semibold text-lg">{selectedProject.metrics}</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">{t.projects.overview}</h3>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                          {selectedProject.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t.projects.technologies}</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 text-sm font-medium rounded-full bg-secondary text-secondary-foreground border border-border">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t.projects.keyFeatures}</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {selectedProject.features && selectedProject.features.length > 0 ? (
                            selectedProject.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                {feature}
                              </li>
                            ))
                          ) : (
                            <>
                              <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                Real-time data synchronization
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                Responsive mobile-first design
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                Accessibility compliance (WCAG 2.1)
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
