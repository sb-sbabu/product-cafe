import React from 'react';
import {
    ArrowLeft,
    Play,
    Clock,
    CheckCircle2,
    ChevronRight,
    Target,
    Users,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useLOPStore } from '../../stores/lopStore';

interface LOPLearningPathProps {
    slug: string;
    onNavigate?: (path: string, params?: Record<string, string>) => void;
    onBack?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// LEARNING PATH PAGE — Curated session collection with progress
// ═══════════════════════════════════════════════════════════════════════════

export const LOPLearningPath: React.FC<LOPLearningPathProps> = ({ slug, onNavigate, onBack }) => {
    const {
        getPathBySlug,
        getSessionById,
        getPathProgress,
        isSessionCompleted,
    } = useLOPStore();

    const path = getPathBySlug(slug);

    if (!path) {
        return (
            <div className="max-w-3xl mx-auto py-12 text-center">
                <p className="text-gray-500">Learning path not found</p>
                <Button variant="outline" onClick={onBack} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to LOP
                </Button>
            </div>
        );
    }

    const sessions = path.sessionIds.map(id => getSessionById(id)).filter(Boolean);
    const progress = getPathProgress(path.id);
    const hours = Math.floor(path.totalDuration / 60);
    const mins = path.totalDuration % 60;

    // Find next session to watch
    const nextSessionIndex = sessions.findIndex(s => s && !isSessionCompleted(s.id));
    const nextSession = nextSessionIndex >= 0 ? sessions[nextSessionIndex] : null;

    const difficultyColors = {
        beginner: 'bg-emerald-100 text-emerald-700',
        intermediate: 'bg-amber-100 text-amber-700',
        advanced: 'bg-rose-100 text-rose-700',
    };

    return (
        <div className="max-w-3xl mx-auto py-8 animate-fade-in">
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>LOP Home</span>
                </button>
            </header>

            {/* Path Hero */}
            <div className="text-center mb-8">
                <span className="text-5xl mb-4 block">{path.icon}</span>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{path.title}</h1>
                <p className="text-gray-600 max-w-xl mx-auto">{path.description}</p>

                {/* Meta */}
                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {path.sessionIds.length} sessions
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        ~{hours}h {mins > 0 ? `${mins}m` : ''}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {path.targetAudience}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", difficultyColors[path.difficulty])}>
                        {path.difficulty}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <Card className="p-5 mb-8">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Your Progress</span>
                    <span className="text-sm text-gray-500">
                        {progress.completed} of {progress.total} completed
                    </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-rose-400 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${progress.percent}%` }}
                    />
                </div>
                {progress.percent === 100 ? (
                    <p className="text-center text-emerald-600 font-medium mt-4">
                        🎉 Path Completed!
                    </p>
                ) : nextSession && (
                    <div className="mt-4 text-center">
                        <Button
                            variant="primary"
                            onClick={() => onNavigate?.('lop-session', { slug: nextSession.slug })}
                            className="bg-rose-500 hover:bg-rose-600"
                        >
                            <Play className="w-4 h-4 mr-2" fill="currentColor" />
                            Continue: {nextSession.title}
                        </Button>
                    </div>
                )}
            </Card>

            {/* Sessions List */}
            <h2 className="font-semibold text-gray-900 mb-4">Sessions in This Path</h2>
            <div className="space-y-3">
                {sessions.map((session, idx) => {
                    if (!session) return null;
                    const completed = isSessionCompleted(session.id);
                    const isNext = idx === nextSessionIndex;

                    return (
                        <Card
                            key={session.id}
                            isClickable
                            isHoverable
                            onClick={() => onNavigate?.('lop-session', { slug: session.slug })}
                            className={cn(
                                "p-4 group transition-all",
                                completed && "bg-emerald-50/50 border-emerald-100",
                                isNext && "ring-2 ring-rose-200 bg-rose-50/30"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                {/* Step Number / Check */}
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-colors",
                                    completed
                                        ? "bg-emerald-100 text-emerald-600"
                                        : isNext
                                            ? "bg-rose-100 text-rose-600"
                                            : "bg-gray-100 text-gray-400"
                                )}>
                                    {completed ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        idx + 1
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className={cn(
                                            "font-medium transition-colors",
                                            completed
                                                ? "text-emerald-700"
                                                : "text-gray-900 group-hover:text-rose-600"
                                        )}>
                                            {session.title}
                                        </h3>
                                        {isNext && (
                                            <Badge variant="warning" size="sm">Next Up</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {session.speaker.name} • {session.duration} min
                                    </p>
                                </div>

                                {/* Action */}
                                <ChevronRight className={cn(
                                    "w-5 h-5 transition-colors shrink-0",
                                    completed ? "text-emerald-400" : "text-gray-300 group-hover:text-rose-400"
                                )} />
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default LOPLearningPath;
