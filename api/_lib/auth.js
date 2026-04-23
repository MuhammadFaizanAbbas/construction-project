const fs = require("fs");
const path = require("path");

loadEnvFile(path.join(process.cwd(), ".env"));

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }

        const separatorIndex = trimmed.indexOf("=");

        if (separatorIndex === -1) {
            continue;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        let value = trimmed.slice(separatorIndex + 1).trim();

        if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
}

function createCorsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey"
    };
}

function setCorsHeaders(response) {
    const headers = createCorsHeaders();
    Object.entries(headers).forEach(([key, value]) => {
        response.setHeader(key, value);
    });
}

function sendJson(response, statusCode, payload) {
    setCorsHeaders(response);
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(payload));
}

function handleOptions(request, response) {
    if (request.method !== "OPTIONS") {
        return false;
    }

    setCorsHeaders(response);
    response.statusCode = 204;
    response.end();
    return true;
}

function getSupabaseConfig() {
    const baseUrl = String(process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
    const serviceKey = String(process.env.SUPABASE_SERVICE_KEY || "").trim();

    if (!baseUrl || !serviceKey) {
        throw new Error("Server is missing SUPABASE_URL or SUPABASE_SERVICE_KEY.");
    }

    return { baseUrl, serviceKey };
}

function getSupabaseHeaders() {
    const { serviceKey } = getSupabaseConfig();

    return {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json"
    };
}

async function readJsonBody(request) {
    if (request.body && typeof request.body === "object") {
        return request.body;
    }

    const chunks = [];

    for await (const chunk of request) {
        chunks.push(chunk);
    }

    const raw = Buffer.concat(chunks).toString("utf8").trim();
    return raw ? JSON.parse(raw) : {};
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function buildUserResponse(authUser) {
    const metadata = authUser?.user_metadata || {};
    const email = authUser?.email || "";

    return {
        id: authUser?.id || "",
        email: email || "Not signed in",
        name: metadata.name || email.split("@")[0] || "User",
        role: metadata.role || "Team Member"
    };
}

async function createUser(payload) {
    const { baseUrl } = getSupabaseConfig();
    const headers = getSupabaseHeaders();

    const authResponse = await fetch(`${baseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            email: payload.email,
            password: payload.password,
            email_confirm: true,
            user_metadata: {
                name: payload.name,
                role: payload.role
            }
        })
    });

    const authResult = await authResponse.json().catch(() => ({}));

    if (!authResponse.ok) {
        throw new Error(authResult.msg || authResult.error_description || authResult.error || "Failed to create auth user.");
    }

    const userId = authResult.id;
    const contractorId = payload.contractor_id || null;

    const profileResponse = await fetch(`${baseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: {
            ...headers,
            Prefer: "return=representation"
        },
        body: JSON.stringify({
            name: payload.name,
            role: payload.role,
            contractor_id: contractorId
        })
    });

    const profileResult = await profileResponse.json().catch(() => ({}));

    if (!profileResponse.ok) {
        throw new Error(profileResult.message || profileResult.error || "Failed to update profile.");
    }

    return buildUserResponse(authResult);
}

async function loginUser(payload) {
    const { baseUrl } = getSupabaseConfig();
    const headers = getSupabaseHeaders();

    const loginResponse = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            email: payload.email,
            password: payload.password
        })
    });

    const loginResult = await loginResponse.json().catch(() => ({}));

    if (!loginResponse.ok) {
        throw new Error(loginResult.msg || loginResult.error_description || loginResult.error || "Login failed.");
    }

    return buildUserResponse(loginResult.user);
}

module.exports = {
    createUser,
    createCorsHeaders,
    handleOptions,
    loginUser,
    readJsonBody,
    sendJson,
    validateEmail
};
