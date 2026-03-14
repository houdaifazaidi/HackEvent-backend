const express = require("express");
const router = express.Router();

const { login, logout } = require("../controllers/authController");

const { loginMember } = require("../controllers/memberAuthController");
router.post("/login", login);
router.post("/logout", logout);
router.post("/member/login", loginMember);
module.exports = router;