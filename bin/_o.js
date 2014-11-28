var argparser = require('nomnom')

if (process.argv.length < 3) {
    console.log("<path> required\n")
    printUsage()
    return
}

// normalize path
var path = process.argv[2]
var cwd = process.cwd()
if (path[0] === '/') {
    path = path.substring(1)
} else {
    path = cwd + '/' + path    
}

// resolve main service
require.main.__mainComponentPath = path
var result = require('maker')._o(module)(path)

//console.log(result)

/*******************************************************************************
 * printUsage
 */        
function printUsage() {
    console.log("Usage: _o <path> <options>\n")
}

