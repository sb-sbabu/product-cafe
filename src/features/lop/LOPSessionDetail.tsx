import React, { useState, useMemo } from 'react';
import {
    ArrowLeft,
    Play,
    Heart,
    Share2,
    User,
    FileText,
    Download,
    ExternalLink,
    ChevronRight,
    MessageSquare,
    BookOpen,
    CheckCircle2,
    Tag,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useLOPStore } from '../../stores/lopStore';
import { DiscussionSection } from './components/DiscussionSection';

interface LOPSessionDetailProps {
    slug: string;
    onNavigate?: (path: string, params?: Record<string, string>) => void;
    onBack?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// SESSION DETAIL PAGE — Rich video player with chapters, materials, discussions
// ═══════════════════════════════════════════════════════════════════════════

export const LOPSessionDetail: React.FC<LOPSessionDetailProps> = ({ slug, onNavigate, onBack }) => {
    const {
        getSessionBySlug,
        getSessionById,
        isSessionLiked,
        isSessionCompleted,
        toggleSessionLike,
        markSessionCompleted,
    } = useLOPStore();

    const session = getSessionBySlug(slug);
    const [currentChapter, setCurrentChapter] = useState(0);

    const relatedSessions = useMemo(() => {
        if (!session?.relatedSessionIds) return [];
        return session.relatedSessionIds.map(id => getSessionById(id)).filter(Boolean);
    }, [session?.relatedSessionIds, getSessionById]);

    if (!session) {
        return (
            <div className="max-w-5xl mx-auto py-12 text-center">
                <p className="text-gray-500">Session not found</p>
                <Button variant="outline" onClick={onBack} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to LOP
                </Button>
            </div>
        );
    }

    const date = new Date(session.sessionDate);
    const dateStr = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    const liked = isSessionLiked(session.id);
    const completed = isSessionCompleted(session.id);

    return (
        <div className="max-w-5xl mx-auto py-8 animate-fade-in">
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to LOP</span>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Share2 className="w-5 h-5" />
                </button>
            </header>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Video & Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Video Player */}
                    <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden relative group">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white/60">
                                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors cursor-pointer">
                                    <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                                </div>
                                <p className="text-sm">Click to play</p>
                            </div>
                        </div>
                        {/* Duration Badge */}
                        <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/60 rounded text-white text-sm">
                            {session.duration}:00
                        </div>
                    </div>

                    {/* Session Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>LOP #{session.sessionNumber}</span>
                            <span>•</span>
                            <span>{dateStr}</span>
                            {completed && (
                                <>
                                    <span>•</span>
                                    <span className="text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" /> Watched
                                    </span>
                                </>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>

                        {session.subtitle && (
                            <p className="text-lg text-gray-600">{session.subtitle}</p>
                        )}

                        <p className="text-gray-600">{session.description}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                variant={liked ? 'primary' : 'outline'}
                                size="sm"
                                leftIcon={<Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />}
                                onClick={() => toggleSessionLike(session.id)}
                            >
                                {session.likeCount} {liked ? 'Liked' : 'Like'}
                            </Button>
                            {!completed && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                                    onClick={() => markSessionCompleted(session.id)}
                                >
                                    Mark as Watched
                                </Button>
                            )}
                        </div>

                        {/* Topics */}
                        <div className="flex flex-wrap gap-2">
                            {session.topics.map(topic => (
                                <Badge key={topic} variant="info" size="sm">
                                    <Tag className="w-3 h-3 mr-1" /> {topic}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Chapters */}
                    {session.chapters && session.chapters.length > 0 && (
                        <Card className="p-5">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-rose-500" />
                                Chapter Markers
                            </h3>
                            <div className="space-y-2">
                                {session.chapters.map((chapter, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentChapter(idx)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                                            currentChapter === idx
                                                ? "bg-rose-50 text-rose-700"
                                                : "hover:bg-gray-50"
                                        )}
                                    >
                                        <span className="text-sm font-mono text-gray-400 w-12">
                                            {chapter.timestamp}
                                        </span>
                                        <span className={cn(
                                            "flex-1",
                                            currentChapter === idx ? "font-medium" : ""
                                        )}>
                                            {chapter.title}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                    </button>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Key Takeaways */}
                    {session.keyTakeaways && session.keyTakeaways.length > 0 && (
                        <Card className="p-5">
                            <h3 className="font-semibold text-gray-900 mb-4">🔑 Key Takeaways</h3>
                            <ul className="space-y-3">
                                {session.keyTakeaways.map((takeaway, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-medium shrink-0">
                                            {idx + 1}
                                        </span>
                                        <span className="text-gray-700">{takeaway}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Related Sessions */}
                    {relatedSessions.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">📺 Related Sessions</h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {relatedSessions.map(s => s && (
                                    <Card
                                        key={s.id}
                                        isClickable
                                        isHoverable
                                        onClick={() => onNavigate?.('lop-session', { slug: s.slug })}
                                        className="p-4"
                                    >
                                        <p className="text-xs text-gray-400 mb-1">LOP #{s.sessionNumber}</p>
                                        <h4 className="font-medium text-gray-900">{s.title}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{s.speaker.name}</p>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Discussion Section */}
                    <DiscussionSection sessionId={session.id} />
                </div>

                {/* Right: Sidebar */}
                <div className="space-y-6">
                    {/* Speaker Card */}
                    <Card className="p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-rose-500" />
                            Speaker
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                                {session.speaker.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{session.speaker.name}</p>
                                <p className="text-sm text-gray-500">{session.speaker.title}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-4">
                            <MessageSquare className="w-4 h-4 mr-2" /> Message in Teams
                        </Button>
                    </Card>

                    {/* Materials */}
                    <Card className="p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-rose-500" />
                            Session Materials
                        </h3>
                        <div className="space-y-2">
                            {session.slidesUrl && (
                                <a
                                    href={session.slidesUrl}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download className="w-4 h-4 text-gray-400" />
                                    <span>Slides (PDF)</span>
                                    <ExternalLink className="w-3 h-3 text-gray-300 ml-auto" />
                                </a>
                            )}
                            {session.notesUrl && (
                                <a
                                    href={session.notesUrl}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span>Session Notes</span>
                                    <ExternalLink className="w-3 h-3 text-gray-300 ml-auto" />
                                </a>
                            )}
                            {session.resourceLinks?.map((link, idx) => (
                                <a
                                    key={idx}
                                    href={link.url}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                    <span>{link.title}</span>
                                </a>
                            ))}
                            {!session.slidesUrl && !session.notesUrl && !session.resourceLinks?.length && (
                                <p className="text-sm text-gray-400 text-center py-4">
                                    No materials available
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* Stats */}
                    <Card className="p-5">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{session.viewCount}</p>
                                <p className="text-xs text-gray-500">Views</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{session.likeCount}</p>
                                <p className="text-xs text-gray-500">Likes</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{session.discussionCount}</p>
                                <p className="text-xs text-gray-500">Discussions</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LOPSessionDetail;
