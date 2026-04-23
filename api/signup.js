const {
    createUser,
    handleOptions,
    readJsonBody,
    sendJson,
    validateEmail
} = require("./_lib/auth");

module.exports = async (request, response) => {
    if (handleOptions(request, response)) {
        return;
    }

    if (request.method !== "POST") {
        sendJson(response, 405, { error: "Method not allowed." });
        return;
    }

    try {
        const payload = await readJsonBody(request);

        if (!payload.name || !validateEmail(payload.email) || !payload.password || !payload.role) {
            sendJson(response, 400, { error: "Name, role, valid email, and password are required." });
            return;
        }

        const user = await createUser(payload);
        sendJson(response, 200, { user });
    } catch (error) {
        sendJson(response, 500, { error: error.message || "Server error." });
    }
};
