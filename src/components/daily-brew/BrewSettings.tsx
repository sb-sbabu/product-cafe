import React, { useState, useEffect } from 'react';
import {
    Settings, X, Moon, Bell, Clock,
    Zap, Coffee, BookOpen, MessageCircle,
    Save, RotateCcw, Focus, BarChart3, CalendarClock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { loadUserTaste, saveUserTaste, setQuietHours, clearQuietHours, type UserTaste, type ScheduleWindow } from '../../lib/daily-brew/barista-memory';
import { enableFocusMode, disableFocusMode, isFocusModeActive } from '../../lib/daily-brew/timing-engine';
import { WeekInBrew } from './WeekInBrew';
import type { BrewSource } from '../../lib/daily-brew/types';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CONFIGURATION PANEL (Phase 4 Updated)
 * 
 * Configure your notification preferences:
 * - Source preferences (boost/mute Toast, Pulse, LOP, etc.)
 * - Quiet hours configuration
 * - Focus mode toggle
 * - Smart Scheduling (Morning/Afternoon/Evening batches)
 */

interface BrewSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

const SOURCE_CONFIG: { key: BrewSource; label: string; icon: typeof Coffee; color: string }[] = [
    { key: 'toast', label: 'Toast Recognition', icon: Coffee, color: 'text-amber-500' },
    { key: 'pulse', label: 'Pulse Market Intel', icon: Zap, color: 'text-blue-500' },
    { key: 'lop', label: 'Love of Product', icon: BookOpen, color: 'text-violet-500' },
    { key: 'chat', label: 'Discussions', icon: MessageCircle, color: 'text-emerald-500' },
];

export const BrewSettings: React.FC<BrewSettingsProps> = ({ isOpen, onClose }) => {
    const [taste, setTaste] = useState<UserTaste>(loadUserTaste());
    const [activeTab, setActiveTab] = useState<'general' | 'insights'>('general');
    const [activeFocus, setActiveFocus] = useState(isFocusModeActive());
    const [focusDuration, setFocusDuration] = useState(30);
    const [quietStart, setQuietStart] = useState(taste.quietHours?.start || '22:00');
    const [quietEnd, setQuietEnd] = useState(taste.quietHours?.end || '08:00');
    const [quietEnabled, setQuietEnabled] = useState(!!taste.quietHours);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTaste(loadUserTaste());
            setActiveFocus(isFocusModeActive());
        }
    }, [isOpen]);

    const handleSourcePreference = (source: BrewSource, delta: number) => {
        setTaste(prev => {
            const current = prev.bySource[source] || 0;
            return {
                ...prev,
                bySource: {
                    ...prev.bySource,
                    [source]: Math.min(Math.max(current + delta, -100), 100)
                }
            };
        });
    };

    const handleBatchModeToggle = () => {
        setTaste(prev => ({
            ...prev,
            batchMode: prev.batchMode === 'realtime' ? 'scheduled' : 'realtime'
        }));
    };

    const handleWindowToggle = (windowName: string) => {
        setTaste(prev => ({
            ...prev,
            scheduleWindows: prev.scheduleWindows.map(w =>
                w.name === windowName ? { ...w, enabled: !w.enabled } : w
            )
        }));
    };

    const handleWindowTimeChange = (windowName: string, hour: number) => {
        setTaste(prev => ({
            ...prev,
            scheduleWindows: prev.scheduleWindows.map(w =>
                w.name === windowName ? { ...w, startHour: hour } : w
            )
        }));
    };

    const handleSave = () => {
        // Save source preferences
        saveUserTaste(taste);

        // Save quiet hours
        if (quietEnabled) {
            setQuietHours(quietStart, quietEnd);
        } else {
            clearQuietHours();
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        const defaultTaste = loadUserTaste();
        Object.keys(defaultTaste.bySource).forEach(key => {
            defaultTaste.bySource[key as BrewSource] = 0;
        });
        setTaste(defaultTaste);
        setQuietEnabled(false);
        setQuietStart('22:00');
        setQuietEnd('08:00');
    };

    const handleFocusToggle = () => {
        if (activeFocus) {
            disableFocusMode();
            setActiveFocus(false);
        } else {
            enableFocusMode(focusDuration);
            setActiveFocus(true);
        }
    };

    const getPreferenceLabel = (value: number): string => {
        if (value >= 50) return 'Boosted';
        if (value >= 20) return 'Preferred';
        if (value <= -50) return 'Muted';
        if (value <= -20) return 'Reduced';
        return 'Normal';
    };

    const getPreferenceColor = (value: number): string => {
        if (value >= 50) return 'text-emerald-600 bg-emerald-50';
        if (value >= 20) return 'text-emerald-500 bg-emerald-50/50';
        if (value <= -50) return 'text-rose-600 bg-rose-50';
        if (value <= -20) return 'text-rose-500 bg-rose-50/50';
        return 'text-gray-500 bg-gray-50';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={cn(
                                "text-sm font-semibold transition-colors pb-4 -mb-4 border-b-2",
                                activeTab === 'general' ? "text-gray-900 border-gray-900" : "text-gray-500 border-transparent hover:text-gray-700"
                            )}
                        >
                            Preferences
                        </button>
                        <button
                            onClick={() => setActiveTab('insights')}
                            className={cn(
                                "text-sm font-semibold transition-colors pb-4 -mb-4 border-b-2 flex items-center gap-1.5",
                                activeTab === 'insights' ? "text-violet-600 border-violet-600" : "text-gray-500 border-transparent hover:text-gray-700"
                            )}
                        >
                            <BarChart3 className="w-4 h-4" />
                            Insights
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'insights' ? (
                        <div className="py-2">
                            <WeekInBrew />
                        </div>
                    ) : (
                        <>
                            {/* ═══════════════════════════════════════════════════════════════ */}
                            {/* SMART SCHEDULING (Phase 4) */}
                            {/* ═══════════════════════════════════════════════════════════════ */}
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <CalendarClock className="w-4 h-4 text-emerald-500" />
                                    <h3 className="text-sm font-semibold text-gray-900">Delivery Schedule</h3>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Batch Delivery</h4>
                                            <p className="text-xs text-gray-500">Group updates into digests</p>
                                        </div>
                                        <button
                                            onClick={handleBatchModeToggle}
                                            className={cn(
                                                'relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
                                                taste.batchMode === 'scheduled' ? 'bg-emerald-500' : 'bg-gray-200'
                                            )}
                                        >
                                            <span className={cn(
                                                'inline-block w-4 h-4 transform bg-white rounded-full shadow transition duration-200 ease-in-out mt-1 ml-1',
                                                taste.batchMode === 'scheduled' ? 'translate-x-5' : 'translate-x-0'
                                            )} />
                                        </button>
                                    </div>

                                    {taste.batchMode === 'scheduled' && (
                                        <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
                                            {taste.scheduleWindows?.map((window) => (
                                                <div key={window.name} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={window.enabled}
                                                            onChange={() => handleWindowToggle(window.name)}
                                                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                        />
                                                        <span className="text-sm text-gray-700 capitalize">{window.name}</span>
                                                    </div>
                                                    <select
                                                        disabled={!window.enabled}
                                                        value={window.startHour}
                                                        onChange={(e) => handleWindowTimeChange(window.name, parseInt(e.target.value))}
                                                        className="text-xs border-gray-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                                                    >
                                                        {Array.from({ length: 24 }).map((_, i) => (
                                                            <option key={i} value={i}>
                                                                {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ═══════════════════════════════════════════════════════════════ */}
                            {/* FOCUS MODE */}
                            {/* ═══════════════════════════════════════════════════════════════ */}  <div className="px-5 py-4 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Focus className="w-4 h-4 text-violet-500" />
                                        <span className="font-semibold text-gray-900 text-sm">Focus Mode</span>
                                    </div>
                                    <button
                                        onClick={handleFocusToggle}
                                        className={cn(
                                            'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                                            activeFocus
                                                ? 'bg-violet-500 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        )}
                                    >
                                        {activeFocus ? 'Active' : 'Enable'}
                                    </button>
                                </div>
                                {!activeFocus && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Duration:</span>
                                        {[15, 30, 60, 120].map(mins => (
                                            <button
                                                key={mins}
                                                onClick={() => setFocusDuration(mins)}
                                                className={cn(
                                                    'px-2 py-1 text-xs rounded-md transition-colors',
                                                    focusDuration === mins
                                                        ? 'bg-violet-100 text-violet-700 font-medium'
                                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                                )}
                                            >
                                                {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 mt-2">
                                    Only critical notifications will be shown during focus mode.
                                </p>
                            </div>

                            {/* Quiet Hours */}
                            <div className="px-5 py-4 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Moon className="w-4 h-4 text-indigo-500" />
                                        <span className="font-semibold text-gray-900 text-sm">Quiet Hours</span>
                                    </div>
                                    <button
                                        onClick={() => setQuietEnabled(!quietEnabled)}
                                        className={cn(
                                            'w-10 h-5 rounded-full transition-colors relative',
                                            quietEnabled ? 'bg-indigo-500' : 'bg-gray-200'
                                        )}
                                    >
                                        <div className={cn(
                                            'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                                            quietEnabled ? 'translate-x-5' : 'translate-x-0.5'
                                        )} />
                                    </button>
                                </div>
                                {quietEnabled && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-gray-500">From</span>
                                            <input
                                                type="time"
                                                value={quietStart}
                                                onChange={(e) => setQuietStart(e.target.value)}
                                                className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-gray-500">To</span>
                                            <input
                                                type="time"
                                                value={quietEnd}
                                                onChange={(e) => setQuietEnd(e.target.value)}
                                                className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                            />
                                        </div>
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 mt-2">
                                    Non-critical notifications will be batched during quiet hours.
                                </p>
                            </div>

                            {/* Source Preferences */}
                            <div className="px-5 py-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Bell className="w-4 h-4 text-amber-500" />
                                    <span className="font-semibold text-gray-900 text-sm">Source Preferences</span>
                                </div>
                                <div className="space-y-3">
                                    {SOURCE_CONFIG.map(({ key, label, icon: Icon, color }) => {
                                        const value = taste.bySource[key] || 0;
                                        return (
                                            <div key={key} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Icon className={cn('w-4 h-4', color)} />
                                                    <span className="text-sm text-gray-700">{label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleSourcePreference(key, -25)}
                                                        className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-bold transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <span className={cn(
                                                        'px-2 py-0.5 text-[10px] font-semibold rounded-md min-w-[60px] text-center',
                                                        getPreferenceColor(value)
                                                    )}>
                                                        {getPreferenceLabel(value)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleSourcePreference(key, 25)}
                                                        className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-bold transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-400 mt-3">
                                    Boost sources you care about, mute ones you don't.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {activeTab === 'general' && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className={cn(
                                'flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all',
                                saved
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-md'
                            )}
                        >
                            <Save className="w-3.5 h-3.5" />
                            {saved ? 'Saved!' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default BrewSettings;
