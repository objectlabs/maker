o({})
==========

***

Maker
----------

Maker is a simple and powerful OO toolkit for Javascript.

The central design goal of Maker is to provide a completely
delcarative mechanism for defining classes and instances of classes
(objects). Maker accomodates both the _classical_ and _prototype_
patterns of implementing OO in a simple and unified manner. 

The core of Maker is comprised of two operators:

* The ```o``` operator makes objects
* The ```oo``` operator makes classes

### The ```o``` operator

The ```o``` operator is used to make objects. The operator takes a
single object datum argument and returns an object based on the
supplied specification. The specification is an object that consists
of:

* An optional ```_type``` field, whose value may be either a ```Function``` or
  (representing a class constructor) or another object. 

* A series of name / value pairs specifying the fields of the object

##### Some examples

The empty object

```
var o = require('maker').o;

o({})
```

Simple object

```
var o = require('maker').o;

o({a : 1,
   b : 2});
```


Specifying a class via a constructor ```Function``` (in the _classical_ style)

```
var o = require('maker').o;

function Person() {
   this.name = "Some Person";
   this.email = null,
   this.age = 0;
}

o({_type : Person,
   name : "Jo Smith",
   email : "jo@smith.com",
   age : 35});
```

Specifying another object as a prototype

```
var o = require('maker').o;

var Person = o({
   name = "Some Person",
   email = null,
   age = 0
});

o({_type : Person,
   name : "Jo Smith",
   email : "jo@smith.com",
   age : 35});
```

### The ```oo``` operator




Installing Maker
----------

Using npm 

```
% cd <your-app>
% npm install maker
```

From git:

```
% git clone git@github.com:objectlabs/maker.git
% cd <your-app>
% npm install <path-to-maker>
```

hello ```there``` eggyman


To run unit tests
-----------------

```node
% node ./test/all.js
```
