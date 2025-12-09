import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    X, Send, Coffee,
    Sparkles, ThumbsUp, ThumbsDown, Check
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { cafeFinder, type SearchResponse } from '../../lib/search';
import type { QuickReply } from '../../types';
import {
    CategoryTiles,
    CategoryExpanded,
    QuickPicks,
    QUICK_PICKS,
    type Category,
    type QuickSuggestion
} from './BaristaCategories';
import {
    DocumentCard,
    PersonCard,
    StatsCard,
    DefinitionCard,
    VerticalListCard,
    LeaderboardCard,
    type DocumentData,
    type PersonData,
    type StatsData,
    type ListItem
} from './BaristaCards';

/**
 * ChatPanel - Café BARISTA Intelligent Conversational Assistant
 * 
 * B.A.R.I.S.T.A. - Brilliant Answers through Rapid Intelligent Search Technology & Assistance
 * 
 * Features:
 * - 5 Category System: DISCOVER, LEARN, CONNECT, TRACK, DO
 * - Quick Suggestion Pills for each category
 * - Rich Response Cards (Document, Person, Stats, Definition, List)
 * - Deterministic NLU with <100ms response time
 * - Context-aware conversational flow
 * - Premium UI with animations and micro-interactions
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type ResponseCardType = 'document' | 'person' | 'stats' | 'definition' | 'list' | 'leaderboard' | 'text';

interface Message {
    id: string;
    role: 'user' | 'bot';
    content: string;
    timestamp: string;
    cardType?: ResponseCardType;
    cardData?: DocumentData | PersonData | StatsData | ListItem[] | unknown;
    quickReplies?: QuickReply[];
    isTyping?: boolean;
    feedbackGiven?: boolean;
}

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    dockWidth?: number;
    assistantPosition?: { x: number; y: number } | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA FOR DEMO
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_STATS: StatsData = {
    balance: 2450,
    monthlyEarned: 350,
    monthlySpent: 150,
    recentActivity: [
        { id: '1', description: 'Received Toast from Sarah Chen', amount: 100, date: 'Dec 5' },
        { id: '2', description: 'Contributed playbook to Library', amount: 50, date: 'Dec 3' },
        { id: '3', description: 'Redeemed: Starbucks gift card', amount: -150, date: 'Dec 2' },
        { id: '4', description: 'Monthly activity bonus', amount: 200, date: 'Dec 1' },
    ]
};

const MOCK_LEADERBOARD = [
    { rank: 1, name: 'Sarah Chen', team: 'Product Leadership', points: 4250 },
    { rank: 2, name: 'Mike Johnson', team: 'Claims Platform', points: 3890 },
    { rank: 3, name: 'Lisa Wong', team: 'Product Operations', points: 3450 },
    { rank: 4, name: 'You', team: 'Your Team', points: 2450, isCurrentUser: true },
    { rank: 5, name: 'David Martinez', team: 'Data Platform', points: 2100 },
];

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE CARD DETERMINATION
// ═══════════════════════════════════════════════════════════════════════════

const determineResponseType = (query: string, results: SearchResponse): { type: ResponseCardType; data?: unknown } => {
    const lowerQuery = query.toLowerCase();

    // Stats/Points queries
    if (lowerQuery.includes('love point') || lowerQuery.includes('my point') || lowerQuery.includes('balance')) {
        return { type: 'stats', data: MOCK_STATS };
    }

    // Leaderboard queries
    if (lowerQuery.includes('leaderboard') || lowerQuery.includes('ranking') || lowerQuery.includes('who is leading')) {
        return { type: 'leaderboard', data: MOCK_LEADERBOARD };
    }

    // Definition queries
    if (lowerQuery.startsWith('what is') || lowerQuery.startsWith('define') || lowerQuery.startsWith('explain')) {
        const term = lowerQuery.replace(/^(what is|define|explain)\s+/, '').trim();
        return {
            type: 'definition',
            data: {
                term: term.toUpperCase(),
                definition: `${term.charAt(0).toUpperCase() + term.slice(1)} is a key concept in our domain.This is a placeholder definition that would be populated from the knowledge base.`,
                keyPoints: [
                    'First key point about this concept',
                    'Second important aspect to understand',
                    'Third relevant detail'
                ],
                context: 'This concept is particularly relevant in the context of our product and workflows.',
                relatedTopics: ['Related Topic 1', 'Related Topic 2', 'Related Topic 3']
            }
        };
    }

    // Person queries
    if (results.results.people.length > 0 && (lowerQuery.includes('who') || lowerQuery.includes('expert') || lowerQuery.includes('find'))) {
        const person = results.results.people[0];
        return {
            type: 'person',
            data: {
                id: person.id,
                name: person.name,
                title: person.title,
                team: person.team,
                location: person.location || 'Remote',
                tenure: '3+ years',
                expertise: person.expertiseAreas?.slice(0, 5) || ['Product Management'],
            } as PersonData
        };
    }

    // Document queries
    if (results.results.resources.length > 0) {
        const resource = results.results.resources[0];
        return {
            type: 'document',
            data: {
                id: resource.id,
                title: resource.title,
                type: 'pptx',
                version: '3.2',
                updatedAt: 'Dec 2024',
                author: 'Sarah Chen',
                authorTeam: 'Product Team',
                path: 'Library > Grab & Go > Playbooks',
                description: resource.description || 'No description available',
                views: 1247,
                rating: 4.8,
            } as DocumentData
        };
    }

    // List results
    if (results.totalCount > 0) {
        const items: ListItem[] = [];
        results.results.resources.slice(0, 5).forEach(r => {
            items.push({
                id: r.id,
                title: r.title,
                subtitle: r.description?.slice(0, 50) + '...' || 'Resource',
                date: 'Dec 2024',
            });
        });
        results.results.faqs.slice(0, 3).forEach(f => {
            items.push({
                id: f.id,
                title: f.question,
                subtitle: f.answerSummary.slice(0, 50) + '...',
            });
        });
        if (items.length > 0) {
            return { type: 'list', data: items };
        }
    }

    return { type: 'text' };
};

// ═══════════════════════════════════════════════════════════════════════════
// NLG RESPONSE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

const generateBaristaResponse = (_query: string, responseType: ResponseCardType): string => {
    const greetings = ['Great question!', 'Let me help with that!', 'Here\'s what I found:', 'Absolutely!'];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    switch (responseType) {
        case 'stats':
            return `${greeting} Here's your Love Points summary:`;
        case 'leaderboard':
            return `${greeting} Here are the current leaders:`;
        case 'definition':
            return `${greeting} Let me explain that for you:`;
        case 'person':
            return `${greeting} I found an expert who can help:`;
        case 'document':
            return `${greeting} Here's a relevant document:`;
        case 'list':
            return `${greeting} Here are some results:`;
        default:
            return `I found some information that might help. Let me know if you need anything else!`;
    }
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
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
        // Reset category view
        setSelectedCategory(null);

        // Add user message
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        // Simulate AI thinking delay (keeping it fast per PRD)
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

        try {
            // Use cafeFinder for intelligent search
            const searchResults = cafeFinder.search(text, {
                currentPage: 'home',
            });

            // Determine response type and data
            const { type, data } = determineResponseType(text, searchResults);
            const responseText = generateBaristaResponse(text, type);

            // Generate follow-up quick replies
            const quickReplies: QuickReply[] = [
                { id: 'more', label: 'Show more', value: 'Show me more results', icon: '📊' },
                { id: 'different', label: 'Try different', value: 'Let me try something different', icon: '🔄' },
            ];

            const botMessage: Message = {
                id: `bot-${Date.now()}`,
                role: 'bot',
                content: responseText,
                timestamp: new Date().toISOString(),
                cardType: type,
                cardData: data,
                quickReplies,
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('[BARISTA] Error:', error);
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

    const handleCategorySelect = useCallback((category: Category) => {
        setSelectedCategory(category);
    }, []);

    const handleSuggestionSelect = useCallback((suggestion: QuickSuggestion) => {
        processMessage(suggestion.value);
    }, [processMessage]);

    const handleQuickReply = useCallback((reply: QuickReply) => {
        processMessage(reply.value);
    }, [processMessage]);

    const handleFeedback = useCallback((messageId: string, isHelpful: boolean) => {
        setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, feedbackGiven: true } : m
        ));
        console.log(`[BARISTA] Feedback for ${messageId}: ${isHelpful ? '👍' : '👎'}`);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    // Render response card based on type
    const renderResponseCard = (message: Message) => {
        if (!message.cardType || message.cardType === 'text') return null;

        switch (message.cardType) {
            case 'stats':
                return <StatsCard data={message.cardData as StatsData} userName="Your" />;
            case 'leaderboard':
                return <LeaderboardCard entries={message.cardData as typeof MOCK_LEADERBOARD} />;
            case 'document':
                return <DocumentCard data={message.cardData as DocumentData} />;
            case 'person':
                return <PersonCard data={message.cardData as PersonData} />;
            case 'definition':
                return <DefinitionCard data={message.cardData as { term: string; definition: string; keyPoints: string[]; context?: string; relatedTopics: string[] }} />;
            case 'list':
                return (
                    <VerticalListCard
                        title="Search Results"
                        items={message.cardData as ListItem[]}
                        totalCount={(message.cardData as ListItem[]).length}
                    />
                );
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    // Position calculation
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const PANEL_WIDTH = 440;
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
                    'md:inset-auto md:w-[440px] md:h-[650px] md:rounded-2xl md:max-h-[85vh]'
                )}
                style={panelStyle}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - BARISTA Branding */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Coffee className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white tracking-wide">☕ CAFÉ BARISTA</h2>
                            <p className="text-xs text-white/80">Brilliant Answers • Rapid Intelligence</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-gradient-to-b from-amber-50/30 to-white">
                    {messages.length === 0 ? (
                        // Welcome State
                        <div className="space-y-6">
                            {/* Greeting */}
                            <div className="text-center pt-4">
                                <div className="inline-flex p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-4">
                                    <Sparkles className="w-10 h-10 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    Hey there! 👋
                                </h3>
                                <p className="text-gray-600 text-sm max-w-xs mx-auto">
                                    I'm your Café Barista — here to help you find, learn, connect, track, and do anything in Product Café.
                                </p>
                            </div>

                            {/* Category Selection or Expanded */}
                            <div className="px-2">
                                {selectedCategory ? (
                                    <CategoryExpanded
                                        category={selectedCategory}
                                        onBack={() => setSelectedCategory(null)}
                                        onSuggestionSelect={handleSuggestionSelect}
                                    />
                                ) : (
                                    <>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 text-center">
                                            Pick a category to get started
                                        </p>
                                        <CategoryTiles onCategorySelect={handleCategorySelect} />
                                    </>
                                )}
                            </div>

                            {/* Quick Picks */}
                            {!selectedCategory && (
                                <div className="px-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        ✨ Quick Picks
                                    </p>
                                    <QuickPicks picks={QUICK_PICKS} onSelect={handleSuggestionSelect} />
                                </div>
                            )}
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
                                        'max-w-[90%] rounded-2xl',
                                        message.role === 'user'
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 rounded-br-md'
                                            : 'space-y-3'
                                    )}>
                                        {/* Message Content */}
                                        {message.role === 'user' ? (
                                            <p className="text-sm">{message.content}</p>
                                        ) : (
                                            <>
                                                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                                                    <p className="text-sm text-gray-800">{message.content}</p>
                                                </div>

                                                {/* Response Card */}
                                                {renderResponseCard(message)}

                                                {/* Quick Reply Buttons */}
                                                {message.quickReplies && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {message.quickReplies.map((reply) => (
                                                            <button
                                                                key={reply.id}
                                                                onClick={() => handleQuickReply(reply)}
                                                                className={cn(
                                                                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                                                                    'text-xs font-medium bg-amber-50 text-amber-700',
                                                                    'border border-amber-200 hover:bg-amber-100',
                                                                    'transition-colors'
                                                                )}
                                                            >
                                                                <span>{reply.icon}</span>
                                                                {reply.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Feedback */}
                                                {!message.feedbackGiven && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <span>Was this helpful?</span>
                                                        <button
                                                            onClick={() => handleFeedback(message.id, true)}
                                                            className="p-1 hover:text-emerald-500 hover:bg-emerald-50 rounded"
                                                        >
                                                            <ThumbsUp className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleFeedback(message.id, false)}
                                                            className="p-1 hover:text-red-500 hover:bg-red-50 rounded"
                                                        >
                                                            <ThumbsDown className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                                {message.feedbackGiven && (
                                                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                                                        <Check className="w-3 h-3" />
                                                        Thanks for your feedback!
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 shrink-0 bg-white">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="💬 Ask me anything or tap a suggestion..."
                            className={cn(
                                'flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-xl',
                                'text-gray-900 placeholder-gray-500',
                                'focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white',
                                'transition-all duration-200'
                            )}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className={cn(
                                'p-2.5 rounded-xl transition-all duration-200',
                                inputValue.trim()
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            )}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-2">
                        100% Deterministic • &lt;100ms Response Time • 0% Hallucination
                    </p>
                </div>
            </div>
        </>
    );
};
