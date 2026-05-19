import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '@/context/LanguageContext';
import { useAdmin } from '@/context/AdminContext';
import { BookOpen, Calendar, Clock, ArrowRight, ArrowUpRight, Tag, X, Plus, Edit, Trash2, Eye, Sparkles, Upload, Loader2, ImageIcon, Share2, Check } from 'lucide-react';
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
  image?: string;
}

export function Blog() {
  const { t } = useLanguage();
  const { isAdmin } = useAdmin();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTag, setActiveTag] = useState<string>('All');
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({
    title: '', excerpt: '', content: '', image: '',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    readTime: '5 min read', tags: [], link: '#',
  });
  const [tagsInput, setTagsInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const contentFileRef = React.useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop() || 'png';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from('blog-images').upload(path, file, {
      cacheControl: '3600', upsert: false,
    });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      if (url) {
        setNewPost(prev => ({ ...prev, image: url }));
        setUploadedImages(prev => [url, ...prev]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      if (url) {
        setUploadedImages(prev => [url, ...prev]);
        const ta = document.getElementById('markdown-editor') as HTMLTextAreaElement;
        if (ta) {
          const s = ta.selectionStart;
          const imgMd = `\n![image](${url})\n`;
          const v = ta.value;
          const newVal = v.slice(0, s) + imgMd + v.slice(ta.selectionEnd);
          setNewPost(prev => ({ ...prev, content: newVal }));
          setTimeout(() => { ta.focus(); ta.setSelectionRange(s + imgMd.length, s + imgMd.length); }, 50);
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      if (contentFileRef.current) contentFileRef.current.value = '';
    }
  };

  useEffect(() => {
    fetchList('blog_posts')
      .then(data => {
        const mapped = data.map((p: any) => ({ ...p, readTime: p.read_time || p.readTime || '5 min read' }));
        setPosts(mapped);
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('post');
        if (postId) {
          const target = mapped.find((p: any) => String(p.id) === postId);
          if (target) openPost(target);
        }
      })
      .catch(err => console.error('Failed to load blog posts:', err));
  }, []);

  const openPost = (post: BlogPost | null) => {
    setSelectedPost(post);
    if (post) {
      window.history.replaceState({}, '', `${window.location.pathname}?post=${post.id}`);
    } else {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const copyShareLink = (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?post=${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      prompt('Copy this link:', url);
    });
  };

  const allTags = ['All', ...Array.from(new Set(posts.flatMap(p => p.tags)))];
  const filteredPosts = activeTag === 'All' ? posts : posts.filter(p => p.tags.includes(activeTag));

  const handleSavePost = async () => {
    if (!newPost.title || !newPost.excerpt) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    // Map frontend camelCase to database snake_case
    const dbPayload = {
      title: newPost.title,
      excerpt: newPost.excerpt,
      content: newPost.content || '',
      image: newPost.image || '',
      date: newPost.date,
      read_time: newPost.readTime,
      tags,
      link: newPost.link || '#',
    };
    try {
      if (isEditing && editingId) {
        const { error } = await supabase.from('blog_posts').update(dbPayload).eq('id', editingId);
        if (error) throw error;
        setPosts(posts.map(p => p.id === editingId ? { ...p, title: newPost.title!, excerpt: newPost.excerpt!, content: newPost.content, image: newPost.image, date: newPost.date!, readTime: newPost.readTime!, tags, link: newPost.link } as BlogPost : p));
      } else {
        const id = Date.now();
        const { error } = await supabase.from('blog_posts').insert({ id, ...dbPayload });
        if (error) throw error;
        const savedPost: BlogPost = { id, title: newPost.title!, excerpt: newPost.excerpt!, content: newPost.content, image: newPost.image, date: newPost.date!, readTime: newPost.readTime!, tags, link: newPost.link || '#' };
        setPosts(prev => [savedPost, ...prev]);
      }
      resetForm();
    } catch (error: any) {
      console.error('Failed to save post:', error);
      alert('Save failed: ' + (error?.message || error?.error_description || JSON.stringify(error)));
    }
  };

  const handleDeletePost = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Delete this post?')) return;
    try {
      await supabase.from('blog_posts').delete().eq('id', id);
      setPosts(posts.filter(p => p.id !== id));
      if (selectedPost?.id === id) openPost(null);
    } catch (error) { console.error('Failed to delete post:', error); }
  };

  const handleEditPost = (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    setNewPost({ title: post.title, excerpt: post.excerpt, content: post.content || '', image: post.image || '', date: post.date, readTime: post.readTime, tags: post.tags, link: post.link });
    setTagsInput(post.tags.join(', '));
    setEditingId(post.id); setIsEditing(true); setIsAdding(true);
    document.getElementById('blog-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsAdding(false); setIsEditing(false); setEditingId(null);
    setNewPost({ title: '', excerpt: '', content: '', image: '', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), readTime: '5 min read', tags: [], link: '#' });
    setTagsInput(''); setShowPreview(false);
  };

  return (
    <section id="blog" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" /> {t.blog.title}
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{t.blog.title}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t.blog.subtitle}</p>
          {isAdmin && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { resetForm(); setIsAdding(true); }}
              className="absolute right-0 top-0 inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow"
            ><Plus className="w-5 h-5" /> Write Article</motion.button>
          )}
        </motion.div>

        <AnimatePresence>
          {isAdding && (
            <motion.div id="blog-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-12 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-muted/50 px-8 py-4 flex justify-between items-center border-b border-border">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Edit className="w-4 h-4" /> {isEditing ? 'Edit Article' : 'Write a New Article'}</h3>
                <button onClick={resetForm} className="p-2 rounded-full hover:bg-secondary transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Title</label>
                    <input type="text" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                      className="w-full p-3 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg font-medium"
                      placeholder="The Art of Modern Web Development" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Date</label>
                      <input type="text" value={newPost.date} onChange={e => setNewPost({ ...newPost, date: e.target.value })}
                        className="w-full p-3 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Read Time</label>
                      <input type="text" value={newPost.readTime} onChange={e => setNewPost({ ...newPost, readTime: e.target.value })}
                        className="w-full p-3 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Tags (comma separated)</label>
                    <input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                      className="w-full p-3 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="React, TypeScript, Architecture" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Cover Image</label>
                    <div className="flex gap-2">
                      <input type="text" value={newPost.image} onChange={e => setNewPost({ ...newPost, image: e.target.value })}
                        className="flex-1 p-3 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="https://images.unsplash.com/... or upload below" />
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                      <button
                        type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                        className="px-4 py-3 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                      >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                    {newPost.image && (
                      <div className="mt-2 relative rounded-lg overflow-hidden border border-border h-32">
                        <img src={newPost.image} alt="Cover" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  {uploadedImages.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">Uploaded Images</label>
                      <div className="flex gap-2 flex-wrap">
                        {uploadedImages.slice(0, 4).map((url, i) => (
                          <button key={i} type="button" onClick={() => setNewPost(prev => ({ ...prev, image: url }))}
                            className="w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors hover:border-primary"
                            style={{ borderColor: newPost.image === url ? 'currentColor' : undefined }}>
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Excerpt</label>
                    <textarea value={newPost.excerpt} onChange={e => setNewPost({ ...newPost, excerpt: e.target.value })} rows={2}
                      className="w-full p-3 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                      placeholder="A brief description of what this article is about..." />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold">Content (Markdown)</label>
                    <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {showPreview ? <Edit className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showPreview ? 'Editor' : 'Preview'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 mb-2 flex-wrap">
                    <span className="text-xs text-muted-foreground mr-2">Quick insert:</span>
                    {['**B**', '_I_', '## H2', '### H3', '`code`', '> quote', '- list', '[link]'].map(btn => (
                      <button key={btn} type="button"
                        onClick={() => {
                          const ta = document.getElementById('markdown-editor') as HTMLTextAreaElement;
                          if (!ta) return;
                          const s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
                          let insertion = '';
                          if (btn === '**B**') insertion = `**${v.slice(s, e) || 'bold'}**`;
                          else if (btn === '_I_') insertion = `_${v.slice(s, e) || 'italic'}_`;
                          else if (btn === '## H2') insertion = `\n## ${v.slice(s, e) || 'Heading'}\n`;
                          else if (btn === '### H3') insertion = `\n### ${v.slice(s, e) || 'Subheading'}\n`;
                          else if (btn === '`code`') insertion = `\`${v.slice(s, e) || 'code'}\``;
                          else if (btn === '> quote') insertion = `\n> ${v.slice(s, e) || 'quote'}\n`;
                          else if (btn === '- list') insertion = `\n- ${v.slice(s, e) || 'item'}\n`;
                          else if (btn === '[link]') insertion = `[${v.slice(s, e) || 'link text'}](url)`;
                          const newVal = v.slice(0, s) + insertion + v.slice(e);
                          setNewPost(prev => ({ ...prev, content: newVal }));
                          setTimeout(() => { ta.focus(); ta.setSelectionRange(s + insertion.length, s + insertion.length); }, 50);
                        }}
                        className="px-2 py-1 text-[11px] font-mono rounded bg-muted hover:bg-secondary transition-colors"
                      >{btn}</button>
                    ))}
                    <input ref={contentFileRef} type="file" accept="image/*" onChange={handleContentImageUpload} className="hidden" />
                    <button type="button" onClick={() => contentFileRef.current?.click()}
                      className="px-2 py-1 text-[11px] font-mono rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> img
                    </button>
                  </div>
                  {showPreview ? (
                    <div className="flex-1 p-5 rounded-lg bg-background border border-border overflow-y-auto min-h-[300px] prose prose-sm max-w-none">
                      {newPost.content ? (
                        <ReactMarkdown components={{
                          h1: p => <h1 className="text-xl font-bold mt-4 mb-2" {...p} />,
                          h2: p => <h2 className="text-lg font-bold mt-4 mb-2" {...p} />,
                          h3: p => <h3 className="text-base font-bold mt-3 mb-1.5" {...p} />,
                          p: p => <p className="mb-3 leading-relaxed" {...p} />,
                          ul: p => <ul className="list-disc list-inside mb-3" {...p} />,
                          ol: p => <ol className="list-decimal list-inside mb-3" {...p} />,
                          code: p => <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...p} />,
                          pre: p => <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-3 text-sm font-mono" {...p} />,
                          blockquote: p => <blockquote className="border-l-4 border-primary pl-4 italic my-3 text-muted-foreground" {...p} />,
                        }}>{newPost.content}</ReactMarkdown>
                      ) : <p className="text-muted-foreground italic">Write some markdown to see the preview...</p>}
                    </div>
                  ) : (
                    <textarea id="markdown-editor" value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} rows={14}
                      className="flex-1 p-5 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm resize-none min-h-[300px]"
                      placeholder="# Introduction&#10;&#10;Write your article in **Markdown**...&#10;&#10;## Why this matters&#10;&#10;- Point one&#10;- Point two&#10;&#10;> A memorable quote&#10;&#10;Happy writing! ✍️" />
                  )}
                </div>
              </div>
              <div className="px-8 py-4 bg-muted/50 border-t border-border flex justify-end gap-3">
                <button onClick={resetForm} className="px-5 py-2.5 rounded-lg hover:bg-secondary transition-colors font-medium text-sm">Cancel</button>
                <button onClick={handleSavePost} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm shadow-sm">
                  {isEditing ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {allTags.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {allTags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTag === tag ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'bg-card border border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'
                }`}>{tag}</button>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No articles yet</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">Articles exploring modern development, architecture patterns, and lessons learned will appear here.</p>
          </motion.div>
        ) : (
          <>
            {/* Featured first post */}
            {filteredPosts.length > 0 && (
              <motion.article initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="group mb-8 bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-500 cursor-pointer"
                onClick={() => openPost(filteredPosts[0])}>
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative overflow-hidden aspect-[16/10] lg:aspect-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 z-10" />
                    {filteredPosts[0].image ? (
                      <img src={filteredPosts[0].image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/40 via-violet-500/30 to-amber-500/20 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                      {filteredPosts[0].tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-3 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm rounded-full shadow-sm">{tag}</span>
                      ))}
                    </div>
                    {isAdmin && (
                      <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleEditPost(e, filteredPosts[0]); }} className="p-2.5 bg-background/90 backdrop-blur-sm rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"><Edit className="w-4 h-4" /></button>
                        <button onClick={(e) => handleDeletePost(e, filteredPosts[0].id)} className="p-2.5 bg-background/90 backdrop-blur-sm rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-sm"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-5 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{filteredPosts[0].date}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{filteredPosts[0].readTime}</span>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">
                      {filteredPosts[0].title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">{filteredPosts[0].excerpt}</p>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                        Read Article <ArrowRight className="w-4 h-4" />
                      </span>
                      <button onClick={(e) => copyShareLink(e, filteredPosts[0])}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                        title="Copy share link">
                        {copiedId === filteredPosts[0].id ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                        {copiedId === filteredPosts[0].id ? 'Copied!' : 'Share'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            )}

            {/* Grid of remaining posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.slice(1).map((article, index) => (
                <motion.article key={article.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                  onClick={() => openPost(article)}>
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                    {article.image ? (
                      <img src={article.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5">
                      {article.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-background/90 backdrop-blur-sm rounded-full">{tag}</span>
                      ))}
                    </div>
                    <div className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-lg">
                        Read <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={(e) => handleEditPost(e, article)} className="p-2 bg-background/90 backdrop-blur-sm rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => handleDeletePost(e, article.id)} className="p-2 bg-background/90 backdrop-blur-sm rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{article.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
                    </div>
                    <h4 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{article.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="flex items-center gap-1.5 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                        Read <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <button onClick={(e) => copyShareLink(e, article)}
                        className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-primary"
                        title="Copy share link">
                        {copiedId === article.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </>
        )}

        {/* Reading Modal */}
        <AnimatePresence>
          {selectedPost && (
            <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => openPost(null)}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative w-full max-w-4xl my-8 mx-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
                <div className="fixed top-6 right-6 z-[60] flex gap-3">
                  <button onClick={(e) => copyShareLink(e as any, selectedPost)}
                    className="p-3 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors shadow-lg border border-border flex items-center gap-2 text-sm font-medium">
                    {copiedId === selectedPost.id ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                    {copiedId === selectedPost.id ? 'Copied!' : 'Share'}
                  </button>
                  <button onClick={() => openPost(null)}
                    className="p-3 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors shadow-lg border border-border">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Hero header */}
                <div className="relative">
                  {selectedPost.image ? (
                    <div className="relative h-64 sm:h-80 overflow-hidden">
                      <img src={selectedPost.image} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-48 sm:h-56 bg-gradient-to-br from-primary/30 via-violet-500/20 to-amber-500/10" />
                  )}
                  <div className={`px-8 sm:px-12 ${selectedPost.image ? 'absolute bottom-0 left-0 right-0 pb-8' : 'pt-12 pb-4'}`}>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedPost.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 text-xs font-semibold bg-primary/15 text-primary rounded-full">{tag}</span>
                      ))}
                    </div>
                    <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${selectedPost.image ? 'text-white' : ''}`}>
                      {selectedPost.title}
                    </h1>
                  </div>
                </div>

                {/* Meta */}
                <div className="px-8 sm:px-12 py-5 border-b border-border flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {selectedPost.date}</span>
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {selectedPost.readTime}</span>
                  <span className="flex items-center gap-2"><Tag className="w-4 h-4" /> {selectedPost.tags.length} topics</span>
                </div>

                {/* Content */}
                <div className="px-8 sm:px-12 py-10">
                  {selectedPost.content ? (
                    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-p:leading-relaxed prose-p:text-foreground/85 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-normal prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-img:rounded-xl prose-img:shadow-lg prose-li:marker:text-primary">
                      <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p className="text-lg italic">No content for this article yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
