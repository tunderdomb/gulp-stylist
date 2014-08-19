var path = require("path")
var fs = require("fs")

var async = require("async")

var gutil = require("gulp-util")
var cyan = gutil.colors.cyan
var File = gutil.File;
var through = require("through2")
var PluginError = gutil.PluginError

var stylist = require("stylist")

var glob = require("glob")
var mkdirp = require("mkdirp")

var cwd = process.cwd()

module.exports = createPlugin

function clone( obj ){
  var clone = {}
  for ( var prop in obj ) {
    if ( obj.hasOwnProperty(prop) ) clone[prop] = obj[prop]
  }
  return clone
}

function getExisting( pattern, existing, cb ){
  fs.readFile(existing, "utf8", function ( err, content ){
    var existingContent = err ? "" : content
    if ( !pattern ) {
      cb(existingContent)
      return
    }
    glob(pattern, function ( err, files ){
      if ( err ) {
        cb(existingContent)
        return
      }
      async.map(files, function ( src, next ){
        fs.readFile(src, "utf8", function ( err, content ){
          next(null, err ? "" : content)
        })
      }, function ( err, files ){
        cb(existingContent + files.join("\n"))
      })
    })
  })
}

function createPlugin( destDir, options ){
  if ( typeof destDir == "string" ) {
    options = options || {}
  }
  else if ( !options ) {
    options = destDir || {}
    destDir = ""
  }
  var ignorePattern = options.ignore
  // closed in a watcher this prevents the options object to stagnate
  var opt = clone(options)

  return through.obj(function ( file, enc, done ){
    if ( file.isNull() ) return // ignore
    if ( file.isStream() ) return this.emit("error", new PluginError("gulp-concat", "Streaming not supported"))

    var dest = destDir
      ? path.join(file.cwd, destDir, file.path.replace(file.base, ""))
      : file.path
    dest = gutil.replaceExtension(dest, "." + (options.style || "css"))

    var stream = this

    // unfortunately we have to read everything in on each run to avoid duplicates
    // caching would defeat the purpose of the whole module
    getExisting(ignorePattern, dest, function ( ignored ){
      opt.ignore = ignored

      var content = file.contents.toString()
      var selectors = stylist.extract(content, opt)

      if ( !selectors.length ) return done()

      var cssString = gutil.linefeed + selectors.join(gutil.linefeed)
      var cssFile = new File({
        cwd: file.cwd,
        base: file.base,
        path: dest,
        contents: new Buffer(cssString)
      })

      gutil.log("Extracted "
        + cyan(selectors.length)
        + " selectors from "
        + cyan(file.path.replace(file.cwd, "")))

      stream.push(cssFile)

      mkdirp(path.dirname(dest), function ( err ){
        if ( err ) done(err)
        else fs.appendFile(dest, cssString, function ( err ){
          if ( err ) done(err)
          else {
            gutil.log("Appended to " + cyan(dest.replace(file.cwd, "")))
            done()
          }
        })
      })
    })
  })
}