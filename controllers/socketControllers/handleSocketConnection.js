const Message = require("../../models/Message");
const setOnlineOrOffline = require("./setOnlineOrOffline");
const onlineSockets = {};

module.exports.connect = async function (io, socket) {
  const { user: userId } = socket.handshake.query;
  console.log(userId, " is connected");
  // initiate socket essentials
  onlineSockets[userId] = {
    id: socket.id,
    waitlist: [],
  };
  // update the real user's db
  setOnlineOrOffline(userId, true);
  // fetch unseen messages
  Message.find({ to: userId, delivered: false })
    .populate("from", "_id username fullname")
    .populate("to", "_id username fullname")
    .exec(function (err, messages) {
      if (err)
        return console.log("err finding and populating notifications ", err);

      console.log(messages);
      if (messages) {
        messages = Array.isArray(messages) ? [...messages] : [messages];
        socket.emit("notifications on login", messages);
      }
    });

  // emit a 'participant status' event, if this user is registered in some socket's waitlist
  for (const onlineSocket in onlineSockets) {
    onlineSockets[onlineSocket]["waitlist"]?.forEach((id) => {
      if (userId === id) {
        io.to(onlineSockets[onlineSocket].id).emit(
          "participant status",
          userId,
          true
        );
      }
    });
  }

  const saveMessage = (newMessage) => {
    const { text, from, to } = newMessage;
    const message = new Message({
      text,
      from,
      to,
    });

    message.save(function (err, msg) {
      if (err) return console.log("error saving a message ", err);

      msg
        .populate("from", "_id username fullname")
        .populate("to", "_id username fullname", function (err, savedMsg) {
          if (err) return console.log("error populating a message ", err);

          console.log("saved a new message, ", savedMsg);

          // if participant is online, emit to them... otherwise, it will be pushed as a notification when they go online
          const socketToReceive = onlineSockets[savedMsg.to._id];
          if (socketToReceive) {
            console.log(
              "sending to participant a message and notification events",
              socketToReceive,
              savedMsg.to.username
            );
            io.to(socketToReceive.id).emit("message", savedMsg);
            io.to(socketToReceive.id).emit("notification", savedMsg);
          } else {
            console.log("sorry, couldn't found a socket to emit to...");
          }

          // emit back to message sender to confirm sending and add the proper message object
          socket.emit("sent");
        });
    });
  };

  const markDelivered = (messagesToMark) => {
    console.log("received 'delivered' event: ", messagesToMark);
    // make sure it's an array even if one message
    messagesToMark = Array.isArray(messagesToMark)
      ? messagesToMark
      : [messagesToMark];

    let socketsToNotify = []; // add messages senders here to emit the event to them only once
    let promise = new Promise(function (resolve, reject) {
      messagesToMark.forEach(async (messageToMark, index) => {
        // update message status in db
        const message = await Message.findOne({ _id: messageToMark._id });
        message.delivered = true;
        message.save((err, markedMessage) => {
          if (err) return reject(`error saving delivered message ${err}`);

          markedMessage
            .populate("from", "_id fullname username")
            .populate(
              "to",
              "_id fullname username",
              function (err, populatedMessage) {
                if (err) {
                  return reject(`error populating message ${err}`);
                }

                let msgSender = populatedMessage.from._id;
                if (!socketsToNotify.includes(msgSender)) {
                  socketsToNotify.push(msgSender);
                }

                if (index === messagesToMark.length - 1) resolve();
              }
            );
        });
      });
    });

    promise.then(function () {
      console.log("from then: ", socketsToNotify);
      socketsToNotify.forEach((senderId) => {
        // if online, emit to sender -- otherwise, it's already updated in db, whenever they're online they'll fetch the updated version
        const senderSocket = onlineSockets[senderId];
        if (senderSocket.id) {
          console.log("sending now the 'delivered' event");
          io.to(senderSocket.id).emit("delivered");
        }
      });
    });
  };

  const markSeen = (messagesToMark) => {
    // make sure it's an array even if one message
    messagesToMark = Array.isArray(messagesToMark)
      ? messagesToMark
      : [messagesToMark];

    let socketsToNotify = []; // add messages senders here to emit the event to them only once
    let promise = new Promise(function (resolve, reject) {
      messagesToMark.forEach(async (messageToMark, index) => {
        // update message status in db
        const message = await Message.findOne({ _id: messageToMark._id });
        message.delivered = true;
        message.seen = true;
        message.save((err, markedMessage) => {
          if (err) return reject(`error saving seen message ${err}`);

          markedMessage
            .populate("from", "_id fullname username")
            .populate(
              "to",
              "_id fullname username",
              function (err, populatedMessage) {
                if (err) {
                  return reject(`error populating message ${err}`);
                }

                let msgSender = populatedMessage.from._id;
                if (!socketsToNotify.includes(msgSender)) {
                  socketsToNotify.push(msgSender);
                }

                if (index === messagesToMark.length - 1) resolve();
              }
            );
        });
      });
    });

    promise.then(function () {
      console.log("from then: ", socketsToNotify);
      socketsToNotify.forEach((senderId) => {
        // if online, emit to sender -- otherwise, it's already updated in db, whenever they're online they'll fetch the updated version
        const senderSocket = onlineSockets[senderId];
        if (senderSocket.id) {
          console.log("sending now the 'seen' event");
          io.to(senderSocket.id).emit('seen');
        }
      });
    });
  };

  const addToWaitList = (participant) => {
    if (!onlineSockets[userId]?.waitlist.includes(participant)) {
      onlineSockets[userId]?.waitlist.push(participant);
    }
  };

  // listen to 'message' event -- when user sends a message
  socket.on("message", saveMessage);
  // listen to 'delivered' event -- when user opens notifications section
  socket.on("delivered", markDelivered);
  // listen to 'seen' event -- when user read the message inside the chat room
  socket.on("seen", markSeen);
  // listen to 'waitlist' event -- when user opens a chat room with an offline participant
  socket.on("waitlist", addToWaitList);
};

module.exports.disconnect = async function (io, socket) {
  const { user: userId } = socket.handshake.query;
  console.log(userId, " is disconnected");

  delete onlineSockets[userId];
  setOnlineOrOffline(userId, false);
  for (const onlineSocket in onlineSockets) {
    onlineSockets[onlineSocket]["waitlist"]?.forEach((id) => {
      console.log("searching...");
      if (userId === id) {
        console.log("found a waiting socket");
        io.to(onlineSockets[onlineSocket].id).emit(
          "participant status",
          userId,
          false
        );
      }
    });
    console.log(
      "onlineSocket ",
      onlineSocket,
      onlineSockets[onlineSocket].waitlist
    );
  }
};
