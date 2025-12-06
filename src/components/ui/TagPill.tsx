import React from 'react';
import { cn } from '../../lib/utils';
import {
    AlertTriangle,
    Activity,
    Tag,
    Users,
    MapPin,
    Hash,
    CheckCircle2,
    Clock
} from 'lucide-react';

interface TagPillProps {
    tag: string; // e.g. "#priority/high" or "priority/high"
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
    size?: 'sm' | 'md';
}

// Configuration for Namespaces
// Maps namespace -> { colors, icon }
const NAMESPACE_CONFIG: Record<string, { bg: string; text: string; border: string; icon: React.ElementType }> = {
    priority: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: AlertTriangle
    },
    status: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: Activity
    },
    team: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: Users
    },
    area: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        icon: MapPin
    },
    type: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: Tag
    },
    time: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: Clock
    },
    done: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: CheckCircle2
    },
    // Default fallback
    default: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: Hash
    }
};

export const TagPill: React.FC<TagPillProps> = ({ tag, className, onClick, size = 'md' }) => {
    // 1. Clean and parse
    const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag;
    const parts = cleanTag.split('/');

    // 2. Identify Namespace
    const hasNamespace = parts.length > 1;
    const namespace = hasNamespace ? parts[0].toLowerCase() : 'default';
    const value = hasNamespace ? parts.slice(1).join('/') : cleanTag;

    // 3. Get Config
    const config = NAMESPACE_CONFIG[namespace] || NAMESPACE_CONFIG.default;
    const Icon = config.icon;

    return (
        <span
            onClick={onClick}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border transition-all duration-200 font-medium select-none',
                config.bg,
                config.text,
                config.border,
                onClick && 'cursor-pointer hover:brightness-95 hover:shadow-sm active:scale-95',
                size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs',
                className
            )}
        >
            <Icon className={cn(size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3', 'opacity-70')} />

            {hasNamespace ? (
                <span className="flex items-center gap-1">
                    <span className="opacity-60 font-normal">{namespace}:</span>
                    <span>{value}</span>
                </span>
            ) : (
                <span>{value}</span>
            )}
        </span>
    );
};
