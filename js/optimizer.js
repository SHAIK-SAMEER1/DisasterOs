// Constrained Dispatch Optimizer — DisasterOS Phase 2B
// Algorithm: Greedy nearest-capable-team assignment with Haversine distance matrix.
// Reduces total travel distance vs random assignment; logs improvement metric.

class DispatchOptimizer {
    constructor() {
        this.lastRunMetrics = null;
    }

    // Haversine distance in km between two lat/lon points
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
     * Optimize dispatch assignments.
     * @param {Array} requests   - [{id, need_type, lat, lon, priority_score, people_count}]
     * @param {Array} teams      - [{id, name, skill, lat, lon, available}]
     * @returns {Object}  { assignments, metrics }
     */
    optimize(requests, teams) {
        const openRequests = requests.filter(r => r.status !== 'resolved' && r.status !== 'closed');
        const availableTeams = teams.filter(t => t.available !== false);

        if (openRequests.length === 0 || availableTeams.length === 0) {
            return { assignments: [], metrics: { message: 'No open requests or teams available.' } };
        }

        // Sort requests by descending priority score for greedy pass
        const sortedReqs = [...openRequests].sort((a, b) =>
            (b.priority_score || 0.5) - (a.priority_score || 0.5));

        const usedTeams = new Set();
        const assignments = [];

        for (const req of sortedReqs) {
            // Filter teams by capability constraint (skill match or 'general')
            const capable = availableTeams.filter(t =>
                !usedTeams.has(t.id) &&
                (t.skill === req.need_type || t.skill === 'general' || !req.need_type)
            );

            if (capable.length === 0) continue;

            // Assign nearest capable team
            let best = null, bestDist = Infinity;
            for (const team of capable) {
                const d = this._haversine(req.lat || 13.08, req.lon || 80.27,
                    team.lat || 13.08, team.lon || 80.27);
                if (d < bestDist) { bestDist = d; best = team; }
            }

            if (best) {
                usedTeams.add(best.id);
                assignments.push({
                    request_id: req.id,
                    team_id: best.id,
                    team_name: best.name,
                    need_type: req.need_type,
                    distance_km: parseFloat(bestDist.toFixed(2)),
                    priority_score: req.priority_score || 0.5,
                    people_affected: req.people_count || 1
                });
            }
        }

        // Compute baseline: random assignment for comparison
        const shuffled = [...availableTeams].sort(() => Math.random() - 0.5);
        let randomTotal = 0;
        openRequests.slice(0, assignments.length).forEach((req, i) => {
            const t = shuffled[i % shuffled.length];
            randomTotal += this._haversine(
                req.lat || 13.08, req.lon || 80.27,
                t.lat || 13.08, t.lon || 80.27);
        });

        const optimizedTotal = assignments.reduce((s, a) => s + a.distance_km, 0);
        const reductionPct = randomTotal > 0
            ? (((randomTotal - optimizedTotal) / randomTotal) * 100).toFixed(1)
            : 0;

        const metrics = {
            total_requests: openRequests.length,
            assigned: assignments.length,
            unassigned: openRequests.length - assignments.length,
            optimized_total_km: parseFloat(optimizedTotal.toFixed(2)),
            random_baseline_km: parseFloat(randomTotal.toFixed(2)),
            distance_reduction_pct: parseFloat(reductionPct),
            timestamp: new Date().toISOString()
        };

        this.lastRunMetrics = metrics;
        return { assignments, metrics };
    }
}

// Export for Node testing; also expose globally in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DispatchOptimizer };
} else {
    window.optimizer = new DispatchOptimizer();
}
