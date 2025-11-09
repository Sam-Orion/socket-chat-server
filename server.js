const net = require("net");

const PORT = 4000;

const server = net.createServer((socket) => {
  console.log("New client connected.");

  socket.on("data", (data) => {
    console.log(`Received data: ${data.toString().trim()}`);
  });

  socket.on("close", () => {
    console.log("Client disconnected.");
  });

  socket.on("error", (err) => {
    console.error(`Socket error: ${err.message}`);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
