import json
import uuid

def gen_id():
    # StarUML typically uses 23-24 char base64-like alphanumeric IDs
    return "AAAAAAF" + uuid.uuid4().hex[:17]

def build_staruml_project():
    proj_id = gen_id()
    model_id = gen_id()
    
    # -------------------------------------------------------------
    # 1. USE CASE MODEL & DIAGRAM
    # -------------------------------------------------------------
    uc_diag_id = gen_id()
    uc_subject_id = gen_id()
    
    actors = [
        {"name": "Citizen", "desc": "Public user reporting incidents and requesting emergency help", "x": 60, "y": 140},
        {"name": "Emergency Responder", "desc": "Tactical rescue team in the field", "x": 60, "y": 380},
        {"name": "Disaster Manager", "desc": "Incident commander managing overall response and SOPs", "x": 980, "y": 140},
        {"name": "Hospital Coordinator", "desc": "Medical triage and bed availability coordinator", "x": 980, "y": 380},
        {"name": "External Weather & Seismic Feeds", "desc": "Open-Meteo & USGS automated telemetry ingestion", "x": 980, "y": 580}
    ]
    
    for a in actors:
        a["id"] = gen_id()
        a["view_id"] = gen_id()
        a["name_view_id"] = gen_id()

    use_cases = [
        # Citizen
        {"name": "Report Incident with GPS", "x": 280, "y": 100, "w": 220, "h": 50, "actors": ["Citizen"]},
        {"name": "Request Emergency Help", "x": 280, "y": 170, "w": 220, "h": 50, "actors": ["Citizen"]},
        {"name": "View Dynamic GIS Risk Map", "x": 280, "y": 240, "w": 220, "h": 50, "actors": ["Citizen", "Emergency Responder", "Disaster Manager", "Hospital Coordinator"]},
        {"name": "Receive Early Warning Alerts", "x": 280, "y": 310, "w": 220, "h": 50, "actors": ["Citizen"]},
        
        # Responder
        {"name": "Accept Rescue Dispatch", "x": 280, "y": 380, "w": 220, "h": 50, "actors": ["Emergency Responder"]},
        {"name": "Update Incident Lifecycle State", "x": 280, "y": 450, "w": 220, "h": 50, "actors": ["Emergency Responder"]},
        {"name": "Access Turn-by-Turn Evac Route", "x": 280, "y": 520, "w": 220, "h": 50, "actors": ["Emergency Responder"]},
        
        # Manager
        {"name": "Configure Risk Rules & Thresholds", "x": 650, "y": 100, "w": 240, "h": 50, "actors": ["Disaster Manager"]},
        {"name": "Monitor Composite R_zone Scores", "x": 650, "y": 170, "w": 240, "h": 50, "actors": ["Disaster Manager"]},
        {"name": "Execute Automated SOP Workflows", "x": 650, "y": 240, "w": 240, "h": 50, "actors": ["Disaster Manager"]},
        {"name": "Authorize Evacuation Orders", "x": 650, "y": 310, "w": 240, "h": 50, "actors": ["Disaster Manager"]},
        {"name": "Manage Shelter Headroom & Stock", "x": 650, "y": 380, "w": 240, "h": 50, "actors": ["Disaster Manager"]},
        {"name": "Inspect Audit Logs & Governance", "x": 650, "y": 450, "w": 240, "h": 50, "actors": ["Disaster Manager"]},
        
        # Hospital & Feeds
        {"name": "Update Hospital Bed & ICU Capacity", "x": 650, "y": 520, "w": 240, "h": 50, "actors": ["Hospital Coordinator"]},
        {"name": "Coordinate Emergency Patient Transfer", "x": 650, "y": 590, "w": 240, "h": 50, "actors": ["Hospital Coordinator"]},
        {"name": "Ingest Real-Time Sensor Telemetry", "x": 650, "y": 660, "w": 240, "h": 50, "actors": ["External Weather & Seismic Feeds"]}
    ]

    for uc in use_cases:
        uc["id"] = gen_id()
        uc["view_id"] = gen_id()
        uc["name_view_id"] = gen_id()

    # Associations
    uc_associations = []
    for uc in use_cases:
        for a_name in uc["actors"]:
            act = next(a for a in actors if a["name"] == a_name)
            assoc_id = gen_id()
            assoc_view_id = gen_id()
            uc_associations.append({
                "id": assoc_id,
                "view_id": assoc_view_id,
                "actor": act,
                "use_case": uc
            })

    # -------------------------------------------------------------
    # 2. COMPONENT MODEL & DIAGRAM
    # -------------------------------------------------------------
    comp_diag_id = gen_id()
    components = [
        # Presentation
        {"name": "Web Client UI (index.html, styles.css)", "stereotype": "UI Layer", "x": 40, "y": 80, "w": 260, "h": 120, "desc": "Single-page application containing all 25 role dashboards and responsive views"},
        {"name": "Leaflet GIS Controller (js/map.js)", "stereotype": "GIS Engine", "x": 40, "y": 260, "w": 260, "h": 120, "desc": "Interactive vector mapping, layer controller, and USGS event visualizer"},
        
        # Ingestion & Feeds
        {"name": "Ingestion Gateway (js/gateway.js)", "stereotype": "Ingestion", "x": 380, "y": 80, "w": 260, "h": 120, "desc": "Fetches live weather from Open-Meteo and seismic data from USGS with 5-min caching"},
        {"name": "External Weather API (Open-Meteo)", "stereotype": "External Service", "x": 720, "y": 40, "w": 240, "h": 80, "desc": "Unauthenticated JSON forecast endpoint"},
        {"name": "USGS Earthquake Hazards Feed", "stereotype": "External Service", "x": 720, "y": 140, "w": 240, "h": 80, "desc": "Live GeoJSON worldwide earthquake telemetry"},
        
        # Engine & Logic
        {"name": "Risk & Decision Engine (js/risk-engine.js)", "stereotype": "Calculation Engine", "x": 380, "y": 260, "w": 260, "h": 120, "desc": "Calculates composite R_zone formula and heuristic dispatch priority queues"},
        {"name": "App Orchestrator (js/app.js)", "stereotype": "Controller", "x": 40, "y": 440, "w": 260, "h": 120, "desc": "State router, event handler, and multi-role view dispatcher"},
        
        # Data Access Layer
        {"name": "Data Access Layer (js/store.js)", "stereotype": "Persistence Layer", "x": 380, "y": 440, "w": 260, "h": 120, "desc": "Encapsulates 7 canonical schemas, localStorage persistence, and audit logs"},
        {"name": "IndexedDB / LocalStorage Engine", "stereotype": "Local Store", "x": 720, "y": 420, "w": 240, "h": 70, "desc": "Offline-first browser client storage"},
        {"name": "PostgreSQL / Supabase (Target)", "stereotype": "Database Server", "x": 720, "y": 510, "w": 240, "h": 70, "desc": "Relational cloud storage migration target for Review 2/3"}
    ]

    for c in components:
        c["id"] = gen_id()
        c["view_id"] = gen_id()
        c["name_view_id"] = gen_id()

    comp_dependencies = [
        ("Web Client UI (index.html, styles.css)", "App Orchestrator (js/app.js)"),
        ("Web Client UI (index.html, styles.css)", "Leaflet GIS Controller (js/map.js)"),
        ("App Orchestrator (js/app.js)", "Data Access Layer (js/store.js)"),
        ("App Orchestrator (js/app.js)", "Risk & Decision Engine (js/risk-engine.js)"),
        ("Risk & Decision Engine (js/risk-engine.js)", "Ingestion Gateway (js/gateway.js)"),
        ("Ingestion Gateway (js/gateway.js)", "External Weather API (Open-Meteo)"),
        ("Ingestion Gateway (js/gateway.js)", "USGS Earthquake Hazards Feed"),
        ("Leaflet GIS Controller (js/map.js)", "Data Access Layer (js/store.js)"),
        ("Data Access Layer (js/store.js)", "IndexedDB / LocalStorage Engine"),
        ("Data Access Layer (js/store.js)", "PostgreSQL / Supabase (Target)")
    ]

    comp_dep_models = []
    for src_name, dst_name in comp_dependencies:
        src = next(c for c in components if c["name"] == src_name)
        dst = next(c for c in components if c["name"] == dst_name)
        comp_dep_models.append({
            "id": gen_id(),
            "view_id": gen_id(),
            "src": src,
            "dst": dst
        })

    # -------------------------------------------------------------
    # 3. SEQUENCE MODEL & DIAGRAM (Collaboration + Interaction)
    # -------------------------------------------------------------
    collab_id = gen_id()
    interaction_id = gen_id()
    seq_diag_id = gen_id()

    lifelines = [
        {"name": "c: Citizen", "x": 60, "w": 100},
        {"name": ": CitizenPortalUI", "x": 210, "w": 120},
        {"name": ": IngestionGateway", "x": 370, "w": 130},
        {"name": ": RiskEngine", "x": 540, "w": 110},
        {"name": ": DataAccessLayer", "x": 690, "w": 130},
        {"name": ": SOPAutomation", "x": 860, "w": 120},
        {"name": "r: ResponderTeam", "x": 1020, "w": 120},
        {"name": "h: HospitalCoord", "x": 1180, "w": 120}
    ]

    for ll in lifelines:
        ll["id"] = gen_id()
        ll["view_id"] = gen_id()
        ll["name_view_id"] = gen_id()
        ll["line_view_id"] = gen_id()

    messages = [
        ("c: Citizen", ": CitizenPortalUI", "1. submitEmergencyIncident(type, desc)", 110),
        (": CitizenPortalUI", ": CitizenPortalUI", "2. detectGPS(navigator.geolocation)", 150),
        (": CitizenPortalUI", ": IngestionGateway", "3. POST /api/incidents(lat, lon, details)", 190),
        (": IngestionGateway", ": DataAccessLayer", "4. insertIncident(status='reported')", 230),
        (": IngestionGateway", ": IngestionGateway", "5. queryWeatherAndSeismic(zone_id)", 270),
        (": IngestionGateway", ": RiskEngine", "6. evaluateZone(zone, rainfall, seismic)", 310),
        (": RiskEngine", ": RiskEngine", "7. computeR_zone(formula)", 350),
        (": RiskEngine", ": DataAccessLayer", "8. updateZoneRiskScore(zone_id, R_zone)", 390),
        (": RiskEngine", ": SOPAutomation", "9. triggerSOPAlert(severity='warning')", 430),
        (": SOPAutomation", ": DataAccessLayer", "10. createEmergencyRequest(autoDerived=true)", 470),
        (": SOPAutomation", ": RiskEngine", "11. prioritizeDispatchQueue()", 510),
        (": SOPAutomation", "r: ResponderTeam", "12. dispatchTacticalAlert(INC-1001, route)", 550),
        ("r: ResponderTeam", ": DataAccessLayer", "13. acknowledgeDispatch(status='en_route')", 590),
        (": SOPAutomation", "h: HospitalCoord", "14. alertIncomingCasualties(triageBedRequest)", 630),
        (": DataAccessLayer", ": DataAccessLayer", "15. logAudit('REQUEST_DISPATCHED')", 670),
        (": DataAccessLayer", ": CitizenPortalUI", "16. pushStatusUpdate('DISPATCHED', eta='12m')", 710),
        (": CitizenPortalUI", "c: Citizen", "17. renderLiveTrackingConfirmation()", 750)
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

    # =============================================================
    # ASSEMBLE STARUML JSON OBJECT
    # =============================================================
    project = {
        "_type": "Project",
        "_id": proj_id,
        "name": "DisasterOS_UML_Architecture",
        "ownedElements": [
            {
                "_type": "UMLModel",
                "_id": model_id,
                "_parent": { "$ref": proj_id },
                "name": "DisasterOS Engineering Models (BCSE301L)",
                "ownedElements": [
                    # 1. USE CASE DIAGRAM & ELEMENTS
                    {
                        "_type": "UMLUseCaseDiagram",
                        "_id": uc_diag_id,
                        "_parent": { "$ref": model_id },
                        "name": "DisasterOS - UML Use Case Diagram",
                        "ownedViews": [
                            # Subject Boundary Box
                            {
                                "_type": "UMLTextView",
                                "_id": uc_subject_id,
                                "_parent": { "$ref": uc_diag_id },
                                "font": "Arial;14;1",
                                "left": 250,
                                "top": 50,
                                "width": 680,
                                "height": 680,
                                "text": "System Boundary: DisasterOS Command Platform"
                            }
                        ]
                    },
                    
                    # 2. COMPONENT DIAGRAM & ELEMENTS
                    {
                        "_type": "UMLComponentDiagram",
                        "_id": comp_diag_id,
                        "_parent": { "$ref": model_id },
                        "name": "DisasterOS - UML Component Diagram",
                        "ownedViews": []
                    },

                    # 3. SEQUENCE DIAGRAM COLLABORATION
                    {
                        "_type": "UMLCollaboration",
                        "_id": collab_id,
                        "_parent": { "$ref": model_id },
                        "name": "DisasterOS_Collaborations",
                        "ownedElements": [
                            {
                                "_type": "UMLInteraction",
                                "_id": interaction_id,
                                "_parent": { "$ref": collab_id },
                                "name": "IncidentReportAndAutomatedDispatchFlow",
                                "ownedElements": [
                                    {
                                        "_type": "UMLSequenceDiagram",
                                        "_id": seq_diag_id,
                                        "_parent": { "$ref": interaction_id },
                                        "name": "DisasterOS - UML Sequence Diagram (Incident to Dispatch)",
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

    # Reference shorthand
    uml_model = project["ownedElements"][0]
    uc_diag = uml_model["ownedElements"][0]
    comp_diag = uml_model["ownedElements"][1]
    interaction = uml_model["ownedElements"][2]["ownedElements"][0]
    seq_diag = interaction["ownedElements"][0]

    # --- Populate Use Case Diagram ---
    for a in actors:
        # Semantic Model
        uml_model["ownedElements"].append({
            "_type": "UMLActor",
            "_id": a["id"],
            "_parent": { "$ref": model_id },
            "name": a["name"],
            "documentation": a["desc"]
        })
        # View
        uc_diag["ownedViews"].append({
            "_type": "UMLActorView",
            "_id": a["view_id"],
            "_parent": { "$ref": uc_diag_id },
            "model": { "$ref": a["id"] },
            "font": "Arial;12;0",
            "left": a["x"],
            "top": a["y"],
            "width": 60,
            "height": 75,
            "nameLabel": {
                "_type": "UMLNameCompartmentView",
                "_id": a["name_view_id"],
                "_parent": { "$ref": a["view_id"] },
                "model": { "$ref": a["id"] },
                "font": "Arial;12;1",
                "left": a["x"] - 20,
                "top": a["y"] + 80,
                "width": 100,
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
            "font": "Arial;12;0",
            "left": uc["x"],
            "top": uc["y"],
            "width": uc["w"],
            "height": uc["h"],
            "nameLabel": {
                "_type": "UMLNameCompartmentView",
                "_id": uc["name_view_id"],
                "_parent": { "$ref": uc["view_id"] },
                "model": { "$ref": uc["id"] },
                "font": "Arial;12;0",
                "left": uc["x"] + 15,
                "top": uc["y"] + 18,
                "width": uc["w"] - 30,
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
            "font": "Arial;12;0",
            "head": { "$ref": assoc["use_case"]["view_id"] },
            "tail": { "$ref": assoc["actor"]["view_id"] },
            "lineStyle": 1,
            "points": f"{assoc['actor']['x']+30},{assoc['actor']['y']+35};{assoc['use_case']['x']+20},{assoc['use_case']['y']+25}"
        })

    # --- Populate Component Diagram ---
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
            "font": "Arial;12;0",
            "left": c["x"],
            "top": c["y"],
            "width": c["w"],
            "height": c["h"],
            "nameLabel": {
                "_type": "UMLNameCompartmentView",
                "_id": c["name_view_id"],
                "_parent": { "$ref": c["view_id"] },
                "model": { "$ref": c["id"] },
                "font": "Arial;12;1",
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
            "font": "Arial;12;0",
            "head": { "$ref": dep["dst"]["view_id"] },
            "tail": { "$ref": dep["src"]["view_id"] },
            "lineStyle": 1,
            "points": f"{dep['src']['x']+dep['src']['w']//2},{dep['src']['y']+dep['src']['h']//2};{dep['dst']['x']+dep['dst']['w']//2},{dep['dst']['y']+dep['dst']['h']//2}"
        })

    # --- Populate Sequence Diagram ---
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
            "font": "Arial;12;0",
            "left": ll["x"],
            "top": 40,
            "width": ll["w"],
            "height": 780,
            "nameLabel": {
                "_type": "UMLNameCompartmentView",
                "_id": ll["name_view_id"],
                "_parent": { "$ref": ll["view_id"] },
                "model": { "$ref": ll["id"] },
                "font": "Arial;12;1",
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
                "font": "Arial;12;0",
                "left": ll["x"] + (ll["w"] // 2),
                "top": 75,
                "width": 2,
                "height": 745
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
            "font": "Arial;12;0",
            "head": { "$ref": msg["dst"]["view_id"] },
            "tail": { "$ref": msg["src"]["view_id"] },
            "lineStyle": 1,
            "points": f"{x1},{msg['y']};{x2},{msg['y']}",
            "nameLabel": {
                "_type": "EdgeLabelView",
                "_id": msg["label_view_id"],
                "_parent": { "$ref": msg["view_id"] },
                "model": { "$ref": msg["id"] },
                "font": "Arial;11;0",
                "left": min(x1, x2) + 15,
                "top": msg["y"] - 16,
                "width": abs(x2 - x1) - 30,
                "height": 13,
                "text": msg["text"]
            }
        })

    return project

if __name__ == "__main__":
    proj = build_staruml_project()
    out_path = r"C:\Users\SAMEER\.gemini\antigravity\scratch\disasteros\uml\DisasterOS_StarUML_Master.mdj"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(proj, f, indent=2)
    print("Master StarUML MDJ successfully generated at:", out_path)

    # Standalone Use Case
    uc_proj = json.loads(json.dumps(proj))
    uc_proj["name"] = "DisasterOS_UseCase_Model"
    uc_model = uc_proj["ownedElements"][0]
    # keep only use case diagram and its elements
    uc_model["ownedElements"] = [e for e in uc_model["ownedElements"] if e["_type"] in ["UMLUseCaseDiagram", "UMLActor", "UMLUseCase", "UMLAssociation"]]
    with open(r"C:\Users\SAMEER\.gemini\antigravity\scratch\disasteros\uml\DisasterOS_UseCase.mdj", "w", encoding="utf-8") as f:
        json.dump(uc_proj, f, indent=2)

    # Standalone Component
    comp_proj = json.loads(json.dumps(proj))
    comp_proj["name"] = "DisasterOS_Component_Model"
    comp_model = comp_proj["ownedElements"][0]
    comp_model["ownedElements"] = [e for e in comp_model["ownedElements"] if e["_type"] in ["UMLComponentDiagram", "UMLComponent", "UMLDependency"]]
    with open(r"C:\Users\SAMEER\.gemini\antigravity\scratch\disasteros\uml\DisasterOS_Component.mdj", "w", encoding="utf-8") as f:
        json.dump(comp_proj, f, indent=2)

    # Standalone Sequence
    seq_proj = json.loads(json.dumps(proj))
    seq_proj["name"] = "DisasterOS_Sequence_Model"
    seq_model = seq_proj["ownedElements"][0]
    seq_model["ownedElements"] = [e for e in seq_model["ownedElements"] if e["_type"] in ["UMLCollaboration"]]
    with open(r"C:\Users\SAMEER\.gemini\antigravity\scratch\disasteros\uml\DisasterOS_Sequence.mdj", "w", encoding="utf-8") as f:
        json.dump(seq_proj, f, indent=2)

    print("All standalone MDJ files successfully created!")
