// Unit tests for Machine Learning Hazard Predictor
// node tests/test_ml_predictor.js

const { MLHazardPredictor } = require('../js/ml-predictor.js');

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
    console.log('\n=== ML HAZARD PREDICTOR UNIT TESTS ===\n');
    const ml = new MLHazardPredictor();

    // TEST 1: Baseline dry scenario yields low risk & Baseline label
    const dryResult = ml.predict({ rain_3h_mm: 0.0, rain_24h_mm: 2.0, seismic_mag: 0.0, soil_saturation: 0.1 });
    assert(
        dryResult.inundation_probability < 0.35,
        `Dry conditions produce low probability (${dryResult.inundation_probability})`,
        `Label: ${dryResult.severity_label}`
    );
    assert(
        dryResult.severity_label.includes('Baseline') || dryResult.severity_label.includes('Advisory'),
        'Dry conditions classified as Baseline / Advisory',
        dryResult.severity_label
    );

    // TEST 2: Severe monsoon storm yields Warning or Emergency
    const stormResult = ml.predict({
        rain_3h_mm: 85.0,
        rain_24h_mm: 220.0,
        soil_saturation: 0.95,
        elevation_masl: 5.0,
        vuln_index: 0.85
    });
    assert(
        stormResult.inundation_probability >= 0.70,
        `Severe monsoon storm yields elevated risk (prob = ${stormResult.inundation_probability})`,
        `Got: ${stormResult.inundation_probability}`
    );
    assert(
        stormResult.severity_label.includes('Warning') || stormResult.severity_label.includes('Emergency'),
        'Severe storm classified as Warning or Emergency',
        stormResult.severity_label
    );

    // TEST 3: Forecast curve contains 6 forward temporal timestamps
    assert(
        stormResult.forecast_24h && stormResult.forecast_24h.length === 6,
        'Forward forecast contains 6 time steps (+0h to +24h)',
        `Length: ${stormResult.forecast_24h?.length}`
    );

    // TEST 4: Top factors array has highest weighted features
    assert(
        stormResult.top_factors && stormResult.top_factors.length === 4,
        'Top contributing factors identified',
        JSON.stringify(stormResult.top_factors.map(f => f.factor))
    );

    // TEST 5: Metric fidelity matches trained ensemble
    assert(
        ml.metrics.accuracy >= 0.90 && ml.metrics.roc_auc >= 0.95,
        `Model verification metrics meet review standard: Accuracy=${ml.metrics.accuracy}, AUC=${ml.metrics.roc_auc}`,
        JSON.stringify(ml.metrics)
    );

    console.log(`\n--- RESULTS: ${passed} passed, ${failed} failed ---\n`);
    process.exit(failed > 0 ? 1 : 0);
}

runTests();
