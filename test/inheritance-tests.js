var o = require('../lib/maker').o(module);
var oo = require('../lib/maker').oo(module);
var assert = require('assert');

/*******************************************************************************
 * inheritance tests
 */
var Animal = oo({
  _C: function() {
    this.instanceCache = {}
    this.isHappy = true
    this.name = "Animal"
  },

  classCache: {},
  say: function() {
    return "I am a " + this.name + "- Am I happy?" + this.isHappy
  },
})

var Cat = oo({
  _type: Animal,
  _C: function() {
    this.name = "Cat"
  },

  meow: { 
    $property: {
      get: function() {
        return "Meow: " + this.name
      }
    }
  }
})

var SubAnimal = oo({
  _type: Animal
})

var a = o({
  _type: Animal
})

var c = o({
  _type: Cat
})

var c2 = o({
  _type: Cat,
  name: "fluffy"
})

assert(a.isHappy == true)
assert(a.name == "Animal")
assert(a instanceof Animal)

assert(c.isHappy == true)
assert(c.name == "Cat")
assert(c instanceof Animal)
assert(c instanceof Cat)

assert(c2.isHappy == true)
assert(c2.name == "fluffy")
assert(c2 instanceof Animal)
assert(c2 instanceof Cat)

c.instanceCache.a = 1
assert(c2.instanceCache.a == undefined)

assert(c2.meow == "Meow: fluffy")

// no constructor
var sa = o({
  _type: SubAnimal
})
assert(sa.isHappy)
