const express = require("express");
// define express app
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/User");
// middlewares imports
const authenticate = require("./middlewares/authenticate");
const registerValidation = require("./middlewares/registerValidation");
const loginValidation = require("./middlewares/loginValidation");
// controllers imports
const registerUser = require("./controllers/routerControllers/registerUser");
const loginUser = require("./controllers/routerControllers/loginUser");
const getCurrentUser = require("./controllers/routerControllers/getCurrentUser");
const getUser = require("./controllers/routerControllers/getUser");
const getUsers = require("./controllers/routerControllers/getUsers");
const setSocketListener = require("./controllers/socketControllers/setSocketListener");
const deleteSocketListener = require("./controllers/socketControllers/deleteSocketListener");
const setUserStatus = require("./controllers/socketControllers/setUserStatus");
const notifyListeners = require("./controllers/socketControllers/notifyListeners");

// configuring dotenv
dotenv.config();

// parsing request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// connecting to db
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("connected to db"))
  .catch((err) => console.error("error connecting to db: ", err));

// configuring cors requests
app.use(cors()); // enable cors for all requests -- is that ok?

// --- GET REQUESTS ---

// authenticate user
app.get("/users/authenticate-user", authenticate, getCurrentUser);

// get all users
app.get("/users", authenticate, getUsers);

// get one user
app.get("/users/:id", authenticate, getUser);

// --- POST REQUESTS ---

// register user
app.post("/register", ...registerValidation, registerUser);

// login user
app.post("/login", ...loginValidation, loginUser);

// listening to port
const server = app.listen(process.env.PORT, () => {
  console.log("listening to port: ", process.env.PORT);
});

// importing socket.io & enabling cors
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

// setting up IO

let socketsListeners = {};
let online_users = {};

io.on("connection", (socket) => {
  const { user } = socket.handshake.query;
  // set the user into online_users
  online_users[user] = socket.id;
  console.log({online_users});
  console.log("now online");
  // update isOnline status
  setUserStatus(user, true);
  notifyListeners.statusUpdate(io, socketsListeners, online_users, user, true)

  socket.on("set socket listener", (partner) => {
    socketsListeners = setSocketListener(
      user,
      partner,
      socketsListeners
    );
    console.log("set socket listener ", socketsListeners);
  });

  socket.on("delete socket listener", (partner) => {
    socketsListeners = deleteSocketListener(
      user,
      partner,
      socketsListeners
    );
    console.log("delete socket listener ", socketsListeners);
  });

  socket.on("message", (message, to) => {
    io.to(online_users[to]).emit("message", message)
  })

  // on disconnect, delete user from online_users, and update status to offline
  socket.on("disconnect", () => {
    delete online_users[socket.handshake.query.user];
    console.log("user disconnected", online_users);

    // update isOnline status
    setUserStatus(user, false);
    notifyListeners.statusUpdate(io, socketsListeners, online_users, user, false);
  });
});
