var User = require("./models/user");
var Poem = require("./models/poem");

var isFollowing = function(user, friend) {
  return user.relationships.following.indexOf(friend._id) != -1;
};

module.exports = { isFollowing };
