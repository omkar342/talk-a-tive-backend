const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

const generateToken = require("../config/generateToken");

// @desc    Register a new user

// @route   POST /api/users

// @access  Public

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields!");
  }

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists!");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      status: "success",
      newUser: {
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data!");
  }
});

// @desc    Login a user

// @route   POST /api/users/login

// @access  Public

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Plz enter all the fields!");
  }

  const user = await User.findOne({ email: email });

  if (user && (await user.matchPassword(password))) {
    res.status(201).json({
      status: "success",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

// @desc    Get all users

// @route   GET /api/users

// @access  Private

const allUsers = asyncHandler(async (req, res) => {
  const keywords = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keywords).find({ _id: { $ne: req.user._id } });

  res.json(users);
});

module.exports = { registerUser, loginUser, allUsers };
