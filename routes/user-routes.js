const express = require("express");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

const { registerUser } = require("../controllers/userAuthControllers");

const { loginUser } = require("../controllers/userAuthControllers");

const { allUsers } = require("../controllers/userAuthControllers");

router.route("/").post(registerUser).get(protect, allUsers);

router.post("/login", loginUser);

module.exports = router;
