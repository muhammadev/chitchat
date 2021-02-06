const User = require("../../models/User");
module.exports = function setUserStatus(username, status) {
  console.log("set user status fired", username, status);
  User.updateOne({username}, {$set: {isOnline: status}}).then((result) => {
    if (!result) {
      console.log("something is wrong", username, result);
    }
  })
}