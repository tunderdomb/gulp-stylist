var path = require("path")
var fs = require("fs")

var gutil = require("gulp-util")
var cyan = gutil.colors.cyan
var File = gutil.File;
var through = require("through2")
var PluginError = gutil.PluginError

var stylist = require("stylist")

var glob = require("glob")
var mkdirp = require("mkdirp")

var cwd = process.cwd()

module.exports = {}

function clone( obj ){
  var clone = {}
  for ( var prop in obj ) {
    if ( obj.hasOwnProperty(prop) ) clone[prop] = obj[prop]
  }
  return clone
}

function getExisting( pattern ){
  if ( !pattern ) return ""
  return glob.sync(pattern).map(function ( src ){
    return fs.readFileSync(path.join(process.cwd(), src), "utf8") || ""
  }).join("\n")
}

module.exports.extract = function extract( options ){
  if ( !options ) options = {}

  var ignorePattern = options.ignore

  // closed in a watcher this prevents the options object to stagnate
  var opt = clone(options)

  return through.obj(function ( file, enc, done ){
    if ( file.isNull() ) return // ignore
    if ( file.isStream() ) return this.emit("error", new PluginError("gulp-concat", "Streaming not supported"))

    // unfortunately we have to read everything in on each run to avoid duplicates
    // caching would defeat the purpose of the whole module
    opt.ignore = getExisting(ignorePattern)

    var content = file.contents.toString()
    var selectors = stylist.extract(content, opt)

    if ( !selectors.length ) return done()

    var cssString = gutil.linefeed + selectors.join(gutil.linefeed)
    var destPath = gutil.replaceExtension(file.path, "." + (opt.style || "css"))
    var cssFile = new File({
      cwd: file.cwd,
      base: file.base,
      path: destPath,
      contents: new Buffer(cssString)
    })

    gutil.log("Extracted "
      + cyan(selectors.length)
      + " selectors from "
      + cyan(destPath.replace(file.cwd, "")))

    this.push(cssFile)
    done()
  })
}

module.exports.append = function append( destDir ){
  return through.obj(function ( file, enc, done ){
    if ( file.isNull() ) return // ignore
    if ( file.isStream() ) return this.emit("error", new PluginError("gulp-concat", "Streaming not supported"))
    this.push(file)
    var dest = path.join(file.cwd, destDir, file.path.replace(file.base, ""))
    mkdirp(path.dirname(dest), function ( err ){
      if ( err ) done(err)
      else fs.appendFile(dest, file.contents, function ( err ){
        if ( err ) done(err)
        else {
          gutil.log("Appended to " + cyan(dest.replace(file.cwd, "")))
          done()
        }
      })
    })
  })
}