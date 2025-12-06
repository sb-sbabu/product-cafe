import React, { useState, useCallback } from 'react';
import { X, Send, Eye, Edit2, AtSign, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDock } from '../../contexts/DockContext';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import { useDiscussionStore } from '../../stores/discussionStore';

/**
 * NewDiscussionForm - Modal form for creating new discussions
 * 
 * Features:
 * - Title and body input
 * - Markdown preview toggle
 * - Expert notification preview
 * - Context-aware (attached to current resource)
 */

interface NewDiscussionFormProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NewDiscussionForm: React.FC<NewDiscussionFormProps> = ({ isOpen, onClose }) => {
    const { pageContext } = useDock();
    const addDiscussion = useDiscussionStore(state => state.addDiscussion);

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (!title.trim() || !body.trim()) return;

        setIsSubmitting(true);

        try {
            addDiscussion({
                attachedToType: pageContext.resourceId ? 'resource' : 'general',
                attachedToId: pageContext.resourceId || '',
                title: title.trim(),
                body: body.trim(),
                authorId: 'u1', // Current user
                authorEmail: 'natasha.romanoff@company.com',
                authorName: 'Natasha Romanoff',
                status: 'open',
                replyCount: 0,
                upvoteCount: 0,
                viewCount: 0,
            });

            // Reset form and close
            setTitle('');
            setBody('');
            setShowPreview(false);
            onClose();
        } catch (error) {
            console.error('Failed to create discussion:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [title, body, pageContext.resourceId, addDiscussion, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
                    <h2 className="text-lg font-semibold text-gray-900">Start a Discussion</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Context badge */}
                {pageContext.title && (
                    <div className="px-5 py-2 bg-amber-50/50 border-b border-amber-100/50">
                        <span className="text-xs text-amber-700 font-medium">
                            📎 Attached to: {pageContext.title}
                        </span>
                    </div>
                )}

                {/* Form */}
                <div className="p-5 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What's your question or topic?"
                            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
                        />
                    </div>

                    {/* Body with preview toggle */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-medium text-gray-700">
                                Details
                            </label>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className={cn(
                                        'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                                        !showPreview
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'text-gray-500 hover:bg-gray-100'
                                    )}
                                >
                                    <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                                    Write
                                </button>
                                <button
                                    onClick={() => setShowPreview(true)}
                                    className={cn(
                                        'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                                        showPreview
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'text-gray-500 hover:bg-gray-100'
                                    )}
                                >
                                    <Eye className="w-3.5 h-3.5 inline mr-1" />
                                    Preview
                                </button>
                            </div>
                        </div>

                        {showPreview ? (
                            <div className="min-h-[120px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                {body.trim() ? (
                                    <MarkdownRenderer content={body} />
                                ) : (
                                    <span className="text-sm text-gray-400 italic">Nothing to preview yet...</span>
                                )}
                            </div>
                        ) : (
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Add context, code snippets, or links. Markdown is supported!"
                                rows={5}
                                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-colors"
                            />
                        )}
                    </div>

                    {/* Helper text */}
                    <div className="flex items-start gap-2 text-xs text-gray-500">
                        <HelpCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>
                            Use <code className="px-1 py-0.5 bg-gray-100 rounded">**bold**</code>,{' '}
                            <code className="px-1 py-0.5 bg-gray-100 rounded">`code`</code>, and{' '}
                            <code className="px-1 py-0.5 bg-gray-100 rounded">[links](url)</code> for formatting.
                        </span>
                    </div>

                    {/* Expert notification preview */}
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                        <div className="flex items-center gap-2 text-xs text-blue-700 mb-1 font-medium">
                            <AtSign className="w-3.5 h-3.5" />
                            Experts will be notified
                        </div>
                        <p className="text-xs text-blue-600/80">
                            Relevant topic experts will receive a notification about your question.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim() || !body.trim() || isSubmitting}
                        className={cn(
                            'flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all',
                            'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
                            'hover:from-amber-600 hover:to-orange-600',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'shadow-sm hover:shadow'
                        )}
                    >
                        <Send className="w-4 h-4" />
                        Post Discussion
                    </button>
                </div>
            </div>
        </div>
    );
};
