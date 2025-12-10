import React from 'react';
import { LibraryHub } from './LibraryHub';

interface LibraryPageProps {
    onNavigate?: (section: string) => void;
}

/**
 * Library Page - 10x Redesign
 * 
 * Comprehensive knowledge hub for Product Managers featuring:
 * - Curated book collections
 * - Learning paths (career + skill)
 * - Personal reading list & progress tracking
 * - Reading goals and statistics
 */
export const LibraryPage: React.FC<LibraryPageProps> = ({ onNavigate }) => {
    return <LibraryHub onNavigate={onNavigate} />;
};

export default LibraryPage;
