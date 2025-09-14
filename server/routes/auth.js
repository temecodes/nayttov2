const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const DB = require("../../model/connectionSQL");


router.post("/login", (req, res) => {
  const { user_name, user_pass } = req.body;

  if (!user_name || !user_pass) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const sql = "SELECT * FROM users WHERE user_name = ?";
  DB.get(sql, [user_name], async (err, row) => {
    if (err){ 
      return res.status(500).json({ error: "Internal error" });
    }

    if (!row) {

      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(user_pass, row.user_pass);
    if (match) {
      req.session.user = {
        id: row.user_id,
        name: row.user_name,
      };
      return res.redirect("/dashboard");
    } else {

      return res.status(401).json({ error: "Invalid credentials" });
    }
  });
});

router.post("/register", async (req, res) => {
  const { user_name, user_pass } = req.body;

  if (!user_name || !user_pass) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const checkUserSql = "SELECT * FROM users WHERE user_name = ?";
  DB.get(checkUserSql, [user_name], async (err, row) => {
    if (err){ 
      return res.status(500).json({ error: "Internal error" });
    }

    if (row) {
      return res.status(409).json({ error: "Username already taken" });
    }

    try {
      const hashedPass = await bcrypt.hash(user_pass, 10); // 10 salt rounds, mitä isompi numero sitä hitaampi mutta turvallisempi

      const insertUserSql = `
        INSERT INTO users (user_name, user_pass, user_mode, created_at) 
        VALUES (?, ?, 'user', CURRENT_TIMESTAMP)`;
      DB.run(insertUserSql, [user_name, hashedPass], function (err) {
        if (err) {
          console.error("Database error:", err.message);
          return res.status(500).json({ error: "Failed to register user" });
        }

        req.session.user = {
          id: this.lastID,
          name: user_name,
        };

        return res.redirect("/");
      });
    } catch (hashErr) {
      return res.status(500).json({ error: "Error hashing password" });
    }
  });
});



module.exports = router;
