const net = require("net");

const server = net.createServer((socket) => {
  console.log("✅ Client connected");

  let buffer = "";

  socket.on("data", (data) => {
    buffer += data.toString();

    // Split messages by newline
    let messages = buffer.split("\n");

    // Keep last partial message in buffer
    buffer = messages.pop();

    for (const message of messages) {
      handleMessage(message.trim(), socket);
    }
  });

  socket.on("end", () => {
    console.log("❌ Client disconnected");
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
  });
});

function handleMessage(message, socket) {
  if (message === "PING") {
    socket.write("PONG\n");
  } else if (message.startsWith("ECHO ")) {
    const text = message.slice(5);
    socket.write(text + "\n");
  } else {
    socket.write("ERROR Unknown command\n");
  }
}

server.listen(3000, () => {
  console.log("🚀 TCP server listening on port 3000");
});