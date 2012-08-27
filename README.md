[![Build Status](https://secure.travis-ci.org/ForbesLindesay/consolidate-build.png?branch=master)](http://travis-ci.org/ForbesLindesay/consolidate-build)
consolidate-build
=================

Does for languages that can be 'built' what consolidate.js does for templates

## Installation

    $ npm install consolidate-build

## Supported languages

All template engines supported by [consolidate](https://github.com/visionmedia/consolidate.js) work in consolidate-build.

In addition to those, consolidate build adds:

 - [coffee-script](https://github.com/jashkenas/coffee-script) [(website)](http://coffeescript.org/)
 - [less](https://github.com/cloudhead/less.js) [(website)](http://lesscss.org)
 - markdown - will use [marked](https://github.com/chjj/marked), [discount](https://github.com/visionmedia/node-discount), [markdown-js](https://github.com/Gozala/markdown-js) or [markdown](https://github.com/evilstreak/markdown-js) depending on which one is installed (in that order of precedence if multiple markdown parsers are installed).
 - [sass](https://github.com/visionmedia/sass.js) [(website)](http://sass-lang.com/)
 - [stylus](https://github.com/learnboost/stylus) [(website)](http://learnboost.github.com/stylus/)

__NOTE__: you must still install the engines you wish to use, add them to your package.json dependencies.

## API

All templates supported by this library may be rendered using the signature `(path[, locals], callback)` or `.render(str[, locals], callback)` as shown below.

__NOTE__: All this example code uses build.less for the less stylsheet language. Replace less with whatever language you are using. For exmaple, use build.stylus for stylus, build.markdown or build.md for markdown, etc. `console.log(build)` for the full list of identifiers.

```js
var build = require('consolidate-build');
build.less('styles/style.less', { compress: true }, function(err, css){
  if (err) throw err;
  console.log(css);
});
```

Or without options / local variables:

```js
var build = require('consolidate-build');
build.less('styles/style.less', function(err, css){
  if (err) throw err;
  console.log(css);
});
```

To dynamically pass the engine, simply use the subscript operator and a variable:

```js
var build = require('consolidate-build')
  , name = 'less';

build[name]('styles/style.css', function(err, css){
  if (err) throw err;
  console.log(css);
});
```

### Without a file

All the languages support being built without a file being present.  To do this ismply use the render method.

```js
build.less.render('.class { width: 1 + 1 }', { compress: true}, function(err, css){
  if (err) throw err;
  console.log(css);
});
```