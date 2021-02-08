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
const handleSocketListeners = require("./controllers/socketControllers/handleSocketListeners");
const handleUserConnection = require("./controllers/socketControllers/handleUserConnection");
const setUserStatus = require("./controllers/socketControllers/updateUserStatus");

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
io.on("connection", (socket) => {
  console.log("got a new one ", io.sockets.adapter.rooms);

  handleUserConnection.connect(io, socket);

  // on disconnect, delete user from online_users, and update status to offline
  socket.on("disconnect", () => {
    handleUserConnection.disconnect(io, socket);
  });
});

const connectUser = (user, socketId) => {
  online_users[user] = socketId; // add user to online users list
  console.log({ online_users });

  setUserStatus(user, true); // update user isOnline status

  notifyListeners.statusUpdate(io, socketsListeners, online_users, user, true); // notify user's listeners
};
