import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ResourceCard } from '../cards/ResourceCard';
import { FAQCard } from '../cards/FAQCard';
import { PersonCard } from '../cards/PersonCard';
import type { ChatMessage as ChatMessageType, QuickReply } from '../../types';

/**
 * Simple markdown-like parser for chat messages
 * Supports: **bold**, bullet points (•, -), numbered lists, emojis
 */
function parseMessageContent(content: string): React.ReactNode {
    const lines = content.split('\n');

    return lines.map((line, lineIdx) => {
        // Process bold text **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const processedLine = parts.map((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={partIdx} className="font-semibold">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });

        // Check if it's a bullet point line
        const trimmed = line.trim();
        const isBullet = trimmed.startsWith('• ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed);
        const isHeader = trimmed.startsWith('📍');

        if (isBullet) {
            return (
                <div key={lineIdx} className="pl-2 flex items-start gap-1">
                    <span className="text-cafe-600">
                        {trimmed.startsWith('•') ? '•' : trimmed.startsWith('-') ? '•' : trimmed.match(/^\d+\./)?.[0] || '•'}
                    </span>
                    <span>{processedLine.slice(trimmed.startsWith('• ') || trimmed.startsWith('- ') ? 2 : 0)}</span>
                </div>
            );
        }

        if (isHeader) {
            return (
                <div key={lineIdx} className="font-medium text-cafe-700 mt-2 first:mt-0">
                    {processedLine}
                </div>
            );
        }

        // Empty line handling
        if (line.trim() === '') {
            return <div key={lineIdx} className="h-2" />;
        }

        return <div key={lineIdx}>{processedLine}</div>;
    });
}

/**
 * Inline feedback with animated state
 */
const InlineFeedback: React.FC<{
    onFeedback: (isHelpful: boolean) => void;
}> = ({ onFeedback }) => {
    const [submitted, setSubmitted] = useState<boolean | null>(null);

    const handleFeedback = (helpful: boolean) => {
        setSubmitted(helpful);
        onFeedback(helpful);
    };

    if (submitted !== null) {
        return (
            <div className="flex items-center gap-2 text-xs animate-scale-in">
                <span className={submitted ? 'text-green-600' : 'text-amber-600'}>
                    {submitted ? '👍 Thanks!' : '👎 Thanks for the feedback'}
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Was this helpful?</span>
            <button
                onClick={() => handleFeedback(true)}
                className="p-1.5 hover:text-green-600 hover:bg-green-50 rounded-full transition-all press-effect"
                aria-label="Yes, helpful"
            >
                <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
                onClick={() => handleFeedback(false)}
                className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded-full transition-all press-effect"
                aria-label="No, not helpful"
            >
                <ThumbsDown className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

interface ChatMessageProps {
    message: ChatMessageType;
    onQuickReply?: (reply: QuickReply) => void;
    onFeedback?: (isHelpful: boolean) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    onQuickReply,
    onFeedback,
}) => {
    const isBot = message.role === 'bot';

    return (
        <div
            className={cn(
                'flex flex-col gap-2 animate-slide-up',
                isBot ? 'items-start' : 'items-end'
            )}
        >
            {/* Message Bubble */}
            <div
                className={cn(
                    'rounded-2xl px-4 py-3 max-w-[85%]',
                    isBot
                        ? 'bg-gray-100 text-gray-900 rounded-bl-md'
                        : 'bg-cafe-500 text-white rounded-br-md'
                )}
            >
                {/* Typing indicator */}
                {message.isTyping ? (
                    <div className="flex items-center gap-1.5 py-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                ) : (
                    <div className="text-sm leading-relaxed">
                        {isBot ? parseMessageContent(message.content) : message.content}
                    </div>
                )}
            </div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
                <div className="w-full max-w-[85%] space-y-2">
                    {message.attachments.map((attachment, idx) => {
                        if (attachment.type === 'resource') {
                            return (
                                <ResourceCard
                                    key={idx}
                                    resource={attachment.data.resource}
                                    variant="compact"
                                />
                            );
                        }
                        if (attachment.type === 'faq') {
                            return (
                                <FAQCard
                                    key={idx}
                                    faq={attachment.data.faq}
                                    defaultExpanded={false}
                                />
                            );
                        }
                        if (attachment.type === 'person') {
                            return (
                                <PersonCard
                                    key={idx}
                                    person={attachment.data.person}
                                    variant="list"
                                />
                            );
                        }
                        return null;
                    })}
                </div>
            )}

            {/* Quick Replies */}
            {message.quickReplies && message.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2 max-w-[85%]">
                    {message.quickReplies.map((reply) => (
                        <button
                            key={reply.id}
                            onClick={() => onQuickReply?.(reply)}
                            className={cn(
                                `inline-flex items-center gap-2 px-4 py-2 rounded-full
                 text-sm font-medium bg-white border border-gray-200
                 text-gray-700 transition-all duration-200
                 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm
                 active:scale-95`
                            )}
                        >
                            {reply.icon && <span>{reply.icon}</span>}
                            {reply.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Feedback buttons for bot messages */}
            {isBot && !message.isTyping && onFeedback && (
                <InlineFeedback onFeedback={onFeedback} />
            )}
        </div>
    );
};

// Quick Reply Button Component
interface QuickReplyButtonProps {
    reply: QuickReply;
    onClick: () => void;
    variant?: 'default' | 'primary';
}

export const QuickReplyButton: React.FC<QuickReplyButtonProps> = ({
    reply,
    onClick,
    variant = 'default',
}) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                `inline-flex items-center gap-2 px-4 py-2 rounded-full
         text-sm font-medium transition-all duration-200
         active:scale-95`,
                variant === 'primary'
                    ? 'bg-cafe-500 text-white hover:bg-cafe-600'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            )}
        >
            {reply.icon && <span>{reply.icon}</span>}
            {reply.label}
        </button>
    );
};
