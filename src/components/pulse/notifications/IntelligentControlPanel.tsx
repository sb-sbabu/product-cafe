import React, { useState, useCallback } from 'react';
import {
    getPreferences,
    savePreferences,
    getAllPersonas,
    getActivePersona,
    setActivePersona as setActivePersonaAction,
    createFocusZone,
    deleteFocusZone,
    activateFocusZone,
    deactivateFocusZone,
    getActiveFocus,
    createAlertRule,
    deleteAlertRule,
    toggleAlertRule,
    snoozeNotifications,
    unsnooze,
    isSnoozed,
    getSnoozeEndTime,
    resetPreferences,
    getBudgetStatus,
    clearLearningData,
    getUserBehavior,
    type IntelligentPreferences,
    type NotificationPersona,
    type FocusZone,
    type CustomAlertRule,
} from '../../../lib/pulse/notifications';
import { DOMAIN_CONFIG, type SignalDomain } from '../../../lib/pulse/types';
import {
    Settings,
    User,
    Target,
    Zap,
    Moon,
    Bell,
    Clock,
    Brain,
    Trash2,
    Plus,
    Check,
    X,
    ChevronRight,
    RotateCcw,
    Save,
    Sparkles,
    Shield,
    Volume2,
    VolumeX,
    Activity,
    TrendingUp,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// INTELLIGENT CONTROL PANEL — Complete Notification Preferences
// Zero fatigue through total user control
// ═══════════════════════════════════════════════════════════════════════════

interface IntelligentControlPanelProps {
    className?: string;
    onClose?: () => void;
}

export const IntelligentControlPanel: React.FC<IntelligentControlPanelProps> = ({
    className,
    onClose,
}) => {
    const [prefs, setPrefs] = useState<IntelligentPreferences>(getPreferences);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('personas');
    const [showNewFocusZone, setShowNewFocusZone] = useState(false);
    const [showNewRule, setShowNewRule] = useState(false);

    const refresh = useCallback(() => {
        setPrefs(getPreferences());
    }, []);

    const updatePrefs = (updates: Partial<IntelligentPreferences>) => {
        const newPrefs = { ...prefs, ...updates };
        setPrefs(newPrefs);
        setHasChanges(true);
    };

    const handleSave = () => {
        savePreferences(prefs);
        setHasChanges(false);
    };

    const handleReset = () => {
        if (confirm('Reset all notification preferences to defaults?')) {
            resetPreferences();
            refresh();
            setHasChanges(false);
        }
    };

    const personas = getAllPersonas();
    const activePersona = getActivePersona();
    const activeFocus = getActiveFocus();
    const snoozed = isSnoozed();
    const snoozeEnd = getSnoozeEndTime();
    const budget = getBudgetStatus();
    const behavior = getUserBehavior();

    const sections = [
        { id: 'personas', icon: User, label: 'Personas' },
        { id: 'focus', icon: Target, label: 'Focus Zones' },
        { id: 'rules', icon: Zap, label: 'Alert Rules' },
        { id: 'schedule', icon: Clock, label: 'Schedule' },
        { id: 'learning', icon: Brain, label: 'AI Learning' },
    ];

    return (
        <div className={cn(
            "bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-200",
            "overflow-hidden",
            className
        )}>
            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cafe-600 to-cafe-700" />
                <div className="relative p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Settings size={22} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Notification Control</h2>
                                <p className="text-sm text-cafe-100">
                                    Zero fatigue. Total control.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleReset}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                title="Reset to defaults"
                            >
                                <RotateCcw size={18} />
                            </button>
                            {hasChanges && (
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-white text-cafe-700 rounded-lg font-medium flex items-center gap-2 hover:bg-cafe-50 transition-colors"
                                >
                                    <Save size={16} />
                                    Save
                                </button>
                            )}
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                            <div className="text-xs text-cafe-200">Active Mode</div>
                            <div className="font-semibold flex items-center gap-1 mt-0.5">
                                {activePersona.icon} {activePersona.name}
                            </div>
                        </div>
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                            <div className="text-xs text-cafe-200">Daily Budget</div>
                            <div className="font-semibold mt-0.5">
                                {budget.daily} remaining
                            </div>
                        </div>
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                            <div className="text-xs text-cafe-200">Status</div>
                            <div className="font-semibold flex items-center gap-1 mt-0.5">
                                {snoozed ? (
                                    <><Moon size={14} /> Snoozed</>
                                ) : activeFocus ? (
                                    <><Target size={14} /> Focused</>
                                ) : (
                                    <><Bell size={14} /> Active</>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex min-h-[500px]">
                {/* Sidebar Navigation */}
                <div className="w-48 bg-gray-50 border-r border-gray-100 p-3">
                    <nav className="space-y-1">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all",
                                    "flex items-center gap-2",
                                    activeSection === section.id
                                        ? "bg-cafe-600 text-white shadow-lg shadow-cafe-500/25"
                                        : "text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                <section.icon size={16} />
                                {section.label}
                            </button>
                        ))}
                    </nav>

                    {/* Snooze Quick Action */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-400 uppercase mb-2 px-1">
                            Quick Actions
                        </div>
                        {snoozed ? (
                            <button
                                onClick={() => { unsnooze(); refresh(); }}
                                className="w-full px-3 py-2.5 rounded-xl text-sm font-medium bg-amber-100 text-amber-700 flex items-center gap-2"
                            >
                                <Bell size={16} />
                                Resume
                            </button>
                        ) : (
                            <button
                                onClick={() => { snoozeNotifications(60); refresh(); }}
                                className="w-full px-3 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-2"
                            >
                                <Moon size={16} />
                                Snooze 1h
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 overflow-y-auto max-h-[500px]">
                    {activeSection === 'personas' && (
                        <PersonasSection
                            personas={personas}
                            activePersona={activePersona}
                            onSelect={(id) => { setActivePersonaAction(id); refresh(); }}
                        />
                    )}

                    {activeSection === 'focus' && (
                        <FocusZonesSection
                            zones={prefs.focusZones}
                            activeFocus={activeFocus}
                            showNew={showNewFocusZone}
                            onShowNew={setShowNewFocusZone}
                            onCreate={(name, domains) => {
                                createFocusZone(name, domains);
                                refresh();
                                setShowNewFocusZone(false);
                            }}
                            onActivate={(id) => { activateFocusZone(id, 120); refresh(); }}
                            onDeactivate={() => { deactivateFocusZone(); refresh(); }}
                            onDelete={(id) => { deleteFocusZone(id); refresh(); }}
                        />
                    )}

                    {activeSection === 'rules' && (
                        <AlertRulesSection
                            rules={prefs.alertRules}
                            showNew={showNewRule}
                            onShowNew={setShowNewRule}
                            onCreate={(name, conditions, actions) => {
                                createAlertRule(name, conditions, 'AND', actions);
                                refresh();
                                setShowNewRule(false);
                            }}
                            onToggle={(id) => { toggleAlertRule(id); refresh(); }}
                            onDelete={(id) => { deleteAlertRule(id); refresh(); }}
                        />
                    )}

                    {activeSection === 'schedule' && (
                        <ScheduleSection
                            prefs={prefs}
                            snoozeEnd={snoozeEnd}
                            onUpdate={updatePrefs}
                            onUnsnooze={() => { unsnooze(); refresh(); }}
                        />
                    )}

                    {activeSection === 'learning' && (
                        <LearningSection
                            prefs={prefs}
                            behavior={behavior}
                            onUpdate={updatePrefs}
                            onClearData={() => { clearLearningData(); refresh(); }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// PERSONAS SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface PersonasSectionProps {
    personas: NotificationPersona[];
    activePersona: NotificationPersona;
    onSelect: (id: string) => void;
}

const PersonasSection: React.FC<PersonasSectionProps> = ({
    personas,
    activePersona,
    onSelect,
}) => (
    <div>
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Notification Personas</h3>
            <p className="text-sm text-gray-500 mt-1">
                One-click mode switching for different work contexts
            </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
            {personas.map(persona => (
                <button
                    key={persona.id}
                    onClick={() => onSelect(persona.id)}
                    className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        activePersona.id === persona.id
                            ? "border-cafe-500 bg-cafe-50 shadow-lg shadow-cafe-500/10"
                            : "border-gray-200 hover:border-cafe-200 hover:bg-gray-50"
                    )}
                >
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">{persona.icon}</span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{persona.name}</span>
                                {activePersona.id === persona.id && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold text-cafe-700 bg-cafe-200 rounded-full">
                                        ACTIVE
                                    </span>
                                )}
                                {persona.isCustom && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold text-gray-500 bg-gray-200 rounded-full">
                                        CUSTOM
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{persona.description}</p>

                            {/* Settings Preview */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] bg-gray-100 rounded-md text-gray-600">
                                    <Shield size={10} /> {persona.settings.minPriority}+
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] bg-gray-100 rounded-md text-gray-600">
                                    <Activity size={10} /> {persona.settings.batchMode}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] bg-gray-100 rounded-md text-gray-600">
                                    {persona.settings.soundEnabled ? <Volume2 size={10} /> : <VolumeX size={10} />}
                                    {persona.settings.soundEnabled ? 'Sound' : 'Silent'}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] bg-gray-100 rounded-md text-gray-600">
                                    <Clock size={10} /> Max {persona.settings.maxPerDay}/day
                                </span>
                            </div>

                            {/* Enabled Domains */}
                            <div className="flex gap-1 mt-2">
                                {(Object.entries(persona.settings.domains) as [SignalDomain, boolean][])
                                    .filter(([, enabled]) => enabled)
                                    .map(([domain]) => (
                                        <span
                                            key={domain}
                                            className="w-6 h-6 flex items-center justify-center rounded-md text-xs"
                                            style={{
                                                backgroundColor: `${DOMAIN_CONFIG[domain].color}20`,
                                            }}
                                            title={DOMAIN_CONFIG[domain].label}
                                        >
                                            {DOMAIN_CONFIG[domain].icon}
                                        </span>
                                    ))}
                            </div>
                        </div>
                        <ChevronRight
                            size={20}
                            className={cn(
                                "text-gray-300 transition-colors",
                                activePersona.id === persona.id && "text-cafe-500"
                            )}
                        />
                    </div>
                </button>
            ))}
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// FOCUS ZONES SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface FocusZonesSectionProps {
    zones: FocusZone[];
    activeFocus: ReturnType<typeof getActiveFocus>;
    showNew: boolean;
    onShowNew: (show: boolean) => void;
    onCreate: (name: string, domains: SignalDomain[]) => void;
    onActivate: (id: string) => void;
    onDeactivate: () => void;
    onDelete: (id: string) => void;
}

const FocusZonesSection: React.FC<FocusZonesSectionProps> = ({
    zones,
    activeFocus,
    showNew,
    onShowNew,
    onCreate,
    onActivate,
    onDeactivate,
    onDelete,
}) => {
    const [newName, setNewName] = useState('');
    const [newDomains, setNewDomains] = useState<SignalDomain[]>([]);

    const handleCreate = () => {
        if (newName && newDomains.length > 0) {
            onCreate(newName, newDomains);
            setNewName('');
            setNewDomains([]);
        }
    };

    const toggleDomain = (domain: SignalDomain) => {
        setNewDomains(prev =>
            prev.includes(domain)
                ? prev.filter(d => d !== domain)
                : [...prev, domain]
        );
    };

    return (
        <div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Focus Zones</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Amplify specific domains, mute the rest
                </p>
            </div>

            {/* Active Focus Banner */}
            {activeFocus && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                                <Target size={18} className="text-white" />
                            </div>
                            <div>
                                <div className="font-medium text-green-900">
                                    {activeFocus.zone.name} - Active
                                </div>
                                <div className="text-xs text-green-600">
                                    {activeFocus.signalsCollected} signals collected
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onDeactivate}
                            className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
                        >
                            End Focus
                        </button>
                    </div>
                </div>
            )}

            {/* Existing Zones */}
            <div className="space-y-2 mb-4">
                {zones.map(zone => (
                    <div
                        key={zone.id}
                        className="p-3 border border-gray-200 rounded-xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                                {zone.domains.map(d => (
                                    <span key={d} title={DOMAIN_CONFIG[d].label}>
                                        {DOMAIN_CONFIG[d].icon}
                                    </span>
                                ))}
                            </div>
                            <span className="font-medium text-gray-900">{zone.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {!activeFocus && (
                                <button
                                    onClick={() => onActivate(zone.id)}
                                    className="px-3 py-1.5 text-xs font-medium text-cafe-700 bg-cafe-100 rounded-lg hover:bg-cafe-200"
                                >
                                    Start Focus
                                </button>
                            )}
                            <button
                                onClick={() => onDelete(zone.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* New Zone Form */}
            {showNew ? (
                <div className="p-4 border-2 border-dashed border-cafe-300 rounded-xl bg-cafe-50/50">
                    <input
                        type="text"
                        placeholder="Focus zone name..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 text-sm"
                    />
                    <div className="flex flex-wrap gap-2 mb-3">
                        {(Object.keys(DOMAIN_CONFIG) as SignalDomain[]).map(domain => (
                            <button
                                key={domain}
                                onClick={() => toggleDomain(domain)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                    newDomains.includes(domain)
                                        ? "bg-cafe-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {DOMAIN_CONFIG[domain].icon} {DOMAIN_CONFIG[domain].label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={!newName || newDomains.length === 0}
                            className="px-4 py-2 bg-cafe-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            <Check size={14} /> Create
                        </button>
                        <button
                            onClick={() => onShowNew(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => onShowNew(true)}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-cafe-300 hover:text-cafe-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={16} /> Create Focus Zone
                </button>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ALERT RULES SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface AlertRulesSectionProps {
    rules: CustomAlertRule[];
    showNew: boolean;
    onShowNew: (show: boolean) => void;
    onCreate: (name: string, conditions: CustomAlertRule['conditions'], actions: CustomAlertRule['actions']) => void;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

const AlertRulesSection: React.FC<AlertRulesSectionProps> = ({
    rules,
    showNew,
    onShowNew,
    onCreate,
    onToggle,
    onDelete,
}) => {
    const [newName, setNewName] = useState('');
    const [selectedDomain, setSelectedDomain] = useState<SignalDomain>('COMPETITIVE');

    const handleCreate = () => {
        if (newName) {
            onCreate(
                newName,
                [{ type: 'domain', operator: 'equals', value: selectedDomain }],
                [{ type: 'urgency', value: 'immediate' }]
            );
            setNewName('');
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Custom Alert Rules</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Create rules to escalate important signals
                </p>
            </div>

            {/* Existing Rules */}
            <div className="space-y-2 mb-4">
                {rules.map(rule => (
                    <div
                        key={rule.id}
                        className={cn(
                            "p-3 border rounded-xl flex items-center justify-between",
                            rule.enabled ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onToggle(rule.id)}
                                className={cn(
                                    "w-8 h-5 rounded-full transition-colors relative",
                                    rule.enabled ? "bg-cafe-600" : "bg-gray-300"
                                )}
                            >
                                <span
                                    className={cn(
                                        "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                                        rule.enabled ? "right-0.5" : "left-0.5"
                                    )}
                                />
                            </button>
                            <div>
                                <span className="font-medium text-gray-900">{rule.name}</span>
                                <div className="text-xs text-gray-500">
                                    Triggered {rule.triggerCount} times
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => onDelete(rule.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* New Rule Form */}
            {showNew ? (
                <div className="p-4 border-2 border-dashed border-cafe-300 rounded-xl bg-cafe-50/50">
                    <input
                        type="text"
                        placeholder="Rule name..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-3 text-sm"
                    />
                    <div className="mb-3">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                            When domain is:
                        </label>
                        <select
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value as SignalDomain)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        >
                            {(Object.keys(DOMAIN_CONFIG) as SignalDomain[]).map(d => (
                                <option key={d} value={d}>{DOMAIN_CONFIG[d].label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                        <Zap size={12} className="text-cafe-500" />
                        Then: Send immediately (bypass batching)
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={!newName}
                            className="px-4 py-2 bg-cafe-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                            <Check size={14} /> Create Rule
                        </button>
                        <button
                            onClick={() => onShowNew(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => onShowNew(true)}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-cafe-300 hover:text-cafe-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={16} /> Create Alert Rule
                </button>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface ScheduleSectionProps {
    prefs: IntelligentPreferences;
    snoozeEnd: Date | null;
    onUpdate: (updates: Partial<IntelligentPreferences>) => void;
    onUnsnooze: () => void;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({
    prefs,
    snoozeEnd,
    onUpdate,
    onUnsnooze,
}) => (
    <div>
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Schedule & Quiet Hours</h3>
            <p className="text-sm text-gray-500 mt-1">
                Control when notifications can reach you
            </p>
        </div>

        {/* Snooze Status */}
        {snoozeEnd && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Moon size={20} className="text-amber-600" />
                        <div>
                            <div className="font-medium text-amber-900">Currently Snoozed</div>
                            <div className="text-xs text-amber-600">
                                Until {snoozeEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onUnsnooze}
                        className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200"
                    >
                        Resume Now
                    </button>
                </div>
            </div>
        )}

        {/* Quiet Hours */}
        <div className="p-4 border border-gray-200 rounded-xl mb-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Moon size={18} className="text-gray-500" />
                    <span className="font-medium text-gray-900">Quiet Hours</span>
                </div>
                <button
                    onClick={() => onUpdate({
                        quietHours: { ...prefs.quietHours, enabled: !prefs.quietHours.enabled }
                    })}
                    className={cn(
                        "w-10 h-5 rounded-full transition-colors relative",
                        prefs.quietHours.enabled ? "bg-cafe-600" : "bg-gray-300"
                    )}
                >
                    <span
                        className={cn(
                            "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                            prefs.quietHours.enabled ? "right-0.5" : "left-0.5"
                        )}
                    />
                </button>
            </div>
            {prefs.quietHours.enabled && (
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <input
                            type="time"
                            value={prefs.quietHours.start}
                            onChange={(e) => onUpdate({
                                quietHours: { ...prefs.quietHours, start: e.target.value }
                            })}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                            type="time"
                            value={prefs.quietHours.end}
                            onChange={(e) => onUpdate({
                                quietHours: { ...prefs.quietHours, end: e.target.value }
                            })}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={prefs.quietHours.allowCriticalOverride}
                            onChange={(e) => onUpdate({
                                quietHours: { ...prefs.quietHours, allowCriticalOverride: e.target.checked }
                            })}
                            className="rounded border-gray-300 text-cafe-600"
                        />
                        Allow critical signals to override
                    </label>
                </div>
            )}
        </div>

        {/* Daily Digest */}
        <div className="p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-gray-500" />
                    <span className="font-medium text-gray-900">Daily Digest</span>
                </div>
                <button
                    onClick={() => onUpdate({
                        digestSchedule: { ...prefs.digestSchedule, enabled: !prefs.digestSchedule.enabled }
                    })}
                    className={cn(
                        "w-10 h-5 rounded-full transition-colors relative",
                        prefs.digestSchedule.enabled ? "bg-cafe-600" : "bg-gray-300"
                    )}
                >
                    <span
                        className={cn(
                            "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                            prefs.digestSchedule.enabled ? "right-0.5" : "left-0.5"
                        )}
                    />
                </button>
            </div>
            {prefs.digestSchedule.enabled && (
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Deliver at</span>
                    <input
                        type="time"
                        value={prefs.digestSchedule.time}
                        onChange={(e) => onUpdate({
                            digestSchedule: { ...prefs.digestSchedule, time: e.target.value }
                        })}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                </div>
            )}
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// LEARNING SECTION
// ─────────────────────────────────────────────────────────────────────────────

interface LearningSectionProps {
    prefs: IntelligentPreferences;
    behavior: ReturnType<typeof getUserBehavior>;
    onUpdate: (updates: Partial<IntelligentPreferences>) => void;
    onClearData: () => void;
}

const LearningSection: React.FC<LearningSectionProps> = ({
    prefs,
    behavior,
    onUpdate,
    onClearData,
}) => (
    <div>
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">AI Learning</h3>
            <p className="text-sm text-gray-500 mt-1">
                The system learns from your behavior to improve relevance
            </p>
        </div>

        {/* Learning Toggle */}
        <div className="p-4 border border-gray-200 rounded-xl mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Brain size={20} className="text-cafe-500" />
                    <div>
                        <div className="font-medium text-gray-900">Personalization</div>
                        <div className="text-xs text-gray-500">
                            Learn from your reading patterns
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => onUpdate({ learningEnabled: !prefs.learningEnabled })}
                    className={cn(
                        "w-10 h-5 rounded-full transition-colors relative",
                        prefs.learningEnabled ? "bg-cafe-600" : "bg-gray-300"
                    )}
                >
                    <span
                        className={cn(
                            "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                            prefs.learningEnabled ? "right-0.5" : "left-0.5"
                        )}
                    />
                </button>
            </div>
        </div>

        {/* Learning Stats */}
        {behavior && (
            <div className="p-4 bg-gray-50 rounded-xl mb-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-cafe-500" />
                    What We've Learned
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <div className="text-gray-500">Total Interactions</div>
                        <div className="font-semibold text-gray-900">{behavior.totalInteractions}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">Helpful Feedback</div>
                        <div className="font-semibold text-green-600">👍 {behavior.helpfulCount}</div>
                    </div>
                    <div className="col-span-2">
                        <div className="text-gray-500 mb-1">Domain Preference</div>
                        <div className="flex gap-1">
                            {behavior.preferredDomains.slice(0, 3).map((d, i) => (
                                <span
                                    key={d}
                                    className="px-2 py-1 rounded text-xs font-medium"
                                    style={{ backgroundColor: `${DOMAIN_CONFIG[d].color}20` }}
                                >
                                    #{i + 1} {DOMAIN_CONFIG[d].icon} {DOMAIN_CONFIG[d].label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Clear Data */}
        <button
            onClick={() => {
                if (confirm('Clear all learning data? This cannot be undone.')) {
                    onClearData();
                }
            }}
            className="w-full p-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
            <Trash2 size={16} />
            Clear Learning Data
        </button>
    </div>
);

export default IntelligentControlPanel;
