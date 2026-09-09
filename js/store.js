// Data Access Layer: Implements local-first storage and CRUD operations for all 25 DisasterOS modules.

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
            reporter_id: "Citizen",
            type: "flood",
            location: "Chennai North (River Road)",
            description: "River overflow flooding residential block A and road junction.",
            lat: 13.1150,
            lon: 80.2240,
            zone_id: "ZONE-NORTH",
            severity: "critical",
            status: "reported",
            team: "Rescue Team Alpha",
            created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
            incident_id: "INC-1002",
            reporter_id: "Police",
            type: "infrastructure",
            location: "Sector 12",
            description: "Old bridge structural crack observed after minor tremor.",
            lat: 13.0820,
            lon: 80.2880,
            zone_id: "ZONE-EAST",
            severity: "high",
            status: "verified",
            team: "Urban Rescue 02",
            created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
            incident_id: "INC-1003",
            reporter_id: "Forest Dept",
            type: "fire",
            location: "Western Hills",
            description: "Vegetation fire spreading along ridge line.",
            lat: 13.0320,
            lon: 80.1820,
            zone_id: "ZONE-WEST",
            severity: "medium",
            status: "monitoring",
            team: "Fire Unit 04",
            created_at: new Date(Date.now() - 10800000).toISOString()
        },
        {
            incident_id: "INC-1004",
            reporter_id: "Citizen",
            type: "medical",
            location: "Central Market",
            description: "Multiple people injured due to wall collapse during rains.",
            lat: 13.0520,
            lon: 80.2420,
            zone_id: "ZONE-CENTRAL",
            severity: "high",
            status: "resolved",
            team: "Medical Team 02",
            created_at: new Date(Date.now() - 86400000).toISOString()
        }
    ],

    emergency_requests: [
        {
            request_id: "REQ-2001",
            citizen: "Rahul K.",
            location: "North Zone",
            need: "Medical assistance",
            need_type: "medical",
            people_count: 3,
            priority: "Critical",
            priority_score: 0.92,
            assigned_team_id: "TEAM-ALPHA",
            status: "Dispatched",
            created_at: new Date(Date.now() - 3000000).toISOString()
        },
        {
            request_id: "REQ-2002",
            citizen: "Anita S.",
            location: "East Zone",
            need: "Food & water",
            need_type: "food",
            people_count: 5,
            priority: "High",
            priority_score: 0.74,
            assigned_team_id: null,
            status: "Pending",
            created_at: new Date(Date.now() - 2400000).toISOString()
        },
        {
            request_id: "REQ-2003",
            citizen: "Mohan R.",
            location: "River Road",
            need: "Evacuation",
            need_type: "evacuation",
            people_count: 8,
            priority: "Critical",
            priority_score: 0.88,
            assigned_team_id: "TEAM-BRAVO",
            status: "In Progress",
            created_at: new Date(Date.now() - 1800000).toISOString()
        }
    ],

    shelters: [
        {
            shelter_id: "SHELTER-01",
            name: "Government High School",
            location: "North Zone",
            lat: 13.1050,
            lon: 80.2180,
            zone_id: "ZONE-NORTH",
            capacity: 500,
            capacity_total: 500,
            occupied: 382,
            capacity_occupied: 382,
            resources: { water_l: 4500, food_kits: 800, medkits: 120, blankets: 650 },
            status: "Open"
        },
        {
            shelter_id: "SHELTER-02",
            name: "Community Civic Hall",
            location: "East Zone",
            lat: 13.0780,
            lon: 80.2850,
            zone_id: "ZONE-EAST",
            capacity: 300,
            capacity_total: 300,
            occupied: 275,
            capacity_occupied: 275,
            resources: { water_l: 2100, food_kits: 400, medkits: 50, blankets: 300 },
            status: "Near Capacity"
        },
        {
            shelter_id: "SHELTER-03",
            name: "Sports Complex Relief Camp",
            location: "Central Zone",
            lat: 13.0530,
            lon: 80.2390,
            zone_id: "ZONE-CENTRAL",
            capacity: 800,
            capacity_total: 800,
            occupied: 410,
            capacity_occupied: 410,
            resources: { water_l: 9500, food_kits: 1500, medkits: 250, blankets: 1100 },
            status: "Open"
        }
    ],

    hospitals: [
        {
            hospital_id: "HOSP-01",
            name: "City General Hospital",
            location: "Central Zone",
            lat: 13.0560,
            lon: 80.2450,
            zone_id: "ZONE-CENTRAL",
            beds: 250,
            bed_capacity_total: 250,
            available: 62,
            bed_capacity_available: 62,
            icu: 12,
            icu_beds: 12,
            trauma_capable: true,
            contact_number: "+91-44-2530-5000",
            status: "Operational"
        },
        {
            hospital_id: "HOSP-02",
            name: "Emergency Care Centre",
            location: "North Zone",
            lat: 13.1120,
            lon: 80.2270,
            zone_id: "ZONE-NORTH",
            beds: 150,
            bed_capacity_total: 150,
            available: 18,
            bed_capacity_available: 18,
            icu: 4,
            icu_beds: 4,
            trauma_capable: true,
            contact_number: "+91-44-2590-1122",
            status: "High Load"
        },
        {
            hospital_id: "HOSP-03",
            name: "District Hospital East",
            location: "East Zone",
            lat: 13.0760,
            lon: 80.2910,
            zone_id: "ZONE-EAST",
            beds: 200,
            bed_capacity_total: 200,
            available: 83,
            bed_capacity_available: 83,
            icu: 9,
            icu_beds: 9,
            trauma_capable: false,
            contact_number: "+91-44-2820-3344",
            status: "Operational"
        }
    ],

    volunteers: [
        { id: "VOL-01", name: "Arjun Kumar", skill: "First Aid", zone: "North", status: "Available" },
        { id: "VOL-02", name: "Priya Sharma", skill: "Food Distribution", zone: "East", status: "Deployed" },
        { id: "VOL-03", name: "Kiran Rao", skill: "Search & Rescue", zone: "Central", status: "Available" },
        { id: "VOL-04", name: "Neha Singh", skill: "Medical Support", zone: "West", status: "Deployed" }
    ],

    inventory: [
        { item: "Drinking Water", item_type: "Drinking Water", category: "Essential", quantity: 8200, unit: "litres", threshold: 3000, warehouse: "WH-North" },
        { item: "Rice & Grains", item_type: "Rice", category: "Food", quantity: 4200, unit: "kg", threshold: 1500, warehouse: "WH-Central" },
        { item: "First Aid Kits", item_type: "First Aid Kits", category: "Medical", quantity: 240, unit: "kits", threshold: 100, warehouse: "WH-East" },
        { item: "Thermal Blankets", item_type: "Blankets", category: "Relief", quantity: 860, unit: "units", threshold: 300, warehouse: "WH-North" }
    ],

    infrastructure: [
        { asset: "North Power Substation", type: "Power", zone: "North", condition: "Warning", uptime: "92%" },
        { asset: "River Bridge Arterial", type: "Transport", zone: "East", condition: "Critical", uptime: "64%" },
        { asset: "Water Treatment Plant", type: "Water", zone: "Central", condition: "Operational", uptime: "99%" },
        { asset: "Telecom Tower 18", type: "Communication", zone: "West", condition: "Operational", uptime: "98%" }
    ],

    relief_deliveries: [
        { id: "REL-301", destination: "North Shelter", items: "Water + Food Packs", beneficiaries: 820, status: "Delivered" },
        { id: "REL-302", destination: "East Shelter", items: "Blankets + Food", beneficiaries: 540, status: "In Transit" },
        { id: "REL-303", destination: "River Road", items: "Medical Kits", beneficiaries: 190, status: "Preparing" }
    ],

    teams: [
        { team_id: "TEAM-ALPHA", name: "Rescue Team Alpha", skill: "Search & Rescue", zone: "North Zone", status: "deployed", lat: 13.1140, lon: 80.2230 },
        { team_id: "TEAM-BRAVO", name: "Urban Rescue 02", skill: "Building Rescue", zone: "Sector 12", status: "deployed", lat: 13.0810, lon: 80.2870 },
        { team_id: "TEAM-CHARLIE", name: "Medical Team 02", skill: "Medical Support", zone: "Central Zone", status: "available", lat: 13.0540, lon: 80.2410 },
        { team_id: "TEAM-DELTA", name: "Fire Unit 04", skill: "Fire Response", zone: "Western Hills", status: "deployed", lat: 13.0310, lon: 80.1810 }
    ],

    alerts: [
        { title: "Severe Rainfall Warning", source: "Open-Meteo Ingestion", severity: "Critical", area: "North & East Zones", time: "5 min ago" },
        { title: "River Level Rising", source: "Hydrology Sensor", severity: "High", area: "River Road", time: "12 min ago" },
        { title: "Road Blockage Detected", source: "Citizen Reports", severity: "Medium", area: "Sector 12", time: "21 min ago" }
    ],

    audit_logs: [
        { log_id: "LOG-01", time: new Date().toLocaleTimeString(), actor_name: "Admin", action: "DisasterOS Data Layer Initialized", module: "SYSTEM", created_at: new Date().toISOString() }
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
            const parsed = JSON.parse(stored);
            // Ensure all collections exist
            for (let key in initialData) {
                if (!parsed[key]) parsed[key] = initialData[key];
            }
            return parsed;
        } catch (e) {
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
            time: new Date().toLocaleTimeString(),
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
        req.status = "Pending";
        this.data.emergency_requests.unshift(req);
        this.log(req.citizen || "Citizen", `Emergency Help Request ${req.request_id} created (${req.need})`, "EMERGENCY");
        this.save();
        return req;
    }

    updateShelterOccupancy(shelter_name_or_id, delta) {
        const shelter = this.data.shelters.find(s => s.shelter_id === shelter_name_or_id || s.name === shelter_name_or_id);
        if (shelter) {
            shelter.occupied = Math.max(0, Math.min(shelter.capacity, (shelter.occupied || 0) + delta));
            shelter.capacity_occupied = shelter.occupied;
            shelter.status = shelter.occupied >= shelter.capacity ? "Full" : (shelter.occupied >= shelter.capacity * 0.85 ? "Near Capacity" : "Open");
            this.log("Shelter Manager", `Updated ${shelter.name} occupancy to ${shelter.occupied}/${shelter.capacity}`, "SHELTERS");
            this.save();
        }
        return shelter;
    }
}

window.store = new DataStore();
