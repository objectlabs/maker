

/*******************************************************************************
 * @class Maker
 */
var TYPE_FIELD = '_type';

/*******************************************************************************
 * @class Maker
 * @ignore
 */
function Maker(typeResolver) {
    this._typeResolver = typeResolver;
};

Maker.prototype = { // TODO may have constructor problem

    /***************************************************************************
     * _typeResolver
     */
    _typeResolver : null,

    /***************************************************************************
     * make
     * 
     * @param {Object} datum
     * @param {boolean} isClass
     * @param {Object} result
     */
    make : function(datum, isClass, result) {

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
            return this._makeObject(datum, isClass, result);
        }

        throw new Error("Unable to make from datum: " + datum);
    },

    /***************************************************************************
     * _makeArray
     * 
     * @param prototype
     */
    _makeArray : function(datum) {
        var self = this;
        return datum.map(function(elem) { return self.make(elem); });
    },

    /***************************************************************************
     * _makeObject
     * 
     * @param {Object} datum
     * @param {boolean} isClass
     * @param {Object} result
     */
    _makeObject : function(datum, isClass, result) {
        if (datum._ref) {
            return require('link')._(datum._ref); // TODO
        }
        
        result = result || this.instantiate(datum, isClass);
        
        for (var property in datum) {
            if (property !== TYPE_FIELD && datum.hasOwnProperty(property)) {
                var value = this.make(datum[property]);
                if (isClass) {
                    this._defineProperty(result.prototype, property, value);
                } else {
                    this._defineProperty(result, property, value);
                }
            }
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
    instantiate : function(datum, isClass) {
        return this._instantiateFromType(datum[TYPE_FIELD], isClass);
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
    _instantiateFromType : function(type, isClass) {
        type = type || Object; 

        if (typeof(type) === 'string') {
            var resolver = this._typeResolver;
            if (resolver) {
                var typeName = type;
                type = resolver(typeName);
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
            return new type();
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
        obj[property] = value;
    },

    /***************************************************************************
     * _cloneObject
     * 
     * @param {Object} obj 
     * @param {Object} result 
     */
    _cloneObject : function(obj, result) {
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
function o(datum) { 
    return maker.make(datum);
};

function oo(datum) { 
    return maker.make(datum, true);
};

// exports
if (typeof exports != "undefined") {
    exports.Maker = Maker;
    exports.o = o;
    exports.oo = oo;
}
