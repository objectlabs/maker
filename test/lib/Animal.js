var o = require('../../lib/maker').o(module);
var oo = require('../../lib/maker').oo(module);

module.exports = oo({
  _C: function() {
    console.log("--> Animal._C()")
    this.cache = {}
    this.isHappy = true
    this.name = "Animal"
  },
  say: function() {
    return "I am a " + this.name + " - Am I happy? " + this.isHappy
  },

  _main: function(options) {
    console.log("_main")
    console.log(this.say())
  }
})
