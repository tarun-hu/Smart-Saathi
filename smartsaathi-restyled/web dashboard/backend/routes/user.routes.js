const express = require("express");
const { createUser } = require("../controllers/user.controller");

const router = express.Router();

router.post("/", createUser);
// router.get("/", getUsers);

module.exports = router;