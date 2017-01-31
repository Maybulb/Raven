var gulp = require("gulp");
var sass = require("gulp-sass");

gulp.task("default", ["compile"]);
gulp.task("compile", ["sass"]);

gulp.task("watch", function() {
  gulp.watch("public/css/*", ["sass"]);
});

gulp.task("sass", function() {
  return gulp
    .src("public/css/style.scss")
    .pipe(sass())
    .pipe(gulp.dest("public/css"));
});
