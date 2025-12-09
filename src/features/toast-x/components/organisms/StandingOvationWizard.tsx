/**
 * Toast X - Standing Ovation Wizard
 * 5-step wizard for celebrating significant achievements
 * Steps: Recipients → Value → Story → Image → Award & Finalize
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import {
    X, Search, Award, Check, Sparkles, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useToastXStore } from '../../store';
import { COMPANY_VALUES, AWARDS, ANTI_GAMING_LIMITS } from '../../constants';
import type { CompanyValue, AwardType, RecipientInfo } from '../../types';

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

interface StandingOvationWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;

export const StandingOvationWizard: React.FC<StandingOvationWizardProps> = memo(({
    isOpen,
    onClose,
}) => {
    const createRecognition = useToastXStore(state => state.createRecognition);
    const users = useToastXStore(state => state.users);
    const currentUserId = useToastXStore(state => state.currentUserId);

    const currentUser = useMemo(() => users.get(currentUserId), [users, currentUserId]);
    const dailyOvations = currentUser?.dailyStandingOvations || 0;
    const remaining = ANTI_GAMING_LIMITS.DAILY_STANDING_OVATIONS - dailyOvations;

    // Wizard state
    const [currentStep, setCurrentStep] = useState<WizardStep>(1);

    // Form State
    const [selectedRecipients, setSelectedRecipients] = useState<RecipientInfo[]>([]);
    const [selectedValue, setSelectedValue] = useState<CompanyValue | null>(null);
    const [selectedExpertAreas, setSelectedExpertAreas] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [impact, setImpact] = useState('');
    const [selectedImageId, setSelectedImageId] = useState<string>('img-standing-ovation');
    const [selectedAward, setSelectedAward] = useState<AwardType | null>(null);
    const [notifyManagers, setNotifyManagers] = useState(true);
    const [nominateForMonthly, setNominateForMonthly] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // All users except current
    const allUsers = useMemo(() => Array.from(users.values()), [users]);
    const filteredUsers = useMemo(() => {
        const selectedIds = selectedRecipients.map(r => r.id);
        let filtered = allUsers.filter(u => u && u.id !== currentUserId && !selectedIds.includes(u.id) && u.name);
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(u =>
                (u.name?.toLowerCase() || '').includes(query) || (u.team?.toLowerCase() || '').includes(query)
            );
        }
        return filtered;
    }, [searchQuery, currentUserId, selectedRecipients, allUsers]);

    // Recommended award based on value
    const recommendedAward = useMemo(() => {
        if (!selectedValue) return null;
        const awardEntry = Object.entries(AWARDS).find(([_, award]) => award.value === selectedValue);
        return awardEntry ? awardEntry[0] as AwardType : null;
    }, [selectedValue]);

    // Add recipient
    const addRecipient = useCallback((user: { id: string; name: string; title: string; team: string }) => {
        if (selectedRecipients.length >= 10) return;
        setSelectedRecipients(prev => [...prev, {
            id: user.id,
            name: user.name,
            title: user.title,
            team: user.team,
        }]);
        setSearchQuery('');
    }, [selectedRecipients]);

    // Remove recipient
    const removeRecipient = useCallback((userId: string) => {
        setSelectedRecipients(prev => prev.filter(r => r.id !== userId));
    }, []);

    // Toggle expert area
    const toggleExpertArea = (areaId: string) => {
        setSelectedExpertAreas(prev =>
            prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]
        );
    };

    // Navigation
    const canGoNext = useCallback((): boolean => {
        switch (currentStep) {
            case 1: return selectedRecipients.length > 0;
            case 2: return selectedValue !== null;
            case 3: return message.trim().length >= 20;
            case 4: return selectedImageId !== '';
            case 5: return true;
            default: return false;
        }
    }, [currentStep, selectedRecipients, selectedValue, message, selectedImageId]);

    const goNext = () => {
        if (canGoNext() && currentStep < 5) {
            setCurrentStep((currentStep + 1) as WizardStep);
        }
    };

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as WizardStep);
        }
    };

    // Reset form to initial state
    const resetForm = useCallback(() => {
        setCurrentStep(1);
        setSelectedRecipients([]);
        setSelectedValue(null);
        setSelectedExpertAreas([]);
        setMessage('');
        setImpact('');
        setSelectedImageId('img-standing-ovation');
        setSelectedAward(null);
        setNotifyManagers(true);
        setNominateForMonthly(false);
    }, []);

    // Submit
    const handleSubmit = useCallback(async () => {
        if (!selectedValue || !message.trim()) {
            setError('Please complete all required fields');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const result = createRecognition({
            type: 'STANDING_OVATION',
            recipientIds: selectedRecipients.map(r => r.id),
            value: selectedValue,
            expertAreas: selectedExpertAreas,
            message: message.trim(),
            impact: impact.trim() || undefined,
            imageId: selectedImageId,
            award: selectedAward || undefined,
            notifyManagers,
            nominatedForMonthly: nominateForMonthly,
        });

        setIsSubmitting(false);

        if (result.success) {
            resetForm();
            onClose();
        } else {
            setError(result.error || 'Failed to create recognition');
        }
    }, [selectedRecipients, selectedValue, selectedExpertAreas, message, impact, selectedImageId, selectedAward, notifyManagers, nominateForMonthly, createRecognition, onClose, resetForm]);

    if (!isOpen) return null;

    const valueData = selectedValue ? COMPANY_VALUES[selectedValue] : null;
    const awardData = selectedAward ? AWARDS[selectedAward] : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="relative px-6 py-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg">
                            <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Standing Ovation</h2>
                            <p className="text-sm text-white/60">Celebrate significant achievements</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-lg hover:bg-white/10">
                        <X className="w-5 h-5 text-white/60" />
                    </button>

                    {/* Step indicator */}
                    <div className="absolute right-4 bottom-4 flex items-center gap-2">
                        <span className="text-xs text-white/40">Step {currentStep} of 5</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(step => (
                                <div
                                    key={step}
                                    className={`w-2 h-2 rounded-full transition-colors ${step === currentStep ? 'bg-purple-400' :
                                        step < currentStep ? 'bg-purple-400/50' : 'bg-white/20'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 min-h-[400px] max-h-[60vh] overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Recipients */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Who deserves recognition?</h3>
                                <p className="text-sm text-white/60">Add up to 10 people to celebrate</p>
                            </div>

                            {selectedRecipients.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                                    {selectedRecipients.map(recipient => (
                                        <div key={recipient.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                                <span className="text-white text-xs font-medium">{recipient.name?.charAt(0) || '?'}</span>
                                            </div>
                                            <span className="text-sm text-white">{recipient.name}</span>
                                            <button onClick={() => removeRecipient(recipient.id)} className="p-0.5 rounded hover:bg-white/10">
                                                <X className="w-3 h-3 text-white/60" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Search by name or team..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                {filteredUsers.slice(0, 8).map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => addRecipient(user)}
                                        disabled={selectedRecipients.length >= 10}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left disabled:opacity-50"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
                                            <span className="text-white font-medium">{user.name?.charAt(0) || '?'}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{user.name}</p>
                                            <p className="text-xs text-white/50 truncate">{user.team}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Value Selection */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Which value did they embody?</h3>
                                <p className="text-sm text-white/60">Select the value that best describes their achievement</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {Object.values(COMPANY_VALUES).map(value => (
                                    <button
                                        key={value.id}
                                        onClick={() => setSelectedValue(value.id)}
                                        className={`p-4 rounded-xl border transition-all text-left ${selectedValue === value.id
                                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 ring-2 ring-purple-500/30'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">{value.icon}</span>
                                            <span className="text-white font-semibold">{value.shortName}</span>
                                            {selectedValue === value.id && <Check className="w-5 h-5 text-purple-400 ml-auto" />}
                                        </div>
                                        <p className="text-xs text-white/60 line-clamp-2">{value.description}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Expert Areas */}
                            <div className="mt-6 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm font-medium text-white/80">Boost their expert scores (optional)</span>
                                    {selectedExpertAreas.length > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                                            +{selectedExpertAreas.length * 10} pts each
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-4 gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10">
                                    {EXPERT_AREAS.map(area => (
                                        <button
                                            key={area.id}
                                            onClick={() => toggleExpertArea(area.id)}
                                            className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedExpertAreas.includes(area.id)
                                                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
                                                }`}
                                        >
                                            {area.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Story & Impact */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Tell the story</h3>
                                <p className="text-sm text-white/60">Be specific — it makes recognition meaningful</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">What happened? *</label>
                                <textarea
                                    placeholder="When the project was at risk, they stepped up and..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                                />
                                <div className="flex justify-between text-xs text-white/40">
                                    <span>Minimum 20 characters</span>
                                    <span className={message.length < 20 ? 'text-red-400' : ''}>{message.length}/500</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">What was the impact? (Optional)</label>
                                <textarea
                                    placeholder="Saved $X, improved NPS by Y points..."
                                    value={impact}
                                    onChange={(e) => setImpact(e.target.value.slice(0, 200))}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                                />
                                <div className="text-right text-xs text-white/40">{impact.length}/200</div>
                            </div>

                            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <p className="text-xs text-purple-300 font-medium mb-2">💡 Writing Tips</p>
                                <ul className="text-xs text-white/60 space-y-1">
                                    <li>• What specific action did they take?</li>
                                    <li>• How did it demonstrate the value you selected?</li>
                                    <li>• Who was positively affected?</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Image Selection */}
                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Choose an image</h3>
                                <p className="text-sm text-white/60">Pick an image that captures the spirit</p>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                {['👏', '🎉', '🏆', '⭐', '🚀', '💪', '🙌', '✨'].map((emoji, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageId(`img-${idx}`)}
                                        className={`aspect-square rounded-xl flex items-center justify-center text-4xl transition-all ${selectedImageId === `img-${idx}`
                                            ? 'bg-purple-500/30 border-2 border-purple-500 ring-2 ring-purple-500/30'
                                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Award & Finalize */}
                    {currentStep === 5 && (
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Final touches</h3>
                                <p className="text-sm text-white/60">Add an award and review before posting</p>
                            </div>

                            {/* Award Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-white/80">Add an Award? (Optional)</label>

                                {recommendedAward && (
                                    <button
                                        onClick={() => setSelectedAward(selectedAward === recommendedAward ? null : recommendedAward)}
                                        className={`w-full p-4 rounded-xl border transition-all text-left ${selectedAward === recommendedAward
                                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 ring-2 ring-purple-500/30'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{AWARDS[recommendedAward].icon}</span>
                                            <div className="flex-1">
                                                <p className="text-white font-semibold">{AWARDS[recommendedAward].name}</p>
                                                <p className="text-xs text-white/60">{AWARDS[recommendedAward].description}</p>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs">Recommended</span>
                                            {selectedAward === recommendedAward && <Check className="w-5 h-5 text-purple-400" />}
                                        </div>
                                    </button>
                                )}

                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(AWARDS)
                                        .filter(([key]) => !AWARDS[key as AwardType].isSpecial && key !== recommendedAward)
                                        .slice(0, 6)
                                        .map(([key, award]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedAward(selectedAward === key ? null : key as AwardType)}
                                                className={`p-3 rounded-xl border transition-all text-center ${selectedAward === key
                                                    ? 'bg-purple-500/20 border-purple-500/50'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                    }`}
                                            >
                                                <span className="text-xl">{award.icon}</span>
                                                <p className="text-xs text-white/80 mt-1">{award.name}</p>
                                            </button>
                                        ))}
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifyManagers}
                                        onChange={(e) => setNotifyManagers(e.target.checked)}
                                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                                    />
                                    <span className="text-sm text-white/80">Notify their managers</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={nominateForMonthly}
                                        onChange={(e) => setNominateForMonthly(e.target.checked)}
                                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                                    />
                                    <span className="text-sm text-white/80">Nominate for Toast of the Month</span>
                                </label>
                            </div>

                            {/* Preview */}
                            <div className="space-y-2 pt-4 border-t border-white/10">
                                <p className="text-xs font-medium text-white/60 uppercase tracking-wider">Preview</p>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{valueData?.icon}</span>
                                        <span className="text-sm font-semibold text-white">{valueData?.shortName}</span>
                                        {awardData && (
                                            <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs flex items-center gap-1">
                                                <span>{awardData.icon}</span>
                                                <span>{awardData.name}</span>
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-white/80 line-clamp-2">{message}</p>
                                    {impact && <p className="text-xs text-white/60 italic">Impact: {impact}</p>}
                                    <div className="flex flex-wrap gap-1">
                                        {selectedRecipients.map(r => (
                                            <span key={r.id} className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/70">
                                                {r.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
                    <button
                        onClick={currentStep === 1 ? onClose : goBack}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>{currentStep === 1 ? 'Cancel' : 'Back'}</span>
                    </button>

                    {currentStep < 5 ? (
                        <button
                            onClick={goNext}
                            disabled={!canGoNext()}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${!canGoNext()
                                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25'
                                }`}
                        >
                            <span>Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || remaining <= 0}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${isSubmitting || remaining <= 0
                                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Posting...</span>
                                </>
                            ) : (
                                <>
                                    <Award className="w-4 h-4" />
                                    <span>Post Standing Ovation</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

StandingOvationWizard.displayName = 'StandingOvationWizard';

export default StandingOvationWizard;
