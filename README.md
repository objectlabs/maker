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

To run unit tests
-----------------

```node
% node ./test/all.js
```

Using Maker
----------

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
var o = require('maker').o(module)

o({})
```

which is the same as

```
o({_type : Object})
```

Simple object

```
var o = require('maker').o(module)

o({a : 1,
   b : 2});
```


Specifying a class via a constructor ```Function``` (in the _classical_ style)

```
var o = require('maker').o(module)

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
var o = require('maker').o(module)

var Person = o({
   name : "Some Person",
   email : null,
   age : 0
});

o({_type : Person,
   name : "Jo Smith",
   email : "jo@smith.com",
   age : 35});
```

Nested objects

```
var o = require('maker').o(module)

o({_type : Person,
   name : "Jo Smith",
   email : "jo@smith.com",
   age : 35,
   address = {
      _type : Address
      street : "100 Foo St.",
      city : "San Francisco",
      state : "CA",
      zip : 93212
   }
});

```

### The ```oo``` operator

The ```oo``` operator is used to make classes. All ```oo```
expressions evaluate to a value that is a ```Function``` that can be
used as a constructor. Like the ```o``` operator, the ```oo```
operator takes a single object argument. In this case the object
specification is the specification for a class. The ```_type``` field
can be used to specify superclass to extend and must be a
```Function``` value.

##### Some examples

```
var o = require('maker').o(module)
var oo = require('maker').oo(module)

var Animal = oo({
   name : "some animal",
   age : 0,
   weight : null,
   say : function() {
      return this.name;
   }
});

var Dog = oo({
   _type : Animal,
   name : "some dog",
   say : function() {
      return "woof: " + this._super('say')()    // delegating to superclass
   }
});

var fido = o({
   _type : Dog,
   name : "Fido",
});
```

### Defining properties

Properties can be defined as simple fieldname / value pairs

```
{
  name: "John Smith"
}
```

or they can be define more explicitly as you would with Javascript's [```Object.defineProperty```](http://yahoo.com)

```
{
  name: "John Smith"
}
```
