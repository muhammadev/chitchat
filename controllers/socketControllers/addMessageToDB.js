const User = require("../../models/User")

module.exports = function addMessageToDB(message, from, to) {
  /*
    user: {
      ...,
      messages: {
        ...,
        "user943": [..., {message: "hello user943", owner: true}, {message: "I'm fine! what about you?", owner: false}, ...],
        ...
      }
    }
  */
  // User.updateOne({username: from}, {$set: {message}})
}