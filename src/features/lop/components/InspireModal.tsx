import React, { useState } from 'react';
import {
    X,
    Lightbulb,
    Send,
    Sparkles,
    Check,
    Tag,
    AlertCircle,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';

// ═══════════════════════════════════════════════════════════════════════════
// INSPIRE MODAL — Submit topic ideas for future sessions
// Delightful form with validation and celebration animation
// ═══════════════════════════════════════════════════════════════════════════

interface InspireModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: { title: string; description: string; category: string; tags: string[] }) => void;
}

const CATEGORIES = [
    { id: 'product-craft', label: 'Product Craft', icon: '🎯' },
    { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { id: 'internal-playbook', label: 'Internal Playbook', icon: '📘' },
    { id: 'leadership', label: 'Leadership', icon: '👑' },
    { id: 'tech-trends', label: 'Tech Trends', icon: '🚀' },
];

const SUGGESTED_TAGS = [
    'AI/ML', 'Customer Discovery', 'Metrics', 'Roadmapping', 'Stakeholders',
    'Research', 'Prioritization', 'Strategy', 'Growth', 'UX',
];

export const InspireModal: React.FC<InspireModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (title.length < 10) {
            newErrors.title = 'Title should be at least 10 characters';
        }
        if (description.length < 50) {
            newErrors.description = 'Please tell us more about why this matters (at least 50 characters)';
        }
        if (!category) {
            newErrors.category = 'Please select a category';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        onSubmit?.({ title, description, category, tags: selectedTags });
        setIsSubmitting(false);
        setIsSuccess(true);

        // Auto-close after celebration
        setTimeout(() => {
            handleClose();
        }, 2500);
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setCategory('');
        setSelectedTags([]);
        setErrors({});
        setIsSuccess(false);
        onClose();
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4">
                <div
                    className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Success State */}
                    {isSuccess ? (
                        <div className="p-8 text-center">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce-in">
                                <Sparkles className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                🎉 Topic Submitted!
                            </h2>
                            <p className="text-gray-500">
                                Thank you for inspiring the community! We'll review your idea and reach out if it gets selected.
                            </p>

                            {/* Confetti particles */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                {[...Array(20)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-2 h-2 rounded-full animate-float"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                            backgroundColor: ['#f59e0b', '#10b981', '#8b5cf6', '#ec4899'][i % 4],
                                            animationDelay: `${Math.random() * 2}s`,
                                            animationDuration: `${2 + Math.random() * 2}s`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                        <Lightbulb className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-900">Inspire a Talk</h2>
                                        <p className="text-sm text-gray-500">Share your topic idea</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="p-5 space-y-5">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Topic Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., How to run effective sprint planning"
                                        className={cn(
                                            "w-full px-4 py-2.5 border rounded-xl outline-none transition-all",
                                            errors.title
                                                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                                : "border-gray-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                                        )}
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Why does this matter? *
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Explain why this topic would be valuable for the community..."
                                        rows={3}
                                        className={cn(
                                            "w-full px-4 py-2.5 border rounded-xl outline-none transition-all resize-none",
                                            errors.description
                                                ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                                : "border-gray-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                                        )}
                                    />
                                    <div className="flex justify-between mt-1">
                                        {errors.description ? (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.description}
                                            </p>
                                        ) : (
                                            <span />
                                        )}
                                        <span className={cn(
                                            "text-xs",
                                            description.length < 50 ? "text-gray-400" : "text-emerald-500"
                                        )}>
                                            {description.length}/50+
                                        </span>
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Category *
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setCategory(cat.id)}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all",
                                                    category === cat.id
                                                        ? "border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-100"
                                                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                                                )}
                                            >
                                                <span>{cat.icon}</span>
                                                <span className="truncate">{cat.label}</span>
                                                {category === cat.id && <Check className="w-4 h-4 ml-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.category && (
                                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.category}
                                        </p>
                                    )}
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        <Tag className="w-4 h-4 inline mr-1" />
                                        Related Topics <span className="font-normal text-gray-400">(optional)</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {SUGGESTED_TAGS.map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                className={cn(
                                                    "px-2.5 py-1 text-sm rounded-full border transition-all",
                                                    selectedTags.includes(tag)
                                                        ? "bg-rose-100 text-rose-700 border-rose-200"
                                                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                                )}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                                <Button variant="ghost" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    leftIcon={isSubmitting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Idea'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default InspireModal;
