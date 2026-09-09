// Data Access Layer: Implements local-first storage and CRUD operations for the 7 canonical DisasterOS schemas.

const DB_KEY = "disasteros_db_v1";

const initialData = {
    zones: [
        { zone_id: "ZONE-NORTH", name: "North Zone (Riverfront)", lat: 13.1100, lon: 80.2200, vulnerability: 0.75, radius_km: 15 },
        { zone_id: "ZONE-EAST", name: "East Coastal Zone", lat: 13.0800, lon: 80.2900, vulnerability: 0.60, radius_km: 12 },
        { zone_id: "ZONE-CENTRAL", name: "Central Urban Zone", lat: 13.0500, lon: 80.2400, vulnerability: 0.40, radius_km: 10 },
        { zone_id: "ZONE-WEST", name: "Western Hills & Industrial", lat: 13.0300, lon: 80.1800, vulnerability: 0.35, radius_km: 15 }
    ],

    incidents: [
        {
            incident_id: "INC-1001",
            reporter_id: "CITIZEN-01",
            type: "flood",
            description: "River overflow flooding residential block A and road junction.",
            lat: 13.1150,
            lon: 80.2240,
            zone_id: "ZONE-NORTH",
            severity: "critical",
            status: "reported",
            image_url: null,
            created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
            incident_id: "INC-1002",
            reporter_id: "POLICE-04",
            type: "infrastructure",
            description: "Old bridge structural crack observed after minor tremor.",
            lat: 13.0820,
            lon: 80.2880,
            zone_id: "ZONE-EAST",
            severity: "high",
            status: "verified",
            image_url: null,
            created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
            incident_id: "INC-1003",
            reporter_id: "CITIZEN-09",
            type: "medical",
            description: "Multiple people injured due to wall collapse during rains.",
            lat: 13.0520,
            lon: 80.2420,
            zone_id: "ZONE-CENTRAL",
            severity: "high",
            status: "dispatched",
            image_url: null,
            created_at: new Date(Date.now() - 10800000).toISOString()
        }
    ],

    emergency_requests: [
        {
            request_id: "REQ-2001",
            incident_id: "INC-1001",
            requester_name: "Rahul Kumar",
            need_type: "rescue",
            people_count: 5,
            lat: 13.1150,
            lon: 80.2240,
            priority_score: 0.92,
            assigned_team_id: "TEAM-ALPHA",
            status: "assigned",
            created_at: new Date(Date.now() - 3000000).toISOString()
        },
        {
            request_id: "REQ-2002",
            incident_id: "INC-1001",
            requester_name: "Meena Sundaram",
            need_type: "evacuation",
            people_count: 12,
            lat: 13.1180,
            lon: 80.2210,
            priority_score: 0.88,
            assigned_team_id: null,
            status: "open",
            created_at: new Date(Date.now() - 1800000).toISOString()
        }
    ],

    shelters: [
        {
            shelter_id: "SHELTER-01",
            name: "Govt Model Higher Secondary School",
            lat: 13.1050,
            lon: 80.2180,
            zone_id: "ZONE-NORTH",
            capacity_total: 500,
            capacity_occupied: 380,
            resources: { water_l: 4500, food_kits: 800, medkits: 120, blankets: 650 },
            status: "open"
        },
        {
            shelter_id: "SHELTER-02",
            name: "Community Civic Centre East",
            lat: 13.0780,
            lon: 80.2850,
            zone_id: "ZONE-EAST",
            capacity_total: 350,
            capacity_occupied: 320,
            resources: { water_l: 2100, food_kits: 400, medkits: 50, blankets: 300 },
            status: "open"
        },
        {
            shelter_id: "SHELTER-03",
            name: "Central Indoor Stadium Relief Camp",
            lat: 13.0530,
            lon: 80.2390,
            zone_id: "ZONE-CENTRAL",
            capacity_total: 900,
            capacity_occupied: 310,
            resources: { water_l: 9500, food_kits: 1500, medkits: 250, blankets: 1100 },
            status: "open"
        }
    ],

    hospitals: [
        {
            hospital_id: "HOSP-01",
            name: "City Government General Hospital",
            lat: 13.0560,
            lon: 80.2450,
            zone_id: "ZONE-CENTRAL",
            bed_capacity_total: 300,
            bed_capacity_available: 48,
            icu_beds: 12,
            trauma_capable: true,
            contact_number: "+91-44-2530-5000",
            status: "operational"
        },
        {
            hospital_id: "HOSP-02",
            name: "North Emergency & Trauma Center",
            lat: 13.1120,
            lon: 80.2270,
            zone_id: "ZONE-NORTH",
            bed_capacity_total: 150,
            bed_capacity_available: 16,
            icu_beds: 4,
            trauma_capable: true,
            contact_number: "+91-44-2590-1122",
            status: "high_load"
        },
        {
            hospital_id: "HOSP-03",
            name: "District Medical Hospital East",
            lat: 13.0760,
            lon: 80.2910,
            zone_id: "ZONE-EAST",
            bed_capacity_total: 220,
            bed_capacity_available: 72,
            icu_beds: 10,
            trauma_capable: false,
            contact_number: "+91-44-2820-3344",
            status: "operational"
        }
    ],

    inventory: [
        { item_id: "INV-01", item_type: "Drinking Water", quantity: 8500, unit: "liters", threshold: 3000, warehouse: "WH-Central" },
        { item_id: "INV-02", item_type: "Ready-to-Eat Food Packs", quantity: 4200, unit: "kits", threshold: 1500, warehouse: "WH-Central" },
        { item_id: "INV-03", item_type: "Emergency First Aid Kits", quantity: 380, unit: "kits", threshold: 100, warehouse: "WH-North" },
        { item_id: "INV-04", item_type: "Thermal Blankets", quantity: 920, unit: "units", threshold: 300, warehouse: "WH-East" }
    ],

    teams: [
        { team_id: "TEAM-ALPHA", name: "Rescue Team Alpha (Boat / Flood)", skill: "Flood & Swiftwater", zone: "North", status: "deployed", lat: 13.1140, lon: 80.2230 },
        { team_id: "TEAM-BRAVO", name: "Urban Search & Rescue 02", skill: "Structural Collapse", zone: "East", status: "available", lat: 13.0810, lon: 80.2870 },
        { team_id: "TEAM-CHARLIE", name: "Medical Rapid Response Unit", skill: "Triage & Trauma", zone: "Central", status: "available", lat: 13.0540, lon: 80.2410 }
    ],

    audit_logs: [
        { log_id: "LOG-01", actor_name: "System", action: "DisasterOS Data Layer Initialized", module: "SYSTEM", created_at: new Date().toISOString() }
    ]
};

class DataStore {
    constructor() {
        this.data = this.load();
    }

    load() {
        const stored = localStorage.getItem(DB_KEY);
        if (!stored) {
            this.save(initialData);
            return JSON.parse(JSON.stringify(initialData));
        }
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("Failed to parse DB, resetting to defaults", e);
            this.save(initialData);
            return JSON.parse(JSON.stringify(initialData));
        }
    }

    save(customData = null) {
        if (customData) this.data = customData;
        localStorage.setItem(DB_KEY, JSON.stringify(this.data));
    }

    log(actor, action, module) {
        const entry = {
            log_id: "LOG-" + Date.now().toString(36).toUpperCase(),
            actor_name: actor || "System",
            action: action,
            module: module,
            created_at: new Date().toISOString()
        };
        this.data.audit_logs.unshift(entry);
        if (this.data.audit_logs.length > 50) this.data.audit_logs.pop();
        this.save();
        return entry;
    }

    addIncident(incident) {
        incident.incident_id = "INC-" + (1000 + this.data.incidents.length + 1);
        incident.created_at = new Date().toISOString();
        incident.status = "reported";
        this.data.incidents.unshift(incident);
        this.log("Citizen", `Created Incident ${incident.incident_id} (${incident.type}) at ${incident.lat.toFixed(4)}, ${incident.lon.toFixed(4)}`, "INCIDENTS");
        this.save();
        return incident;
    }

    updateIncidentStatus(incident_id, newStatus) {
        const target = this.data.incidents.find(i => i.incident_id === incident_id);
        if (target) {
            target.status = newStatus;
            this.log("Disaster Manager", `Incident ${incident_id} transitioned to ${newStatus}`, "INCIDENTS");
            this.save();
        }
        return target;
    }

    addEmergencyRequest(req) {
        req.request_id = "REQ-" + (2000 + this.data.emergency_requests.length + 1);
        req.created_at = new Date().toISOString();
        req.status = "open";
        this.data.emergency_requests.unshift(req);
        this.log(req.requester_name || "Citizen", `Emergency Help Request ${req.request_id} created (${req.need_type})`, "DISPATCH");
        this.save();
        return req;
    }

    assignEmergencyRequest(request_id, team_id) {
        const req = this.data.emergency_requests.find(r => r.request_id === request_id);
        if (req) {
            req.assigned_team_id = team_id;
            req.status = "assigned";
            const team = this.data.teams.find(t => t.team_id === team_id);
            if (team) team.status = "deployed";
            this.log("Dispatcher", `Request ${request_id} assigned to ${team_id}`, "DISPATCH");
            this.save();
        }
        return req;
    }

    updateShelterOccupancy(shelter_id, delta) {
        const shelter = this.data.shelters.find(s => s.shelter_id === shelter_id);
        if (shelter) {
            shelter.capacity_occupied = Math.max(0, Math.min(shelter.capacity_total, shelter.capacity_occupied + delta));
            if (shelter.capacity_occupied >= shelter.capacity_total) {
                shelter.status = "full";
            } else {
                shelter.status = "open";
            }
            this.log("Shelter Manager", `Updated ${shelter.name} occupancy to ${shelter.capacity_occupied}/${shelter.capacity_total}`, "SHELTERS");
            this.save();
        }
        return shelter;
    }
}

window.store = new DataStore();
