var path = require('path');

var mainFiles = require('main-bower-files');

module.exports = function() {
  var read = this.util.read,
      write = this.util.write;

  var code = mainFiles().map(function(file) {
    return read(file);
  }).join('\n;');

  var options = this.opts.pluginOptions.bowerFiles || {};

  // TODO: try other strategies?
  write(path.join(this.opts.public, options.dest || 'vendor') + '.js', code);
};
