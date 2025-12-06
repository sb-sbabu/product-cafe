import React, { useState, useRef, useEffect } from 'react';
import { Send, Coffee } from 'lucide-react';
import { ChatMessage } from '../chat/ChatMessage';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useChatbot } from '../../features/chatbot/hooks/useChatbot';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useDock } from '../../contexts/DockContext';
import type { QuickReply } from '../../types';

/**
 * AskTab - The bot conversation tab within Café Dock
 * 
 * Adapted from ChatPanel, but designed to live within the dock container.
 * Features context-aware greetings based on what page the user is viewing.
 */

const getContextualQuickReplies = (pageType: string): QuickReply[] => {
    const baseReplies: QuickReply[] = [
        { id: 'grab', label: 'Grab & Go', value: 'show grab and go', icon: '☕' },
        { id: 'library', label: 'Library', value: 'show library', icon: '📚' },
        { id: 'community', label: 'Find Someone', value: 'find expert', icon: '💬' },
    ];

    // Add context-specific options
    switch (pageType) {
        case 'resource':
            return [
                { id: 'explain', label: 'Explain This', value: 'explain this resource', icon: '💡' },
                { id: 'related', label: 'Related Docs', value: 'show related resources', icon: '📎' },
                ...baseReplies.slice(0, 2),
            ];
        case 'search':
            return [
                { id: 'narrow', label: 'Narrow Results', value: 'help me narrow search', icon: '🔍' },
                { id: 'different', label: 'Different Topic', value: 'search something else', icon: '🔄' },
                ...baseReplies.slice(0, 2),
            ];
        case 'community':
            return [
                { id: 'expert', label: 'Find Expert', value: 'find expert in', icon: '👤' },
                { id: 'teams', label: 'Message on Teams', value: 'how to message expert', icon: '💬' },
                ...baseReplies.slice(0, 2),
            ];
        default:
            return [
                ...baseReplies,
                { id: 'new', label: "I'm New Here", value: 'onboarding help', icon: '🆕' },
            ];
    }
};

const getContextualGreeting = (pageType: string, title?: string): string => {
    switch (pageType) {
        case 'resource':
            return title ? `Questions about "${title}"?` : 'Need help with this resource?';
        case 'search':
            return 'Need help finding something?';
        case 'community':
            return 'Looking for someone specific?';
        case 'library':
            return 'Looking for something in the library?';
        case 'grab-and-go':
            return 'Need a quick link or tool?';
        default:
            return 'Hi! What can I help you find?';
    }
};

export const AskTab: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { messages, sendMessage, isTyping } = useChatbot();
    const { trackQuickReply, track } = useAnalytics();
    const { pageContext, isOpen } = useDock();

    const quickReplies = getContextualQuickReplies(pageContext.type);
    const greeting = getContextualGreeting(pageContext.type, pageContext.title);

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when dock opens
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

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.length === 0 ? (
                    // Welcome state with contextual greeting
                    <div className="h-full flex flex-col justify-center items-center text-center px-2">
                        <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-4">
                            <Coffee className="w-8 h-8 text-amber-600" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">
                            {greeting}
                        </h3>
                        <p className="text-sm text-gray-600 mb-5 max-w-[240px]">
                            I can help you find tools, docs, resources, and connect you with experts.
                        </p>

                        {/* Contextual Quick Replies */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {quickReplies.map((reply) => (
                                <button
                                    key={reply.id}
                                    onClick={() => handleQuickReply(reply)}
                                    className={cn(
                                        `inline-flex items-center gap-1.5 px-3 py-2 rounded-full
                                         text-sm font-medium bg-white border border-gray-200
                                         text-gray-700 transition-all duration-200
                                         hover:bg-cafe-50 hover:border-cafe-300 hover:text-cafe-700
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
            <div className="p-3 border-t border-gray-100 shrink-0 bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        className={cn(
                            `flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl
                             text-gray-900 placeholder-gray-400 text-sm
                             focus:outline-none focus:ring-2 focus:ring-cafe-500/20 focus:border-cafe-400
                             transition-all duration-200`
                        )}
                    />
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="bg-cafe-500 hover:bg-cafe-600 focus:ring-cafe-500 shrink-0"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
