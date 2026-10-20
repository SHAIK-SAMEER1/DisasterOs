// Authentication & Role-Based Access Control Manager
// Prevents privilege escalation by verifying user roles against database profile records
// In unconfigured/demo environments, enforces role credential checks to disallow arbitrary admin login.

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.session = null;
        this.demoStaffCredentials = {
            "admin": { role: "System Administrator", pass: "admin123", name: "System Admin (Staff)" },
            "manager": { role: "Disaster Manager", pass: "manager123", name: "Shaik Sameer (Incident Commander)" },
            "thanushree": { role: "Disaster Manager", pass: "manager123", name: "M Thanushree (Operations Lead)" },
            "responder": { role: "Emergency Responder", pass: "resp123", name: "Tactical Unit Alpha (Staff)" },
            "hospital": { role: "Hospital Coordinator", pass: "hosp123", name: "Central Triage Officer" },
            "ngo": { role: "NGO Coordinator", pass: "ngo123", name: "Red Cross Liaison" },
            "warehouse": { role: "Warehouse Manager", pass: "wh123", name: "Logistics Officer" },
            "volunteer": { role: "Volunteer", pass: "vol123", name: "Field Volunteer Roster" }
        };
    }

    async signIn(emailOrUser, password, requestedPortalRole) {
        // 1. If Supabase Auth is live in browser environment
        const hasWindow = typeof window !== 'undefined';
        if (hasWindow && window.dataAdapter?.isCloudConnected && window.dataAdapter.client?.auth) {
            try {
                const { data: authData, error: authErr } = await window.dataAdapter.client.auth.signInWithPassword({
                    email: emailOrUser,
                    password: password
                });
                if (authErr) throw authErr;

                // Query trusted profile record
                const { data: profile, error: profErr } = await window.dataAdapter.client
                    .from('profiles')
                    .select('role, full_name, assigned_zone_id')
                    .eq('id', authData.user.id)
                    .single();

                if (profErr || !profile) {
                    throw new Error("User account has no valid profile or assigned role.");
                }

                // Verify portal role matches authorized database role
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

        // 2. Local-first / Demo authentication enforcement:
        // Citizens can sign in or self-register freely.
        // Privileged roles (Admin, Manager, Responder, etc.) CANNOT be accessed by arbitrarily picking the role.
        const cleanUser = (emailOrUser || '').trim().toLowerCase();
        
        if (requestedPortalRole === 'Citizen') {
            this.currentUser = {
                id: 'anon-citizen-' + Date.now().toString(36),
                email: cleanUser.includes('@') ? cleanUser : cleanUser + '@citizen.local',
                name: emailOrUser || 'Anonymous Citizen',
                role: 'Citizen',
                isVerifiedStaff: false
            };
            return { success: true, user: this.currentUser };
        }

        // Privileged role check
        const staffAccount = this.demoStaffCredentials[cleanUser];
        if (!staffAccount) {
            return {
                success: false,
                error: `Access Denied: Username '${emailOrUser}' is not registered as authorized staff. To test privileged roles, use authorized demo accounts (e.g. 'admin', 'manager', 'responder') with verified credentials.`
            };
        }

        if (password !== staffAccount.pass) {
            return {
                success: false,
                error: "Invalid staff password credentials."
            };
        }

        if (staffAccount.role !== requestedPortalRole && staffAccount.role !== 'System Administrator') {
            return {
                success: false,
                error: `Role Mismatch: Account '${emailOrUser}' is authorized as '${staffAccount.role}', not '${requestedPortalRole}'. Privilege escalation blocked.`
            };
        }

        this.currentUser = {
            id: 'staff-' + cleanUser,
            email: cleanUser + '@disasteros.internal',
            name: staffAccount.name,
            role: staffAccount.role,
            isVerifiedStaff: true
        };
        return { success: true, user: this.currentUser };
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
                return ['Emergency Responder', 'Disaster Manager'].includes(role);
            case 'sop_execute':
            case 'evacuation_order':
                return role === 'Disaster Manager';
            case 'shelter_modify':
                return ['Disaster Manager', 'NGO Coordinator'].includes(role);
            case 'hospital_modify':
                return ['Hospital Coordinator', 'Disaster Manager'].includes(role);
            case 'audit_view':
                return ['Disaster Manager', 'System Administrator'].includes(role);
            default:
                return true;
        }
    }
}

if (typeof window !== 'undefined') {
    window.authManager = new AuthManager();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager };
}
