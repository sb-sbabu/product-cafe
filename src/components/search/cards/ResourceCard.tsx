
import React from 'react';
import type { ResourceResult } from '../../../lib/search/types';
import { FileText, ExternalLink } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ResourceCardProps {
    resource: ResourceResult;
    onClick?: () => void;
    className?: string;
    isSelected?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
    resource,
    onClick,
    className,
    isSelected
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group bg-white rounded-xl border border-gray-100 p-3 hover:border-green-200 hover:shadow-md transition-all duration-200 cursor-pointer",
                isSelected && "bg-green-50/50 border-green-200 shadow-sm",
                className
            )}
        >
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shadow-sm border border-green-100 shrink-0">
                    <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-1">
                        {resource.title}
                    </h3>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-gray-600">{resource.pillar}</span>
                        <span>•</span>
                        <span>{resource.resourceType}</span>
                    </div>
                    {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {resource.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[9px] px-1 py-px bg-gray-50 text-gray-500 rounded border border-gray-100">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                    <ExternalLink size={14} className="text-gray-400 group-hover:text-green-600" />
                </div>
            </div>
        </div>
    );
};
