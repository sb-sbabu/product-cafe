
import React from 'react';
import type { FAQResult } from '../../../lib/search/types';
import { HelpCircle, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface FAQCardProps {
    faq: FAQResult;
    onClick?: () => void;
    className?: string;
    isSelected?: boolean;
}

export const FAQCard: React.FC<FAQCardProps> = ({
    faq,
    onClick,
    className,
    isSelected
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group bg-white rounded-xl border border-gray-100 p-3 hover:border-amber-200 hover:shadow-md transition-all duration-200 cursor-pointer",
                isSelected && "bg-amber-50/50 border-amber-200 shadow-sm",
                className
            )}
        >
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100 shrink-0 mt-0.5">
                    <HelpCircle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                        {faq.question}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {faq.answerSummary}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                        <span className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{faq.category}</span>
                        <span>•</span>
                        <span>{faq.helpfulCount} found helpful</span>
                    </div>
                </div>
                <div className="self-center">
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-amber-500 transition-colors" />
                </div>
            </div>
        </div>
    );
};
