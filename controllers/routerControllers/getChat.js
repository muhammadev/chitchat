const Message = require("../../models/Message");

module.exports = (req, res) => {
  const [participantOne, participantTwo] = JSON.parse(req.get("participants"));

  // all messages from/to this id
  Message.find({
    $or: [
      { from: participantOne, to: participantTwo },
      { from: participantTwo, to: participantOne },
    ],
  })
    .populate("from", "_id username fullname")
    .populate("to", "_id fullname username")
    .exec((err, messages) => {
      if (err) {
        console.log("couldn't find messages of this user");
        return res.status(404).send();
      }

      // console.log("found some chat here: ", messages);
      res.status(200).send({ messages });
    });
};
