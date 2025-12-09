/**
 * Toast X - Company Values Types
 * The 6 core values that anchor all recognition
 */

// ═══════════════════════════════════════════════════════════════════════════
// COMPANY VALUES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The 6 core company values
 * Every recognition must be anchored to one of these values
 */
export type CompanyValue =
    | 'DO_IT_DIFFERENTLY'
    | 'HEALTHCARE_IS_PERSONAL'
    | 'BE_ALL_IN'
    | 'OWN_THE_OUTCOME'
    | 'DO_THE_RIGHT_THING'
    | 'EXPLORE_FEARLESSLY';

/**
 * Complete definition of a company value
 */
export interface ValueDefinition {
    readonly id: CompanyValue;
    readonly name: string;
    readonly shortName: string;
    readonly description: string;
    readonly icon: string;
    readonly color: string;
    readonly gradient: string;
    readonly awardName: string;
    readonly awardIcon: string;
    readonly behaviors: readonly string[];
}

/**
 * Mapping of all company values
 */
export type ValueDefinitions = Readonly<Record<CompanyValue, ValueDefinition>>;
