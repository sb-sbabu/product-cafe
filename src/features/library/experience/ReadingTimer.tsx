/**
 * ReadingTimer - Pomodoro-style reading session tracker
 * 
 * Features:
 * - Start/pause/stop reading sessions
 * - Customizable session lengths (25/45/60 min)
 * - Break reminders
 * - Deep reading mode (focus UI)
 * - Session summaries
 * - Progress auto-save
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Play, Pause, Square, Clock, BookOpen, Coffee,
    RotateCcw, Volume2, VolumeX, Maximize2, X, Sparkles
} from 'lucide-react';
import { useLibraryStore } from '../libraryStore';
import { cn } from '../../../lib/utils';

interface ReadingTimerProps {
    bookId: string;
    bookTitle: string;
    onClose?: () => void;
    variant?: 'widget' | 'fullscreen';
    className?: string;
}

type TimerState = 'idle' | 'reading' | 'paused' | 'break';
type SessionLength = 25 | 45 | 60;

const SESSION_PRESETS: { value: SessionLength; label: string; icon: string }[] = [
    { value: 25, label: 'Focus Sprint', icon: '⚡' },
    { value: 45, label: 'Deep Session', icon: '🎯' },
    { value: 60, label: 'Marathon', icon: '🏆' },
];

export const ReadingTimer: React.FC<ReadingTimerProps> = ({
    bookId,
    bookTitle,
    onClose,
    variant = 'widget',
    className
}) => {
    const [timerState, setTimerState] = useState<TimerState>('idle');
    const [sessionLength, setSessionLength] = useState<SessionLength>(25);
    const [timeRemaining, setTimeRemaining] = useState(25 * 60); // in seconds
    const [totalReadingTime, setTotalReadingTime] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showSummary, setShowSummary] = useState(false);
    const [pagesRead, setPagesRead] = useState(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<Date | null>(null);

    const { updateBookProgress, getBookProgress, earnCredits } = useLibraryStore();
    const progress = getBookProgress(bookId);

    // Timer logic
    useEffect(() => {
        if (timerState === 'reading') {
            intervalRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        // Session complete
                        handleSessionComplete();
                        return 0;
                    }
                    return prev - 1;
                });
                setTotalReadingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [timerState]);

    const handleSessionComplete = useCallback(() => {
        setTimerState('break');
        setShowSummary(true);

        // Award credits for completing reading session
        earnCredits(
            'book_progress',
            `Completed ${sessionLength} minute reading session`,
            { bookId, duration: sessionLength }
        );

        // Play completion sound
        if (soundEnabled) {
            // Would play sound here
        }
    }, [sessionLength, bookId, soundEnabled, earnCredits]);

    const startSession = useCallback(() => {
        setTimerState('reading');
        setTimeRemaining(sessionLength * 60);
        startTimeRef.current = new Date();
    }, [sessionLength]);

    const pauseSession = useCallback(() => {
        setTimerState('paused');
    }, []);

    const resumeSession = useCallback(() => {
        setTimerState('reading');
    }, []);

    const stopSession = useCallback(() => {
        const minutesRead = Math.floor(totalReadingTime / 60);
        if (minutesRead > 0) {
            setShowSummary(true);
        }
        setTimerState('idle');
        setTimeRemaining(sessionLength * 60);
        setTotalReadingTime(0);
    }, [totalReadingTime, sessionLength]);

    const resetTimer = useCallback(() => {
        setTimerState('idle');
        setTimeRemaining(sessionLength * 60);
        setTotalReadingTime(0);
        setShowSummary(false);
        setPagesRead(0);
    }, [sessionLength]);

    const handleSaveSummary = useCallback(() => {
        // Update book progress
        if (pagesRead > 0 && progress) {
            const newPagesRead = (progress.pagesRead || 0) + pagesRead;
            // This would calculate new progress percentage
            updateBookProgress(bookId, Math.min(100, (progress.progress || 0) + 5));
        }

        resetTimer();
    }, [pagesRead, progress, bookId, updateBookProgress, resetTimer]);

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress ring
    const progressPercent = ((sessionLength * 60 - timeRemaining) / (sessionLength * 60)) * 100;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    // Session Summary Modal
    if (showSummary) {
        return (
            <div className={cn(
                "bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden",
                variant === 'fullscreen' && "fixed inset-0 z-50",
                className
            )}>
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Great Session! 🎉</h3>
                    <p className="text-gray-500">You read for {Math.floor(totalReadingTime / 60)} minutes</p>

                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            How many pages did you read?
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={pagesRead}
                            onChange={(e) => setPagesRead(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                            placeholder="0"
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={resetTimer}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleSaveSummary}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/20"
                        >
                            Save Progress
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl overflow-hidden",
            variant === 'fullscreen' && "fixed inset-0 z-50 flex flex-col items-center justify-center",
            className
        )}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-purple-300" />
                    </div>
                    <div>
                        <p className="text-white font-semibold truncate max-w-[200px]">{bookTitle}</p>
                        <p className="text-purple-300 text-xs">Reading Session</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Timer Display */}
            <div className="p-8 flex flex-col items-center">
                {/* Circular Progress */}
                <div className="relative w-40 h-40 mb-6">
                    <svg className="w-full h-full -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="80"
                            cy="80"
                            r="45"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                            fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="80"
                            cy="80"
                            r="45"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white font-mono">
                            {formatTime(timeRemaining)}
                        </span>
                        <span className="text-purple-300 text-sm mt-1">
                            {timerState === 'reading' ? 'Reading...' : timerState === 'paused' ? 'Paused' : 'Ready'}
                        </span>
                    </div>
                </div>

                {/* Session Presets (only show when idle) */}
                {timerState === 'idle' && (
                    <div className="flex gap-2 mb-6">
                        {SESSION_PRESETS.map(preset => (
                            <button
                                key={preset.value}
                                onClick={() => {
                                    setSessionLength(preset.value);
                                    setTimeRemaining(preset.value * 60);
                                }}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                                    sessionLength === preset.value
                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                                )}
                            >
                                {preset.icon} {preset.value}m
                            </button>
                        ))}
                    </div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-4">
                    {timerState === 'idle' && (
                        <button
                            onClick={startSession}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30 transform hover:scale-105"
                        >
                            <Play className="w-5 h-5" />
                            Start Reading
                        </button>
                    )}

                    {timerState === 'reading' && (
                        <>
                            <button
                                onClick={pauseSession}
                                className="p-4 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"
                            >
                                <Pause className="w-6 h-6" />
                            </button>
                            <button
                                onClick={stopSession}
                                className="p-4 bg-red-500/20 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                                <Square className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {timerState === 'paused' && (
                        <>
                            <button
                                onClick={resumeSession}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                            >
                                <Play className="w-5 h-5" />
                                Resume
                            </button>
                            <button
                                onClick={stopSession}
                                className="p-3 bg-white/10 rounded-xl text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                            >
                                <Square className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {timerState === 'break' && (
                        <button
                            onClick={resetTimer}
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
                        >
                            <RotateCcw className="w-5 h-5" />
                            New Session
                        </button>
                    )}
                </div>

                {/* Total time read */}
                {totalReadingTime > 0 && (
                    <div className="mt-6 px-4 py-2 bg-white/5 rounded-full">
                        <p className="text-purple-300 text-sm">
                            Total today: {Math.floor(totalReadingTime / 60)}m {totalReadingTime % 60}s
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReadingTimer;
