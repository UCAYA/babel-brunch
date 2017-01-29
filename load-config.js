const fs = require('fs');
const sysPath = require('path');
const JSON5 = require('json5');

const readJson = file => {
  try {
    const content = fs.readFileSync(file, {encoding: 'utf8'});
    return JSON.parse(content);
  } catch (_e) {
    console.error('babel6-brunch: Error loading JSON file "' + file + '"');
    throw _e;
  }
};

const readJson5 = file => {
  try {
    const content = fs.readFileSync(file, {encoding: 'utf8'});
    return JSON5.parse(content);
  } catch (_e) {
    console.error('babel6-brunch: Error loading JSON5 file "' + file + '"');
    throw _e;
  }
};

const getDefaultRc = root => {
  // `.babelrc` is JSON5
  const rc = readJson5(sysPath.resolve(root, '.babelrc'));
  if (rc) {
    return rc;
  }
  // `package.json` is standard JSON
  const pkg = readJson(sysPath.resolve(root, 'package.json'));
  if (pkg && pkg.babel) {
    return pkg.babel;
  }
  return {};
};

const getRcFile = (root, filename) => {
  if (!root) {
    return {};
  }
  if (filename === true || !filename) {
    return getDefaultRc(root);
  }
  return readJson(sysPath.resolve(root, filename)) || {};
};

module.exports = getRcFile;
