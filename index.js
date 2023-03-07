const express = require("express");

const doteenv = require("dotenv");

const { chats } = require("./Data/data");

const cors = require("cors");

const bodyparser = require("body-parser");

const connectDB = require("./config/db"); // Connect to MongoDB

const colors = require("colors");

const userRoutes = require("./routes/user-routes"); // Import user-routes

const chatRoutes = require("./routes/chat-routes"); // Import chat-routes

const messageRoutes = require("./routes/message-routes"); // Import message-routes

const { notFound, errorHandler } = require("./middleware/errorMiddleware"); // Import notFound and errorhandler middleware to handle error

// const errorHandler = require("./middleware/errorMiddleware"); // Import errorHandler middleware to handle error

doteenv.config();

connectDB(); // To connect with the MongoDB database

const app = express();

app.use(express.json()); // Allows us to accept JSON data in the body

const PORT = process.env.PORT || 3000;

// Body-parser middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Cors - To allow cross origin requests
app.use(
  cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    // allowedHeaders : 'Content-Type',
  })
);

// Dummy controller to test the server
// app.get("/", (req, res) => {
//   res.send("Hello World");
// });

app.use("/api/user", userRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/message", messageRoutes);

app.use(notFound);

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.yellow.bold);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3001",
  },
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("Joined room", room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));

  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    console.log("this is a chat id" + chat._id);

    if (!chat.users) return console.log("Chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;
      // chaged from user._id to chat._id on below line
      socket.in(chat._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    console.log("socket disconnected");
    socket.leave(userData._id);
  });
});
