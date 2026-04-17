const http = require("http");
const fs = require("fs");
const path = require("path");

loadEnvFile(path.join(__dirname, ".env"));

const PORT = Number(process.env.PORT || 8000);
const BASE_URL = String(process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_KEY || "").trim();

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

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, {
        ...createCorsHeaders(),
        "Content-Type": "application/json"
    });
    response.end(JSON.stringify(payload));
}

function getSupabaseHeaders() {
    if (!BASE_URL || !SERVICE_KEY) {
        throw new Error("Server is missing SUPABASE_URL or SUPABASE_SERVICE_KEY.");
    }

    return {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json"
    };
}

async function readJsonBody(request) {
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
    const headers = getSupabaseHeaders();

    const authResponse = await fetch(`${BASE_URL}/auth/v1/admin/users`, {
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

    const profileResponse = await fetch(`${BASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: {
            ...headers,
            "Prefer": "return=representation"
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
    const headers = getSupabaseHeaders();

    const loginResponse = await fetch(`${BASE_URL}/auth/v1/token?grant_type=password`, {
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

async function handleSignup(request, response) {
    const payload = await readJsonBody(request);

    if (!payload.name || !validateEmail(payload.email) || !payload.password || !payload.role) {
        sendJson(response, 400, { error: "Name, role, valid email, and password are required." });
        return;
    }

    const user = await createUser(payload);
    sendJson(response, 200, { user });
}

async function handleLogin(request, response) {
    const payload = await readJsonBody(request);

    if (!validateEmail(payload.email) || !payload.password) {
        sendJson(response, 400, { error: "Valid email and password are required." });
        return;
    }

    const user = await loginUser(payload);
    sendJson(response, 200, { user });
}

const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "OPTIONS") {
        response.writeHead(204, createCorsHeaders());
        response.end();
        return;
    }

    try {
        if (request.method === "GET" && url.pathname === "/health") {
            sendJson(response, 200, { ok: true });
            return;
        }

        if (request.method === "POST" && url.pathname === "/api/signup") {
            await handleSignup(request, response);
            return;
        }

        if (request.method === "POST" && url.pathname === "/api/login") {
            await handleLogin(request, response);
            return;
        }

        sendJson(response, 404, { error: "Not found." });
    } catch (error) {
        sendJson(response, 500, { error: error.message || "Server error." });
    }
});

server.listen(PORT, "127.0.0.1", () => {
    console.log(`Auth server listening on http://127.0.0.1:${PORT}`);
});
