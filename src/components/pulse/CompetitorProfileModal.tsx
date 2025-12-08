import React, { useMemo } from 'react';
import type { CompetitorProfile } from '../../lib/pulse/competitorData';
import { getIntelligentSignals } from '../../lib/pulse/notifications';
import {
    X,
    ExternalLink,
    MapPin,
    Users,
    Calendar,
    Target,
    Eye,
    EyeOff,
    AlertTriangle,
    TrendingUp,
    Bell,
    Share2,
    Activity,
    Star,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR PROFILE MODAL — Full profile with head-to-head comparison
// ═══════════════════════════════════════════════════════════════════════════

interface CompetitorProfileModalProps {
    competitor: CompetitorProfile;
    onClose: () => void;
    onToggleWatchlist?: (id: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// HEAD-TO-HEAD CAPABILITY RATINGS (PRD §2.2 - Competitor Profile Structure)
// ─────────────────────────────────────────────────────────────────────────────

type CapabilityKey = 'payerNetwork' | 'rcmDepth' | 'aiMl' | 'priorAuth' | 'patientExp' | 'interoperability' | 'analytics';

interface CapabilityRating {
    label: string;
    availityScore: 1 | 2 | 3 | 4 | 5;
    description?: string;
}

const AVAILITY_CAPABILITIES: Record<CapabilityKey, CapabilityRating> = {
    payerNetwork: { label: 'Payer Network', availityScore: 5, description: 'Connections to major payers' },
    rcmDepth: { label: 'RCM Depth', availityScore: 4, description: 'Revenue cycle capabilities' },
    aiMl: { label: 'AI/ML', availityScore: 3, description: 'AI-powered automation' },
    priorAuth: { label: 'Prior Auth', availityScore: 4, description: 'Prior authorization solutions' },
    patientExp: { label: 'Patient Experience', availityScore: 3, description: 'Patient-facing tools' },
    interoperability: { label: 'Interoperability', availityScore: 4, description: 'FHIR, APIs, data exchange' },
    analytics: { label: 'Analytics', availityScore: 4, description: 'Reporting & insights' },
};

// Competitor-specific ratings (varies by company)
const COMPETITOR_RATINGS: Record<string, Partial<Record<CapabilityKey, 1 | 2 | 3 | 4 | 5>>> = {
    'waystar': { payerNetwork: 3, rcmDepth: 5, aiMl: 4, priorAuth: 4, patientExp: 4, interoperability: 3, analytics: 4 },
    'change-healthcare': { payerNetwork: 4, rcmDepth: 5, aiMl: 4, priorAuth: 4, patientExp: 3, interoperability: 4, analytics: 5 },
    'trizetto': { payerNetwork: 4, rcmDepth: 4, aiMl: 3, priorAuth: 3, patientExp: 2, interoperability: 4, analytics: 4 },
    'inovalon': { payerNetwork: 3, rcmDepth: 4, aiMl: 4, priorAuth: 3, patientExp: 3, interoperability: 4, analytics: 5 },
    'r1-rcm': { payerNetwork: 3, rcmDepth: 5, aiMl: 3, priorAuth: 4, patientExp: 3, interoperability: 3, analytics: 4 },
    'experian-health': { payerNetwork: 3, rcmDepth: 3, aiMl: 3, priorAuth: 3, patientExp: 4, interoperability: 3, analytics: 4 },
    'edifecs': { payerNetwork: 4, rcmDepth: 2, aiMl: 2, priorAuth: 2, patientExp: 2, interoperability: 5, analytics: 3 },
    'cotiviti': { payerNetwork: 4, rcmDepth: 4, aiMl: 3, priorAuth: 3, patientExp: 2, interoperability: 3, analytics: 5 },
    'optum': { payerNetwork: 5, rcmDepth: 5, aiMl: 5, priorAuth: 5, patientExp: 4, interoperability: 4, analytics: 5 },
    'epic': { payerNetwork: 4, rcmDepth: 4, aiMl: 4, priorAuth: 4, patientExp: 5, interoperability: 5, analytics: 5 },
    'oracle-health': { payerNetwork: 3, rcmDepth: 4, aiMl: 4, priorAuth: 3, patientExp: 3, interoperability: 4, analytics: 4 },
    'athenahealth': { payerNetwork: 3, rcmDepth: 4, aiMl: 3, priorAuth: 3, patientExp: 4, interoperability: 4, analytics: 4 },
    'zelis': { payerNetwork: 4, rcmDepth: 3, aiMl: 2, priorAuth: 2, patientExp: 2, interoperability: 3, analytics: 3 },
    'veradigm': { payerNetwork: 2, rcmDepth: 3, aiMl: 3, priorAuth: 2, patientExp: 3, interoperability: 4, analytics: 4 },
    'cohere-health': { payerNetwork: 2, rcmDepth: 2, aiMl: 5, priorAuth: 5, patientExp: 3, interoperability: 4, analytics: 3 },
    'infinitus': { payerNetwork: 2, rcmDepth: 2, aiMl: 5, priorAuth: 3, patientExp: 2, interoperability: 3, analytics: 2 },
    'tennr': { payerNetwork: 1, rcmDepth: 2, aiMl: 5, priorAuth: 3, patientExp: 2, interoperability: 3, analytics: 2 },
    'akasa': { payerNetwork: 2, rcmDepth: 4, aiMl: 5, priorAuth: 4, patientExp: 2, interoperability: 3, analytics: 3 },
    'medal': { payerNetwork: 1, rcmDepth: 3, aiMl: 5, priorAuth: 3, patientExp: 2, interoperability: 2, analytics: 3 },
    'olive-ai': { payerNetwork: 2, rcmDepth: 3, aiMl: 4, priorAuth: 3, patientExp: 2, interoperability: 3, analytics: 3 },
};

// Strategic assessments for each competitor
const STRATEGIC_ASSESSMENTS: Record<string, { threatLevel: 'Critical' | 'High' | 'Medium' | 'Low'; focusAreas: string[]; watchFor: string[] }> = {
    'waystar': {
        threatLevel: 'High',
        focusAreas: ['AI Prior Auth', 'Provider Market Expansion', 'IPO Preparation'],
        watchFor: ['IPO timing', 'Payer market entry', 'AI product launches'],
    },
    'change-healthcare': {
        threatLevel: 'Critical',
        focusAreas: ['Optum Integration', 'Network Effects', 'Data Analytics'],
        watchFor: ['Optum synergies', 'UHG bundling strategy', 'Anti-trust outcomes'],
    },
    'optum': {
        threatLevel: 'Critical',
        focusAreas: ['Vertical Integration', 'AI/ML Investment', 'Care Delivery'],
        watchFor: ['Competitive bundling', 'Payer leverage', 'M&A activity'],
    },
    'epic': {
        threatLevel: 'High',
        focusAreas: ['RCM Module Expansion', 'Payer Platforms', 'Interoperability'],
        watchFor: ['Direct RCM competition', 'Payer product launches', 'Network effects'],
    },
    'cohere-health': {
        threatLevel: 'Medium',
        focusAreas: ['AI Prior Auth', 'Payer Adoption', 'Series D Funding'],
        watchFor: ['Large payer wins', 'Expansion beyond prior auth', 'Acquisition rumors'],
    },
    'infinitus': {
        threatLevel: 'Medium',
        focusAreas: ['Voice AI', 'Eligibility Automation', 'Provider Adoption'],
        watchFor: ['Voice AI commoditization', 'Provider wins', 'Competitive response'],
    },
    'akasa': {
        threatLevel: 'Medium',
        focusAreas: ['Generative AI', 'RCM Automation', 'Health System Sales'],
        watchFor: ['Gen AI roadmap', 'Large health system wins', 'Funding rounds'],
    },
};

// Default assessment for competitors without specific data
const DEFAULT_ASSESSMENT = {
    threatLevel: 'Medium' as const,
    focusAreas: ['Market Expansion', 'Product Development'],
    watchFor: ['Funding rounds', 'Major customer wins', 'Product launches'],
};

// ─────────────────────────────────────────────────────────────────────────────
// STARS COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const Stars: React.FC<{ count: 1 | 2 | 3 | 4 | 5; color?: string }> = ({ count, color = 'text-amber-400' }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
            <Star
                key={i}
                size={12}
                className={cn(i <= count ? color : 'text-gray-200')}
                fill={i <= count ? 'currentColor' : 'none'}
            />
        ))}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TIME AGO HELPER
// ─────────────────────────────────────────────────────────────────────────────

const timeAgo = (dateInput: string | Date): string => {
    try {
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
        if (isNaN(date.getTime())) return 'Unknown';
        const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return `${Math.floor(days / 7)}w ago`;
    } catch {
        return 'Unknown';
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const CompetitorProfileModal: React.FC<CompetitorProfileModalProps> = ({
    competitor,
    onClose,
    onToggleWatchlist,
}) => {
    // 10.70 Performance: Memoize ratings lookup
    const competitorRatings = useMemo(() =>
        COMPETITOR_RATINGS[competitor.id] || {},
        [competitor.id]
    );
    const assessment = useMemo(() =>
        STRATEGIC_ASSESSMENTS[competitor.id] || DEFAULT_ASSESSMENT,
        [competitor.id]
    );

    // Get signals from IntelligentNotificationEngine (has proper entities)
    const allSignals = useMemo(() => getIntelligentSignals(), []);

    // 10.70 Performance: Memoize signal filtering by competitor entities
    const competitorSignals = useMemo(() => {
        const normalizedName = competitor.name.toLowerCase();
        const firstName = competitor.name.split(' ')[0].toLowerCase();

        return allSignals.filter(s => {
            // Check entities.companies first (high integrity)
            if (s.entities?.companies) {
                return s.entities.companies.some(c =>
                    c.toLowerCase().includes(firstName) ||
                    c.toLowerCase().includes(normalizedName)
                );
            }
            // Fallback: Check title/summary for competitor name
            const text = `${s.title} ${s.summary}`.toLowerCase();
            return text.includes(firstName) || text.includes(normalizedName);
        }).slice(0, 5);
    }, [allSignals, competitor.name]);

    const threatColors = {
        Critical: 'bg-red-100 text-red-700 border-red-200',
        High: 'bg-amber-100 text-amber-700 border-amber-200',
        Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        Low: 'bg-green-100 text-green-700 border-green-200',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
            onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="competitor-profile-title"
        >
            {/* 10.95 Mobile: Full-screen on small screens */}
            <div
                className={cn(
                    "relative bg-white shadow-2xl overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300",
                    // Mobile: Full-screen
                    "w-full h-full sm:max-w-2xl sm:max-h-[90vh] sm:h-auto sm:rounded-2xl sm:m-4"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white"
                    style={{ borderTopColor: competitor.color }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                            style={{ backgroundColor: competitor.color }}
                        >
                            {competitor.name.charAt(0)}
                        </div>
                        <div>
                            <h2 id="competitor-profile-title" className="text-lg font-bold text-gray-900">
                                {competitor.name}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-xs font-bold uppercase border",
                                    competitor.tier === 1 && "bg-rose-100 text-rose-700 border-rose-200",
                                    competitor.tier === 2 && "bg-amber-100 text-amber-700 border-amber-200",
                                    competitor.tier === 3 && "bg-cyan-100 text-cyan-700 border-cyan-200",
                                )}>
                                    Tier {competitor.tier}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span>{competitor.category}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Watchlist toggle - 10.90 Touch-friendly */}
                        <button
                            onClick={() => onToggleWatchlist?.(competitor.id)}
                            className={cn(
                                "p-2.5 sm:p-2 rounded-lg transition-all active:scale-95",
                                competitor.watchlisted
                                    ? "bg-cafe-100 text-cafe-600 hover:bg-cafe-200"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                            )}
                            aria-label={competitor.watchlisted ? "Remove from watchlist" : "Add to watchlist"}
                        >
                            {competitor.watchlisted ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>

                        {/* Close button - 10.90 Touch-friendly */}
                        <button
                            onClick={onClose}
                            className="p-2.5 sm:p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors active:scale-95"
                            aria-label="Close profile"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-5">
                    {/* Company Overview */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Users size={14} className="text-gray-400" />
                            Company Overview
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">{competitor.description}</p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {competitor.founded && (
                                <div className="bg-gray-50 rounded-lg p-2.5">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                        <Calendar size={12} /> Founded
                                    </div>
                                    <div className="font-semibold text-gray-900">{competitor.founded}</div>
                                </div>
                            )}
                            {competitor.hq && (
                                <div className="bg-gray-50 rounded-lg p-2.5">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                        <MapPin size={12} /> HQ
                                    </div>
                                    <div className="font-semibold text-gray-900 text-xs">{competitor.hq}</div>
                                </div>
                            )}
                            {competitor.employees && (
                                <div className="bg-gray-50 rounded-lg p-2.5">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                        <Users size={12} /> Employees
                                    </div>
                                    <div className="font-semibold text-gray-900">{competitor.employees}</div>
                                </div>
                            )}
                            {competitor.website && (
                                <a
                                    href={`https://${competitor.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gray-50 rounded-lg p-2.5 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                        <ExternalLink size={12} /> Website
                                    </div>
                                    <div className="font-semibold text-cafe-600 text-xs truncate">{competitor.website}</div>
                                </a>
                            )}
                        </div>
                    </section>

                    {/* Head-to-Head Comparison */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Target size={14} className="text-gray-400" />
                            Head-to-Head vs Availity
                        </h3>
                        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl overflow-hidden">
                            <div className="grid grid-cols-3 gap-0 text-xs font-medium text-gray-500 border-b border-gray-100 bg-gray-50/50">
                                <div className="p-2 pl-3">Capability</div>
                                <div className="p-2 text-center border-x border-gray-100">Availity</div>
                                <div className="p-2 text-center">{competitor.name.split(' ')[0]}</div>
                            </div>

                            {Object.entries(AVAILITY_CAPABILITIES).map(([key, cap]) => {
                                const competitorScore = competitorRatings[key as CapabilityKey] || 3;
                                const availityWins = cap.availityScore > competitorScore;
                                const competitorWins = competitorScore > cap.availityScore;

                                return (
                                    <div
                                        key={key}
                                        className={cn(
                                            "grid grid-cols-3 gap-0 border-b border-gray-50 last:border-0 transition-colors",
                                            "hover:bg-gray-50/50" // 10.60 Row hover
                                        )}
                                    >
                                        <div className="p-2 pl-3 text-sm text-gray-700">{cap.label}</div>
                                        <div className={cn(
                                            "p-2 flex justify-center border-x border-gray-100",
                                            availityWins && "bg-green-50"
                                        )}>
                                            <Stars count={cap.availityScore} color={availityWins ? 'text-green-500' : 'text-amber-400'} />
                                        </div>
                                        <div className={cn(
                                            "p-2 flex justify-center",
                                            competitorWins && "bg-red-50"
                                        )}>
                                            <Stars count={competitorScore} color={competitorWins ? 'text-red-500' : 'text-amber-400'} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Strategic Assessment */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <AlertTriangle size={14} className="text-gray-400" />
                            Strategic Assessment
                        </h3>

                        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-3 space-y-3">
                            {/* Threat Level */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 w-24">Threat Level</span>
                                <span className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-bold uppercase border",
                                    threatColors[assessment.threatLevel]
                                )}>
                                    {assessment.threatLevel}
                                </span>
                            </div>

                            {/* Focus Areas */}
                            <div className="flex items-start gap-3">
                                <span className="text-xs text-gray-500 w-24 shrink-0 pt-0.5">Focus Areas</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {assessment.focusAreas.map((area, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Watch For */}
                            <div className="flex items-start gap-3">
                                <span className="text-xs text-gray-500 w-24 shrink-0 pt-0.5">Watch For</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {assessment.watchFor.map((item, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Recent Signals */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Activity size={14} className="text-gray-400" />
                            Recent Signals ({competitorSignals.length})
                        </h3>

                        {competitorSignals.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-xl">
                                <Activity size={24} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500">No recent signals detected</p>
                                <p className="text-xs text-gray-400 mt-1">Signals will appear here when news is captured</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {competitorSignals.map((signal) => (
                                    signal.sourceUrl ? (
                                        <a
                                            key={signal.id}
                                            href={signal.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors group"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm text-gray-800 font-medium line-clamp-2 group-hover:text-cafe-600">
                                                        {signal.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                        <span className="bg-gray-200 px-1.5 py-0.5 rounded">{signal.domain}</span>
                                                        <span>{timeAgo(signal.createdAt)}</span>
                                                    </div>
                                                </div>
                                                <ExternalLink size={14} className="text-gray-400 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </a>
                                    ) : (
                                        <div
                                            key={signal.id}
                                            className="bg-gray-50 rounded-lg p-3"
                                        >
                                            <p className="text-sm text-gray-800 font-medium line-clamp-2">
                                                {signal.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                <span className="bg-gray-200 px-1.5 py-0.5 rounded">{signal.domain}</span>
                                                <span>{timeAgo(signal.createdAt)}</span>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Footer Actions - 10.90/10.95 Touch-friendly + Mobile responsive */}
                <div className="sticky bottom-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-t border-gray-100 bg-gradient-to-r from-white to-gray-50">
                    <button
                        className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-cafe-500 text-white rounded-lg hover:bg-cafe-600 transition-colors text-sm font-medium active:scale-98"
                        onClick={() => alert('Alert feature coming soon!')}
                    >
                        <Bell size={14} />
                        Set Alert
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-3 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm active:scale-98"
                            onClick={() => alert('Share feature coming soon!')}
                        >
                            <Share2 size={14} />
                            Share
                        </button>
                        <button
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-3 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm active:scale-98"
                            onClick={() => alert('Full analysis coming soon!')}
                        >
                            <TrendingUp size={14} />
                            Full Analysis
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
