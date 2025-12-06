/**
 * Level Store - Progression System
 * 
 * Manages user level, progression, and level-up detection.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Level } from '../types/gamification';
import { LEVELS } from '../types/gamification';
import { usePointsStore } from './pointsStore';

// ============================================================================
// STORE STATE
// ============================================================================

interface LevelStoreState {
    // State
    currentLevel: Level;
    previousLevel: Level | null;
    justLeveledUp: boolean;

    // Actions
    calculateLevel: (points: number) => Level;
    checkLevelUp: () => { leveledUp: boolean; newLevel?: Level; oldLevel?: Level };
    getNextLevelThreshold: () => number | null;
    getLevelProgress: () => { current: number; next: number; percent: number };
    clearLevelUpFlag: () => void;
    getPrivileges: () => string[];
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useLevelStore = create<LevelStoreState>()(
    persist(
        (set, get) => ({
            // Initial state
            currentLevel: LEVELS[0],
            previousLevel: null,
            justLeveledUp: false,

            // Calculate level from points
            calculateLevel: (points) => {
                for (let i = LEVELS.length - 1; i >= 0; i--) {
                    if (points >= LEVELS[i].minPoints) {
                        return LEVELS[i];
                    }
                }
                return LEVELS[0];
            },

            // Check if user leveled up and update state
            checkLevelUp: () => {
                const points = usePointsStore.getState().totalPoints;
                const newLevel = get().calculateLevel(points);
                const currentLevel = get().currentLevel;

                if (newLevel.id > currentLevel.id) {
                    set({
                        previousLevel: currentLevel,
                        currentLevel: newLevel,
                        justLeveledUp: true,
                    });

                    return {
                        leveledUp: true,
                        newLevel,
                        oldLevel: currentLevel,
                    };
                }

                return { leveledUp: false };
            },

            // Get points needed for next level
            getNextLevelThreshold: () => {
                const currentLevel = get().currentLevel;
                if (currentLevel.maxPoints === null) {
                    return null; // Already at max level
                }
                return currentLevel.maxPoints + 1;
            },

            // Get level progress as percentage
            getLevelProgress: () => {
                const points = usePointsStore.getState().totalPoints;
                const currentLevel = get().currentLevel;

                if (currentLevel.maxPoints === null) {
                    // Max level - always 100%
                    return { current: points, next: points, percent: 100 };
                }

                const levelRange = currentLevel.maxPoints - currentLevel.minPoints + 1;
                const pointsInLevel = points - currentLevel.minPoints;
                const percent = Math.min(100, Math.round((pointsInLevel / levelRange) * 100));

                return {
                    current: points,
                    next: currentLevel.maxPoints + 1,
                    percent,
                };
            },

            // Clear level up flag after celebration
            clearLevelUpFlag: () => {
                set({ justLeveledUp: false, previousLevel: null });
            },

            // Get current privileges
            getPrivileges: () => {
                // Accumulate privileges from all levels up to current
                const currentLevel = get().currentLevel;
                const privileges: string[] = [];

                for (const level of LEVELS) {
                    if (level.id <= currentLevel.id) {
                        privileges.push(...level.privileges);
                    }
                }

                return privileges;
            },
        }),
        {
            name: 'cafe-level',
        }
    )
);
