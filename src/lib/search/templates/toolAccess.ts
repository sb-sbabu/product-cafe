/**
 * Template for tool access/search results
 */

import type { SynthesizedAnswer, ToolResult, SearchQuery } from '../types';

export function generateToolAnswer(
    query: SearchQuery,
    tool: ToolResult
): SynthesizedAnswer {
    const isAccessRequest = query.intent.primary === 'TOOL_ACCESS';

    let text = `${tool.name}: ${tool.description}`;
    let actions = [
        {
            label: 'Launch Tool',
            url: tool.accessUrl,
            icon: 'external-link',
            primary: true
        }
    ];

    if (isAccessRequest) {
        text = `You can request access to ${tool.name} through the Identity Portal.`;
        actions = [
            {
                label: 'Request Access',
                url: tool.requestUrl || '#',
                icon: 'key',
                primary: true
            },
            ...(tool.guideUrl ? [{
                label: 'Access Guide',
                url: tool.guideUrl,
                icon: 'book',
                primary: false
            }] : [])
        ];
    } else if (tool.status === 'unavailable') {
        text = `${tool.name} is currently undergoing maintenance.`;
    }

    return {
        type: 'TOOL_CARD',
        confidence: 0.9,
        text,
        featuredResult: tool,
        actions,
        sources: []
    };
}
