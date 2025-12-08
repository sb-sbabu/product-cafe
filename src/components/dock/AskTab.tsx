import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Coffee, Search, Users, BookOpen, HelpCircle, MessageSquare, Mic, Activity, Building2, Filter, Sparkles, ExternalLink } from 'lucide-react';
import { ChatMessage } from '../chat/ChatMessage';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useChatbot } from '../../features/chatbot/hooks/useChatbot';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useDock } from '../../contexts/DockContext';
import { cafeFinder, type SearchResponse } from '../../lib/search';
import { SmartFiltersPanel, type ActiveFilters } from './SmartFiltersPanel';
import { usePulseStore } from '../../lib/pulse/usePulseStore';
import type { QuickReply } from '../../types';

/**
 * AskTab - NLP-Powered Café Assistant
 * 
 * Features:
 * - Natural Language Understanding with cafeFinder
 * - Smart filter suggestions based on detected entities
 * - Inline search results display
 * - Context-aware quick replies
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXTUAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const getContextualQuickReplies = (pageType: string): QuickReply[] => {
    const baseReplies: QuickReply[] = [
        { id: 'grab', label: 'Grab & Go', value: 'show grab and go', icon: '☕' },
        { id: 'library', label: 'Library', value: 'show library', icon: '📚' },
        { id: 'community', label: 'Find Someone', value: 'find expert', icon: '💬' },
    ];

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

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH RESULT DISPLAY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const ResultIcon: React.FC<{ type: string }> = ({ type }) => {
    const icons: Record<string, React.ReactNode> = {
        person: <Users className="w-3.5 h-3.5" />,
        resource: <BookOpen className="w-3.5 h-3.5" />,
        faq: <HelpCircle className="w-3.5 h-3.5" />,
        discussion: <MessageSquare className="w-3.5 h-3.5" />,
        lop_session: <Mic className="w-3.5 h-3.5" />,
        tool: <Coffee className="w-3.5 h-3.5" />,
        pulse_signal: <Activity className="w-3.5 h-3.5" />,
        competitor: <Building2 className="w-3.5 h-3.5" />,
    };
    return <span className="text-gray-400">{icons[type] || <Search className="w-3.5 h-3.5" />}</span>;
};

interface SearchResultsInlineProps {
    results: SearchResponse;
    onResultClick?: (result: any, type: string) => void;
}

const SearchResultsInline: React.FC<SearchResultsInlineProps> = ({ results, onResultClick }) => {
    const { answer, results: r, totalCount } = results;

    // Get top results from each category
    const topResults = [
        ...r.people.slice(0, 2).map(p => ({ ...p, _type: 'person', _title: p.name, _subtitle: p.title })),
        ...r.faqs.slice(0, 2).map(f => ({ ...f, _type: 'faq', _title: f.question, _subtitle: f.answerSummary })),
        ...r.resources.slice(0, 2).map(res => ({ ...res, _type: 'resource', _title: res.title, _subtitle: res.description })),
        ...r.discussions.slice(0, 1).map(d => ({ ...d, _type: 'discussion', _title: d.title, _subtitle: `${d.replyCount} replies` })),
        ...r.lopSessions.slice(0, 1).map(l => ({ ...l, _type: 'lop_session', _title: l.title, _subtitle: l.speakerName })),
    ].sort((a, b) => b.score - a.score).slice(0, 5);

    if (totalCount === 0) {
        return (
            <div className="text-center py-4 text-sm text-gray-500">
                No results found. Try rephrasing your question.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* AI Answer */}
            {answer && answer.text && (
                <div className="p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-violet-500" />
                        <span className="text-xs font-medium text-violet-700">AI Answer</span>
                    </div>
                    <p className="text-sm text-gray-700">{answer.text}</p>
                </div>
            )}

            {/* Top Results */}
            <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Found {totalCount} results
                </p>
                {topResults.map((result, idx) => (
                    <button
                        key={`${result._type}-${result.id}-${idx}`}
                        onClick={() => onResultClick?.(result, result._type)}
                        className={cn(
                            'w-full p-2.5 rounded-lg text-left transition-all',
                            'bg-white border border-gray-100 hover:border-amber-200 hover:shadow-sm',
                            'group'
                        )}
                    >
                        <div className="flex items-start gap-2.5">
                            <div className="p-1.5 bg-gray-50 rounded-md group-hover:bg-amber-50 transition-colors">
                                <ResultIcon type={result._type} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-amber-700">
                                    {result._title}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                    {result._subtitle}
                                </p>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-amber-500 mt-1" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const AskTab: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { messages, sendMessage, isTyping } = useChatbot();
    const { trackQuickReply, track } = useAnalytics();
    const { pageContext, isOpen } = useDock();
    const { signals } = usePulseStore();

    const quickReplies = getContextualQuickReplies(pageContext.type);
    const greeting = getContextualGreeting(pageContext.type, pageContext.title);

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, searchResults]);

    // Focus input when dock opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Perform smart search using cafeFinder
    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults(null);
            return;
        }

        setIsSearching(true);
        try {
            // Search with context and filters
            const results = cafeFinder.search(query, {
                currentPage: pageContext.type,
                currentTopics: pageContext.tags,
            });
            setSearchResults(results);
        } catch (error) {
            console.error('[AskTab] Search error:', error);
        } finally {
            setIsSearching(false);
        }
    }, [pageContext]);

    // Debounced search on input change
    useEffect(() => {
        if (inputValue.length < 2) {
            setSearchResults(null);
            return;
        }

        const timer = setTimeout(() => {
            performSearch(inputValue);
        }, 300);

        return () => clearTimeout(timer);
    }, [inputValue, performSearch]);

    const handleSend = useCallback(() => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue.trim());
        setInputValue('');
        setSearchResults(null);
    }, [inputValue, sendMessage]);

    const handleQuickReply = useCallback((reply: QuickReply) => {
        trackQuickReply(reply.id);
        sendMessage(reply.value);
    }, [trackQuickReply, sendMessage]);

    const handleFeedback = useCallback((messageId: string, isHelpful: boolean) => {
        track({ type: 'faq_helpful', faqId: messageId, helpful: isHelpful });
    }, [track]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    const handleResultClick = useCallback((result: any, type: string) => {
        // Track and potentially navigate
        track({ type: 'search_result_click', resultType: type, resultId: result.id });
        // Could trigger navigation here
        console.log('[AskTab] Result clicked:', type, result);
    }, [track]);

    const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

    return (
        <div className="flex flex-col h-full">
            {/* Smart Filters Panel (collapsible) */}
            {showFilters && (
                <div className="border-b border-gray-100 animate-slide-down">
                    <SmartFiltersPanel
                        activeFilters={activeFilters}
                        onFilterChange={setActiveFilters}
                        className="rounded-none border-0 shadow-none"
                    />
                </div>
            )}

            {/* Messages / Results */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {/* Show search results if we have them */}
                {searchResults && inputValue && (
                    <div className="animate-fade-in">
                        <SearchResultsInline
                            results={searchResults}
                            onResultClick={handleResultClick}
                        />
                    </div>
                )}

                {/* Show chat messages or welcome state */}
                {!searchResults && messages.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center text-center px-2">
                        <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-4">
                            <Coffee className="w-8 h-8 text-amber-600" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">
                            {greeting}
                        </h3>
                        <p className="text-sm text-gray-600 mb-5 max-w-[240px]">
                            I can help you find tools, docs, resources, experts, LOP sessions, and market intelligence.
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
                ) : !searchResults && (
                    <>
                        {messages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                onQuickReply={handleQuickReply}
                                onFeedback={(isHelpful) => handleFeedback(message.id, isHelpful)}
                            />
                        ))}

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
                {/* Filter Toggle */}
                <div className="flex items-center gap-2 mb-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                            showFilters || activeFilterCount > 0
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
                        )}
                    >
                        <Filter className="w-3.5 h-3.5" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px]">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                    {isSearching && (
                        <span className="text-xs text-gray-400 animate-pulse">Searching...</span>
                    )}
                </div>

                {/* Input Field */}
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
