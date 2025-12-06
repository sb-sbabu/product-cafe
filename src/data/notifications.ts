// ========================================
// NOTIFICATION TYPES
// ========================================

export type NotificationType =
    | 'discussion_reply'
    | 'discussion_mention'
    | 'content_updated'
    | 'question_for_expertise'
    | 'answer_accepted'
    | 'faq_created'
    | 'weekly_digest';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    discussionId?: string;
    replyId?: string;
    resourceId?: string;
    faqId?: string;
    title: string;
    body: string;
    actionUrl: string;
    actionLabel: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
}

// ========================================
// MOCK NOTIFICATIONS
// ========================================

// Assuming current user is Natasha Romanoff (from AuthContext)
export const mockNotifications: Notification[] = [
    {
        id: 'n1',
        userId: 'u1',
        type: 'discussion_reply',
        discussionId: 'd3',
        title: 'New reply to discussion you follow',
        body: '"Success metrics section" - Eddie Smith replied: "Don\'t forget compliance metrics!"',
        actionUrl: '/discussions/d3',
        actionLabel: 'View',
        isRead: false,
        createdAt: '2024-12-05T09:00:00Z',
    },
    {
        id: 'n2',
        userId: 'u1',
        type: 'content_updated',
        resourceId: 'r3',
        title: 'Content you follow was updated',
        body: 'PRD Template was revised - New section: "Success Metrics Examples"',
        actionUrl: '/library/r3',
        actionLabel: 'View',
        isRead: false,
        createdAt: '2024-12-04T14:00:00Z',
    },
    {
        id: 'n3',
        userId: 'u1',
        type: 'answer_accepted',
        discussionId: 'd1',
        title: 'Your answer was accepted!',
        body: '"Medicare Secondary Payer clarification" - +10 contribution points',
        actionUrl: '/discussions/d1',
        actionLabel: 'View',
        isRead: true,
        readAt: '2024-12-03T10:00:00Z',
        createdAt: '2024-12-02T16:00:00Z',
    },
    {
        id: 'n4',
        userId: 'u1',
        type: 'question_for_expertise',
        discussionId: 'd2',
        title: 'Question in your expertise area',
        body: '"Employer group health plan scenario" - 0 answers yet, tagged: COB',
        actionUrl: '/discussions/d2',
        actionLabel: 'Answer',
        isRead: false,
        createdAt: '2024-12-02T14:30:00Z',
    },
    {
        id: 'n5',
        userId: 'u1',
        type: 'discussion_mention',
        discussionId: 'd5',
        title: 'You were mentioned in a discussion',
        body: 'Kevin Nguyen mentioned you in "Best practices for stakeholder demos"',
        actionUrl: '/discussions/d5',
        actionLabel: 'View',
        isRead: true,
        readAt: '2024-12-04T09:00:00Z',
        createdAt: '2024-12-03T16:00:00Z',
    },
];

// ========================================
// USER ENGAGEMENT STATS
// ========================================

export interface UserEngagement {
    userId: string;
    discussionsStarted: number;
    repliesGiven: number;
    upvotesReceived: number;
    answersAccepted: number;
    faqsCreated: number;
    contributionPoints: number;
    level: 'newcomer' | 'contributor' | 'expert' | 'champion';
}

export const mockUserEngagement: UserEngagement = {
    userId: 'u1',
    discussionsStarted: 3,
    repliesGiven: 12,
    upvotesReceived: 28,
    answersAccepted: 8,
    faqsCreated: 2,
    contributionPoints: 340,
    level: 'expert',
};

// ========================================
// HELPER FUNCTIONS
// ========================================

export function getUnreadNotifications(): Notification[] {
    return mockNotifications.filter(n => !n.isRead);
}

export function getUnreadCount(): number {
    return mockNotifications.filter(n => !n.isRead).length;
}

export function getNotificationsByType(type: NotificationType): Notification[] {
    return mockNotifications.filter(n => n.type === type);
}

export function getQuestionsForExpertise(): Notification[] {
    return mockNotifications.filter(n => n.type === 'question_for_expertise' && !n.isRead);
}

export function getRecentNotifications(limit: number = 10): Notification[] {
    return [...mockNotifications]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
}

export function getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
        'discussion_reply': '💬',
        'discussion_mention': '@',
        'content_updated': '📄',
        'question_for_expertise': '❓',
        'answer_accepted': '🏆',
        'faq_created': '📋',
        'weekly_digest': '📊',
    };
    return icons[type];
}
