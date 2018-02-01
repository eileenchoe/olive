olive

## Introduction
Olive is a static language that complies to JavaScript. Olive combines the expressivity and power of Python with the first class support for matrix and array mathematics of languages like Julia and MATLAB.

## List of Features
- `.oil` file extension
- Named and Default Parameters
- Type inference
- Static Typing

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

#### List

Lists are mutable ordered sequences of elements. 

```
olive_products = ['oil', 'raw', 'pickled', 'stuffed']
fibonacci_numbers = [0, 1, 1, 2, 3, 5, 8, 13]
```

Matrices are multi-dimensional lists.

```
olive_population = 	[[0, 1, 1], [0, 0, 1], [0, 0, 1]]
```

### Functions
```
say_hello () =
  print "Hello, World!"

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

