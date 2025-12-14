const http = require("http");

const server = http.createServer((req, res) => {
  console.log(`[DUMMY APP] Received request: ${req.method} ${req.url}`);

  let body = [];
  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const bodyString = Buffer.concat(body).toString();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Hello from the hidden local app!",
        timestamp: new Date().toISOString(),
        echo: bodyString ? `received ${bodyString} in req body` : "no body",
      })
    );
  });
});

server.listen(3000, () => {
  console.log("--- Dummy App listening on localhost:3000 ---");
});
