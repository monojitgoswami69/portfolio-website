'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from '@/lib/motion';
import { Save, Mail, Code, Link2, AtSign, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useToast } from '@/features/admin/components/context/ToastContext';
import { getCached, setCached } from '@/features/admin/lib/cache';

const CACHE_KEY = 'admin:contact';

interface ContactRecord {
  email: string;
  socials: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } }
};

const emptyContact: ContactRecord = {
  email: '',
  socials: { github: '', linkedin: '', twitter: '' },
};

export default function ContactsPage() {
  const { addToast } = useToast();
  const cached = getCached<ContactRecord>(CACHE_KEY);
  const [contact, setContact] = useState<ContactRecord>(cached ?? emptyContact);
  const [originalContact, setOriginalContact] = useState<ContactRecord | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 800));
    try {
      await Promise.all([loadContacts({ silent: true }), minDelay]);
    } finally {
      setRefreshing(false);
    }
  };

  const hasUnsavedChanges = JSON.stringify(contact) !== JSON.stringify(originalContact);

  const loadContacts = useCallback(async (options: { silent?: boolean } = {}) => {
    if (!options.silent) setLoading(true);
    try {
      const res = await fetch('/api/v1/contacts', { cache: 'no-store' });
      const data = await res.json();
      const contactData = data.contact || {
        email: '',
        socials: { github: '', linkedin: '', twitter: '' },
      };
      if (!contactData.socials) {
        contactData.socials = { github: '', linkedin: '', twitter: '' };
      }
      setContact(contactData);
      setOriginalContact(contactData);
      setCached(CACHE_KEY, contactData);
    } catch {
      console.error('Failed to load contacts');
      addToast({
        message: 'Failed to load contacts',
        status: 'error',
        action: 'Error',
      });
    } finally {
      if (!options.silent) setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadContacts();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadContacts]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/contacts', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(contact)
      });
      const data = await res.json();
      if (res.ok) {
        const saved = data.contact || contact;
        setContact(saved);
        setOriginalContact(saved);
        setCached(CACHE_KEY, saved);
        addToast({
          message: `Contacts saved to GitHub${data.commit ? ` (${data.commit})` : ''}`,
          status: 'success',
          action: 'Success',
        });
      } else {
        addToast({
          message: data.error || 'Failed to save contacts',
          status: 'error',
          action: 'Error',
        });
      }
    } catch {
      console.error('Failed to save contacts');
      addToast({
        message: 'Failed to save contacts to GitHub',
        status: 'error',
        action: 'Error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContact({ ...contact, email: e.target.value });
  };

  const handleSocialChange = (platform: string, value: string) => {
    setContact({
      ...contact,
      socials: {
        github: contact.socials?.github || '',
        linkedin: contact.socials?.linkedin || '',
        twitter: contact.socials?.twitter || '',
        [platform]: value
      }
    });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="w-full flex flex-col"
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight font-display uppercase">Contact Info</h1>
            <p className="text-neutral-500 font-medium font-display uppercase text-[11px] tracking-widest mt-0.5">Manage your contact details and social links.</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading || saving || refreshing}
            className="p-2.5 bg-white border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", (loading || refreshing) && "animate-spin")} />
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              {/* Email */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="w-3.5 h-3.5 bg-neutral-250 rounded-full" style={{ backgroundColor: '#e2e8f0' }} />
                  <div className="h-3 bg-neutral-200 rounded w-24" />
                </div>
                <div className="h-10 bg-neutral-100 rounded-lg w-full" />
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-100 my-6"></div>

              {/* Social Profiles */}
              <div className="space-y-5">
                <div className="h-3 bg-neutral-200 rounded w-28 mb-4" />
                
                {/* GitHub */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="w-3.5 h-3.5 bg-neutral-250 rounded-full" style={{ backgroundColor: '#e2e8f0' }} />
                    <div className="h-3 bg-neutral-200 rounded w-16" />
                  </div>
                  <div className="h-10 bg-neutral-100 rounded-lg w-full" />
                </div>

                {/* LinkedIn */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="w-3.5 h-3.5 bg-neutral-250 rounded-full" style={{ backgroundColor: '#e2e8f0' }} />
                    <div className="h-3 bg-neutral-200 rounded w-16" />
                  </div>
                  <div className="h-10 bg-neutral-100 rounded-lg w-full" />
                </div>

                {/* Twitter */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="w-3.5 h-3.5 bg-neutral-250 rounded-full" style={{ backgroundColor: '#e2e8f0' }} />
                    <div className="h-3 bg-neutral-200 rounded w-16" />
                  </div>
                  <div className="h-10 bg-neutral-100 rounded-lg w-full" />
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <div className="h-9.5 bg-neutral-100 rounded-lg w-32" />
              </div>
            </div>
          ) : (
            <>
              {/* Email */}
              <div className="mb-6">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 font-display">
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={handleEmailChange}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 admin-input text-sm text-neutral-900 transition-all outline-none placeholder-neutral-450 font-sans"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-100 my-6"></div>

              {/* Social Links */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider font-display">Social Profiles</h3>

                {/* GitHub */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 font-display">
                    <Code className="w-3.5 h-3.5" />
                    GitHub
                  </label>
                  <input
                    type="url"
                    value={contact.socials?.github || ''}
                    onChange={(e) => handleSocialChange('github', e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 admin-input text-sm text-neutral-900 transition-all outline-none placeholder-neutral-450 font-sans"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 font-display">
                    <Link2 className="w-3.5 h-3.5" />
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={contact.socials?.linkedin || ''}
                    onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 admin-input text-sm text-neutral-900 transition-all outline-none placeholder-neutral-450 font-sans"
                  />
                </div>

                {/* Twitter */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5 font-display">
                    <AtSign className="w-3.5 h-3.5" />
                    Twitter / X
                  </label>
                  <input
                    type="url"
                    value={contact.socials?.twitter || ''}
                    onChange={(e) => handleSocialChange('twitter', e.target.value)}
                    placeholder="https://twitter.com/username"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 admin-input text-sm text-neutral-900 transition-all outline-none placeholder-neutral-450 font-sans"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                {hasUnsavedChanges && (
                  <span className="text-xs text-amber-500 font-bold uppercase tracking-wider animate-pulse font-display">
                    Unsaved Changes
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || saving}
                  className={cn(
                    "ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all font-display",
                    hasUnsavedChanges && !saving
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  )}
                >
                  {saving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
