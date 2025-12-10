/**
 * BookChat - "Ask the Book" AI-powered chat interface
 * 
 * Features:
 * - Chat with AI about book content
 * - Pre-loaded context: summaries, takeaways
 * - Suggested questions per book
 * - Citation to page numbers
 * - Conversation history
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    MessageSquare, Send, Sparkles, BookOpen, RefreshCw,
    ThumbsUp, ThumbsDown, Copy, X, Lightbulb
} from 'lucide-react';
import { useLibraryStore } from '../libraryStore';
import { cn } from '../../../lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: { page: number; text: string }[];
    timestamp: Date;
}

interface BookChatProps {
    bookId: string;
    bookTitle: string;
    onClose?: () => void;
    className?: string;
}

// Pre-defined suggested questions by book category
const SUGGESTED_QUESTIONS = [
    "What are the main takeaways from this book?",
    "How can I apply the concepts at work?",
    "Summarize the key frameworks mentioned",
    "What makes this book unique?",
    "Explain the core argument in simple terms",
];

export const BookChat: React.FC<BookChatProps> = ({
    bookId,
    bookTitle,
    onClose,
    className
}) => {
    const { books, userLibrary, earnCredits } = useLibraryStore();
    const book = books.find(b => b.id === bookId);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get user highlights for context
    const bookHighlights = userLibrary.highlights.filter(h => h.bookId === bookId);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const generateResponse = useCallback(async (question: string): Promise<string> => {
        // Simulate AI response - In production, this would call Gemini API
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Build context from book data
        const context = {
            title: book?.title,
            takeaways: book?.keyTakeaways,
            summary: book?.aiSummary,
            difficulty: book?.difficulty,
            highlights: bookHighlights.map(h => h.text),
        };

        // Mock responses based on question type
        if (question.toLowerCase().includes('takeaway') || question.toLowerCase().includes('main')) {
            return `📚 **Key Takeaways from "${book?.title}":**\n\n${book?.keyTakeaways?.map((t, i) => `${i + 1}. ${t}`).join('\n\n') || 'No takeaways available.'}`;
        }

        if (question.toLowerCase().includes('apply') || question.toLowerCase().includes('work')) {
            return `💡 **Applying "${book?.title}" at Work:**\n\n1. **Start small** - Pick one concept and experiment with it this week\n2. **Share with your team** - Discuss the key ideas in your next team meeting\n3. **Create a template** - Build a practical framework based on the book's methodology\n4. **Track results** - Measure the impact of applying these concepts\n\n*Based on the book's core principles of ${book?.tags?.slice(0, 3).join(', ')}.*`;
        }

        if (question.toLowerCase().includes('summarize') || question.toLowerCase().includes('summary')) {
            return `📖 **Summary of "${book?.title}":**\n\n${book?.aiSummary || book?.description || 'This book covers important concepts in product management and leadership.'}`;
        }

        if (question.toLowerCase().includes('unique') || question.toLowerCase().includes('different')) {
            return `✨ **What Makes "${book?.title}" Stand Out:**\n\n- **Practical focus**: Real-world examples and actionable advice\n- **Author credibility**: Written by industry experts with ${book?.rating} rating\n- **Modern perspective**: Published in ${book?.publishedYear}\n- **Comprehensive**: Covers multiple aspects of ${book?.tags?.[0] || 'the topic'}\n\n*Rated ${book?.rating}/5 by ${book?.reviewCount} readers.*`;
        }

        // Default response
        return `Based on "${book?.title}", here's my understanding:\n\n${book?.description || 'This book provides valuable insights for product managers.'}\n\n**Key concepts covered:**\n${book?.tags?.slice(0, 5).map(t => `• ${t}`).join('\n')}\n\nWould you like me to elaborate on any specific aspect?`;
    }, [book, bookHighlights]);

    const handleSendMessage = useCallback(async (message?: string) => {
        const text = message || input.trim();
        if (!text) return;

        setInput('');
        setShowSuggestions(false);

        // Add user message
        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        // Generate response
        setIsLoading(true);
        try {
            const response = await generateResponse(text);

            const assistantMessage: Message = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);

            // Award credits for using book chat
            earnCredits(
                'article_read',
                `Asked a question about "${book?.title}"`,
                { bookId, action: 'book_chat' }
            );
        } catch (error) {
            const errorMessage: Message = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: "I'm sorry, I couldn't process that question. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, generateResponse, earnCredits, book, bookId]);

    const handleCopyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
    };

    const clearChat = () => {
        setMessages([]);
        setShowSuggestions(true);
    };

    if (!book) {
        return (
            <div className="p-8 text-center text-gray-500">
                Book not found
            </div>
        );
    }

    return (
        <div className={cn(
            "flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden h-[600px]",
            className
        )}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Ask the Book</h3>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{bookTitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearChat}
                            className="p-2 rounded-lg hover:bg-white/50 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Clear chat"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-white/50 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Welcome / Suggestions */}
                {messages.length === 0 && showSuggestions && (
                    <div className="text-center py-6 animate-in fade-in duration-300">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">Ask anything about this book</h4>
                        <p className="text-gray-500 text-sm mb-6">I'll help you understand the key concepts</p>

                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Try asking:</p>
                            {SUGGESTED_QUESTIONS.slice(0, 4).map((question, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendMessage(question)}
                                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 text-sm text-gray-700 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Lightbulb className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                        <span>{question}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat Messages */}
                {messages.map(message => (
                    <div
                        key={message.id}
                        className={cn(
                            "flex gap-3 animate-in slide-in-from-bottom-2 duration-200",
                            message.role === 'user' && "flex-row-reverse"
                        )}
                    >
                        {/* Avatar */}
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            message.role === 'user'
                                ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                                : "bg-gradient-to-br from-amber-400 to-orange-500"
                        )}>
                            {message.role === 'user'
                                ? <span className="text-white text-xs font-bold">You</span>
                                : <BookOpen className="w-4 h-4 text-white" />
                            }
                        </div>

                        {/* Message Content */}
                        <div className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-3",
                            message.role === 'user'
                                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                                : "bg-gray-100 text-gray-800"
                        )}>
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                {message.content}
                            </div>

                            {/* Assistant message actions */}
                            {message.role === 'assistant' && (
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                                    <button
                                        onClick={() => handleCopyMessage(message.content)}
                                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                                        title="Copy"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </button>
                                    <button
                                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-green-600 transition-colors"
                                        title="Helpful"
                                    >
                                        <ThumbsUp className="w-3 h-3" />
                                    </button>
                                    <button
                                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Not helpful"
                                    >
                                        <ThumbsDown className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex gap-3 animate-in fade-in duration-200">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-gray-100 rounded-2xl px-4 py-3">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask a question about this book..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 disabled:opacity-50"
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim() || isLoading}
                        className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookChat;
