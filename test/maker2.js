var o = require('../lib/maker').o;
var oo = require('../lib/maker').oo;
var assert = require('assert');

function Animal() {};

Animal.prototype = {
    name : "Bob",
    age : 0,    
    say : function() {
        return this.name;
    }
};

function Dog() {
    this._x = 2; // random something
};

Dog.prototype = new Animal();

Dog.prototype.say = function() {
    return "Woof";
};

Dog.prototype.constructor = Dog;

var Cat = oo({ _type : Animal,
               
               say : function() {
                   return "Meow";
               },
               
               myDog : {
                   _type : Dog,
                   age : 10
               },
               
               myAnimals : [
                   { _type : Animal, name : "Will" },
                   { _type : Animal, name : "Addison" }
               ]  
             });


var Mittens = o({
    name : "Will"
});

var Person = oo({
    name : "Will"
});

var will = o({
    _type : Person,
    foo : 1
});

 function run() {
     var a1 = o({ "_type" : Animal,
                  "name" : "Will" });
     var a2 = o({ "_type" : Dog });        
     assert.ok(a1 instanceof Animal);
     assert.equal(a1.name, "Will");
     assert.equal(a2.name, "Bob");
     assert.equal(a2.say(), "Woof");  
     console.log("making a3");
     var a3 = oo({ "_type" : Cat,
                  "name" : "Felix",
                  "foo" : {}});
     console.log("making a4");
     var a4 = oo({ "_type" : a3,
                  "name" : "Whiskers" });
     console.log("making a5");
     var a5 = o({ "_type" : a4 });
     console.log("--->>");
     console.log(a5);
     console.log(a5.__proto__);
     console.log(a5.constructor.toString());
     assert.equal(a5.say(), "Meow");
     console.log(">>>");
     console.log(a3);
     console.log(a5);
     console.log(a5.__proto__);
     console.log(a5.__proto__.__proto__);
     assert.equal(a5.name, "Whiskers");
     assert.equal(a5.age, 0);
     assert.equal(a5.myDog.age, 10);
     console.log(">> --");
     console.log(a5.myDog);
     console.log(Animal.prototype);
     assert.equal(a5.myDog.name, "Bob");
     assert.equal(a5.myAnimals[1].name, "Addison");
     assert.equal(a5.myAnimals[1].age, 0);
     assert.ok(a5 instanceof Animal);
     assert.ok(a5 instanceof a3);
     assert.ok(a5 instanceof a3);
     a3.foo = {}
//     a4.foo.a = 9;
     console.log(a4.foo);
     console.log(a3.foo); // TODO: damn!

     console.log(will);
     console.log(Person);
     assert.ok(will instanceof Person);

     var a6 = o({_type : a5,
                 "lemons" : {}
                });
     assert.equal(a6.name, "Whiskers");
     assert.ok(a6 instanceof a3);
     var a7 = o({_type : a6 });
     assert.equal(a7.name, "Whiskers");
     assert.ok(a7 instanceof Cat)
     a7.lemons.foo = 1;
     console.log(a6.lemons);
     console.log(a7.lemons);
     assert.ok(a6.lemons.foo === undefined);

     var aa3 = new a3();
     assert.equal(aa3.name, "Felix");
     assert.equal(aa3.age, 0);
     assert.equal(aa3.myDog.age, 10);
     assert.ok(aa3 instanceof Animal);

 }

// exports
exports.run = run;

// main
if (require.main == module) {
    run();
}
