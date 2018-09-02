'use strict';

const Walker = require('node-source-walk');
const types = require('ast-module-types');

/**
 * @param  {String|Object} content - A file's string content or its AST
 * @return {String[]} The file's dependencies
 */
module.exports = function(content) {
  const walker = new Walker();

  const dependencies = [];

  walker.walk(content, function(node) {
    if (!types.isRequire(node) ||
        !node.arguments ||
        !node.arguments.length) {
      return;
    }

    if (node.arguments[0].type === 'Literal' || node.arguments[0].type === 'StringLiteral') {
      const dependency = node.arguments[0].value;
      dependencies.push(dependency);
    } else if (node.arguments[0].type === 'TemplateLiteral') {
      const dependency = node.arguments[0].quasis[0].value.raw;
      dependencies.push(dependency);
    }
  });

  return dependencies;
};
