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
    const removeRecipient = useCallback((id: string) => {
        setSelectedRecipients(prev => prev.filter(r => r.id !== id));
    }, []);

    // Toggle expert area
    const toggleExpertArea = useCallback((id: string) => {
        setSelectedExpertAreas(prev =>
            prev.includes(id)
                ? prev.filter(areaId => areaId !== id)
                : [...prev, id]
        );
    }, []);

    // Navigation
    const canGoNext = useCallback(() => {
        if (currentStep === 1) return selectedRecipients.length > 0;
        if (currentStep === 2) return !!selectedValue;
        if (currentStep === 3) return message.length >= 20;
        if (currentStep === 4) return !!selectedImageId;
        return true;
    }, [currentStep, selectedRecipients, selectedValue, message, selectedImageId]);

    const goNext = () => {
        if (canGoNext() && currentStep < 5) {
            setCurrentStep(prev => (prev + 1) as WizardStep);
        }
    };

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => (prev - 1) as WizardStep);
        }
    };

    // Reset Form
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
        setSearchQuery('');
        setError(null);
    }, []);

    // Submit
    const handleSubmit = () => {
        if (remaining <= 0) {
            setError('You have reached your daily limit for Standing Ovations.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        // Find selected expert areas based on IDs
        const expertAreaIds = selectedExpertAreas;

        const result = createRecognition({
            type: 'STANDING_OVATION',
            recipientIds: selectedRecipients.map(r => r.id),
            value: selectedValue!,
            message,
            impact: impact || undefined,
            expertAreas: expertAreaIds,
            imageId: selectedImageId,
            award: selectedAward || undefined,
            notifyManagers,
            nominatedForMonthly: nominateForMonthly
        });

        setIsSubmitting(false);

        if (result.success) {
            onClose();
            resetForm();
        } else {
            setError(result.error || 'Failed to create standing ovation. Please try again.');
        }
    };

    if (!isOpen) return null;

    const valueData = selectedValue ? COMPANY_VALUES[selectedValue] : null;
    const awardData = selectedAward ? AWARDS[selectedAward] : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="relative px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Standing Ovation</h2>
                            <p className="text-sm text-gray-500">Celebrate exceptional achievements</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/50 text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Steps */}
                    <div className="flex items-center gap-2 mt-6">
                        {[1, 2, 3, 4, 5].map(step => (
                            <div key={step} className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${step <= currentStep ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}`}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-medium text-gray-400">
                        <span className={currentStep >= 1 ? 'text-purple-600' : ''}>Recipients</span>
                        <span className={currentStep >= 2 ? 'text-purple-600' : ''}>Value</span>
                        <span className={currentStep >= 3 ? 'text-purple-600' : ''}>Story</span>
                        <span className={currentStep >= 4 ? 'text-purple-600' : ''}>Image</span>
                        <span className={currentStep >= 5 ? 'text-purple-600' : ''}>Award</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center gap-3">
                            <span className="text-xl">⚠️</span>
                            {error}
                        </div>
                    )}

                    {/* Step 1: Recipients */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-semibold text-gray-900">Who are you celebrating?</h3>
                                <p className="text-gray-500">Select one or more colleagues for a Standing Ovation</p>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or team..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                    autoFocus
                                />
                            </div>

                            {/* Selected Recipients */}
                            {selectedRecipients.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedRecipients.map(recipient => (
                                        <div key={recipient.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 animate-in zoom-in duration-200">
                                            <span className="text-sm font-medium">{recipient.name}</span>
                                            <button
                                                onClick={() => removeRecipient(recipient.id)}
                                                className="p-0.5 rounded-full hover:bg-purple-100"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Search Results */}
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {filteredUsers.slice(0, 5).map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => addRecipient(user)}
                                        disabled={selectedRecipients.length >= 10}
                                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group border border-transparent hover:border-gray-100"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-600 font-semibold group-hover:scale-110 transition-transform">
                                            {user.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.title} • {user.team}</p>
                                        </div>
                                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Value Selection */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-semibold text-gray-900">Which value did they embody?</h3>
                                <p className="text-gray-500">Select the value that best describes their achievement</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {Object.values(COMPANY_VALUES).map(value => (
                                    <button
                                        key={value.id}
                                        onClick={() => setSelectedValue(value.id)}
                                        className={`p-4 rounded-xl border transition-all text-left group ${selectedValue === value.id
                                            ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-100'
                                            : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl group-hover:scale-110 transition-transform">{value.icon}</span>
                                            <span className="text-gray-900 font-semibold">{value.shortName}</span>
                                            {selectedValue === value.id && <Check className="w-5 h-5 text-purple-600 ml-auto" />}
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2">{value.description}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Expert Areas */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm font-medium text-gray-700">Boost their expert scores (optional)</span>
                                    {selectedExpertAreas.length > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                                            +{selectedExpertAreas.length * 10} pts each
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {EXPERT_AREAS.map(area => (
                                        <button
                                            key={area.id}
                                            onClick={() => toggleExpertArea(area.id)}
                                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedExpertAreas.includes(area.id)
                                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
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
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-semibold text-gray-900">Tell the story</h3>
                                <p className="text-gray-500">Be specific — it makes recognition meaningful</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">What happened? *</label>
                                <textarea
                                    placeholder="When the project was at risk, they stepped up and..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all"
                                />
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Minimum 20 characters</span>
                                    <span className={message.length < 20 ? 'text-red-500' : ''}>{message.length}/500</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">What was the impact? (Optional)</label>
                                <textarea
                                    placeholder="Saved $X, improved NPS by Y points..."
                                    value={impact}
                                    onChange={(e) => setImpact(e.target.value.slice(0, 200))}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all"
                                />
                                <div className="text-right text-xs text-gray-400">{impact.length}/200</div>
                            </div>

                            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                                <p className="text-sm text-purple-700 font-semibold mb-2">💡 Writing Tips</p>
                                <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                                    <li>What specific action did they take?</li>
                                    <li>How did it demonstrate the value you selected?</li>
                                    <li>Who was positively affected?</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Image Selection */}
                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-semibold text-gray-900">Choose an image</h3>
                                <p className="text-gray-500">Pick an image that captures the spirit</p>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                {['👏', '🎉', '🏆', '⭐', '🚀', '💪', '🙌', '✨'].map((emoji, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageId(`img-${idx}`)}
                                        className={`aspect-square rounded-xl flex items-center justify-center text-4xl transition-all ${selectedImageId === `img-${idx}`
                                            ? 'bg-purple-100 border-2 border-purple-500 ring-4 ring-purple-100'
                                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <span className="transform hover:scale-125 transition-transform duration-300">{emoji}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Award & Finalize */}
                    {currentStep === 5 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900">Final touches</h3>
                                <p className="text-gray-500">Add an award and review before posting</p>
                            </div>

                            {/* Award Selection */}
                            <div className="space-y-4">
                                <label className="text-sm font-medium text-gray-700">Add an Award? (Optional)</label>

                                {recommendedAward && (
                                    <button
                                        onClick={() => setSelectedAward(selectedAward === recommendedAward ? null : recommendedAward)}
                                        className={`w-full p-4 rounded-xl border transition-all text-left ${selectedAward === recommendedAward
                                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 ring-2 ring-purple-100'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{AWARDS[recommendedAward].icon}</span>
                                            <div className="flex-1">
                                                <p className="text-gray-900 font-semibold">{AWARDS[recommendedAward].name}</p>
                                                <p className="text-xs text-gray-500">{AWARDS[recommendedAward].description}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">Recommended</span>
                                                {selectedAward === recommendedAward && <Check className="w-5 h-5 text-purple-600" />}
                                            </div>
                                        </div>
                                    </button>
                                )}

                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(AWARDS)
                                        .filter(([key]) => !AWARDS[key as AwardType].isSpecial && key !== recommendedAward)
                                        .slice(0, 6)
                                        .map(([key, award]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedAward(selectedAward === key ? null : key as AwardType)}
                                                className={`p-3 rounded-xl border transition-all text-center flex flex-col items-center gap-2 ${selectedAward === key
                                                    ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-100'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span className="text-2xl">{award.icon}</span>
                                                <p className="text-xs text-gray-700 font-medium">{award.name}</p>
                                            </button>
                                        ))}
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-3 pt-6 border-t border-gray-100">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={notifyManagers}
                                        onChange={(e) => setNotifyManagers(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Notify their managers</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={nominateForMonthly}
                                        onChange={(e) => setNominateForMonthly(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Nominate for Toast of the Month</span>
                                </label>
                            </div>

                            {/* Preview */}
                            <div className="space-y-3 pt-6 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</p>
                                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{valueData?.icon}</span>
                                        <span className="text-sm font-bold text-gray-900">{valueData?.shortName}</span>
                                        {awardData && (
                                            <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium flex items-center gap-1">
                                                <span>{awardData.icon}</span>
                                                <span>{awardData.name}</span>
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
                                    {impact && <p className="text-xs text-gray-500 italic border-l-2 border-purple-200 pl-2">Impact: {impact}</p>}
                                    <div className="flex flex-wrap gap-1">
                                        {selectedRecipients.map(r => (
                                            <span key={r.id} className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600 font-medium">
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
                <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    <button
                        onClick={currentStep === 1 ? onClose : goBack}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>{currentStep === 1 ? 'Cancel' : 'Back'}</span>
                    </button>

                    {currentStep < 5 ? (
                        <button
                            onClick={goNext}
                            disabled={!canGoNext()}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 ${!canGoNext()
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/30 transform hover:-translate-y-0.5'
                                }`}
                        >
                            <span>Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || remaining <= 0}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 ${isSubmitting || remaining <= 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/30 transform hover:-translate-y-0.5'
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
