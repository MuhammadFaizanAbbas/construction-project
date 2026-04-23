const { handleOptions, sendJson } = require("./_lib/auth");

module.exports = async (request, response) => {
    if (handleOptions(request, response)) {
        return;
    }

    if (request.method !== "GET") {
        sendJson(response, 405, { error: "Method not allowed." });
        return;
    }

    sendJson(response, 200, { ok: true });
};
