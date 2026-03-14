const pool = require("../config/db");
const bcrypt = require("bcrypt");

exports.loginMember = async (req, res) => {

  const { email, password } = req.body;

  const [rows] = await pool.query(
    "SELECT * FROM members WHERE email=?",
    [email]
  );

  if (rows.length === 0) {
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }

  const member = rows[0];

  const valid = await bcrypt.compare(
    password,
    member.password_hash
  );

  if (!valid) {
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }

  req.session.memberId = member.id;

  res.json({
    message: "Logged in",
    member_id: member.id,
    role: member.role
  });

};