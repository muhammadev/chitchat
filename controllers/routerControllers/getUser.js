const User = require("../../models/User");
module.exports = (req, res) => {
  const { id } = req.params;
  console.log("got an id from getUser: ", id);
  User.findOne({ _id: id }).then((user) => {
    if (!user) {
      console.log("user ", id, " not found");
      return res.status(404).send({ errorMessage: "user not found" });
    }

    const { _id, fullname, username, messages, online } = user;
    const userData = { _id, fullname, username, messages, online };

    return res.status(200).send({ user: userData });
  });
}