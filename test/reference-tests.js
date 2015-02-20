var o = require('../lib/maker').o(module);
var oo = require('../lib/maker').oo(module);
var _o = require('../lib/maker')._o(module);
var assert = require('assert');

/*******************************************************************************
 * references tests
 */
var a = _o('./lib/SomeAnimal')

assert(a.friend.staticCache)
assert(a.cache)
assert(a.isHappy)
assert(a.friend.cache)
assert(a.friend.isHappy)

