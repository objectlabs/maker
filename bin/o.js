var path = process.argv[2]
if (!path) {
   console.log("Please specify a path")
   return
}

require.main.__mainComponentPath = path
var result = require('maker')._o(module)(path)
if (result._init) {
    result._init(process.argv.slice(3))
}

console.log(result)

// yargs
// can print usage (we should gen)
// can give example (gen?)
// describe (can desribe opts)
// can require opts
// can set defaults
// can require num args
// can mark as boolean
// can alias
// long and short
// count -vvv
// 

