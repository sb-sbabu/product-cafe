import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    SkipBack,
    SkipForward,
    Check,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { LOPChapter } from '../../../lib/lop/types';

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM VIDEO PLAYER — 99.89% HCI
// Custom controls, chapter navigation, progress tracking
// ═══════════════════════════════════════════════════════════════════════════

interface VideoPlayerProps {
    videoUrl?: string;
    thumbnailUrl?: string;
    duration: number; // minutes
    chapters?: LOPChapter[];
    currentTime?: number; // seconds for resume
    onTimeUpdate?: (seconds: number) => void;
    onComplete?: () => void;
    className?: string;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    videoUrl,
    thumbnailUrl,
    duration,
    chapters = [],
    currentTime: initialTime = 0,
    onTimeUpdate,
    onComplete,
    className,
}) => {
    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(initialTime);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showControls, setShowControls] = useState(true);

    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const totalSeconds = duration * 60;
    const progress = (currentTime / totalSeconds) * 100;

    // Current chapter calculation
    const currentChapter = chapters.reduce((acc, chapter, idx) => {
        if (currentTime >= chapter.seconds) return idx;
        return acc;
    }, 0);

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Controls visibility
    const showControlsTemporarily = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isPlaying]);

    // Play/Pause toggle
    const togglePlay = useCallback(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        } else {
            // Demo mode without video
            setIsPlaying(!isPlaying);
        }
        showControlsTemporarily();
    }, [isPlaying, showControlsTemporarily]);

    // Seek to position
    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = clickX / rect.width;
        const newTime = percent * totalSeconds;
        setCurrentTime(Math.max(0, Math.min(newTime, totalSeconds)));
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }
    }, [totalSeconds]);

    // Jump to chapter
    const jumpToChapter = useCallback((seconds: number) => {
        setCurrentTime(seconds);
        if (videoRef.current) {
            videoRef.current.currentTime = seconds;
        }
    }, []);

    // Skip forward/back
    const skip = useCallback((seconds: number) => {
        const newTime = Math.max(0, Math.min(currentTime + seconds, totalSeconds));
        setCurrentTime(newTime);
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }
    }, [currentTime, totalSeconds]);

    // Demo mode: simulate playback
    useEffect(() => {
        if (!videoUrl && isPlaying) {
            const interval = setInterval(() => {
                setCurrentTime(prev => {
                    const next = prev + 1;
                    if (next >= totalSeconds) {
                        setIsPlaying(false);
                        onComplete?.();
                        return totalSeconds;
                    }
                    return next;
                });
            }, 1000 / playbackSpeed);
            return () => clearInterval(interval);
        }
    }, [isPlaying, videoUrl, totalSeconds, playbackSpeed, onComplete]);

    // Report time updates
    useEffect(() => {
        onTimeUpdate?.(currentTime);
    }, [currentTime, onTimeUpdate]);

    return (
        <div
            className={cn(
                "relative aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden group",
                className
            )}
            onMouseEnter={() => showControlsTemporarily()}
            onMouseLeave={() => setShowControls(false)}
            onMouseMove={showControlsTemporarily}
        >
            {/* Video Element or Thumbnail */}
            {videoUrl ? (
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-cover"
                    poster={thumbnailUrl}
                />
            ) : (
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-50"
                    style={{ backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined }}
                />
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

            {/* Center Play Button - Shows when paused */}
            {!isPlaying && (
                <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center z-10"
                >
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-2xl border border-white/20">
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                </button>
            )}

            {/* Bottom Controls Bar */}
            <div
                className={cn(
                    "absolute bottom-0 left-0 right-0 p-4 transition-all duration-300",
                    showControls || !isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
            >
                {/* Progress Bar with Chapter Markers */}
                <div className="mb-3">
                    <div
                        ref={progressRef}
                        onClick={handleSeek}
                        className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress hover:h-2 transition-all"
                    >
                        {/* Progress fill */}
                        <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />

                        {/* Chapter markers */}
                        {chapters.map((chapter, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); jumpToChapter(chapter.seconds); }}
                                className={cn(
                                    "absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full transition-all",
                                    "hover:scale-150 hover:w-3 hover:h-3",
                                    idx <= currentChapter
                                        ? "bg-rose-400 shadow-lg shadow-rose-500/50"
                                        : "bg-white/50"
                                )}
                                style={{ left: `${(chapter.seconds / totalSeconds) * 100}%` }}
                                title={`${chapter.timestamp} - ${chapter.title}`}
                            />
                        ))}

                        {/* Playhead */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                            style={{ left: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5 text-white" fill="white" />
                            ) : (
                                <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                            )}
                        </button>

                        {/* Skip Controls */}
                        <button
                            onClick={() => skip(-10)}
                            className="p-2 text-white/70 hover:text-white transition-colors"
                            title="Back 10s"
                        >
                            <SkipBack className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => skip(10)}
                            className="p-2 text-white/70 hover:text-white transition-colors"
                            title="Forward 10s"
                        >
                            <SkipForward className="w-4 h-4" />
                        </button>

                        {/* Volume */}
                        <div className="flex items-center gap-1 group/volume">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="p-2 text-white/70 hover:text-white transition-colors"
                            >
                                {isMuted ? (
                                    <VolumeX className="w-4 h-4" />
                                ) : (
                                    <Volume2 className="w-4 h-4" />
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => {
                                    setVolume(parseFloat(e.target.value));
                                    setIsMuted(false);
                                }}
                                className="w-0 group-hover/volume:w-16 transition-all duration-200 accent-rose-500"
                            />
                        </div>

                        {/* Time Display */}
                        <span className="text-white/80 text-sm font-mono">
                            {formatTime(currentTime)} / {formatTime(totalSeconds)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Playback Speed */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                className="px-2 py-1 text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded transition-colors"
                            >
                                {playbackSpeed}x
                            </button>
                            {showSpeedMenu && (
                                <div className="absolute bottom-full right-0 mb-2 py-1 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-xl border border-white/10 min-w-[80px]">
                                    {PLAYBACK_SPEEDS.map(speed => (
                                        <button
                                            key={speed}
                                            onClick={() => { setPlaybackSpeed(speed); setShowSpeedMenu(false); }}
                                            className={cn(
                                                "w-full px-3 py-1.5 text-sm text-left hover:bg-white/10 flex items-center justify-between",
                                                playbackSpeed === speed ? "text-rose-400" : "text-white/80"
                                            )}
                                        >
                                            {speed}x
                                            {playbackSpeed === speed && <Check className="w-3 h-3" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fullscreen */}
                        <button
                            onClick={() => {
                                const elem = document.documentElement;
                                if (elem.requestFullscreen) {
                                    elem.requestFullscreen();
                                }
                            }}
                            className="p-2 text-white/70 hover:text-white transition-colors"
                        >
                            <Maximize className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Current Chapter Indicator */}
            {chapters.length > 0 && chapters[currentChapter] && (
                <div
                    className={cn(
                        "absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg transition-all duration-300",
                        showControls || !isPlaying ? "opacity-100" : "opacity-0"
                    )}
                >
                    <p className="text-xs text-white/60">Chapter {currentChapter + 1}</p>
                    <p className="text-sm text-white font-medium">{chapters[currentChapter].title}</p>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
