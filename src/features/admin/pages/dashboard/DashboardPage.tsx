'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, RefreshCw, ListFilter } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
    <div className="flex items-end justify-between gap-1 sm:gap-4 h-32 sm:h-48 px-2">
      {data.map((item, index) => {
        const height = (item.queries / maxValue) * 100;
        return (
          <div
            key={index}
            className="flex-1 flex flex-col items-center gap-2 h-full min-w-0 group"
          >
            <span className="text-[11px] font-bold text-neutral-900 font-display">
               {item.queries}
            </span>
            <div className="w-full flex-1 relative">
              <div className="absolute inset-0 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200/50">
                <motion.div
                  className="w-full bg-primary/20 absolute bottom-0"
                  initial={{ height: 0 }}
                  animate={{ height: `100%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
                <motion.div
                  className="w-full bg-primary/40 rounded-t-lg absolute bottom-0 border-t-2 border-primary"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 2)}%` }}
                  transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider text-center truncate w-full font-display">
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
      className="flex items-start gap-4 py-5 border-b border-neutral-100 last:border-0 group"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
    >
      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
        <Clock className="w-5 h-5 text-indigo-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-neutral-900 tracking-tight leading-snug font-display">{formatAction()}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] font-bold text-primary uppercase font-display">{actor}</span>
          <span className="text-neutral-300">•</span>
          <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider font-display">
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
  const [weeklyData, setWeeklyData] = useState<WeeklyDataItem[]>(generateFallbackWeeklyData());
  const [activityData, setActivityData] = useState<DashboardActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataStatusMessage, setDataStatusMessage] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
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
        setWeeklyData(weeklyDataJson.weekly.map((item: { date: string; queries?: number }) => ({
          date: formatChartDate(item.date),
          queries: item.queries || 0
        })));
      }

      setActivityData(activityDataJson.activity || []);
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
            onClick={fetchDashboardData}
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
                 onClick={fetchDashboardData}
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
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight font-display">
            Dashboard
          </h1>
          <p className="text-neutral-500 font-medium mt-1">
            System overview and recent activities.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="p-3 bg-white border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 hover:text-neutral-900 transition-all disabled:opacity-50 shadow-sm"
          title="Refresh Data"
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      {dataStatusMessage ? (
        <motion.div
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900"
          variants={cardVariants}
        >
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold uppercase tracking-wide">Limited Data Mode</p>
            <p className="text-sm text-amber-800">{dataStatusMessage}</p>
          </div>
        </motion.div>
      ) : null}

      <div className="grid grid-cols-1 gap-6">
        {/* Weekly Activity Chart Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
          variants={cardVariants}
        >
          <div className="p-6 border-b border-neutral-50 flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 tracking-tight text-sm uppercase">Weekly Activity</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Queries</span>
              </div>
            </div>
          </div>
          <div className="p-8">
            {loading && activityData.length === 0 ? (

               <div className="h-40 flex items-center justify-center">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i*0.1}s` }} />
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
          className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
          variants={cardVariants}
        >
          <div className="p-6 border-b border-neutral-50 flex items-center justify-between">
            <h3 className="font-bold text-neutral-900 tracking-tight text-sm uppercase">Recent Activity</h3>
            <button className="text-[11px] font-bold text-primary uppercase tracking-widest hover:underline px-2 py-1">See More &gt;</button>
          </div>
          <div className="divide-y divide-neutral-100 px-6">

            {loading && activityData.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-6 flex items-start gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-neutral-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-100 rounded w-1/4" />
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
              <div className="py-12 text-center text-neutral-400 font-medium">
                No recent activity found.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
