import React from 'react';
import {
    ArrowRight,
    Activity,
    Users,
    BookOpen,
    Lightbulb,
    Calendar,
    ChevronRight,
    Zap,
    MessageSquare,
    TrendingUp,
    ArrowUp,
    Mic,
    BarChart3,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/utils';
import { usePageLoading } from '../../hooks';
import { usePointsStore } from '../../stores/pointsStore';
import { useLevelStore } from '../../stores/levelStore';
import { useBadgeStore } from '../../stores/badgeStore';

interface HomePageProps {
    onNavigate?: (section: string) => void;
    userName?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME PAGE — Clean, Meaningful, No Noise
// Cards-based layout that informs and guides action
// ═══════════════════════════════════════════════════════════════════════════

export const HomePage: React.FC<HomePageProps> = ({
    onNavigate,
    userName = 'Natasha',
}) => {
    const isLoading = usePageLoading(200);
    const firstName = userName.split(' ')[0];
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // Store data
    const { totalPoints } = usePointsStore();
    const { currentLevel } = useLevelStore();
    const { earnedBadges } = useBadgeStore();
    const currentStreak = 5; // Mock

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto py-8 space-y-8 animate-fade-in">
                <Skeleton width="40%" height={40} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton height={250} className="lg:col-span-2" />
                    <Skeleton height={250} />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 lg:py-10 space-y-10 animate-fade-in">

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* HERO — Clean Greeting */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <header className="text-center space-y-2 pb-6 border-b border-gray-100">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {greeting}, {firstName} 👋
                </h1>
                <p className="text-gray-500">
                    Your product hub for knowledge, connections, and intelligence
                </p>
            </header>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MAIN GRID — Two Columns */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ─────────────────────────────────────────────────────────── */}
                {/* LEFT COLUMN — 2/3 */}
                {/* ─────────────────────────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-8">

                    {/* QUICK ACCESS CARDS */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <QuickCard
                                icon={Activity}
                                label="PULSE Dashboard"
                                description="Market signals & competitors"
                                onClick={() => onNavigate?.('pulse')}
                                color="emerald"
                            />
                            <QuickCard
                                icon={Mic}
                                label="LOP Sessions"
                                description="For The Love of Product"
                                onClick={() => onNavigate?.('lop')}
                                color="rose"
                            />
                            <QuickCard
                                icon={BarChart3}
                                label="LOP Analytics"
                                description="Engagement insights"
                                onClick={() => onNavigate?.('lop-analytics')}
                                color="violet"
                            />
                            <QuickCard
                                icon={Users}
                                label="Find an Expert"
                                description="Connect with specialists"
                                onClick={() => onNavigate?.('community')}
                                color="cyan"
                            />
                            <QuickCard
                                icon={BookOpen}
                                label="Learning Library"
                                description="Courses & resources"
                                onClick={() => onNavigate?.('library')}
                                color="purple"
                            />
                            <QuickCard
                                icon={Zap}
                                label="Grab & Go"
                                description="Quick links & tools"
                                onClick={() => onNavigate?.('grab-and-go')}
                                color="amber"
                            />
                        </div>
                    </section>

                    {/* USEFUL TOOLS — Healthcare-Focused Utility Cards */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Useful Tools</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            <UtilityCard
                                icon="🏥"
                                title="Healthcare Intel"
                                subtitle="CMS & Payer News"
                                onClick={() => onNavigate?.('pulse')}
                                color="from-blue-50 to-cyan-50 border-blue-100"
                            />
                            <UtilityCard
                                icon="📋"
                                title="Payer Directory"
                                subtitle="Top 50 Payers"
                                onClick={() => onNavigate?.('library')}
                                color="from-emerald-50 to-teal-50 border-emerald-100"
                            />
                            <UtilityCard
                                icon="⚖️"
                                title="Regulatory Updates"
                                subtitle="HIPAA, CMS Rules"
                                onClick={() => onNavigate?.('library')}
                                color="from-amber-50 to-orange-50 border-amber-100"
                            />
                            <UtilityCard
                                icon="📊"
                                title="Team Metrics"
                                subtitle="Sprint & OKRs"
                                onClick={() => onNavigate?.('admin')}
                                color="from-purple-50 to-violet-50 border-purple-100"
                            />
                            <UtilityCard
                                icon="🔗"
                                title="Integration Docs"
                                subtitle="APIs & Guides"
                                onClick={() => onNavigate?.('library')}
                                color="from-rose-50 to-pink-50 border-rose-100"
                            />
                        </div>
                    </section>

                    {/* TRENDING DISCUSSIONS — Community Engagement */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-rose-500" />
                                Trending Discussions
                            </h2>
                            <button
                                onClick={() => onNavigate?.('community')}
                                className="text-sm text-cafe-600 hover:text-cafe-700 font-medium flex items-center gap-1"
                            >
                                View All <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <DiscussionCard
                                title="How are we handling the 2025 CMS prior auth mandate?"
                                author="Sarah Chen"
                                votes={24}
                                comments={12}
                                tag="Regulatory"
                                isHot
                            />
                            <DiscussionCard
                                title="Best practices for payer APIs - lessons learned"
                                author="Michael Torres"
                                votes={18}
                                comments={8}
                                tag="Engineering"
                            />
                            <DiscussionCard
                                title="Waystar's new AI platform: competitive threat or opportunity?"
                                author="Jessica Park"
                                votes={15}
                                comments={6}
                                tag="Strategy"
                            />
                        </div>
                    </section>

                    {/* THIS WEEK */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            This Week
                        </h2>
                        <Card className="p-0 divide-y divide-gray-100">
                            <EventRow day="Tue" title="LOP: Prior Auth Deep Dive" time="2:00 PM" />
                            <EventRow day="Thu" title="Product All-Hands" time="10:00 AM" />
                            <EventRow day="Fri" title="CMS Deadline: FHIR R4" time="EOD" isDeadline />
                        </Card>
                    </section>
                </div>

                {/* ─────────────────────────────────────────────────────────── */}
                {/* RIGHT COLUMN — 1/3 */}
                {/* ─────────────────────────────────────────────────────────── */}
                <div className="space-y-6">

                    {/* PROFILE CARD */}
                    <Card className="p-5 bg-gradient-to-br from-cafe-50 to-amber-50/50">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cafe-400 to-cafe-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-cafe-500/30">
                                {firstName.charAt(0)}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{userName}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-lg">{currentLevel?.icon || '☕'}</span>
                                    <span className="text-sm text-gray-600">{currentLevel?.name || 'Café Newcomer'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="p-3 bg-white/70 rounded-lg">
                                <p className="text-xl font-bold text-cafe-600">{totalPoints.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Credits</p>
                            </div>
                            <div className="p-3 bg-white/70 rounded-lg">
                                <p className="text-xl font-bold text-amber-600">{currentStreak}</p>
                                <p className="text-xs text-gray-500">Streak</p>
                            </div>
                            <div className="p-3 bg-white/70 rounded-lg">
                                <p className="text-xl font-bold text-purple-600">{earnedBadges.length}</p>
                                <p className="text-xs text-gray-500">Badges</p>
                            </div>
                        </div>

                        <button
                            onClick={() => onNavigate?.('credits')}
                            className="w-full mt-4 py-2.5 text-sm font-medium text-cafe-700 hover:text-cafe-800 flex items-center justify-center gap-1 bg-white/50 rounded-lg hover:bg-white/80 transition-colors"
                        >
                            View Rewards <ChevronRight className="w-4 h-4" />
                        </button>
                    </Card>

                    {/* AI INSIGHT */}
                    <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50/50 border-violet-100">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-violet-100">
                                <Lightbulb className="w-4 h-4 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">AI Insight</p>
                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                    Waystar's new AI platform could impact ~15% of Availity's prior auth volume. Consider reviewing competitive positioning.
                                </p>
                                <button
                                    onClick={() => onNavigate?.('pulse')}
                                    className="text-xs text-violet-600 font-medium mt-2 flex items-center gap-1 hover:text-violet-700"
                                >
                                    Learn more <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* PULSE TEASER */}
                    <Card
                        isClickable
                        isHoverable
                        onClick={() => onNavigate?.('pulse')}
                        className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-100"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-100">
                                    <Activity className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">PULSE Intelligence</p>
                                    <p className="text-xs text-gray-500">14 signals • 3 critical</p>
                                </div>
                            </div>
                            <Badge size="sm" variant="success" className="animate-pulse">Live</Badge>
                        </div>
                    </Card>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* FOOTER — Keyboard Shortcuts */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <footer className="text-center py-6 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono mr-1">⌘K</kbd>
                    Command palette •
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono mx-1">N</kbd>
                    Notifications
                </p>
            </footer>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface QuickCardProps {
    icon: React.ElementType;
    label: string;
    description: string;
    onClick?: () => void;
    color: 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose' | 'violet';
}

const QuickCard: React.FC<QuickCardProps> = ({ icon: Icon, label, description, onClick, color }) => {
    const styles = {
        emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
        cyan: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100',
        purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
        amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
        rose: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100',
        violet: 'bg-violet-50 text-violet-600 group-hover:bg-violet-100',
    };

    return (
        <button
            onClick={onClick}
            className="group p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-md transition-all text-left"
        >
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors", styles[color])}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="font-medium text-gray-900 group-hover:text-gray-800">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </button>
    );
};

interface DiscussionCardProps {
    title: string;
    author: string;
    votes: number;
    comments: number;
    tag: string;
    isHot?: boolean;
}

const DiscussionCard: React.FC<DiscussionCardProps> = ({ title, author, votes, comments, tag, isHot }) => (
    <Card className="p-4 hover:shadow-md transition-all group cursor-pointer">
        <div className="flex gap-4">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-1 pt-1">
                <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-emerald-500 transition-colors">
                    <ArrowUp className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-gray-700">{votes}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <Badge size="sm" variant={isHot ? 'danger' : 'default'}>{tag}</Badge>
                    {isHot && <span className="text-xs text-rose-500 font-medium">🔥 Hot</span>}
                </div>
                <p className="font-medium text-gray-900 group-hover:text-cafe-700 transition-colors line-clamp-2">
                    {title}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{author}</span>
                    <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {comments} replies
                    </span>
                </div>
            </div>
        </div>
    </Card>
);

interface EventRowProps {
    day: string;
    title: string;
    time: string;
    isDeadline?: boolean;
}

const EventRow: React.FC<EventRowProps> = ({ day, title, time, isDeadline }) => (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
        <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold",
            isDeadline ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
        )}>
            {day}
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 truncate">{title}</p>
            <p className="text-xs text-gray-400">{time}</p>
        </div>
        {isDeadline && <Badge size="sm" variant="danger">Deadline</Badge>}
    </div>
);

interface UtilityCardProps {
    icon: string;
    title: string;
    subtitle: string;
    onClick?: () => void;
    color: string;
}

const UtilityCard: React.FC<UtilityCardProps> = ({ icon, title, subtitle, onClick, color }) => (
    <button
        onClick={onClick}
        className={cn(
            "p-3 rounded-xl border bg-gradient-to-br text-left transition-all hover:shadow-md hover:scale-[1.02] group",
            color
        )}
    >
        <div className="flex items-center gap-3">
            <span className="text-xl">{icon}</span>
            <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{title}</p>
                <p className="text-xs text-gray-500 truncate">{subtitle}</p>
            </div>
        </div>
    </button>
);
