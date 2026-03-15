const pool = require("../config/db");

// Helper to ensure global timer exists
const ensureGlobalTimerExists = async () => {
    const [rows] = await pool.query("SELECT id FROM timers WHERE id=1");
    if (rows.length === 0) {
        await pool.query("INSERT INTO timers (id, status) VALUES (1, 'not_started')");
    }
};

// CREATE TIMER (NOP for global)
exports.createTimer = async (req, res) => {
  await ensureGlobalTimerExists();
  res.json({ message: "Global timer ready" });
};

// GET GLOBAL TIMER
exports.getEventTimer = async (req, res) => {
  try {
    await ensureGlobalTimerExists();
    const [rows] = await pool.query("SELECT * FROM timers WHERE id=1");
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// START TIMER
exports.startTimer = async (req, res) => {
  try {
    const { end_time } = req.body;
    await ensureGlobalTimerExists();
    const query = "UPDATE timers SET status='running', start_time=NOW(), end_time=? WHERE id=1";
    await pool.query(query, [end_time || null]);
    res.json({ message: "Global timer started" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PAUSE TIMER
exports.pauseTimer = async (req, res) => {
  try {
    await ensureGlobalTimerExists();
    await pool.query("UPDATE timers SET status='paused' WHERE id=1");
    res.json({ message: "Global timer paused" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// RESUME TIMER
exports.resumeTimer = async (req, res) => {
  try {
    await ensureGlobalTimerExists();
    await pool.query("UPDATE timers SET status='running' WHERE id=1");
    res.json({ message: "Global timer resumed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// FINISH TIMER
exports.finishTimer = async (req, res) => {
  try {
    await ensureGlobalTimerExists();
    await pool.query("UPDATE timers SET status='finished', end_time=NOW() WHERE id=1");
    res.json({ message: "Global timer finished" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
