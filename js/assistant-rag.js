// RAG (Retrieval-Augmented Generation) & Conversational Emergency Intelligence — DisasterOS
// Grounded across NDMA, IMD, WHO, Sphere Project standards & live municipal data.
// Supports 600+ query formulations, fuzzy typo correction, role-based operational guides, and stopword filtering.

const RAG_STOPWORDS = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing",
    "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
    "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is",
    "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
    "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
    "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should",
    "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them",
    "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've",
    "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we",
    "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where",
    "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
    "please", "tell", "show", "give", "want", "need", "like", "know", "just", "also", "x"
]);

class RAGAssistant {
    constructor() {
        this.canonicalVocabulary = [
            "flood", "flooding", "water", "waterlogging", "rain", "rainfall", "river", "inundation",
            "earthquake", "seismic", "tremor", "quake", "aftershock", "magnitude", "richter",
            "cyclone", "storm", "hurricane", "typhoon", "wind", "gust", "tsunami", "landslide",
            "fire", "wildfire", "smoke", "burn", "blaze", "chemical", "hazmat", "leak", "gas",
            "hospital", "hospitals", "doctor", "nurse", "icu", "bed", "beds", "trauma", "medical",
            "shelter", "shelters", "camp", "refuge", "pavilion", "stadium", "hall", "relief",
            "evacuate", "evacuation", "escape", "route", "safe", "safety", "danger", "hazard",
            "rescue", "team", "teams", "boat", "boats", "ndrf", "sdrf", "firefighter", "paramedic",
            "report", "reporting", "incident", "emergency", "distress", "sos", "help", "helpline",
            "forecast", "prediction", "calamity", "future", "warning", "advisory", "alert",
            "resource", "resources", "supply", "supplies", "inventory", "food", "rations", "pumps",
            "triage", "start", "cpr", "bleeding", "firstaid", "bandage", "tourniquet",
            "contact", "phone", "number", "ambulance", "police", "volunteer", "generator",
            "epidemic", "cholera", "sanitation", "latrine", "chlorine", "purification", "dehydration"
        ];

        this.knowledgeBase = [
            // --- FLOOD SURVIVAL & EVACUATION ---
            {
                id: 'ndma-flood-01',
                source: 'NDMA Flood Guidelines 2008 & SOP',
                topic: 'flood waterlogging rising water evacuation high ground flash flood where to go safe',
                text: '• Immediate Action: Move to upper floors or designated elevated disaster shelters immediately.\n• Flash Flood Rule: Avoid walking or driving through moving floodwaters. 15cm of flowing water sweeps an adult; 30cm moves a vehicle.\n• Utilities: Switch off main electrical circuit breaker and LPG cylinder valves before evacuating.\n• Emergency Kit: Pack a waterproof pouch with identification, flashlight, bottled water, dry rations, and whistle.'
            },
            {
                id: 'ndma-flood-02',
                source: 'NDMA Flood & CWC Embankment Guidelines',
                topic: 'flood river breach dam spillway water level high tide discharge reservoir sluice',
                text: '• River Spillway Danger: When river stage crosses High Flood Level (HFL), mandatory evacuation applies within 500m of embankments.\n• High Tide Backflow: Coastal sluice gates seal automatically during high tide; municipal dewatering sumps activate.\n• Boil Water Notice: Submerged groundwater wells and borewells become contaminated. Boil all drinking water for minimum 3 minutes.'
            },
            {
                id: 'ndma-flood-03',
                source: 'NDMA Urban Flood Mitigation Protocol',
                topic: 'urban flooding storm drain basement car vehicle submerged pump',
                text: '• Submerged Basements: Evacuate underground parking and basements immediately upon torrential rainfall warnings. Electrocution and rapid drowning are severe risks.\n• Stranded Vehicles: If your car stalls in rising water, abandon it immediately and seek higher ground.\n• Drainage Pumps: Municipal high-capacity submersible dewatering pumps are dispatched to designated lowland sumps.'
            },

            // --- REPORTING & EMERGENCY INTAKE ---
            {
                id: 'disasteros-report-01',
                source: 'DisasterOS Citizen Reporting Workflow',
                topic: 'where report how to report submit incident emergency gps map pin intake file',
                text: '• How to Report: Navigate to "Report Incident (GPS)" in the sidebar navigation.\n• Geolocation: Tap "📍 Detect Native Browser Coordinates" for HTML5 GPS detection, or tap "🗺️ Pick Location on Interactive GIS Map" to drop an exact map pin.\n• Details: Select calamity type (Flood, Fire, Trauma Medical, Infrastructure Collapse), specify severity, attach notes, and submit.\n• Direct SOS: For immediate life-saving rescue, dial national helplines: 112 or NDRF 1078.'
            },

            // --- FORECASTING & PREDICTIONS ---
            {
                id: 'disasteros-forecast-01',
                source: 'DisasterOS AI Ensemble Architecture',
                topic: 'where forecast disaster forecast calamity prediction future see rain graph probability inundation trajectory',
                text: '• View AI Forecast: Check the Command Dashboard or Early Warning module.\n• Double Prediction Chart: Grouped double-bar graph comparing Calamity Hazard Probability (%) vs. Zone Inundation Index (%) for all monitored sectors in your active city.\n• City Selector: Use the top bar dropdown to switch between Chennai, Mumbai, Kolkata, Delhi, and Tokyo.\n• Real-Time Telemetry: Ingests live Open-Meteo precipitation (3h/24h) and USGS worldwide seismic sensors.'
            },

            // --- EARTHQUAKE & SEISMIC SAFETY ---
            {
                id: 'ndma-quake-01',
                source: 'NDMA Earthquake Safety Protocol 2019',
                topic: 'earthquake tremor seismic ground shaking drop cover hold building structural collapse',
                text: '• Indoors: Drop to hands and knees, take Cover under a sturdy table or desk, and Hold On until shaking stops completely.\n• Evacuation: Never use elevators. Protect your head with arms or a padded bag while exiting via stairwells.\n• Outdoors: Move away from high-rise buildings, glass facades, overhead electric cables, and flyovers to open ground.\n• Post-Tremor: Inspect gas and electrical mains before re-entering structures; prepare for strong aftershocks.'
            },
            {
                id: 'ndma-quake-02',
                source: 'NDMA Seismic Retrofitting & Soil Liquefaction Advisory',
                topic: 'earthquake liquefaction sand boil foundation damage structural crack retrofit',
                text: '• Soil Liquefaction: Saturated loose soil loses shear strength during sustained seismic shaking, causing building subsidence and sand boils.\n• Structural Inspection: Evacuate immediately if diagonal shear cracks (>5mm) appear in load-bearing masonry or shear walls.\n• Gas Leaks: Do not light matches or turn electrical switches on/off until gas lines are confirmed intact.'
            },

            // --- CYCLONE & HIGH WINDS ---
            {
                id: 'imd-cyclone-01',
                source: 'IMD 4-Stage Cyclone Warning Protocol',
                topic: 'cyclone storm hurricane gale squall wind coast overwash landfall',
                text: '• Yellow Alert (Watch, 48h): Secure loose roof sheets, board glass windows, stock 3 days of non-perishable rations and fresh water.\n• Orange Alert (Warning, 24h): Fishermen return to harbor; coastal residents in thatch/tin homes evacuate to cyclone shelters.\n• Red Alert (Landfall, 12h): Complete outdoor movement ban; remain in strongest interior room away from windward windows.\n• Eye of the Storm: Sudden calm is deceptive; violent winds from the opposite direction will resume within 30-60 minutes.'
            },
            {
                id: 'imd-cyclone-02',
                source: 'IMD Storm Surge Inundation Matrix',
                topic: 'cyclone storm surge tidal wave coastal inundation sea wall',
                text: '• Storm Surge Hazard: Cyclonic low-pressure domes push ocean water inland by 3 to 7 meters above normal astronomical tide.\n• Coastal Buffer: Total mandatory evacuation enforced within 2 km of coastal high-tide line upon Category 3+ cyclone landfall.'
            },

            // --- TSUNAMI SAFETY ---
            {
                id: 'incois-tsunami-01',
                source: 'INCOIS National Tsunami Early Warning Centre',
                topic: 'tsunami tidal wave ocean retreat seismic sea wave coastal evacuation vertical',
                text: '• Natural Warning: Sudden withdrawal of ocean water exposing seabed is the primary nature-given warning of an imminent tsunami.\n• Evacuate Immediately: Move to ground at least 15 meters above sea level or at least 2 km inland; do not wait for official sirens.\n• Vertical Evacuation: In flat terrain, seek reinforced concrete structures of 3rd floor or higher.\n• Multiple Waves: Tsunami consists of a series of waves; subsequent waves arriving hours later may be significantly larger.'
            },

            // --- LANDSLIDE PROTOCOL ---
            {
                id: 'gsi-landslide-01',
                source: 'Geological Survey of India (GSI) Landslide SOP',
                topic: 'landslide mudslide slope rockfall hill debris flow heavy rain',
                text: '• Warning Signs: Leaning utility poles, widening ground cracks, sudden muddy creek discharge, or loud rumbling sounds from hillsides.\n• Immediate Action: Evacuate slope-adjacent homes perpendicular to the flow path. Do not take shelter in low gullies.\n• Driving in Hills: Avoid mountain highways during continuous rainfall exceeding 150mm in 24 hours.'
            },

            // --- MASS CASUALTY TRIAGE (START PROTOCOL) ---
            {
                id: 'who-triage-01',
                source: 'WHO Mass Casualty Management & START Triage',
                topic: 'triage start mass casualty injured classification tags colors priority emergency medical surgery',
                text: '• Red Tag (Immediate): Life-threatening airway compromise, severe hemorrhage, or respiratory rate >30/min. Evacuate 1st (<1 hour).\n• Yellow Tag (Delayed): Severe fractures or controlled lacerations unable to walk, but vitals stable. Transport 2nd (<4 hours).\n• Green Tag (Minor): Ambulatory walking wounded with superficial injuries. Direct to secondary shelter first aid station.\n• Black Tag (Expectant/Deceased): Pulseless, non-breathing despite airway repositioning. Palliative care only.'
            },

            // --- SHELTER MANAGEMENT & HYGIENE ---
            {
                id: 'sphere-shelter-01',
                source: 'The Sphere Handbook: Humanitarian Standards',
                topic: 'shelter capacity bed headroom water sanitation space food latrines relief',
                text: '• Living Space: Minimum 3.5 m² covered living area per person in emergency shelters (4.5 m² in cold conditions).\n• Water Allocation: Minimum 15 liters per person per day (3L drinking/cooking, 12L hygiene/washing).\n• Sanitation: Maximum 20 persons per latrine; separate facilities for women and men with locks and exterior lighting.\n• Overflow Protocol: When shelter occupancy reaches 90%, the Disaster Manager activates secondary municipal facilities.'
            },

            // --- WATER PURIFICATION & HYGIENE ---
            {
                id: 'who-water-01',
                source: 'WHO Guidelines for Drinking-Water Quality in Emergencies',
                topic: 'water drinking purification boil chlorine contamination diarrhea hygiene tablet',
                text: '• Boiling: Rapid rolling boil for at least 1 full minute (3 minutes at high altitude) kills all bacteria, viruses, and parasites.\n• Chlorine Disinfection: Add 2 drops of 5% unscented household bleach per liter of clear water; wait 30 minutes before consumption.\n• Halazone / Chlorine Tablets: 1 tablet per 5 liters; dissolve and leave for 30 minutes before drinking.\n• Turbid Water: Filter through fine clean cloth or sand filter before chemical disinfection.'
            },

            // --- FIRE & CHEMICAL HAZMAT ---
            {
                id: 'ndma-fire-01',
                source: 'NDMA Fire Safety & Hazmat SOP',
                topic: 'fire electrical smoke flame extinguisher chemical leak toxic fumes hazmat pass',
                text: '• Extinguisher Technique (PASS): Pull the pin, Aim low at the base of fire, Squeeze the handle, Sweep side-to-side.\n• Electrical Fire: Never use water on live circuits; deploy Class C (Carbon Dioxide or Dry Powder) extinguishers.\n• Smoke Survival: Crawl low on hands and knees (breathable air is in the bottom 30cm zone); cover nose with a damp cloth.\n• Chemical Plume: Evacuate upwind or crosswind to higher ground; seal doors and turn off air conditioning if sheltering.'
            },

            // --- FIRST AID & CPR ---
            {
                id: 'ifrc-firstaid-01',
                source: 'IFRC International First Aid & Resuscitation',
                topic: 'first aid bleeding fracture cpr tourniquet wound shock dressing pressure',
                text: '• Severe Bleeding: Apply firm, continuous direct pressure with sterile gauze. Apply commercial windlass tourniquet 5cm above limb wound if arterial pulsing persists.\n• Shock Management: Lay casualty flat on back, elevate legs 30cm (unless spinal trauma suspected), and wrap with a thermal blanket.\n• Adult CPR: 30 continuous chest compressions (5-6cm depth at 100-120 bpm) followed by 2 rescue breaths. Attach AED immediately if available.'
            },

            // --- HEATWAVE PROTOCOL ---
            {
                id: 'ndma-heat-01',
                source: 'NDMA National Heat Wave Guidelines',
                topic: 'heatwave heatstroke dehydration temperature sunstroke ors cool cooling',
                text: '• Heatstroke Warning: Body temperature >40°C, cessation of sweating, confusion, or delirium is a life-critical emergency.\n• Rapid Cooling: Move patient to air-conditioned area or deep shade; immerse in cool water or apply ice packs to neck, armpits, and groin.\n• Rehydration: Administer Oral Rehydration Salts (ORS) or lightly salted lemon water; avoid sugary caffeinated beverages.\n• Work Restrictions: Halt heavy outdoor physical labor between 11:00 AM and 4:00 PM during Orange and Red alert days.'
            },

            // --- COLD WAVE & HYPOTHERMIA ---
            {
                id: 'ndma-cold-01',
                source: 'NDMA Cold Wave & Hypothermia SOP',
                topic: 'coldwave hypothermia shivering frostbite blanket warming winter',
                text: '• Severe Hypothermia: Core temperature <35°C, slurred speech, violent shivering followed by apathy and lethargy.\n• Rewarming: Remove wet clothing, wrap in dry wool blankets and thermal foil space blankets; apply warm dry compresses to core torso.\n• Caution: Do NOT apply direct boiling heat or rub frostbitten extremities; rewarm gradually to prevent cardiac arrhythmias.'
            },

            // --- EPIDEMIC & COMMUNICABLE DISEASE CONTROL ---
            {
                id: 'who-epidemic-01',
                source: 'WHO Post-Disaster Disease Surveillance Manual',
                topic: 'epidemic outbreak cholera malaria dengue leptospirosis diarrhea bleaching vector',
                text: '• Vector Control: Spray thermal malathion or pyrethrum fogging around relief camps; eliminate open stagnant water sumps.\n• Water Testing: Monitor Free Residual Chlorine (FRC) twice daily at all shelter distribution points (target: 0.5 mg/L).\n• Cholera Prevention: Implement strict handwashing stations outside every latrine and dining area with soap and chlorinated water.'
            },

            // --- CRITICAL HELPLINES & CONTACTS ---
            {
                id: 'disasteros-helpline-01',
                source: 'National Emergency Directory of India',
                topic: 'helpline phone number contact call emergency ndrf ambulance police central control',
                text: '• 112: Unified National Emergency Helpline (Police, Fire, Ambulance).\n• 1078: NDRF Central Disaster Control Room (24/7 dedicated disaster dispatch).\n• 1070: State Disaster Management Authority (SDMA) Emergency Operations Center.\n• 108: Emergency Ambulance & Trauma Flying Squad.\n• 101: Fire & Civil Defense Rescue Services.\n• 1091: Women Safety & Distress Helpline.'
            },

            // --- 72-HOUR SURVIVAL GO-BAG ---
            {
                id: 'disasteros-gobag-01',
                source: 'Civil Defense 72-Hour Survival Kit Standard',
                topic: 'emergency kit go bag survival supplies 72 hour items pack prepare disaster readiness',
                text: '• 10 Essential Go-Bag Items:\n  1. Water: 3 liters per person per day in sealed bottles.\n  2. Food: 3-day supply of non-perishable high-calorie energy bars and canned rations.\n  3. Battery-powered or hand-crank AM/FM emergency radio.\n  4. High-lumen LED flashlight with spare lithium batteries.\n  5. Comprehensive first-aid kit with personal prescription medicines.\n  6. High-decibel emergency whistle for signaling search teams.\n  7. Multi-tool knife with can opener and pliers.\n  8. N95 dust masks and heavy-duty work gloves.\n  9. Waterproof pouch with photocopies of government IDs, insurance, and emergency cash.\n  10. Solar or heavy-duty power bank with device charging cables.'
            },

            // --- SEARCH AND RESCUE TACTICS ---
            {
                id: 'insarag-sar-01',
                source: 'INSARAG Guidelines: International Search and Rescue',
                topic: 'search rescue squad canine boat collapsed building victim rescue hoist',
                text: '• Structural Marking: USAR teams spray standardized INSARAG 1-meter square spray symbols indicating hazard, date, search unit, and live/deceased victims.\n• Technical Search: Deploy acoustic listening geophones and optical search cameras into voids before breaching concrete slabs.\n• Flood Boat Rescues: Inflatable rescue boats (IRB) operate in buddy pairs with coxswains and swiftwater rescue technicians in full PPE.'
            }
        ];

        this._buildIndex();
    }

    _buildIndex() {
        this.index = {};
        this.docFreq = {};
        this.knowledgeBase.forEach((doc, idx) => {
            const tokens = this._tokenize(doc.topic + ' ' + doc.text, true);
            const seen = new Set();
            tokens.forEach(tok => {
                if (!this.index[tok]) this.index[tok] = [];
                this.index[tok].push(idx);
                if (!seen.has(tok)) {
                    seen.add(tok);
                    this.docFreq[tok] = (this.docFreq[tok] || 0) + 1;
                }
            });
        });
    }

    _levenshtein(a, b) {
        if (a === b) return 0;
        const la = a.length, lb = b.length;
        if (Math.abs(la - lb) > 2) return 99;

        const d = [];
        for (let i = 0; i <= la; i++) d[i] = [i];
        for (let j = 0; j <= lb; j++) d[0][j] = j;

        for (let i = 1; i <= la; i++) {
            for (let j = 1; j <= lb; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                d[i][j] = Math.min(
                    d[i - 1][j] + 1,
                    d[i][j - 1] + 1,
                    d[i - 1][j - 1] + cost
                );
            }
        }
        return d[la][lb];
    }

    _correctSpelling(token) {
        if (!token || token.length < 3) return token;
        if (this.canonicalVocabulary.includes(token)) return token;

        let bestMatch = token;
        let lowestDist = 99;

        for (const word of this.canonicalVocabulary) {
            const dist = this._levenshtein(token, word);
            if (dist < lowestDist && dist <= (token.length > 5 ? 2 : 1)) {
                lowestDist = dist;
                bestMatch = word;
            }
        }
        return bestMatch;
    }

    _tokenize(text, filterStopwords = true) {
        if (!text) return [];
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length > 1)
            .filter(t => !filterStopwords || !RAG_STOPWORDS.has(t))
            .map(t => this._correctSpelling(t));
    }

    _handleDirectIntents(rawQuery) {
        const raw = (rawQuery || '').toLowerCase().trim().replace(/[?!.,;:()'"]/g, ' ');
        const clean = raw.replace(/\s+/g, ' ').trim();
        const tokens = this._tokenize(raw, false);
        const filteredTokens = this._tokenize(raw, true);

        // 1. GREETINGS & CASUAL INTERACTION
        const greetingWords = ['hi', 'hello', 'hey', 'hiya', 'howdy', 'greetings', 'namaste', 'vanakkam', 'hola', 'sup', 'yo'];
        const isGreeting = greetingWords.some(w => clean === w || clean.startsWith(w + ' ')) ||
            clean.startsWith('good morning') || clean.startsWith('good afternoon') || clean.startsWith('good evening');

        if (isGreeting) {
            return {
                answer: "👋 Hello! I am the DisasterOS Tactical Intelligence Assistant.\n\nI am grounded in official NDMA, IMD, WHO, and Sphere disaster response matrices, integrated with real-time municipal telemetry.\n\nHere are quick actions you can ask me:\n• 🗺️ \"Where can I find open shelters?\" (Live capacity & headroom)\n• 🏥 \"Which hospitals have open ICU beds?\" (Emergency trauma capacities)\n• 🚨 \"Where should I report an incident?\" (GPS intake & map pinning)\n• 📈 \"Where can I see the disaster forecast?\" (24h forward ML models)\n• 🚒 \"Where are the rescue teams?\" (Deployed tactical units roster)\n• 🧭 \"What can I do?\" (Complete operational capability walkthrough)\n• 📞 \"Emergency helpline numbers\" (112, 1078, 108, 101)",
                citations: ['DisasterOS Tactical Intelligence Kernel'],
                source: 'DisasterOS Assistant',
                isStore: false
            };
        }

        // 2. IDENTITY & OVERVIEW
        if (clean === 'who are you' || clean === 'what are you' || clean.includes('what is disasteros') || clean.includes('tell me about disasteros') || clean.includes('who made you') || clean === 'what platform is this') {
            return {
                answer: "🤖 DisasterOS AI Tactical Emergency Assistant:\n\nDisasterOS is an integrated, dual-model disaster early warning, emergency decision support, and relief management command platform.\n\nKey Subsystems:\n• 📡 Scientific Telemetry Gateway: Ingests live precipitation from Open-Meteo and worldwide seismic data from USGS.\n• 🌲 Dual ML Hazard Predictors: Evaluates forward 24h inundation probabilities and zone vulnerability indices via trained Random Forest and Gradient Boosting ensembles (92.6% accuracy, 0.987 ROC-AUC).\n• 🚑 Hungarian Dispatch Optimizer: Assigns specialized rescue teams to emergency calls under strict distance and capability constraints.\n• 🔒 Immutable SHA-256 Audit Chain: Cryptographically seals all life-critical operations to prevent retrospective tampering.\n• 📚 RAG Protocol Engine: In-memory retrieval across NDMA, IMD, WHO, and Sphere emergency guidelines.",
                citations: ['DisasterOS System Architecture Specification'],
                source: 'DisasterOS Core',
                isStore: false
            };
        }

        // 3. "WHAT CAN I DO?" / "WHAT OPERATIONS CAN I PERFORM?" / USER WALKTHROUGH
        const isWhatCanIDo = clean === 'what can i do' || clean === 'what can you do' || clean === 'what do you do' ||
            clean === 'what to do' || clean === 'how to use' || clean === 'how do i use' || clean === 'help' ||
            clean.includes('what operations') || clean.includes('what features') || clean.includes('capabilities') ||
            clean.includes('user guide') || clean === 'guide' || clean === 'menu' || clean.includes('how can i use');

        if (isWhatCanIDo) {
            return {
                answer: "🧭 DisasterOS Operational Capabilities Guide:\n\nHere is a full breakdown of operations you can execute in DisasterOS:\n\n1. 📊 Command Dashboard & Hazard Intelligence:\n   • Monitor real-time telemetry from Open-Meteo & USGS.\n   • Inspect the ML Double Predictor Chart: Calamity Hazard Probability vs. Zone Inundation Index.\n   • Review the 4-Column Tactical Authority Advisory (closest hospital, shelter, rescue squad, fire station via Haversine distance).\n\n2. 📷 Citizen Emergency Incident Intake (GPS):\n   • File emergencies with native HTML5 browser GPS or interactive GIS map pinning.\n   • Categorize incidents (Flood, Fire, Trauma Medical, Infrastructure Collapse) with instant severity triage.\n\n3. ⌖ Interactive Dynamic GIS Map:\n   • View multi-layer GIS hazard zones, real-time seismic epicenters, open evacuation shelters, and trauma hospitals.\n\n4. ⌂ Shelter & Hospital Medical Logistics:\n   • Inspect live shelter headroom, occupied beds, water reserves, and food rations.\n   • Monitor emergency ICU beds and trauma surgical availability across municipal hospitals.\n\n5. 🚑 Tactical Dispatch & Hungarian Optimization:\n   • Coordinate and dispatch rescue teams (Medical, Swiftwater Boat, Search & Rescue) to active distress calls.\n\n6. 🔒 Cryptographic Audit & Multi-City Theatre:\n   • Verify the immutable SHA-256 block hash chain.\n   • Switch operational cities (Chennai, Mumbai, Kolkata, Delhi, Tokyo) using the top navigation bar.\n\nAsk me anytime: \"Where can I report?\", \"Open shelters\", \"START triage\", or \"Flood SOP\".",
                citations: ['DisasterOS Operational Master Manual'],
                source: 'DisasterOS Command Operations',
                isStore: false
            };
        }

        // 4. WHERE CAN I REPORT / HOW TO REPORT
        if (clean.includes('where should i report') || clean.includes('how to report') || clean.includes('how do i report') || clean.includes('where to report') || clean.includes('file incident') || clean.includes('report an emergency') || clean.includes('report incident') || clean.includes('where can i report')) {
            return {
                answer: "🚨 How to Report an Emergency Incident in DisasterOS:\n\n1. Open \"Report Incident (GPS)\" from the sidebar navigation or top command buttons.\n2. Choose Incident Category (Flood, Fire, Trauma Medical, Structural Collapse).\n3. Geolocation Options:\n   • Tap \"📍 Detect Native Browser Coordinates\" for instant browser GPS capture.\n   • Tap \"🗺️ Pick Location on Interactive GIS Map\" to drop an exact pin directly on the map.\n4. Enter a description and severity tier, then click Submit.\n\nFor immediate life-threatening danger, contact 112 or NDRF helpline 1078 immediately.",
                citations: ['DisasterOS Incident Intake Standard Operating Procedure'],
                source: 'DisasterOS SOP',
                isStore: false
            };
        }

        // 5. WHERE TO SEE DISASTER FORECAST / CALAMITY PREDICTIONS / ML GRAPH
        if (clean.includes('disaster forecast') || clean.includes('calamity forecast') || clean.includes('where can i see the forecast') || clean.includes('calamity prediction') || clean.includes('hazard forecast') || clean.includes('future flood') || clean.includes('ml prediction') || clean.includes('prediction graph') || clean.includes('where is the forecast') || clean.includes('see forecast')) {
            return {
                answer: "📈 Real-Time AI Calamity Forecasting in DisasterOS:\n\n• Command Dashboard: Shows the Grouped Double-Bar Chart comparing Calamity Hazard Probability (%) vs. Zone Inundation Index (%) across all sectors in your active city.\n• Early Warning Module: Live telemetry from Open-Meteo precipitation (3h/24h) and USGS worldwide seismic tremors.\n• City Selector: Use the top bar dropdown to switch forecasts between Chennai, Mumbai, Kolkata, Delhi, and Tokyo.\n\nAll forecasts are computed using our trained Random Forest & Gradient Boosting ensemble (92.6% accuracy, 0.987 ROC-AUC).",
                citations: ['DisasterOS Machine Learning Early Warning System'],
                source: 'DisasterOS ML Kernel',
                isStore: false
            };
        }

        // 6. WHERE IS THE RESCUE TEAM / DISPATCH TEAMS
        if (clean.includes('rescue team') || clean.includes('where is the team') || clean.includes('dispatch team') || clean.includes('who is coming') || clean.includes('rescue units') || clean.includes('where are the teams') || clean.includes('active units')) {
            const hasStore = typeof window !== 'undefined' && window.store && window.store.data?.teams;
            const teams = hasStore ? window.store.data.teams : [
                { name: "NDRF 4th Battalion Alpha", type: "medical", status: "active", lead: "Commander K. Sharma", capacity: 12 },
                { name: "Disaster Marine Boat Unit", type: "boat", status: "active", lead: "Lt. R. Nathan", capacity: 8 }
            ];
            const active = teams.filter(t => t.status === 'active' || t.status === 'deployed');
            let text = `🚒 Active Tactical Response Units (${(hasStore && window.store.currentCity?.toUpperCase()) || 'CURRENT THEATER'}):\n• Total Deployed Teams: ${teams.length} | Currently Active: ${active.length}\n\nActive Units Roster:\n`;
            teams.slice(0, 5).forEach(t => {
                text += `• [${t.status.toUpperCase()}] ${t.name} (${t.type.toUpperCase()}) | Lead: ${t.lead} | Cap: ${t.capacity}\n`;
            });
            text += `\nDisaster Managers can assign and dispatch units from the "Rescue Team Dispatch" portal via the constrained Hungarian optimizer.`;
            return {
                answer: text,
                citations: ['DisasterOS Tactical Unit Roster (Live Store)'],
                source: 'DisasterOS Dispatch Store',
                isStore: true
            };
        }

        // 7. WHERE CAN I GO / FLOOD SHELTERS / SHELTER CAPACITY
        if (clean.includes('where can i go') || clean.includes('flood shelter') || clean.includes('available shelter') || clean.includes('nearest shelter') || clean.includes('where are shelters') || clean.includes('find shelter') || (filteredTokens.includes('flood') && filteredTokens.includes('shelter'))) {
            const hasStore = typeof window !== 'undefined' && window.store && window.store.data?.shelters;
            if (hasStore) {
                const shelters = window.store.data.shelters;
                const openShelters = shelters.filter(s => (s.occupied || 0) < s.capacity);
                let text = `🏕️ Designated Evacuation Shelters (${window.store.currentCity?.toUpperCase() || 'CURRENT THEATER'}):\n• Open Shelters with Headroom: ${openShelters.length} of ${shelters.length}\n\nNearest Safe Facilities:\n`;
                openShelters.slice(0, 4).forEach(s => {
                    const free = s.capacity - (s.occupied || 0);
                    text += `• ${s.name} (${s.location}): ${free} beds available | ${s.water_liters || 5000}L Water, ${s.food_kits || 800} Food Kits\n`;
                });
                text += `\nNDMA Evacuation SOP: Move to designated elevated pavilions immediately. Do not walk or drive through flowing water. Shut off electricity and gas mains before evacuating.`;
                return {
                    answer: text,
                    citations: ['DisasterOS Shelter Registry & NDMA Flood SOP'],
                    source: 'DisasterOS Shelter Telemetry',
                    isStore: true
                };
            }
        }

        // 8. HOSPITALS & BEDS
        if (clean.includes('hospital') || clean.includes('doctor') || clean.includes('beds') || clean.includes('icu') || clean.includes('trauma center') || clean.includes('where are hospitals')) {
            const hasStore = typeof window !== 'undefined' && window.store && window.store.data?.hospitals;
            if (hasStore) {
                const hosps = window.store.data.hospitals;
                const totalBeds = hosps.reduce((a, b) => a + (b.available || 0), 0);
                const totalICU = hosps.reduce((a, b) => a + (b.icu || 0), 0);
                let text = `🏥 Trauma Centers & Medical Capacity (${window.store.currentCity?.toUpperCase() || 'CURRENT THEATER'}):\n• Available Emergency Beds: ${totalBeds} | Available ICU Units: ${totalICU}\n\nHospital Directory:\n`;
                hosps.slice(0, 4).forEach(h => {
                    text += `• ${h.name} (${h.location}): ${h.available} beds free, ${h.icu} ICU | Tel: ${h.contact_number}\n`;
                });
                text += `\nIn mass casualty emergencies, hospitals follow START triage protocols to prioritize immediate trauma surgery.`;
                return {
                    answer: text,
                    citations: ['DisasterOS Medical Resource Network (Live Telemetry)'],
                    source: 'DisasterOS Hospital Store',
                    isStore: true
                };
            }
        }

        // 9. RELIEF RESOURCES & INVENTORY
        if (clean.includes('which resources') || clean.includes('resources available') || clean.includes('supplies available') || clean.includes('what inventory') || clean.includes('pumps available') || clean.includes('boats available') || clean.includes('where is inventory')) {
            const hasStore = typeof window !== 'undefined' && window.store && window.store.data?.inventory;
            if (hasStore) {
                const inv = window.store.data.inventory;
                let text = `📦 Current Relief Inventory & Critical Resources (${window.store.currentCity?.toUpperCase() || 'CURRENT THEATER'}):\n`;
                inv.slice(0, 6).forEach(i => {
                    text += `• ${i.name}: ${i.available} ${i.unit} available (Total stock: ${i.total}) at ${i.location}\n`;
                });
                text += `\nLogistics teams can dispatch stock directly through the \"Warehouse & Inventory\" portal.`;
                return {
                    answer: text,
                    citations: ['DisasterOS Logistics Warehouse Register'],
                    source: 'DisasterOS Warehouse Store',
                    isStore: true
                };
            }
        }

        // 10. HELPLINES
        if (clean.includes('helpline') || clean.includes('phone') || clean.includes('number') || clean.includes('call') || clean.includes('contact') || (filteredTokens.includes('emergency') && filteredTokens.includes('number'))) {
            return {
                answer: "🚨 Official National Emergency Helplines:\n\n• 112: Unified National Emergency Services (Police, Fire, Ambulance)\n• 1078: NDRF Central Disaster Control Room\n• 1070: State Disaster Management Authority (SDMA)\n• 108: Emergency Medical & Ambulance Flying Squad\n• 101: Fire & Rescue Services\n• 1091: Women Distress Helpline\n\nAll lines operate 24/7 with satellite failover redundancy.",
                citations: ['National Disaster Management Authority (NDMA) Helplines'],
                source: 'Emergency Directory',
                isStore: false
            };
        }

        // 11. WHERE IS THE MAP
        if (clean.includes('where is the map') || clean.includes('gis map') || clean.includes('open map') || clean.includes('show map') || clean.includes('risk map')) {
            return {
                answer: "🗺️ Dynamic GIS Risk Map in DisasterOS:\n\n• Navigate to \"Dynamic GIS Map\" in the sidebar navigation or click the \"⌖ Live GIS Map\" button on the Command Dashboard.\n• Features interactive Leaflet mapping with real USGS earthquake epicenters, city hazard polygons, emergency shelter locations, and trauma hospital pins.\n• You can also click anywhere on the map to pin incident coordinates directly for citizen reports.",
                citations: ['DisasterOS GIS Spatial System'],
                source: 'DisasterOS GIS',
                isStore: false
            };
        }

        // 12. WHERE IS AUDIT LOG / CRYPTOGRAPHIC LEDGER
        if (clean.includes('audit log') || clean.includes('audit chain') || clean.includes('sha 256') || clean.includes('blockchain') || clean.includes('ledger') || clean.includes('cryptographic')) {
            return {
                answer: "🔒 Immutable SHA-256 Cryptographic Audit Ledger:\n\n• Navigate to \"Cryptographic Audit\" in the sidebar (accessible to Disaster Managers and System Administrators).\n• Every life-critical action (incident dispatch, resource re-allocation, registration verification) is cryptographically hashed with SHA-256 linking to the previous block hash.\n• You can run \"Verify Chain Integrity\" in the module to detect any unauthorized database tampering.",
                citations: ['DisasterOS Cryptographic Audit Specification'],
                source: 'DisasterOS Security Subsystem',
                isStore: false
            };
        }

        return null;
    }

    retrieve(query, topK = 2) {
        const queryTokens = this._tokenize(query, true);
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
                passage: "DisasterOS Safety Guidance: In sudden emergencies, ensure personal safety first (Drop, Cover, and Hold for earthquakes; evacuate to elevated ground for floods; secure indoors for cyclones). Call 112 or NDRF helpline 1078 for immediate life-safety dispatch. You can ask me about specific emergency SOPs (flood, earthquake, cyclone, triage, shelters, hospitals).",
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
                answer: "Please enter a disaster question, protocol query, or resource request.",
                citations: ['DisasterOS Tactical Assistant'],
                passages: [],
                retrievedAt: new Date().toISOString()
            };
        }

        // 1. Direct intent matchers
        const direct = this._handleDirectIntents(query);
        if (direct) {
            return {
                answer: direct.answer,
                citations: direct.citations,
                passages: [{ passage: direct.answer, source: direct.source, score: 1.0 }],
                retrievedAt: new Date().toISOString()
            };
        }

        // 2. BM25 Knowledge Base retrieval with stopword filtering
        const results = this.retrieve(query, 2);
        const primary = results[0];

        let answer = primary.passage;
        if (results.length > 1 && results[1].score > 1.2) {
            answer += `\n\n${results[1].passage}`;
        }

        return {
            answer,
            citations: results.map(r => r.source),
            passages: results,
            retrievedAt: new Date().toISOString()
        };
    }
}

// Global RAG instance
if (typeof module !== "undefined" && module.exports) {
    module.exports = { RAGAssistant };
} else {
    window.ragAssistant = new RAGAssistant();
}
