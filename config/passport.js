var LocalStrategy = require("passport-local").Strategy;

var User = require("../app/models/user");

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

  passport.use("local-login", new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true
    },
    function(req, username, password, done) {
      User.findOne({ "username": username }, function(err, user) {
        if (err)
          return done("oops");
        // aaaaaaaa
        if (!user)
          return done(
            null,
            false,
            req.flash("loginMessage", "User not found.")
          );

        if (!user.compare(password))
          return done(
            null,
            false,
            req.flash("loginMessage", "Incorrect Password.")
          );

        // ok everything is gucci B)
        return done(null, user);
      });
    }
  ));

  passport.use("local-register", new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true
    },
    function(req, username, password, done) {
      process.nextTick(function() {
        User.findOne({ "username": username }, function(err, user) {
          if (err)
            return done(err);

          if (user) {
            console.log("user already exists");
            return done(
              null,
              false,
              req.flash("registerMessage", "User already exists.")
            );
          } else {
            var user = new User({ username: username, password: password });

            user.save(function(err) {
              if (err) throw err;

              return done(null, user);
            });
          }
        });
      });
    }
  ));
};
