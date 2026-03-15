const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadTeamLogo");
const isAdminOrTeamLeader = require("../middleware/isAdminOrTeamLeader");
const isAdminOrLeader = require("../middleware/isAdminOrLeader");
const memberAuth = require("../middleware/memberAuth")

const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam
} = require("../controllers/teamController");

router.post("/", isAdminOrLeader, upload.single("logo"), createTeam);

router.get("/", getTeams);

router.get("/:id", getTeam);

router.put("/:id",isAdminOrTeamLeader, upload.single("logo"), updateTeam);

router.delete("/:id",isAdminOrTeamLeader, deleteTeam);

module.exports = router;