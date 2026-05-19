import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '@/context/LanguageContext';
import { useAdmin } from '@/context/AdminContext';
import { Plus, Save, X, ExternalLink, Calendar, Clock, ArrowRight, Edit, Trash2 } from 'lucide-react';
import { supabase, fetchList } from '@/lib/supabase';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  link: string;
  content?: string;
}

export function Blog() {
  const { t } = useLanguage();
  const { isAdmin, getAuthHeaders } = useAdmin();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({
    title: '',
    excerpt: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: '5 min read',
    tags: [],
    link: '#',
    content: ''
  });
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    fetchList('blog_posts')
      .then(data => setPosts(data))
      .catch(err => console.error('Failed to load blog posts:', err));
  }, []);

  const handleSavePost = async () => {
    if (!newPost.title || !newPost.excerpt) return;

    const postToSave = {
      ...newPost,
      tags: tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };

    try {
      if (isEditing && editingId) {
        await supabase.from('blog_posts').update(postToSave).eq('id', editingId);
        setPosts(posts.map(p => p.id === editingId ? { ...p, ...postToSave } : p));
      } else {
        const { data } = await supabase.from('blog_posts').insert({ id: Date.now(), ...postToSave }).select().single();
        if (data) setPosts([...posts, data]);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save post:', error);
    }
  };

  const handleDeletePost = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await supabase.from('blog_posts').delete().eq('id', id);
      setPosts(posts.filter(p => p.id !== id));
      if (selectedPost?.id === id) setSelectedPost(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleEditPost = (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    setNewPost({
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      readTime: post.readTime,
      tags: post.tags,
      link: post.link,
      content: post.content || ''
    });
    setTagsInput(post.tags.join(', '));
    setEditingId(post.id);
    setIsEditing(true);
    setIsAdding(true);
    
    // Scroll to form
    const formElement = document.getElementById('blog-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingId(null);
    setNewPost({
      title: '',
      excerpt: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: '5 min read',
      tags: [],
      link: '#',
      content: ''
    });
    setTagsInput('');
  };

  return (
    <section id="blog" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center relative"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">{t.blog.title}</h2>
          <p className="text-muted-foreground text-lg">
            {t.blog.subtitle}
          </p>
          
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="absolute right-0 top-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          )}
        </motion.div>

        <AnimatePresence>
          {isAdding && (
            <motion.div
              id="blog-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 bg-card border border-border rounded-xl p-6 shadow-lg overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{isEditing ? 'Edit Post' : 'Add New Post'}</h3>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">{t.blog.form.title}</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full p-3 rounded-md bg-background border border-input focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.blog.form.date}</label>
                  <input
                    type="text"
                    value={newPost.date}
                    onChange={(e) => setNewPost({ ...newPost, date: e.target.value })}
                    className="w-full p-3 rounded-md bg-background border border-input focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.blog.form.readTime}</label>
                  <input
                    type="text"
                    value={newPost.readTime}
                    onChange={(e) => setNewPost({ ...newPost, readTime: e.target.value })}
                    className="w-full p-3 rounded-md bg-background border border-input focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">{t.blog.form.tags}</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="React, TypeScript, Tutorial"
                    className="w-full p-3 rounded-md bg-background border border-input focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">{t.blog.form.excerpt}</label>
                  <textarea
                    value={newPost.excerpt}
                    onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                    rows={2}
                    className="w-full p-3 rounded-md bg-background border border-input focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Content (Markdown)</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={10}
                    className="w-full p-3 rounded-md bg-background border border-input focus:ring-2 focus:ring-primary font-mono text-sm"
                    placeholder="# Title\n\nWrite your post content here..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-md hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  {t.blog.cancel}
                </button>
                <button
                  onClick={handleSavePost}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Update Post' : t.blog.savePost}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No articles yet</h3>
            <p className="text-muted-foreground">Coming soon — check back later for tutorials and insights.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col h-full group cursor-pointer relative"
                onClick={() => setSelectedPost(article)}
              >
                {isAdmin && (
                  <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEditPost(e, article)}
                      className="p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeletePost(e, article.id)}
                      className="p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{article.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 flex-grow line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                      Read Article <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Post Modal */}
        <AnimatePresence>
          {selectedPost && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPost(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-border"
              >
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute right-4 top-4 p-2 rounded-full bg-secondary/80 hover:bg-secondary transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="p-8 sm:p-10">
                  <header className="mb-8 border-b border-border pb-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedPost.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">{selectedPost.title}</h2>
                    <div className="flex items-center gap-6 text-muted-foreground text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {selectedPost.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {selectedPost.readTime}
                      </div>
                    </div>
                  </header>

                  <div className="prose prose-invert max-w-none text-foreground">
                    {selectedPost.content ? (
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-8 mb-4 text-foreground" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-3 text-foreground" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-foreground" {...props} />,
                          p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-muted-foreground" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 text-muted-foreground" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 text-muted-foreground" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground" {...props} />,
                          code: ({node, ...props}) => <code className="bg-secondary px-1 py-0.5 rounded text-sm font-mono text-secondary-foreground" {...props} />,
                          pre: ({node, ...props}) => <pre className="bg-secondary p-4 rounded-lg overflow-x-auto mb-4 text-sm font-mono text-secondary-foreground" {...props} />,
                          a: ({node, ...props}) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                        }}
                      >
                        {selectedPost.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-muted-foreground italic">No content available for this post.</p>
                    )}
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
