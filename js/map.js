// GIS Map Controller: Initializes Leaflet.js with OpenStreetMap tiles and renders interactive disaster layers.

class GISMapController {
    constructor() {
        this.map = null;
        this.layers = {
            riskZones: null,
            incidents: null,
            shelters: null,
            hospitals: null,
            seismic: null
        };
    }

    init(containerId = "gisMapContainer", defaultLat = 13.0827, defaultLon = 80.2707) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Clean up previous instance if exists
        if (this.map) {
            this.map.remove();
            this.map = null;
        }

        // Initialize Leaflet Map with dark-tuned OSM tiles
        this.map = L.map(containerId).setView([defaultLat, defaultLon], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Initialize feature groups
        this.layers.riskZones = L.layerGroup().addTo(this.map);
        this.layers.incidents = L.layerGroup().addTo(this.map);
        this.layers.shelters = L.layerGroup().addTo(this.map);
        this.layers.hospitals = L.layerGroup().addTo(this.map);
        this.layers.seismic = L.layerGroup().addTo(this.map);

        // Render entities from global store
        this.renderAll();
    }

    renderAll() {
        if (!this.map) return;
        this.renderShelters();
        this.renderHospitals();
        this.renderIncidents();
        this.renderRiskZones();
    }

    renderRiskZones() {
        if (!this.layers.riskZones) return;
        this.layers.riskZones.clearLayers();

        const zones = window.store?.data?.zones || [];
        zones.forEach(z => {
            const color = z.vulnerability > 0.6 ? "#ff5263" : z.vulnerability > 0.4 ? "#ffb84d" : "#35d49a";
            const circle = L.circle([z.lat, z.lon], {
                color: color,
                fillColor: color,
                fillOpacity: 0.18,
                radius: (z.radius_km || 10) * 250 // Scale for visual display
            });

            circle.bindPopup(`
                <div style="color:#111;font-family:sans-serif;font-size:12px;">
                    <strong style="font-size:13px;">${z.name}</strong><br>
                    <strong>Zone ID:</strong> ${z.zone_id}<br>
                    <strong>Base Vulnerability:</strong> ${(z.vulnerability * 100).toFixed(0)}%<br>
                    <span style="color:#d32f2f;font-weight:bold;">Monitored Early Warning Zone</span>
                </div>
            `);
            this.layers.riskZones.addLayer(circle);
        });
    }

    renderIncidents() {
        if (!this.layers.incidents) return;
        this.layers.incidents.clearLayers();

        const incidents = window.store?.data?.incidents || [];
        incidents.forEach(inc => {
            const markerColor = inc.severity === "critical" ? "#ff5263" : inc.severity === "high" ? "#ffb84d" : "#35a7ff";
            
            const icon = L.divIcon({
                className: "custom-map-pin",
                html: `<div style="background:${markerColor};width:24px;height:24px;border-radius:50%;border:2px solid #fff;display:grid;place-items:center;color:#fff;font-size:12px;font-weight:bold;box-shadow:0 0 10px ${markerColor}">🚨</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const marker = L.marker([inc.lat, inc.lon], { icon: icon });
            marker.bindPopup(`
                <div style="color:#111;font-family:sans-serif;font-size:12px;">
                    <strong style="font-size:13px;color:#d32f2f;">${inc.incident_id} (${inc.type.toUpperCase()})</strong><br>
                    <p style="margin:4px 0;">${inc.description}</p>
                    <strong>Severity:</strong> <span style="color:${markerColor};font-weight:bold;">${inc.severity.toUpperCase()}</span><br>
                    <strong>Status:</strong> ${inc.status.toUpperCase()}
                </div>
            `);
            this.layers.incidents.addLayer(marker);
        });
    }

    enableLocationPicker(callback) {
        if (!this.map) return;
        this.pickerCallback = callback;

        if (this.pickerMarker) {
            this.map.removeLayer(this.pickerMarker);
            this.pickerMarker = null;
        }

        this.map.once('click', (e) => {
            const { lat, lng } = e.latlng;
            this.pickerMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: "custom-picker-pin",
                    html: `<div style="background:#ffb84d;width:28px;height:28px;border-radius:50%;border:2px solid #fff;display:grid;place-items:center;font-size:14px;box-shadow:0 0 14px #ffb84d">📍</div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                })
            }).addTo(this.map);

            if (this.pickerCallback) {
                this.pickerCallback(lat, lng);
            }
        });
    }

    renderShelters() {
        if (!this.layers.shelters) return;
        this.layers.shelters.clearLayers();

        const shelters = window.store?.data?.shelters || [];
        shelters.forEach(s => {
            const icon = L.divIcon({
                className: "custom-map-pin",
                html: `<div style="background:#35d49a;width:24px;height:24px;border-radius:50%;border:2px solid #fff;display:grid;place-items:center;color:#fff;font-size:12px;font-weight:bold;box-shadow:0 0 8px #35d49a">⌂</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const marker = L.marker([s.lat, s.lon], { icon: icon });
            marker.bindPopup(`
                <div style="color:#111;font-family:sans-serif;font-size:12px;">
                    <strong style="font-size:13px;color:#1b5e20;">${s.name}</strong><br>
                    <strong>Occupancy:</strong> ${s.capacity_occupied} / ${s.capacity_total} (${((s.capacity_occupied/s.capacity_total)*100).toFixed(0)}%)<br>
                    <strong>Status:</strong> <span style="font-weight:bold;">${s.status.toUpperCase()}</span><br>
                    <strong>Resources:</strong> Water: ${s.resources?.water_l}L, Food: ${s.resources?.food_kits} kits
                </div>
            `);
            this.layers.shelters.addLayer(marker);
        });
    }

    renderHospitals() {
        if (!this.layers.hospitals) return;
        this.layers.hospitals.clearLayers();

        const hospitals = window.store?.data?.hospitals || [];
        hospitals.forEach(h => {
            const icon = L.divIcon({
                className: "custom-map-pin",
                html: `<div style="background:#35a7ff;width:24px;height:24px;border-radius:50%;border:2px solid #fff;display:grid;place-items:center;color:#fff;font-size:12px;font-weight:bold;box-shadow:0 0 8px #35a7ff">✚</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const marker = L.marker([h.lat, h.lon], { icon: icon });
            marker.bindPopup(`
                <div style="color:#111;font-family:sans-serif;font-size:12px;">
                    <strong style="font-size:13px;color:#0d47a1;">${h.name}</strong><br>
                    <strong>Beds Available:</strong> ${h.bed_capacity_available} / ${h.bed_capacity_total}<br>
                    <strong>ICU Beds:</strong> ${h.icu_beds}<br>
                    <strong>Trauma Capable:</strong> ${h.trauma_capable ? 'Yes' : 'No'}<br>
                    <strong>Phone:</strong> ${h.contact_number}
                </div>
            `);
            this.layers.hospitals.addLayer(marker);
        });
    }

    plotSeismicEvents(events) {
        if (!this.layers.seismic) return;
        this.layers.seismic.clearLayers();

        events.forEach(ev => {
            const circle = L.circleMarker([ev.lat, ev.lon], {
                radius: Math.max(5, ev.mag * 3.5),
                color: "#ff9800",
                fillColor: "#ff9800",
                fillOpacity: 0.5,
                weight: 2
            });

            circle.bindPopup(`
                <div style="color:#111;font-family:sans-serif;font-size:12px;">
                    <strong style="color:#e65100;">USGS Seismic Telemetry</strong><br>
                    <strong>Magnitude:</strong> M ${ev.mag}<br>
                    <strong>Location:</strong> ${ev.place}<br>
                    <strong>Time:</strong> ${ev.time}
                </div>
            `);
            this.layers.seismic.addLayer(circle);
        });
    }
}

window.gisMap = new GISMapController();
