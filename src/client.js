const net = require("net");

const client = new net.Socket();

// Connect to the TCP server
client.connect(3000, "127.0.0.1", () => {
  console.log("✅ Connected to TCP server");

  // Send a message to the server
  client.write("Hello server!\n");
});

// Receive data from server
client.on("data", (data) => {
  console.log("📩 Received from server:", data.toString());
});

// Handle close
client.on("close", () => {
  console.log("❌ Connection closed");
});

// Handle errors
client.on("error", (err) => {
  console.error("Client error:", err.message);
});
