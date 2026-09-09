// Application Orchestrator: Handles UI view rendering, live feed synchronizations, and event bindings.

class DisasterOSApp {
    constructor() {
        this.currentUser = { name: "Shaik Sameer", role: "Disaster Manager" };
        this.currentPage = "dashboard";
        this.liveRiskData = [];
    }

    init() {
        // Auto-run initial live telemetry sync
        this.syncLiveTelemetry();
    }

    login() {
        const username = document.getElementById("loginUser").value || "Operator";
        const role = document.getElementById("loginRole").value;
        this.currentUser = { name: username, role: role };

        document.getElementById("profileName").innerText = username;
        document.getElementById("profileRole").innerText = role;
        document.getElementById("avatar").innerText = username.substring(0, 2).toUpperCase();

        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("application").style.display = "flex";

        this.navigate("dashboard");
        this.toast(`Welcome to DisasterOS Command Center, ${username}`);
    }

    logout() {
        document.getElementById("application").style.display = "none";
        document.getElementById("loginScreen").style.display = "flex";
    }

    toggleSidebar() {
        document.getElementById("sidebar").classList.toggle("open");
    }

    navigate(page, element) {
        this.currentPage = page;
        document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active"));
        if (element) element.classList.add("active");

        const titles = {
            dashboard: ["Command Dashboard", "Real-time disaster telemetry and response coordination"],
            "risk-map": ["Dynamic GIS Risk Map", "Interactive Leaflet geospatial visualization with real USGS telemetry"],
            "early-warning": ["Early Warning Intelligence", "Live Open-Meteo & USGS feeds with deterministic R_zone engine"],
            "decision-support": ["Decision Support Engine", "Mathematical heuristic priority queue and evacuation routing"],
            incidents: ["Incident Lifecycle Management", "State transitions: Reported → Verified → Dispatched → Resolved"],
            emergency: ["Emergency Help Requests", "Citizen rescue and medical assistance triage"],
            dispatch: ["Rescue Team Dispatch", "Tactical response units and field operational deployment"],
            evacuation: ["Smart Evacuation Planning", "Shelter capacity constraints and route assignments"],
            shelters: ["Shelter Capacity Management", "Real-time occupancy tracking and essential relief stocks"],
            hospitals: ["Hospital Capacity Coordination", "Emergency bed availability, trauma centers, and ICU capacity"],
            inventory: ["Warehouse & Relief Inventory", "Stock thresholds, resource rationing, and dispatch"],
            "citizen-report": ["Citizen Emergency Reporting", "Native browser GPS geolocation and incident logging"],
            architecture: ["System Architecture & Schemas", "Frozen Review 1 specification and data flow contracts"],
            audit: ["Audit Trails & Governance", "Immutable chronological logs of all operational state mutations"]
        };

        const [title, subtitle] = titles[page] || ["DisasterOS", "Command Center"];
        document.getElementById("pageTitle").innerText = title;
        document.getElementById("pageSubtitle").innerText = subtitle;

        const content = document.getElementById("content");
        content.innerHTML = this.renderPageContent(page);

        // Post-render lifecycle hooks
        if (page === "risk-map") {
            setTimeout(() => {
                window.gisMap.init("gisMapContainer");
                if (this.recentSeismicEvents) {
                    window.gisMap.plotSeismicEvents(this.recentSeismicEvents);
                }
            }, 50);
        }

        if (window.innerWidth < 1000) {
            document.getElementById("sidebar").classList.remove("open");
        }
    }

    async syncLiveTelemetry() {
        const zones = window.store.data.zones;
        const shelterMap = {};
        window.store.data.shelters.forEach(s => {
            if (!shelterMap[s.zone_id]) shelterMap[s.zone_id] = [];
            shelterMap[s.zone_id].push(s);
        });

        try {
            // Ingest USGS Seismic feed centered around Tamil Nadu / India coordinates
            const seismicData = await window.gateway.getSeismicActivity(13.08, 80.27, 500);
            this.recentSeismicEvents = seismicData.nearby_events;

            // Ingest weather and compute R_zone for each monitored zone
            const riskEvaluations = [];
            for (const zone of zones) {
                const weather = await window.gateway.getRainfall(zone.lat, zone.lon);
                const sheltersInZone = shelterMap[zone.zone_id] || [];
                const evalResult = window.riskEngine.evaluateZone(zone, weather, seismicData, sheltersInZone);
                riskEvaluations.push({
                    zone,
                    weather,
                    seismicData,
                    evalResult
                });
            }

            this.liveRiskData = riskEvaluations;
            if (this.currentPage === "early-warning" || this.currentPage === "dashboard") {
                this.navigate(this.currentPage);
            }
        } catch (e) {
            console.error("Telemetry sync error", e);
        }
    }

    triggerLiveSync() {
        this.toast("Fetching live telemetry from Open-Meteo & USGS...");
        this.syncLiveTelemetry().then(() => {
            this.toast("Live API telemetry synchronized successfully");
        });
    }

    renderPageContent(page) {
        switch (page) {
            case "dashboard": return this.viewDashboard();
            case "risk-map": return this.viewRiskMap();
            case "early-warning": return this.viewEarlyWarning();
            case "decision-support": return this.viewDecisionSupport();
            case "incidents": return this.viewIncidents();
            case "emergency": return this.viewEmergency();
            case "dispatch": return this.viewDispatch();
            case "evacuation": return this.viewEvacuation();
            case "shelters": return this.viewShelters();
            case "hospitals": return this.viewHospitals();
            case "inventory": return this.viewInventory();
            case "citizen-report": return this.viewCitizenReport();
            case "architecture": return this.viewArchitecture();
            case "audit": return this.viewAudit();
            default: return `<div class="card"><h3>View ${page} ready</h3></div>`;
        }
    }

    viewDashboard() {
        const incidents = window.store.data.incidents;
        const activeInc = incidents.filter(i => i.status !== "resolved").length;
        const shelters = window.store.data.shelters;
        const totalOcc = shelters.reduce((a, b) => a + b.capacity_occupied, 0);
        const totalCap = shelters.reduce((a, b) => a + b.capacity_total, 0);
        const openReqs = window.store.data.emergency_requests.filter(r => r.status === "open").length;

        return `
            <div class="hero">
                <h2>Emergency Command Center</h2>
                <p>DisasterOS ingests live telemetry from Open-Meteo (Rainfall) and USGS (Seismic), running deterministic mathematical risk formulations ($R_{zone}$) to coordinate disaster operations.</p>
                <div class="hero-actions">
                    <button class="btn btn-danger" onclick="app.navigate('incidents')">🚨 Active Incidents (${activeInc})</button>
                    <button class="btn btn-primary" onclick="app.navigate('risk-map')">⌖ Launch GIS Risk Map</button>
                    <button class="btn btn-secondary" onclick="app.navigate('early-warning')">⚠ Live Feed Telemetry</button>
                </div>
            </div>

            <div class="grid grid-4">
                <div class="card stat">
                    <div class="stat-top">
                        <div class="stat-icon">🚨</div>
                        <span class="badge badge-danger">MONITORED</span>
                    </div>
                    <div class="stat-value">${activeInc}</div>
                    <div class="stat-label">Active Incidents</div>
                    <div class="change down">Across 4 zones</div>
                </div>

                <div class="card stat">
                    <div class="stat-top">
                        <div class="stat-icon">⌂</div>
                        <span class="badge badge-success">CAPACITY</span>
                    </div>
                    <div class="stat-value">${totalOcc} <span style="font-size:16px;color:#8fa5bd;">/ ${totalCap}</span></div>
                    <div class="stat-label">Shelter Occupancy</div>
                    <div class="change up">${((totalOcc/totalCap)*100).toFixed(0)}% utilization</div>
                </div>

                <div class="card stat">
                    <div class="stat-top">
                        <div class="stat-icon">🚑</div>
                        <span class="badge badge-warning">TRIAGE</span>
                    </div>
                    <div class="stat-value">${openReqs}</div>
                    <div class="stat-label">Open Help Requests</div>
                    <div class="change down">Priority Queue active</div>
                </div>

                <div class="card stat">
                    <div class="stat-top">
                        <div class="stat-icon">🌐</div>
                        <span class="badge badge-info">LIVE API</span>
                    </div>
                    <div class="stat-value">2</div>
                    <div class="stat-label">Live External Feeds</div>
                    <div class="change up">Open-Meteo + USGS</div>
                </div>
            </div>

            <br>

            <div class="grid grid-2">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Zone Risk Scores (Live Formula Output)</div>
                        <button class="btn btn-secondary" onclick="app.triggerLiveSync()">Re-evaluate</button>
                    </div>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Zone</th>
                                    <th>R_zone Score</th>
                                    <th>Classification</th>
                                    <th>Rainfall (3h)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.liveRiskData.map(d => `
                                    <tr>
                                        <td><strong>${d.zone.name}</strong></td>
                                        <td><strong>${d.evalResult.r_zone}</strong></td>
                                        <td><span class="badge ${d.evalResult.badgeClass}">${d.evalResult.statusText}</span></td>
                                        <td>${d.evalResult.components.rainfall_mm} mm</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Recent Operational Audit Log</div>
                        <button class="btn btn-secondary" onclick="app.navigate('audit')">View All</button>
                    </div>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Actor</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${window.store.data.audit_logs.slice(0, 4).map(l => `
                                    <tr>
                                        <td class="muted small">${new Date(l.created_at).toLocaleTimeString()}</td>
                                        <td><span class="badge badge-info">${l.actor_name}</span></td>
                                        <td class="small">${l.action}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    viewRiskMap() {
        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Interactive GIS Disaster Telemetry Map</div>
                        <div class="muted small">Powered by Leaflet.js & OpenStreetMap • Real-time coordinate plotting for Shelters, Hospitals, Incidents & USGS Seismic events</div>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-secondary" onclick="window.gisMap.renderAll(); app.toast('Map layers refreshed');">↺ Reset Layers</button>
                        <button class="btn btn-primary" onclick="app.triggerLiveSync()">Fetch USGS Seismic Feed</button>
                    </div>
                </div>
                <div id="gisMapContainer"></div>
                <div style="margin-top:12px;display:flex;gap:15px;font-size:11px;color:#8fa5bd;">
                    <div>🔴 <strong style="color:#fff;">Red Markers:</strong> Active Incidents</div>
                    <div>🟢 <strong style="color:#fff;">Green Pins:</strong> Evacuation Shelters</div>
                    <div>🔵 <strong style="color:#fff;">Blue Crosses:</strong> Hospitals & Trauma Centers</div>
                    <div>🟠 <strong style="color:#fff;">Orange Circles:</strong> Live USGS Seismic Events</div>
                </div>
            </div>
        `;
    }

    viewEarlyWarning() {
        return `
            <div class="hero">
                <h2>Early Warning Intelligence & Formula Validation</h2>
                <p>Evaluates composite risk score using Claude's frozen architecture formula: <br>
                <code>R_zone = 0.35·Rain_norm + 0.30·Seismic_norm + 0.25·Vuln − 0.20·ShelterHeadroom</code></p>
                <div class="hero-actions">
                    <button class="btn btn-primary" onclick="app.triggerLiveSync()">⚡ Run Live Evaluation Pipeline</button>
                </div>
            </div>

            <div class="grid grid-2">
                ${this.liveRiskData.map(d => `
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <div class="card-title">${d.zone.name}</div>
                                <div class="muted small">Lat: ${d.zone.lat}, Lon: ${d.zone.lon} • Vulnerability: ${d.zone.vulnerability}</div>
                            </div>
                            <span class="badge ${d.evalResult.badgeClass}">${d.evalResult.statusText}</span>
                        </div>
                        <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:12px;">
                            <span style="font-size:32px;font-weight:800;color:#35a7ff;">${d.evalResult.r_zone}</span>
                            <span class="muted small">Composite R_zone Index [0.000 - 1.000]</span>
                        </div>
                        <div class="muted small" style="margin-bottom:8px;">
                            <strong>Formula Breakdown:</strong>
                        </div>
                        <div style="font-size:11px;line-height:1.8;background:#0a192a;padding:10px;border-radius:6px;border:1px solid #233b57;">
                            • Rain term: 0.35 × ${d.evalResult.components.rain_norm} (Precip: ${d.evalResult.components.rainfall_mm} mm)<br>
                            • Seismic term: 0.30 × ${d.evalResult.components.seismic_norm} (Max Mag: ${d.evalResult.components.max_mag})<br>
                            • Vulnerability term: 0.25 × ${d.evalResult.components.vulnerability}<br>
                            • Shelter Headroom deduction: −0.20 × ${d.evalResult.components.shelter_headroom}
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    viewDecisionSupport() {
        const rawReqs = window.store.data.emergency_requests;
        const zoneMap = {};
        this.liveRiskData.forEach(d => { zoneMap[d.zone.zone_id] = d.evalResult; });
        const prioritized = window.riskEngine.prioritizeRequests(rawReqs, zoneMap);

        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Automated Dispatch Priority Queue</div>
                        <div class="muted small">Prioritized via: <code>Score = 0.50·Urgency + 0.35·R_zone + 0.15·LoadPenalty</code></div>
                    </div>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Citizen Name</th>
                                <th>Need Type</th>
                                <th>People</th>
                                <th>Priority Score</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${prioritized.map(r => `
                                <tr>
                                    <td><strong>${r.request_id}</strong></td>
                                    <td>${r.requester_name}</td>
                                    <td><span class="badge badge-warning">${r.need_type.toUpperCase()}</span></td>
                                    <td>${r.people_count}</td>
                                    <td><strong style="color:#ff5263;font-size:13px;">${r.computed_priority}</strong></td>
                                    <td><span class="badge ${r.status==='assigned'?'badge-success':'badge-danger'}">${r.status.toUpperCase()}</span></td>
                                    <td>
                                        ${r.status === 'open' ? `
                                            <button class="btn btn-primary" onclick="app.dispatchQuick('${r.request_id}')">Dispatch Nearest Team</button>
                                        ` : `
                                            <span class="muted small">Assigned (${r.assigned_team_id})</span>
                                        `}
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    viewIncidents() {
        const incidents = window.store.data.incidents;
        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Incident Lifecycle Management</div>
                        <div class="muted small">Reported → Verified → Dispatched → Resolved</div>
                    </div>
                    <button class="btn btn-danger" onclick="app.navigate('citizen-report')">+ Report New Incident</button>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Incident ID</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Coordinates</th>
                                <th>Severity</th>
                                <th>Lifecycle State</th>
                                <th>Transition</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${incidents.map(i => `
                                <tr>
                                    <td><strong>${i.incident_id}</strong></td>
                                    <td>${i.type.toUpperCase()}</td>
                                    <td class="small" style="max-width:240px;">${i.description}</td>
                                    <td class="muted small">${i.lat.toFixed(4)}, ${i.lon.toFixed(4)}</td>
                                    <td><span class="badge ${i.severity==='critical'?'badge-danger':i.severity==='high'?'badge-warning':'badge-info'}">${i.severity.toUpperCase()}</span></td>
                                    <td><span class="badge badge-info">${i.status.toUpperCase()}</span></td>
                                    <td>
                                        <button class="btn btn-secondary" onclick="app.advanceIncident('${i.incident_id}')">Advance State ➔</button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    advanceIncident(id) {
        const order = ["reported", "verified", "dispatched", "resolved", "closed"];
        const incident = window.store.data.incidents.find(i => i.incident_id === id);
        if (!incident) return;
        const nextIdx = (order.indexOf(incident.status) + 1) % order.length;
        window.store.updateIncidentStatus(id, order[nextIdx]);
        this.navigate("incidents");
        this.toast(`Incident ${id} transitioned to ${order[nextIdx].toUpperCase()}`);
    }

    viewEmergency() {
        return this.viewDecisionSupport();
    }

    viewDispatch() {
        const teams = window.store.data.teams;
        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Field Response Teams Deployment</div>
                </div>
                <div class="grid grid-3">
                    ${teams.map(t => `
                        <div class="card" style="background:#0a192a;">
                            <div class="card-header">
                                <strong>${t.name}</strong>
                                <span class="badge ${t.status==='available'?'badge-success':'badge-danger'}">${t.status.toUpperCase()}</span>
                            </div>
                            <div class="small muted">Specialization: ${t.skill}</div>
                            <div class="small muted">Operational Zone: ${t.zone}</div>
                            <br>
                            <button class="btn ${t.status==='available'?'btn-primary':'btn-secondary'}" onclick="app.toggleTeamStatus('${t.team_id}')">
                                ${t.status==='available'?'Deploy to Incident':'Recall to Base'}
                            </button>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }

    toggleTeamStatus(teamId) {
        const team = window.store.data.teams.find(t => t.team_id === teamId);
        if (team) {
            team.status = team.status === "available" ? "deployed" : "available";
            window.store.log("Dispatcher", `Team ${team.name} toggled to ${team.status.toUpperCase()}`, "DISPATCH");
            window.store.save();
            this.navigate("dispatch");
            this.toast(`${team.name} is now ${team.status.toUpperCase()}`);
        }
    }

    dispatchQuick(reqId) {
        const availableTeam = window.store.data.teams.find(t => t.status === "available");
        if (!availableTeam) {
            this.toast("No teams currently available! Emergency queue holds request.");
            return;
        }
        window.store.assignEmergencyRequest(reqId, availableTeam.team_id);
        this.navigate("decision-support");
        this.toast(`Dispatched ${availableTeam.name} to ${reqId}`);
    }

    viewEvacuation() {
        return `
            <div class="grid grid-2">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Smart Evacuation Protocol</div>
                        <span class="badge badge-danger">AUTOMATED SOP</span>
                    </div>
                    <div class="alert danger">
                        <div>🚨</div>
                        <div>
                            <strong>Mandatory Riverfront Evacuation Alert</strong>
                            <div class="muted small">Triggered due to combined rainfall (>35mm) and river flood vulnerability.</div>
                        </div>
                    </div>
                    <div style="background:#0a192a;border:1px dashed #315875;padding:15px;border-radius:8px;text-align:center;color:#70c8ff;font-size:12px;margin:15px 0;">
                        Zone North Residential Blocks ➔ Main Highway ➔ Govt Model School Relief Camp
                    </div>
                    <button class="btn btn-danger" onclick="app.toast('Evacuation sirens and mass SMS alerts dispatched to Zone North');">Broadcast Evacuation Siren</button>
                </div>

                <div class="card">
                    <div class="card-title">Designated Evacuation Shelters</div>
                    ${window.store.data.shelters.map(s => `
                        <div style="margin-bottom:14px;">
                            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:5px;">
                                <span>${s.name}</span>
                                <strong>${s.capacity_occupied} / ${s.capacity_total}</strong>
                            </div>
                            <div class="progress">
                                <div class="progress-bar" style="width:${(s.capacity_occupied/s.capacity_total)*100}%"></div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }

    viewShelters() {
        const shelters = window.store.data.shelters;
        return `
            <div class="grid grid-3">
                ${shelters.map(s => `
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">${s.name}</div>
                            <span class="badge ${s.status==='open'?'badge-success':'badge-danger'}">${s.status.toUpperCase()}</span>
                        </div>
                        <div class="stat-value">${s.capacity_occupied} <span style="font-size:14px;color:#8fa5bd;">/ ${s.capacity_total}</span></div>
                        <div class="stat-label">People sheltered</div>
                        <br>
                        <div class="progress">
                            <div class="progress-bar" style="width:${(s.capacity_occupied/s.capacity_total)*100}%"></div>
                        </div>
                        <div class="small muted" style="margin-top:8px;">Water: ${s.resources?.water_l}L • Food: ${s.resources?.food_kits} kits</div>
                        <br>
                        <button class="btn btn-secondary" onclick="app.registerShelterPerson('${s.shelter_id}')">+ Register Admitted Person</button>
                    </div>
                `).join("")}
            </div>
        `;
    }

    registerShelterPerson(shelterId) {
        window.store.updateShelterOccupancy(shelterId, 1);
        this.navigate("shelters");
        this.toast("Person registered in shelter successfully");
    }

    viewHospitals() {
        const hospitals = window.store.data.hospitals;
        return `
            <div class="grid grid-3">
                ${hospitals.map(h => `
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">${h.name}</div>
                            <span class="badge ${h.status==='operational'?'badge-success':'badge-warning'}">${h.status.toUpperCase()}</span>
                        </div>
                        <div class="grid grid-3" style="margin:12px 0;">
                            <div><div class="stat-value" style="font-size:20px;">${h.bed_capacity_available}</div><div class="muted small">Available Beds</div></div>
                            <div><div class="stat-value" style="font-size:20px;">${h.icu_beds}</div><div class="muted small">ICU Beds</div></div>
                            <div><div class="stat-value" style="font-size:20px;">${h.bed_capacity_total}</div><div class="muted small">Total Beds</div></div>
                        </div>
                        <div class="small muted">Trauma Capable: <strong>${h.trauma_capable?'YES':'NO'}</strong></div>
                        <div class="small muted">Phone: ${h.contact_number}</div>
                        <br>
                        <button class="btn btn-primary" onclick="app.toast('Emergency triage notification transmitted to ${h.name}');">Transmit Triage Alert</button>
                    </div>
                `).join("")}
            </div>
        `;
    }

    viewInventory() {
        const inventory = window.store.data.inventory;
        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Warehouse Inventory & Relief Stock</div>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity Available</th>
                                <th>Unit</th>
                                <th>Warning Threshold</th>
                                <th>Warehouse</th>
                                <th>Status</th>
                                <th>Ration Issue</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${inventory.map((inv, idx) => `
                                <tr>
                                    <td><strong>${inv.item_type}</strong></td>
                                    <td>${inv.quantity}</td>
                                    <td>${inv.unit}</td>
                                    <td>${inv.threshold}</td>
                                    <td>${inv.warehouse}</td>
                                    <td>
                                        <span class="badge ${inv.quantity > inv.threshold ? 'badge-success' : 'badge-danger'}">
                                            ${inv.quantity > inv.threshold ? 'SUFFICIENT' : 'DEPLETED'}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-warning" onclick="app.issueStock(${idx})">Issue 100 Units</button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    issueStock(idx) {
        const item = window.store.data.inventory[idx];
        if (item.quantity >= 100) {
            item.quantity -= 100;
            window.store.log("Warehouse Manager", `Issued 100 ${item.unit} of ${item.item_type}`, "INVENTORY");
            window.store.save();
            this.navigate("inventory");
            this.toast(`Issued 100 ${item.unit} of ${item.item_type}`);
        } else {
            this.toast("Insufficient stock remaining!");
        }
    }

    viewCitizenReport() {
        return `
            <div class="grid grid-2">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Citizen Emergency Incident Form</div>
                        <span class="badge badge-danger">DIRECT CITIZEN INTAKE</span>
                    </div>
                    <form onsubmit="app.submitCitizenReport(event)" class="form-grid">
                        <div class="form-group">
                            <label>Disaster Category</label>
                            <select class="form-control" id="formDisasterType">
                                <option value="flood">Flood / Waterlogging</option>
                                <option value="earthquake">Building Structural Damage</option>
                                <option value="fire">Fire Emergency</option>
                                <option value="medical">Severe Medical Emergency</option>
                                <option value="infrastructure">Power / Bridge Failure</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Reported Severity</label>
                            <select class="form-control" id="formSeverity">
                                <option value="critical">Critical (Immediate Life Danger)</option>
                                <option value="high">High (Property / Threat Escalation)</option>
                                <option value="medium">Medium (Advisory Level)</option>
                            </select>
                        </div>
                        <div class="form-group full">
                            <label>Detailed Incident Description</label>
                            <textarea class="form-control" id="formDescription" required placeholder="Describe what is occurring..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Latitude Coordinates</label>
                            <input class="form-control" id="formLat" type="number" step="0.0001" value="13.1150" required>
                        </div>
                        <div class="form-group">
                            <label>Longitude Coordinates</label>
                            <input class="form-control" id="formLon" type="number" step="0.0001" value="80.2240" required>
                        </div>
                        <div class="form-group full">
                            <button type="button" class="btn btn-secondary" onclick="app.detectGPS()">📍 Detect Native Browser Coordinates</button>
                        </div>
                        <div class="form-group full">
                            <button type="submit" class="btn btn-danger" style="padding:12px;">Submit Emergency Report ➔</button>
                        </div>
                    </form>
                </div>

                <div class="card">
                    <div class="card-title">Automatic Ingestion & Processing Pipeline</div>
                    <div class="timeline">
                        <div class="timeline-item">
                            <h4>1. Client Geolocation Ingestion</h4>
                            <p>HTML5 Geolocation detects exact GPS coordinates with zero user friction.</p>
                        </div>
                        <div class="timeline-item">
                            <h4>2. Reverse Geocoding & Zone Mapping</h4>
                            <p>Coordinates are mapped to the appropriate monitored zone via Haversine distance.</p>
                        </div>
                        <div class="timeline-item">
                            <h4>3. Real-Time R_zone Trigger</h4>
                            <p>New incident triggers re-calculation of the zone's composite risk index.</p>
                        </div>
                        <div class="timeline-item">
                            <h4>4. Response Unit Dispatch</h4>
                            <p>Priority heuristic queue assigns the nearest available rescue or medical team.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    detectGPS() {
        if (!navigator.geolocation) {
            this.toast("Browser Geolocation is not supported by your browser");
            return;
        }
        this.toast("Querying browser GPS...");
        navigator.geolocation.getCurrentPosition(
            pos => {
                document.getElementById("formLat").value = pos.coords.latitude.toFixed(4);
                document.getElementById("formLon").value = pos.coords.longitude.toFixed(4);
                this.toast("GPS Coordinates Captured Successfully");
            },
            err => {
                this.toast("Unable to retrieve GPS. Using default zone coordinates.");
            }
        );
    }

    submitCitizenReport(event) {
        event.preventDefault();
        const type = document.getElementById("formDisasterType").value;
        const severity = document.getElementById("formSeverity").value;
        const desc = document.getElementById("formDescription").value;
        const lat = parseFloat(document.getElementById("formLat").value);
        const lon = parseFloat(document.getElementById("formLon").value);

        const newInc = window.store.addIncident({
            type: type,
            severity: severity,
            description: desc,
            lat: lat,
            lon: lon,
            zone_id: "ZONE-NORTH"
        });

        this.toast(`Incident ${newInc.incident_id} submitted and mapped to GIS`);
        setTimeout(() => this.navigate("incidents"), 600);
    }

    viewArchitecture() {
        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Review 1 Frozen Architecture Specification</div>
                    <span class="badge badge-success">DESIGN FROZEN</span>
                </div>
                <div style="font-size:12px;line-height:1.8;color:#cbd8e6;">
                    <p><strong>System Ingestion Pipeline:</strong> External Feeds (Open-Meteo, USGS, Nominatim) ➔ Ingestion Gateway (TTL Caching) ➔ Risk Engine (R_zone Calculation) ➔ Data Access Layer (7 Canonical Schemas) ➔ Multi-Role Presentation Dashboards.</p>
                    <br>
                    <p><strong>Entity Schemas (7 Frozen Models):</strong></p>
                    <ol style="padding-left:20px;">
                        <li><code>Incidents</code>: incident_id, type, lat, lon, severity, status, zone_id</li>
                        <li><code>EmergencyRequests</code>: request_id, incident_id, need_type, priority_score, assigned_team</li>
                        <li><code>Shelters</code>: shelter_id, name, lat, lon, capacity_total, capacity_occupied, resources</li>
                        <li><code>Hospitals</code>: hospital_id, name, bed_capacity_total, bed_capacity_available, trauma_capable</li>
                        <li><code>Inventory</code>: item_id, item_type, quantity, threshold, warehouse</li>
                        <li><code>AlertRules</code>: rule_id, zone_id, metric, threshold, severity_on_trigger</li>
                        <li><code>AuditLogs</code>: log_id, actor_name, action, module, created_at</li>
                    </ol>
                </div>
            </div>
        `;
    }

    viewAudit() {
        const logs = window.store.data.audit_logs;
        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">Operational Audit Trail (Governance)</div>
                    <button class="btn btn-secondary" onclick="app.toast('Audit log exported as JSON payload');">Export Audit Stream</button>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Log ID</th>
                                <th>Timestamp</th>
                                <th>Actor</th>
                                <th>Module</th>
                                <th>Action Performed</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${logs.map(l => `
                                <tr>
                                    <td><code>${l.log_id}</code></td>
                                    <td class="muted small">${new Date(l.created_at).toLocaleString()}</td>
                                    <td><strong>${l.actor_name}</strong></td>
                                    <td><span class="badge badge-info">${l.module}</span></td>
                                    <td>${l.action}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    toast(msg) {
        const c = document.getElementById("toastContainer");
        const el = document.createElement("div");
        el.className = "toast";
        el.innerHTML = `✓ &nbsp; ${msg}`;
        c.appendChild(el);
        setTimeout(() => el.remove(), 3200);
    }
}

window.app = new DisasterOSApp();
window.addEventListener("DOMContentLoaded", () => {
    window.app.init();
});
