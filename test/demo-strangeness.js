function A() {
    this.junk = { x : 1 };
};

function B() {}

B.prototype = new A();
B.prototype.constructor = B;

var b = new B();
console.log(b.junk);
b.junk.x = -1
console.log(b.junk);
var b2 = new B();
console.log(b2.junk); // I would expect {x:1} but no
