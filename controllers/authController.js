const pool = require("../config/db");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  const { login, password } = req.body;
  console.log(`[AUTH] Login attempt for: ${login}`);

  try {
    const [rows] = await pool.query(
      "SELECT * FROM admins WHERE login = ?",
      [login]
    );

    if (rows.length === 0) {
      console.log(`[AUTH] Admin not found: ${login}`);
      return res.status(401).json({ error: "Invalid login" });
    }

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
      console.log(`[AUTH] Wrong password for: ${login}`);
      return res.status(401).json({ error: "Wrong password" });
    }

    req.session.adminId = admin.id;
    console.log(`[AUTH] Login success for ${login}. Session ID: ${req.sessionID}`);

    req.session.save((err) => {
      if (err) {
        console.error("[AUTH] Session save error:", err);
        return res.status(500).json({ error: "Failed to save session" });
      }
      res.json({ message: "Logged in", user: { id: admin.id, login: admin.login, role: 'admin' } });
    });

  } catch (err) {
    console.error("[AUTH] Unexpected error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.logout = (req, res) => {

  delete req.session.adminId;

  res.json({ message: "Logged out" });

};