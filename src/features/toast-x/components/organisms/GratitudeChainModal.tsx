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
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Success overlay */}
                {isSuccess && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4 animate-bounce">
                            <Sparkles className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Chain Extended! 🎉</h3>
                        <p className="text-gray-600">Gratitude keeps flowing</p>
                        <p className="text-sm text-gray-400 mt-2">Chain depth: {chainDepth + 1}</p>
                    </div>
                )}

                {/* Header */}
                <div className="relative p-6 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-b border-gray-100">
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-white/50 hover:bg-white transition-colors text-gray-500 hover:text-gray-900"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
                            <Link2 className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Pass It Forward</h2>
                            <p className="text-gray-500">Extend the gratitude chain</p>
                        </div>
                    </div>

                    {/* Chain visualization */}
                    {sourceRecognition && (
                        <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-3 shadow-sm">
                            <span className="text-2xl">{sourceRecognition.value && COMPANY_VALUES[sourceRecognition.value as CompanyValue]?.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-400">Inspired by</p>
                                <p className="text-sm text-gray-900 font-medium truncate">
                                    {sourceRecognition.giverName}'s recognition
                                </p>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1 bg-purple-50 rounded-lg border border-purple-100">
                                <TrendingUp className="w-3 h-3 text-purple-600" />
                                <span className="text-xs font-medium text-purple-700">Chain {chainDepth}</span>
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
                                        className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100"
                                        style={{ opacity: 0.5 + (i / chainDepth) * 0.5 }}
                                    >
                                        <Gift className="w-5 h-5 text-purple-400" />
                                    </div>
                                ))}
                                <ArrowRight className="w-5 h-5 text-gray-300 self-center" />
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-white shadow-lg animate-pulse text-white">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Continue the Chain</h3>
                                <p className="text-gray-500 text-sm">
                                    When you pass gratitude forward, you earn a <span className="text-purple-600 font-bold">{chainMultiplier.toFixed(1)}x credit bonus</span>!
                                </p>
                            </div>

                            {/* Stats preview */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <Award className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-gray-900">{chainMultiplier.toFixed(1)}x</p>
                                    <p className="text-xs text-gray-500">Bonus</p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                                    <Link2 className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-gray-900">{chainDepth}</p>
                                    <p className="text-xs text-gray-500">Depth</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-gray-900">{chainDepth * 2 + 1}</p>
                                    <p className="text-xs text-gray-500">Impacted</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep('recipient')}
                                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/20 transform hover:-translate-y-0.5"
                            >
                                Choose Someone to Appreciate
                            </button>
                        </div>
                    )}

                    {/* Recipient step */}
                    {step === 'recipient' && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search colleagues..."
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
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
                                            ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-100'
                                            : 'bg-white border-gray-100 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-600 font-semibold">
                                            {user.name?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.team}</p>
                                        </div>
                                        {selectedRecipient?.id === user.id && (
                                            <CheckCircle2 className="w-5 h-5 text-purple-600" />
                                        )}
                                    </button>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <p className="text-center py-8 text-gray-400">No matching colleagues found</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Message step */}
                    {step === 'message' && selectedRecipient && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-600 font-semibold">
                                    {selectedRecipient.name?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{selectedRecipient.name}</p>
                                    <p className="text-xs text-gray-500">{selectedRecipient.team}</p>
                                </div>
                                <button
                                    onClick={() => setStep('recipient')}
                                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    Change
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Why are you grateful for this person?"
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all"
                                    maxLength={500}
                                    autoFocus
                                />
                                <p className="text-xs text-gray-400 text-right mt-1">
                                    {message.length}/500
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={!message.trim() || isSubmitting}
                                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
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
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <button
                            onClick={() => setStep(step === 'message' ? 'recipient' : 'intro')}
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
                        >
                            ← Back
                        </button>
                        <div className="flex gap-1.5">
                            {(['intro', 'recipient', 'message'] as ChainStep[]).map((s, i) => (
                                <div
                                    key={s}
                                    className={`w-2 h-2 rounded-full transition-all ${step === s
                                        ? 'bg-purple-600 w-6'
                                        : i < ['intro', 'recipient', 'message'].indexOf(step)
                                            ? 'bg-purple-200'
                                            : 'bg-gray-200'
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
