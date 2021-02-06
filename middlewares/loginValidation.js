const { body } = require("express-validator");
module.exports = [
  body("email").exists().isEmail().withMessage("Email is required"),
  body("password").exists().withMessage("password is required"),
];
