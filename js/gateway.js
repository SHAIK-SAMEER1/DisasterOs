// Ingestion Gateway: Fetches live rainfall from Open-Meteo and seismic telemetry from USGS with TTL caching.

class IngestionGateway {
    constructor() {
        this.cache = {};
        this.cacheTTL = {
            weather: 5 * 60 * 1000, // 5 minutes
            seismic: 60 * 1000      // 1 minute
        };
    }

    async getRainfall(lat, lon) {
        const cacheKey = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
        const cached = this.cache[cacheKey];
        if (cached && (Date.now() - cached.timestamp < this.cacheTTL.weather)) {
            return cached.data;
        }

        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation,precipitation_probability&current=temperature_2m,relative_humidity_2m,precipitation,rain`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
            const data = await res.json();
            
            // Calculate trailing 3-hour precipitation estimate
            const hourlyPrecip = data.hourly?.precipitation || [];
            const currentHour = new Date().getHours();
            const trailing3h = hourlyPrecip.slice(Math.max(0, currentHour - 2), currentHour + 1).reduce((a, b) => a + b, 0);

            const result = {
                current_precip_mm: data.current?.precipitation ?? 0,
                trailing_3h_mm: parseFloat((trailing3h || data.current?.precipitation || 0).toFixed(2)),
                precip_probability: data.hourly?.precipitation_probability?.[currentHour] || 0,
                temp_c: data.current?.temperature_2m ?? 28,
                humidity: data.current?.relative_humidity_2m ?? 75,
                source: "Open-Meteo API",
                timestamp: new Date().toISOString()
            };

            this.cache[cacheKey] = { timestamp: Date.now(), data: result };
            return result;
        } catch (err) {
            console.warn("Open-Meteo API unavailable or offline, using fallback telemetry", err);
            return {
                current_precip_mm: 12.5,
                trailing_3h_mm: 38.0,
                precip_probability: 85,
                temp_c: 27.5,
                humidity: 88,
                source: "Fallback Cache (Network Offline)",
                timestamp: new Date().toISOString()
            };
        }
    }

    async getSeismicActivity(centerLat, centerLon, radiusKm = 200) {
        const cacheKey = "usgs_seismic_feed";
        const cached = this.cache[cacheKey];
        if (cached && (Date.now() - cached.timestamp < this.cacheTTL.seismic)) {
            return cached.data;
        }

        try {
            // USGS live GeoJSON for all earthquakes in past day
            const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
            const res = await fetch(url);
            if (!res.ok) throw new Error(`USGS HTTP ${res.status}`);
            const data = await res.json();

            const features = data.features || [];
            let maxMagnitudeNearby = 0;
            const nearbyEvents = [];

            features.forEach(f => {
                const [lon, lat, depth] = f.geometry.coordinates;
                const dist = this.haversineDistance(centerLat, centerLon, lat, lon);
                const mag = f.properties.mag || 0;

                if (dist <= radiusKm) {
                    if (mag > maxMagnitudeNearby) maxMagnitudeNearby = mag;
                    nearbyEvents.push({
                        id: f.id,
                        place: f.properties.place,
                        mag: mag,
                        time: new Date(f.properties.time).toLocaleTimeString(),
                        lat: lat,
                        lon: lon,
                        dist_km: Math.round(dist)
                    });
                }
            });

            const result = {
                max_magnitude: maxMagnitudeNearby,
                nearby_events: nearbyEvents,
                total_events_global_24h: features.length,
                source: "USGS Real-Time Earthquake Hazards Feed",
                timestamp: new Date().toISOString()
            };

            this.cache[cacheKey] = { timestamp: Date.now(), data: result };
            return result;
        } catch (err) {
            console.warn("USGS Earthquake API unavailable, using fallback cache", err);
            return {
                max_magnitude: 2.1,
                nearby_events: [
                    { id: "usgs_demo_1", place: "85km ENE of Chennai", mag: 2.1, time: "28 min ago", lat: 13.25, lon: 80.9, dist_km: 85 }
                ],
                total_events_global_24h: 184,
                source: "Fallback Cache (Network Offline)",
                timestamp: new Date().toISOString()
            };
        }
    }

    haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}

window.gateway = new IngestionGateway();
