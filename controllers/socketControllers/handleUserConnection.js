const handleSocketListeners = require("./handleSocketListeners");
const updateUserStatus = require("./updateUserStatus");
const online_users = {};

module.exports.connect = async function (io, socket) {
  const {user, room: rawRoom} = socket.handshake.query;

  updateUserStatus(user, true);

  // room has this criteria: <userOne>--with--<userTwo>
  // from username validation process, I must be sure there's no usernames with "--with--" in their letters
  // room will be seperated to array of [userOne, userTwo]
  // sort the array to make sure no matter came first, userOne--with--userTwo, or userTwo--with--userOne,
  //    the sorted array will order them in the same order
  // this way the room name between two users will always be unique

  let roomUsersArr = rawRoom.split("--with--").sort(); // result: [userOne, userTwo] >> SORTED <<
  let roomName = roomUsersArr.join("--with--");

  await socket.join(roomName);
  io.to(roomName).emit("user is online");

  online_users[user] = socket.id;
  console.log(`${user} joined room: ${roomName}`, io.sockets.adapter.rooms);
};

module.exports.disconnect = async function (io, socket) {
  const {user, room} = socket.handshake.query;

  updateUserStatus(user, false);

  await socket.leave(room);
  io.to(room).emit("user is offline");

  delete online_users[user];
  console.log(`${user} left room: ${room}`, io.sockets.adapter.rooms[room]);
};
