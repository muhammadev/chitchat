const jwt = require("jsonwebtoken");
module.exports = function authenticate(req, res, next) {
  const token = req.get("Authentication");
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ errorMessage: "Unauthorized User" });
    }

    req.userId = decoded.id;
    next();
  });
};
