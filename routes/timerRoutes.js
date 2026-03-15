const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getEventTimer,
  startTimer,
  pauseTimer,
  resumeTimer,
  finishTimer,
  createTimer
} = require("../controllers/timerController");

// Public (or member auth, but public is fine for timer usually)
router.get("/event/:eventId", getEventTimer);

// Admin Only
router.post("/event/:eventId", auth, createTimer);
router.put("/event/:eventId/start", auth, startTimer);
router.put("/event/:eventId/pause", auth, pauseTimer);
router.put("/event/:eventId/resume", auth, resumeTimer);
router.put("/event/:eventId/finish", auth, finishTimer);

module.exports = router;
