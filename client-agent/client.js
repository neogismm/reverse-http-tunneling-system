const io = require("socket.io-client");
const axios = require("axios");
const config = require("./config.json");

// CONFIG
const { serverUrl, localAppUrl, agents } = config;

console.log(`--- Starting Multi-Agent Client System ---`);
console.log(`Target Server: ${serverUrl}`);
console.log(`Local App: ${localAppUrl}`);
console.log(`Agents to spawn: ${agents.length}`);

// Spin up an instance for each agent in the config
agents.forEach((agent) => {
  startAgentInstance(agent);
});

function startAgentInstance({ clientId, token }) {
  console.log(`🟨 Initializing Agent: ${clientId}`);

  // 1. Connect with Auth
  const socket = io(serverUrl, {
    auth: {
      token: token,
      clientId: clientId,
    },
  });

  socket.on("connect", () => {
    console.log(`✅ [${clientId}] Connected to Tunnel Server!`);
  });

  socket.on("connect_error", (err) => {
    console.log(`🚫 [${clientId}] Connection failed: ${err.message}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`❌ [${clientId}] Disconnected - Reason: ${reason}`);
  });

  // 2. Handle Requests
  socket.on("request-in", async ({ requestId, method, url, body }) => {
    console.log(`[${clientId}] [JOB] ${method} ${url} (ID: ${requestId})`);

    try {
      const response = await axios({
        method,
        url: `${localAppUrl}${url}`,
        data: body,
        validateStatus: () => true,
      });

      socket.emit("response-out", {
        requestId,
        status: response.status,
        data: response.data,
      });
    } catch (err) {
      console.error(`[${clientId}] [ERR] Local App Unreachable`);
      socket.emit("response-out", {
        requestId,
        status: 502,
        data: { error: "Local Service Down" },
      });
    }
  });
}
