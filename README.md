gulp-stylist
=============

## Usage

Due to the purpose of the plugin,
it is recommended to use the appending sub stream provided with the plugin.
It will simple append extracted selectors to the stylesheets, or create them if they don't yet exist.

The options passed to extract are the same as the stylist options.

```js

var gulp = require("gulp")
var stylist = require("./index")

gulp.task("default", function(  ){

  gulp.src("test/view/**/*.dust")
    .pipe(stylist.extract({
      ignore: "test/style/**/*.css"
    }))
    .pipe(stylist.append("test/style/"))
})

```


## Licence

MIT