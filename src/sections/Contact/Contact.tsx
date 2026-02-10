import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Mail, Linkedin, Github, Twitter } from 'lucide-react';
import { isValidEmail, isNonEmpty } from '../../utils/security';
import { submitContact } from './submitContact';
import contactData from '../../data/contact.json';

const Contact: React.FC = () => {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end end"]
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const [config, setConfig] = useState<{
        contact: {
            email: string;
            socials: {
                github: string;
                linkedin: string;
                twitter: string;
            }
        }
    } | null>(null);

    useEffect(() => {
        if (contactData) {
            setConfig(contactData as { contact: { email: string; socials: { github: string; linkedin: string; twitter: string } } });
        }
    }, []);

    const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate inputs
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

    const socialLinks = config ? [
        { Icon: Github, url: config.contact.socials.github },
        { Icon: Linkedin, url: config.contact.socials.linkedin },
        { Icon: Twitter, url: config.contact.socials.twitter },
        { Icon: Mail, url: `mailto:${config.contact.email}` }
    ] : [];

    return (
        <section ref={ref} className="min-h-screen relative z-20 bg-slate-950 flex flex-col justify-center overflow-hidden pt-24 pb-4 lg:pb-8" style={{ position: 'relative' }}>
            <motion.div
                style={{ opacity }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
            >
                <div id="contact" className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 scroll-mt-[85px]">

                    {/* Left Column - Contact Info */}
                    <div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 font-averia text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
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
                            {socialLinks.map(({ Icon, url }, idx) => (
                                <a
                                    key={idx}
                                    href={url}
                                    target={url.startsWith('mailto') ? undefined : "_blank"}
                                    rel={url.startsWith('mailto') ? undefined : "noopener noreferrer"}
                                    className="p-2 lg:p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800 transition-all transform hover:scale-110"
                                >
                                    <Icon size={20} className="lg:w-6 lg:h-6" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div>
                        <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
                            <div className="grid grid-cols-2 gap-3 lg:gap-4">
                                <div className="space-y-1 lg:space-y-2">
                                    <label className="text-xs lg:text-sm font-mono text-slate-500">USER_ID</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 lg:p-3 text-sm lg:text-base text-white focus:border-cyan-500 outline-none transition-colors"
                                        placeholder="Name"
                                        required
                                    />
                                </div>
                                <div className="space-y-1 lg:space-y-2">
                                    <label className="text-xs lg:text-sm font-mono text-slate-500">RETURN_ADDRESS</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 lg:p-3 text-sm lg:text-base text-white focus:border-cyan-500 outline-none transition-colors"
                                        placeholder="Email"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1 lg:space-y-2">
                                <label className="text-xs lg:text-sm font-mono text-slate-500">PAYLOAD</label>
                                <textarea
                                    rows={3}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 lg:p-3 text-sm lg:text-base text-white focus:border-cyan-500 outline-none transition-colors lg:rows-4"
                                    placeholder="Message..."
                                    required
                                />
                            </div>

                            {submitStatus === 'success' && (
                                <div className="text-sm text-green-400 font-mono">
                                    ✓ Message transmitted successfully!
                                </div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="text-sm text-red-400 font-mono">
                                    ✗ {errorMessage || 'Transmission failed. Please try again.'}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 lg:py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm lg:text-base font-bold tracking-widest rounded-lg transition-colors font-mono uppercase relative overflow-hidden group"
                            >
                                <span className="relative z-10">
                                    {isSubmitting ? 'Transmitting...' : 'Transmit Data'}
                                </span>
                                {!isSubmitting && (
                                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>

            {/* Footer - Static relative flow */}
            <div className="w-full text-center text-slate-600 font-mono text-[10px] sm:text-xs z-30 mt-8 sm:mt-12">
                <p>
                    &copy; 2026 Monojit Goswami. All Rights Reserved.
                </p>
            </div>
        </section>
    );
};

export default Contact;
