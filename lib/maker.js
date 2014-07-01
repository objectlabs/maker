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

Maker.prototype = { 

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
    make : function(datum, isClass, mod, result) {
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
            return this._makeArray(datum);
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
    _makeObject : function(datum, isClass, mod, result) {
        if (datum._ref) {
            return _o(mod)(datum._ref); // XXX
        }
        
        // instantiate object
        result = result || this.instantiate(datum, isClass, mod);
        
        // define properties
        for (var property in datum) {
            if (!(property in this.ignoreFields) &&
                property !== TYPE_FIELD &&
                datum.hasOwnProperty(property)) 
            {
                var value = this.make(datum[property], false, mod);
                if (isClass) {
                    this._defineProperty(result.prototype, property, value);
                } else {
                    this._defineProperty(result, property, value);
                }
            }
        }

        // initialize
        this._initializeObject(result, mod)

        return result;
    },

    /***************************************************************************
     * _initializeObject
     */
    _initializeObject: function(obj, mod) {
        var mainComponentPath = require.main.__mainComponentPath
        var mainComponentFilename = resolveFilename(mainComponentPath, mod)

        if (mainComponentFilename != mod.filename) { // only init if not main
            if (obj._init) {
                obj._init()
            }
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
    instantiate : function(datum, isClass, mod) {
        return this._instantiateFromType(datum[TYPE_FIELD], isClass, mod);
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
                var C = function() {};
                C.prototype = new type();
                C.prototype.constructor = C;
                return C;
            }
            return new type(); // XXX should we be cloning here or above like we do below?
        }

        // otherwise assume it is an object 
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
            Object.defineProperty(obj, property, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: value
            })
        }
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
                result[propName] = value;
            }
        }

        return result;
    }
};

Maker.prototype.constructor = Maker; // very important

/*******************************************************************************
 * maker
 */
var maker = new Maker();

/*******************************************************************************
 * o 
 * 
 * @param {Object} datum
 */
function o(mod) { 
    if (!(mod instanceof Module)) {
        throw(Error("Must supply a module to o: " + JSON.stringify(mod)))
    }
    return function(datum) {
        if (!mod) {
            throw(Error("Must supply a module to o"))
        }
        return maker.make(datum, false, mod);
    }
};

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
}
