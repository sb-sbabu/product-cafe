
import React from 'react';
import type { SynthesizedAnswer } from '../../lib/search/types';
import { Sparkles, ArrowRight, ExternalLink, MessageSquare, Mail, User, Wrench, HelpCircle, FileText, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InstantAnswerProps {
    answer: SynthesizedAnswer;
    className?: string;
    onAction?: (actionId: string, payload?: any) => void;
}

export const InstantAnswer: React.FC<InstantAnswerProps> = ({
    answer,
    className,
    onAction
}) => {
    // Icon mapping based on answer type
    const getIcon = () => {
        switch (answer.type) {
            case 'PERSON_CARD': return <User size={18} className="text-purple-600" />;
            case 'TOOL_CARD': return <Wrench size={18} className="text-blue-600" />;
            case 'INSTANT_ANSWER': return <HelpCircle size={18} className="text-amber-600" />;
            case 'RESOURCE_LIST': return <FileText size={18} className="text-green-600" />;
            case 'LOP_SESSION': return <Calendar size={18} className="text-pink-600" />;
            default: return <Sparkles size={18} className="text-cafe-600" />;
        }
    };

    return (
        <div className={cn(
            "bg-gradient-to-br from-white to-gray-50 rounded-xl border border-cafe-200 shadow-sm overflow-hidden",
            className
        )}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                        {getIcon()}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Top Answer
                    </span>
                </div>
                {answer.confidence > 0.8 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded-full border border-green-100">
                        <Sparkles size={10} />
                        Highest Confidence
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                    {answer.text}
                </div>
            </div>

            {/* Actions */}
            {answer.actions && answer.actions.length > 0 && (
                <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex flex-wrap gap-2">
                    {answer.actions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => onAction?.(action.label, action.url)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border",
                                action.primary
                                    ? "bg-cafe-600 text-white border-cafe-600 hover:bg-cafe-700 shadow-sm"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                            )}
                        >
                            {/* Icon logic for actions */}
                            {action.label.includes('Chat') && <MessageSquare size={12} />}
                            {action.label.includes('Email') && <Mail size={12} />}
                            {action.label.includes('Open') && <ExternalLink size={12} />}
                            {action.label}
                            {action.primary && <ArrowRight size={12} className="opacity-70" />}
                        </button>
                    ))}
                </div>
            )}

            {/* Source / Citation */}
            {answer.sources && answer.sources.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100 bg-white text-[10px] text-gray-400 flex items-center justify-between">
                    <span>Source: {answer.sources[0].title}</span>
                    <span className="font-mono opacity-50">Conf: {(answer.confidence * 100).toFixed(0)}%</span>
                </div>
            )}
        </div>
    );
};
