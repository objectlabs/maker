var o = require('../lib/maker').o;

var S = o({stuff : {x : 1}});
var T = o({_type : S});
var t1 = o({_type : T});
console.log(t1.stuff.x);
t1.stuff.x = -1;
console.log(t1.stuff.x);
var t2 = o({_type : T});
console.log(t2.stuff.x);


console.log(t2.constructor.prototype);
console.log(t2.constructor.prototype.constructor === t2.constructor); // cycle
console.log(t2.__proto__.stuff);
