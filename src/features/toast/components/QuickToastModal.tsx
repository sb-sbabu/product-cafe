/**
 * QuickToastModal - Fast, everyday recognition
 * "Thanks for the quick code review!" style gratitude
 */

import React, { useState, useMemo, useCallback } from 'react';
import { X, Search, Coffee, Check, Sparkles, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useToastStore } from '../toastStore';
import { COMPANY_VALUES, EXPERT_AREAS, TOAST_IMAGES, DEMO_USERS } from '../data';
import type { CompanyValue } from '../types';

interface QuickToastModalProps {
    isOpen: boolean;
    onClose: () => void;
    preselectedUserId?: string;
}

export const QuickToastModal: React.FC<QuickToastModalProps> = ({
    isOpen,
    onClose,
    preselectedUserId,
}) => {
    // Store
    const { createRecognition, getCurrentUser, checkDailyLimits, users } = useToastStore();
    const currentUser = getCurrentUser();
    const dailyLimit = checkDailyLimits('QUICK_TOAST');

    // Form State
    const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(preselectedUserId || null);
    const [selectedValue, setSelectedValue] = useState<CompanyValue | null>(null);
    const [selectedExpertAreas, setSelectedExpertAreas] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [selectedImageId, setSelectedImageId] = useState<string>('img-coffee-cheers');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAllImages, setShowAllImages] = useState(false);
    const [showExpertAreas, setShowExpertAreas] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filtered users for search
    const filteredUsers = useMemo(() => {
        if (!searchQuery) return DEMO_USERS.filter(u => u.id !== currentUser?.id);
        const query = searchQuery.toLowerCase();
        return DEMO_USERS.filter(u =>
            u.id !== currentUser?.id &&
            (u.name.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query) ||
                u.team.toLowerCase().includes(query))
        );
    }, [searchQuery, currentUser?.id]);

    // Selected recipient info
    const selectedRecipient = useMemo(() => {
        if (!selectedRecipientId) return null;
        return users.get(selectedRecipientId) || DEMO_USERS.find(u => u.id === selectedRecipientId);
    }, [selectedRecipientId, users]);

    // Recommended images based on selected value
    const recommendedImages = useMemo(() => {
        if (!selectedValue) return TOAST_IMAGES.slice(0, 6);
        return TOAST_IMAGES.filter(img => img.recommendedValues.includes(selectedValue)).slice(0, 6);
    }, [selectedValue]);

    // Handle form submission
    const handleSubmit = useCallback(async () => {
        if (!selectedRecipientId || !selectedValue || !message.trim() || !selectedRecipient) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const result = createRecognition({
            type: 'QUICK_TOAST',
            giverId: currentUser?.id || 'user-3',
            giverName: currentUser?.name || 'Jennifer Martinez',
            giverTitle: currentUser?.title,
            recipientIds: [selectedRecipientId],
            recipients: [{
                id: selectedRecipientId,
                name: selectedRecipient.name,
                title: selectedRecipient.title,
                team: selectedRecipient.team,
            }],
            value: selectedValue,
            expertAreas: selectedExpertAreas,
            message: message.trim(),
            imageId: selectedImageId,
            isPrivate: false,
            notifyManagers: false,
            nominatedForMonthly: false,
        });

        setIsSubmitting(false);

        if (result.success) {
            // Reset form and close
            setSelectedRecipientId(null);
            setSelectedValue(null);
            setSelectedExpertAreas([]);
            setMessage('');
            setSelectedImageId('img-coffee-cheers');
            onClose();
        } else {
            setError(result.error || 'Failed to create recognition');
        }
    }, [selectedRecipientId, selectedValue, message, selectedExpertAreas, selectedImageId, selectedRecipient, currentUser, createRecognition, onClose]);

    // Toggle expert area selection
    const toggleExpertArea = (areaId: string) => {
        setSelectedExpertAreas(prev =>
            prev.includes(areaId)
                ? prev.filter(id => id !== areaId)
                : [...prev, areaId]
        );
    };

    if (!isOpen) return null;

    const selectedImage = TOAST_IMAGES.find(img => img.id === selectedImageId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                            <Coffee className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Quick Toast</h2>
                            <p className="text-sm text-white/60">Fast thanks for everyday wins</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-white/60" />
                    </button>

                    {/* Daily limit indicator */}
                    <div className="absolute right-4 bottom-4 text-xs text-white/40">
                        {dailyLimit.remaining} of {3} remaining today
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Error Display */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Recipient Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Who are you thanking? *</label>

                        {selectedRecipient ? (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                                    <span className="text-white font-semibold">{selectedRecipient.name.charAt(0)}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-medium">{selectedRecipient.name}</p>
                                    <p className="text-xs text-white/50">{selectedRecipient.title} • {selectedRecipient.team}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedRecipientId(null)}
                                    className="p-1.5 rounded-lg hover:bg-white/10"
                                >
                                    <X className="w-4 h-4 text-white/60" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or team..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                                />

                                {/* Dropdown */}
                                {searchQuery && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-10 max-h-48 overflow-y-auto">
                                        {filteredUsers.length === 0 ? (
                                            <div className="p-3 text-center text-white/40 text-sm">No users found</div>
                                        ) : (
                                            filteredUsers.slice(0, 5).map(user => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => {
                                                        setSelectedRecipientId(user.id);
                                                        setSearchQuery('');
                                                    }}
                                                    className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                                        <span className="text-white text-sm font-medium">{user.name.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-medium">{user.name}</p>
                                                        <p className="text-xs text-white/50">{user.team}</p>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quick add chips */}
                        {!selectedRecipient && !searchQuery && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {DEMO_USERS.filter(u => u.id !== currentUser?.id).slice(0, 4).map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => setSelectedRecipientId(user.id)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                    >
                                        <User className="w-3 h-3 text-white/50" />
                                        <span className="text-sm text-white/70">{user.name.split(' ')[0]}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Value Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Which value did they embody? *</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.values(COMPANY_VALUES).map(value => (
                                <button
                                    key={value.id}
                                    onClick={() => setSelectedValue(value.id)}
                                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${selectedValue === value.id
                                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 ring-2 ring-amber-500/30'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <span className="text-xl">{value.icon}</span>
                                    <span className="text-sm text-white/80 font-medium truncate">{value.shortName}</span>
                                    {selectedValue === value.id && (
                                        <Check className="w-4 h-4 text-amber-400 ml-auto shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Expert Areas (Collapsible) */}
                    <div className="space-y-2">
                        <button
                            onClick={() => setShowExpertAreas(!showExpertAreas)}
                            className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                        >
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Boost their expert scores (optional)</span>
                            {showExpertAreas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {selectedExpertAreas.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs">
                                    +{selectedExpertAreas.length * 10} pts
                                </span>
                            )}
                        </button>

                        {showExpertAreas && (
                            <div className="grid grid-cols-3 gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10">
                                {EXPERT_AREAS.map(area => (
                                    <button
                                        key={area.id}
                                        onClick={() => toggleExpertArea(area.id)}
                                        className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedExpertAreas.includes(area.id)
                                            ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
                                            }`}
                                    >
                                        {area.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Your message *</label>
                        <textarea
                            placeholder="Thanks for the quick code review! Your feedback really helped improve the solution..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, 140))}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 resize-none"
                        />
                        <div className="text-right text-xs text-white/40">{message.length}/140</div>
                    </div>

                    {/* Image Selection */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-white/80">Choose an image</label>
                            <button
                                onClick={() => setShowAllImages(!showAllImages)}
                                className="text-xs text-amber-400 hover:text-amber-300"
                            >
                                {showAllImages ? 'Show less' : 'Show all'}
                            </button>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                            {(showAllImages ? TOAST_IMAGES : recommendedImages).map(img => (
                                <button
                                    key={img.id}
                                    onClick={() => setSelectedImageId(img.id)}
                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImageId === img.id
                                        ? 'border-amber-500 ring-2 ring-amber-500/30'
                                        : 'border-white/10 hover:border-white/30'
                                        }`}
                                    title={img.name}
                                >
                                    {/* Placeholder gradient based on category */}
                                    <div className={`w-full h-full flex items-center justify-center text-lg ${img.category === 'CELEBRATION' ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30' :
                                        img.category === 'TEAMWORK' ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30' :
                                            img.category === 'INNOVATION' ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30' :
                                                img.category === 'CARE' ? 'bg-gradient-to-br from-rose-500/30 to-red-500/30' :
                                                    img.category === 'INTEGRITY' ? 'bg-gradient-to-br from-indigo-500/30 to-blue-500/30' :
                                                        'bg-gradient-to-br from-emerald-500/30 to-teal-500/30'
                                        }`}>
                                        {img.category === 'CELEBRATION' ? '🎉' :
                                            img.category === 'TEAMWORK' ? '🤝' :
                                                img.category === 'INNOVATION' ? '💡' :
                                                    img.category === 'CARE' ? '💜' :
                                                        img.category === 'INTEGRITY' ? '🛡️' : '🙏'}
                                    </div>
                                </button>
                            ))}
                        </div>
                        {selectedImage && (
                            <p className="text-xs text-white/40 text-center">Selected: {selectedImage.name}</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedRecipientId || !selectedValue || !message.trim() || isSubmitting || !dailyLimit.allowed}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${!selectedRecipientId || !selectedValue || !message.trim() || isSubmitting || !dailyLimit.allowed
                            ? 'bg-white/10 text-white/30 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <Coffee className="w-4 h-4" />
                                <span>Send Toast</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickToastModal;
