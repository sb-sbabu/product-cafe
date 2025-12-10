// Internal Resources - Company content, templates, guides, playbooks

export interface InternalResource {
    id: string;
    slug: string;
    title: string;
    description: string;
    url: string;
    category: 'library' | 'grab-and-go' | 'community';
    pillar: 'product-craft' | 'healthcare' | 'internal-playbook';
    contentType: 'template' | 'guide' | 'doc' | 'video' | 'learning-path' | 'link';
    sourceSystem: 'confluence' | 'sharepoint' | 'smartsheet' | 'notion' | 'internal';
    tags: string[];
    audience: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime?: number; // in minutes
    isFeatured: boolean;
    isArchived: boolean;
    expertIds?: string[];
    viewCount: number;
    helpfulCount: number;
    updatedAt: string;
}

// Pillar definitions for internal resources
export const INTERNAL_PILLARS = [
    {
        id: 'product-craft',
        title: 'Product Craft',
        description: 'Templates, guides, and best practices for product management',
        icon: '💡',
        color: 'bg-purple-100 text-purple-600'
    },
    {
        id: 'healthcare',
        title: 'Healthcare Domain',
        description: 'RCM, eligibility, compliance, and industry knowledge',
        icon: '🏥',
        color: 'bg-teal-100 text-teal-600'
    },
    {
        id: 'internal-playbook',
        title: 'Internal Playbook',
        description: 'How we work, org structure, processes, and rituals',
        icon: '📖',
        color: 'bg-blue-100 text-blue-600'
    }
];

// Content type icons
export const CONTENT_TYPE_ICONS: Record<string, string> = {
    template: '📄',
    guide: '📚',
    doc: '📃',
    video: '🎬',
    'learning-path': '🗺️',
    link: '🔗'
};

// Source system badges
export const SOURCE_BADGES: Record<string, { label: string; color: string }> = {
    confluence: { label: 'Confluence', color: 'bg-blue-100 text-blue-700' },
    sharepoint: { label: 'SharePoint', color: 'bg-green-100 text-green-700' },
    smartsheet: { label: 'Smartsheet', color: 'bg-orange-100 text-orange-700' },
    notion: { label: 'Notion', color: 'bg-gray-100 text-gray-700' },
    internal: { label: 'Internal', color: 'bg-cafe-100 text-cafe-700' }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertToInternalResource(resource: any): InternalResource {
    // Defensive coding: handle missing properties gracefully
    return {
        id: resource?.id ?? `resource-${Date.now()}`,
        slug: resource?.slug ?? '',
        title: resource?.title ?? 'Untitled Resource',
        description: resource?.description ?? '',
        url: resource?.url ?? '#',
        category: (resource?.category ?? 'library') as InternalResource['category'],
        pillar: (resource?.pillar ?? 'product-craft') as InternalResource['pillar'],
        contentType: (resource?.contentType ?? 'doc') as InternalResource['contentType'],
        sourceSystem: (resource?.sourceSystem ?? 'internal') as InternalResource['sourceSystem'],
        tags: Array.isArray(resource?.tags) ? resource.tags : [],
        audience: Array.isArray(resource?.audience) ? resource.audience : [],
        difficulty: resource?.difficulty as InternalResource['difficulty'],
        estimatedTime: typeof resource?.estimatedTime === 'number' ? resource.estimatedTime : undefined,
        isFeatured: Boolean(resource?.isFeatured),
        isArchived: Boolean(resource?.isArchived),
        expertIds: Array.isArray(resource?.expertIds) ? resource.expertIds : undefined,
        viewCount: typeof resource?.viewCount === 'number' ? resource.viewCount : 0,
        helpfulCount: typeof resource?.helpfulCount === 'number' ? resource.helpfulCount : 0,
        updatedAt: resource?.updatedAt ?? new Date().toISOString()
    };
}
