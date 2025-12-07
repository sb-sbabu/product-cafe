
import React from 'react';
import type { SearchResponse, SearchResult } from '../../lib/search/types';
import { InstantAnswer } from './InstantAnswer';
import { PersonCard } from './cards/PersonCard';
import { ToolCard } from './cards/ToolCard';
import { ResourceCard } from './cards/ResourceCard';
import { FAQCard } from './cards/FAQCard';
import { DiscussionCard } from './cards/DiscussionCard';
import { Sparkles, User, Wrench, HelpCircle, FileText, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchResultsProps {
    data: SearchResponse | null;
    onResultClick: (result: SearchResult) => void;
    className?: string;
    showInstantAnswer?: boolean;
    selectedIndex?: number;
    allResults?: SearchResult[];
}

export const SearchResults: React.FC<SearchResultsProps> = ({
    data,
    onResultClick,
    className,
    showInstantAnswer = true,
    selectedIndex = -1,
    allResults = []
}) => {
    if (!data || data.totalCount === 0) return null;

    const { results, answer } = data;
    const hasInstantAnswer = showInstantAnswer && answer && answer.type !== 'NO_DIRECT_ANSWER' && answer.type !== 'ZERO_RESULTS';

    const getIsSelected = (id: string) => {
        if (selectedIndex < 0 || !allResults[selectedIndex]) return false;
        return allResults[selectedIndex].id === id;
    };

    return (
        <div className={cn("flex flex-col gap-4 py-2", className)}>
            {/* 1. Instant Answer Section */}
            {hasInstantAnswer && answer && (
                <div className="px-3 mb-2">
                    <InstantAnswer
                        answer={answer}
                        onAction={(id) => console.log('Action:', id)}
                    />
                </div>
            )}

            {/* 2. Grouped Results */}

            {/* Example: prioritize based on intent? For now, standard order or provided order */}

            {/* People */}
            {results.people.length > 0 && (
                <div className="space-y-2">
                    <SectionHeader icon={<User size={14} />} title="People" count={results.people.length} />
                    <div className="grid grid-cols-1 gap-2 px-3">
                        {results.people.slice(0, 3).map(person => (
                            <PersonCard
                                key={person.id}
                                person={person}
                                onClick={() => onResultClick(person)}
                                isSelected={getIsSelected(person.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Tools */}
            {results.tools.length > 0 && (
                <div className="space-y-2">
                    <SectionHeader icon={<Wrench size={14} />} title="Tools" count={results.tools.length} />
                    <div className="grid grid-cols-1 gap-2 px-3">
                        {results.tools.slice(0, 3).map(tool => (
                            <ToolCard
                                key={tool.id}
                                tool={tool}
                                onClick={() => onResultClick(tool)}
                                isSelected={getIsSelected(tool.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* FAQs */}
            {results.faqs.length > 0 && (
                <div className="space-y-2">
                    <SectionHeader icon={<HelpCircle size={14} />} title="FAQs" count={results.faqs.length} />
                    <div className="grid grid-cols-1 gap-2 px-3">
                        {results.faqs.slice(0, 3).map(faq => (
                            <FAQCard
                                key={faq.id}
                                faq={faq}
                                onClick={() => onResultClick(faq)}
                                isSelected={getIsSelected(faq.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Resources */}
            {results.resources.length > 0 && (
                <div className="space-y-2">
                    <SectionHeader icon={<FileText size={14} />} title="Resources" count={results.resources.length} />
                    <div className="grid grid-cols-1 gap-2 px-3">
                        {results.resources.slice(0, 3).map(resource => (
                            <ResourceCard
                                key={resource.id}
                                resource={resource}
                                onClick={() => onResultClick(resource)}
                                isSelected={getIsSelected(resource.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Discussions */}
            {results.discussions.length > 0 && (
                <div className="space-y-2">
                    <SectionHeader icon={<MessageSquare size={14} />} title="Discussions" count={results.discussions.length} />
                    <div className="grid grid-cols-1 gap-2 px-3">
                        {results.discussions.slice(0, 3).map(discussion => (
                            <DiscussionCard
                                key={discussion.id}
                                discussion={discussion}
                                onClick={() => onResultClick(discussion)}
                                isSelected={getIsSelected(discussion.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Footer Metrics */}
            <div className="px-4 py-2 mt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>
                    {data.totalCount} results in {data.metrics.totalTimeMs.toFixed(0)}ms
                </span>
                <span className="flex items-center gap-1">
                    <Sparkles size={12} className="text-cafe-500" />
                    Powered by Café Finder
                </span>
            </div>
        </div>
    );
};

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string, count?: number }> = ({ icon, title, count }) => (
    <div className="px-4 py-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {icon}
            {title}
        </div>
        {count !== undefined && (
            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {count}
            </span>
        )}
    </div>
);
