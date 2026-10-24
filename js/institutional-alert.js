// Institutional Proximity & Medical Surge Alerting Engine — DisasterOS
// Automatically identifies nearby hospitals, shelters, and tactical response units.
// Generates clinical tips, resource availability, and injured casualty routing.

class InstitutionalAlertEngine {
    constructor() {
        this.cityAssetTemplates = {
            mumbai: {
                name: "Mumbai Metropolitan Region",
                lat: 18.9220, lon: 72.8347,
                zones: [
                    { zone_id: "ZONE-MUM-COAST", name: "South Coastal Colaba", lat: 18.9067, lon: 72.8147, vulnerability: 0.72, elevation_m: 3.5 },
                    { zone_id: "ZONE-MUM-MITHI", name: "Mithi River Basin (Kurla)", lat: 19.0657, lon: 72.8794, vulnerability: 0.88, elevation_m: 2.1 },
                    { zone_id: "ZONE-MUM-DOCK", name: "Mazagon Port & Docks", lat: 18.9680, lon: 72.8490, vulnerability: 0.65, elevation_m: 4.0 },
                    { zone_id: "ZONE-MUM-SUB", name: "Andheri Transit Corridor", lat: 19.1197, lon: 72.8464, vulnerability: 0.58, elevation_m: 8.2 }
                ],
                hospitals: [
                    { hospital_id: "HOSP-MUM-01", name: "KEM King Edward Memorial Hospital", location: "Parel", lat: 19.0028, lon: 72.8427, beds: 500, available: 82, icu: 30, trauma_capable: true, contact_number: "+91-22-2410-7000" },
                    { hospital_id: "HOSP-MUM-02", name: "Lilavati Trauma & Critical Care", location: "Bandra", lat: 19.0514, lon: 72.8290, beds: 350, available: 64, icu: 22, trauma_capable: true, contact_number: "+91-22-2675-1000" },
                    { hospital_id: "HOSP-MUM-03", name: "Sion Municipal Trauma Center", location: "Sion", lat: 19.0357, lon: 72.8601, beds: 400, available: 31, icu: 14, trauma_capable: true, contact_number: "+91-22-2407-6381" }
                ],
                shelters: [
                    { shelter_id: "SHEL-MUM-01", name: "Bandra Kurla Complex Relief Hall", location: "BKC", lat: 19.0660, lon: 72.8680, capacity: 1500, occupied: 620 },
                    { shelter_id: "SHEL-MUM-02", name: "Dadar Civic Stadium Shelter", location: "Dadar", lat: 19.0190, lon: 72.8430, capacity: 900, occupied: 410 }
                ]
            },
            kolkata: {
                name: "Kolkata Greater Metropolitan Area",
                lat: 22.5726, lon: 88.3639,
                zones: [
                    { zone_id: "ZONE-KOL-HOOGHLY", name: "Hooghly Riverfront Basin", lat: 22.5850, lon: 88.3450, vulnerability: 0.78, elevation_m: 4.8 },
                    { zone_id: "ZONE-KOL-EAST", name: "East Kolkata Wetland Buffer", lat: 22.5510, lon: 88.4200, vulnerability: 0.62, elevation_m: 3.1 },
                    { zone_id: "ZONE-KOL-PORT", name: "Kidderpore Docklands", lat: 22.5360, lon: 88.3180, vulnerability: 0.70, elevation_m: 5.2 }
                ],
                hospitals: [
                    { hospital_id: "HOSP-KOL-01", name: "SSKM Medical College & Trauma", location: "Bhowanipore", lat: 22.5390, lon: 88.3440, beds: 450, available: 70, icu: 28, trauma_capable: true, contact_number: "+91-33-2223-1589" },
                    { hospital_id: "HOSP-KOL-02", name: "Calcutta National Medical Hospital", location: "Benjapukur", lat: 22.5480, lon: 88.3710, beds: 300, available: 45, icu: 16, trauma_capable: true, contact_number: "+91-33-2284-4834" }
                ],
                shelters: [
                    { shelter_id: "SHEL-KOL-01", name: "Salt Lake Stadium Relief Camp", location: "Bidhannagar", lat: 22.5690, lon: 88.4060, capacity: 2000, occupied: 780 }
                ]
            },
            delhi: {
                name: "Delhi National Capital Region",
                lat: 28.6139, lon: 77.2090,
                zones: [
                    { zone_id: "ZONE-DEL-YAMUNA", name: "Yamuna Floodplain Corridor", lat: 28.6450, lon: 77.2480, vulnerability: 0.82, elevation_m: 205.0 },
                    { zone_id: "ZONE-DEL-CENTRAL", name: "Central Ridge & Lutyens", lat: 28.6180, lon: 77.2050, vulnerability: 0.35, elevation_m: 225.0 },
                    { zone_id: "ZONE-DEL-EAST", name: "East Delhi Low-Lying Basin", lat: 28.6290, lon: 77.2910, vulnerability: 0.68, elevation_m: 202.0 }
                ],
                hospitals: [
                    { hospital_id: "HOSP-DEL-01", name: "AIIMS Apex Trauma Centre", location: "Safdarjung", lat: 28.5672, lon: 77.2069, beds: 600, available: 112, icu: 45, trauma_capable: true, contact_number: "+91-11-2658-8500" },
                    { hospital_id: "HOSP-DEL-02", name: "Safdarjung Hospital Emergency", location: "Ring Road", lat: 28.5701, lon: 77.2058, beds: 480, available: 88, icu: 32, trauma_capable: true, contact_number: "+91-11-2616-5060" }
                ],
                shelters: [
                    { shelter_id: "SHEL-DEL-01", name: "Yamuna Sports Complex Relief Center", location: "Surajmal Vihar", lat: 28.6610, lon: 77.3050, capacity: 1800, occupied: 520 }
                ]
            },
            tokyo: {
                name: "Greater Tokyo Metropolis (Seismic Zone)",
                lat: 35.6762, lon: 139.6503,
                zones: [
                    { zone_id: "ZONE-TYO-BAY", name: "Tokyo Bay Coastal Inundation Zone", lat: 35.6320, lon: 139.7900, vulnerability: 0.60, elevation_m: 2.5 },
                    { zone_id: "ZONE-TYO-SHINJUKU", name: "Shinjuku High-Density Urban Sector", lat: 35.6938, lon: 139.7034, vulnerability: 0.42, elevation_m: 38.0 },
                    { zone_id: "ZONE-TYO-SUMIDA", name: "Sumida Lowland Riverfront", lat: 35.7100, lon: 139.8100, vulnerability: 0.74, elevation_m: 1.8 }
                ],
                hospitals: [
                    { hospital_id: "HOSP-TYO-01", name: "Tokyo Disaster Medical Center", location: "Tachikawa", lat: 35.7080, lon: 139.4050, beds: 500, available: 95, icu: 40, trauma_capable: true, contact_number: "+81-42-526-5511" },
                    { hospital_id: "HOSP-TYO-02", name: "St. Luke's International Hospital", location: "Tsukiji", lat: 35.6672, lon: 139.7745, beds: 520, available: 110, icu: 35, trauma_capable: true, contact_number: "+81-3-3541-5151" }
                ],
                shelters: [
                    { shelter_id: "SHEL-TYO-01", name: "Tokyo Metropolitan Gymnasium Evacuation Base", location: "Sendagaya", lat: 35.6798, lon: 139.7120, capacity: 3000, occupied: 650 }
                ]
            }
        };
    }

    _haversine(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /**
     * Finds nearest medical institutions and generates surge advisories.
     * @param {number} targetLat 
     * @param {number} targetLon 
     * @param {Array} hospitalsList 
     * @param {number} radiusKm 
     */
    findNearbyHospitals(targetLat, targetLon, hospitalsList = [], radiusKm = 20) {
        if (!hospitalsList || hospitalsList.length === 0) return [];

        const enriched = hospitalsList.map(h => {
            const dist = this._haversine(targetLat, targetLon, h.lat, h.lon);
            const estTransitMinutes = Math.max(4, Math.round(dist * 2.8)); // urban transit speed ~22 km/h
            return {
                ...h,
                distance_km: parseFloat(dist.toFixed(2)),
                transit_minutes: estTransitMinutes,
                clinical_advisory: this._generateClinicalAdvisory(h, dist)
            };
        });

        // Filter within radius and sort ascending by distance
        return enriched
            .filter(h => h.distance_km <= radiusKm)
            .sort((a, b) => a.distance_km - b.distance_km);
    }

    _generateClinicalAdvisory(hospital, distanceKm) {
        const avail = hospital.available || hospital.bed_capacity_available || 10;
        const icu = hospital.icu || hospital.icu_beds || 2;
        
        let tips = [];
        if (avail < 20) {
            tips.push("CRITICAL LOAD: Activate surge ward; convert observation bays to intermediate care.");
        } else {
            tips.push(`STABLE CAPACITY: Ready to receive up to ${Math.min(avail, 25)} acute casualties.`);
        }

        if (icu > 5) {
            tips.push(`High ICU availability (${icu} beds) — prioritize severe chest/cranial trauma.`);
        } else {
            tips.push(`Low ICU headroom (${icu} beds) — reserve strictly for Category Red START triage.`);
        }

        if (distanceKm < 5.0) {
            tips.push("IMMEDIATE PERIMETER: Pre-position mobile triage tent at emergency bay entrance.");
        }

        return {
            status: avail > 30 ? "Ready for Intake" : "High Occupancy Warning",
            recommendations: tips,
            protocols: ["START Protocol Triage", "Mass Casualty Code Amber", "IV Fluid Resuscitation"]
        };
    }

    /**
     * Routes an injured citizen or casualty to the designated hospital.
     */
    routeInjuredToHospital(incidentId, hospitalId, victimCount = 1) {
        const hasStore = typeof window !== 'undefined' && window.store;
        if (!hasStore) return { success: false, message: "Store unavailable" };

        const hosp = window.store.data.hospitals.find(h => h.hospital_id === hospitalId);
        if (!hosp) return { success: false, message: "Hospital not found" };

        const currentAvail = hosp.available || hosp.bed_capacity_available || 10;
        if (currentAvail < victimCount) {
            return {
                success: false,
                message: `Insufficient bed capacity at ${hosp.name}. Only ${currentAvail} beds remaining.`
            };
        }

        // Deduct beds and log routing
        window.store.updateHospitalBeds(hospitalId, currentAvail - victimCount);
        window.store.log(
            "Medical Dispatcher",
            `Routed ${victimCount} casualty(ies) from incident ${incidentId} to ${hosp.name}. Remaining beds: ${currentAvail - victimCount}`,
            "MEDICAL_TRIAGE"
        );

        return {
            success: true,
            hospital_name: hosp.name,
            allocated_beds: victimCount,
            remaining_beds: currentAvail - victimCount,
            contact: hosp.contact_number
        };
    }
}

// Export for Node testing & browser window
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InstitutionalAlertEngine };
} else {
    window.institutionalEngine = new InstitutionalAlertEngine();
}
