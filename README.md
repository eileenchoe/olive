

### Learn more at Olive-Lang [Website](https://eileenchoe.github.io/olive/website)

![olive-logo](./resources/logo-new.png)

## Introduction

Olive is a high-level, high-performance language for numerical computing. Olive combines the expressivity and power of Python, first class support for matrix and array mathematics of languages like Julia and MATLAB, and type safety of staticaly typed languages like Elm. Olive's goal is to make programming delightful for data science and numerical computing applications. A simple syntax paired with implicit typing reduces the overhead of language-specific syntax and allows the programmer to focus on the content of their programs.

## List of Features
- `.oil` file extension
- Function Annotations
- Static Type Checking
- Strongly, Statically, and Implicitly Typed
- String Interpolation
- Built in data structures

## Examples


### Comments

```
| I am a comment!
```

### Types

- number: `3`, `897`, `-32`, `-3.08`, `9.54`, `0.9`
- boolean: `true`, `false`
- string: `'hello'`, `'olive is the best language ever'`
- None: `None`
- tuple: `(2, 3, 5)`, `(800, 'San Francisco', true)`
- matrix: `[0, 4 ,5]`, `[[3, 2], [8, 7]]`
- dictionary: `{'a': '15', 'friends': 'best'}`
- set: `{2, 4, 7}`, `{'hello', 'friends'}`
- range: `[0:1:10)`, `(0:0.01:1)`


### Variable Declarations

```
name = 'olive'
language = true
year = 2018

x = 2.5     | immutable binding
y := 2.3    | mutable binding
y := 2.33

| There are some built in constants
e           | Euler's Constant
pi          | Pi
```

### Arithmetic

```
sum = 3 + 7
difference = 10 - 3
product = 20 * 5
quotient = 100 / 10
integer_division = 101 // 10
power = 10 ^ 2
modulus = 101 % 2
(div, mod) = 7 /% 2           | Returns a tuple
```

### Data Structures

#### Tuple

Tuples are heterogeneous ordered sequences of elements.

```
olives = ('kalamata', 'picholine', 'moroccan salt-cured', 'cerignola', 100)
```

#### Dictionary

Dictionary store key value pairs. All keys of a dictionary must have the same type, and all values must have the same type.

```
color = {'red': 85, 'green': 107, 'blue': 47 }
german = {'ich': 'I', 'du': 'you'}
```

#### List

Lists are homogeneous ordered sequences of elements.

```
olive_products = ['oil', 'raw', 'pickled', 'stuffed']
fibonacci_numbers = [0, 1, 1, 2, 3, 5, 8, 13]
```

#### Set

Sets are homogeneous unordered collections of unique elements.

```
friends = {'eileen', 'eddie', 'juan', 'nati'}
favorite_numbers = {13, 3, 56}
```

#### Range

Like Python 3 ranges, Olive ranges iteratively produce the following value in the range until the end condition is met. Range objects can also be used as a parameter for random generators, in which case, the start, increment and end values will be used to produce a single random value.

```
evens = [0:2:10)                | range object with integers from 0 inclusive to 10 exclusive
delta = (-0.2:0.1:1.6]          | range object with decimal values from 0 exclusive to 1 inclusive
really_small = [0:1^(-10):0.1]  | increments can be specified using expressions like exponents
reversed_evens = [10:-2:0]      | increments can be negative to iterate in reverse
```

#### Matrix

Matrices are single or multi-dimensional vectors.

Matrices can behave as vectors
```
v = [[1], [2], [3], [4]]  | Column vector
u = [1, 2, 3, 4]          | Row vector

W = [[0, 1, 1], [0, 0, 1], [0, 0, 1]]  | Matrix
```

Olive supports a number of built-in operations and functions for matrices.

```
| Programmatic matrix generation
a = ones((5, 1))                      | 5 element column vector of ones
a = ones((1, 5))                      | 5 element row vector of ones
b = ones((1, 3)) * 2.5                | 3 element vector of 2.5s
c = random((1, 3))                    | 3 element vector of random floats in [0:0.01:1)
d = random((1, 7), range=(0:1:10])    | 7 element vector of random integers in [0:1:10)

A = random((1, 3, 4), range=[0:1:10))          | 1x3x4 matrix of random numbers in (0, 10]
B = zeros((3, 3))                              | 3x3 matrix of zeros
I = identity(10)                               | 10x10 identity matrix


| Multiplication
A = random((1, 3, 4), range=(0:0.1:10])
B = random((1, 3, 4), range=(3:0.1:10])
C = A * B

| Transpose
A_transpose = transpose(A)

| Inverse
D = random((1, 3, 4), range: [3:1:10])
D_inverse = inverse(D)

| Element wise operations are preceded by a dot
E = A .* B
F = A ./ B
```

### Strings
#### Interpolation
```
greeting = 'hello'
name = 'olive'
complete_greeting = `${greeting}, ${name}`

brand = 'Fiat'
age = 4
print('The age of that ${brand} car was ${age - 1} last year!')
```

### Control Flow Tools

#### `If` Statements

There can be zero or more `else if `, and the `else` part is optional.  

```
olive_types = ('kalamata', 'picholine', 'moroccan salt-cured', 'cerignola')

if (olive_types[0] == 'kalamata')
  print('yay')
else if (olive_types[0] == 'picholine')
  print('uh?')
else
  print('eww!')
```

#### `for` Statements

The `for` statement in Olive borrows many ideas from Python 3.  Rather than always iterating over an  arithmetic progression of numbers, or giving the user the ability to define both the iteration step and halting condition , Olive's `for` iterates over the items of any iterable sequence, in the order that
they appear in the sequence (or in a random order if that structure is inherently unordered like the keys of a dictionary.

```
| Any iterable type can be used in a for loop.
| Some examples include tuples, sets, and matrices

olive_types = ('kalamata', 'picholine', 'moroccan salt-cured', 'cerignola')
for types in olive_types
  print(types)

friends = {'Mom', 'Dad'}
for friend in friends
  print('${friend} is my best friend!')

for rand in random((1, 7), range=(0:1:10])
  if rand > 5
    print('yay')
  else
    print('boo')
```

#### `while` Statements

The `while` loop executes as long as the condition (here: `counter >= 0`) remains true. Usual stuff...

```
counter := 10
while (counter >= 0)
  print(counter)
  counter := counter - 1 | we never said you should be doing this...
```

#### `pass` and `break` Statements

The `pass` statement does nothing. It can be used when a statement is required syntactically but the program requires no action, just like in python. This helps with indentation. For example:

```
for grandpa_age in (91, 87, 101)
  pass
```

The `break` statement, like in C, breaks out of the innermost enclosing `for` or `while` loop.

```
n = 93
for divisor in [2:n]
  if next_random % divisor == 0
    print('${n} is divisible by ${divisor}')
    break

```

### Functions & Type Annotations

Olive requires function declarations to be preceded by a type annotation. At compile time, the Olive compiler will perform static semantic analysis to ensure type safety.

Olive function type annotations specify the type(s) of the argument(s) and the return type. `_` may be used to indicate the absence of arguments or return values. Type annotations for complex types can be constructed as follows:

- Set: `set<string>` set of strings
- Matrix: `matrix<matrix<number>>` 2D matrix of numbers
- Tuple: `tuple<string, number, boolean>` 3-tuples with first element type string, second element type number, and third element type boolean
- Dictionary: `dictionary<string, boolean>` dictionary with keys of type string, and values of type boolean
- Functions: `(matrix<number>, number -> tuple<number>)` function with first argument type matrix of numbers, second argument type number, and return type tuple of numbers. *Function type annotations must be enclosed in parentheses*


```
say_hello: string -> _
say_hello (name) =
  print(`Hello, ${name}!`)

say_hello('Eddie')           | 'Hello, Eddie!'

square: number -> number
square (x) =
  return x ^ 2

double: number -> number
double (y) =
  return 2 * y

double('hello')  | Type mismatch error, because the function `double` expects argument of type `number`
```

## Semantic Errors
Below is a list of Olive semantic error categories, and example error messages.

Subscript Errors
- `Subscript of a matrix must be a number.`
- `You tried to access a value of a set using the incorrect subscript type.`
- `You tried to access a value of a dictionary using the incorrect key type.`

Reference Errors
- `Variable with id x not declared`

Binding Errors
- `Number of variables does not equal number of initializers`

Function Errors
- `The number of arguments in your function signature doesn't match the number of parameters.`
- `A function with the name compute_averages has not be declared yet.`

Type Errors
- `Type mismatch among members of matrix`
- `Type mismatch among members of set`
- `Type mismatch among members of dictionary`
- `Type mismatch error`
- `+ must have numeric operands`
- `=== must have boolean operands`

Control Flow Errors
- `Condition in "while" statement must be boolean`
- `Type string is not iterable.`
- `Return statement outside function`
- `If statement tests must be boolean`

## Full Grammar ([Ohm](https://github.com/harc/ohm) Syntax)
```
Olive {
  Program               =  Block
  Block                 =  Statement+
  Statement             =  Ids "=" Exps                                                                       -- immutable
                        |  VarExps ":=" Exps                                                                  -- mutable
                        |  FunctionDecl                                                                       -- functiondeclaration
                        |  "break"                                                                            -- break
                        |  "pass"                                                                             -- pass
                        |  "return" Exp?                                                                      -- return
                        |  "while" Exp Suite                                                                  -- while
                        |  "for" id "in" Exp Suite                                                            -- for
                        |  "if" Exp Suite
                           ("else if" Exp Suite)*
                           ("else" Suite)?                                                                    -- if
                        |  Exp                                                                                -- expression
  Suite                 =  indent Block dedent
  Exp                   =  Exp "or" Exp1                                                                      -- or
                        |  Exp "and" Exp1                                                                     -- and
                        |  Exp1
  Exp1                  =  Exp2 relop Exp2                                                                    -- binary
                        |  Exp2
  Exp2                  =  Exp2 addop Exp3                                                                    -- binary
                        |  Exp3
  Exp3                  =  Exp3 mulop Exp4                                                                    -- binary
                        |  Exp4
  Exp4                  =  Exp4 "^" Exp5                                                                      -- binary
                        |  Exp5
  Exp5                  =  prefixop Exp6                                                                      -- unary
                        |  Exp6
  Exp6                  =  AsExp                                                                              -- asexpression
                        |  Matrix                                                                             -- matrix
                        |  FunctionCall                                                                       -- functioncall
                        |  Dictionary                                                                         -- dictionary
                        |  Set                                                                                -- set
                        |  Key
                        |  "(" Exp ")"                                                                        -- parens
                        |  Tuple
                        |  Range

  Range                 =  ("(" | "[") RangeType ":" RangeType ":" RangeType ("]" | ")")
  Tuple                 =  "(" NonemptyListOf<Exp5, ","> ")"
  Matrix                =  "[" ListOf<Exp5, ","> "]"
  Set                   =  "{" NonemptyListOf<Exp5, ","> "}"
  Dictionary            =  "{" ListOf<KeyValuePair, ","> "}"
  KeyValuePair          =  Key ":" Exp

  AsExp                 =  ("[" "]" | "{" "}") "as" Annotation

  RangeType             =  VarExp
                        |  Exp

  Key                   =  boollit
                        |  numlit
                        |  stringlit
                        |  nonelit
                        |  StringInterpolation
                        |  VarExp

  Exps                  =  NonemptyListOf<Exp, ",">
  Ids                   =  NonemptyListOf<id, ",">
  VarExp                =  VarExp "[" Exp "]"                                                                 -- subscript
                        |  id                                                                                 -- id
  VarExps               =  NonemptyListOf<VarExp, ",">

  StringInterpolation   = "`" (InterpolationChar | Interpolation)* "`"
  Interpolation         = "${" Exp "}"
  InterpolationChar     = (~"`" ~"$" any)

  types                 =  "number"
                        |  "string"
                        |  "bool"
                        |  "none"
                        |  "tuple"
                        |  "matrix"
                        |  "dictionary"
                        |  "set"
                        |  "range"

  basicAnnTypes         =  "none"
                        |  "string"
                        |  "number"
                        |  "bool"
                        |  "range"

  FunctionDecl          =  TypeAnn id "(" ListOf<id, ","> ") =" Suite
  TypeAnn               =  id ":" ("_" | ParamAnn) "->" ("_" | Annotation)
  Annotation            =  "matrix<" (Annotation | basicAnnTypes) ">"                                         -- matrix
                        |  "dictionary<" (Annotation | basicAnnTypes) "," (Annotation | basicAnnTypes) ">"    -- dictionary
                        |  "tuple<" NonemptyListOf<(Annotation | basicAnnTypes), ","> ">"                     -- tuple
                        |  "list<" (Annotation | basicAnnTypes) ">"                                           -- list
                        |  "set<" (Annotation | basicAnnTypes) ">"                                            -- set
                        |  "(" ("_" | ParamAnn) "->" ( "_" | Annotation) ")"                                  -- function
                        |  basicAnnTypes                                                                      -- simple
  ParamAnn              =  ListOf<Annotation, ",">
  FunctionCall          =  id "(" ListOf <Arg, ","> ")"
  Arg                   =  Exp
                        |  id

  id                    =  ~keyword letter idrest*
  idrest                =  "_" | alnum
  keyword               = ("true" | "false" | "if" | "and" | "or"
                        | "else" | "while" | "for" | "in" | "return"
                        | "none" | "not" | "break" | "pass" | "as" | types) ~idrest

  addop                 =  "+" | "-"
  relop                 =  "<=" | "<" | "==" | "!=" | ">=" | ">" | "and" | "or"
  mulop                 =  "*" | "/%" | "/" | "%"
  prefixop              =  "-" | "not"
  indent                =  "⇨"
  dedent                =  "⇦"

  stringlit             = "\'" ("\\\"" | (~"\'" any))* "\'"
  boollit               = "true" | "false"
  numlit                = digit+ ("." digit+)?
  nonelit               = "none"

  newline               =  "\n"+
  space                 += comment
  comment               =  "|" (~"\n" any)* "\n"
}
```
