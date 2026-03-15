require("dotenv").config();
const pool = require("./config/db");

async function migrate() {
    try {
        console.log("Adding remaining_seconds column to timers table...");
        await pool.query("ALTER TABLE timers ADD COLUMN remaining_seconds INT DEFAULT 0;");
        console.log("Migration successful.");
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("Column already exists.");
            process.exit(0);
        }
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
