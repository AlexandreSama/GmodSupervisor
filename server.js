const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();
const config = require("./config.json");
const { Server } = require("@fabricio-191/valve-server-query");
//const { io } = require("socket.io-client");
//const socket = io();

app.set("views", "views");
app.set("view engine", "ejs");
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));

var connection = mysql.createConnection({
  host: config.hostname,
  user: config.username,
  password: config.password,
  database: config.database,
  supportBigNumbers: true,
  port: 3306,
});

connection.connect((err) => {
  if (err) {
    console.log(err.message);
  }
});

// Route to Login Page
app.get("/", (req, res) => {
  res.render("pages/login");
});

app.post("/auth", async (req, res) => {
  // Insert Login Code Here
  const server = await Server({
    ip: "188.165.38.14",
    port: 20020,
    timeout: 3000,
  });
  // Capture the input fields
  console.log(req.body);
  let username = req.body.username;
  let password = req.body.password;
  // Ensure the input fields exists and are not empty
  if (username && password) {
    const players = await server.getPlayers();
    req.session.playersIG = players.length.toString();

    // Execute SQL query that'll select the account from the database based on the specified username and password
    await connection.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        if (results.length > 0) {
          console.log(results);
          // Authenticate the user
          req.session.loggedin = true;
          req.session.username = username;
          req.session.steamid = results[0].steamid;
          // Redirect to home page
          res.redirect("/home");
        } else {
          res.send("Mauvais mot de passe et/ou pseudonyme");
        }
        res.end();
      }
    );
  } else {
    res.send("Veuillez entrer un mot de passe et/ou un pseudonyme!");
    res.end();
  }
});

app.get("/register", function (req, res) {
  res.render("pages/register");
});

app.post("/register_user", function (req, res) {
  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;
  let steamid = req.body.steamid;
  // Ensure the input fields exists and are not empty
  if (
    username &&
    password &&
    email &&
    steamid &&
    RegExp("/^[0-9]+$/").test(steamid) == true
  ) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      function (error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) {
          res.send("Il y a un souci avec la BDD, revenez plus tard");
          throw error;
        }
        // If the account exists
        if (results.length == 0) {
          connection.query(
            `INSERT INTO users (username, password, email, steamid) VALUES ("${username}", "${password}", "${email}", "${steamid}")`,
            function (err, result) {
              if (err) {
                res.send("Il y a un souci avec la BDD, revenez plus tard");
              }
              if (result) {
                req.session.loggedin = true;
                req.session.username = username;
                req.session.steamid = steamid;
                res.redirect("/home");
              }
            }
          );
        }
      }
    );
  } else {
    res.send(
      "Veuillez entrer un mot de passe et/ou un pseudonyme et/ou un steamid correct!"
    );
    res.end();
  }
});

app.get("/logout", function (req, res) {
  if ((req.session.loggedin = true)) {
    req.session.loggedin = false;
    res.redirect("/");
  } else {
    res.send("Il faudrait que tu sois connecté pour ca !");
  }
});

app.get("/home", function (request, response) {
  // If the user is loggedin
  if (request.session.loggedin) {
    // Output username
    response.render("pages/home", {
      username: request.session.username,
      steamid: request.session.steamid,
      playersIG: request.session.playersIG,
    });
  } else {
    // Not logged in
    response.send("Connecte toi d'abord avant de venir ici !");
  }
  // response.end();
});

const port = 3004; // Port we will listen on

// Function to listen on the port
app.listen(port, () => console.log(`This app is listening on port ${port}`));
