var mongoose = require('mongoose')
  , jwt = require('jsonwebtoken')
  , moment = require('moment');

var User = require("./models/user");
var Poem = require("./models/poem");

var helpers = require("./helpers");

module.exports = function(app, passport) {
  app.get("/", function(req, res) {
    if (req.isAuthenticated()) {
      Poem
        .find({
          author: {
            $in: [req.user._id].concat(req.user.relationships.following)
          }
        })
        .sort({ created_at: -1 })
        .populate("author")
        .exec(function(err, poems) {
          if (err) return res.render("error", { error: err });
          if (poems.length < 1) return res.render("intro");

          res.render("home", { poems: poems });
        });
    } else {
      res.render("index");
    }
  });

  app.post("/post", loggedIn, function(req, res) {
    // post a poem
    var poem = new Poem({
      title: req.body.title,
      content: req.body.poem,
      author: req.user._id,
      preview: req.body.poem.replace(/(?:\r\n|\r|\n)/g, " / ")
    });

    poem.save(function(err, poem) {
      if (err) return res.redirect("/post");

      req.user.poems.push(poem._id);

      req.user.save((err, user) => {
        res.redirect("/poem/" + poem._id);
      });
    });
  });

  app.get("/post", loggedIn, function(req, res) {
    res.render("post");
  });

  app.get("/settings", loggedIn, function(req, res) {
    var timeAgo = moment(req.user.created_at).fromNow();
    res.render("settings", {
      user: req.user,
      title: req.user.username,
      time_ago: timeAgo
    });
  });

  app.post("/settings", loggedIn, function(req, res) {
    User.findOne({ username: req.user.username }, function(err, user) {
      user.username = req.body.username;

      user.description = req.body.description;

      user.save(function(err) {
        // get flashes to start working lol
        if (err) console.log(err); // errors if username already exists
      });

      res.redirect(req.get("referer"));
    });
  });

  app.get("/delete/:id", loggedIn, function(req, res) {
    Poem.findOne({ _id: req.params.id }, function(err, poem) {
      if (err) console.log(err);

      if (String(poem.author) === String(req.user._id)) {
        res.render("delete", { poem: poem });
      } else {
        res.render("delete");
      }
    });
  });

  app.post("/delete/:id", loggedIn, function(req, res) {
    Poem.findOne({ _id: req.params.id }, function(err, poem) {
      if (String(poem.author) === String(req.user._id)) {
        // we good to delete! it belongs to the user
        Poem.remove({ _id: poem._id }, function(err, poem) {
          if (err) console.log(err);

          console.log("deleted post");
        });

        res.redirect("/me");
      } else {
        // that's not your poem dude
        res.redirect("/me");
      }
    });
  });

  app.get("/deactivate", loggedIn, function(req, res) {
    res.render("deactivate", { user: req.user });
  });

  app.post("/deactivate/:id", loggedIn, function(req, res) {
    if (String(req.user._id) !== String(req.user._id)) {
      return res.render({ error: "that's not your profile :)" });
    }

    User.remove({ _id: req.user._id }, function(err) {
      if (err) return res.render("error", { error: err });

      Poem.find({ author: req.user._id }).remove().exec();

      res.redirect("/");
    });
  });

  app.get("/edit/:id", loggedIn, function(req, res) {
    Poem.findOne({ _id: req.params.id }, function(err, poem) {
      if (!poem.id) return res.render("error", { error: err });

      if (String(poem.author) === String(req.user._id)) {
        res.render("edit", { poem: poem });
      } else {
        res.redirect("/login");
      }
    });
  });

  app.post("/edit/:id", loggedIn, function(req, res) {
    Poem.findOne({ _id: req.params.id }, function(err, poem) {
      if (err) return console.log(err);

      if (String(poem.author) !== String(req.user._id)) {
        return res.render("error", { error: "that's not your account" });
      }

      poem.title = req.body.title;
      poem.content = req.body.content;
      poem.preview = req.body.content.replace(/(?:\r\n|\r|\n)/g, " / ");

      poem.save(function(err, poem) {
        if (err) return res.render("error", { error: err });

        res.redirect("/poem/" + poem._id);
      });
    });
  });

  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  app.get("/register", function(req, res) {
    res.render("register", {
      title: "Register",
      message: req.flash("registerMessage")
    });
  });

  app.post("/register", passport.authenticate("local-register", {
      successRedirect: "/",
      failureRedirect: "/register",
      failureFlash: true
    }));

  app.get("/login", function(req, res) {
    res.render("login", { title: "Login", message: req.flash("loginMessage") });
  });

  app.post("/login", passport.authenticate("local-login", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true
    }));

  app.get("/poem/:id", function(req, res) {
    Poem.findOne({ _id: req.params.id }, function(err, poem) {
      if (err) return res.render("error", { error: err });

      User.findOne({ _id: poem.author }, function(err, author) {
        if (err) return res.render("error", { error: err });

        res.render("poem", {
          poem: poem,
          author: author,
          title: poem.title + " by " + author.username + " on Raven",
          description: poem.preview
        });
      });
    });
  });

  // testing, remove in production
  app.get("/users.json", function(req, res) {
    User.find({}).populate("poems").exec(function(err, users) {
      if (err) return res.render("error", { error: err });

      res.send(users);
    });
  });

  // testing, remove in production
  app.get("/poems.json", function(req, res) {
    Poem.find({}).populate("author").exec(function(err, poems) {
      if (err) return res.render("error", { error: err });

      res.send(poems);
    });
  });

  app.get("/@:username", function(req, res) {
    var username = req.params.username;

    User.findOne({ username: username }, function(err, user) {
      if (err) return res.render("error", { error: err });

      if (!user) {
        res.render("404");
      } else {
        Poem
          .find({ author: user._id })
          .sort({ created_at: -1 })
          .populate("author")
          .exec(function(err, poems) {
            var follow_block = true,
              button = { value: "Follow", url: "follow" };

            if (req.user) {
              // if the user is logged in
              if (helpers.isFollowing(req.user, user)) {
                button = { value: "Unfollow", url: "unfollow" };
              }

              // if logged in user is this user disable follow block
              if (username === req.user.username) follow_block = false;
            }

            res.render("profile", {
              user: user,
              poems: poems,
              button: button,
              follow_block: follow_block
            });
          });
      }
    });
  });

  app.get("/@:username/followers", function(req, res) {
    User.findOne({ username: req.params.username }, function(err, user) {
      if (err) return res.render("error", { error: err });

      var followerIDs = user.relationships.followers, followers = [];

      for (var i = 0; i < followerIDs.length; i++) {
        User.findOne({ _id: followerIDs[i] }, function(err, user) {
          followers.push(user);
        });
      }

      res.render("followers", { followers: followers });
    });
  });

  app.get("/@:username/following", function(req, res) {
    User.findOne({ username: req.params.username }, function(err, user) {
      return res.render("error", { error: err });

      res.send(user.relationships);
    });
  });

  app.post("/follow/@:username", loggedIn, function(req, res) {
    User.findOne({ _id: req.user._id }, function(err, user) {
      if (err) console.log(err);
      User.findOne({ username: req.params.username }, function(err, friend) {
        if (err) return res.render("error", { error: err });

        if (user._id === friend._id) return;

        if (helpers.isFollowing(user, friend)) {
          return console.log("already following user");
        }

        user.relationships.following.push(friend._id);
        friend.relationships.followers.push(user._id);

        user.save(function(err, user) {
          if (err) return res.render("error", { error: err });
        });

        friend.save(function(err, friend) {
          if (err) return res.render("error", { error: err });
        });

        console.log(user.username + " followed " + friend.username);
      });
    });
    res.redirect("/@" + req.params.username);
  });

  app.post("/unfollow/@:username", loggedIn, function(req, res) {
    User.findOne({ _id: req.user._id }, function(err, user) {
      if (err) console.log(err);

      User.findOne({ username: req.params.username }, function(err, friend) {
        if (err) return res.render("error", { error: err });

        if (user._id === friend._id) return;

        if (!helpers.isFollowing(user, friend)) {
          return console.log("you are not following that user");
        }

        user.relationships.following.pull(friend._id);
        friend.relationships.followers.pull(user._id);

        user.save(function(err, user) {
          if (err) return res.render("error", { error: err });
        });

        friend.save(function(err, friend) {
          if (err) return res.render("error", { error: err });
        });

        console.log(user.username + " unfollowed " + friend.username);
      });
    });
    res.redirect("/@" + req.params.username);
  });

  app.route('/token')
    .get(loggedIn, (req, res) => {
      var token = jwt.sign({ id: req.user._id}, 'secretsecret');
      res.send({token: token});
    })

    .post((req, res) => {

    });

  app.get("/poems.json", (req, res) => {
    Poem.find({}, (err, poems) => {
      if (err) throw err;

      res.send(poems);
    });
  });

  app.get("/me", loggedIn, function(req, res) {
    res.redirect("/@" + req.user.username);
  });

  app.get("*", function(req, res) {
    res.render("404");
  });

  function loggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();

    res.redirect("/login"); // else redirect to login
  }
};
