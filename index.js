var path = require("path")
var fs = require("fs")

var gutil = require("gulp-util")
var File = gutil.File;
var through = require("through2")
var PluginError = gutil.PluginError

var stylist = require("stylist")

var glob = require("glob")
var mkdirp = require("mkdirp")

var IGNORE_LABEL = "collecting existing files to ignore"

module.exports = {}

function getExisting( pattern ){
  if ( !pattern ) return ""
  return glob.sync(pattern).map(function ( src ){
    return fs.readFileSync(path.join(process.cwd(), src), "utf8") || ""
  }).join("\n")
}

module.exports.extract = function extract( options ){
  if ( !options ) options = {}

  var ignorePattern = options.ignore

  var ignoresCollected = false
  var selectorCount = 0

  return through.obj(function ( file, enc, done ){
    if ( file.isNull() ) return // ignore
    if ( file.isStream() ) return this.emit("error", new PluginError("gulp-concat", "Streaming not supported"))

    // unfortunately we have to read everything in on each run to avoid duplicates
    // caching would defeat the purpose of the whole module
    if ( !ignoresCollected ) {
      ignoresCollected = true
      console.time(IGNORE_LABEL)
      options.ignore = getExisting(ignorePattern)
      console.timeEnd(IGNORE_LABEL)
    }

    var content = file.contents.toString()
    var selectors = stylist.extract(content, options)

    if ( !selectors.length ) return done()

    selectorCount += selectors.length
    var cssString = gutil.linefeed + selectors.join(gutil.linefeed)
    var destPath = gutil.replaceExtension(file.path, "." + (options.style || "css"))
    var cssFile = new File({
      cwd: file.cwd,
      base: file.base,
      path: destPath,
      contents: new Buffer(cssString)
    })

    this.push(cssFile)
    done()
  }, function (){
    ignoresCollected = false
    console.log("extracted %d selectors", selectorCount)
    this.emit("end")
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
        done(err)
      })
    })
  })
}