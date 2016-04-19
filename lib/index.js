var path = require('path');

var mainFiles = require('main-bower-files');

module.exports = function() {
  var copy = this.util.copy,
      read = this.util.read,
      write = this.util.write;

  var options = this.opts.pluginOptions.bowerFiles || {};

  var vendorDest = path.join(this.opts.public, options.dest || 'vendor');

  var files = {
    other: [],
    css: [],
    js: []
  };

  mainFiles().forEach(function(file) {
    if (file.indexOf('.css') > -1) {
      files.css.push(file);
    } else if (file.indexOf('.js') > -1) {
      files.js.push(file);
    } else {
      files.other.push(file);
    }
  });

  var bowerDir = options.bowerDir || path.join(this.opts.cwd, 'bower_components');

  function mirror(src, dest) {
    src.forEach(function(file) {
      copy(file, path.join(dest, path.relative(bowerDir, file)));
    });
  }

  function concat(src, dest) {
    write(dest, src.map(function(file) {
      return read(file);
    }).join('\n'));
  }

  // TODO: logs...

  if (options.bundle) {
    concat(files.css, vendorDest + '.css');
    concat(files.js, vendorDest + '.js');
  } else {
    mirror(files.css, vendorDest);
    mirror(files.js, vendorDest);
  }

  mirror(files.other, vendorDest);
};
