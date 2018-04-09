
/*
 * Parser module
 *
 *   const parse = require('./parser');
 *
 *   parse(text)
 *       Returns the abstract syntax tree for the given program text. This
 *       function will first pre-parse (figure out indents and dedents),
 *       then match against an Ohm grammar, then apply AST generation
 *       rules. If there are any errors, this function will throw an error.
 */

const {
  Program,
  Block,
  ReturnStatement,
  WhileStatement,
  ForStatement,
  IfStatement,
  ExpressionStatement,
  Type,
  NumberLiteral,
  BooleanLiteral,
  StringLiteral,
  NoneLiteral,
  MutableBinding,
  ImmutableBinding,
  IdExpression,
  SubscriptExpression,
  BinaryExpression,
  UnaryExpression,
  Case,
  MatrixExpression,
  TupleExpression,
  SetExpression,
  DictionaryExpression,
  KeyValuePair,
  StringInterpolation,
  Interpolation,
  RangeExpression,
  FunctionCallExpression,
  FunctionDeclarationStatement,
  FunctionTypeAnnotation,
  MatrixType,
  TupleType,
  SetType,
  DictionaryType,
} = require('../ast');

const fs = require('fs');
const ohm = require('ohm-js');
const withIndentsAndDedents = require('./preparser');
const util = require('util');

const grammar = ohm.grammar(fs.readFileSync('./syntax/olive.ohm'));

// Ohm turns `x?` into either [x] or [], which we should clean up for our AST.
function unpack(a) {
  return a.length === 0 ? null : a[0];
}

/* eslint-disable no-unused-vars */
const semantics = grammar.createSemantics().addOperation('ast', {
  Program(b) { return new Program(b.ast()); },
  Block(s) { return new Block(s.ast()); },
  boollit(_) { return new BooleanLiteral(this.sourceString === 'true'); },
  numlit(_1, _2, _3) { return new NumberLiteral(this.sourceString); },
  stringlit(_1, chars, _3) { return new StringLiteral(this.sourceString); },
  nonelit(_) { return new NoneLiteral(); },
  Statement_mutable(s, _, t) { return new MutableBinding(s.ast(), t.ast()); },
  Statement_immutable(s, _, t) { return new ImmutableBinding(s.ast(), t.ast()); },
  Statement_return(_, e) { return new ReturnStatement(unpack(e.ast())); },
  FunctionDecl(ann, id, _1, params, _2, body) {
    return new FunctionDeclarationStatement(ann.ast(), id.ast(), params.ast(), body.ast());
  },
  TypeAnn(id, _1, param, _2, ret) {
    return new FunctionTypeAnnotation(id.ast(), param.ast(), ret.ast());
  },
  Annotation_matrix(_1, t, _2) {
    return new MatrixType(t.ast());
  },
  Annotation_dictionary(_1, key, _2, value, _3) {
    return new DictionaryType(key.ast(), value.ast());
  },
  Annotation_tuple(_1, t, _2) {
    return new TupleType(t.ast());
  },
  Annotation_set(_1, t, _2) {
    return new SetType(t.ast());
  },
  Annotation_simple(t) {
    return new Type(this.sourceString);
  },
  Annotation_function(_1, paramType, _2, retType, _3) {
    return new FunctionTypeAnnotation(null, paramType.ast(), retType.ast());
  },
  FunctionCall(id, _1, args, _2) {
    return new FunctionCallExpression(id.ast(), args.ast());
  },
  Statement_while(_, test, suite) { return new WhileStatement(test.ast(), suite.ast()); },
  Statement_for(_1, id, _2, exp, suite) {
    const idExp = new IdExpression(id.ast());
    return new ForStatement(idExp, exp.ast(), suite.ast());
  },
  Statement_if(_1, firstTest, firstSuite, _2, moreTests, moreSuites, _3, lastSuite) {
    const tests = [firstTest.ast(), ...moreTests.ast()];
    const bodies = [firstSuite.ast(), ...moreSuites.ast()];
    const cases = tests.map((test, index) => new Case(test, bodies[index]));
    console.log(util.inspect(cases));
    return new IfStatement(cases, unpack(lastSuite.ast()));
  },
  Statement_expression(body) {
    return new ExpressionStatement(body.ast());
  },
  Suite(_1, block, _2) { return block.ast(); },
  Exp_or(left, op, right) { return new BinaryExpression(op.ast(), left.ast(), right.ast()); },
  Exp_and(left, op, right) { return new BinaryExpression(op.ast(), left.ast(), right.ast()); },
  Exp1_binary(left, op, right) { return new BinaryExpression(op.ast(), left.ast(), right.ast()); },
  Exp2_binary(left, op, right) { return new BinaryExpression(op.ast(), left.ast(), right.ast()); },
  Exp3_binary(left, op, right) { return new BinaryExpression(op.ast(), left.ast(), right.ast()); },
  Exp4_binary(left, op, right) { return new BinaryExpression(op.ast(), left.ast(), right.ast()); },
  Exp5_unary(op, operand) { return new UnaryExpression(op.ast(), operand.ast()); },
  Exp6_parens(_1, expression, _2) { return expression.ast(); },
  Tuple(_1, v, _2) { return new TupleExpression([...v.ast()]); },
  Matrix(_1, v, _2) { return new MatrixExpression([...v.ast()]); },
  Set(_1, v, _2) { return new SetExpression([...v.ast()]); },
  Range(open, start, _1, step, _2, end, close) {
    const openParen = open.primitiveValue;
    const closingParen = close.primitiveValue;
    return new RangeExpression(openParen, start.ast(), step.ast(), end.ast(), closingParen);
  },
  Dictionary(_1, v, _2) { return new DictionaryExpression([...v.ast()]); },
  KeyValuePair(k, _, v) { return new KeyValuePair(k.ast(), v.ast()); },
  StringInterpolation(_1, values, _2) { return new StringInterpolation([...values.ast()]); },
  Interpolation(_1, value, _2) { return new Interpolation(value.ast()); },
  VarExp_subscript(id, _1, s, _2) { return new SubscriptExpression(id.ast(), s.ast()); },
  VarExp_id(id) { return new IdExpression(id.ast()); },
  NonemptyListOf(first, _, rest) { return [first.ast(), ...rest.ast()]; },
  ListOf(args) { return [...args.ast()]; },
  EmptyListOf() { return []; },
  id(_1, _2) { return this.sourceString; },
  _terminal() { return this.sourceString; },
});
/* eslint-enable no-unused-vars */

module.exports = (text) => {
  const match = grammar.match(withIndentsAndDedents(text));
  if (!match.succeeded()) {
    throw new Error(`Syntax Error: ${match.message}`);
  }
  return semantics(match).ast();
};
