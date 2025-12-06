import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Coffee } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useChatbot } from '../../features/chatbot/hooks/useChatbot';
import { useAnalytics } from '../../hooks/useAnalytics';
import type { QuickReply } from '../../types';

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const initialQuickReplies: QuickReply[] = [
    { id: 'grab', label: 'Grab & Go', value: 'show grab and go', icon: '☕' },
    { id: 'library', label: 'Library', value: 'show library', icon: '📚' },
    { id: 'community', label: 'Find Someone', value: 'find expert', icon: '💬' },
    { id: 'new', label: "I'm New Here", value: 'onboarding help', icon: '🆕' },
    { id: 'tool', label: 'Tool Help', value: 'need tool access', icon: '🔧' },
];

export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { messages, sendMessage, isTyping } = useChatbot();
    const { trackQuickReply, track } = useAnalytics();

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue.trim());
        setInputValue('');
    };

    const handleQuickReply = (reply: QuickReply) => {
        trackQuickReply(reply.id);
        sendMessage(reply.value);
    };

    const handleFeedback = (messageId: string, isHelpful: boolean) => {
        track({ type: 'faq_helpful', faqId: messageId, helpful: isHelpful });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 z-50 md:bg-transparent md:pointer-events-none"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={cn(
                    `fixed z-50 bg-white shadow-2xl flex flex-col
           animate-slide-in-right`,
                    // Mobile: full screen
                    'inset-0',
                    // Desktop: side panel
                    'md:inset-auto md:right-4 md:bottom-4 md:top-auto md:left-auto',
                    'md:w-[420px] md:h-[600px] md:rounded-2xl md:max-h-[80vh]'
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 rounded-xl">
                            <Coffee className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">Café Assistant</h2>
                            <p className="text-xs text-gray-500">Always here to help</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                    {messages.length === 0 ? (
                        // Welcome state
                        <div className="h-full flex flex-col justify-center items-center text-center px-4">
                            <div className="p-4 bg-emerald-50 rounded-full mb-4">
                                <Coffee className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Welcome to Product Café! ☕
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-xs">
                                I can help you find tools, docs, resources, and connect you with experts.
                            </p>

                            {/* Initial Quick Replies */}
                            <div className="flex flex-wrap justify-center gap-2">
                                {initialQuickReplies.map((reply) => (
                                    <button
                                        key={reply.id}
                                        onClick={() => handleQuickReply(reply)}
                                        className={cn(
                                            `inline-flex items-center gap-2 px-4 py-2 rounded-full
                       text-sm font-medium bg-white border border-gray-200
                       text-gray-700 transition-all duration-200
                       hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm
                       active:scale-95`
                                        )}
                                    >
                                        <span>{reply.icon}</span>
                                        {reply.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Message list
                        <>
                            {messages.map((message) => (
                                <ChatMessage
                                    key={message.id}
                                    message={message}
                                    onQuickReply={handleQuickReply}
                                    onFeedback={(isHelpful) => handleFeedback(message.id, isHelpful)}
                                />
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <ChatMessage
                                    message={{
                                        id: 'typing',
                                        role: 'bot',
                                        content: '',
                                        timestamp: new Date().toISOString(),
                                        isTyping: true,
                                    }}
                                />
                            )}

                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 shrink-0">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className={cn(
                                `flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-xl
                 text-gray-900 placeholder-gray-500
                 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white
                 transition-all duration-200`
                            )}
                        />
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className="bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
