olive

## Introduction
Olive is a static language that complies to JavaScript. Olive combines the expressivity and power of Python with the first class support for matrix and array mathematics of languages like Julia and MATLAB. Olive's goal is to make programming delightful for data science and numerical computing applications. A simple syntax paired with implicit typing reduces the overhead of language-specific syntax and allows the programmer to focus on the content of their programs.

## List of Features
- `.oil` file extension
- Named and Default Parameters
- Strongly, Statically, and Implicitly Typed
- String Interpolation
- Built in data structures

## Examples

### Variable Declarations

```
name = 'olive'
language = true
year = 2018
```

### Comments

```
---
This is a 
multi line comment
---

~ This is a single line comment
```

### Arithmetic

```
sum = 3 + 7
difference = 10 - 3
product = 20 5
product = 20 * 5
quotient = 100 / 10
power = 10 ^ 2
modulus = 101 % 2
```

### Data Structures

#### Tuple

Tuples are immutable ordered sequences of elements. 

```
olives = ('kalamata', 'picholine', 'moroccan salt-cured', 'cerignola')
```

#### Map

Maps store key value pairs.

```
color = {'red': 85, 'green': 107, 'blue': 47 }
```

#### Vector

Vectors are mutable ordered sequences of elements. 

```
olive_products = ['oil', 'raw', 'pickled', 'stuffed']
fibonacci_numbers = [0, 1, 1, 2, 3, 5, 8, 13]
```

Vectors can be generated programmatically.
```
x = fill(1.0, (3))          ~ Vector of ones

```


Matrices are multi-dimensional vectors.

```
olive_population = [[0, 1, 1], [0, 0, 1], [0, 0, 1]]
```

Matrices can be generated programmatically.

```
A = rand(1:4,3,3)             ~ 3x3 Matrix of random numbers in the range [1, 4]
```



### Functions
```
say_hello (name: 'Eileen') =
  print `Hello, ${name}!`

say_hello (name: 'Eddie')     ~ 'Hello, Eddie!' (named parameter)
say_hello ()                  ~ 'Hello, Eileen!' (default parameter)

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
  
~ Anonymous Functions
double = (y) => 2 y
```

