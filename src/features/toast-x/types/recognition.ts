/**
 * Toast X - Recognition Types
 * Core recognition domain types with strict typing
 */

// ═══════════════════════════════════════════════════════════════════════════
// RECOGNITION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Recognition types following the PRD specification
 * - QUICK_TOAST: Everyday thanks, lightweight
 * - STANDING_OVATION: Significant achievements
 * - TEAM_TOAST: Whole team celebration
 * - MILESTONE_MOMENT: Auto-generated milestones
 */
export type RecognitionType =
    | 'QUICK_TOAST'
    | 'STANDING_OVATION'
    | 'TEAM_TOAST'
    | 'MILESTONE_MOMENT';

/**
 * Reaction types available on recognitions
 */
export type ReactionType =
    | 'applause'
    | 'celebrate'
    | 'love'
    | 'fire'
    | 'star'
    | 'praise'
    | 'strong'
    | 'magic'
    | 'rocket'
    | 'brilliant'
    | 'shine'
    | 'gem';

/**
 * A reaction on a recognition
 */
export interface Reaction {
    readonly type: ReactionType;
    readonly userId: string;
    readonly userName: string;
    readonly createdAt: string;
}

/**
 * A comment on a recognition with threading support
 */
export interface Comment {
    readonly id: string;
    readonly userId: string;
    readonly userName: string;
    readonly userAvatar?: string;
    readonly userTitle?: string;
    readonly content: string;
    readonly createdAt: string;
    readonly updatedAt?: string;
    readonly reactions: readonly Reaction[];
    readonly parentId?: string; // For threaded replies
    readonly mentions: readonly string[]; // User IDs mentioned
}

/**
 * Information about a recognition recipient
 */
export interface RecipientInfo {
    readonly id: string;
    readonly name: string;
    readonly avatar?: string;
    readonly title?: string;
    readonly team?: string;
}

/**
 * Image categories for recognition cards
 */
export type ImageCategory =
    | 'CELEBRATION'
    | 'TEAMWORK'
    | 'INNOVATION'
    | 'CARE'
    | 'INTEGRITY'
    | 'GRATITUDE';

/**
 * The core Recognition entity
 * Immutable by design - all properties are readonly
 */
export interface Recognition {
    readonly id: string;
    readonly type: RecognitionType;

    // Who gave the recognition
    readonly giverId: string;
    readonly giverName: string;
    readonly giverAvatar?: string;
    readonly giverTitle?: string;

    // Who received the recognition
    readonly recipientIds: readonly string[];
    readonly recipients: readonly RecipientInfo[];

    // What the recognition is about
    readonly value: CompanyValue;
    readonly expertAreas: readonly string[]; // Multi-select expert areas
    readonly message: string;
    readonly impact?: string; // For Standing Ovation
    readonly imageId: string;

    // Optional award
    readonly award?: AwardType;

    // Timestamps
    readonly createdAt: string;
    readonly updatedAt?: string;

    // Social interactions
    readonly reactions: readonly Reaction[];
    readonly comments: readonly Comment[];
    readonly reposts: number;
    readonly bookmarks: number;

    // Options
    readonly isPrivate: boolean;
    readonly notifyManagers: boolean;
    readonly nominatedForMonthly: boolean;

    // Gratitude Chain
    readonly chainParentId?: string;
    readonly chainDepth: number;
}

/**
 * Input for creating a new recognition
 * Subset of Recognition without generated fields
 */
export interface CreateRecognitionInput {
    readonly type: RecognitionType;
    readonly recipientIds: readonly string[];
    readonly value: CompanyValue;
    readonly expertAreas: readonly string[];
    readonly message: string;
    readonly impact?: string;
    readonly imageId: string;
    readonly award?: AwardType;
    readonly isPrivate?: boolean;
    readonly notifyManagers?: boolean;
    readonly nominatedForMonthly?: boolean;
    readonly chainParentId?: string;
}

// Forward declarations for circular dependencies
import type { CompanyValue } from './values';
import type { AwardType } from './awards';
