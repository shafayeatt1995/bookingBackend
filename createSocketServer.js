const createSocketServer = (app) => {
  const http = require("http");
  const server = http.createServer(app);
  const io = require("socket.io")(server, {
    cors: {
      origin: process.env.BASE_URL,
      methods: ["GET", "POST"],
      transports: ["websocket", "polling"],
      credentials: true,
    },
    allowEIO3: true,
  });
  global.io = io;

  return server;
};

module.exports = { createSocketServer };
