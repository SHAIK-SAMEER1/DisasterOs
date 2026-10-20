// Authorization & Role Escalation Prevention Tests
// Run via: node tests/test_auth.js

const assert = require('assert');
const { AuthManager } = require('../js/auth.js');

console.log("=== RUNNING DISASTEROS AUTH & AUTHORIZATION TESTS ===");

const auth = new AuthManager();

async function runTests() {
    // Test 1: Privilege Escalation Attack - Ordinary user tries to log in as System Administrator
    {
        const res = await auth.signIn("random_user", "any_password", "System Administrator");
        assert.strictEqual(res.success, false, "Unregistered user must NOT be allowed to enter as System Administrator");
        assert.ok(res.error.includes("Access Denied"), "Error message must state Access Denied");
        console.log("✓ Test 1 Passed: Unauthorized user prevented from choosing System Administrator portal.");
    }

    // Test 2: Role Mismatch Attack - Responder account tries to enter Disaster Manager portal
    {
        const res = await auth.signIn("responder", "resp123", "Disaster Manager");
        assert.strictEqual(res.success, false, "Responder must not be able to claim Disaster Manager portal");
        assert.ok(res.error.includes("Role Mismatch"), "Must report role mismatch");
        console.log("✓ Test 2 Passed: Authorized staff prevented from escalating to an unassigned portal role.");
    }

    // Test 3: Valid Staff Sign-In with Role Verification
    {
        const res = await auth.signIn("manager", "manager123", "Disaster Manager");
        assert.strictEqual(res.success, true, "Valid manager credentials must succeed");
        assert.strictEqual(res.user.role, "Disaster Manager");
        assert.strictEqual(res.user.isVerifiedStaff, true);
        console.log("✓ Test 3 Passed: Verified staff sign-in succeeds and retrieves trusted role.");
    }

    // Test 4: Role-Based Action Authorization Check
    {
        assert.strictEqual(auth.canPerform('evacuation_order', 'evacuation_order'), true, "Disaster Manager can order evacuations");
        
        // Switch to citizen
        await auth.signIn("test_citizen", "", "Citizen");
        assert.strictEqual(auth.canPerform('evacuation_order', 'evacuation_order'), false, "Citizen must NOT be allowed to order evacuations");
        assert.strictEqual(auth.canPerform('sop_execute', 'sop_execute'), false, "Citizen must NOT be allowed to execute automated SOPs");
        console.log("✓ Test 4 Passed: Action authorization matrix correctly denies high-privilege actions to citizens.");
    }

    console.log("\nALL AUTH & AUTHORIZATION TESTS PASSED (4/4).\n");
}

runTests().catch(err => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
