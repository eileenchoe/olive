const { InitialContext } = require('./analyzer');
// const util = require('util');

const sameType = (a, b) => JSON.stringify(a) === JSON.stringify(b);

class Type {
  constructor(name) {
    this.name = name;
    Type.cache[name] = this;
  }
  mustBeNumber(message) {
    return this.mustBeCompatibleWith(Type.NUMBER, message);
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
  assertSubscriptValidType(typeToCheck) { // eslint-disable-line
    if (!sameType(typeToCheck, Type.NUMBER)) {
      throw new Error('The subscript of a matrix must be a number.');
    }
  }
  getElementType() {
    return this.elementType;
  }
}

class TupleType extends Type {
  constructor(type) {
    super('tuple');
    this.elementType = type;
  }
}

class SetType extends Type {
  constructor(type) {
    super('set');
    this.elementType = type;
    this.isIterable = true;
    this.isNotBindable = true;
  }
  assertSubscriptValidType(typeToCheck) {
    if (!sameType(typeToCheck, this.elementType)) {
      throw new Error('You tried to access a value of a set using the incorrect subscript type.');
    }
  }
  getElementType() {
    return this.elementType;
  }
}

class DictionaryType extends Type {
  constructor(keyType, valueType) {
    super('dictionary');
    this.keyType = keyType;
    this.valueType = valueType;
    this.isIterable = true;
  }
  assertSubscriptValidType(typeToCheck) {
    if (!sameType(typeToCheck, this.keyType)) {
      throw new Error('You tried to access a value of a dictionary using the incorrect key type.');
    }
  }
  getElementType() {
    return this.valueType;
  }
}


Type.cache = {};
Type.BOOL = new Type('bool');
Type.NUMBER = new Type('number');
Type.STRING = new Type('string');
Type.NONE = new Type('none');
// Type.TEMPLATELITERAL = new Type('templateliteral');
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
  }
  analyze() {
    this.type = Type.STRING;
    return this;
  }
  optimize() {
    return this;
  }
}

class NumberLiteral {
  constructor(value) {
    this.value = value;
  }
  analyze() {
    this.type = Type.NUMBER;
    return this;
  }
  optimize() {
    return this;
  }
}

class BooleanLiteral {
  constructor(value) {
    this.value = value;
  }
  analyze() {
    this.type = Type.BOOL;
    return this;
  }
  optimize() {
    return this;
  }
}

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
  constructor(iterable, subscript) {
    Object.assign(this, { iterable, subscript });
  }

  analyze(context) {
    this.subscript.analyze(context);
    this.iterable.analyze(context);
    if (this.iterable instanceof IdExpression) {
      const lookedUpValue = context.lookup(this.iterable.id);
      if (lookedUpValue === null) {
        throw new Error(`${this.iterable.id} has not been defined yet.`);
      }
      if (lookedUpValue.type.isIterable) {
        lookedUpValue.type.assertSubscriptValidType(this.subscript.type);
      }
      this.type = lookedUpValue.type.getElementType();
    } else if (this.iterable instanceof SubscriptExpression) {
      this.type = this.iterable.iterable.type.elementType.elementType;
    }
  }

  optimize() {
    return this;
  }
}

class Variable {
  constructor(id, type, isMutable) {
    Object.assign(this, { id, type, isMutable });
  }
}

class FunctionVariable {
  constructor(id, referent) {
    Object.assign(this, { id, referent });
  }
}

const assertSameType = (value, test) => {
  if (!sameType(value, test)) {
    throw new Error('Type mismatch error');
  }
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
      if (this.target[i] instanceof IdExpression) {
        context.cannotRebindToImmutableBinding(this.target[i].id);
        const lookedUpValue = context.lookup(this.target[i].id);
        if (lookedUpValue === null) {
          const v = new Variable(this.target[i].id, s.type, true);
          this.target[i].referent = v;
          context.add(v);
          this.isAVariableDeclaration = true;
        } else {
          // TODO: look in todo.txt set binding
          // console.log(JSON.stringify(lookedUpValue.type));
          // if (lookedUpValue.type.isNotBindable) {
          //   throw new Error('Cannot rebind to a set.')
          // }
          assertSameType(lookedUpValue.type, s.type);
        }
      } else if (this.target[i] instanceof SubscriptExpression) {
        assertSameType(this.target[i].type, s.type);
      }
    });
  }
  optimize() {
    return this;
  }
}

/*
  For the subscript type:
    if it's a matrix or tuple: the subscript needs to be an int
    else if it's a dictionary: the subscript needs to be a string
    subscript = 'string'
    a = Variable -> checkthat variable.type.keytype = subscript.type
*/

class ImmutableBinding {
  constructor(target, source) {
    Object.assign(this, { target, source }); // target is a string
  }
  analyze(context) {
    if (this.target.length !== this.source.length) {
      throw new Error('Number of variables does not equal number of initializers');
    }
    this.source.forEach(s => s.analyze(context));
    const targetsAsVariables = [];
    this.source.forEach((s, i) => {
      context.variableMustNotBeAlreadyDeclared(this.target[i]);
      const v = new Variable(this.target[i], s.type, false);
      context.add(v);
      targetsAsVariables.push(v);
    });
    this.target = targetsAsVariables; // overwrite sources with their variable equivalents
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
      this.type = Type.NUMBER;
    }
  }
  optimize() {
    return this;
  }

  mustHaveNumericOperands() {
    const errorMessage = `${this.op} must have numeric operands`;
    this.left.type.mustBeCompatibleWith(Type.NUMBER, errorMessage, this.op);
    this.right.type.mustBeCompatibleWith(Type.NUMBER, errorMessage, this.op);
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

class MatrixExpression {
  constructor(values) {
    this.values = values;
  }
  analyze(context) {
    this.values.forEach(value => value.analyze(context));
    const memberType = this.values[0].type;
    this.values.forEach((value) => {
      if (!sameType(value.type, memberType)) {
        throw new Error('Type mismatch among members of matrix');
      }
    });
    this.type = new MatrixType(memberType);
  }
}

class TupleExpression {
  constructor(values) {
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

class RangeExpression {
  constructor(open, start, step, end, close) {
    this.start = start;
    this.step = step;
    this.end = end;
    this.inclusiveStart = open === '[';
    this.inclusiveEnd = close === ']';
  }
  analyze(context) {
    this.start.analyze(context);
    this.step.analyze(context);
    this.end.analyze(context);
    if (!sameType(this.start.type, Type.NUMBER) || !sameType(this.step.type, Type.NUMBER) || !sameType(this.end.type, Type.NUMBER)) {
      throw new Error('Range expression values must evaluate to numbers');
    }
    this.type = Type.RANGE;
  }
}

const determineIteratorType = (exp) => {
  let expression = exp;
  if (exp instanceof IdExpression) {
    expression = exp.referent;
  }
  if (!expression.type.isIterable) {
    throw new Error(`Type ${expression.type.name} is not iterable.`);
  }
  if (expression instanceof DictionaryExpression) {
    return expression.type.keyType;
  }
  return expression.type.elementType;
};

class UnaryExpression {
  constructor(op, operand) {
    Object.assign(this, { op, operand });
  }

  analyze(context) {
    this.operand.analyze(context);
    if (this.op === '-') {
      if(!sameType(this.operand.type, Type.NUMBER)) {
        throw new Error('Unary operator minus can only be applied to numbers');
      }
    } else if (this.op === 'not') {
      if(!sameType(this.operand.type, Type.BOOL)) {
        throw new Error('Unary operator not can only be applied to bools');
      }
    }
    this.type = this.operand.type;
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

  // Functions like print and sqrt which are pre-defined are known as
  // "external" functions because they are not declared in the current
  // module and we therefore don't generate code for them.
  get isExternal() {
    return !this.function.body;
  }

  analyze(context) {
    this.annotation.analyze(context);
    if (this.annotation.parameterTypes === '_' && this.parameters.length > 0) {
      throw new Error(`Function ${this.id} should not have any parameters as indicated by its type annotation`);
    }
    if (this.parameters.length !== this.annotation.parameterTypes.length) {
      throw new Error(`The number of parameters in function signature and type annotation do not match for function ${this.id}`);
    }

    // Manually adding the function to the outer context
    const functionForContext = new FunctionVariable(this.id, this);
    // this.variable = functionForContext; // TODO: I don't think this reference
    context.add(functionForContext);

    if (this.body) { // null for built in functions
      const childContext = context.createChildContextForFunctionBody(this);
      this.parameters.forEach((param, index) => {
        const x = new Variable(param, this.annotation.parameterTypes[index], false);
        childContext.add(x);
      });

      this.body.analyze(childContext, true);
      if (this.annotation.returnType) {
        this.body.statements
          .filter(x => x instanceof ReturnStatement).forEach((returnStatement) => {
            if (this.annotation.returnType === '_') {
              throw new Error(`${this.id} should not have a return statement in its function body`);
            }
            assertSameType(this.annotation.returnType, returnStatement.returnValue.type);
          });
      }
    }
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
    this.args.forEach(arg => arg.analyze(context));
    this.callee = context.lookup(this.id);
    if (this.callee === null) { throw new Error(`A function with the name ${this.id} has not be declared yet.`); }
    this.type = this.callee.referent.annotation.returnType;
    this.args.forEach((arg, index) => {
      assertSameType(arg.type, this.callee.referent.annotation.parameterTypes[index]);
    });
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
    this.body.analyze(context.createChildContextForLoop(), false);
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

class Block {
  constructor(statements) {
    this.statements = statements;
  }
  analyze(context, manualContext) {
    // flag for whether or not a child context was manually created (happens for functions and for)
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
    const childContext = context.createChildContextForLoop();
    const iterator = new Variable(this.id.id, determineIteratorType(this.exp), false);
    childContext.add(iterator);
    this.body.analyze(childContext, true);
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

class KeyValuePair {
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
  analyze(context) {
    this.key.analyze(context);
    this.value.analyze(context);
  }
}

class StringInterpolation {
  constructor(values) {
    this.values = values;
  }
  analyze(context) {
    this.values.forEach(value => value.analyze(context));
    this.type = Type.STRING;
  }
}

class Interpolation {
  constructor(v) {
    this.value = v;
  }
  analyze(context) {
    this.value.analyze(context);
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

const addBuiltInFunctionsToContext = (context) => {
  const printFunctionAnnotation = new FunctionTypeAnnotation('print', [Type.STRING], Type.STRING);
  const printFunctionStatement = new FunctionDeclarationStatement(printFunctionAnnotation, 'print', ['_'], null);
  printFunctionStatement.analyze(context);

  const sqrtFunctionAnnotation = new FunctionTypeAnnotation('sqrt', [Type.NUMBER], Type.NUMBER);
  const sqrtFunctionStatement = new FunctionDeclarationStatement(sqrtFunctionAnnotation, 'sqrt', ['_'], null);
  sqrtFunctionStatement.analyze(context);
};


class Program {
  constructor(block) {
    this.block = block;
  }
  analyze() {
    addBuiltInFunctionsToContext(InitialContext);
    this.block.analyze(InitialContext);
  }
  optimize() {
    this.block = this.block.optimize();
    return this;
  }
}

class BreakStatement {
  analyze(context) {
    if (!context.inLoop) {
      throw new Error('Break statement outside loop')
    }
  }
}

class PassStatement {
  analyze(context) {
    if (!context.inLoop) {
      throw new Error('Pass statement outside loop')
    }
  }
}

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
  BreakStatement,
  PassStatement,
  ReturnStatement,
  WhileStatement,
  ForStatement,
  ExpressionStatement,
  Case,
  IfStatement,
  TupleExpression,
  MatrixExpression,
  DictionaryExpression,
  RangeExpression,
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
  Variable,
  FunctionVariable,
};
