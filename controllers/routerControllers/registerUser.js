const { validationResult } = require("express-validator");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(req.body, errors);
    return res.status(400).send({
      errorMessage: "Validation Error. #803",
      errors: errors.errors,
    });
  }

  // extract data...
  const { fullname, username, email, password } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err)
      return res
        .status(500)
        .send({ errorMessage: "server error. #804", err });

    const user = new User({
      fullname,
      username,
      email,
      password: hash,
    });

    user.save((err, user) => {
      if (err) {
        return res
          .status(400)
          .send({ errorMessage: "can't save user. #805", err });
      }

      // create user token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

      const { id, fullname, username, email } = user;
      const userData = { id, fullname, username, email };

      res.status(200).send({
        token,
        user: userData,
      });
    });
  });
}
