var mongoose = require('mongoose');

var User = require('./models/user');
var Poem = require('./models/poem');

var helpers = require('./helpers');

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		if (req.isAuthenticated()) {
			res.render('home', {user: req.user, title: 'Post'});
		} else {
			res.render('index');
		}
	});

	app.post('/', loggedIn, function(req, res) {
		// post a poem
		var poem = new Poem({
			title: req.body.title,
			content: req.body.poem,
			author: req.user._id
		});

		poem.save(function(err, poem) {
			if (err) res.send(err);

			res.redirect('/poem/' + poem._id)
		});
	});

	app.get('/settings', loggedIn, function(req, res) {
		res.render('settings', {user: req.user, title: req.user.username});
	});

	app.post('/settings', loggedIn, function(req, res) {
		User.findOne({username: req.user.username}, function(err, user) {
			user.username = req.body.username;

			user.save(function(err) {
				// get flashes to start working lol
				if (err) console.log(err) // errors if username already exists
			});

			res.redirect(req.get('referer'));
		});
	});

	app.get('/delete/:id', function(req, res) {
		Poem.findOne({_id: req.params.id}, function(err, poem) {
			if (err) throw err;
			
			res.render('delete', {poem: poem});
		});
	});

	app.post('/delete/:id', function(req, res) {
		Poem.remove({_id: req.params.id}, function(err) {
			if (err) throw err;

			res.redirect('/me');
		});
	});

	app.get('/deactivate', loggedIn, function(req, res) {
		res.render('deactivate', {user: req.user});
	});

	app.post('/deactivate/:id', loggedIn, function(req, res) {
		User.remove({_id: req.user._id}, function(err) {
			if (err) throw err;

			Poem.find({author: req.user._id}).remove().exec();

			res.redirect('/');
		})
	});

	app.get('/edit/:id', function(req, res) {
		Poem.findOne({_id: req.params.id}, function(err, poem) {
			if (req.user == null || poem.id == null) res.redirect('/login');
			if (err) throw err;

			if (String(poem.author) === String(req.user._id)) {
				res.render('edit', {poem: poem})
			} else {
				res.redirect('/login');
			}
		});
	});

	app.post('/edit/:id', function(req, res) {
		Poem.findOne({_id: req.params.id}, function(err, poem) {
			if (err) return console.log(err);

			poem.title = req.body.title;
			poem.content = req.body.content;

			poem.save(function(err, poem) {
				if (err) throw err;

				res.redirect('/poem/' + poem._id);
			});
		});
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/register', function(req, res) {
		res.render('register', {
			title: 'Register',
			message: req.flash('registerMessage')
		});
	});

	app.post('/register', passport.authenticate('local-register', {
		successRedirect: '/',
		failureRedirect: '/register',
		failureFlash: true
	}));

	app.get('/login', function (req, res) {
		res.render('login', {
			title: 'Login',
			message: req.flash('loginMessage')
		});
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	}));

	app.get('/poem/:id', function(req, res) {
		var id = req.params.id;

		Poem.findOne({_id: id}, function(err, poem) {
			if (err) res.send(err);

			User.findOne({_id: poem.author}, function(err, author) {
				if (err) res.send(err);

				res.render('poem', {
					poem: poem,
					author: author,
					title: poem.title
				});
			});
		});

	});

	// testing, remove in production
	app.get('/poems', function(req, res) {
		Poem.find({}, function(err, poems) {
			if (err) throw err;

			res.send(poems);
		})
	})

	// testing, remove in production
	app.get('/users', function(req, res) {
		User.find({}, function(err, users) {
			if (err) throw err;

			res.send(users);
		});
	});

	app.get('/@:username', function(req, res) {
		var username = req.params.username;

		User.findOne({username: username}, function(err, user) {
			if (err) throw err;

			if (!user) {
				res.render('404')
			} else {
				Poem.find({author: user._id}, function(err, poems) {
					res.render('profile', {
						user: user,
						poems: poems,
						followValue: "Follow" // TODO: adjust this later
					});
				});
			}
		});
	});

	app.get('/@:username/followers', function(req, res) {
		User.findOne({username: req.params.username}, function(err, user) {
			if (err) throw err;

			var followerIDs = user.relationships.followers
				, followers = [];

			for (var i = 0; i < followerIDs.length; i++) {
				User.findOne({_id: followerIDs[i]}, function(err, user) {
					followers.push(user);
				});
			}

			res.render('followers', {followers: followers});
		});
	});

	app.post('/follow/@:username', loggedIn, function(req, res) {
		User.findOne({_id: req.user._id}, function(err, user) {
			if (err) throw err;
			User.findOne({username: req.params.username}, function(err, friend) {
				if (err) throw err;

				if (helpers.isFollowing(user, friend) === true) {
					console.log("yes")
				} else {
					console.log("no")
				}

				// you can currently follow a user a million times if you want
				// TODO: fix this?? lol

				user.relationships.following.push(friend._id);
				friend.relationships.followers.push(user._id);

				user.save(function(err, user) {
					if (err) throw err;
				});

				friend.save(function(err, friend) {
					if (err) throw err;
				});

				console.log(user.username + ' followed ' + friend.username);
			});
		});
		res.redirect('/@' + req.params.username);
	});

	app.post('/unfollow/:username', loggedIn, function(req, res) {
		User.findOne({_id: req.user._id}, function(err, user) {
			
		});
	});

	app.get('/me', loggedIn, function(req, res) {
		res.redirect('/@' + req.user.username);
	})

	app.get('*', function(req, res) {
		res.render('404');
	})

	function loggedIn(req, res, next) {
		if (req.isAuthenticated()) return next();

		res.redirect('/login'); // else redirect to login
	}

}