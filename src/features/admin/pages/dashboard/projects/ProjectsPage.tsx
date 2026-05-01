'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, 
  Plus, 
  ExternalLink, 
  Code, 
  Save, 
  Trash2, 
  Pencil, 
  X, 
  RefreshCw,
  Eye,
  EyeOff,
  Star
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useToast } from '@/features/admin/components/context/ToastContext';

interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  status: string;
  category: string;
  techStack: string[] | string;
  features: string[] | string;
  imageUrl: string;
  githubUrl: string;
  demoUrl: string;
  challenges: string;
  learnings: string;
  visible: boolean;
  featured: boolean;
}

interface ProjectFormData {
  name: string;
  description: string;
  longDescription: string;
  status: string;
  category: string;
  techStack: string;
  features: string;
  imageUrl: string;
  githubUrl: string;
  demoUrl: string;
  challenges: string;
  learnings: string;
  visible: boolean;
  featured: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// --- Simple Modal Component ---
const Modal = ({ isOpen, onClose, title, children, footer }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-neutral-900 font-display uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 font-serif">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default function ProjectsPage() {
  const { addToast } = useToast();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    longDescription: '',
    status: 'In Progress',
    category: '',
    techStack: '',
    features: '',
    imageUrl: '',
    githubUrl: '',
    demoUrl: '',
    challenges: '',
    learnings: '',
    visible: true,
    featured: false
  });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/projects');
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects || []);
      } else {
          setProjects([]);
      }
    } catch {
      console.error('Failed to fetch projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchProjects();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleOpenModal = (project: ProjectRecord | null = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        ...project,
        techStack: Array.isArray(project.techStack) ? project.techStack.join(', ') : (project.techStack || ''),
        features: Array.isArray(project.features) ? project.features.join('\n') : (project.features || '')
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        description: '',
        longDescription: '',
        status: 'In Progress',
        category: '',
        techStack: '',
        features: '',
        imageUrl: '',
        githubUrl: '',
        demoUrl: '',
        challenges: '',
        learnings: '',
        visible: true,
        featured: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const method = editingProject ? 'PUT' : 'POST';
    const body = {
      ...(editingProject ? { id: editingProject.id } : {}),
      ...formData,
      techStack: formData.techStack,
      features: formData.features,
    };

    try {
      const res = await fetch('/api/v1/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchProjects();
        addToast({
          message: `${editingProject ? 'Project updated' : 'Project created'} in GitHub${data.commit ? ` (${data.commit})` : ''}`,
          status: 'success',
          action: 'Success',
        });
      } else {
        addToast({
          message: data.error || 'Failed to save project',
          status: 'error',
          action: 'Error',
        });
      }
    } catch {
      console.error('Failed to save project');
      addToast({
        message: 'Failed to save project to GitHub',
        status: 'error',
        action: 'Error',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/v1/projects?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        fetchProjects();
        addToast({
          message: `Project deleted from GitHub${data.commit ? ` (${data.commit})` : ''}`,
          status: 'success',
          action: 'Success',
        });
      } else {
        addToast({
          message: data.error || 'Failed to delete project',
          status: 'error',
          action: 'Error',
        });
      }
    } catch {
      console.error('Failed to delete project');
      addToast({
        message: 'Failed to delete project from GitHub',
        status: 'error',
        action: 'Error',
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight font-display uppercase">Projects</h1>
          <p className="text-neutral-500 font-bold font-display uppercase text-[11px] tracking-widest mt-1">Manage your professional catalog.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchProjects}
            className="p-3 bg-white border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold font-display uppercase text-[12px] tracking-widest shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-neutral-100 h-64 animate-pulse p-6">
                   <div className="w-full h-32 bg-neutral-100 rounded-xl mb-4" />
                   <div className="h-6 bg-neutral-100 rounded w-3/4 mb-2" />
                   <div className="h-4 bg-neutral-100 rounded w-1/2" />
                </div>
             ))
          ) : projects.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-neutral-200">
                <Folder className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-neutral-900 font-display uppercase tracking-tight">No Projects Found</h3>
                <p className="text-neutral-500 font-serif">Start by adding your first showcase project.</p>
            </div>
          ) : projects.map((project) => (
            <motion.div
              layout
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all"
            >
              <div className="aspect-video bg-neutral-100 relative overflow-hidden">
                {project.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <Folder className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                   {project.featured && <div className="p-1.5 bg-yellow-400 text-white rounded-lg shadow-lg"><Star className="w-4 h-4 fill-current" /></div>}
                   {!project.visible && <div className="p-1.5 bg-neutral-800 text-white rounded-lg shadow-lg"><EyeOff className="w-4 h-4" /></div>}
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-display">{project.category || 'Uncategorized'}</span>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter font-display",
                    project.status === 'Completed' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {project.status}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-1 font-display tracking-tight">{project.name}</h3>
                <p className="text-neutral-500 text-sm line-clamp-2 mb-4 font-serif">{project.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-neutral-50">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(project)}
                      className="p-2 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {project.githubUrl && <a href={project.githubUrl} target="_blank" className="p-2 text-neutral-400 hover:text-neutral-900 rounded-lg"><Code className="w-4 h-4" /></a>}
                    {project.demoUrl && <a href={project.demoUrl} target="_blank" className="p-2 text-neutral-400 hover:text-primary rounded-lg"><ExternalLink className="w-4 h-4" /></a>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? "Edit Project" : "Add New Project"}
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-neutral-500 font-bold text-sm uppercase font-display tracking-widest">Cancel</button>
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm uppercase font-display tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingProject ? 'Update Project' : 'Save Project'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-display">Project Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm"
                placeholder="Phoenix Engine"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-display">Category</label>
              <input 
                type="text" 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm"
                placeholder="Game Engine"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-display">Short Description</label>
            <input 
              type="text" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm"
              placeholder="A brief tagline for the showcase card"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-display">Status</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm"
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-display">Long Description</label>
            <textarea
              value={formData.longDescription}
              onChange={e => setFormData({...formData, longDescription: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm"
              placeholder="Detailed explanation of the project"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-display">Tech Stack</label>
            <input
              type="text"
              value={formData.techStack}
              onChange={e => setFormData({...formData, techStack: e.target.value})}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm"
              placeholder="React, Next.js, Tailwind CSS"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-display">Features</label>
            <textarea
              value={formData.features}
              onChange={e => setFormData({...formData, features: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm"
              placeholder={"Feature one\nFeature two\nFeature three"}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-display">Image URL</label>
            <input 
              type="text" 
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-display">GitHub URL</label>
              <input
                type="text"
                value={formData.githubUrl}
                onChange={e => setFormData({...formData, githubUrl: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm"
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-display">Demo URL</label>
              <input
                type="text"
                value={formData.demoUrl}
                onChange={e => setFormData({...formData, demoUrl: e.target.value})}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm"
                placeholder="https://demo.example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-display">Challenges</label>
            <textarea
              value={formData.challenges}
              onChange={e => setFormData({...formData, challenges: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm"
              placeholder="Key implementation challenges"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-display">Learnings</label>
            <textarea
              value={formData.learnings}
              onChange={e => setFormData({...formData, learnings: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm"
              placeholder="What you learned from this project"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer" onClick={() => setFormData({...formData, featured: !formData.featured})}>
               <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center transition-colors", formData.featured ? "bg-primary border-primary" : "border-neutral-300")}>
                  {formData.featured && <Star className="w-3 h-3 text-white fill-current" />}
               </div>
               <span className="text-[13px] font-bold text-neutral-700 tracking-tight font-display uppercase">Featured Project</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer" onClick={() => setFormData({...formData, visible: !formData.visible})}>
               <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center transition-colors", formData.visible ? "bg-primary border-primary" : "border-neutral-300")}>
                  {formData.visible && <Eye className="w-3 h-3 text-white" />}
               </div>
               <span className="text-[13px] font-bold text-neutral-700 tracking-tight font-display uppercase">Visible to Public</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
