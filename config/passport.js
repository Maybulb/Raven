var LocalStrategy = require('passport-local').Strategy;

var User = require('../app/models/user');

module.exports = function(passport) {

	// for persistent login sessions
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use('local-login', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	}, function(req, username, password, done) {
		User.findOne({'username': username}, function(err, user) {

			console.log(username);
			console.log(password);

			if (err) return done('oops');

			if (!user) {
				console.log('no user found');
				return done(null, false, req.flash('error', 'No user found.'));
			}

			if (!user.compare(password))
				return done(null, false, req.flash('error', 'Incorrect password.'));

			// ok everything is gucci B)
			return done(null, user);
		});
	}));

	passport.use('local-signup', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	}, function(req, username, password, done) {
		process.nextTick(function() {
			User.findOne({'username': username}, function(err, user) {
				if (err) return done(err);

				if (user) {
					return done(null, false, req.flash('error', 'That username is already taken.'));
				} else {
					var user = new User();

					user.username = username;
					user.password = password;

					user.save(function(err) {
						if (err) throw err;

						return done(null, user);
					});
				}

			});
		});
	}));
}