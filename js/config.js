// DisasterOS Environment & Configuration Loader
// Safely reads configuration without exposing secrets in browser bundles or public repositories.

(function() {
    window.DISASTEROS_CONFIG = {
        SUPABASE_URL: null,         // e.g. "https://xyzcompany.supabase.co"
        SUPABASE_ANON_KEY: null,    // Public client anon key
        GEO_CACHE_TTL_MS: 300000,   // 5 minutes
        SEISMIC_CACHE_TTL_MS: 60000,// 1 minute
        DEFAULT_LAT: 13.0827,
        DEFAULT_LON: 80.2707,
        DEFAULT_CITY: "Chennai"
    };

    // Helper to inspect configuration status safely
    window.checkSystemConfig = function() {
        const hasUrl = !!window.DISASTEROS_CONFIG.SUPABASE_URL;
        const hasKey = !!window.DISASTEROS_CONFIG.SUPABASE_ANON_KEY;
        return {
            databaseMode: (hasUrl && hasKey) ? "Supabase PostgreSQL" : "Local Storage (Schema-Enforced)",
            supabaseConfigured: hasUrl && hasKey,
            environment: (hasUrl && hasKey) ? "Cloud-Connected" : "Local Prototype / Demonstration",
            missingKeys: [
                ...(!hasUrl ? ["SUPABASE_URL"] : []),
                ...(!hasKey ? ["SUPABASE_ANON_KEY"] : [])
            ]
        };
    };
})();
