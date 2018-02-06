/*
 * Parser Tests (from https://github.com/rtoal/plainscript/blob/master/test/parser/parser-test.js)
 *
 * Tests that the parser produces the expected abstract syntax tree for a
 * variety of programs.
 */

const fs = require('fs');
const assert = require('assert');
const parse = require('../../syntax/parser');

describe('The parser', () => {
  fs.readdirSync(__dirname).forEach((name) => {
    if (name.startsWith('incorrect')) {
      it(`throws for incorrect syntax for ${name}`, (done) => {
        fs.readFile(`${__dirname}/${name}`, 'utf-8', (err, input) => {
          expect(() => { parse(input); }).toThrow();
          done();
          // fs.readFile(`${__dirname}/${name}.json`, 'utf-8', (_err, expected) => {
          //   assert.deepEqual(ast, JSON.parse(expected));
          //   done();
          // });
        });
      });
    } else if (name.endsWith('.oil')) {
      it(`produces the correct AST for ${name}`, (done) => {
        fs.readFile(`${__dirname}/${name}`, 'utf-8', (err, input) => {
          const ast = parse(input);
          assert.deepEqual(ast, { success: true });
          done();
          // fs.readFile(`${__dirname}/${name}.json`, 'utf-8', (_err, expected) => {
          //   assert.deepEqual(ast, JSON.parse(expected));
          //   done();
          // });
        });
      });
    }
  });
});
