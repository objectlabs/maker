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

* A ```_type``` field, whose value may be either a ```Function``` or
  or another object. 

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


Use in the _classical_ style

```
var o = require('maker').o;

function Animal() {
   this.name = "Some Animal";
   this.age = 0;
   this.weight = 0;
}

o({_type : Animal,
   name : "Jo",
   age : 12,
   weight : 21});
```


#### The ```oo``` operator




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
