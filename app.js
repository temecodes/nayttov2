require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const https = require("https");
const fs = require("fs");

const authRoutes = require("./server/routes/auth");
const DB = require("./model/connectionSQL");

const app = express();
const PORT = process.env.PORT || 3000;


const httpsOptions = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert"),
};

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }, 
  })
);

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
});

app.set("view engine", "ejs");

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }
  next();
}

app.use("/", authRoutes);

app.get("", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/dashboard", requireLogin, (req, res) => {
  res.render("dashboard", { user: req.session.user });
});

app.get("/change-password", requireLogin, (req, res) => {
  res.render("change-password");
});

app.post("/change-password", requireLogin, async (req, res) => {
  const { old_password, new_password } = req.body;

  const sql = "SELECT * FROM users WHERE user_id = ?";
  DB.get(sql, [req.session.user.id], async (err, row) => {
    if (err){ 
      return res.status(500).send("Database error");
    }

    const match = await bcrypt.compare(old_password, row.user_pass);
    if (!match) {
      return res.status(400).send("Old password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    const updateSql = "UPDATE users SET user_pass = ? WHERE user_id = ?";
    DB.run(updateSql, [hashedPassword, req.session.user.id], (err) => {
      if (err) {
        return res.status(500).send("Failed to update password");
      }

      req.session.destroy(() => {
        res.redirect("/");
      });
    });
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.get("/request-data", requireLogin, (req, res) => {
  const sql = "SELECT user_id, user_name, created_at, user_mode FROM users WHERE user_id = ?";
  DB.get(sql, [req.session.user.id], (err, row) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Database error");
    }
    if (!row) {
      return res.status(404).send("User not found");
    }
    res.render("account-data", { user: row });
  });
});

app.post("/delete-account", requireLogin, (req, res) => {
  const sql = "DELETE FROM users WHERE user_id = ?";
  DB.run(sql, [req.session.user.id], (err) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Failed to delete account");
    }

    req.session.destroy(() => {
      res.redirect("/");
    });
  });
});

app.get("/todo", requireLogin, (req, res) => {
  const sql = "SELECT * FROM todos WHERE user_id = ?";
  DB.all(sql, [req.session.user.id], (err, rows) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Database error");
    }
    res.render("todo", { user: req.session.user, todos: rows, page: "todo" });
  });
});

app.post("/todo/add", requireLogin, (req, res) => {
  const { task } = req.body;
  const sql = "INSERT INTO todos (user_id, task) VALUES (?, ?)";
  DB.run(sql, [req.session.user.id, task], (err) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Failed to add task");
    }
    res.redirect("/todo");
  });
});

app.post("/todo/delete/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM todos WHERE id = ?";
  DB.run(sql, [id], (err) => {
    if (err) {
      console.error("Error deleting todo:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.redirect("/todos");
  });
});

app.post("/todo/edit/:id", requireLogin, (req, res) => {
  const { id } = req.params;
  const { task } = req.body;

  const sql = "UPDATE todos SET task = ? WHERE id = ? AND user_id = ?";
  DB.run(sql, [task, id, req.session.user.id], (err) => {
    if (err) {
      console.error("Error updating todo:", err);
      return res.status(500).send("Failed to update todo");
    }

    res.redirect("/todo");
  });
});

app.get("/todo/edit/:id", requireLogin, (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM todos WHERE id = ? AND user_id = ?";
  DB.get(sql, [id, req.session.user.id], (err, todo) => {
    if (err) {
      console.error("Error fetching todo for edit:", err);
      return res.status(500).send("Failed to load edit form");
    }

    if (!todo) {
      return res.status(404).send("Todo not found");
    }

    res.render("edit-todo", { todo });
  });
});

app.get('/privacy', (req, res) => {
  res.render('privacy');
});
