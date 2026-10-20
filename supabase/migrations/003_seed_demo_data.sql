-- =====================================================================
-- DISASTEROS IDEMPOTENT SEED DATA: 003_seed_demo_data.sql
-- All sample rows are tagged is_demo = TRUE
-- Running this script multiple times will NOT duplicate records (ON CONFLICT DO UPDATE)
-- =====================================================================

-- 1. ZONES
INSERT INTO public.zones (zone_id, name, lat, lon, vulnerability, radius_km, current_r_zone, status)
VALUES
    ('ZONE-NORTH', 'North Zone (Riverfront)', 13.1100, 80.2200, 0.75, 15.0, 0.82, 'warning'),
    ('ZONE-EAST', 'East Coastal Zone', 13.0800, 80.2900, 0.60, 12.0, 0.58, 'watch'),
    ('ZONE-CENTRAL', 'Central Urban Zone', 13.0500, 80.2400, 0.40, 10.0, 0.32, 'advisory'),
    ('ZONE-WEST', 'Western Hills & Industrial', 13.0300, 80.1800, 0.35, 15.0, 0.20, 'baseline')
ON CONFLICT (zone_id) DO UPDATE SET
    name = EXCLUDED.name,
    lat = EXCLUDED.lat,
    lon = EXCLUDED.lon,
    vulnerability = EXCLUDED.vulnerability,
    updated_at = NOW();

-- 2. INCIDENTS (DEMO)
INSERT INTO public.incidents (incident_id, reporter_name, type, location, description, lat, lon, zone_id, severity, status, assigned_team, is_demo)
VALUES
    ('INC-1001', 'Citizen (Demo)', 'flood', 'Chennai North (River Road)', 'River overflow flooding residential block A and road junction.', 13.1150, 80.2240, 'ZONE-NORTH', 'critical', 'reported', 'Rescue Team Alpha', TRUE),
    ('INC-1002', 'Police (Demo)', 'infrastructure', 'Sector 12', 'Old bridge structural crack observed after minor tremor.', 13.0820, 80.2880, 'ZONE-EAST', 'high', 'verified', 'Urban Rescue 02', TRUE),
    ('INC-1003', 'Forest Dept (Demo)', 'fire', 'Western Hills', 'Vegetation fire spreading along ridge line.', 13.0320, 80.1820, 'ZONE-WEST', 'medium', 'in_progress', 'Fire Unit 04', TRUE),
    ('INC-1004', 'Citizen (Demo)', 'medical', 'Central Market', 'Multiple people injured due to wall collapse during rains.', 13.0520, 80.2420, 'ZONE-CENTRAL', 'high', 'resolved', 'Medical Team 02', TRUE)
ON CONFLICT (incident_id) DO UPDATE SET
    severity = EXCLUDED.severity,
    status = EXCLUDED.status,
    assigned_team = EXCLUDED.assigned_team,
    updated_at = NOW();

-- 3. EMERGENCY REQUESTS (DEMO)
INSERT INTO public.emergency_requests (request_id, incident_id, citizen_name, location, need, need_type, people_count, priority, priority_score, assigned_team_id, status, lat, lon, is_demo)
VALUES
    ('REQ-2001', 'INC-1001', 'Rahul K. (Demo)', 'North Zone', 'Medical assistance', 'medical', 3, 'Critical', 0.92, 'TEAM-ALPHA', 'Dispatched', 13.1150, 80.2240, TRUE),
    ('REQ-2002', 'INC-1001', 'Anita S. (Demo)', 'East Zone', 'Food & water', 'food', 5, 'High', 0.74, NULL, 'Pending', 13.0800, 80.2850, TRUE),
    ('REQ-2003', 'INC-1001', 'Mohan R. (Demo)', 'River Road', 'Evacuation', 'evacuation', 8, 'Critical', 0.88, 'TEAM-BRAVO', 'In Progress', 13.1180, 80.2210, TRUE)
ON CONFLICT (request_id) DO UPDATE SET
    status = EXCLUDED.status,
    priority_score = EXCLUDED.priority_score,
    assigned_team_id = EXCLUDED.assigned_team_id,
    updated_at = NOW();

-- 4. SHELTERS (DEMO)
INSERT INTO public.shelters (shelter_id, name, location, lat, lon, zone_id, capacity_total, capacity_occupied, resources, status, is_demo)
VALUES
    ('SHELTER-01', 'Government High School (Demo)', 'North Zone', 13.1050, 80.2180, 'ZONE-NORTH', 500, 382, '{"water_l": 4500, "food_kits": 800, "medkits": 120, "blankets": 650}'::jsonb, 'Open', TRUE),
    ('SHELTER-02', 'Community Civic Hall (Demo)', 'East Zone', 13.0780, 80.2850, 'ZONE-EAST', 300, 275, '{"water_l": 2100, "food_kits": 400, "medkits": 50, "blankets": 300}'::jsonb, 'Near Capacity', TRUE),
    ('SHELTER-03', 'Sports Complex Relief Camp (Demo)', 'Central Zone', 13.0530, 80.2390, 'ZONE-CENTRAL', 800, 410, '{"water_l": 9500, "food_kits": 1500, "medkits": 250, "blankets": 1100}'::jsonb, 'Open', TRUE)
ON CONFLICT (shelter_id) DO UPDATE SET
    capacity_occupied = EXCLUDED.capacity_occupied,
    resources = EXCLUDED.resources,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 5. HOSPITALS (DEMO)
INSERT INTO public.hospitals (hospital_id, name, location, lat, lon, zone_id, bed_capacity_total, bed_capacity_available, icu_beds, trauma_capable, contact_number, status, is_demo)
VALUES
    ('HOSP-01', 'City General Hospital (Demo)', 'Central Zone', 13.0560, 80.2450, 'ZONE-CENTRAL', 250, 62, 12, TRUE, '+91-44-2530-5000', 'Operational', TRUE),
    ('HOSP-02', 'Emergency Care Centre (Demo)', 'North Zone', 13.1120, 80.2270, 'ZONE-NORTH', 150, 18, 4, TRUE, '+91-44-2590-1122', 'High Load', TRUE),
    ('HOSP-03', 'District Hospital East (Demo)', 'East Zone', 13.0760, 80.2910, 'ZONE-EAST', 200, 83, 9, FALSE, '+91-44-2820-3344', 'Operational', TRUE)
ON CONFLICT (hospital_id) DO UPDATE SET
    bed_capacity_available = EXCLUDED.bed_capacity_available,
    status = EXCLUDED.status,
    updated_at = NOW();

-- 6. TEAMS (DEMO)
INSERT INTO public.teams (team_id, name, skill, zone, status, lat, lon, capacity, is_demo)
VALUES
    ('TEAM-ALPHA', 'Rescue Team Alpha (Demo)', 'Search & Rescue', 'North Zone', 'deployed', 13.1140, 80.2230, 10, TRUE),
    ('TEAM-BRAVO', 'Urban Rescue 02 (Demo)', 'Building Rescue', 'Sector 12', 'deployed', 13.0810, 80.2870, 8, TRUE),
    ('TEAM-CHARLIE', 'Medical Team 02 (Demo)', 'Medical Support', 'Central Zone', 'available', 13.0540, 80.2410, 12, TRUE),
    ('TEAM-DELTA', 'Fire Unit 04 (Demo)', 'Fire Response', 'Western Hills', 'deployed', 13.0310, 80.1810, 6, TRUE)
ON CONFLICT (team_id) DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = NOW();

-- 7. VOLUNTEERS (DEMO)
INSERT INTO public.volunteers (id, name, skill, zone, status, is_demo)
VALUES
    ('VOL-01', 'Arjun Kumar (Demo)', 'First Aid', 'North', 'Available', TRUE),
    ('VOL-02', 'Priya Sharma (Demo)', 'Food Distribution', 'East', 'Deployed', TRUE),
    ('VOL-03', 'Kiran Rao (Demo)', 'Search & Rescue', 'Central', 'Available', TRUE),
    ('VOL-04', 'Neha Singh (Demo)', 'Medical Support', 'West', 'Deployed', TRUE)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status;

-- 8. INVENTORY (DEMO)
INSERT INTO public.inventory (item_id, item_name, category, quantity, unit, threshold, warehouse, is_demo)
VALUES
    ('INV-01', 'Drinking Water', 'Essential', 8200, 'litres', 3000, 'WH-North', TRUE),
    ('INV-02', 'Rice & Grains', 'Food', 4200, 'kg', 1500, 'WH-Central', TRUE),
    ('INV-03', 'First Aid Kits', 'Medical', 240, 'kits', 100, 'WH-East', TRUE),
    ('INV-04', 'Thermal Blankets', 'Relief', 860, 'units', 300, 'WH-North', TRUE)
ON CONFLICT (item_id) DO UPDATE SET
    quantity = EXCLUDED.quantity,
    updated_at = NOW();

-- 9. AUDIT LOG INITIAL SEED
INSERT INTO public.audit_logs (log_id, actor_name, action, module, created_at)
VALUES
    ('LOG-INIT-001', 'System (Seed)', 'DisasterOS Relational Schema and Demo Seed Applied', 'SYSTEM', NOW())
ON CONFLICT (log_id) DO NOTHING;
