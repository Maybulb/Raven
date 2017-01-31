var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var poemSchema = new Schema({
  title: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  author: { type: ObjectId, ref: "User", required: true },
  preview: { type: String, required: true },
  created_at: Date
});

poemSchema.pre("save", function(next) {
  // new poem gets current created at day
  if (!this.created_at) this.created_at = new Date();

  next();
});

module.exports = mongoose.model("Poem", poemSchema);
