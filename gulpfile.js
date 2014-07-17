var gulp = require("gulp")
var stylist = require("./index")

gulp.task("default", function(  ){

  gulp.src("test/view/**/*.dust")
    .pipe(stylist.extract({
      ignore: "test/style/**/*.css"
    }))
    .pipe(stylist.append("test/style/"))
})
