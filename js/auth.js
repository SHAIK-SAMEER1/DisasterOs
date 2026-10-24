// Authentication & Role-Based Access Control Manager — DisasterOS
// Supports 5 distinct actor roles with 15 verified evaluation accounts (3 test cases per actor)
// Implements Registration workflow with Disaster Manager / System Administrator approval queue.

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.session = null;

        // 15 Comprehensive Test Accounts (3 per actor role) + convenience developer aliases
        this.demoStaffCredentials = {
            // --- 1. SYSTEM ADMINISTRATOR (Root Infrastructure & Governance) ---
            "admin.root": { role: "System Administrator", pass: "Admin@DisasterOS2026", name: "Root Infrastructure Admin", org: "National Disaster Management Authority (NDMA)" },
            "admin.tech": { role: "System Administrator", pass: "TechLead#2026", name: "Lead Systems Architect", org: "DisasterOS Engineering Command" },
            "admin.sec": { role: "System Administrator", pass: "SecOfficer$99", name: "Security & Audit Compliance Lead", org: "Cyber Defense Bureau" },
            "admin": { role: "System Administrator", pass: "admin123", name: "System Admin (Quick Test)", org: "Command Center" },

            // --- 2. DISASTER MANAGER (Operational Commander & Approvals) ---
            "manager.chennai": { role: "Disaster Manager", pass: "Command#44", name: "Shaik Sameer (Incident Commander)", org: "Chennai District Disaster Management" },
            "manager.mumbai": { role: "Disaster Manager", pass: "MumbaiCmd@26", name: "M. Thanushree (Operations Director)", org: "MCGM Disaster Management Cell" },
            "manager.delhi": { role: "Disaster Manager", pass: "DelhiRelief!8", name: "Vikram Malhotra (Zonal Commander)", org: "Delhi Disaster Management Authority" },
            "manager": { role: "Disaster Manager", pass: "manager123", name: "Incident Commander (Quick Test)", org: "Disaster Operations Command" },

            // --- 3. EMERGENCY RESPONDER (Search, Rescue & Field Units) ---
            "responder.alpha": { role: "Emergency Responder", pass: "RescueTeam#1", name: "NDRF Alpha Squad Lead", org: "NDRF 4th Battalion" },
            "responder.bravo": { role: "Emergency Responder", pass: "WaterRescue#2", name: "Lt. R. Nathan (Marine Boat Unit)", org: "Disaster Marine Flotilla" },
            "responder.medic": { role: "Emergency Responder", pass: "FieldParamedic#3", name: "Dr. Partha Das (Mass Casualty Paramedic)", org: "Emergency Medical Flying Squad" },
            "responder": { role: "Emergency Responder", pass: "resp123", name: "Tactical Unit Alpha (Quick Test)", org: "First Response Unit" },

            // --- 4. HOSPITAL & SHELTER COORDINATOR (Facilities & Resources) ---
            "coord.apollo": { role: "Hospital Coordinator", pass: "HospitalCare$1", name: "Dr. K. Ananth (Trauma Triage Head)", org: "Apollo Hospitals Emergency Wing" },
            "coord.shelter1": { role: "Shelter Coordinator", pass: "ShelterWarden#4", name: "S. Ramanathan (Shelter Warden)", org: "Perambur High School Relief Center" },
            "coord.kem": { role: "Hospital Coordinator", pass: "KEMTrauma!9", name: "Dr. Anjali Rao (KEM Emergency Lead)", org: "KEM King Edward Memorial Hospital" },
            "hospital": { role: "Hospital Coordinator", pass: "hosp123", name: "Central Triage Officer (Quick Test)", org: "City General Hospital" },

            // --- 5. CITIZEN / PUBLIC (Reporting, Safe Routes & Helplines) ---
            "citizen.arun": { role: "Citizen", pass: "CitizenPass#1", name: "Arun Kumar (River Road Resident)", org: "General Public" },
            "citizen.priya": { role: "Citizen", pass: "PriyaHelp$2", name: "Priya Sharma (Community Volunteer)", org: "General Public" },
            "citizen.rohit": { role: "Citizen", pass: "RohitSafety!3", name: "Rohit Verma (Velachery Citizen)", org: "General Public" },
            "citizen": { role: "Citizen", pass: "citizen123", name: "Public Citizen (Quick Test)", org: "Resident" }
        };
    }

    async signIn(emailOrUser, password, requestedPortalRole) {
        const cleanUser = (emailOrUser || '').trim().toLowerCase();

        // 1. Supabase Cloud Adapter check (if configured in production)
        const hasWindow = typeof window !== 'undefined';
        if (hasWindow && window.dataAdapter?.isCloudConnected && window.dataAdapter.client?.auth) {
            try {
                const { data: authData, error: authErr } = await window.dataAdapter.client.auth.signInWithPassword({
                    email: emailOrUser,
                    password: password
                });
                if (authErr) throw authErr;

                const { data: profile, error: profErr } = await window.dataAdapter.client
                    .from('profiles')
                    .select('role, full_name, assigned_zone_id')
                    .eq('id', authData.user.id)
                    .single();

                if (profErr || !profile) {
                    throw new Error("User account has no valid profile or assigned role.");
                }

                if (requestedPortalRole && profile.role !== requestedPortalRole && profile.role !== 'System Administrator') {
                    throw new Error(`Access Denied: Your verified account role is '${profile.role}', which cannot access the '${requestedPortalRole}' portal.`);
                }

                this.currentUser = {
                    id: authData.user.id,
                    email: authData.user.email,
                    name: profile.full_name,
                    role: profile.role,
                    assignedZone: profile.assigned_zone_id,
                    isVerifiedStaff: profile.role !== 'Citizen'
                };
                this.session = authData.session;
                return { success: true, user: this.currentUser };
            } catch (err) {
                return { success: false, error: err.message };
            }
        }

        // 2. Local-First / Demo Authentication:
        // Check if user is in pending registrations queue
        if (hasWindow && window.store?.data?.pending_registrations) {
            const pending = window.store.data.pending_registrations.find(p => p.username.toLowerCase() === cleanUser);
            if (pending) {
                if (pending.status === 'pending') {
                    return {
                        success: false,
                        error: `Account Pending Approval: Registration for '${pending.full_name}' (${pending.org_name}) is awaiting authorization by a Disaster Manager. Access is restricted until approved.`
                    };
                } else if (pending.status === 'rejected') {
                    return {
                        success: false,
                        error: `Registration Rejected: Your account application was rejected by the Disaster Manager. Reason: ${pending.rejection_reason || 'Verification criteria not met.'}`
                    };
                }
            }
        }

        // 3. Citizen Direct Portal Access
        if (requestedPortalRole === 'Citizen') {
            const citizenAccount = this.demoStaffCredentials[cleanUser];
            if (citizenAccount && password && password !== citizenAccount.pass) {
                return { success: false, error: "Invalid password for this citizen account." };
            }
            this.currentUser = {
                id: 'citizen-' + (citizenAccount ? cleanUser : Date.now().toString(36)),
                email: citizenAccount ? `${cleanUser}@citizen.local` : 'citizen@public.local',
                name: citizenAccount ? citizenAccount.name : (emailOrUser || 'Public Citizen'),
                role: 'Citizen',
                isVerifiedStaff: false
            };
            return { success: true, user: this.currentUser };
        }

        // 4. Privileged Staff Account Lookup
        const staffAccount = this.demoStaffCredentials[cleanUser];

        if (!staffAccount) {
            return {
                success: false,
                error: `Access Denied: Username '${emailOrUser}' is not registered as authorized staff. Use one of the 15 verified evaluation accounts or sign up as a new organization for manager approval.`
            };
        }

        if (password !== staffAccount.pass) {
            return {
                success: false,
                error: "Invalid password credentials. Please verify your password or use the 1-Click Test Login credentials."
            };
        }

        // Normalize roles for validation
        const normalizedStaffRole = this._normalizeRole(staffAccount.role);
        const normalizedRequestedRole = requestedPortalRole ? this._normalizeRole(requestedPortalRole) : null;

        // System Administrator can access any portal view
        if (normalizedStaffRole !== 'System Administrator' && normalizedRequestedRole && normalizedStaffRole !== normalizedRequestedRole) {
            return {
                success: false,
                error: `Role Mismatch: Account '${emailOrUser}' is authorized as '${staffAccount.role}', not '${requestedPortalRole}'. Privilege escalation blocked.`
            };
        }

        this.currentUser = {
            id: 'staff-' + cleanUser,
            email: cleanUser.includes('@') ? cleanUser : `${cleanUser}@disasteros.internal`,
            name: staffAccount.name,
            role: staffAccount.role,
            org: staffAccount.org,
            isVerifiedStaff: staffAccount.role !== 'Citizen'
        };

        if (hasWindow && window.store) {
            window.store.log(this.currentUser.name, `Logged in as ${this.currentUser.role}`, "AUTH");
        }

        return { success: true, user: this.currentUser };
    }

    _normalizeRole(role) {
        if (!role) return "";
        const r = role.toLowerCase();
        if (r.includes("admin")) return "System Administrator";
        if (r.includes("manager")) return "Disaster Manager";
        if (r.includes("responder") || r.includes("rescue")) return "Emergency Responder";
        if (r.includes("hospital") || r.includes("shelter") || r.includes("coord")) return "Hospital/Shelter Coordinator";
        return "Citizen";
    }

    /**
     * Submit registration for a new facility/organization.
     * Citizen registrations are activated immediately; staff registrations require manager approval.
     */
    register(userData) {
        const { fullName, username, password, email, role, orgName, phone, facilityType, city } = userData;
        const cleanUser = (username || '').trim().toLowerCase();

        if (!cleanUser || !password || !fullName) {
            return { success: false, error: "Please fill all required registration fields." };
        }

        if (this.demoStaffCredentials[cleanUser]) {
            return { success: false, error: `Username '${cleanUser}' is already taken.` };
        }

        const isCitizen = role === "Citizen";

        if (isCitizen) {
            // Immediate registration for citizens
            this.demoStaffCredentials[cleanUser] = {
                role: "Citizen",
                pass: password,
                name: fullName,
                org: orgName || "General Public"
            };
            return {
                success: true,
                pendingApproval: false,
                message: "Citizen account registered successfully! You may now sign in."
            };
        }

        // Privileged staff registrations placed into pending queue for Disaster Manager review
        const registrationRecord = {
            id: "REG-" + Date.now().toString(36).toUpperCase(),
            full_name: fullName,
            username: cleanUser,
            pass: password,
            email: email || `${cleanUser}@facility.local`,
            role: role || "Hospital Coordinator",
            org_name: orgName || "Independent Relief Center",
            phone: phone || "N/A",
            facility_type: facilityType || "Relief Facility",
            city: city || "chennai",
            status: "pending",
            submitted_at: new Date().toISOString()
        };

        if (typeof window !== 'undefined' && window.store) {
            if (!window.store.data.pending_registrations) {
                window.store.data.pending_registrations = [];
            }
            window.store.data.pending_registrations.unshift(registrationRecord);
            window.store.log("Registration", `New registration application from ${fullName} (${orgName}) awaiting approval`, "REGISTRATION");
            window.store.save();
        }

        return {
            success: true,
            pendingApproval: true,
            message: `Registration submitted for '${fullName}' (${orgName})! An authorized Disaster Manager must review and approve your application before your account is activated.`
        };
    }

    /**
     * Disaster Manager or Admin approves a pending registration.
     */
    approveRegistration(id, approvingActorName = "Disaster Manager") {
        if (typeof window === 'undefined' || !window.store) return { success: false, error: "Store not mounted" };

        const pendingList = window.store.data.pending_registrations || [];
        const record = pendingList.find(r => r.id === id);

        if (!record) {
            return { success: false, error: "Registration request not found." };
        }

        record.status = "approved";
        record.approved_by = approvingActorName;
        record.approved_at = new Date().toISOString();

        // Add to active credentials
        this.demoStaffCredentials[record.username] = {
            role: record.role,
            pass: record.pass,
            name: record.full_name,
            org: record.org_name
        };

        window.store.log(approvingActorName, `APPROVED registration application for ${record.full_name} (${record.org_name}) as ${record.role}`, "REGISTRATION");
        window.store.save();

        return { success: true, message: `Account for '${record.full_name}' successfully activated!` };
    }

    /**
     * Disaster Manager or Admin rejects a pending registration.
     */
    rejectRegistration(id, reason = "Documentation or role authority unverified", rejectingActorName = "Disaster Manager") {
        if (typeof window === 'undefined' || !window.store) return { success: false, error: "Store not mounted" };

        const pendingList = window.store.data.pending_registrations || [];
        const record = pendingList.find(r => r.id === id);

        if (!record) {
            return { success: false, error: "Registration request not found." };
        }

        record.status = "rejected";
        record.rejection_reason = reason;
        record.rejected_by = rejectingActorName;
        record.rejected_at = new Date().toISOString();

        window.store.log(rejectingActorName, `REJECTED registration application for ${record.full_name} (${record.org_name}). Reason: ${reason}`, "REGISTRATION");
        window.store.save();

        return { success: true, message: `Registration application for '${record.full_name}' was rejected.` };
    }

    getPendingRegistrations() {
        if (typeof window !== 'undefined' && window.store?.data?.pending_registrations) {
            return window.store.data.pending_registrations.filter(r => r.status === 'pending');
        }
        return [];
    }

    signOut() {
        if (typeof window !== 'undefined' && window.dataAdapter?.isCloudConnected && window.dataAdapter.client?.auth) {
            window.dataAdapter.client.auth.signOut();
        }
        this.currentUser = null;
        this.session = null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    canPerform(action, module) {
        if (!this.currentUser) return false;
        const role = this.currentUser.role;
        if (role === 'System Administrator') return true;

        switch (module) {
            case 'incidents_mutate':
                return ['Disaster Manager', 'Emergency Responder'].includes(role);
            case 'dispatch_order':
            case 'evacuation_order':
            case 'sop_execute':
                return ['Disaster Manager'].includes(role);
            case 'resource_update':
                return ['Disaster Manager', 'Hospital Coordinator', 'Shelter Coordinator', 'Warehouse Manager'].includes(role);
            case 'registration_approve':
                return ['System Administrator', 'Disaster Manager'].includes(role);
            case 'system_config':
            case 'audit_purge':
                return role === 'System Administrator';
            default:
                return role !== 'Citizen';
        }
    }
}

// Global auth manager instance
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager };
} else {
    window.auth = new AuthManager();
    window.authManager = window.auth;
}
