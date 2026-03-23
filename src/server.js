const net = require("net");

const clients = new Set();
const MAX_CLIENTS = 100;

const server = net.createServer((socket) => {
  // Limit connections
  if (clients.size >= MAX_CLIENTS) {
    socket.write("ERROR Server full\n");
    socket.end();
    return;
  }

  console.log("✅ Client connected");

  socket.name = "Anonymous";
  let buffer = "";

  clients.add(socket);

  // Handle incoming data (ROBUST BUFFERING)
  socket.on("data", (data) => {
    buffer += data.toString();

    let boundary;

    // Process complete messages
    while ((boundary = buffer.indexOf("\n")) !== -1) {
      const message = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 1);

      if (message.length > 0) {
        handleMessage(message, socket);
      }
    }

    // Prevent memory overflow
    if (buffer.length > 1024) {
      socket.write("ERROR Message too long\n");
      buffer = "";
    }
  });

  // Graceful disconnect
  socket.on("end", () => {
    console.log("❌ Client disconnected");
    clients.delete(socket);
    broadcast(`${socket.name} left the chat\n`, socket);
  });

  // Always triggered (important)
  socket.on("close", () => {
    clients.delete(socket);
  });

  // Error handling
  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
    clients.delete(socket);
  });
});

// Handle commands
function handleMessage(message, socket) {
  if (message.length > 256) {
    socket.write("ERROR Message too long\n");
    return;
  }

  if (message.startsWith("NAME ")) {
    const name = message.slice(5).trim();

    if (!name) {
      socket.write("ERROR Invalid name\n");
      return;
    }

    socket.name = name;
    socket.write(`Welcome, ${name}!\n`);
  }

  else if (message.startsWith("MSG ")) {
    const text = message.slice(4).trim();

    if (!text) {
      socket.write("ERROR Empty message\n");
      return;
    }

    broadcast(`${socket.name}: ${text}\n`, socket);
  }

  else if (message === "PING") {
    socket.write("PONG\n");
  }

  else {
    socket.write("ERROR Unknown command\n");
  }
}

// Broadcast with backpressure handling
function broadcast(message, sender) {
  for (const client of clients) {
    if (client !== sender) {
      const ok = client.write(message);

      if (!ok) {
        console.log("⚠️ Backpressure detected");

        client.once("drain", () => {
          console.log("✅ Client ready again");
        });
      }
    }
  }
}

server.listen(3000, () => {
  console.log("🚀 TCP server listening on port 3000");
});