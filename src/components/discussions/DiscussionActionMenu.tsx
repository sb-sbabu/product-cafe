import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2, Flag, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils'; // Relative path to avoid alias issues

interface DiscussionActionMenuProps {
    discussionId: string;
    authorId: string;
    currentUserId: string;
    onEdit: () => void;
    onDelete: () => void;
    onReport: () => void;
    onPromoteToFAQ?: () => void;
    className?: string;
}

export const DiscussionActionMenu: React.FC<DiscussionActionMenuProps> = ({
    discussionId: _discussionId,
    authorId,
    currentUserId,
    onEdit,
    onDelete,
    onReport,
    onPromoteToFAQ,
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isAuthor = authorId === currentUserId;
    const isAdmin = currentUserId === 'admin'; // Simple check for now

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={cn('relative', className)} ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Discussion options"
            >
                <MoreVertical className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-8 z-50 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-in fade-in-0 zoom-in-95 duration-100 origin-top-right">
                    {(isAuthor || isAdmin) && (
                        <>
                            <button
                                onClick={() => {
                                    onEdit();
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Discussion
                            </button>
                            <button
                                onClick={() => {
                                    onDelete();
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Discussion
                            </button>
                            {onPromoteToFAQ && (
                                <button
                                    onClick={() => {
                                        onPromoteToFAQ();
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    Promote to FAQ
                                </button>
                            )}
                        </>
                    )}

                    {!isAuthor && (
                        <button
                            onClick={() => {
                                onReport();
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Flag className="w-4 h-4" />
                            Report Content
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
