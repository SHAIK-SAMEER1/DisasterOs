// RAG (Retrieval-Augmented Generation) & Conversational Emergency Assistant — DisasterOS
// Covers:
// 1. Natural conversational intent handling (greetings, identity, capabilities, emergency contacts)
// 2. Live operational store grounding (shelters, hospitals, active incidents, rescue units, inventory)
// 3. In-memory BM25 retrieval over a comprehensive NDMA, IMD, WHO, and Sphere humanitarian knowledge base.

class RAGAssistant {
    constructor() {
        this.knowledgeBase = [
            // --- FLOOD & WATERLOGGING ---
            {
                id: 'ndma-flood-001',
                source: 'NDMA Flood Management Guidelines, 2008',
                topic: 'flood evacuation warning alert r_zone water level river',
                text: 'When flood risk R_zone exceeds 0.65 or IMD issues an Orange/Red alert, initiate immediate evacuation of low-lying riverfront zones. Designate elevated community shelters as primary refuge. Pre-position inflatable boats, life-jackets, and emergency trauma dressings at flood staging areas. Open local emergency helplines within 30 minutes.'
            },
            {
                id: 'ndma-flood-002',
                source: 'Sphere Humanitarian Minimum Standards & NDMA Flood Camps',
                topic: 'flood relief camp water food sanitation standards capacity',
                text: 'Flood relief camps must guarantee minimum 3.5 sq.m covered area per person. Potable drinking water supply must be maintained at minimum 15 litres per person per day. Provide separate sanitation blocks (1 latrine per 20 persons). Deploy mobile medical teams within 2 hours of camp opening to screen for waterborne gastrointestinal illnesses.'
            },
            {
                id: 'ndma-flood-003',
                source: 'NDMA Urban Waterlogging Action Plan',
                topic: 'urban flood waterlogging drainage pump siphon street storm',
                text: 'For urban street waterlogging: activate high-capacity submersible drainage pumps at underpasses and low-lying transit corridors. Deploy traffic diversions away from submerged roads. Coordinate with municipal power utilities to de-energize submerged transformers and electrical poles to prevent electrocution hazards.'
            },

            // --- CYCLONE & HIGH WINDS ---
            {
                id: 'ndma-cyclone-001',
                source: 'NDMA Cyclone Risk Management Guidelines, 2010',
                topic: 'cyclone storm hurricane coastal wind landfall evacuation',
                text: 'Category 3+ cyclone protocol: evacuate coastal habitations within 5 km of shoreline 48 hours prior to anticipated landfall. Issue complete fishing ban and secure all harbor vessels. De-energize high-voltage power grids before landfall wind speeds exceed 65 knots. Stockpile non-perishable rations and drinking water for 7 days in cyclone shelters.'
            },
            {
                id: 'ndma-cyclone-002',
                source: 'NDMA Cyclone Recovery Manual',
                topic: 'post cyclone recovery tree clearance road power restoration',
                text: 'Post-cyclone priority sequence: (1) Clear arterial roads using tree-clearing chainsaws within 12 hours. (2) Restore power lines to trauma hospitals and water pumping stations within 24 hours. (3) Distribute chlorination tablets and tarpaulins. (4) Conduct structural damage inspections before permitting evacuees to return.'
            },

            // --- EARTHQUAKE & SEISMIC ---
            {
                id: 'ndma-eq-001',
                source: 'NDMA Earthquake Risk Mitigation, 2007',
                topic: 'earthquake seismic tremor magnitude epicenter collapse drop cover hold',
                text: 'During seismic shaking: execute "Drop, Cover, and Hold On" under sturdy furniture away from glass facades. Magnitude 5.0+ earthquake post-shock protocol: immediately isolate city gas mains and electrical grids. Inspect bridges, hospital buildings, and schools within 4 hours. Continuously monitor seismic stations for dangerous aftershocks.'
            },
            {
                id: 'who-triage-001',
                source: 'WHO Mass Casualty Management & START Triage Protocol',
                topic: 'mass casualty triage start protocol red yellow green black medical hospital injury injured',
                text: 'Mass casualty incidents (MCI) follow START triage: RED (Immediate) — critical life-threatening injuries but high survival probability (airway compromise, tension pneumothorax, severe arterial bleed). YELLOW (Delayed) — serious stable injuries (fractures, controlled bleed). GREEN (Minor) — walking wounded. BLACK (Expectant) — deceased or non-survivable trauma. Red tag patients take first dispatch priority to trauma centers.'
            },
            {
                id: 'ndma-eq-002',
                source: 'NDRF Urban Search & Rescue (USAR) Manual',
                topic: 'usar search rescue rubble trapped collapsed building dog k9',
                text: 'Urban Search and Rescue in collapsed concrete structures: establish a perimeter cordon of 1.5 times structure height. Deploy acoustic listening devices and K9 search teams to detect void spaces. Never operate heavy excavators until acoustic search confirms absence of living victims in targeted debris sectors.'
            },

            // --- HEATWAVE ---
            {
                id: 'ndma-heat-001',
                source: 'NDMA National Heatwave Action Plan, 2023',
                topic: 'heatwave extreme heat temperature sunstroke dehydration ors cooling',
                text: 'When ambient temperature exceeds 40°C in plains or 30°C in hills (or heat index exceeds 45°C), declare Heatwave Alert. Open municipal cooling centers and shaded water drinking stations. Reschedule outdoor labor between 11:00 AM and 4:00 PM. Equip all ambulances with ice packs, intravenous saline, and Oral Rehydration Salts (ORS).'
            },

            // --- LANDSLIDE & MUDFLOW ---
            {
                id: 'ndma-landslide-001',
                source: 'Geological Survey of India & NDMA Landslide Protocol',
                topic: 'landslide mudflow slope hills debris rockfall rainfall saturation',
                text: 'Landslide warning indicators include: sudden soil cracking along slopes, tilting utility poles, muddy spring discharges, and continuous rainfall exceeding 100 mm in 24 hours. Immediately close mountainous ghat roads and evacuate downslope settlements to designated ridge shelters.'
            },

            // --- TSUNAMI ---
            {
                id: 'incois-tsunami-001',
                source: 'INCOIS Indian Tsunami Early Warning Centre Protocol',
                topic: 'tsunami ocean wave coastal undersea earthquake warning sea retreat',
                text: 'Following undersea earthquake (M ≥ 6.5 within ocean basin): if coastal water recedes abnormally, a tsunami wave train is imminent. Evacuate immediately inland or to elevations ≥ 30 meters above sea level. Never stay on shoreline to observe waves. Tsunami waves can persist for several hours.'
            },

            // --- FIRE & HAZMAT CHEMICAL ---
            {
                id: 'ndma-fire-001',
                source: 'National Building Code & NDMA Fire Safety Guidelines',
                topic: 'fire emergency smoke electrical evacuation extinguisher alarm flames',
                text: 'Commercial/residential fire response: activate manual pull alarms and evacuate using stairwells (never elevators). If smoke is present, stay low to the floor where air is cleaner. Isolate electrical mains. Fire tenders must establish water supply within 8 minutes of arrival.'
            },
            {
                id: 'ndma-hazmat-001',
                source: 'NDMA Chemical Industrial Disaster Management',
                topic: 'chemical gas leak hazmat toxic poison industrial cloud vapor',
                text: 'Toxic chemical or industrial gas leak protocol: identify wind direction and evacuate crosswind or upwind (never downwind). Cover nose and mouth with wet cloth or respirator. Establish an exclusion hot zone of minimum 500 meters around leak epicenter. Neutralize plume with fog water curtains.'
            },

            // --- FIRST AID & CPR ---
            {
                id: 'redcross-firstaid-001',
                source: 'International Red Cross & First Aid Guidelines',
                topic: 'first aid cpr bleeding burn fracture bandage emergency shock wounded',
                text: 'Essential First Aid: (1) Severe Bleeding: Apply direct continuous pressure with sterile gauze; use tourniquet 5 cm above wound if extremity arterial bleed does not stop. (2) CPR: 30 chest compressions at 100-120 bpm followed by 2 rescue breaths. (3) Burns: Cool under clean running water for 20 minutes; do not apply ice or grease. (4) Fractures: Immobilize joint above and below fracture before moving patient.'
            },

            // --- EMERGENCY HELPLINES & CONTACTS ---
            {
                id: 'govt-helplines-001',
                source: 'Ministry of Home Affairs Disaster Emergency Helplines',
                topic: 'helpline contact phone call police ambulance fire ndrf number emergency',
                text: 'National Emergency Toll-Free Numbers (India): National Disaster Response Force (NDRF): 1078 | Unified Emergency Helpline: 112 | Police: 100/112 | Fire Emergency: 101 | Ambulance & Medical Trauma: 108 | State Disaster Management Authority: 1070 | Women Safety: 1091 | Childline: 1098.'
            },

            // --- GO-BAG EMERGENCY KIT ---
            {
                id: 'ndma-kit-001',
                source: 'NDMA Citizen Preparedness Handbook',
                topic: 'emergency kit go bag supplies food water battery radio flashlight documents medicines',
                text: 'Citizen Emergency Go-Bag checklist: 3 days of non-perishable food and 3 liters of water per person, battery-powered or hand-crank radio, high-lumen LED flashlight with spare batteries, basic first aid kit, waterproof pouch with photocopies of identity documents and deeds, prescribed medicines, whistle for signaling, and power bank.'
            },

            // --- DISASTER MITIGATION & SOP AUTOMATION ---
            {
                id: 'disasteros-sop-001',
                source: 'DisasterOS Standard Operating Procedure Architecture',
                topic: 'sop workflow automation rule dispatch trigger pipeline architecture',
                text: 'DisasterOS automated SOP pipeline: When environmental R_zone crosses threshold 0.65 (Warning) or 0.85 (Emergency), the platform triggers: (1) Broadcast push alerts to citizen portal. (2) Automated activation of nearest evacuation shelter. (3) Heuristic queue generation for rescue units matching need types. (4) Hash-sealed audit log generation.'
            }
        ];

        this._buildIndex();
    }

    _tokenize(text) {
        if (!text) return [];
        return text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length >= 2);
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

    _handleConversationalOrStore(query) {
        const raw = query.trim().toLowerCase();

        // 1. Greetings
        const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'namaste', 'hola'];
        if (greetings.some(g => raw === g || raw.startsWith(g + ' ') || raw.endsWith(' ' + g))) {
            return {
                answer: "Hello! I am the DisasterOS Tactical Intelligence Assistant. I provide real-time situational guidance, official NDMA/WHO emergency operating procedures, live shelter bed availability, active incident tracking, and medical triage protocols. How can I assist your operations today?",
                citations: ['DisasterOS Tactical Intelligence Kernel'],
                source: 'DisasterOS Assistant',
                isConversational: true
            };
        }

        // 2. Identity & Capabilities
        if (raw.includes('who are you') || raw.includes('what can you do') || raw === 'help' || raw === 'commands') {
            return {
                answer: "I am DisasterOS AI Assistant — an operational retrieval system grounded in real-time sensor telemetry and official disaster management guidelines.\n\nYou can ask me:\n• Operational Store: 'Which shelters have beds?', 'What hospitals are available?', 'How many incidents are active?'\n• Protocols: 'What is the flood evacuation SOP?', 'Explain START triage', 'Cyclone safety steps'\n• Preparedness: 'What should be in an emergency go-bag?', 'Emergency contact numbers', 'First aid for severe bleeding'",
                citations: ['DisasterOS Capabilities Registry'],
                source: 'DisasterOS Assistant',
                isConversational: true
            };
        }

        // 3. Emergency Contact Numbers
        if (raw.includes('emergency number') || raw.includes('helpline') || raw.includes('phone number') || raw.includes('call police') || raw.includes('call ambulance')) {
            return {
                answer: "🚨 Emergency Contact Helplines (National):\n• NDRF Disaster Helpline: 1078\n• Unified National Emergency: 112\n• Ambulance & Trauma Medical: 108\n• Fire Emergency: 101\n• Police Control Room: 100 / 112\n• State Disaster Management Control: 1070\n• Women Safety Line: 1091",
                citations: ['Ministry of Home Affairs & NDRF Official Directory'],
                source: 'Official National Helplines',
                isConversational: true
            };
        }

        // 4. Live Store Data: Shelters
        if ((raw.includes('shelter') && (raw.includes('bed') || raw.includes('avail') || raw.includes('open') || raw.includes('capacity') || raw.includes('where'))) || raw === 'shelters') {
            const hasStore = typeof window !== 'undefined' && window.store && window.store.data?.shelters;
            if (hasStore) {
                const shelters = window.store.data.shelters;
                const open = shelters.filter(s => (s.occupied || 0) < (s.capacity || s.capacity_total || 500));
                const totalBeds = shelters.reduce((a, b) => a + (b.capacity || b.capacity_total || 0), 0);
                const totalOcc = shelters.reduce((a, b) => a + (b.occupied || b.capacity_occupied || 0), 0);
                const freeBeds = totalBeds - totalOcc;

                let text = `🏕️ Real-Time Shelter Headroom Report:\n• Total Shelters Monitored: ${shelters.length}\n• Total Bed Capacity: ${totalBeds} | Currently Occupied: ${totalOcc} (${((totalOcc / totalBeds) * 100).toFixed(0)}%)\n• Available Bed Headroom: ${freeBeds} beds remaining across designated centres.\n\nTop Open Shelters:\n`;
                open.slice(0, 4).forEach(s => {
                    const free = (s.capacity || s.capacity_total) - (s.occupied || 0);
                    text += `• ${s.name} (${s.location}): ${free} open beds available (${s.status})\n`;
                });
                return {
                    answer: text,
                    citations: ['DisasterOS Operational Shelter Store (Live Cache)'],
                    source: 'DisasterOS Operational Store',
                    isStore: true
                };
            }
        }

        // 5. Live Store Data: Hospitals
        if (raw.includes('hospital') || raw.includes('icu') || raw.includes('trauma bed') || raw.includes('doctor')) {
            const hasStore = typeof window !== 'undefined' && window.store && window.store.data?.hospitals;
            if (hasStore) {
                const hospitals = window.store.data.hospitals;
                const totalAvail = hospitals.reduce((a, b) => a + (b.available || b.bed_capacity_available || 0), 0);
                const totalICU = hospitals.reduce((a, b) => a + (b.icu || b.icu_beds || 0), 0);

                let text = `🏥 Real-Time Medical Trauma Center Status:\n• Monitored Hospitals: ${hospitals.length}\n• Available General Beds: ${totalAvail}\n• Available ICU Units: ${totalICU}\n\nHospital Directory:\n`;
                hospitals.slice(0, 4).forEach(h => {
                    text += `• ${h.name} (${h.location}): ${h.available || h.bed_capacity_available} beds free, ${h.icu || h.icu_beds} ICU | Tel: ${h.contact_number || 'N/A'}\n`;
                });
                return {
                    answer: text,
                    citations: ['DisasterOS Hospital Resource Register (Live Telemetry)'],
                    source: 'DisasterOS Operational Store',
                    isStore: true
                };
            }
        }

        // 6. Live Store Data: Incidents
        if (raw.includes('active incident') || raw.includes('how many incident') || raw.includes('critical emergency') || raw === 'incidents') {
            const hasStore = typeof window !== 'undefined' && window.store && window.store.data?.incidents;
            if (hasStore) {
                const incs = window.store.data.incidents;
                const active = incs.filter(i => i.status !== 'resolved' && i.status !== 'closed');
                const critical = incs.filter(i => i.severity === 'critical');

                let text = `🚨 Live Incident Triage Overview:\n• Total Tracked Incidents: ${incs.length}\n• Active Incident Queue: ${active.length}\n• Critical Life-Threatening: ${critical.length}\n\nRecent Critical Incidents:\n`;
                critical.slice(0, 3).forEach(c => {
                    text += `• [${c.incident_id}] ${c.type.toUpperCase()} at ${c.location} (${c.description || 'Active incident'})\n`;
                });
                return {
                    answer: text,
                    citations: ['DisasterOS Incident Lifecycle Register'],
                    source: 'DisasterOS Operational Store',
                    isStore: true
                };
            }
        }

        return null;
    }

    retrieve(query, topK = 3) {
        const queryTokens = this._tokenize(query);
        const N = this.knowledgeBase.length;
        const scores = new Array(N).fill(0);

        queryTokens.forEach(tok => {
            if (!this.index[tok]) return;
            const idf = Math.log((N + 1) / ((this.docFreq[tok] || 0) + 1));
            this.index[tok].forEach(docIdx => {
                scores[docIdx] += idf;
            });
        });

        const ranked = scores
            .map((score, idx) => ({ score, doc: this.knowledgeBase[idx] }))
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);

        if (ranked.length === 0) {
            return [{
                passage: "DisasterOS Safety Guidance: In any sudden natural hazard, ensure personal safety first (Drop, Cover, and Hold for earthquakes; evacuate to elevated ground for floods; secure indoors for cyclones). Call 112 or NDRF helpline 1078 for immediate life-safety dispatch. You can also ask me about specific emergency SOPs (flood, cyclone, earthquake, heatwave, triage, first aid).",
                source: 'DisasterOS Civil Defense Guidance',
                topic: 'general emergency safety',
                score: 0.1
            }];
        }

        return ranked.map(r => ({
            passage: r.doc.text,
            source: r.doc.source,
            topic: r.doc.topic,
            score: parseFloat(r.score.toFixed(3))
        }));
    }

    query(query) {
        if (!query || !query.trim()) {
            return {
                answer: "Please enter an operational question, disaster protocol query, or emergency request.",
                citations: ['DisasterOS Tactical Assistant'],
                passages: [],
                retrievedAt: new Date().toISOString()
            };
        }

        // 1. Check conversational greetings, identity, or live operational store queries first
        const directMatch = this._handleConversationalOrStore(query);
        if (directMatch) {
            return {
                answer: directMatch.answer,
                citations: directMatch.citations,
                passages: [{ passage: directMatch.answer, source: directMatch.source, score: 1.0 }],
                retrievedAt: new Date().toISOString()
            };
        }

        // 2. BM25 Knowledge Base retrieval
        const results = this.retrieve(query, 3);
        const primary = results[0];

        let answer = `Emergency Protocol Guidance:\n\n${primary.passage}`;
        if (results.length > 1 && results[1].score > 0.5) {
            answer += `\n\nAdditional Context:\n${results[1].passage}`;
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
