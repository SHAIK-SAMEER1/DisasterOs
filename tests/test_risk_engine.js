// Unit Tests for RiskEngine, PriorityQueue, and Null/Zero Boundary Cases
// Run via: node tests/test_risk_engine.js

const assert = require('assert');

// Pure RiskEngine implementation for headless Node.js test execution
class RiskEngine {
    constructor() {
        this.weights = {
            w1_rain: 0.35,
            w2_seismic: 0.30,
            w3_vuln: 0.25,
            w4_shelter: 0.20
        };
    }

    evaluateZone(zone, weatherReading, seismicReading, sheltersInZone) {
        // Robust 0.0 check: explicitly check !== undefined/null, do not use truthy fallback
        const trailingRain = (weatherReading && typeof weatherReading.trailing_3h_mm === 'number') 
            ? weatherReading.trailing_3h_mm 
            : 0.0;
        const rainNorm = Math.min(trailingRain / 50.0, 1.0);

        const maxMag = (seismicReading && typeof seismicReading.max_magnitude === 'number') 
            ? seismicReading.max_magnitude 
            : 0.0;
        const seismicNorm = Math.min(maxMag / 7.0, 1.0);

        const vuln = (zone && typeof zone.vulnerability === 'number') ? zone.vulnerability : 0.5;

        let totalCap = 0;
        let occCap = 0;
        if (Array.isArray(sheltersInZone)) {
            sheltersInZone.forEach(s => {
                totalCap += (s.capacity_total || s.capacity || 0);
                occCap += (s.capacity_occupied || s.occupied || 0);
            });
        }
        const shelterHeadroom = totalCap > 0 ? (1.0 - (occCap / totalCap)) : 0.0;

        let rawScore = (
            (this.weights.w1_rain * rainNorm) +
            (this.weights.w2_seismic * seismicNorm) +
            (this.weights.w3_vuln * vuln) -
            (this.weights.w4_shelter * shelterHeadroom)
        );

        const r_zone = Math.max(0.0, Math.min(1.0, parseFloat(rawScore.toFixed(3))));

        let severity = "baseline";
        if (r_zone >= 0.85) severity = "emergency";
        else if (r_zone >= 0.65) severity = "warning";
        else if (r_zone >= 0.45) severity = "watch";
        else if (r_zone >= 0.25) severity = "advisory";

        return { r_zone, severity, rainNorm, seismicNorm, shelterHeadroom };
    }

    prioritizeRequests(requests, zoneRiskMap) {
        const urgencyWeights = {
            rescue: 1.0,
            medical: 0.9,
            evacuation: 0.8,
            water: 0.6,
            food: 0.5,
            shelter: 0.4
        };

        return requests.map(req => {
            const urgency = urgencyWeights[req.need_type] || 0.5;
            const zoneRisk = (zoneRiskMap && zoneRiskMap[req.zone_id]) ? zoneRiskMap[req.zone_id].r_zone : 0.5;
            const count = req.people_count || 1;
            const loadPenalty = Math.log(1 + count) / Math.log(50);

            const score = (0.50 * urgency) + (0.35 * zoneRisk) + (0.15 * Math.min(1.0, loadPenalty));
            return {
                ...req,
                computed_priority: parseFloat(score.toFixed(3))
            };
        }).sort((a, b) => b.computed_priority - a.computed_priority);
    }
}

console.log("=== RUNNING DISASTEROS RISK ENGINE UNIT TESTS ===");

const engine = new RiskEngine();

// Test 1: Zero Rainfall and Zero Seismic must NOT be replaced with fallback
{
    const zone = { zone_id: 'Z1', vulnerability: 0.4 };
    const weather = { trailing_3h_mm: 0.0 }; // Legitimate zero
    const seismic = { max_magnitude: 0.0 };   // Legitimate zero
    const shelters = [{ capacity_total: 100, capacity_occupied: 100 }]; // 0 headroom

    const res = engine.evaluateZone(zone, weather, seismic, shelters);
    // Score should be 0.35*0 + 0.30*0 + 0.25*0.4 - 0.20*0 = 0.100
    assert.strictEqual(res.r_zone, 0.100, `Expected 0.100 but got ${res.r_zone}`);
    assert.strictEqual(res.severity, "baseline");
    console.log("✓ Test 1 Passed: Legitimate zero-value weather/seismic correctly preserved without truthy fallback.");
}

// Test 2: Maximum Extreme Hazard (Rain 120mm, Quake M7.5, Vulnerability 1.0, 0 Shelters)
{
    const zone = { zone_id: 'Z2', vulnerability: 1.0 };
    const weather = { trailing_3h_mm: 120.0 }; // >= 50mm -> capped at 1.0
    const seismic = { max_magnitude: 7.5 };    // >= 7.0 -> capped at 1.0
    const shelters = []; // 0 headroom

    const res = engine.evaluateZone(zone, weather, seismic, shelters);
    // 0.35*1.0 + 0.30*1.0 + 0.25*1.0 - 0.20*0 = 0.900
    assert.strictEqual(res.r_zone, 0.900);
    assert.strictEqual(res.severity, "emergency");
    console.log("✓ Test 2 Passed: Extreme hazard capped at [0,1] and mapped to emergency threshold.");
}

// Test 3: Ample Shelter Capacity Reduces Net Risk
{
    const zone = { zone_id: 'Z3', vulnerability: 0.6 };
    const weather = { trailing_3h_mm: 25.0 }; // 0.5 norm
    const seismic = { max_magnitude: 3.5 };   // 0.5 norm
    const emptyShelters = [{ capacity_total: 500, capacity_occupied: 0 }]; // 1.0 headroom

    const res = engine.evaluateZone(zone, weather, seismic, emptyShelters);
    // 0.35*0.5 (0.175) + 0.30*0.5 (0.150) + 0.25*0.6 (0.150) - 0.20*1.0 (0.200) = 0.275
    assert.strictEqual(res.r_zone, 0.275);
    assert.strictEqual(res.severity, "advisory");
    console.log("✓ Test 3 Passed: Shelter capacity headroom accurately offsets environmental risk.");
}

// Test 4: Priority Queue Urgency and Load Ordering
{
    const reqs = [
        { request_id: 'R1', need_type: 'food', people_count: 2, zone_id: 'Z1' },
        { request_id: 'R2', need_type: 'rescue', people_count: 20, zone_id: 'Z1' },
        { request_id: 'R3', need_type: 'medical', people_count: 5, zone_id: 'Z1' }
    ];
    const zoneRisk = { Z1: { r_zone: 0.70 } };
    const sorted = engine.prioritizeRequests(reqs, zoneRisk);

    assert.strictEqual(sorted[0].request_id, 'R2', "Rescue with 20 people must be ranked #1");
    assert.strictEqual(sorted[1].request_id, 'R3', "Medical with 5 people must be ranked #2");
    assert.strictEqual(sorted[2].request_id, 'R1', "Food with 2 people must be ranked #3");
    console.log("✓ Test 4 Passed: Priority queue correctly orders emergency requests by urgency and load penalty.");
}

console.log("\nALL RISK ENGINE UNIT TESTS PASSED (4/4).\n");
