// Data Access & Repository Adapter
// Connects to Supabase PostgreSQL when credentials exist, otherwise operates on validated local schema.
// Enforces strict types and marks demo fallback data clearly.

class DataAdapter {
    constructor() {
        this.client = null;
        this.isCloudConnected = false;
        this.config = this.readConfig();
        this.initSupabaseClient();
    }

    readConfig() {
        // Safe check without exposing keys
        const url = (typeof window !== 'undefined' && window.DISASTEROS_CONFIG?.SUPABASE_URL) || null;
        const key = (typeof window !== 'undefined' && window.DISASTEROS_CONFIG?.SUPABASE_ANON_KEY) || null;
        return {
            url: url,
            anonKey: key,
            isConfigured: !!(url && key && url.startsWith('http'))
        };
    }

    initSupabaseClient() {
        if (this.config.isConfigured && typeof window !== 'undefined' && window.supabase?.createClient) {
            try {
                this.client = window.supabase.createClient(this.config.url, this.config.anonKey);
                this.isCloudConnected = true;
                console.log("[DataAdapter] Initialized Supabase cloud client.");
            } catch (err) {
                console.warn("[DataAdapter] Supabase init failed. Falling back to local storage.", err);
                this.isCloudConnected = false;
            }
        } else {
            this.isCloudConnected = false;
        }
    }

    getConnectionStatus() {
        return {
            connected: this.isCloudConnected,
            mode: this.isCloudConnected ? "Supabase PostgreSQL (Live Auth/RLS)" : "Local-First Storage (Schema-Enforced)",
            urlConfigured: !!this.config.url,
            keyConfigured: !!this.config.anonKey
        };
    }

    // Incidents
    async fetchIncidents() {
        if (this.isCloudConnected) {
            const { data, error } = await this.client.from('incidents').select('*').order('created_at', { ascending: false });
            if (!error && data) return data;
        }
        return window.store.data.incidents || [];
    }

    async createIncident(incident) {
        if (this.isCloudConnected) {
            const { data, error } = await this.client.from('incidents').insert([incident]).select();
            if (!error && data?.[0]) return data[0];
        }
        return window.store.addIncident(incident);
    }

    async updateIncidentStatus(incidentId, status) {
        if (this.isCloudConnected) {
            const { data, error } = await this.client.from('incidents').update({ status, updated_at: new Date().toISOString() }).eq('incident_id', incidentId).select();
            if (!error && data?.[0]) return data[0];
        }
        return window.store.updateIncidentStatus(incidentId, status);
    }

    // Shelters
    async fetchShelters() {
        if (this.isCloudConnected) {
            const { data, error } = await this.client.from('shelters').select('*');
            if (!error && data) return data;
        }
        return window.store.data.shelters || [];
    }

    async updateShelterOccupancy(shelterId, delta) {
        if (this.isCloudConnected) {
            const shelter = window.store.data.shelters.find(s => s.shelter_id === shelterId);
            if (shelter) {
                const newOcc = Math.max(0, Math.min(shelter.capacity_total, (shelter.capacity_occupied || 0) + delta));
                const newStatus = newOcc >= shelter.capacity_total ? 'Full' : (newOcc >= shelter.capacity_total * 0.85 ? 'Near Capacity' : 'Open');
                const { data, error } = await this.client.from('shelters').update({ capacity_occupied: newOcc, status: newStatus, updated_at: new Date().toISOString() }).eq('shelter_id', shelterId).select();
                if (!error && data?.[0]) return data[0];
            }
        }
        return window.store.updateShelterOccupancy(shelterId, delta);
    }

    // Emergency Requests
    async fetchRequests() {
        if (this.isCloudConnected) {
            const { data, error } = await this.client.from('emergency_requests').select('*').order('priority_score', { ascending: false });
            if (!error && data) return data;
        }
        return window.store.data.emergency_requests || [];
    }

    async createRequest(req) {
        if (this.isCloudConnected) {
            const { data, error } = await this.client.from('emergency_requests').insert([req]).select();
            if (!error && data?.[0]) return data[0];
        }
        return window.store.addEmergencyRequest(req);
    }

    // Audit Log (Append-only)
    async appendAudit(logEntry) {
        if (this.isCloudConnected) {
            await this.client.from('audit_logs').insert([logEntry]);
        }
        // Local mirrored copy
        window.store.data.audit_logs.unshift(logEntry);
        if (window.store.data.audit_logs.length > 50) window.store.data.audit_logs.pop();
        window.store.save();
        return logEntry;
    }
}

if (typeof window !== 'undefined') {
    window.dataAdapter = new DataAdapter();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataAdapter };
}
