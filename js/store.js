// Data Access Layer: Local-first reactive storage and multi-city telemetry store.
// Provides 7+ records across ALL operational collections for Chennai, Mumbai, Kolkata, Delhi, and Tokyo.

const DB_KEY = "disasteros_db_v3";

const CITY_DATA = {
    chennai: {
        name: "Chennai (HQ)",
        lat: 13.0827, lon: 80.2707,
        zones: [
            { zone_id: "ZONE-CHN-NORTH", city: "chennai", name: "North Zone (Riverfront)", lat: 13.1100, lon: 80.2200, vulnerability: 0.75, radius_km: 3.5, elevation_m: 6.2 },
            { zone_id: "ZONE-CHN-EAST", city: "chennai", name: "East Coastal Zone", lat: 13.0800, lon: 80.2900, vulnerability: 0.60, radius_km: 3.0, elevation_m: 4.1 },
            { zone_id: "ZONE-CHN-CENTRAL", city: "chennai", name: "Central Urban Zone", lat: 13.0500, lon: 80.2400, vulnerability: 0.40, radius_km: 2.8, elevation_m: 14.8 },
            { zone_id: "ZONE-CHN-WEST", city: "chennai", name: "Western Hills & Industrial", lat: 13.0300, lon: 80.1800, vulnerability: 0.35, radius_km: 3.5, elevation_m: 28.5 },
            { zone_id: "ZONE-CHN-SOUTH", city: "chennai", name: "South Delta Basin", lat: 12.9800, lon: 80.2200, vulnerability: 0.70, radius_km: 3.2, elevation_m: 5.0 },
            { zone_id: "ZONE-CHN-HARBOR", city: "chennai", name: "Port & Industrial Harbor", lat: 13.0950, lon: 80.3000, vulnerability: 0.65, radius_km: 2.5, elevation_m: 3.2 },
            { zone_id: "ZONE-CHN-VELACHERY", city: "chennai", name: "Velachery Marshland Basin", lat: 12.9780, lon: 80.2180, vulnerability: 0.82, radius_km: 3.0, elevation_m: 2.8 }
        ],
        hospitals: [
            { hospital_id: "HOSP-CHN-01", name: "Rajiv Gandhi Government General Hospital", location: "Park Town", lat: 13.0808, lon: 80.2797, beds: 650, available: 110, icu: 45, trauma_capable: true, contact_number: "+91-44-2530-5000" },
            { hospital_id: "HOSP-CHN-02", name: "Apollo Main Trauma Specialty", location: "Greams Road", lat: 13.0604, lon: 80.2518, beds: 480, available: 84, icu: 35, trauma_capable: true, contact_number: "+91-44-2829-0200" },
            { hospital_id: "HOSP-CHN-03", name: "Fortis Malar Emergency Center", location: "Adyar", lat: 13.0067, lon: 80.2575, beds: 320, available: 62, icu: 22, trauma_capable: true, contact_number: "+91-44-4289-2222" },
            { hospital_id: "HOSP-CHN-04", name: "MIOT International Trauma Hub", location: "Manapakkam", lat: 13.0232, lon: 80.1788, beds: 500, available: 95, icu: 40, trauma_capable: true, contact_number: "+91-44-4200-2288" },
            { hospital_id: "HOSP-CHN-05", name: "Stanley Medical College Hospital", location: "Old Washermanpet", lat: 13.1070, lon: 80.2860, beds: 580, available: 78, icu: 30, trauma_capable: true, contact_number: "+91-44-2528-1351" },
            { hospital_id: "HOSP-CHN-06", name: "Government Kilpauk Medical College", location: "Kilpauk", lat: 13.0820, lon: 80.2430, beds: 450, available: 66, icu: 28, trauma_capable: true, contact_number: "+91-44-2836-4951" },
            { hospital_id: "HOSP-CHN-07", name: "Gleneagles Global Health City", location: "Perumbakkam", lat: 12.9050, lon: 80.1980, beds: 400, available: 70, icu: 34, trauma_capable: true, contact_number: "+91-44-4477-7000" }
        ],
        shelters: [
            { shelter_id: "SHLT-CHN-01", name: "Government High School North", location: "Perambur", lat: 13.1120, lon: 80.2310, zone_id: "ZONE-CHN-NORTH", capacity: 600, occupied: 412, status: "Open", water_liters: 4500, food_kits: 800 },
            { shelter_id: "SHLT-CHN-02", name: "Community Civic Hall East", location: "Royapuram", lat: 13.1040, lon: 80.2920, zone_id: "ZONE-CHN-EAST", capacity: 400, occupied: 370, status: "Near Capacity", water_liters: 2100, food_kits: 400 },
            { shelter_id: "SHLT-CHN-03", name: "Sports Complex Indoor Stadium", location: "Periamet", lat: 13.0830, lon: 80.2740, zone_id: "ZONE-CHN-CENTRAL", capacity: 1200, occupied: 520, status: "Open", water_liters: 14000, food_kits: 2200 },
            { shelter_id: "SHLT-CHN-04", name: "St. Joseph College Pavilion", location: "Guindy", lat: 13.0110, lon: 80.2130, zone_id: "ZONE-CHN-WEST", capacity: 500, occupied: 180, status: "Open", water_liters: 5000, food_kits: 900 },
            { shelter_id: "SHLT-CHN-05", name: "Industrial Polytech Campus", location: "Padi", lat: 13.0930, lon: 80.1870, zone_id: "ZONE-CHN-WEST", capacity: 700, occupied: 310, status: "Open", water_liters: 6500, food_kits: 1100 },
            { shelter_id: "SHLT-CHN-06", name: "South Delta Welfare Center", location: "Medavakkam", lat: 12.9210, lon: 80.1920, zone_id: "ZONE-CHN-SOUTH", capacity: 450, occupied: 410, status: "Near Capacity", water_liters: 2800, food_kits: 450 },
            { shelter_id: "SHLT-CHN-07", name: "Velachery Community Relief Center", location: "Velachery Bypass", lat: 12.9750, lon: 80.2210, zone_id: "ZONE-CHN-VELACHERY", capacity: 800, occupied: 390, status: "Open", water_liters: 7200, food_kits: 1300 }
        ],
        incidents: [
            { incident_id: "INC-CHN-101", reporter_id: "Citizen", type: "flood", location: "River Road Block A", description: "River embankment breached; 1.5m floodwaters entering ground units.", lat: 13.1150, lon: 80.2240, zone_id: "ZONE-CHN-NORTH", severity: "critical", status: "reported", team: "Rescue Team Alpha", created_at: new Date(Date.now() - 3600000).toISOString() },
            { incident_id: "INC-CHN-102", reporter_id: "Traffic Police", type: "infrastructure", location: "Anna Flyover Pillar 4", description: "Structural shear crack detected following soil subsidence.", lat: 13.0590, lon: 80.2500, zone_id: "ZONE-CHN-CENTRAL", severity: "high", status: "verified", team: "Urban Rescue 02", created_at: new Date(Date.now() - 7200000).toISOString() },
            { incident_id: "INC-CHN-103", reporter_id: "Coast Guard", type: "flood", location: "Marina Beach Esplanade", description: "Storm surge overwash flooding service lanes.", lat: 13.0500, lon: 80.2820, zone_id: "ZONE-CHN-EAST", severity: "high", status: "in_progress", team: "Marine Patrol 01", created_at: new Date(Date.now() - 10800000).toISOString() },
            { incident_id: "INC-CHN-104", reporter_id: "Citizen", type: "medical", location: "George Town Alleyway", description: "Wall collapse in crowded market; 4 casualties pinned.", lat: 13.0900, lon: 80.2850, zone_id: "ZONE-CHN-EAST", severity: "critical", status: "in_progress", team: "Medical Team 01", created_at: new Date(Date.now() - 14400000).toISOString() },
            { incident_id: "INC-CHN-105", reporter_id: "Municipal Worker", type: "electrical", location: "Adyar 33kV Substation", description: "Water ingress into transformer control room.", lat: 13.0050, lon: 80.2550, zone_id: "ZONE-CHN-SOUTH", severity: "critical", status: "verified", team: "Power Restoration 03", created_at: new Date(Date.now() - 18000000).toISOString() },
            { incident_id: "INC-CHN-106", reporter_id: "Citizen", type: "flood", location: "Velachery Lake Overflow", description: "Storm drain choked; 2 feet standing water across 50 houses.", lat: 12.9770, lon: 80.2200, zone_id: "ZONE-CHN-VELACHERY", severity: "high", status: "reported", team: "Dewatering Unit 02", created_at: new Date(Date.now() - 21600000).toISOString() },
            { incident_id: "INC-CHN-107", reporter_id: "Fire Patrol", type: "fire", location: "Ambattur Industrial Estate", description: "Chemical godown fire sparked by short circuit in flooded basement.", lat: 13.1020, lon: 80.1600, zone_id: "ZONE-CHN-WEST", severity: "critical", status: "in_progress", team: "Hazmat Team 01", created_at: new Date(Date.now() - 25200000).toISOString() }
        ],
        emergency_requests: [
            { request_id: "REQ-CHN-001", citizen: "M. Kumar", phone: "+91-98401-23456", need: "Trauma Medical Evacuation", people_count: 3, lat: 13.1160, lon: 80.2250, urgency: "critical", status: "Pending", assigned_team: null },
            { request_id: "REQ-CHN-002", citizen: "S. Priya", phone: "+91-98402-34567", need: "Food & Clean Drinking Water", people_count: 8, lat: 13.0810, lon: 80.2890, urgency: "medium", status: "In Progress", assigned_team: "Relief Logistics Team" },
            { request_id: "REQ-CHN-003", citizen: "R. Suresh", phone: "+91-98403-45678", need: "Stranded on Rooftop", people_count: 5, lat: 13.0530, lon: 80.2410, urgency: "high", status: "Assigned", assigned_team: "Rescue Team Alpha" },
            { request_id: "REQ-CHN-004", citizen: "K. Lakshmi", phone: "+91-98404-56789", need: "Insulin & Medical Supplies", people_count: 1, lat: 13.0310, lon: 80.1810, urgency: "high", status: "Pending", assigned_team: null },
            { request_id: "REQ-CHN-005", citizen: "A. Venkat", phone: "+91-98405-67890", need: "Elderly Wheelchair Evacuation", people_count: 2, lat: 12.9810, lon: 80.2210, urgency: "high", status: "In Progress", assigned_team: "Rapid Response Delta" },
            { request_id: "REQ-CHN-006", citizen: "D. Balan", phone: "+91-98406-78901", need: "Drinking Water Tanker Request", people_count: 45, lat: 13.0960, lon: 80.2990, urgency: "medium", status: "Pending", assigned_team: null },
            { request_id: "REQ-CHN-007", citizen: "V. Geetha", phone: "+91-98407-89012", need: "Infant Care & Dry Baby Food", people_count: 4, lat: 12.9790, lon: 80.2190, urgency: "critical", status: "Pending", assigned_team: null }
        ],
        teams: [
            { team_id: "TEAM-CHN-01", name: "NDRF Battalion 04 Alpha", type: "medical", status: "active", capacity: 12, lat: 13.1110, lon: 80.2220, lead: "Commander K. Sharma" },
            { team_id: "TEAM-CHN-02", name: "Disaster Marine Boat Unit", type: "boat", status: "available", capacity: 8, lat: 13.0780, lon: 80.2880, lead: "Lt. R. Nathan" },
            { team_id: "TEAM-CHN-03", name: "Urban Search & Rescue Team C", type: "rescue", status: "active", capacity: 15, lat: 13.0510, lon: 80.2410, lead: "Capt. P. George" },
            { team_id: "TEAM-CHN-04", name: "Fire & Rescue Quick Strike", type: "fire", status: "standby", capacity: 10, lat: 13.0310, lon: 80.1800, lead: "Chief S. Anandan" },
            { team_id: "TEAM-CHN-05", name: "Delta Evacuation Motor Squad", type: "evacuation", status: "available", capacity: 6, lat: 12.9820, lon: 80.2230, lead: "Sub-Insp. Murugan" },
            { team_id: "TEAM-CHN-06", name: "Harbor Dive & Recovery Unit", type: "boat", status: "available", capacity: 10, lat: 13.0940, lon: 80.2980, lead: "Officer T. Joseph" },
            { team_id: "TEAM-CHN-07", name: "Velachery Tactical Dewatering Unit", type: "rescue", status: "active", capacity: 14, lat: 12.9760, lon: 80.2200, lead: "Eng. G. Selvam" }
        ],
        inventory: [
            { item_id: "INV-CHN-01", name: "High-Capacity Dewatering Pumps (5000L/min)", category: "Equipment", total: 40, available: 16, unit: "units", location: "Central Warehouse" },
            { item_id: "INV-CHN-02", name: "Inflatable Rescue Boats with Outboard Engine", category: "Marine", total: 25, available: 12, unit: "boats", location: "Marina Depot" },
            { item_id: "INV-CHN-03", name: "Emergency Family Shelter Tents (6-person)", category: "Shelter", total: 600, available: 320, unit: "tents", location: "North Depot" },
            { item_id: "INV-CHN-04", name: "Ready-to-Eat Disaster Rations (3-Day)", category: "Food", total: 15000, available: 9400, unit: "packets", location: "South Relief Base" },
            { item_id: "INV-CHN-05", name: "Advanced Trauma First Aid Surgical Kits", category: "Medical", total: 500, available: 280, unit: "kits", location: "General Hospital Store" },
            { item_id: "INV-CHN-06", name: "SOLAS Approved Life Jackets (Adult/Child)", category: "Safety", total: 2000, available: 1350, unit: "jackets", location: "Port Depot" },
            { item_id: "INV-CHN-07", name: "75kVA Mobile Silent Generators", category: "Power", total: 35, available: 18, unit: "generators", location: "Central Warehouse" }
        ],
        infrastructure: [
            { asset_id: "INF-CHN-01", name: "Napier Bridge (Cooum River)", type: "bridge", lat: 13.0670, lon: 80.2850, status: "Open - High Water Observation", critical_level: "critical" },
            { asset_id: "INF-CHN-02", name: "Kilpauk Water Works Pumping Main", type: "water", lat: 13.0810, lon: 80.2410, status: "Nominal 94% Operational", critical_level: "critical" },
            { asset_id: "INF-CHN-03", name: "Guindy 220kV Grid Substation", type: "power", lat: 13.0080, lon: 80.2100, status: "Protected - Bunds Intact", critical_level: "critical" },
            { asset_id: "INF-CHN-04", name: "Chepauk MRTS Elevated Rail Bridge", type: "transit", lat: 13.0610, lon: 80.2780, status: "Normal Service", critical_level: "high" },
            { asset_id: "INF-CHN-05", name: "Chembarambakkam Dam Sluice Gates", type: "dam", lat: 13.0100, lon: 80.0560, status: "Discharging 4,200 cusecs", critical_level: "critical" },
            { asset_id: "INF-CHN-06", name: "Chennai Port Deep Container Basin", type: "harbor", lat: 13.0980, lon: 80.3010, status: "Berthing Restricted", critical_level: "high" },
            { asset_id: "INF-CHN-07", name: "Velachery Stormwater Canal Culvert", type: "drainage", lat: 12.9740, lon: 80.2190, status: "Desilted - Clearing Water", critical_level: "medium" }
        ],
        volunteers: [
            { volunteer_id: "VOL-CHN-01", name: "Aravind Swaminathan", phone: "+91-98411-11223", skills: ["First Aid", "Ham Radio"], status: "Deployed", zone_id: "ZONE-CHN-NORTH" },
            { volunteer_id: "VOL-CHN-02", name: "Kavitha Rangan", phone: "+91-98412-22334", skills: ["Water Rescue", "Swimmer"], status: "Available", zone_id: "ZONE-CHN-EAST" },
            { volunteer_id: "VOL-CHN-03", name: "Mohamed Tariq", phone: "+91-98413-33445", skills: ["Heavy Vehicle Driver"], status: "Deployed", zone_id: "ZONE-CHN-WEST" },
            { volunteer_id: "VOL-CHN-04", name: "Sneha Balakrishnan", phone: "+91-98414-44556", skills: ["Nurse / Paramedic"], status: "Deployed", zone_id: "ZONE-CHN-CENTRAL" },
            { volunteer_id: "VOL-CHN-05", name: "Dinesh Karthik", phone: "+91-98415-55667", skills: ["Drone Operator"], status: "Available", zone_id: "ZONE-CHN-SOUTH" },
            { volunteer_id: "VOL-CHN-06", name: "Subramaniam V.", phone: "+91-98416-66778", skills: ["Crowd Management"], status: "Available", zone_id: "ZONE-CHN-HARBOR" },
            { volunteer_id: "VOL-CHN-07", name: "Meenakshi Sundaram", phone: "+91-98417-77889", skills: ["Civil Defense", "Cooking"], status: "Deployed", zone_id: "ZONE-CHN-VELACHERY" }
        ],
        relief_deliveries: [
            { delivery_id: "DEL-CHN-01", destination: "Government High School North", items: "120 Food Kits, 40 Blankets", status: "Delivered", eta: "Completed", team: "Logistics 01" },
            { delivery_id: "DEL-CHN-02", destination: "Community Civic Hall East", items: "800L Potable Water, First Aid", status: "In Transit", eta: "12 mins", team: "Logistics 02" },
            { delivery_id: "DEL-CHN-03", destination: "Sports Complex Indoor Stadium", items: "300 MRE Rations, 50 Cots", status: "Delivered", eta: "Completed", team: "Logistics 01" },
            { delivery_id: "DEL-CHN-04", destination: "St. Joseph College Pavilion", items: "40 Tents, 200 Life Jackets", status: "Scheduled", eta: "45 mins", team: "Logistics 03" },
            { delivery_id: "DEL-CHN-05", destination: "South Delta Welfare Center", items: "500 Water Pouches, Milk Rations", status: "In Transit", eta: "20 mins", team: "Logistics 04" },
            { delivery_id: "DEL-CHN-06", destination: "Velachery Community Relief Center", items: "Dewatering Hose, 100 Rations", status: "Delivered", eta: "Completed", team: "Logistics 02" },
            { delivery_id: "DEL-CHN-07", destination: "Industrial Polytech Campus", items: "2 Diesel Generators, Fuel Drums", status: "In Transit", eta: "15 mins", team: "Logistics 05" }
        ],
        alerts: [
            { id: "ALT-CHN-01", severity: "Critical", title: "Flash Flood Surge Warning: North River Basin", area: "Chennai North (Riverfront)", source: "DisasterOS Risk Engine", time: "10 mins ago" },
            { id: "ALT-CHN-02", severity: "Warning", title: "Heavy Inundation Alert for Velachery Lowlands", area: "Velachery Basin", source: "Open-Meteo Ingestion", time: "25 mins ago" },
            { id: "ALT-CHN-03", severity: "Warning", title: "High Coastal Wave Alert (3.5m Overwash)", area: "East Coast / Marina", source: "INCOIS Bulletin", time: "40 mins ago" },
            { id: "ALT-CHN-04", severity: "Critical", title: "Mass Casualty Triage Activated at Central Market", area: "George Town", source: "Police Control Room", time: "1 hour ago" },
            { id: "ALT-CHN-05", severity: "Advisory", title: "Chembarambakkam Discharge Increased to 4,200 cusecs", area: "Adyar River Environs", source: "PWD Irrigation", time: "2 hours ago" },
            { id: "ALT-CHN-06", severity: "Info", title: "4 Relief Shelters Open in Perambur and Guindy", area: "Citywide", source: "Disaster Operations Command", time: "3 hours ago" },
            { id: "ALT-CHN-07", severity: "Warning", title: "Grid Substation Under Precautionary Water Bunding", area: "Guindy Industrial", source: "TANGEDCO Grid Ops", time: "3 hours ago" }
        ]
    },

    mumbai: {
        name: "Mumbai Metropolitan Region",
        lat: 18.9220, lon: 72.8347,
        zones: [
            { zone_id: "ZONE-MUM-COAST", city: "mumbai", name: "South Coastal Colaba", lat: 18.9067, lon: 72.8147, vulnerability: 0.72, radius_km: 3.2, elevation_m: 3.5 },
            { zone_id: "ZONE-MUM-MITHI", city: "mumbai", name: "Mithi River Basin (Kurla)", lat: 19.0657, lon: 72.8794, vulnerability: 0.88, radius_km: 3.8, elevation_m: 2.1 },
            { zone_id: "ZONE-MUM-DOCK", city: "mumbai", name: "Mazagon Port & Docks", lat: 18.9680, lon: 72.8490, vulnerability: 0.65, radius_km: 2.8, elevation_m: 4.0 },
            { zone_id: "ZONE-MUM-ANDHERI", city: "mumbai", name: "Andheri Transit Corridor", lat: 19.1197, lon: 72.8464, vulnerability: 0.58, radius_km: 3.5, elevation_m: 8.2 },
            { zone_id: "ZONE-MUM-DADAR", city: "mumbai", name: "Dadar Central Urban Hub", lat: 19.0178, lon: 72.8478, vulnerability: 0.52, radius_km: 3.0, elevation_m: 6.5 },
            { zone_id: "ZONE-MUM-BORIVALI", city: "mumbai", name: "Borivali Creek & Mangroves", lat: 19.2288, lon: 72.8541, vulnerability: 0.70, radius_km: 4.0, elevation_m: 4.8 },
            { zone_id: "ZONE-MUM-THANE", city: "mumbai", name: "Thane Industrial Basin", lat: 19.2183, lon: 72.9781, vulnerability: 0.62, radius_km: 3.8, elevation_m: 9.1 }
        ],
        hospitals: [
            { hospital_id: "HOSP-MUM-01", name: "KEM King Edward Memorial Hospital", location: "Parel", lat: 19.0028, lon: 72.8427, beds: 650, available: 110, icu: 45, trauma_capable: true, contact_number: "+91-22-2410-7000" },
            { hospital_id: "HOSP-MUM-02", name: "Lilavati Trauma & Critical Care", location: "Bandra", lat: 19.0514, lon: 72.8290, beds: 420, available: 74, icu: 32, trauma_capable: true, contact_number: "+91-22-2675-1000" },
            { hospital_id: "HOSP-MUM-03", name: "Lokmanya Tilak Sion Trauma Hospital", location: "Sion", lat: 19.0366, lon: 72.8601, beds: 520, available: 88, icu: 36, trauma_capable: true, contact_number: "+91-22-2407-6381" },
            { hospital_id: "HOSP-MUM-04", name: "Bombay Hospital & Medical Research", location: "Marine Lines", lat: 18.9405, lon: 72.8288, beds: 560, available: 92, icu: 40, trauma_capable: true, contact_number: "+91-22-2206-7676" },
            { hospital_id: "HOSP-MUM-05", name: "P.D. Hinduja National Hospital", location: "Mahim", lat: 19.0330, lon: 72.8385, beds: 380, available: 60, icu: 28, trauma_capable: true, contact_number: "+91-22-2445-1515" },
            { hospital_id: "HOSP-MUM-06", name: "R.N. Cooper Municipal Hospital", location: "Juhu Vile Parle", lat: 19.1080, lon: 72.8360, beds: 450, available: 68, icu: 25, trauma_capable: true, contact_number: "+91-22-2620-7254" },
            { hospital_id: "HOSP-MUM-07", name: "Dr. L.H. Hiranandani Hospital", location: "Powai", lat: 19.1190, lon: 72.9120, beds: 310, available: 54, icu: 22, trauma_capable: true, contact_number: "+91-22-2576-3300" }
        ],
        shelters: [
            { shelter_id: "SHLT-MUM-01", name: "Bandra Reclamation Civic Pavilion", location: "Bandra West", lat: 19.0480, lon: 72.8250, zone_id: "ZONE-MUM-ANDHERI", capacity: 750, occupied: 380, status: "Open", water_liters: 6000, food_kits: 1200 },
            { shelter_id: "SHLT-MUM-02", name: "Kurla Municipal Relief School", location: "Kurla West", lat: 19.0680, lon: 72.8810, zone_id: "ZONE-MUM-MITHI", capacity: 500, occupied: 420, status: "Near Capacity", water_liters: 4200, food_kits: 750 },
            { shelter_id: "SHLT-MUM-03", name: "Andheri Sports Complex Indoor Shelter", location: "Andheri West", lat: 19.1250, lon: 72.8310, zone_id: "ZONE-MUM-ANDHERI", capacity: 1200, occupied: 510, status: "Open", water_liters: 15000, food_kits: 2500 },
            { shelter_id: "SHLT-MUM-04", name: "Shivaji Park Disaster Relief Pavilion", location: "Dadar West", lat: 19.0270, lon: 72.8380, zone_id: "ZONE-MUM-DADAR", capacity: 900, occupied: 340, status: "Open", water_liters: 8000, food_kits: 1600 },
            { shelter_id: "SHLT-MUM-05", name: "Colaba Port Workers Welfare Center", location: "Colaba Market", lat: 18.9110, lon: 72.8180, zone_id: "ZONE-MUM-COAST", capacity: 450, occupied: 190, status: "Open", water_liters: 3500, food_kits: 600 },
            { shelter_id: "SHLT-MUM-06", name: "Borivali National Park Base Camp", location: "Borivali East", lat: 19.2310, lon: 72.8620, zone_id: "ZONE-MUM-BORIVALI", capacity: 800, occupied: 260, status: "Open", water_liters: 7000, food_kits: 1400 },
            { shelter_id: "SHLT-MUM-07", name: "Thane Dadoji Kondadev Indoor Stadium", location: "Thane West", lat: 19.2000, lon: 72.9750, zone_id: "ZONE-MUM-THANE", capacity: 1000, occupied: 440, status: "Open", water_liters: 11000, food_kits: 1900 }
        ],
        incidents: [
            { incident_id: "INC-MUM-101", reporter_id: "Citizen", type: "flood", location: "Kurla LBS Marg Embankment", description: "Mithi River spillway breached; 4 feet water surging into Kranti Nagar.", lat: 19.0660, lon: 72.8800, zone_id: "ZONE-MUM-MITHI", severity: "critical", status: "in_progress", team: "NDRF Mumbai 01", created_at: new Date(Date.now() - 3600000).toISOString() },
            { incident_id: "INC-MUM-102", reporter_id: "Traffic Warden", type: "flood", location: "Milan Subway Underpass", description: "Stormwater pumps overwhelmed; vehicular tunnel submerged under 2m water.", lat: 19.1150, lon: 72.8420, zone_id: "ZONE-MUM-ANDHERI", severity: "high", status: "reported", team: "MCGM Dewatering Unit", created_at: new Date(Date.now() - 7200000).toISOString() },
            { incident_id: "INC-MUM-103", reporter_id: "Police Control", type: "infrastructure", location: "Ghatkopar Retaining Wall", description: "Structural concrete wall collapse along hillside settlement; 5 injured.", lat: 19.0850, lon: 72.9100, zone_id: "ZONE-MUM-DADAR", severity: "critical", status: "in_progress", team: "Urban Heavy Rescue 01", created_at: new Date(Date.now() - 10800000).toISOString() },
            { incident_id: "INC-MUM-104", reporter_id: "Port Authority", type: "medical", location: "Mazagon Dock Berth 6", description: "Mooring cable snap during gale winds; 3 dockworkers critically injured.", lat: 18.9650, lon: 72.8520, zone_id: "ZONE-MUM-DOCK", severity: "critical", status: "verified", team: "Marine Paramedics 02", created_at: new Date(Date.now() - 14400000).toISOString() },
            { incident_id: "INC-MUM-105", reporter_id: "Railway Safety", type: "electrical", location: "Dadar Central Overhead Cable", description: "High-tension overhead cable severed following gusty monsoon winds.", lat: 19.0180, lon: 72.8450, zone_id: "ZONE-MUM-DADAR", severity: "high", status: "verified", team: "Rail Power Squad", created_at: new Date(Date.now() - 18000000).toISOString() },
            { incident_id: "INC-MUM-106", reporter_id: "Forest Ranger", type: "infrastructure", location: "Eastern Express Highway Cutting", description: "Boulders falling across northbound carriageway due to heavy runoff.", lat: 19.2100, lon: 72.9800, zone_id: "ZONE-MUM-THANE", severity: "medium", status: "monitoring", team: "Highways Unit 04", created_at: new Date(Date.now() - 21600000).toISOString() },
            { incident_id: "INC-MUM-107", reporter_id: "Citizen", type: "flood", location: "Colaba Causeway Lowlands", description: "High-tide tidal surge entering ground-level commercial basements.", lat: 18.9120, lon: 72.8190, zone_id: "ZONE-MUM-COAST", severity: "medium", status: "reported", team: "Dewatering Squad 03", created_at: new Date(Date.now() - 25200000).toISOString() }
        ],
        emergency_requests: [
            { request_id: "REQ-MUM-001", citizen: "Vijay Sawant", phone: "+91-98201-11223", need: "Immediate Evacuation from Rising Water", people_count: 6, lat: 19.0670, lon: 72.8820, urgency: "critical", status: "In Progress", assigned_team: "NDRF Mumbai 01" },
            { request_id: "REQ-MUM-002", citizen: "Pooja Patil", phone: "+91-98202-22334", need: "Oxygen Cylinder & Emergency Medic", people_count: 1, lat: 19.0030, lon: 72.8430, urgency: "critical", status: "Pending", assigned_team: null },
            { request_id: "REQ-MUM-003", citizen: "Ramesh Gokhale", phone: "+91-98203-33445", need: "Rescue Boat for Stranded Family", people_count: 4, lat: 19.1170, lon: 72.8440, urgency: "high", status: "Assigned", assigned_team: "Mumbai Fire Marine Unit" },
            { request_id: "REQ-MUM-004", citizen: "Fatima Shaikh", phone: "+91-98204-44556", need: "Infant Milk & Dry Packets", people_count: 3, lat: 19.0350, lon: 72.8590, urgency: "high", status: "Pending", assigned_team: null },
            { request_id: "REQ-MUM-005", citizen: "Anand Deshmukh", phone: "+91-98205-55667", need: "Dialysis Patient Emergency Transport", people_count: 2, lat: 18.9410, lon: 72.8290, urgency: "critical", status: "Pending", assigned_team: null },
            { request_id: "REQ-MUM-006", citizen: "Kishore More", phone: "+91-98206-66778", need: "Drinking Water in Flood Relief Hall", people_count: 50, lat: 19.2290, lon: 72.8550, urgency: "medium", status: "In Progress", assigned_team: "Red Cross Logistics" },
            { request_id: "REQ-MUM-007", citizen: "Sunita Joshi", phone: "+91-98207-77889", need: "Senior Citizens Ground Floor Evacuation", people_count: 5, lat: 19.2190, lon: 72.9790, urgency: "high", status: "Pending", assigned_team: null }
        ],
        teams: [
            { team_id: "TEAM-MUM-01", name: "NDRF 5th Battalion Water Rescue", type: "boat", status: "active", capacity: 15, lat: 19.0600, lon: 72.8700, lead: "Insp. Rajesh Parab" },
            { team_id: "TEAM-MUM-02", name: "Mumbai Fire Heavy Rescue Unit", type: "fire", status: "active", capacity: 12, lat: 19.0150, lon: 72.8420, lead: "Chief Salve" },
            { team_id: "TEAM-MUM-03", name: "KEM Trauma Paramedic Rapid Unit", type: "medical", status: "active", capacity: 8, lat: 19.0040, lon: 72.8430, lead: "Dr. Anjali Rao" },
            { team_id: "TEAM-MUM-04", name: "SDRF Tactical Diver Squadron", type: "boat", status: "available", capacity: 10, lat: 18.9600, lon: 72.8500, lead: "Lt. Sunil Shinde" },
            { team_id: "TEAM-MUM-05", name: "MCGM High-Capacity Dewatering Force", type: "rescue", status: "active", capacity: 14, lat: 19.1180, lon: 72.8440, lead: "Eng. Deepak Kadam" },
            { team_id: "TEAM-MUM-06", name: "Coast Guard Inshore Rescue Team", type: "boat", status: "standby", capacity: 10, lat: 18.9050, lon: 72.8120, lead: "Cmdr. V. Verma" },
            { team_id: "TEAM-MUM-07", name: "Urban Search & K9 Collapse Unit", type: "rescue", status: "available", capacity: 12, lat: 19.2150, lon: 72.9750, lead: "Capt. Nilesh Joshi" }
        ],
        inventory: [
            { item_id: "INV-MUM-01", name: "High-Capacity Sludge Dewatering Pumps (5000L/min)", category: "Equipment", total: 36, available: 14, unit: "units", location: "Kurla MCGM Depot" },
            { item_id: "INV-MUM-02", name: "Gemini Inflatable Marine Rescue Boats", category: "Marine", total: 24, available: 11, unit: "boats", location: "Bandra Fire Base" },
            { item_id: "INV-MUM-03", name: "Rapid Deployment Evacuation Tents", category: "Shelter", total: 550, available: 310, unit: "tents", location: "Shivaji Park Depot" },
            { item_id: "INV-MUM-04", name: "Ready-to-Eat Emergency Food Ration Kits", category: "Food", total: 12000, available: 7800, unit: "packets", location: "Dadar Central Store" },
            { item_id: "INV-MUM-05", name: "Multi-Trauma Advanced Hemostatic Kits", category: "Medical", total: 480, available: 290, unit: "kits", location: "KEM Emergency Store" },
            { item_id: "INV-MUM-06", name: "SOLAS-Certified Marine Life Jackets", category: "Safety", total: 1800, available: 1150, unit: "jackets", location: "Mazagon Harbor Depot" },
            { item_id: "INV-MUM-07", name: "Heavy-Duty 75kVA Mobile Silent Generators", category: "Power", total: 30, available: 16, unit: "generators", location: "Andheri Depot" }
        ],
        infrastructure: [
            { asset_id: "INF-MUM-01", name: "Bandra-Worli Sea Link Arterial Bridge", type: "bridge", lat: 19.0300, lon: 72.8150, status: "Open - High Wind Advisory", critical_level: "critical" },
            { asset_id: "INF-MUM-02", name: "Mithi River Kranti Nagar Sluice Gate", type: "dam", lat: 19.0700, lon: 72.8850, status: "Discharging at Peak Flow", critical_level: "critical" },
            { asset_id: "INF-MUM-03", name: "Kurla Central Railway Interchange", type: "transit", lat: 19.0650, lon: 72.8790, status: "Track Flooding - Controlled Speed", critical_level: "critical" },
            { asset_id: "INF-MUM-04", name: "Milan Subway Stormwater Pumping Facility", type: "water", lat: 19.1160, lon: 72.8410, status: "3 Pumps Active - Clearing Sump", critical_level: "critical" },
            { asset_id: "INF-MUM-05", name: "Mazagon Marine Terminal & Oil Berths", type: "harbor", lat: 18.9660, lon: 72.8480, status: "Secure - Under Observation", critical_level: "high" },
            { asset_id: "INF-MUM-06", name: "Vaitarna Water Supply Pipeline Aqueduct", type: "water", lat: 19.2300, lon: 72.9500, status: "Nominal Flow", critical_level: "critical" },
            { asset_id: "INF-MUM-07", name: "Trombay 400kV Grid Transmission Substation", type: "power", lat: 19.0100, lon: 72.9000, status: "Fully Operational", critical_level: "critical" }
        ],
        volunteers: [
            { volunteer_id: "VOL-MUM-01", name: "Prashant Tawde", phone: "+91-98211-12345", skills: ["Boat Operator", "Swimmer"], status: "Deployed", zone_id: "ZONE-MUM-MITHI" },
            { volunteer_id: "VOL-MUM-02", name: "Aparna Kulkarni", phone: "+91-98212-23456", skills: ["Medical Triage Nurse"], status: "Deployed", zone_id: "ZONE-MUM-DADAR" },
            { volunteer_id: "VOL-MUM-03", name: "Farhan Qureshi", phone: "+91-98213-34567", skills: ["Ham Radio Communications"], status: "Available", zone_id: "ZONE-MUM-ANDHERI" },
            { volunteer_id: "VOL-MUM-04", name: "Rohit Shinde", phone: "+91-98214-45678", skills: ["Heavy Vehicle Driver"], status: "Deployed", zone_id: "ZONE-MUM-THANE" },
            { volunteer_id: "VOL-MUM-05", name: "Geeta Bhatt", phone: "+91-98215-56789", skills: ["Shelter Kitchen Lead"], status: "Deployed", zone_id: "ZONE-MUM-BORIVALI" },
            { volunteer_id: "VOL-MUM-06", name: "Samir Merchant", phone: "+91-98216-67890", skills: ["Civil Defense Rescue"], status: "Available", zone_id: "ZONE-MUM-COAST" },
            { volunteer_id: "VOL-MUM-07", name: "Ananya Sengupta", phone: "+91-98217-78901", skills: ["Drone Mapping"], status: "Available", zone_id: "ZONE-MUM-DOCK" }
        ],
        relief_deliveries: [
            { delivery_id: "DEL-MUM-01", destination: "Kurla Municipal Relief School", items: "200 Water Cartons, 150 Ration Kits", status: "Delivered", eta: "Completed", team: "Mumbai Logistics 01" },
            { delivery_id: "DEL-MUM-02", destination: "Bandra Reclamation Civic Pavilion", items: "50 Inflatable Beds, Medical Packs", status: "In Transit", eta: "15 mins", team: "Mumbai Logistics 02" },
            { delivery_id: "DEL-MUM-03", destination: "Andheri Sports Complex Indoor Shelter", items: "500 MRE Packs, 2 Mobile Generators", status: "Delivered", eta: "Completed", team: "Mumbai Logistics 01" },
            { delivery_id: "DEL-MUM-04", destination: "Shivaji Park Disaster Relief Pavilion", items: "80 Blankets, Dry Milk Powder", status: "In Transit", eta: "25 mins", team: "Mumbai Logistics 03" },
            { delivery_id: "DEL-MUM-05", destination: "Thane Dadoji Kondadev Indoor Stadium", items: "250 Life Jackets, Clean Water Cans", status: "Scheduled", eta: "40 mins", team: "Mumbai Logistics 04" },
            { delivery_id: "DEL-MUM-06", destination: "Colaba Port Workers Welfare Center", items: "First Aid Kits, 100 Rations", status: "Delivered", eta: "Completed", team: "Mumbai Logistics 02" },
            { delivery_id: "DEL-MUM-07", destination: "Borivali National Park Base Camp", items: "40 Family Tents, Water Purifiers", status: "In Transit", eta: "18 mins", team: "Mumbai Logistics 05" }
        ],
        alerts: [
            { id: "ALT-MUM-01", severity: "Critical", title: "Severe Tidal Inundation Alert (4.8m Peak High Tide)", area: "Mithi Basin / Kurla / Mahim", source: "DisasterOS Risk Engine", time: "8 mins ago" },
            { id: "ALT-MUM-02", severity: "Critical", title: "Milan & Andheri Subways Submerged - Traffic Diverted", area: "Andheri Transit Corridor", source: "Traffic Police GIS", time: "20 mins ago" },
            { id: "ALT-MUM-03", severity: "Warning", title: "Squally Coastal Winds Gusting to 65 km/h", area: "Colaba & Marine Drive", source: "Open-Meteo Telemetry", time: "35 mins ago" },
            { id: "ALT-MUM-04", severity: "Critical", title: "Retaining Wall Collapse - Search & Rescue Active", area: "Ghatkopar Hill", source: "MCGM Emergency Cell", time: "50 mins ago" },
            { id: "ALT-MUM-05", severity: "Warning", title: "Central Line Trains Operating at Caution Speed", area: "Kurla - Sion Corridor", source: "Central Railway", time: "1 hour ago" },
            { id: "ALT-MUM-06", severity: "Info", title: "7 Civic Disaster Shelters Operating with Open Capacity", area: "Citywide", source: "Disaster Operations Command", time: "2 hours ago" },
            { id: "ALT-MUM-07", severity: "Advisory", title: "Landslide Precaution on Eastern Express Cut Slopes", area: "Thane Corridor", source: "PWD Highways", time: "3 hours ago" }
        ]
    },

    kolkata: {
        name: "Kolkata Metropolitan Area",
        lat: 22.5726, lon: 88.3639,
        zones: [
            { zone_id: "ZONE-KOL-HOOGHLY", city: "kolkata", name: "Hooghly Riverfront Basin", lat: 22.5850, lon: 88.3450, vulnerability: 0.78, radius_km: 3.2, elevation_m: 4.2 },
            { zone_id: "ZONE-KOL-SALTLAKE", city: "kolkata", name: "Salt Lake Reclamation Basin", lat: 22.5800, lon: 88.4100, vulnerability: 0.65, radius_km: 3.5, elevation_m: 3.1 },
            { zone_id: "ZONE-KOL-HOWRAH", city: "kolkata", name: "Howrah Rail Terminal Zone", lat: 22.5890, lon: 88.3410, vulnerability: 0.70, radius_km: 3.0, elevation_m: 5.0 },
            { zone_id: "ZONE-KOL-NEWTOWN", city: "kolkata", name: "New Town Commercial Sector", lat: 22.5870, lon: 88.4650, vulnerability: 0.42, radius_km: 4.0, elevation_m: 6.8 },
            { zone_id: "ZONE-KOL-BEHALA", city: "kolkata", name: "Behala Drainage Lowlands", lat: 22.4950, lon: 88.3150, vulnerability: 0.85, radius_km: 3.6, elevation_m: 2.3 },
            { zone_id: "ZONE-KOL-ALIPORE", city: "kolkata", name: "Alipore Central Urban Hub", lat: 22.5320, lon: 88.3300, vulnerability: 0.48, radius_km: 2.8, elevation_m: 7.5 },
            { zone_id: "ZONE-KOL-DUMDUM", city: "kolkata", name: "Dum Dum Airport Corridor", lat: 22.6450, lon: 88.4200, vulnerability: 0.55, radius_km: 3.8, elevation_m: 5.9 }
        ],
        hospitals: [
            { hospital_id: "HOSP-KOL-01", name: "SSKM IPGMER Government Super Specialty", location: "Bhowanipore", lat: 22.5390, lon: 88.3420, beds: 700, available: 125, icu: 50, trauma_capable: true, contact_number: "+91-33-2223-1589" },
            { hospital_id: "HOSP-KOL-02", name: "Calcutta Medical College & Hospital", location: "College Square", lat: 22.5740, lon: 88.3610, beds: 600, available: 95, icu: 40, trauma_capable: true, contact_number: "+91-33-2255-1621" },
            { hospital_id: "HOSP-KOL-03", name: "AMRI Hospital Emergency Center", location: "Dhakuria", lat: 22.5110, lon: 88.3650, beds: 400, available: 65, icu: 28, trauma_capable: true, contact_number: "+91-33-6680-0000" },
            { hospital_id: "HOSP-KOL-04", name: "Fortis Hospital Anandapur", location: "EM Bypass", lat: 22.5180, lon: 88.4020, beds: 450, available: 72, icu: 30, trauma_capable: true, contact_number: "+91-33-6628-4444" },
            { hospital_id: "HOSP-KOL-05", name: "Apollo Multispecialty Hospitals", location: "Canal Circular Road", lat: 22.5710, lon: 88.3980, beds: 500, available: 80, icu: 35, trauma_capable: true, contact_number: "+91-33-2320-3040" },
            { hospital_id: "HOSP-KOL-06", name: "Woodlands Multispeciality Hospital", location: "Alipore", lat: 22.5330, lon: 88.3280, beds: 320, available: 48, icu: 20, trauma_capable: true, contact_number: "+91-33-4033-7000" },
            { hospital_id: "HOSP-KOL-07", name: "Ruby General Hospital Emergency", location: "Kasba Golpark", lat: 22.5140, lon: 88.3990, beds: 350, available: 58, icu: 24, trauma_capable: true, contact_number: "+91-33-3987-1800" }
        ],
        shelters: [
            { shelter_id: "SHLT-KOL-01", name: "Salt Lake Yuva Bharati Stadium Shelter", location: "Salt Lake Sector III", lat: 22.5690, lon: 88.4070, zone_id: "ZONE-KOL-SALTLAKE", capacity: 1500, occupied: 620, status: "Open", water_liters: 18000, food_kits: 3000 },
            { shelter_id: "SHLT-KOL-02", name: "Howrah Municipal Town Hall Pavilion", location: "Howrah Maidan", lat: 22.5880, lon: 88.3380, zone_id: "ZONE-KOL-HOWRAH", capacity: 650, occupied: 410, status: "Open", water_liters: 5500, food_kits: 900 },
            { shelter_id: "SHLT-KOL-03", name: "Rabindra Sadan Cultural Complex", location: "Cathedral Road", lat: 22.5430, lon: 88.3440, zone_id: "ZONE-KOL-ALIPORE", capacity: 800, occupied: 320, status: "Open", water_liters: 7500, food_kits: 1400 },
            { shelter_id: "SHLT-KOL-04", name: "New Town Community Action Center", location: "Action Area I", lat: 22.5850, lon: 88.4610, zone_id: "ZONE-KOL-NEWTOWN", capacity: 550, occupied: 190, status: "Open", water_liters: 4500, food_kits: 800 },
            { shelter_id: "SHLT-KOL-05", name: "Behala High School Relief Center", location: "Diamond Harbour Road", lat: 22.4980, lon: 88.3180, zone_id: "ZONE-KOL-BEHALA", capacity: 700, occupied: 580, status: "Near Capacity", water_liters: 6000, food_kits: 1100 },
            { shelter_id: "SHLT-KOL-06", name: "Alipore District Sports Pavilion", location: "Judges Court Road", lat: 22.5290, lon: 88.3310, zone_id: "ZONE-KOL-ALIPORE", capacity: 500, occupied: 210, status: "Open", water_liters: 4000, food_kits: 700 },
            { shelter_id: "SHLT-KOL-07", name: "Dum Dum Municipal Kalyan Mandap", location: "Jessore Road", lat: 22.6410, lon: 88.4170, zone_id: "ZONE-KOL-DUMDUM", capacity: 600, occupied: 280, status: "Open", water_liters: 5000, food_kits: 950 }
        ],
        incidents: [
            { incident_id: "INC-KOL-101", reporter_id: "Citizen", type: "flood", location: "Behala Tram Depot Lowlands", description: "Extreme waterlogging 1.2m deep; 250 households marooned.", lat: 22.4960, lon: 88.3160, zone_id: "ZONE-KOL-BEHALA", severity: "critical", status: "in_progress", team: "NDRF Kolkata 02", created_at: new Date(Date.now() - 3600000).toISOString() },
            { incident_id: "INC-KOL-102", reporter_id: "River Police", type: "flood", location: "Babughat Jetty Promenade", description: "Hooghly river swelling past danger mark with high bore tide.", lat: 22.5680, lon: 88.3390, zone_id: "ZONE-KOL-HOOGHLY", severity: "high", status: "verified", team: "Marine Patrol Hooghly", created_at: new Date(Date.now() - 7200000).toISOString() },
            { incident_id: "INC-KOL-103", reporter_id: "Fire Service", type: "collapse", location: "Burrabazar Old Tenement", description: "Century-old commercial balcony collapse in narrow lane; 3 trapped.", lat: 22.5820, lon: 88.3510, zone_id: "ZONE-KOL-HOOGHLY", severity: "critical", status: "in_progress", team: "Kolkata Fire Rescue 01", created_at: new Date(Date.now() - 10800000).toISOString() },
            { incident_id: "INC-KOL-104", reporter_id: "Traffic Dept", type: "infrastructure", location: "Maa Flyover Park Circus Ramp", description: "Expansion joint rupture following intense monsoon thunderstorm.", lat: 22.5440, lon: 88.3710, zone_id: "ZONE-KOL-ALIPORE", severity: "high", status: "monitoring", team: "KMDA Civil Inspection", created_at: new Date(Date.now() - 14400000).toISOString() },
            { incident_id: "INC-KOL-105", reporter_id: "Citizen", type: "medical", location: "Howrah Station South Concourse", description: "Electrocution shock near flooded pedestrian subway; 2 critical.", lat: 22.5870, lon: 88.3430, zone_id: "ZONE-KOL-HOWRAH", severity: "critical", status: "verified", team: "Railway Paramedic Team", created_at: new Date(Date.now() - 18000000).toISOString() },
            { incident_id: "INC-KOL-106", reporter_id: "Ward Councillor", type: "electrical", location: "Kasba CESC Power Transformer", description: "Transformer sparked and smoking due to standing stormwater.", lat: 22.5130, lon: 88.3960, zone_id: "ZONE-KOL-SALTLAKE", severity: "medium", status: "reported", team: "CESC Power Crew", created_at: new Date(Date.now() - 21600000).toISOString() },
            { incident_id: "INC-KOL-107", reporter_id: "Airport Security", type: "flood", location: "Dum Dum Runway Sump 4", description: "Perimeter drainage ditch overflowing towards taxiway.", lat: 22.6470, lon: 88.4230, zone_id: "ZONE-KOL-DUMDUM", severity: "high", status: "in_progress", team: "AAI Emergency Dewatering", created_at: new Date(Date.now() - 25200000).toISOString() }
        ],
        emergency_requests: [
            { request_id: "REQ-KOL-001", citizen: "Subir Banerjee", phone: "+91-98301-11223", need: "Stranded Family Evacuation by Boat", people_count: 5, lat: 22.4970, lon: 88.3170, urgency: "critical", status: "In Progress", assigned_team: "NDRF Kolkata 02" },
            { request_id: "REQ-KOL-002", citizen: "Maitreyi Sen", phone: "+91-98302-22334", need: "Emergency Oxygen for Cardiac Patient", people_count: 1, lat: 22.5400, lon: 88.3430, urgency: "critical", status: "Pending", assigned_team: null },
            { request_id: "REQ-KOL-003", citizen: "Debashis Roy", phone: "+91-98303-33445", need: "Safe Shelter Transport for 4 Children", people_count: 6, lat: 22.5810, lon: 88.4110, urgency: "high", status: "Assigned", assigned_team: "Disaster Marine Boat Unit" },
            { request_id: "REQ-KOL-004", citizen: "Poulomi Das", phone: "+91-98304-44556", need: "Dry Food Rations & Bleaching Powder", people_count: 12, lat: 22.5890, lon: 88.3420, urgency: "medium", status: "Pending", assigned_team: null },
            { request_id: "REQ-KOL-005", citizen: "Anirban Ghosh", phone: "+91-98305-55667", need: "High-Capacity Sump Pump for Apartment", people_count: 30, lat: 22.5730, lon: 88.3990, urgency: "high", status: "Pending", assigned_team: null },
            { request_id: "REQ-KOL-006", citizen: "Sumitra Mukherjee", phone: "+91-98306-66778", need: "Wheelchair Evacuation from Ground Floor", people_count: 2, lat: 22.5310, lon: 88.3290, urgency: "high", status: "In Progress", assigned_team: "Civil Defense Squad 03" },
            { request_id: "REQ-KOL-007", citizen: "Tanmoy Dutta", phone: "+91-98307-77889", need: "Baby Formula and Safe Drinking Water", people_count: 3, lat: 22.6430, lon: 88.4190, urgency: "critical", status: "Pending", assigned_team: null }
        ],
        teams: [
            { team_id: "TEAM-KOL-01", name: "NDRF 2nd Battalion Bravo Squadron", type: "boat", status: "active", capacity: 16, lat: 22.5800, lon: 88.3430, lead: "Commander B. K. Nath" },
            { team_id: "TEAM-KOL-02", name: "Kolkata Fire Disaster Heavy Unit", type: "fire", status: "active", capacity: 12, lat: 22.5710, lon: 88.3580, lead: "Chief S. Chatterjee" },
            { team_id: "TEAM-KOL-03", name: "SSKM Trauma Emergency Flying Squad", type: "medical", status: "active", capacity: 10, lat: 22.5410, lon: 88.3440, lead: "Dr. Partha Das" },
            { team_id: "TEAM-KOL-04", name: "SDRF Marine Speedboat Taskforce", type: "boat", status: "available", capacity: 12, lat: 22.5690, lon: 88.3370, lead: "Capt. A. Mallick" },
            { team_id: "TEAM-KOL-05", name: "KMC Heavy Dewatering Brigade", type: "rescue", status: "active", capacity: 15, lat: 22.4970, lon: 88.3150, lead: "Eng. T. Halder" },
            { team_id: "TEAM-KOL-06", name: "Civil Defense Rapid Relief Wing", type: "evacuation", status: "available", capacity: 10, lat: 22.5820, lon: 88.4120, lead: "Insp. M. Bagchi" },
            { team_id: "TEAM-KOL-07", name: "Dum Dum Corridor K9 Search Unit", type: "rescue", status: "standby", capacity: 8, lat: 22.6420, lon: 88.4180, lead: "Sub-Insp. S. Roy" }
        ],
        inventory: [
            { item_id: "INV-KOL-01", name: "Diesel Submersible Slurry Dewatering Pumps", category: "Equipment", total: 42, available: 15, unit: "units", location: "KMC Central Garage" },
            { item_id: "INV-KOL-02", name: "FRP Rescue Motorboats with OBM", category: "Marine", total: 28, available: 14, unit: "boats", location: "Babughat River Depot" },
            { item_id: "INV-KOL-03", name: "Waterproof Multi-Family Relief Tents", category: "Shelter", total: 500, available: 260, unit: "tents", location: "Salt Lake Central Base" },
            { item_id: "INV-KOL-04", name: "Disaster Ready-to-Eat Rice Meal Packets", category: "Food", total: 16000, available: 10500, unit: "packets", location: "Alipore Food Depot" },
            { item_id: "INV-KOL-05", name: "Hemostatic Trauma Surgical Supplies", category: "Medical", total: 520, available: 310, unit: "kits", location: "SSKM Medical Store" },
            { item_id: "INV-KOL-06", name: "Inflatable Coast Guard Life Jackets", category: "Safety", total: 2200, available: 1400, unit: "jackets", location: "River Police Depot" },
            { item_id: "INV-KOL-07", name: "Silent 80kVA Mobile Emergency Generators", category: "Power", total: 32, available: 17, unit: "generators", location: "Howrah Logistics Hub" }
        ],
        infrastructure: [
            { asset_id: "INF-KOL-01", name: "Howrah Bridge (Rabindra Setu)", type: "bridge", lat: 22.5850, lon: 88.3460, status: "Open - High Wind Caution", critical_level: "critical" },
            { asset_id: "INF-KOL-02", name: "Vidyasagar Setu (Second Hooghly Bridge)", type: "bridge", lat: 22.5560, lon: 88.3280, status: "Operational", critical_level: "critical" },
            { asset_id: "INF-KOL-03", name: "Palmer Bridge Stormwater Pumping Station", type: "water", lat: 22.5630, lon: 88.3840, status: "All 6 Pumps Active", critical_level: "critical" },
            { asset_id: "INF-KOL-04", name: "Kolkata Metro East-West River Tunnel", type: "transit", lat: 22.5780, lon: 88.3490, status: "Monitored - Safe Sump Levels", critical_level: "critical" },
            { asset_id: "INF-KOL-05", name: "CESC Titagarh Thermal Transmission Grid", type: "power", lat: 22.7200, lon: 88.3700, status: "Operational", critical_level: "high" },
            { asset_id: "INF-KOL-06", name: "Syama Prasad Mookerjee Port Docks", type: "harbor", lat: 22.5400, lon: 88.3150, status: "Vessels Anchored Safe", critical_level: "high" },
            { asset_id: "INF-KOL-07", name: "Kestopur Canal Drainage Lock Gate", type: "drainage", lat: 22.5920, lon: 88.4280, status: "Lock Gate Open - Tidal Flush", critical_level: "critical" }
        ],
        volunteers: [
            { volunteer_id: "VOL-KOL-01", name: "Arindam Chakraborty", phone: "+91-98311-12345", skills: ["Boat Operator", "Swimmer"], status: "Deployed", zone_id: "ZONE-KOL-HOOGHLY" },
            { volunteer_id: "VOL-KOL-02", name: "Sreeparna Ghosh", phone: "+91-98312-23456", skills: ["First Aid", "Triage"], status: "Deployed", zone_id: "ZONE-KOL-SALTLAKE" },
            { volunteer_id: "VOL-KOL-03", name: "Rana Mukherjee", phone: "+91-98313-34567", skills: ["Ham Radio"], status: "Available", zone_id: "ZONE-KOL-HOWRAH" },
            { volunteer_id: "VOL-KOL-04", name: "Dipankar Sarkar", phone: "+91-98314-45678", skills: ["Heavy Driver"], status: "Deployed", zone_id: "ZONE-KOL-BEHALA" },
            { volunteer_id: "VOL-KOL-05", name: "Tania Bose", phone: "+91-98315-56789", skills: ["Food Relief Logistics"], status: "Deployed", zone_id: "ZONE-KOL-NEWTOWN" },
            { volunteer_id: "VOL-KOL-06", name: "Siddhartha Sen", phone: "+91-98316-67890", skills: ["Civil Defense Rescue"], status: "Available", zone_id: "ZONE-KOL-ALIPORE" },
            { volunteer_id: "VOL-KOL-07", name: "Paramita Ganguly", phone: "+91-98317-78901", skills: ["Drone Mapping"], status: "Available", zone_id: "ZONE-KOL-DUMDUM" }
        ],
        relief_deliveries: [
            { delivery_id: "DEL-KOL-01", destination: "Behala High School Relief Center", items: "300 Potable Water Cans, 200 Rations", status: "Delivered", eta: "Completed", team: "Kolkata Logistics 01" },
            { delivery_id: "DEL-KOL-02", destination: "Salt Lake Yuva Bharati Stadium Shelter", items: "100 Blankets, Medical Trauma Box", status: "In Transit", eta: "15 mins", team: "Kolkata Logistics 02" },
            { delivery_id: "DEL-KOL-03", destination: "Howrah Municipal Town Hall Pavilion", items: "500 MRE Packs, 2 Dewatering Sump Hose", status: "Delivered", eta: "Completed", team: "Kolkata Logistics 01" },
            { delivery_id: "DEL-KOL-04", destination: "Rabindra Sadan Cultural Complex", items: "120 Family Tents, Dry Milk", status: "In Transit", eta: "20 mins", team: "Kolkata Logistics 03" },
            { delivery_id: "DEL-KOL-05", destination: "New Town Community Action Center", items: "200 Life Jackets, Clean Drinking Bags", status: "Scheduled", eta: "35 mins", team: "Kolkata Logistics 04" },
            { delivery_id: "DEL-KOL-06", destination: "Dum Dum Municipal Kalyan Mandap", items: "First Aid Kits, 150 Rations", status: "Delivered", eta: "Completed", team: "Kolkata Logistics 02" },
            { delivery_id: "DEL-KOL-07", destination: "Alipore District Sports Pavilion", items: "2 Diesel Generators, Fuel Drums", status: "In Transit", eta: "10 mins", team: "Kolkata Logistics 05" }
        ],
        alerts: [
            { id: "ALT-KOL-01", severity: "Critical", title: "Severe Flash Flood Warning: Behala & Hooghly Lowlands", area: "Behala Drainage Basin", source: "DisasterOS Risk Engine", time: "12 mins ago" },
            { id: "ALT-KOL-02", severity: "Critical", title: "High Bore Tide Warning in Hooghly Estuary (4.5m)", area: "Howrah & Babughat Riverfront", source: "KOPT River Hydrology", time: "28 mins ago" },
            { id: "ALT-KOL-03", severity: "Warning", title: "Heavy Downpour (65mm/hr) in Salt Lake & New Town", area: "Salt Lake & EM Bypass", source: "Open-Meteo Ingestion", time: "45 mins ago" },
            { id: "ALT-KOL-04", severity: "Critical", title: "Century-Old Tenement Collapse - Rescue in Progress", area: "Burrabazar Commercial Area", source: "Kolkata Police Command", time: "1 hour ago" },
            { id: "ALT-KOL-05", severity: "Warning", title: "Maa Flyover Ramp Caution Due to Expansion Inspection", area: "Park Circus Interconnect", source: "KMDA Civil Alert", time: "2 hours ago" },
            { id: "ALT-KOL-06", severity: "Info", title: "7 Major Multi-Resource Shelters Active Across Kolkata", area: "Metropolitan Region", source: "Disaster Operations Command", time: "2 hours ago" },
            { id: "ALT-KOL-07", severity: "Advisory", title: "Dum Dum Airport Drainage Pumps at 100% Capacity", area: "Airport Zone", source: "Civil Aviation Emergency", time: "3 hours ago" }
        ]
    },

    delhi: {
        name: "Delhi National Capital Region",
        lat: 28.6139, lon: 77.2090,
        zones: [
            { zone_id: "ZONE-DEL-YAMUNA", city: "delhi", name: "Yamuna River Floodplain", lat: 28.6480, lon: 77.2510, vulnerability: 0.88, radius_km: 3.5, elevation_m: 205.0 },
            { zone_id: "ZONE-DEL-CENTRAL", city: "delhi", name: "Connaught Urban Administrative Core", lat: 28.6315, lon: 77.2167, vulnerability: 0.35, radius_km: 2.8, elevation_m: 215.0 },
            { zone_id: "ZONE-DEL-OKHLA", city: "delhi", name: "Okhla Industrial Sluice Basin", lat: 28.5350, lon: 77.2880, vulnerability: 0.72, radius_km: 3.2, elevation_m: 203.0 },
            { zone_id: "ZONE-DEL-ROHINI", city: "delhi", name: "Rohini Northwest Residential Sector", lat: 28.7180, lon: 77.1150, vulnerability: 0.45, radius_km: 4.0, elevation_m: 218.0 },
            { zone_id: "ZONE-DEL-MAYUR", city: "delhi", name: "Mayur Vihar Lowlands (Trans-Yamuna)", lat: 28.6050, lon: 77.2950, vulnerability: 0.80, radius_km: 3.0, elevation_m: 204.0 },
            { zone_id: "ZONE-DEL-GURUGRAM", city: "delhi", name: "Gurugram Border Expressway Basin", lat: 28.5020, lon: 77.0850, vulnerability: 0.65, radius_km: 4.2, elevation_m: 222.0 },
            { zone_id: "ZONE-DEL-NOIDA", city: "delhi", name: "Noida Hindon Floodplain Corridor", lat: 28.5800, lon: 77.3600, vulnerability: 0.75, radius_km: 3.8, elevation_m: 202.0 }
        ],
        hospitals: [
            { hospital_id: "HOSP-DEL-01", name: "AIIMS Apex Trauma Center", location: "Ansari Nagar", lat: 28.5672, lon: 77.2100, beds: 800, available: 140, icu: 65, trauma_capable: true, contact_number: "+91-11-2658-8500" },
            { hospital_id: "HOSP-DEL-02", name: "Safdarjung Hospital Emergency Block", location: "Ring Road", lat: 28.5700, lon: 77.2070, beds: 750, available: 115, icu: 55, trauma_capable: true, contact_number: "+91-11-2616-5060" },
            { hospital_id: "HOSP-DEL-03", name: "Dr. Ram Manohar Lohia Hospital", location: "Baba Kharak Singh Marg", lat: 28.6250, lon: 77.2020, beds: 600, available: 90, icu: 40, trauma_capable: true, contact_number: "+91-11-2336-5525" },
            { hospital_id: "HOSP-DEL-04", name: "Max Super Specialty Hospital", location: "Saket", lat: 28.5280, lon: 77.2120, beds: 480, available: 75, icu: 35, trauma_capable: true, contact_number: "+91-11-2651-5050" },
            { hospital_id: "HOSP-DEL-05", name: "Indraprastha Apollo Hospital", location: "Sarita Vihar", lat: 28.5410, lon: 77.2830, beds: 520, available: 82, icu: 38, trauma_capable: true, contact_number: "+91-11-2692-5858" },
            { hospital_id: "HOSP-DEL-06", name: "Fortis Hospital Shalimar Bagh", location: "Shalimar Bagh", lat: 28.7120, lon: 77.1650, beds: 400, available: 60, icu: 28, trauma_capable: true, contact_number: "+91-11-4530-2222" },
            { hospital_id: "HOSP-DEL-07", name: "Sir Ganga Ram Hospital", location: "Rajinder Nagar", lat: 28.6380, lon: 77.1890, beds: 550, available: 86, icu: 42, trauma_capable: true, contact_number: "+91-11-2575-0000" }
        ],
        shelters: [
            { shelter_id: "SHLT-DEL-01", name: "Yamuna Sports Complex Indoor Stadium", location: "Surajmal Vihar", lat: 28.6570, lon: 77.3050, zone_id: "ZONE-DEL-MAYUR", capacity: 1800, occupied: 720, status: "Open", water_liters: 22000, food_kits: 3500 },
            { shelter_id: "SHLT-DEL-02", name: "Talkatora Indoor Stadium Relief Camp", location: "President's Estate", lat: 28.6210, lon: 77.1930, zone_id: "ZONE-DEL-CENTRAL", capacity: 1000, occupied: 380, status: "Open", water_liters: 12000, food_kits: 2000 },
            { shelter_id: "SHLT-DEL-03", name: "Mayur Vihar Phase 1 Community Pavilion", location: "Mayur Vihar", lat: 28.6080, lon: 77.2980, zone_id: "ZONE-DEL-MAYUR", capacity: 700, occupied: 610, status: "Near Capacity", water_liters: 6000, food_kits: 1100 },
            { shelter_id: "SHLT-DEL-04", name: "Rohini Sector 9 District Sports Ground", location: "Rohini", lat: 28.7150, lon: 77.1200, zone_id: "ZONE-DEL-ROHINI", capacity: 850, occupied: 310, status: "Open", water_liters: 8500, food_kits: 1500 },
            { shelter_id: "SHLT-DEL-05", name: "Okhla Phase 2 Municipal Disaster Hall", location: "Okhla Industrial", lat: 28.5380, lon: 77.2840, zone_id: "ZONE-DEL-OKHLA", capacity: 600, occupied: 390, status: "Open", water_liters: 5500, food_kits: 900 },
            { shelter_id: "SHLT-DEL-06", name: "Civil Lines Old Secretariat Pavilion", location: "Civil Lines", lat: 28.6810, lon: 77.2220, zone_id: "ZONE-DEL-YAMUNA", capacity: 900, occupied: 520, status: "Open", water_liters: 9000, food_kits: 1700 },
            { shelter_id: "SHLT-DEL-07", name: "Hindon Hindon Vihar Evacuation Hub", location: "Noida Border", lat: 28.5820, lon: 77.3550, zone_id: "ZONE-DEL-NOIDA", capacity: 750, occupied: 340, status: "Open", water_liters: 7000, food_kits: 1300 }
        ],
        incidents: [
            { incident_id: "INC-DEL-101", reporter_id: "Flood Control", type: "flood", location: "Old Iron Railway Bridge Yamuna", description: "Water level reached 208.45m; river inundating ring road near Monastery.", lat: 28.6650, lon: 77.2450, zone_id: "ZONE-DEL-YAMUNA", severity: "critical", status: "in_progress", team: "NDRF 8th Battalion", created_at: new Date(Date.now() - 3600000).toISOString() },
            { incident_id: "INC-DEL-102", reporter_id: "Traffic Police", type: "flood", location: "Pragati Maidan Tunnel Underpass", description: "Stormwater drain backup; 1.8m water inside tunnel. Traffic shut.", lat: 28.6180, lon: 77.2420, zone_id: "ZONE-DEL-CENTRAL", severity: "high", status: "verified", team: "PWD Heavy Pumping Force", created_at: new Date(Date.now() - 7200000).toISOString() },
            { incident_id: "INC-DEL-103", reporter_id: "Citizen", type: "infrastructure", location: "ITO Yamuna Barrage Gate 28", description: "Silt blockage jamming automatic barrage lift gate.", lat: 28.6290, lon: 77.2510, zone_id: "ZONE-DEL-YAMUNA", severity: "critical", status: "in_progress", team: "Army Engineering Corps 01", created_at: new Date(Date.now() - 10800000).toISOString() },
            { incident_id: "INC-DEL-104", reporter_id: "Fire Service", type: "fire", location: "Okhla Phase 1 Recycling Yard", description: "Rubber shredding warehouse fire; toxic smoke blowing south.", lat: 28.5320, lon: 77.2850, zone_id: "ZONE-DEL-OKHLA", severity: "high", status: "in_progress", team: "Delhi Fire Service Hazmat", created_at: new Date(Date.now() - 14400000).toISOString() },
            { incident_id: "INC-DEL-105", reporter_id: "Citizen", type: "medical", location: "Kashmere Gate ISBT Alley", description: "Tree fall on passenger waiting queue during microburst; 4 injured.", lat: 28.6680, lon: 77.2280, zone_id: "ZONE-DEL-YAMUNA", severity: "critical", status: "verified", team: "CAT Ambulance Unit 04", created_at: new Date(Date.now() - 18000000).toISOString() },
            { incident_id: "INC-DEL-106", reporter_id: "Resident", type: "flood", location: "Hindon River Lowland Colony", description: "Hindon river breach submerging ground-floor agricultural houses.", lat: 28.5830, lon: 77.3620, zone_id: "ZONE-DEL-NOIDA", severity: "high", status: "reported", team: "UP SDRF Boat Squadron", created_at: new Date(Date.now() - 21600000).toISOString() },
            { incident_id: "INC-DEL-107", reporter_id: "Power Dept", type: "electrical", location: "Wazirabad 220kV Substation", description: "Water table entering basement cable trenches; precautionary load shed.", lat: 28.7120, lon: 77.2310, zone_id: "ZONE-DEL-YAMUNA", severity: "critical", status: "monitoring", team: "Delhi Transco Grid Crew", created_at: new Date(Date.now() - 25200000).toISOString() }
        ],
        emergency_requests: [
            { request_id: "REQ-DEL-001", citizen: "Harpreet Singh", phone: "+91-98111-12345", need: "Stranded Cattle & 8 Farmers on Sandbar", people_count: 8, lat: 28.6500, lon: 77.2530, urgency: "critical", status: "In Progress", assigned_team: "NDRF 8th Battalion" },
            { request_id: "REQ-DEL-002", citizen: "Kavita Mehra", phone: "+91-98112-23456", need: "Oxygen Cylinder Supply for ICU Patient", people_count: 1, lat: 28.5680, lon: 77.2110, urgency: "critical", status: "Pending", assigned_team: null },
            { request_id: "REQ-DEL-003", citizen: "Manoj Sharma", phone: "+91-98113-34567", need: "Rescue Boat for Mayur Vihar Lowland", people_count: 7, lat: 28.6060, lon: 77.2960, urgency: "high", status: "Assigned", assigned_team: "Delhi Fire Boat Squad" },
            { request_id: "REQ-DEL-004", citizen: "Zarina Bano", phone: "+91-98114-45678", need: "Food & Clean Potable Drinking Water", people_count: 15, lat: 28.5360, lon: 77.2890, urgency: "medium", status: "Pending", assigned_team: null },
            { request_id: "REQ-DEL-005", citizen: "Deepak Yadav", phone: "+91-98115-56789", need: "Dewatering Pump for Basement Clinic", people_count: 4, lat: 28.5030, lon: 77.0860, urgency: "high", status: "Pending", assigned_team: null },
            { request_id: "REQ-DEL-006", citizen: "Nirmal Kaur", phone: "+91-98116-67890", need: "Elderly Bedridden Patient Transport", people_count: 2, lat: 28.7190, lon: 77.1160, urgency: "critical", status: "In Progress", assigned_team: "CAT Ambulance Unit 04" },
            { request_id: "REQ-DEL-007", citizen: "Rajesh Tyagi", phone: "+91-98117-78901", need: "Dry Baby Rations and Mosquito Nets", people_count: 6, lat: 28.5810, lon: 77.3610, urgency: "medium", status: "Pending", assigned_team: null }
        ],
        teams: [
            { team_id: "TEAM-DEL-01", name: "NDRF 8th Battalion Marine Unit", type: "boat", status: "active", capacity: 18, lat: 28.6520, lon: 77.2500, lead: "Commandant S. K. Tyagi" },
            { team_id: "TEAM-DEL-02", name: "Delhi Fire Service Heavy Squad", type: "fire", status: "active", capacity: 14, lat: 28.6280, lon: 77.2180, lead: "Chief Atul Garg" },
            { team_id: "TEAM-DEL-03", name: "AIIMS Trauma Airborne Flying Medic", type: "medical", status: "active", capacity: 10, lat: 28.5680, lon: 77.2090, lead: "Dr. Sanjeev Bhoi" },
            { team_id: "TEAM-DEL-04", name: "Army Engineering Diving Wing", type: "boat", status: "available", capacity: 12, lat: 28.6300, lon: 77.2530, lead: "Col. D. S. Randhawa" },
            { team_id: "TEAM-DEL-05", name: "PWD Super-Sucker Dewatering Wing", type: "rescue", status: "active", capacity: 16, lat: 28.6190, lon: 77.2400, lead: "Eng. R. K. Mittal" },
            { team_id: "TEAM-DEL-06", name: "Civil Defense Flood Warden Wing", type: "evacuation", status: "available", capacity: 12, lat: 28.6070, lon: 77.2940, lead: "Insp. Vinod Pant" },
            { team_id: "TEAM-DEL-07", name: "Hindon Disaster Swift Taskforce", type: "boat", status: "available", capacity: 10, lat: 28.5810, lon: 77.3580, lead: "Sub-Insp. B. P. Yadav" }
        ],
        inventory: [
            { item_id: "INV-DEL-01", name: "Super-Sucker High-Lift Dewatering Pumps", category: "Equipment", total: 45, available: 18, unit: "units", location: "PWD Central Workshop" },
            { item_id: "INV-DEL-02", name: "Inflatable Heavy Inundation Rescue Boats", category: "Marine", total: 30, available: 15, unit: "boats", location: "Yamuna Barrage Depot" },
            { item_id: "INV-DEL-03", name: "Modular Disaster Shelter Tents", category: "Shelter", total: 700, available: 420, unit: "tents", location: "Talkatora Central Depot" },
            { item_id: "INV-DEL-04", name: "Fortified MRE Rations & High-Calorie Bars", category: "Food", total: 18000, available: 11200, unit: "packets", location: "Civil Lines Warehouse" },
            { item_id: "INV-DEL-05", name: "Trauma Surgical Stabilization Units", category: "Medical", total: 550, available: 340, unit: "kits", location: "AIIMS Medical Base" },
            { item_id: "INV-DEL-06", name: "Dual-Chamber SOLAS Life Jackets", category: "Safety", total: 2400, available: 1600, unit: "jackets", location: "Disaster Authority Store" },
            { item_id: "INV-DEL-07", name: "Diesel Mobile Lighting & 100kVA Generators", category: "Power", total: 38, available: 20, unit: "generators", location: "Central Workshop" }
        ],
        infrastructure: [
            { asset_id: "INF-DEL-01", name: "Old Yamuna Iron Bridge (Loha Pul)", type: "bridge", lat: 28.6650, lon: 77.2460, status: "Closed - Water Over High Danger Mark", critical_level: "critical" },
            { asset_id: "INF-DEL-02", name: "Wazirabad Water Treatment Plant", type: "water", lat: 28.7100, lon: 77.2280, status: "Operating at 75% Capacity", critical_level: "critical" },
            { asset_id: "INF-DEL-03", name: "ITO Yamuna Barrage Spillway Structure", type: "dam", lat: 28.6290, lon: 77.2520, status: "32 of 32 Gates Open", critical_level: "critical" },
            { asset_id: "INF-DEL-04", name: "Delhi Metro Blue Line Yamuna Bank Yard", type: "transit", lat: 28.6220, lon: 77.2650, status: "Retaining Bund Secure", critical_level: "critical" },
            { asset_id: "INF-DEL-05", name: "Okhla Headworks Sluice Canal", type: "water", lat: 28.5360, lon: 77.2900, status: "High Discharge Active", critical_level: "critical" },
            { asset_id: "INF-DEL-06", name: "Ring Road Kashmere Gate Bypass", type: "transit", lat: 28.6700, lon: 77.2300, status: "Water Entering Bus Terminal", critical_level: "high" },
            { asset_id: "INF-DEL-07", name: "Pragati Maidan Integrated Underground Tunnel", type: "transit", lat: 28.6180, lon: 77.2410, status: "Pumping in Progress", critical_level: "high" }
        ],
        volunteers: [
            { volunteer_id: "VOL-DEL-01", name: "Gurpreet Chawla", phone: "+91-98101-11223", skills: ["Boat Operator", "Swimmer"], status: "Deployed", zone_id: "ZONE-DEL-YAMUNA" },
            { volunteer_id: "VOL-DEL-02", name: "Sunil Verma", phone: "+91-98102-22334", skills: ["Civil Defense", "Rescue"], status: "Deployed", zone_id: "ZONE-DEL-MAYUR" },
            { volunteer_id: "VOL-DEL-03", name: "Pooja Batra", phone: "+91-98103-33445", skills: ["Emergency Nursing"], status: "Deployed", zone_id: "ZONE-DEL-CENTRAL" },
            { volunteer_id: "VOL-DEL-04", name: "Mohit Aggarwal", phone: "+91-98104-44556", skills: ["Ham Radio Communications"], status: "Available", zone_id: "ZONE-DEL-ROHINI" },
            { volunteer_id: "VOL-DEL-05", name: "Vikram Negi", phone: "+91-98105-55667", skills: ["Heavy Vehicle Driver"], status: "Deployed", zone_id: "ZONE-DEL-OKHLA" },
            { volunteer_id: "VOL-DEL-06", name: "Neeta Saxena", phone: "+91-98106-66778", skills: ["Relief Supply Management"], status: "Available", zone_id: "ZONE-DEL-GURUGRAM" },
            { volunteer_id: "VOL-DEL-07", name: "Aman Tyagi", phone: "+91-98107-77889", skills: ["Drone Reconnaissance"], status: "Available", zone_id: "ZONE-DEL-NOIDA" }
        ],
        relief_deliveries: [
            { delivery_id: "DEL-DEL-01", destination: "Yamuna Sports Complex Indoor Stadium", items: "500 Ration Kits, 200 Cots", status: "Delivered", eta: "Completed", team: "Delhi Logistics 01" },
            { delivery_id: "DEL-DEL-02", destination: "Talkatora Indoor Stadium Relief Camp", items: "100 Blankets, Medical Chest", status: "In Transit", eta: "10 mins", team: "Delhi Logistics 02" },
            { delivery_id: "DEL-DEL-03", destination: "Mayur Vihar Phase 1 Community Pavilion", items: "300 MRE Packs, Water Purifiers", status: "Delivered", eta: "Completed", team: "Delhi Logistics 01" },
            { delivery_id: "DEL-DEL-04", destination: "Civil Lines Old Secretariat Pavilion", items: "50 Tents, 150 Life Jackets", status: "In Transit", eta: "15 mins", team: "Delhi Logistics 03" },
            { delivery_id: "DEL-DEL-05", destination: "Okhla Phase 2 Municipal Disaster Hall", items: "400 Potable Water Cans", status: "Scheduled", eta: "30 mins", team: "Delhi Logistics 04" },
            { delivery_id: "DEL-DEL-06", destination: "Hindon Vihar Evacuation Hub", items: "Baby Formula, Mosquito Nets", status: "Delivered", eta: "Completed", team: "Delhi Logistics 02" },
            { delivery_id: "DEL-DEL-07", destination: "Rohini Sector 9 District Sports Ground", items: "2 Diesel Generators, 200 Cots", status: "In Transit", eta: "22 mins", team: "Delhi Logistics 05" }
        ],
        alerts: [
            { id: "ALT-DEL-01", severity: "Critical", title: "Yamuna Water Level at Record 208.45m - Evacuate Floodplains", area: "Yamuna River Corridor", source: "Central Water Commission", time: "5 mins ago" },
            { id: "ALT-DEL-02", severity: "Critical", title: "Ring Road Flooding Near Monastery & ISBT Kashmere Gate", area: "Civil Lines & Kashmere Gate", source: "Delhi Traffic Control", time: "18 mins ago" },
            { id: "ALT-DEL-03", severity: "Warning", title: "Pragati Maidan Underground Tunnel Shut Due to Flooding", area: "Central Delhi Hub", source: "PWD Command", time: "30 mins ago" },
            { id: "ALT-DEL-04", severity: "Critical", title: "Hathnikund Barrage Discharging 3.5 Lakh Cusecs Water", area: "Northern Reach to Delhi", source: "Irrigation Dept", time: "45 mins ago" },
            { id: "ALT-DEL-05", severity: "Warning", title: "Okhla Industrial Sluice Gates on Emergency Overflow Status", area: "Okhla Sluice Basin", source: "DisasterOS Risk Engine", time: "1 hour ago" },
            { id: "ALT-DEL-06", severity: "Info", title: "7 Major Multi-Facility Relief Camps Active in Delhi NCR", area: "Citywide", source: "Disaster Operations Command", time: "2 hours ago" },
            { id: "ALT-DEL-07", severity: "Advisory", title: "Wazirabad & Chandrawal WTPs Operating with Back-up Bunds", area: "Drinking Water Infrastructure", source: "Delhi Jal Board", time: "3 hours ago" }
        ]
    },

    tokyo: {
        name: "Tokyo Metropolitan (Seismic & Coastal)",
        lat: 35.6762, lon: 139.6503,
        zones: [
            { zone_id: "ZONE-TKY-BAY", city: "tokyo", name: "Tokyo Bay Waterfront & Odaiba", lat: 35.6300, lon: 139.7750, vulnerability: 0.72, radius_km: 3.5, elevation_m: 2.5 },
            { zone_id: "ZONE-TKY-SHINJUKU", city: "tokyo", name: "Shinjuku High-Rise Urban Hub", lat: 35.6900, lon: 139.7000, vulnerability: 0.38, radius_km: 3.0, elevation_m: 35.0 },
            { zone_id: "ZONE-TKY-SHIBUYA", city: "tokyo", name: "Shibuya Transit Basin", lat: 35.6580, lon: 139.7010, vulnerability: 0.50, radius_km: 2.8, elevation_m: 16.5 },
            { zone_id: "ZONE-TKY-SUMIDA", city: "tokyo", name: "Sumida River Lowland District", lat: 35.7100, lon: 139.8050, vulnerability: 0.85, radius_km: 3.2, elevation_m: 1.2 },
            { zone_id: "ZONE-TKY-KOTO", city: "tokyo", name: "Koto Zero-Meter Below-Sea Basin", lat: 35.6720, lon: 139.8170, vulnerability: 0.90, radius_km: 3.6, elevation_m: -0.8 },
            { zone_id: "ZONE-TKY-ROPPONGI", city: "tokyo", name: "Roppongi Central High Ground", lat: 35.6630, lon: 139.7320, vulnerability: 0.32, radius_km: 2.5, elevation_m: 32.0 },
            { zone_id: "ZONE-TKY-SHINAGAWA", city: "tokyo", name: "Shinagawa Coastal Transit Port", lat: 35.6280, lon: 139.7380, vulnerability: 0.60, radius_km: 3.4, elevation_m: 4.0 }
        ],
        hospitals: [
            { hospital_id: "HOSP-TKY-01", name: "University of Tokyo Hospital Disaster Center", location: "Bunkyo-ku", lat: 35.7120, lon: 139.7620, beds: 850, available: 160, icu: 70, trauma_capable: true, contact_number: "+81-3-3815-5411" },
            { hospital_id: "HOSP-TKY-02", name: "St. Luke's International Emergency Hospital", location: "Chuo-ku", lat: 35.6670, lon: 139.7760, beds: 520, available: 95, icu: 45, trauma_capable: true, contact_number: "+81-3-3541-5151" },
            { hospital_id: "HOSP-TKY-03", name: "Toranomon Trauma & Critical Care Hospital", location: "Minato-ku", lat: 35.6690, lon: 139.7470, beds: 600, available: 110, icu: 50, trauma_capable: true, contact_number: "+81-3-3588-1111" },
            { hospital_id: "HOSP-TKY-04", name: "Disaster Medical Center Tachikawa", location: "Tachikawa", lat: 35.7110, lon: 139.4080, beds: 500, available: 88, icu: 38, trauma_capable: true, contact_number: "+81-42-526-5511" },
            { hospital_id: "HOSP-TKY-05", name: "Juntendo University Hospital Emergency Wing", location: "Hongo", lat: 35.7030, lon: 139.7610, beds: 580, available: 98, icu: 44, trauma_capable: true, contact_number: "+81-3-3813-3111" },
            { hospital_id: "HOSP-TKY-06", name: "National Center for Global Health and Medicine", location: "Shinjuku-ku", lat: 35.6980, lon: 139.7180, beds: 650, available: 120, icu: 52, trauma_capable: true, contact_number: "+81-3-3202-7181" },
            { hospital_id: "HOSP-TKY-07", name: "Mitsui Memorial Hospital Disaster Base", location: "Chiyoda-ku", lat: 35.6990, lon: 139.7780, beds: 480, available: 78, icu: 32, trauma_capable: true, contact_number: "+81-3-3862-9111" }
        ],
        shelters: [
            { shelter_id: "SHLT-TKY-01", name: "Tokyo Big Sight Evacuation Megacenter", location: "Ariake Odaiba", lat: 35.6290, lon: 139.7940, zone_id: "ZONE-TKY-BAY", capacity: 3000, occupied: 1150, status: "Open", water_liters: 45000, food_kits: 8000 },
            { shelter_id: "SHLT-TKY-02", name: "Yoyogi National Gymnasium Shelter", location: "Shibuya-ku", lat: 35.6680, lon: 139.7000, zone_id: "ZONE-TKY-SHIBUYA", capacity: 1800, occupied: 780, status: "Open", water_liters: 24000, food_kits: 4200 },
            { shelter_id: "SHLT-TKY-03", name: "Ryogoku Kokugikan Disaster Refuge", location: "Sumida-ku", lat: 35.6970, lon: 139.7930, zone_id: "ZONE-TKY-SUMIDA", capacity: 1500, occupied: 1220, status: "Near Capacity", water_liters: 18000, food_kits: 3100 },
            { shelter_id: "SHLT-TKY-04", name: "Shinjuku Central Park Disaster Pavilion", location: "Nishi-Shinjuku", lat: 35.6880, lon: 139.6910, zone_id: "ZONE-TKY-SHINJUKU", capacity: 1200, occupied: 450, status: "Open", water_liters: 14000, food_kits: 2600 },
            { shelter_id: "SHLT-TKY-05", name: "Koto Ward Disaster Prevention Center", location: "Toyo Koto-ku", lat: 35.6740, lon: 139.8150, zone_id: "ZONE-TKY-KOTO", capacity: 950, occupied: 820, status: "Near Capacity", water_liters: 11000, food_kits: 1900 },
            { shelter_id: "SHLT-TKY-06", name: "Komazawa Olympic Park Base Camp", location: "Setagaya-ku", lat: 35.6260, lon: 139.6610, zone_id: "ZONE-TKY-ROPPONGI", capacity: 1600, occupied: 540, status: "Open", water_liters: 20000, food_kits: 3600 },
            { shelter_id: "SHLT-TKY-07", name: "Shinagawa Civic Disaster Hall", location: "Shinagawa-ku", lat: 35.6080, lon: 139.7310, zone_id: "ZONE-TKY-SHINAGAWA", capacity: 850, occupied: 390, status: "Open", water_liters: 9500, food_kits: 1700 }
        ],
        incidents: [
            { incident_id: "INC-TKY-101", reporter_id: "JMA Seismic Alert", type: "infrastructure", location: "Tokyo Bay Coastal Seawall Sluice", description: "Seismic shear damage M5.8 detected along tidal floodwall.", lat: 35.6310, lon: 139.7780, zone_id: "ZONE-TKY-BAY", severity: "critical", status: "in_progress", team: "Tokyo Fire Hyper Rescue", created_at: new Date(Date.now() - 3600000).toISOString() },
            { incident_id: "INC-TKY-102", reporter_id: "Metro Transit", type: "flood", location: "Shibuya Underground Station Sump", description: "Flash torrential storm runoff entering B2F subway concourse.", lat: 35.6590, lon: 139.7020, zone_id: "ZONE-TKY-SHIBUYA", severity: "high", status: "verified", team: "Tokyo Metro Disaster Squad", created_at: new Date(Date.now() - 7200000).toISOString() },
            { incident_id: "INC-TKY-103", reporter_id: "Citizen", type: "medical", location: "Sumida Densely Packed Ward", description: "Older wooden house facade structural shift; 3 elderly residents trapped.", lat: 28.7110, lon: 139.8060, zone_id: "ZONE-TKY-SUMIDA", severity: "critical", status: "in_progress", team: "Paramedic Squad Minato", created_at: new Date(Date.now() - 10800000).toISOString() },
            { incident_id: "INC-TKY-104", reporter_id: "Ward Office", type: "flood", location: "Koto Zero-Meter District Arakawa Gate", description: "Tidal surge pressing against river dyke; seepage in residential lane.", lat: 35.6730, lon: 139.8180, zone_id: "ZONE-TKY-KOTO", severity: "critical", status: "in_progress", team: "Arakawa Flood Mitigation Unit", created_at: new Date(Date.now() - 14400000).toISOString() },
            { incident_id: "INC-TKY-105", reporter_id: "Police", type: "infrastructure", location: "Shinjuku High-Rise Overpass", description: "Seismic damper displaced on elevated transit ramp.", lat: 35.6910, lon: 139.6990, zone_id: "ZONE-TKY-SHINJUKU", severity: "high", status: "monitoring", team: "Metropolitan Civil Inspect", created_at: new Date(Date.now() - 18000000).toISOString() },
            { incident_id: "INC-TKY-106", reporter_id: "Harbor Police", type: "medical", location: "Shinagawa Container Terminal", description: "Container crane rail slip injuring 2 terminal operators.", lat: 35.6270, lon: 139.7400, zone_id: "ZONE-TKY-SHINAGAWA", severity: "critical", status: "verified", team: "Harbor Emergency Rescue", created_at: new Date(Date.now() - 21600000).toISOString() },
            { incident_id: "INC-TKY-107", reporter_id: "Citizen", type: "electrical", location: "Roppongi Substation Breaker", description: "Short circuit and localized blackout following seismic jolt.", lat: 35.6620, lon: 139.7340, zone_id: "ZONE-TKY-ROPPONGI", severity: "medium", status: "reported", team: "TEPCO Grid Taskforce", created_at: new Date(Date.now() - 25200000).toISOString() }
        ],
        emergency_requests: [
            { request_id: "REQ-TKY-001", citizen: "Kenji Sato", phone: "+81-90-1234-5678", need: "Elderly Stroke Patient Emergency Ambulance", people_count: 1, lat: 35.7130, lon: 139.7630, urgency: "critical", status: "In Progress", assigned_team: "Paramedic Squad Minato" },
            { request_id: "REQ-TKY-002", citizen: "Yuka Takahashi", phone: "+81-90-2345-6789", need: "Stranded Near High-Tide Seawall", people_count: 3, lat: 35.6320, lon: 139.7800, urgency: "critical", status: "Assigned", assigned_team: "Tokyo Fire Hyper Rescue" },
            { request_id: "REQ-TKY-003", citizen: "Hiroshi Tanaka", phone: "+81-90-3456-7890", need: "Wheelchair Evacuation from Zero-Meter Zone", people_count: 2, lat: 35.6740, lon: 139.8190, urgency: "high", status: "Pending", assigned_team: null },
            { request_id: "REQ-TKY-004", citizen: "Aoi Watanabe", phone: "+81-90-4567-8901", need: "Emergency Drinking Water & Dry Rations", people_count: 8, lat: 35.6980, lon: 139.8070, urgency: "medium", status: "Pending", assigned_team: null },
            { request_id: "REQ-TKY-005", citizen: "Ryota Ito", phone: "+81-90-5678-9012", need: "Submersible Pump for Subway Flooding", people_count: 20, lat: 35.6600, lon: 139.7030, urgency: "high", status: "In Progress", assigned_team: "Tokyo Metro Disaster Squad" },
            { request_id: "REQ-TKY-006", citizen: "Emi Nakamura", phone: "+81-90-6789-0123", need: "Baby Formula & Emergency Blankets", people_count: 4, lat: 35.6890, lon: 139.6920, urgency: "medium", status: "Pending", assigned_team: null },
            { request_id: "REQ-TKY-007", citizen: "Daiki Kobayashi", phone: "+81-90-7890-1234", need: "Rescue Inspection on Cracked Stairwell", people_count: 6, lat: 35.6290, lon: 139.7390, urgency: "high", status: "Pending", assigned_team: null }
        ],
        teams: [
            { team_id: "TEAM-TKY-01", name: "Tokyo Fire Hyper Rescue Unit", type: "rescue", status: "active", capacity: 20, lat: 35.6320, lon: 139.7760, lead: "Commander K. Yamashita" },
            { team_id: "TEAM-TKY-02", name: "Metropolitan Fast Water Squadron", type: "boat", status: "available", capacity: 12, lat: 35.6350, lon: 139.7820, lead: "Lt. M. Ogawa" },
            { team_id: "TEAM-TKY-03", name: "Todai Emergency Medical DMAT Squad", type: "medical", status: "active", capacity: 10, lat: 35.7130, lon: 139.7610, lead: "Dr. Kenzo Abe" },
            { team_id: "TEAM-TKY-04", name: "Arakawa Flood Mitigation Unit", type: "rescue", status: "active", capacity: 16, lat: 35.6740, lon: 139.8160, lead: "Eng. S. Hoshino" },
            { team_id: "TEAM-TKY-05", name: "Tokyo Metro Disaster Dewatering Squad", type: "rescue", status: "active", capacity: 14, lat: 35.6590, lon: 139.7010, lead: "Chief T. Endo" },
            { team_id: "TEAM-TKY-06", name: "Coast Guard Marine Patrol Tokyo Bay", type: "boat", status: "available", capacity: 12, lat: 35.6260, lon: 139.7700, lead: "Cmdr. Y. Mori" },
            { team_id: "TEAM-TKY-07", name: "Shinjuku High-Rise Evacuation Wing", type: "evacuation", status: "standby", capacity: 10, lat: 35.6910, lon: 139.6980, lead: "Officer N. Saito" }
        ],
        inventory: [
            { item_id: "INV-TKY-01", name: "High-Discharge Sump Dewatering Turbines", category: "Equipment", total: 50, available: 22, unit: "units", location: "Koto Disaster Depot" },
            { item_id: "INV-TKY-02", name: "Rigid Inflatable Coast Guard Fast Boats", category: "Marine", total: 35, available: 18, unit: "boats", location: "Tokyo Bay Ariake Base" },
            { item_id: "INV-TKY-03", name: "Seismic Disaster Shelter Partition Tents", category: "Shelter", total: 900, available: 580, unit: "tents", location: "Big Sight Logistics Base" },
            { item_id: "INV-TKY-04", name: "Long-Life Emergency Freeze-Dried Meals", category: "Food", total: 25000, available: 17500, unit: "packets", location: "Tachikawa Food Depot" },
            { item_id: "INV-TKY-05", name: "Advanced Seismic Crush-Injury Medical Kits", category: "Medical", total: 600, available: 410, unit: "kits", location: "Todai Medical Store" },
            { item_id: "INV-TKY-06", name: "Automatic Inflatable SOLAS Marine Vests", category: "Safety", total: 3000, available: 2100, unit: "jackets", location: "Shinagawa Port Base" },
            { item_id: "INV-TKY-07", name: "Ultra-Quiet 120kVA Mobile Inverter Power Units", category: "Power", total: 40, available: 24, unit: "generators", location: "Shinjuku Depot" }
        ],
        infrastructure: [
            { asset_id: "INF-TKY-01", name: "Rainbow Bridge Tokyo Bay Expressway", type: "bridge", lat: 35.6366, lon: 139.7631, status: "Open - High Wind Speed Limit", critical_level: "critical" },
            { asset_id: "INF-TKY-02", name: "Metropolitan Area Outer Underground Discharge Channel", type: "drainage", lat: 35.9960, lon: 139.8110, status: "G-CANS All Turbines Active", critical_level: "critical" },
            { asset_id: "INF-TKY-03", name: "Tokyo Big Sight Emergency Heliport", type: "transit", lat: 35.6310, lon: 139.7960, status: "Operational for DMAT Flights", critical_level: "high" },
            { asset_id: "INF-TKY-04", name: "Arakawa Lock Gate & River Surge Wall", type: "dam", lat: 35.6880, lon: 139.8450, status: "Surge Gates Locked Sealed", critical_level: "critical" },
            { asset_id: "INF-TKY-05", name: "TEPCO Shin-Tokyo Thermal Grid Station", type: "power", lat: 35.6450, lon: 139.7900, status: "Fully Operational", critical_level: "critical" },
            { asset_id: "INF-TKY-06", name: "Port of Tokyo International Container Terminal", type: "harbor", lat: 35.6200, lon: 139.7780, status: "Crane Operations Restricted", critical_level: "high" },
            { asset_id: "INF-TKY-07", name: "Shibuya River Underground Storage Reservoir", type: "drainage", lat: 35.6570, lon: 139.7020, status: "Filling at 68% Capacity", critical_level: "critical" }
        ],
        volunteers: [
            { volunteer_id: "VOL-TKY-01", name: "Kenichi Matsui", phone: "+81-90-1111-2222", skills: ["Water Rescue", "Swimmer"], status: "Deployed", zone_id: "ZONE-TKY-BAY" },
            { volunteer_id: "VOL-TKY-02", name: "Sayaka Ono", phone: "+81-90-2222-3333", skills: ["Medical DMAT Nurse"], status: "Deployed", zone_id: "ZONE-TKY-SUMIDA" },
            { volunteer_id: "VOL-TKY-03", name: "Tatsuya Mori", phone: "+81-90-3333-4444", skills: ["Ham Radio License 1"], status: "Available", zone_id: "ZONE-TKY-SHIBUYA" },
            { volunteer_id: "VOL-TKY-04", name: "Rina Fujiwara", phone: "+81-90-4444-5555", skills: ["Shelter Management"], status: "Deployed", zone_id: "ZONE-TKY-KOTO" },
            { volunteer_id: "VOL-TKY-05", name: "Kazuki Shimizu", phone: "+81-90-5555-6666", skills: ["Civil Engineering Inspection"], status: "Deployed", zone_id: "ZONE-TKY-SHINJUKU" },
            { volunteer_id: "VOL-TKY-06", name: "Haruka Inoue", phone: "+81-90-6666-7777", skills: ["Foreign Language Emergency Aid"], status: "Available", zone_id: "ZONE-TKY-ROPPONGI" },
            { volunteer_id: "VOL-TKY-07", name: "Satoshi Endo", phone: "+81-90-7777-8888", skills: ["Thermal Drone Pilot"], status: "Available", zone_id: "ZONE-TKY-SHINAGAWA" }
        ],
        relief_deliveries: [
            { delivery_id: "DEL-TKY-01", destination: "Tokyo Big Sight Evacuation Megacenter", items: "1000 Freeze-Dried Meals, 500 Blankets", status: "Delivered", eta: "Completed", team: "Tokyo Logistics 01" },
            { delivery_id: "DEL-TKY-02", destination: "Yoyogi National Gymnasium Shelter", items: "200 Water Cartons, Medical Box", status: "In Transit", eta: "12 mins", team: "Tokyo Logistics 02" },
            { delivery_id: "DEL-TKY-03", destination: "Ryogoku Kokugikan Disaster Refuge", items: "400 MRE Packs, 1 Mobile Generator", status: "Delivered", eta: "Completed", team: "Tokyo Logistics 01" },
            { delivery_id: "DEL-TKY-04", destination: "Koto Ward Disaster Prevention Center", items: "150 Inflatable Beds, Life Vests", status: "In Transit", eta: "18 mins", team: "Tokyo Logistics 03" },
            { delivery_id: "DEL-TKY-05", destination: "Shinjuku Central Park Disaster Pavilion", items: "80 Tents, Dry Milk Powder", status: "Scheduled", eta: "35 mins", team: "Tokyo Logistics 04" },
            { delivery_id: "DEL-TKY-06", destination: "Komazawa Olympic Park Base Camp", items: "First Aid Kits, 300 Rations", status: "Delivered", eta: "Completed", team: "Tokyo Logistics 02" },
            { delivery_id: "DEL-TKY-07", destination: "Shinagawa Civic Disaster Hall", items: "2 Diesel Generators, Water Packs", status: "In Transit", eta: "15 mins", team: "Tokyo Logistics 05" }
        ],
        alerts: [
            { id: "ALT-TKY-01", severity: "Critical", title: "Seismic Inundation Watch (M5.8 Tokyo Bay Offshore)", area: "Tokyo Bay Coastal & Odaiba", source: "JMA Worldwide Seismic Network", time: "10 mins ago" },
            { id: "ALT-TKY-02", severity: "Critical", title: "Koto Zero-Meter District High-Tide Flood Alert", area: "Koto Basin", source: "Tokyo Disaster Prevention", time: "22 mins ago" },
            { id: "ALT-TKY-03", severity: "Warning", title: "Heavy Downpour (Guerilla Rainstorm 70mm/h) in Shibuya", area: "Shibuya Transit Basin", source: "Open-Meteo Ingestion", time: "38 mins ago" },
            { id: "ALT-TKY-04", severity: "Critical", title: "Wooden Structural Failure in Sumida - DMAT Deployed", area: "Sumida Ward District", source: "Tokyo Fire Dept", time: "55 mins ago" },
            { id: "ALT-TKY-05", severity: "Warning", title: "Rainbow Bridge Wind Advisory: High-Sided Vehicles Restricted", area: "Tokyo Bay Expressway", source: "Metropolitan Police", time: "1 hour ago" },
            { id: "ALT-TKY-06", severity: "Info", title: "7 Major Evacuation Megacenters Activated Across Tokyo", area: "Metropolitan Area", source: "Disaster Operations Command", time: "2 hours ago" },
            { id: "ALT-TKY-07", severity: "Advisory", title: "G-CANS Underground Stormwater Discharge Shaft 3 Running", area: "Saitama-Tokyo Border Drainage", source: "MLIT Water Infrastructure", time: "3 hours ago" }
        ]
    }
};

const initialPendingRegistrations = [
    {
        id: "REG-2026-001",
        full_name: "Dr. Arvind Subramanian",
        username: "subramanian.trauma",
        pass: "Trauma2026!",
        email: "arvind.subramanian@sunrisetrauma.org",
        role: "Hospital Coordinator",
        org_name: "Sunrise Multispecialty Trauma Center (Chennai South)",
        phone: "+91-98409-99881",
        facility_type: "Hospital",
        city: "chennai",
        status: "pending",
        submitted_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
        id: "REG-2026-002",
        full_name: "Capt. Mahendra Shinde",
        username: "shinde.marine",
        pass: "MarineRescue!2",
        email: "m.shinde@maharashtra-sdrf.gov.in",
        role: "Emergency Responder",
        org_name: "Maharashtra SDRF Inshore Rescue Boat Unit 4",
        phone: "+91-98209-88772",
        facility_type: "Response Team",
        city: "mumbai",
        status: "pending",
        submitted_at: new Date(Date.now() - 3600000).toISOString()
    }
];

class DataStore {
    constructor() {
        this.currentCity = "chennai";
        this.data = this.load();
    }

    load() {
        const hasLocalStorage = typeof localStorage !== "undefined";
        if (hasLocalStorage) {
            const raw = localStorage.getItem(DB_KEY);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    // Ensure all collections exist
                    if (parsed.zones && parsed.hospitals && parsed.shelters && parsed.incidents) {
                        if (!parsed.pending_registrations) {
                            parsed.pending_registrations = JSON.parse(JSON.stringify(initialPendingRegistrations));
                        }
                        return parsed;
                    }
                } catch (e) {
                    console.warn("Storage parse error, resetting store", e);
                }
            }
        }
        // Initialize default with Chennai dataset
        const init = JSON.parse(JSON.stringify(CITY_DATA.chennai));
        init.pending_registrations = JSON.parse(JSON.stringify(initialPendingRegistrations));
        init.audit_logs = [
            { log_id: "LOG-001", actor: "System Administrator", action: "PLATFORM_COLD_BOOT", module: "SYSTEM", time: new Date().toLocaleTimeString(), created_at: new Date().toISOString() },
            { log_id: "LOG-002", actor: "Disaster Manager", action: "INGESTION_PIPELINE_SYNC", module: "GATEWAY", time: new Date().toLocaleTimeString(), created_at: new Date().toISOString() },
            { log_id: "LOG-003", actor: "Risk Engine", action: "EVALUATE_ALL_ZONES", module: "RISK_ENGINE", time: new Date().toLocaleTimeString(), created_at: new Date().toISOString() }
        ];
        return init;
    }

    save() {
        if (typeof localStorage !== "undefined") {
            try {
                localStorage.setItem(DB_KEY, JSON.stringify(this.data));
            } catch (e) {
                console.warn("Local storage write error", e);
            }
        }
    }

    switchCity(cityKey) {
        const target = CITY_DATA[cityKey] || CITY_DATA.chennai;
        this.currentCity = cityKey;

        // Keep existing pending_registrations and audit_logs
        const pending = this.data.pending_registrations || initialPendingRegistrations;
        const audit = this.data.audit_logs || [];

        // Clone new city dataset
        const newCityData = JSON.parse(JSON.stringify(target));
        this.data = {
            ...newCityData,
            pending_registrations: pending,
            audit_logs: audit
        };

        this.log("System", `Switched active operational theater to ${target.name}`, "CITY_SWITCH");
        this.save();
        return this.data;
    }

    log(actor, action, module) {
        const entry = {
            log_id: "LOG-" + String(this.data.audit_logs.length + 1).padStart(3, "0"),
            actor: actor,
            action: action,
            module: module,
            time: new Date().toLocaleTimeString(),
            created_at: new Date().toISOString()
        };
        this.data.audit_logs.unshift(entry);
        if (this.data.audit_logs.length > 100) this.data.audit_logs.pop();
        
        if (typeof window !== "undefined" && window.auditChain) {
            window.auditChain.append({ actor: actor, action: action, resource: module });
        }
        this.save();
    }

    addIncident(inc) {
        inc.incident_id = "INC-" + this.currentCity.toUpperCase().slice(0, 3) + "-" + (100 + this.data.incidents.length + 1);
        inc.created_at = new Date().toISOString();
        inc.status = inc.status || "reported";
        this.data.incidents.unshift(inc);
        this.log(inc.reporter_id || "Citizen", `Reported ${inc.type} incident at ${inc.location}`, "INCIDENTS");
        this.save();
        return inc;
    }

    addEmergencyRequest(req) {
        req.request_id = "REQ-" + this.currentCity.toUpperCase().slice(0, 3) + "-" + (200 + this.data.emergency_requests.length + 1);
        req.created_at = new Date().toISOString();
        req.status = "Pending";
        this.data.emergency_requests.unshift(req);
        this.log(req.citizen || "Citizen", `Submitted distress call: ${req.need} (${req.people_count} people)`, "EMERGENCY");
        this.save();
        return req;
    }

    updateShelterOccupancy(id, newOccupancy) {
        const shelter = this.data.shelters.find(s => s.shelter_id === id);
        if (shelter) {
            shelter.occupied = Math.min(shelter.capacity, Math.max(0, newOccupancy));
            shelter.capacity_occupied = shelter.occupied;
            shelter.status = shelter.occupied >= (shelter.capacity * 0.90) ? "Near Capacity" : "Open";
            this.log("Shelter Coordinator", `Updated occupancy for ${shelter.name} to ${shelter.occupied}/${shelter.capacity}`, "SHELTER");
            this.save();
        }
    }

    updateHospitalBeds(id, newAvailableBeds, newICUBeds) {
        const hosp = this.data.hospitals.find(h => h.hospital_id === id);
        if (hosp) {
            if (newAvailableBeds !== undefined) {
                hosp.available = Math.max(0, newAvailableBeds);
                hosp.bed_capacity_available = hosp.available;
            }
            if (newICUBeds !== undefined) {
                hosp.icu = Math.max(0, newICUBeds);
                hosp.icu_beds = hosp.icu;
            }
            this.log("Hospital Coordinator", `Updated ${hosp.name}: ${hosp.available} general beds, ${hosp.icu} ICU beds`, "HOSPITAL");
            this.save();
        }
    }
}

// Global store instance
if (typeof module !== "undefined" && module.exports) {
    module.exports = { DataStore, CITY_DATA };
} else {
    window.store = new DataStore();
}
