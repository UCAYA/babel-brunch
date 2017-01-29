'use strict';

const babel = require('babel-core');
const anymatch = require('anymatch');
const loadRc = require('./load-config');
const resolve = require('path').resolve;
const logger = require('loggy');

const reIg = /^(bower_components|vendor)/;

const warns = {
  ES6to5: 'Please use `babel` instead of `ES6to5` option in your config file.'
};

const prettySyntaxError = (err) => {
  if (err._babel && err instanceof SyntaxError) {
    return new Error(`${err.name}: ${err.message}\n${err.codeFrame}`);
  } else {
    return err;
  }
};

class BabelCompiler {
  constructor(config) {
    if (!config) config = {};
    const options = config.plugins &&
      (config.plugins.babel || config.plugins.ES6to5) || {};
    if (options && !config.plugins.babel && config.plugins.ES6to5) {
      logger.warn(warns.ES6to5);
    }
    const opts = loadRc(config.paths && config.paths.root, options.configFile);
    Object.keys(options).forEach(key => {
      opts[key] = options[key];
    });
    delete opts.configFile;
    opts.sourceMaps = !!config.sourceMaps;
    if (!opts.presets) {
      opts.presets = [['env', opts.env]];
    }
    if (!opts.plugins) opts.plugins = [];
    // this is needed so that babel can locate presets when compiling node_modules
    const mapOption = type => data => {
      const resolvePath = name => {
        // for cases when plugins name do not match common convention
        // for example: `babel-root-import`
        const plugin = name.startsWith('babel-') ? name : `babel-${type}-${name}`;
        return resolve(config.paths.root, 'node_modules', plugin);
      };
      if (typeof data === 'string') return resolvePath(data);
      return [resolvePath(data[0]), data[1]];
    };
    const mappedPresets = opts.presets.map(mapOption('preset'));
    const mappedPlugins = opts.plugins.map(mapOption('plugin'));
    opts.presets = mappedPresets;
    opts.plugins = mappedPlugins;
    if (opts.presets.length === 0) delete opts.presets;
    if (opts.plugins.length === 0) delete opts.plugins;
    if (opts.pattern) {
      this.pattern = opts.pattern;
      delete opts.pattern;
    }
    this.isIgnored = anymatch(opts.ignore || reIg);
    delete opts.only;
    delete opts.ignore;
    this.options = opts;
  }

  compile(file) {
    if (this.isIgnored(file.path)) return Promise.resolve(file);
    this.options.filename = file.path;
    this.options.sourceFileName = file.path;

    return new Promise((resolve, reject) => {
      let compiled;

      try {
        compiled = babel.transform(file.data, this.options);
      } catch (error) {
        reject(prettySyntaxError(error));
        return;
      }

      const result = {data: compiled.code || compiled};

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
BabelCompiler.prototype.pattern = /\.(es6|jsx?)$/;

module.exports = BabelCompiler;
