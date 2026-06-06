import { useRef, useState } from 'react';
import { motion } from '@/lib/motion';
import { Mail } from 'lucide-react';
import { Github, Linkedin, Twitter } from '@/lib/icons';
import { isValidEmail, isNonEmpty, sanitizeUrl } from '@/utils/security';
import { submitContact } from './submitContact';
import { HomeSection } from '../../types';
import type { SiteContact } from '@/lib/content/site-data';

interface ContactProps {
    contact: SiteContact;
}

const Contact: React.FC<ContactProps> = ({ contact }) => {
    const ref = useRef<HTMLElement>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isNonEmpty(formData.name)) {
            setSubmitStatus('error');
            setErrorMessage('Please enter your name');
            setTimeout(() => {
                setSubmitStatus('idle');
                setErrorMessage('');
            }, 3000);
            return;
        }

        if (!isValidEmail(formData.email)) {
            setSubmitStatus('error');
            setErrorMessage('Please enter a valid email address');
            setTimeout(() => {
                setSubmitStatus('idle');
                setErrorMessage('');
            }, 3000);
            return;
        }

        if (!isNonEmpty(formData.message) || formData.message.length < 10) {
            setSubmitStatus('error');
            setErrorMessage('Message must be at least 10 characters');
            setTimeout(() => {
                setSubmitStatus('idle');
                setErrorMessage('');
            }, 3000);
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');
        setErrorMessage('');

        const result = await submitContact(formData);

        if (result.success) {
            setSubmitStatus('success');
            setFormData({ name: '', email: '', message: '' });
            setErrorMessage('');
            setTimeout(() => setSubmitStatus('idle'), 5000);
        } else {
            setSubmitStatus('error');
            setErrorMessage(result.error || 'Transmission failed. Please try again.');
            setTimeout(() => {
                setSubmitStatus('idle');
                setErrorMessage('');
            }, 5000);
        }

        setIsSubmitting(false);
    };

    const socialLinks = [
        { Icon: Github, url: contact.socials.github, label: 'GitHub profile' },
        { Icon: Linkedin, url: contact.socials.linkedin, label: 'LinkedIn profile' },
        { Icon: Twitter, url: contact.socials.twitter, label: 'Twitter / X profile' },
        { Icon: Mail, url: `mailto:${contact.email}`, label: 'Send an email' }
    ];

    return (
        <section
            id={HomeSection.CONTACT}
            ref={ref}
            className="relative z-20 bg-transparent flex flex-col justify-center overflow-hidden pt-8 pb-12 lg:pb-20 scroll-mt-[85px]"
           
        >
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                    {/* Left Column - Contact Info */}
                    <div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-quantico text-transparent bg-clip-text bg-gradient-to-r from-[#88c0d0] to-[#b48ead]">
                            5.0 // ESTABLISH SIGNAL
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base mb-4 lg:mb-6 font-mono uppercase tracking-widest text-slate-400">
                            Connect &amp; Collaborate
                        </p>
                        <p className="text-sm sm:text-base lg:text-lg mb-6 lg:mb-8 text-slate-400">
                            Currently available for freelance projects and full-time opportunities.
                            If you have an interesting proposition or just want to discuss the future of AI, send a transmission.
                        </p>

                        <div className="flex gap-3 lg:gap-4 mt-6 lg:mt-8 justify-center lg:justify-start">
                            {socialLinks.map(({ Icon, url, label }, idx) => (
                                <a
                                    key={idx}
                                    href={sanitizeUrl(url)}
                                    aria-label={label}
                                    target={url.startsWith('mailto') ? undefined : "_blank"}
                                    rel={url.startsWith('mailto') ? undefined : "noopener noreferrer"}
                                    className="p-2 lg:p-3 bg-[var(--bg-card-alt)] border-2 border-[var(--border-color)] text-slate-400 shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none hover:bg-[#88c0d0] hover:text-[#1b2234] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none active:bg-[#8fbcbb] active:text-[#1b2234] active:transition-none transition-all duration-200 rounded-base"
                                >
                                    <Icon size={20} className="lg:w-6 lg:h-6" aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="w-full">
                        <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
                            <div className="flex flex-col gap-3 lg:gap-4">
                                <div>
                                    <label htmlFor="contact-name" className="text-xs lg:text-sm font-mono text-slate-400 font-bold block">USER_ID</label>
                                    <input
                                        id="contact-name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[var(--bg-input)] border-2 border-[var(--border-color)] px-3 py-2 lg:py-2.5 text-xs lg:text-sm font-mono text-white focus:border-[#88c0d0] focus:ring-0 outline-none transition-colors rounded-base mt-1.5"
                                        placeholder="Name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-email" className="text-xs lg:text-sm font-mono text-slate-400 font-bold block">RETURN_ADDRESS</label>
                                    <input
                                        id="contact-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-[var(--bg-input)] border-2 border-[var(--border-color)] px-3 py-2 lg:py-2.5 text-xs lg:text-sm font-mono text-white focus:border-[#88c0d0] focus:ring-0 outline-none transition-colors rounded-base mt-1.5"
                                        placeholder="Email"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="contact-message" className="text-xs lg:text-sm font-mono text-slate-400 font-bold block">PAYLOAD</label>
                                <textarea
                                    id="contact-message"
                                    name="message"
                                    rows={3}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-[var(--bg-input)] border-2 border-[var(--border-color)] px-3 py-2 lg:py-2.5 text-xs lg:text-sm font-mono text-white focus:border-[#88c0d0] focus:ring-0 outline-none transition-colors min-h-[100px] rounded-base mt-1.5"
                                    placeholder="Message..."
                                    required
                                />
                            </div>

                            {submitStatus === 'success' && (
                                <div className="text-sm text-[#a3be8c] font-mono border-2 border-[#a3be8c]/40 bg-[#a3be8c]/10 p-2 rounded-base">
                                    ✓ Message transmitted successfully!
                                </div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="text-sm text-[#bf616a] font-mono border-2 border-[#bf616a]/40 bg-[#bf616a]/10 p-2 rounded-base">
                                    ✗ {errorMessage || 'Transmission failed. Please try again.'}
                                </div>
                            )}

                            <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 lg:py-4 bg-[#88c0d0] text-[#1b2234] border-2 border-transparent disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-transparent text-sm lg:text-base font-bold tracking-widest transition-all font-mono uppercase shadow-[var(--shadow-offset)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none active:transition-none rounded-base cursor-pointer"
                                >
                                {isSubmitting ? 'Transmitting...' : 'Transmit Data'}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
 
            {/* Footer */}
            <footer className="w-full text-center text-slate-500 font-mono text-xs sm:text-sm z-30 mt-8 sm:mt-12 flex flex-col items-center gap-3">
                <p className="font-bold text-slate-400">
                    &copy; 2026 Monojit Goswami. All Rights Reserved.
                </p>
            </footer>
        </section>
    );
};

export default Contact;
