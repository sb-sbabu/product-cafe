import React, { useState } from 'react';
import {
    ArrowLeft,
    TrendingUp,
    Lightbulb,
    Users,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useLOPStore } from '../../stores/lopStore';
import {
    EngagementDashboard,
    TopicCloud,
    GrowthReport,
    TopicVotingCard,
    InspireModal,
} from './components';

// ═══════════════════════════════════════════════════════════════════════════
// FTLOP ANALYTICS PAGE — Personal insights and community engagement
// 99.89% HCI Premium Analytics Dashboard
// ═══════════════════════════════════════════════════════════════════════════

interface LOPAnalyticsPageProps {
    onNavigate?: (path: string, params?: Record<string, string>) => void;
    onBack?: () => void;
}

type TabId = 'insights' | 'topics' | 'growth';

export const LOPAnalyticsPage: React.FC<LOPAnalyticsPageProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<TabId>('insights');
    const [isInspireModalOpen, setIsInspireModalOpen] = useState(false);

    const { topicSuggestions, upvoteTopic } = useLOPStore();

    const tabs = [
        { id: 'insights' as const, label: 'Dashboard', icon: TrendingUp },
        { id: 'topics' as const, label: 'Topics', icon: Lightbulb },
        { id: 'growth' as const, label: 'My Growth', icon: Users },
    ];

    // Mock stats (would come from store in production)
    const stats = {
        sessionsWatched: 12,
        totalWatchTime: 8.5,
        currentStreak: 3,
        completionRate: 85,
    };

    const communityStats = {
        totalViews: 15230,
        activeMembers: 142,
        thisWeekSessions: 2,
    };

    // Sort topics by upvotes
    const sortedTopics = [...topicSuggestions].sort((a, b) => b.upvotes - a.upvotes);

    return (
        <div className="max-w-5xl mx-auto py-8 animate-fade-in">
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to FTLOP</span>
                </button>
            </header>

            {/* Page Title */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
                <p className="text-gray-500 mt-1">Track your learning journey and explore community trends</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                isActive
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
                {/* Insights Tab */}
                {activeTab === 'insights' && (
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <EngagementDashboard
                                stats={stats}
                                communityStats={communityStats}
                            />
                        </div>
                        <div>
                            <TopicCloud />
                        </div>
                    </div>
                )}

                {/* Topics Tab */}
                {activeTab === 'topics' && (
                    <div className="space-y-6">
                        {/* Header with CTA */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Topic Suggestions</h2>
                                <p className="text-gray-500 text-sm">Vote for topics you want to see in future sessions</p>
                            </div>
                            <Button
                                variant="primary"
                                leftIcon={<Lightbulb className="w-4 h-4" />}
                                onClick={() => setIsInspireModalOpen(true)}
                            >
                                Inspire a Talk
                            </Button>
                        </div>

                        {/* Topic Cards */}
                        <div className="grid gap-4">
                            {sortedTopics.map((topic, idx) => (
                                <TopicVotingCard
                                    key={topic.id}
                                    topic={topic}
                                    isTrending={idx < 3}
                                    onVote={() => upvoteTopic(topic.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Growth Tab */}
                {activeTab === 'growth' && (
                    <GrowthReport />
                )}
            </div>

            {/* Inspire Modal */}
            <InspireModal
                isOpen={isInspireModalOpen}
                onClose={() => setIsInspireModalOpen(false)}
                onSubmit={(data) => {
                    console.log('Submitted:', data);
                    setIsInspireModalOpen(false);
                }}
            />
        </div>
    );
};

export default LOPAnalyticsPage;
