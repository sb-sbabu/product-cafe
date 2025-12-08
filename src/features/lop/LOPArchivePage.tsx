import React from 'react';
import {
    ArrowLeft,
    Search,
    Play,
    Filter,
    ChevronDown,
    X,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useLOPStore } from '../../stores/lopStore';
import { getAllTopics, getAllSpeakers } from '../../lib/lop/data';

interface LOPArchivePageProps {
    onNavigate?: (path: string, params?: Record<string, string>) => void;
    onBack?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHIVE PAGE — Filterable list of all sessions
// ═══════════════════════════════════════════════════════════════════════════

export const LOPArchivePage: React.FC<LOPArchivePageProps> = ({ onNavigate, onBack }) => {
    const {
        filters,
        setFilter,
        sortBy,
        setSortBy,
        clearFilters,
        getFilteredSessions,
        isSessionCompleted,
    } = useLOPStore();

    const sessions = getFilteredSessions();
    const allTopics = getAllTopics();
    const allSpeakers = getAllSpeakers();

    const hasActiveFilters =
        filters.topic !== 'all' ||
        filters.speaker !== 'all' ||
        filters.year !== 'all' ||
        filters.difficulty !== 'all' ||
        filters.searchQuery !== '';

    return (
        <div className="max-w-5xl mx-auto py-8 animate-fade-in">
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>LOP Home</span>
                </button>
                <h1 className="text-xl font-bold text-gray-900">Session Archive</h1>
            </header>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search sessions by title, topic, or speaker..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilter('searchQuery', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                />
                {filters.searchQuery && (
                    <button
                        onClick={() => setFilter('searchQuery', '')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Filters */}
            <Card className="p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Filters</span>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="ml-auto text-xs text-rose-600 hover:text-rose-700"
                        >
                            Clear all
                        </button>
                    )}
                </div>
                <div className="grid sm:grid-cols-4 gap-3">
                    {/* Topic Filter */}
                    <div className="relative">
                        <select
                            value={filters.topic}
                            onChange={(e) => setFilter('topic', e.target.value)}
                            className="w-full appearance-none px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none"
                        >
                            <option value="all">All Topics</option>
                            {allTopics.map(topic => (
                                <option key={topic} value={topic}>{topic}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Speaker Filter */}
                    <div className="relative">
                        <select
                            value={filters.speaker}
                            onChange={(e) => setFilter('speaker', e.target.value)}
                            className="w-full appearance-none px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none"
                        >
                            <option value="all">All Speakers</option>
                            {allSpeakers.map(speaker => (
                                <option key={speaker} value={speaker}>{speaker}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Year Filter */}
                    <div className="relative">
                        <select
                            value={filters.year}
                            onChange={(e) => setFilter('year', e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                            className="w-full appearance-none px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none"
                        >
                            <option value="all">All Years</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full appearance-none px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none"
                        >
                            <option value="newest">📅 Newest First</option>
                            <option value="oldest">📅 Oldest First</option>
                            <option value="most-viewed">👁️ Most Viewed</option>
                            <option value="most-liked">❤️ Most Liked</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </Card>

            {/* Results Count */}
            <p className="text-sm text-gray-500 mb-4">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </p>

            {/* Session List */}
            <div className="space-y-3">
                {sessions.map((session, idx) => {
                    const date = new Date(session.sessionDate);
                    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    const completed = isSessionCompleted(session.id);

                    return (
                        <Card
                            key={session.id}
                            isClickable
                            isHoverable
                            onClick={() => onNavigate?.('lop-session', { slug: session.slug })}
                            className="p-4 animate-fade-in group"
                            style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                        >
                            <div className="flex items-start gap-4">
                                {/* Number */}
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center text-rose-700 font-bold shrink-0">
                                    #{session.sessionNumber}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                                        <span>{monthYear}</span>
                                        {completed && (
                                            <Badge variant="success" size="sm">✓ Watched</Badge>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                                        {session.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {session.speaker.name} • {session.duration} min
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {session.topics.slice(0, 3).map(topic => (
                                            <Badge key={topic} variant="info" size="sm">
                                                {topic}
                                            </Badge>
                                        ))}
                                        {session.topics.length > 3 && (
                                            <Badge variant="info" size="sm">
                                                +{session.topics.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Watch Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0 group-hover:bg-rose-50 group-hover:border-rose-200 group-hover:text-rose-600"
                                >
                                    <Play className="w-4 h-4 mr-1" /> Watch
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Empty State */}
            {sessions.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No sessions match your filters</p>
                    <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    );
};

export default LOPArchivePage;
