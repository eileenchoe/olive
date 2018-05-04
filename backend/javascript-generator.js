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


const beautify = require('js-beautify');

const { InitialContext } = require('../analyzer');
const { generateMatrixFromRange, generateDivmod } = require('./olive-built-in-functions');

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

addBuiltInFunctionsToContext(InitialContext);

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
    return `function ${jsName(entity)}(${params}) {${body}}`;
  }
  return [
    generateLibraryStub('print', '_', 'console.log(_);'),
    generateLibraryStub('sqrt', '_', 'return Math.sqrt(_);'),
    generateLibraryStub('generateMatrixFromRange', ['inclusiveStart', 'start', 'step', 'end', 'inclusiveEnd'], generateMatrixFromRange),
    generateLibraryStub('generateDivmod', ['a', 'b'], generateDivmod),
  ].join('');
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
  gen() { return 'break;'; },
});

Object.assign(PassStatement.prototype, {
  gen() { return 'continue;'; },
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
    const cases = this.cases.map((c, index) => {
      const prefix = index === 0 ? 'if' : '} else if';
      return `${prefix} (${c.test.gen()}) {${c.body.statements.map(s => s.gen()).join('')}`;
    });
    const alternate = this.alternate ? `}else{${this.alternate.statements.map(s => s.gen()).join('')}` : '';
    return `${cases.join('')}${alternate}}`;
  },
});

Object.assign(NumberLiteral.prototype, {
  gen() { return `${this.value}`; },
});

Object.assign(Program.prototype, {
  gen() {
    const libraryFunctions = generateLibraryFunctions();
    const block = this.block.gen();
    const target = `${libraryFunctions}${block}`;
    return beautify(target, { indent_size: 2 });
  },
});

Object.assign(Block.prototype, {
  gen() {
    const statements = this.statements.map(s => s.gen());
    return `${statements.join('')}`;
  },
});

Object.assign(ExpressionStatement.prototype, {
  gen() { return `${this.body.gen()};`; },
});

Object.assign(ReturnStatement.prototype, {
  gen() { return this.returnValue ? `return ${this.returnValue.gen()};` : 'return;'; },
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
    return `const ${bracketIfNecessary(variables)} = ${bracketIfNecessary(initializers)};`;
  },
});

Object.assign(MutableBinding.prototype, {
  gen() {
    const targets = this.target.map(t => t.gen());
    const sources = this.source.map(s => s.gen());
    return this.isAVariableDeclaration ? `let ${bracketIfNecessary(targets)} = ${bracketIfNecessary(sources)};` :
      `${bracketIfNecessary(targets)} = ${bracketIfNecessary(sources)};`;
  },
});

Object.assign(WhileStatement.prototype, {
  gen() { return `while (${this.condition.gen()}) { ${this.body.statements.map(s => s.gen()).join('')} }`; },
});

Object.assign(Variable.prototype, {
  gen() { return jsName(this); },
});

Object.assign(FunctionVariable.prototype, {
  gen() { return jsName(this); },
});

Object.assign(FunctionDeclarationStatement.prototype, {
  gen() {
    const functionParameters = this.parameters.map(p => jsName(p)).join(', ');
    const functionBodyStatements = this.body.statements.map(s => s.gen()).join('');
    return `function ${jsName(this.function)}(${functionParameters}) { ${functionBodyStatements} }`;
  },
});

Object.assign(Interpolation.prototype, {
  gen() { return `$\{${this.value.gen()}}`; },
});

Object.assign(StringInterpolation.prototype, {
  gen() {
    return `\`${this.values.map(v => v.gen()).join('')}\``;
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
    const statements = this.body.statements.map(s => s.gen()).join('');
    if (this.exp.type.name === 'matrix' || this.exp.type.name === 'tuple') {
      return `${this.exp.gen()}.forEach((${jsName(this.id)}) => { ${statements} });`;
    } else if (this.exp.type.name === 'dictionary') {
      return `for (const ${jsName(this.id)} in ${this.exp.gen()}) { ${statements} }`;
    }
    return '';
  },
});

Object.assign(SetExpression.prototype, {
  gen() {
    // TODO: Feature not yet implemented
  },
});
