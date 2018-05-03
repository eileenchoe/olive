/*
 * Translation to JavaScript
 *
 * Requiring this module adds a gen() method to each of the AST classes.
 * Nothing is actually exported from this module.
 *
 * Generally, calling e.gen() where e is an expression node will return the
 * JavaScript translation as a string, while calling s.gen() where s is a
 * statement-level node will write its translation to standard output.
 *
 *   require('./backend/javascript-generator');
 *   program.gen();
 */

const { InitialContext } = require('../analyzer');
const { generateMatrixFromRange } = require('./olive-range-generator');
const { generateDivmod } = require('./olive-divmod-generator');

const {
  Program,
  Block,
  ReturnStatement,
  WhileStatement,
  ForStatement,
  IfStatement,
  ExpressionStatement,
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
  MatrixExpression,
  TupleExpression,
  SetExpression,
  DictionaryExpression,
  StringInterpolation,
  Interpolation,
  RangeExpression,
  FunctionCallExpression,
  FunctionDeclarationStatement,
  Variable,
  FunctionVariable,
  BreakStatement,
  PassStatement,
  addBuiltInFunctionsToContext,
} = require('../ast');
/*
 * Translation to JavaScript
 *
 * Requiring this module adds a gen() method to each of the AST classes.
 * Nothing is actually exported from this module.
 *
 * Generally, calling e.gen() where e is an expression node will return the
 * JavaScript translation as a string, while calling s.gen() where s is a
 * statement-level node will write its translation to standard output.
 *
 *   require('./backend/javascript-generator');
 *   program.gen();
 */

addBuiltInFunctionsToContext(InitialContext);


const indentPadding = 2;
let indentLevel = 0;

function emit(line) {
  console.log(`${' '.repeat(indentPadding * indentLevel)}${line}`);
}

function genStatementList(statements) {
  indentLevel += 1;
  statements.forEach(statement => statement.gen());
  indentLevel -= 1;
}

// jsName(e) takes any PlainScript object with an id property, such as a
// Variable, Parameter, or FunctionDeclaration, and produces a JavaScript
// name by appending a unique indentifying suffix, such as '_1' or '_503'.
// It uses a cache so it can return the same exact string each time it is
// called with a particular entity.
const jsName = (() => {
  let lastId = 0;
  const map = new Map();
  return (v) => {
    if (!(map.has(v))) {
      map.set(v, ++lastId); // eslint-disable-line no-plusplus
    }
    return `${v.id}_${map.get(v)}`;
  };
})();

function makeOp(op) {
  return {
    not: '!',
    and: '&&',
    or: '||',
    '==': '===',
    '!=': '!==',
  }[op] || op;
}

// This is a nice helper for variable declarations and assignment statements.
// The AST represents both of these with lists of sources and lists of targets,
// but when writing out JavaScript it seems silly to write `[x] = [y]` when
// `x = y` suffices.
function bracketIfNecessary(a) {
  if (a.length === 1) {
    return `${a}`;
  }
  return `[${a.join(', ')}]`;
}

function generateLibraryFunctions() {
  function generateLibraryStub(name, params, body) {
    const entity = InitialContext.declarations[name];
    emit(`function ${jsName(entity)}(${params}) {${body}}`);
  }
  // This is sloppy. There should be a better way to do this.
  generateLibraryStub('print', '_', 'console.log(_);');
  generateLibraryStub('sqrt', '_', 'return Math.sqrt(_);');
  generateLibraryStub('generateMatrixFromRange', ['inclusiveStart', 'start', 'step', 'end', 'inclusiveEnd'], generateMatrixFromRange);
  generateLibraryStub('generateDivmod', ['a', 'b'], generateDivmod);
}

const createListAsString = (acc, current, i) => ((i === 0) ? `${current}` : `${acc}, ${current}`);

Object.assign(MatrixExpression.prototype, {
  gen() {
    const values = this.values.map(v => v.gen());
    return `[${values.reduce(createListAsString, '')}]`;
  },
});

Object.assign(TupleExpression.prototype, {
  gen() {
    const values = this.values.map(v => v.gen());
    return `[${values.reduce(createListAsString, '')}]`;
  },
});

Object.assign(DictionaryExpression.prototype, {
  gen() {
    const keyValuePairArray = this.values.map(v => `${v.key.gen()}: ${v.value.gen()}`);
    return `{${keyValuePairArray.reduce(createListAsString, '')}}`;
  },
});

Object.assign(BinaryExpression.prototype, {
  gen() {
    const left = this.left.gen();
    const right = this.right.gen();
    if (this.op === '/%') {
      const functionName = jsName(InitialContext.declarations.generateDivmod);
      return `${functionName}(${left}, ${right})`;
    }
    return `(${left} ${makeOp(this.op)} ${right})`;
  },
});

Object.assign(BooleanLiteral.prototype, {
  gen() { return `${this.value}`; },
});

Object.assign(NoneLiteral.prototype, {
  gen() { return 'null'; }, // TODO: or undefined?
});

Object.assign(BreakStatement.prototype, {
  gen() { emit('break;'); },
});

Object.assign(PassStatement.prototype, {
  gen() { emit('continue;'); },
});

Object.assign(FunctionCallExpression.prototype, {
  gen() {
    const fun = this.callee;
    return `${jsName(fun)}(${this.args.map(a => (a ? a.gen() : 'undefined')).join(', ')})`;
  },
});

Object.assign(IdExpression.prototype, {
  gen() { return this.referent.gen(); },
});

Object.assign(IfStatement.prototype, {
  gen() {
    this.cases.forEach((c, index) => {
      const prefix = index === 0 ? 'if' : '} else if';
      emit(`${prefix} (${c.test.gen()}) {`);
      genStatementList(c.body.statements);
    });
    if (this.alternate) {
      emit('} else {');
      genStatementList(this.alternate.statements);
    }
    emit('}');
  },
});

Object.assign(NumberLiteral.prototype, {
  gen() { return `${this.value}`; },
});

Object.assign(Program.prototype, {
  gen() {
    generateLibraryFunctions();
    this.block.gen();
  },
});

Object.assign(Block.prototype, {
  gen() {
    this.statements.forEach((statement) => {
      statement.gen();
    });
  },
});

Object.assign(ExpressionStatement.prototype, {
  gen() { emit(`${this.body.gen()};`); },
});

Object.assign(ReturnStatement.prototype, {
  gen() {
    if (this.returnValue) { // TODO: implement returnValue getter in olive
      emit(`return ${this.returnValue.gen()};`);
    } else {
      emit('return;');
    }
  },
});

Object.assign(StringLiteral.prototype, {
  gen() { return `${this.value}`; },
});

Object.assign(SubscriptExpression.prototype, {
  gen() {
    const base = this.iterable.gen();
    const subscript = this.subscript.gen();
    return `${base}[${subscript}]`;
  },
});

Object.assign(UnaryExpression.prototype, {
  gen() { return `(${makeOp(this.op)} ${this.operand.gen()})`; },
});

Object.assign(ImmutableBinding.prototype, {
  gen() {
    const variables = this.target.map(t => t.gen());
    const initializers = this.source.map(s => s.gen());
    emit(`const ${bracketIfNecessary(variables)} = ${bracketIfNecessary(initializers)};`);
  },
});

Object.assign(MutableBinding.prototype, {
  gen() {
    const targets = this.target.map(t => t.gen());
    const sources = this.source.map(s => s.gen());
    if (this.isAVariableDeclaration) {
      emit(`let ${bracketIfNecessary(targets)} = ${bracketIfNecessary(sources)};`);
    } else {
      emit(`${bracketIfNecessary(targets)} = ${bracketIfNecessary(sources)};`);
    }
  },
});

Object.assign(WhileStatement.prototype, {
  gen() {
    emit(`while (${this.condition.gen()}) {`);
    genStatementList(this.body.statements);
    emit('}');
  },
});

Object.assign(Variable.prototype, {
  gen() { return jsName(this); },
});

Object.assign(FunctionVariable.prototype, {
  gen() { return jsName(this); },
});

Object.assign(FunctionDeclarationStatement.prototype, {
  gen() {
    emit(`function ${jsName(this.function)}(${this.parameters.map(p => jsName(p)).join(', ')}) {`);
    genStatementList(this.body.statements);
    emit('}');
  },
});

Object.assign(Interpolation.prototype, {
  gen() {
    return `${this.value.gen()}`;
  },
});

Object.assign(StringInterpolation.prototype, {
  gen() {
    return `\`${this.values.map(v => (v.isInterpolation ? `$\{${v.gen()}}` : v.gen())).join('')}\``;
  },
});

Object.assign(RangeExpression.prototype, {
  gen() {
    const functionName = jsName(InitialContext.declarations.generateMatrixFromRange);
    return `${functionName}(${this.inclusiveStart}, ${this.start.gen()}, ${this.step.gen()}, ${this.end.gen()}, ${this.inclusiveEnd})`;
  },
});

Object.assign(ForStatement.prototype, {
  gen() {
    if (this.exp.type.name === 'matrix' || this.exp.type.name === 'tuple') {
      emit(`${this.exp.gen()}.forEach((${jsName(this.id)}) => {`);
      genStatementList(this.body.statements);
      emit('});');
    } else if (this.exp.type.name === 'dictionary') {
      emit(`for (const ${jsName(this.id)} in ${this.exp.gen()}) {`);
      genStatementList(this.body.statements);
      emit('}');
    }
  },
});

// ------------------------------------------------------------------------------
// TODO: gen() for the following classes

Object.assign(SetExpression.prototype, {
  gen() {
    // TODO: provide mapping to JS set
  },
});
