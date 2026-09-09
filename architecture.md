# DisasterOS — Frozen Architecture Specification (v1.0, Review 1)

**Team:** M Thanushree (24BDS1171), Shaik Sameer (24BDS1154)  
**Course:** BCSE301L — Software Engineering  
**Status:** Design-freeze for Review 1. Source of truth for implementation.

---

## 1. Tech Stack & System Boundaries

| Layer | Choice | Notes |
|---|---|---|
| Client | HTML5 / ES6+ Modular JavaScript / CSS3 | Fast, lightweight, zero compilation required |
| Mapping / GIS | Leaflet.js + OpenStreetMap tile layer | 100% free, zero API key required |
| State & Cache | LocalStorage / IndexedDB persistence | Local-first; queues writes and preserves state |
| Backend (Target) | Node.js / Express (or serverless functions) | Direct target for Review 2 API endpoints |
| Production DB (Target) | Supabase (PostgreSQL) | Schemas map 1:1 to relational tables |

### External Live Data Feeds (Free Tier, No Key Required)
- **Rainfall & Weather**: Open-Meteo API (`https://api.open-meteo.com/v1/forecast`)
- **Seismic Activity**: USGS Earthquake Hazards GeoJSON (`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson`)
- **Reverse Geocoding**: OpenStreetMap Nominatim (`https://nominatim.openstreetmap.org/reverse`)
- **Client Geolocation**: Browser Native `navigator.geolocation` API

---

## 2. Core Entities & Schemas

1. **Incidents**: `incident_id`, `reporter_id`, `type`, `description`, `lat`, `lon`, `zone_id`, `severity`, `status`, `image_url`, `created_at`
2. **EmergencyRequests**: `request_id`, `incident_id`, `requester_id`, `need_type`, `people_count`, `lat`, `lon`, `priority_score`, `assigned_team_id`, `status`, `created_at`
3. **Shelters**: `shelter_id`, `name`, `lat`, `lon`, `capacity_total`, `capacity_occupied`, `resources`, `status`
4. **Hospitals**: `hospital_id`, `name`, `lat`, `lon`, `bed_capacity_total`, `bed_capacity_available`, `icu_beds`, `status`
5. **Inventory**: `item_id`, `warehouse_id`, `item_type`, `quantity`, `unit`, `threshold`
6. **AlertRules**: `rule_id`, `zone_id`, `metric`, `threshold`, `comparison`, `severity_on_trigger`, `active`
7. **AuditLogs**: `log_id`, `actor_name`, `action`, `module`, `created_at`

---

## 3. Mathematical Risk Engine Formulation

For any monitored zone $z$:
$$R_{zone}(z) = 0.35 \cdot \text{Rainfall}_{norm}(z) + 0.30 \cdot \text{Seismic}_{norm}(z) + 0.25 \cdot \text{Vulnerability}(z) - 0.20 \cdot \text{ShelterCapacityRatio}(z)$$

- $\text{Rainfall}_{norm} = \min(\text{Precipitation}_{mm} / 50, 1.0)$
- $\text{Seismic}_{norm} = \min(\text{MaxMagnitude}_{radius} / 7.0, 1.0)$
- $\text{ShelterCapacityRatio} = 1.0 - (\sum \text{Occupied} / \sum \text{Total})$

### Threshold Severity Mapping
- $< 0.25$: Baseline (Safe / Normal)
- $0.25 - 0.45$: Advisory (Green / Blue)
- $0.45 - 0.65$: Watch (Yellow)
- $0.65 - 0.85$: Warning (Orange)
- $\ge 0.85$: Emergency (Red)
