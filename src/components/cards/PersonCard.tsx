import React from 'react';
import { MessageCircle, Mail, MapPin } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import type { Person } from '../../types';
import { UserHoverCard } from '../profile';

interface PersonCardProps {
    person: Person;
    variant?: 'default' | 'compact' | 'list';
    onContact?: () => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
    person,
    variant = 'default',
    onContact,
}) => {
    const handleTeamsClick = () => {
        window.open(person.teamsDeepLink, '_blank', 'noopener,noreferrer');
        onContact?.();
    };

    const handleEmailClick = () => {
        window.location.href = `mailto:${person.email}`;
        onContact?.();
    };

    // Generate initials for avatar
    const initials = person.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Generate a consistent color based on name
    const colors = [
        'bg-cafe-500',
        'bg-purple-500',
        'bg-cyan-500',
        'bg-amber-500',
        'bg-emerald-500',
        'bg-rose-500',
    ];
    const colorIndex = person.displayName.charCodeAt(0) % colors.length;
    const avatarColor = colors[colorIndex];

    if (variant === 'list') {
        return (
            <div
                className={cn(
                    `flex items-center justify-between p-4 bg-white border border-gray-100
           rounded-lg hover:bg-gray-50 transition-colors`
                )}
            >
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                            avatarColor
                        )}
                    >
                        {person.avatarUrl ? (
                            <img
                                src={person.avatarUrl}
                                alt={person.displayName}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            initials
                        )}
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900">{person.displayName}</h4>
                        <p className="text-sm text-gray-500">{person.title}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<MessageCircle className="w-4 h-4" />}
                    onClick={handleTeamsClick}
                >
                    Message
                </Button>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <Card isHoverable className="p-4">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shrink-0',
                            avatarColor
                        )}
                    >
                        {person.avatarUrl ? (
                            <img
                                src={person.avatarUrl}
                                alt={person.displayName}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            initials
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{person.displayName}</h4>
                        <p className="text-sm text-gray-500 truncate">{person.title}</p>
                    </div>
                </div>
            </Card>
        );
    }

    // Default variant
    return (
        <Card className="p-6 h-full flex flex-col">
            {/* Header with Avatar - wrapped in UserHoverCard */}
            <div className="flex items-start gap-4 mb-4">
                <UserHoverCard
                    userId={person.id}
                    displayName={person.displayName}
                    title={person.title}
                    team={person.team}
                    avatarUrl={person.avatarUrl}
                    totalPoints={Math.floor(Math.random() * 1000) + 100}
                    discussionCount={Math.floor(Math.random() * 50)}
                    replyCount={Math.floor(Math.random() * 100)}
                    badgeCount={Math.floor(Math.random() * 10)}
                    levelNumber={Math.floor(Math.random() * 5) + 1}
                >
                    <div
                        className={cn(
                            'w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0 cursor-pointer transition-transform hover:scale-105',
                            avatarColor
                        )}
                    >
                        {person.avatarUrl ? (
                            <img
                                src={person.avatarUrl}
                                alt={person.displayName}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            initials
                        )}
                    </div>
                </UserHoverCard>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg">{person.displayName}</h3>
                    <p className="text-gray-600">{person.title}</p>
                    <p className="text-sm text-gray-500">{person.team}</p>
                </div>
            </div>

            {/* Location */}
            {person.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{person.location}</span>
                </div>
            )}

            {/* Expertise */}
            <div className="flex-1 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Expertise:</h4>
                <div className="flex flex-wrap gap-2">
                    {person.expertiseAreas.slice(0, 4).map((area) => (
                        <Badge key={area} variant="library" size="sm">
                            {area}
                        </Badge>
                    ))}
                    {person.expertiseAreas.length > 4 && (
                        <Badge size="sm">+{person.expertiseAreas.length - 4} more</Badge>
                    )}
                </div>
            </div>

            {/* Can Help With */}
            {person.canHelpWith.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Can help with:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                        {person.canHelpWith.slice(0, 3).map((topic, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-gray-400">•</span>
                                <span>{topic}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<MessageCircle className="w-4 h-4" />}
                    onClick={handleTeamsClick}
                    className="flex-1"
                >
                    Message in Teams
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Mail className="w-4 h-4" />}
                    onClick={handleEmailClick}
                >
                    Email
                </Button>
            </div>
        </Card>
    );
};
