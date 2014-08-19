gulp-stylist
=============

## Usage

The plugin accepts two optional arguments.

### dest

A folder relative to the current working dir
where the styles will be extracted.

If not provided, every selector will be appended to a file named after the file it was extracted from.
For instance, `index.html` without the dest option will produce a `index.css`,
`some/other/page.html` will yield a `some/other/page.css`.


### options

This is relayed to stylist, the values are the same.
See the [stylist](https://github.com/tunderdomb/stylist) repo for the available options.

```js
var gulp = require("gulp")
var stylist = require("./index")

gulp.task("default", function(  ){

  // extract styles to another dir
  // creates a structure identical to the template root
  gulp.src("test/view/**/*.dust")
    .pipe(stylist("test/style/", {
      ignore: "test/style/**/*.css"
    }))

  // put stylesheets next to the templates
  gulp.src("test/view/**/*.dust")
    .pipe(stylist())
})
```


## Licence

MIT