# DisasterOS — System & UML Diagrams (Mermaid Format)

Import these into Draw.io (Arrange → Insert → Advanced → Mermaid) to export vector PNG/SVG diagrams for your Springer paper.

---

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph EXT["External Feeds"]
        A1["Open-Meteo\nRainfall API"]
        A2["USGS\nEarthquake API"]
        A3["Nominatim\nReverse Geocoding"]
    end

    subgraph GW["Ingestion Gateway"]
        B1["Feed Poller\n(5-min cache)"]
        B2["Payload Normalizer"]
    end

    subgraph RISK["Risk Engine"]
        C1["Zone Aggregator"]
        C2["R_zone Calculator"]
        C3["AlertRule Evaluator"]
    end

    subgraph DAL["Data Access Layer"]
        D1[("IndexedDB / LocalStore\n(client, offline-first)")]
        D2[("Supabase / PostgreSQL\n(server migration target)")]
    end

    subgraph UI["Role Dashboards"]
        E1["Citizen Portal"]
        E2["Emergency Responder"]
        E3["Disaster Manager"]
        E4["Hospital Coordinator"]
    end

    A1 --> B1
    A2 --> B1
    A3 --> B1
    B1 --> B2
    B2 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> D1
    C3 --> D2
    D1 <--> D2
    D1 --> E1
    D1 --> E2
    D1 --> E3
    D1 --> E4
    E1 -->|"incident report"| D1
    E2 -->|"status update"| D1
```

---

## 2. UML Use Case Diagram

```mermaid
flowchart LR
    Citizen(["Citizen"])
    Responder(["Emergency Responder"])
    Manager(["Disaster Manager"])
    Hospital(["Hospital Coordinator"])

    UC1(["Report Incident"])
    UC2(["Request Emergency Help"])
    UC3(["View GIS Risk Map"])
    UC4(["Accept Dispatch"])
    UC5(["Update Incident Status"])
    UC6(["Configure Alert Rules"])
    UC7(["Monitor Zone Risk Scores"])
    UC8(["Manage Shelter Capacity"])
    UC9(["Update Bed Availability"])
    UC10(["Coordinate Patient Transfer"])
    UC11(["View Audit Logs"])

    Citizen --> UC1
    Citizen --> UC2
    Citizen --> UC3

    Responder --> UC4
    Responder --> UC5
    Responder --> UC3

    Manager --> UC6
    Manager --> UC7
    Manager --> UC8
    Manager --> UC11

    Hospital --> UC9
    Hospital --> UC10
    Hospital --> UC3

    UC2 -.->|"include"| UC1
    UC4 -.->|"include"| UC5
```

---

## 3. UML Sequence Diagram

```mermaid
sequenceDiagram
    actor Citizen
    participant UI as Citizen App
    participant GW as Ingestion Gateway
    participant RE as Risk Engine
    participant DAL as Data Access Layer
    participant SOP as SOP Automation
    participant Resp as Responder Team

    Citizen->>UI: Submit incident (type, location, photo)
    UI->>GW: POST /incidents
    GW->>DAL: Persist Incident (status=reported)
    GW->>RE: Notify zone updated
    RE->>DAL: Read latest feed readings for zone
    RE->>RE: Compute R_zone
    RE->>DAL: Write updated R_zone, evaluate AlertRules
    alt R_zone crosses threshold
        RE->>SOP: Trigger SOP for severity level
        SOP->>DAL: Create EmergencyRequest (auto-derived)
        SOP->>Resp: Dispatch notification (nearest available team)
        Resp-->>DAL: Acknowledge / update status=en_route
        DAL-->>UI: Push status update to Citizen
    else Below threshold
        RE->>DAL: Log AuditLog (no action)
    end
```

---

## 4. Data Flow Diagram (Level 1)

```mermaid
flowchart TB
    ext1(["External Feeds"])
    ext2(["Citizen"])
    ext3(["Responder"])

    p1["1.0\nIngest & Normalize Feed Data"]
    p2["2.0\nCompute Zone Risk (R_zone)"]
    p3["3.0\nProcess Incident Reports"]
    p4["4.0\nEvaluate Alert Rules & Trigger SOP"]
    p5["5.0\nAllocate Shelter / Dispatch"]

    ds1[("D1 Readings Store")]
    ds2[("D2 Incidents Store")]
    ds3[("D3 Zone/Risk Store")]
    ds4[("D4 Shelters/Requests Store")]
    ds5[("D5 Audit Log")]

    ext1 --> p1 --> ds1
    ds1 --> p2
    p2 --> ds3
    ext2 --> p3 --> ds2
    ds2 --> p2
    ds3 --> p4
    p4 --> ds5
    p4 --> p5
    ds4 --> p5
    p5 --> ds4
    p5 --> ext3
```
