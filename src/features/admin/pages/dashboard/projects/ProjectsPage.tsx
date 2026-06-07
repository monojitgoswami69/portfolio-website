'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from '@/lib/motion';
import {
  Folder,
  Plus,
  Save,
  Trash2,
  X,
  RefreshCw,
  Eye,
  Star,
  Undo2,
  Upload,
  ImagePlus,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useToast } from '@/features/admin/components/context/ToastContext';
import { getCached, setCached } from '@/features/admin/lib/cache';
import { useLenis } from 'lenis/react';

const CACHE_KEY = 'admin:projects';

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
  techStack: string[];
  features: string[];
  imageUrl: string;
  githubUrl: string;
  demoUrl: string;
  visible: boolean;
  featured: boolean;
}

type PendingState = 'unchanged' | 'created' | 'updated' | 'deleted';

const emptyForm = (): ProjectFormData => ({
  name: '',
  description: '',
  longDescription: '',
  status: 'Under Development',
  category: '',
  techStack: [],
  features: [],
  imageUrl: '',
  githubUrl: '',
  demoUrl: '',
  visible: true,
  featured: false,
});

const projectToForm = (p: ProjectRecord): ProjectFormData => ({
  name: p.name ?? '',
  description: p.description ?? '',
  longDescription: p.longDescription ?? '',
  status: p.status ?? 'Under Development',
  category: p.category ?? '',
  techStack: Array.isArray(p.techStack) ? [...p.techStack] : p.techStack ? p.techStack.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
  features: Array.isArray(p.features) ? [...p.features] : p.features ? p.features.split('\n').map((s: string) => s.trim()).filter(Boolean) : [],
  imageUrl: p.imageUrl ?? '',
  githubUrl: p.githubUrl ?? '',
  demoUrl: p.demoUrl ?? '',
  visible: p.visible ?? true,
  featured: p.featured ?? false,
});

const formToProject = (form: ProjectFormData, id: string): ProjectRecord => ({
  id,
  name: form.name,
  description: form.description,
  longDescription: form.longDescription,
  status: form.status,
  category: form.category,
  techStack: form.techStack,
  features: form.features,
  imageUrl: form.imageUrl,
  githubUrl: form.githubUrl,
  demoUrl: form.demoUrl,
  challenges: '',
  learnings: '',
  visible: form.visible,
  featured: form.featured,
});

const normalizeForDiff = (r: ProjectRecord) => ({
  name: r.name ?? '',
  description: r.description ?? '',
  longDescription: r.longDescription ?? '',
  status: r.status ?? '',
  category: r.category ?? '',
  techStack: Array.isArray(r.techStack) ? r.techStack.join(', ') : (r.techStack || ''),
  features: Array.isArray(r.features) ? r.features.join('\n') : (r.features || ''),
  imageUrl: r.imageUrl ?? '',
  githubUrl: r.githubUrl ?? '',
  demoUrl: r.demoUrl ?? '',
  visible: !!r.visible,
  featured: !!r.featured,
});

const isDifferent = (a: ProjectRecord, b: ProjectRecord) =>
  JSON.stringify(normalizeForDiff(a)) !== JSON.stringify(normalizeForDiff(b));

// ── List‑editor sub‑component (techStack / features) ────────────
interface ListEditorProps {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}

const ListEditor = ({ label, items, onChange, placeholder }: ListEditorProps) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const add = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (items.includes(trimmed)) {
      setValue('');
      return;
    }
    onChange([...items, trimmed]);
    setValue('');
    inputRef.current?.focus();
  };

  const remove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-display">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-150 text-xs font-medium text-indigo-700"
          >
            {item}
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-indigo-400 hover:text-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); add(); }
          }}
          className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 admin-input text-sm text-neutral-900 transition-all outline-none placeholder-neutral-450 font-sans"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={add}
          disabled={!value.trim()}
          className="px-3 py-2 bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-lg font-semibold text-xs uppercase font-display tracking-wider hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  );
};

// ── Toggle sub‑component ──────────────────────────────────────────
interface ToggleProps {
  active: boolean;
  onChange: (v: boolean) => void;
  label: string;
  icon: React.ReactNode;
}

const Toggle = ({ active, onChange, label, icon }: ToggleProps) => (
  <button
    type="button"
    onClick={() => onChange(!active)}
    className={cn(
      'flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all select-none w-full',
      active
        ? 'bg-indigo-50 border-indigo-250 text-indigo-700'
        : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-300',
    )}
  >
    <div
      className={cn(
        'w-5 h-5 rounded border flex items-center justify-center transition-colors',
        active ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-neutral-300 bg-white',
      )}
    >
      {icon}
    </div>
    <span className="text-[11px] font-bold tracking-tight font-display uppercase">{label}</span>
  </button>
);

// ── Modal ─────────────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children, footer }: ModalProps) => {
  const lenis = useLenis();

  useEffect(() => {
    if (isOpen) lenis?.stop();
    return () => { lenis?.start(); };
  }, [isOpen, lenis]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl border border-neutral-200 shadow-sm w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-sm text-neutral-900 font-display uppercase tracking-wider">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm font-sans admin-scrollbar" data-lenis-prevent>
          {children}
        </div>
        {footer && (
          <div className="px-6 py-3.5 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { addToast } = useToast();
  const cached = getCached<ProjectRecord[]>(CACHE_KEY);

  const [projects, setProjects] = useState<ProjectRecord[]>(cached ?? []);
  const [originalById, setOriginalById] = useState<Map<string, ProjectRecord>>(() => {
    const m = new Map<string, ProjectRecord>();
    (cached ?? []).forEach((p) => m.set(p.id, p));
    return m;
  });
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(!cached);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(emptyForm());

  // image upload
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPendingState = (p: ProjectRecord): PendingState => {
    if (deletedIds.has(p.id)) return 'deleted';
    const orig = originalById.get(p.id);
    if (!orig) return 'created';
    if (isDifferent(p, orig)) return 'updated';
    return 'unchanged';
  };

  const pendingCount = useMemo(
    () =>
      projects.reduce(
        (acc, p) => acc + (getPendingState(p) !== 'unchanged' ? 1 : 0),
        0,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projects, originalById, deletedIds],
  );

  const fetchProjects = async (options: { silent?: boolean } = {}) => {
    if (!options.silent) setLoading(true);
    try {
      const res = await fetch('/api/v1/projects', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) {
        const next: ProjectRecord[] = data.projects || [];
        
        // Build maps of incoming server data
        const serverMap = new Map<string, ProjectRecord>();
        next.forEach((p) => serverMap.set(p.id, p));

        // Preserve local changes:
        const updatedProjects: ProjectRecord[] = [];
        const updatedDeletedIds = new Set<string>();

        // 1. Process current local projects
        projects.forEach((localProj) => {
          const isTemp = localProj.id.startsWith('temp-');
          
          if (isTemp) {
            // Local creation - always preserve
            updatedProjects.push(localProj);
          } else {
            const serverProj = serverMap.get(localProj.id);
            
            if (deletedIds.has(localProj.id)) {
              // Locally deleted
              if (serverProj) {
                // Still exists on server, keep local deleted state
                updatedProjects.push(localProj);
                updatedDeletedIds.add(localProj.id);
              }
            } else {
              // Locally active (either edited or unchanged)
              const origProj = originalById.get(localProj.id);
              const isEdited = origProj && isDifferent(localProj, origProj);
              
              if (isEdited) {
                if (serverProj) {
                  // Keep the local edited version
                  updatedProjects.push(localProj);
                } else {
                  // If it was deleted on the server, keep it
                  updatedProjects.push(localProj);
                }
              } else {
                // Unchanged locally, so take the fresh server version (if it still exists)
                if (serverProj) {
                  updatedProjects.push(serverProj);
                }
              }
            }
          }
        });

        // 2. Add any new projects from the server that are not already in our local list
        const localIds = new Set(projects.map((p) => p.id));
        next.forEach((serverProj) => {
          if (!localIds.has(serverProj.id)) {
            updatedProjects.push(serverProj);
          }
        });

        setProjects(updatedProjects);
        setOriginalById(serverMap);
        setDeletedIds(updatedDeletedIds);
        setCached(CACHE_KEY, next);
      } else if (!options.silent) {
        setProjects([]);
      }
    } catch {
      console.error('Failed to fetch projects');
      if (!options.silent) setProjects([]);
    } finally {
      if (!options.silent) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 800));
    try {
      await Promise.all([fetchProjects({ silent: true }), minDelay]);
    } finally {
      setRefreshing(false);
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
      setEditingId(project.id);
      setFormData(projectToForm(project));
    } else {
      setEditingId(null);
      setFormData(emptyForm());
    }
    setIsModalOpen(true);
  };

  const handleDone = () => {
    if (editingId) {
      setProjects((prev) =>
        prev.map((p) => (p.id === editingId ? formToProject(formData, editingId) : p)),
      );
    } else {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setProjects((prev) => [...prev, formToProject(formData, tempId)]);
    }
    setIsModalOpen(false);
  };

  const toggleDelete = (id: string) => {
    if (!originalById.has(id)) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      return;
    }
    setDeletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleUpload = async (file: File) => {
    if (uploading) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/v1/projects/upload', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        addToast({ message: 'Image uploaded', status: 'success', action: 'Success' });
      } else {
        addToast({ message: data.error || 'Upload failed', status: 'error', action: 'Error' });
      }
    } catch {
      addToast({ message: 'Upload failed', status: 'error', action: 'Error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAll = async () => {
    if (saving || pendingCount === 0) return;
    setSaving(true);

    const creates: ProjectRecord[] = [];
    const updates: ProjectRecord[] = [];
    const deletes: string[] = [];

    projects.forEach((p) => {
      const state = getPendingState(p);
      if (state === 'created') creates.push(p);
      else if (state === 'updated') updates.push(p);
    });
    deletedIds.forEach((id) => {
      if (originalById.has(id)) deletes.push(id);
    });

    let success = 0;
    let failed = 0;

    const post = async (p: ProjectRecord) => {
      const { id: _temp, ...payload } = p;
      void _temp;
      const res = await fetch('/api/v1/projects', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    };
    const put = async (p: ProjectRecord) => {
      const res = await fetch('/api/v1/projects', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify(p),
      });
      return res.ok;
    };
    const del = async (id: string) => {
      const res = await fetch(`/api/v1/projects?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      return res.ok;
    };

    try {
      for (const p of creates) ((await post(p)) ? success++ : failed++);
      for (const p of updates) ((await put(p)) ? success++ : failed++);
      for (const id of deletes) ((await del(id)) ? success++ : failed++);

      if (failed === 0) {
        addToast({
          message: `Committed ${success} change${success === 1 ? '' : 's'} to GitHub`,
          status: 'success',
          action: 'Success',
        });
      } else {
        addToast({
          message: `${success} succeeded, ${failed} failed`,
          status: 'error',
          action: 'Partial',
        });
      }
      await fetchProjects({ silent: true });
    } catch {
      addToast({
        message: 'Failed to commit changes',
        status: 'error',
        action: 'Error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight font-display uppercase">Projects</h1>
          <p className="text-neutral-500 font-medium font-display uppercase text-[11px] tracking-widest mt-0.5">Manage your professional catalog.</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center w-full sm:w-auto justify-end">
          {pendingCount > 0 && (
            <span className="text-[11px] font-bold font-display uppercase tracking-wider text-neutral-500 mr-1 select-none">
              {pendingCount} pending
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={saving || loading || refreshing}
            className="p-2.5 bg-white border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={cn('w-4 h-4', (loading || refreshing) && 'animate-spin')} />
          </button>
          <button
            onClick={handleSaveAll}
            disabled={pendingCount === 0 || saving}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold font-display uppercase text-[11px] tracking-wider transition-colors',
              pendingCount > 0 && !saving
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed',
            )}
          >
            <Save className={cn('w-4 h-4', saving && 'animate-pulse')} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold font-display uppercase text-[11px] tracking-wider hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>
      </div>

      {/* ── Project list ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-3.5 animate-pulse flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-neutral-200" />
                <div className="h-4 bg-neutral-100 rounded w-1/3" />
                <div className="h-3 bg-neutral-100 rounded w-1/5 ml-auto" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center">
            <Folder className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-900 font-display uppercase tracking-wider">No Projects Found</h3>
            <p className="text-neutral-500 text-sm font-sans mt-1">Start by adding your first showcase project.</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            <AnimatePresence initial={false}>
              {projects.map((project) => {
                const state = getPendingState(project);
                const isDeleted = state === 'deleted';
                
                const stateColors = {
                  created: {
                    border: 'border-l-4 border-l-emerald-500',
                    bg: 'bg-emerald-50/10 hover:bg-emerald-50/20',
                    dot: 'bg-emerald-500 ring-emerald-100/80',
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-150'
                  },
                  updated: {
                    border: 'border-l-4 border-l-amber-500',
                    bg: 'bg-amber-50/10 hover:bg-amber-50/20',
                    dot: 'bg-amber-500 ring-amber-100/80',
                    badge: 'bg-amber-50 text-amber-700 border-amber-150'
                  },
                  deleted: {
                    border: 'border-l-4 border-l-red-500',
                    bg: 'bg-red-50/10 hover:bg-red-50/20',
                    dot: 'bg-red-500 ring-red-100/80',
                    badge: 'bg-red-50 text-red-700 border-red-150'
                  },
                  unchanged: {
                    border: 'border-l-4 border-l-transparent',
                    bg: 'hover:bg-neutral-50/60',
                    dot: 'bg-neutral-300 ring-neutral-100/40',
                    badge: ''
                  }
                };
                const config = stateColors[state];

                return (
                  <motion.li
                    layout
                    key={project.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      'group flex items-center gap-3 px-4 py-3.5 transition-all',
                      !isDeleted && 'cursor-pointer',
                      config.border,
                      config.bg
                    )}
                    onClick={() => { if (!isDeleted) handleOpenModal(project); }}
                  >
                    <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0 ring-4 transition-all', config.dot)} title={state} />
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className={cn('text-sm font-bold font-display tracking-tight truncate', isDeleted ? 'line-through text-neutral-400' : 'text-neutral-900')}>
                          {project.name || <span className="italic text-neutral-400">Untitled</span>}
                        </h3>
                        {state !== 'unchanged' && (
                          <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border font-display flex-shrink-0', config.badge)}>
                            {state === 'created' ? 'new' : state === 'updated' ? 'edited' : 'deleted'}
                          </span>
                        )}
                      </div>
                      <span className={cn('hidden md:inline text-[10px] font-semibold uppercase tracking-wider font-display flex-shrink-0', isDeleted ? 'text-neutral-300' : 'text-neutral-400')}>
                        {project.category || '—'}
                      </span>
                      <span className={cn(
                        'hidden sm:inline px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide font-display flex-shrink-0 border',
                        isDeleted ? 'bg-neutral-100 text-neutral-400 border-neutral-200'
                          : project.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-150'
                          : project.status === 'Archived' ? 'bg-neutral-100 text-neutral-600 border-neutral-200'
                          : 'bg-blue-50 text-blue-700 border-blue-150',
                      )}>
                        {project.status}
                      </span>
                      {project.featured && <Star className={cn('w-3.5 h-3.5 fill-current flex-shrink-0', isDeleted ? 'text-neutral-300' : 'text-amber-400')} />}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleDelete(project.id); }}
                      className={cn('p-1.5 rounded-md transition-colors flex-shrink-0', isDeleted ? 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100' : 'text-neutral-400 hover:text-red-600 hover:bg-red-50')}
                      title={isDeleted ? 'Undo delete' : 'Delete'}
                    >
                      {isDeleted ? <Undo2 className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* ── Legend ─────────────────────────────────────────── */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-5 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-[10px] font-display uppercase tracking-wider text-neutral-500">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> New</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Edited</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Deleted</span>
          <span className="ml-auto text-neutral-400 normal-case tracking-normal">Press Save Changes to commit.</span>
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Project' : 'Add New Project'}
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-neutral-500 font-semibold text-xs uppercase font-display tracking-wider hover:text-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDone}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-xs uppercase font-display tracking-wider hover:bg-indigo-700 transition-all"
            >
              Done
            </button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Name + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-display">Project Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 admin-input text-sm text-neutral-900 transition-all outline-none placeholder-neutral-450 font-sans"
                placeholder="Phoenix Engine"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-display">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 admin-input text-sm text-neutral-900 transition-all outline-none placeholder-neutral-450 font-sans"
                placeholder="Game Engine"
              />
            </div>
          </div>

          {/* Short description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-display">Short Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 admin-input text-sm text-neutral-900 transition-all outline-none placeholder-neutral-450 font-sans"
              placeholder="A brief tagline for the showcase card"
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-display">Status</label>
            <div className="flex flex-wrap gap-3">
              {['Under Development', 'Completed', 'Archived'].map((statusOption) => {
                const active = formData.status?.toLowerCase() === statusOption.toLowerCase();
                return (
                  <label
                    key={statusOption}
                    className={cn(
                      'flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wider font-display cursor-pointer transition-all select-none',
                      active
                        ? 'bg-indigo-50 border-indigo-250 text-indigo-700'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={statusOption}
                      checked={active}
                      onChange={() => setFormData({ ...formData, status: statusOption })}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        'w-3 h-3 rounded-full border flex items-center justify-center transition-all',
                        active ? 'border-indigo-600 bg-indigo-600' : 'border-neutral-300 bg-white'
                      )}
                    >
                      {active && <span className="w-1 h-1 rounded-full bg-white" />}
                    </span>
                    {statusOption}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Long description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-display">Long Description</label>
            <textarea
              value={formData.longDescription}
              onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
              rows={8}
              className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 admin-input text-sm text-neutral-900 transition-all outline-none placeholder-neutral-450 font-sans resize-y dark-scrollbar"
              placeholder="Detailed explanation of the project"
            />
          </div>

          {/* Tech stack — list editor */}
          <ListEditor
            label="Tech Stack"
            items={formData.techStack}
            onChange={(next) => setFormData({ ...formData, techStack: next })}
            placeholder="Type a technology and press Enter"
          />

          {/* Features — list editor */}
          <ListEditor
            label="Features"
            items={formData.features}
            onChange={(next) => setFormData({ ...formData, features: next })}
            placeholder="Type a feature and press Enter"
          />

          {/* Image */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-display">Image</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="flex-1 px-3 py-2.5 rounded-lg border border-neutral-200 admin-input text-sm text-neutral-900 transition-all outline-none placeholder-neutral-450 font-sans"
                placeholder="https://… or upload below"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-lg font-semibold text-xs uppercase font-display tracking-wider hover:bg-neutral-200 transition-colors disabled:opacity-50 shrink-0"
              >
                {uploading ? (
                  <>Uploading…</>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Upload
                  </>
                )}
              </button>
            </div>
            {formData.imageUrl && (
              <div className="mt-2 relative block w-full rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-auto object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            {!formData.imageUrl && (
              <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400 font-sans">
                <ImagePlus className="w-4 h-4" /> No image set
              </div>
            )}
          </div>

          {/* GitHub + Demo URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-display">GitHub URL</label>
              <input
                type="text"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 admin-input text-sm text-neutral-900 transition-all outline-none placeholder-neutral-450 font-sans"
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-display">Demo URL</label>
              <input
                type="text"
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 admin-input text-sm text-neutral-900 transition-all outline-none placeholder-neutral-450 font-sans"
                placeholder="https://demo.example.com"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <Toggle
              active={formData.featured}
              onChange={(v) => setFormData({ ...formData, featured: v })}
              label="Featured"
              icon={formData.featured ? <Star className="w-3 h-3 fill-current" /> : null}
            />
            <Toggle
              active={formData.visible}
              onChange={(v) => setFormData({ ...formData, visible: v })}
              label="Public"
              icon={formData.visible ? <Eye className="w-3 h-3" /> : null}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
