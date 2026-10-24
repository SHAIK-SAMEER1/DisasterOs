// Data Access Layer: Local-first reactive storage and multi-city telemetry store.
// Provides 10+ records across all operational collections and city-switchable asset contexts.

const DB_KEY = "disasteros_db_v2"; // Increment key to force-refresh local storage to 10+ records

const initialData = {
    // --- MONITORED ZONES (Chennai & Multi-City) ---
    zones: [
        { zone_id: "ZONE-NORTH", city: "chennai", name: "North Zone (Riverfront)", lat: 13.1100, lon: 80.2200, vulnerability: 0.75, radius_km: 15, elevation_m: 6.2 },
        { zone_id: "ZONE-EAST", city: "chennai", name: "East Coastal Zone", lat: 13.0800, lon: 80.2900, vulnerability: 0.60, radius_km: 12, elevation_m: 4.1 },
        { zone_id: "ZONE-CENTRAL", city: "chennai", name: "Central Urban Zone", lat: 13.0500, lon: 80.2400, vulnerability: 0.40, radius_km: 10, elevation_m: 14.8 },
        { zone_id: "ZONE-WEST", city: "chennai", name: "Western Hills & Industrial", lat: 13.0300, lon: 80.1800, vulnerability: 0.35, radius_km: 15, elevation_m: 28.5 },
        { zone_id: "ZONE-SOUTH", city: "chennai", name: "South Delta Basin", lat: 12.9800, lon: 80.2200, vulnerability: 0.70, radius_km: 14, elevation_m: 5.0 },
        { zone_id: "ZONE-HARBOR", city: "chennai", name: "Port & Industrial Harbor", lat: 13.0950, lon: 80.3000, vulnerability: 0.65, radius_km: 8, elevation_m: 3.2 }
    ],

    // --- INCIDENTS (10 Comprehensive Rows) ---
    incidents: [
        {
            incident_id: "INC-1001",
            reporter_id: "Citizen",
            type: "flood",
            location: "Chennai North (River Road Block A)",
            description: "River embankment breached; 1.5m floodwaters entering ground-floor residential units.",
            lat: 13.1150, lon: 80.2240, zone_id: "ZONE-NORTH", severity: "critical", status: "reported",
            team: "Rescue Team Alpha", created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
            incident_id: "INC-1002",
            reporter_id: "Traffic Police",
            type: "infrastructure",
            location: "Arterial Highway Bridge Sector 12",
            description: "Deep structural shear crack detected across central bridge pillar following tremor.",
            lat: 13.0820, lon: 80.2880, zone_id: "ZONE-EAST", severity: "high", status: "verified",
            team: "Urban Rescue 02", created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
            incident_id: "INC-1003",
            reporter_id: "Forest Service",
            type: "fire",
            location: "Western Industrial Forest Ridge",
            description: "Scrub vegetation fire spreading rapidly along hill crest due to 35 knot gusts.",
            lat: 13.0320, lon: 80.1820, zone_id: "ZONE-WEST", severity: "medium", status: "monitoring",
            team: "Fire Unit 04", created_at: new Date(Date.now() - 10800000).toISOString()
        },
        {
            incident_id: "INC-1004",
            reporter_id: "Citizen",
            type: "medical",
            location: "Central Commercial Bazaar",
            description: "Mass casualty wall collapse in market alleyway during torrential downpour; 6 trapped.",
            lat: 13.0520, lon: 80.2420, zone_id: "ZONE-CENTRAL", severity: "critical", status: "in_progress",
            team: "Medical Team 02", created_at: new Date(Date.now() - 14400000).toISOString()
        },
        {
            incident_id: "INC-1005",
            reporter_id: "Municipal Worker",
            type: "electrical",
            location: "South Delta 33kV Substation",
            description: "High-voltage transformer short circuit following standing water inundation.",
            lat: 12.9850, lon: 80.2150, zone_id: "ZONE-SOUTH", severity: "critical", status: "verified",
            team: "Hazmat Unit 01", created_at: new Date(Date.now() - 18000000).toISOString()
        },
        {
            incident_id: "INC-1006",
            reporter_id: "Port Authority",
            type: "chemical",
            location: "Harbor Container Terminal Berth 4",
            description: "Ammonia refrigeration cylinder valve failure producing toxic vapor plume.",
            lat: 13.0980, lon: 80.3020, zone_id: "ZONE-HARBOR", severity: "critical", status: "reported",
            team: "Tactical Unit Delta", created_at: new Date(Date.now() - 21600000).toISOString()
        },
        {
            incident_id: "INC-1007",
            reporter_id: "Citizen",
            type: "flood",
            location: "Kotturpuram Low-Lying Settlement",
            description: "Drainage canal backflow trapping senior citizens in 3 residences.",
            lat: 13.0230, lon: 80.2310, zone_id: "ZONE-CENTRAL", severity: "high", status: "in_progress",
            team: "Boat Unit Echo", created_at: new Date(Date.now() - 25200000).toISOString()
        },
        {
            incident_id: "INC-1008",
            reporter_id: "Highway Patrol",
            type: "landslide",
            location: "West Bypass Cutting Road Km 14",
            description: "Mud and boulder slip blocking two lanes of western emergency evacuation route.",
            lat: 13.0410, lon: 80.1650, zone_id: "ZONE-WEST", severity: "medium", status: "verified",
            team: "Clearance Crew 03", created_at: new Date(Date.now() - 28800000).toISOString()
        },
        {
            incident_id: "INC-1009",
            reporter_id: "Health Officer",
            type: "medical",
            location: "East Coastal Slum Cluster",
            description: "Acute gastroenteritis outbreak suspected from contaminated groundwater tube-well.",
            lat: 13.0710, lon: 80.2790, zone_id: "ZONE-EAST", severity: "high", status: "monitoring",
            team: "Mobile Health Unit 01", created_at: new Date(Date.now() - 32400000).toISOString()
        },
        {
            incident_id: "INC-1010",
            reporter_id: "Citizen",
            type: "infrastructure",
            location: "North Transit Metro Station Underpass",
            description: "Stormwater siphon pump malfunction causing 1.2m pooling in underground tunnel.",
            lat: 13.1210, lon: 80.2190, zone_id: "ZONE-NORTH", severity: "medium", status: "resolved",
            team: "Municipal Drainage Unit", created_at: new Date(Date.now() - 86400000).toISOString()
        }
    ],

    // --- EMERGENCY REQUESTS (10 Detailed Distress Calls) ---
    emergency_requests: [
        { request_id: "REQ-2001", citizen: "Rahul K.", location: "River Road Block A", need: "Emergency Evacuation Boat", need_type: "rescue", people_count: 8, priority_score: 0.94, assigned_team_id: "TEAM-ALPHA", status: "Dispatched", created_at: new Date(Date.now() - 1800000).toISOString() },
        { request_id: "REQ-2002", citizen: "Anita S.", location: "Central Market Alley", need: "Trauma Medical EMT", need_type: "medical", people_count: 3, priority_score: 0.91, assigned_team_id: "TEAM-CHARLIE", status: "Dispatched", created_at: new Date(Date.now() - 2400000).toISOString() },
        { request_id: "REQ-2003", citizen: "Mohan R.", location: "Harbor Quarter", need: "Toxic Plume Evacuation", need_type: "evacuation", people_count: 14, priority_score: 0.88, assigned_team_id: "TEAM-DELTA", status: "In Progress", created_at: new Date(Date.now() - 3000000).toISOString() },
        { request_id: "REQ-2004", citizen: "Sunita G.", location: "South Delta Colony", need: "Emergency Oxygen Tank", need_type: "medical", people_count: 1, priority_score: 0.85, assigned_team_id: null, status: "Pending", created_at: new Date(Date.now() - 3600000).toISOString() },
        { request_id: "REQ-2005", citizen: "Venkatesh P.", location: "West Hills Village", need: "Drinking Water & Rations", need_type: "logistics", people_count: 22, priority_score: 0.76, assigned_team_id: "TEAM-ECHO", status: "Dispatched", created_at: new Date(Date.now() - 4200000).toISOString() },
        { request_id: "REQ-2006", citizen: "Kavitha M.", location: "North Canal Bank", need: "Elderly Bedridden Rescue", need_type: "rescue", people_count: 2, priority_score: 0.82, assigned_team_id: null, status: "Pending", created_at: new Date(Date.now() - 4800000).toISOString() },
        { request_id: "REQ-2007", citizen: "Ibrahim H.", location: "East Slum Cluster", need: "Chlorine Disinfection & Meds", need_type: "medical", people_count: 45, priority_score: 0.79, assigned_team_id: null, status: "Pending", created_at: new Date(Date.now() - 5400000).toISOString() },
        { request_id: "REQ-2008", citizen: "Deepak N.", location: "Metro Junction", need: "Submerged Vehicle Extraction", need_type: "rescue", people_count: 4, priority_score: 0.73, assigned_team_id: null, status: "Pending", created_at: new Date(Date.now() - 6000000).toISOString() },
        { request_id: "REQ-2009", citizen: "Lakshmi R.", location: "West Quarry Road", need: "Temporary Shelter Tarps", need_type: "shelter", people_count: 11, priority_score: 0.65, assigned_team_id: null, status: "Pending", created_at: new Date(Date.now() - 6600000).toISOString() },
        { request_id: "REQ-2010", citizen: "Father Thomas", location: "St. Marys Community Hall", need: "Baby Milk & Infant Rations", need_type: "logistics", people_count: 18, priority_score: 0.71, assigned_team_id: null, status: "Pending", created_at: new Date(Date.now() - 7200000).toISOString() }
    ],

    // --- SHELTERS (10 Designated Relief Camps) ---
    shelters: [
        { shelter_id: "SHELTER-01", name: "Government High School North", location: "North Zone", lat: 13.1050, lon: 80.2180, zone_id: "ZONE-NORTH", capacity: 600, capacity_total: 600, occupied: 412, capacity_occupied: 412, status: "Open", resources: { water_l: 4500, food_kits: 800, medkits: 120, blankets: 650 } },
        { shelter_id: "SHELTER-02", name: "Community Civic Hall East", location: "East Zone", lat: 13.0780, lon: 80.2850, zone_id: "ZONE-EAST", capacity: 400, capacity_total: 400, occupied: 370, capacity_occupied: 370, status: "Near Capacity", resources: { water_l: 2100, food_kits: 400, medkits: 50, blankets: 300 } },
        { shelter_id: "SHELTER-03", name: "Sports Complex Indoor Stadium", location: "Central Zone", lat: 13.0530, lon: 80.2390, zone_id: "ZONE-CENTRAL", capacity: 1200, capacity_total: 1200, occupied: 520, capacity_occupied: 520, status: "Open", resources: { water_l: 14000, food_kits: 2200, medkits: 350, blankets: 1400 } },
        { shelter_id: "SHELTER-04", name: "St. Joseph College Pavilion", location: "Central Zone", lat: 13.0610, lon: 80.2480, zone_id: "ZONE-CENTRAL", capacity: 500, capacity_total: 500, occupied: 180, capacity_occupied: 180, status: "Open", resources: { water_l: 5000, food_kits: 900, medkits: 140, blankets: 500 } },
        { shelter_id: "SHELTER-05", name: "Industrial Polytech Campus", location: "West Zone", lat: 13.0290, lon: 80.1790, zone_id: "ZONE-WEST", capacity: 700, capacity_total: 700, occupied: 310, capacity_occupied: 310, status: "Open", resources: { water_l: 6500, food_kits: 1100, medkits: 160, blankets: 700 } },
        { shelter_id: "SHELTER-06", name: "South Delta Welfare Center", location: "South Zone", lat: 12.9820, lon: 80.2190, zone_id: "ZONE-SOUTH", capacity: 450, capacity_total: 450, occupied: 410, capacity_occupied: 410, status: "Near Capacity", resources: { water_l: 2800, food_kits: 450, medkits: 80, blankets: 400 } },
        { shelter_id: "SHELTER-07", name: "Port Trust Recreation Club", location: "Harbor Zone", lat: 13.0920, lon: 80.2980, zone_id: "ZONE-HARBOR", capacity: 350, capacity_total: 350, occupied: 95, capacity_occupied: 95, status: "Open", resources: { water_l: 4000, food_kits: 600, medkits: 90, blankets: 350 } },
        { shelter_id: "SHELTER-08", name: "Red Cross Disaster Cyclone Shelter", location: "East Beach", lat: 13.0720, lon: 80.2880, zone_id: "ZONE-EAST", capacity: 800, capacity_total: 800, occupied: 480, capacity_occupied: 480, status: "Open", resources: { water_l: 9000, food_kits: 1400, medkits: 200, blankets: 900 } },
        { shelter_id: "SHELTER-09", name: "Municipal Marriage Hall West", location: "West Zone", lat: 13.0380, lon: 80.1850, zone_id: "ZONE-WEST", capacity: 300, capacity_total: 300, occupied: 110, capacity_occupied: 110, status: "Open", resources: { water_l: 3000, food_kits: 500, medkits: 70, blankets: 300 } },
        { shelter_id: "SHELTER-10", name: "Adyar Cultural Center", location: "South Zone", lat: 12.9910, lon: 80.2310, zone_id: "ZONE-SOUTH", capacity: 550, capacity_total: 550, occupied: 230, capacity_occupied: 230, status: "Open", resources: { water_l: 5200, food_kits: 850, medkits: 130, blankets: 600 } }
    ],

    // --- HOSPITALS & TRAUMA CENTERS (10 Facilities) ---
    hospitals: [
        { hospital_id: "HOSP-01", name: "City General Trauma Hospital", location: "Central Zone", lat: 13.0560, lon: 80.2450, zone_id: "ZONE-CENTRAL", beds: 350, bed_capacity_total: 350, available: 74, bed_capacity_available: 74, icu: 24, icu_beds: 24, trauma_capable: true, contact_number: "+91-44-2530-5001", status: "Operational" },
        { hospital_id: "HOSP-02", name: "North Emergency Care Center", location: "North Zone", lat: 13.1120, lon: 80.2270, zone_id: "ZONE-NORTH", beds: 180, bed_capacity_total: 180, available: 16, bed_capacity_available: 16, icu: 8, icu_beds: 8, trauma_capable: true, contact_number: "+91-44-2590-1122", status: "High Load" },
        { hospital_id: "HOSP-03", name: "District Hospital East Coastal", location: "East Zone", lat: 13.0760, lon: 80.2910, zone_id: "ZONE-EAST", beds: 220, bed_capacity_total: 220, available: 62, bed_capacity_available: 62, icu: 12, icu_beds: 12, trauma_capable: false, contact_number: "+91-44-2820-3344", status: "Operational" },
        { hospital_id: "HOSP-04", name: "Apollo Specialty & Burn Care", location: "Central Zone", lat: 13.0610, lon: 80.2510, zone_id: "ZONE-CENTRAL", beds: 400, bed_capacity_total: 400, available: 95, bed_capacity_available: 95, icu: 35, icu_beds: 35, trauma_capable: true, contact_number: "+91-44-2829-0200", status: "Operational" },
        { hospital_id: "HOSP-05", name: "South Delta Community Health Center", location: "South Zone", lat: 12.9860, lon: 80.2210, zone_id: "ZONE-SOUTH", beds: 120, bed_capacity_total: 120, available: 28, bed_capacity_available: 28, icu: 4, icu_beds: 4, trauma_capable: false, contact_number: "+91-44-2441-5588", status: "Operational" },
        { hospital_id: "HOSP-06", name: "Railway Divisional Hospital North", location: "North Zone", lat: 13.1020, lon: 80.2150, zone_id: "ZONE-NORTH", beds: 200, bed_capacity_total: 200, available: 41, bed_capacity_available: 41, icu: 10, icu_beds: 10, trauma_capable: true, contact_number: "+91-44-2674-1234", status: "Operational" },
        { hospital_id: "HOSP-07", name: "West Industrial Trauma Clinic", location: "West Zone", lat: 13.0350, lon: 80.1780, zone_id: "ZONE-WEST", beds: 110, bed_capacity_total: 110, available: 32, bed_capacity_available: 32, icu: 6, icu_beds: 6, trauma_capable: true, contact_number: "+91-44-2680-9900", status: "Operational" },
        { hospital_id: "HOSP-08", name: "Port Maritime Health Hospital", location: "Harbor Zone", lat: 13.0990, lon: 80.2970, zone_id: "ZONE-HARBOR", beds: 150, bed_capacity_total: 150, available: 50, bed_capacity_available: 50, icu: 8, icu_beds: 8, trauma_capable: false, contact_number: "+91-44-2536-2211", status: "Operational" },
        { hospital_id: "HOSP-09", name: "Institute of Child & Maternal Health", location: "Central Zone", lat: 13.0680, lon: 80.2410, zone_id: "ZONE-CENTRAL", beds: 250, bed_capacity_total: 250, available: 48, bed_capacity_available: 48, icu: 18, icu_beds: 18, trauma_capable: true, contact_number: "+91-44-2819-3355", status: "Operational" },
        { hospital_id: "HOSP-10", name: "ESI Emergency Hospital South", location: "South Zone", lat: 12.9930, lon: 80.2110, zone_id: "ZONE-SOUTH", beds: 160, bed_capacity_total: 160, available: 38, bed_capacity_available: 38, icu: 6, icu_beds: 6, trauma_capable: false, contact_number: "+91-44-2476-4477", status: "Operational" }
    ],

    // --- TACTICAL RESPONSE UNITS (10 Teams) ---
    teams: [
        { team_id: "TEAM-ALPHA", name: "NDRF Flood Inundation Unit Alpha", skill: "rescue", zone: "ZONE-NORTH", status: "deployed", lat: 13.1140, lon: 80.2230 },
        { team_id: "TEAM-BRAVO", name: "Urban Search & Rescue USAR 02", skill: "rescue", zone: "ZONE-EAST", status: "deployed", lat: 13.0810, lon: 80.2870 },
        { team_id: "TEAM-CHARLIE", name: "Central Emergency Medical EMT 01", skill: "medical", zone: "ZONE-CENTRAL", status: "available", lat: 13.0540, lon: 80.2410 },
        { team_id: "TEAM-DELTA", name: "Industrial Hazmat & Vapor Unit 03", skill: "rescue", zone: "ZONE-HARBOR", status: "deployed", lat: 13.0970, lon: 80.3010 },
        { team_id: "TEAM-ECHO", name: "Heavy Relief Distribution Fleet 05", skill: "logistics", zone: "ZONE-WEST", status: "available", lat: 13.0310, lon: 80.1810 },
        { team_id: "TEAM-FOXTROT", name: "Canal Boat Rescue Taskforce 04", skill: "rescue", zone: "ZONE-SOUTH", status: "available", lat: 12.9830, lon: 80.2200 },
        { team_id: "TEAM-GOLF", name: "Paramedic Mobile Intensive Care 03", skill: "medical", zone: "ZONE-NORTH", status: "available", lat: 13.1090, lon: 80.2250 },
        { team_id: "TEAM-HOTEL", name: "Fire & High-Angle Rescue Squad 01", skill: "rescue", zone: "ZONE-CENTRAL", status: "deployed", lat: 13.0510, lon: 80.2460 },
        { team_id: "TEAM-INDIA", name: "Red Cross Water & Sanitation Unit", skill: "logistics", zone: "ZONE-EAST", status: "available", lat: 13.0740, lon: 80.2890 },
        { team_id: "TEAM-JULIET", name: "Civil Defense K9 Search Patrol 02", skill: "rescue", zone: "ZONE-WEST", status: "available", lat: 13.0360, lon: 80.1740 }
    ],

    // --- INVENTORY & LOGISTICS (10 Categories) ---
    inventory: [
        { item: "Potable Water Pouches", item_type: "Drinking Water", category: "Water & Sanitation", quantity: 24000, unit: "litres", threshold: 6000, warehouse: "WH-North Depot" },
        { item: "High-Calorie Ready-to-Eat Meal Kits", item_type: "Food Ration", category: "Food Supply", quantity: 12500, unit: "packs", threshold: 3000, warehouse: "WH-Central Logistics Hub" },
        { item: "Inflatable Rubber Rescue Boats (IRB)", item_type: "Boat", category: "Rescue Equipment", quantity: 34, unit: "boats", threshold: 10, warehouse: "WH-North Depot" },
        { item: "Trauma Bleeding Control & Splint Kits", item_type: "First Aid Kit", category: "Medical", quantity: 650, unit: "kits", threshold: 150, warehouse: "WH-Central Logistics Hub" },
        { item: "Thermal Evacuation Blankets", item_type: "Blanket", category: "Shelter Material", quantity: 4800, unit: "units", threshold: 1000, warehouse: "WH-East Depot" },
        { item: "Chlorine Water Purification Tablets", item_type: "Purification", category: "Water & Sanitation", quantity: 150000, unit: "tablets", threshold: 25000, warehouse: "WH-South Depot" },
        { item: "Diesel Siphon Stormwater Pumps (50HP)", item_type: "Pump", category: "Infrastructure", quantity: 28, unit: "pumps", threshold: 8, warehouse: "WH-North Depot" },
        { item: "Portable Gasoline Generators (5kVA)", item_type: "Power Generator", category: "Power & Utilities", quantity: 42, unit: "generators", threshold: 12, warehouse: "WH-West Depot" },
        { item: "Heavy Heavy-Duty Tarpaulin Sheets", item_type: "Tarpaulin", category: "Shelter Material", quantity: 3200, unit: "sheets", threshold: 800, warehouse: "WH-South Depot" },
        { item: "Medical Grade Oxygen Cylinders (B-Type)", item_type: "Oxygen", category: "Medical", quantity: 180, unit: "cylinders", threshold: 40, warehouse: "WH-Central Logistics Hub" }
    ],

    // --- CRITICAL INFRASTRUCTURE (10 Monitored Assets) ---
    infrastructure: [
        { asset: "North Main 230kV Power Substation", type: "Power", zone: "North", condition: "Warning", uptime: "91.4%" },
        { asset: "Adyar Estuary Arterial Bridge", type: "Transport", zone: "South", condition: "Critical", uptime: "58.2%" },
        { asset: "Kilpauk Central Water Treatment Facility", type: "Water", zone: "Central", condition: "Operational", uptime: "99.8%" },
        { asset: "Telecom Cellular Tower Cluster 14", type: "Communication", zone: "West", condition: "Operational", uptime: "98.1%" },
        { asset: "Ennore Harbor Breakwater Sea Wall", type: "Coastal Defense", zone: "Harbor", condition: "Warning", uptime: "86.5%" },
        { asset: "Central Underground Metro Drainage Siphon", type: "Drainage", zone: "Central", condition: "Operational", uptime: "96.4%" },
        { asset: "East Coast Road Km 18 Overpass", type: "Transport", zone: "East", condition: "Operational", uptime: "99.1%" },
        { asset: "South Delta Sewerage Pump Station 4", type: "Sanitation", zone: "South", condition: "Critical", uptime: "62.0%" },
        { asset: "North Industrial Gas Pipeline Valve 08", type: "Gas Utility", zone: "North", condition: "Operational", uptime: "100.0%" },
        { asset: "West Ridge Microwave Emergency Repeater", type: "Communication", zone: "West", condition: "Operational", uptime: "99.9%" }
    ],

    // --- VOLUNTEERS (10 Field Volunteers) ---
    volunteers: [
        { id: "VOL-01", name: "Arjun Kumar", skill: "First Aid & CPR", zone: "North", status: "Available" },
        { id: "VOL-02", name: "Priya Sharma", skill: "Food & Shelter Intake", zone: "East", status: "Deployed" },
        { id: "VOL-03", name: "Kiran Rao", skill: "Boat Rescue Navigation", zone: "North", status: "Deployed" },
        { id: "VOL-04", name: "Neha Singh", skill: "Trauma Medical Support", zone: "Central", status: "Available" },
        { id: "VOL-05", name: "Ramesh Babu", skill: "Civil Heavy Machinery Driver", zone: "West", status: "Available" },
        { id: "VOL-06", name: "Deepa Natarajan", skill: "Child & Maternal Nursing", zone: "Central", status: "Deployed" },
        { id: "VOL-07", name: "Suresh Pillai", skill: "Amateur HAM Radio Operator", zone: "South", status: "Available" },
        { id: "VOL-08", name: "Farooq Ahmed", skill: "Logistics Inventory Sorting", zone: "Harbor", status: "Deployed" },
        { id: "VOL-09", name: "Ananya Roy", skill: "Translation & Public Information", zone: "Central", status: "Available" },
        { id: "VOL-10", name: "Karthik Subramanian", skill: "Electrical & Generator Mechanic", zone: "South", status: "Available" }
    ],

    // --- RELIEF DELIVERIES (10 Delivery Convoys) ---
    relief_deliveries: [
        { id: "REL-301", destination: "Government High School North", items: "Water + Meal Kits", beneficiaries: 820, status: "Delivered" },
        { id: "REL-302", destination: "Community Civic Hall East", items: "Blankets + Chlorine Pills", beneficiaries: 540, status: "In Transit" },
        { id: "REL-303", destination: "River Road Block A", items: "Trauma Dressing Kits", beneficiaries: 190, status: "Preparing" },
        { id: "REL-304", destination: "Sports Complex Stadium", items: "Water + Tarpaulins", beneficiaries: 1200, status: "Delivered" },
        { id: "REL-305", destination: "Industrial Campus Shelter", items: "Generators + Fuel", beneficiaries: 450, status: "In Transit" },
        { id: "REL-306", destination: "South Delta Welfare Camp", items: "Medical Rations", beneficiaries: 380, status: "Preparing" },
        { id: "REL-307", destination: "Harbor Recreation Shelter", items: "Food Ration Kits", beneficiaries: 210, status: "Delivered" },
        { id: "REL-308", destination: "Red Cross Cyclone Center", items: "Blankets + Water Pouches", beneficiaries: 620, status: "In Transit" },
        { id: "REL-309", destination: "West Ridge Community", items: "Infant Formula Milk", beneficiaries: 140, status: "Delivered" },
        { id: "REL-310", destination: "Adyar Cultural Center", items: "Sanitation & Hygiene Packs", beneficiaries: 350, status: "Preparing" }
    ],

    // --- ALERTS (10 Broadcast Feeds) ---
    alerts: [
        { title: "Severe Trailing Rainfall Threshold Breached (38mm/3h)", source: "Open-Meteo Ingestion", severity: "Critical", area: "North Zone & Riverfront", time: "3 min ago" },
        { title: "Adyar River Estuary Gauge Level Critical", source: "Hydrology Sensor Network", severity: "High", area: "South Delta Basin", time: "8 min ago" },
        { title: "M 4.6 Seismic Tremor Detected at Depth 12km", source: "USGS Global Feed", severity: "High", area: "Bay of Bengal (160km E)", time: "18 min ago" },
        { title: "Toxic Ammonia Plume Vapor Warning Cordon", source: "Port Authority Hazmat", severity: "Critical", area: "Harbor Berth 4", time: "25 min ago" },
        { title: "Arterial Bridge Pillar Structural Inspection Ordered", source: "Highway Patrol", severity: "Medium", area: "Sector 12 Overpass", time: "35 min ago" },
        { title: "Municipal Drainage Pumps Running at Max Capacity", source: "Siphon Telemetry", severity: "Medium", area: "Central Metro Underpass", time: "42 min ago" },
        { title: "Contaminated Well Water Warning Issued", source: "Health Directorate", severity: "High", area: "East Slum Cluster", time: "50 min ago" },
        { title: "Power Grid Partial Isolation Initiated", source: "Electricity Board", severity: "Medium", area: "River Road Substation", time: "1 hour ago" },
        { title: "Emergency Shelter 03 Reaches 500 Capacity", source: "Shelter Coordinator", severity: "Medium", area: "Sports Complex", time: "1.5 hours ago" },
        { title: "High Sea Swell Advisory: 3.5m Breakers", source: "INCOIS Coastal Buoys", severity: "High", area: "Marina to Ennore Coast", time: "2 hours ago" }
    ],

    audit_logs: [
        { actor_name: "System Boot Kernel", action: "Initialized DisasterOS Local-First Operational Store", module: "DATA_LAYER", time: new Date(Date.now() - 36000000).toLocaleTimeString() },
        { actor_name: "Ingestion Gateway", action: "Streamed Live Precipitation & Seismic Feeds from Open-Meteo & USGS", module: "GATEWAY", time: new Date(Date.now() - 30000000).toLocaleTimeString() },
        { actor_name: "Risk Engine", action: "Calculated Deterministic R_zone for 6 Operational Zones", module: "RISK_ENGINE", time: new Date(Date.now() - 25000000).toLocaleTimeString() },
        { actor_name: "Dispatch Optimizer", action: "Computed Capability-Constrained Nearest Team Assignments", module: "OPTIMIZER", time: new Date(Date.now() - 20000000).toLocaleTimeString() }
    ]
};

class DataStore {
    constructor() {
        this.data = initialData;
        this.load();
    }

    load() {
        try {
            const raw = localStorage.getItem(DB_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                // Ensure at least 10 items exist in key arrays; if not, re-seed
                if (parsed && parsed.incidents && parsed.incidents.length >= 10 && parsed.shelters && parsed.shelters.length >= 10) {
                    this.data = parsed;
                    return;
                }
            }
        } catch (e) {
            console.warn("Storage read failed, using initialData", e);
        }
        this.data = initialData;
        this.save();
    }

    save() {
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error("Storage write failed", e);
        }
    }

    log(actor, action, module = "APP") {
        const entry = {
            actor_name: actor,
            action: action,
            module: module,
            time: new Date().toLocaleTimeString(),
            created_at: new Date().toISOString()
        };
        this.data.audit_logs.unshift(entry);
        if (this.data.audit_logs.length > 100) this.data.audit_logs.pop();
        
        // Also feed into cryptographic audit chain if available
        if (typeof window !== "undefined" && window.auditChain) {
            window.auditChain.append({ actor: actor, action: action, resource: module });
        }
        this.save();
    }

    addIncident(inc) {
        inc.incident_id = "INC-" + (1000 + this.data.incidents.length + 1);
        inc.created_at = new Date().toISOString();
        inc.status = inc.status || "reported";
        this.data.incidents.unshift(inc);
        this.log(inc.reporter_id || "Citizen", `Reported ${inc.type} incident at ${inc.location}`, "INCIDENTS");
        this.save();
        return inc;
    }

    addEmergencyRequest(req) {
        req.request_id = "REQ-" + (2000 + this.data.emergency_requests.length + 1);
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
    module.exports = { DataStore, initialData };
} else {
    window.store = new DataStore();
}
