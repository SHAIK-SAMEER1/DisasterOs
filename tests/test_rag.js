// Unit tests for RAG Assistant & Conversational Emergency Intelligence
// node tests/test_rag.js

const { RAGAssistant } = require('../js/assistant-rag.js');

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
    console.log('\n=== RAG ASSISTANT UNIT TESTS ===\n');
    const rag = new RAGAssistant();

    // TEST 1: Flood query returns passages
    const floodResult = rag.retrieve('flood evacuation protocol and water level threshold', 2);
    assert(floodResult.length > 0, 'Flood query returns at least one passage', `Got ${floodResult.length}`);

    // TEST 2: Top flood passage is from NDMA or tagged flood
    assert(
        floodResult[0].topic.includes('flood') || floodResult[0].source.includes('NDMA'),
        'Top flood passage is from NDMA or tagged flood',
        `Got topic: ${floodResult[0].topic}, source: ${floodResult[0].source}`
    );

    // TEST 3: Earthquake query returns passages
    const quakeResult = rag.retrieve('earthquake drop cover and hold procedure', 2);
    assert(quakeResult.length > 0, 'Earthquake query returns passages', `Got ${quakeResult.length}`);
    assert(
        quakeResult.some(r => r.topic.includes('earthquake') || r.topic.includes('seismic') || r.topic.includes('tremor')),
        'At least one passage is earthquake/seismic related',
        quakeResult[0]?.topic
    );

    // TEST 4: Triage query produces START protocol terminology
    const triageResult = rag.query('how does START triage prioritize mass casualties?');
    assert(
        triageResult.answer.toLowerCase().includes('triage') ||
        triageResult.answer.toLowerCase().includes('red') ||
        triageResult.answer.toLowerCase().includes('start'),
        'Triage query answer contains triage terminology',
        triageResult.answer.substring(0, 100)
    );

    // TEST 5: Unknown query returns safety guidance fallback
    const unknownResult = rag.query('quantum entanglement pizza recipe');
    assert(
        unknownResult.passages[0].passage.toLowerCase().includes('safety guidance') ||
        unknownResult.passages[0].passage.toLowerCase().includes('no relevant'),
        'Unknown query returns intelligent civil defense safety guidance',
        unknownResult.passages[0].passage.substring(0, 80)
    );

    // TEST 6: Citations array is populated
    assert(
        floodResult.length > 0 && typeof floodResult[0].source === 'string',
        'Query response contains string citations',
        JSON.stringify(floodResult.map(r => r.source))
    );

    // TEST 7: retrievedAt timestamp is ISO format
    const fullQueryRes = rag.query('flood evacuation');
    assert(
        fullQueryRes.retrievedAt && fullQueryRes.retrievedAt.includes('T'),
        'Response contains ISO timestamp',
        fullQueryRes.retrievedAt
    );

    // TEST 8: Shelter capacity query returns SOP content
    const shelterResult = rag.query('shelter capacity overflow 90 percent headroom');
    assert(
        shelterResult.answer.toLowerCase().includes('shelter') ||
        shelterResult.answer.toLowerCase().includes('space') ||
        shelterResult.answer.toLowerCase().includes('capacity'),
        'Shelter query returns relevant capacity content',
        shelterResult.answer.substring(0, 100)
    );

    // TEST 9: Greeting 'hi' responds with warm assistant greeting
    const greetResult = rag.query('hi');
    assert(
        greetResult.answer.toLowerCase().includes('hello') || greetResult.answer.toLowerCase().includes('tactical'),
        "Conversational greeting 'hi' returns warm assistant greeting",
        greetResult.answer.substring(0, 80)
    );

    // TEST 10: Emergency helpline numbers returned accurately
    const helplineResult = rag.query('what is the emergency helpline number');
    assert(
        helplineResult.answer.includes('1078') && helplineResult.answer.includes('112'),
        'Emergency helpline query returns 1078 (NDRF) and 112 (National Emergency)',
        helplineResult.answer.substring(0, 80)
    );

    // TEST 11: Fuzzy spelling & typo correction
    const typoResult = rag.query('how to survive flod and erthquak');
    assert(
        typoResult.answer.toLowerCase().includes('flood') || typoResult.answer.toLowerCase().includes('water') || typoResult.answer.toLowerCase().includes('earthquake'),
        'Fuzzy typo corrector handles misspelled words ("flod", "erthquak")',
        typoResult.answer.substring(0, 100)
    );

    // TEST 12: Direct reporting guidance
    const reportResult = rag.query('where should i report an emergency?');
    assert(
        reportResult.answer.toLowerCase().includes('report incident') && reportResult.answer.toLowerCase().includes('gps'),
        'Reporting query returns step-by-step citizen intake & GPS pin guidance',
        reportResult.answer.substring(0, 100)
    );

    // TEST 13: Disaster forecast navigation guidance
    const forecastResult = rag.query('where can i see the disaster forecast?');
    assert(
        forecastResult.answer.toLowerCase().includes('dashboard') || forecastResult.answer.toLowerCase().includes('forecast'),
        'Forecasting query guides user to 24h ML prediction & Dashboard double-bar chart',
        forecastResult.answer.substring(0, 100)
    );

    // TEST 14: Rescue team lookup intent
    const teamResult = rag.query('where is the rescue team?');
    assert(
        teamResult.answer.toLowerCase().includes('response') || teamResult.answer.toLowerCase().includes('unit') || teamResult.answer.toLowerCase().includes('team'),
        'Rescue team query returns active units roster & deployment status',
        teamResult.answer.substring(0, 100)
    );

    console.log(`\n--- RESULTS: ${passed} passed, ${failed} failed ---\n`);
    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => { console.error(err); process.exit(1); });
