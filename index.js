import {
  isRequire,
  isPlainRequire,
  isTopLevelRequire,
  isMainScopedRequire
} from 'ast-module-types';
import Walker from 'node-source-walk';

/**
 * @param  {String|Object} content - A file's string content or its AST
 * @return {String[]} The file's dependencies
 */
export default function detective(content, options = {}) {
  if (content === undefined) throw new Error('content not given');
  if (content === '' || content === undefined) return [];

  const walker = new Walker();
  const dependencies = [];

  walker.walk(content, node => {
    if (!isRequire(node) || !node.arguments || node.arguments.length === 0) {
      return;
    }

    if (isPlainRequire(node)) {
      if (!options.skipLazyLoaded || isTopLevelRequire(node)) {
        const result = extractDependencyFromRequire(node);
        if (result) {
          dependencies.push(result);
        }
      }
    } else if (isMainScopedRequire(node)) {
      dependencies.push(extractDependencyFromMainRequire(node));
    }
  });

  return dependencies;
}

function extractDependencyFromRequire(node) {
  const arg = node.arguments[0];
  if (arg.type === 'Literal' || arg.type === 'StringLiteral') return arg.value;
  if (arg.type === 'TemplateLiteral') return arg.quasis[0].value.raw;
}

function extractDependencyFromMainRequire(node) {
  return node.arguments[0].value;
}
