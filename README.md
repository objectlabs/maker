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
o({
  name: "John Smith"
})
```

or they can be define more explicitly as you would with Javascript's [```Object.defineProperty```](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

```
o({
  name: $property: {
    value: "John Smith"
    configurable: true,
    enumerable: true,
    writable: false
  })
}
```

You can also define dynamic properties via getters and setters

```
o({
  now: $property: {
    get: function() {
      return new Date()
    }
  }
})
```

### Object lifecycle and _init

Object creation via the ```o``` operator follows this sequence:

1. The ```_type``` field is evaluated. If it is a Class constructor a new instance of that Class is created. If it is an object that object is cloned and used as the new objects prototype. If no ```_type``` is supplied the default value of ```Object``` is used.
2. All field definitions in the object passed to the ```o``` operator are added to the newly created object
3. If the object has an ```_init``` method that method is called
4. The newly created object is returned

Example using ```_init```:
```
o({
  port: 8080,
  app: null,
  db: null,
  _init: function() {
    this.app = express.createServer()
    this.app.listen(this.port)
  }
})
```

### Creating command line applications with Maker

Maker allows for the easy creation of command line programs with built-in argument parsing. You can use the ```_init``` method to define a top-level entry point, or "main" function, to your application. 

Example:
```
var o = require('maker').o(module);
var _o = require('maker')._o(module);

module.exports = o({
  port: null,
  verbose: false,
  _app: null,
  
  cmdargs: { // supports nomnom definitions (see https://github.com/harthur/nomnom)
    port: {
      abbr: "p",
      help: "port server should listen on",
      required: false,
      default: 8080
    },
    verbose: {
      abbr: "v",
      help: "enable verbose logging",
      required: false,
      default: false,
      property: true // set this value as a field on this object when parsed as a cmdline option
    }
  }
  
  _init: function(options) {
    this.port = options.port
    this._app = express.createServer()
    this._app.listen(this.port)
  }
})
```

You can then call your program from the commandline like this:

```
% node <path-to-your-module> <options>
```


