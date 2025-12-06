/**
 * AdminPointsPanel - Admin interface for managing user points
 * 
 * Features:
 * - Award points to users
 * - Remove points from users
 * - View point history
 * - Quick adjustment presets
 */

import React, { useState } from 'react';
import { Award, Minus, Plus, Search, Gift, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminPointsPanelProps {
    onAwardPoints: (userId: string, points: number, reason: string) => void;
    onRemovePoints: (userId: string, points: number, reason: string) => void;
    className?: string;
}

const presetAwards = [
    { label: 'Helpful Comment', points: 10, icon: Gift },
    { label: 'Quality Discussion', points: 25, icon: Award },
    { label: 'Bug Report', points: 50, icon: AlertTriangle },
    { label: 'Major Contribution', points: 100, icon: Award },
];

export const AdminPointsPanel: React.FC<AdminPointsPanelProps> = ({
    onAwardPoints,
    onRemovePoints,
    className,
}) => {
    const [selectedUser, setSelectedUser] = useState('');
    const [customPoints, setCustomPoints] = useState(10);
    const [reason, setReason] = useState('');
    const [mode, setMode] = useState<'award' | 'remove'>('award');

    const handleSubmit = () => {
        if (!selectedUser || !reason) return;

        if (mode === 'award') {
            onAwardPoints(selectedUser, customPoints, reason);
        } else {
            onRemovePoints(selectedUser, customPoints, reason);
        }

        // Reset form
        setReason('');
        setCustomPoints(10);
    };

    return (
        <div className={cn(
            'bg-white rounded-xl border border-gray-200 shadow-sm p-5',
            className
        )}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                Points Management
            </h3>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setMode('award')}
                    className={cn(
                        'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                        mode === 'award'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    )}
                >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Award Points
                </button>
                <button
                    onClick={() => setMode('remove')}
                    className={cn(
                        'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                        mode === 'remove'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    )}
                >
                    <Minus className="w-4 h-4 inline mr-1" />
                    Remove Points
                </button>
            </div>

            {/* User Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search user..."
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
            </div>

            {/* Preset Awards (only in award mode) */}
            {mode === 'award' && (
                <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Quick Awards</p>
                    <div className="grid grid-cols-2 gap-2">
                        {presetAwards.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => {
                                    setCustomPoints(preset.points);
                                    setReason(preset.label);
                                }}
                                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-left transition-colors"
                            >
                                <preset.icon className="w-4 h-4 text-orange-500" />
                                <div>
                                    <p className="text-xs font-medium text-gray-700">{preset.label}</p>
                                    <p className="text-xs text-gray-400">+{preset.points} pts</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Points Input */}
            <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">Points</label>
                <input
                    type="number"
                    min={1}
                    max={1000}
                    value={customPoints}
                    onChange={(e) => setCustomPoints(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
            </div>

            {/* Reason */}
            <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">Reason</label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={mode === 'award' ? 'Why are you awarding points?' : 'Why are you removing points?'}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
            </div>

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={!selectedUser || !reason}
                className={cn(
                    'w-full py-2.5 rounded-lg font-medium text-sm transition-colors',
                    mode === 'award'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white disabled:bg-gray-200 disabled:text-gray-400'
                        : 'bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-200 disabled:text-gray-400'
                )}
            >
                {mode === 'award' ? `Award ${customPoints} Points` : `Remove ${customPoints} Points`}
            </button>
        </div>
    );
};

export default AdminPointsPanel;
