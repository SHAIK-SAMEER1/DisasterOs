-- =====================================================================
-- DISASTEROS ROW-LEVEL SECURITY (RLS) POLICIES: 002_rls_policies.sql
-- Course: BCSE301L Software Engineering
-- Date: 2026-10-20
-- =====================================================================

-- Helper function to extract user role from trusted profiles table
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relief_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seismic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_risk_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES POLICIES
-- Users can view their own profile; Administrators and Managers can view all profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid() OR public.get_current_role() IN ('System Administrator', 'Disaster Manager'));

-- Users can update only their own non-role fields
CREATE POLICY "profiles_update_self" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Only System Administrator can alter roles
CREATE POLICY "profiles_admin_all" ON public.profiles
    FOR ALL TO authenticated
    USING (public.get_current_role() = 'System Administrator')
    WITH CHECK (public.get_current_role() = 'System Administrator');

-- 3. ZONES, WEATHER, SEISMIC, SNAPSHOTS (Public Read, Manager/System Write)
CREATE POLICY "zones_read_all" ON public.zones FOR SELECT USING (true);
CREATE POLICY "zones_write_mgr" ON public.zones FOR ALL TO authenticated
    USING (public.get_current_role() IN ('Disaster Manager', 'System Administrator'))
    WITH CHECK (public.get_current_role() IN ('Disaster Manager', 'System Administrator'));

CREATE POLICY "weather_read_all" ON public.weather_observations FOR SELECT USING (true);
CREATE POLICY "weather_write_system" ON public.weather_observations FOR INSERT TO authenticated
    WITH CHECK (public.get_current_role() IN ('Disaster Manager', 'System Administrator'));

CREATE POLICY "seismic_read_all" ON public.seismic_events FOR SELECT USING (true);
CREATE POLICY "seismic_write_system" ON public.seismic_events FOR INSERT TO authenticated
    WITH CHECK (public.get_current_role() IN ('Disaster Manager', 'System Administrator'));

CREATE POLICY "snapshots_read_all" ON public.zone_risk_snapshots FOR SELECT USING (true);
CREATE POLICY "snapshots_write_system" ON public.zone_risk_snapshots FOR INSERT TO authenticated
    WITH CHECK (public.get_current_role() IN ('Disaster Manager', 'System Administrator'));

-- 4. INCIDENTS POLICIES
-- Anyone authenticated (or anon public) can view reported incidents
CREATE POLICY "incidents_read_all" ON public.incidents FOR SELECT USING (true);

-- Citizens and authenticated users can insert incidents (with their reporter_id)
CREATE POLICY "incidents_insert_citizen" ON public.incidents
    FOR INSERT TO authenticated
    WITH CHECK (reporter_id IS NULL OR reporter_id = auth.uid());

-- Only Responders, Managers, and Admins can update status/assigned_team
CREATE POLICY "incidents_update_staff" ON public.incidents
    FOR UPDATE TO authenticated
    USING (public.get_current_role() IN ('Emergency Responder', 'Disaster Manager', 'System Administrator'))
    WITH CHECK (public.get_current_role() IN ('Emergency Responder', 'Disaster Manager', 'System Administrator'));

-- 5. EMERGENCY REQUESTS POLICIES
-- Public/Authenticated can read requests
CREATE POLICY "requests_read_all" ON public.emergency_requests FOR SELECT USING (true);

-- Users can submit requests
CREATE POLICY "requests_insert_all" ON public.emergency_requests
    FOR INSERT TO authenticated WITH CHECK (true);

-- Only Dispatchers / Responders / Managers can mutate triage status & team assignments
CREATE POLICY "requests_update_dispatch" ON public.emergency_requests
    FOR UPDATE TO authenticated
    USING (public.get_current_role() IN ('Emergency Responder', 'Disaster Manager', 'System Administrator'))
    WITH CHECK (public.get_current_role() IN ('Emergency Responder', 'Disaster Manager', 'System Administrator'));

-- 6. SHELTERS & HOSPITALS POLICIES
CREATE POLICY "shelters_read_all" ON public.shelters FOR SELECT USING (true);
CREATE POLICY "shelters_update_authorized" ON public.shelters
    FOR UPDATE TO authenticated
    USING (public.get_current_role() IN ('Disaster Manager', 'NGO Coordinator', 'System Administrator'))
    WITH CHECK (public.get_current_role() IN ('Disaster Manager', 'NGO Coordinator', 'System Administrator'));

CREATE POLICY "hospitals_read_all" ON public.hospitals FOR SELECT USING (true);
CREATE POLICY "hospitals_update_coord" ON public.hospitals
    FOR UPDATE TO authenticated
    USING (public.get_current_role() IN ('Hospital Coordinator', 'Disaster Manager', 'System Administrator'))
    WITH CHECK (public.get_current_role() IN ('Hospital Coordinator', 'Disaster Manager', 'System Administrator'));

-- 7. AUDIT LOGS (Strict Append-Only: No Updates, No Deletes)
CREATE POLICY "audit_read_authorized" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (public.get_current_role() IN ('Disaster Manager', 'System Administrator'));

CREATE POLICY "audit_insert_system" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- Explicitly block UPDATE and DELETE on audit logs for all users
CREATE POLICY "audit_no_update" ON public.audit_logs FOR UPDATE TO authenticated USING (false);
CREATE POLICY "audit_no_delete" ON public.audit_logs FOR DELETE TO authenticated USING (false);
