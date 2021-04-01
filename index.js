const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
// middlewares
const authenticate = require("./middlewares/authenticate");
const registerValidation = require("./middlewares/registerValidation");
const loginValidation = require("./middlewares/loginValidation");
// controllers
const registerUser = require("./controllers/routerControllers/registerUser");
const loginUser = require("./controllers/routerControllers/loginUser");
const authenticateUser = require("./controllers/routerControllers/authenticateUser");
const getUser = require("./controllers/routerControllers/getUser");
const getAllUsers = require("./controllers/routerControllers/getAllUsers");
const getUserChat = require("./controllers/routerControllers/getUserChat");
const handleSocketConnection = require("./controllers/socketControllers/handleSocketConnection");

// configuring dotenv
dotenv.config();

// parsing request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// authentication middleware
app.use("/api/*", authenticate);

// --- GET REQUESTS ---
app.get("/", (req, res) => {
  res.send("server's up and running")
})
// authenticate user
app.get("/api/users/auth", authenticateUser);
// get all users
app.get("/api/users", getAllUsers);
// get one user
app.get("/api/users/:id", getUser);
// get messages of user (to and from them)
app.get("/api/users/:id/messages", getUserChat);


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
  handleSocketConnection.connect(io, socket);

  // on disconnect, delete user from online_users, and update status to offline
  socket.on("disconnect", () => {
    handleSocketConnection.disconnect(io, socket);
  });
});
