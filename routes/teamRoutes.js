const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadTeamLogo");
const isTeamLeader = require("../middleware/isTeamLeader");
const isLeader = require("../middleware/isLeader");
const memberAuth = require("../middleware/memberAuth")

const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam
} = require("../controllers/teamController");

router.post("/",memberAuth, isLeader, upload.single("logo"), createTeam);

router.get("/", getTeams);

router.get("/:id", getTeam);

router.put("/:id",memberAuth, isTeamLeader, upload.single("logo"), updateTeam);

router.delete("/:id",memberAuth, isTeamLeader, deleteTeam);

module.exports = router;