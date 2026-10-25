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

    init(containerId = "gisMapContainer", defaultLat = null, defaultLon = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Clean up previous instance if exists
        if (this.map) {
            this.map.remove();
            this.map = null;
        }

        // Center on active city if available
        const activeLat = defaultLat || window.app?.currentRegion?.lat || 13.0827;
        const activeLon = defaultLon || window.app?.currentRegion?.lon || 80.2707;

        // Initialize Leaflet Map with dark-tuned OSM tiles
        this.map = L.map(containerId).setView([activeLat, activeLon], 12);

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
        this.renderRiskZones();
        this.renderShelters();
        this.renderHospitals();
        this.renderIncidents();
    }

    renderRiskZones() {
        if (!this.layers.riskZones) return;
        this.layers.riskZones.clearLayers();

        const zones = window.store?.data?.zones || [];
        zones.forEach(z => {
            const vuln = z.vulnerability || 0.5;
            const color = vuln > 0.65 ? "#ef4444" : vuln > 0.45 ? "#f59e0b" : "#10b981";
            const radiusMeters = Math.max(1800, (z.radius_km || 3.5) * 800);

            const circle = L.circle([z.lat, z.lon], {
                color: color,
                weight: 3,
                fillColor: color,
                fillOpacity: 0.22,
                radius: radiusMeters
            });

            const sevLabel = vuln > 0.65 ? "Red Alert (High Inundation Risk)" : vuln > 0.45 ? "Orange Alert (Moderate Watch)" : "Green Alert (Safe Zone)";

            circle.bindPopup(`
                <div style="color:#111;font-family:sans-serif;font-size:12px;min-width:180px;">
                    <strong style="font-size:13px;color:#0a192f;">${z.name}</strong><br>
                    <span style="display:inline-block;padding:2px 6px;border-radius:4px;background:${color};color:#fff;font-weight:bold;font-size:10px;margin:4px 0;">
                        ${sevLabel}
                    </span><br>
                    <strong>Zone ID:</strong> ${z.zone_id}<br>
                    <strong>Vulnerability Index:</strong> ${(vuln * 100).toFixed(0)}%<br>
                    <strong>Elevation:</strong> ${z.elevation_m || 5}m MSL<br>
                    <strong>Monitored Coverage:</strong> ${(radiusMeters / 1000).toFixed(1)} km radius
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
            const markerColor = inc.severity === "critical" ? "#ef4444" : inc.severity === "high" ? "#f59e0b" : "#35a7ff";
            
            const icon = L.divIcon({
                className: "custom-map-pin",
                html: `<div style="background:${markerColor};width:26px;height:26px;border-radius:50%;border:2px solid #fff;display:grid;place-items:center;color:#fff;font-size:13px;box-shadow:0 0 12px ${markerColor}">🚨</div>`,
                iconSize: [26, 26],
                iconAnchor: [13, 13]
            });

            const marker = L.marker([inc.lat, inc.lon], { icon: icon });
            marker.bindPopup(`
                <div style="color:#111;font-family:sans-serif;font-size:12px;min-width:180px;">
                    <strong style="font-size:13px;color:#d32f2f;">${inc.incident_id} (${(inc.type || 'EMERGENCY').toUpperCase()})</strong><br>
                    <p style="margin:4px 0;font-size:11px;">${inc.description || 'Active incident reported.'}</p>
                    <strong>Location:</strong> ${inc.location}<br>
                    <strong>Severity:</strong> <span style="color:${markerColor};font-weight:bold;">${(inc.severity || 'high').toUpperCase()}</span><br>
                    <strong>Status:</strong> ${(inc.status || 'Active').toUpperCase()}<br>
                    <strong>Assigned:</strong> ${inc.team || 'Pending Dispatch'}
                </div>
            `);
            this.layers.incidents.addLayer(marker);
        });
    }

    renderShelters() {
        if (!this.layers.shelters) return;
        this.layers.shelters.clearLayers();

        const shelters = window.store?.data?.shelters || [];
        shelters.forEach(s => {
            const cap = s.capacity || s.capacity_total || 500;
            const occ = s.occupied !== undefined ? s.occupied : (s.capacity_occupied || 0);
            const occPct = Math.round((occ / cap) * 100);
            const badgeColor = occPct >= 90 ? "#ef4444" : occPct >= 70 ? "#f59e0b" : "#10b981";

            const icon = L.divIcon({
                className: "custom-map-pin",
                html: `<div style="background:#10b981;width:26px;height:26px;border-radius:50%;border:2px solid #fff;display:grid;place-items:center;color:#fff;font-size:13px;box-shadow:0 0 10px #10b981">🏕️</div>`,
                iconSize: [26, 26],
                iconAnchor: [13, 13]
            });

            const marker = L.marker([s.lat, s.lon], { icon: icon });
            marker.bindPopup(`
                <div style="color:#111;font-family:sans-serif;font-size:12px;min-width:190px;">
                    <strong style="font-size:13px;color:#065f46;">${s.name}</strong><br>
                    <span style="font-size:11px;color:#555;">📍 ${s.location}</span><br>
                    <div style="margin:6px 0;background:#f0fdf4;padding:4px 6px;border-radius:4px;border:1px solid #bbf7d0;">
                        <strong>Beds:</strong> ${occ} / ${cap} occupied (<span style="color:${badgeColor};font-weight:bold;">${cap - occ} open</span>)<br>
                        <strong>Status:</strong> ${s.status || 'Open'}<br>
                        <strong>Supplies:</strong> ${s.water_liters || s.resources?.water_l || 5000}L Water, ${s.food_kits || s.resources?.food_kits || 800} Food Kits
                    </div>
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
            const avail = h.available !== undefined ? h.available : (h.bed_capacity_available || 50);
            const total = h.beds || h.bed_capacity_total || 400;
            const icu = h.icu !== undefined ? h.icu : (h.icu_beds || 20);

            const icon = L.divIcon({
                className: "custom-map-pin",
                html: `<div style="background:#35a7ff;width:26px;height:26px;border-radius:50%;border:2px solid #fff;display:grid;place-items:center;color:#fff;font-size:13px;box-shadow:0 0 10px #35a7ff">🏥</div>`,
                iconSize: [26, 26],
                iconAnchor: [13, 13]
            });

            const marker = L.marker([h.lat, h.lon], { icon: icon });
            marker.bindPopup(`
                <div style="color:#111;font-family:sans-serif;font-size:12px;min-width:190px;">
                    <strong style="font-size:13px;color:#1e40af;">${h.name}</strong><br>
                    <span style="font-size:11px;color:#555;">📍 ${h.location}</span><br>
                    <div style="margin:6px 0;background:#eff6ff;padding:4px 6px;border-radius:4px;border:1px solid #bfdbfe;">
                        <strong>Available Beds:</strong> <span style="color:#2563eb;font-weight:bold;">${avail}</span> / ${total}<br>
                        <strong>ICU Units:</strong> <span style="color:#d97706;font-weight:bold;">${icu} Units</span><br>
                        <strong>Trauma Capable:</strong> ${h.trauma_capable ? '✅ 24/7 Level 1' : 'General'}<br>
                        <strong>Tel:</strong> <a href="tel:${h.contact_number}">${h.contact_number}</a>
                    </div>
                </div>
            `);
            this.layers.hospitals.addLayer(marker);
        });
    }

    plotSeismicEvents(events = []) {
        if (!this.layers.seismic) return;
        this.layers.seismic.clearLayers();

        events.forEach(evt => {
            const mag = evt.mag;
            const color = mag >= 6.0 ? "#ef4444" : mag >= 4.5 ? "#f59e0b" : "#35a7ff";
            const radius = Math.max(12, mag * 5);

            const marker = L.circleMarker([evt.lat, evt.lon], {
                radius: radius,
                color: color,
                weight: 2,
                fillColor: color,
                fillOpacity: 0.35
            });

            marker.bindPopup(`
                <div style="color:#111;font-family:sans-serif;font-size:12px;">
                    <strong style="color:#d32f2f;">Seismic Event (USGS Feed)</strong><br>
                    <strong>Magnitude:</strong> M${mag.toFixed(1)}<br>
                    <strong>Place:</strong> ${evt.place}<br>
                    <strong>Depth:</strong> ${evt.depth_km} km<br>
                    <strong>Proximity:</strong> ${evt.distance_km} km from monitored city
                </div>
            `);
            this.layers.seismic.addLayer(marker);
        });
    }

    enableLocationPicker(callback) {
        if (!this.map) return;
        this.pickerCallback = callback;

        if (this.pickerMarker) {
            this.map.removeLayer(this.pickerMarker);
            this.pickerMarker = null;
        }

        let handled = false;
        const onLocationPicked = (lat, lng) => {
            if (handled) return;
            handled = true;

            // Remove listeners
            this.map.off('click', mapClickHandler);
            if (this.layers) {
                Object.values(this.layers).forEach(group => {
                    if (group && group.eachLayer) {
                        group.eachLayer(layer => {
                            layer.off('click', layerClickHandler);
                        });
                    }
                });
            }

            if (this.pickerMarker) {
                this.map.removeLayer(this.pickerMarker);
            }

            this.pickerMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: "custom-picker-pin",
                    html: `<div style="background:#f59e0b;width:28px;height:28px;border-radius:50%;border:2px solid #fff;display:grid;place-items:center;font-size:15px;box-shadow:0 0 14px #f59e0b">📍</div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                })
            }).addTo(this.map);

            if (this.pickerCallback) {
                this.pickerCallback(lat, lng);
            }
        };

        const mapClickHandler = (e) => {
            if (e && e.latlng) {
                onLocationPicked(e.latlng.lat, e.latlng.lng);
            }
        };

        const layerClickHandler = (e) => {
            if (e && e.latlng) {
                if (this.map) this.map.closePopup();
                if (e.originalEvent) {
                    e.originalEvent.stopPropagation();
                }
                onLocationPicked(e.latlng.lat, e.latlng.lng);
            }
        };

        this.map.once('click', mapClickHandler);

        // Allow clicking ANY location inside operational zones, shelters, or markers
        if (this.layers) {
            Object.values(this.layers).forEach(group => {
                if (group && group.eachLayer) {
                    group.eachLayer(layer => {
                        layer.once('click', layerClickHandler);
                    });
                }
            });
        }
    }
}

// Global GIS map controller instance
if (typeof module !== "undefined" && module.exports) {
    module.exports = { GISMapController };
} else {
    window.gisMap = new GISMapController();
}
