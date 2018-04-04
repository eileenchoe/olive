const { InitialContext } = require('./analyzer');
const util = require('util');

const sameType = (a, b) => JSON.stringify(a) === JSON.stringify(b);
class Type {
  constructor(name) {
    this.name = name;
    Type.cache[name] = this;
  }
  mustBeInteger(message) {
    return this.mustBeCompatibleWith(Type.INT, message);
  }
  mustBeBoolean(message) {
    return this.mustBeCompatibleWith(Type.BOOL, message);
  }
  mustBeCompatibleWith(otherType, message) {
    if (!this.isCompatibleWith(otherType)) {
      throw message;
    }
  }
  mustBeMutuallyCompatibleWith(otherType, message) {
    if (!(this.isCompatibleWith(otherType) || otherType.isCompatibleWith(this))) {
      throw message;
    }
  }
  isCompatibleWith(otherType) {
    // In more sophisticated languages, comapatibility would be more complex
    return this === otherType;
  }
}

class ComplexType extends Type {
  constructor(name, type) {
    super(name);
    this.type = type;
  }
}

class DictionaryType extends Type {
  constructor(name, keyType, valueType) {
    super(name);
    this.keyType = keyType;
    this.valueType = valueType;
  }
}


Type.cache = {};
Type.BOOL = new Type('bool');
Type.INT = new Type('int');
Type.FLOAT = new Type('float');
Type.STRING = new Type('string');
Type.NONE = new Type('none');
Type.TUPLE = new Type('tuple');
Type.MATRIX = new Type('matrix');
Type.DICTIONARY = new Type('dictionary');
Type.SET = new Type('set');
Type.TEMPLATELITERAL = new Type('templateliteral');
Type.RANGE = new Type('range');

Type.forName = name => Type.cache[name];

class NoneLiteral {
  analyze() {
    this.type = Type.NONE;
  }
  optimize() {
    return this;
  }
}

class StringLiteral {
  constructor(value) {
    this.value = value;
    this.type = Type.STRING;
  }
  analyze() {
    return this;
  }
  optimize() {
    return this;
  }
}

class FloatLiteral {
  constructor(value) {
    this.value = value;
    this.type = Type.FLOAT;
  }
  analyze() {
    return this;
  }
  optimize() {
    return this;
  }
}

class BooleanLiteral {
  constructor(value) {
    this.value = value;
    this.type = Type.BOOL;
  }
  analyze() {
    return this;
  }
  optimize() {
    return this;
  }
}

class IntegerLiteral {
  constructor(value) {
    this.value = value;
    this.type = Type.INT;
  }
  analyze() {
    return this;
  }
  optimize() {
    return this;
  }
}

class VariableExpression {
  constructor(id) {
    this.id = id;
  }
  analyze(context) {
    this.referent = context.lookup(this.id);
    this.type = this.referent.type;
  }
  optimize() {
    return this;
  }
}


class Binding {
  // During syntax analysis (parsing), all we do is collect the variable names.
  // We will make the variable objects later, because we have to add them to a
  // semantic analysis context.

  // a, b = 1, 2
  constructor(names, isMutable, values) {
    Object.assign(this, { names, isMutable, values });
  }

  analyze(context) {
    if (this.names.length !== this.values.length) {
      throw new Error('Number of variables does not equal number of initializers');
    }

    // We don't want the declasetred variables to come into scope until after the
    // declaration line, so we will analyze all the initializing expressions
    // first.

    for (let i = 0; i < this.names.length; i += 1) {
      if (!this.isMutable) {
        if (this.names[i].id) {
          context.variableMustNotBeAlreadyDeclared(this.names[i].id);
        } else {
          context.variableMustNotBeAlreadyDeclared(this.names[i]);
        }
      }
      this.values[i].analyze(context);
      let variable;
      if (this.names[i].id) {
        variable = new VariableExpression(this.names[i].id);
      } else {
        variable = new VariableExpression(this.names[i]);
      }
      context.add(variable);
    }
    console.log(util.inspect(context.declarations));
  }

  optimize() {
    return this;
  }
}

class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right });
  }
  analyze(context) {
    this.left.analyze(context);
    this.right.analyze(context);
    if (['<', '<=', '>=', '>'].includes(this.op)) {
      this.mustHaveIntegerOperands();
      this.type = Type.BOOL;
    } else if (['==', '!='].includes(this.op)) {
      this.mustHaveCompatibleOperands();
      this.type = Type.BOOL;
    } else if (['and', 'or'].includes(this.op)) {
      this.mustHaveBooleanOperands();
      this.type = Type.BOOL;
    } else {
      // All other binary operators are arithmetic
      this.mustHaveIntegerOperands();
      this.type = Type.INT;
    }
  }
  optimize() {
    return this;
  }
}

class UnaryExpression {
  constructor(op, operand) {
    Object.assign(this, { op, operand });
  }

  analyze(context) {
    this.operand.analyze(context);
  }

  optimize() {
    return this;
  }
}

class ReturnStatement {
  constructor(returnValue) {
    this.returnValue = returnValue;
  }

  analyze(context) {
    if (this.returnValue) {
      this.returnValue.analyze(context);
    }
    context.assertInFunction('Return statement outside function');
  }

  optimize() {
    if (this.returnValue) {
      this.returnValue = this.returnValue.optimize();
    }
    return this;
  }
}

class ExpressionStatement {
  constructor(body) {
    this.body = body;
  }
  analyze(context) {
    this.body.analyze(context);
  }
  optimize() {
    return this;
  }
}

// (Annotation) ? Function-- functionDeclaration

// Function = id "(" Parameters ? ")" "=" Suite-- regularfuctions
//   | "(" Unnamed ")" "=" Exp-- anonymousfunctions

// Parameters = Named-- onlynamed
//   | Unnamed "," Named-- both
//     | Unnamed-- onlyunnamed

// Unnamed = id("," id ~ "=") * --unnamedparams
// Named = id "=" Exp("," id "=" Exp) * --namedparams


/* eslint-disable no-unused-vars */
// TODO: must reenable once analyze() is implemented for all classes

class FunctionAnnotation {
  constructor(id, parameterTypes, returnType) {
    this.id = id;
    this.parameterTypes = parameterTypes;
    this.returnType = returnType;
  }

  analyze(context) {
    return this;
  }

  optimize() {
    return this;
  }
}

class FunctionTypeAnnotation {
  constructor(id, parameterTypes, returnType) {
    this.id = id;
    this.parameterTypes = parameterTypes;
    this.returnType = returnType;
  }

  analyze(context) {
    return this;
  }

  optimize() {
    return this;
  }
}

class FunctionDeclarationStatement {
  constructor(annotation, id, parameters, body) {
    this.annotation = annotation;
    this.id = id;
    this.parameters = parameters;
    this.body = body;
  }

  analyze(context) {
    return this;
  }

  optimize() {
    return this;
  }
}

class FunctionCallExpression {
  constructor(id, args) {
    this.id = id;
    this.args = args;
  }

  analyze(context) {
    return this;
  }

  optimize() {
    return this;
  }
}


class WhileStatement {
  constructor(condition, body) {
    Object.assign(this, { condition, body });
  }
  analyze(context) {
    this.condition.analyze(context);
    this.condition.type.mustBeBoolean('Condition in "while" statement must be boolean');
    this.body.analyze(context);
  }
  optimize() {
    this.condition = this.condition.optimize();
    this.body = this.body.optimize();
    if (this.condition instanceof BooleanLiteral && this.condition.value === false) {
      return null;
    }
    return this;
  }
}

class ForStatement {
  constructor(left, right, body) {
    Object.assign(this, { left, right, body });
  }
  analyze(context) {
    return this;
  }
  optimize() {
    return this;
  }
}

class IfStatement {
  constructor(cases, alternate) {
    Object.assign(this, { cases, alternate });
  }

  analyze(context) {
    this.cases.forEach(c => c.analyze(context.createChildContextForBlock()));
    if (this.alternate) {
      this.alternate.forEach(s => s.analyze(context.createChildContextForBlock()));
    }
  }

  optimize() {
    this.cases.map(s => s.optimize()).filter(s => s !== null);
    this.alternate = this.alternate ? this.alternate.optimize() : null;
    return this;
  }
}

class Matrix {
  constructor(values) {
    this.type = Type.MATRIX;
    this.values = values;
  }
  analyze(context) {
    return this;
  }
}

class Tuple {
  constructor(values) {
    this.type = Type.TUPLE;
    this.values = values;
  }
  analyze(context) {
    return this;
  }
}

class Set {
  constructor(values) {
    this.type = Type.SET;
    this.values = values;
  }
  analyze(context) {
    this.values.forEach(value => value.analyze(context));
    const setType = this.values[0].type;
    this.values.forEach((value, index) => {
      if (!sameType(value.type, setType)) {
        throw new Error('Type mismatch among members of set');
      }
    });
    this.type = new ComplexType('set', setType);
  }
}

class Dictionary {
  constructor(values) {
    this.type = Type.DICTIONARY;
    this.values = values;
  }
  analyze(context) {
    return this;
  }
}

class Range {
  constructor(open, start, step, end, close) {
    this.type = Type.RANGE;
    this.start = start;
    this.step = step;
    this.end = end;
    this.inclusiveStart = open === '[';
    this.inclusiveEnd = close === ']';
  }
  analyze(context) {
    return this;
  }
}

class KeyValuePair {
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
  analyze(context) {
    return this;
  }
}

class StringInterpolation {
  constructor(values) {
    this.values = values;
  }
  analyze(context) {
    return this;
  }
}

class Interpolation {
  constructor(v) {
    this.value = v;
  }
  analyze(context) {
    return this;
  }
}

class Case {
  constructor(test, body) {
    Object.assign(this, { test, body });
  }

  analyze(context) {
    this.test.analyze(context);
    const bodyContext = context.createChildContextForBlock();
    this.body.forEach(s => s.analyze(bodyContext));
  }

  optimize() {
    this.test = this.test.optimize();
    // Suggested: if test is false, remove case. if true, remove following cases and the alt
    this.body.map(s => s.optimize()).filter(s => s !== null);
    // Suggested: Look for returns/breaks in the middle of the body
    return this;
  }
}

class Block {
  constructor(statements) {
    this.statements = statements;
  }
  analyze(context) {
    const localContext = context.createChildContextForBlock();
    this.statements.forEach(s => s.analyze(localContext));
  }
  optimize() {
    this.statements = this.statements.map(s => s.optimize()).filter(s => s !== null);
    return this;
  }
}

class Program {
  constructor(block) {
    this.block = block;
  }
  analyze() {
    this.block.analyze(InitialContext);
  }
  optimize() {
    this.block = this.block.optimize();
    return this;
  }
}

// function isZero(entity) {
//   return entity instanceof IntegerLiteral && entity.value === 0;
// }
//
// function isOne(entity) {
//   return entity instanceof IntegerLiteral && entity.value === 1;
// }
//
// function sameVariable(e1, e2) {
//   return e1 instanceof VariableExpression &&
//          e2 instanceof VariableExpression &&
//          e1.referent === e2.referent;
// }


module.exports = {
  Type,
  BooleanLiteral,
  IntegerLiteral,
  StringLiteral,
  FloatLiteral,
  NoneLiteral,
  VariableExpression,
  BinaryExpression,
  UnaryExpression,
  Binding,
  ReturnStatement,
  WhileStatement,
  ForStatement,
  ExpressionStatement,
  Case,
  IfStatement,
  Tuple,
  Matrix,
  Dictionary,
  Range,
  Set,
  KeyValuePair,
  Block,
  Program,
  StringInterpolation,
  Interpolation,
  FunctionCallExpression,
  FunctionDeclarationStatement,
  FunctionTypeAnnotation,
  ComplexType,
  DictionaryType,
};
