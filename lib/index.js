var path = require('path');

var mainFiles = require('main-bower-files');

module.exports = function() {
  var copy = this.util.copy,
      read = this.util.read,
      write = this.util.write,
      timeDiff = this.util.timeDiff;

  var cwd = this.opts.cwd,
      logger = this.logger;

  var isDebug = this.ready() || logger.isDebug();

  var options = this.opts.pluginOptions.bowerFiles || {};

  var vendorDest = path.join(this.opts.public, options.dest || 'vendor');

  var files = {
    other: [],
    css: [],
    js: []
  };

  var start = new Date();

  var vendor = mainFiles();

  vendor.forEach(function(file) {
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
    if (src.length) {
      src.forEach(function(file) {
        copy(file, path.join(dest, path.relative(bowerDir, file)));
      });
    }
  }

  function concat(src, dest) {
    if (src.length)  {
      write(dest, src.map(function(file) {
        return read(file);
      }).join('\n'));
    }
  }

  mirror(files.other, vendorDest);

  if (!options.bundle) {
    mirror(files.css, vendorDest);
    mirror(files.js, vendorDest);
  } else {
    concat(files.css, vendorDest + '.css');
    concat(files.js, vendorDest + '.js');
  }

  logger.printf('\r{info.blackBright|%s asset%s installed in %s}\n',
    vendor.length,
    vendor.length !== 1 ? 's' : '',
    timeDiff(start));
};
