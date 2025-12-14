const io = require("socket.io-client");
const axios = require("axios");

const TUNNEL_SERVER_URL = "http://localhost:8080";
const LOCAL_APP_URL = "http://localhost:3000"; 

console.log("--- Client Agent Starting ---");
console.log(`Target: ${LOCAL_APP_URL}`);
console.log(`Tunnel: ${TUNNEL_SERVER_URL}`);

// 1. Connect to the Tunnel Server
const socket = io(TUNNEL_SERVER_URL);

socket.on("connect", () => {
  console.log(`✅ Connected to Tunnel Server! (ID: ${socket.id})`);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from Tunnel Server");
});

// 2. Listen for Incoming Requests
socket.on("request-in", async (payload) => {
  const { requestId, method, url, body } = payload;
  console.log(`[⬇️  IN] ${method} ${url} (ID: ${requestId})`);

  try {
    // 3. Proxy the request to the Local Application
    // We construct the full URL (e.g., http://localhost:3000/api/users)
    const response = await axios({
      method: method,
      url: `${LOCAL_APP_URL}${url}`,
      data: body,
      validateStatus: () => true,
    });

    console.log(`[⬆️ OUT] Responding with ${response.status}`);

    // 4. Send the response back to the Tunnel Server
    socket.emit("response-out", {
      requestId,
      status: response.status,
      headers: response.headers,
      data: response.data,
    });
  } catch (error) {
    // If the local app is down or unreachable
    console.error(`[🔥 ERR] Could not reach local app: ${error.message}`);

    socket.emit("response-out", {
      requestId,
      status: 502, // Bad Gateway
      data: { error: "Client Agent could not reach Local App" },
    });
  }
});
