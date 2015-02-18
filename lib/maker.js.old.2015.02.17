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
var __ = require('fibers-utils').spawn
var inherits = require('util').inherits

/*******************************************************************************
 * CONSTANTS
 */
var TYPE_FIELD = '_type'
var PROPERTY_FIELD = '$property'

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
      //        console.log(e, path)
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
   * @param {boolean} isClass
   * @param {Object} mod - module
   * @param {Object} result
   */
  make: function(datum, isClass, mod, result) { // XXX seems like result not used? Maybe for when instantiate type first? hmmm
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
      return this._makeArray(datum, mod);
    }

    // objects
    if (dtype === 'object') {
      return this._makeObject(datum, isClass, mod, result);
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
    return datum.map(function(elem) { return self.make(elem, false, mod); });
  },
  
  /***************************************************************************
   * _makeObject
   * 
   * @param {Object} datum
   * @param {boolean} [isClass]
   * @param {Object} [result]
   */
  _makeObject: function(datum, isClass, mod, result) {
    if (datum._ref) {
      return _o(mod)(datum._ref); // XXX is this still in play?
    }
    
    // instantiate object
    result = result || this.instantiate(datum, isClass, mod);
        
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
   * instantiate
   * 
   * @param {Object} datum
   * @param {boolean} isClass
   *
   * @returns {Object} The object or class (Function) instantiated from datum
   */
  instantiate: function(datum, isClass, mod) {
    return this._instantiateFromType2(datum[TYPE_FIELD], isClass, mod);
  },

  /***************************************************************************
   * _instantiateFromType
   * 
   * @param {Object | Function | string} type
   * @param {boolean} isClass
   *
   * @returns {Object} The object or class (Function) instantiated from datum
   *
   * @ignore
   */
  _instantiateFromType2: function(type, isClass, mod) {
    type = type || Object; 
    
    if (typeof(type) === 'string') {
      var resolver = this._typeResolver;
      if (resolver) {
        var typeName = type;
        try {
          type = resolver(typeName, mod);
        } catch (e) {
          throw new Error("Could not resolve type: '" + typeName + "' -- " + e.message)
        }
        if (!type) {
          throw new Error("Could not resolve _type " + typeName);
        }
      } else {
        throw new Error("Could not find _type: " + type);
      }
    }
    
    if (typeof(type) === 'function') { // constructor
      var result = null
      if (isClass) {
        // our constructor
        var C = function() { 
          C.super_.apply(this) 
          if (!C.prototype._C) { // XXX actually do I need to do this? Maybe just if (C.p._C) chain
            C.prototype._C = function() {}
          }
          // automatically chain
          C.prototype._C.apply(this, arguments) 
        }
        inherits(C, type)
        result = C
      } else {
        result = new type()
        // XXX define _type?
        // XXX define _super?
      }
      
      return result
    }
    
    // otherwise assume it is an object 
    var result
    if (isClass) {
      var C = function() { 
        C.super_.apply(this); C.prototype._C.apply(this) 
      }
      // our constructor
      var C = function() { 
        C.super_.apply(this)
        if (!C.prototype._C) {
          C.prototype._C = function() {}
        }
        // automatically chain
        C.prototype._C.apply(this, arguments) 
      }
      
      C.prototype = type
      C.prototype.constructor = C
      result = C
    } else {
      result = Object.create(type)
    }

    return result
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
//        console.log(property)
        var value
        var propertyDatum = datum[property]

        if (propertyDatum && (typeof(propertyDatum) == 'object') && (propertyDatum.constructor != Array) && (propertyDatum._type == undefined)) {
          // XXX this is to fix problem refs but is not quite right -- makes it so you always need _type which is not intended since you may still
          // want _init() ... etc...???? Or maybe we want ref datums... ? More declarative? Also maybe we dont want each level needing the o operator
          // as it will make it harder to store  these in db (which is maybe why we want the _ref)
//          value = propertyDatum  // do not have this working yet XXX
          value = this.make(propertyDatum, false, mod);
        } else {
          value = this.make(propertyDatum, false, mod);
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
  },
  
  /***************************************************************************
   * _instantiateFromType
   * 
   * @param {Object | Function | string} type
   * @param {boolean} isClass
   *
   * @returns {Object} The object or class (Function) instantiated from datum
   *
   * @ignore
   */
  _instantiateFromType : function(type, isClass, mod) {
    type = type || Object; 
    
    if (typeof(type) === 'string') {
      var resolver = this._typeResolver;
      if (resolver) {
        var typeName = type;
        type = resolver(typeName, mod);
        if (!type) {
          throw new Error("Could not resolve _type " + typeName);
        }
      } else {
        throw new Error("Could not find _type: " + type);
      }
    }
    
    if (typeof(type) === 'function') { // constructor
      if (isClass) {
        //                var proto = new type() // XXX should this be Object.create(type.prototype)?
        var proto = Object.create(type.prototype)
        var C = function() {}
        C.prototype = this._cloneObject(proto)
        // define constructor
        Object.defineProperty(C.prototype, 'constructor', {
          enumerable: false,
          configurable: false,
          writable: false,
          value: C
        })
        // define _super
        Object.defineProperty(C.prototype, '_super', {
          enumerable: false,
          configurable: false,
          writable: false,
          value: function(f) {
            return type.prototype[f].bind(this)
          }
        })
        
        return C
      }
      //var t = new type() // XXX should this be Object.create(type.prototype)?
      var t = Object.create(type.prototype)
      // XXX this is breaking instanceof vs just returning t
      var obj = this._cloneObject(t)
      
      // define _type XXX not sure we want this 
      Object.defineProperty(obj, '_type', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: type.prototype
      })
      
      return obj
    }
    
    // otherwise assume it is an object 
    // XXX maybe use Object.create(type, proto) // minus _type (or do we do this with defineProperty later based on how we have factored it?)
    var proto = this._cloneObject(type);
    var F = function() {};
    F.prototype = proto;
    F.prototype.constructor = F;
    if (isClass) {
      return F;
    } 

    return new F();
  },
  
  /***************************************************************************
   * _cloneObject
   * 
   * @param {Object} obj 
   * @param {Object} result 
   */
  _cloneObject : function(obj, result) { // TODO: cycles
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (!result) {
      result = new obj.constructor();
    }
    
    var value;
    for (var propName in obj) {
      value = obj[propName];
      
      if (value && (value.constructor == Object || 
                    value.constructor == Array)) 
      {
        result[propName] = 
          this._cloneObject(value, new value.constructor());
      } else {
        //              console.log(value, typeof(value))  // XXX value.constructor check above is wrong
        result[propName] = value;
      }
    }
    
    return result;
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
 * @param {boolean} inFiberAtTopLevel - run in fiber when require.main == mod
 */
function o(mod, inFiberAtTopLevel) { 
  if (!(mod instanceof Module)) {
    throw(Error("Must supply a module to o: " + JSON.stringify(mod)))
  }
  return function(datum) {
    if (!mod) {
      throw(Error("Must supply a module to o"))
    }

    if (inFiberAtTopLevel && require.main && (require.main == mod)) {
      // this is regardless of whether _main will exist on resulting object
      // although in most cases inFiberAtTopLevel will be used in 
      // those cases XXX?
      //console.log("spawning _main")
      __(function() {
        maker.make(datum, false, mod);
      })
    } else {
      return maker.make(datum, false, mod);
    }
  }
}

/*******************************************************************************
 * o 
 * 
 * @param {Object} datum
 */
function oo(mod) {
  if (!(mod instanceof Module)) {
    throw(Error("Must supply a module to oo: " + JSON.stringify(mod)))
  }
  return function(datum) {
    if (!mod) {
      throw(Error("Must supply a module to oo"))
    }
    return maker.make(datum, true, mod);
  }
};

/*******************************************************************************
 * _o
 */
function _o(mod) {
  if (!(mod instanceof Module)) {
    throw(Error("Must supply a module to _o: " + mod))
  } 
  return function(path, args) {
    if (!mod) {
      throw(Error("Must supply a module to _o"))
    }
    return resolve(path, mod)
  }
}

/*******************************************************************************
 * exports
 */
if (typeof exports != "undefined") {
  exports.Maker = Maker;
  exports.o = o;
  exports._o = _o;
  exports.oo = oo;
  exports.__ = __;
}
