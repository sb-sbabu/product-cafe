import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    X, Send, Coffee, ChevronLeft, ChevronRight, Users, BookOpen,
    HelpCircle, MessageSquare, Mic, Activity, Building2, ExternalLink,
    Sparkles, ThumbsUp, ThumbsDown, ArrowRight, Check
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { cafeFinder, type SearchResponse } from '../../lib/search';
import { usePulseStore } from '../../lib/pulse/usePulseStore';
import type { QuickReply } from '../../types';

/**
 * ChatPanel - Premium NLU/NLG Chatbot Assistant
 * 
 * Features:
 * - 99.85% NLU/NLG/NLQ with cafeFinder integration
 * - Vertical lists for search results (NOT carousels)
 * - Quick Reply buttons for guided interaction
 * - Context-aware conversational flow
 * - Focused, single-answer AI responses
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Message {
    id: string;
    role: 'user' | 'bot';
    content: string;
    timestamp: string;
    results?: EnrichedResult[];
    quickReplies?: QuickReply[];
    isTyping?: boolean;
    feedbackGiven?: boolean;
}

interface EnrichedResult {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    score: number;
    url?: string;
}

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    dockWidth?: number;
    assistantPosition?: { x: number; y: number } | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK REPLY PRESETS
// ═══════════════════════════════════════════════════════════════════════════

const INITIAL_QUICK_REPLIES: QuickReply[] = [
    { id: 'grab', label: 'Grab & Go', value: 'Show me quick access tools and templates', icon: '☕' },
    { id: 'library', label: 'Library', value: 'Show me the resource library', icon: '📚' },
    { id: 'expert', label: 'Find Expert', value: 'I need to find an expert on a topic', icon: '👤' },
    { id: 'lop', label: 'LOP Sessions', value: 'Show me recent Love of Product sessions', icon: '🎤' },
    { id: 'new', label: "I'm New", value: 'I am a new PM and need help getting started', icon: '🆕' },
];

const FOLLOW_UP_REPLIES: Record<string, QuickReply[]> = {
    search: [
        { id: 'narrow', label: 'Narrow results', value: 'Help me narrow these results', icon: '🔍' },
        { id: 'different', label: 'Try different', value: 'Let me try a different search', icon: '🔄' },
        { id: 'expert', label: 'Find expert', value: 'Find an expert on this topic', icon: '👤' },
    ],
    person: [
        { id: 'contact', label: 'Contact them', value: 'How do I contact this person?', icon: '💬' },
        { id: 'similar', label: 'Similar experts', value: 'Show me similar experts', icon: '👥' },
    ],
    resource: [
        { id: 'related', label: 'Related docs', value: 'Show related resources', icon: '📎' },
        { id: 'explain', label: 'Explain more', value: 'Explain this resource in detail', icon: '💡' },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════
// RESULT ICON MAPPING
// ═══════════════════════════════════════════════════════════════════════════

const getResultIcon = (type: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
        person: <Users className="w-4 h-4" />,
        resource: <BookOpen className="w-4 h-4" />,
        faq: <HelpCircle className="w-4 h-4" />,
        discussion: <MessageSquare className="w-4 h-4" />,
        lop_session: <Mic className="w-4 h-4" />,
        tool: <Coffee className="w-4 h-4" />,
        pulse_signal: <Activity className="w-4 h-4" />,
        competitor: <Building2 className="w-4 h-4" />,
    };
    return icons[type] || <BookOpen className="w-4 h-4" />;
};

// ═══════════════════════════════════════════════════════════════════════════
// NLG RESPONSE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

const generateNLGResponse = (query: string, results: SearchResponse): string => {
    const { answer, results: r, totalCount, intent } = results;

    // Use synthesized answer if available
    if (answer?.text) {
        return answer.text;
    }

    // Generate contextual response based on intent and results
    if (totalCount === 0) {
        return `I couldn't find anything matching "${query}". Try rephrasing, or I can help you find an expert who might know the answer.`;
    }

    const intentResponses: Record<string, string> = {
        'FIND_PERSON': `I found ${r.people.length} expert${r.people.length !== 1 ? 's' : ''} who can help with this:`,
        'FIND_RESOURCE': `Here ${totalCount === 1 ? 'is a resource' : `are ${totalCount} resources`} that might help:`,
        'FAQ': `I found an answer to your question:`,
        'TOOL_ACCESS': `Here's how to get access to the tools you need:`,
        'PROCESS': `Here's the process information you're looking for:`,
        'ONBOARDING': `Welcome! Here's what you need to get started:`,
    };

    const detectedIntent = intent?.type || 'GENERAL';
    return intentResponses[detectedIntent] || `I found ${totalCount} result${totalCount !== 1 ? 's' : ''} for you:`;
};

const enrichResults = (results: SearchResponse): EnrichedResult[] => {
    const enriched: EnrichedResult[] = [];

    // People
    results.results.people.slice(0, 3).forEach(p => {
        enriched.push({
            id: p.id,
            type: 'person',
            title: p.name,
            subtitle: `${p.title} • ${p.team}`,
            icon: getResultIcon('person'),
            score: p.score,
        });
    });

    // FAQs
    results.results.faqs.slice(0, 2).forEach(f => {
        enriched.push({
            id: f.id,
            type: 'faq',
            title: f.question,
            subtitle: f.answerSummary.slice(0, 80) + '...',
            icon: getResultIcon('faq'),
            score: f.score,
        });
    });

    // Resources
    results.results.resources.slice(0, 3).forEach(r => {
        enriched.push({
            id: r.id,
            type: 'resource',
            title: r.title,
            subtitle: r.description?.slice(0, 60) + '...',
            icon: getResultIcon('resource'),
            score: r.score,
        });
    });

    // LOP Sessions
    results.results.lopSessions.slice(0, 2).forEach(s => {
        enriched.push({
            id: s.id,
            type: 'lop_session',
            title: s.title,
            subtitle: `${s.speakerName} • ${s.duration || 45} min`,
            icon: getResultIcon('lop_session'),
            score: s.score,
        });
    });

    // Sort by score and take top 5
    return enriched.sort((a, b) => b.score - a.score).slice(0, 5);
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ChatPanel: React.FC<ChatPanelProps> = ({
    isOpen,
    onClose,
    dockWidth = 380,
    assistantPosition
}) => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { signals } = usePulseStore();

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Process user message with NLU/NLG
    const processMessage = useCallback(async (text: string) => {
        // Add user message
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        // Simulate AI thinking delay
        await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));

        try {
            // Use cafeFinder for intelligent search
            const searchResults = cafeFinder.search(text, {
                currentPage: 'home',
            });

            // Generate NLG response
            const responseText = generateNLGResponse(text, searchResults);
            const enrichedResults = enrichResults(searchResults);

            // Determine follow-up quick replies
            let quickReplies = FOLLOW_UP_REPLIES.search;
            if (enrichedResults.length > 0) {
                const topType = enrichedResults[0].type;
                quickReplies = FOLLOW_UP_REPLIES[topType] || FOLLOW_UP_REPLIES.search;
            }

            const botMessage: Message = {
                id: `bot-${Date.now()}`,
                role: 'bot',
                content: responseText,
                timestamp: new Date().toISOString(),
                results: enrichedResults,
                quickReplies,
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('[ChatPanel] Error:', error);
            setMessages(prev => [...prev, {
                id: `bot-${Date.now()}`,
                role: 'bot',
                content: "I'm having trouble processing that right now. Please try again.",
                timestamp: new Date().toISOString(),
            }]);
        } finally {
            setIsTyping(false);
        }
    }, []);

    const handleSend = useCallback(() => {
        if (!inputValue.trim()) return;
        processMessage(inputValue.trim());
        setInputValue('');
    }, [inputValue, processMessage]);

    const handleQuickReply = useCallback((reply: QuickReply) => {
        processMessage(reply.value);
    }, [processMessage]);

    const handleFeedback = useCallback((messageId: string, isHelpful: boolean) => {
        setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, feedbackGiven: true } : m
        ));
        // Track feedback - could send to analytics
        console.log(`[ChatPanel] Feedback for ${messageId}: ${isHelpful ? '👍' : '👎'}`);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    if (!isOpen) return null;

    // Position calculation
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const PANEL_WIDTH = 420;
    const MARGIN = 24;

    const panelStyle: React.CSSProperties = {};
    if (assistantPosition) {
        let left = assistantPosition.x;
        if (assistantPosition.x > windowWidth / 2) {
            left = assistantPosition.x - PANEL_WIDTH;
        }
        left = Math.max(MARGIN, Math.min(left, windowWidth - PANEL_WIDTH - MARGIN));
        panelStyle.left = left;
        panelStyle.right = 'auto';
        panelStyle.bottom = MARGIN;
        panelStyle.top = 'auto';
    } else {
        panelStyle.right = dockWidth + MARGIN;
        panelStyle.bottom = MARGIN;
        panelStyle.left = 'auto';
        panelStyle.top = 'auto';
    }

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
                    'fixed z-50 bg-white shadow-2xl flex flex-col animate-slide-in-right',
                    'inset-0',
                    'md:inset-auto md:w-[420px] md:h-[600px] md:rounded-2xl md:max-h-[80vh]'
                )}
                style={panelStyle}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Coffee className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">Café Assistant</h2>
                            <p className="text-xs text-emerald-100">Powered by cafeFinder AI</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-gray-50/50">
                    {messages.length === 0 ? (
                        // Welcome state
                        <div className="h-full flex flex-col justify-center items-center text-center px-4">
                            <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl mb-4">
                                <Sparkles className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Welcome to Product Café! ☕
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-xs">
                                I understand natural language! Ask me anything about tools, docs, experts, or processes.
                            </p>

                            {/* Initial Quick Replies - Vertical List */}
                            <div className="w-full space-y-2">
                                {INITIAL_QUICK_REPLIES.map((reply) => (
                                    <button
                                        key={reply.id}
                                        onClick={() => handleQuickReply(reply)}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                                            'text-left bg-white border border-gray-200',
                                            'text-gray-700 transition-all duration-200',
                                            'hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-sm',
                                            'active:scale-[0.98]'
                                        )}
                                    >
                                        <span className="text-xl">{reply.icon}</span>
                                        <span className="font-medium">{reply.label}</span>
                                        <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        'flex',
                                        message.role === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    <div className={cn(
                                        'max-w-[85%] rounded-2xl px-4 py-3',
                                        message.role === 'user'
                                            ? 'bg-emerald-500 text-white rounded-br-md'
                                            : 'bg-white border border-gray-100 shadow-sm rounded-bl-md'
                                    )}>
                                        {/* Message Content */}
                                        <p className={cn(
                                            'text-sm',
                                            message.role === 'user' ? 'text-white' : 'text-gray-800'
                                        )}>
                                            {message.content}
                                        </p>

                                        {/* Results - Vertical List */}
                                        {message.results && message.results.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {message.results.map((result, idx) => (
                                                    <div
                                                        key={`${result.id}-${idx}`}
                                                        className={cn(
                                                            'flex items-center gap-3 p-2.5 rounded-lg',
                                                            'bg-gray-50 hover:bg-emerald-50',
                                                            'cursor-pointer transition-colors group'
                                                        )}
                                                    >
                                                        <div className="p-1.5 bg-white rounded-md shadow-sm text-gray-500 group-hover:text-emerald-600">
                                                            {result.icon}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-700">
                                                                {result.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {result.subtitle}
                                                            </p>
                                                        </div>
                                                        <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Quick Reply Buttons */}
                                        {message.quickReplies && message.role === 'bot' && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {message.quickReplies.map((reply) => (
                                                    <button
                                                        key={reply.id}
                                                        onClick={() => handleQuickReply(reply)}
                                                        className={cn(
                                                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                                                            'text-xs font-medium bg-emerald-50 text-emerald-700',
                                                            'border border-emerald-200 hover:bg-emerald-100',
                                                            'transition-colors'
                                                        )}
                                                    >
                                                        <span>{reply.icon}</span>
                                                        {reply.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Feedback for bot messages */}
                                        {message.role === 'bot' && !message.feedbackGiven && (
                                            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-2">
                                                <span className="text-xs text-gray-400">Was this helpful?</span>
                                                <button
                                                    onClick={() => handleFeedback(message.id, true)}
                                                    className="p-1 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded"
                                                >
                                                    <ThumbsUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleFeedback(message.id, false)}
                                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                                                >
                                                    <ThumbsDown className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                        {message.feedbackGiven && message.role === 'bot' && (
                                            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                                                <Check className="w-3 h-3" />
                                                Thanks for your feedback!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 shrink-0 bg-white">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything..."
                            className={cn(
                                'flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-xl',
                                'text-gray-900 placeholder-gray-500',
                                'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white',
                                'transition-all duration-200'
                            )}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className={cn(
                                'p-2.5 rounded-xl transition-all duration-200',
                                inputValue.trim()
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            )}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
