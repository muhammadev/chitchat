const { validationResult } = require("express-validator");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({
      errorMessage: "validation failed",
      errors: errors.errors,
    });
  }

  // extract data from the body
  const { email, password } = req.body;

  // find the user by his email
  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(404).send({
        errorMessage: "user not found",
        data: req.body,
      });
    }

    // compare passwords
    bcrypt.compare(password, user.password, (err, matched) => {
      if (err) {
        return res.status(500).send({
          errorMessage: "server error. #801",
          err,
        });
      }

      if (matched) {
        // create the token
        jwt.sign({ id: user._id }, process.env.JWT_SECRET, (err, token) => {
          if (err) return res.send({ errorMessage: "server error. #802" });

          const { _id, fullname, username, email } = user;
          const userData = { _id, fullname, username, email };

          res.status(200).send({
            token,
            user: userData,
          });
        });
      } else {
        res.status(401).send({errorMessage: "Unauthorized User"})
      }
    });
  });
}
