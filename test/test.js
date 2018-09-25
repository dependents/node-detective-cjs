const assert = require('assert');
const detective = require('../');
const sinon = require('sinon');

describe('detective-cjs', function() {
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

  it('returns the dependencies of a commonjs module', function() {
    const deps = detective('var a = require("./a");\n var b = require("./b");');
    assert.equal(deps.length, 2);
  });

  it('returns the dependencies of a main require cjs module', function() {
    const deps = detective('var a = require("./a");\n var b = require.main.require("./b");');

    assert.equal(deps[0], './a');
    assert.equal(deps[1], './b');
    assert.equal(deps.length, 2);
  });

  it('returns an empty list if there are no dependencies', function() {
    const deps = detective('1 + 1;');
    assert.equal(deps.length, 0);
  });

  it('accepts an AST', function() {
    const deps = detective(ast);
    assert.equal(deps.length, 1);
    assert.equal(deps[0], './a');
  });

  it('does not throw on jsx', function() {
    assert.doesNotThrow(function() {
      detective('var a = require("./foobar"); var templ = <jsx />');
    });
  });

  describe('es6', function() {
    it('supports es6 syntax', function() {
      const deps = detective('const a = require("./a");\n let b = require("./b");');
      assert.equal(deps.length, 2);
    });

    it('supports template literals', function() {
      const deps = detective('const a = require("./a");\n let b = require("./b");\n var c = require(`./c`);');
      assert.equal(deps.length, 3);
    });
  });
});
