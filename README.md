

### Learn more at Olive-Lang [Website](https://eileenchoe.github.io/olive/website)

![olive-logo](./resources/logo-new.png)

## Introduction

Olive is a high-level, high-performance language for numerical computing. Olive combines the expressivity and power of Python with the first class support for matrix and array mathematics of languages like Julia and MATLAB. Olive's goal is to make programming delightful for data science and numerical computing applications. A simple syntax paired with implicit typing reduces the overhead of language-specific syntax and allows the programmer to focus on the content of their programs.

## List of Features
- `.oil` file extension
- Strongly, Statically, and Implicitly Typed
- String Interpolation
- Built in data structures

## Examples


### Comments

```
| I am a comment!
```

### Types

- number: `3`, `897`, `-32`, ``-3.08`, `9.54`, `0.9`
- boolean: `true`, `false`
- string: `'hello'`, `'olive is the best language ever'`
- None: `None`
- tuple: `(2, 3, 5)`, `(800, 'San Francisco', true)`
- matrix: `[0, 4 ,5]`, `[[3, 2], [8, 7]]`
- dictionary: `{'a': 15, 'friends': 'best'}`
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

### Functions

The compiler will perform static semantic analysis to ensure function parameters and return value are of the correct type.

```
say_hello: string -> void
say_hello (name='Eileen') =
  print(`Hello, ${name}!`)

say_hello('Eddie')           | 'Hello, Eddie!'
say_hello(name='Eddie')      | 'Hello, Eddie!' (named parameter)
say_hello()                  | 'Hello, Eileen!' (default parameter)

square: number -> number
square (x) =
  return x ^ 2

double: number -> number
double (y) =
  return 2 * y

factorial: number -> number
factorial (x) =
  if x < 0
    throw "invalid argument"
  else if x == 0
    return 1
  return factorial(x - 1) * x
  
double: number -> number
double (x) =
  return x + x

double("string")  | Compile time error
```
#### Type Annotations
Olive functions are required to have a function type annotation. Here are a few examples of more complex type annotations:
```
pun: number -> string
pun (x) =
    return 'pun'
    
pun(-12.3) | 'pun'

join: number, number, number-> string
join (x, y, z) =
    return '${x}-${y}-${z}'

join(1, 2, 3) | '1-2-3'

eval_mod: (number -> number), number -> number
eval_mod (x, y) =
	return x(y % 10)

double: number -> number
double(x) =
  return 2 * x

eval_mod(double, 101) | 2

eval_mistery: (number -> _), number -> _
eval_mistery (x, y) =
    return x(y)
    
eval_mistery(pun, 999999999999999999) | 'pun'

fun: matrix<number>, tuple<number, number, string> -> (int -> dictionary<number, string>)
fun (M, t) =
  inner_fun: number -> dictionary<number, string>
  inner_fun (x) =
    return {M[1]: '${t[2]} says: x is ${x}'}
    
  return inner_fun
  
spider_vocab = fun([1.1, 2.2, 3.3], (0, 101, 'spiderman'))
spider_vocab(-1)[2.2] | 'spiderman says: x is -1'
```
