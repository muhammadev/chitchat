const User = require("../../models/User");
module.exports = function setOnlineOrOffline(id, status) {
  console.log("set user status fired", id, status);
  User.updateOne({_id: id}, {$set: {online: status}}).then((result) => {
    if (!result) {
      console.log("something is wrong", id, result);
    }
  })
}