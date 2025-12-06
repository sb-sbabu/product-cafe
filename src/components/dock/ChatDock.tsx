import React, { useState } from 'react';
import { X, Send, MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * ChatDock - Clean, minimal Chat Dock component
 * 
 * Structure:
 * - Header: Title + Close button
 * - Body: Scrollable message area
 * - Footer: Text input + Send button
 */

interface ChatDockProps {
    onClose: () => void;
    className?: string;
}

export const ChatDock: React.FC<ChatDockProps> = ({ onClose, className }) => {
    const [inputValue, setInputValue] = useState('');

    // Placeholder messages for UI skeleton
    const placeholderMessages = [
        { id: '1', role: 'assistant', content: 'Hello! I\'m your Café Assistant. How can I help you today?' },
        { id: '2', role: 'user', content: 'Can you help me find resources about product management?' },
        { id: '3', role: 'assistant', content: 'Of course! We have several great resources on product management. Would you like me to show you our featured guides or search for something specific?' },
    ];

    const handleSend = () => {
        if (!inputValue.trim()) return;
        console.log('Send message:', inputValue);
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div
            className={cn(
                'h-screen w-[380px] flex flex-col shrink-0',
                'bg-white border-l border-gray-200',
                'transition-all duration-300 ease-out',
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-sm">
                        <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-900">Chat Assistant</span>
                        <Sparkles className="w-3 h-3 text-amber-400" />
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/60 rounded-lg transition-colors"
                    aria-label="Close chat"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {placeholderMessages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            'max-w-[85%] p-3 rounded-xl text-sm',
                            msg.role === 'assistant'
                                ? 'bg-white border border-gray-100 shadow-sm mr-auto'
                                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white ml-auto'
                        )}
                    >
                        {msg.content}
                    </div>
                ))}
            </div>

            {/* Footer - Input Area */}
            <div className="p-3 border-t border-gray-100 bg-white shrink-0">
                <div className="flex items-end gap-2">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className={cn(
                            'flex-1 px-3 py-2 text-sm rounded-xl resize-none',
                            'border border-gray-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100',
                            'outline-none transition-all'
                        )}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className={cn(
                            'p-2.5 rounded-xl transition-all',
                            inputValue.trim()
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:shadow'
                                : 'bg-gray-100 text-gray-400'
                        )}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
