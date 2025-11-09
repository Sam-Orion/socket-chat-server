const net = require("net");

const PORT = 4000;

const clients = new Map();

function isUsernameTaken(username) {
  for (const name of clients.values()) {
    if (name === username) {
      return true;
    }
  }
  return false;
}

const server = net.createServer((socket) => {
  console.log("New client connected.");

  socket.setEncoding("utf8");

  socket.on("data", (data) => {
    const message = data.trim();
    console.log(`Received data: ${message}`);

    if (clients.has(socket)) {
      console.log(`Message from ${clients.get(socket)}: ${message}`);
    } else {
      if (message.startsWith("LOGIN ")) {
        const username = message.split(" ")[1];

        if (!username) {
          socket.write("ERR invalid username\n");
          return;
        }

        if (isUsernameTaken(username)) {
          socket.write("ERR username-taken\n");
        } else {
          clients.set(socket, username);
          socket.write("OK\n");
          console.log(`User ${username} logged in.`);
        }
      } else {
        socket.write("ERR please log in first using: LOGIN <username>\n");
      }
    }
  });

  socket.on("close", () => {
    if (clients.has(socket)) {
      const username = clients.get(socket);
      clients.delete(socket);
      console.log(`User ${username} disconnected.`);
    } else {
      console.log("Client disconnected (was not logged in).");
    }
  });

  socket.on("error", (err) => {
    console.error(`Socket error: ${err.message}`);
    if (clients.has(socket)) {
      const username = clients.get(socket);
      clients.delete(socket);
      console.log(`User ${username} dropped due to error.`);
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
