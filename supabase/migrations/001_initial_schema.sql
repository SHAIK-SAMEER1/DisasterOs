-- =====================================================================
-- DISASTEROS RELATIONAL SCHEMA MIGRATION: 001_initial_schema.sql
-- Course: BCSE301L Software Engineering
-- Authors: M. Thanushree (24BDS1171), Shaik Sameer (24BDS1154)
-- Date: 2026-10-20
-- =====================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN (
        'Citizen',
        'Emergency Responder',
        'Disaster Manager',
        'Hospital Coordinator',
        'NGO Coordinator',
        'Volunteer',
        'Warehouse Manager',
        'System Administrator'
    )),
    phone TEXT,
    assigned_zone_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ZONES
CREATE TABLE IF NOT EXISTS public.zones (
    zone_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    vulnerability DOUBLE PRECISION NOT NULL CHECK (vulnerability >= 0.0 AND vulnerability <= 1.0),
    radius_km DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    current_r_zone DOUBLE PRECISION DEFAULT 0.0 CHECK (current_r_zone >= 0.0 AND current_r_zone <= 1.0),
    status TEXT DEFAULT 'baseline' CHECK (status IN ('baseline', 'advisory', 'watch', 'warning', 'emergency')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INCIDENTS
CREATE TABLE IF NOT EXISTS public.incidents (
    incident_id TEXT PRIMARY KEY,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_name TEXT NOT NULL DEFAULT 'Citizen',
    type TEXT NOT NULL CHECK (type IN ('flood', 'fire', 'earthquake', 'infrastructure', 'medical', 'other')),
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    zone_id TEXT REFERENCES public.zones(zone_id) ON DELETE SET NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'verified', 'dispatched', 'in_progress', 'resolved', 'closed')),
    assigned_team TEXT DEFAULT 'Pending Dispatch',
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EMERGENCY REQUESTS
CREATE TABLE IF NOT EXISTS public.emergency_requests (
    request_id TEXT PRIMARY KEY,
    incident_id TEXT REFERENCES public.incidents(incident_id) ON DELETE CASCADE,
    citizen_name TEXT NOT NULL,
    location TEXT NOT NULL,
    need TEXT NOT NULL,
    need_type TEXT NOT NULL CHECK (need_type IN ('rescue', 'medical', 'food', 'water', 'shelter', 'evacuation')),
    people_count INTEGER NOT NULL CHECK (people_count > 0),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    priority_score DOUBLE PRECISION NOT NULL DEFAULT 0.5 CHECK (priority_score >= 0.0 AND priority_score <= 1.0),
    assigned_team_id TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Dispatched', 'In Progress', 'Fulfilled', 'Cancelled')),
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SHELTERS
CREATE TABLE IF NOT EXISTS public.shelters (
    shelter_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    zone_id TEXT REFERENCES public.zones(zone_id) ON DELETE SET NULL,
    capacity_total INTEGER NOT NULL CHECK (capacity_total > 0),
    capacity_occupied INTEGER NOT NULL DEFAULT 0 CHECK (capacity_occupied >= 0 AND capacity_occupied <= capacity_total),
    resources JSONB NOT NULL DEFAULT '{"water_l": 0, "food_kits": 0, "medkits": 0, "blankets": 0}'::jsonb,
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Near Capacity', 'Full', 'Closed')),
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HOSPITALS
CREATE TABLE IF NOT EXISTS public.hospitals (
    hospital_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    zone_id TEXT REFERENCES public.zones(zone_id) ON DELETE SET NULL,
    bed_capacity_total INTEGER NOT NULL CHECK (bed_capacity_total > 0),
    bed_capacity_available INTEGER NOT NULL CHECK (bed_capacity_available >= 0 AND bed_capacity_available <= bed_capacity_total),
    icu_beds INTEGER NOT NULL CHECK (icu_beds >= 0),
    trauma_capable BOOLEAN NOT NULL DEFAULT TRUE,
    contact_number TEXT,
    status TEXT NOT NULL DEFAULT 'Operational' CHECK (status IN ('Operational', 'High Load', 'Critical', 'Diverting')),
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TEAMS (RESPONDERS)
CREATE TABLE IF NOT EXISTS public.teams (
    team_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    skill TEXT NOT NULL,
    zone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'deployed', 'off_duty')),
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 10,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VOLUNTEERS
CREATE TABLE IF NOT EXISTS public.volunteers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    skill TEXT NOT NULL,
    zone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Deployed', 'Inactive')),
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. WAREHOUSE INVENTORY
CREATE TABLE IF NOT EXISTS public.inventory (
    item_id TEXT PRIMARY KEY,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Essential', 'Food', 'Medical', 'Relief', 'Equipment')),
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    unit TEXT NOT NULL,
    threshold INTEGER NOT NULL CHECK (threshold >= 0),
    warehouse TEXT NOT NULL,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. RELIEF DELIVERIES
CREATE TABLE IF NOT EXISTS public.relief_deliveries (
    id TEXT PRIMARY KEY,
    destination TEXT NOT NULL,
    items TEXT NOT NULL,
    beneficiaries INTEGER NOT NULL CHECK (beneficiaries >= 0),
    status TEXT NOT NULL DEFAULT 'Preparing' CHECK (status IN ('Preparing', 'In Transit', 'Delivered', 'Cancelled')),
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CRITICAL INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS public.infrastructure (
    asset_id TEXT PRIMARY KEY,
    asset TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Power', 'Transport', 'Water', 'Communication', 'Medical')),
    zone TEXT NOT NULL,
    condition TEXT NOT NULL DEFAULT 'Operational' CHECK (condition IN ('Operational', 'Warning', 'Critical')),
    uptime TEXT NOT NULL DEFAULT '99%',
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TELEMETRY & RISK SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.weather_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id TEXT REFERENCES public.zones(zone_id) ON DELETE CASCADE,
    precipitation_mm DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    trailing_3h_mm DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    temp_c DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    source TEXT NOT NULL DEFAULT 'Open-Meteo',
    observed_at TIMESTAMPTZ NOT NULL,
    ingested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.seismic_events (
    id TEXT PRIMARY KEY,
    place TEXT NOT NULL,
    magnitude DOUBLE PRECISION NOT NULL,
    depth_km DOUBLE PRECISION,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    distance_km DOUBLE PRECISION,
    observed_at TIMESTAMPTZ NOT NULL,
    ingested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.zone_risk_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id TEXT REFERENCES public.zones(zone_id) ON DELETE CASCADE,
    r_zone DOUBLE PRECISION NOT NULL CHECK (r_zone >= 0.0 AND r_zone <= 1.0),
    rain_norm DOUBLE PRECISION NOT NULL,
    seismic_norm DOUBLE PRECISION NOT NULL,
    vulnerability DOUBLE PRECISION NOT NULL,
    shelter_headroom DOUBLE PRECISION NOT NULL,
    severity TEXT NOT NULL,
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    log_id TEXT PRIMARY KEY,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL DEFAULT 'System',
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. INDEXES
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_zone ON public.incidents(zone_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON public.emergency_requests(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_zone_time ON public.zone_risk_snapshots(zone_id, evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);
