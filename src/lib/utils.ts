import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Format distance to now (e.g., "2h ago", "5d ago")
 */
export function formatDistanceToNow(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
}

/**
 * Format estimated time (e.g., "15 min read")
 */
export function formatEstimatedTime(minutes?: number): string {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (remainingMins === 0) return `${hours}h`;
    return `${hours}h ${remainingMins}m`;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert slug to display name
 */
export function slugToDisplay(slug: string): string {
    return slug
        .split('-')
        .map(word => capitalize(word))
        .join(' ');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Get icon name for content type
 */
export function getContentTypeIcon(contentType: string): string {
    const icons: Record<string, string> = {
        doc: 'FileText',
        guide: 'BookOpen',
        template: 'FileCode',
        video: 'PlayCircle',
        link: 'ExternalLink',
        tool: 'Wrench',
        faq: 'HelpCircle',
        'learning-path': 'GraduationCap',
    };
    return icons[contentType] || 'File';
}

/**
 * Get color class for pillar
 */
export function getPillarColor(pillar: string): string {
    const colors: Record<string, string> = {
        'product-craft': 'purple',
        'healthcare': 'blue',
        'internal-playbook': 'green',
        'tools-access': 'amber',
    };
    return colors[pillar] || 'gray';
}

/**
 * Get accent for category
 */
export function getCategoryAccent(category: string): string {
    const accents: Record<string, string> = {
        'grab-and-go': 'grab',
        'library': 'library',
        'community': 'community',
    };
    return accents[category] || 'gray';
}
