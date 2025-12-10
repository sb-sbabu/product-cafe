import React from 'react';
import {
    ArrowLeft,
    Clock,
    Star,
    BookOpen,
    Check,
    Plus,
    Bookmark,
    ExternalLink,
    TrendingUp,
    User,
    Calendar,
    Zap,
    Award
} from 'lucide-react';
import { useLibraryStore } from '../libraryStore';
import { getAuthorsByIds } from '../data/authors';
import { calculateBookCredits, getCreditTier, getAuthorBadges } from '../creditUtils';
import { Card } from '../../../components/ui/Card';
import { cn } from '../../../lib/utils';

interface BookDetailPageProps {
    bookId: string;
    onBack?: () => void;
    onNavigate?: (section: string) => void;
}

export const BookDetailPage: React.FC<BookDetailPageProps> = ({ bookId, onBack, onNavigate }) => {
    const {
        books,
        paths,
        isInReadingList,
        addToReadingList,
        removeFromReadingList,
        getBookProgress,
        updateBookProgress,
        markBookComplete,
        userLibrary
    } = useLibraryStore();

    const book = books.find(b => b.id === bookId);
    const progress = getBookProgress(bookId);
    const inReadingList = isInReadingList(bookId);
    const isCompleted = userLibrary.completedBookIds.includes(bookId);
    const authors = book ? getAuthorsByIds(book.authorIds) : [];
    const authorNames = authors.map(a => a.name).join(', ') || 'Various Authors';
    const bookCredits = book ? calculateBookCredits(book) : 0;
    const creditTier = getCreditTier(bookCredits);

    // Find paths that include this book
    const relatedPaths = paths.filter(path =>
        path.modules.some(m => m.bookIds.includes(bookId))
    );

    const handleToggleReadingList = () => {
        if (!book) return;
        if (inReadingList) {
            removeFromReadingList(book.id);
        } else {
            addToReadingList(book.id);
        }
    };

    const handleMarkComplete = () => {
        if (!book) return;
        markBookComplete(book.id);
    };

    const handleUpdateProgress = (newProgress: number) => {
        if (!book) return;
        updateBookProgress(book.id, newProgress);
    };

    if (!book) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Book not found</p>
                <button
                    onClick={onBack}
                    className="mt-4 text-cafe-600 hover:text-cafe-700 font-medium"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-cafe-600 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Library</span>
            </button>

            {/* Book Header */}
            <section className="flex flex-col lg:flex-row gap-8">
                {/* Book Cover */}
                <div className="shrink-0">
                    <div className="w-48 h-72 bg-gradient-to-br from-cafe-200 via-cafe-300 to-cafe-400 rounded-xl shadow-lg flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white/80" />
                    </div>
                </div>

                {/* Book Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                            {book.subtitle && (
                                <p className="text-lg text-gray-500 mt-1">{book.subtitle}</p>
                            )}
                            <p className="text-cafe-600 font-medium mt-2 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {authorNames}
                            </p>
                        </div>

                        {isCompleted && (
                            <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shrink-0">
                                <Check className="w-4 h-4" />
                                Completed
                            </div>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-6 mt-6 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                            <span className="font-semibold text-gray-900">{book.rating}</span>
                            <span className="text-gray-500 text-sm">({book.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <Clock className="w-5 h-5" />
                            <span>{book.readingTimeHours}h reading time</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <BookOpen className="w-5 h-5" />
                            <span>{book.pageCount} pages</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="w-5 h-5" />
                            <span>Published {book.publishedYear}</span>
                        </div>
                        <span className={cn(
                            'px-3 py-1 rounded-full text-sm font-medium',
                            book.difficulty === 'beginner' && 'bg-green-100 text-green-700',
                            book.difficulty === 'intermediate' && 'bg-amber-100 text-amber-700',
                            book.difficulty === 'advanced' && 'bg-red-100 text-red-700'
                        )}>
                            {book.difficulty.charAt(0).toUpperCase() + book.difficulty.slice(1)}
                        </span>
                        <div className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold', creditTier.color)}>
                            <Zap className="w-4 h-4" />
                            +{bookCredits} credits
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-6">
                        <button
                            onClick={handleToggleReadingList}
                            className={cn(
                                'px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors',
                                inReadingList
                                    ? 'bg-cafe-100 text-cafe-700 hover:bg-cafe-200'
                                    : 'bg-cafe-600 text-white hover:bg-cafe-700'
                            )}
                        >
                            {inReadingList ? (
                                <>
                                    <Bookmark className="w-5 h-5 fill-current" />
                                    In Reading List
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Add to Reading List
                                </>
                            )}
                        </button>

                        {!isCompleted && inReadingList && (
                            <button
                                onClick={handleMarkComplete}
                                className="px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            >
                                <Check className="w-5 h-5" />
                                Mark Complete
                            </button>
                        )}

                        {book.amazonUrl && (
                            <a
                                href={book.amazonUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Buy Book
                            </a>
                        )}
                    </div>

                    {/* Progress Tracker (if in list) */}
                    {(progress || inReadingList) && !isCompleted && (
                        <Card className="mt-6 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-cafe-500" />
                                    Reading Progress
                                </h3>
                                <span className="text-cafe-600 font-medium">{Math.round(progress?.progress || 0)}%</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={progress?.progress || 0}
                                    onChange={(e) => handleUpdateProgress(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-cafe-600"
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Not started</span>
                                <span>Completed</span>
                            </div>
                        </Card>
                    )}
                </div>
            </section>

            {/* Key Takeaways */}
            {book.keyTakeaways.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Key Takeaways</h2>
                    <Card className="p-6">
                        <ul className="space-y-3">
                            {book.keyTakeaways.map((takeaway, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="w-6 h-6 bg-cafe-100 text-cafe-600 rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                                        {i + 1}
                                    </span>
                                    <p className="text-gray-700">{takeaway}</p>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </section>
            )}

            {/* Expert Authors */}
            {authors.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-cafe-500" />
                        About the Author{authors.length > 1 ? 's' : ''}
                    </h2>
                    <div className="space-y-4">
                        {authors.map(author => {
                            const authorBadges = getAuthorBadges(author.id);
                            return (
                                <Card key={author.id} className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-cafe-200 to-cafe-400 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0">
                                            {author.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900">{author.name}</h3>
                                            <p className="text-gray-600 text-sm mt-1">{author.bio}</p>

                                            {/* Expert Badges */}
                                            {authorBadges.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {authorBadges.map(badge => (
                                                        <span
                                                            key={badge.id}
                                                            className={cn('flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border', badge.color)}
                                                            title={badge.description}
                                                        >
                                                            <span>{badge.icon}</span>
                                                            {badge.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Expertise */}
                                            {author.expertise.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {author.expertise.slice(0, 4).map(exp => (
                                                        <span key={exp} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                            {exp}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* AI Summary */}
            {book.aiSummary && (
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">🤖 AI Summary</h2>
                    <Card className="p-6 bg-gradient-to-br from-cafe-50 to-white">
                        <p className="text-gray-700 leading-relaxed">{book.aiSummary}</p>
                    </Card>
                </section>
            )}

            {/* Related Learning Paths */}
            {relatedPaths.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">📚 Part of Learning Paths</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedPaths.map(path => (
                            <Card
                                key={path.id}
                                className="p-4 hover:border-cafe-200 transition-colors cursor-pointer"
                                onClick={() => onNavigate?.(`library/path/${path.id}`)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                                        'bg-gradient-to-r',
                                        path.color
                                    )}>
                                        {path.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{path.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            {path.type === 'career' ? 'Career Path' : 'Skill Path'} • {path.durationWeeks} weeks
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Tags */}
            {book.tags.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">🏷️ Topics</h2>
                    <div className="flex flex-wrap gap-2">
                        {book.tags.map(tag => (
                            <span
                                key={tag}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-cafe-100 hover:text-cafe-700 cursor-pointer transition-colors"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
