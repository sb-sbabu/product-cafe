
import React from 'react';
import type { PersonResult } from '../../../lib/search/types';
import { Mail, MessageSquare, Briefcase, Award } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface PersonCardProps {
    person: PersonResult;
    onClick?: () => void;
    className?: string;
    isSelected?: boolean;
}

export const PersonCard: React.FC<PersonCardProps> = ({
    person,
    onClick,
    className,
    isSelected
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group bg-white rounded-xl border border-gray-100 p-3 hover:border-cafe-200 hover:shadow-md transition-all duration-200 cursor-pointer flex items-start gap-4",
                isSelected && "bg-cafe-50 border-cafe-200 shadow-sm",
                className
            )}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cafe-100 to-cafe-200 flex items-center justify-center text-cafe-700 font-semibold text-lg border-2 border-white shadow-sm">
                    {person.avatarUrl ? (
                        <img src={person.avatarUrl} alt={person.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        person.name.charAt(0)
                    )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white" title="Available" />
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-cafe-700 transition-colors truncate">
                        {person.name}
                    </h3>
                    {person.badgeCount > 0 && (
                        <div className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-100">
                            <Award size={10} />
                            {person.badgeCount}
                        </div>
                    )}
                </div>

                <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <Briefcase size={12} />
                    <span className="truncate">{person.title} • {person.team}</span>
                </div>

                {person.expertiseAreas && person.expertiseAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {person.expertiseAreas.slice(0, 3).map((area, cls) => (
                            <span key={cls} className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded border border-gray-100 truncate max-w-[100px]">
                                {area}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions (Hover) */}
            <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity self-center">
                <button
                    className="p-1.5 text-gray-400 hover:text-cafe-600 hover:bg-cafe-50 rounded transition-colors"
                    title="Start Chat"
                    onClick={(e) => { e.stopPropagation(); console.log('Chat with', person.name); }}
                >
                    <MessageSquare size={16} />
                </button>
                <button
                    className="p-1.5 text-gray-400 hover:text-cafe-600 hover:bg-cafe-50 rounded transition-colors"
                    title="Send Email"
                    onClick={(e) => { e.stopPropagation(); console.log('Email', person.email); }}
                >
                    <Mail size={16} />
                </button>
            </div>
        </div>
    );
};
