import ReactMarkdown from 'react-markdown';
import { ComponentPropsWithoutRef } from 'react';
import { sanitizeMarkdownUrl } from '@/utils/security';
import { ChatMessage } from '../types';

interface MarkdownRendererProps {
    message: ChatMessage;
}

function normalizeDisplayText(text: string) {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/([^\s*])(\*\*[^*\n]+?\*\*)/g, '$1 $2')
        .replace(/\*\*([^*\n]+)\*\*(?=[A-Z])/g, '**$1** ')
        .replace(/([^\s_])(_[^_\n]+?_)/g, '$1 $2')
        .replace(/(_[^_\n]+?_)(?=[A-Z])/g, '$1 ')
        .replace(/([^\n])(\n[-*]\s+)/g, '$1\n\n$2')
        .replace(/(\n[-*]\s+[^\n]+)(\n(?![-*]\s+|\n))/g, '$1\n$2')
        .replace(/([.!?])([A-Z])/g, '$1 $2')
        .replace(/\b(yawn|sigh|anyway|listen|okay|alright|fine)([A-Z])/gi, '$1 $2')
        .replace(/([A-Za-z])(\d+\s+[A-Z])/g, '$1 $2');
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ message: msg }) => {
    const displayText = msg.isSystem || msg.isCommand ? msg.text : normalizeDisplayText(msg.text);

    return (
        <div className="terminal-markdown">
            <ReactMarkdown
                components={{
                    h1: ({ ...props }) => <h1 className={`text-xl font-bold mb-2 font-mono ${msg.isSuccess ? 'text-[#a3be8c]' : msg.isError ? 'text-[#bf616a]' : 'text-[#a3be8c]'}`} {...props} />,
                    h2: ({ ...props }) => <h2 className="text-lg font-bold text-[#b48ead] mb-2 mt-4 font-mono" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc list-outside space-y-1 my-3 text-slate-300 marker:text-[#88c0d0] pl-5 font-mono" {...props} />,
                    ol: ({ ...props }) => <ul className="list-disc list-outside space-y-1 my-3 text-slate-300 marker:text-[#88c0d0] pl-5 font-mono" {...props} />,
                    li: ({ ...props }) => <li className="text-slate-300 font-mono leading-7 pl-1" {...props} />,
                    a: ({ ...props }) => {
                        const sanitizedHref = sanitizeMarkdownUrl(props.href);
                        if (!sanitizedHref) {
                            return <span className="text-[#bf616a] font-mono">[Blocked URL]</span>;
                        }
                        return <a className="text-[#88c0d0] hover:text-[#8fbcbb] underline underline-offset-4 transition-colors font-mono" rel="noopener noreferrer" target="_blank" {...props} href={sanitizedHref} />;
                    },
                    p: ({ ...props }) => <p className={`my-2 leading-7 font-mono ${msg.isError && !msg.isSystem ? 'text-[#ebcb8b]' : ''}`} {...props} />,
                    strong: ({ ...props }) => <strong className={`font-mono ${msg.isSuccess ? 'text-[#a3be8c]' : msg.isError && msg.isSystem ? 'text-[#bf616a]' : 'text-white'} font-bold`} {...props} />,
                    em: ({ ...props }) => <em className="text-slate-100 italic" {...props} />,
                    code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match && !String(children).includes('\n');
                        const text = String(children).trim();
                        
                        if (msg.isError) {
                            return <code className="bg-[var(--bg-card-alt)] text-slate-200 px-1.5 py-0.5 rounded-sm text-xs md:text-sm font-mono border border-[var(--border-color)]">{children}</code>;
                        }
                        
                        if (isInline && text === 'ONLINE') {
                            return <span className="bg-[#a3be8c]/10 text-[#a3be8c] px-1.5 py-0.5 rounded text-xs border border-[#a3be8c]/40 font-mono">ONLINE</span>;
                        }
                        if (isInline && text === 'INTERACTIVE') {
                            return <span className="bg-[#b48ead]/10 text-[#b48ead] px-1.5 py-0.5 rounded text-xs border border-[#b48ead]/40 font-mono">INTERACTIVE</span>;
                        }
                        return isInline ? (
                            <code className="bg-[var(--bg-card-alt)] text-slate-200 px-1.5 py-0.5 rounded-sm text-xs md:text-sm font-mono font-medium border border-[var(--border-color)]" {...props}>
                                {children}
                            </code>
                        ) : (
                            <code className="block bg-[var(--bg-input)] p-3 rounded-base border border-[var(--border-color)] text-[#a3be8c] my-2 font-mono text-xs md:text-sm" {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {displayText}
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
