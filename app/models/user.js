var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var SALT_FACTOR = 10;

var userSchema = new Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	created_at: Date,
	description: String,
	poems: [{ type: Schema.Types.ObjectId, ref: 'Poem' }],
	relationships: {
		followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		following: [{ type: Schema.Types.ObjectId, ref: 'User' }]
	}
});

userSchema.pre('save', function(next) {
	var user = this;

	// new user gets current created at day
	if (!this.created_at) this.created_at = new Date();

	// if password is modified skip this
	if (!user.isModified('password')) return next();

	bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
		if (err) return next(err);

		bcrypt.hash(user.password, salt, function(err, hash) {
			user.password = hash;
			next();
		});
	});
});

userSchema.methods.compare = function(pw) {
	return bcrypt.compareSync(pw, this.password);
}

module.exports = mongoose.model('User', userSchema);