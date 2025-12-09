/**
 * BaristaCategories - Category System for Café BARISTA
 * 
 * Displays the 5 main categories (DISCOVER, LEARN, CONNECT, TRACK, DO)
 * with quick suggestion pills for each category.
 */

import React from 'react';
import {
    Search, BookOpen, Users, BarChart3, Zap,
    FileText, Target, ClipboardList, FlaskConical, Mic, TrendingUp,
    Lightbulb, PenTool, CheckCircle, Repeat, LineChart, Brain,
    PartyPopper, Trophy, UserSearch, Building2, Heart, Network,
    Coins, Medal, Activity, UsersRound, Library, Flame,
    Home, FolderOpen, Upload, Play, Gauge, Settings,
    ArrowLeft, ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type CategoryId = 'discover' | 'learn' | 'connect' | 'track' | 'do';

export interface QuickSuggestion {
    id: string;
    label: string;
    value: string;
    icon: React.ReactNode;
}

export interface Category {
    id: CategoryId;
    label: string;
    description: string;
    icon: React.ReactNode;
    emoji: string;
    gradient: string;
    suggestions: QuickSuggestion[];
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY DATA
// ═══════════════════════════════════════════════════════════════════════════

export const BARISTA_CATEGORIES: Category[] = [
    {
        id: 'discover',
        label: 'DISCOVER',
        description: 'Find content',
        icon: <Search className="w-5 h-5" />,
        emoji: '🔍',
        gradient: 'from-blue-500 to-cyan-500',
        suggestions: [
            { id: 'd1', label: 'Latest Playbooks', value: 'Show me the latest playbooks', icon: <FileText className="w-4 h-4" /> },
            { id: 'd2', label: 'Product Strategy Docs', value: 'Find product strategy documents', icon: <Target className="w-4 h-4" /> },
            { id: 'd3', label: 'Process Templates', value: 'Show me process templates', icon: <ClipboardList className="w-4 h-4" /> },
            { id: 'd4', label: 'Research Reports', value: 'Find research reports', icon: <FlaskConical className="w-4 h-4" /> },
            { id: 'd5', label: 'Recent LOP Episodes', value: 'Show me recent Love of Product episodes', icon: <Mic className="w-4 h-4" /> },
            { id: 'd6', label: 'Competitive Intel', value: 'What is the latest competitive intelligence?', icon: <TrendingUp className="w-4 h-4" /> },
        ]
    },
    {
        id: 'learn',
        label: 'LEARN',
        description: 'Understand concepts',
        icon: <BookOpen className="w-5 h-5" />,
        emoji: '📚',
        gradient: 'from-purple-500 to-violet-500',
        suggestions: [
            { id: 'l1', label: 'Product Craft Tips', value: 'Show me product craft tips', icon: <Lightbulb className="w-4 h-4" /> },
            { id: 'l2', label: 'How to Write a PRD', value: 'How do I write a PRD?', icon: <PenTool className="w-4 h-4" /> },
            { id: 'l3', label: 'OKR Best Practices', value: 'What are OKR best practices?', icon: <CheckCircle className="w-4 h-4" /> },
            { id: 'l4', label: 'Agile Ceremonies', value: 'Explain agile ceremonies', icon: <Repeat className="w-4 h-4" /> },
            { id: 'l5', label: 'Metrics That Matter', value: 'What metrics should I track?', icon: <LineChart className="w-4 h-4" /> },
            { id: 'l6', label: 'PM Skills Guide', value: 'Show me the PM skills guide', icon: <Brain className="w-4 h-4" /> },
        ]
    },
    {
        id: 'connect',
        label: 'CONNECT',
        description: 'People & teams',
        icon: <Users className="w-5 h-5" />,
        emoji: '👥',
        gradient: 'from-pink-500 to-rose-500',
        suggestions: [
            { id: 'c1', label: 'Give a Quick Toast', value: 'I want to give a toast', icon: <PartyPopper className="w-4 h-4" /> },
            { id: 'c2', label: 'View Leaderboard', value: 'Show me the leaderboard', icon: <Trophy className="w-4 h-4" /> },
            { id: 'c3', label: 'Find an Expert', value: 'I need to find an expert', icon: <UserSearch className="w-4 h-4" /> },
            { id: 'c4', label: 'Browse Teams', value: 'Show me the teams', icon: <Building2 className="w-4 h-4" /> },
            { id: 'c5', label: 'Recent Recognitions', value: 'Show recent recognitions', icon: <Heart className="w-4 h-4" /> },
            { id: 'c6', label: 'My Network', value: 'Show my network', icon: <Network className="w-4 h-4" /> },
        ]
    },
    {
        id: 'track',
        label: 'TRACK',
        description: 'Metrics & stats',
        icon: <BarChart3 className="w-5 h-5" />,
        emoji: '📊',
        gradient: 'from-amber-500 to-orange-500',
        suggestions: [
            { id: 't1', label: 'My Love Points', value: 'How many love points do I have?', icon: <Coins className="w-4 h-4" /> },
            { id: 't2', label: 'Leaderboard', value: 'Who is leading the leaderboard?', icon: <Medal className="w-4 h-4" /> },
            { id: 't3', label: 'My Recognition Stats', value: 'Show my recognition stats', icon: <Activity className="w-4 h-4" /> },
            { id: 't4', label: 'Team Progress', value: 'How is my team doing?', icon: <UsersRound className="w-4 h-4" /> },
            { id: 't5', label: 'Library Analytics', value: 'Show library analytics', icon: <Library className="w-4 h-4" /> },
            { id: 't6', label: 'Trending Content', value: 'What content is trending?', icon: <Flame className="w-4 h-4" /> },
        ]
    },
    {
        id: 'do',
        label: 'DO',
        description: 'Navigate & action',
        icon: <Zap className="w-5 h-5" />,
        emoji: '⚡',
        gradient: 'from-emerald-500 to-teal-500',
        suggestions: [
            { id: 'a1', label: 'Go to Home', value: 'Take me to home', icon: <Home className="w-4 h-4" /> },
            { id: 'a2', label: 'Open Library', value: 'Open the library', icon: <FolderOpen className="w-4 h-4" /> },
            { id: 'a3', label: 'Submit Content', value: 'I want to submit content', icon: <Upload className="w-4 h-4" /> },
            { id: 'a4', label: 'Watch Latest LOP', value: 'Play the latest Love of Product episode', icon: <Play className="w-4 h-4" /> },
            { id: 'a5', label: 'Check PULSE', value: 'Show me PULSE', icon: <Gauge className="w-4 h-4" /> },
            { id: 'a6', label: 'My Settings', value: 'Open my settings', icon: <Settings className="w-4 h-4" /> },
        ]
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// QUICK PICKS (personalized suggestions)
// ═══════════════════════════════════════════════════════════════════════════

export const QUICK_PICKS: QuickSuggestion[] = [
    { id: 'qp1', label: 'My Love Points', value: 'How many love points do I have?', icon: <Coins className="w-4 h-4" /> },
    { id: 'qp2', label: 'Latest Playbooks', value: 'Show me the latest playbooks', icon: <FileText className="w-4 h-4" /> },
    { id: 'qp3', label: 'Leaderboard', value: 'Show me the leaderboard', icon: <Trophy className="w-4 h-4" /> },
];

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY TILES COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CategoryTilesProps {
    onCategorySelect: (category: Category) => void;
}

export const CategoryTiles: React.FC<CategoryTilesProps> = ({ onCategorySelect }) => {
    // Guard against empty categories
    if (!BARISTA_CATEGORIES || BARISTA_CATEGORIES.length === 0) {
        return (
            <p className="text-sm text-gray-500 text-center py-4">
                No categories available
            </p>
        );
    }

    return (
        <div
            className="grid grid-cols-5 gap-2"
            role="group"
            aria-label="BARISTA category selection"
        >
            {BARISTA_CATEGORIES.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onCategorySelect(category)}
                    aria-label={`${category.label}: ${category.description}`}
                    className={cn(
                        'flex flex-col items-center justify-center p-3 rounded-xl',
                        'bg-gradient-to-br', category.gradient,
                        'text-white shadow-md hover:shadow-lg',
                        'transform hover:scale-105 active:scale-95',
                        'transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2'
                    )}
                >
                    <span className="text-xl mb-1" aria-hidden="true">{category.emoji}</span>
                    <span className="text-[10px] font-semibold tracking-wide">{category.label}</span>
                </button>
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY EXPANDED VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface CategoryExpandedProps {
    category: Category;
    onBack: () => void;
    onSuggestionSelect: (suggestion: QuickSuggestion) => void;
}

export const CategoryExpanded: React.FC<CategoryExpandedProps> = ({
    category,
    onBack,
    onSuggestionSelect
}) => {
    // Guard against invalid category
    if (!category || !category.suggestions) {
        return (
            <div className="text-center py-4">
                <p className="text-sm text-gray-500">Category not available</p>
                <button
                    onClick={onBack}
                    className="mt-2 text-sm text-amber-600 hover:underline"
                >
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    aria-label="Go back to categories"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                </button>
                <div className={cn(
                    'p-2 rounded-lg bg-gradient-to-br',
                    category.gradient,
                    'text-white'
                )}>
                    {category.icon}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">{category.emoji} {category.label}</h3>
                    <p className="text-xs text-gray-500">{category.description}</p>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Quick Suggestions */}
            <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quick Suggestions
                </p>
                <div className="grid grid-cols-2 gap-2">
                    {category.suggestions.map((suggestion) => (
                        <button
                            key={suggestion.id}
                            onClick={() => onSuggestionSelect(suggestion)}
                            className={cn(
                                'flex items-center gap-2 p-3 rounded-xl',
                                'bg-white border border-gray-200',
                                'text-left text-sm text-gray-700',
                                'hover:bg-gray-50 hover:border-gray-300',
                                'transition-all duration-150',
                                'group'
                            )}
                        >
                            <div className="p-1.5 bg-gray-100 rounded-md text-gray-500 group-hover:bg-gradient-to-br group-hover:text-white"
                                style={{
                                    backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                                }}
                            >
                                {suggestion.icon}
                            </div>
                            <span className="font-medium truncate">{suggestion.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Helper text */}
            <p className="text-xs text-gray-400 text-center">
                Or type your question below...
            </p>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// QUICK PICKS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface QuickPicksProps {
    picks: QuickSuggestion[];
    onSelect: (pick: QuickSuggestion) => void;
}

export const QuickPicks: React.FC<QuickPicksProps> = ({ picks, onSelect }) => {
    // Guard against empty picks
    if (!picks || picks.length === 0) {
        return null;
    }

    return (
        <div
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
            role="group"
            aria-label="Quick pick suggestions"
        >
            {picks.map((pick) => (
                <button
                    key={pick.id}
                    onClick={() => onSelect(pick)}
                    aria-label={pick.label}
                    className={cn(
                        'inline-flex items-center gap-2 px-3 py-2 rounded-full',
                        'bg-white border border-gray-200 shadow-sm',
                        'text-sm font-medium text-gray-700',
                        'hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700',
                        'transition-all duration-150 whitespace-nowrap',
                        'focus:outline-none focus:ring-2 focus:ring-emerald-300'
                    )}
                >
                    <span className="text-gray-400" aria-hidden="true">{pick.icon}</span>
                    {pick.label}
                    <ArrowRight className="w-3 h-3 text-gray-300" aria-hidden="true" />
                </button>
            ))}
        </div>
    );
};
