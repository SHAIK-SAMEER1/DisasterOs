// RAG (Retrieval-Augmented Generation) Assistant — DisasterOS Phase 2B
// In-memory BM25-style keyword retrieval over NDMA/IMD SOP knowledge base.
// Returns top-k passages with source citations. No external API needed.

class RAGAssistant {
    constructor() {
        // Knowledge base: NDMA SOP excerpts and emergency protocols
        this.knowledgeBase = [
            {
                id: 'ndma-flood-001',
                source: 'NDMA Flood Management Guidelines, 2008',
                topic: 'flood',
                text: 'When flood risk R_zone exceeds 0.65, initiate immediate evacuation of low-lying zones. Designate higher-ground shelters as primary refuge points. Pre-position boats, life-jackets, and medical kits at flood staging areas. Alert district administration and open emergency helplines within 30 minutes of warning.'
            },
            {
                id: 'ndma-flood-002',
                source: 'NDMA Flood Management Guidelines, 2008',
                topic: 'flood',
                text: 'For flood relief operations: establish relief camps with minimum 3.5 sq.m per person. Ensure potable water supply at 15 litres per person per day. Deploy mobile medical units within 2 hours of camp establishment. Maintain disease surveillance with daily reporting to district health officer.'
            },
            {
                id: 'ndma-cyclone-001',
                source: 'NDMA Cyclone Risk Management Guidelines, 2010',
                topic: 'cyclone',
                text: 'Category 3+ cyclone protocol: evacuate coastal zones within 5km of shoreline 48 hours before landfall. Activate multi-hazard early warning system. Pre-position NDRF teams at district level. Secure fishing boats, disable power lines, and stockpile food for 7 days at each shelter.'
            },
            {
                id: 'ndma-cyclone-002',
                source: 'NDMA Cyclone Risk Management Guidelines, 2010',
                topic: 'cyclone response',
                text: 'Post-cyclone search and rescue: clear access roads within 12 hours. Deploy medical teams for trauma care. Assess structural damage before allowing re-entry. Restore power and water supply within 72 hours. Document casualties and missing persons in the incident management system.'
            },
            {
                id: 'ndma-earthquake-001',
                source: 'NDMA Earthquake Risk Mitigation, 2007',
                topic: 'earthquake seismic',
                text: 'Magnitude 5.0+ earthquake response: immediately activate incident command system. Inspect all critical infrastructure (bridges, hospitals, schools) within 4 hours. Deploy USAR (Urban Search and Rescue) teams to collapsed structures. Establish field hospitals near epicenter zones. Conduct aftershock monitoring continuously.'
            },
            {
                id: 'ndma-earthquake-002',
                source: 'NDMA Earthquake Risk Mitigation, 2007',
                topic: 'earthquake rescue triage',
                text: 'Mass casualty triage at earthquake sites follows START protocol: Immediate (red) — life-threatening but survivable injuries requiring immediate treatment. Delayed (yellow) — serious injuries stable for 30-60 minutes. Minor (green) — walking wounded. Expectant (black) — unsurvivable or deceased. Red-tag casualties take dispatch priority in resource allocation.'
            },
            {
                id: 'imd-warning-001',
                source: 'IMD Weather Warning Color Code, 2024',
                topic: 'weather warning alert',
                text: 'IMD 4-colour warning system: Green (No Warning) — normal conditions; Yellow (Watch) — bad weather, be updated; Orange (Alert) — prepare for adverse weather, be ready to act; Red (Warning) — take action, dangerous conditions imminent. Orange and Red warnings trigger DisasterOS automatic zone alert escalation.'
            },
            {
                id: 'sop-dispatch-001',
                source: 'DisasterOS SOP Handbook v1.0',
                topic: 'dispatch teams response',
                text: 'Team dispatch SOP: assign nearest capable team using haversine distance optimization. Skill matching priority: Medical → flood rescue; Structural → earthquake USAR; Logistics → general relief. Teams must acknowledge dispatch within 5 minutes via radio or app. ETA communicated to incident commander immediately.'
            },
            {
                id: 'sop-shelter-001',
                source: 'DisasterOS SOP Handbook v1.0',
                topic: 'shelter capacity management',
                text: 'Shelter overflow protocol: when occupancy reaches 90% of capacity_total, automatically flag shelter as CRITICAL. Notify coordinator to open next nearest alternate shelter. Transfer incoming evacuees to alternate facility. Maintain minimum 10% headroom reserve for emergency surges. Log all capacity changes to audit trail.'
            },
            {
                id: 'sop-audit-001',
                source: 'DisasterOS SOP Handbook v1.0',
                topic: 'audit log governance',
                text: 'Audit log integrity is maintained via SHA-256 hash chaining. Each audit entry contains: timestamp, actor ID, action, affected resource, previous block hash, and current block hash (SHA-256 of concatenated previous hash + entry JSON). The audit chain can be verified to detect any tampering with historical records.'
            },
            {
                id: 'who-mass-casualty-001',
                source: 'WHO Mass Casualty Management, 2007',
                topic: 'medical hospital mass casualty',
                text: 'Hospital surge capacity during mass casualty incidents: activate incident command within 15 minutes. Cancel elective procedures immediately. Convert waiting areas to treatment zones. Request mutual aid from neighboring hospitals when ICU occupancy exceeds 85%. Designate a single entry/exit point for MCI victims.'
            },
            {
                id: 'ndma-evacuation-001',
                source: 'NDMA Evacuation Planning Guidelines',
                topic: 'evacuation route planning',
                text: 'Evacuation route planning algorithm: identify all shelters within 30km radius, compute haversine distance from incident epicenter, assign zones to nearest shelter with available headroom. Primary and alternate routes must be pre-mapped. Avoid flood-prone corridors and structurally compromised bridges during post-earthquake evacuations.'
            }
        ];

        // Build TF-IDF-like inverted index
        this._buildIndex();
    }

    _tokenize(text) {
        return text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length > 2);
    }

    _buildIndex() {
        this.index = {};
        this.docFreq = {};

        this.knowledgeBase.forEach((doc, docIdx) => {
            const tokens = this._tokenize(doc.text + ' ' + doc.topic);
            const seen = new Set();
            tokens.forEach(tok => {
                if (!this.index[tok]) this.index[tok] = [];
                this.index[tok].push(docIdx);
                if (!seen.has(tok)) {
                    this.docFreq[tok] = (this.docFreq[tok] || 0) + 1;
                    seen.add(tok);
                }
            });
        });
    }

    /**
     * Retrieve top-k passages relevant to the query.
     * @param {string} query
     * @param {number} topK
     * @returns {Array} [{passage, source, score}]
     */
    retrieve(query, topK = 3) {
        const queryTokens = this._tokenize(query);
        const N = this.knowledgeBase.length;
        const scores = new Array(N).fill(0);

        queryTokens.forEach(tok => {
            if (!this.index[tok]) return;
            // IDF weight
            const idf = Math.log((N + 1) / ((this.docFreq[tok] || 0) + 1));
            this.index[tok].forEach(docIdx => {
                scores[docIdx] += idf;
            });
        });

        // Rank and return top-k
        const ranked = scores
            .map((score, idx) => ({ score, doc: this.knowledgeBase[idx] }))
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);

        if (ranked.length === 0) {
            return [{
                passage: 'No relevant protocol found in the DisasterOS knowledge base for this query. Please contact the district emergency management authority or refer to NDMA guidelines at ndma.gov.in.',
                source: 'DisasterOS System',
                score: 0
            }];
        }

        return ranked.map(r => ({
            passage: r.doc.text,
            source: r.doc.source,
            topic: r.doc.topic,
            score: parseFloat(r.score.toFixed(3))
        }));
    }

    /**
     * Generate a structured response combining retrieved passages.
     * @param {string} query
     * @returns {Object}  { answer, citations, retrievedAt }
     */
    query(query) {
        const results = this.retrieve(query, 3);
        const primary = results[0];

        let answer = `Based on emergency management protocols:\n\n${primary.passage}`;
        if (results.length > 1) {
            answer += `\n\nAdditional context: ${results[1].passage}`;
        }

        return {
            answer,
            citations: results.map(r => r.source),
            passages: results,
            retrievedAt: new Date().toISOString()
        };
    }
}

// Export for Node testing; expose globally in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RAGAssistant };
} else {
    window.ragAssistant = new RAGAssistant();
}
