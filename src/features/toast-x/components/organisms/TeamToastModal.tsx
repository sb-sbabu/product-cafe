/**
 * Toast X - Team Toast Modal
 * Multi-recipient team recognition for celebrating collaborative achievements
 * 3-step flow: Recipients → Details → Review
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import {
    X, Search, Users, ChevronRight, ChevronLeft, Check, Sparkles
} from 'lucide-react';
import { useToastXStore } from '../../store';
import { COMPANY_VALUES, ANTI_GAMING_LIMITS } from '../../constants';
import type { CompanyValue } from '../../types';

// Expert areas for Toast X
const EXPERT_AREAS = [
    { id: 'architecture', name: 'Architecture' },
    { id: 'testing', name: 'Testing' },
    { id: 'documentation', name: 'Documentation' },
    { id: 'mentoring', name: 'Mentoring' },
    { id: 'innovation', name: 'Innovation' },
    { id: 'performance', name: 'Performance' },
    { id: 'security', name: 'Security' },
    { id: 'ux', name: 'UX Design' },
    { id: 'devops', name: 'DevOps' },
    { id: 'leadership', name: 'Leadership' },
    { id: 'communication', name: 'Communication' },
    { id: 'problem-solving', name: 'Problem Solving' },
];

interface TeamToastModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'recipients' | 'details' | 'review';

export const TeamToastModal: React.FC<TeamToastModalProps> = memo(({ isOpen, onClose }) => {
    const createRecognition = useToastXStore(state => state.createRecognition);
    const users = useToastXStore(state => state.users);
    const currentUserId = useToastXStore(state => state.currentUserId);

    const currentUser = useMemo(() => users.get(currentUserId), [users, currentUserId]);
    // Team toasts share the daily ovation limit for simplicity
    const dailyTeamToasts = currentUser?.dailyStandingOvations || 0;
    const remaining = ANTI_GAMING_LIMITS.DAILY_STANDING_OVATIONS - dailyTeamToasts;

    // Form state
    const [step, setStep] = useState<Step>('recipients');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedValue, setSelectedValue] = useState<CompanyValue | null>(null);
    const [selectedExpertAreas, setSelectedExpertAreas] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // All users except current
    const allUsers = useMemo(() => Array.from(users.values()), [users]);

    // Filter users by search
    const filteredUsers = useMemo(() => {
        const available = allUsers.filter(u => u && u.id !== currentUserId && u.name);
        if (!searchQuery.trim()) return available;
        const q = searchQuery.toLowerCase();
        return available.filter(u =>
            (u.name?.toLowerCase() || '').includes(q) ||
            (u.team?.toLowerCase() || '').includes(q) ||
            (u.title?.toLowerCase() || '').includes(q)
        );
    }, [allUsers, currentUserId, searchQuery]);

    // Toggle recipient selection
    const toggleRecipient = (userId: string) => {
        if (selectedRecipients.includes(userId)) {
            setSelectedRecipients(prev => prev.filter(id => id !== userId));
        } else if (selectedRecipients.length < 10) {
            setSelectedRecipients(prev => [...prev, userId]);
        }
    };

    // Toggle expert area
    const toggleExpertArea = (areaId: string) => {
        if (selectedExpertAreas.includes(areaId)) {
            setSelectedExpertAreas(prev => prev.filter(id => id !== areaId));
        } else if (selectedExpertAreas.length < 3) {
            setSelectedExpertAreas(prev => [...prev, areaId]);
        }
    };

    // Get selected users data
    const selectedUsersData = useMemo(() => {
        return selectedRecipients.map(id => allUsers.find(u => u.id === id)).filter(Boolean);
    }, [selectedRecipients, allUsers]);

    // Validation
    const canProceedToDetails = selectedRecipients.length >= 2;
    const canProceedToReview = selectedValue && message.trim().length >= 10;
    const totalCredits = selectedRecipients.length * 15;

    // Reset form
    const resetForm = () => {
        setStep('recipients');
        setSelectedRecipients([]);
        setSearchQuery('');
        setSelectedValue(null);
        setSelectedExpertAreas([]);
        setMessage('');
        setError(null);
    };

    // Submit
    const handleSubmit = useCallback(async () => {
        if (!selectedValue || !message.trim() || selectedRecipients.length < 2) {
            setError('Please complete all required fields');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const result = createRecognition({
            type: 'TEAM_TOAST',
            recipientIds: selectedRecipients,
            value: selectedValue,
            expertAreas: selectedExpertAreas,
            message: message.trim(),
            imageId: 'img-team-toast',
            notifyManagers: false,
            nominatedForMonthly: false,
        });

        setIsSubmitting(false);

        if (result.success) {
            resetForm();
            onClose();
        } else {
            setError(result.error || 'Failed to create team toast');
        }
    }, [selectedRecipients, selectedValue, selectedExpertAreas, message, createRecognition, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Team Toast</h2>
                            <p className="text-sm text-gray-500">Celebrate your team together</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Progress steps */}
                <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 border-b border-gray-100">
                    {(['recipients', 'details', 'review'] as Step[]).map((s, i) => (
                        <React.Fragment key={s}>
                            <div
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${step === s
                                    ? 'bg-blue-100 text-blue-700'
                                    : i < ['recipients', 'details', 'review'].indexOf(step)
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}
                            >
                                <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center text-xs">
                                    {i < ['recipients', 'details', 'review'].indexOf(step) ? '✓' : i + 1}
                                </span>
                                <span className="capitalize hidden sm:inline">{s}</span>
                            </div>
                            {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
                        </React.Fragment>
                    ))}
                    <div className="ml-auto text-sm font-medium text-blue-600">
                        +{totalCredits} credits
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Recipients */}
                    {step === 'recipients' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select team members (2-10 people)
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name, team, or title..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>

                            {/* Selected count */}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    {selectedRecipients.length} selected
                                </span>
                                <span className={selectedRecipients.length >= 10 ? 'text-amber-600' : 'text-gray-400'}>
                                    Max 10
                                </span>
                            </div>

                            {/* User list */}
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {filteredUsers.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => toggleRecipient(user.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedRecipients.includes(user.id)
                                            ? 'border-blue-300 bg-blue-50'
                                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shrink-0">
                                            <span className="text-white font-semibold">{user.name?.charAt(0) || '?'}</span>
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.title} • {user.team}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedRecipients.includes(user.id)
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-gray-300'
                                            }`}>
                                            {selectedRecipients.includes(user.id) && (
                                                <Check className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {step === 'details' && (
                        <div className="space-y-6">
                            {/* Value selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Which value did they demonstrate?
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(COMPANY_VALUES).map(([key, value]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedValue(key as CompanyValue)}
                                            className={`p-3 rounded-xl border text-left transition-all ${selectedValue === key
                                                ? 'border-2 border-blue-500 bg-blue-50'
                                                : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{value.icon}</span>
                                                <span className="font-medium text-gray-900">{value.shortName}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Expert areas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Sparkles className="w-4 h-4 inline mr-1 text-purple-500" />
                                    Boost expert scores (optional, up to 3)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {EXPERT_AREAS.map(area => (
                                        <button
                                            key={area.id}
                                            onClick={() => toggleExpertArea(area.id)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedExpertAreas.includes(area.id)
                                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {area.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Celebration message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe what this team accomplished together..."
                                    maxLength={500}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                />
                                <div className="flex justify-between mt-1 text-xs text-gray-400">
                                    <span>Minimum 10 characters</span>
                                    <span className={message.length < 10 ? 'text-red-400' : ''}>{message.length}/500</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 'review' && (
                        <div className="space-y-6">
                            {/* Recipients summary */}
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Team Members ({selectedRecipients.length})</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedUsersData.map(user => user && (
                                        <div key={user.id} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-blue-200">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                                                <span className="text-white text-xs font-semibold">{user.name?.charAt(0) || '?'}</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Value */}
                            {selectedValue && (
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <span className="text-2xl">{COMPANY_VALUES[selectedValue].icon}</span>
                                    <div>
                                        <p className="font-semibold text-gray-900">{COMPANY_VALUES[selectedValue].shortName}</p>
                                        <p className="text-sm text-gray-500">{COMPANY_VALUES[selectedValue].name}</p>
                                    </div>
                                </div>
                            )}

                            {/* Message preview */}
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-700">{message}</p>
                            </div>

                            {/* Credits breakdown */}
                            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Total credits to give</span>
                                    <span className="text-lg font-bold text-green-600">+{totalCredits}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {selectedRecipients.length} recipients × 15 credits each
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
                    {step !== 'recipients' ? (
                        <button
                            onClick={() => setStep(step === 'review' ? 'details' : 'recipients')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step === 'recipients' && (
                        <button
                            onClick={() => setStep('details')}
                            disabled={!canProceedToDetails}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Continue
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}

                    {step === 'details' && (
                        <button
                            onClick={() => setStep('review')}
                            disabled={!canProceedToReview}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Review
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}

                    {step === 'review' && (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || remaining <= 0}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Posting...</span>
                                </>
                            ) : (
                                <>
                                    <Users className="w-4 h-4" />
                                    <span>Raise Team Toast!</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

TeamToastModal.displayName = 'TeamToastModal';

export default TeamToastModal;
