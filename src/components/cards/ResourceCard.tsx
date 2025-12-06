import React from 'react';
import {
    FileText,
    BookOpen,
    FileCode,
    PlayCircle,
    ExternalLink,
    Wrench,
    HelpCircle,
    GraduationCap,
    Star,
    Clock,
    ArrowUpRight,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn, formatEstimatedTime, slugToDisplay } from '../../lib/utils';
import { useAnalytics } from '../../hooks/useAnalytics';
import type { Resource } from '../../types';

interface ResourceCardProps {
    resource: Resource;
    variant?: 'default' | 'compact' | 'list';
    onClick?: () => void;
}

const contentTypeIcons: Record<string, React.ElementType> = {
    doc: FileText,
    guide: BookOpen,
    template: FileCode,
    video: PlayCircle,
    link: ExternalLink,
    tool: Wrench,
    faq: HelpCircle,
    'learning-path': GraduationCap,
};

const pillarColors: Record<string, 'grab' | 'library' | 'community' | 'default'> = {
    'product-craft': 'library',
    'healthcare': 'community',
    'internal-playbook': 'default',
    'tools-access': 'grab',
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
    resource,
    variant = 'default',
    onClick,
}) => {
    const Icon = contentTypeIcons[resource.contentType] || FileText;
    const badgeVariant = pillarColors[resource.pillar] || 'default';
    const { trackResourceClick } = useAnalytics();

    const handleClick = () => {
        // Track analytics
        trackResourceClick(resource.id);

        if (onClick) {
            onClick();
        } else {
            window.open(resource.url, '_blank', 'noopener,noreferrer');
        }
    };

    if (variant === 'list') {
        return (
            <div
                onClick={handleClick}
                className={cn(
                    `flex items-center justify-between p-4 bg-white border border-gray-100
           rounded-lg hover:bg-gray-50 hover:border-gray-200 cursor-pointer
           transition-all duration-200 group`
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                        <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900">{resource.title}</h4>
                    </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <Card
                isHoverable
                isClickable
                onClick={handleClick}
                className="p-4"
            >
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                        <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{resource.title}</h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {resource.description}
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    // Default variant
    return (
        <Card
            isHoverable
            isClickable
            onClick={handleClick}
            className="p-6 h-full flex flex-col"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-2.5 bg-gray-100 rounded-xl">
                    <Icon className="w-5 h-5 text-gray-600" />
                </div>
                {resource.isFeatured && (
                    <Badge variant="warning" icon={<Star className="w-3 h-3" />}>
                        Featured
                    </Badge>
                )}
            </div>

            {/* Content */}
            <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                    {resource.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {resource.description}
                </p>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={badgeVariant}>
                    {slugToDisplay(resource.pillar)}
                </Badge>
                <Badge>{slugToDisplay(resource.contentType)}</Badge>
                {resource.estimatedTime && (
                    <Badge icon={<Clock className="w-3 h-3" />}>
                        {formatEstimatedTime(resource.estimatedTime)}
                    </Badge>
                )}
            </div>

            {/* Action hint */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                    {resource.sourceSystem === 'confluence' && 'Opens in Confluence'}
                    {resource.sourceSystem === 'sharepoint' && 'Opens in SharePoint'}
                    {resource.sourceSystem === 'servicenow' && 'Opens in ServiceNow'}
                    {resource.sourceSystem === 'smartsheet' && 'Opens in Smartsheet'}
                    {resource.sourceSystem === 'external' && 'Opens external link'}
                    {resource.sourceSystem === 'internal' && 'Opens document'}
                </span>
                <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </div>
        </Card>
    );
};
