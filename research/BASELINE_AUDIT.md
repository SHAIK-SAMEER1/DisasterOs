# BASELINE AUDIT — DISASTEROS SYSTEM INSPECTION
**Date:** 2026-10-20  
**Authors:** M. Thanushree (24BDS1171), Shaik Sameer (24BDS1154)  
**Course:** BCSE301L Software Engineering  
**Branch:** `phase1-foundation`

---

## 1. Physical Workspace Tree
```
C:\Users\SAMEER\.gemini\antigravity\scratch\disasteros\
├── index.html                    (11,170 bytes) - Host DOM, 25 views, modal login, Leaflet link
├── styles.css                    (14,577 bytes) - Tactical dark theme, responsive grid, widgets
├── architecture.md               (2,839 bytes)  - Review 1 frozen architecture specification
├── diagrams.md                   (3,913 bytes)  - Mermaid diagram sources
├── js/
│   ├── app.js                    (63,911 bytes) - UI view renderer (25 views), region switcher, demo chat
│   ├── gateway.js                (5,437 bytes)  - Open-Meteo & USGS HTTP poller with TTL cache
│   ├── map.js                    (7,863 bytes)  - Leaflet.js OpenStreetMap vector map controller
│   ├── risk-engine.js            (4,281 bytes)  - R_zone composite formula & priority scoring logic
│   └── store.js                  (13,660 bytes) - Data access layer using window.localStorage
├── uml/
│   ├── DisasterOS_Component.mdj  (127,417 bytes)- StarUML 4-tier Component Architecture
│   ├── DisasterOS_DFD_Level_0.mdj(36,989 bytes) - StarUML Level 0 DFD Context
│   ├── DisasterOS_DFD_Level_1.mdj(85,062 bytes) - StarUML Level 1 DFD Subsystems
│   ├── DisasterOS_DFD_Level_2.mdj(112,799 bytes)- StarUML Level 2 DFD Processing
│   ├── DisasterOS_Sequence.mdj   (83,826 bytes) - StarUML 17-step End-to-End Sequence
│   └── DisasterOS_UseCase_Professional.mdj (547,249 bytes) - StarUML Comprehensive Use Case
├── research/                     (Audit and baseline artifacts)
├── supabase/migrations/          (Relational SQL migrations)
└── tests/                        (Unit, boundary, and authorization test suites)
```

---

## 2. Dependency & Script Loading Analysis
Current runtime runs directly in any modern browser using native ES6 scripts in this strict execution order:
1. `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` (External Leaflet Library)
2. `js/store.js` (Instantiates global `window.store`)
3. `js/gateway.js` (Instantiates global `window.gateway`)
4. `js/risk-engine.js` (Instantiates global `window.riskEngine`)
5. `js/map.js` (Instantiates global `window.gisMap`)
6. `js/app.js` (Instantiates global `window.app` and hooks `DOMContentLoaded`)

Node.js v24.22.0 and npm 11.19.1 are present in the host environment.

---

## 3. Module-by-Module Feature Status Table

| # | Module Name | UI View Function | Current Data Source | Current State | Audit Finding / Security Risk |
|---|-------------|------------------|---------------------|---------------|-------------------------------|
| 1 | Command Dashboard | `viewDashboard()` | `store.js` + telemetry | Implemented | Client-side aggregation; needs DB query backing |
| 2 | Early Warning | `viewEarlyWarning()` | `gateway.js` + `risk-engine.js` | Implemented | Real Open-Meteo/USGS calls; calculation is local |
| 3 | Dynamic GIS Map | `viewRiskMap()` | `map.js` + Leaflet | Implemented | Live map with dynamic pins; relies on browser render |
| 4 | Decision Support | `viewDecisionSupport()` | `risk-engine.js` | Implemented | Greedy heuristic; needs multi-criteria optimizer |
| 5 | Incidents Lifecycle | `viewIncidents()` | `store.data.incidents` | Implemented | In-memory transitions; localStorage mutable |
| 6 | Help Requests | `viewEmergency()` | `store.data.emergency_requests` | Implemented | Priority scores computed; needs DB atomic lock |
| 7 | Rescue Dispatch | `viewDispatch()` | `store.data.teams` | Implemented | Basic team toggle; hardcoded Team Alpha default |
| 8 | SOP Automation | `viewSOP()` | In-memory procedural array | Partial | Template workflows; execution not persisted in DB |
| 9 | Evacuation Planning | `viewEvacuation()` | `store.data.shelters` | Implemented | Route is static text recommendation |
| 10 | Shelter Management | `viewShelters()` | `store.data.shelters` | Implemented | Occupancy counter works; bounds not DB-enforced |
| 11 | Hospital Coordination | `viewHospitals()` | `store.data.hospitals` | Implemented | Bed counters update in localStorage |
| 12 | Volunteer Management | `viewVolunteers()` | `store.data.volunteers` | Implemented | CRUD works locally; lacks skills matching backend |
| 13 | Warehouse & Inventory | `viewInventory()` | `store.data.inventory` | Implemented | Stock issue works; negative stock not DB-blocked |
| 14 | Relief Distribution | `viewRelief()` | `store.data.relief_deliveries` | Implemented | Static array render; needs dispatch link |
| 15 | Infrastructure | `viewInfrastructure()` | `store.data.infrastructure` | Implemented | Telemetry status render; mock inspection action |
| 16 | AI Reports | `viewReports()` | Template generator | Partial | Rule-synthesized text; no actual LLM/RAG call |
| 17 | AI Assistant | `viewAssistant()` | Keyword string matching | Partial | Keyword-driven fallback; no RAG vector search |
| 18 | Analytics | `viewAnalytics()` | Static HTML CSS bars | Partial | Visual bar chart; not aggregated from DB history |
| 19 | Citizen Incident Report | `viewCitizenReport()` | `navigator.geolocation` | Implemented | Native browser GPS works; persists to localStorage |
| 20 | Notifications Center | `viewNotifications()` | Static alert list | Implemented | Render list; no push WebSocket service |
| 21 | System Architecture | `viewArchitecture()` | Static documentation | Implemented | Informational text & flow diagram |
| 22 | API Sources | `viewSources()` | Static documentation | Implemented | Informational technical contracts |
| 23 | RBAC Matrix | `viewRBAC()` | Static HTML table | Partial | Informational table; no server-side role enforcement |
| 24 | Audit Logs | `viewAudit()` | `store.data.audit_logs` | Implemented | Append-only locally, but localStorage can be edited |
| 25 | System Health | `viewSystem()` | Static meters | Partial | Shows 100% hardcoded metrics |

---

## 4. Key Security & Architectural Gaps Identified
1. **Unenforced Authentication & Role Elevation:** The login dialog sets `currentUser.role` directly from an unauthenticated `<select>` dropdown. A user can claim "System Administrator" with no verification.
2. **Volatile Client-Side Storage:** `localStorage` is used as the single source of truth for shared operational data. Other devices or users cannot see shared state.
3. **No Row-Level Security (RLS):** All data is visible and modifiable by any script execution context in the browser.
4. **Zero-Value Masking Bug in Risk Calculation:** `trailingRain || data.current?.precipitation || 0` and similar truthy operators treat valid `0.0 mm` rainfall as falsy.
5. **Rate Limiting & Serverless Absence:** Telemetry calls execute directly from the client browser, risking client IP rate limits.

---

## 5. Phase 1 Architecture Action Plan
1. **Database Schema:** Create version-controlled PostgreSQL migrations under `supabase/migrations/` defining all 7 canonical entities + profiles, audit logs, and risk snapshots with foreign keys, constraints, and indexes.
2. **Security & RLS Policies:** Define Row-Level Security policies granting fine-grained access (Citizens: write-own/read-public; Staff: operational read/write; Managers: all-access).
3. **Repository Adapter Pattern:** Implement `js/db-adapter.js` providing an asynchronous abstraction that connects to Supabase if configured, while gracefully degrading to structured local storage with strict schema validation when unconfigured.
4. **Auth & Profile Verification:** Implement authentication logic verifying assigned roles from the database rather than trusting client selection.
5. **Automated Test Suite:** Add unit tests for risk formula boundaries, priority queue, schema validation, and RLS policy rules using Node.js test runner.
