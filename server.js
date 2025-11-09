const net = require("net");

const PORT = 4000;

const clients = new Map();

function isUsernameTaken(username) {
  for (const name of clients.values()) {
    if (name.toLowerCase() === username.toLowerCase()) {
      return true;
    }
  }
  return false;
}

/**
 * Broadcasts a message to all connected clients, except the sender.
 * @param {string} message - The message to broadcast.
 * @param {net.Socket} senderSocket - The socket of the client who sent the message.
 */
function broadcast(message, senderSocket) {
  console.log(`Broadcasting: ${message}`);
  for (const clientSocket of clients.keys()) {
    if (clientSocket !== senderSocket) {
      clientSocket.write(message + "\n");
    }
  }
}

const server = net.createServer((socket) => {
  console.log("New client connected.");

  socket.setEncoding("utf8");

  socket.on("data", (data) => {
    const message = data.trim();
    console.log(`Received data: ${message}`);

    if (clients.has(socket)) {
      const username = clients.get(socket);

      if (message.startsWith("MSG ")) {
        const text = message.substring(4).trim();
        if (text) {
          const broadcastMessage = `MSG ${username} ${text}`;
          broadcast(broadcastMessage, socket);
        }
      } else if (message.startsWith("LOGIN ")) {
        socket.write("ERR already logged in\n");
      } else {
        socket.write("ERR unknown command\n");
      }
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
