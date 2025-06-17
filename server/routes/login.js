const express = require("express");
const router = express.Router();
const DB = require("../../model/connectionSQL");


router.get("/login", (req, res) => {
  res.render("login");
});


router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM users WHERE user_name = ? AND user_pass = ?`;
  DB.get(query, [username, password], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    if (!row) {
      return res.status(401).send("Invalid username or password");
    }
    
    req.session.user = { id: row.user_id, username: row.user_name };
    res.redirect("/dashboard");
  });
});

module.exports = router;
