const User = require("../../models/User");
module.exports = (req, res) => {
  User.find((err, users) => {
    if (err)
      return res.status(500).send({ errorMessage: "server error. #806" });

    if (!users)
      return res.status(404).send({ errorMessage: "not found. #806" });
    
    const usersData = [];
    users.forEach(user => {
      const {_id, fullname, username, messages, isOnline} = user;
      const userData = {_id, fullname, username, messages, isOnline};
      usersData.push(userData)
    })

    res.status(200).send({ users: usersData });
  });
}