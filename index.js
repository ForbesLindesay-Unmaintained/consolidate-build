/**
 * Module dependencies.
 */

var consolidate = require('consolidate');
exports = module.exports = consolidate;
var fs = require('fs');



var readCache = {};

/**
 * Require cache.
 */

var cacheStore = {};

/**
 * Require cache.
 */

var requires = {};

/**
 * Clear the cache.
 *
 * @api public
 */
(function () {
  var oldClearCache = consolidate.clearCache;
  exports.clearCache = function(){
    cacheStore = {};
  };
}());

function cache(options, compiled) {
  if (compiled && options.filename && options.cache) {
    delete readCache[options.filename];//don't need to cache in both locations
    cacheStore[options.filename] = compiled;
  } else if (options.filename && options.cache) {
    return cacheStore[options.filename];
  }
  return compiled;
}

/**
 * Read `path` with `options` with
 * callback `(err, str)`. When `options.cache`
 * is true the template string will be cached.
 *
 * @param {String} options
 * @param {Function} fn
 * @api private
 */

function read(path, options, fn) {
  var str = readCache[path];

  // cached (only if cached is a string and not a compiled template function)
  if (options.cache && str && typeof str === 'string') return fn(null, str);

  // read
  fs.readFile(path, 'utf8', function(err, str){
    if (err) return fn(err);
    str = str.replace(/\r\n/g, '\n');
    if (options.cache) readCache[path] = str;
    fn(null, str);
  });
}

/**
 * fromStringRenderer
 */

function fromStringRenderer(name) {
  return function(path, options, fn){
    options.filename = path;
    if (cache(options)) {
      exports[name].render('', options, fn);//string doesn't matter if it's in the cache.
    } else {
      read(path, options, function(err, str){
        if (err) return fn(err);
        exports[name].render(str, options, fn);
      });
    }
  };
}


/**
 * options:
 *  - paths: specifies search paths for @import directives
 *  - filename: is required for @import directives and useful for error reporting
 *  - compress: defaults to false, minifies the output if true.
 */
exports.less = fromStringRenderer('less');
exports.less.render = function (str, options, fn) {
    var engine = requires.less || (requires.less = require('less'));
    var parser = new(engine.Parser)(options || {});
    parser.parse(str, function (e, tree) {
        if (e) return fn(e);
        var res;
        try {
            res = tree.toCSS(options);
        } catch (ex) {
            return fn(ex);
        }
        fn(null, res);
    });
};

/**
 * options:
 *  - paths: specifies search paths for @import directives
 *  - filename: is required for @import directives and useful for error reporting
 *  - compress: defaults to false, minifies the output if true.
 */
exports.styl = exports.stylus = fromStringRenderer('stylus');
exports.stylus.render = function (str, options, fn) {
  var engine = require.stylus || (require.stylus = require('stylus'));
  engine.render(str, options || {}, fn);
};

exports.sass = fromStringRenderer('sass');
exports.sass.render = function (str, options, fn) {
  var engine = require.sass || (require.sass = require('sass'));
  var res;
  try {
    res = engine.render(str);
  } catch (ex) {
    return fn(ex);
  }
  fn(null, res);
};

exports.markdown = exports.md = fromStringRenderer('md');
exports.md.render = function (str, options, fn) {
  var engine = require.markdown;

  function load(name, engine) {
    try {
      var md = require(name);
    } catch (ex) {
      return undefined;
    }
    return function (str, options) {
      return engine.call(md, str, options);
    };
  }
  
  engine = engine || load('marked', function (str, options) {
    return this.parse(str, options || {});
  });
  engine = engine || load('discount', function (str, options) {
    return this.parse(str);
  });
  engine = engine || load('markdown-js', function (str, options) {
    return this.parse(str);
  });
  engine = engine || load('markdown', function (str, options) {
    return this.parse(str);
  });
  if (!engine) {
    throw new Error('Cannot find markdown library, install markdown, discount, or marked.');
  }

  var res;
  try {
    res = engine(str, options);
  } catch (ex) {
    return fn(ex);
  }
  fn(null, res);
};

var i = 0;
var names = ['foo', 'bar', 'bash', 'bosh', 'bish'];
exports.coffee = exports['coffee-script'] = exports.coffeescript = fromStringRenderer('coffee');
exports.coffee.render = function (str, options, fn) {
  options.filename = names[i++];
  var engine = require.coffeescript || (require.coffeescript = require('coffee-script'));
  var res;
  try {
    res = engine.compile(str, options);
  } catch (ex) {
    return fn(ex);
  }
  fn(null, res);
};