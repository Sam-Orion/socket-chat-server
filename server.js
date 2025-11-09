const net = require("net");

const PORT =
  process.env.PORT ||
  (process.argv[2] && parseInt(process.argv[2], 10)) ||
  4000;

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
 * Finds a client's socket by their username (case-insensitive).
 * @param {string} username - The username to search for.
 * @returns {net.Socket | null} The socket, or null if not found.
 */
function getSocketByUsername(username) {
  const targetUsername = username.toLowerCase();
  for (const [socket, name] of clients.entries()) {
    if (name.toLowerCase() === targetUsername) {
      return socket;
    }
  }
  return null;
}

/**
 * Broadcasts a message to all connected clients, except the (optional) sender.
 * @param {string} message - The message to broadcast.
 * @param {net.Socket} [senderSocket=null] - The socket of the client who sent the message (optional).
 */
function broadcast(message, senderSocket = null) {
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
    if (!message) return;

    console.log(
      `Received data from ${clients.get(socket) || "new client"}: ${message}`,
    );

    if (clients.has(socket)) {
      const username = clients.get(socket);

      if (message.startsWith("MSG ")) {
        const text = message.substring(4).trim();
        if (text) {
          const broadcastMessage = `MSG ${username} ${text}`;
          broadcast(broadcastMessage, socket);
        }
      } else if (message === "PING") {
        socket.write("PONG\n");
      } else if (message === "WHO") {
        for (const name of clients.values()) {
          socket.write(`USER ${name}\n`);
        }
      } else if (message.startsWith("DM ")) {
        const parts = message.split(" ");
        const targetUsername = parts[1];
        const text = parts.slice(2).join(" ").trim();

        if (targetUsername && text) {
          const targetSocket = getSocketByUsername(targetUsername);
          if (targetSocket) {
            targetSocket.write(`DM ${username} ${text}\n`);
            socket.write(`OK DM ${targetUsername} ${text}\n`);
          } else {
            socket.write(`ERR user-not-found ${targetUsername}\n`);
          }
        } else {
          socket.write("ERR invalid DM format. Use: DM <username> <text>\n");
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
          broadcast(`INFO ${username} joined`, socket);
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
      broadcast(`INFO ${username} disconnected`, socket);
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
      broadcast(`INFO ${username} disconnected`, socket);
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
