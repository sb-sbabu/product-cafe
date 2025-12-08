import React, { useState } from 'react';
import {
    Mic,
    Calendar,
    Clock,
    Play,
    ArrowRight,
    ChevronRight,
    Lightbulb,
    Star,
    ExternalLink,
    Bell,
    ArrowUp,
    TrendingUp,
    BarChart3,
    Archive,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useLOPStore } from '../../stores/lopStore';
import { InspireModal } from './components/InspireModal';
import type { LOPSession, LOPLearningPath } from '../../lib/lop/types';

interface LOPHubPageProps {
    onNavigate?: (path: string, params?: Record<string, string>) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// FTLOP HUB PAGE — For The Love Of Product
// Where product people gather
// 99.54 HCI Premium Design
// ═══════════════════════════════════════════════════════════════════════════

export const LOPHubPage: React.FC<LOPHubPageProps> = ({ onNavigate }) => {
    const {
        getNextSession,
        getRecentSessions,
        learningPaths,
        topicSuggestions,
        upvoteTopic,
        getPathProgress,
    } = useLOPStore();

    const nextSession = getNextSession();
    const recentSessions = getRecentSessions(3);
    const activePaths = learningPaths.filter(p => p.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
    const topTopics = [...topicSuggestions].sort((a, b) => b.upvotes - a.upvotes).slice(0, 3);

    // InspireModal state
    const [isInspireModalOpen, setIsInspireModalOpen] = useState(false);

    return (
        <div className="max-w-5xl mx-auto py-8 lg:py-10 space-y-12 animate-fade-in">

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* HERO — LOP Introduction */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <header className="text-center space-y-4 pb-8 border-b border-gray-100">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-100 to-amber-100 rounded-full">
                    <Mic className="w-5 h-5 text-rose-500" />
                    <span className="text-sm font-semibold text-rose-700">LOP</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    For The Love Of Product
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Where product people gather to share, learn, and grow together.
                </p>
                <p className="text-sm text-gray-400">
                    Monthly talks about the craft • <strong>12 sessions and counting</strong>
                </p>
            </header>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* NEXT SESSION — Hero Card */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {nextSession && (
                <section>
                    <SectionHeader title="Next Session" icon={Calendar} />
                    <NextSessionHero
                        session={nextSession}
                        onNavigate={onNavigate}
                    />
                </section>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* RECENT SESSIONS — 3 Cards */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section>
                <SectionHeader
                    title="Recent Sessions"
                    icon={Play}
                    action={{ label: 'View All', onClick: () => onNavigate?.('lop-archive') }}
                />
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                    {recentSessions.map((session, idx) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            onClick={() => onNavigate?.('lop-session', { slug: session.slug })}
                            delay={idx * 100}
                        />
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* LEARNING PATHS — Curated Collections */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section>
                <SectionHeader title="Curated Paths" icon={Star} />
                <div className="space-y-3 mt-4">
                    {activePaths.map((path) => (
                        <PathCard
                            key={path.id}
                            path={path}
                            progress={getPathProgress(path.id)}
                            onClick={() => onNavigate?.('lop-path', { slug: path.slug })}
                        />
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TRENDING TOPICS — Community Suggestions */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section>
                <SectionHeader
                    title="Topic Suggestions"
                    icon={TrendingUp}
                    action={{ label: 'Suggest Topic', onClick: () => { } }}
                />
                <div className="space-y-3 mt-4">
                    {topTopics.map((topic) => (
                        <TopicCard
                            key={topic.id}
                            topic={topic}
                            onUpvote={() => upvoteTopic(topic.id)}
                        />
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* QUICK LINKS — Analytics, Archive */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section>
                <SectionHeader title="Quick Links" icon={ExternalLink} />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                    <QuickLinkCard
                        icon={Archive}
                        label="Session Archive"
                        description="Browse all past sessions"
                        onClick={() => onNavigate?.('lop-archive')}
                    />
                    <QuickLinkCard
                        icon={BarChart3}
                        label="Analytics Dashboard"
                        description="Engagement & insights"
                        onClick={() => onNavigate?.('lop-analytics')}
                    />
                    <QuickLinkCard
                        icon={Star}
                        label="Top Rated"
                        description="Most loved sessions"
                        onClick={() => onNavigate?.('lop-archive')}
                    />
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* CONTRIBUTE — CTAs */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section>
                <SectionHeader title="Contribute" icon={Lightbulb} />
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <ContributeCard
                        icon={Lightbulb}
                        title="Suggest a Topic"
                        description="What should we cover next? Vote on upcoming topics."
                        buttonLabel="Submit Idea"
                        color="amber"
                        onClick={() => setIsInspireModalOpen(true)}
                    />
                    <ContributeCard
                        icon={Mic}
                        title="Volunteer to Speak"
                        description="Share your expertise with the product community."
                        buttonLabel="Learn More"
                        color="rose"
                    />
                </div>
            </section>

            {/* Inspire Modal */}
            <InspireModal
                isOpen={isInspireModalOpen}
                onClose={() => setIsInspireModalOpen(false)}
                onSubmit={(data) => {
                    console.log('Topic submitted:', data);
                    setIsInspireModalOpen(false);
                }}
            />
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface SectionHeaderProps {
    title: string;
    icon: React.ElementType;
    action?: { label: string; onClick: () => void };
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon: Icon, action }) => (
    <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Icon className="w-5 h-5 text-rose-500" />
            {title}
        </h2>
        {action && (
            <button
                onClick={action.onClick}
                className="text-sm text-cafe-600 hover:text-cafe-700 font-medium flex items-center gap-1"
            >
                {action.label} <ArrowRight className="w-4 h-4" />
            </button>
        )}
    </div>
);

// Next Session Hero
interface NextSessionHeroProps {
    session: LOPSession;
    onNavigate?: (path: string, params?: Record<string, string>) => void;
}

const NextSessionHero: React.FC<NextSessionHeroProps> = ({ session, onNavigate }) => {
    const date = new Date(session.sessionDate);
    const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    // Calculate countdown
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const daysUntil = Math.floor(diff / (1000 * 60 * 60 * 24));

    const handleAddToCalendar = () => {
        // Generate .ics file
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(date.getTime() + (session.duration || 60) * 60000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:LOP #${session.sessionNumber}: ${session.title}
DESCRIPTION:${session.description}
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lop-${session.sessionNumber}.ics`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Card className="p-6 mt-4 bg-gradient-to-br from-rose-50 via-amber-50/50 to-white border-rose-100">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex-1 space-y-4">
                    {/* Date & Countdown */}
                    <div className="flex items-center gap-3 text-sm">
                        <span className="font-medium text-rose-600">{dateStr} • {timeStr}</span>
                        {daysUntil > 0 && (
                            <Badge variant="warning" size="sm">
                                {daysUntil} day{daysUntil > 1 ? 's' : ''} away
                            </Badge>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <p className="text-xs text-gray-400 mb-1">LOP #{session.sessionNumber}</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {session.title}
                        </h3>
                        {session.subtitle && (
                            <p className="text-gray-600 mt-1">{session.subtitle}</p>
                        )}
                    </div>

                    {/* Speaker */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-amber-500 flex items-center justify-center text-white font-bold">
                            {session.speaker.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{session.speaker.name}</p>
                            <p className="text-sm text-gray-500">{session.speaker.title}</p>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{session.duration} min + Q&A</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:w-48">
                    <Button
                        variant="primary"
                        size="md"
                        leftIcon={<Calendar className="w-4 h-4" />}
                        onClick={handleAddToCalendar}
                        className="bg-rose-500 hover:bg-rose-600"
                    >
                        Add to Calendar
                    </Button>
                    <Button
                        variant="outline"
                        size="md"
                        leftIcon={<Bell className="w-4 h-4" />}
                    >
                        Remind Me
                    </Button>
                    <Button
                        variant="ghost"
                        size="md"
                        leftIcon={<ExternalLink className="w-4 h-4" />}
                    >
                        Join Link
                    </Button>
                </div>
            </div>
        </Card>
    );
};

// Session Card
interface SessionCardProps {
    session: LOPSession;
    onClick?: () => void;
    delay?: number;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onClick, delay = 0 }) => {
    const date = new Date(session.sessionDate);
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return (
        <Card
            isClickable
            isHoverable
            onClick={onClick}
            className="p-4 animate-fade-in group"
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
        >
            {/* Thumbnail Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-rose-100 to-amber-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Play className="w-5 h-5 text-rose-600 ml-0.5" fill="currentColor" />
                    </div>
                </div>
                <div className="text-3xl opacity-30">🎙️</div>
            </div>

            {/* Content */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>LOP #{session.sessionNumber}</span>
                    <span>•</span>
                    <span>{monthYear}</span>
                </div>
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-rose-600 transition-colors">
                    {session.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{session.speaker.name}</span>
                    <span>•</span>
                    <span>{session.duration} min</span>
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                <span>{session.viewCount} views</span>
                <span>{session.likeCount} likes</span>
                <span>{session.discussionCount} discussions</span>
            </div>
        </Card>
    );
};

// Learning Path Card
interface PathCardProps {
    path: LOPLearningPath;
    progress: { completed: number; total: number; percent: number };
    onClick?: () => void;
}

const PathCard: React.FC<PathCardProps> = ({ path, progress, onClick }) => {
    const hours = Math.floor(path.totalDuration / 60);
    const mins = path.totalDuration % 60;
    const durationStr = hours > 0 ? `~${hours}h ${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;

    return (
        <Card
            isClickable
            isHoverable
            onClick={onClick}
            className="p-4 flex items-center gap-4 group"
        >
            {/* Icon */}
            <div className="text-3xl">{path.icon}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                    {path.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-1">{path.description}</p>
            </div>

            {/* Meta */}
            <div className="text-right text-sm text-gray-400 shrink-0">
                <p>{path.sessionIds.length} sessions</p>
                <p>{durationStr}</p>
            </div>

            {/* Progress or Start */}
            <div className="shrink-0">
                {progress.percent > 0 ? (
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-rose-400 to-amber-400 rounded-full transition-all"
                                style={{ width: `${progress.percent}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-500">{progress.percent}%</span>
                    </div>
                ) : (
                    <Button variant="outline" size="sm">
                        Start <ChevronRight className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </Card>
    );
};

// Topic Card
interface TopicCardProps {
    topic: {
        id: string;
        title: string;
        description?: string;
        submittedBy: { name: string };
        status: string;
        upvotes: number;
    };
    onUpvote: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onUpvote }) => {
    const statusColors: Record<string, string> = {
        'submitted': 'bg-gray-100 text-gray-600',
        'under-review': 'bg-amber-100 text-amber-700',
        'scheduled': 'bg-emerald-100 text-emerald-700',
        'declined': 'bg-red-100 text-red-700',
    };
    const statusLabels: Record<string, string> = {
        'submitted': 'Submitted',
        'under-review': 'Under Review',
        'scheduled': 'Scheduled',
        'declined': 'Declined',
    };

    return (
        <Card className="p-4 flex items-start gap-4">
            {/* Vote */}
            <div className="flex flex-col items-center gap-1">
                <button
                    onClick={onUpvote}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-colors"
                >
                    <ArrowUp className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-gray-700">{topic.upvotes}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">{topic.title}</h3>
                {topic.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{topic.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{topic.submittedBy.name}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[topic.status])}>
                        {statusLabels[topic.status]}
                    </span>
                </div>
            </div>
        </Card>
    );
};

// Contribute Card
interface ContributeCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    buttonLabel: string;
    color: 'amber' | 'rose';
    onClick?: () => void;
}

const ContributeCard: React.FC<ContributeCardProps> = ({ icon: Icon, title, description, buttonLabel, color, onClick }) => {
    const bgColors = {
        amber: 'from-amber-50 to-amber-100/50 border-amber-100',
        rose: 'from-rose-50 to-rose-100/50 border-rose-100',
    };
    const iconColors = {
        amber: 'text-amber-500',
        rose: 'text-rose-500',
    };
    const btnColors = {
        amber: 'text-amber-700 hover:text-amber-800',
        rose: 'text-rose-700 hover:text-rose-800',
    };

    return (
        <Card className={cn("p-5 bg-gradient-to-br border", bgColors[color])}>
            <div className="flex items-start gap-4">
                <Icon className={cn("w-6 h-6 mt-0.5", iconColors[color])} />
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                    <button
                        onClick={onClick}
                        className={cn("mt-3 text-sm font-medium flex items-center gap-1 transition-colors", btnColors[color])}
                    >
                        {buttonLabel} <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Card>
    );
};

// Quick Link Card
interface QuickLinkCardProps {
    icon: React.ElementType;
    label: string;
    description: string;
    onClick?: () => void;
}

const QuickLinkCard: React.FC<QuickLinkCardProps> = ({ icon: Icon, label, description, onClick }) => (
    <Card
        isClickable
        isHoverable
        onClick={onClick}
        className="p-4 group"
    >
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-rose-100 to-amber-100 group-hover:from-rose-200 group-hover:to-amber-200 transition-colors">
                <Icon className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 group-hover:text-rose-600 transition-colors">{label}</h4>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-rose-400 transition-colors" />
        </div>
    </Card>
);

export default LOPHubPage;
