/*
 * Grammar Tests
 *
 * Tests that the we've constructed our grammar correctly, by checking that
 * programs that we expect to be matched by the grammar are matched, and
 * those that we expect not to cause an error to be thrown.
 */

const fs = require('fs');
const assert = require('assert');
const parse = require('../../syntax/parser');

describe('The parser', () => {
  fs.readdirSync(__dirname).forEach((name) => {
    if (name.startsWith('incorrect')) {
      it(`throws for incorrect syntax for ${name}`, (done) => {
        fs.readFile(`${__dirname}/${name}`, 'utf-8', (err, input) => {
          assert.throws(() => parse(input), /Syntax Error/);
          done();
        });
      });
    } else if (name.endsWith('.oil')) {
      it(`produces the correct syntax for ${name}`, (done) => {
        fs.readFile(`${__dirname}/${name}`, 'utf-8', (err, input) => {
          assert.ok(parse(input));
          done();
        });
      });
    }
  });
});
