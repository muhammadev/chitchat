const { body } = require("express-validator");
const User = require("../models/User");

module.exports = [
  body("fullname", "fullname is not valid")
    .exists()
    .isLength({ min: 2, max: 50 }),
  body("username", "username is not valid")
    .exists()
    .isLength({ min: 2, max: 20 })
    .custom(async (username) => {
      return User.find({ username }).then((user) => {
        if (user.length > 0) {
          return Promise.reject("Username is taken");
        } else return true;
      });
    })
    .custom((username) => {
      const result = /^(?=[a-z_\d]*[a-z])[a-z_\d]{2,20}$/.test(username);
      if (!result) {
        return Promise.reject("username must contain only letters and numbers");
      }

      return true;
    }),
  body("email")
    .isEmail()
    .withMessage("email is not valid")
    .custom(async (email) => {
      return User.find({ email }).then((user) => {
        if (user.length > 0) return Promise.reject("Email is already in use");
        else return true;
      });
    }),
  body("password", "password is not valid").exists().isLength({ min: 8 }),
];
