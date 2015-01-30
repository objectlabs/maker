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
