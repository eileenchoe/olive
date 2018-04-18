/*
 * Parser Tests
 *
 * Tests that the parser produces the expected abstract syntax tree for a
 * variety of programs.
 */

const fs = require('fs');
const assert = require('assert');
const parse = require('../../syntax/parser');

describe('The parser', () => {
  fs.readdirSync(__dirname).forEach((name) => {
    const length = name.length - 1;
    if (name.endsWith('.error', length) || name.endsWith('.error')) {
      it(`detects a ${name.replace(/[^a-z]/g, ' ')}`, (done) => {
        const program = parse(fs.readFileSync(`${__dirname}/${name}`, 'utf-8'));
        const errorPattern = RegExp(name.replace(/.error\d*/, '').replace(/-/g, ' '), 'i');
        assert.throws(() => program.analyze(), errorPattern);
        done();
      });
    } else if (name.endsWith('.oil')) {
      it(`produces the correct decorated AST for ${name}`, (done) => {
        fs.readFile(`${__dirname}/${name}`, 'utf-8', (err, input) => {
          const ast = parse(input);
          ast.analyze();
          fs.readFile(`${__dirname}/${name}.json`, 'utf-8', (_err, expected) => {
            assert.deepEqual(ast, JSON.parse(expected));
            done();
          });
        });
      });
    }
  });
});
