
/*
 * Just the grammar parser while we are completing semantics
  * TODO: delete this file later and refactor test/grammar/grammar-test.js
 */

const fs = require('fs');
const ohm = require('ohm-js');
const withIndentsAndDedents = require('./preparser');

const grammar = ohm.grammar(fs.readFileSync('./syntax/olive.ohm'));

module.exports = (text) => {
  const match = grammar.match(withIndentsAndDedents(text));
  if (!match.succeeded()) {
    throw new Error(`Syntax Error: ${match.message}`);
  }
  // return semantics(match).ast(); // TODO: Renable once .ast() is written
  return { success: true }; // To get unit tests running for syntax only
};
