'use client';

import React, { useState, useEffect } from 'react';
import { motion } from '@/lib/motion';
import { Clock, AlertCircle, RefreshCw, ListFilter } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getCached, setCached } from '@/features/admin/lib/cache';

const CACHE_KEY_WEEKLY = 'admin:dashboard:weekly';
const CACHE_KEY_ACTIVITY = 'admin:dashboard:activity';

// Reuse same generating logic from legacy for consistency
const generateFallbackWeeklyData = () => {
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    data.push({
      date: `${day} ${month}`,
      fullDate: date.toISOString(),
      queries: 0,
    });
  }
  return data;
};

const formatChartDate = (dateStr: string) => {
  if (!dateStr) return '';
  
  if (typeof dateStr === 'string' && dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    if (!isNaN(dateObj.getTime())) {
      return `${dateObj.getDate()} ${dateObj.toLocaleDateString('en-US', { month: 'short' })}`;
    }
  }
  
  const dateObj = new Date(dateStr);
  if (!isNaN(dateObj.getTime())) {
    return `${dateObj.getDate()} ${dateObj.toLocaleDateString('en-US', { month: 'short' })}`;
  }
  
  return dateStr;
};

interface WeeklyDataItem {
  date: string;
  queries: number;
}

interface ActivityItemMeta {
  filename?: string;
  [key: string]: unknown;
}

interface DashboardActivity {
  id: string;
  action: string;
  timestamp: string;
  actor: string;
  meta?: ActivityItemMeta;
}

function MiniBarChart({ data }: { data: WeeklyDataItem[] }) {
  const maxValue = Math.max(...data.map(d => d.queries), 1);

  return (
    <div className="flex items-end justify-between gap-2 sm:gap-6 h-32 px-1">
      {data.map((item, index) => {
        const height = (item.queries / maxValue) * 100;
        return (
          <div
            key={index}
            className="flex-1 flex flex-col items-center gap-1.5 h-full min-w-0"
          >
            <span className="text-[10px] font-semibold text-neutral-800 font-display">
               {item.queries}
            </span>
            <div className="w-full flex-1 relative">
              <div className="absolute inset-0 bg-neutral-100 rounded-md overflow-hidden">
                <motion.div
                  className="w-full bg-indigo-600 absolute bottom-0"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 2)}%` }}
                  transition={{ delay: index * 0.03, duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider text-center truncate w-full font-display">
              {item.date}
            </div>
          </div>
        );
      })}
    </div>
  );
}



function ActivityItem({
  action,
  timestamp,
  actor,
  index,
  meta,
}: DashboardActivity & { index: number }) {
  const formatToIST = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatAction = () => {
    const filename = meta?.filename;
    const actionMap: Record<string, string> = {
      'login': 'Logged in',
      'logout': 'Logged out',
      'projects_updated': 'Updated projects',
      'contacts_updated': 'Updated contacts',
      'knowledge_updated': 'Updated knowledge base',
      'system_instructions_updated': 'Updated system instructions',
      'document_uploaded': filename ? `Uploaded: ${filename}` : 'Uploaded document',
      'document_archived': filename ? `Archived: ${filename}` : 'Archived document',
      'document_restored': filename ? `Restored: ${filename}` : 'Restored document',
      'document_deleted': filename ? `Deleted: ${filename}` : 'Deleted document',
      'document_edited': filename ? `Edited: ${filename}` : 'Edited document',
      'document_downloaded': filename ? `Downloaded: ${filename}` : 'Downloaded document',
    };

    return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  return (
    <motion.div
      className="flex items-start gap-3 py-4 border-b border-neutral-100 last:border-0"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
    >
      <Clock className="w-4 h-4 text-neutral-400 mt-1 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-800 tracking-tight leading-snug font-display">{formatAction()}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-bold text-indigo-650 uppercase font-display">{actor}</span>
          <span className="text-neutral-300">•</span>
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-display">
            {formatToIST(timestamp)} IST
          </span>
        </div>
      </div>
    </motion.div>
  );
}



const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, staggerChildren: 0.1 } }
};

const cardVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function DashboardPage() {
  const cachedWeekly = getCached<WeeklyDataItem[]>(CACHE_KEY_WEEKLY);
  const cachedActivity = getCached<DashboardActivity[]>(CACHE_KEY_ACTIVITY);
  const [weeklyData, setWeeklyData] = useState<WeeklyDataItem[]>(
    cachedWeekly ?? generateFallbackWeeklyData()
  );
  const [activityData, setActivityData] = useState<DashboardActivity[]>(cachedActivity ?? []);
  const [loading, setLoading] = useState(!cachedWeekly || !cachedActivity);
  const [error, setError] = useState<string | null>(null);
  const [dataStatusMessage, setDataStatusMessage] = useState<string | null>(null);

  const fetchDashboardData = async (options: { silent?: boolean } = {}) => {
    if (!options.silent) setLoading(true);
    setError(null);
    setDataStatusMessage(null);
    try {
      const [weeklyRes, activityRes] = await Promise.all([
        fetch('/api/v1/dashboard/weekly'),
        fetch('/api/v1/dashboard/activity')
      ]);

      if (!weeklyRes.ok || !activityRes.ok) throw new Error('Failed to fetch dashboard data');

      const weeklyDataJson = await weeklyRes.json();
      const activityDataJson = await activityRes.json();
      const statusMessage =
        weeklyDataJson.message || activityDataJson.message || null;

      if (weeklyDataJson.weekly) {
        const weekly = weeklyDataJson.weekly.map(
          (item: { date: string; queries?: number }) => ({
            date: formatChartDate(item.date),
            queries: item.queries || 0,
          })
        );
        setWeeklyData(weekly);
        setCached(CACHE_KEY_WEEKLY, weekly);
      }

      const activity: DashboardActivity[] = activityDataJson.activity || [];
      setActivityData(activity);
      setCached(CACHE_KEY_ACTIVITY, activity);
      setDataStatusMessage(statusMessage);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchDashboardData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <motion.div
        className="max-w-6xl mx-auto space-y-6"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        {/* Header Area */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight font-display">
              Dashboard
            </h1>
            <p className="text-neutral-500 font-medium mt-1">
              System overview and recent activities.
            </p>
          </div>
          <button
            onClick={() => fetchDashboardData({ silent: true })}
            className="p-3 bg-white border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 hover:text-neutral-900 transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 opacity-60">
          {/* Weekly Activity Chart Card (Error State) */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden relative min-h-[240px] flex flex-col justify-center items-center p-6 text-center">
             <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
             </div>
             <h3 className="font-bold text-neutral-900">Metrics Unavailable</h3>
             <p className="text-sm text-neutral-500 mt-1 max-w-[240px]">{error}</p>
          </div>

          {/* Activity Feed (Error State) */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden min-h-[300px] flex flex-col">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <ListFilter className="w-5 h-5 text-neutral-400" />
                <h3 className="font-bold text-neutral-500 tracking-tight">Recent Activity Log</h3>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
               <p className="text-neutral-400 font-medium">Unable to load activity history.</p>
               <button
                 onClick={() => fetchDashboardData()}
                 className="mt-4 text-primary font-bold text-sm hover:underline"
               >
                 Try to reconnect
               </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }


  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight font-display uppercase">
            Dashboard
          </h1>
          <p className="text-neutral-500 font-medium text-[11px] tracking-widest uppercase mt-0.5">
            System overview and recent activities.
          </p>
        </div>
        <button
          onClick={() => fetchDashboardData({ silent: true })}
          disabled={loading}
          className="p-2.5 bg-white border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 transition-colors disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {dataStatusMessage ? (
        <motion.div
          className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 animate-fade-in"
          variants={cardVariants}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">Limited Data Mode</p>
            <p className="text-sm text-amber-800">{dataStatusMessage}</p>
          </div>
        </motion.div>
      ) : null}

      <div className="grid grid-cols-1 gap-6">
        {/* Weekly Activity Chart Card */}
        <motion.div
          className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
          variants={cardVariants}
        >
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 tracking-tight text-[11px] uppercase tracking-wider">Weekly Activity</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-indigo-650 rounded-full" />
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Queries</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {loading && activityData.length === 0 ? (
               <div className="h-32 flex items-center justify-center">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: `${i*0.1}s` }} />
                    ))}
                  </div>
               </div>
            ) : (
              <MiniBarChart data={weeklyData} />
            )}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
          variants={cardVariants}
        >
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 tracking-tight text-[11px] uppercase tracking-wider">Recent Activity</h3>
            <button
              onClick={() => fetchDashboardData({ silent: true })}
              className="text-[10px] font-semibold text-indigo-650 uppercase tracking-wider hover:underline"
            >
              Sync Log
            </button>
          </div>
          <div className="divide-y divide-neutral-100 px-5">
            {loading && activityData.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-5 flex items-start gap-4 animate-pulse">
                  <div className="w-8 h-8 bg-neutral-100 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-neutral-100 rounded w-1/4" />
                    <div className="h-3 bg-neutral-100 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : activityData.length > 0 ? (
              activityData.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  index={index}
                  {...activity}
                />
              ))
            ) : (
              <div className="py-10 text-center text-neutral-450 text-sm font-medium">
                No recent activity found.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
