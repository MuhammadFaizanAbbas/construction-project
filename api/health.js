const { getSupabaseConfig, handleOptions, sendJson } = require("./_lib/auth");

module.exports = async (request, response) => {
    if (handleOptions(request, response)) {
        return;
    }

    if (request.method !== "GET") {
        sendJson(response, 405, { error: "Method not allowed." });
        return;
    }

    let configStatus = {
        hasSupabaseUrl: false,
        hasSupabaseServiceKey: false
    };

    try {
        getSupabaseConfig();
        configStatus = {
            hasSupabaseUrl: true,
            hasSupabaseServiceKey: true
        };
    } catch (error) {
        configStatus = {
            hasSupabaseUrl: Boolean(String(process.env.SUPABASE_URL || "").trim()),
            hasSupabaseServiceKey: Boolean(String(process.env.SUPABASE_SERVICE_KEY || "").trim())
        };
    }

    sendJson(response, 200, {
        ok: true,
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
        ...configStatus
    });
};
