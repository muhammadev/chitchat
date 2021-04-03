const User = require("../../models/User");
module.exports = function setOnlineOrOffline(id, status) {
  console.log("set user status fired", id, status);
  User.findOne({_id: id}).then((user) => {
    console.log("result of setOnlineOrOffline", user);

    user.online = status;
    user.save(function(result) {
      console.log("result of saving user model: ", result);
    })
  })
}