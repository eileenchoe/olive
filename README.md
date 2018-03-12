

### Learn more at Olive-Lang [Website](https://eileenchoe.github.io/olive/website)

![olive-logo](./resources/logo-new.png)

## Introduction

Olive is a high-level, high-performance language for numerical computing. Olive combines the expressivity and power of Python with the first class support for matrix and array mathematics of languages like Julia and MATLAB. Olive's goal is to make programming delightful for data science and numerical computing applications. A simple syntax paired with implicit typing reduces the overhead of language-specific syntax and allows the programmer to focus on the content of their programs.

## List of Features
- `.oil` file extension
- Named and Default Parameters
- Strongly, Statically, and Implicitly Typed (Optional manifest typing for disambiguation)
- String Interpolation
- Built in data structures

## Examples


### Comments

```
---
This is a
multi line comment
---

| This is a single line comment
```

### Variable Declarations

```
name = 'olive'
language = true
year = 2018

x = 2.5     | immutable
y := 2.3    | mutable

| There are some built in constants
e           | Euler's Constant
pi          | Pi
```

### Arithmetic

```
sum = 3 + 7
difference = 10 - 3
product = 20 5
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

Dictionary store key value pairs.

```
color = {'red': 85, 'green': 107, 'blue': 47 }
```

#### List

Lists are homogeneous ordered sequences of elements.

```
olive_products = ['oil', 'raw', 'pickled', 'stuffed']
fibonacci_numbers = [0, 1, 1, 2, 3, 5, 8, 13]
```

#### Range

Like python ranges, Olive ranges iteratively produce the following value in the range until the end condition is met. Range objects can also be used as a parameter for random generators, in which case, the start, increment and end values will be used to produce a single random value.

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

Can be generated programmatically.
```
a = ones((5, 1))                      | 5 element column vector of ones
a = ones((1, 5))                      | 5 element row vector of ones
b = ones((1, 3)) * 2.5                | 3 element vector of 2.5s
c = random((1, 3))                    | 3 element vector of random floats in [0:0.01:1)
d = random((1, 7), range=(0:1:10])    | 7 element vector of random integers in [0:1:10)

A = random((1, 3, 4), range=[0:1:10))          | 1x3x4 matrix of random numbers in (0, 10]
B = zeros((3, 3))                              | 3x3 matrix of zeros
I = identity(10)                               | 10x10 identity matrix
```

Olive supports a number of built-in operations and functions for matrices.

```
| Multiplication
A = random((1, 3, 4), range=(0:0.1:10])
B = random((1, 3, 4), range=(3:0.1:10])
C = A B

| Transpose
A_transpose = A'

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
```
#### Concatenation
```
greeting = 'hello'
name = 'olive'

complete_greeting = greeting ++ ', ' ++ name
```

### Loops
#### If
```
olive_types = ('kalamata', 'picholine', 'moroccan salt-cured', 'cerignola')
if (olive_types[0] == 'kalamata')
  print('yay')
```

#### For
```
olive_types = ('kalamata', 'picholine', 'moroccan salt-cured', 'cerignola')
for types in olive_types
  print(types)
```

#### While
```
counter := 10
while (counter >= 0)
  print(counter)
  counter := counter - 1 | we never said you should be doing this...
```

### Functions

Functions look like immutable variables, and they can take parameters. Parameters can have default values.

```
say_hello (name='Eileen') =
  print(`Hello, ${name}!`)

say_hello('Eddie')           | 'Hello, Eddie!'
say_hello(name='Eddie')      | 'Hello, Eddie!' (named parameter)
say_hello()                  | 'Hello, Eileen!' (default parameter)

square (x) =
  return x ^ 2

double (y) =
  return 2 y

factorial (x) =
  if x < 0
    throw "invalid argument"
  else if x == 0
    return 1
  return factorial(x - 1) * x

| Anonymous Functions
((y) = 2 y)(2)
```
#### Type Annotations
Functions may have type annotations.

When a type annotation is provided, the compiler will check that the function parameters and return value are of the correct type.

```
double: int -> int
double (x) =
  return x + x

double("string")  | Compile time error

triple (x) =
  return 3 x

triple("10")      | Run time error

```

### Types
|Type| Description|
| -- | ---------- |
| int | Signed Integer |
| float | Floating point real values |
| boolean | `true` or `false` |
| string | `'hello'`|