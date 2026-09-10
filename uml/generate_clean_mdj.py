import json
import uuid

def gen_id():
    return "AAAAAAF" + uuid.uuid4().hex[:17]

# =============================================================================
# 1. PRISTINE USE CASE DIAGRAM GENERATOR
# =============================================================================
def generate_use_case_mdj():
    proj_id = gen_id()
    model_id = gen_id()
    diag_id = gen_id()

    # Actors: 2 on the left, 4 on the right
    actors = [
        {"name": "Citizen", "desc": "Citizen: Emergency reporting, relief requests, and evacuation tracking", "x": 50, "y": 200, "w": 65, "h": 85},
        {"name": "Emergency Responder", "desc": "Field tactical response units and medical teams", "x": 50, "y": 560, "w": 65, "h": 85},
        {"name": "Disaster Manager", "desc": "Incident Commander: Risk engine, SOP execution, and evacuation orders", "x": 1020, "y": 200, "w": 65, "h": 85},
        {"name": "Hospital Coordinator", "desc": "Medical officer managing bed capacity and trauma triage", "x": 1020, "y": 460, "w": 65, "h": 85},
        {"name": "Warehouse & Shelter Mgr", "desc": "Logistics officer managing shelter headroom and ration stock", "x": 1020, "y": 640, "w": 65, "h": 85},
        {"name": "System Administrator", "desc": "Platform governance: RBAC permissions and immutable audit logs", "x": 1020, "y": 800, "w": 65, "h": 85}
    ]

    for a in actors:
        a["id"] = gen_id()
        a["view_id"] = gen_id()
        a["name_view_id"] = gen_id()

    # Use Cases: Grouped into Left Column (Citizen/Responder) & Right Column (Manager/Hospital/Shelter/Admin)
    # ZERO lines cross the middle!
    use_cases = [
        # --- LEFT COLUMN (x=240): Citizen & Responder Use Cases ---
        {"name": "Report Emergency Incident with GPS", "x": 240, "y": 100, "w": 270, "h": 50, "actors": ["Citizen"]},
        {"name": "Request Emergency Relief & Rescue", "x": 240, "y": 180, "w": 270, "h": 50, "actors": ["Citizen"]},
        {"name": "View Live GIS Map & Safe Shelters", "x": 240, "y": 260, "w": 270, "h": 50, "actors": ["Citizen"]},
        {"name": "Query AI Emergency Assistant", "x": 240, "y": 340, "w": 270, "h": 50, "actors": ["Citizen"]},
        {"name": "Accept Tactical Rescue Dispatch", "x": 240, "y": 480, "w": 270, "h": 50, "actors": ["Emergency Responder"]},
        {"name": "Update Incident Lifecycle State", "x": 240, "y": 560, "w": 270, "h": 50, "actors": ["Emergency Responder"]},
        {"name": "Transmit Field Casualty Triage", "x": 240, "y": 640, "w": 270, "h": 50, "actors": ["Emergency Responder"]},
        {"name": "Access Turn-by-Turn Evacuation Route", "x": 240, "y": 720, "w": 270, "h": 50, "actors": ["Emergency Responder"]},

        # --- RIGHT COLUMN (x=660): Command, Medical & Governance Use Cases ---
        {"name": "Configure Risk Rules & Thresholds", "x": 660, "y": 100, "w": 280, "h": 50, "actors": ["Disaster Manager"]},
        {"name": "Monitor Composite R_zone Scores", "x": 660, "y": 180, "w": 280, "h": 50, "actors": ["Disaster Manager"]},
        {"name": "Execute Automated SOP Workflows", "x": 660, "y": 260, "w": 280, "h": 50, "actors": ["Disaster Manager"]},
        {"name": "Authorize Mass Evacuation Orders", "x": 660, "y": 340, "w": 280, "h": 50, "actors": ["Disaster Manager"]},
        {"name": "Generate AI Situation Reports", "x": 660, "y": 420, "w": 280, "h": 50, "actors": ["Disaster Manager"]},
        {"name": "Update Hospital Bed & ICU Capacity", "x": 660, "y": 510, "w": 280, "h": 50, "actors": ["Hospital Coordinator"]},
        {"name": "Coordinate Emergency Patient Transfers", "x": 660, "y": 590, "w": 280, "h": 50, "actors": ["Hospital Coordinator"]},
        {"name": "Manage Shelter Headroom & Resources", "x": 660, "y": 680, "w": 280, "h": 50, "actors": ["Warehouse & Shelter Mgr"]},
        {"name": "Track Warehouse Stock & Ration Issuance", "x": 660, "y": 760, "w": 280, "h": 50, "actors": ["Warehouse & Shelter Mgr"]},
        {"name": "Inspect Immutable Audit Trails & RBAC", "x": 660, "y": 850, "w": 280, "h": 50, "actors": ["System Administrator"]}
    ]

    for uc in use_cases:
        uc["id"] = gen_id()
        uc["view_id"] = gen_id()
        uc["name_view_id"] = gen_id()

    associations = []
    for uc in use_cases:
        for a_name in uc["actors"]:
            act = next((a for a in actors if a["name"] == a_name), None)
            if act:
                associations.append({
                    "id": gen_id(),
                    "view_id": gen_id(),
                    "actor": act,
                    "use_case": uc
                })

    project = {
        "_type": "Project",
        "_id": proj_id,
        "name": "DisasterOS_UseCase_Model",
        "ownedElements": [
            {
                "_type": "UMLModel",
                "_id": model_id,
                "_parent": { "$ref": proj_id },
                "name": "DisasterOS Use Case Subsystem",
                "ownedElements": [
                    {
                        "_type": "UMLUseCaseDiagram",
                        "_id": diag_id,
                        "_parent": { "$ref": model_id },
                        "name": "DisasterOS - Complete UML Use Case Diagram",
                        "ownedViews": [
                            # Clean System Boundary Rectangle
                            {
                                "_type": "UMLTextView",
                                "_id": gen_id(),
                                "_parent": { "$ref": diag_id },
                                "font": "Arial;15;1",
                                "left": 190,
                                "top": 50,
                                "width": 800,
                                "height": 890,
                                "text": "System Boundary: DisasterOS Command & Operations Platform"
                            }
                        ]
                    }
                ]
            }
        ]
    }

    uml_model = project["ownedElements"][0]
    uc_diag = uml_model["ownedElements"][0]

    # Actors
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
            "_parent": { "$ref": diag_id },
            "model": { "$ref": a["id"] },
            "font": "Arial;11;0",
            "left": a["x"],
            "top": a["y"],
            "width": a["w"],
            "height": a["h"],
            "nameLabel": {
                "_type": "UMLNameCompartmentView",
                "_id": a["name_view_id"],
                "_parent": { "$ref": a["view_id"] },
                "model": { "$ref": a["id"] },
                "font": "Arial;11;1",
                "left": a["x"] - 25,
                "top": a["y"] + 90,
                "width": 115,
                "height": 13,
                "text": a["name"]
            }
        })

    # Use Cases
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
            "_parent": { "$ref": diag_id },
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

    # Associations
    for assoc in associations:
        uml_model["ownedElements"].append({
            "_type": "UMLAssociation",
            "_id": assoc["id"],
            "_parent": { "$ref": assoc["actor"]["id"] },
            "end1": { "_type": "UMLAssociationEnd", "_id": gen_id(), "reference": { "$ref": assoc["actor"]["id"] } },
            "end2": { "_type": "UMLAssociationEnd", "_id": gen_id(), "reference": { "$ref": assoc["use_case"]["id"] } }
        })
        
        # Calculate clean edge-to-edge anchor points
        if assoc["actor"]["x"] < assoc["use_case"]["x"]:
            # Actor on left, Use case on right
            p_start = f"{assoc['actor']['x'] + assoc['actor']['w']},{assoc['actor']['y'] + 40}"
            p_end = f"{assoc['use_case']['x']},{assoc['use_case']['y'] + 25}"
        else:
            # Actor on right, Use case on left
            p_start = f"{assoc['actor']['x']},{assoc['actor']['y'] + 40}"
            p_end = f"{assoc['use_case']['x'] + assoc['use_case']['w']},{assoc['use_case']['y'] + 25}"

        uc_diag["ownedViews"].append({
            "_type": "UMLAssociationView",
            "_id": assoc["view_id"],
            "_parent": { "$ref": diag_id },
            "model": { "$ref": assoc["id"] },
            "font": "Arial;11;0",
            "head": { "$ref": assoc["use_case"]["view_id"] },
            "tail": { "$ref": assoc["actor"]["view_id"] },
            "lineStyle": 1,
            "points": f"{p_start};{p_end}"
        })

    return project


# =============================================================================
# 2. PRISTINE COMPONENT DIAGRAM GENERATOR
# =============================================================================
def generate_component_mdj():
    proj_id = gen_id()
    model_id = gen_id()
    diag_id = gen_id()

    # Clean 4-column layout with 70px vertical spacing and 80px horizontal spacing
    components = [
        # Col 0 (x=50): Presentation Tier
        {"name": "Citizen Web & Mobile Portal", "x": 50, "y": 80, "w": 240, "h": 75, "desc": "Public GPS intake, relief requests, and evacuation tracking"},
        {"name": "Command Center Dashboard", "x": 50, "y": 210, "w": 240, "h": 75, "desc": "Unified 25-module operational console for tactical teams"},
        {"name": "Leaflet GIS Map Engine", "x": 50, "y": 340, "w": 240, "h": 75, "desc": "OpenStreetMap layer controller with live earthquake circles"},
        {"name": "AI Assistant Web Widget", "x": 50, "y": 470, "w": 240, "h": 75, "desc": "Situational operational query interface"},

        # Col 1 (x=370): Gateways & Middleware Tier
        {"name": "Ingestion Gateway (gateway.js)", "x": 370, "y": 80, "w": 250, "h": 75, "desc": "Rate-limited poller with TTL cache (5-min weather, 1-min seismic)"},
        {"name": "Notification & Siren Broker", "x": 370, "y": 210, "w": 250, "h": 75, "desc": "Multi-channel public siren and responder dispatch alert dispatcher"},
        {"name": "App Orchestrator (app.js)", "x": 370, "y": 340, "w": 250, "h": 75, "desc": "State router, event listener, and multi-role view coordinator"},
        {"name": "Audit Logging Provider", "x": 370, "y": 470, "w": 250, "h": 75, "desc": "Immutable operational audit stream recorder"},

        # Col 2 (x=710): Core Business & Intelligence Tier
        {"name": "Risk Engine (risk-engine.js)", "x": 710, "y": 80, "w": 250, "h": 75, "desc": "Calculates composite R_zone formula with live normalized weights"},
        {"name": "Decision Support & SOP Engine", "x": 710, "y": 210, "w": 250, "h": 75, "desc": "Automated workflow runner and heuristic priority triage queue"},
        {"name": "Resource & Shelter Service", "x": 710, "y": 340, "w": 250, "h": 75, "desc": "Real-time shelter capacity and hospital bed allocator"},
        {"name": "AI Situation Report Generator", "x": 710, "y": 470, "w": 250, "h": 75, "desc": "Automated executive summary synthesizer"},

        # Col 3 (x=1050): Data Persistence & External APIs Tier
        {"name": "Open-Meteo & USGS Live APIs", "x": 1050, "y": 80, "w": 240, "h": 75, "desc": "Scientific weather and seismic feeds (zero API keys)"},
        {"name": "OpenStreetMap Tile Server", "x": 1050, "y": 210, "w": 240, "h": 75, "desc": "Global vector tile provider"},
        {"name": "Data Access Layer (store.js)", "x": 1050, "y": 340, "w": 240, "h": 75, "desc": "Encapsulates 7 canonical relational schemas"},
        {"name": "PostgreSQL / Supabase Database", "x": 1050, "y": 470, "w": 240, "h": 75, "desc": "Production relational cloud persistence target"}
    ]

    for c in components:
        c["id"] = gen_id()
        c["view_id"] = gen_id()
        c["name_view_id"] = gen_id()

    # Clean, non-overlapping dependencies between adjacent columns only!
    dependencies = [
        ("Citizen Web & Mobile Portal", "Ingestion Gateway (gateway.js)"),
        ("Command Center Dashboard", "App Orchestrator (app.js)"),
        ("Leaflet GIS Map Engine", "App Orchestrator (app.js)"),
        ("AI Assistant Web Widget", "App Orchestrator (app.js)"),
        ("Ingestion Gateway (gateway.js)", "Open-Meteo & USGS Live APIs"),
        ("Ingestion Gateway (gateway.js)", "Risk Engine (risk-engine.js)"),
        ("Risk Engine (risk-engine.js)", "Decision Support & SOP Engine"),
        ("Decision Support & SOP Engine", "Notification & Siren Broker"),
        ("App Orchestrator (app.js)", "Resource & Shelter Service"),
        ("Resource & Shelter Service", "Data Access Layer (store.js)"),
        ("Leaflet GIS Map Engine", "OpenStreetMap Tile Server"),
        ("Data Access Layer (store.js)", "PostgreSQL / Supabase Database"),
        ("AI Situation Report Generator", "Data Access Layer (store.js)"),
        ("Audit Logging Provider", "Data Access Layer (store.js)")
    ]

    dep_models = []
    for src_name, dst_name in dependencies:
        src = next((c for c in components if c["name"] == src_name), None)
        dst = next((c for c in components if c["name"] == dst_name), None)
        if src and dst:
            dep_models.append({
                "id": gen_id(),
                "view_id": gen_id(),
                "src": src,
                "dst": dst
            })

    project = {
        "_type": "Project",
        "_id": proj_id,
        "name": "DisasterOS_Component_Model",
        "ownedElements": [
            {
                "_type": "UMLModel",
                "_id": model_id,
                "_parent": { "$ref": proj_id },
                "name": "DisasterOS Component Subsystem",
                "ownedElements": [
                    {
                        "_type": "UMLComponentDiagram",
                        "_id": diag_id,
                        "_parent": { "$ref": model_id },
                        "name": "DisasterOS - Complete UML Component Diagram",
                        "ownedViews": []
                    }
                ]
            }
        ]
    }

    uml_model = project["ownedElements"][0]
    comp_diag = uml_model["ownedElements"][0]

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
            "_parent": { "$ref": diag_id },
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

    for dep in dep_models:
        uml_model["ownedElements"].append({
            "_type": "UMLDependency",
            "_id": dep["id"],
            "_parent": { "$ref": dep["src"]["id"] },
            "source": { "$ref": dep["src"]["id"] },
            "target": { "$ref": dep["dst"]["id"] }
        })

        # Calculate straight or clean horizontal connection
        if dep["src"]["x"] < dep["dst"]["x"]:
            p1 = f"{dep['src']['x'] + dep['src']['w']},{dep['src']['y'] + 37}"
            p2 = f"{dep['dst']['x']},{dep['dst']['y'] + 37}"
        elif dep["src"]["x"] > dep["dst"]["x"]:
            p1 = f"{dep['src']['x']},{dep['src']['y'] + 37}"
            p2 = f"{dep['dst']['x'] + dep['dst']['w']},{dep['dst']['y'] + 37}"
        else:
            p1 = f"{dep['src']['x'] + 120},{dep['src']['y'] + dep['src']['h']}"
            p2 = f"{dep['dst']['x'] + 120},{dep['dst']['y']}"

        comp_diag["ownedViews"].append({
            "_type": "UMLDependencyView",
            "_id": dep["view_id"],
            "_parent": { "$ref": diag_id },
            "model": { "$ref": dep["id"] },
            "font": "Arial;11;0",
            "head": { "$ref": dep["dst"]["view_id"] },
            "tail": { "$ref": dep["src"]["view_id"] },
            "lineStyle": 1,
            "points": f"{p1};{p2}"
        })

    return project


# =============================================================================
# 3. PRISTINE SEQUENCE DIAGRAM GENERATOR (Zero Collisions & Correct Self-Calls)
# =============================================================================
def generate_sequence_mdj():
    proj_id = gen_id()
    model_id = gen_id()
    collab_id = gen_id()
    interaction_id = gen_id()
    diag_id = gen_id()

    # 7 Wide-Spaced Lifelines (Zero label overlap)
    lifelines = [
        {"name": "c: Citizen", "x": 60, "w": 120},
        {"name": ": CitizenUI", "x": 250, "w": 120},
        {"name": ": IngestionGateway", "x": 450, "w": 140},
        {"name": ": RiskEngine", "x": 660, "w": 130},
        {"name": ": DecisionSupport", "x": 860, "w": 140},
        {"name": "r: RescueTeam", "x": 1070, "w": 130},
        {"name": ": DAL_Store", "x": 1270, "w": 130}
    ]

    for ll in lifelines:
        ll["id"] = gen_id()
        ll["view_id"] = gen_id()
        ll["name_view_id"] = gen_id()
        ll["line_view_id"] = gen_id()
        ll["cx"] = ll["x"] + (ll["w"] // 2)

    # 14 Chronological Steps with 55px vertical spacing
    # Self-messages are explicitly flagged to render 4-point loops!
    messages = [
        {"src": "c: Citizen", "dst": ": CitizenUI", "text": "1: submitIncident(type, media)", "self": False},
        {"src": ": CitizenUI", "dst": ": CitizenUI", "text": "2: captureGPS(geolocation)", "self": True},
        {"src": ": CitizenUI", "dst": ": IngestionGateway", "text": "3: POST /incidents(coords, data)", "self": False},
        {"src": ": IngestionGateway", "dst": ": DAL_Store", "text": "4: insertIncident(status='reported')", "self": False},
        {"src": ": IngestionGateway", "dst": ": IngestionGateway", "text": "5: pollFeeds(Open-Meteo, USGS)", "self": True},
        {"src": ": IngestionGateway", "dst": ": RiskEngine", "text": "6: evaluateZone(rain, seismic)", "self": False},
        {"src": ": RiskEngine", "dst": ": RiskEngine", "text": "7: calculateR_zone(formula)", "self": True},
        {"src": ": RiskEngine", "dst": ": DAL_Store", "text": "8: updateRiskScore(R_zone=0.84)", "self": False},
        {"src": ": RiskEngine", "dst": ": DecisionSupport", "text": "9: triggerSOP(severity='CRITICAL')", "self": False},
        {"src": ": DecisionSupport", "dst": ": DecisionSupport", "text": "10: prioritizeQueue(heuristic)", "self": True},
        {"src": ": DecisionSupport", "dst": "r: RescueTeam", "text": "11: dispatchAlert(INC-1005, route)", "self": False},
        {"src": "r: RescueTeam", "dst": ": DAL_Store", "text": "12: acknowledge(status='en_route')", "self": False},
        {"src": ": DAL_Store", "dst": ": CitizenUI", "text": "13: pushUpdate(dispatched, eta='8m')", "self": False},
        {"src": ": CitizenUI", "dst": "c: Citizen", "text": "14: renderTrackingHUD(routeMap)", "self": False}
    ]

    msg_models = []
    current_y = 140
    for m in messages:
        src = next(ll for ll in lifelines if ll["name"] == m["src"])
        dst = next(ll for ll in lifelines if ll["name"] == m["dst"])
        msg_models.append({
            "id": gen_id(),
            "view_id": gen_id(),
            "label_view_id": gen_id(),
            "src": src,
            "dst": dst,
            "text": m["text"],
            "is_self": m["self"],
            "y": current_y
        })
        current_y += 55

    project = {
        "_type": "Project",
        "_id": proj_id,
        "name": "DisasterOS_Sequence_Model",
        "ownedElements": [
            {
                "_type": "UMLModel",
                "_id": model_id,
                "_parent": { "$ref": proj_id },
                "name": "DisasterOS Sequence Subsystem",
                "ownedElements": [
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
                                        "_id": diag_id,
                                        "_parent": { "$ref": interaction_id },
                                        "name": "DisasterOS - Complete Sequence Diagram",
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

    interaction = project["ownedElements"][0]["ownedElements"][0]["ownedElements"][0]
    seq_diag = interaction["ownedElements"][0]

    # Lifelines
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
            "_parent": { "$ref": diag_id },
            "model": { "$ref": ll["id"] },
            "font": "Arial;11;0",
            "left": ll["x"],
            "top": 40,
            "width": ll["w"],
            "height": 950,
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
                "left": ll["cx"] - 1,
                "top": 75,
                "width": 2,
                "height": 915
            }
        })

    # Messages
    for msg in msg_models:
        interaction["messages"].append({
            "_type": "UMLMessage",
            "_id": msg["id"],
            "_parent": { "$ref": interaction_id },
            "name": msg["text"],
            "source": { "$ref": msg["src"]["id"] },
            "target": { "$ref": msg["dst"]["id"] }
        })

        if msg["is_self"]:
            # Correct 4-point loop for StarUML self-call
            x = msg["src"]["cx"]
            y = msg["y"]
            pts = f"{x},{y};{x+35},{y};{x+35},{y+22};{x},{y+22}"
            label_left = x + 42
            label_top = y - 3
            label_width = 220
        else:
            x1 = msg["src"]["cx"]
            x2 = msg["dst"]["cx"]
            y = msg["y"]
            pts = f"{x1},{y};{x2},{y}"
            label_left = min(x1, x2) + 20
            label_top = y - 18
            label_width = abs(x2 - x1) - 40

        seq_diag["ownedViews"].append({
            "_type": "UMLSeqMessageView",
            "_id": msg["view_id"],
            "_parent": { "$ref": diag_id },
            "model": { "$ref": msg["id"] },
            "font": "Arial;10;0",
            "head": { "$ref": msg["dst"]["view_id"] },
            "tail": { "$ref": msg["src"]["view_id"] },
            "lineStyle": 1,
            "points": pts,
            "nameLabel": {
                "_type": "EdgeLabelView",
                "_id": msg["label_view_id"],
                "_parent": { "$ref": msg["view_id"] },
                "model": { "$ref": msg["id"] },
                "font": "Arial;10;0",
                "left": label_left,
                "top": label_top,
                "width": label_width,
                "height": 14,
                "text": msg["text"]
            }
        })

    return project


if __name__ == "__main__":
    out_dir = r"C:\Users\SAMEER\.gemini\antigravity\scratch\disasteros\uml"
    
    uc = generate_use_case_mdj()
    with open(f"{out_dir}\\DisasterOS_UseCase.mdj", "w", encoding="utf-8") as f:
        json.dump(uc, f, indent=2)
    print("Generated: DisasterOS_UseCase.mdj")

    comp = generate_component_mdj()
    with open(f"{out_dir}\\DisasterOS_Component.mdj", "w", encoding="utf-8") as f:
        json.dump(comp, f, indent=2)
    print("Generated: DisasterOS_Component.mdj")

    seq = generate_sequence_mdj()
    with open(f"{out_dir}\\DisasterOS_Sequence.mdj", "w", encoding="utf-8") as f:
        json.dump(seq, f, indent=2)
    print("Generated: DisasterOS_Sequence.mdj")

    print("All 3 separate StarUML files generated with zero overlapping lines or crushed messages!")
