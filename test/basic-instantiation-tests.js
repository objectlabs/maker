var o = require('../lib/maker').o(module);
var oo = require('../lib/maker').oo(module);
var assert = require('assert');

/*******************************************************************************
 * basic instantiation tests
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

var a1 = o({
  _type: Animal
})

var a2 = o({
  _type: Animal,
  name: "pookie"
})

// instanceof 
assert(a1.isHappy == true)
assert(a1.name == "Animal")
assert(a1 instanceof Animal)

assert(a2.isHappy == true)
assert(a2.name == "pookie")
assert(a2 instanceof Animal)

// prototype vs local fields
a1.instanceCache.a = 1
assert(a2.instanceCache.a == undefined)
a1.classCache.a = 1
assert(a2.classCache.a == 1)

// can override prototype property on instance
var a3 = o({
  _type: Animal,
  name: "Fluffy",
  classCache: {p: 6}
})

assert(a3.classCache.p == 6)
assert(a2.classCache.a == Animal.prototype.classCache.a == 1)

var a4 = o({
  _type: a3,
  classCache: {r: 7},
  a3: a3
})

assert(a4.classCache.r == 7)
assert(a3.classCache.p == 6)
assert(a2.classCache.a == Animal.prototype.classCache.a == 1)

var a5 = o({
  _type: Animal,
  name: "Lucky",
  luckyCharm: o({
    _type: Animal,
    name: "Lucky's charm"
  }),
  a3: a3
})
assert(a5.isHappy == true)
assert(a4.a3 == a5.a3) // same pointer

// testing make with targetType
var a6 = o({
  name: "Kiki"
}, null, Animal)
assert(a6.isHappy === true)

