import React, { useState } from 'react';
import {
    Search,
    BookOpen,
    Route,
    Target,
    Sparkles,
    ArrowRight,
    TrendingUp,
    Star
} from 'lucide-react';
import { useLibraryStore } from './libraryStore';
import { BookCard, CollectionCard, PathCard, ReadingStatsWidget } from './components';
import { Card } from '../../components/ui/Card';
import { cn } from '../../lib/utils';
import { Skeleton } from '../../components/ui/Skeleton';
import { usePageLoading } from '../../hooks';

interface LibraryHubProps {
    onNavigate?: (section: string) => void;
}

export const LibraryHub: React.FC<LibraryHubProps> = ({ onNavigate }) => {
    const isLoading = usePageLoading(400);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'discover' | 'paths' | 'my-library'>('discover');

    const {
        books,
        collections,
        paths,
        userLibrary,
        setSearchQuery: setStoreSearch,
        getFilteredBooks,
        getFeaturedCollections
    } = useLibraryStore();

    const featuredCollections = getFeaturedCollections();
    const featuredBooks = books.filter(b => b.collections.includes('featured')).slice(0, 4);
    const careerPaths = paths.filter(p => p.type === 'career');
    const skillPaths = paths.filter(p => p.type === 'skill');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setStoreSearch(e.target.value);
    };

    const filteredBooks = searchQuery ? getFilteredBooks() : [];

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex items-center gap-3">
                    <Skeleton variant="circle" width={48} height={48} />
                    <div>
                        <Skeleton width={120} height={28} />
                        <Skeleton width={200} height={16} className="mt-1" />
                    </div>
                </div>
                <Skeleton width="100%" height={52} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} height={200} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero Header */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cafe-600 via-cafe-500 to-amber-500 p-8 text-white">
                <div className="absolute inset-0 bg-[url('/patterns/library-pattern.svg')] opacity-10" />
                <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Library</h1>
                            <p className="text-white/80">Your Product Manager's Knowledge Hub</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mt-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search books, authors, topics..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className={cn(
                                'w-full pl-12 pr-4 py-4 rounded-xl',
                                'bg-white text-gray-900 placeholder-gray-400',
                                'border-0 focus:ring-2 focus:ring-cafe-300',
                                'shadow-lg'
                            )}
                        />
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-6 mt-6 text-white/90">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-sm">{books.length} Books</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Route className="w-4 h-4" />
                            <span className="text-sm">{paths.length} Learning Paths</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            <span className="text-sm">{collections.length} Collections</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search Results */}
            {searchQuery && filteredBooks.length > 0 && (
                <section className="bg-cafe-50 rounded-xl p-6 border border-cafe-100">
                    <h2 className="font-semibold text-gray-900 mb-4">
                        Search Results <span className="text-gray-400 font-normal">({filteredBooks.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredBooks.slice(0, 8).map(book => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                </section>
            )}

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
                {[
                    { id: 'discover', label: 'Discover', icon: Sparkles },
                    { id: 'paths', label: 'Learning Paths', icon: Route },
                    { id: 'my-library', label: 'My Library', icon: BookOpen }
                ].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                                activeTab === tab.id
                                    ? 'bg-white text-cafe-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Discover Tab */}
            {activeTab === 'discover' && (
                <>
                    {/* Featured Collections */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Featured Collections</h2>
                            <button className="text-sm text-cafe-600 hover:text-cafe-700 font-medium flex items-center gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {featuredCollections.map(collection => (
                                <CollectionCard
                                    key={collection.id}
                                    collection={collection}
                                    bookCount={collection.bookIds.length}
                                    onClick={() => onNavigate?.(`library/collection/${collection.id}`)}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Featured Books */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                <Star className="w-5 h-5 inline text-amber-400 fill-amber-400 mr-2" />
                                Essential Reads
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {featuredBooks.map(book => (
                                <BookCard
                                    key={book.id}
                                    book={book}
                                    variant="featured"
                                    onClick={() => onNavigate?.(`library/book/${book.id}`)}
                                />
                            ))}
                        </div>
                    </section>

                    {/* All Books Grid */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">All Books</h2>
                            <span className="text-sm text-gray-400">{books.length} books</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {books.slice(0, 8).map(book => (
                                <BookCard
                                    key={book.id}
                                    book={book}
                                    onClick={() => onNavigate?.(`library/book/${book.id}`)}
                                />
                            ))}
                        </div>
                        {books.length > 8 && (
                            <div className="text-center mt-6">
                                <button className="px-6 py-2.5 bg-cafe-100 text-cafe-700 rounded-xl font-medium hover:bg-cafe-200 transition-colors">
                                    View All {books.length} Books
                                </button>
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* Learning Paths Tab */}
            {activeTab === 'paths' && (
                <>
                    {/* Career Paths */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-xl">
                                🌱
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Career Paths</h2>
                                <p className="text-sm text-gray-500">Level up your PM career stage by stage</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {careerPaths.map(path => (
                                <PathCard
                                    key={path.id}
                                    path={path}
                                    onClick={() => onNavigate?.(`library/path/${path.id}`)}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Skill Paths */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-xl">
                                🎯
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Skill Paths</h2>
                                <p className="text-sm text-gray-500">Master specific PM competencies</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {skillPaths.map(path => (
                                <PathCard
                                    key={path.id}
                                    path={path}
                                    onClick={() => onNavigate?.(`library/path/${path.id}`)}
                                />
                            ))}
                        </div>
                    </section>
                </>
            )}

            {/* My Library Tab */}
            {activeTab === 'my-library' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Reading Stats */}
                    <div className="lg:col-span-1">
                        <ReadingStatsWidget />
                    </div>

                    {/* Reading List & Progress */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Currently Reading */}
                        <Card className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-cafe-500" />
                                    Currently Reading
                                </h3>
                            </div>
                            {userLibrary.bookProgress.filter(p => p.progress > 0 && p.progress < 100).length > 0 ? (
                                <div className="space-y-3">
                                    {userLibrary.bookProgress
                                        .filter(p => p.progress > 0 && p.progress < 100)
                                        .slice(0, 3)
                                        .map(progress => {
                                            const book = books.find(b => b.id === progress.bookId);
                                            if (!book) return null;
                                            return (
                                                <BookCard
                                                    key={book.id}
                                                    book={book}
                                                    variant="compact"
                                                    onClick={() => onNavigate?.(`library/book/${book.id}`)}
                                                />
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">No books in progress</p>
                                    <p className="text-xs mt-1">Start reading from your list!</p>
                                </div>
                            )}
                        </Card>

                        {/* Reading List */}
                        <Card className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-purple-500" />
                                    My Reading List
                                </h3>
                                <span className="text-sm text-gray-400">{userLibrary.readingList.length} books</span>
                            </div>
                            {userLibrary.readingList.length > 0 ? (
                                <div className="space-y-3">
                                    {userLibrary.readingList.slice(0, 5).map(item => {
                                        const book = books.find(b => b.id === item.bookId);
                                        if (!book) return null;
                                        return (
                                            <BookCard
                                                key={book.id}
                                                book={book}
                                                variant="compact"
                                                onClick={() => onNavigate?.(`library/book/${book.id}`)}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Your reading list is empty</p>
                                    <p className="text-xs mt-1">Add books from the Discover tab!</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibraryHub;
