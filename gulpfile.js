var gulp = require("gulp")
var stylist = require("./index")

gulp.task("default", function(  ){

  gulp.src("test/view/**/*.dust")
    .pipe(stylist("test/style/", {
      ignore: "test/style/**/*.css"
    }))

  gulp.src("test/view/**/*.dust")
    .pipe(stylist())
})
