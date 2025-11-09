# Socket Chat Server

A simple TCP chat server built in Node.js, as per the assignment. It uses only the standard `net` library.

## How to Run

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/](https://github.com/)<your-username>/socket-chat-server.git
    cd socket-chat-server
    ```
2.  **Install dependencies:**
    *(No external dependencies are needed, as per the requirement to use only the standard library)*

3.  **Run the server:**
    The server listens on port 4000 by default.
    ```bash
    node server.js
    ```
    Or, to run on a custom port:
    ```bash
    # Using an environment variable
    PORT=5000 node server.js

    # Using a command-line argument
    node server.js 5000
    ```

## How to Connect

You can connect using `nc` (netcat) or `telnet`.

```bash
nc localhost 4000
```

### 🎬 Screen Recording

[![Socket Chat Server Demo](https://img.youtube.com/vi/EF-6_5XMDjg/maxresdefault.jpg)](https://www.youtube.com/watch?v=EF-6_5XMDjg)
