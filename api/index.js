const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config({ path: "./.env" });

const authRoutes = require("../routes/authRoutes");
const eventRoutes = require("../routes/eventRoutes");
const teamRoutes = require("../routes/teamRoutes");
const invitationRoutes = require("../routes/invitationRoutes");
const workshopRoutes = require("../routes/workshopRoutes");
const timerRoutes = require("../routes/timerRoutes");
const adminRoutes = require("../routes/adminRoutes");

const app = express();

app.set('trust proxy', 1);

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
  credentials: true
}));

app.use(express.json());

const MySQLStore = require("express-mysql-session")(session);
const pool = require("../config/db"); // This is a promise pool
const mysql = require("mysql2"); // Import standard mysql2 for callback pool

// Create a separate callback pool for express-mysql-session
const sessionPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const sessionStore = new MySQLStore({}, sessionPool);

app.use(session({
  key: 'hackevent_session_cookie',
  secret: process.env.SESSION_SECRET || 'hackathon_secret_777',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: true, // Vercel is always HTTPS
    sameSite: 'none', // Required for cross-site cookies
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

app.use("/auth", authRoutes);
app.get("/auth/me", (req, res) => {
  if (req.session.adminId) {
    res.json({ loggedIn: true, role: 'admin', id: req.session.adminId });
  } else if (req.session.memberId) {
    res.json({ loggedIn: true, role: 'member', id: req.session.memberId });
  } else {
    res.json({ loggedIn: false });
  }
});
app.use("/events", eventRoutes);
app.use("/teams", teamRoutes);
app.use("/invites", invitationRoutes);
app.use("/workshops", workshopRoutes);
app.use("/timers", timerRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

module.exports = app;