import { useEffect } from 'react';
import { usePointsStore } from '../../stores/pointsStore';
import { useLevelStore } from '../../stores/levelStore';
import { LevelUpCelebration } from './LevelUpCelebration';

export const GamificationEngine = () => {
    const totalPoints = usePointsStore(state => state.totalPoints);
    const checkLevelUp = useLevelStore(state => state.checkLevelUp);
    const { justLeveledUp, clearLevelUpFlag, currentLevel, previousLevel } = useLevelStore();

    // Check for level up whenever points change
    useEffect(() => {
        checkLevelUp();
    }, [totalPoints, checkLevelUp]);

    return (
        <>
            {justLeveledUp && previousLevel && (
                <LevelUpCelebration
                    newLevel={currentLevel}
                    oldLevel={previousLevel}
                    onClose={clearLevelUpFlag}
                />
            )}
        </>
    );
};
