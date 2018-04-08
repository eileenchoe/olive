const { InitialContext } = require('./analyzer');
const util = require('util');

const sameType = (a, b) => JSON.stringify(a) === JSON.stringify(b);

class Type {
  constructor(name) {
    this.name = name;
    Type.cache[name] = this;
  }
  mustBeNumber(message) {
    return this.mustBeCompatibleWith(Type.NUM, message);
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
    return sameType(this, otherType);
  }
}

class MatrixType extends Type {
  constructor(type) {
    super('matrix');
    this.elementType = type;
    this.isIterable = true;
  }
}

class TupleType extends Type {
  constructor(type) {
    super('tuple');
    this.elementType = type;
    this.isIterable = true;
  }
}

class SetType extends Type {
  constructor(name, type) {
    super('set');
    this.elementType = type;
    this.isIterable = true;
  }
}

class DictionaryType extends Type {
  constructor(keyType, valueType) {
    super('dictionary');
    this.keyType = keyType;
    this.valueType = valueType;
    this.isIterable = true;
  }
}


Type.cache = {};
Type.BOOL = new Type('bool');
Type.NUM = new Type('number');
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
    this.isIterable = true;
    this.type = Type.STRING;
  }
  analyze() {
    return this;
  }
  optimize() {
    return this;
  }
}

class NumberLiteral {
  constructor(value) {
    this.value = value;
    this.type = Type.NUM;
  }
  analyze(context) {
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

// class VariableExpression {
//   constructor(id) {
//     this.id = id;
//   }
//   analyze(context) {
//     this.referent = context.lookup(this.id);
//     this.type = this.referent.type;
//   }
//   optimize() {
//     return this;
//   }
// }


class IdExpression {
  constructor(id) {
    Object.assign(this, { id }); // id is ALWAYS a string
  }
  analyze(context, inBinding) {
    const referent = context.lookup(this.id);
    if (inBinding) {
      if (referent) {
        this.referent = referent;
        this.type = this.referent.type;
      }
      return;
    }
    if (!referent) {
      throw new Error(`Variable with id ${this.id} not declared`);
    }
    this.referent = referent;
    this.type = this.referent.type;
  }
  optimize() {
    return this;
  }
}

class SubscriptExpression {
  constructor(array, subscript) {
    Object.assign(this, { array, subscript });
    this.level = 1;
  }

  analyze(context) {
    this.array.analyze(context);
    this.test = this.subscript;
    if (this.array instanceof IdExpression) {
      const lookedUpValue = context.lookup(this.array.id);
      if (lookedUpValue === null) {
        throw new Error(`${this.array.id} has not been defined yet.`);
      }
      this.type = lookedUpValue.type;
    } else {
      this.level += 1;
    }
    this.subscript.analyze(context);
  }

  optimize() {
    return this;
  }
}

const lastSubscriptType = (exp) => {
  let expression = exp;
  while (expression.array instanceof SubscriptExpression) {
    expression = expression.array;
  }
  return expression.type;
};

class Variable {
  constructor(id, type) {
    Object.assign(this, { id, type });
  }
  analyze() {
    return this;
  }
  optimize() {
    return this;
  }
}

const assertSameType = (value, test) => {
  if (!sameType(value, test)) {
    throw new Error('Type mismatch error');
  }
};

const matchTypeDepth = (target, sourceType) => {
  let targetType = lastSubscriptType(target);
  let depthOfSubscripts = target.level;

  while (depthOfSubscripts > 0) {
    targetType = targetType.elementType;
    depthOfSubscripts -= 1;
  }
  assertSameType(targetType, sourceType);
};

class MutableBinding {
  constructor(target, source) {
    Object.assign(this, { target, source }); // target is either a IdExp or SubscriptExp
  }
  analyze(context) {
    if (this.target.length !== this.source.length) {
      throw new Error('Number of variables does not equal number of initializers');
    }
    this.source.forEach(s => s.analyze(context));
    this.target.forEach(t => t.analyze(context, true));

    this.source.forEach((s, i) => {
      // TODO: we only have this hardcoded, expecting just a IdExpression
      // TODO: what happens if its a subscript expression coming in?! => need to have different case
      if (this.target[i] instanceof IdExpression) {
        // this.target[i].analyze(context, true);
        const lookedUpValue = context.lookup(this.target[i].id);
        if (lookedUpValue === null) {
          const v = new Variable(this.target[i].id, s.type);
          context.add(v);
        } else {
          assertSameType(lookedUpValue.type, s.type);
        }
      } else if (this.target[i] instanceof SubscriptExpression) {
        matchTypeDepth(this.target[i], s.type);
      }
    });
  }
  optimize() {
    return this;
  }
}

class ImmutableBinding {
  constructor(target, source) {
    Object.assign(this, { target, source }); // target is a string
  }
  analyze(context) {
    if (this.target.length !== this.source.length) {
      throw new Error('Number of variables does not equal number of initializers');
    }
    this.source.forEach(s => s.analyze(context));
    this.source.forEach((s, i) => {
      context.variableMustNotBeAlreadyDeclared(this.target[i]);
      const v = new Variable(this.target[i], s.type);
      context.add(v);
    });
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
      this.mustHaveNumericOperands();
      this.type = Type.BOOL;
    } else if (['==', '!='].includes(this.op)) {
      this.mustHaveCompatibleOperands();
      this.type = Type.BOOL;
    } else if (['and', 'or'].includes(this.op)) {
      this.mustHaveBooleanOperands();
      this.type = Type.BOOL;
    } else {
      // All other binary operators are arithmetic
      this.mustHaveNumericOperands();
      this.type = Type.NUM;
    }
  }
  optimize() {
    return this;
  }

  mustHaveNumericOperands() {
    const errorMessage = `${this.op} must have numeric operands`;
    this.left.type.mustBeCompatibleWith(Type.NUM, errorMessage, this.op);
    this.right.type.mustBeCompatibleWith(Type.NUM, errorMessage, this.op);
  }
  mustHaveBooleanOperands() {
    const errorMessage = `${this.op} must have boolean operands`;
    this.left.type.mustBeCompatibleWith(Type.BOOL, errorMessage, this.op);
    this.right.type.mustBeCompatibleWith(Type.BOOL, errorMessage, this.op);
  }
  mustHaveCompatibleOperands() {
    const errorMessage = `${this.op} must have mutually compatible operands`;
    this.left.type.mustBeMutuallyCompatibleWith(this.right.type, errorMessage, this.op);
  }
  foldIntegerConstants() {
    switch (this.op) {
      case '+': return new NumberLiteral(+this.left + this.right);
      case '-': return new NumberLiteral(+this.left - this.right);
      case '*': return new NumberLiteral(+this.left * this.right);
      case '/': return new NumberLiteral(+this.left / this.right);
      case '<': return new BooleanLiteral(+this.left < this.right);
      case '<=': return new BooleanLiteral(+this.left <= this.right);
      case '==': return new BooleanLiteral(+this.left === this.right);
      case '!=': return new BooleanLiteral(+this.left !== this.right);
      case '>=': return new BooleanLiteral(+this.left >= this.right);
      case '>': return new BooleanLiteral(+this.left > this.right);
      default: return this;
    }
  }
  foldBooleanConstants() {
    switch (this.op) {
      case '==': return new BooleanLiteral(this.left === this.right);
      case '!=': return new BooleanLiteral(this.left !== this.right);
      case 'and': return new BooleanLiteral(this.left && this.right);
      case 'or': return new BooleanLiteral(this.left || this.right);
      default: return this;
    }
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

/* eslint-disable no-unused-vars */

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
    this.body.analyze(context, false);
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

const determineIteratorType = (exp) => {
  let expression = exp;
  if (exp instanceof IdExpression) {
    expression = exp.referent;
  }
  if (!expression.type.isIterable) {
    throw new Error(`Type ${expression.type.name} is not iterable.`);
  };
  if (expression instanceof StringLiteral) {
    return Type.STRING;
  } else if (expression instanceof DictionaryExpression) {
    return expression.type.keyType;
  } else {
    return expression.type.elementType;
  }
}

class Block {
  constructor(statements) {
    this.statements = statements;
  }

  analyze(context, manualContext) {
    // flag for whether or not we need to manually implement a context
    // manual context should be true for both function and for
    if (!manualContext) {
      const localContext = context.createChildContextForBlock();
      this.statements.forEach(s => s.analyze(localContext));
      return;
    }
    this.statements.forEach(s => s.analyze(context));
  }

  optimize() {
    this.statements = this.statements.map(s => s.optimize()).filter(s => s !== null);
    return this;
  }
}

class ForStatement {
  constructor(id, exp, body) {
    Object.assign(this, { id, exp, body });
  }
  analyze(context) {
    this.exp.analyze(context);
    const childContext = context.createChildContextForBlock();
    const iterator = new Variable(this.id.id, determineIteratorType(this.exp));
    childContext.add(iterator);
    this.body.analyze(childContext, true);
    console.log(JSON.stringify(childContext.declarations), '\n');
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
      this.alternate.analyze(context.createChildContextForBlock());
    }
  }

  optimize() {
    this.cases.map(s => s.optimize()).filter(s => s !== null);
    this.alternate = this.alternate ? this.alternate.optimize() : null;
    return this;
  }
}

class MatrixExpression {
  constructor(values) {
    this.type = Type.MATRIX;
    this.values = values;
  }
  analyze(context) {
    this.values.forEach(value => value.analyze(context));
    const memberType = this.values[0].type;
    this.values.forEach((value, index) => {
      if (!sameType(value.type, memberType)) {
        throw new Error('Type mismatch among members of matrix');
      }
    });
    this.type = new MatrixType(memberType);
  }
}

class TupleExpression {
  constructor(values) {
    this.type = Type.TUPLE;
    this.values = values;
  }
  analyze(context) {
    const memberTypes = [];
    this.values.forEach((value) => {
      value.analyze(context);
      memberTypes.push(value.type);
    });
    this.type = new TupleType(memberTypes);
  }
}

class SetExpression {
  constructor(values) {
    this.type = Type.SET;
    this.values = values;
  }
  analyze(context) {
    this.values.forEach(value => value.analyze(context));
    const memberType = this.values[0].type;
    this.values.forEach((value) => {
      if (!sameType(value.type, memberType)) {
        throw new Error('Type mismatch among members of set');
      }
    });
    this.type = new SetType(memberType);
  }
}

class DictionaryExpression {
  constructor(values) {
    this.type = Type.DICTIONARY;
    this.values = values;
  }
  analyze(context) {
    this.values.forEach(value => value.analyze(context));
    const memberKeyType = this.values[0].key.type;
    const memberValueType = this.values[0].value.type;
    this.values.forEach((value) => {
      if (!sameType(value.key.type, memberKeyType)
      || !sameType(value.value.type, memberValueType)) {
        throw new Error('Type mismatch among members of dictionary');
      }
    });
    this.type = new DictionaryType(memberKeyType, memberValueType);
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
    this.test.type.mustBeBoolean('If statement tests must be boolean');
    this.body.analyze(context, false);
  }

  optimize() {
    this.test = this.test.optimize();
    // Suggested: if test is false, remove case. if true, remove following cases and the alt
    this.body.map(s => s.optimize()).filter(s => s !== null);
    // Suggested: Look for returns/breaks in the middle of the body
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
//   return entity instanceof NumberLiteral && entity.value === 0;
// }
//
// function isOne(entity) {
//   return entity instanceof NumberLiteral && entity.value === 1;
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
  NumberLiteral,
  StringLiteral,
  NoneLiteral,
  IdExpression,
  SubscriptExpression,
  BinaryExpression,
  UnaryExpression,
  MutableBinding,
  ImmutableBinding,
  ReturnStatement,
  WhileStatement,
  ForStatement,
  ExpressionStatement,
  Case,
  IfStatement,
  TupleExpression,
  MatrixExpression,
  DictionaryExpression,
  Range,
  SetExpression,
  KeyValuePair,
  Block,
  Program,
  StringInterpolation,
  Interpolation,
  FunctionCallExpression,
  FunctionDeclarationStatement,
  FunctionTypeAnnotation,
  MatrixType,
  SetType,
  TupleType,
  DictionaryType,
};
