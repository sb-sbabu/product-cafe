/**
 * useChatbot Hook
 * Manages chatbot state and NLU pipeline
 */

import { useState, useCallback } from 'react';
import type { ChatMessage, NLUResult } from '../../../types';
import { generateId } from '../../../lib/utils';
import {
    preprocess,
    extractEntities,
    classifyIntent,
    getBestIntent,
    needsClarification,
    generateResponse,
} from '../engine';

interface UseChatbotReturn {
    messages: ChatMessage[];
    isTyping: boolean;
    sendMessage: (content: string) => void;
    clearMessages: () => void;
    lastNLUResult: NLUResult | null;
}

export function useChatbot(): UseChatbotReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [lastNLUResult, setLastNLUResult] = useState<NLUResult | null>(null);

    const processMessage = useCallback((userInput: string): ChatMessage => {
        // 1. Preprocess
        const preprocessed = preprocess(userInput);

        // 2. Extract entities
        const entities = extractEntities(
            preprocessed.tokensWithoutStopWords,
            preprocessed.expandedTokens,
            userInput
        );

        // 3. Classify intent
        const intentMatches = classifyIntent(
            preprocessed.tokensWithoutStopWords,
            preprocessed.expandedTokens,
            userInput,
            entities
        );

        // 4. Get best match
        const bestMatch = getBestIntent(intentMatches);
        const selectedIntent = bestMatch?.intent || null;

        // Store NLU result for debugging
        const nluResult: NLUResult = {
            originalInput: userInput,
            preprocessedTokens: preprocessed.expandedTokens,
            entities,
            intentMatches,
            selectedIntent,
            confidence: bestMatch?.score || 0,
            needsClarification: selectedIntent ? needsClarification(selectedIntent, entities) : false,
        };

        setLastNLUResult(nluResult);

        // 5. Generate response
        if (selectedIntent) {
            // Check if clarification is needed
            if (nluResult.needsClarification && selectedIntent.clarificationFlow) {
                const clarification = selectedIntent.clarificationFlow[0];
                return {
                    id: generateId(),
                    role: 'bot',
                    content: clarification.question,
                    timestamp: new Date().toISOString(),
                    quickReplies: clarification.quickReplies,
                };
            }

            return generateResponse({
                intent: selectedIntent,
                entities,
                originalInput: userInput,
            });
        }

        // Fallback
        return {
            id: generateId(),
            role: 'bot',
            content: "I'm not sure I understood that. Could you rephrase or try one of these options?",
            timestamp: new Date().toISOString(),
            quickReplies: [
                { id: 'help', label: '❓ What can you do?', value: 'help' },
                { id: 'grab', label: '☕ Grab & Go', value: 'show grab and go' },
                { id: 'library', label: '📚 Library', value: 'show library' },
            ],
        };
    }, []);

    const sendMessage = useCallback((content: string) => {
        // Add user message
        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        // Simulate processing delay for natural feel
        setTimeout(() => {
            const botResponse = processMessage(content);
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 500 + Math.random() * 500); // 500-1000ms delay
    }, [processMessage]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setLastNLUResult(null);
    }, []);

    return {
        messages,
        isTyping,
        sendMessage,
        clearMessages,
        lastNLUResult,
    };
}
