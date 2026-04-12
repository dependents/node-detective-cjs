'use strict';

const assert = require('assert').strict;
const { suite } = require('uvu');
const detective = require('../index.js');

const ast = {
  type: 'Program',
  body: [{
    type: 'VariableDeclaration',
    declarations: [{
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name: 'a'
      },
      init: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'require'
        },
        arguments: [{
          type: 'Literal',
          value: './a',
          raw: './a'
        }]
      }
    }],
    kind: 'var'
  }]
};

const test = suite('detective-cjs');

test('returns the dependencies of a commonjs module', () => {
  const deps = detective('var a = require("./a");\n var b = require("./b");');
  assert.equal(deps.length, 2);
});

test('returns the dependencies of a main require cjs module', () => {
  const deps = detective('var a = require("./a");\n var b = require.main.require("./b");');

  assert.equal(deps[0], './a');
  assert.equal(deps[1], './b');
  assert.equal(deps.length, 2);
});

test('does exclude requires based on variable values', () => {
  const deps = detective('var a = require("./a");\n var b = "foo" + ".js";;\n var c = require(b);');

  assert.equal(deps[0], './a');
  assert.equal(deps.length, 1);
});

test('returns an empty list if there are no dependencies', () => {
  const deps = detective('1 + 1;');
  assert.equal(deps.length, 0);
});

test('accepts an AST', () => {
  const deps = detective(ast);
  assert.equal(deps.length, 1);
  assert.equal(deps[0], './a');
});

test('does not throw on jsx', () => {
  assert.doesNotThrow(() => {
    detective('var a = require("./foobar"); var templ = <jsx />');
  });
});

test('skipLazyLoaded only counts top-level requires', () => {
  const fnWithDynamicRequire = 'function foo() { const a = require("./a"); }';
  const deps1 = detective(fnWithDynamicRequire);
  assert.equal(deps1.length, 1);

  const deps2 = detective(fnWithDynamicRequire, { skipLazyLoaded: true });
  assert.equal(deps2.length, 0);
});

test('supports es6 syntax', () => {
  const deps = detective('const a = require("./a");\n let b = require("./b");');
  assert.equal(deps.length, 2);
});

test('supports template literals', () => {
  const deps = detective('const a = require("./a");\n let b = require("./b");\n var c = require(`./c`);');
  assert.equal(deps.length, 3);
});

test.run();
