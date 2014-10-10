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
if (result._init) {
    // if service defines cmdargs use them
    var cmdargs = result.cmdargs
    if (cmdargs) {
        argparser.options(cmdargs)
    }
    var options = argparser.parse(process.argv.slice(3))
    console.log("args:", options._)
    console.log("options:", options)
    // configure option properties
    configureOptionProperties(result, cmdargs, options)
    result._init(options._, options)
}

console.log(result)

/*******************************************************************************
 * configureOptionProperties
 */        
function configureOptionProperties(obj, optionDefinitions, options) {
    if (optionDefinitions) {
        for (var option in options) {
            if (optionDefinitions[option] && optionDefinitions[option].property) {
                var optionValue = options[option]
                obj[option] = optionValue
            }
        }
    }
}

/*******************************************************************************
 * printUsage
 */        
function printUsage() {
    console.log("Usage: _o <path> <options>\n")
}

