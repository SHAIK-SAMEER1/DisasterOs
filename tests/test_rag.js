// Unit tests for Enhanced Conversational RAG Assistant
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

    // TEST 1: Flood query retrieves flood-relevant passages
    const floodResult = rag.query('flood evacuation protocol when R_zone high');
    assert(
        floodResult.passages.length > 0,
        'Flood query returns at least one passage'
    );
    assert(
        floodResult.passages[0].source.toLowerCase().includes('ndma') ||
        floodResult.passages[0].topic.toLowerCase().includes('flood'),
        'Top flood passage is from NDMA or tagged flood',
        `Got topic: ${floodResult.passages[0].topic}, source: ${floodResult.passages[0].source}`
    );

    // TEST 2: Earthquake query retrieves seismic-relevant passages
    const eqResult = rag.query('earthquake rescue triage response magnitude');
    assert(
        eqResult.passages.length > 0,
        'Earthquake query returns passages'
    );
    assert(
        eqResult.passages.some(p => p.topic.toLowerCase().includes('earthquake') || p.topic.toLowerCase().includes('seismic')),
        'At least one passage is earthquake/seismic related',
        `Topics: ${eqResult.passages.map(p => p.topic).join(', ')}`
    );

    // TEST 3: START triage query returns mass-casualty protocol
    const triageResult = rag.query('START protocol red tag mass casualty');
    assert(
        triageResult.answer.toLowerCase().includes('immediate') ||
        triageResult.answer.toLowerCase().includes('triage') ||
        triageResult.answer.toLowerCase().includes('red'),
        'Triage query answer contains triage terminology',
        triageResult.answer.substring(0, 100)
    );

    // TEST 4: Unknown query returns safety guidance fallback
    const unknownResult = rag.query('quantum entanglement pizza recipe');
    assert(
        unknownResult.passages[0].passage.toLowerCase().includes('safety guidance') ||
        unknownResult.passages[0].passage.toLowerCase().includes('no relevant'),
        'Unknown query returns intelligent civil defense safety guidance',
        unknownResult.passages[0].passage.substring(0, 80)
    );

    // TEST 5: Citations array is populated
    assert(
        floodResult.citations.length > 0 && typeof floodResult.citations[0] === 'string',
        'Query response contains string citations',
        JSON.stringify(floodResult.citations)
    );

    // TEST 6: retrievedAt timestamp is ISO format
    assert(
        floodResult.retrievedAt && floodResult.retrievedAt.includes('T'),
        'Response contains ISO timestamp',
        floodResult.retrievedAt
    );

    // TEST 7: Shelter capacity query returns SOP content
    const shelterResult = rag.query('shelter capacity overflow 90 percent headroom');
    assert(
        shelterResult.answer.toLowerCase().includes('shelter') ||
        shelterResult.answer.toLowerCase().includes('camp'),
        'Shelter query returns relevant capacity content',
        shelterResult.answer.substring(0, 100)
    );

    // TEST 8: Greeting 'hi' or 'hello' responds with conversational greeting
    const greetResult = rag.query('hi');
    assert(
        greetResult.answer.toLowerCase().includes('hello') || greetResult.answer.toLowerCase().includes('tactical'),
        "Conversational greeting 'hi' returns warm assistant greeting",
        greetResult.answer.substring(0, 80)
    );

    // TEST 9: Emergency helpline numbers returned accurately
    const helplineResult = rag.query('what is the emergency helpline number');
    assert(
        helplineResult.answer.includes('1078') && helplineResult.answer.includes('112'),
        'Emergency helpline query returns 1078 (NDRF) and 112 (National Emergency)',
        helplineResult.answer.substring(0, 80)
    );

    console.log(`\n--- RESULTS: ${passed} passed, ${failed} failed ---\n`);
    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => { console.error(err); process.exit(1); });
