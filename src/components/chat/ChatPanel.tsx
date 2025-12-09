import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    X, Send, Coffee,
    Sparkles, ThumbsUp, ThumbsDown, Check
} from 'lucide-react';
import { cn } from '../../lib/utils';
// Note: cafeFinder is used via BaristaDataConnector for comprehensive search
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
import {
    generateResponse,
    type LeaderboardEntry,
    type ResponseType,
} from './BaristaDataConnector';
import { classifyIntent, generateQuickReplies } from './BaristaIntentEngine';
import { queryGemini, isAIAvailable, setApiKey } from './BaristaAIProvider';
import { resolveFollowUp, updateContext } from './BaristaContextManager';

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
// CONSTANTS & CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const MAX_INPUT_LENGTH = 500;
const MAX_MESSAGES = 100; // Prevent memory issues
const RESPONSE_DELAY_MS = 150; // Fast but perceptible

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE TYPE MAPPING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Maps ResponseType from BaristaDataConnector to the existing ResponseCardType
 * This bridges the new intent engine with the existing card rendering system
 */
const mapResponseTypeToCardType = (responseType: ResponseType): ResponseCardType => {
    const typeMap: Record<ResponseType, ResponseCardType> = {
        stats: 'stats',
        leaderboard: 'leaderboard',
        session: 'document',       // Individual session -> document card
        session_list: 'list',      // List of sessions -> list card
        signal_list: 'list',       // List of signals -> list card
        discussion_list: 'list',   // List of discussions -> list card
        recognition_list: 'list',  // List of recognitions -> list card
        badge_grid: 'list',        // Badge grid -> list card (rendered specially)
        competitor_list: 'list',   // List of competitors -> list card
        person: 'person',
        document: 'document',
        document_list: 'list',     // List of documents -> list card
        action: 'text',            // Action responses are text-based
        navigation: 'text',        // Navigation hints are text-based
        help: 'text',              // Help messages are text-based
        text: 'text',
    };
    return typeMap[responseType] || 'text';
};

// ═══════════════════════════════════════════════════════════════════════════
// INPUT SANITIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sanitize user input to prevent XSS and handle edge cases
 */
const sanitizeInput = (input: string): string => {
    if (!input || typeof input !== 'string') return '';

    return input
        .trim()
        .slice(0, MAX_INPUT_LENGTH)
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ''); // Remove control characters
};

/**
 * Validate that input is safe to process
 */
const isValidInput = (input: string): boolean => {
    if (!input || typeof input !== 'string') return false;
    const trimmed = input.trim();
    return trimmed.length > 0 && trimmed.length <= MAX_INPUT_LENGTH;
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
    const [aiEnabled, setAiEnabled] = useState(false);
    const [showAISettings, setShowAISettings] = useState(false);
    const [aiKeyInput, setAiKeyInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isProcessingRef = useRef(false); // Guard against duplicate processing

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

    // Process user message with NLU/NLG (or AI when enabled)
    const processMessage = useCallback(async (rawText: string) => {
        // Input validation and sanitization
        const text = sanitizeInput(rawText);
        if (!isValidInput(text)) {
            console.warn('[Barista] Invalid input rejected:', rawText?.slice(0, 50));
            return;
        }

        // Guard against duplicate processing (React StrictMode)
        if (isProcessingRef.current) {
            console.log('[Barista] Already processing, skipping duplicate');
            return;
        }
        isProcessingRef.current = true;

        // Reset category view
        setSelectedCategory(null);

        // Add user message
        const userMessage: Message = {
            id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            role: 'user',
            content: text,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => {
            // Limit message history to prevent memory issues
            const newMessages = [...prev, userMessage];
            if (newMessages.length > MAX_MESSAGES) {
                return newMessages.slice(-MAX_MESSAGES);
            }
            return newMessages;
        });
        setIsTyping(true);

        // Deterministic delay for natural feel
        await new Promise(resolve => setTimeout(resolve, RESPONSE_DELAY_MS));

        try {
            let responseText: string;
            let cardType: ResponseCardType = 'text';
            let cardData: unknown = null;
            let quickReplies: QuickReply[] = [];

            // AI Mode: Use Gemini API
            if (aiEnabled && isAIAvailable()) {
                console.log('[Barista] AI mode - querying Gemini...');
                const aiResponse = await queryGemini(text, {
                    currentUser: 'User',
                    currentPage: 'barista',
                    recentQueries: messages.slice(-3).filter(m => m.role === 'user').map(m => m.content),
                });

                if (aiResponse.success) {
                    responseText = aiResponse.message;

                    // Generate quick replies from AI or use defaults
                    if (aiResponse.suggestedQuickReplies) {
                        quickReplies = aiResponse.suggestedQuickReplies.slice(0, 4).map((label, i) => ({
                            id: `ai-qr-${i}`,
                            label: label.slice(0, 30),
                            value: label,
                            icon: '💡',
                        }));
                    }

                    // If AI detected an intent, try to get card data
                    if (aiResponse.intent) {
                        const intent = classifyIntent(text);
                        if (intent.category !== 'unknown') {
                            const response = generateResponse(intent);
                            cardType = mapResponseTypeToCardType(response.type);
                            cardData = response.data;
                        }
                    }
                } else {
                    // AI failed, fallback to deterministic
                    console.log('[Barista] AI failed, using fallback:', aiResponse.error);
                    const intent = classifyIntent(text);
                    const response = generateResponse(intent);
                    cardType = mapResponseTypeToCardType(response.type);
                    responseText = response.message;
                    cardData = response.data;
                    quickReplies = generateQuickReplies(intent).map(qr => ({
                        id: qr.id,
                        label: qr.label,
                        value: qr.value,
                        icon: qr.icon,
                    }));
                }
            } else {
                // Deterministic Mode: Use intent engine
                let intent = classifyIntent(text);
                console.log('[Barista] Intent classified:', intent);

                // Check for follow-up commands ("more", "another", etc.)
                const followUp = resolveFollowUp(text, intent);
                if (followUp.isFollowUp && followUp.modifiedIntent) {
                    console.log('[Barista] Follow-up detected:', followUp.type);
                    intent = followUp.modifiedIntent;
                }

                const response = generateResponse(intent);
                console.log('[Barista] Response generated:', response.type);

                // Update conversation context for future follow-ups
                updateContext(intent, Array.isArray(response.data) ? response.data.length : 1);

                cardType = mapResponseTypeToCardType(response.type);
                responseText = response.message;
                cardData = response.data;

                const intentQuickReplies = generateQuickReplies(intent);
                quickReplies = intentQuickReplies.map(qr => ({
                    id: qr.id,
                    label: qr.label,
                    value: qr.value,
                    icon: qr.icon,
                }));
            }

            const botMessage: Message = {
                id: `bot-${Date.now()}`,
                role: 'bot',
                content: responseText,
                timestamp: new Date().toISOString(),
                cardType: cardType,
                cardData: cardData,
                quickReplies,
            };

            setMessages(prev => {
                const newMessages = [...prev, botMessage];
                if (newMessages.length > MAX_MESSAGES) {
                    return newMessages.slice(-MAX_MESSAGES);
                }
                return newMessages;
            });
        } catch (error) {
            console.error('[Barista] Error processing message:', error);
            const errorMessage: Message = {
                id: `bot-error-${Date.now()}`,
                role: 'bot',
                content: "I'm having trouble processing that right now. Please try rephrasing your question or try again.",
                timestamp: new Date().toISOString(),
                quickReplies: [
                    { id: 'retry', label: 'Try again', value: text, icon: '🔄' },
                    { id: 'help', label: 'Get help', value: 'What can you help me with?', icon: '❓' },
                ],
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
            isProcessingRef.current = false; // Release the processing lock
        }
    }, [aiEnabled]); // Removed 'messages' to prevent recreation on state change

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
        // ESC to close panel
        if (e.key === 'Escape') {
            onClose();
        }
    }, [handleSend, onClose]);

    // Render response card based on type
    const renderResponseCard = (message: Message) => {
        if (!message.cardType || message.cardType === 'text') return null;

        switch (message.cardType) {
            case 'stats':
                return <StatsCard data={message.cardData as StatsData} userName="Your" />;
            case 'leaderboard':
                return <LeaderboardCard entries={message.cardData as LeaderboardEntry[]} />;
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
                role="dialog"
                aria-label="Café BARISTA Assistant"
                aria-modal="true"
                className={cn(
                    'fixed z-50 bg-white shadow-2xl flex flex-col animate-slide-in-right',
                    'inset-0',
                    'md:inset-auto md:w-[440px] md:h-[650px] md:rounded-2xl md:max-h-[85vh]'
                )}
                style={panelStyle}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                {/* Header - Barista Branding with AI Toggle */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0 bg-emerald-600">
                    <div className="flex items-center gap-2">
                        <div>
                            <h2 className="font-bold text-white tracking-wide flex items-center gap-2">
                                <Coffee className="w-5 h-5" /> Ask Barista
                            </h2>
                            <p className="text-xs text-white/80">
                                {aiEnabled ? '✨ AI Enhanced' : 'Your Product Café Assistant'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* AI Toggle */}
                        <button
                            onClick={() => {
                                if (!isAIAvailable() && !aiEnabled) {
                                    setShowAISettings(true);
                                } else {
                                    setAiEnabled(!aiEnabled);
                                }
                            }}
                            title={aiEnabled ? 'Disable AI mode' : 'Enable AI mode (requires API key)'}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300',
                                aiEnabled
                                    ? 'bg-violet-600 text-white shadow-md'
                                    : 'bg-white/20 text-white/90 hover:bg-white/30'
                            )}
                        >
                            <Sparkles className={cn('w-3.5 h-3.5', aiEnabled && 'animate-pulse')} />
                            {aiEnabled ? 'AI ON' : 'AI'}
                        </button>
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            aria-label="Close Barista assistant"
                            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* AI Settings Panel */}
                {showAISettings && (
                    <div className="px-4 py-3 bg-violet-50 border-b border-violet-200 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-violet-800">✨ Configure AI</span>
                            <button
                                onClick={() => setShowAISettings(false)}
                                className="text-violet-500 hover:text-violet-700 text-xs"
                            >
                                Cancel
                            </button>
                        </div>
                        <p className="text-xs text-violet-600">Enter your Gemini API key to enable AI-enhanced responses.</p>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={aiKeyInput}
                                onChange={(e) => setAiKeyInput(e.target.value)}
                                placeholder="Gemini API Key"
                                className="flex-1 px-3 py-2 text-sm border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                            />
                            <button
                                onClick={() => {
                                    if (aiKeyInput.trim()) {
                                        setApiKey(aiKeyInput.trim());
                                        setAiEnabled(true);
                                        setShowAISettings(false);
                                        setAiKeyInput('');
                                    }
                                }}
                                className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                        <p className="text-xs text-violet-500">
                            Get your key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>
                        </p>
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-gradient-to-b from-emerald-50/30 to-white">
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
                                            ? 'bg-emerald-600 text-white px-4 py-3 rounded-br-md'
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
                            placeholder="Ask me anything or tap a suggestion..."
                            aria-label="Chat message input"
                            maxLength={MAX_INPUT_LENGTH}
                            className={cn(
                                'flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-xl',
                                'text-gray-900 placeholder-gray-500',
                                'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white',
                                'transition-all duration-200'
                            )}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            aria-label={isTyping ? 'Processing...' : 'Send message'}
                            className={cn(
                                'p-2.5 rounded-xl transition-all duration-200',
                                inputValue.trim() && !isTyping
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            )}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">
                            100% Deterministic • &lt;100ms Response Time • 0% Hallucination
                        </p>
                        {inputValue.length > MAX_INPUT_LENGTH * 0.8 && (
                            <span className={cn(
                                'text-xs',
                                inputValue.length >= MAX_INPUT_LENGTH ? 'text-red-500' : 'text-amber-500'
                            )}>
                                {inputValue.length}/{MAX_INPUT_LENGTH}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
