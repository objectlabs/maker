var o = require('../lib/maker').o;
var assert = require('assert');

function A() {
    this.name = "a";
    this.meobj = {};
}

A.prototype.pname = "ap";

A.prototype.obj = {}

A.prototype.say = function() {
    print(this.name + "/" + this.pname);
}

var a = new A();

console.log(a);
console.log(a.name);
console.log(a.pname);
console.log(a.obj);

function B() {
    this.name = "b";
}

console.log("---------------");

B.prototype = new A();

B.prototype.pname = "bp";


B.prototype.say = function() {
    print(this.name);
}

B.prototype.constructor = B;

var b = new B();

console.log(b);
console.log(b.name);
console.log(b.pname);
console.log(b.obj);

console.log("---------------");

b.obj.foo = 1;
b.meobj.foo = 1;

console.log(a.obj);
console.log(b.obj);
console.log(a.meobj);
console.log(b.meobj);

console.log(a.constructor === A);
console.log(b.constructor === B);
console.log("--------------- cloning");

var bb = new b.constructor();
console.log("[]");
console.log(b.constructor === B);
console.log(b.constructor === A);
var bbb = new B();
console.log(b.constructor.toString());
console.log(bb.constructor.toString());
console.log(b.__proto__);
console.log(bb.__proto__);
console.log(b instanceof B);
console.log(bb instanceof B);
//bb.__proto__ = b.__proto__
console.log(b instanceof B);
console.log(bb instanceof B);

