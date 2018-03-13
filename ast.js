const { INITIAL, Context } = require('./analyzer');
const util = require('util');

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
  }
  optimize() {
    return this;
  }
}

class FloatLiteral {
  constructor(value) {
    this.value = value;
  }
  analyze() {
    this.type = Type.FLOAT;
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
  }
  optimize() {
    return this;
  }
}

class IntegerLiteral {
  constructor(value) {
    this.value = value;
  }
  analyze() {
    this.type = Type.INT;
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

class VariableDeclaration {
  // During syntax analysis (parsing), all we do is collect the variable names.
  // We will make the variable objects later, because we have to add them to a
  // semantic analysis context.

  // a, b = 1, 2
  constructor(targets, isMutable, sources) {
    Object.assign(this, { targets, isMutable, sources });
  }

  analyze(context) {
    if (this.targets.length !== this.sources.length) {
      throw new Error('Number of variables does not equal number of initializers');
    }

    // We don't want the declared variables to come into scope until after the
    // declaration line, so we will analyze all the initializing expressions
    // first.

    for (let i = 0; i < this.targets.length; i += 1) {
      context.variableMustNotBeAlreadyDeclared(this.targets[i]);
      this.sources[i].analyze(context);
      let variable;
      if (this.targets[i].id) {
        variable = new VariableExpression(this.targets[i].id);
      } else {
        variable = new VariableExpression(this.targets[i]);
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
};



// class AssignmentStatement {
//   // a, b := 23, true
//   constructor(targets, sources) {
//     Object.assign(this, { targets, sources });
//   }
//
//   analyze(context) {
//     if (this.targets.length !== this.sources.length) {
//       throw new Error('Number of variables does not equal number of expressions');
//     }
//
//     for (let i = 0; i < this.targets.length; i += 1) {
//       // this.targets[i].analyze(context);
//       this.sources[i].analyze(context);
//       // console.log(`id: ${util.inspect(this.targets[i].id)} initializers: ${util.inspect(this.sources[i])}`);
      // let variable;
      // if (this.targets[i].id) {
      //   variable = new VariableExpression(this.targets[i].id, this.sources[i]);
      // } else {
      //   variable = new VariableExpression(this.targets[i], this.sources[i]);
      // }
      // context.add(variable);
//     }
//   }
//
//   optimize() {
//     // this.sources.forEach(e => e.optimize());
//     // this.targets.forEach(v => v.optimize());
//     // Suggested: Turn self-assignments without side-effects to null
//     return this;
//   }
// }

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

//
// class UnaryExpression {
//   constructor(op, operand) {
//     Object.assign(this, { op, operand });
//   }
//   analyze(context) {
//     this.operand.analyze(context);
//     if (this.op === 'not') {
//       this.operand.type.mustBeBoolean('The "not" operator requires a boolean operand', this.op);
//       this.type = Type.BOOL;
//     } else if (this.op === '-') {
//       this.operand.type.mustBeInteger('Negation requires an integer operand', this.op);
//       this.type = Type.INT;
//     }
//   }
//   optimize() {
//     this.operand = this.operand.optimize();
//     if (this.op === 'not' && this.operand instanceof BooleanLiteral) {
//       return new BooleanLiteral(!this.operand.value);
//     } else if (this.op === '-' && this.operand instanceof IntegerLiteral) {
//       return new IntegerLiteral(-this.operand.value);
//     }
//     return this;
//   }
// }
//
// class BinaryExpression {
//   constructor(op, left, right) {
//     Object.assign(this, { op, left, right });
//   }
//   analyze(context) {
//     this.left.analyze(context);
//     this.right.analyze(context);
//     if (['<', '<=', '>=', '>'].includes(this.op)) {
//       this.mustHaveIntegerOperands();
//       this.type = Type.BOOL;
//     } else if (['==', '!='].includes(this.op)) {
//       this.mustHaveCompatibleOperands();
//       this.type = Type.BOOL;
//     } else if (['and', 'or'].includes(this.op)) {
//       this.mustHaveBooleanOperands();
//       this.type = Type.BOOL;
//     } else {
//       // All other binary operators are arithmetic
//       this.mustHaveIntegerOperands();
//       this.type = Type.INT;
//     }
//   }
//   optimize() {
//     this.left = this.left.optimize();
//     this.right = this.right.optimize();
//     if (this.left instanceof IntegerLiteral && this.right instanceof IntegerLiteral) {
//       return this.foldIntegerConstants();
//     } else if (this.left instanceof BooleanLiteral && this.right instanceof BooleanLiteral) {
//       return this.foldBooleanConstants();
//     } else if (this.op === '+') {
//       if (isZero(this.right)) return this.left;
//       if (isZero(this.left)) return this.right;
//     } else if (this.op === '-') {
//       if (isZero(this.right)) return this.left;
//       if (sameVariable(this.left, this.right)) return new IntegerLiteral(0);
//     } else if (this.op === '*') {
//       if (isOne(this.right)) return this.left;
//       if (isOne(this.left)) return this.right;
//       if (isZero(this.right)) return new IntegerLiteral(0);
//       if (isZero(this.left)) return new IntegerLiteral(0);
//     } else if (this.op === '/') {
//       if (isOne(this.right, 1)) return this.left;
//       if (sameVariable(this.left, this.right)) return new IntegerLiteral(1);
//     }
//     return this;
//   }
//   mustHaveIntegerOperands() {
//     const errorMessage = `${this.op} must have integer operands`;
//     this.left.type.mustBeCompatibleWith(Type.INT, errorMessage, this.op);
//     this.right.type.mustBeCompatibleWith(Type.INT, errorMessage, this.op);
//   }
//   mustHaveBooleanOperands() {
//     const errorMessage = `${this.op} must have boolean operands`;
//     this.left.type.mustBeCompatibleWith(Type.BOOL, errorMessage, this.op);
//     this.right.type.mustBeCompatibleWith(Type.BOOL, errorMessage, this.op);
//   }
//   mustHaveCompatibleOperands() {
//     const errorMessage = `${this.op} must have mutually compatible operands`;
//     this.left.type.mustBeMutuallyCompatibleWith(this.right.type, errorMessage, this.op);
//   }
//   foldIntegerConstants() {
//     switch (this.op) {
//       case '+': return new IntegerLiteral(+this.left + this.right);
//       case '-': return new IntegerLiteral(+this.left - this.right);
//       case '*': return new IntegerLiteral(+this.left * this.right);
//       case '/': return new IntegerLiteral(+this.left / this.right);
//       case '<': return new BooleanLiteral(+this.left < this.right);
//       case '<=': return new BooleanLiteral(+this.left <= this.right);
//       case '==': return new BooleanLiteral(+this.left === this.right);
//       case '!=': return new BooleanLiteral(+this.left !== this.right);
//       case '>=': return new BooleanLiteral(+this.left >= this.right);
//       case '>': return new BooleanLiteral(+this.left > this.right);
//       default: return this;
//     }
//   }
//   foldBooleanConstants() {
//     switch (this.op) {
//       case '==': return new BooleanLiteral(this.left === this.right);
//       case '!=': return new BooleanLiteral(this.left !== this.right);
//       case 'and': return new BooleanLiteral(this.left && this.right);
//       case 'or': return new BooleanLiteral(this.left || this.right);
//       default: return this;
//     }
//   }
// }
//
// class AssignmentStatement {
//   constructor(target, source) {
//     Object.assign(this, { target, source });
//   }
//   analyze(context) {
//     this.target.analyze(context);
//     this.source.analyze(context);
//     this.source.type.mustBeCompatibleWith(this.target.type, 'Type mismatch in assignment');
//   }
//   optimize() {
//     this.target = this.target.optimize();
//     this.source = this.source.optimize();
//     if (this.source instanceof VariableExpression &&
//         this.target.referent === this.source.referent) {
//       return null;
//     }
//     return this;
//   }
// }
//
// class ReadStatement {
//   constructor(varexps) {
//     this.varexps = varexps;
//   }
//   analyze(context) {
//     this.varexps.forEach((v) => {
//       v.analyze(context);
//       v.type.mustBeInteger('Variables in "read" statement must have type integer');
//     });
//   }
//   optimize() {
//     return this;
//   }
// }
//
// class WriteStatement {
//   constructor(expressions) {
//     this.expressions = expressions;
//   }
//   analyze(context) {
//     this.expressions.forEach((e) => {
//       e.analyze(context);
//       e.type.mustBeInteger('Expressions in "write" statement must have type integer');
//     });
//   }
//   optimize() {
//     this.expressions = this.expressions.map(e => e.optimize());
//     return this;
//   }
// }
//


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
    this.block.analyze(INITIAL);
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
  VariableDeclaration,
  WhileStatement,
  ReturnStatement,
  Case,
  IfStatement,
  Block,
  Program,
};
