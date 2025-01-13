let io;

module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
        cors: {
          origin: "*", // Allow all origins for development
          methods: ["GET", "POST"], // Allowed methods
          allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
        },
      });
    return io;
  },
  getIO: () => {
    if(!io){
        throw new Error('Socket.io is not initialized!');
    }
    return io;
  }
};
 