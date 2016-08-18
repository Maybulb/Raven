var express = require('express');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var User = require('./models/user');

var app = express();
var port = process.env.PORT || 8080;

// app config
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// server connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/raven', function(err) {
	if (err) throw err;

	console.log('Connected to db');
})

app.get('/', function(req, res) {
	res.render('index');
})

app.get('/register', function(req, res) {
	res.send('register in progress')
})

app.post('/register', function(req, res) {
	var user = new User({
		username: req.body.username,
		password: req.body.password
	});

	user.save(function(err) {
		if (err) throw err;

		res.send(user.username + ' saved successfully');
	})
})

app.get('/login', function (req, res) {
	res.send('signup in progress');
})

app.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		if (err) throw err;

		res.send(users);
	})
})

app.get('/user/:username', function(req, res) {
	var username = req.params.username;

	User.findOne({username: username}, function(err, user) {
		if (err) throw err;

		res.send(user);
	})
})

app.listen(port, function() {
	console.log('watching port', port);
})