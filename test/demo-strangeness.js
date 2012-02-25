function A() {
    this.stuff = { x : 1 }
};

function B() {}

B.prototype = new A();
B.prototype.constructor = B;

var b = new B();
console.log(b.stuff);
b.stuff.x = -1
console.log(b.stuff);
var b2 = new B();
console.log(b2.stuff);
