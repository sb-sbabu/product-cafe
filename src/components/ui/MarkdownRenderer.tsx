import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { TagPill } from './TagPill';
import { useTagStore } from '../../stores/tagStore';

/**
 * MarkdownRenderer - Safe markdown parsing for discussions/comments
 * 
 * Supports:
 * - **bold** and *italic*
 * - `inline code` and ```code blocks```
 * - [links](url)
 * - - bullet lists
 * - > blockquotes
 * 
 * Security: No raw HTML injection (XSS-safe)
 */

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

// Token types for our simple parser
type Token =
    | { type: 'text'; content: string }
    | { type: 'bold'; content: string }
    | { type: 'italic'; content: string }
    | { type: 'code'; content: string }
    | { type: 'codeblock'; content: string; lang?: string }
    | { type: 'link'; text: string; url: string }
    | { type: 'bullet'; content: string }
    | { type: 'blockquote'; content: string }
    | { type: 'hashtag'; content: string } // New Token
    | { type: 'newline' };

function parseMarkdown(text: string): Token[] {
    const tokens: Token[] = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Code block (```...```)
        if (line.trim().startsWith('```')) {
            const lang = line.trim().slice(3).trim();
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            tokens.push({ type: 'codeblock', content: codeLines.join('\n'), lang: lang || undefined });
            continue;
        }

        // Bullet list
        if (line.trim().match(/^[-*]\s+/)) {
            const content = line.trim().replace(/^[-*]\s+/, '');
            tokens.push({ type: 'bullet', content });
            if (i < lines.length - 1) tokens.push({ type: 'newline' });
            continue;
        }

        // Blockquote
        if (line.trim().startsWith('>')) {
            const content = line.trim().replace(/^>\s*/, '');
            tokens.push({ type: 'blockquote', content });
            if (i < lines.length - 1) tokens.push({ type: 'newline' });
            continue;
        }

        // Parse inline elements
        parseInline(line, tokens);

        if (i < lines.length - 1) tokens.push({ type: 'newline' });
    }

    return tokens;
}

function parseInline(text: string, tokens: Token[]): void {
    // Build a combined regex to find all matches
    let lastIndex = 0;
    const matches: { start: number; end: number; token: Token }[] = [];

    // Bold
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let match;
    while ((match = boldRegex.exec(text)) !== null) {
        matches.push({ start: match.index, end: match.index + match[0].length, token: { type: 'bold', content: match[1] } });
    }

    // Italic (single asterisk, but not inside bold)
    const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/g;
    while ((match = italicRegex.exec(text)) !== null) {
        // Skip if overlaps with bold
        const overlaps = matches.some(m => match!.index >= m.start && match!.index < m.end);
        if (!overlaps) {
            matches.push({ start: match.index, end: match.index + match[0].length, token: { type: 'italic', content: match[1] } });
        }
    }

    // Inline code
    const codeRegex = /`([^`]+)`/g;
    while ((match = codeRegex.exec(text)) !== null) {
        matches.push({ start: match.index, end: match.index + match[0].length, token: { type: 'code', content: match[1] } });
    }

    // Links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    while ((match = linkRegex.exec(text)) !== null) {
        matches.push({ start: match.index, end: match.index + match[0].length, token: { type: 'link', text: match[1], url: match[2] } });
    }

    // Hashtags: #namespace/value or #tag
    // Negative lookbehind (?<!\w) to ensure we don't match mid-word (e.g. email#hash)
    const hashtagRegex = /(?<!\w)#([a-zA-Z0-9_\-/]+)/g;
    while ((match = hashtagRegex.exec(text)) !== null) {
        matches.push({ start: match.index, end: match.index + match[0].length, token: { type: 'hashtag', content: match[0] } });
    }

    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);

    // Build tokens from matches
    for (const m of matches) {
        if (m.start > lastIndex) {
            tokens.push({ type: 'text', content: text.slice(lastIndex, m.start) });
        }
        tokens.push(m.token);
        lastIndex = m.end;
    }

    // Remaining text
    if (lastIndex < text.length) {
        tokens.push({ type: 'text', content: text.slice(lastIndex) });
    }
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
    const tokens = parseMarkdown(content);
    const { registerTag } = useTagStore();

    // Auto-register tags found in content
    useEffect(() => {
        tokens.forEach(token => {
            if (token.type === 'hashtag') {
                registerTag(token.content);
            }
        });
    }, [content, registerTag]); // Depend on content string

    return (
        <div className={cn('markdown-body leading-relaxed', className)}>
            {tokens.map((token, index) => renderToken(token, index))}
        </div>
    );
};

function renderToken(token: Token, key: number): React.ReactNode {
    switch (token.type) {
        case 'text':
            return <span key={key}>{token.content}</span>;

        case 'hashtag':
            return <TagPill key={key} tag={token.content} size="sm" className="mx-0.5 align-middle" />;


        case 'bold':
            return <strong key={key} className="font-semibold text-gray-900">{token.content}</strong>;

        case 'italic':
            return <em key={key} className="italic text-gray-700">{token.content}</em>;

        case 'code':
            return (
                <code
                    key={key}
                    className="px-1.5 py-0.5 bg-gray-100 text-amber-700 text-[0.85em] font-mono rounded"
                >
                    {token.content}
                </code>
            );

        case 'codeblock':
            return (
                <pre
                    key={key}
                    className="my-2 p-3 bg-gray-900 text-gray-100 text-sm font-mono rounded-lg overflow-x-auto"
                >
                    {token.lang && (
                        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{token.lang}</div>
                    )}
                    <code>{token.content}</code>
                </pre>
            );

        case 'link':
            return (
                <a
                    key={key}
                    href={token.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
                >
                    {token.text}
                </a>
            );

        case 'bullet':
            return (
                <div key={key} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{token.content}</span>
                </div>
            );

        case 'blockquote':
            return (
                <blockquote
                    key={key}
                    className="border-l-3 border-amber-400 pl-3 py-1 text-gray-600 italic bg-amber-50/50 rounded-r"
                >
                    {token.content}
                </blockquote>
            );

        case 'newline':
            return <br key={key} />;

        default:
            return null;
    }
}
