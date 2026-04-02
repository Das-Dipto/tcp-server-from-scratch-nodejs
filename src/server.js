const net = require("net");

const clients = new Set();
const MAX_CLIENTS = 100;

const server = net.createServer((socket) => {
  if (clients.size >= MAX_CLIENTS) {
    socket.write("ERROR Server full\n");
    socket.end();
    return;
  }

  console.log("✅ Client connected");

  socket.name = "Anonymous";
  let buffer = "";

  clients.add(socket);

  socket.on("data", (data) => {
    buffer += data.toString();

    let boundary;

    while ((boundary = buffer.indexOf("\n")) !== -1) {
      const message = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 1);

      if (message.length > 0) {
        handleMessage(message, socket);
      }
    }

    if (buffer.length > 1024) {
      socket.write("ERROR Message too long\n");
      buffer = "";
    }
  });

  socket.on("end", () => {
    console.log("❌ Client disconnected");
    clients.delete(socket);
    broadcast(`${socket.name} left the chat\n`, socket);
  });

  socket.on("close", () => {
    clients.delete(socket);
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
    clients.delete(socket);
  });
});

function handleMessage(message, socket) {
  if (message.length > 256) {
    socket.write("ERROR Message too long\n");
    return;
  }

  // NAME
  if (message.startsWith("NAME ")) {
    const name = message.slice(5).trim();

    if (!name) {
      socket.write("ERROR Invalid name\n");
      return;
    }

    socket.name = name;
    socket.write(`Welcome, ${name}!\n`);
  }

  // MSG (broadcast)
  else if (message.startsWith("MSG ")) {
    const text = message.slice(4).trim();

    if (!text) {
      socket.write("ERROR Empty message\n");
      return;
    }

    broadcast(`${socket.name}: ${text}\n`, socket);
  }

  // DM (private message)
  else if (message.startsWith("DM ")) {
    const parts = message.split(" ");

    if (parts.length < 3) {
      socket.write("ERROR Invalid DM format\n");
      return;
    }

    const targetName = parts[1];
    const text = parts.slice(2).join(" ");

    const targetClient = findClientByName(targetName);

    if (!targetClient) {
      socket.write(`ERROR User ${targetName} not found\n`);
      return;
    }

    targetClient.write(`[DM from ${socket.name}]: ${text}\n`);
    socket.write(`[DM to ${targetName}]: ${text}\n`);
  }

  // LIST users
  else if (message === "LIST") {
    const names = [...clients].map(c => c.name);
    socket.write("Users: " + names.join(", ") + "\n");
  }

  // PING
  else if (message === "PING") {
    socket.write("PONG\n");
  }

  else {
    socket.write("ERROR Unknown command\n");
  }
}

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

// Helper: find user by name
function findClientByName(name) {
  for (const client of clients) {
    if (client.name === name) {
      return client;
    }
  }
  return null;
}

server.listen(3000, () => {
  console.log("🚀 TCP server listening on port 3000");
});