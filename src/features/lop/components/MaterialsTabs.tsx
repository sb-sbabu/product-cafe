import React, { useState } from 'react';
import {
    FileText,
    Download,
    ExternalLink,
    BookOpen,
    Link2,
    Video,
    FileSpreadsheet,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { LOPResourceLink } from '../../../lib/lop/types';

// ═══════════════════════════════════════════════════════════════════════════
// MATERIALS TABS — Premium tabbed interface for session content
// Slides, Notes, Resources with beautiful animations
// ═══════════════════════════════════════════════════════════════════════════

interface MaterialsTabsProps {
    slidesUrl?: string;
    notesUrl?: string;
    resourceLinks?: LOPResourceLink[];
    sessionNotes?: string; // Markdown content
    className?: string;
}

type TabId = 'slides' | 'notes' | 'resources';

const RESOURCE_ICONS: Record<LOPResourceLink['type'], React.ReactNode> = {
    article: <FileText className="w-4 h-4" />,
    tool: <Link2 className="w-4 h-4" />,
    book: <BookOpen className="w-4 h-4" />,
    internal: <Video className="w-4 h-4" />,
    template: <FileSpreadsheet className="w-4 h-4" />,
};

const RESOURCE_COLORS: Record<LOPResourceLink['type'], string> = {
    article: 'text-blue-500 bg-blue-50',
    tool: 'text-purple-500 bg-purple-50',
    book: 'text-amber-500 bg-amber-50',
    internal: 'text-rose-500 bg-rose-50',
    template: 'text-emerald-500 bg-emerald-50',
};

export const MaterialsTabs: React.FC<MaterialsTabsProps> = ({
    slidesUrl,
    notesUrl,
    resourceLinks = [],
    sessionNotes,
    className,
}) => {
    const [activeTab, setActiveTab] = useState<TabId>('slides');

    const tabs = [
        { id: 'slides' as const, label: 'Slides', icon: FileSpreadsheet, count: slidesUrl ? 1 : 0 },
        { id: 'notes' as const, label: 'Notes', icon: FileText, count: notesUrl || sessionNotes ? 1 : 0 },
        { id: 'resources' as const, label: 'Resources', icon: Link2, count: resourceLinks.length },
    ];

    const hasContent = slidesUrl || notesUrl || sessionNotes || resourceLinks.length > 0;

    if (!hasContent) {
        return (
            <Card className={cn("p-6 text-center", className)}>
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No materials available yet</p>
                <p className="text-sm text-gray-300 mt-1">Materials will appear here after the session</p>
            </Card>
        );
    }

    return (
        <Card className={cn("overflow-hidden", className)}>
            {/* Tab Headers */}
            <div className="flex border-b border-gray-100">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all relative",
                                isActive
                                    ? "text-rose-600 bg-rose-50/50"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            {tab.count > 0 && (
                                <span className={cn(
                                    "ml-1 px-1.5 py-0.5 text-xs rounded-full",
                                    isActive ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-500"
                                )}>
                                    {tab.count}
                                </span>
                            )}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="p-5 min-h-[200px] animate-fade-in">
                {/* Slides Tab */}
                {activeTab === 'slides' && (
                    <div className="space-y-4">
                        {slidesUrl ? (
                            <>
                                {/* Slide Preview Placeholder */}
                                <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                                    <div className="text-center">
                                        <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">Session Slides</p>
                                        <p className="text-sm text-gray-400">Click below to view or download</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="primary"
                                        leftIcon={<ExternalLink className="w-4 h-4" />}
                                        onClick={() => window.open(slidesUrl, '_blank')}
                                        className="flex-1"
                                    >
                                        View Slides
                                    </Button>
                                    <Button
                                        variant="outline"
                                        leftIcon={<Download className="w-4 h-4" />}
                                        onClick={() => window.open(slidesUrl, '_blank')}
                                    >
                                        Download
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-400">No slides available</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                    <div className="space-y-4">
                        {sessionNotes ? (
                            <div className="prose prose-sm max-w-none">
                                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                    {sessionNotes}
                                </div>
                            </div>
                        ) : notesUrl ? (
                            <>
                                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-amber-100 rounded-lg">
                                            <FileText className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">Session Notes</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Detailed notes from this session are available for download
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    leftIcon={<Download className="w-4 h-4" />}
                                    onClick={() => window.open(notesUrl, '_blank')}
                                    className="w-full"
                                >
                                    Download Notes (PDF)
                                </Button>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-400">No notes available</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Resources Tab */}
                {activeTab === 'resources' && (
                    <div className="space-y-3">
                        {resourceLinks.length > 0 ? (
                            resourceLinks.map((resource, idx) => (
                                <a
                                    key={idx}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-gray-100 hover:border-gray-200"
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        RESOURCE_COLORS[resource.type]
                                    )}>
                                        {RESOURCE_ICONS[resource.type]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 group-hover:text-rose-600 transition-colors truncate">
                                            {resource.title}
                                        </h4>
                                        <p className="text-xs text-gray-400 capitalize">{resource.type}</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                </a>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-400">No resources linked</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default MaterialsTabs;
