'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, X, Trash2, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useToast } from '@/features/admin/components/context/ToastContext';

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

export default function CommunicationPage() {
  const { addToast } = useToast();
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = filter === 'all' ? '' : filter;
      const res = await fetch(`/api/v1/communication?status=${statusParam}`);
      const data = await res.json();
      setSubmissions(data.records || []);
      setStatusMessage(data.message || null);
    } catch {
      console.error('Failed to load submissions');
      setSubmissions([]);
      setStatusMessage(null);
      addToast({
        message: 'Failed to load submissions',
        status: 'error',
        action: 'Error',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast, filter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSubmissions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSubmissions]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/v1/communication/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await loadSubmissions();
        addToast({
          message: `Marked as ${status}`,
          status: 'success',
          action: 'Success',
        });
      } else {
        addToast({
          message: `Failed to mark as ${status}`,
          status: 'error',
          action: 'Error',
        });
      }
    } catch {
      console.error('Failed to update status');
      addToast({
        message: `Failed to mark as ${status}`,
        status: 'error',
        action: 'Error',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const res = await fetch(`/api/v1/communication/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await loadSubmissions();
        addToast({
          message: 'Submission deleted',
          status: 'success',
          action: 'Success',
        });
      } else {
        addToast({
          message: 'Failed to delete submission',
          status: 'error',
          action: 'Error',
        });
      }
    } catch {
      console.error('Failed to delete submission');
      addToast({
        message: 'Failed to delete submission',
        status: 'error',
        action: 'Error',
      });
    }
  };

  const getStats = () => {
    return {
      total: submissions.length,
      new: submissions.filter(s => s.status === 'new').length,
      done: submissions.filter(s => s.status === 'done').length,
      dismissed: submissions.filter(s => s.status === 'dismissed').length
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="w-full min-h-[400px] flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-neutral-500 font-medium font-serif">Loading submissions...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="w-full space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight font-display uppercase">Communication</h1>
        <p className="text-neutral-500 font-bold font-display uppercase text-[11px] tracking-widest mt-1">Manage contact form submissions from your portfolio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="text-3xl font-black text-neutral-900 font-display">{stats.total}</div>
          <div className="text-[11px] text-neutral-400 uppercase font-bold tracking-widest font-display mt-1">Total</div>
        </div>
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
          <div className="text-3xl font-black text-blue-600 font-display">{stats.new}</div>
          <div className="text-[11px] text-blue-600 uppercase font-bold tracking-widest font-display mt-1">New</div>
        </div>
        <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
          <div className="text-3xl font-black text-green-600 font-display">{stats.done}</div>
          <div className="text-[11px] text-green-600 uppercase font-bold tracking-widest font-display mt-1">Done</div>
        </div>
        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-5">
          <div className="text-3xl font-black text-neutral-600 font-display">{stats.dismissed}</div>
          <div className="text-[11px] text-neutral-600 uppercase font-bold tracking-widest font-display mt-1">Dismissed</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'new', 'done', 'dismissed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all font-display",
              filter === status
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300"
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {statusMessage && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 font-medium">
          {statusMessage}
        </div>
      )}

      {/* Submissions List */}
      <div className="space-y-3">
        {submissions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-neutral-200">
            <Mail className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 font-serif">No submissions found</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {submissions.map((submission) => {
              const StatusIcon = statusConfig[submission.status as keyof typeof statusConfig]?.icon || Clock;
              const isExpanded = expandedId === submission.id;

              return (
                <motion.div
                  key={submission.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-primary/20 transition-all"
                >
                  <div className="p-5 md:p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-neutral-900 truncate font-display text-lg">{submission.name}</h3>
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap font-display",
                            submission.status === 'new' && "bg-blue-100 text-blue-700",
                            submission.status === 'done' && "bg-green-100 text-green-700",
                            submission.status === 'dismissed' && "bg-neutral-100 text-neutral-600"
                          )}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig[submission.status as keyof typeof statusConfig]?.label || 'New'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 text-[12px] text-neutral-500 font-bold font-display uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {submission.email}
                          </span>
                          <span>
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
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : submission.id)}
                        className="text-primary font-bold text-sm uppercase tracking-wider font-display hover:underline"
                      >
                        {isExpanded ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {/* Message Preview */}
                    {!isExpanded && (
                      <p className="text-sm text-neutral-600 line-clamp-2 mb-4 font-serif">
                        {submission.message}
                      </p>
                    )}

                    {/* Expanded Message */}
                    {isExpanded && (
                      <div className="bg-neutral-50 rounded-xl p-4 mb-4 border border-neutral-100">
                        <p className="text-sm text-neutral-700 whitespace-pre-wrap font-serif">
                          {submission.message}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {submission.status !== 'done' && (
                        <button
                          onClick={() => handleStatusUpdate(submission.id, 'done')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-[12px] font-bold uppercase tracking-widest font-display"
                        >
                          <Check className="w-4 h-4" />
                          Mark Done
                        </button>
                      )}
                      {submission.status !== 'dismissed' && (
                        <button
                          onClick={() => handleStatusUpdate(submission.id, 'dismissed')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-[12px] font-bold uppercase tracking-widest font-display"
                        >
                          <X className="w-4 h-4" />
                          Dismiss
                        </button>
                      )}
                      {submission.status !== 'new' && (
                        <button
                          onClick={() => handleStatusUpdate(submission.id, 'new')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-[12px] font-bold uppercase tracking-widest font-display"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Mark New
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(submission.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-[12px] font-bold uppercase tracking-widest font-display ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
