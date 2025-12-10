/**
 * SmartSummary - Personalized book summaries based on role/interests
 * 
 * Features:
 * - Role-based summary variants
 * - Key concepts extraction
 * - Action items generator
 * - Time-based summaries (5min, 15min, 30min)
 */

import React, { useState, useMemo } from 'react';
import {
    FileText, Clock, Target, Zap, BookOpen,
    User, Briefcase, Users, ChevronRight, Sparkles
} from 'lucide-react';
import { useLibraryStore } from '../libraryStore';
import { cn } from '../../../lib/utils';

interface SmartSummaryProps {
    bookId: string;
    className?: string;
}

type SummaryLength = 'quick' | 'standard' | 'deep';
type ReaderRole = 'new-pm' | 'senior-pm' | 'tech-pm' | 'leader';

const SUMMARY_LENGTHS: {
    value: SummaryLength;
    label: string;
    time: string;
    icon: React.ReactNode
}[] = [
        { value: 'quick', label: 'Quick Take', time: '2 min', icon: <Zap className="w-4 h-4" /> },
        { value: 'standard', label: 'Key Points', time: '7 min', icon: <FileText className="w-4 h-4" /> },
        { value: 'deep', label: 'Deep Dive', time: '15 min', icon: <BookOpen className="w-4 h-4" /> },
    ];

const READER_ROLES: { value: ReaderRole; label: string; icon: React.ReactNode }[] = [
    { value: 'new-pm', label: 'New to PM', icon: <User className="w-4 h-4" /> },
    { value: 'senior-pm', label: 'Senior PM', icon: <Briefcase className="w-4 h-4" /> },
    { value: 'tech-pm', label: 'Technical PM', icon: <Target className="w-4 h-4" /> },
    { value: 'leader', label: 'PM Leader', icon: <Users className="w-4 h-4" /> },
];

export const SmartSummary: React.FC<SmartSummaryProps> = ({
    bookId,
    className
}) => {
    const { books, earnCredits } = useLibraryStore();
    const book = books.find(b => b.id === bookId);

    const [summaryLength, setSummaryLength] = useState<SummaryLength>('standard');
    const [readerRole, setReaderRole] = useState<ReaderRole>('senior-pm');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);

    // Generate personalized summary based on selections
    const personalizedSummary = useMemo(() => {
        if (!book) return null;

        // Base content
        const intro = book.aiSummary || book.description;
        const takeaways = book.keyTakeaways;

        // Role-specific framing
        const roleFraming: Record<ReaderRole, string> = {
            'new-pm': `As someone new to product management, focus on the foundational concepts in "${book.title}". The author emphasizes building core PM skills through practical frameworks.`,
            'senior-pm': `For experienced PMs, "${book.title}" offers advanced strategies and nuanced perspectives on evolving your craft. Pay attention to the chapters on scaling and leadership.`,
            'tech-pm': `Technical PMs will find valuable insights on balancing technical depth with product strategy. The book addresses working with engineering teams and technical decision-making.`,
            'leader': `As a PM leader, focus on the organizational and cultural aspects covered. The book provides frameworks for building and scaling product teams.`
        };

        return {
            roleIntro: roleFraming[readerRole],
            mainSummary: intro,
            takeaways: takeaways?.slice(0, summaryLength === 'quick' ? 3 : summaryLength === 'standard' ? 5 : takeaways.length)
        };
    }, [book, readerRole, summaryLength]);

    const generateActionItems = useMemo(() => {
        if (!book) return [];

        const baseActions = [
            'Identify one concept to apply this week',
            'Share key insights with your team',
            'Create a personal summary document',
            'Connect ideas to a current project',
            'Schedule a discussion with a mentor',
        ];

        const roleActions: Record<ReaderRole, string[]> = {
            'new-pm': [
                'Create a glossary of new PM terms learned',
                'Shadow a senior PM applying these concepts',
            ],
            'senior-pm': [
                'Identify outdated practices to replace',
                'Mentor others on these frameworks',
            ],
            'tech-pm': [
                'Map concepts to technical architecture',
                'Create technical implementation guidelines',
            ],
            'leader': [
                'Evaluate team processes against these principles',
                'Plan team training on key concepts',
            ],
        };

        return [...baseActions.slice(0, 3), ...roleActions[readerRole]];
    }, [book, readerRole]);

    const handleGenerateSummary = async () => {
        setIsGenerating(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setGeneratedSummary(`This is a personalized ${summaryLength} summary for ${readerRole}s.`);

        // Award credits
        earnCredits(
            'article_read',
            `Generated smart summary for "${book?.title}"`,
            { bookId, role: readerRole, length: summaryLength }
        );

        setIsGenerating(false);
    };

    if (!book) {
        return <div className="p-4 text-gray-500">Book not found</div>;
    }

    return (
        <div className={cn("bg-white rounded-2xl border border-gray-100 overflow-hidden", className)}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Smart Summary</h3>
                        <p className="text-xs text-gray-500">Personalized for your role and time</p>
                    </div>
                </div>
            </div>

            {/* Configuration */}
            <div className="p-6 border-b border-gray-100 space-y-4">
                {/* Summary Length */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Summary Length
                    </label>
                    <div className="flex gap-2">
                        {SUMMARY_LENGTHS.map(length => (
                            <button
                                key={length.value}
                                onClick={() => setSummaryLength(length.value)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border transition-all",
                                    summaryLength === length.value
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                )}
                            >
                                {length.icon}
                                <div className="text-left">
                                    <p className="text-sm font-medium">{length.label}</p>
                                    <p className="text-[10px] opacity-70">{length.time}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reader Role */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                        Tailor for Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {READER_ROLES.map(role => (
                            <button
                                key={role.value}
                                onClick={() => setReaderRole(role.value)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                                    readerRole === role.value
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                )}
                            >
                                {role.icon}
                                <span className="text-sm font-medium">{role.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Generated Summary */}
            <div className="p-6">
                {personalizedSummary && (
                    <div className="space-y-4">
                        {/* Role-specific intro */}
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-semibold text-emerald-800">For You</span>
                            </div>
                            <p className="text-sm text-emerald-700">{personalizedSummary.roleIntro}</p>
                        </div>

                        {/* Main summary */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Overview</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {personalizedSummary.mainSummary}
                            </p>
                        </div>

                        {/* Key Takeaways */}
                        {personalizedSummary.takeaways && personalizedSummary.takeaways.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Takeaways</h4>
                                <ul className="space-y-2">
                                    {personalizedSummary.takeaways.map((takeaway, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                            <ChevronRight className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <span>{takeaway}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Action Items */}
                        <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                Action Items
                            </h4>
                            <ul className="space-y-2">
                                {generateActionItems.slice(0, summaryLength === 'quick' ? 3 : 5).map((action, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-gray-600">{action}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartSummary;
