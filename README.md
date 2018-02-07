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

#### Vector

Vectors are homogeneous ordered sequences of elements. 

```
olive_products = ['oil', 'raw', 'pickled', 'stuffed']
fibonacci_numbers = [0, 1, 1, 2, 3, 5, 8, 13]
```

Vectors can be generated programmatically.
```
a = ones((5))                           | 5 element vector of ones
b = ones((3)) * 2.5                     | 3 element vector of 2.5s
c = random((6))                         | 6 element vector of random numbers in [0,1)
d = random((7), range: (0, 10])         | 7 element vector of random numbers in [0, 10)
```

#### Matrix
Matrices are multi-dimensional vectors.

```
olive_population = [[0, 1, 1], [0, 0, 1], [0, 0, 1]]
```

Matrices can be generated programmatically.

```
A = random((1, 3, 4), range: [0, 10))          | 1x3x4 matrix of random numbers in (0, 10]
B = zeros((3,3))						                   | 3x3 matrix of zeros
I = identity(10)						                   | 10x10 identity matrix
```

Olive supports a number of built-in operations and functions for matrices.

```
| Multiplication
A = random((1, 3, 4), range: (0, 10]) 
B = random((1, 3, 4), range: (3, 10]) 
C = A B

| Transpose
A_transpose = A'

| Inverse
D = random((1, 3, 4), range: [3, 10]) 
D_inverse = inverse(D)

| Element wise operations are precided by a dot
E = A .* B							| Multiply A and B element-wise
F = A ./ B							| Divide A and B element-wise
```

### Strings
#### Interpolation
```
s = 'olive'             | Strings are 
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
counter = 10
while (counter >= 0)
  print(counter)
  counter = counter - 1
```

### Functions
```
say_hello (name: 'Eileen') =
  print(`Hello, ${name}!`)

say_hello (name: 'Eddie')     | 'Hello, Eddie!' (named parameter)
say_hello ()                  | 'Hello, Eileen!' (default parameter)

square (x) =
  return x ^ 2
 
double (y) =
  return 2 y
  
factorial (x) =
  if x < 0
    throw "invalid argument"
  elif x == 0
    return 1
  return factorial(x - 1) * x
  
| Anonymous Functions
((y) = 2 y)(2)				| Evaluates anonymous function with the argument 2
```
#### Type Annotations
Functions may have type annotations.

When a type annotation is provided, the compiler will check that the function parameters and return value are of the correct type.

```
int -> int
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



