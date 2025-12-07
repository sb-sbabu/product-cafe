
import React from 'react';
import type { ToolResult } from '../../../lib/search/types';
import { Wrench, ExternalLink, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ToolCardProps {
    tool: ToolResult;
    onClick?: () => void;
    className?: string;
    isSelected?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({
    tool,
    onClick,
    className,
    isSelected
}) => {
    // Status color mapping
    const getStatusColor = (status: ToolResult['status']) => {
        switch (status) {
            case 'available': return 'bg-green-50 text-green-700 border-green-100';
            case 'limited': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'unavailable': return 'bg-red-50 text-red-700 border-red-100';
            case 'coming_soon': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "group bg-white rounded-xl border border-gray-100 p-3 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer",
                isSelected && "bg-blue-50/50 border-blue-200 shadow-sm",
                className
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 shrink-0">
                        <Wrench size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {tool.name}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            {tool.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border", getStatusColor(tool.status))}>
                                {tool.status.replace('_', ' ')}
                            </span>
                            {tool.turnaround && (
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <Clock size={10} />
                                    {tool.turnaround}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(tool.accessUrl, '_blank');
                        }}
                    >
                        <ExternalLink size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
