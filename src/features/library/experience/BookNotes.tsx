/**
 * BookNotes - Rich note-taking for books
 * 
 * Features:
 * - Chapter-organized notes
 * - Link notes to highlights
 * - Tag and categorize
 * - Rich text formatting
 * - Export capability
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
    BookOpen, Plus, Trash2, Tag, Edit3, Save, X,
    ChevronDown, ChevronRight, Sparkles, Download, Search
} from 'lucide-react';
import { useLibraryStore } from '../libraryStore';
import { cn } from '../../../lib/utils';

interface Note {
    id: string;
    bookId: string;
    chapter?: string;
    content: string;
    tags: string[];
    highlightId?: string;
    createdAt: string;
    updatedAt: string;
}

interface BookNotesProps {
    bookId: string;
    bookTitle: string;
    className?: string;
}

// Demo tags for quick tagging
const QUICK_TAGS = ['key-insight', 'action-item', 'question', 'quote', 'summary', 'concept'];

export const BookNotes: React.FC<BookNotesProps> = ({
    bookId,
    bookTitle,
    className
}) => {
    const { userLibrary } = useLibraryStore();

    // Get highlights for this book to link
    const bookHighlights = useMemo(() =>
        userLibrary.highlights.filter(h => h.bookId === bookId),
        [userLibrary.highlights, bookId]
    );

    // Local notes state (would be persisted in real app)
    const [notes, setNotes] = useState<Note[]>([
        {
            id: 'demo-1',
            bookId,
            chapter: 'Chapter 1',
            content: 'The key distinction between empowered teams and feature teams is ownership of outcomes, not just outputs.',
            tags: ['key-insight', 'teams'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ]);

    const [isAddingNote, setIsAddingNote] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(['Chapter 1']));

    // New note form state
    const [newNote, setNewNote] = useState({
        chapter: '',
        content: '',
        tags: [] as string[],
        highlightId: undefined as string | undefined
    });

    // Filter notes by search
    const filteredNotes = useMemo(() => {
        if (!searchQuery.trim()) return notes;

        const query = searchQuery.toLowerCase();
        return notes.filter(note =>
            note.content.toLowerCase().includes(query) ||
            note.tags.some(t => t.toLowerCase().includes(query)) ||
            note.chapter?.toLowerCase().includes(query)
        );
    }, [notes, searchQuery]);

    // Group notes by chapter
    const notesByChapter = useMemo(() => {
        const grouped: Record<string, Note[]> = {};

        filteredNotes.forEach(note => {
            const chapter = note.chapter || 'General';
            if (!grouped[chapter]) grouped[chapter] = [];
            grouped[chapter].push(note);
        });

        return grouped;
    }, [filteredNotes]);

    const toggleChapter = (chapter: string) => {
        setExpandedChapters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(chapter)) {
                newSet.delete(chapter);
            } else {
                newSet.add(chapter);
            }
            return newSet;
        });
    };

    const handleAddNote = useCallback(() => {
        if (!newNote.content.trim()) return;

        const note: Note = {
            id: `note-${Date.now()}`,
            bookId,
            chapter: newNote.chapter || undefined,
            content: newNote.content.trim(),
            tags: newNote.tags,
            highlightId: newNote.highlightId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setNotes(prev => [note, ...prev]);
        setNewNote({ chapter: '', content: '', tags: [], highlightId: undefined });
        setIsAddingNote(false);

        // Expand the chapter containing the new note
        if (note.chapter) {
            setExpandedChapters(prev => new Set([...prev, note.chapter!]));
        }
    }, [bookId, newNote]);

    const deleteNote = useCallback((noteId: string) => {
        setNotes(prev => prev.filter(n => n.id !== noteId));
    }, []);

    const toggleTag = (tag: string) => {
        setNewNote(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const exportNotes = () => {
        const markdown = notes.map(note => {
            let md = '';
            if (note.chapter) md += `## ${note.chapter}\n\n`;
            md += note.content + '\n';
            if (note.tags.length) md += `\n*Tags: ${note.tags.join(', ')}*\n`;
            return md;
        }).join('\n---\n\n');

        const blob = new Blob([`# Notes: ${bookTitle}\n\n${markdown}`], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notes-${bookId}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={cn("bg-white rounded-2xl border border-gray-100 overflow-hidden", className)}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <Edit3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Book Notes</h3>
                            <p className="text-xs text-gray-500">{notes.length} notes on {bookTitle}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportNotes}
                            className="p-2 rounded-lg hover:bg-white/50 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Export as Markdown"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsAddingNote(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Note
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                    />
                </div>
            </div>

            {/* Add Note Form */}
            {isAddingNote && (
                <div className="p-4 border-b border-gray-100 bg-amber-50/50 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Chapter (optional)"
                            value={newNote.chapter}
                            onChange={(e) => setNewNote(prev => ({ ...prev, chapter: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                        />

                        <textarea
                            placeholder="Your note..."
                            value={newNote.content}
                            onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none"
                            autoFocus
                        />

                        {/* Quick Tags */}
                        <div className="flex flex-wrap gap-1.5">
                            {QUICK_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium transition-colors",
                                        newNote.tags.includes(tag)
                                            ? "bg-amber-200 text-amber-800"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    )}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>

                        {/* Link to Highlight */}
                        {bookHighlights.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Link to highlight:</p>
                                <select
                                    value={newNote.highlightId || ''}
                                    onChange={(e) => setNewNote(prev => ({ ...prev, highlightId: e.target.value || undefined }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                                >
                                    <option value="">None</option>
                                    {bookHighlights.map(h => (
                                        <option key={h.id} value={h.id}>
                                            "{h.text.slice(0, 50)}..."
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsAddingNote(false);
                                    setNewNote({ chapter: '', content: '', tags: [], highlightId: undefined });
                                }}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddNote}
                                disabled={!newNote.content.trim()}
                                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes List */}
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {Object.keys(notesByChapter).length === 0 ? (
                    <div className="p-8 text-center">
                        <Edit3 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 mb-2">No notes yet</p>
                        <button
                            onClick={() => setIsAddingNote(true)}
                            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                        >
                            Add your first note
                        </button>
                    </div>
                ) : (
                    Object.entries(notesByChapter).map(([chapter, chapterNotes]) => (
                        <div key={chapter}>
                            {/* Chapter Header */}
                            <button
                                onClick={() => toggleChapter(chapter)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    {expandedChapters.has(chapter) ? (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    )}
                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">{chapter}</span>
                                </div>
                                <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                                    {chapterNotes.length}
                                </span>
                            </button>

                            {/* Chapter Notes */}
                            {expandedChapters.has(chapter) && (
                                <div className="bg-white">
                                    {chapterNotes.map(note => (
                                        <div key={note.id} className="px-6 py-4 border-b border-gray-50 last:border-0 group">
                                            <div className="flex items-start gap-3">
                                                <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        {note.content}
                                                    </p>

                                                    {note.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {note.tags.map(tag => (
                                                                <span
                                                                    key={tag}
                                                                    className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full font-medium"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <p className="text-[10px] text-gray-400 mt-2">
                                                        {new Date(note.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => deleteNote(note.id)}
                                                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BookNotes;
