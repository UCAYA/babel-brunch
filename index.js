'use strict';

const babel = require('babel-core');
const anymatch = require('anymatch');
const loadRc = require('./load-config');

const reIg = /^(bower_components|node_modules\/[.-\w]-brunch|vendor)/;
const reJsx = /\.(es6|jsx|js)$/;



class BabelCompiler {
  constructor(config) {
    if (!config) config = {};
    const options = config.plugins &&
      (config.plugins.babel || config.plugins.ES6to5) || {};
    const opts = loadRc(config.paths && config.paths.root, options.configFile);
    Object.keys(options).forEach(key => {
      opts[key] = options[key];
    });
    delete opts.configFile;
    opts.sourceMaps = !!config.sourceMaps;
    if (!opts.presets) opts.presets = ['es2015'];
    if (opts.presets.indexOf('react') !== -1) this.pattern = reJsx;
    if (opts.presets.length === 0) delete opts.presets;
    if (opts.pattern) {
      this.pattern = opts.pattern;
      delete opts.pattern;
    }
    if (opts.only) {
      this.isOnly = anymatch(opts.only);
      this.isIgnored = (file) => !this.isOnly(file);
    } else {
      this.isIgnored = anymatch(opts.ignore || reIg);
    }
    delete opts.only;
    delete opts.ignore;
    this.options = opts;
  }

  compile(params) {
    if (this.isIgnored(params.path)) return Promise.resolve(params);
    this.options.filename = params.path;

    return new Promise((resolve, reject) => {
      let compiled;
      try {
        compiled = babel.transform(params.data, this.options);
      } catch (err) {
        return reject(err);
      }
      var result = {data: compiled.code || compiled};

      // Concatenation is broken by trailing comments in files, which occur
      // frequently when comment nodes are lost in the AST from babel.
      result.data += '\n';

      if (compiled.map) result.map = JSON.stringify(compiled.map);
      resolve(result);
    });
  }
}

BabelCompiler.prototype.brunchPlugin = true;
BabelCompiler.prototype.type = 'javascript';
BabelCompiler.prototype.extension = 'js';

module.exports = BabelCompiler;
