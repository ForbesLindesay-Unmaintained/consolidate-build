var cons = require('../../')
  , fs = require('fs')
  , readFile = fs.readFile
  , readFileSync = fs.readFileSync
  , normalize = require('path').normalize;

exports.test = function(name, outputExtension, options) {
  var expected = fs.readFileSync('test/fixtures/' + name + '/output.' + outputExtension).toString().replace(/\r\n/g, '\n');
  describe(name, function(){
    afterEach(function(){
      fs.readFile = readFile;
      fs.readFileSync = readFileSync;
    });

    it('should support options', function(done){
      var path = 'test/fixtures/' + name + '/input.' + name;
      cons[name](path, options, function(err, html){
        if (err) return done(err);
        html.should.equal(expected);
        done();
      });
    });

    it('should not cache by default', function(done){
      var path = 'test/fixtures/' + name + '/input.' + name;
      var calls = 0;

      fs.readFileSync = function(p){
        if (normalize(p) === normalize(path)) ++calls;
        return readFileSync.apply(this, arguments);
      };

      fs.readFile = function(p){
        if (normalize(p) === normalize(path)) ++calls;
        readFile.apply(this, arguments);
      };

      cons[name](path, options, function(err, html){
        if (err) return done(err);
        html.should.equal(expected);
        cons[name](path, options, function(err, html){
          if (err) return done(err);
          html.should.equal(expected);
          calls.should.equal(2);
          done();
        });
      });
    });

    it('should support caching', function(done){
      var path = 'test/fixtures/' + name + '/input.' + name;
      options.cache = true;
      cons[name](path, options, function(err, html){
        if (err) return done(err);

        fs.readFileSync = function(p){
          if (normalize(p) === normalize(path)) done(new Error('fs.readFile() called with ' + path));
          else return readFileSync.apply(this, arguments);
        };

        fs.readFile = function(p){
          if (normalize(p) === normalize(path)) done(new Error('fs.readFile() called with ' + path));
          else readFile.apply(this, arguments);
        };
        html.should.equal(expected);
        cons[name](path, options, function(err, html){
          if (err) return done(err);
          html.should.equal(expected);
          done();
        });
      });
    });

    it('should support rendering a string', function(done){
      var str = fs.readFileSync('test/fixtures/' + name + '/input.' + name).toString().replace(/\r\n/g, '\n');
      cons[name].render(str, options, function(err, html){
        if (err) return done(err);
        if (html !== expected) longCompare(html, expected);
        html.should.equal(expected);
        done();
      });
    });
  });
};

function longCompare(actual, expected) {
  function format(str) {
    if (typeof str === 'string') {
      return JSON.stringify(str).replace(/^\"/g, '\'').replace(/\"$/g, '\'');
    } else {
      return str;
    }
  }
  console.log('Long Compare');
  console.log('============');
  console.log('');
  console.log('actual = expected');
  for (var i = 0; i < actual.length || i < expected.length; i++) {
    if (actual.charAt(i) !== expected.charAt(i)) {
      console.log(format(actual.charAt(i)) + '!=' + format(expected.charAt(i)));
    } else {
      console.log(format(actual.charAt(i)) + '=' + format(expected.charAt(i)));
    }
  };
}