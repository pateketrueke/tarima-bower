var path = require('path');

var mainFiles = require('main-bower-files');

module.exports = function() {
  var copy = this.util.copy,
      read = this.util.read,
      write = this.util.write,
      mtime = this.util.mtime,
      exists = this.util.exists,
      timeDiff = this.util.timeDiff;

  var cwd = this.opts.cwd,
      dist = this.dist;

  var options = this.opts.pluginOptions.bower || {};

  var vendorDest = path.relative(cwd, path.join(this.opts.public, options.dest || 'vendor'));

  var files = {
    other: [],
    css: [],
    js: []
  };

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

  var bowerFile = path.relative(cwd, options.bowerFile || 'bower.json'),
      bowerDir = path.join(cwd, options.bowerDir || 'bower_components');

  var isForced = this.opts.force;

  var tmp = this.cache.get(bowerFile) || {};

  if (mtime(bowerFile) <= tmp.mtime) {
    return;
  }

  function ensureDist(target) {
    var isDirty;

    if (!isForced) {
      var entry = tmp[target.dest];

      var latest = exists(target.dest) ? mtime(target.dest) : 0;

      isDirty = !entry || (latest && latest < entry);

      if (Array.isArray(target.src)) {
        for (var key in target.src) {
          var src = target.src[key];

          if (mtime(src) > latest) {
            isDirty = true;
            break;
          }
        };
      }
    }

    if (isForced || isDirty) {
      dist(target);
      tmp[target.dest] = mtime(target.dest);
    }
  }

  function mirror(src, dest) {
    if (src.length) {
      src.forEach(function(file) {
        ensureDist({
          type: 'copy',
          src: path.relative(cwd, file),
          dest: path.join(dest, path.relative(bowerDir, file))
        });
      });
    }
  }

  function concat(src, dest) {
    if (src.length) {
      ensureDist({
        type: 'concat',
        src: src,
        dest: dest
      });
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

  this.cache.set(bowerFile, tmp);
};
