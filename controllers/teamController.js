const pool = require("../config/db");


// CREATE TEAM
exports.createTeam = async (req, res) => {

  try {

    const leaderId = req.session.memberId;

    //check if leader already has a team
    const [member] = await pool.query(
    "SELECT team_id FROM members WHERE id=?",
    [leaderId]
    );

    if (member[0].team_id !== null) {
    return res.status(400).json({
        error: "Leader already has a team"
    });



    }

    const [event_id] = await pool.query(
      "SELECT event_id FROM members WHERE id=?",
      [leaderId]
    );
    const {
      name,
      color
    } = req.body;

    const logo = req.file ? req.file.path : null;

    // create team
    const [result] = await pool.query(
      `INSERT INTO teams
      (name, logo, color, event_id, leader_id)
      VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        logo,
        color,
        event_id[0].event_id,
        leaderId
      ]
    );

    const teamId = result.insertId;

    // update leader team_id
    await pool.query(
      "UPDATE members SET team_id=? WHERE id=?",
      [teamId, leaderId]
    );

    res.json({
      message: "Team created",
      team_id: teamId
    });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// GET ALL TEAMS
exports.getTeams = async (req, res) => {

  try {

    const [rows] = await pool.query("SELECT * FROM teams");

    res.json(rows);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// GET SINGLE TEAM
exports.getTeam = async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM teams WHERE id=?",
      [id]
    );

    res.json(rows[0]);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// UPDATE TEAM
exports.updateTeam = async (req, res) => {

  try {

    const { id } = req.params;

    const { name, color } = req.body;

    const logo = req.file ? req.file.path : null;

    if (logo) {

      await pool.query(
        `UPDATE teams
         SET name=?, logo=?, color=?
         WHERE id=?`,
        [name, logo, color, id]
      );

    } else {

      await pool.query(
        `UPDATE teams
         SET name=?, color=?
         WHERE id=?`,
        [name, color, id]
      );

    }

    res.json({ message: "Team updated" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// DELETE TEAM
exports.deleteTeam = async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      "DELETE FROM teams WHERE id=?",
      [id]
    );

    res.json({ message: "Team deleted" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};