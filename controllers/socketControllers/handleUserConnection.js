const updateUserStatus = require("./updateUserStatus");
const online_users = {};

module.exports.connect = async function (io, socket) {
  const {user, room: rawRoom} = socket.handshake.query;

  let roomUsersArr = rawRoom.split("--with--").sort(); // result: [userOne, userTwo] >> SORTED <<
  let roomName = roomUsersArr.join("--with--");

  await socket.join(roomName);
  io.to(roomName).emit("user is online");

  updateUserStatus(user, true);

  online_users[user] = socket.id;
  console.log(`${user} joined room: ${roomName}`, io.sockets.adapter.rooms);
};

module.exports.disconnect = async function (io, socket) {
  const {user, room: rawRoom} = socket.handshake.query;

  let roomUsersArr = rawRoom.split("--with--").sort(); // result: [userOne, userTwo] >> SORTED <<
  let roomName = roomUsersArr.join("--with--");

  await socket.leave(roomName);
  io.to(roomName).emit("user is online");


  updateUserStatus(user, false);

  delete online_users[user];
  console.log(`${user} left room: ${room}`, io.sockets.adapter.rooms[room]);
};
