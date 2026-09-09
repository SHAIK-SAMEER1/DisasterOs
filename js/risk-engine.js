// Risk Engine: Mathematical implementation of composite R_zone formula and heuristic dispatch priority.

class RiskEngine {
    constructor() {
        // Calibrated weights from frozen architecture.md
        this.weights = {
            w1_rain: 0.35,
            w2_seismic: 0.30,
            w3_vuln: 0.25,
            w4_shelter: 0.20
        };
    }

    /**
     * Computes R_zone = w1 * Rain_norm + w2 * Seismic_norm + w3 * Vuln - w4 * ShelterHeadroom
     */
    evaluateZone(zone, weatherReading, seismicReading, sheltersInZone) {
        // 1. Rainfall normalized against IMD 50mm/3h heavy rainfall threshold
        const trailingRain = weatherReading?.trailing_3h_mm || 0;
        const rainNorm = Math.min(trailingRain / 50.0, 1.0);

        // 2. Seismic normalized against M7.0 benchmark
        const maxMag = seismicReading?.max_magnitude || 0;
        const seismicNorm = Math.min(maxMag / 7.0, 1.0);

        // 3. Static vulnerability index [0, 1]
        const vuln = zone.vulnerability || 0.5;

        // 4. Shelter capacity headroom ratio = 1 - (Occupied / Total)
        let totalCap = 0;
        let occCap = 0;
        sheltersInZone.forEach(s => {
            totalCap += s.capacity_total;
            occCap += s.capacity_occupied;
        });
        const shelterHeadroom = totalCap > 0 ? (1.0 - (occCap / totalCap)) : 0.0;

        // Composite Formula:
        let rawScore = (
            (this.weights.w1_rain * rainNorm) +
            (this.weights.w2_seismic * seismicNorm) +
            (this.weights.w3_vuln * vuln) -
            (this.weights.w4_shelter * shelterHeadroom)
        );

        // Clamped to [0.0, 1.0]
        const r_zone = Math.max(0.0, Math.min(1.0, parseFloat(rawScore.toFixed(3))));

        // Threshold Classification
        let severity = "advisory";
        let badgeClass = "badge-info";
        let statusText = "Normal Monitoring";

        if (r_zone >= 0.85) {
            severity = "emergency";
            badgeClass = "badge-danger";
            statusText = "CRITICAL EMERGENCY";
        } else if (r_zone >= 0.65) {
            severity = "warning";
            badgeClass = "badge-danger";
            statusText = "HIGH WARNING";
        } else if (r_zone >= 0.45) {
            severity = "watch";
            badgeClass = "badge-warning";
            statusText = "ELEVATED WATCH";
        } else if (r_zone >= 0.25) {
            severity = "advisory";
            badgeClass = "badge-info";
            statusText = "ADVISORY";
        } else {
            severity = "baseline";
            badgeClass = "badge-success";
            statusText = "STABLE";
        }

        return {
            zone_id: zone.zone_id,
            name: zone.name,
            r_zone: r_zone,
            severity: severity,
            statusText: statusText,
            badgeClass: badgeClass,
            components: {
                rain_norm: parseFloat(rainNorm.toFixed(2)),
                seismic_norm: parseFloat(seismicNorm.toFixed(2)),
                vulnerability: vuln,
                shelter_headroom: parseFloat(shelterHeadroom.toFixed(2)),
                rainfall_mm: trailingRain,
                max_mag: maxMag
            },
            evaluated_at: new Date().toISOString()
        };
    }

    /**
     * Evaluates open emergency requests and computes priority score
     */
    prioritizeRequests(requests, zoneRiskMap) {
        const severityWeights = {
            rescue: 1.0,
            medical: 0.9,
            evacuation: 0.8,
            water: 0.6,
            food: 0.5,
            shelter: 0.4
        };

        return requests.map(req => {
            const urgency = severityWeights[req.need_type] || 0.5;
            const zoneRisk = zoneRiskMap[req.zone_id]?.r_zone || 0.5;
            const count = req.people_count || 1;
            const loadPenalty = Math.log(1 + count) / Math.log(50); // Normalized log penalty

            const score = (0.50 * urgency) + (0.35 * zoneRisk) + (0.15 * Math.min(1.0, loadPenalty));
            return {
                ...req,
                computed_priority: parseFloat(score.toFixed(3))
            };
        }).sort((a, b) => b.computed_priority - a.computed_priority);
    }
}

window.riskEngine = new RiskEngine();
