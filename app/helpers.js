// doesn't work yet :)
var isFollowing = function (user, friend) {
	User.findOne({_id: user._id}, function(err, user) {
		return(!user.relationships.following.indexOf(friend._id) == -1)
	});
}

module.exports = {isFollowing}