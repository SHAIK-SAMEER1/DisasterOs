// End-to-End Lifecycle Verification Test for Complaints & Incident Reporting
// Verifies that all 5 actors have authorization to report and update complaints from start to end stage
// and verifies the complete database and system architecture flow (SHA-256 audit, alert broadcast, team dispatch).

const assert = require("assert");
const { DataStore } = require("../js/store.js");
const { AuthManager } = require("../js/auth.js");
const { AuditHashChain } = require("../js/audit-hash.js");

console.log("=== RUNNING DISASTEROS COMPLAINT & INCIDENT LIFECYCLE TESTS ===\n");

// Mock browser environment for Node.js
global.window = {
    auditChain: new AuditHashChain(),
    store: new DataStore()
};
global.store = global.window.store;

const actors = [
    { role: "Citizen", username: "citizen.priya", pass: "PriyaHelp$2", name: "Priya Sharma" },
    { role: "Emergency Responder", username: "responder.alpha", pass: "RescueTeam#1", name: "NDRF Alpha Squad Lead" },
    { role: "Hospital Coordinator", username: "coord.apollo", pass: "HospitalCare$1", name: "Dr. K. Ananth" },
    { role: "Shelter Coordinator", username: "coord.shelter1", pass: "ShelterWarden#4", name: "S. Ramanathan" },
    { role: "Disaster Manager", username: "manager.chennai", pass: "Command#44", name: "Shaik Sameer" },
    { role: "System Administrator", username: "admin.root", pass: "Admin@DisasterOS2026", name: "Root Infrastructure Admin" }
];

async function runTests() {
    const auth = new AuthManager();

    // 1. Verify all 5+ actors can report complaints with full architecture flow
    for (const actor of actors) {
        // Authenticate as actor
        const loginRes = await auth.signIn(actor.username, actor.pass, actor.role);
        assert.strictEqual(loginRes.success, true, `Authentication must succeed for ${actor.name} as ${actor.role}`);
        global.window.app = { currentUser: loginRes.user };

        const initialAlertsCount = global.window.store.data.alerts.length;
        const initialBlocksCount = global.window.auditChain.chain.length;

        // Actor reports a complaint
        const reportedComplaint = global.window.store.addIncident({
            type: "flood",
            severity: "critical",
            location: `${actor.name} Residence Sector`,
            description: `Urgent flood complaint reported by ${actor.name} (${actor.role})`,
            lat: 13.0850,
            lon: 80.2750,
            zone_id: "ZONE-NORTH",
            reporter_id: actor.name,
            reporter_role: actor.role
        });

        // Yield for async SHA-256 microtask
        await new Promise(r => setTimeout(r, 20));

        assert(reportedComplaint.incident_id, "Incident must have a unique identifier");
        assert.strictEqual(reportedComplaint.status, "reported", "Initial stage must be 'reported'");
        assert.strictEqual(reportedComplaint.reporter_id, actor.name, "Reporter ID must match logged in actor");
        assert.strictEqual(reportedComplaint.reporter_role, actor.role, "Reporter role must match");

        // Verify alert was emitted
        assert(global.window.store.data.alerts.length > initialAlertsCount, "Real-time alert must be broadcasted");
        const topAlert = global.window.store.data.alerts[0];
        assert.strictEqual(topAlert.incident_id, reportedComplaint.incident_id, "Broadcast alert must reference the reported incident");

        // Verify cryptographic SHA-256 audit block appended
        assert(global.window.auditChain.chain.length > initialBlocksCount, "SHA-256 block must be appended");
        const latestBlock = global.window.auditChain.chain[global.window.auditChain.chain.length - 1];
        assert.strictEqual(latestBlock.action, "REPORT_INCIDENT", "Audit block action must be REPORT_INCIDENT");

        console.log(`✓ Actor '${actor.name}' (${actor.role}) successfully reported complaint ${reportedComplaint.incident_id}`);
    }

    // 2. Verify complete start-to-end lifecycle progression by actors
    console.log("\n--- Testing Complete Start-to-End Lifecycle Pipeline (Reported ➔ Verified ➔ Assigned ➔ Resolved ➔ Closed) ---");
    
    // Test incident
    const testIncident = global.window.store.addIncident({
        type: "collapse",
        severity: "critical",
        location: "Central Metro Overpass",
        description: "Structural displacement on ramp",
        lat: 13.0800,
        lon: 80.2700,
        zone_id: "ZONE-CENTRAL",
        reporter_id: "Arun Kumar",
        reporter_role: "Citizen"
    });
    const id = testIncident.incident_id;
    await new Promise(r => setTimeout(r, 20));

    // Stage 1: Reported
    assert.strictEqual(testIncident.status, "reported", "Stage 1 must be reported");
    console.log(`✓ Stage 1: Complaint ${id} initiated as REPORTED`);

    // Stage 2: Verified (e.g. by Hospital/Shelter Coordinator or Responder)
    const verified = global.window.store.updateIncidentStatus(id, "verified", null, "Dr. K. Ananth (Hospital Coordinator)");
    await new Promise(r => setTimeout(r, 20));
    assert.strictEqual(verified.status, "verified", "Stage 2 must be verified");
    console.log(`✓ Stage 2: Complaint ${id} transitioned to VERIFIED`);

    // Stage 3: Assigned (e.g. Team dispatched)
    const teamName = "NDRF Battalion 04 Alpha";
    const assigned = global.window.store.updateIncidentStatus(id, "assigned", teamName, "NDRF Alpha Squad Lead (Emergency Responder)");
    await new Promise(r => setTimeout(r, 20));
    assert.strictEqual(assigned.status, "assigned", "Stage 3 must be assigned");
    assert.strictEqual(assigned.team, teamName, "Assigned team must be set");
    
    // Verify team status changed to deployed in system architecture
    const deployedTeam = global.window.store.data.teams.find(t => t.name === teamName);
    assert(deployedTeam, "Assigned team must exist in store");
    assert.strictEqual(deployedTeam.status, "deployed", "Assigned team status must become 'deployed'");
    console.log(`✓ Stage 3: Complaint ${id} ASSIGNED to ${teamName} (Team status: deployed)`);

    // Stage 4: In Progress
    const inProgress = global.window.store.updateIncident(id, {
        status: "in_progress",
        description: "Rescue squad on scene with hydraulic cutters.",
        updated_by: "NDRF Alpha Squad Lead"
    });
    await new Promise(r => setTimeout(r, 20));
    assert.strictEqual(inProgress.status, "in_progress", "Stage 4 must be in_progress");
    console.log(`✓ Stage 4: Complaint ${id} transitioned to IN_PROGRESS`);

    // Stage 5: Resolved
    const resolved = global.window.store.updateIncidentStatus(id, "resolved", null, "Shaik Sameer (Disaster Manager)");
    await new Promise(r => setTimeout(r, 20));
    assert.strictEqual(resolved.status, "resolved", "Stage 5 must be resolved");
    // Verify team is released back to active pool
    assert.strictEqual(deployedTeam.status, "active", "Assigned team status must revert to 'active' on resolution");
    console.log(`✓ Stage 5: Complaint ${id} RESOLVED (Team ${teamName} released to active pool)`);

    // Stage 6: Closed & Cryptographically Sealed
    const closed = global.window.store.updateIncidentStatus(id, "closed", null, "Root Infrastructure Admin (System Administrator)");
    await new Promise(r => setTimeout(r, 20));
    assert.strictEqual(closed.status, "closed", "Stage 6 must be closed");
    console.log(`✓ Stage 6: Complaint ${id} CLOSED & CRYPTOGRAPHICALLY SEALED`);

    // Verify chain integrity
    const chainVerification = await global.window.auditChain.verify();
    assert.strictEqual(chainVerification.valid, true, "SHA-256 audit ledger must remain cryptographically valid");
    console.log(`✓ Audit Chain verified: All ${global.window.auditChain.chain.length} blocks valid.`);

    console.log("\nALL COMPLAINT & INCIDENT LIFECYCLE TESTS PASSED (100%).");
}

runTests().catch(err => {
    console.error("Test failure:", err);
    process.exit(1);
});
