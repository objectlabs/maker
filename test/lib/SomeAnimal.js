var o = require('../../lib/maker').o(module, true);
var _o = require('../../lib/maker')._o(module)

module.exports = o({
  _type: './Animal',
  name: 'SomeAnimal',
  friend: _o('./SomeOtherAnimal')
})
