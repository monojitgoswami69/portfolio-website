import ReactMarkdown from 'react-markdown';
import { ComponentPropsWithoutRef } from 'react';
import { sanitizeMarkdownUrl } from '../../../utils/security';
import { ChatMessage } from '../types';

interface MarkdownRendererProps {
    message: ChatMessage;
    roastLevel: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ message: msg, roastLevel: _roastLevel }) => {
    return (
        <div>
            <ReactMarkdown
                components={{
                    h1: ({ ...props }) => <h1 className={`text-xl font-bold mb-2 font-mono ${msg.isSuccess ? 'text-emerald-500/90' : msg.isError ? 'text-rose-500/90' : 'text-green-400'}`} {...props} />,
                    h2: ({ ...props }) => <h2 className="text-lg font-bold text-purple-400 mb-2 mt-4 font-mono" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc list-outside space-y-1 my-2 text-slate-400 marker:text-slate-400 pl-5 font-mono" {...props} />,
                    ol: ({ ...props }) => <ol className="list-decimal list-outside space-y-1 my-2 text-slate-400 marker:text-slate-400 pl-5 font-mono" {...props} />,
                    li: ({ ...props }) => <li className="text-slate-400 font-mono" {...props} />,
                    a: ({ ...props }) => {
                        const sanitizedHref = sanitizeMarkdownUrl(props.href);
                        if (!sanitizedHref) {
                            return <span className="text-red-400 font-mono">[Blocked URL]</span>;
                        }
                        return <a className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors font-mono" rel="noopener noreferrer" target="_blank" {...props} href={sanitizedHref} />;
                    },
                    p: ({ ...props }) => <p className={`mb-2 leading-relaxed font-mono ${msg.isError && !msg.isSystem ? 'text-yellow-400' : ''}`} {...props} />,
                    strong: ({ ...props }) => <strong className={`font-mono ${msg.isSuccess ? 'text-emerald-300' : msg.isError && msg.isSystem ? 'text-rose-300' : 'text-white'} font-bold`} {...props} />,
                    code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match && !String(children).includes('\n');
                        const text = String(children).trim();

                        if (msg.isError) {
                            return <code className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-xs md:text-sm font-mono border border-slate-700/50">{children}</code>;
                        }

                        if (isInline && text === 'ONLINE') {
                            return <span className="bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded text-xs border border-emerald-800 font-mono">ONLINE</span>;
                        }
                        if (isInline && text === 'INTERACTIVE') {
                            return <span className="bg-purple-900/30 text-purple-400 px-1.5 py-0.5 rounded text-xs border border-purple-800 font-mono">INTERACTIVE</span>;
                        }
                        return isInline ? (
                            <code className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-xs md:text-sm font-mono font-medium" {...props}>
                                {children}
                            </code>
                        ) : (
                            <code className="block bg-[#111] p-3 rounded border border-slate-700 text-green-400 my-2 font-mono text-xs md:text-sm" {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {msg.text}
            </ReactMarkdown>
            {msg.subtext && (
                <p className="text-[10px] md:text-xs opacity-40 font-mono italic mt-1">
                    — {msg.subtext}
                </p>
            )}
        </div>
    );
};

export default MarkdownRenderer;
