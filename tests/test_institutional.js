// Unit tests for Institutional Proximity & Medical Surge Alerting Engine
// node tests/test_institutional.js

const { InstitutionalAlertEngine } = require('../js/institutional-alert.js');

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

function runTests() {
    console.log('\n=== INSTITUTIONAL PROXIMITY & MEDICAL SURGE ENGINE TESTS ===\n');
    const engine = new InstitutionalAlertEngine();

    const sampleHospitals = [
        { hospital_id: "HOSP-01", name: "City Trauma Center", lat: 13.08, lon: 80.27, available: 45, icu: 12, contact_number: "+91-44-2530-5000" },
        { hospital_id: "HOSP-02", name: "North Emergency Care", lat: 13.12, lon: 80.22, available: 12, icu: 3, contact_number: "+91-44-2590-1122" },
        { hospital_id: "HOSP-03", name: "Distant Outpost Clinic", lat: 13.90, lon: 81.20, available: 50, icu: 5, contact_number: "+91-44-9999-0000" }
    ];

    // TEST 1: Nearby hospitals sorted ascending by Haversine distance
    const nearby = engine.findNearbyHospitals(13.09, 80.26, sampleHospitals, 25);
    assert(
        nearby.length === 2,
        'Filters out distant hospital (>25km) and retains 2 close hospitals',
        `Retained: ${nearby.length}`
    );
    assert(
        nearby[0].distance_km < nearby[1].distance_km,
        'Hospitals sorted by ascending distance',
        `${nearby[0].name} (${nearby[0].distance_km}km) < ${nearby[1].name} (${nearby[1].distance_km}km)`
    );

    // TEST 2: Clinical advisory provides actionable recommendations
    const adv = nearby[0].clinical_advisory;
    assert(
        adv && adv.recommendations && adv.recommendations.length > 0,
        'Clinical advisory generates concrete readiness tips',
        JSON.stringify(adv.recommendations)
    );

    // TEST 3: Multi-city asset templates contain Mumbai, Kolkata, Delhi, and Tokyo
    const cities = Object.keys(engine.cityAssetTemplates);
    assert(
        cities.includes('mumbai') && cities.includes('kolkata') && cities.includes('delhi') && cities.includes('tokyo'),
        'Multi-city templates configured for Mumbai, Kolkata, Delhi, and Tokyo',
        JSON.stringify(cities)
    );

    // TEST 4: Each city template has distinct zones and hospital facilities
    const mum = engine.cityAssetTemplates.mumbai;
    assert(
        mum.zones.length >= 3 && mum.hospitals.length >= 2,
        'Mumbai template has realistic geolocated zones and trauma hospitals',
        `Zones: ${mum.zones.length}, Hospitals: ${mum.hospitals.length}`
    );

    console.log(`\n--- RESULTS: ${passed} passed, ${failed} failed ---\n`);
    process.exit(failed > 0 ? 1 : 0);
}

runTests();
