

let io;

module.exports = {
  /**
   * Initialize Socket.IO server with the given HTTP server instance.
   * Should be called once in your main server file (e.g., server.js).
   * @param {import('http').Server} server - The HTTP server to attach Socket.IO to.
   * @returns {import('socket.io').Server} - The Socket.IO server instance.
   */
  init: (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST","PUT"]
      }
    });
    return io;
  },

  /**
   * Get the initialized Socket.IO server instance.
   * Throws an error if Socket.IO has not been initialized.
   * @returns {import('socket.io').Server}
   */
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized! Call init(server) first.");
    }
    return io;
  }
};
