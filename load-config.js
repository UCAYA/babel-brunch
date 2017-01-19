const fs = require('fs');
const sysPath = require('path');

const readJson = file => {
  try {
    const content = fs.readFileSync(file, {encoding: 'utf8'});
    return JSON.parse(content);
  } catch (_e) {
    console.error('babel6-brunch: Error loading JSON file "' + file + '"');
    throw _e;
  }
};

const getDefaultRc = root => {
  const rc = readJson(sysPath.resolve(root, '.babelrc'));
  if (rc) {
    return rc;
  }
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
