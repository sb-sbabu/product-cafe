import React from 'react';
import { cn } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import { TrendingUp, Flame } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TOPIC CLOUD — Visual representation of topic popularity
// Interactive word cloud with heat coloring
// ═══════════════════════════════════════════════════════════════════════════

interface Topic {
    name: string;
    count: number;
    engagement: number; // 0-100
    trending?: boolean;
}

interface TopicCloudProps {
    topics?: Topic[];
    onSelectTopic?: (topic: string) => void;
    className?: string;
}

// Sample data
const SAMPLE_TOPICS: Topic[] = [
    { name: 'Customer Discovery', count: 8, engagement: 95, trending: true },
    { name: 'Roadmapping', count: 6, engagement: 80 },
    { name: 'Metrics', count: 5, engagement: 75, trending: true },
    { name: 'Stakeholders', count: 5, engagement: 70 },
    { name: 'Strategy', count: 4, engagement: 85 },
    { name: 'AI/ML', count: 4, engagement: 90, trending: true },
    { name: 'Prioritization', count: 4, engagement: 65 },
    { name: 'Healthcare', count: 3, engagement: 60 },
    { name: 'Growth', count: 3, engagement: 55 },
    { name: 'UX Research', count: 3, engagement: 50 },
    { name: 'Leadership', count: 2, engagement: 45 },
    { name: 'Team Culture', count: 2, engagement: 40 },
    { name: 'Onboarding', count: 2, engagement: 35 },
    { name: 'APIs', count: 1, engagement: 30 },
    { name: 'Analytics', count: 1, engagement: 25 },
];

const getTopicSize = (count: number, maxCount: number): string => {
    const ratio = count / maxCount;
    if (ratio >= 0.8) return 'text-2xl font-bold';
    if (ratio >= 0.6) return 'text-xl font-semibold';
    if (ratio >= 0.4) return 'text-lg font-medium';
    if (ratio >= 0.2) return 'text-base';
    return 'text-sm';
};

const getEngagementColor = (engagement: number): string => {
    if (engagement >= 80) return 'from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30';
    if (engagement >= 60) return 'from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20';
    if (engagement >= 40) return 'from-blue-400 to-cyan-500 text-white shadow-lg shadow-blue-500/20';
    if (engagement >= 20) return 'from-purple-100 to-violet-100 text-purple-700';
    return 'from-gray-100 to-gray-50 text-gray-600';
};

export const TopicCloud: React.FC<TopicCloudProps> = ({
    topics = SAMPLE_TOPICS,
    onSelectTopic,
    className,
}) => {
    const maxCount = Math.max(...topics.map(t => t.count), 1);

    // Randomize positions slightly for organic feel
    const shuffledTopics = [...topics].sort(() => Math.random() - 0.5);

    return (
        <Card className={cn("p-5 overflow-hidden", className)}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-rose-500" />
                    Topics by Popularity
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Flame className="w-3 h-3 text-orange-500" />
                    Trending
                </div>
            </div>

            {/* Topic Cloud */}
            <div className="flex flex-wrap gap-2 justify-center items-center min-h-[200px]">
                {shuffledTopics.map((topic, idx) => (
                    <button
                        key={topic.name}
                        onClick={() => onSelectTopic?.(topic.name)}
                        className={cn(
                            "relative px-3 py-1.5 rounded-full bg-gradient-to-r transition-all duration-300 hover:scale-110",
                            getEngagementColor(topic.engagement),
                            getTopicSize(topic.count, maxCount)
                        )}
                        style={{
                            animationDelay: `${idx * 30}ms`,
                        }}
                    >
                        {topic.name}
                        {topic.trending && (
                            <Flame className="absolute -top-1 -right-1 w-3.5 h-3.5 text-orange-500 animate-pulse" />
                        )}
                    </button>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500" />
                    <span className="text-xs text-gray-500">High engagement</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                    <span className="text-xs text-gray-500">Growing</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-200 to-gray-100" />
                    <span className="text-xs text-gray-500">Emerging</span>
                </div>
            </div>
        </Card>
    );
};

export default TopicCloud;
