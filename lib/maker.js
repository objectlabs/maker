/*******************************************************************************
 *
 * Copyright (c) 2012 ObjectLabs Corporation
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var Module = require('module')
var argparser = require('nomnom')
var spawn = require('fibers-utils').spawn
var inherits = require('util').inherits

/*******************************************************************************
 * CONSTANTS
 */
var TYPE_FIELD = '_type'
var PROPERTY_FIELD = '$property'
var __DEEP_MODE__ = false

/*******************************************************************************
 * resolve
 */
function resolve(path, mod) { // XXX this is ineffecient. must cache
  var result = null
  var filepath = resolveFilename(path, mod)
  result = mod.require(filepath)
  return result
}

/*******************************************************************************
 * resolveFilename
 */
function resolveFilename(path, mod) { 
  var result = null;
  
  if (path) {
    try {
      return Module._resolveFilename(path, mod) // TODO: is this what we want?
    } catch (e) { // XXX really slows this down
      if (path && path.length > 1 && path[0] != '/') {
        pathlist = path.split('/')
        if (pathlist.length > 1) {
          if (pathlist.indexOf("lib") == -1) {
            pathlist.splice(1, 0, "lib")
            var newpath = pathlist.join('/')
            result = Module._resolveFilename(newpath, mod)
            return result
          }
        } 
      }
            
      throw(e)
    }
  }
  
  return result
}

/*******************************************************************************
 * @class Maker
 * @ignore
 */
function Maker(typeResolver) {
  this._typeResolver = typeResolver || resolve;
};

Maker.prototype = { // XXX did we just overwrite Maker.prototype.constructor? Yes but we fix below (decide)

  /***************************************************************************
   * ignoreFields
   */
  ignoreFields : [],
  
  /***************************************************************************
   * _typeResolver
   */
  _typeResolver : resolve,
  
  /***************************************************************************
   * make
   * 
   * @param {Object} datum
   * @param {Object|string} targetType
   * @param {boolean} isClass
   * @param {Object} mod - module
   * @param {Object} result
   */
  make: function(datum, targetType, args, isClass, mod, result) { // XXX seems like result not used? Maybe for when instantiate type first? hmmm
    // primitives
    if (datum === null) {
      return null;
    }
    
    if (datum === undefined) {
      return undefined;
    }
    
    dtype = typeof(datum);
    if (dtype === 'string') {
      return datum;
    }

    if (dtype === 'boolean') {
      return datum;
    }
    
    if (dtype === 'number') {
      return datum;
    }

    if (dtype === 'function') {
      return datum;
    }
    
    // arrays
    if (datum.constructor === Array) {
      if (__DEEP_MODE__) {
        return this._makeArray(datum, mod);
      } else {
        return datum
      }
    }

    // objects
    if (dtype === 'object') {
      var value = this._makeObject(datum, targetType, args, isClass, mod, result);
      return value
    }
    
    throw new Error("Unable to make from datum: " + datum);
  },
  
  /***************************************************************************
   * _makeArray
   * 
   * @param prototype
   */
  _makeArray : function(datum, mod) {
    var self = this;
    return datum.map(function(elem) { return self.make(elem, null, null, false, mod); });
  },
  
  /***************************************************************************
   * _makeObject
   * 
   * @param {Object} datum
   * @param {boolean} [isClass]
   * @param {Object} [result]
   */
  _makeObject: function(datum, targetType, args, isClass, mod, result) {
    if (datum._ref) {
      return _o(mod)(datum._ref); // XXX is this still in play?
    }
    
    // instantiate object
    result = result || this.instantiate(datum, targetType, args, isClass, mod);
        
    // define properties
    this._defineProperties(datum, isClass, mod, result)
    
    if (!isClass) { // only applies to objects not classes
      // initialize 
      this._initializeObject(result, mod)
      // run main (will only run in right conditions)
      this._runMain(result, mod)
    }    

    return result;
  },

  /***************************************************************************
   * _defineProperties
   * 
   * @param {Object} datum
   * @param {boolean} [isClass]
   * @param {Object} [result]
   */
  _defineProperties: function(datum, isClass, mod, result) {
    for (var property in datum) {
      if (!(property in this.ignoreFields) &&
          property !== TYPE_FIELD &&
          datum.hasOwnProperty(property)) 
      {
        var value = datum[property]
        if (__DEEP_MODE__) {
          value = this.make(value, null, null, false, mod);
        } 

        if (isClass) {
          this._defineProperty(result.prototype, property, value);
        } else {
          this._defineProperty(result, property, value);
        }
      }
    }
  },

  /***************************************************************************
   * _defineProperty
   * 
   * @param {Object} obj
   * @param {String} property
   * @param {Object} value
   *
   * @ignore
   */
  _defineProperty : function(obj, property, value) {
    // obj[property] = value
    // obj[property] = { "$property" : <property-def> } 
    // XXX this should probably be o({$property: <property-def>}) ??
    
    if (value != null && typeof(value) == 'object' && value[PROPERTY_FIELD]) {
      Object.defineProperty(obj, property, value[PROPERTY_FIELD])
    } else {
      // was doing this but don't think that is quite right. Just setting works much better in 
      //  the case where you want to have a non-shared property redefined in the obj not in proto

      Object.defineProperty(obj, property, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: value
      })
    }
  },

  /***************************************************************************
   * instantiate
   * 
   * @param {Object} datum
   * @param {boolean} isClass
   *
   * @returns {Object} The object or class (Function) instantiated from datum
   */
  instantiate: function(datum, targetType, args, isClass, mod) {
    var type = targetType || datum[TYPE_FIELD] || Object

    if (typeof(type) === 'string') {
      var resolver = this._typeResolver;
      if (resolver) {
        var typeName = type;
        try {
          type = resolver(typeName, mod);
        } catch (e) {
          throw new Error("Could not resolve _type: '" + typeName + "' from module " + mod.filename + " -- " + e.message)
        }
        if (!type) {
          throw new Error("Could not resolve _type: '" + typeName + "' from module " + mod.filename)
        }
      } else {
        throw new Error("Could not resolve _type: " + type + " . Could not find resolver")
      }
    }
    
    var initSuppressionArg = { __supressInit__: true }

    // helper function
    var makeConstructor = function() {
      var C = function() { 
        // automatically chain with init suppression (_init definition should chain if desired)
        C.super_.apply(this, [initSuppressionArg])  // XXX chain rest of args or no?

        if (C.prototype._C) { // call _C as defined
          // pass through args but also deal with __supressInit__
          var cArgs = arguments
          var suppressInit = false
          if (cArgs && cArgs.length > 0) {
            var lastArg = arguments[cArgs.length - 1]
            if (lastArg.__supressInit__) {
              suppressInit = true
              delete cArgs[cArgs.length - 1]
            }
          }
          C.prototype._C.apply(this, cArgs) 
        }

        // call _init unless supressed
        if (!suppressInit) {
          if (this._init) {
            this._init()
          }
        }
      }

      // mark as defined by Maker
      C.__isMakerDefined__ = true

      return C
    }
    
    if (typeof(type) === 'function') { // constructor
      var result = null
      if (isClass) {
        // our constructor
        var C = makeConstructor()
        // link superclass
        inherits(C, type)
        // define _super method    
        Object.defineProperty(C.prototype, '_super', {
          enumerable: false,
          configurable: false,
          writable: false,
          value: function(methodName) {
            if (type.prototype[methodName]) {
              return type.prototype[methodName].bind(this)
            }
            return function() {} // just so clients don't have to check if the superclass has method
          }
        })
        result = C
      } else {
        args = args || []
        if (type.__isMakerDefined__) {
          // Supress the maker-defined constructor from calling _init. Will be called 
          // after define-properties. 
          args.push(initSuppressionArg)
        }

        // Can we optimize by calling new directly if no args (e.g result = new type(args)) ?
        // Dynamically call new type with variable args. This is hairy. Found solution here
        // http://jsperf.com/dynamic-arguments-to-the-constructor
        result = new (Function.prototype.bind.apply(type, [null].concat(args)))
      }
      
      return result
    }
    
    // otherwise assume it is an object 
    var result
    if (isClass) { // XXX is this a case we want to support ( oo where type is object )?
      // our constructor
      var C = makeConstructor()      
      C.prototype = type
      C.prototype.constructor = C
      result = C
    } else {
      result = Object.create(type) 
    }

    return result
  },

  /***************************************************************************
   * _initializeObject
   */
  _initializeObject: function(obj, mod) {
    if (obj._init) {
      obj._init()
    }
  },

  /***************************************************************************
   * _runMain
   */
  _runMain: function(obj, mod) {
    if (obj._main && require.main && (require.main == mod)) { 
      // if cmdargs are defined use them
      var cmdargs = obj.cmdargs
      if (cmdargs) {
        argparser.options(cmdargs)
      }

      var options = argparser.parse(process.argv.slice(2)) // XXX 2 does not work with _o (dont worry about hat case anymore)
      delete options._ // kill the _ args since we don't want them

      // configure option properties
      this._configureOptionProperties(obj, cmdargs, options)
      
      // do it
      obj._main(options) 
    }
  },

  /***************************************************************************
   * configureOptionProperties
   */        
  _configureOptionProperties: function(obj, optionDefinitions, options) {
    if (optionDefinitions) {
      for (var option in options) {
        if (optionDefinitions[option] && optionDefinitions[option].property) {
          var optionValue = options[option]
          obj[option] = optionValue
        }
      }
    }
  }

};

Maker.prototype.constructor = Maker; // XXX very important

/*******************************************************************************
 * maker
 */
var maker = new Maker();

/*******************************************************************************
 * o 
 * 
 * @param {Object} module
 */
function o(mod) { 
  if (!(mod instanceof Module)) {
    throw(Error("Must supply a module to o: " + JSON.stringify(mod)))
  }
  return function(datum, args, targetType) {
    return maker.make(datum, targetType, args, false, mod);
  }
}

/*******************************************************************************
 * oo 
 * 
 * @param {Object} datum
 */
function oo(mod) {
  if (!(mod instanceof Module)) {
    throw(Error("Must supply a module to oo: " + JSON.stringify(mod)))
  }
  return function(datum) {
    return maker.make(datum, null, null, true, mod);
  }
}

/*******************************************************************************
 * _o
 */
function _o(mod) {
  if (!(mod instanceof Module)) {
    throw(Error("Must supply a module to _o: " + mod))
  } 
  return function(path, args) {
    return resolve(path, mod)
  }
}

/*******************************************************************************
 * __
 */
function __(mod, mainOnlyContext) {
  if (!(mod instanceof Module)) {
    throw(Error("Must supply a module to __: " + mod))
  } 
  return function(f) {
    if (mainOnlyContext) {
      if (require.main == mod) {
        spawn(f)
      } else {
        f()
      }
    } else {
      spawn(f)
    }
  }
}

/*******************************************************************************
 * exports
 */
if (typeof(exports) != "undefined") {
  exports.Maker = Maker;
  exports.o = o;
  exports._o = _o;
  exports.oo = oo;
  exports.__ = __;
}
