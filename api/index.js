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

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

const MySQLStore = require("express-mysql-session")(session);
const pool = require("../config/db");

const sessionStore = new MySQLStore({}, pool);

app.use(session({
  key: 'hackevent_session_cookie',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax', // Required for cross-site cookies (Vercel to Localhost)
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

app.use("/auth", authRoutes);
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