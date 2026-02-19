const net = require("net");

// Create a TCP server
const server = net.createServer((socket) => {
  console.log("✅ New client connected");

  // When data is received from the client
  socket.on("data", (data) => {
    console.log("📩 Received:", data.toString());

    // Send data back to client
    socket.write("Hello from TCP server!\n");
  });

  // When client disconnects
  socket.on("end", () => {
    console.log("❌ Client disconnected");
  });

  // Handle errors
  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
  });
});

// Start listening
server.listen(3000, () => {
  console.log("🚀 TCP server listening on port 3000");
});
