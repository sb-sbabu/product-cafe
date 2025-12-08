/**
 * TeamToastModal - Multi-recipient team recognition
 * Recognize up to 10 team members at once for collaborative achievements
 */

import React, { useState, useMemo } from 'react';
import {
    X, Search, Users, ChevronRight, ChevronLeft, Check,
    Sparkles, Image as ImageIcon
} from 'lucide-react';
import type { CompanyValue } from '../types';
import { useToastStore } from '../toastStore';
import { COMPANY_VALUES, DEMO_USERS, EXPERT_AREAS, TOAST_IMAGES } from '../data';

interface TeamToastModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'recipients' | 'details' | 'review';

export const TeamToastModal: React.FC<TeamToastModalProps> = ({ isOpen, onClose }) => {
    const { createRecognition, currentUserId, users, getCurrentUser } = useToastStore();
    const currentUser = getCurrentUser();

    // Form state
    const [step, setStep] = useState<Step>('recipients');
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedValue, setSelectedValue] = useState<CompanyValue | null>(null);
    const [selectedExpertAreas, setSelectedExpertAreas] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [selectedImageId, setSelectedImageId] = useState<string>('img-team-puzzle');
    const [showImagePicker, setShowImagePicker] = useState(false);

    // Get all users except current user
    const availableUsers = useMemo(() => {
        const storeUsers = Array.from(users.values());
        const allUsers = storeUsers.length > 0 ? storeUsers : DEMO_USERS;
        return allUsers.filter(u => u.id !== currentUserId);
    }, [users, currentUserId]);

    // Filter users by search
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return availableUsers;
        const q = searchQuery.toLowerCase();
        return availableUsers.filter(u =>
            u.name.toLowerCase().includes(q) ||
            u.team.toLowerCase().includes(q) ||
            u.title.toLowerCase().includes(q)
        );
    }, [availableUsers, searchQuery]);

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
        return selectedRecipients.map(id => availableUsers.find(u => u.id === id)).filter(Boolean);
    }, [selectedRecipients, availableUsers]);

    // Validation
    const canProceedToDetails = selectedRecipients.length >= 2;
    const canProceedToReview = selectedValue && message.trim().length >= 10;
    const totalCredits = selectedRecipients.length * 15;

    // Submit
    const handleSubmit = () => {
        if (!selectedValue || !message.trim() || selectedRecipients.length < 2) return;

        const recipients = selectedUsersData.map(u => ({
            id: u!.id,
            name: u!.name,
            team: u!.team
        }));

        createRecognition({
            type: 'TEAM_TOAST',
            giverId: currentUser?.id || 'user-3',
            giverName: currentUser?.name || 'Jennifer Martinez',
            giverTitle: currentUser?.title,
            value: selectedValue,
            recipientIds: selectedRecipients,
            recipients,
            message: message.trim(),
            expertAreas: selectedExpertAreas,
            imageId: selectedImageId,
            isPrivate: false,
            notifyManagers: false,
            nominatedForMonthly: false
        });

        // Reset and close
        setStep('recipients');
        setSelectedRecipients([]);
        setSearchQuery('');
        setSelectedValue(null);
        setSelectedExpertAreas([]);
        setMessage('');
        setSelectedImageId('img-team-puzzle');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
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
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
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
                                            <span className="text-white font-semibold">{user.name.charAt(0)}</span>
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
                                                ? 'border-2'
                                                : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                            style={{
                                                borderColor: selectedValue === key ? value.color : undefined,
                                                backgroundColor: selectedValue === key ? `${value.color}10` : undefined
                                            }}
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
                                <div className="flex justify-end mt-1 text-xs text-gray-400">
                                    {message.length}/500
                                </div>
                            </div>

                            {/* Image picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <ImageIcon className="w-4 h-4 inline mr-1" />
                                    Celebration image
                                </label>
                                <button
                                    onClick={() => setShowImagePicker(!showImagePicker)}
                                    className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors overflow-hidden"
                                >
                                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-blue-50 to-cyan-50">
                                        👥🎉
                                    </div>
                                </button>
                                {showImagePicker && (
                                    <div className="mt-3 grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-xl">
                                        {TOAST_IMAGES.filter(img => img.category === 'CELEBRATION' || img.category === 'TEAMWORK').slice(0, 8).map(img => (
                                            <button
                                                key={img.id}
                                                onClick={() => {
                                                    setSelectedImageId(img.id);
                                                    setShowImagePicker(false);
                                                }}
                                                className={`p-2 rounded-lg text-xs text-center transition-all ${selectedImageId === img.id
                                                    ? 'ring-2 ring-blue-500 bg-blue-50'
                                                    : 'hover:bg-gray-100'
                                                    }`}
                                            >
                                                {img.name.slice(0, 12)}
                                            </button>
                                        ))}
                                    </div>
                                )}
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
                                    {selectedUsersData.map(user => (
                                        <div key={user!.id} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-blue-200">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                                                <span className="text-white text-xs font-semibold">{user!.name.charAt(0)}</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{user!.name}</span>
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
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25 transition-all"
                        >
                            <Users className="w-4 h-4" />
                            Raise Team Toast!
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamToastModal;
