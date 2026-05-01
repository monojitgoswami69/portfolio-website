'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Mail, Code, Link2, AtSign, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useToast } from '@/features/admin/components/context/ToastContext';

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

export default function ContactsPage() {
  const { addToast } = useToast();
  const [contact, setContact] = useState<ContactRecord>({
    email: '',
    socials: {
      github: '',
      linkedin: '',
      twitter: ''
    }
  });
  const [originalContact, setOriginalContact] = useState<ContactRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const hasUnsavedChanges = JSON.stringify(contact) !== JSON.stringify(originalContact);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/contacts');
      const data = await res.json();
      const contactData = data.contact || {
        email: '',
        socials: {
          github: '',
          linkedin: '',
          twitter: ''
        }
      };
      
      if (!contactData.socials) {
        contactData.socials = { github: '', linkedin: '', twitter: '' };
      }
      
      setContact(contactData);
      setOriginalContact(contactData);
    } catch {
      console.error('Failed to load contacts');
      addToast({
        message: 'Failed to load contacts',
        status: 'error',
        action: 'Error',
      });
    } finally {
      setLoading(false);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      });
      const data = await res.json();
      if (res.ok) {
        setContact(data.contact || contact);
        setOriginalContact(data.contact || contact);
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

  if (loading) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="w-full h-full min-h-[400px] flex items-center justify-center"
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
          <span className="text-neutral-500 font-medium font-serif">Loading contacts...</span>
        </div>
      </motion.div>
    );
  }

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
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight font-display uppercase">Contact Information</h1>
            <p className="text-neutral-500 font-bold font-display uppercase text-[11px] tracking-widest mt-1">Manage your contact details and social media links.</p>
          </div>
          <button
            onClick={() => loadContacts()}
            disabled={loading || saving}
            className="p-3 bg-white border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 md:p-8">
          {/* Email */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3 font-display">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <input
              type="email"
              value={contact.email}
              onChange={handleEmailChange}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm bg-neutral-50 hover:bg-white transition-colors"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-100 my-8"></div>

          {/* Social Links */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-display">Social Links</h3>

            {/* GitHub */}
            <div>
              <label className="flex items-center gap-2 text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2 font-display">
                <Code className="w-4 h-4" />
                GitHub
              </label>
              <input
                type="url"
                value={contact.socials?.github || ''}
                onChange={(e) => handleSocialChange('github', e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm bg-neutral-50 hover:bg-white transition-colors"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="flex items-center gap-2 text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2 font-display">
                <Link2 className="w-4 h-4" />
                LinkedIn
              </label>
              <input
                type="url"
                value={contact.socials?.linkedin || ''}
                onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm bg-neutral-50 hover:bg-white transition-colors"
              />
            </div>

            {/* Twitter */}
            <div>
              <label className="flex items-center gap-2 text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2 font-display">
                <AtSign className="w-4 h-4" />
                Twitter / X
              </label>
              <input
                type="url"
                value={contact.socials?.twitter || ''}
                onChange={(e) => handleSocialChange('twitter', e.target.value)}
                placeholder="https://twitter.com/username"
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-serif text-sm bg-neutral-50 hover:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex items-center justify-between">
            {hasUnsavedChanges && (
              <span className="text-xs text-amber-500 font-bold uppercase tracking-wider animate-pulse font-display">
                Unsaved Changes
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || saving}
              className={cn(
                "ml-auto flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all font-display",
                hasUnsavedChanges && !saving
                  ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              )}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
