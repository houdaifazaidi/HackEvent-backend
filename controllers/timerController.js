const pool = require("../config/db");

// Helper to ensure a timer exists for the event
const ensureTimerExists = async (event_id) => {
    const [rows] = await pool.query("SELECT id FROM timers WHERE event_id=?", [event_id]);
    if (rows.length === 0) {
        await pool.query("INSERT INTO timers (event_id) VALUES (?)", [event_id]);
    }
};

// CREATE TIMER
exports.createTimer = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [rows] = await pool.query("SELECT id FROM timers WHERE event_id=?", [eventId]);
    
    if (rows.length > 0) {
        return res.status(400).json({ error: "Timer already exists for this event" });
    }

    await pool.query("INSERT INTO timers (event_id) VALUES (?)", [eventId]);

    res.json({ message: "Timer created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET EVENT TIMER
exports.getEventTimer = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM timers WHERE event_id=?",
      [eventId]
    );

    if (rows.length === 0) {
        return res.json({ event_id: eventId, status: 'not_started', start_time: null, end_time: null });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// START TIMER
exports.startTimer = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { end_time } = req.body; // Expecting ISO string or similar valid datetime
    
    await ensureTimerExists(eventId);

    await pool.query(
        "UPDATE timers SET status='running', start_time=NOW(), end_time=? WHERE event_id=?",
        [end_time || null, eventId]
    );

    res.json({ message: "Timer started" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PAUSE TIMER
exports.pauseTimer = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    await ensureTimerExists(eventId);

    await pool.query(
        "UPDATE timers SET status='paused' WHERE event_id=?",
        [eventId]
    );

    res.json({ message: "Timer paused" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// RESUME TIMER
exports.resumeTimer = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    await ensureTimerExists(eventId);

    await pool.query(
        "UPDATE timers SET status='running' WHERE event_id=?",
        [eventId]
    );

    res.json({ message: "Timer resumed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// FINISH TIMER
exports.finishTimer = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    await ensureTimerExists(eventId);

    await pool.query(
        "UPDATE timers SET status='finished', end_time=NOW() WHERE event_id=?",
        [eventId]
    );

    res.json({ message: "Timer finished" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
