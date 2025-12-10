import React, { useMemo } from 'react';
import {
    ArrowLeft,
    Clock,
    BookOpen,
    Check,
    Play,
    Lock,
    Trophy,
    Target,
    Calendar
} from 'lucide-react';
import { useLibraryStore } from '../libraryStore';
import { BookCard } from './BookCard';
import { Card } from '../../../components/ui/Card';
import { cn } from '../../../lib/utils';

interface PathDetailPageProps {
    pathId: string;
    onBack?: () => void;
    onNavigate?: (section: string) => void;
}

export const PathDetailPage: React.FC<PathDetailPageProps> = ({ pathId, onBack, onNavigate }) => {
    const {
        paths,
        books,
        isEnrolledInPath,
        getPathProgress,
        enrollInPath,
        unenrollFromPath,
        getModuleProgress,
        completeModule
    } = useLibraryStore();

    const path = paths.find(p => p.id === pathId);
    const isEnrolled = isEnrolledInPath(pathId);
    const progress = getPathProgress(pathId);

    const modulesWithBooks = useMemo(() => {
        if (!path) return [];
        return path.modules.map(module => ({
            ...module,
            books: books.filter(b => module.bookIds.includes(b.id))
        }));
    }, [path, books]);

    const totalBooks = path?.modules.reduce((acc, m) => acc + m.bookIds.length, 0) || 0;
    const completedModules = modulesWithBooks.filter(m =>
        getModuleProgress(pathId, m.id) >= 100
    ).length;

    const handleEnroll = () => {
        if (path) enrollInPath(path.id);
    };

    const handleUnenroll = () => {
        if (path) unenrollFromPath(path.id);
    };

    const handleCompleteModule = (moduleId: string) => {
        completeModule(pathId, moduleId);
    };

    if (!path) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Learning path not found</p>
                <button onClick={onBack} className="mt-4 text-cafe-600 hover:text-cafe-700 font-medium">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-cafe-600 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Paths</span>
            </button>

            <section className={cn('relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r', path.color)}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl">
                                {path.icon}
                            </div>
                            <div>
                                <span className="text-white/80 text-sm font-medium uppercase tracking-wide">
                                    {path.type === 'career' ? 'Career Path' : 'Skill Path'}
                                </span>
                                <h1 className="text-3xl font-bold text-white mt-1">{path.title}</h1>
                                <p className="text-white/80 mt-2 max-w-xl">{path.description}</p>
                            </div>
                        </div>

                        {isEnrolled ? (
                            <div className="flex items-center gap-3">
                                <div className="text-right text-white">
                                    <div className="text-2xl font-bold">{Math.round(progress)}%</div>
                                    <div className="text-sm text-white/80">Complete</div>
                                </div>
                                <button
                                    onClick={handleUnenroll}
                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition-colors"
                                >
                                    Unenroll
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleEnroll}
                                className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                                <Play className="w-5 h-5" />
                                Start Path
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-8 mt-8 text-white/90">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            <span>{path.durationWeeks} weeks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            <span>{totalBooks} books</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            <span>{path.modules.length} modules</span>
                        </div>
                        {isEnrolled && (
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5" />
                                <span>{completedModules}/{path.modules.length} completed</span>
                            </div>
                        )}
                    </div>

                    {isEnrolled && (
                        <div className="mt-6">
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cafe-500" />
                    Learning Modules
                </h2>

                <div className="space-y-4">
                    {modulesWithBooks.map((module, index) => {
                        const moduleProgress = getModuleProgress(pathId, module.id);
                        const isCompleted = moduleProgress >= 100;
                        const isLocked = !isEnrolled && index > 0;
                        const prevModuleComplete = index === 0 || getModuleProgress(pathId, modulesWithBooks[index - 1].id) >= 100;
                        const isCurrent = isEnrolled && !isCompleted && prevModuleComplete;

                        return (
                            <Card
                                key={module.id}
                                className={cn(
                                    'overflow-hidden transition-all',
                                    isLocked && 'opacity-60',
                                    isCurrent && 'ring-2 ring-cafe-400'
                                )}
                            >
                                <div className="p-5 border-b border-gray-100">
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            'w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0',
                                            isCompleted ? 'bg-green-100 text-green-600' : isCurrent ? 'bg-cafe-100 text-cafe-600' : 'bg-gray-100 text-gray-500'
                                        )}>
                                            {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-4">
                                                <h3 className="font-bold text-gray-900">{module.title}</h3>
                                                <div className="flex items-center gap-3">
                                                    {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                                                    {isEnrolled && !isCompleted && (
                                                        <button
                                                            onClick={() => handleCompleteModule(module.id)}
                                                            className="text-xs px-3 py-1.5 bg-cafe-100 text-cafe-700 rounded-full font-medium hover:bg-cafe-200 transition-colors"
                                                        >
                                                            Mark Complete
                                                        </button>
                                                    )}
                                                    {isCompleted && (
                                                        <span className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-medium flex items-center gap-1">
                                                            <Check className="w-3 h-3" /> Completed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">{module.description}</p>

                                            {isEnrolled && !isCompleted && (
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-gray-500">Progress</span>
                                                        <span className="text-cafe-600 font-medium">{Math.round(moduleProgress)}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-cafe-500 rounded-full transition-all" style={{ width: `${moduleProgress}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {!isLocked && module.books.length > 0 && (
                                    <div className="p-5 bg-gray-50">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <BookOpen className="w-4 h-4" />
                                                Books in this module
                                            </h4>
                                            <span className="text-xs text-gray-400">{module.books.length} books</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {module.books.map(book => (
                                                <BookCard
                                                    key={book.id}
                                                    book={book}
                                                    variant="compact"
                                                    onClick={() => onNavigate?.(`library/book/${book.id}`)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </section>

            {path.prerequisites && path.prerequisites.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Prerequisites</h2>
                    <div className="flex flex-wrap gap-2">
                        {path.prerequisites.map((prereq, i) => (
                            <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                                {prereq}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {!isEnrolled && (
                <section className="bg-cafe-50 rounded-2xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start?</h2>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Enroll in this path to track your progress and unlock all modules.
                    </p>
                    <button
                        onClick={handleEnroll}
                        className="px-8 py-3 bg-cafe-600 text-white rounded-xl font-semibold hover:bg-cafe-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <Play className="w-5 h-5" />
                        Start Learning Path
                    </button>
                </section>
            )}
        </div>
    );
};
