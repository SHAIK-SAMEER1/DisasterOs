// Unit tests for SHA-256 Audit Hash Chain
// node tests/test_audit_chain.js

const { AuditHashChain } = require('../js/audit-hash.js');

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
    console.log('\n=== AUDIT HASH CHAIN UNIT TESTS ===\n');

    // TEST 1: First block's previous_hash equals genesis hash
    const chain1 = new AuditHashChain();
    const block0 = await chain1.append({ actor: 'manager', action: 'LOGIN', resource: 'auth' });
    assert(
        block0.previous_hash === chain1.genesisHash,
        'First block previous_hash equals genesis hash',
        `previous_hash: ${block0.previous_hash.substring(0, 16)}...`
    );

    // TEST 2: block_hash is a 64-char hex string
    assert(
        block0.block_hash && block0.block_hash.length === 64 && /^[0-9a-f]+$/.test(block0.block_hash),
        'block_hash is 64-character hex string',
        `length: ${block0.block_hash.length}, value: ${block0.block_hash.substring(0, 16)}...`
    );

    // TEST 3: Chaining — block 1 previous_hash === block 0 block_hash
    const block1 = await chain1.append({ actor: 'manager', action: 'CREATE_INCIDENT', resource: 'INC-001' });
    assert(
        block1.previous_hash === block0.block_hash,
        'Block 1 previous_hash equals Block 0 block_hash (chain integrity)',
        `b0_hash: ${block0.block_hash.substring(0, 16)}..., b1_prev: ${block1.previous_hash.substring(0, 16)}...`
    );

    // TEST 4: Verify clean chain returns valid
    const block2 = await chain1.append({ actor: 'responder', action: 'UPDATE_STATUS', resource: 'INC-001' });
    const verifyResult = await chain1.verify();
    assert(
        verifyResult.valid === true,
        `Clean chain (3 blocks) verifies as valid: "${verifyResult.reason}"`,
        JSON.stringify(verifyResult)
    );

    // TEST 5: Tampered chain fails verification
    const chain2 = new AuditHashChain();
    await chain2.append({ actor: 'manager', action: 'LOGIN' });
    await chain2.append({ actor: 'admin', action: 'DELETE_USER' });
    await chain2.append({ actor: 'responder', action: 'DISPATCH' });

    // Tamper: modify action in block index 1 without updating hash
    chain2.chain[1].action = 'TAMPERED_ACTION';
    const tamperResult = await chain2.verify();
    assert(
        tamperResult.valid === false,
        'Tampered chain is detected by verification',
        `failedAt: block ${tamperResult.failedAt}, reason: ${tamperResult.reason}`
    );

    // TEST 6: getSummary returns correct count
    const summary = chain1.getSummary();
    assert(
        summary.total_entries === 3,
        `getSummary reports 3 entries (got ${summary.total_entries})`,
        JSON.stringify({ total: summary.total_entries, latestHash: summary.latest_hash.substring(0, 16) })
    );

    // TEST 7: Block index increments correctly
    assert(
        block0.block_index === 0 && block1.block_index === 1 && block2.block_index === 2,
        `Block indices are sequential (0, 1, 2): got ${block0.block_index}, ${block1.block_index}, ${block2.block_index}`
    );

    console.log(`\n--- RESULTS: ${passed} passed, ${failed} failed ---\n`);
    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => { console.error(err); process.exit(1); });
