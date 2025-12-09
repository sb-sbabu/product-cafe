/**
 * Toast X - Zod Validation Schemas
 * Runtime validation with type inference
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// VALUE SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const CompanyValueSchema = z.enum([
    'DO_IT_DIFFERENTLY',
    'HEALTHCARE_IS_PERSONAL',
    'BE_ALL_IN',
    'OWN_THE_OUTCOME',
    'DO_THE_RIGHT_THING',
    'EXPLORE_FEARLESSLY',
]);

// ═══════════════════════════════════════════════════════════════════════════
// RECOGNITION SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const RecognitionTypeSchema = z.enum([
    'QUICK_TOAST',
    'STANDING_OVATION',
    'TEAM_TOAST',
    'MILESTONE_MOMENT',
]);

export const ReactionTypeSchema = z.enum([
    'applause', 'celebrate', 'love', 'fire',
    'star', 'praise', 'strong', 'magic',
    'rocket', 'brilliant', 'shine', 'gem',
]);

export const AwardTypeSchema = z.enum([
    'MAVERICK', 'HEARTBEAT', 'BRIDGE_BUILDER', 'OWNER', 'GUARDIAN', 'EXPLORER',
    'TOAST_OF_THE_MONTH', 'VALUES_CHAMPION', 'GRATITUDE_GURU', 'QUARTERLY_GEM',
    'SUNSHINE_AWARD', 'BULLSEYE', 'PUZZLE_MASTER', 'MENTOR_STAR',
    'FIRE_STARTER', 'CALM_IN_THE_STORM',
]);

export const MilestoneBadgeSchema = z.enum([
    'TOAST_DEBUT', 'GRATEFUL_DOZEN', 'TOAST_TREE', 'MOUNTAIN_TOP',
    'FIRST_TOAST', 'RISING_STAR', 'STAR_QUALITY', 'CONSTELLATION', 'GALAXY',
    'YEAR_ONE', 'TRIPLE', 'HALF_DECADE', 'DIAMOND',
]);

// ═══════════════════════════════════════════════════════════════════════════
// INPUT VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Schema for creating a Quick Toast
 * Validates all required fields with helpful error messages
 */
export const CreateQuickToastSchema = z.object({
    recipientIds: z.array(z.string().min(1, 'Recipient ID required'))
        .min(1, 'At least one recipient required')
        .max(1, 'Quick Toast supports only one recipient'),
    value: CompanyValueSchema,
    expertAreas: z.array(z.string()).default([]),
    message: z.string()
        .min(10, 'Message must be at least 10 characters')
        .max(500, 'Message cannot exceed 500 characters'),
    imageId: z.string().min(1, 'Please select an image'),
});

/**
 * Schema for creating a Standing Ovation
 */
export const CreateStandingOvationSchema = z.object({
    recipientIds: z.array(z.string().min(1, 'Recipient ID required'))
        .min(1, 'At least one recipient required')
        .max(10, 'Maximum 10 recipients allowed'),
    value: CompanyValueSchema,
    expertAreas: z.array(z.string()).min(1, 'Select at least one expert area'),
    message: z.string()
        .min(50, 'Tell the story - at least 50 characters')
        .max(2000, 'Story cannot exceed 2000 characters'),
    impact: z.string()
        .min(20, 'Describe the impact - at least 20 characters')
        .max(500, 'Impact cannot exceed 500 characters')
        .optional(),
    imageId: z.string().min(1, 'Please select an image'),
    award: AwardTypeSchema.optional(),
    notifyManagers: z.boolean().default(false),
    nominatedForMonthly: z.boolean().default(false),
});

/**
 * Schema for creating a Team Toast
 */
export const CreateTeamToastSchema = z.object({
    recipientIds: z.array(z.string().min(1, 'Recipient ID required'))
        .min(2, 'Team Toast requires at least 2 people')
        .max(50, 'Maximum 50 recipients allowed'),
    value: CompanyValueSchema,
    expertAreas: z.array(z.string()).default([]),
    message: z.string()
        .min(20, 'Message must be at least 20 characters')
        .max(1000, 'Message cannot exceed 1000 characters'),
    imageId: z.string().min(1, 'Please select an image'),
    notifyManagers: z.boolean().default(false),
});

/**
 * Schema for adding a comment
 */
export const AddCommentSchema = z.object({
    recognitionId: z.string().min(1, 'Recognition ID required'),
    content: z.string()
        .min(1, 'Comment cannot be empty')
        .max(1000, 'Comment cannot exceed 1000 characters'),
    parentId: z.string().optional(),
    mentions: z.array(z.string()).default([]),
});

/**
 * Schema for adding a reaction
 */
export const AddReactionSchema = z.object({
    recognitionId: z.string().min(1, 'Recognition ID required'),
    type: ReactionTypeSchema,
});

// ═══════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS FROM SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export type CreateQuickToastInput = z.infer<typeof CreateQuickToastSchema>;
export type CreateStandingOvationInput = z.infer<typeof CreateStandingOvationSchema>;
export type CreateTeamToastInput = z.infer<typeof CreateTeamToastSchema>;
export type AddCommentInput = z.infer<typeof AddCommentSchema>;
export type AddReactionInput = z.infer<typeof AddReactionSchema>;
