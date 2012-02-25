Maker
====

Maker is a simple and powerful OO toolkit for Javascript.

The central design goal of Maker is to provide a completely
delcarative mechanism for defining classes and instances of classes
(objects). Maker accompdates both the __classical__ and __prototype__
patterns of doing OO in Javscript in a simple and unified manner. 

The core of Maker is comprised of two operators:

* ```o``` - makes objects
* ```oo``` - makes classes

### The ```o``` operator

The empty object
```
o({});
```

```
var function Animal() {
   this.name = "Some Animal";
   this.age = 0;
   this.weight = 0;
}

o({ _type : Animal,
    name : "Jo",
    age : 12,
    weight : 21 });
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
