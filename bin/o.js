var path = process.argv[2]
if (!path) {
   console.log("Please specify a path")
   return
}

var result = require('maker')._o(module)(path)
console.log(result)


