const Module = require('module');
const path = require('path');

const SRC_ROOT = path.resolve(__dirname, 'src');
const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  if (typeof request === 'string' && request.startsWith('src/')) {
    request = path.join(SRC_ROOT, request.slice(4));
  }
  return originalResolve.call(this, request, parent, isMain, options);
};
