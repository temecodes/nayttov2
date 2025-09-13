const sqlite3 = require("sqlite3");
const sql3 = sqlite3.verbose();
const path = require("path");



const dbPath = path.join(__dirname, "login.db");

const DB = new sql3.Database(dbPath, sqlite3.OPEN_READWRITE, connected);

function connected(err) {
  if (err) {
    console.log(err.message);
    return;
  }
  console.log("DB is already created");

  DB.run(`ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`, [], (err) => { 
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Error adding 'created_at' column:", err.message);
    } else if (!err) {
      DB.run(`UPDATE users SET created_at = datetime('now') WHERE created_at IS NULL`, [], (updateErr) => {
        if (updateErr) {
          console.error("Error updating 'created_at' values:", updateErr.message);
        }
      });
    }
  });

  DB.run(`ALTER TABLE users ADD COLUMN user_mode TEXT DEFAULT 'user'`, [], (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Error adding 'user_mode' column:", err.message);
    }
  });
};


let sql = `CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT,
    user_pass TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    user_mode TEXT DEFAULT 'user'
);`;

DB.run(sql, [], (err) => {
  if (err) {
    console.log("Error while creating users table");
    return;
  }
  console.log("Users table created or already exists");
});

DB.run(`CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  task TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
)`, (err) => {
  if (err) {
    console.error("Error creating todos table:", err.message);
  } else {
    console.log("Todos table created or already exists");
  }
});


module.exports = DB;



