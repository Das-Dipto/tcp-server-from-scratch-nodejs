const net = require("net");

const client = new net.Socket();

client.connect(3000, "127.0.0.1", () => {
  console.log("✅ Connected");

  client.write("NAME User" + Math.floor(Math.random() * 1000) + "\n");

  setTimeout(() => {
    client.write("MSG Hello everyone!\n");
  }, 1000);

  setTimeout(() => {
    client.write("LIST\n");
  }, 2000);
});

client.on("data", (data) => {
  console.log("📩", data.toString());
});

client.on("close", () => {
  console.log("❌ Connection closed");
});

client.on("error", (err) => {
  console.error("Client error:", err.message);
});