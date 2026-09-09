import json
import uuid

def gen_id():
    return "AAAAAAF" + uuid.uuid4().hex[:17]

def build_full_staruml():
    proj_id = gen_id()
    model_id = gen_id()

    # =========================================================================
    # 1. FULL-SCOPE UML USE CASE MODEL & DIAGRAM (Full implementation Review 1-3)
    # =========================================================================
    uc_diag_id = gen_id()

    # Actors: 8 Human Roles + 3 External Systems
    actors = [
        # Left Side Actors
        {"name": "Citizen", "desc": "Public user: incident reporting, emergency help requests, and evacuation route view", "x": 60, "y": 140},
        {"name": "Emergency Responder", "desc": "Tactical rescue team: dispatch acceptance and incident lifecycle status updates", "x": 60, "y": 320},
        {"name": "Volunteer", "desc": "Community support: first aid, relief distribution, and field assistance", "x": 60, "y": 480},
        {"name": "Warehouse Manager", "desc": "Logistics manager: stock tracking, threshold monitoring, and relief issuing", "x": 60, "y": 640},

        # Right Side Actors
        {"name": "Disaster Manager", "desc": "Incident Commander: risk assessment, SOP triggers, evacuation orders, and AI reports", "x": 1020, "y": 120},
        {"name": "Hospital Coordinator", "desc": "Medical officer: bed availability, ICU capacity, and mass casualty triage", "x": 1020, "y": 280},
        {"name": "NGO Coordinator", "desc": "Non-governmental liaison: relief coordination, shelter support, and volunteer aid", "x": 1020, "y": 440},
        {"name": "System Administrator", "desc": "IT governance: RBAC permissions, audit log review, and platform health", "x": 1020, "y": 600},

        # Bottom System Actors
        {"name": "External Weather & Seismic APIs", "desc": "Open-Meteo & USGS live telemetry streams", "x": 300, "y": 950},
        {"name": "AI LLM Services", "desc": "Automated report synthesis & emergency assistant intelligence", "x": 580, "y": 950},
        {"name": "SMS / Notification Gateway", "desc": "Public siren broadcast and responder alerting", "x": 840, "y": 950}
    ]

    for a in actors:
        a["id"] = gen_id()
        a["view_id"] = gen_id()
        a["name_view_id"] = gen_id()

    # Full Project Scope Use Cases (24 Functional Use Cases covering Reviews 1, 2, and 3)
    use_cases = [
        # Citizen Group (Col 1)
        {"name": "Report Incident with Native GPS", "x": 240, "y": 100, "w": 250, "h": 50, "actors": ["Citizen"]},
        {"name": "Request Emergency Help (Rescue/Med)", "x": 240, "y": 170, "w": 250, "h": 50, "actors": ["Citizen"]},
        {"name": "View Live GIS Risk Map & Shelters", "x": 240, "y": 240, "w": 250, "h": 50, "actors": ["Citizen", "Emergency Responder", "Disaster Manager", "NGO Coordinator"]},
        {"name": "Receive Early Warning Broadcasts", "x": 240, "y": 310, "w": 250, "h": 50, "actors": ["Citizen", "Emergency Responder", "SMS / Notification Gateway"]},
        {"name": "Query AI Emergency Assistant", "x": 240, "y": 380, "w": 250, "h": 50, "actors": ["Citizen", "Disaster Manager", "AI LLM Services"]},
        {"name": "Access Turn-by-Turn Evacuation Route", "x": 240, "y": 450, "w": 250, "h": 50, "actors": ["Citizen", "Emergency Responder"]},

        # Responder & Field Operations (Col 1 lower)
        {"name": "Accept & Acknowledge Rescue Dispatch", "x": 240, "y": 530, "w": 250, "h": 50, "actors": ["Emergency Responder"]},
        {"name": "Update Incident Lifecycle State", "x": 240, "y": 600, "w": 250, "h": 50, "actors": ["Emergency Responder", "Disaster Manager"]},
        {"name": "Transmit Field Casualty Triage Data", "x": 240, "y": 670, "w": 250, "h": 50, "actors": ["Emergency Responder", "Hospital Coordinator"]},

        # Logistics & Volunteers (Col 1 bottom)
        {"name": "Register Volunteer Skills & Zones", "x": 240, "y": 750, "w": 250, "h": 50, "actors": ["Volunteer", "NGO Coordinator"]},
        {"name": "Track Warehouse Stock & Ration Issuance", "x": 240, "y": 820, "w": 250, "h": 50, "actors": ["Warehouse Manager", "Disaster Manager"]},

        # Command & Intelligence Subsystem (Col 2 upper)
        {"name": "Ingest & Normalize Open-Meteo & USGS", "x": 640, "y": 100, "w": 260, "h": 50, "actors": ["External Weather & Seismic APIs", "Disaster Manager"]},
        {"name": "Compute Composite R_zone Risk Index", "x": 640, "y": 170, "w": 260, "h": 50, "actors": ["Disaster Manager", "External Weather & Seismic APIs"]},
        {"name": "Configure Alert Rules & Thresholds", "x": 640, "y": 240, "w": 260, "h": 50, "actors": ["Disaster Manager"]},
        {"name": "Execute Automated SOP Workflows", "x": 640, "y": 310, "w": 260, "h": 50, "actors": ["Disaster Manager"]},
        {"name": "Run Heuristic Dispatch Priority Queue", "x": 640, "y": 380, "w": 260, "h": 50, "actors": ["Disaster Manager"]},
        {"name": "Authorize & Broadcast Evacuation Orders", "x": 640, "y": 450, "w": 260, "h": 50, "actors": ["Disaster Manager", "SMS / Notification Gateway"]},
        {"name": "Generate AI Situation Reports", "x": 640, "y": 520, "w": 260, "h": 50, "actors": ["Disaster Manager", "AI LLM Services"]},
        {"name": "Analyze Operational Response Trends", "x": 640, "y": 590, "w": 260, "h": 50, "actors": ["Disaster Manager", "NGO Coordinator"]},

        # Medical & Administration (Col 2 lower)
        {"name": "Update Hospital Bed & ICU Capacity", "x": 640, "y": 670, "w": 260, "h": 50, "actors": ["Hospital Coordinator"]},
        {"name": "Coordinate Emergency Patient Transfers", "x": 640, "y": 740, "w": 260, "h": 50, "actors": ["Hospital Coordinator", "Emergency Responder"]},
        {"name": "Manage Shelter Headroom & Resources", "x": 640, "y": 810, "w": 260, "h": 50, "actors": ["Disaster Manager", "NGO Coordinator"]},
        {"name": "Manage Role-Based Access Matrix (RBAC)", "x": 640, "y": 880, "w": 260, "h": 50, "actors": ["System Administrator"]},
        {"name": "Inspect Chronological Audit Trails", "x": 640, "y": 950, "w": 260, "h": 50, "actors": ["System Administrator", "Disaster Manager"]}
    ]

    for uc in use_cases:
        uc["id"] = gen_id()
        uc["view_id"] = gen_id()
        uc["name_view_id"] = gen_id()

    # Build associations
    uc_associations = []
    for uc in use_cases:
        for a_name in uc["actors"]:
            act = next((a for a in actors if a["name"] == a_name), None)
            if act:
                uc_associations.append({
                    "id": gen_id(),
                    "view_id": gen_id(),
                    "actor": act,
                    "use_case": uc
                })

    # =========================================================================
    # 2. FULL-SCOPE UML COMPONENT MODEL & DIAGRAM (All Production Modules)
    # =========================================================================
    comp_diag_id = gen_id()

    components = [
        # Presentation Tier
        {"name": "Citizen Mobile / Web Portal", "stereotype": "SPA UI", "x": 40, "y": 80, "w": 240, "h": 90, "desc": "Public portal for GPS incident intake, relief requests, and evacuation route viewing"},
        {"name": "Command Center Dashboard", "stereotype": "SPA UI", "x": 40, "y": 200, "w": 240, "h": 90, "desc": "Multi-role operations dashboard for Managers, Responders, and Hospital Staff"},
        {"name": "Leaflet GIS Map Engine", "stereotype": "Visual Component", "x": 40, "y": 320, "w": 240, "h": 90, "desc": "Interactive OpenStreetMap vector renderer, risk zones, and live USGS epicenters"},
        {"name": "AI Assistant Chatbot Widget", "stereotype": "Conversational UI", "x": 40, "y": 440, "w": 240, "h": 90, "desc": "Natural language query interface for situational operational queries"},

        # Ingestion & Gateways Tier
        {"name": "Ingestion Gateway (gateway.js)", "stereotype": "Gateway", "x": 350, "y": 80, "w": 260, "h": 100, "desc": "Telemetry poller, rate limiter, and TTL cache (5-min weather, 1-min seismic)"},
        {"name": "External Weather API (Open-Meteo)", "stereotype": "REST API", "x": 680, "y": 40, "w": 250, "h": 70, "desc": "Free unauthenticated global rainfall and precipitation probability"},
        {"name": "USGS Earthquake Hazards Feed", "stereotype": "GeoJSON Stream", "x": 680, "y": 130, "w": 250, "h": 70, "desc": "Worldwide live earthquake feed with magnitude, depth, and epicenters"},
        {"name": "Notification & SMS Broker", "stereotype": "Broadcast Service", "x": 680, "y": 220, "w": 250, "h": 70, "desc": "Multi-channel public siren and responder dispatch alert dispatcher"},

        # Intelligence & Business Logic Tier
        {"name": "Risk Calculation Engine (risk-engine.js)", "stereotype": "Analytical Engine", "x": 350, "y": 230, "w": 260, "h": 100, "desc": "Computes composite R_zone formula and threshold alerts"},
        {"name": "Decision Support & SOP Engine", "stereotype": "Decision Engine", "x": 350, "y": 360, "w": 260, "h": 100, "desc": "Automated standard operating procedure runner and heuristic priority triage queue"},
        {"name": "AI Situation Report Generator", "stereotype": "LLM Service", "x": 350, "y": 490, "w": 260, "h": 100, "desc": "Automated synthesis of incident streams, weather forecasts, and shelter headroom"},

        # Data Access & Operations Tier
        {"name": "App Orchestrator (app.js)", "stereotype": "Controller", "x": 40, "y": 620, "w": 240, "h": 100, "desc": "Coordinates state transitions across all 25 system views and role contexts"},
        {"name": "Data Access Layer (store.js)", "stereotype": "DAL", "x": 350, "y": 620, "w": 260, "h": 100, "desc": "Implements 7 canonical schemas, local persistence, and immutable audit logging"},
        {"name": "IndexedDB / LocalStorage Provider", "stereotype": "Local Cache", "x": 680, "y": 590, "w": 250, "h": 70, "desc": "Client-side offline-first persistence engine"},
        {"name": "Cloud PostgreSQL / Supabase", "stereotype": "Target Database", "x": 680, "y": 680, "w": 250, "h": 70, "desc": "Production relational database target with identical schemas"}
    ]

    for c in components:
        c["id"] = gen_id()
        c["view_id"] = gen_id()
        c["name_view_id"] = gen_id()

    comp_dependencies = [
        ("Citizen Mobile / Web Portal", "Ingestion Gateway (gateway.js)"),
        ("Citizen Mobile / Web Portal", "App Orchestrator (app.js)"),
        ("Command Center Dashboard", "App Orchestrator (app.js)"),
        ("Command Center Dashboard", "Leaflet GIS Map Engine"),
        ("AI Assistant Chatbot Widget", "App Orchestrator (app.js)"),
        ("Ingestion Gateway (gateway.js)", "External Weather API (Open-Meteo)"),
        ("Ingestion Gateway (gateway.js)", "USGS Earthquake Hazards Feed"),
        ("Risk Calculation Engine (risk-engine.js)", "Ingestion Gateway (gateway.js)"),
        ("Decision Support & SOP Engine", "Risk Calculation Engine (risk-engine.js)"),
        ("Decision Support & SOP Engine", "Notification & SMS Broker"),
        ("AI Situation Report Generator", "Data Access Layer (store.js)"),
        ("Leaflet GIS Map Engine", "Data Access Layer (store.js)"),
        ("App Orchestrator (app.js)", "Data Access Layer (store.js)"),
        ("App Orchestrator (app.js)", "Decision Support & SOP Engine"),
        ("Data Access Layer (store.js)", "IndexedDB / LocalStorage Provider"),
        ("Data Access Layer (store.js)", "Cloud PostgreSQL / Supabase")
    ]

    comp_dep_models = []
    for src_name, dst_name in comp_dependencies:
        src = next((c for c in components if c["name"] == src_name), None)
        dst = next((c for c in components if c["name"] == dst_name), None)
        if src and dst:
            comp_dep_models.append({
                "id": gen_id(),
                "view_id": gen_id(),
                "src": src,
                "dst": dst
            })

    # =========================================================================
    # 3. FULL-SCOPE UML SEQUENCE MODEL & DIAGRAM (Full System Flow)
    # =========================================================================
    collab_id = gen_id()
    interaction_id = gen_id()
    seq_diag_id = gen_id()

    lifelines = [
        {"name": "c: Citizen", "x": 40, "w": 90},
        {"name": ": CitizenUI", "x": 160, "w": 100},
        {"name": ": Gateway", "x": 290, "w": 100},
        {"name": ": RiskEngine", "x": 420, "w": 110},
        {"name": ": DecisionSOP", "x": 560, "w": 110},
        {"name": ": DAL_Store", "x": 700, "w": 110},
        {"name": "r: Responder", "x": 840, "w": 100},
        {"name": "h: HospitalCoord", "x": 970, "w": 110},
        {"name": "s: ShelterMgr", "x": 1110, "w": 100},
        {"name": ": AIReporter", "x": 1240, "w": 100}
    ]

    for ll in lifelines:
        ll["id"] = gen_id()
        ll["view_id"] = gen_id()
        ll["name_view_id"] = gen_id()
        ll["line_view_id"] = gen_id()

    messages = [
        ("c: Citizen", ": CitizenUI", "1. reportIncident(flood, photos)", 100),
        (": CitizenUI", ": CitizenUI", "2. detectGPS(navigator.geolocation)", 135),
        (": CitizenUI", ": Gateway", "3. POST /incidents(lat, lon, details)", 170),
        (": Gateway", ": DAL_Store", "4. insertIncident(status='reported')", 205),
        (": Gateway", ": Gateway", "5. fetchTelemetry(Open-Meteo & USGS)", 240),
        (": Gateway", ": RiskEngine", "6. evaluateZone(zone_id, rain, seismic)", 275),
        (": RiskEngine", ": RiskEngine", "7. calculate_R_zone(formula)", 310),
        (": RiskEngine", ": DAL_Store", "8. updateZoneRisk(R_zone=0.82)", 345),
        (": RiskEngine", ": DecisionSOP", "9. triggerSOP(level='CRITICAL')", 380),
        (": DecisionSOP", ": DAL_Store", "10. createEmergencyRequest(autoDerived)", 415),
        (": DecisionSOP", ": DecisionSOP", "11. prioritizeDispatchQueue()", 450),
        (": DecisionSOP", "r: Responder", "12. dispatchTacticalUnit(TeamAlpha, route)", 485),
        ("r: Responder", ": DAL_Store", "13. updateStatus(en_route, eta='8m')", 520),
        (": DecisionSOP", "h: HospitalCoord", "14. reserveTraumaBeds(count=5)", 555),
        ("h: HospitalCoord", ": DAL_Store", "15. updateAvailableBeds(delta=-5)", 590),
        (": DecisionSOP", "s: ShelterMgr", "16. verifyHeadroom(evacuationQueue)", 625),
        ("s: ShelterMgr", ": DAL_Store", "17. registerAdmissions(capacityUpdate)", 660),
        (": DecisionSOP", ": AIReporter", "18. generateSituationSummary()", 695),
        (": AIReporter", ": DAL_Store", "19. logAudit('SITUATION_REPORT_READY')", 730),
        (": DAL_Store", ": CitizenUI", "20. pushLiveUpdates(teamEnRoute, safeShelter)", 765),
        (": CitizenUI", "c: Citizen", "21. displayEmergencyTrackingHUD()", 800)
    ]

    seq_msg_models = []
    for src_name, dst_name, text, y_pos in messages:
        src = next(ll for ll in lifelines if ll["name"] == src_name)
        dst = next(ll for ll in lifelines if ll["name"] == dst_name)
        seq_msg_models.append({
            "id": gen_id(),
            "view_id": gen_id(),
            "label_view_id": gen_id(),
            "src": src,
            "dst": dst,
            "text": text,
            "y": y_pos
        })

    # =========================================================================
    # ASSEMBLE JSON PROJECT
    # =========================================================================
    project = {
        "_type": "Project",
        "_id": proj_id,
        "name": "DisasterOS_Full_Implementation_Architecture",
        "ownedElements": [
            {
                "_type": "UMLModel",
                "_id": model_id,
                "_parent": { "$ref": proj_id },
                "name": "DisasterOS Engineering Models (Full System)",
                "ownedElements": [
                    # 1. Use Case Diagram
                    {
                        "_type": "UMLUseCaseDiagram",
                        "_id": uc_diag_id,
                        "_parent": { "$ref": model_id },
                        "name": "DisasterOS - Complete UML Use Case Diagram (Review 1-3)",
                        "ownedViews": [
                            {
                                "_type": "UMLTextView",
                                "_id": gen_id(),
                                "_parent": { "$ref": uc_diag_id },
                                "font": "Arial;15;1",
                                "left": 210,
                                "top": 50,
                                "width": 740,
                                "height": 970,
                                "text": "System Boundary: DisasterOS Full Enterprise Command Platform"
                            }
                        ]
                    },
                    # 2. Component Diagram
                    {
                        "_type": "UMLComponentDiagram",
                        "_id": comp_diag_id,
                        "_parent": { "$ref": model_id },
                        "name": "DisasterOS - Complete UML Component Diagram (Full Stack)",
                        "ownedViews": []
                    },
                    # 3. Sequence Diagram
                    {
                        "_type": "UMLCollaboration",
                        "_id": collab_id,
                        "_parent": { "$ref": model_id },
                        "name": "DisasterOS_Full_Collaborations",
                        "ownedElements": [
                            {
                                "_type": "UMLInteraction",
                                "_id": interaction_id,
                                "_parent": { "$ref": collab_id },
                                "name": "CompleteEndToEndDisasterResponseFlow",
                                "ownedElements": [
                                    {
                                        "_type": "UMLSequenceDiagram",
                                        "_id": seq_diag_id,
                                        "_parent": { "$ref": interaction_id },
                                        "name": "DisasterOS - Complete Sequence Diagram (Hazard to Relief)",
                                        "ownedViews": []
                                    }
                                ],
                                "participants": [],
                                "messages": []
                            }
                        ]
                    }
                ]
            }
        ]
    }

    uml_model = project["ownedElements"][0]
    uc_diag = uml_model["ownedElements"][0]
    comp_diag = uml_model["ownedElements"][1]
    interaction = uml_model["ownedElements"][2]["ownedElements"][0]
    seq_diag = interaction["ownedElements"][0]

    # Populate Use Case
    for a in actors:
        uml_model["ownedElements"].append({
            "_type": "UMLActor",
            "_id": a["id"],
            "_parent": { "$ref": model_id },
            "name": a["name"],
            "documentation": a["desc"]
        })
        uc_diag["ownedViews"].append({
            "_type": "UMLActorView",
            "_id": a["view_id"],
            "_parent": { "$ref": uc_diag_id },
            "model": { "$ref": a["id"] },
            "font": "Arial;11;0",
            "left": a["x"],
            "top": a["y"],
            "width": 60,
            "height": 70,
            "nameLabel": {
                "_type": "UMLNameCompartmentView",
                "_id": a["name_view_id"],
                "_parent": { "$ref": a["view_id"] },
                "model": { "$ref": a["id"] },
                "font": "Arial;11;1",
                "left": a["x"] - 25,
                "top": a["y"] + 75,
                "width": 110,
                "height": 13,
                "text": a["name"]
            }
        })

    for uc in use_cases:
        uml_model["ownedElements"].append({
            "_type": "UMLUseCase",
            "_id": uc["id"],
            "_parent": { "$ref": model_id },
            "name": uc["name"]
        })
        uc_diag["ownedViews"].append({
            "_type": "UMLUseCaseView",
            "_id": uc["view_id"],
            "_parent": { "$ref": uc_diag_id },
            "model": { "$ref": uc["id"] },
            "font": "Arial;11;0",
            "left": uc["x"],
            "top": uc["y"],
            "width": uc["w"],
            "height": uc["h"],
            "nameLabel": {
                "_type": "UMLNameCompartmentView",
                "_id": uc["name_view_id"],
                "_parent": { "$ref": uc["view_id"] },
                "model": { "$ref": uc["id"] },
                "font": "Arial;11;0",
                "left": uc["x"] + 10,
                "top": uc["y"] + 18,
                "width": uc["w"] - 20,
                "height": 13,
                "text": uc["name"]
            }
        })

    for assoc in uc_associations:
        uml_model["ownedElements"].append({
            "_type": "UMLAssociation",
            "_id": assoc["id"],
            "_parent": { "$ref": assoc["actor"]["id"] },
            "end1": { "_type": "UMLAssociationEnd", "_id": gen_id(), "reference": { "$ref": assoc["actor"]["id"] } },
            "end2": { "_type": "UMLAssociationEnd", "_id": gen_id(), "reference": { "$ref": assoc["use_case"]["id"] } }
        })
        uc_diag["ownedViews"].append({
            "_type": "UMLAssociationView",
            "_id": assoc["view_id"],
            "_parent": { "$ref": uc_diag_id },
            "model": { "$ref": assoc["id"] },
            "font": "Arial;11;0",
            "head": { "$ref": assoc["use_case"]["view_id"] },
            "tail": { "$ref": assoc["actor"]["view_id"] },
            "lineStyle": 1,
            "points": f"{assoc['actor']['x']+30},{assoc['actor']['y']+35};{assoc['use_case']['x']+20},{assoc['use_case']['y']+25}"
        })

    # Populate Component
    for c in components:
        uml_model["ownedElements"].append({
            "_type": "UMLComponent",
            "_id": c["id"],
            "_parent": { "$ref": model_id },
            "name": c["name"],
            "documentation": c["desc"]
        })
        comp_diag["ownedViews"].append({
            "_type": "UMLComponentView",
            "_id": c["view_id"],
            "_parent": { "$ref": comp_diag_id },
            "model": { "$ref": c["id"] },
            "font": "Arial;11;0",
            "left": c["x"],
            "top": c["y"],
            "width": c["w"],
            "height": c["h"],
            "nameLabel": {
                "_type": "UMLNameCompartmentView",
                "_id": c["name_view_id"],
                "_parent": { "$ref": c["view_id"] },
                "model": { "$ref": c["id"] },
                "font": "Arial;11;1",
                "left": c["x"] + 10,
                "top": c["y"] + 15,
                "width": c["w"] - 20,
                "height": 13,
                "text": c["name"]
            }
        })

    for dep in comp_dep_models:
        uml_model["ownedElements"].append({
            "_type": "UMLDependency",
            "_id": dep["id"],
            "_parent": { "$ref": dep["src"]["id"] },
            "source": { "$ref": dep["src"]["id"] },
            "target": { "$ref": dep["dst"]["id"] }
        })
        comp_diag["ownedViews"].append({
            "_type": "UMLDependencyView",
            "_id": dep["view_id"],
            "_parent": { "$ref": comp_diag_id },
            "model": { "$ref": dep["id"] },
            "font": "Arial;11;0",
            "head": { "$ref": dep["dst"]["view_id"] },
            "tail": { "$ref": dep["src"]["view_id"] },
            "lineStyle": 1,
            "points": f"{dep['src']['x']+dep['src']['w']//2},{dep['src']['y']+dep['src']['h']//2};{dep['dst']['x']+dep['dst']['w']//2},{dep['dst']['y']+dep['dst']['h']//2}"
        })

    # Populate Sequence
    for ll in lifelines:
        interaction["participants"].append({
            "_type": "UMLLifeline",
            "_id": ll["id"],
            "_parent": { "$ref": interaction_id },
            "name": ll["name"]
        })
        seq_diag["ownedViews"].append({
            "_type": "UMLSeqLifelineView",
            "_id": ll["view_id"],
            "_parent": { "$ref": seq_diag_id },
            "model": { "$ref": ll["id"] },
            "font": "Arial;11;0",
            "left": ll["x"],
            "top": 40,
            "width": ll["w"],
            "height": 820,
            "nameLabel": {
                "_type": "UMLNameCompartmentView",
                "_id": ll["name_view_id"],
                "_parent": { "$ref": ll["view_id"] },
                "model": { "$ref": ll["id"] },
                "font": "Arial;11;1",
                "left": ll["x"],
                "top": 40,
                "width": ll["w"],
                "height": 35,
                "text": ll["name"]
            },
            "lineBody": {
                "_type": "NodeView",
                "_id": ll["line_view_id"],
                "_parent": { "$ref": ll["view_id"] },
                "model": { "$ref": ll["id"] },
                "font": "Arial;11;0",
                "left": ll["x"] + (ll["w"] // 2),
                "top": 75,
                "width": 2,
                "height": 785
            }
        })

    for msg in seq_msg_models:
        interaction["messages"].append({
            "_type": "UMLMessage",
            "_id": msg["id"],
            "_parent": { "$ref": interaction_id },
            "name": msg["text"],
            "source": { "$ref": msg["src"]["id"] },
            "target": { "$ref": msg["dst"]["id"] }
        })
        x1 = msg["src"]["x"] + (msg["src"]["w"] // 2)
        x2 = msg["dst"]["x"] + (msg["dst"]["w"] // 2)
        seq_diag["ownedViews"].append({
            "_type": "UMLSeqMessageView",
            "_id": msg["view_id"],
            "_parent": { "$ref": seq_diag_id },
            "model": { "$ref": msg["id"] },
            "font": "Arial;11;0",
            "head": { "$ref": msg["dst"]["view_id"] },
            "tail": { "$ref": msg["src"]["view_id"] },
            "lineStyle": 1,
            "points": f"{x1},{msg['y']};{x2},{msg['y']}",
            "nameLabel": {
                "_type": "EdgeLabelView",
                "_id": msg["label_view_id"],
                "_parent": { "$ref": msg["view_id"] },
                "model": { "$ref": msg["id"] },
                "font": "Arial;10;0",
                "left": min(x1, x2) + 12,
                "top": msg["y"] - 15,
                "width": abs(x2 - x1) - 24,
                "height": 13,
                "text": msg["text"]
            }
        })

    return project

if __name__ == "__main__":
    proj = build_full_staruml()
    master_path = r"C:\Users\SAMEER\.gemini\antigravity\scratch\disasteros\uml\DisasterOS_StarUML_Master.mdj"
    with open(master_path, "w", encoding="utf-8") as f:
        json.dump(proj, f, indent=2)
    print("Updated Master StarUML MDJ saved to:", master_path)

    # Standalone Use Case
    uc_proj = json.loads(json.dumps(proj))
    uc_proj["name"] = "DisasterOS_Full_UseCase_Model"
    uc_model = uc_proj["ownedElements"][0]
    uc_model["ownedElements"] = [e for e in uc_model["ownedElements"] if e["_type"] in ["UMLUseCaseDiagram", "UMLActor", "UMLUseCase", "UMLAssociation"]]
    with open(r"C:\Users\SAMEER\.gemini\antigravity\scratch\disasteros\uml\DisasterOS_UseCase.mdj", "w", encoding="utf-8") as f:
        json.dump(uc_proj, f, indent=2)

    # Standalone Component
    comp_proj = json.loads(json.dumps(proj))
    comp_proj["name"] = "DisasterOS_Full_Component_Model"
    comp_model = comp_proj["ownedElements"][0]
    comp_model["ownedElements"] = [e for e in comp_model["ownedElements"] if e["_type"] in ["UMLComponentDiagram", "UMLComponent", "UMLDependency"]]
    with open(r"C:\Users\SAMEER\.gemini\antigravity\scratch\disasteros\uml\DisasterOS_Component.mdj", "w", encoding="utf-8") as f:
        json.dump(comp_proj, f, indent=2)

    # Standalone Sequence
    seq_proj = json.loads(json.dumps(proj))
    seq_proj["name"] = "DisasterOS_Full_Sequence_Model"
    seq_model = seq_proj["ownedElements"][0]
    seq_model["ownedElements"] = [e for e in seq_model["ownedElements"] if e["_type"] in ["UMLCollaboration"]]
    with open(r"C:\Users\SAMEER\.gemini\antigravity\scratch\disasteros\uml\DisasterOS_Sequence.mdj", "w", encoding="utf-8") as f:
        json.dump(seq_proj, f, indent=2)

    print("All Full-Scope StarUML MDJ files updated!")
