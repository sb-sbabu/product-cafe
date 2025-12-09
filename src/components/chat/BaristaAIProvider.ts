/**
 * BARISTA AI Provider
 * Integration with Gemini 2.5 Flash API for AI-enhanced responses
 * 
 * Features:
 * - Gemini 2.5 Flash model integration
 * - Context-aware prompting with app data
 * - Response parsing to card format
 * - Graceful fallback to deterministic engine
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AIConfig {
    enabled: boolean;
    apiKey: string;
    model: 'gemini-2.5-flash-preview-05-20';
}

export interface AIResponse {
    success: boolean;
    message: string;
    intent?: {
        category: string;
        action: string;
        confidence: number;
    };
    data?: unknown;
    suggestedQuickReplies?: string[];
    error?: string;
}

export interface AppContext {
    currentUser: string;
    currentPage: string;
    recentQueries: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: AIConfig = {
    enabled: false,
    apiKey: '',
    model: 'gemini-2.5-flash-preview-05-20',
};

// Get API key from environment or localStorage
const getApiKey = (): string => {
    // First try environment variable (for build-time config)
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
        return import.meta.env.VITE_GEMINI_API_KEY;
    }
    // Then try localStorage (for runtime config)
    try {
        return localStorage.getItem('barista_gemini_api_key') || '';
    } catch {
        return '';
    }
};

// Save API key to localStorage
export const setApiKey = (key: string): void => {
    try {
        localStorage.setItem('barista_gemini_api_key', key);
    } catch (e) {
        console.warn('[Barista AI] Could not save API key:', e);
    }
};

// Check if AI is available
export const isAIAvailable = (): boolean => {
    return getApiKey().length > 0;
};

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are Barista, an AI assistant for Product Café - an internal product management platform.

Your capabilities within Product Café:
1. **Toast-X**: Recognition system - toasts, badges, leaderboards, awards
2. **Love of Product (LOP)**: Monthly product talks with video sessions, learning paths
3. **Pulse**: Market intelligence - competitor news, signals, regulatory updates
4. **Community**: Discussions, Q&A, knowledge sharing
5. **Library**: Playbooks, templates, documents, resources
6. **People/Experts**: Find colleagues by skill (EDI, FHIR, X12, claims, EHR, etc.)

Response Guidelines:
- Be concise but helpful
- Use emojis sparingly for warmth (☕ 📚 🎯 👤 💡)
- If you can answer from context, do so directly
- If the query is outside your scope, politely redirect
- Suggest relevant follow-up questions
- Never make up data - if unsure, say so

Format your response as JSON:
{
  "message": "Your helpful response text",
  "category": "toast|lop|pulse|community|library|expert|stats|help|unknown",
  "action": "specific action like 'leaderboard', 'upcoming', 'find_by_skill'",
  "suggestedQuickReplies": ["Reply 1", "Reply 2", "Reply 3"]
}`;

// ═══════════════════════════════════════════════════════════════════════════
// API INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query Gemini 2.5 Flash API
 */
export const queryGemini = async (
    userQuery: string,
    context?: AppContext
): Promise<AIResponse> => {
    const apiKey = getApiKey();

    if (!apiKey) {
        return {
            success: false,
            message: 'AI is not configured. Please add your Gemini API key in settings.',
            error: 'NO_API_KEY',
        };
    }

    const contextInfo = context
        ? `\n\nContext: User "${context.currentUser}" is currently on the "${context.currentPage}" page.`
        : '';

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: `${SYSTEM_PROMPT}${contextInfo}\n\nUser query: "${userQuery}"`,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[Barista AI] API error:', errorData);
            return {
                success: false,
                message: 'AI service is temporarily unavailable. Using fallback mode.',
                error: `HTTP_${response.status}`,
            };
        }

        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) {
            return {
                success: false,
                message: 'AI returned an empty response.',
                error: 'EMPTY_RESPONSE',
            };
        }

        // Try to parse JSON response
        try {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = textContent.match(/```json\n?([\s\S]*?)\n?```/) ||
                textContent.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                return {
                    success: true,
                    message: parsed.message || textContent,
                    intent: parsed.category ? {
                        category: parsed.category,
                        action: parsed.action || 'general',
                        confidence: 0.85,
                    } : undefined,
                    suggestedQuickReplies: parsed.suggestedQuickReplies,
                };
            }
        } catch {
            // If JSON parsing fails, use raw text
            console.log('[Barista AI] Response is not JSON, using raw text');
        }

        return {
            success: true,
            message: textContent,
        };

    } catch (error) {
        console.error('[Barista AI] Request failed:', error);
        return {
            success: false,
            message: 'Could not connect to AI service. Using fallback mode.',
            error: 'NETWORK_ERROR',
        };
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { DEFAULT_CONFIG, getApiKey };
