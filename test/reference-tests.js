var o = require('../lib/maker').o(module);
var oo = require('../lib/maker').oo(module);
var _o = require('../lib/maker')._o(module);
var assert = require('assert');

/*******************************************************************************
 * references tests
 */
var a = _o('./lib/SomeAnimal')

console.log(a.cache)
console.log(a.friend.staticCache)
assert(a.friend.staticCache)
assert(a.cache)
assert(a.isHappy)
assert(a.friend.cache)
assert(a.friend.isHappy)

