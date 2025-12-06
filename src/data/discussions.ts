import type { Person } from '../types';

// ========================================
// DISCUSSION TYPES
// ========================================

export interface Discussion {
    id: string;
    attachedToType: 'resource' | 'faq' | 'topic' | 'general';
    attachedToId: string;
    title: string;
    body: string;
    authorId: string;
    authorEmail: string;
    authorName: string;
    status: 'open' | 'resolved' | 'stale';
    resolvedAt?: string;
    resolvedById?: string;
    replyCount: number;
    upvoteCount: number;
    viewCount: number;
    promotedToFAQId?: string;
    createdAt: string;
    updatedAt: string;
    lastActivityAt: string;
}

export interface Reply {
    id: string;
    discussionId: string;
    parentReplyId?: string;
    depth: number;
    body: string;
    authorId: string;
    authorEmail: string;
    authorName: string;
    isExpert: boolean;
    upvoteCount: number;
    isAcceptedAnswer: boolean;
    createdAt: string;
    updatedAt: string;
}

// ========================================
// MOCK DISCUSSIONS
// ========================================

export const mockDiscussions: Discussion[] = [
    {
        id: 'd1',
        attachedToType: 'resource',
        attachedToId: 'r5', // COB Decision Tree
        title: 'Medicare Secondary Payer clarification',
        body: "This doc doesn't cover Medicare Secondary Payer rules. Should we add a section or link to a separate guide? I've had 3 people ask me about MSP in the past week.",
        authorId: 'p2',
        authorEmail: 'sarah.chen@company.com',
        authorName: 'Sarah Chen',
        status: 'resolved',
        resolvedAt: '2024-11-20T10:00:00Z',
        resolvedById: 'p5',
        replyCount: 2,
        upvoteCount: 4,
        viewCount: 45,
        createdAt: '2024-11-18T09:00:00Z',
        updatedAt: '2024-11-20T10:00:00Z',
        lastActivityAt: '2024-11-20T10:00:00Z',
    },
    {
        id: 'd2',
        attachedToType: 'resource',
        attachedToId: 'r5', // COB Decision Tree
        title: 'Employer group health plan scenario',
        body: 'What happens when an employee has two EGHP coverages? One through their own employer and one through their spouse?',
        authorId: 'p3',
        authorEmail: 'mike.johnson@company.com',
        authorName: 'Mike Johnson',
        status: 'open',
        replyCount: 0,
        upvoteCount: 1,
        viewCount: 12,
        createdAt: '2024-12-02T14:30:00Z',
        updatedAt: '2024-12-02T14:30:00Z',
        lastActivityAt: '2024-12-02T14:30:00Z',
    },
    {
        id: 'd3',
        attachedToType: 'resource',
        attachedToId: 'r3', // PRD Template
        title: 'Success metrics section - best practices?',
        body: "The template has a success metrics section but doesn't give examples. What are some good metrics for a B2B healthcare product?",
        authorId: 'p11',
        authorEmail: 'kevin.nguyen@company.com',
        authorName: 'Kevin Nguyen',
        status: 'open',
        replyCount: 3,
        upvoteCount: 7,
        viewCount: 89,
        createdAt: '2024-12-01T11:00:00Z',
        updatedAt: '2024-12-04T16:00:00Z',
        lastActivityAt: '2024-12-04T16:00:00Z',
    },
    {
        id: 'd4',
        attachedToType: 'resource',
        attachedToId: 'r1', // Jira Access
        title: 'Approval time has increased',
        body: "Is anyone else experiencing longer approval times for Jira access? Used to be 1-2 days, now it's taking almost a week.",
        authorId: 'p6',
        authorEmail: 'jennifer.patel@company.com',
        authorName: 'Jennifer Patel',
        status: 'resolved',
        resolvedAt: '2024-11-28T09:00:00Z',
        replyCount: 4,
        upvoteCount: 12,
        viewCount: 156,
        createdAt: '2024-11-25T08:00:00Z',
        updatedAt: '2024-11-28T09:00:00Z',
        lastActivityAt: '2024-11-28T09:00:00Z',
    },
    {
        id: 'd5',
        attachedToType: 'general',
        attachedToId: '',
        title: 'Best practices for stakeholder demos',
        body: "Anyone have tips for running effective stakeholder demos? I have a big one coming up with the exec team.",
        authorId: 'p11',
        authorEmail: 'kevin.nguyen@company.com',
        authorName: 'Kevin Nguyen',
        status: 'open',
        replyCount: 5,
        upvoteCount: 8,
        viewCount: 134,
        createdAt: '2024-12-03T15:00:00Z',
        updatedAt: '2024-12-05T10:00:00Z',
        lastActivityAt: '2024-12-05T10:00:00Z',
    },
];

export const mockReplies: Reply[] = [
    // Replies for d1 (Medicare Secondary Payer)
    {
        id: 'r1-1',
        discussionId: 'd1',
        depth: 0,
        body: "Great point. I've added a 'Related: Medicare Secondary Payer Guide' link at the bottom of the doc. This should help with the MSP questions.",
        authorId: 'p5',
        authorEmail: 'eddie.smith@company.com',
        authorName: 'Eddie Smith',
        isExpert: true,
        upvoteCount: 2,
        isAcceptedAnswer: true,
        createdAt: '2024-11-19T10:00:00Z',
        updatedAt: '2024-11-19T10:00:00Z',
    },
    {
        id: 'r1-2',
        discussionId: 'd1',
        parentReplyId: 'r1-1',
        depth: 1,
        body: 'Perfect, thank you! This will help a lot.',
        authorId: 'p2',
        authorEmail: 'sarah.chen@company.com',
        authorName: 'Sarah Chen',
        isExpert: false,
        upvoteCount: 1,
        isAcceptedAnswer: false,
        createdAt: '2024-11-19T11:00:00Z',
        updatedAt: '2024-11-19T11:00:00Z',
    },
    // Replies for d3 (Success metrics)
    {
        id: 'r3-1',
        discussionId: 'd3',
        depth: 0,
        body: 'For B2B healthcare, I usually focus on: adoption rate, time-to-value, NPS from admin users, and claims processed without errors.',
        authorId: 'p2',
        authorEmail: 'sarah.chen@company.com',
        authorName: 'Sarah Chen',
        isExpert: false,
        upvoteCount: 5,
        isAcceptedAnswer: false,
        createdAt: '2024-12-01T14:00:00Z',
        updatedAt: '2024-12-01T14:00:00Z',
    },
    {
        id: 'r3-2',
        discussionId: 'd3',
        depth: 0,
        body: "Don't forget compliance metrics! In healthcare, audit pass rate and regulatory findings are critical for stakeholder buy-in.",
        authorId: 'p5',
        authorEmail: 'eddie.smith@company.com',
        authorName: 'Eddie Smith',
        isExpert: true,
        upvoteCount: 3,
        isAcceptedAnswer: false,
        createdAt: '2024-12-02T09:00:00Z',
        updatedAt: '2024-12-02T09:00:00Z',
    },
    {
        id: 'r3-3',
        discussionId: 'd3',
        parentReplyId: 'r3-1',
        depth: 1,
        body: "This is super helpful! I'm adding these to my PRD now.",
        authorId: 'p11',
        authorEmail: 'kevin.nguyen@company.com',
        authorName: 'Kevin Nguyen',
        isExpert: false,
        upvoteCount: 0,
        isAcceptedAnswer: false,
        createdAt: '2024-12-04T16:00:00Z',
        updatedAt: '2024-12-04T16:00:00Z',
    },
    // Replies for d4 (Jira approval time)
    {
        id: 'r4-1',
        discussionId: 'd4',
        depth: 0,
        body: "Yes, I noticed this too. I reached out to IT - apparently there's a backlog due to year-end audits.",
        authorId: 'p3',
        authorEmail: 'mike.johnson@company.com',
        authorName: 'Mike Johnson',
        isExpert: false,
        upvoteCount: 4,
        isAcceptedAnswer: false,
        createdAt: '2024-11-25T10:00:00Z',
        updatedAt: '2024-11-25T10:00:00Z',
    },
    {
        id: 'r4-2',
        discussionId: 'd4',
        depth: 0,
        body: "Thanks for flagging. We've added two more approvers to reduce the backlog. Should be back to normal by next week.",
        authorId: 'p1',
        authorEmail: 'alex.kumar@company.com',
        authorName: 'Alex Kumar',
        isExpert: true,
        upvoteCount: 8,
        isAcceptedAnswer: true,
        createdAt: '2024-11-27T14:00:00Z',
        updatedAt: '2024-11-27T14:00:00Z',
    },
];

// ========================================
// HELPER FUNCTIONS
// ========================================

export function getDiscussionsByResource(resourceId: string): Discussion[] {
    return mockDiscussions.filter(d =>
        d.attachedToType === 'resource' && d.attachedToId === resourceId
    );
}

export function getDiscussionsByFAQ(faqId: string): Discussion[] {
    return mockDiscussions.filter(d =>
        d.attachedToType === 'faq' && d.attachedToId === faqId
    );
}

export function getGeneralDiscussions(): Discussion[] {
    return mockDiscussions.filter(d => d.attachedToType === 'general');
}

export function getRepliesForDiscussion(discussionId: string): Reply[] {
    return mockReplies.filter(r => r.discussionId === discussionId);
}

export function getDiscussionById(id: string): Discussion | undefined {
    return mockDiscussions.find(d => d.id === id);
}

export function getRecentDiscussions(limit: number = 5): Discussion[] {
    return [...mockDiscussions]
        .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
        .slice(0, limit);
}

export function getOpenDiscussionsCount(): number {
    return mockDiscussions.filter(d => d.status === 'open').length;
}

// Expert helper - which people are relevant for a resource
export function getExpertsForResource(resourceId: string, allPeople: Person[]): Person[] {
    // In a real app, this would use resource tags to match expert areas
    // For now, return people with matching expertise
    const resourceExpertiseMap: Record<string, string[]> = {
        'r5': ['cob', 'healthcare', 'claims'], // COB Decision Tree
        'r3': ['product process', 'templates'], // PRD Template
        'r1': ['jira', 'access management'], // Jira Access
        'r4': ['smartsheet', 'releases'], // Smartsheet
    };

    const requiredExpertise = resourceExpertiseMap[resourceId] || [];
    return allPeople.filter(p =>
        p.expertiseAreas.some(area =>
            requiredExpertise.some(req => area.toLowerCase().includes(req))
        )
    );
}
