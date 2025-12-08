import React from 'react';
import {
    Trophy,
    TrendingUp,
    Target,
    Award,
    Star,
    Zap,
    BookOpen,
    MessageSquare,
    Sparkles,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

// ═══════════════════════════════════════════════════════════════════════════
// GROWTH REPORT — Personal learning journey visualization
// Progress tracking with achievements and recommendations
// ═══════════════════════════════════════════════════════════════════════════

interface ProgressItem {
    category: string;
    icon: string;
    completed: number;
    total: number;
    color: string;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    earned: boolean;
    earnedAt?: string;
}

interface GrowthReportProps {
    progress?: ProgressItem[];
    achievements?: Achievement[];
    recommendedSessionIds?: string[];
    className?: string;
}

const DEFAULT_PROGRESS: ProgressItem[] = [
    { category: 'Product Craft', icon: '🎯', completed: 8, total: 12, color: 'bg-rose-500' },
    { category: 'Healthcare', icon: '🏥', completed: 4, total: 8, color: 'bg-blue-500' },
    { category: 'Internal Playbook', icon: '📘', completed: 6, total: 10, color: 'bg-purple-500' },
    { category: 'Leadership', icon: '👑', completed: 2, total: 5, color: 'bg-amber-500' },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-session',
        title: 'First Session',
        description: 'Watched your first FTLOP session',
        icon: <Star className="w-5 h-5" />,
        earned: true,
        earnedAt: '2024-01-15',
    },
    {
        id: 'multi-topic',
        title: 'Multi-Topic Explorer',
        description: 'Watched sessions from 3+ categories',
        icon: <BookOpen className="w-5 h-5" />,
        earned: true,
        earnedAt: '2024-02-20',
    },
    {
        id: 'streak-warrior',
        title: 'Streak Warrior',
        description: 'Maintained a 7-day learning streak',
        icon: <Zap className="w-5 h-5" />,
        earned: true,
        earnedAt: '2024-03-01',
    },
    {
        id: 'community-contributor',
        title: 'Community Contributor',
        description: 'Posted 5+ comments on sessions',
        icon: <MessageSquare className="w-5 h-5" />,
        earned: true,
    },
    {
        id: 'topic-champion',
        title: 'Topic Champion',
        description: 'Complete all sessions in one category',
        icon: <Trophy className="w-5 h-5" />,
        earned: false,
    },
    {
        id: 'master-learner',
        title: 'Master Learner',
        description: 'Watch 20+ sessions',
        icon: <Award className="w-5 h-5" />,
        earned: false,
    },
];

export const GrowthReport: React.FC<GrowthReportProps> = ({
    progress = DEFAULT_PROGRESS,
    achievements = DEFAULT_ACHIEVEMENTS,
    className,
}) => {
    const totalCompleted = progress.reduce((sum, p) => sum + p.completed, 0);
    const totalSessions = progress.reduce((sum, p) => sum + p.total, 0);
    const overallProgress = Math.round((totalCompleted / totalSessions) * 100);

    const earnedAchievements = achievements.filter(a => a.earned);
    const upcomingAchievements = achievements.filter(a => !a.earned);

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header Card */}
            <Card className="p-6 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white overflow-hidden relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Your FTLOP Journey</h2>
                            <p className="text-white/70 text-sm">Learning progress report</p>
                        </div>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-4xl font-bold">{overallProgress}%</p>
                            <p className="text-white/70">Overall progress</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-semibold">{totalCompleted}/{totalSessions}</p>
                            <p className="text-white/70">Sessions completed</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Category Progress */}
            <Card className="p-5">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-rose-500" />
                    Topics Explored
                </h3>
                <div className="space-y-4">
                    {progress.map((item, idx) => {
                        const percent = Math.round((item.completed / item.total) * 100);
                        return (
                            <div key={idx}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{item.icon}</span>
                                        <span className="font-medium text-gray-900">{item.category}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {item.completed}/{item.total}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            item.color
                                        )}
                                        style={{
                                            width: `${percent}%`,
                                            animationDelay: `${idx * 100}ms`,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Achievements */}
            <Card className="p-5">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Achievements
                    <Badge variant="success" size="sm">{earnedAchievements.length} earned</Badge>
                </h3>

                {/* Earned Achievements */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {earnedAchievements.map(achievement => (
                        <div
                            key={achievement.id}
                            className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 text-center group hover:shadow-md transition-all"
                        >
                            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                                {achievement.icon}
                            </div>
                            <p className="font-medium text-sm text-gray-900">{achievement.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{achievement.description}</p>
                        </div>
                    ))}
                </div>

                {/* Upcoming Achievements */}
                {upcomingAchievements.length > 0 && (
                    <>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Up next</p>
                        <div className="space-y-2">
                            {upcomingAchievements.slice(0, 2).map(achievement => (
                                <div
                                    key={achievement.id}
                                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                                >
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                                        {achievement.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-600">{achievement.title}</p>
                                        <p className="text-xs text-gray-400 truncate">{achievement.description}</p>
                                    </div>
                                    <Sparkles className="w-4 h-4 text-gray-300" />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Card>

            {/* Recommended Next */}
            <Card className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Recommended for You
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                    Based on your learning history, we think you'll love these sessions:
                </p>
                <div className="space-y-2">
                    <div className="p-3 bg-white rounded-lg shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-lg">
                            🎯
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">Advanced Prioritization Frameworks</p>
                            <p className="text-xs text-gray-400">Product Craft • 45 min</p>
                        </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-lg">
                            📊
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">Data-Driven Decision Making</p>
                            <p className="text-xs text-gray-400">Metrics • 35 min</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default GrowthReport;
