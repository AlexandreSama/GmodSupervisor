const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const config = require('./config.json')

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

var connection = mysql.createConnection({
    host     : config.hostname,
    user     : config.username,
    database : config.database,
    supportBigNumbers: true,
    port: 3306
});

connection.connect()

// Route to Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/pages/index.html'));
});

// Route to Login Page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/pages/login.html'));
});

app.post('/auth', (req, res) => {
  // Insert Login Code Here
  // Capture the input fields
	let username = req.body.username;
	let password = req.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				req.session.loggedin = true;
				req.session.username = username;
				// Redirect to home page
				res.redirect('/home');
			} else {
				res.send('Mauvais mot de passe et/ou pseudonyme');
			}			
			res.end();
		});
	} else {
		response.send('Veuillez entrer un mot de passe et/ou un pseudonyme!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		response.send('Bonjour, ' + request.session.username + '!');
	} else {
		// Not logged in
		response.send('Connecte toi d\'abord avant de venir ici !');
	}
	response.end();
});

const port = 3000 // Port we will listen on

// Function to listen on the port
app.listen(port, () => console.log(`This app is listening on port ${port}`));
