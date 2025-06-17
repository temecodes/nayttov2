const sqlite3 = require("sqlite3");
const sql3 = sqlite3.verbose();

const path = require("path");



const dbPath = path.join(__dirname, "login.db");

const DB = new sql3.Database(dbPath, sqlite3.OPEN_READWRITE, connected);

function connected(err){
    if(err){
        console.log(err.message);
        return;
    }
    console.log("DB is alerady created");
};


let sql = `CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT,
    user_pass TEXT
)`;

DB.run(sql, [], (err) => {
    if(err){
        console.log("error while creating users table");
        return;
    };
        console.log("created table");
});

module.exports = DB;



