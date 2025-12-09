/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GRAB & GO — Intelligent Quick-Action Hub
 * 10x Redesign: Personalized, context-aware, instant utility
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import {
    Zap,
    Search,
    ChevronDown,
    ChevronUp,
    Grid3X3,
    Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../../components/ui/Card';

// Components
import { QuickActionCard } from './components/QuickActionCard';
import { SmartSuggestionRail } from './components/SmartSuggestionRail';
import { PinnedFavorites } from './components/PinnedFavorites';
import { RecentHistory } from './components/RecentHistory';
import { StatusDashboard } from './components/StatusDashboard';

// Data & Engine
import { getDefaultActions, searchActions, QUICK_ACTIONS, CATEGORY_LABELS, type QuickActionCategory } from './actions/quickActions';
import { getGreeting, getContextualMessage } from './engine/smartSuggestionEngine';
import { useGrabAndGoStore } from './store/grabAndGoStore';

interface GrabAndGoPageProps {
    onNavigate?: (section: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const GrabAndGoPage: React.FC<GrabAndGoPageProps> = ({ onNavigate }) => {
    const [showAllActions, setShowAllActions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<QuickActionCategory | 'all'>('all');

    const defaultActions = getDefaultActions();
    const greeting = getGreeting();
    const contextMessage = getContextualMessage();

    // Filter actions for browse section
    const filteredActions = React.useMemo(() => {
        let actions = QUICK_ACTIONS;

        if (searchQuery) {
            actions = searchActions(searchQuery);
        }

        if (selectedCategory !== 'all') {
            actions = actions.filter(a => a.category === selectedCategory);
        }

        return actions;
    }, [searchQuery, selectedCategory]);

    return (
        <div className="max-w-5xl mx-auto py-6 lg:py-8 space-y-8 animate-fade-in">

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* HERO — Greeting & Quick Actions Grid */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section>
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {greeting}! ☕
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {contextMessage}
                        </p>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="mt-6">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {defaultActions.map((action) => (
                            <QuickActionCard
                                key={action.id}
                                action={action}
                                size="lg"
                                showPin
                                onNavigate={onNavigate}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SMART SUGGESTIONS — AI-Powered Rail */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section>
                <SmartSuggestionRail maxItems={6} onNavigate={onNavigate} />
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TWO-COLUMN: Pinned + Recent */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section className="grid md:grid-cols-2 gap-6">
                <PinnedFavorites onAddPin={() => setShowAllActions(true)} onNavigate={onNavigate} />
                <RecentHistory maxItems={5} onNavigate={onNavigate} />
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* STATUS DASHBOARD */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section>
                <StatusDashboard />
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* DISCOVER — Browse All Actions (Collapsed by Default) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section>
                <button
                    onClick={() => setShowAllActions(!showAllActions)}
                    className={cn(
                        'w-full flex items-center justify-between p-4 rounded-xl',
                        'bg-gray-50 hover:bg-gray-100 border border-gray-200',
                        'transition-colors'
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Grid3X3 className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-700">
                            Discover All Actions
                        </span>
                        <span className="text-xs text-gray-400">
                            {QUICK_ACTIONS.length} available
                        </span>
                    </div>
                    {showAllActions ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </button>

                {/* Expanded Browse Section */}
                {showAllActions && (
                    <Card className="mt-3 p-4 animate-fade-in">
                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search actions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={cn(
                                        'w-full pl-10 pr-4 py-2 rounded-lg',
                                        'border border-gray-200 focus:border-cafe-500 focus:ring-1 focus:ring-cafe-500',
                                        'text-sm placeholder:text-gray-400',
                                        'transition-colors outline-none'
                                    )}
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="flex gap-1 overflow-x-auto pb-1">
                                <CategoryPill
                                    label="All"
                                    isActive={selectedCategory === 'all'}
                                    onClick={() => setSelectedCategory('all')}
                                />
                                {(Object.keys(CATEGORY_LABELS) as QuickActionCategory[]).map(cat => (
                                    <CategoryPill
                                        key={cat}
                                        label={CATEGORY_LABELS[cat]}
                                        isActive={selectedCategory === cat}
                                        onClick={() => setSelectedCategory(cat)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Actions Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {filteredActions.map((action) => (
                                <QuickActionCard
                                    key={action.id}
                                    action={action}
                                    size="md"
                                    showPin
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </div>

                        {filteredActions.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                No actions found for "{searchQuery}"
                            </div>
                        )}
                    </Card>
                )}
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* FOOTER — Settings Link */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <footer className="flex justify-center pt-4">
                <button
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <Settings className="w-3 h-3" />
                    Customize your Grab & Go
                </button>
            </footer>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface CategoryPillProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const CategoryPill: React.FC<CategoryPillProps> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap',
            'transition-colors',
            isActive
                ? 'bg-cafe-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        )}
    >
        {label}
    </button>
);

export default GrabAndGoPage;
