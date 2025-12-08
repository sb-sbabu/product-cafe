// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION SYSTEM — Core Functionality Tests
// Run with: npx tsx src/lib/pulse/notifications/__tests__/engine.test.ts
// ═══════════════════════════════════════════════════════════════════════════

import {
    calculateSIS,
    determineUrgency,
    checkFatigueLimits,
    processSignal,
    getUserBehavior,
    initializeUserBehavior,
    getIntelligentSignals,
    getBudgetStatus,
    createCluster,
} from '../intelligentNotificationEngine';

import {
    isQuietHoursActive,
    isSnoozed,
    snoozeNotifications,
    unsnooze,
    getActivePersona,
    setActivePersona,
    createFocusZone,
    activateFocusZone,
    deactivateFocusZone,
    shouldNotify,
} from '../notificationPreferencesEngine';

import type { PulseSignal, SignalDomain, SignalPriority } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Test Utilities
// ─────────────────────────────────────────────────────────────────────────────

const mockSignal = (overrides: Partial<PulseSignal> = {}): PulseSignal => ({
    id: `test_${Date.now()}`,
    title: 'Test Signal',
    summary: 'Test summary',
    domain: 'COMPETITIVE' as SignalDomain,
    type: 'PRODUCT_LAUNCH',
    priority: 'medium' as SignalPriority,
    relevanceScore: 0.7,
    publishedAt: new Date().toISOString(),
    source: 'test',
    url: 'https://example.com',
    ...overrides,
});

const log = (test: string, passed: boolean, details?: string) => {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${test}${details ? ` — ${details}` : ''}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────────────────────

async function runTests() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(' NOTIFICATION ENGINE — Core Functionality Tests');
    console.log('═══════════════════════════════════════════════════════════\n');

    let passed = 0;
    let failed = 0;

    // ── Test 1: SIS Scoring Range ──────────────────────────────────────────
    console.log('▶ SIS Scoring Tests');

    const sisLow = calculateSIS(mockSignal({ priority: 'low', relevanceScore: 0.3 }), null);
    const sisMed = calculateSIS(mockSignal({ priority: 'medium', relevanceScore: 0.5 }), null);
    const sisHigh = calculateSIS(mockSignal({ priority: 'high', relevanceScore: 0.8 }), null);
    const sisCrit = calculateSIS(mockSignal({ priority: 'critical', relevanceScore: 1.0 }), null);

    const sisInRange = sisLow >= 0 && sisLow <= 100;
    log('SIS low priority in 0-100 range', sisInRange, `Score: ${sisLow}`);
    sisInRange ? passed++ : failed++;

    const sisProgresses = sisLow < sisMed && sisMed < sisHigh && sisHigh < sisCrit;
    log('SIS increases with priority', sisProgresses, `Low:${sisLow} < Med:${sisMed} < High:${sisHigh} < Crit:${sisCrit}`);
    sisProgresses ? passed++ : failed++;

    // ── Test 2: Urgency Determination ──────────────────────────────────────
    console.log('\n▶ Urgency Tests');

    const urgencyImmediate = determineUrgency(90, 'critical', null);
    const urgencyTimely = determineUrgency(70, 'high', null);
    const urgencyBatched = determineUrgency(45, 'medium', null);
    const urgencyDigest = determineUrgency(20, 'low', null);

    log('Critical → immediate', urgencyImmediate === 'immediate', urgencyImmediate);
    urgencyImmediate === 'immediate' ? passed++ : failed++;

    log('High SIS → timely', urgencyTimely === 'timely', urgencyTimely);
    urgencyTimely === 'timely' ? passed++ : failed++;

    log('Medium SIS → batched', urgencyBatched === 'batched', urgencyBatched);
    urgencyBatched === 'batched' ? passed++ : failed++;

    log('Low SIS → digest', urgencyDigest === 'digest', urgencyDigest);
    urgencyDigest === 'digest' ? passed++ : failed++;

    // ── Test 3: Fatigue Limits ─────────────────────────────────────────────
    console.log('\n▶ Fatigue Limit Tests');

    const budget = getBudgetStatus();
    log('Budget status returns data', budget.daily >= 0 && budget.hourly >= 0,
        `Hourly: ${budget.hourly}, Daily: ${budget.daily}, Used: ${budget.percentUsed}%`);
    budget.daily >= 0 ? passed++ : failed++;

    const fatigueCheck = checkFatigueLimits('timely');
    log('Fatigue check returns result', fatigueCheck.allowed !== undefined,
        fatigueCheck.allowed ? 'Allowed' : fatigueCheck.reason);
    fatigueCheck.allowed !== undefined ? passed++ : failed++;

    // ── Test 4: Snooze Functionality ───────────────────────────────────────
    console.log('\n▶ Snooze Tests');

    const snoozeBefore = isSnoozed();
    snoozeNotifications(5); // 5 minutes
    const snoozeAfter = isSnoozed();
    unsnooze();
    const snoozeAfterUnsnooze = isSnoozed();

    log('Snooze activates correctly', snoozeAfter === true, '');
    snoozeAfter === true ? passed++ : failed++;

    log('Unsnooze deactivates correctly', snoozeAfterUnsnooze === false, '');
    snoozeAfterUnsnooze === false ? passed++ : failed++;

    // ── Test 5: Persona Management ─────────────────────────────────────────
    console.log('\n▶ Persona Tests');

    const defaultPersona = getActivePersona();
    log('Default persona exists', defaultPersona !== null, defaultPersona?.name);
    defaultPersona !== null ? passed++ : failed++;

    setActivePersona('zen');
    const zenPersona = getActivePersona();
    log('Persona switching works', zenPersona.id === 'zen', zenPersona.name);
    zenPersona.id === 'zen' ? passed++ : failed++;

    setActivePersona('executive'); // Reset

    // ── Test 6: Focus Zones ────────────────────────────────────────────────
    console.log('\n▶ Focus Zone Tests');

    const zone = createFocusZone('Test Focus', ['COMPETITIVE', 'REGULATORY']);
    log('Focus zone created', zone !== null && zone.id.startsWith('focus_'), zone?.name);
    zone !== null ? passed++ : failed++;

    const activeFocus = activateFocusZone(zone.id, 30);
    log('Focus zone activates', activeFocus !== null, activeFocus ? 'Active' : 'Failed');
    activeFocus !== null ? passed++ : failed++;

    const deactivateResult = deactivateFocusZone();
    log('Focus zone deactivates', deactivateResult !== null,
        deactivateResult ? `Collected: ${deactivateResult.signalsCollected}` : '');
    deactivateResult !== null ? passed++ : failed++;

    // ── Test 7: shouldNotify Decision ──────────────────────────────────────
    console.log('\n▶ shouldNotify Decision Tests');

    const notifyDecision = shouldNotify('COMPETITIVE', 'high');
    log('shouldNotify returns decision', notifyDecision.allowed !== undefined,
        notifyDecision.allowed ? 'Allowed' : notifyDecision.reason);
    notifyDecision.allowed !== undefined ? passed++ : failed++;

    // ── Test 8: Empty/Null Safety ──────────────────────────────────────────
    console.log('\n▶ Null Safety Tests');

    const emptyCluster = createCluster([], 'COMPETITIVE');
    log('createCluster handles empty array', emptyCluster === null, '');
    emptyCluster === null ? passed++ : failed++;

    const nullSignalProcess = processSignal(null as any);
    log('processSignal handles null', nullSignalProcess === null, '');
    nullSignalProcess === null ? passed++ : failed++;

    // ── Summary ────────────────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(` Test Results: ${passed} passed, ${failed} failed`);
    console.log('═══════════════════════════════════════════════════════════\n');

    return failed === 0;
}

// Run tests
runTests().then(success => {
    process.exit(success ? 0 : 1);
});
