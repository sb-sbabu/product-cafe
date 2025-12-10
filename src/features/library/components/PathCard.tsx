import React from 'react';
import { Clock, BookOpen, Check, Play } from 'lucide-react';
import type { LearningPath } from '../types';
import { useLibraryStore } from '../libraryStore';
import { cn } from '../../../lib/utils';

interface PathCardProps {
    path: LearningPath;
    onClick?: () => void;
}

export const PathCard: React.FC<PathCardProps> = ({ path, onClick }) => {
    const { isEnrolledInPath, getPathProgress, enrollInPath } = useLibraryStore();

    const isEnrolled = isEnrolledInPath(path.id);
    const progress = getPathProgress(path.id);
    const totalBooks = path.modules.reduce((acc, m) => acc + m.bookIds.length, 0);

    const handleEnroll = (e: React.MouseEvent) => {
        e.stopPropagation();
        enrollInPath(path.id);
    };

    const getPersonaLabel = () => {
        const labels: Record<string, string> = {
            'ic-pm': 'IC PM',
            'senior-pm': 'Senior PM',
            'product-lead': 'Product Lead',
            'director': 'Director+',
            'technical-pm': 'Technical PM'
        };
        return path.targetPersonas.map(p => labels[p] || p).join(', ');
    };

    return (
        <div
            onClick={onClick}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
            role="article"
            tabIndex={0}
            aria-label={`${path.type === 'career' ? 'Career' : 'Skill'} path: ${path.title}, ${path.durationWeeks} weeks, ${totalBooks} books${isEnrolled ? `, ${Math.round(progress)}% complete` : ''}`}
            className={cn(
                'group relative overflow-hidden rounded-2xl cursor-pointer',
                'bg-white border border-gray-100 hover:border-cafe-200',
                'hover:shadow-xl transition-all duration-300',
                'focus:outline-none focus:ring-2 focus:ring-cafe-400 focus:ring-offset-2'
            )}
        >
            {/* Header with gradient */}
            <div className={cn(
                'relative h-24 flex items-center px-6',
                'bg-gradient-to-r',
                path.color
            )}>
                <div className="absolute inset-0 bg-black/5" />
                <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                        {path.icon}
                    </div>
                    <div>
                        <span className="text-white/80 text-xs font-medium uppercase tracking-wide">
                            {path.type === 'career' ? 'Career Path' : 'Skill Path'}
                        </span>
                        <h3 className="text-white font-bold text-lg">
                            {path.title}
                        </h3>
                    </div>
                </div>

                {isEnrolled && (
                    <div className="absolute top-4 right-4 bg-white text-green-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Enrolled
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {path.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{path.durationWeeks} weeks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        <span>{totalBooks} books</span>
                    </div>
                </div>

                {/* Modules Preview */}
                <div className="space-y-2 mb-4">
                    {path.modules.slice(0, 3).map((module, i) => (
                        <div
                            key={module.id}
                            className="flex items-center gap-2 text-sm"
                        >
                            <div className={cn(
                                'w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shrink-0',
                                isEnrolled && i < Math.floor(progress / (100 / path.modules.length))
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-500'
                            )}>
                                {isEnrolled && i < Math.floor(progress / (100 / path.modules.length))
                                    ? <Check className="w-3 h-3" />
                                    : i + 1
                                }
                            </div>
                            <span className="text-gray-600 truncate">{module.title}</span>
                        </div>
                    ))}
                    {path.modules.length > 3 && (
                        <div className="text-xs text-gray-400 pl-7">
                            +{path.modules.length - 3} more modules
                        </div>
                    )}
                </div>

                {/* Target Personas */}
                <div className="text-xs text-gray-400 mb-4">
                    For: <span className="text-gray-600">{getPersonaLabel()}</span>
                </div>

                {/* Progress or CTA */}
                {isEnrolled ? (
                    <div>
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-cafe-600 font-medium">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cafe-400 to-cafe-600 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleEnroll}
                        aria-label={`Start learning path: ${path.title}`}
                        className={cn(
                            'w-full py-2.5 rounded-xl text-sm font-semibold',
                            'bg-cafe-500 text-white hover:bg-cafe-600',
                            'flex items-center justify-center gap-2 transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-cafe-400 focus:ring-offset-2'
                        )}
                    >
                        <Play className="w-4 h-4" />
                        Start Path
                    </button>
                )}
            </div>

            {/* Hover indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cafe-400 to-cafe-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </div>
    );
};
