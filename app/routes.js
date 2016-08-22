module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.render('index');
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/register', function(req, res) {
		res.send('register in progress');
	});

	app.post('/register', function(req, res) {
		var user = new User({
			username: req.body.username,
			password: req.body.password
		});

		user.save(function(err) {
			if (err) throw err;

			res.send(user.username + ' saved successfully');
		});
	});

	app.get('/login', function (req, res) {
		res.send('login in progress');
	});

	app.get('/users', function(req, res) {
		User.find({}, function(err, users) {
			if (err) throw err;

			res.send(users);
		});
	});

	app.get('/user/:username', function(req, res) {
		var username = req.params.username;

		User.findOne({username: username}, function(err, user) {
			if (err) throw err;

			res.send(user);
		});
	});


	function loggedIn(req, res, next) {
		if (req.isAuthenticated) return next();

		res.redirect('/'); // else redirect home
	}

}