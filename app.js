require("dotenv").config();
const mongo = require("mongoose");
const express = require("express");
const session = require("express-session");
const { default: mongoose } = require("mongoose")
const bodyParser = require("body-parser");

const authRoutes = require("./server/routes/auth");
const DB = require("./model/connectionSQL");
const loginRoutes = require("./server/routes/login");



const app = express();
const PORT = 5000 || process.env.PORT;
const MONGOURI = process.env.MONGO_URI

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", loginRoutes);
app.use("/", authRoutes);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));


app.set("layout", "layouts/main");
app.set("view engine", "ejs");


app.get("", (req, res) => {
    res.render("login");
});

app.get("/dashboard", (req, res) => {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    res.render("dashboard", { user: req.session.user });
  });

app.listen(PORT, () => {
    console.log(`App is listening ${PORT}`);
});



mongoose.connect(MONGOURI).then(()=> {
    console.log("databesis connected fjdklaöfjkdla");
})
.catch((error) => console.log(error));


const userSchema = new mongoose.Schema({
    name: String,
    age: Number,
});

const userModel = mongoose.model("users", userSchema);

app.get("/getUsers", async(req, res) => {
    const usersData = await userModel.find();
    res.json(usersData);
});

function requireLogin(req, res, next) {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    next();
};

  app.get("/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  });