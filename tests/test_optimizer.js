// Unit tests for Constrained Dispatch Optimizer
// node tests/test_optimizer.js

const { DispatchOptimizer } = require('../js/optimizer.js');

let passed = 0, failed = 0;

function assert(condition, name, detail = '') {
    if (condition) {
        console.log(`  ✓ PASS: ${name}`);
        passed++;
    } else {
        console.error(`  ✗ FAIL: ${name}${detail ? ' — ' + detail : ''}`);
        failed++;
    }
}

async function runTests() {
    console.log('\n=== DISPATCH OPTIMIZER UNIT TESTS ===\n');
    const opt = new DispatchOptimizer();

    // Mock dataset: 3 requests, 4 teams
    const requests = [
        { id: 'REQ-001', need_type: 'medical', lat: 13.08, lon: 80.27, priority_score: 0.9, people_count: 12, status: 'open' },
        { id: 'REQ-002', need_type: 'rescue', lat: 13.05, lon: 80.24, priority_score: 0.7, people_count: 5, status: 'open' },
        { id: 'REQ-003', need_type: 'logistics', lat: 13.11, lon: 80.30, priority_score: 0.5, people_count: 30, status: 'open' },
        { id: 'REQ-004', need_type: 'medical', lat: 13.09, lon: 80.29, priority_score: 0.4, people_count: 3, status: 'resolved' }
    ];

    const teams = [
        { id: 'TEAM-A', name: 'Alpha Medical', skill: 'medical', lat: 13.07, lon: 80.26, available: true },
        { id: 'TEAM-B', name: 'Bravo Rescue', skill: 'rescue', lat: 13.04, lon: 80.23, available: true },
        { id: 'TEAM-C', name: 'Charlie Logistics', skill: 'logistics', lat: 13.12, lon: 80.31, available: true },
        { id: 'TEAM-D', name: 'Delta General', skill: 'general', lat: 13.10, lon: 80.28, available: false }
    ];

    // TEST 1: Resolved requests are excluded
    const result1 = opt.optimize(requests, teams);
    assert(
        result1.assignments.every(a => a.request_id !== 'REQ-004'),
        'Resolved requests are excluded from optimization',
        JSON.stringify(result1.assignments.map(a => a.request_id))
    );

    // TEST 2: Skill matching respected (medical team → medical request)
    const medicalAssignment = result1.assignments.find(a => a.request_id === 'REQ-001');
    assert(
        medicalAssignment && medicalAssignment.team_id === 'TEAM-A',
        'Medical team (TEAM-A) assigned to medical request (REQ-001)',
        medicalAssignment ? `got ${medicalAssignment.team_id}` : 'no assignment found'
    );

    // TEST 3: Unavailable teams are excluded
    assert(
        result1.assignments.every(a => a.team_id !== 'TEAM-D'),
        'Unavailable team (TEAM-D) is excluded from assignments'
    );

    // TEST 4: Optimized distance is less than or equal to random baseline
    assert(
        result1.metrics.optimized_total_km <= result1.metrics.random_baseline_km,
        `Optimized distance (${result1.metrics.optimized_total_km} km) ≤ random baseline (${result1.metrics.random_baseline_km} km)`,
        `Reduction: ${result1.metrics.distance_reduction_pct}%`
    );

    // TEST 5: Metrics contain required fields
    const m = result1.metrics;
    assert(
        m.total_requests !== undefined &&
        m.assigned !== undefined &&
        m.optimized_total_km !== undefined &&
        m.distance_reduction_pct !== undefined,
        'Metrics object has all required fields',
        JSON.stringify(m)
    );

    // TEST 6: Empty requests returns empty assignments
    const emptyResult = opt.optimize([], teams);
    assert(
        emptyResult.assignments.length === 0,
        'Empty request list returns empty assignments'
    );

    // TEST 7: Haversine distance sanity check (Chennai to ~5km north)
    const dist = opt._haversine(13.08, 80.27, 13.13, 80.27);
    assert(
        dist > 4.5 && dist < 6.5,
        `Haversine distance ~5.6 km (got ${dist.toFixed(2)} km)`,
        'Distance between lat 13.08 and 13.13 at same lon should be ~5.5 km'
    );

    console.log(`\n--- RESULTS: ${passed} passed, ${failed} failed ---\n`);
    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => { console.error(err); process.exit(1); });
