/*
 * Generator Tests
 *
 * Tests that the parser produces the expected abstract syntax tree for a
 * variety of programs.
 */

const fs = require('fs');
const assert = require('assert');
const parse = require('../../syntax/parser');
const capcon = require('capture-console');
require('../../backend/javascript-generator');

describe('The generator', () => {
  fs.readdirSync(__dirname).forEach((name) => {
    if (name.endsWith('.oil')) {
      it(`produces the correct output for ${name}`, (done) => {
        fs.readFile(`${__dirname}/${name}`, 'utf-8', (err, input) => {
          const program = parse(input);
          program.analyze();
          const intercept = require('intercept-stdout'); // eslint-disable-line
          let capturedText = '';
          const unhookIntercept = intercept((txt) => {
            capturedText += txt;
            eval(program.gen()); // eslint-disable-line
            console.log(capturedText);
            assert.deepEqual(capturedText, 'Eileen\n');
          });
          unhookIntercept();
          done(); // TODO: take out
          // const stdout = capcon.captureStdout(() => {
          //   eval(program.gen()); // eslint-disable-line
          // });
          // console.log(`OUPUT: ${stdout}`);
          // fs.readFile(`${__dirname}/${name}.json`, 'utf-8', (_err, expected) => {
          //   assert.deepEqual(ast, JSON.parse(expected));
          //   done();
          // });
        });
      });
    }
  });
});
