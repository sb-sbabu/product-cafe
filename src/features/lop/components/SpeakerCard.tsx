import React from 'react';
import {
    Mail,
    Linkedin,
    MessageSquare,
    Video,
    ExternalLink,
    Award,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import type { LOPSpeaker } from '../../../lib/lop/types';

// ═══════════════════════════════════════════════════════════════════════════
// SPEAKER CARD — Profile with expertise, sessions, and contact
// Premium design with gradient accents
// ═══════════════════════════════════════════════════════════════════════════

interface SpeakerCardProps {
    speaker: LOPSpeaker & {
        bio?: string;
        expertise?: string[];
        linkedInUrl?: string;
        sessionCount?: number;
        totalViews?: number;
    };
    variant?: 'compact' | 'full';
    onViewSessions?: () => void;
    onContact?: () => void;
    className?: string;
}

const EXPERTISE_COLORS: Record<string, string> = {
    'Product Strategy': 'bg-purple-100 text-purple-700',
    'Customer Discovery': 'bg-blue-100 text-blue-700',
    'Data & Analytics': 'bg-emerald-100 text-emerald-700',
    'Leadership': 'bg-amber-100 text-amber-700',
    'Healthcare': 'bg-rose-100 text-rose-700',
    'UX Design': 'bg-cyan-100 text-cyan-700',
    'Agile': 'bg-orange-100 text-orange-700',
    'Growth': 'bg-pink-100 text-pink-700',
    default: 'bg-gray-100 text-gray-700',
};

export const SpeakerCard: React.FC<SpeakerCardProps> = ({
    speaker,
    variant = 'full',
    onViewSessions,
    onContact,
    className,
}) => {
    const getExpertiseColor = (expertise: string) => {
        return EXPERTISE_COLORS[expertise] || EXPERTISE_COLORS.default;
    };

    if (variant === 'compact') {
        return (
            <div className={cn("flex items-center gap-3", className)}>
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-rose-500/20">
                    {speaker.avatarUrl ? (
                        <img
                            src={speaker.avatarUrl}
                            alt={speaker.name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        speaker.name.charAt(0)
                    )}
                </div>
                <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{speaker.name}</p>
                    <p className="text-sm text-gray-500 truncate">{speaker.title}</p>
                </div>
            </div>
        );
    }

    return (
        <Card className={cn("p-5 overflow-hidden", className)}>
            {/* Header with gradient background */}
            <div className="relative -mx-5 -mt-5 mb-4 p-5 bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50">
                <div className="flex items-start gap-4">
                    {/* Large Avatar */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-rose-500/30 ring-4 ring-white">
                            {speaker.avatarUrl ? (
                                <img
                                    src={speaker.avatarUrl}
                                    alt={speaker.name}
                                    className="w-full h-full rounded-2xl object-cover"
                                />
                            ) : (
                                speaker.name.charAt(0)
                            )}
                        </div>
                        {/* Verified badge */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                            <Award className="w-3 h-3 text-white" />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-gray-900">{speaker.name}</h3>
                        <p className="text-gray-600">{speaker.title}</p>
                        {speaker.team && (
                            <p className="text-sm text-gray-400 mt-0.5">{speaker.team}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            {(speaker.sessionCount || speaker.totalViews) && (
                <div className="flex gap-6 mb-4 pb-4 border-b border-gray-100">
                    {speaker.sessionCount && (
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{speaker.sessionCount}</p>
                            <p className="text-xs text-gray-400">Sessions</p>
                        </div>
                    )}
                    {speaker.totalViews && (
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{(speaker.totalViews / 1000).toFixed(1)}k</p>
                            <p className="text-xs text-gray-400">Total Views</p>
                        </div>
                    )}
                </div>
            )}

            {/* Bio */}
            {speaker.bio && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {speaker.bio}
                </p>
            )}

            {/* Expertise Tags */}
            {speaker.expertise && speaker.expertise.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Expertise</p>
                    <div className="flex flex-wrap gap-2">
                        {speaker.expertise.map((skill, idx) => (
                            <Badge
                                key={idx}
                                className={cn("text-xs", getExpertiseColor(skill))}
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
                {onViewSessions && (
                    <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Video className="w-4 h-4" />}
                        onClick={onViewSessions}
                        className="flex-1"
                    >
                        View Sessions
                    </Button>
                )}
                {onContact && (
                    <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<MessageSquare className="w-4 h-4" />}
                        onClick={onContact}
                        className="flex-1"
                    >
                        Message
                    </Button>
                )}
            </div>

            {/* External Links */}
            {(speaker.linkedInUrl || speaker.email) && (
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    {speaker.linkedInUrl && (
                        <a
                            href={speaker.linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-colors"
                        >
                            <Linkedin className="w-4 h-4" />
                            LinkedIn
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                    {speaker.email && (
                        <a
                            href={`mailto:${speaker.email}`}
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            Email
                        </a>
                    )}
                </div>
            )}
        </Card>
    );
};

export default SpeakerCard;
