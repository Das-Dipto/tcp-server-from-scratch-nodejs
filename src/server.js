const net = require("net");

const clients = new Set();

const server = net.createServer((socket) => {
  console.log("✅ Client connected");

  socket.name = "Anonymous";
  let buffer = "";

  clients.add(socket);

  socket.on("data", (data) => {
    buffer += data.toString();

    let messages = buffer.split("\n");
    buffer = messages.pop();

    for (const message of messages) {
      handleMessage(message.trim(), socket);
    }
  });

  socket.on("end", () => {
    console.log("❌ Client disconnected");
    clients.delete(socket);
    broadcast(`${socket.name} left the chat\n`, socket);
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
    clients.delete(socket);
  });
});

function handleMessage(message, socket) {
  if (message.startsWith("NAME ")) {
    const name = message.slice(5);
    socket.name = name;
    socket.write(`Welcome, ${name}!\n`);
  }

  else if (message.startsWith("MSG ")) {
    const text = message.slice(4);
    broadcast(`${socket.name}: ${text}\n`, socket);
  }

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
      client.write(message);
    }
  }
}

server.listen(3000, () => {
  console.log("🚀 TCP server listening on port 3000");
});