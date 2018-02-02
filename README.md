![olive-logo](https://github.com/eileenchoe/olive/blob/master/resources/olive-logo2.png)

## Introduction
Olive is a high-level, high-performance language for numerical computing. Olive combines the expressivity and power of Python with the first class support for matrix and array mathematics of languages like Julia and MATLAB. Olive's goal is to make programming delightful for data science and numerical computing applications. A simple syntax paired with implicit typing reduces the overhead of language-specific syntax and allows the programmer to focus on the content of their programs.

## List of Features
- `.oil` file extension
- Named and Default Parameters
- Strongly, Statically, and Implicitly Typed (Optional manifest typing for disambiguation)
- String Interpolation
- Built in data structures

## Examples

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

### Comments

```
---
This is a 
multi line comment
---

| This is a single line comment
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
c = random((6))                         | 6 element vector of random numbers in (0,1]
d = random((7), range: (0, 10])         | 7 element vector of random numbers in (0, 10]

e = random(range: (0, 10])

```

#### Matrix
Matrices are multi-dimensional vectors.

```
olive_population = [[0, 1, 1], [0, 0, 1], [0, 0, 1]]
```

Matrices can be generated programmatically.

```
A = rand(1:4,(3,3))             | 3x3 Matrix of random numbers in the range [1, 4]
```

Olive supports a number of built-in operations and functions for matrices.

```
| Matrix Multiplication
A = rand(1:4,(3,3))
B = rand(1:2,(3,3))
C = A B

| Transpose
A_transpose = A'
```

### Functions
```
say_hello (name: 'Eileen') =
  print `Hello, ${name}!`

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
  return factorial (x - 1) * x
  
| Anonymous Functions
double = (y) => 2 y
```

