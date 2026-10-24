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
        const res = await auth.signIn("responder.alpha", "RescueTeam#1", "Disaster Manager");
        assert.strictEqual(res.success, false, "Responder must not be able to claim Disaster Manager portal");
        assert.ok(res.error.includes("Role Mismatch"), "Must report role mismatch");
        console.log("✓ Test 2 Passed: Authorized staff prevented from escalating to an unassigned portal role.");
    }

    // Test 3: Valid Staff Sign-In with Role Verification
    {
        const res = await auth.signIn("manager.chennai", "Command#44", "Disaster Manager");
        assert.strictEqual(res.success, true, "Valid manager credentials must succeed");
        assert.strictEqual(res.user.role, "Disaster Manager");
        assert.strictEqual(res.user.isVerifiedStaff, true);
        console.log("✓ Test 3 Passed: Verified staff sign-in succeeds and retrieves trusted role.");
    }

    // Test 4: Role-Based Action Authorization Check
    {
        assert.strictEqual(auth.canPerform('evacuation_order', 'evacuation_order'), true, "Disaster Manager can order evacuations");
        
        // Switch to citizen
        await auth.signIn("citizen.arun", "CitizenPass#1", "Citizen");
        assert.strictEqual(auth.canPerform('evacuation_order', 'evacuation_order'), false, "Citizen must NOT be allowed to order evacuations");
        assert.strictEqual(auth.canPerform('sop_execute', 'sop_execute'), false, "Citizen must NOT be allowed to execute automated SOPs");
        console.log("✓ Test 4 Passed: Action authorization matrix correctly denies high-privilege actions to citizens.");
    }

    // Test 5: Verify 15 Pre-configured Evaluation Accounts across 5 Actor Roles (3 each)
    {
        const testAccounts = [
            ['admin.root', 'Admin@DisasterOS2026', 'System Administrator'],
            ['admin.tech', 'TechLead#2026', 'System Administrator'],
            ['admin.sec', 'SecOfficer$99', 'System Administrator'],
            ['manager.chennai', 'Command#44', 'Disaster Manager'],
            ['manager.mumbai', 'MumbaiCmd@26', 'Disaster Manager'],
            ['manager.delhi', 'DelhiRelief!8', 'Disaster Manager'],
            ['responder.alpha', 'RescueTeam#1', 'Emergency Responder'],
            ['responder.bravo', 'WaterRescue#2', 'Emergency Responder'],
            ['responder.medic', 'FieldParamedic#3', 'Emergency Responder'],
            ['coord.apollo', 'HospitalCare$1', 'Hospital/Shelter Coordinator'],
            ['coord.shelter1', 'ShelterWarden#4', 'Hospital/Shelter Coordinator'],
            ['coord.kem', 'KEMTrauma!9', 'Hospital/Shelter Coordinator'],
            ['citizen.arun', 'CitizenPass#1', 'Citizen'],
            ['citizen.priya', 'PriyaHelp$2', 'Citizen'],
            ['citizen.rohit', 'RohitSafety!3', 'Citizen']
        ];

        for (const [u, p, r] of testAccounts) {
            const res = await auth.signIn(u, p, r);
            assert.strictEqual(res.success, true, `Account ${u} must sign in successfully as ${r}`);
        }
        console.log("✓ Test 5 Passed: All 15 evaluation accounts (3 per actor role) verified successfully.");
    }

    // Test 6: Registration & Disaster Manager Approval Workflow
    {
        // Citizen registers directly
        const citReg = auth.register({ fullName: 'Direct Citizen', username: 'cit.direct', password: 'pass', role: 'Citizen' });
        assert.strictEqual(citReg.success, true);
        assert.strictEqual(citReg.pendingApproval, false, 'Citizen registration is immediate');

        // Staff registration enters pending state
        global.window = { store: { data: { pending_registrations: [] }, log: () => {}, save: () => {} } };
        const staffReg = auth.register({
            fullName: 'Dr. Test Surgeon',
            username: 'test.surgeon',
            password: 'SurgeonPass#1',
            role: 'Hospital Coordinator',
            orgName: 'Metro General Trauma Center'
        });
        assert.strictEqual(staffReg.success, true);
        assert.strictEqual(staffReg.pendingApproval, true, 'Privileged registration requires approval');
        assert.strictEqual(global.window.store.data.pending_registrations.length, 1);

        // Manager approves registration
        const reqId = global.window.store.data.pending_registrations[0].id;
        const approveRes = auth.approveRegistration(reqId, 'Disaster Manager');
        assert.strictEqual(approveRes.success, true);

        // Newly approved account can now log in
        const loginRes = await auth.signIn('test.surgeon', 'SurgeonPass#1', 'Hospital Coordinator');
        assert.strictEqual(loginRes.success, true, 'Approved user can log in');
        console.log("✓ Test 6 Passed: Registration workflow & Disaster Manager approval queue verified.");
    }

    console.log("\nALL AUTH & AUTHORIZATION TESTS PASSED (6/6).\n");
}

runTests().catch(err => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
