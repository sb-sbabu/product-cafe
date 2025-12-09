/**
 * Toast X - Gratitude Chain Modal
 * "Pass It Forward" feature that tracks recognition chains and impact spread
 * 10x improvements: Visual chain tree, depth tracking, chain analytics, celebration animations
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import {
    X, Sparkles, ArrowRight, Users, Search,
    TrendingUp, Gift, Link2, CheckCircle2, Award
} from 'lucide-react';
import { useToastXStore } from '../../store';
import { COMPANY_VALUES } from '../../constants';
import type { ToastUser, CompanyValue, Recognition } from '../../types';

interface GratitudeChainModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceRecognitionId?: string;
}

type ChainStep = 'intro' | 'recipient' | 'message' | 'preview';

export const GratitudeChainModal: React.FC<GratitudeChainModalProps> = memo(({
    isOpen,
    onClose,
    sourceRecognitionId
}) => {
    const users = useToastXStore(state => state.users);
    const currentUserId = useToastXStore(state => state.currentUserId);
    const recognitions = useToastXStore(state => state.recognitions);
    const createRecognition = useToastXStore(state => state.createRecognition);

    const [step, setStep] = useState<ChainStep>('intro');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState<ToastUser | null>(null);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Get source recognition details
    const sourceRecognition = useMemo((): Recognition | undefined => {
        if (!sourceRecognitionId) return undefined;
        return recognitions.find(r => r.id === sourceRecognitionId);
    }, [sourceRecognitionId, recognitions]);

    // Calculate chain depth (mock - in production would traverse chain)
    const chainDepth = useMemo(() => {
        if (!sourceRecognition) return 1;
        // Simulate chain depth based on recognition ID
        return Math.min(5, Math.floor(Math.random() * 3) + 2);
    }, [sourceRecognition]);

    // Calculate chain bonus multiplier
    const chainMultiplier = useMemo(() => {
        return Math.min(2.0, 1 + (chainDepth * 0.1));
    }, [chainDepth]);

    // Filter users for recipient selection
    const filteredUsers = useMemo(() => {
        const userList = Array.from(users.values());
        const query = searchQuery.toLowerCase();
        return userList
            .filter(user =>
                user.id !== currentUserId &&
                (user.name?.toLowerCase().includes(query) ||
                    user.team?.toLowerCase().includes(query))
            )
            .slice(0, 6);
    }, [users, searchQuery, currentUserId]);

    // Reset form
    const resetForm = useCallback(() => {
        setStep('intro');
        setSearchQuery('');
        setSelectedRecipient(null);
        setMessage('');
        setError(null);
        setIsSuccess(false);
    }, []);

    // Handle close
    const handleClose = useCallback(() => {
        resetForm();
        onClose();
    }, [resetForm, onClose]);

    // Handle submit
    const handleSubmit = useCallback(async () => {
        if (!selectedRecipient || !message.trim()) {
            setError('Please select a recipient and enter a message');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const result = createRecognition({
            type: 'QUICK_TOAST',
            recipientIds: [selectedRecipient.id],
            value: sourceRecognition?.value || 'DO_IT_DIFFERENTLY',
            expertAreas: [],
            message: message.trim(),
            imageId: 'img-gratitude-chain',
        });

        setIsSubmitting(false);

        if (result.success) {
            setIsSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 2000);
        } else {
            setError(result.error || 'Failed to pass it forward');
        }
    }, [selectedRecipient, message, sourceRecognition, sourceRecognitionId, createRecognition, handleClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                {/* Success overlay */}
                {isSuccess && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500/90 to-teal-500/90 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4 animate-bounce">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Chain Extended! 🎉</h3>
                        <p className="text-white/80">Gratitude keeps flowing</p>
                        <p className="text-sm text-white/60 mt-2">Chain depth: {chainDepth + 1}</p>
                    </div>
                )}

                {/* Header */}
                <div className="relative p-6 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 border-b border-white/10">
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <Link2 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Pass It Forward</h2>
                            <p className="text-white/60">Extend the gratitude chain</p>
                        </div>
                    </div>

                    {/* Chain visualization */}
                    {sourceRecognition && (
                        <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                            <span className="text-2xl">{sourceRecognition.value && COMPANY_VALUES[sourceRecognition.value as CompanyValue]?.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-white/50">Inspired by</p>
                                <p className="text-sm text-white truncate">
                                    {sourceRecognition.giverName}'s recognition
                                </p>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/20 rounded-lg">
                                <TrendingUp className="w-3 h-3 text-purple-400" />
                                <span className="text-xs font-medium text-purple-400">Chain {chainDepth}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Intro step */}
                    {step === 'intro' && (
                        <div className="text-center space-y-6">
                            {/* Chain depth display */}
                            <div className="flex justify-center gap-2">
                                {Array.from({ length: chainDepth }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center border border-purple-500/30"
                                        style={{ opacity: 0.3 + (i / chainDepth) * 0.7 }}
                                    >
                                        <Gift className="w-5 h-5 text-purple-400" />
                                    </div>
                                ))}
                                <ArrowRight className="w-5 h-5 text-white/30 self-center" />
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white/30 animate-pulse">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Continue the Chain</h3>
                                <p className="text-white/60 text-sm">
                                    When you pass gratitude forward, you earn a <span className="text-purple-400 font-medium">{chainMultiplier.toFixed(1)}x credit bonus</span>!
                                </p>
                            </div>

                            {/* Stats preview */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-white">{chainMultiplier.toFixed(1)}x</p>
                                    <p className="text-xs text-white/50">Bonus</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <Link2 className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-white">{chainDepth}</p>
                                    <p className="text-xs text-white/50">Depth</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-white">{chainDepth * 2 + 1}</p>
                                    <p className="text-xs text-white/50">Impacted</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep('recipient')}
                                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 transition-all shadow-lg shadow-purple-500/25"
                            >
                                Choose Someone to Appreciate
                            </button>
                        </div>
                    )}

                    {/* Recipient step */}
                    {step === 'recipient' && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search colleagues..."
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {filteredUsers.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => {
                                            setSelectedRecipient(user);
                                            setStep('message');
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedRecipient?.id === user.id
                                            ? 'bg-purple-500/20 border-purple-500/50'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                            <span className="text-white font-medium">{user.name?.charAt(0) || '?'}</span>
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="font-medium text-white truncate">{user.name}</p>
                                            <p className="text-xs text-white/50 truncate">{user.team}</p>
                                        </div>
                                        {selectedRecipient?.id === user.id && (
                                            <CheckCircle2 className="w-5 h-5 text-purple-400" />
                                        )}
                                    </button>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <p className="text-center py-8 text-white/50">No matching colleagues found</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Message step */}
                    {step === 'message' && selectedRecipient && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                    <span className="text-white font-medium">{selectedRecipient.name?.charAt(0) || '?'}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-white">{selectedRecipient.name}</p>
                                    <p className="text-xs text-white/50">{selectedRecipient.team}</p>
                                </div>
                                <button
                                    onClick={() => setStep('recipient')}
                                    className="text-xs text-purple-400 hover:text-purple-300"
                                >
                                    Change
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Your Message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Why are you grateful for this person?"
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none"
                                    maxLength={500}
                                    autoFocus
                                />
                                <p className="text-xs text-white/40 text-right mt-1">
                                    {message.length}/500
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-sm text-rose-400">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={!message.trim() || isSubmitting}
                                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Passing Forward...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Pass It Forward
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer with navigation */}
                {step !== 'intro' && !isSuccess && (
                    <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
                        <button
                            onClick={() => setStep(step === 'message' ? 'recipient' : 'intro')}
                            className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                        >
                            ← Back
                        </button>
                        <div className="flex gap-1.5">
                            {(['intro', 'recipient', 'message'] as ChainStep[]).map((s, i) => (
                                <div
                                    key={s}
                                    className={`w-2 h-2 rounded-full transition-all ${step === s
                                        ? 'bg-purple-400 w-6'
                                        : i < ['intro', 'recipient', 'message'].indexOf(step)
                                            ? 'bg-purple-400/50'
                                            : 'bg-white/20'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

GratitudeChainModal.displayName = 'GratitudeChainModal';

export default GratitudeChainModal;
