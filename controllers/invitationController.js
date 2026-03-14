const pool = require("../config/db");
const generateCode = require("../utils/generateCode");
const bcrypt = require("bcrypt");


// CREATE LEADER INVITE
exports.createLeaderInvite = async (req, res) => {

  try {

    const { event_id } = req.body;

    const code = generateCode();

    await pool.query(
      "INSERT INTO leader_invitations (code, event_id) VALUES (?, ?)",
      [code, event_id]
    );

    res.json({ code });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// JOIN AS LEADER
exports.joinAsLeader = async (req, res) => {

  try {

    const { code, first_name, last_name, email, password,portfolio } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM leader_invitations WHERE code=? AND used=false",
      [code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid code" });
    }

    const invite = rows[0];

    await pool.query(
      `INSERT INTO members
      (first_name,last_name,email,password_hash,role,portfolio,event_id)
      VALUES (?,?,?,?,?,?,?)`,
      [first_name, last_name, email, await bcrypt.hash(password, 10), "leader", portfolio, invite.event_id]
    );

    await pool.query(
      "UPDATE leader_invitations SET used=true WHERE id=?",
      [invite.id]
    );

    res.json({ message: "Leader registered" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// CREATE TEAM INVITE
exports.createTeamInvite = async (req, res) => {

  try {

    const { team_id } = req.body;

    const code = generateCode();

    await pool.query(
      "INSERT INTO team_invitations (code, team_id) VALUES (?, ?)",
      [code, team_id]
    );

    res.json({ code });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// JOIN TEAM
exports.joinTeam = async (req, res) => {

  try {

    const {
      code,
      first_name,
      last_name,
      email,
      password,
      portfolio
    } = req.body;

    const [rows] = await pool.query(
      `SELECT t.*, ti.id AS invite_id
       FROM team_invitations ti
       JOIN teams t ON t.id = ti.team_id
       WHERE ti.code=? AND ti.used=false`,
      [code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid code" });
    }

    const team = rows[0];

    await pool.query(
      `INSERT INTO members
      (first_name,last_name,email,password_hash,portfolio,role,event_id,team_id)
      VALUES (?,?,?,?,?,?,?,?)`,
      [
        first_name,
        last_name,
        email,
        await bcrypt.hash(password, 10),
        portfolio,
        "member",
        team.event_id,
        team.id
      ]
    );

    await pool.query(
      "UPDATE team_invitations SET used=true WHERE id=?",
      [team.invite_id]
    );
    

    res.json({ message: "Member joined team" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};