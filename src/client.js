const net = require("net");

const client = new net.Socket();

client.connect(3000, "127.0.0.1", () => {
  console.log("✅ Connected");

  client.write("PING\n");
  client.write("ECHO Hello TCP\n");
});

client.on("data", (data) => {
  console.log("📩 Server:", data.toString());
});

client.on("close", () => {
  console.log("❌ Connection closed");
});

client.on("error", (err) => {
  console.error("Client error:", err.message);
});