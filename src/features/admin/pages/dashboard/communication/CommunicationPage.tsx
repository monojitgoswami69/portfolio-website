'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from '@/lib/motion';
import { Mail, Trash2, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useToast } from '@/features/admin/components/context/ToastContext';
import { getCached, setCached } from '@/features/admin/lib/cache';

const cacheKey = (filter: string) => `admin:communication:${filter}`;

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } }
};

const statusConfig = {
  new: { label: 'New', color: 'blue', icon: Clock },
  done: { label: 'Done', color: 'green', icon: CheckCircle },
  dismissed: { label: 'Dismissed', color: 'gray', icon: XCircle }
};

interface SubmissionRecord {
  id: string;
  name: string;
  email: string;
  message: string;
  status: keyof typeof statusConfig;
  createdAt: string;
}

function CommunicationPageContent() {
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Page-based active filter derived from URL search parameters (?status=...)
  const filter = searchParams?.get('status') || 'all';

  const initialCached = getCached<SubmissionRecord[]>(cacheKey('all'));
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>(initialCached ?? []);
  const [loading, setLoading] = useState(!initialCached);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 800));
    try {
      await Promise.all([loadSubmissions({ silent: true }), minDelay]);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch all submissions once, filtering is handled reactively on the client
  const loadSubmissions = useCallback(async (options: { silent?: boolean } = {}) => {
    const cached = getCached<SubmissionRecord[]>(cacheKey('all'));
    if (cached && !options.silent) {
      setSubmissions(cached);
      setLoading(false);
    } else if (!options.silent) {
      setLoading(true);
    }
    try {
      const res = await fetch(`/api/v1/communication`, {
        cache: 'no-store',
      });
      const data = await res.json();
      const records: SubmissionRecord[] = data.records || [];
      setSubmissions(records);
      setStatusMessage(data.message || null);
      setCached(cacheKey('all'), records);
    } catch {
      console.error('Failed to load submissions');
      if (!options.silent) {
        setSubmissions([]);
        setStatusMessage(null);
      }
      addToast({
        message: 'Failed to load submissions',
        status: 'error',
        action: 'Error',
      });
    } finally {
      if (!options.silent) setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSubmissions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSubmissions]);

  const setFilter = (nextStatus: string) => {
    const params = new URLSearchParams(searchParams ? Array.from(searchParams.entries()) : []);
    if (nextStatus === 'all') {
      params.delete('status');
    } else {
      params.set('status', nextStatus);
    }
    router.push(`/admin/dashboard/communication?${params.toString()}`);
  };

  const handleStatusUpdate = async (id: string, status: SubmissionRecord['status']) => {
    const previous = submissions;
    const nextSubmissions = submissions.map((s) => (s.id === id ? { ...s, status } : s));
    setSubmissions(nextSubmissions);
    setCached(cacheKey('all'), nextSubmissions);
    try {
      const res = await fetch(`/api/v1/communication/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('request failed');
      addToast({ message: `Marked as ${status}`, status: 'success', action: 'Success' });
    } catch {
      console.error('Failed to update status');
      setSubmissions(previous);
      setCached(cacheKey('all'), previous);
      addToast({
        message: `Failed to mark as ${status}`,
        status: 'error',
        action: 'Error',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    const previous = submissions;
    const nextSubmissions = submissions.filter((s) => s.id !== id);
    setSubmissions(nextSubmissions);
    setCached(cacheKey('all'), nextSubmissions);
    try {
      const res = await fetch(`/api/v1/communication/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (!res.ok) throw new Error('request failed');
      addToast({ message: 'Submission deleted', status: 'success', action: 'Success' });
    } catch {
      console.error('Failed to delete submission');
      setSubmissions(previous);
      setCached(cacheKey('all'), previous);
      addToast({
        message: 'Failed to delete submission',
        status: 'error',
        action: 'Error',
      });
    }
  };

  const stats = {
    total: submissions.length,
    new: submissions.filter(s => s.status === 'new').length,
    done: submissions.filter(s => s.status === 'done').length,
    dismissed: submissions.filter(s => s.status === 'dismissed').length
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="w-full space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight font-display uppercase">Communication</h1>
          <p className="text-neutral-500 font-medium font-display uppercase text-[10px] tracking-widest mt-0.5">Manage contact form submissions</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={cn("w-4 h-4", (loading || refreshing) && "animate-spin")} />
        </button>
      </div>

      {/* Filter Buttons directly on page */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All', count: stats.total },
          { id: 'new', label: 'New', count: stats.new },
          { id: 'done', label: 'Done', count: stats.done },
          { id: 'dismissed', label: 'Dismissed', count: stats.dismissed },
        ].map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all font-display flex items-center gap-1.5 focus:outline-none border",
                active
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300"
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono transition-colors",
                active
                  ? "bg-indigo-700 text-white"
                  : "bg-neutral-100 text-neutral-500"
              )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {statusMessage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 font-medium">
          {statusMessage}
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200/60 p-6 animate-pulse space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-neutral-100 rounded w-32" />
                <div className="h-3 bg-neutral-100 rounded w-20" />
              </div>
              <div className="h-3 bg-neutral-100 rounded w-40" />
              <div className="h-3.5 bg-neutral-100 rounded w-full" />
            </div>
          ))
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-neutral-200/60">
            <Mail className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 font-sans text-sm">No submissions found</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <AnimatePresence mode="popLayout">
              {filteredSubmissions.map((submission) => {
                return (
                  <motion.div
                    key={submission.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 md:p-5 transition-all"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Name/Email/Date & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          {/* Name and Status */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-neutral-900 text-sm md:text-[15px] font-sans">
                              {submission.name}
                            </span>
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider font-display border",
                              submission.status === 'new' && "bg-blue-50/50 text-blue-700 border-blue-100",
                              submission.status === 'done' && "bg-emerald-50/50 text-emerald-700 border-emerald-100",
                              submission.status === 'dismissed' && "bg-neutral-50 text-neutral-500 border border-neutral-250"
                            )}>
                              <span className={cn(
                                "w-1 h-1 rounded-full",
                                submission.status === 'new' && "bg-blue-500",
                                submission.status === 'done' && "bg-emerald-500",
                                submission.status === 'dismissed' && "bg-neutral-400"
                              )} />
                              {submission.status}
                            </span>
                          </div>

                          {/* Email & Date */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                            <a
                              href={`mailto:${submission.email}`}
                              className="text-neutral-600 hover:text-indigo-600 transition-colors font-mono font-medium hover:underline"
                            >
                              {submission.email}
                            </a>
                            <span className="text-neutral-300">•</span>
                            <span className="text-neutral-400 font-sans">
                              {new Date(submission.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Inline Actions */}
                        <div className="flex items-center gap-2 mt-1 sm:mt-0 flex-wrap">
                          {submission.status !== 'done' && (
                            <button
                              onClick={() => handleStatusUpdate(submission.id, 'done')}
                              className="px-3 py-1.5 bg-emerald-50/80 text-emerald-700 border border-emerald-150 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors"
                            >
                              Mark Done
                            </button>
                          )}
                          {submission.status !== 'dismissed' && (
                            <button
                              onClick={() => handleStatusUpdate(submission.id, 'dismissed')}
                              className="px-3 py-1.5 bg-neutral-50 text-neutral-600 border border-neutral-200 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-100 transition-colors"
                            >
                              Dismiss
                            </button>
                          )}
                          {submission.status !== 'new' && (
                            <button
                              onClick={() => handleStatusUpdate(submission.id, 'new')}
                              className="px-3 py-1.5 bg-blue-50/80 text-blue-700 border border-blue-150 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors"
                            >
                              Mark New
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(submission.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-650 hover:bg-red-50/50 rounded-md transition-colors"
                            title="Delete submission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Horizontal Divider */}
                      <div className="border-t border-neutral-200 my-2.5" />

                      {/* Message Body */}
                      <p className="text-[13.5px] text-neutral-700 font-sans leading-relaxed whitespace-pre-wrap max-w-3xl">
                        {submission.message}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function CommunicationPage() {
  return (
    <Suspense fallback={
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight font-display uppercase">Communication</h1>
            <p className="text-neutral-500 font-medium font-display uppercase text-[10px] tracking-widest mt-0.5">Manage contact form submissions</p>
          </div>
        </div>
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200/60 p-6 space-y-3">
              <div className="h-4 bg-neutral-100 rounded w-32" />
              <div className="h-3 bg-neutral-100 rounded w-40" />
              <div className="h-3.5 bg-neutral-100 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    }>
      <CommunicationPageContent />
    </Suspense>
  );
}
