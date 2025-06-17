const express = require("express");
const router = express.Router();

const DB = require("../../model/connectionSQL");

router.post("/login", (req, res) => {
    const { user_name, user_pass } = req.body;
  
    if (!user_name || !user_pass) {
      return res.status(400).json({ error: "Username and password required" });
    }
  
    const sql = "SELECT * FROM users WHERE user_name = ? AND user_pass = ?";
    DB.get(sql, [user_name, user_pass], (err, row) => {
      if (err) return res.status(500).json({ error: "Internal error" });
  
      if (row) {
        req.session.user = {
          id: row.user_id,
          name: row.user_name
        };
        return res.redirect("/dashboard"); 
      } else {
        return res.status(401).send("Invalid credentials");
      }
    });
  });
module.exports = router;