const handleSocketListeners = require("./handleSocketListeners");
const updateUserStatus = require("./updateUserStatus");
const online_users = {};

module.exports.connect = async function (io, socket) {
  const {user, room} = socket.handshake.query;

  updateUserStatus(user, true);

  await socket.join(room);
  io.to(room).emit("user is online");

  online_users[user] = socket.id;
  console.log(`${user} joined room: ${room}`, io.sockets.adapter.rooms[room]);
};

module.exports.disconnect = async function (io, socket) {
  const {user, room} = socket.handshake.query;

  updateUserStatus(user, false);

  await socket.leave(room);
  io.to(room).emit("user is offline");

  delete online_users[user];
  console.log(`${user} left room: ${room}`, io.sockets.adapter.rooms[room]);
};
