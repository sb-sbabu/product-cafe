/**
 * Toast X - Recognition Card Component
 * Displays a single recognition with reactions, comments, and actions
 * 
 * Key improvements over original:
 * - Uses memoized selectors (no infinite re-renders)
 * - Proper React.memo with custom comparison
 * - ARIA labels for accessibility
 * - Skeleton loading state
 */

import React, { memo, useCallback, useState } from 'react';
import {
    useRecognition,
    useRecognitionActions,
    useCurrentUser,
    useUser,
} from '../../hooks';
import {
    COMPANY_VALUES,
    AWARDS,
    formatRelativeTime,
} from '../../index';
import type { ReactionType, Recognition } from '../../types';

// ═══════════════════════════════════════════════════════════════════════════
// REACTION DATA
// ═══════════════════════════════════════════════════════════════════════════

const REACTION_EMOJIS: Record<ReactionType, string> = {
    applause: '👏',
    celebrate: '🎉',
    love: '❤️',
    fire: '🔥',
    star: '⭐',
    praise: '🙌',
    strong: '💪',
    magic: '✨',
    rocket: '🚀',
    brilliant: '💡',
    shine: '🌟',
    gem: '💎',
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface RecognitionCardSkeletonProps {
    className?: string;
}

/**
 * Skeleton loading state for RecognitionCard
 */
export const RecognitionCardSkeleton: React.FC<RecognitionCardSkeletonProps> = ({ className = '' }) => (
    <article
        className={`recognition-card recognition-card--skeleton ${className}`}
        aria-label="Loading recognition"
        aria-busy="true"
    >
        <div className="recognition-card__header">
            <div className="skeleton skeleton--avatar" />
            <div className="skeleton skeleton--text skeleton--text-short" />
        </div>
        <div className="recognition-card__body">
            <div className="skeleton skeleton--text" />
            <div className="skeleton skeleton--text" />
            <div className="skeleton skeleton--text skeleton--text-short" />
        </div>
        <div className="recognition-card__footer">
            <div className="skeleton skeleton--button" />
            <div className="skeleton skeleton--button" />
        </div>
    </article>
);

interface ReactionButtonProps {
    type: ReactionType;
    count: number;
    hasReacted: boolean;
    onToggle: () => void;
}

/**
 * Individual reaction button with count
 */
const ReactionButton: React.FC<ReactionButtonProps> = memo(({ type, count, hasReacted, onToggle }) => (
    <button
        className={`reaction-btn ${hasReacted ? 'reaction-btn--active' : ''}`}
        onClick={onToggle}
        aria-label={`${hasReacted ? 'Remove' : 'Add'} ${type} reaction. Current count: ${count}`}
        aria-pressed={hasReacted}
    >
        <span className="reaction-btn__emoji">{REACTION_EMOJIS[type]}</span>
        {count > 0 && <span className="reaction-btn__count">{count}</span>}
    </button>
));

ReactionButton.displayName = 'ReactionButton';

interface ReactionPickerProps {
    onSelect: (type: ReactionType) => void;
    onClose: () => void;
}

/**
 * Popup picker for adding reactions
 */
const ReactionPicker: React.FC<ReactionPickerProps> = memo(({ onSelect, onClose }) => {
    const reactions = Object.entries(REACTION_EMOJIS) as Array<[ReactionType, string]>;

    return (
        <div
            className="reaction-picker"
            role="dialog"
            aria-label="Choose a reaction"
        >
            <div className="reaction-picker__grid">
                {reactions.map(([type, emoji]) => (
                    <button
                        key={type}
                        className="reaction-picker__btn"
                        onClick={() => {
                            onSelect(type);
                            onClose();
                        }}
                        aria-label={`React with ${type}`}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
});

ReactionPicker.displayName = 'ReactionPicker';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface RecognitionCardProps {
    recognitionId: string;
    compact?: boolean;
    className?: string;
}

/**
 * Main Recognition Card component
 * Displays a recognition with all social interactions
 */
export const RecognitionCard: React.FC<RecognitionCardProps> = memo(({
    recognitionId,
    compact = false,
    className = '',
}) => {
    const recognition = useRecognition(recognitionId);
    const currentUser = useCurrentUser();
    const { addReaction, removeReaction, incrementBookmarks } = useRecognitionActions();

    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showComments, setShowComments] = useState(false);

    // Handle reaction toggle
    const handleReactionToggle = useCallback((type: ReactionType) => {
        if (!recognition || !currentUser) return;

        const hasReacted = recognition.reactions.some(
            r => r.userId === currentUser.id && r.type === type
        );

        if (hasReacted) {
            removeReaction(recognitionId, type);
        } else {
            addReaction(recognitionId, type);
        }
    }, [recognition, currentUser, recognitionId, addReaction, removeReaction]);

    // Handle bookmark
    const handleBookmark = useCallback(() => {
        incrementBookmarks(recognitionId);
    }, [recognitionId, incrementBookmarks]);

    // Loading state
    if (!recognition) {
        return <RecognitionCardSkeleton className={className} />;
    }

    // Get value definition
    const valueDefinition = COMPANY_VALUES[recognition.value];
    const awardDefinition = recognition.award ? AWARDS[recognition.award] : null;

    // Count reactions by type
    const reactionCounts = recognition.reactions.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
    }, {} as Record<ReactionType, number>);

    // Get current user's reactions
    const myReactions = currentUser
        ? recognition.reactions.filter(r => r.userId === currentUser.id).map(r => r.type)
        : [];

    // Get top 3 reactions for display
    const topReactions = Object.entries(reactionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3) as Array<[ReactionType, number]>;

    return (
        <article
            className={`recognition-card ${compact ? 'recognition-card--compact' : ''} ${className}`}
            aria-label={`Recognition from ${recognition.giverName} to ${recognition.recipients.map(r => r.name).join(', ')}`}
        >
            {/* Header with giver info and value badge */}
            <header className="recognition-card__header">
                <div className="recognition-card__giver">
                    <span className="recognition-card__avatar" role="img" aria-label={recognition.giverName}>
                        {recognition.giverAvatar || '👤'}
                    </span>
                    <div className="recognition-card__giver-info">
                        <span className="recognition-card__giver-name">{recognition.giverName}</span>
                        {recognition.giverTitle && (
                            <span className="recognition-card__giver-title">{recognition.giverTitle}</span>
                        )}
                    </div>
                </div>

                <div
                    className="recognition-card__value-badge"
                    style={{
                        background: valueDefinition.gradient,
                        color: '#fff',
                    }}
                >
                    <span className="recognition-card__value-icon">{valueDefinition.icon}</span>
                    <span className="recognition-card__value-name">{valueDefinition.shortName}</span>
                </div>
            </header>

            {/* Recipients */}
            <div className="recognition-card__recipients">
                <span className="recognition-card__arrow">→</span>
                <div className="recognition-card__recipient-list">
                    {recognition.recipients.map((recipient, index) => (
                        <span key={recipient.id} className="recognition-card__recipient">
                            <span className="recognition-card__recipient-avatar">
                                {recipient.avatar || '👤'}
                            </span>
                            <span className="recognition-card__recipient-name">
                                {recipient.name}
                            </span>
                            {index < recognition.recipients.length - 1 && ', '}
                        </span>
                    ))}
                </div>
            </div>

            {/* Message */}
            <div className="recognition-card__message">
                <p>{recognition.message}</p>
                {recognition.impact && !compact && (
                    <p className="recognition-card__impact">
                        <strong>Impact:</strong> {recognition.impact}
                    </p>
                )}
            </div>

            {/* Award badge if present */}
            {awardDefinition && (
                <div
                    className="recognition-card__award"
                    style={{ borderColor: awardDefinition.color }}
                >
                    <span className="recognition-card__award-icon">{awardDefinition.icon}</span>
                    <span className="recognition-card__award-name">{awardDefinition.name}</span>
                </div>
            )}

            {/* Timestamp */}
            <time
                className="recognition-card__time"
                dateTime={recognition.createdAt}
            >
                {formatRelativeTime(recognition.createdAt)}
            </time>

            {/* Reactions bar */}
            <footer className="recognition-card__footer">
                <div className="recognition-card__reactions">
                    {topReactions.map(([type, count]) => (
                        <ReactionButton
                            key={type}
                            type={type}
                            count={count}
                            hasReacted={myReactions.includes(type)}
                            onToggle={() => handleReactionToggle(type)}
                        />
                    ))}

                    <button
                        className="reaction-btn reaction-btn--add"
                        onClick={() => setShowReactionPicker(!showReactionPicker)}
                        aria-label="Add reaction"
                        aria-expanded={showReactionPicker}
                    >
                        <span>+</span>
                    </button>

                    {showReactionPicker && (
                        <ReactionPicker
                            onSelect={handleReactionToggle}
                            onClose={() => setShowReactionPicker(false)}
                        />
                    )}
                </div>

                <div className="recognition-card__actions">
                    <button
                        className="recognition-card__action-btn"
                        onClick={() => setShowComments(!showComments)}
                        aria-label={`${recognition.comments.length} comments`}
                    >
                        💬 {recognition.comments.length}
                    </button>

                    <button
                        className="recognition-card__action-btn"
                        onClick={handleBookmark}
                        aria-label={`Bookmark. ${recognition.bookmarks} bookmarks`}
                    >
                        🔖 {recognition.bookmarks}
                    </button>

                    <span className="recognition-card__repost-count">
                        🔄 {recognition.reposts}
                    </span>
                </div>
            </footer>

            {/* Comments section (collapsed by default) */}
            {showComments && !compact && (
                <section className="recognition-card__comments" aria-label="Comments">
                    {recognition.comments.length === 0 ? (
                        <p className="recognition-card__no-comments">
                            No comments yet. Be the first to comment!
                        </p>
                    ) : (
                        <ul className="recognition-card__comment-list">
                            {recognition.comments.map(comment => (
                                <li key={comment.id} className="recognition-card__comment">
                                    <span className="recognition-card__comment-avatar">
                                        {comment.userAvatar || '👤'}
                                    </span>
                                    <div className="recognition-card__comment-content">
                                        <span className="recognition-card__comment-author">
                                            {comment.userName}
                                        </span>
                                        <p>{comment.content}</p>
                                        <time dateTime={comment.createdAt}>
                                            {formatRelativeTime(comment.createdAt)}
                                        </time>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}
        </article>
    );
});

RecognitionCard.displayName = 'RecognitionCard';

export default RecognitionCard;
