const { Server } = require("socket.io");
const connectUsers = {};
function createServer(server) {
  const io = new Server(server);

  io.on("connection", (socket) => {
    socket.on("fatchName", (name) => {
      for (let index = 0; index < Object.keys(connectUsers).length; index++) {
        if (Object.keys(connectUsers)[index] === name) {
          socket.emit("nameError", "user name already used!!!");
          return;
        }
      }
      Object.keys(connectUsers).forEach((element) => {
        socket.to(connectUsers[element]).emit("addedUser", name);
      });
      connectUsers[name] = socket.id;
      socket.emit("allUser", connectUsers);
    });
    socket.on("end", (data) => {
      socket.to(connectUsers[data.to]).emit("end");
    });
    socket.on("offer", (data) => {
      socket.to(connectUsers[data.to]).emit("offer", {
        other: data.from,
        offer: data.offer,
      });
    });
    socket.on("ans", (data) => {
      socket.to(connectUsers[data.to]).emit("ans", { ans: data.ans });
    });
    socket.on("candidate", (data) => {
      socket.to(connectUsers[data.to]).emit("candidate", data.candidate);
    });
    socket.on("disconnect", () => {
      Object.keys(connectUsers).forEach((element) => {
        if (connectUsers[element] === socket.id) {
          delete connectUsers[element];
          for (const key in connectUsers) {
            socket.to(connectUsers[key]).emit("removeUser", element);
          }
        }
      });
    });
  });
}
module.exports = { createServer };
