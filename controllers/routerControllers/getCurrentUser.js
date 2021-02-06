const User = require("../../models/User");

module.exports = (req, res) => {
  User.findOne({ _id: req.userId }).then((user) => {
    if (!user)
      return res.status(404).send({ errorMessage: "user not found" });

    const { _id, fullname, username, messages, isOnline } = user;
    const userData = { _id, fullname, username, messages, isOnline };

    return res.status(200).send({ user: userData });
  });
}