(() => {
    const hostname = String(window.location.hostname || "").toLowerCase();
    const origin = String(window.location.origin || "").replace(/\/+$/, "");
    const isLocalHost = ["localhost", "127.0.0.1"].includes(hostname);
    const isGoogleCloudHost = (
        hostname.endsWith(".run.app")
        || hostname.endsWith(".googleusercontent.com")
        || hostname.endsWith(".cloudfunctions.net")
    );

    function getApiBaseUrl() {
        if (window.__JOB_MANAGEMENT_API_BASE_URL__) {
            return String(window.__JOB_MANAGEMENT_API_BASE_URL__).trim().replace(/\/+$/, "");
        }

        if (isLocalHost) {
            return "http://127.0.0.1:8000";
        }

        if (isGoogleCloudHost) {
            return origin;
        }

        return "";
    }

    window.__JOB_MANAGEMENT_API_BASE_URL__ = getApiBaseUrl();

    const existingSupabaseConfig = window.__SUPABASE_AUTH_CONFIG__ || {};

    window.__SUPABASE_AUTH_CONFIG__ = {
        url: String(existingSupabaseConfig.url || "").trim().replace(/\/+$/, ""),
        publishableKey: String(
            existingSupabaseConfig.publishableKey
            || existingSupabaseConfig.anonKey
            || ""
        ).trim()
    };
})();
