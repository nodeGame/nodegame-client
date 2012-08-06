// vim: ts=4 sts=4 sw=4 expandtab
// -- kriskowal Kris Kowal Copyright (C) 2009-2011 MIT License
// -- tlrobinson Tom Robinson Copyright (C) 2009-2010 MIT License (Narwhal Project)
// -- dantman Daniel Friesen Copyright (C) 2010 XXX TODO License or CLA
// -- fschaefer Florian Schäfer Copyright (C) 2010 MIT License
// -- Gozala Irakli Gozalishvili Copyright (C) 2010 MIT License
// -- kitcambridge Kit Cambridge Copyright (C) 2011 MIT License
// -- kossnocorp Sasha Koss XXX TODO License or CLA
// -- bryanforbes Bryan Forbes XXX TODO License or CLA
// -- killdream Quildreen Motta XXX TODO License or CLA
// -- michaelficarra Michael Ficarra Copyright (C) 2011 3-clause BSD License
// -- sharkbrainguy Gerard Paapu Copyright (C) 2011 MIT License
// -- bbqsrc Brendan Molloy XXX TODO License or CLA
// -- iwyg XXX TODO License or CLA
// -- DomenicDenicola Domenic Denicola XXX TODO License or CLA
// -- xavierm02 Montillet Xavier XXX TODO License or CLA
// -- Raynos Raynos XXX TODO License or CLA
// -- samsonjs Sami Samhuri XXX TODO License or CLA
// -- rwldrn Rick Waldron XXX TODO License or CLA
// -- lexer Alexey Zakharov XXX TODO License or CLA

/*!
    Copyright (c) 2009, 280 North Inc. http://280north.com/
    MIT License. http://github.com/280north/narwhal/blob/master/README.md
*/

// Module systems magic dance
(function (definition) {
    // RequireJS
    if (typeof define == "function") {
        define(definition);
    // CommonJS and <script>
    } else {
        definition();
    }
})(function () {

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * ES5 Draft
 * http://www.ecma-international.org/publications/files/drafts/tc39-2009-050.pdf
 *
 * NOTE: this is a draft, and as such, the URL is subject to change.  If the
 * link is broken, check in the parent directory for the latest TC39 PDF.
 * http://www.ecma-international.org/publications/files/drafts/
 *
 * Previous ES5 Draft
 * http://www.ecma-international.org/publications/files/drafts/tc39-2009-025.pdf
 * This is a broken link to the previous draft of ES5 on which most of the
 * numbered specification references and quotes herein were taken.  Updating
 * these references and quotes to reflect the new document would be a welcome
 * volunteer project.
 *
 * @module
 */

/*whatsupdoc*/

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://www.ecma-international.org/publications/files/drafts/tc39-2009-025.pdf

if (!Function.prototype.bind) {
    Function.prototype.bind = function bind(that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if (typeof target != "function")
            throw new TypeError(); // TODO message
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = slice.call(arguments, 1); // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 9. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 10. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 11. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 12. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        // 13. The [[Scope]] internal property of F is unused and need not
        //   exist.
        var bound = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.

                var F = function(){};
                F.prototype = target.prototype;
                var self = new F;

                var result = target.apply(
                    self,
                    args.concat(slice.call(arguments))
                );
                if (result !== null && Object(result) === result)
                    return result;
                return self;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the list
                //   boundArgs in the same order followed by the same values as
                //   the list ExtraArgs in the same order. 5.  Return the
                //   result of calling the [[Call]] internal method of target
                //   providing boundThis as the this value and providing args
                //   as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.apply(
                    that,
                    args.concat(slice.call(arguments))
                );

            }

        };
        // XXX bound.length is never writable, so don't even try
        //
        // 16. The length own property of F is given attributes as specified in
        //   15.3.5.1.
        // TODO
        // 17. Set the [[Extensible]] internal property of F to true.
        // TODO
        // 18. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Value]]: null,
        //   [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]:
        //   false}, and false.
        // TODO
        // 19. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Value]]: null,
        //   [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]:
        //   false}, and false.
        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property.
        // XXX can't delete it in pure-js.
        return bound;
    };
}

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally.
// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
// us it in defining shortcuts.
var call = Function.prototype.call;
var prototypeOfArray = Array.prototype;
var prototypeOfObject = Object.prototype;
var slice = prototypeOfArray.slice;
var toString = call.bind(prototypeOfObject.toString);
var owns = call.bind(prototypeOfObject.hasOwnProperty);

// If JS engine supports accessors creating shortcuts.
var defineGetter;
var defineSetter;
var lookupGetter;
var lookupSetter;
var supportsAccessors;
if ((supportsAccessors = owns(prototypeOfObject, "__defineGetter__"))) {
    defineGetter = call.bind(prototypeOfObject.__defineGetter__);
    defineSetter = call.bind(prototypeOfObject.__defineSetter__);
    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
}

//
// Array
// =====
//

// ES5 15.4.3.2
if (!Array.isArray) {
    Array.isArray = function isArray(obj) {
        return toString(obj) == "[object Array]";
    };
}

// The IsCallable() check in the Array functions
// has been replaced with a strict check on the
// internal class of the object to trap cases where
// the provided function was actually a regular
// expression literal, which in V8 and
// JavaScriptCore is a typeof "function".  Only in
// V8 are regular expression literals permitted as
// reduce parameters, so it is desirable in the
// general case for the shim to match the more
// strict and common behavior of rejecting regular
// expressions.

// ES5 15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/foreach
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach(fun /*, thisp*/) {
        var self = toObject(this),
            thisp = arguments[1],
            i = 0,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (toString(fun) != "[object Function]") {
            throw new TypeError(); // TODO message
        }

        while (i < length) {
            if (i in self) {
                // Invoke the callback function with call, passing arguments:
                // context, property value, property key, thisArg object context
                fun.call(thisp, self[i], i, self);
            }
            i++;
        }
    };
}

// ES5 15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
if (!Array.prototype.map) {
    Array.prototype.map = function map(fun /*, thisp*/) {
        var self = toObject(this),
            length = self.length >>> 0,
            result = Array(length),
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (toString(fun) != "[object Function]") {
            throw new TypeError(); // TODO message
        }

        for (var i = 0; i < length; i++) {
            if (i in self)
                result[i] = fun.call(thisp, self[i], i, self);
        }
        return result;
    };
}

// ES5 15.4.4.20
if (!Array.prototype.filter) {
    Array.prototype.filter = function filter(fun /*, thisp */) {
        var self = toObject(this),
            length = self.length >>> 0,
            result = [],
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (toString(fun) != "[object Function]") {
            throw new TypeError(); // TODO message
        }

        for (var i = 0; i < length; i++) {
            if (i in self && fun.call(thisp, self[i], i, self))
                result.push(self[i]);
        }
        return result;
    };
}

// ES5 15.4.4.16
if (!Array.prototype.every) {
    Array.prototype.every = function every(fun /*, thisp */) {
        var self = toObject(this),
            length = self.length >>> 0,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (toString(fun) != "[object Function]") {
            throw new TypeError(); // TODO message
        }

        for (var i = 0; i < length; i++) {
            if (i in self && !fun.call(thisp, self[i], i, self))
                return false;
        }
        return true;
    };
}

// ES5 15.4.4.17
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
if (!Array.prototype.some) {
    Array.prototype.some = function some(fun /*, thisp */) {
        var self = toObject(this),
            length = self.length >>> 0,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (toString(fun) != "[object Function]") {
            throw new TypeError(); // TODO message
        }

        for (var i = 0; i < length; i++) {
            if (i in self && fun.call(thisp, self[i], i, self))
                return true;
        }
        return false;
    };
}

// ES5 15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function reduce(fun /*, initial*/) {
        var self = toObject(this),
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (toString(fun) != "[object Function]") {
            throw new TypeError(); // TODO message
        }

        // no value to return if no initial value and an empty array
        if (!length && arguments.length == 1)
            throw new TypeError(); // TODO message

        var i = 0;
        var result;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= length)
                    throw new TypeError(); // TODO message
            } while (true);
        }

        for (; i < length; i++) {
            if (i in self)
                result = fun.call(void 0, result, self[i], i, self);
        }

        return result;
    };
}

// ES5 15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function reduceRight(fun /*, initial*/) {
        var self = toObject(this),
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (toString(fun) != "[object Function]") {
            throw new TypeError(); // TODO message
        }

        // no value to return if no initial value, empty array
        if (!length && arguments.length == 1)
            throw new TypeError(); // TODO message

        var result, i = length - 1;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0)
                    throw new TypeError(); // TODO message
            } while (true);
        }

        do {
            if (i in this)
                result = fun.call(void 0, result, self[i], i, self);
        } while (i--);

        return result;
    };
}

// ES5 15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function indexOf(sought /*, fromIndex */ ) {
        var self = toObject(this),
            length = self.length >>> 0;

        if (!length)
            return -1;

        var i = 0;
        if (arguments.length > 1)
            i = toInteger(arguments[1]);

        // handle negative indices
        i = i >= 0 ? i : length - Math.abs(i);
        for (; i < length; i++) {
            if (i in self && self[i] === sought) {
                return i;
            }
        }
        return -1;
    };
}

// ES5 15.4.4.15
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function lastIndexOf(sought /*, fromIndex */) {
        var self = toObject(this),
            length = self.length >>> 0;

        if (!length)
            return -1;
        var i = length - 1;
        if (arguments.length > 1)
            i = toInteger(arguments[1]);
        // handle negative indices
        i = i >= 0 ? i : length - Math.abs(i);
        for (; i >= 0; i--) {
            if (i in self && sought === self[i])
                return i;
        }
        return -1;
    };
}

//
// Object
// ======
//

// ES5 15.2.3.2
if (!Object.getPrototypeOf) {
    // https://github.com/kriskowal/es5-shim/issues#issue/2
    // http://ejohn.org/blog/objectgetprototypeof/
    // recommended by fschaefer on github
    Object.getPrototypeOf = function getPrototypeOf(object) {
        return object.__proto__ || (
            object.constructor ?
            object.constructor.prototype :
            prototypeOfObject
        );
    };
}

// ES5 15.2.3.3
if (!Object.getOwnPropertyDescriptor) {
    var ERR_NON_OBJECT = "Object.getOwnPropertyDescriptor called on a " +
                         "non-object: ";
    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
        if ((typeof object != "object" && typeof object != "function") || object === null)
            throw new TypeError(ERR_NON_OBJECT + object);
        // If object does not owns property return undefined immediately.
        if (!owns(object, property))
            return;

        var descriptor, getter, setter;

        // If object has a property then it's for sure both `enumerable` and
        // `configurable`.
        descriptor =  { enumerable: true, configurable: true };

        // If JS engine supports accessor properties then property may be a
        // getter or setter.
        if (supportsAccessors) {
            // Unfortunately `__lookupGetter__` will return a getter even
            // if object has own non getter property along with a same named
            // inherited getter. To avoid misbehavior we temporary remove
            // `__proto__` so that `__lookupGetter__` will return getter only
            // if it's owned by an object.
            var prototype = object.__proto__;
            object.__proto__ = prototypeOfObject;

            var getter = lookupGetter(object, property);
            var setter = lookupSetter(object, property);

            // Once we have getter and setter we can put values back.
            object.__proto__ = prototype;

            if (getter || setter) {
                if (getter) descriptor.get = getter;
                if (setter) descriptor.set = setter;

                // If it was accessor property we're done and return here
                // in order to avoid adding `value` to the descriptor.
                return descriptor;
            }
        }

        // If we got this far we know that object has an own property that is
        // not an accessor so we set it as a value and return descriptor.
        descriptor.value = object[property];
        return descriptor;
    };
}

// ES5 15.2.3.4
if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
        return Object.keys(object);
    };
}

// ES5 15.2.3.5
if (!Object.create) {
    Object.create = function create(prototype, properties) {
        var object;
        if (prototype === null) {
            object = { "__proto__": null };
        } else {
            if (typeof prototype != "object")
                throw new TypeError("typeof prototype["+(typeof prototype)+"] != 'object'");
            var Type = function () {};
            Type.prototype = prototype;
            object = new Type();
            // IE has no built-in implementation of `Object.getPrototypeOf`
            // neither `__proto__`, but this manually setting `__proto__` will
            // guarantee that `Object.getPrototypeOf` will work as expected with
            // objects created using `Object.create`
            object.__proto__ = prototype;
        }
        if (properties !== void 0)
            Object.defineProperties(object, properties);
        return object;
    };
}

// ES5 15.2.3.6

// Patch for WebKit and IE8 standard mode
// Designed by hax <hax.github.com>
// related issue: https://github.com/kriskowal/es5-shim/issues#issue/5
// IE8 Reference:
//     http://msdn.microsoft.com/en-us/library/dd282900.aspx
//     http://msdn.microsoft.com/en-us/library/dd229916.aspx
// WebKit Bugs:
//     https://bugs.webkit.org/show_bug.cgi?id=36423

function doesDefinePropertyWork(object) {
    try {
        Object.defineProperty(object, "sentinel", {});
        return "sentinel" in object;
    } catch (exception) {
        // returns falsy
    }
}

// check whether defineProperty works if it's given. Otherwise,
// shim partially.
if (Object.defineProperty) {
    var definePropertyWorksOnObject = doesDefinePropertyWork({});
    var definePropertyWorksOnDom = typeof document == "undefined" ||
        doesDefinePropertyWork(document.createElement("div"));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
        var definePropertyFallback = Object.defineProperty;
    }
}

if (!Object.defineProperty || definePropertyFallback) {
    var ERR_NON_OBJECT_DESCRIPTOR = "Property description must be an object: ";
    var ERR_NON_OBJECT_TARGET = "Object.defineProperty called on non-object: "
    var ERR_ACCESSORS_NOT_SUPPORTED = "getters & setters can not be defined " +
                                      "on this javascript engine";

    Object.defineProperty = function defineProperty(object, property, descriptor) {
        if ((typeof object != "object" && typeof object != "function") || object === null)
            throw new TypeError(ERR_NON_OBJECT_TARGET + object);
        if ((typeof descriptor != "object" && typeof descriptor != "function") || descriptor === null)
            throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);

        // make a valiant attempt to use the real defineProperty
        // for I8's DOM elements.
        if (definePropertyFallback) {
            try {
                return definePropertyFallback.call(Object, object, property, descriptor);
            } catch (exception) {
                // try the shim if the real one doesn't work
            }
        }

        // If it's a data property.
        if (owns(descriptor, "value")) {
            // fail silently if "writable", "enumerable", or "configurable"
            // are requested but not supported
            /*
            // alternate approach:
            if ( // can't implement these features; allow false but not true
                !(owns(descriptor, "writable") ? descriptor.writable : true) ||
                !(owns(descriptor, "enumerable") ? descriptor.enumerable : true) ||
                !(owns(descriptor, "configurable") ? descriptor.configurable : true)
            )
                throw new RangeError(
                    "This implementation of Object.defineProperty does not " +
                    "support configurable, enumerable, or writable."
                );
            */

            if (supportsAccessors && (lookupGetter(object, property) ||
                                      lookupSetter(object, property)))
            {
                // As accessors are supported only on engines implementing
                // `__proto__` we can safely override `__proto__` while defining
                // a property to make sure that we don't hit an inherited
                // accessor.
                var prototype = object.__proto__;
                object.__proto__ = prototypeOfObject;
                // Deleting a property anyway since getter / setter may be
                // defined on object itself.
                delete object[property];
                object[property] = descriptor.value;
                // Setting original `__proto__` back now.
                object.__proto__ = prototype;
            } else {
                object[property] = descriptor.value;
            }
        } else {
            if (!supportsAccessors)
                throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
            // If we got that far then getters and setters can be defined !!
            if (owns(descriptor, "get"))
                defineGetter(object, property, descriptor.get);
            if (owns(descriptor, "set"))
                defineSetter(object, property, descriptor.set);
        }

        return object;
    };
}

// ES5 15.2.3.7
if (!Object.defineProperties) {
    Object.defineProperties = function defineProperties(object, properties) {
        for (var property in properties) {
            if (owns(properties, property))
                Object.defineProperty(object, property, properties[property]);
        }
        return object;
    };
}

// ES5 15.2.3.8
if (!Object.seal) {
    Object.seal = function seal(object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.9
if (!Object.freeze) {
    Object.freeze = function freeze(object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// detect a Rhino bug and patch it
try {
    Object.freeze(function () {});
} catch (exception) {
    Object.freeze = (function freeze(freezeObject) {
        return function freeze(object) {
            if (typeof object == "function") {
                return object;
            } else {
                return freezeObject(object);
            }
        };
    })(Object.freeze);
}

// ES5 15.2.3.10
if (!Object.preventExtensions) {
    Object.preventExtensions = function preventExtensions(object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.11
if (!Object.isSealed) {
    Object.isSealed = function isSealed(object) {
        return false;
    };
}

// ES5 15.2.3.12
if (!Object.isFrozen) {
    Object.isFrozen = function isFrozen(object) {
        return false;
    };
}

// ES5 15.2.3.13
if (!Object.isExtensible) {
    Object.isExtensible = function isExtensible(object) {
        // 1. If Type(O) is not Object throw a TypeError exception.
        if (Object(object) === object) {
            throw new TypeError(); // TODO message
        }
        // 2. Return the Boolean value of the [[Extensible]] internal property of O.
        var name = '';
        while (owns(object, name)) {
            name += '?';
        }
        object[name] = true;
        var returnValue = owns(object, name);
        delete object[name];
        return returnValue;
    };
}

// ES5 15.2.3.14
// http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
if (!Object.keys) {

    var hasDontEnumBug = true,
        dontEnums = [
            "toString",
            "toLocaleString",
            "valueOf",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "constructor"
        ],
        dontEnumsLength = dontEnums.length;

    for (var key in {"toString": null})
        hasDontEnumBug = false;

    Object.keys = function keys(object) {

        if ((typeof object != "object" && typeof object != "function") || object === null)
            throw new TypeError("Object.keys called on a non-object");

        var keys = [];
        for (var name in object) {
            if (owns(object, name)) {
                keys.push(name);
            }
        }

        if (hasDontEnumBug) {
            for (var i = 0, ii = dontEnumsLength; i < ii; i++) {
                var dontEnum = dontEnums[i];
                if (owns(object, dontEnum)) {
                    keys.push(dontEnum);
                }
            }
        }

        return keys;
    };

}

//
// Date
// ====
//

// ES5 15.9.5.43
// Format a Date object as a string according to a simplified subset of the ISO 8601
// standard as defined in 15.9.1.15.
if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function toISOString() {
        var result, length, value;
        if (!isFinite(this))
            throw new RangeError;

        // the date time string format is specified in 15.9.1.15.
        result = [this.getUTCFullYear(), this.getUTCMonth() + 1, this.getUTCDate(),
            this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()];

        length = result.length;
        while (length--) {
            value = result[length];
            // pad months, days, hours, minutes, and seconds to have two digits.
            if (value < 10)
                result[length] = "0" + value;
        }
        // pad milliseconds to have three digits.
        return result.slice(0, 3).join("-") + "T" + result.slice(3).join(":") + "." +
            ("000" + this.getUTCMilliseconds()).slice(-3) + "Z";
    }
}

// ES5 15.9.4.4
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

// ES5 15.9.5.44
if (!Date.prototype.toJSON) {
    Date.prototype.toJSON = function toJSON(key) {
        // This function provides a String representation of a Date object for
        // use by JSON.stringify (15.12.3). When the toJSON method is called
        // with argument key, the following steps are taken:

        // 1.  Let O be the result of calling ToObject, giving it the this
        // value as its argument.
        // 2. Let tv be ToPrimitive(O, hint Number).
        // 3. If tv is a Number and is not finite, return null.
        // XXX
        // 4. Let toISO be the result of calling the [[Get]] internal method of
        // O with argument "toISOString".
        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
        if (typeof this.toISOString != "function")
            throw new TypeError(); // TODO message
        // 6. Return the result of calling the [[Call]] internal method of
        // toISO with O as the this value and an empty argument list.
        return this.toISOString();

        // NOTE 1 The argument is ignored.

        // NOTE 2 The toJSON function is intentionally generic; it does not
        // require that its this value be a Date object. Therefore, it can be
        // transferred to other kinds of objects for use as a method. However,
        // it does require that any such object have a toISOString method. An
        // object is free to use the argument key to filter its
        // stringification.
    };
}

// 15.9.4.2 Date.parse (string)
// 15.9.1.15 Date Time String Format
// Date.parse
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
if (isNaN(Date.parse("2011-06-15T21:40:05+06:00"))) {
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    Date = (function(NativeDate) {

        // Date.length === 7
        var Date = function Date(Y, M, D, h, m, s, ms) {
            var length = arguments.length;
            if (this instanceof NativeDate) {
                var date = length == 1 && String(Y) === Y ? // isString(Y)
                    // We explicitly pass it through parse:
                    new NativeDate(Date.parse(Y)) :
                    // We have to manually make calls depending on argument
                    // length here
                    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
                    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
                    length >= 4 ? new NativeDate(Y, M, D, h) :
                    length >= 3 ? new NativeDate(Y, M, D) :
                    length >= 2 ? new NativeDate(Y, M) :
                    length >= 1 ? new NativeDate(Y) :
                                  new NativeDate();
                // Prevent mixups with unfixed Date object
                date.constructor = Date;
                return date;
            }
            return NativeDate.apply(this, arguments);
        };

        // 15.9.1.15 Date Time String Format. This pattern does not implement
        // extended years (15.9.1.15.1), as `Date.UTC` cannot parse them.
        var isoDateExpression = new RegExp("^" +
            "(\\d{4})" + // four-digit year capture
            "(?:-(\\d{2})" + // optional month capture
            "(?:-(\\d{2})" + // optional day capture
            "(?:" + // capture hours:minutes:seconds.milliseconds
                "T(\\d{2})" + // hours capture
                ":(\\d{2})" + // minutes capture
                "(?:" + // optional :seconds.milliseconds
                    ":(\\d{2})" + // seconds capture
                    "(?:\\.(\\d{3}))?" + // milliseconds capture
                ")?" +
            "(?:" + // capture UTC offset component
                "Z|" + // UTC capture
                "(?:" + // offset specifier +/-hours:minutes
                    "([-+])" + // sign capture
                    "(\\d{2})" + // hours offset capture
                    ":(\\d{2})" + // minutes offset capture
                ")" +
            ")?)?)?)?" +
        "$");

        // Copy any custom methods a 3rd party library may have added
        for (var key in NativeDate)
            Date[key] = NativeDate[key];

        // Copy "native" methods explicitly; they may be non-enumerable
        Date.now = NativeDate.now;
        Date.UTC = NativeDate.UTC;
        Date.prototype = NativeDate.prototype;
        Date.prototype.constructor = Date;

        // Upgrade Date.parse to handle simplified ISO 8601 strings
        Date.parse = function parse(string) {
            var match = isoDateExpression.exec(string);
            if (match) {
                match.shift(); // kill match[0], the full match
                // parse months, days, hours, minutes, seconds, and milliseconds
                for (var i = 1; i < 7; i++) {
                    // provide default values if necessary
                    match[i] = +(match[i] || (i < 3 ? 1 : 0));
                    // match[1] is the month. Months are 0-11 in JavaScript
                    // `Date` objects, but 1-12 in ISO notation, so we
                    // decrement.
                    if (i == 1)
                        match[i]--;
                }

                // parse the UTC offset component
                var minuteOffset = +match.pop(), hourOffset = +match.pop(), sign = match.pop();

                // compute the explicit time zone offset if specified
                var offset = 0;
                if (sign) {
                    // detect invalid offsets and return early
                    if (hourOffset > 23 || minuteOffset > 59)
                        return NaN;

                    // express the provided time zone offset in minutes. The offset is
                    // negative for time zones west of UTC; positive otherwise.
                    offset = (hourOffset * 60 + minuteOffset) * 6e4 * (sign == "+" ? -1 : 1);
                }

                // compute a new UTC date value, accounting for the optional offset
                return NativeDate.UTC.apply(this, match) + offset;
            }
            return NativeDate.parse.apply(this, arguments);
        };

        return Date;
    })(Date);
}

//
// String
// ======
//

// ES5 15.5.4.20
var ws = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003" +
    "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028" +
    "\u2029\uFEFF";
if (!String.prototype.trim || ws.trim()) {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    // http://perfectionkills.com/whitespace-deviations/
    ws = "[" + ws + "]";
    var trimBeginRegexp = new RegExp("^" + ws + ws + "*"),
        trimEndRegexp = new RegExp(ws + ws + "*$");
    String.prototype.trim = function trim() {
        return String(this).replace(trimBeginRegexp, "").replace(trimEndRegexp, "");
    };
}

//
// Util
// ======
//

// http://jsperf.com/to-integer
var toInteger = function (n) {
    n = +n;
    if (n !== n) // isNaN
        n = -1;
    else if (n !== 0 && n !== (1/0) && n !== -(1/0))
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    return n;
};

var prepareString = "a"[0] != "a",
    // ES5 9.9
    toObject = function (o) {
        if (o == null) { // this matches both null and undefined
            throw new TypeError(); // TODO message
        }
        // If the implementation doesn't support by-index access of
        // string characters (ex. IE < 7), split the string
        if (prepareString && typeof o == "string" && o) {
            return o.split("");
        }
        return Object(o);
    };
});

// cycle.js
// 2011-08-24

/*jslint evil: true, regexp: true */

/*members $ref, apply, call, decycle, hasOwnProperty, length, prototype, push,
    retrocycle, stringify, test, toString
*/

if (typeof JSON.decycle !== 'function') {
    JSON.decycle = function decycle(object) {
        'use strict';

// Make a deep copy of an object or array, assuring that there is at most
// one instance of each object or array in the resulting structure. The
// duplicate references (which might be forming cycles) are replaced with
// an object of the form
//      {$ref: PATH}
// where the PATH is a JSONPath string that locates the first occurance.
// So,
//      var a = [];
//      a[0] = a;
//      return JSON.stringify(JSON.decycle(a));
// produces the string '[{"$ref":"$"}]'.

// JSONPath is used to locate the unique object. $ indicates the top level of
// the object or array. [NUMBER] or [STRING] indicates a child member or
// property.

        var objects = [],   // Keep a reference to each unique object or array
            paths = [];     // Keep the path to each unique object or array

        return (function derez(value, path) {

// The derez recurses through the object, producing the deep copy.

            var i,          // The loop counter
                name,       // Property name
                nu;         // The new object or array

            switch (typeof value) {
            case 'object':

// typeof null === 'object', so get out if this value is not really an object.

                if (!value) {
                    return null;
                }

// If the value is an object or array, look to see if we have already
// encountered it. If so, return a $ref/path object. This is a hard way,
// linear search that will get slower as the number of unique objects grows.

                for (i = 0; i < objects.length; i += 1) {
                    if (objects[i] === value) {
                        return {$ref: paths[i]};
                    }
                }

// Otherwise, accumulate the unique value and its path.

                objects.push(value);
                paths.push(path);

// If it is an array, replicate the array.

                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    nu = [];
                    for (i = 0; i < value.length; i += 1) {
                        nu[i] = derez(value[i], path + '[' + i + ']');
                    }
                } else {

// If it is an object, replicate the object.

                    nu = {};
                    for (name in value) {
                        if (Object.prototype.hasOwnProperty.call(value, name)) {
                            nu[name] = derez(value[name],
                                path + '[' + JSON.stringify(name) + ']');
                        }
                    }
                }
                return nu;
            case 'number':
            case 'string':
            case 'boolean':
                return value;
            }
        }(object, '$'));
    };
}


if (typeof JSON.retrocycle !== 'function') {
    JSON.retrocycle = function retrocycle($) {
        'use strict';

// Restore an object that was reduced by decycle. Members whose values are
// objects of the form
//      {$ref: PATH}
// are replaced with references to the value found by the PATH. This will
// restore cycles. The object will be mutated.

// The eval function is used to locate the values described by a PATH. The
// root object is kept in a $ variable. A regular expression is used to
// assure that the PATH is extremely well formed. The regexp contains nested
// * quantifiers. That has been known to have extremely bad performance
// problems on some browsers for very long strings. A PATH is expected to be
// reasonably short. A PATH is allowed to belong to a very restricted subset of
// Goessner's JSONPath.

// So,
//      var s = '[{"$ref":"$"}]';
//      return JSON.retrocycle(JSON.parse(s));
// produces an array containing a single element which is the array itself.

        var px =
            /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;

        (function rez(value) {

// The rez function walks recursively through the object looking for $ref
// properties. When it finds one that has a value that is a path, then it
// replaces the $ref object with a reference to the value that is found by
// the path.

            var i, item, name, path;

            if (value && typeof value === 'object') {
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    for (i = 0; i < value.length; i += 1) {
                        item = value[i];
                        if (item && typeof item === 'object') {
                            path = item.$ref;
                            if (typeof path === 'string' && px.test(path)) {
                                value[i] = eval(path);
                            } else {
                                rez(item);
                            }
                        }
                    }
                } else {
                    for (name in value) {
                        if (typeof value[name] === 'object') {
                            item = value[name];
                            if (item) {
                                path = item.$ref;
                                if (typeof path === 'string' && px.test(path)) {
                                    value[name] = eval(path);
                                } else {
                                    rez(item);
                                }
                            }
                        }
                    }
                }
            }
        }($));
        return $;
    };
}
/**
 * # Shelf.JS 
 * 
 * Persistent Client-Side Storage @VERSION
 * 
 * Copyright 2012 Stefano Balietti
 * GPL licenses.
 * 
 * ---
 * 
 */
(function(wall){

	
	var version = '0.3';
	
	var store = wall.store = function(key, value, options, type) {
		var type = store.type;
		if (options && options.type && options.type in store.types) {
			type = options.type;
		}
		
		if (store.verbosity) {
			store.log('I am using storage type ' + type);
		}
		
		return store.types[type](key, value, options || {});
	};
	
	// Adding functions and properties to store
	///////////////////////////////////////////
	store.verbosity = 0;
	store.types = {};
	store.type = null;
	store.addType = function (type, storage) {
		if (!store.type) {
			store.type = type;
		}
	
		store.types[type] = storage;
		store[type] = function (key, value, options) {
			options = options || {};
			options.type = type;
			return store(key, value, options);
		};
	};
	store.error = function() {
		return "shelf quota exceeded"; 
	};
	store.log = function(text) {
		console.log('Shelf v.' + version + ': ' + text);
	};
	
	Object.defineProperty(store, 'persistent', {
    	set: function(){},
    	get: function(){
    		// If we have only memory type enabled 
    		return (store.types.length < 2) ? false : true;
    	},
    	configurable: false,
	});
	
	store.decycle = function(o) {
    	if (JSON && JSON.decycle && 'function' === typeof JSON.decycle) {
			o = JSON.decycle(o);
		}
    	return o;
    };
	    
    store.retrocycle = function(o) {
    	if (JSON && JSON.retrocycle && 'function' === typeof JSON.retrocycle) {
			o = JSON.retrocycle(o);
		}
    	return o;
    };
	
    store.stringify = function(o) {
    	if (!JSON || !JSON.stringify || 'function' !== typeof JSON.stringify) {
    		throw new Error('JSON.stringify not found. Received non-string value and could not serialize.');
		}
    	
    	o = store.decycle(o);
		return JSON.stringify(o);
    };
    
    store.parse = function(o) {
    	if ('undefined' === typeof o) return undefined;
    	if (JSON && JSON.parse && 'function' === typeof JSON.parse) {
    		try {
    			o = JSON.parse(o);
    		}
    		catch (e) {
    			store.log()
    		}
		}
    	
    	o = store.retrocycle(o);
    	return o;
    };
    
	
	
	var rprefix = /^__shelf__/;
	function createFromStorageInterface(storageType, storage) {
		store.addType(storageType, function(key, value, options) {
			var storedValue, parsed, i, remove,
				ret = value,
				now = (new Date()).getTime();
	
			if (!key) {
				ret = {};
				remove = [];
				i = 0;
				try {
					// accessing the length property works around a localStorage bug
					// in Firefox 4.0 where the keys don't update cross-page
					// we assign to key just to avoid Closure Compiler from removing
					// the access as "useless code"
					// https://bugzilla.mozilla.org/show_bug.cgi?id=662511
					key = storage.length;
	
					while (key = storage.key(i++)) {
						if (rprefix.test(key)) {
							parsed = store.parse(storage.getItem(key));
							if (parsed.expires && parsed.expires <= now) {
								remove.push(key);
							} else {
								ret[key.replace(rprefix, "")] = parsed.data;
							}
						}
					}
					while (key = remove.pop()) {
						storage.removeItem(key);
					}
				} catch (error) {}
				return ret;
			}
	
			// protect against name collisions with direct storage
			key = "__shelf__" + key;
	

			if (value === undefined) {
				storedValue = storage.getItem(key);
				parsed = storedValue ? store.parse(storedValue) : { expires: -1 };
				if (parsed.expires && parsed.expires <= now) {
					storage.removeItem(key);
				} else {
					return parsed.data;
				}
			} else {
				if (value === null) {
					storage.removeItem(key);
				} else {
					parsed = store.stringify({
						data: value,
						expires: options.expires ? now + options.expires : null,
					});
					try {
						storage.setItem(key, parsed);
					// quota exceeded
					} catch(error) {
						// expire old data and try again
						store[storageType]();
						try {
							storage.setItem(key, parsed);
						} catch(error) {
							throw store.error();
						}
					}
				}
			}
	
			return ret;
		});
	}
	
	// ## localStorage + sessionStorage
	// IE 8+, Firefox 3.5+, Safari 4+, Chrome 4+, Opera 10.5+, iPhone 2+, Android 2+
	for (var webStorageType in { localStorage: 1, sessionStorage: 1, }) {
		// try/catch for file protocol in Firefox
		try {
			if (window[webStorageType].getItem) {
				createFromStorageInterface(webStorageType, window[webStorageType]);
			}
		} catch(e) {}
	}
	
	// ## globalStorage
	// non-standard: Firefox 2+
	// https://developer.mozilla.org/en/dom/storage#globalStorage
	if (!store.types.localStorage && window.globalStorage) {
		// try/catch for file protocol in Firefox
		try {
			createFromStorageInterface("globalStorage",
				window.globalStorage[window.location.hostname]);
			// Firefox 2.0 and 3.0 have sessionStorage and globalStorage
			// make sure we default to globalStorage
			// but don't default to globalStorage in 3.5+ which also has localStorage
			if (store.type === "sessionStorage") {
				store.type = "globalStorage";
			}
		} catch(e) {}
	}
	
	// ## userData
	// non-standard: IE 5+
	// http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
	(function() {
		// IE 9 has quirks in userData that are a huge pain
		// rather than finding a way to detect these quirks
		// we just don't register userData if we have localStorage
		if (store.types.localStorage) {
			return;
		}
	
		// append to html instead of body so we can do this from the head
		var div = document.createElement("div"),
			attrKey = "shelf";
		div.style.display = "none";
		document.getElementsByTagName("head")[0].appendChild(div);
	
		// we can't feature detect userData support
		// so just try and see if it fails
		// surprisingly, even just adding the behavior isn't enough for a failure
		// so we need to load the data as well
		try {
			div.addBehavior("#default#userdata");
			div.load(attrKey);
		} catch(e) {
			div.parentNode.removeChild(div);
			return;
		}
	
		store.addType("userData", function(key, value, options) {
			div.load(attrKey);
			var attr, parsed, prevValue, i, remove,
				ret = value,
				now = (new Date()).getTime();
	
			if (!key) {
				ret = {};
				remove = [];
				i = 0;
				while (attr = div.XMLDocument.documentElement.attributes[i++]) {
					parsed = store.parse(attr.value);
					if (parsed.expires && parsed.expires <= now) {
						remove.push(attr.name);
					} else {
						ret[attr.name] = parsed.data;
					}
				}
				while (key = remove.pop()) {
					div.removeAttribute(key);
				}
				div.save(attrKey);
				return ret;
			}
	
			// convert invalid characters to dashes
			// http://www.w3.org/TR/REC-xml/#NT-Name
			// simplified to assume the starting character is valid
			// also removed colon as it is invalid in HTML attribute names
			key = key.replace(/[^-._0-9A-Za-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u37f-\u1fff\u200c-\u200d\u203f\u2040\u2070-\u218f]/g, "-");
			// adjust invalid starting character to deal with our simplified sanitization
			key = key.replace(/^-/, "_-");
	
			if (value === undefined) {
				attr = div.getAttribute(key);
				parsed = attr ? store.parse(attr) : { expires: -1 };
				if (parsed.expires && parsed.expires <= now) {
					div.removeAttribute(key);
				} else {
					return parsed.data;
				}
			} else {
				if (value === null) {
					div.removeAttribute(key);
				} else {
					// we need to get the previous value in case we need to rollback
					prevValue = div.getAttribute(key);
					parsed = store.stringify({
						data: value,
						expires: (options.expires ? (now + options.expires) : null)
					});
					div.setAttribute(key, parsed);
				}
			}
	
			try {
				div.save(attrKey);
			// quota exceeded
			} catch (error) {
				// roll the value back to the previous value
				if (prevValue === null) {
					div.removeAttribute(key);
				} else {
					div.setAttribute(key, prevValue);
				}
	
				// expire old data and try again
				store.userData();
				try {
					div.setAttribute(key, parsed);
					div.save(attrKey);
				} catch (error) {
					// roll the value back to the previous value
					if (prevValue === null) {
						div.removeAttribute(key);
					} else {
						div.setAttribute(key, prevValue);
					}
					throw store.error();
				}
			}
			return ret;
		});
	}());
	
	
	// ## Cookie storage
	(function() {
		
		var cookie = (function() {
			
			var resolveOptions, assembleOptionsString, parseCookies, constructor, defaultOptions = {
				expiresAt: null,
				path: '/',
				domain:  null,
				secure: false,
			};
			
			/**
			* resolveOptions - receive an options object and ensure all options are present and valid, replacing with defaults where necessary
			*
			* @access private
			* @static
			* @parameter Object options - optional options to start with
			* @return Object complete and valid options object
			*/
			resolveOptions = function(options){
				
				var returnValue, expireDate;
	
				if(typeof options !== 'object' || options === null){
					returnValue = defaultOptions;
				}
				else {
					returnValue = {
						expiresAt: defaultOptions.expiresAt,
						path: defaultOptions.path,
						domain: defaultOptions.domain,
						secure: defaultOptions.secure,
					};
	
					if (typeof options.expiresAt === 'object' && options.expiresAt instanceof Date) {
						returnValue.expiresAt = options.expiresAt;
					}
					else if (typeof options.hoursToLive === 'number' && options.hoursToLive !== 0){
						expireDate = new Date();
						expireDate.setTime(expireDate.getTime() + (options.hoursToLive * 60 * 60 * 1000));
						returnValue.expiresAt = expireDate;
					}
	
					if (typeof options.path === 'string' && options.path !== '') {
						returnValue.path = options.path;
					}
	
					if (typeof options.domain === 'string' && options.domain !== '') {
						returnValue.domain = options.domain;
					}
	
					if (options.secure === true) {
						returnValue.secure = options.secure;
					}
				}
	
				return returnValue;
			};
			
			/**
			* assembleOptionsString - analyze options and assemble appropriate string for setting a cookie with those options
			*
			* @access private
			* @static
			* @parameter options OBJECT - optional options to start with
			* @return STRING - complete and valid cookie setting options
			*/
			assembleOptionsString = function (options) {
				options = resolveOptions(options);
	
				return (
					(typeof options.expiresAt === 'object' && options.expiresAt instanceof Date ? '; expires=' + options.expiresAt.toGMTString() : '') +
					'; path=' + options.path +
					(typeof options.domain === 'string' ? '; domain=' + options.domain : '') +
					(options.secure === true ? '; secure' : '')
				);
			};
			
			/**
			* parseCookies - retrieve document.cookie string and break it into a hash with values decoded and unserialized
			*
			* @access private
			* @static
			* @return OBJECT - hash of cookies from document.cookie
			*/
			parseCookies = function() {
				var cookies = {}, i, pair, name, value, separated = document.cookie.split(';'), unparsedValue;
				for(i = 0; i < separated.length; i = i + 1){
					pair = separated[i].split('=');
					name = pair[0].replace(/^\s*/, '').replace(/\s*$/, '');
	
					try {
						value = decodeURIComponent(pair[1]);
					}
					catch(e1) {
						value = pair[1];
					}
	
//					if (JSON && 'object' === typeof JSON && 'function' === typeof JSON.parse) {
//						try {
//							unparsedValue = value;
//							value = JSON.parse(value);
//						}
//						catch (e2) {
//							value = unparsedValue;
//						}
//					}
	
					cookies[name] = store.parse(value);
				}
				return cookies;
			};
	
			constructor = function(){};
	
			
			/**
			 * get - get one, several, or all cookies
			 *
			 * @access public
			 * @paramater Mixed cookieName - String:name of single cookie; Array:list of multiple cookie names; Void (no param):if you want all cookies
			 * @return Mixed - Value of cookie as set; Null:if only one cookie is requested and is not found; Object:hash of multiple or all cookies (if multiple or all requested);
			 */
			constructor.prototype.get = function(cookieName) {
				
				var returnValue, item, cookies = parseCookies();
	
				if(typeof cookieName === 'string') {
					returnValue = (typeof cookies[cookieName] !== 'undefined') ? cookies[cookieName] : null;
				}
				else if (typeof cookieName === 'object' && cookieName !== null) {
					returnValue = {};
					for (item in cookieName) {
						if (typeof cookies[cookieName[item]] !== 'undefined') {
							returnValue[cookieName[item]] = cookies[cookieName[item]];
						}
						else {
							returnValue[cookieName[item]] = null;
						}
					}
				}
				else {
					returnValue = cookies;
				}
	
				return returnValue;
			};
			
			/**
			 * filter - get array of cookies whose names match the provided RegExp
			 *
			 * @access public
			 * @paramater Object RegExp - The regular expression to match against cookie names
			 * @return Mixed - Object:hash of cookies whose names match the RegExp
			 */
			constructor.prototype.filter = function (cookieNameRegExp) {
				var cookieName, returnValue = {}, cookies = parseCookies();
	
				if (typeof cookieNameRegExp === 'string') {
					cookieNameRegExp = new RegExp(cookieNameRegExp);
				}
	
				for (cookieName in cookies) {
					if (cookieName.match(cookieNameRegExp)) {
						returnValue[cookieName] = cookies[cookieName];
					}
				}
	
				return returnValue;
			};
			
			/**
			 * set - set or delete a cookie with desired options
			 *
			 * @access public
			 * @paramater String cookieName - name of cookie to set
			 * @paramater Mixed value - Any JS value. If not a string, will be JSON encoded; NULL to delete
			 * @paramater Object options - optional list of cookie options to specify
			 * @return void
			 */
			constructor.prototype.set = function(cookieName, value, options){
				if (typeof options !== 'object' || options === null) {
					options = {};
				}
	
				if (typeof value === 'undefined' || value === null) {
					value = '';
					options.hoursToLive = -8760;
				}
	
				else if (typeof value !== 'string'){
//					if(typeof JSON === 'object' && JSON !== null && typeof store.stringify === 'function') {
//						
//						value = JSON.stringify(value);
//					}
//					else {
//						throw new Error('cookies.set() received non-string value and could not serialize.');
//					}
					
					value = store.stringify(value);
				}
	
	
				var optionsString = assembleOptionsString(options);
	
				document.cookie = cookieName + '=' + encodeURIComponent(value) + optionsString;
			};
			
			/**
			 * del - delete a cookie (domain and path options must match those with which the cookie was set; this is really an alias for set() with parameters simplified for this use)
			 *
			 * @access public
			 * @paramater MIxed cookieName - String name of cookie to delete, or Bool true to delete all
			 * @paramater Object options - optional list of cookie options to specify (path, domain)
			 * @return void
			 */
			constructor.prototype.del = function(cookieName, options) {
				var allCookies = {}, name;
	
				if(typeof options !== 'object' || options === null) {
					options = {};
				}
	
				if(typeof cookieName === 'boolean' && cookieName === true) {
					allCookies = this.get();
				}
				else if(typeof cookieName === 'string') {
					allCookies[cookieName] = true;
				}
	
				for(name in allCookies) {
					if(typeof name === 'string' && name !== '') {
						this.set(name, null, options);
					}
				}
			};
			
			/**
			 * test - test whether the browser is accepting cookies
			 *
			 * @access public
			 * @return Boolean
			 */
			constructor.prototype.test = function() {
				var returnValue = false, testName = 'cT', testValue = 'data';
	
				this.set(testName, testValue);
	
				if(this.get(testName) === testValue) {
					this.del(testName);
					returnValue = true;
				}
	
				return returnValue;
			};
			
			/**
			 * setOptions - set default options for calls to cookie methods
			 *
			 * @access public
			 * @param Object options - list of cookie options to specify
			 * @return void
			 */
			constructor.prototype.setOptions = function(options) {
				if(typeof options !== 'object') {
					options = null;
				}
	
				defaultOptions = resolveOptions(options);
			};
	
			return new constructor();
		})();
		
		// if cookies are supported by the browser
		if (cookie.test()) {
		
			store.addType("cookie", function (key, value, options) {
				
				if ('undefined' === typeof key) {
					return cookie.get();
				}
		
				if ('undefined' === typeof value) {
					return cookie.get(key);
				}
				
				// Set to NULL means delete
				if (value === null) {
					cookie.del(key);
					return null;
				}
		
				return cookie.set(key, value, options);		
			});
		}
	}());
	
	// ## In-memory storage
	// ### fallback for all browsers to enable the API even if we can't persist data
	(function() {
		
		var memory = {},
			timeout = {};
		
		function copy(obj) {
			return store.parse(store.stringify(obj));
		}
	
		store.addType("volatile", function(key, value, options) {
			
			if (!key) {
				return copy(memory);
			}
	
			if (value === undefined) {
				return copy(memory[key]);
			}
	
			if (timeout[key]) {
				clearTimeout(timeout[key]);
				delete timeout[key];
			}
	
			if (value === null) {
				delete memory[key];
				return null;
			}
	
			memory[key] = value;
			if (options.expires) {
				timeout[key] = setTimeout(function() {
					delete memory[key];
					delete timeout[key];
				}, options.expires);
			}
	
			return value;
		});
	}());

}(this));

(function (exports) {
    
    /**
     * JSUS: JavaScript UtilS. 
     * Copyright(c) 2012 Stefano Balietti
     * MIT Licensed
     * 
     * Collection of general purpose javascript functions. JSUS helps!
     * 
     * JSUS is designed to be modular and easy to extend. 
     * 
     * Just use: 
     * 
     *         JSUS.extend(myClass);
     * 
     * to extend the functionalities of JSUS. All the methods of myClass 
     * are immediately added to JSUS, and a reference to myClass is stored
     * in JSUS._classes.
     * 
     * MyClass can be either of type Object or Function.
     * 
     * JSUS can also extend other objects. Just pass a second parameter:
     * 
     * 
     *         JSUS.extend(myClass, mySecondClass);
     * 
     * and mySecondClass will receive all the methods of myClass. In this case,
     * no reference of myClass is stored.
     * 
     * JSUS come shipped in with a default set of libraries:
     * 
     *         1. OBJ
     *         2. ARRAY
     *         3. TIME
     *         4. EVAL
     *         5. DOM
     *         6. RANDOM
     * 
     * Extra help is supplied inside each library file.
     * 
     */
    var JSUS = exports.JSUS = {};
    
    // Reference to all the extensions
    JSUS._classes = {};
    
    /**
     * Reference to standard out, by default console.log
     * 
     * Overridde to redirect the starndard output of all JSUS functions.
     */
    JSUS.log = function (txt) {
        console.log(txt);
    };
    
    /**
     * Extends JSUS with additional methods and or properties taken 
     * from the object passed as first parameter. 
     * 
     * The first parameter can be an object literal or a function.
     * A reference of the original extending object is stored in 
     * JSUS._classes
     * 
     * If a second parameter is passed, that will be the target of the
     * extension.
     * 
     */
    JSUS.extend = function (additional, target) {        
        if ('object' !== typeof additional && 'function' !== typeof additional) {
            return target;
        }
        
        // If we are extending JSUS, store a reference
        // of the additional object into the hidden
        // JSUS._classes object;
        if ('undefined' === typeof target) {
            var target = target || this;
            if ('function' === typeof additional) {
                var name = additional.toString();
                name = name.substr('function '.length);
                name = name.substr(0, name.indexOf('('));
            }
            // must be object
            else {
                var name = additional.constructor || additional.__proto__.constructor;
            }
            if (name) {
                this._classes[name] = additional;
            }
        }
        
        for (var prop in additional) {
            if (additional.hasOwnProperty(prop)) {
                if (typeof target[prop] !== 'object') {
                    target[prop] = additional[prop];
                } else {
                    JSUS.extend(additional[prop], target[prop]);
                }
            }
        }

        // additional is a class (Function)
        // TODO: this is true also for {}
        if (additional.prototype) {
            JSUS.extend(additional.prototype, target.prototype || target);
        };
        
        return target;
    };
      
    // if node
    if ('object' === typeof module && 'function' === typeof require) {
        require('./lib/obj');
        require('./lib/array');
        require('./lib/time');
        require('./lib/eval');
        require('./lib/dom');
        require('./lib/random');
        require('./lib/parse');
    }
    // end node
      
    /**
     * Returns a copy of one / all the objects that have extended the
     * current instance of JSUS.
     * 
     * The first parameter is a string representation of the name of 
     * the requested extending object. If no parameter is passed a copy 
     * of all the extending objects is returned.
     * 
     * 
     */
    JSUS.get = function (className) {
        if ('undefined' === typeof JSUS.clone) {
            JSUS.log('JSUS.clone not found. Cannot continue.');
            return false;
        }
        if ('undefined' === typeof className) return JSUS.clone(JSUS._classes);
        if ('undefined' === typeof JSUS._classes[className]) {
            JSUS.log('Could not find class ' + className);
            return false;
        }
        return JSUS.clone(JSUS._classes[className]);
    };


    
})('undefined' !== typeof module && 'undefined' !== typeof module.exports ? module.exports: window);


(function (JSUS) {
    
    function ARRAY(){};
    
    
    /**
     * Add the filter method to ARRAY objects in case the method is not
     * supported natively. 
     * See https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/ARRAY/filter#Compatibility
     * 
     * @TODO: make a static method instead
     * 
     */
    if (!Array.prototype.filter) {  
        Array.prototype.filter = function(fun /*, thisp */) {  
            "use strict";  
            if (this === void 0 || this === null) throw new TypeError();  

            var t = Object(this);  
            var len = t.length >>> 0;  
            if (typeof fun !== "function") throw new TypeError();  
        
            var res = [];  
            var thisp = arguments[1];  
            for (var i = 0; i < len; i++) {  
                if (i in t) {  
                    var val = t[i]; // in case fun mutates this  
                    if (fun.call(thisp, val, i, t)) { 
                        res.push(val);  
                    }
                }
            }
            
            return res;  
        };
    }
    
    /**
     * Returns TRUE if a variable is an Array.
     *  
     */
    ARRAY.isArray = function (o) {
    	if (!o) return false;
    	if (Object.prototype.toString.call(o) === '[object Array]') {
    		return true;
    	}
        return false;
    };
    
    /**
     * Returns an array of sequential numbers from start to end.
     * If start > end the series goes backward.
     * If increment is specified, numbers are separated 
     * by 2*increment units each. 
     * When increment is not a divider of Abs(start - end), end will
     * be missing from the series.
     *  
     * Returns FALSE, in case parameters are incorrectly specified
     *  
     */
    ARRAY.seq = function (start, end, increment) {
    	if ('number' !== typeof start) return false;
    	if (start === Infinity) return false;
    	if ('number' !== typeof end) return false;
    	if (end === Infinity) return false;
    	if (start === end) return [start];
    	
    	if (increment === 0) return false;
    	if (!JSUS.in_array(typeof increment, ['undefined', 'number'])) {
    		return false;
    	}
    	
    	increment = increment || 1;
    	
    	var i = start,
    		out = [];
    	
    	if (start < end) {
    		while (i <= end) {
        		out.push(i);
        		i = i + increment;
        	}
    	}
    	else {
    		while (i >= end) {
        		out.push(i);
        		i = i - increment;
        	}
    	}
    	
        return out;
    };
    
    
    /**
     * Executes a callback on each element of the array
     * 
     * If no element is removed returns FALSE.
     * 
     */
    ARRAY.each = function (array, func, context) {
    	if ('object' !== typeof array) return false;
    	if (!func) return false;
        
    	context = context || this;
        var i, len = array.length;
        for (i = 0 ; i < len; i++) {
            func.call(context, array[i]);
        }
        
        return true;
    };
    
    /**
     * Removes an element from the the array, and returns it.
     * For objects, deep equality comparison is performed 
     * through JSUS.equals.
     * 
     * If no element is removed returns FALSE.
     * 
     */
    ARRAY.removeElement = function (needle, haystack) {
                
        if ('object' === typeof needle) {
            var func = JSUS.equals;
        } else {
            var func = function (a,b) {
                return (a === b);
            }
        }
        
        for (var i=0; i < haystack.length; i++) {
            if (func(needle, haystack[i])){
                return haystack.splice(i,1);
            }
        }
        
        return false;
    };
    
    /**
     * Returns TRUE if the element is contained in the array,
     * FALSE otherwise.
     * 
     * For objects, deep equality comparison is performed 
     * through JSUS.equals.
     * 
     */
    ARRAY.in_array = function (needle, haystack) {
        if ('undefined' === typeof needle || !haystack) return false;
            
        if ('object' === typeof needle) {
            var func = JSUS.equals;
        } else {
            var func = function (a,b) {
                return (a === b);
            }
        }
        
        for (var i = 0; i < haystack.length; i++) {
            if (func.call(this, needle, haystack[i])) return true;
        }
        return false;
    };
    
    /**
     * Returns an array of N array containing the same number of elements
     * The last group could have less elements.
     *  
     *  @TODO: explain the differences of all the methods below 
     *  @see ARRAY.getGroupsSizeN
     *  @see ARRAY.generateCombinations
     *  @see ARRAY.matchN
     */ 
    ARRAY.getNGroups = function (array, N) {
        return ARRAY.getGroupsSizeN(array, Math.floor(array.length / N));
    };
    
    /**
     * Returns an array of array containing N elements each
     * The last group could have less elements.
     * 
     *  @see ARRAY.getNGroups
     *  @see ARRAY.generateCombinations
     *  @see ARRAY.matchN
     * 
     */ 
    ARRAY.getGroupsSizeN = function (array, N) {
        
        var copy = array.slice(0);
        var len = copy.length;
        var originalLen = copy.length;
        var result = [];
        
        // Init values for the loop algorithm
        var i;
        var idx;
        var group = [];
        var count = 0;
        for (i=0; i < originalLen; i++) {
            
            // Get a random idx between 0 and array length
            idx = Math.floor(Math.random()*len);
            
            // Prepare the array container for the elements of a new group
            if (count >= N) {
                result.push(group);
                count = 0;
                group = [];
            }
            
            // Insert element in the group
            group.push(copy[idx]);
            
            // Update
            copy.splice(idx,1);
            len = copy.length;
            count++;
        }
        
        // Add any remaining element
        if (group.length > 0) {
            result.push(group);
        }
        
        return result;
    };
    

    ARRAY._latinSquare = function (S, N, self) {
    	var self = ('undefined' === typeof self) ? true : self;
    	if (S === N && !self) return false; // infinite loop
    	var seq = [];
    	var latin = [];
    	for (var i=0; i< S; i++) {
    		seq[i] = i;
    	}
    	
    	var idx = null;
    	
    	var start = 0;
    	var limit = S;
    	var extracted = [];
    	if (!self) {
        	limit = S-1;
    	}
    	
    	for (i=0; i < N; i++) {
    		do {
    			idx = JSUS.randomInt(start,limit);
    		}
    		while (JSUS.in_array(idx, extracted));
    		extracted.push(idx);
    		
    		if (idx == 1) {
    			latin[i] = seq.slice(idx);
    			latin[i].push(0);
    		}
    		else {
    			latin[i] = seq.slice(idx).concat(seq.slice(0,(idx)));
    		}
    		
    	}
    	
    	return latin;
    };
    
    /**
     * Generate a random Latin Square of size S.
     * 
     * If N is defined, it returns "Latin Rectangle" (SxN)
     * 
     */
    ARRAY.latinSquare = function (S, N) {
    	if (!N) N = S;
    	if (!S || S < 0 || (N < 0)) return false;
    	if (N > S) N = S;
    	
    	return ARRAY._latinSquare(S, N, true);
    };
    
    /**
     * Generate a random Latin Square of size Sx(S-1), where
     * in each column "i", the symbol "i" is not found.
     * 
     * If N (N<S) is defined, it returns "Latin Rectangle" (SxN)
     * 
     */
    ARRAY.latinSquareNoSelf = function (S, N) {
    	if (!N) N = S-1;
    	if (!S || S < 0 || (N < 0)) return false;
    	if (N > S) N = S-1;
    	
    	return ARRAY._latinSquare(S, N, false);
    }
    
    
    /**
     *  Generates all distinct combinations of exactly 
     *  r elements each and returns them into an array.
     *  
     *  @see ARRAY.getGroupSizeN
     *  @see ARRAY.getNGroups
     *  @see ARRAY.matchN
     * 
     */
    ARRAY.generateCombinations = function (array, r) {
        function values(i, a) {
            var ret = [];
            for (var j = 0; j < i.length; j++) ret.push(a[i[j]]);
            return ret;
        }
        var n = array.length;
        var indices = [];
        for (var i = 0; i < r; i++) indices.push(i);
        var final = [];
        for (var i = n - r; i < n; i++) final.push(i);
        while (!JSUS.equals(indices, final)) {
            callback(values(indices, array));
            var i = r - 1;
            while (indices[i] == n - r + i) i -= 1;
            indices[i] += 1;
            for (var j = i + 1; j < r; j++) indices[j] = indices[i] + j - i;
        }
        return values(indices, array); 
    };
    
    /**
     * Match each element of the array with N random others.
     * If strict is equal to true, elements cannot be matched multiple times.
     * 
     * TODO: This has a bug / feature. The last element could remain alone, 
     * because all the other have been already coupled. Another recombination
     * would be able to match all the elements instead.
     * 
     *  @see ARRAY.getGroupSizeN
     *  @see ARRAY.getNGroups
     *  @see ARRAY.generateCombinations
     * 
     */
    ARRAY.matchN = function (array, N, strict) {

        var result = []
        var len = array.length;
        var found = [];
        for (var i = 0 ; i < len ; i++) {
            // Recreate the array
            var copy = array.slice(0);
            copy.splice(i,1);
            if (strict) {
                copy = ARRAY.arrayDiff(copy,found);
            }
            var group = ARRAY.getNRandom(copy,N);
            // Add to the set of used elements
            found = found.concat(group);
            // Re-add the current element
            group.splice(0,0,array[i]);
            result.push(group);
            
            //Update
            group = [];
            
        }
        return result;
    };
    
    /**
     * Appends an array to itself and return a new array.
     * 
     * The original array is not modified.
     * 
     */
    ARRAY.arraySelfConcat = function (array) {
        var i = 0;
        var len = array.length;
        var result = []
        for (; i < len; i++) {
            result = result.concat(array[i]);
        }
        return result;
    };
    

    /**
     * Computes the intersection between two arrays. 
     * 
     * Arrays can contain both primitive types and objects.
     * 
     */
    ARRAY.arrayIntersect = function (a1, a2) {
        return a1.filter( function(i) {
            return JSUS.in_array(i, a2);
        });
    };
        
    /**
     * Performs a diff between two arrays.
     * 
     * Arrays can contain both primitive types and objects.
     * Returns all the values of the first array which are not present 
     * in the second one.
     * 
     */
    ARRAY.arrayDiff = function (a1, a2) {
        return a1.filter( function(i) {
            return !(JSUS.in_array(i, a2));
        });
    };
    
    /**
     * Shuffles the elements of the array using the Fischer algorithm.
     * 
     * See http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
     * 
     */
    ARRAY.shuffle = function (array) {
        var copy = array.slice(0);
        var len = array.length-1; // ! -1
        for (var i = len; i > 0; i--) {
            var j = Math.floor(Math.random()*(i+1));
            var tmp = copy[j];
            copy[j] = copy[i];
            copy[i] = tmp;
            //console.log(copy);
        }
        return copy;
    };
    
    /**
     * Select N random elements from the array and returns them.
     * 
     */
    ARRAY.getNRandom = function (array, N) {
        return ARRAY.shuffle(array).slice(0,N);
    };                           
        
    JSUS.extend(ARRAY);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
(function (JSUS) {
    
    /**
     * Helper library to perform generic operation with DOM elements.
     * 
     * The general syntax is the following: Every HTML element has associated
     * a get* and a add* method, whose syntax is very similar.
     * 
     *         - The get* method creates the element and returns it.
     *         - The add* method creates the element, append it as child to
     *             a root element, and then returns it.
     * 
     * The syntax of both method is the same, but the add* method 
     * needs the root element as first parameter. E.g.
     * 
     *     getButton(id, text, attributes);
     *  addButton(root, id, text, attributes);
     *  
     * The last parameter is generally an object containing a list of 
     * of key-values pairs as additional attributes to set to the element.
     *   
     * Only the methods which do not follow the above-mentioned syntax
     * will receive further explanation. 
     * 
     */
    
    function DOM () {};

    
    /**
     * Write a text, or append an HTML element or node, into the
     * the root element.
     * 
     * @see DOM.writeln
     * 
     */
    DOM.write = function (root, text) {
        if (!root) return;
        if (!text) return;
        var content = (!JSUS.isNode(text) || !JSUS.isElement(text)) ? document.createTextNode(text) : text;
        root.appendChild(content);
        return content;
    };
    
    /**
     * Write a text, or append an HTML element or node, into the
     * the root element and adds a break immediately after.
     * 
     * @see DOM.writeln
     * 
     */
    DOM.writeln = function (root, text, rc) {
        if (!root) return;
        var br = this.addBreak(root, rc);
        return (text) ? DOM.write(root, text) : br;
    };
    
    
    /**
     * Returns TRUE if the object is a DOM node
     * 
     */
    DOM.isNode = function(o){
        return (
            typeof Node === "object" ? o instanceof Node : 
            typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
        );
    };
    
    /**
     * Returns TRUE if the object is a DOM element 
     * 
     */   
    DOM.isElement = function(o) {
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            typeof o === "object" && o.nodeType === 1 && typeof o.nodeName === "string"
        );
    };

    /**
     * Creates a generic HTML element with id and attributes as specified,
     * and returns it.
     * 
     * @see DOM.addAttributes2Elem
     * 
     */
    DOM.getElement = function (elem, id, attributes) {
        var e = document.createElement(elem);
        if ('undefined' !== typeof id) {
            e.id = id;
        }
        return this.addAttributes2Elem(e, attributes);
    };
    
    /**
     * Creates a generic HTML element with id and attributes as specified, 
     * appends it to the root element, and returns it.
     * 
     * @see DOM.getElement
     * @see DOM.addAttributes2Elem
     * 
     */
    DOM.addElement = function (elem, root, id, attributes) {
        var el = this.getElement(elem, id, attributes);
        return root.appendChild(el);
    };
    
    /**
     * Add attributes to an HTML element and returns it.
     * 
     * Attributes are defined as key-values pairs. 
     * Attributes 'style', and 'label' are ignored.
     * 
     * @see DOM.style
     * @see DOM.addLabel
     * 
     */
    DOM.addAttributes2Elem = function (e, a) {
        if (!e || !a) return e;
        if ('object' != typeof a) return e;
        var specials = ['id', 'label'];
        for (var key in a) {
            if (a.hasOwnProperty(key)) {
                if (!JSUS.in_array(key, specials)) {
                    e.setAttribute(key,a[key]);
                } else if (key === 'id') {
                    e.id = a[key];
                }
                
                // TODO: handle special cases
                
//                else {
//            
//                    // If there is no parent node, the legend cannot be created
//                    if (!e.parentNode) {
//                        node.log('Cannot add label: no parent element found', 'ERR');
//                        continue;
//                    }
//                    
//                    this.addLabel(e.parentNode, e, a[key]);
//                }
            }
        }
        return e;
    };
    
    /**
     * Appends a list of options into a HTML select element.
     * The second parameter list is an object containing 
     * a list of key-values pairs as text-value attributes for
     * the option.
     *  
     */
    DOM.populateSelect = function (select, list) {
        if (!select || !list) return;
        for (var key in list) {
            if (list.hasOwnProperty(key)) {
                var opt = document.createElement('option');
                opt.value = list[key];
                opt.appendChild(document.createTextNode(key));
                select.appendChild(opt);
            }
        }
    };
    
    // Get / Add Elements
    
    DOM.getButton = function (id, text, attributes) {
        var sb = document.createElement('button');
        sb.id = id;
        sb.appendChild(document.createTextNode(text || 'Send'));    
        return this.addAttributes2Elem(sb, attributes);
    };
    
    
    DOM.addButton = function (root, id, text, attributes) {
        var b = this.getButton(id, text, attributes);
        return root.appendChild(b);
    };
    
    
    DOM.getFieldset = function (id, legend, attributes) {
        var f = this.getElement('fieldset', id, attributes);
        var l = document.createElement('Legend');
        l.appendChild(document.createTextNode(legend));    
        f.appendChild(l);
        return f;
    };
    
    DOM.addFieldset = function (root, id, legend, attributes) {
        var f = this.getFieldset(id, legend, attributes);
        return root.appendChild(f);
    };
    
	DOM.getTextInput = function (id, attributes) {
		var ti =  document.createElement('input');
		if ('undefined' !== typeof id) ti.id = id;
		ti.setAttribute('type', 'text');
		return this.addAttributes2Elem(ti, attributes);
	};
	
	DOM.addTextInput = function (root, id, attributes) {
		var ti = this.getTextInput(id, attributes);
		return root.appendChild(ti);
	};
	
	DOM.getTextArea = function (id, attributes) {
		var ta =  document.createElement('textarea');
		if ('undefined' !== typeof id) ta.id = id;
		return this.addAttributes2Elem(ta, attributes);
	};
	
	DOM.addTextArea = function (root, id, attributes) {
		var ta = this.getTextArea(id, attributes);
		return root.appendChild(ta);
	};
    
    DOM.getCanvas = function (id, attributes) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
            
        if (!context) {
            alert('Canvas is not supported');
            return false;
        }
        
        canvas.id = id;
        return this.addAttributes2Elem(canvas, attributes);
    };
    
    DOM.addCanvas = function (root, id, attributes) {
        var c = this.getCanvas(id, attributes);
        return root.appendChild(c);
    };
        
    DOM.getSlider = function (id, attributes) {
        var slider = document.createElement('input');
        slider.id = id;
        slider.setAttribute('type', 'range');
        return this.addAttributes2Elem(slider, attributes);
    };
    
    DOM.addSlider = function (root, id, attributes) {
        var s = this.getSlider(id, attributes);
        return root.appendChild(s);
    };
    
    DOM.getRadioButton = function (id, attributes) {
        var radio = document.createElement('input');
        radio.id = id;
        radio.setAttribute('type', 'radio');
        return this.addAttributes2Elem(radio, attributes);
    };
    
    DOM.addRadioButton = function (root, id, attributes) {
        var rb = this.getRadioButton(id, attributes);
        return root.appendChild(rb);
    };
    
//    DOM.addJQuerySlider = function (root, id, attributes) {
//        var slider = document.createElement('div');
//        slider.id = id;
//        slider.slider(attributes);
//        root.appendChild(slider);
//        return slider;
//    };
    
    DOM.getLabel = function (forElem, id, labelText, attributes) {
        if (!forElem) return false;
        var label = document.createElement('label');
        label.id = id;
        label.appendChild(document.createTextNode(labelText));
        
        if ('undefined' === typeof forElem.id) {
            forElem.id = this.generateUniqueId();
        }
        
        label.setAttribute('for', forElem.id);
        this.addAttributes2Elem(label, attributes);
        return label;
    };
    

    DOM.addLabel = function (root, forElem, id, labelText, attributes) {
        if (!root || !forElem || !labelText) return false;        
        var l = this.getLabel(forElem, id, labelText, attributes);
        root.insertBefore(l, forElem);
        return l;
    };
    
    DOM.getSelect = function (id, attributes) {
        return this.getElement('select', id, attributes);
    };
    
    DOM.addSelect = function (root, id, attributes) {
        return this.addElement('select', root, id, attributes);
    };
    
    DOM.getIFrame = function (id, attributes) {
        var attributes = {'name' : id}; // For Firefox
        return this.getElement('iframe', id, attributes);
    };
    
    DOM.addIFrame = function (root, id, attributes) {
        var ifr = this.getIFrame(id, attributes);
        return root.appendChild(ifr);
    };
    
    DOM.addBreak = function (root, rc) {
        var RC = rc || 'br';
        var br = document.createElement(RC);
        return root.appendChild(br);
        //return this.insertAfter(br,root);
    };
    
    /**
     * If no root element is passed, it tries to add the CSS 
     * link element to document.head, document.body, and 
     * finally document. If it fails, returns FALSE.
     * 
     */
    DOM.addCSS = function (root, css, id, attributes) {
        var root = root || document.head || document.body || document;
        if (!root) return false;
        
        attributes = attributes || {};
        
        attributes = JSUS.merge(attributes, {rel : 'stylesheet',
                                            type: 'text/css',
                                            href: css,
        });
        
        return this.addElement('link', root, id, attributes);
    };
    
    DOM.addJS = function (root, js, id, attributes) {
    	var root = root || document.head || document.body || document;
        if (!root) return false;
        
        attributes = attributes || {};
        
        attributes = JSUS.merge(attributes, {charset : 'utf-8',
                                            type: 'text/javascript',
                                            src: js,
        });
        
        return this.addElement('script', root, id, attributes);
    };
    
    DOM.getDiv = function (id, attributes) {
        return this.getElement('div', id, attributes);
    };
    
    DOM.addDiv = function (root, id, attributes) {
        return this.addElement('div', root, id, attributes);
    };
    
    /**
     * Provides a simple way to highlight an HTML element
     * by adding a colored border around it.
     * 
     * Three pre-defined modes are implemented: 
     * 
     *         - OK:         green
     *         - WARN:     yellow
     *         - ERR:        red (default)
     * 
     * Alternatively, it is possible to specify a custom
     * color as HEX value. Examples:
     * 
     *  highlight(myDiv, 'WARN'); // yellow border
     *  highlight(myDiv);          // red border
     *  highlight(myDiv, '#CCC'); // grey border
     *  
     *  @see DOM.addBorder
     *  @see DOM.style
     * 
     */
    DOM.highlight = function (elem, code) {
        if (!elem) return;
        
        // default value is ERR        
        switch (code) {    
            case 'OK':
                var color =  'green';
                break;
            case 'WARN':
                var color = 'yellow';
                break;
            case 'ERR':
                var color = 'red';
                break;
            default:
                if (code[0] === '#') {
                    var color = code;
                }
                else {
                    var color = 'red';
                }
        }
        
        return this.addBorder(elem, color);
    };
    
    /**
     * Adds a border around the specified element. Color,
     * width, and type can be specified.
     * 
     */
    DOM.addBorder = function (elem, color, witdh, type) {
        if (!elem) return;
        
        var color = color || 'red';
        var width = width || '5px';
        var type = type || 'solid';
        
        var properties = { border: width + ' ' + type + ' ' + color };
        return this.style(elem,properties);
    };
    
    /**
     * Styles an element as an in-line css. 
     * Takes care to add new styles, and not overwriting previuous
     * attributes.
     * 
     * Returns the element.
     * 
     * @see DOM.setAttribute
     */
    DOM.style = function (elem, properties) {
        if (!elem || !properties) return;
        if (!DOM.isElement(elem)) return;
        
        var style = '';
        for (var i in properties) {
            style += i + ': ' + properties[i] + '; ';
        };
        return elem.setAttribute('style', style);
    };
    
    /**
     * Removes a specific class from the class attribute
     * of a given element.
     * 
     * Returns the element.
     */
    DOM.removeClass = function (el, c) {
        if (!el || !c) return;
        var regexpr = '/(?:^|\s)' + c + '(?!\S)/';
        var o = el.className = el.className.replace( regexpr, '' );
        return el;
    };

    /**
     * Add a class to the class attribute of the given
     * element. Takes care not to overwrite already 
     * existing classes.
     * 
     */
    DOM.addClass = function (el, c) {
        if (!el || !c) return;
        if (c instanceof Array) c = c.join(' ');
        if ('undefined' === typeof el.className) {
            el.className = c;
        } else {
            el.className += ' ' + c;
        }
        return el;
      };
    
    /**
     * Remove all children from a node.
     * 
     */
    DOM.removeChildrenFromNode = function (e) {
        
        if (!e) return false;
        
        while (e.hasChildNodes()) {
            e.removeChild(e.firstChild);
        }
        return true;
    };
    
    /**
     * Insert a node element after another one.
     * 
     * The first parameter is the node to add.
     * 
     */
    DOM.insertAfter = function (node, referenceNode) {
          referenceNode.insertBefore(node, referenceNode.nextSibling);
    };
    
    /**
     * Generate a unique id for the page (frames included).
     * 
     * TODO: now it always create big random strings, it does not actually
     * check if the string exists.
     * 
     */
    DOM.generateUniqueId = function (prefix) {
        var search = [window];
        if (window.frames) {
            search = search.concat(window.frames);
        }
        
        function scanDocuments(id) {
            var found = true;
            while (found) {
                for (var i=0; i < search.length; i++) {
                    found = search[i].document.getElementById(id);
                    if (found) {
                        id = '' + id + '_' + JSUS.randomInt(0, 1000);
                        break;
                    }
                }
            }
            return id;
        };

        
        return scanDocuments(prefix + '_' + JSUS.randomInt(0, 10000000));
        //return scanDocuments(prefix);
    };
    
    /**
     * Creates a blank HTML page with the html and body 
     * elements already appended.
     * 
     */
    DOM.getBlankPage = function() {
        var html = document.createElement('html');
        html.appendChild(document.createElement('body'));
        return html;
    };
    
//    DOM.findLastElement = function(o) {
//        if (!o) return;
//        
//        if (o.lastChild) {
//            var e 
//            JSUS.isElement(e)) return DOM.findLastElement(e);
//        
//            var e = e.previousSibling;
//            if (e && JSUS.isElement(e)) return DOM.findLastElement(e);
//        
//        return o;
//    };
    
    JSUS.extend(DOM);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
(function (JSUS) {
    
    function EVAL(){};

    /**
     * Allows to execute the eval function within a given 
     * context. If no context is passed a reference to the
     * this object is used.
     * 
     */
    EVAL.eval = function (str, context) {
        var context = context || this;
        // Eval must be called indirectly
        // i.e. eval.call is not possible
        //console.log(str);
        var func = function (str) {
            // TODO: Filter str
            return eval(str);
        }
        return func.call(context, str);
    };
    
    JSUS.extend(EVAL);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
(function (JSUS) {

    /**
     *
     *    OBJ: functions working with js objects.
     * 
     * 
     */
    
    function OBJ(){};

    /**
     * Checks for deep equality between two objects, 
     * string or primitive types.
     * 
     * All nested properties are checked, and if they differ 
     * in at least one returns FALSE, otherwise TRUE.
     * 
     */
    OBJ.equals = function (o1, o2) {
        if (!o1 || !o2) return false;
          
        // Check whether arguments are not objects
        if ( typeof o1 in {number:'',string:''}) {
            if ( typeof o2 in {number:'',string:''}) {
                return (o1 === o2);
            }
            return false;
        } else if ( typeof o2 in {number:'',string:''}) {
            return false;
        }
        
        for (var p in o1) {
            if (o1.hasOwnProperty(p)) {
              
                if ('undefined' === typeof o2[p] && 'undefined' !== typeof o1[p]) return false;
              
                switch (typeof o1[p]) {
                    case 'object':
                        if (!OBJ.equals(o1[p],o2[p])) return false;
                        
                    case 'function':
                        if (o1[p].toString() !== o2[p].toString()) return false;
                        
                    default:
                        if (o1[p] !== o2[p]) return false; 
              }
          } 
      }
  
      // Check whether o2 has extra properties
      // TODO: improve, some properties have already been checked!
      for (p in o2) {
          if (o2.hasOwnProperty(p)) {
              if ('undefined' === typeof o1[p] && 'undefined' !== typeof o2[p])
                  return false;
          }
      }
    
      return true;
    };
    
    /**
     * Returns TRUE if an object has no properties, 
     * FALSE otherwise.
     * 
     */
    OBJ.isEmpty = function (o) {
        for (var key in o) {
            if (o.hasOwnProperty(key)) {
            	return false;
            }
        }

        return true;
    };

    
    /**
     * @deprecated
     * @see OBJ.length();
     */
    OBJ.getListSize = OBJ.getOwnPropertiesSize = function (o) {
    	return OBJ.length(o);
    };
    
    /**
     * Returns the number of own properties of an object.
     * Prototype chain properties are excluded.
     * 
     */
    OBJ.size = function (obj) {
    	if (!obj) return 0;
    	if ('number' === typeof obj) return 0;
    	if ('string' === typeof obj) return 0;
    	
        var n = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                n++;
            }
        }
        return n;
    };
    
    /**
     * Explodes an object into an array of keys and values,
     * according to the specified parameters. 
     * A fixed level of recursion can be set.
     * 
     * @api private
     * 
     */
    OBJ._obj2Array = function(obj, keyed, level, cur_level) {
        if ('object' !== typeof obj) return [obj];
        
        if (level) {
            var cur_level = ('undefined' !== typeof cur_level) ? cur_level : 1;
            if (cur_level > level) return [obj];
            cur_level = cur_level + 1;
        }
        
        var result = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if ( 'object' === typeof obj[key] ) {
                    result = result.concat(OBJ._obj2Array(obj[key], keyed, level, cur_level));
                } else {
                    if (keyed) result.push(key);
                    result.push(obj[key]);
                }
               
            }
        }        
        return result;
    };
    
    /**
     * Recursively put the values of the properties of an object into 
     * an array and returns it. The level of recursion can be set with the 
     * parameter level, by default recursion has no limit. That means that
     * the whole object gets totally unfolded into an array.
     * 
     * @see OBJ._obj2Array
     * @see OBJ._obj2KeyedArray
     * 
     */
    OBJ.obj2Array = function (obj, level) {
        return OBJ._obj2Array(obj, false, level);
    };
    
    /**
     * Creates an array containing all keys and values of an object and 
     * returns it.
     * 
     * @see OBJ.obj2Array 
     * 
     */
    OBJ.obj2KeyedArray = OBJ.obj2KeyArray = function (obj, level) {
        return OBJ._obj2Array(obj, true, level);
    };
    
    /**
     * Scans an object an returns all the keys of the properties,
     * into an array. The second paramter controls the level of 
     * nested objects to be evaluated. Defaults 0 (nested properties
     * are skipped).
     * 
     */
    OBJ.keys = OBJ.objGetAllKeys = function (obj, level, curLevel) {
        if (!obj) return;
        level = ('number' === typeof level && level >= 0) ? level : 0; 
        curLevel = ('number' === typeof curLevel && curLevel >= 0) ? curLevel : 0;
        var result = [];
        for (var key in obj) {
           if (obj.hasOwnProperty(key)) {
               result.push(key);
               if (curLevel < level) {
	               if ('object' === typeof obj[key]) {
	                   result = result.concat(OBJ.objGetAllKeys(obj[key], (curLevel+1)));
	               }
               }
           }
        }
        return result;
    };
    
    /**
     * Creates an array of key:value objects.
     * 
     */
    OBJ.implode = OBJ.implodeObj = function (obj) {
        //console.log(obj);
        var result = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                var o = {};
                o[key] = obj[key];
                result.push(o);
                //console.log(o);
            }
        }
        return result;
    };
 
 /**
  * Creates a perfect copy of the object passed as parameter.
  * 
  */
 OBJ.clone = function (obj) {
     if (!obj) return;
     if ('number' === typeof obj) return obj;
     if ('string' === typeof obj) return obj;
     if (obj === NaN) return obj;
     if (obj === Infinity) return obj;
     
     var clone = {};
     for (var i in obj) {
     	
    	// It is not NULL and it is an object
     	var value = (obj[i] && 'object' === typeof obj[i]) 	? OBJ.clone(obj[i])
					 								 		: obj[i];
     	
         if (obj.hasOwnProperty(i)) {
         	clone[i] = value;
         }
         else {
         	
        	 // Does not work
//         	if ('undefined' === typeof clone.prototype) {
//         		Object.defineProperty(clone, 'prototype', {
//         			value: {},
//         			writable: true,
//           		  	configurable: true,
//           		});
//         	}
         	
         	Object.defineProperty(clone, i, {
         		 value: value,
         		 writable: true,
         		 configurable: true,
         	});
         	
         }
     }
     return clone;
 };
    
    /**
     * Performs a *left* join on the keys of two objects. In case keys overlaps 
     * the values from obj2 are taken.
     *  
     */
    OBJ.join = function (obj1, obj2) {
        var clone = OBJ.clone(obj1);
        if (!obj2) return clone;
        for (var i in clone) {
            if (clone.hasOwnProperty(i)) {
                if ('undefined' !== typeof obj2[i]) {
                    if ( 'object' === typeof obj2[i] ) {
                        clone[i] = OBJ.join(clone[i], obj2[i]);
                    } else {
                        clone[i] = obj2[i];
                    }
                }
            }
        }
        return clone;
    };
    
    /**
     * Merges two objects in one. In case keys overlaps the values from 
     * obj2 are taken. 
     * 
     * Returns a new object, the original ones are not modified.
     * 
     */
    OBJ.merge = function (obj1, obj2) {
    	// Checking before starting the algorithm
    	if (!obj1 && !obj2) return false;
    	if (!obj1) return OBJ.clone(obj2);
    	if (!obj2) return OBJ.clone(obj1);
    	
        var clone = OBJ.clone(obj1);
        for (var i in obj2) {
        	
            if (obj2.hasOwnProperty(i)) {
            	// it is an object and it is not NULL
                if ( obj2[i] && 'object' === typeof obj2[i] ) {
                	// If we are merging an object into  
                	// a non-object, we need to cast the 
                	// type of obj1
                	if ('object' !== typeof clone[i]) {
                		clone[i] = {};
                	}
                    clone[i] = OBJ.merge(clone[i], obj2[i]);
                } else {
                    clone[i] = obj2[i];
                }
            }
        }
        
        return clone;
    };
    
    /**
     * Appends / merges the values of the properties of obj2 into a 
     * a new property called 'key' of obj1.
     * 
     * Returns a new object, the original ones are not modified.
     * 
     * This method is useful when we want to merge into a larger 
     * configuration (e.g. min, max, value) object another one that 
     * contains just the values for one of the properties (e.g. value). 
     * 
     * @see OBJ.merge
     * 
     */
    OBJ.mergeOnKey = function (obj1, obj2, key) {
        var clone = OBJ.clone(obj1);
        if (!obj2 || !key) return clone;        
        for (var i in obj2) {
            if (obj2.hasOwnProperty(i)) {
                if (!clone[i] || 'object' !== typeof clone[i]) {
                	clone[i] = {};
                } 
                clone[i][key] = obj2[i];
            }
        }
        return clone;
    };
        
    /**
     * Creates a copy of an object containing only the 
     * properties passed as second parameter.
     * 
     * The parameter select can be an array of strings, 
     * or the name of a property.
     * 
     */
    OBJ.subobj = function (o, select) {
        if (!o) return false;
        var out = {};
        if (!select) return out;
        if (!(select instanceof Array)) select = [select];
        for (var i=0; i<select.length;i++) {
            var key = select[i];
            if ('undefined' !== typeof o[key]) {
                out[key] = o[key];
            }
        }
        return out;
    };
        
    
    /**
     * Sets the value of a nested property of an object, 
     * and returns it.
     * 
     * If the object is not passed a new one is created.
     * If the nested property is not existing, a new one
     * is created. 
     * 
     * The original object is modified.
     * 
     */
    OBJ.setNestedValue = function (str, value, obj) {
        var obj = obj || {};
        var keys = str.split('.');
        if (keys.length === 1) {
            obj[str] = value;
            return obj;
        }
        var k = keys.shift();
        obj[k] = OBJ.setNestedValue(keys.join('.'), value, obj[k]); 
        return obj;
    };
    
    /**
     * Returns the value of a property of an object, as defined
     * by the input string. The string can contains '.', and in that
     * case the method looks for nested objects.
     *  
     * Returns undefined if the nested key is not found.
     * 
     */
    OBJ.getNestedValue = function (str, obj) {
        if (!obj) return;
        var keys = str.split('.');
        if (keys.length === 1) {
            return obj[str];
        }
        var k = keys.shift();
        return OBJ.getNestedValue(keys.join('.'), obj[k]); 
    };

    JSUS.extend(OBJ);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
(function (JSUS) {
    
    function RANDOM(){};

    /**
     * Generates a pseudo-random floating point number between 
     * (a,b), both a and b exclusive.
     * 
     */
    RANDOM.random = function (a, b) {
    	a = ('undefined' === typeof a) ? 0 : a;
    	b = ('undefined' === typeof b) ? 0 : b;
    	if (a === b) return a;
    	
    	if (b < a) {
    		var c = a;
    		a = b;
    		b = c;
    	}
    	return (Math.random() * (b - a)) + a
    };
    
    /**
     * Generates a pseudo-random integer between 
     * (a,b] a exclusive, b inclusive.
     * 
     */
    RANDOM.randomInt = function (a, b) {
    	if (a === b) return a;
        return Math.floor(RANDOM.random(a, b) + 1);
    };
    
    
    JSUS.extend(RANDOM);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
(function (JSUS) {
    
    function TIME() {};

    /**
     * Returns a string representation of the current date 
     * and time formatted as follows:
     * 
     * dd-mm-yyyy hh:mm:ss milliseconds
     * 
     */
    TIME.getDate = TIME.getFullDate = function() {
        var d = new Date();
        var date = d.getUTCDate() + '-' + (d.getUTCMonth()+1) + '-' + d.getUTCFullYear() + ' ' 
                + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ' ' 
                + d.getMilliseconds();
        
        return date;
    };
    
    /**
     * Returns a string representation of the current time
     * formatted as follows:
     * 
     * hh:mm:ss
     * 
     */
    TIME.getTime = function() {
        var d = new Date();
        var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        
        return time;
    };
    
    /**
     * Parse an integer number representing millisecodns, 
     * and returns an array of days, hours, minutes and seconds
     * 
     */
    TIME.parseMilliseconds = function (ms) {
      
        var result = [];
        var x = ms / 1000;
        result[4] = x;
        var seconds = x % 60;
        result[3] = Math.floor(seconds);
        var x = x /60;
        var minutes = x % 60;
        result[2] = Math.floor(minutes);
        var x = x / 60;
        var hours = x % 24;
        result[1] = Math.floor(hours);
        var x = x / 24;
        var days = x;
        result[1] = Math.floor(days);
        
        return result;
    };
    
    JSUS.extend(TIME);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
(function (JSUS) {
    
    function PARSE(){};

    /**
     * Returns the full querystring or a specific variable.
     * Return false if the requested variable is not found.
     * 
     */
    PARSE.getQueryString = function (variable) {
        var query = window.location.search.substring(1);
        if ('undefined' === typeof variable) return query;
        
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] === variable) {
                return unescape(pair[1]);
            }
        }
        return false;
    };
    
    JSUS.extend(PARSE);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
(function (exports, JSUS) {
    
    /**
     * 
     * NDDB provides a simple, lightweight, NO-SQL object database 
     * for node.js and the browser. It depends on JSUS.
     * 
     * Allows to define any number of comparator and indexing functions, 
     * which are associated to any of the dimensions (i.e. properties) of 
     * the objects stored in the database. 
     * 
     * Whenever a comparison is needed, the corresponding comparator function 
     * is called, and the database is updated.
     * 
     * Whenever an object is inserted that matches one of the indexing functions
     * an hash is produced, and the element is added to one of the indexes.
     * 
     * 
     * Additional features are: methods chaining, tagging, and iteration 
     * through the entries.
     * 
     * NDDB is work in progress. Currently, the following methods are
     * implemented:
     * 
     *  1. Sorting and selecting:
     * 
     *      - select, sort, reverse, last, first, limit, shuffle*
     *  
     *  2. Custom callbacks
     *  
     *      - map, each, filter
     *  
     *  3. Deletion
     *  
     *      - delete, clear
     *  
     *  4. Advanced operations
     *  
     *      - split*, join, concat
     *  
     *  5. Fetching
     *  
     *      - fetch, fetchArray, fetchKeyArray
     *  
     *  6. Statistics operator
     *  
     *      - size, count, max, min, mean, stddev
     *  
     *  7. Diff
     *  
     *      - diff, intersect
     *  
     *  8. Iterator
     *  
     *      - previous, next, first, last
     *
     *  9. Tagging*
     *  
     *      - tag
     *         
     *  10. Updating
     *   
     *      - Update must be performed manually after a selection.
     *      
     * 
     * * = experimental
     * 
     * 
     * See README.md for help.
     * 
     * TODO: distinct
     * 
     */

    // Expose constructors
    exports.NDDB = NDDB;
    
    // Stdout redirect
    NDDB.log = console.log;
    
    NDDB.decycle = function(e) {
    	if (JSON && JSON.decycle && 'function' === typeof JSON.decycle) {
			e = JSON.decycle(e);
		}
    	return e;
    };
    
    NDDB.retrocycle = function(e) {
    	if (JSON && JSON.retrocycle && 'function' === typeof JSON.retrocycle) {
			e = JSON.retrocycle(e);
		}
    	return e;
    };
    
    
    /**
     * NDDB interface
     *
     * @api public
     */
    
    function NDDB (options, db, parent) {                
        options = options || {};
        
        if (!JSUS) throw new Error('JSUS not found.');
        
        // The default database
        this.db = [];
        // The tags list
        this.tags = {};					
        // Pointer for iterating along all the elements
        this.nddb_pointer = 0; 
        
        // Comparator functions
        this.__C = {};
        // Hashing functions
        this.__H = {};
        // Auto update options
        this.__update = {};
        // Always points to the last insert
        this.__update.pointer 	= false;
        // Rebuild indexes on insert and delete
        this.__update.indexes 	= false;
        // Always sort the elements in the database
        this.__update.sort 		= false;
        
        Object.defineProperty(this, 'length', {
        	set: function(){},
        	get: function(){
        		return this.db.length;
        	},
        	configurable: true
    	});
        
        // Parent NNDB database (if chaining)
        this.__parent = parent || undefined;

        this.init(options);
        this.import(db);   
    };
    
    /**
     * Sets global options based on local configuration
     */
    NDDB.prototype.init = function(options) {
    	this.__options = options;
    	
    	if (options.log) {
    		NDDB.log = options.log;
    	}
        
    	if (options.C) {
    		this.__C = options.C;
    	}
    	
    	if (options.H) {
    		this.__H = options.H;
    	}
    	
    	if (options.tags) {
    		this.tags = options.tags;
    	}
        
        if (options.nddb_pointer > 0) {
        	this.nddb_pointer = options.nddb_pointer;
    	}
        
        if (options.update) {
	        if ('undefined' !== typeof options.update.pointer) {
	        	this.__update.pointer = options.update.pointer;
	        }
	           
	        if ('undefined' !== typeof options.update.indexes) {
	        	this.__update.indexes = options.update.indexes;
	        }
	                                        
	        if ('undefined' !== typeof options.update.sort) {
	        	this.__update.sort = options.update.sort;
	        }
        }
        
    };
    
    
    ///////////
    // 0. Core
    //////////
    
    /**
     * Default function used for sorting
     * 
     * Elements are sorted according to their internal id 
     * (FIFO). 
     * 
     */
    NDDB.prototype.globalCompare = function(o1, o2) {
        if ('undefined' === typeof o1 && 'undefined' === typeof o2) return 0;
        if ('undefined' === typeof o2) return -1;  
        if ('undefined' === typeof o1) return 1;
        
        if (o1.nddbid < o2.nddbid) return -1;
        if (o1.nddbid > o2.nddbid) return 1;
        return 0;
    };
    
    /**
     * Adds a special id into the __proto__ object of 
     * the object
     * 
     * @api private
     */
    NDDB.prototype._masquerade = function (o, db) {
        if ('undefined' === typeof o) return false;
        
        // TODO: check this
        if ('undefined' !== typeof o.nddbid) return o;
        var db = db || this.db;
        
        Object.defineProperty(o, 'nddbid', {
        	value: db.length,
        	//set: function(){},
        	configurable: true,
        	writable: true,
    	});
        
        //o.__proto__ = JSUS.clone(o.__proto__);
        //o.__proto__.nddbid = db.length;
        return o;
    };

    /**
     * Masquerades a whole array and returns it
     * 
     * @see NDDB._masquerade
     * @api private
     * 
     */
    NDDB.prototype._masqueradeDB = function (db) {
        if (!db) return [];
        var out = [];
        for (var i = 0; i < db.length; i++) {
            out[i] = this._masquerade(db[i], out);
        }
        return out;
    };
    
    /**
     * Performs a series of automatic checkings 
     * and updates the db according to current 
     * configuration
     * 
     * @api private
     */
    NDDB.prototype._autoUpdate = function (options) {
    	var update = JSUS.merge(options || {}, this.__update);
    	
        if (update.pointer) {
            this.nddb_pointer = this.db.length-1;
        }
        if (update.sort) {
            this.sort();
        }
        
        if (update.indexes) {
            this.rebuildIndexes();
        }
        
        // Update also parent element
        if (this.__parent) {
        	this.__parent._autoUpdate(update);
        }
    }
    
    /**
     * Imports a whole array into the current database
     * 
     */
    NDDB.prototype.import = function (db) {
        if (!db) return [];
        if (!this.db) this.db = [];
        for (var i = 0; i < db.length; i++) {
            this.insert(db[i]);
        }
        //this.db = this.db.concat(this._masqueradeDB(db));
        //this._autoUpdate();
    };
    
    /**
     * Inserts an object into the current database
     * 
     */
    NDDB.prototype.insert = function (o) {
        if ('undefined' === typeof o || o === null) return;
        var o = this._masquerade(o);
        
        this.db.push(o);
        
        // We save time calling hashIt only
        // on the latest inserted element
        if (this.__update.indexes) {
        	this.hashIt(o);
        }
    	// See above
        this._autoUpdate({indexes: false});
    };
    
    /**
     * Creates a clone of the current NDDB object
     * with a reference to the parent database
     * 
     */
    NDDB.prototype.breed = function (db) {
        db = db || this.db;
        var options = this.cloneSettings();
        var parent = this.__parent || this;							
        
        //In case the class was inherited
        return new this.constructor(options, db, parent);
    };
        
    /**
     * Creates a configuration object to initialize
     * a new NDDB instance based on the current settings
     * and returns it
     * 
     */
    NDDB.prototype.cloneSettings = function () {
        var options = this.__options || {};
        
        options.H = 		this.__H;
        options.C = 		this.__C;
        options.tags = 		this.tags;
        options.update = 	this.__update;
        
        return JSUS.clone(options);
    };    
    
    /**
     * Prints out the elements in the database
     */
    NDDB.prototype.toString = function () {
        var out = '';
        for (var i=0; i< this.db.length; i++) {
            out += this.db[i] + "\n";
        }    
        return out;
    };    
        
    /**
     * Returns a string representation of the state
     * of the database.
     * 
     * Cyclic objects are decycled.
     * 
     */
    NDDB.prototype.stringify = function () {
		var objToStr = function(o) {
			// Skip empty objects
			if (JSUS.isEmpty(o)) return '{}';
			return JSON.stringify(o);
			// These are ignored by JSON.stringify
//			if (o === NaN) return 'NaN';
//			if (o === Infinity) return 'Infinity';
//			
//			var s = '{';
//			for (var x in o) {
//				s += '"' + x + '": ';
//				
//				switch (typeof(o[x])) {
//					case 'undefined':
//						break;
//					case 'object': 
//						s += (o[x]) ? objToStr(o[x]) : 'null'; 
//						break;
//					case 'string': 
//						s += '"' + o[x].toString() + '"'; 
//						break;
//					default: 
//						s += o[x].toString();
//						break;
//				}
//				s+=', '
//			}
//			s=s.replace(/, $/,'}');
//			return s;
		}
		
        var out = '[';
        this.each(function(e) {
        	// decycle, if possible
        	e = NDDB.decycle(e);
        	out += objToStr(e) + ', ';
        });
        out = out.replace(/, $/,']');
        
        return out;
    };    
    
    
    /**
     * Adds a new comparator for dimension d 
     * 
     */
    NDDB.prototype.compare = NDDB.prototype.c = function (d, comparator) {
        if (!d || !comparator) {
            NDDB.log('Cannot set empty property or empty comparator', 'ERR');
            return false;
        }
        this.__C[d] = comparator;
        return true;
    };
    
//    /**
//     * Adds a new comparator for dimension d
//     * @depracated
//     */
//    NDDB.prototype.set = function (d, comparator) {
//        return this.d(d, comparator);
//    };

    /**
     * Returns the comparator function for dimension d. 
     * If no comparator was defined returns a generic
     * comparator function. 
     * 
     */
    NDDB.prototype.comparator = function (d) {
        if ('undefined' !== typeof this.__C[d]) {
        	return this.__C[d]; 
        }
        
        return function (o1, o2) {
//            NDDB.log('1' + o1);
//            NDDB.log('2' + o2);
            if ('undefined' === typeof o1 && 'undefined' === typeof o2) return 0;
            if ('undefined' === typeof o1) return 1;
            if ('undefined' === typeof o2) return -1;        
            var v1 = JSUS.getNestedValue(d,o1);
            var v2 = JSUS.getNestedValue(d,o2);
//            NDDB.log(v1);
//            NDDB.log(v2);
            if ('undefined' === typeof v1 && 'undefined' === typeof v2) return 0;
            if ('undefined' === typeof v1) return 1;
            if ('undefined' === typeof v2) return -1;
            if (v1 > v2) return 1;
            if (v2 > v1) return -1;
            return 0;
        };    
    };
    
    /**
     * Returns TRUE if this[key] exists
     */
    NDDB.prototype.isReservedWord = function (key) {
    	return (this[key]) ? true : false; 
    };
    
    /**
     * Adds an hashing function for the dimension d.
     * 
     * If no function is specified Object.toString is used.
     * 
     */
    NDDB.prototype.hash = NDDB.prototype.h = function (d, func) {
    	if ('undefined' === typeof d) {
    		NDDB.log('Cannot hash empty dimension', 'ERR');
    		return false;
    	}
    	
    	func = func || Object.toString;
    	
    	if (this.isReservedWord(d)) {
    		var str = 'A reserved word have been selected as an index. ';
    		str += 'Please select another one: ' + d;
    		NDDB.log(str, 'ERR');
    		return false;
    	}
    	
    	this.__H[d] = func;
    	
    	this[d] = {};
    	
    	return true;
    };
    
    /**
     * Resets and rebuilds the databases indexes defined
     * by the hashing functions
     */
    NDDB.prototype.rebuildIndexes = function() {
    	if (JSUS.isEmpty(this.__H)) {
    		return false;
    	} 	
    	// Reset current indexes
    	for (var key in this.__H) {
    		if (this.__H.hasOwnProperty(key)) {
    			this[key] = {};
    		}
    	}
    	
    	this.each(this.hashIt)
    };
    
    /**
     * Hashes an element and adds it to one of the indexes,
     * as defined by the hashing functions
     */
    NDDB.prototype.hashIt = function(o) {
      	if (!o) return false;
    	if (JSUS.isEmpty(this.__H)) {
    		return false;
    	}
    
    	var h = null,
    		id = null,
    		hash = null;
    	
    	for (var key in this.__H) {
    		if (this.__H.hasOwnProperty(key)) {
    			h = this.__H[key];	    			
    			hash = h(o);

				if ('undefined' === typeof hash) {
					continue;
				}

				if (!this[key]) {
					this[key] = {};
				}
				
				if (!this[key][hash]) {
					this[key][hash] = new NDDB();
				}
				this[key][hash].insert(o);		
    		}
    	}
    };
    
    //////////////////////
    // 1. Sort and Select
    /////////////////////
    
    /**
     * Validates and prepares select queries before execution
     * 
     *  @api private
     */
    NDDB.prototype._analyzeQuery = function (d, op, value) {
        
        var raiseError = function (d,op,value) {
            var miss = '(?)';
            var err = 'Malformed query: ' + d || miss + ' ' + op || miss + ' ' + value || miss;
            NDDB.log(err, 'WARN');
            return false;
        };
        
    
        if ('undefined' === typeof d) raiseError(d,op,value);
        
        // Verify input 
        if ('undefined' !== typeof op) {
            if ('undefined' === typeof value) {
                raiseError(d,op,value);
            }
            
            if (!JSUS.in_array(op, ['>','>=','>==','<', '<=', '<==', '!=', '!==', '=', '==', '===', '><', '<>', 'in', '!in'])) {
                NDDB.log('Query error. Invalid operator detected: ' + op, 'WARN');
                return false;
            }
            
            if (op === '=') {
                op = '==';
            }
            
            // Range-queries need an array as third parameter
            if (JSUS.in_array(op,['><', '<>', 'in', '!in'])) {
                if (!(value instanceof Array)) {
                    NDDB.log('Range-queries need an array as third parameter', 'WARN');
                    raiseError(d,op,value);
                }
                if (op === '<>' || op === '><') {
                    
                    value[0] = JSUS.setNestedValue(d,value[0]);
                    value[1] = JSUS.setNestedValue(d,value[1]);
                }
            }
            else {
                // Encapsulating the value;
                value = JSUS.setNestedValue(d,value);
            }
        }
        else if ('undefined' !== typeof value) {
            raiseError(d,op,value);
        }
        else {
            op = '';
            value = '';
        }
        
        return {d:d,op:op,value:value};
    };
    
    /**
     * Select entries in the database according to the criteria 
     * specified as parameters.
     * 
     * Input parameters:
     * 
     *     - d: the string representation of the dimension used to filter. Mandatory.
     *     - op: operator for selection. Allowed: >, <, >=, <=, = (same as ==), ==, ===, 
     *             !=, !==, in (in array), !in, >< (not in interval), <> (in interval)
     *  - value: values of comparison. Operators: in, !in, ><, <> require an array.
     *  
     *  The selection is returned as a new NDDB object, on which further operations 
     *  can be chained. In order to get the actual entries of the db, it is necessary
     *  to fetch the values.
     *  
     *  @see NDDB.fetch()
     *  @see NDDB.fetchValues()
     */
    NDDB.prototype.select = function (d, op, value) {
    
        var valid = this._analyzeQuery(d, op, value);        
        if (!valid) return false;
        
        var d = valid.d;
        var op = valid.op;
        var value = valid.value;

        var comparator = this.comparator(d);
        
//        NDDB.log(comparator.toString());
//        NDDB.log(value);
        
        var exist = function (elem) {
            if ('undefined' !== typeof JSUS.getNestedValue(d,elem)) return elem;
        };
        
        var compare = function (elem) {
            try {    
//                console.log(elem);
//                console.log(value);
                if (JSUS.eval(comparator(elem, value) + op + 0, elem)) {
                    return elem;
                }
            }
            catch(e) {
                NDDB.log('Malformed select query: ' + d + op + value);
                return false;
            };
        };
        
        var between = function (elem) {
            if (comparator(elem, value[0]) > 0 && comparator(elem, value[1]) < 0) {
                return elem;
            }
        };
        
        var notbetween = function (elem) {
            if (comparator(elem, value[0]) < 0 && comparator(elem, value[1] > 0)) {
                return elem;
            }
        };
        
        var inarray = function (elem) {
            if (JSUS.in_array(JSUS.getNestedValue(d,elem), value)) {
                return elem;
            }
        };
        
        var notinarray = function (elem) {
            if (!JSUS.in_array(JSUS.getNestedValue(d,elem), value)) {
                return elem;
            }
        };
        
        switch (op) {
            case (''): var func = exist; break;
            case ('<>'): var func = notbetween; break;
            case ('><'): var func = between; break;
            case ('in'): var func = inarray; break;
            case ('!in'): var func = notinarray; break;
            default: var func = compare;
        }
        
        return this.filter(func);
    };

    /**
     * Creates a copy of the current database limited only to 
     * the first N entries, where N is the passed parameter.
     * 
     * Negative N selects starting from the end of the database.
     * 
     */
    NDDB.prototype.limit = function (limit) {
        if (limit === 0) return this.breed();
        var db = (limit > 0) ? this.db.slice(0, limit) :
                               this.db.slice(limit);
        
        return this.breed(db);
    };
        
    /**
     * Reverses the order of all the entries in the database
     * 
     */
    NDDB.prototype.reverse = function () {
        this.db.reverse();
        return this;
    };
        
    /**
     * Sort the db according to one of the following
     * criteria:
     *  
     *  - globalCompare function, if no parameter is passed 
     *  - one of the dimension, if a string is passed
     *  - a custom comparator function 
     * 
     * A reference to the current NDDB object is returned, so that
     * further operations can be chained. 
     * 
     */
      NDDB.prototype.sort = function (d) {
        // GLOBAL compare  
        if (!d) {
            var func = this.globalCompare;
        }
        
        // FUNCTION  
        else if ('function' === typeof d) {
          var func = d;
        }
        
        // ARRAY of dimensions
        else if (d instanceof Array) {
          var that = this;
          var func = function (a,b) {
            for (var i=0; i < d.length; i++) {
              var result = that.comparator(d[i]).call(that,a,b);
              if (result !== 0) return result;
            }
            return result;
          }
        }
        
        // SINGLE dimension
        else {
          var func = this.comparator(d);
        }
        
        this.db.sort(func);
        return this;
      };

    /**
     * Randomly shuffles all the entries of the database
     * 
     */
    NDDB.prototype.shuffle = function () {
        // TODO: check do we need to reassign __nddbid__ ?
        this.db = JSUS.shuffle(this.db);
        return true;
    };
        
    ////////////////////// 
    // 2. Custom callbacks
    //////////////////////
      
    /**
     * Filters the entries of the database according to the
     * specified callback function. A new NDDB instance is breeded.
     * 
     * @see NDDB.breed()
     * 
     */
    NDDB.prototype.filter= function (func) {
        return this.breed(this.db.filter(func));
    };
    
    
    /**
     * Applies a callback function to each element in the db.
     * 
     * It accepts a variable number of input arguments, but the first one 
     * must be a valid callback, and all the following are passed as parameters
     * to the callback
     * 
     */
    NDDB.prototype.each = NDDB.prototype.forEach = function () {
        if (arguments.length === 0) return;
        var func = arguments[0];    
        for (var i=0; i < this.db.length; i++) {
            arguments[0] = this.db[i];
            func.apply(this, arguments);
        }
    };
    
    /**
     * Applies a callback function to each element in the db, store
     * the results in an array and returns it.
     * 
     * @see NDDB.prototype.forEach
     * 
     */
    NDDB.prototype.map = function () {
        if (arguments.length === 0) return;
        var func = arguments[0];
        var out = [];
        var o = undefined;
        for (var i=0; i < this.db.length; i++) {
            arguments[0] = this.db[i];
            o = func.apply(this, arguments);
            if ('undefined' !== typeof o) out.push(o);
        }
        return out;
    };
    
    //////////////
    // 3. Deletion
    //////////////
    
    /**
     * Removes all entries from the database.  
     * If chained to a select query, elements in the parent 
     * object will be deleted too.
     * 
     */
    NDDB.prototype.delete = function () {
    	if (!this.length) return this;
      
    	if (this.__parent) {    	  
    		for (var i=0; i < this.db.length; i++) {
    			// Important: index changes as we deletes elements
    			var idx = this.db[i].nddbid - i;
    			this.__parent.db.splice(idx,1);
	        }
	        // TODO: we could make it with only one for loop
	        // we loop on parent db and check whether the id is in the array
	        // at the same time we decrement the nddbid depending on i
	        for (var i=0; i < this.__parent.length; i++) {
	        	this.__parent.db[i].nddbid = i;
	        }
    	}
     
    	this.db = [];
    	this._autoUpdate();
    	return this;
    };    
    
    /**
     * Removes all entries from the database. Requires an
     * additional parameter to confirm the deletion.
     * 
     * If chained to a select query, elements in parent 
     * object will be unaffected.
     * 
     */
    NDDB.prototype.clear = function (confirm) {
        if (confirm) {
            this.db = [];
            this._autoUpdate();
        }
        else {
            NDDB.log('Do you really want to clear the current dataset? Please use clear(true)', 'WARN');
        }
        
        return confirm;
    };    
    
    /////////////////////////
    // 4. Advanced operations
    /////////////////////////
    
    /**
     * Performs a *left* join across all the entries of the database
     * 
     * @see NDDB._join
     * 
     */
    NDDB.prototype.join = function (key1, key2, pos, select) {
        // Construct a better comparator function
        // than the generic JSUS.equals
//        if (key1 === key2 && 'undefined' !== typeof this.__C[key1]) {
//            var comparator = function(o1,o2) {
//                if (this.__C[key1](o1,o2) === 0) return true;
//                return false;
//            }
//        }
//        else {
//            var comparator = JSUS.equals;
//        }
        return this._join(key1, key2, JSUS.equals, pos, select);
    };
    
    /**
     * Copies all the entries (or selected properties of them) containing key2 
     * in all the entries containing key1.
     * 
     *  @see NDDB._join
     */
    NDDB.prototype.concat = function (key1, key2, pos, select) {        
        return this._join(key1, key2, function(){ return true;}, pos, select);
    };

    /**
     * Performs a *left* join across all the entries of the database
     * 
     * A new property is created in every matching entry contained the 
     * matched ones, or selected properties of them.  
     * 
     * Accepts two keys, a comparator function, the name of the containing 
     * property (default "joined") for matched entries, and an array with
     * the name of properties to select and copy in the matched entry.  
     * 
     * The values of two keys (also nested properties are accepted) are compared
     * according to the specified comparator callback, or using JSUS.equals.
     * 
     * A new NDDB object breeded, so that further operations can be chained.
     * 
     * TODO: check do we need to reassign __nddbid__ ?
     * 
     * @see NDDB.breed
     * 
     * @api private
     */
    NDDB.prototype._join = function (key1, key2, comparator, pos, select) {
        var comparator = comparator || JSUS.equals;
        var pos = ('undefined' !== typeof pos) ? pos : 'joined';
        if (select) {
            var select = (select instanceof Array) ? select : [select];
        }
        var out = [];
        var idxs = [];
        for (var i=0; i < this.db.length; i++) {
            try {
                var foreign_key = JSUS.eval('this.'+key1, this.db[i]);
                if ('undefined' !== typeof foreign_key) { 
                    for (var j=i+1; j < this.db.length; j++) {
                        try {
                            var key = JSUS.eval('this.'+key2, this.db[j]);
                            if ('undefined' !== typeof key) { 
                                if (comparator(foreign_key, key)) {
                                    // Inject the matched obj into the
                                    // reference one
                                    var o = JSUS.clone(this.db[i]);
                                    var o2 = (select) ? JSUS.subobj(this.db[j], select) : this.db[j];
                                    o[pos] = o2;
                                    out.push(o);
                                }
                            }
                        }
                        catch(e) {
                            NDDB.log('Key not found in entry: ' + key2, 'WARN');
                            //return false;
                        }
                    }
                }
            }
            catch(e) {
                NDDB.log('Key not found in entry: ' + key1, 'WARN');
                //return false;
            }
        }
        
        return this.breed(out);
    };
    
    /**
     * Splits an object along a specified dimension, and returns 
     * all the copies in an array.
     *  
     * It creates as many new objects as the number of properties 
     * contained in the specified dimension. The object are identical,
     * but for the given dimension, which was split. E.g.
     * 
     *  var o = { a: 1,
     *            b: {c: 2,
     *                d: 3
     *            },
     *            e: 4
     *  };
     *  
     *  becomes
     *  
     *  [{ a: 1,
     *     b: {c: 2},
     *     e: 4
     *  },
     *  { a: 1,
     *    b: {d: 3},
     *    e: 4
     *  }];
     * 
     */
    NDDB.prototype._split = function (o, key) {        
        
        if ('object' !== typeof o[key]) {
            return JSUS.clone(o);
        }
        
        var out = [];
        var model = JSUS.clone(o);
        model[key] = {};
        
        var splitValue = function (value) {
            for (var i in value) {
                var copy = JSUS.clone(model);
                if (value.hasOwnProperty(i)) {
                    if ('object' === typeof value[i]) {
                        out = out.concat(splitValue(value[i]));
                    }
                    else {
                        copy[key][i] = value[i]; 
                        out.push(copy);
                    }
                }
            }
            return out;
        };
        
        return splitValue(o[key]);
    };
    
    /**
     * Splits all the entries in the database containing
     * the passed dimension. 
     * 
     * New entries are created and a new NDDB object is
     * breeded to allows method chaining.
     * 
     * @see NDDB._split
     * 
     */
    NDDB.prototype.split = function (key) {    
        var out = [];
        for (var i=0; i < this.db.length;i++) {
            out = out.concat(this._split(this.db[i], key));
        }
        //console.log(out);
        return this.breed(out);
    };
    
    //////////////
    // 5. Fetching
    //////////////
    
    /**
     * Performs the fetching of the entries according to the
     * specified parameters. 
     * 
     * @api private
     * 
     * @see NDDB.fetch
     * @see NDDB.fetchArray
     * @see NDDB.fetchKeyArray
     * 
     */
    NDDB.prototype._fetch = function (key, array) {
        
        function getValues (o, key) {        
            return JSUS.getNestedValue(key, o);
        };
        
        function getValuesArray (o, key) {
            var el = JSUS.getNestedValue(key, o);
            if ('undefined' !== typeof el) {
                return JSUS.obj2KeyedArray(el);
            }
        };
        
        function getKeyValuesArray (o, key) {
            var el = JSUS.getNestedValue(key, o);
            if ('undefined' !== typeof el) {
                return key.split('.').concat(JSUS.obj2KeyedArray(el));
            }
        };
                
        switch (array) {
            case 'VALUES':
                var func = (key) ? getValuesArray : 
                                   JSUS.obj2Array;
                
                break;
            case 'KEY_VALUES':
                var func = (key) ? getKeyValuesArray :
                                   JSUS.obj2KeyedArray;
                break;
                
            default: // results are not 
                if (!key) return this.db;
                var func = getValues;        
        }
        
        var out = [];    
        for (var i=0; i < this.db.length; i++) {
            var el = func.call(this.db[i], this.db[i], key);
            if ('undefined' !== typeof el) out.push(el);
        }    
        
        return out;
    }
    
    /**
     * Fetches all the entries in the database and returns 
     * them in a array. 
     * 
     * If a second key parameter is passed, only the value of 
     * the property named after the key are returned, otherwise  
     * the whole entry is returned as it is. E.g.:
     * 
     * 
     * var nddb = new NDDB();
     * nddb.import([{a:1,
     *                  b:{c:2},
     *                  d:3
     *               }]);
     * 
     * nddb.fetch();    // [ {a: 1, b: {c: 2}, d: 3} ] 
     * nddb.fetch('b'); // [ {c: 2} ];
     * nddb.fetch('d'); // [ 3 ];
     * 
     * No further chaining is permitted after fetching.
     * 
     * @see NDDB._fetch
     * @see NDDB.fetchArray
     * @see NDDB.fetchKeyArray
     * 
     */
    NDDB.prototype.fetch = function (key) {
        return this._fetch(key, true);
    };
    
    /**
     * Fetches all the entries in the database, transforms them into 
     * one-dimensional array by exploding all nested values, and returns
     * them into an array.
     * 
     * If a second key parameter is passed, only the value of the property
     * named after the key is returned, otherwise the whole entry 
     * is exploded, and its values returned in a array.  E.g.:
     * 
     * var nddb = new NDDB();
     * nddb.import([{a:1,
     *                  b:{c:2},
     *                  d:3
     *               }]);
     * 
     * nddb.fetchArray();     // [ [ 1, 2, 3 ] ]
     * nddb.fetchArray('b'); // [ ['c', 2 ] ]
     * nddb.fetchArray('d'); // [ [ 3 ] ];
     * 
     * 
     */
    NDDB.prototype.fetchArray = function (key) {
        return this._fetch(key, 'VALUES');
    };
    
    /**
     * Exactly as NDDB.fetchArray, but also the keys are added to the
     * returned values. E.g.
     * 
     * var nddb = new NDDB();
     * nddb.import([{a:1,
     *                  b:{c:2},
     *                  d:3
     *               }]);
     * 
     * nddb.fetchArray();        // [ [ 'a', 1, 'c', 2, 'd', 3 ] ]
     * nddb.fetchKeyArray('b'); // [ [ 'b', 'c', 2 ] ] 
     * nddb.fetchArray('d');    // [ [ 'd', 3 ] ]
     * 
     * @see NDDB.fetchArray
     */
    NDDB.prototype.fetchKeyArray = function (key) {
        return this._fetch(key, 'KEY_VALUES');
    };
    
    /**
     * @deprecated
     * @see NDDB.fetchArray
     * 
     */
    NDDB.prototype.fetchValues = function (key) {
        return this._fetch(key, 'VALUES');
    };
    
    /**
     * @deprecated
     * @see NDDB.fetchKeyArray
     */
    NDDB.prototype.fetchKeyValues = function (key) {
        return this._fetch(key, 'KEY_VALUES');
    };
                
    /**
     * Splits the entries in the database in subgroups,
     * each of them formed up by element which have the
     * same value along the specified dimension. An array
     * of NDDB instances is returned, therefore no direct 
     * method chaining is allowed afterwards. 
     * 
     * Entries containing undefined values in the specified
     * dimension will be skipped 
     * 
     */
    NDDB.prototype.groupBy = function (key) {
        if (!key) return this.db;
        
        var groups = [];
        var outs = [];
        for (var i=0; i < this.db.length; i++) {
            var el = JSUS.getNestedValue(key, this.db[i]);
            if ('undefined' === typeof el) continue;
            
            // Creates a new group and add entries
            // into it
            if (!JSUS.in_array(el, groups)) {
                groups.push(el);
                
                var out = this.filter(function (elem) {
                    if (JSUS.equals(JSUS.getNestedValue(key, elem),el)) {
                        return this;
                    }
                });
                
                // Reset nddb_pointer in subgroups
                out.nddb_pointer = 0;
                
                outs.push(out);
            }
            
        }
        
        //NDDB.log(groups);
        
        return outs;
    };    
    
    
    ////////////////
    // 6. Statistics
    ////////////////
    
    /**
     * Returns the total count of all the entries 
     * in the database containing the specified key. 
     * 
     * If key is undefined, the size of the databse is returned.
     * 
     * @see NDDB.size
     */
    NDDB.prototype.count = function (key) {
        if ('undefined' === typeof key) return this.db.length;
        var count = 0;
        for (var i=0; i < this.db.length; i++) {
            try {
                var tmp = JSUS.eval('this.' + key, this.db[i]);
                if ('undefined' !== typeof tmp) {
                    count++;
                }
            }
            catch (e) {};
        }    
        return count;
    };
    
    
    /**
     * Returns the total sum of the values of all the entries 
     * in the database containing the specified key. 
     * 
     * Non numeric values are ignored. 
     * 
     */
    NDDB.prototype.sum = function (key) {
        var sum = 0;
        for (var i=0; i < this.db.length; i++) {
            try {
                var tmp = JSUS.getNestedValue(key, this.db[i]);
                if (!isNaN(tmp)) {
                    sum += tmp;
                }
            }
            catch (e) {};
        }    
        return sum;
    };
    
    /**
     * Returns the average of the values of all the entries 
     * in the database containing the specified key. 
     * 
     * Entries with non numeric values are ignored, and excluded
     * from the computation of the mean.
     * 
     */
    NDDB.prototype.mean = function (key) {
        var sum = 0;
        var count = 0;
        for (var i=0; i < this.db.length; i++) {
            try {
                var tmp = JSUS.eval('this.' + key, this.db[i]);
                if (!isNaN(tmp)) { 
                    //NDDB.log(tmp);
                    sum += tmp;
                    count++;
                }
            }
            catch (e) {};
        }    
        return (count === 0) ? 0 : sum / count;
    };
    
    /**
     * Returns the standard deviation of the values of all the entries 
     * in the database containing the specified key. 
     * 
     * Entries with non numeric values are ignored, and excluded
     * from the computation of the standard deviation.
     * 
     */
    NDDB.prototype.stddev = function (key) {	
        var mean = this.mean(key);
        if (isNaN(mean)) return false;
        
        var V = 0;
        this.each(function(e){
            try {
                var tmp = JSUS.eval('this.' + key, e);
                if (!isNaN(tmp)) { 
                	V += Math.pow(tmp - mean, 2)
                    //NDDB.log(tmp);
                }
            }
            catch (e) {};
        });
        
        return (V !== 0) ? Math.sqrt(V) : 0;
    };
    
    
    /**
     * Returns the min of the values of all the entries 
     * in the database containing the specified key. 
     * 
     * Entries with non numeric values are ignored. 
     * 
     */
    NDDB.prototype.min = function (key) {
        var min = false;
        for (var i=0; i < this.db.length; i++) {
            try {
                var tmp = JSUS.eval('this.' + key, this.db[i]);
                if (!isNaN(tmp) && (tmp < min || min === false)) {
                    min = tmp;
                }
            }
            catch (e) {};
        }    
        return min;
    };

    /**
     * Returns the max of the values of all the entries 
     * in the database containing the specified key. 
     * 
     * Entries with non numeric values are ignored. 
     * 
     */
    NDDB.prototype.max = function (key) {
        var max = false;
        for (var i=0; i < this.db.length; i++) {
            try {
                var tmp = JSUS.eval('this.' + key, this.db[i]);
                if (!isNaN(tmp) && (tmp > max || max === false)) {
                    max = tmp;
                }
            }
            catch (e) {};
        }    
        return max;
    };
        
    //////////
    // 7. Diff
    /////////
    
    /**
     * Performs a diff of the entries in the database and the database
     * object passed as parameter (can be instance of Array or NDDB).
     * 
     * Returns all the entries which are present in the current
     * instance of NDDB and *not* in the database obj passed 
     * as parameter.
     * 
     */
    NDDB.prototype.diff = function (nddb) {
        if (!nddb) return this;
        if ('object' === typeof nddb) {
            if (nddb instanceof NDDB || nddb instanceof this.constructor) {
                var nddb = nddb.db;
            }
        }
        if (nddb.length === 0) return this;
        var that = this;
        return this.filter(function(el) {
            for (var i=0; i < nddb.length; i++) {
                if (that.globalCompare(el,nddb[i]) === 0) {
                    return false;
                }
            }
            return el;
        });
    };
    
    /**
     * Performs a diff of the entries in the database and the database 
     * object passed as parameter (can be instance of Array or NDDB).
     * 
     * Returns all the entries which are present both in the current
     * instance of NDDB and in the database obj passed as parameter.
     * 
     */
    NDDB.prototype.intersect = function (nddb) {
        if (!nddb) return this;
        if ('object' === typeof nddb) {
            if (nddb instanceof NDDB || nddb instanceof this.constructor) {
                var nddb = nddb.db;
            }
        }
        var that = this;
        return this.filter(function(el) {
            for (var i=0; i < nddb.length; i++) {
                if (that.globalCompare(el,nddb[i]) === 0) {
                    return el;
                }
            }
        });
    };
    
    /////////////
    // 8 Iterator
    ////////////
    
    /**
     * Returns the entry in the database, at which 
     * the iterator is currently pointing. 
     * 
     * If a parameter is passed, then returns the entry
     * with the same internal id. The pointer is *not*
     * automatically updated. 
     * 
     * Returns false, if the pointer is at invalid position.
     * 
     */
    NDDB.prototype.get = function (pos) {
        var pos = pos || this.nddb_pointer;
        if (pos < 0 || pos > (this.db.length-1)) {
        	return false;
        }
        return this.db[pos];
    };
        
    /**
     * Moves the pointer to the next entry in the database 
     * and returns it.
     * 
     * Returns false if the pointer is at the last entry,
     * or if database is empty.
     * 
     */
    NDDB.prototype.next = function () {
        var el = NDDB.prototype.get.call(this, ++this.nddb_pointer);
        if (!el) this.nddb_pointer--;
        return el;
    };
    
    /**
     * Moves the pointer to the previous entry in the database 
     * and returns it.
     * 
     * Returns false if the pointer is at the first entry,
     * or if database is empty.
     * 
     */
    NDDB.prototype.previous = function () {
        var el = NDDB.prototype.get.call(this, --this.nddb_pointer);
        if (!el) this.nddb_pointer++;
        return el;
    };
    
    /**
     * Moves the pointer to the first entry in the database.
     * 
     * Returns the first entry of the database, or undefined 
     * if the database is empty.
     * 
     */
    NDDB.prototype.first = function (key) {
        var db = this.fetch(key);
        if (db.length > 0) {
            this.nddb_pointer = db[0].nddbid;
            return db[0];
        }
        return undefined;
    };
    
    /**
     * Moves the pointer to the first last in the database.
     * 
     * Returns the last entry of the database, or undefined 
     * if the database is empty.
     * 
     */
    NDDB.prototype.last = function (key) {
        var db = this.fetch(key);
        if (db.length > 0) {
            this.nddb_pointer = db[db.length-1].nddbid;
            return db[db.length-1];
        }
        return undefined;
    };
    
    /////////////
    // 9. Tagging
    /////////////
    
    /**
     * Registers a tag associated to an internal id.
     * 
     * @TODO: tag should be updated with shuffling and sorting
     * operations.
     * 
     * @status: experimental
     * 
     * @see NDDB.resolveTag
     */
    NDDB.prototype.tag = function (tag, idx) {
        if ('undefined' === typeof tag) {
            NDDB.log('Cannot register empty tag.', 'ERR');
            return;
        }
        var idx = idx || this.nddb_pointer;
        this.tags[tag] = idx;
    };
    
    /**
     * Returns the element associated to the given tag.
     * 
     * @status: experimental
     */
    NDDB.prototype.resolveTag = function (tag) {
        if ('undefined' === typeof tag) return false;
        return this.tags[tag];
    };
    
    
 // if node
	if ('object' === typeof module && 'function' === typeof require) {
	    
		require('./external/cycle.js');		
		var fs = require('fs');
	    
	    
	    NDDB.prototype.save = function (file, callback) {
	    	if (!file) {
	    		NDDB.log('You must specify a valid file.', 'ERR');
	    		return false;
	    	}
			fs.writeFile(file, this.stringify(), 'utf-8', function(e) {
				if (e) throw e
				if (callback) callback();
			});
		};
		
		NDDB.prototype.load = function (file, sync, callback) {
			if (!file) {
				NDDB.log('You must specify a valid file.', 'ERR');
				return false;
			}
			sync = ('undefined' !== typeof sync) ? sync : true; 
			
			var loadString = function(s) {
				var items = JSON.parse(s.toString());
				//console.log(s);
				var i;
				for (i=0; i< items.length; i++) {
					// retrocycle if possible
					items[i] = NDDB.retrocycle(items[i]);
				}
//					console.log(Object.prototype.toString.apply(items[0].aa))
				
				this.import(items);
//				this.each(function(e) {
//					e = NDDB.retrocycle(e);
//				});
			}
			
			if (sync) { 
				var s = fs.readFileSync(file, 'utf-8');
				loadString.call(this, s);
			}
			else {
				fs.readFile(file, 'utf-8', function(e, s) {
					if (e) throw e
					loadString.call(this, s);
					if (callback) callback();
				});
			}
		};
		
	}
	// end node
    
    
})(
    'undefined' !== typeof module && 'undefined' !== typeof module.exports ? module.exports: window
  , 'undefined' != typeof JSUS ? JSUS : module.parent.exports.JSUS || require('JSUS').JSUS
);
/**
 * # nodeGame
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * ### nodeGame: Web Experiments in the Browser
 * 
 * nodeGame is a free, open source, event-driven javascript framework for on line, 
 * multiplayer games in the browser.
 * 
 * 
 */

(function (node) {

node.version = '0.7.5';

/**
 *  ## node.verbosity
 *  
 *  The minimum level for a log entry to be displayed as output.
 *   
 *  Defaults, only errors are displayed.
 *  
 */
node.verbosity = 0;
node.verbosity_levels = {
		// <!-- It is not really always... -->
		ALWAYS: -(Number.MIN_VALUE+1), 
		ERR: -1,
		WARN: 0,
		INFO: 1,
		DEBUG: 100
};

/**
 * ## node.log
 * 
 * Default nodeGame standard out, override to redirect
 * 
 * Default behavior is to output a text in the form: `nodeGame: some text`.
 * 
 * Logs entries are displayed only if their verbosity level is 
 * greater than `node.verbosity`
 * 
 * @param {string} txt The text to output
 * @param {string|number} level Optional. The verbosity level of this log. Defaults, level = 0
 * @param {string} prefix Optional. A text to display at the beginning of the log entry. Defaults prefix = 'nodeGame: ' 
 * 
 */
node.log = function (txt, level, prefix) {
	if ('undefined' === typeof txt) return false;
	
	level 	= level || 0;
	prefix 	= ('undefined' === typeof prefix) 	? 'nodeGame: '
												: prefix;
	if ('string' === typeof level) {
		level = node.verbosity_levels[level];
	}
	if (node.verbosity > level) {
		console.log(prefix + txt);
	}
};

// <!-- It will be overwritten later -->
node.game 		= {};
node.gsc 		= {};
node.session 	= {};
node.player 	= {};
node.memory 	= {};

// <!-- Load the auxiliary library if available in the browser -->
if ('undefined' !== typeof JSUS) node.JSUS = JSUS;
if ('undefined' !== typeof NDDB) node.NDDB = NDDB;
if ('undefined' !== typeof store) node.store = store;

// <!-- if node
if ('object' === typeof module && 'function' === typeof require) {
    require('./init.node.js');
    require('./nodeGame.js');
}
// end node -->
	
})('object' === typeof module ? module.exports : (window.node = {}));	
/**
 * # EventEmitter
 * 
 * Event emitter engine for `nodeGame`
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 * 
 * Keeps a register of events and function listeners.
 * 
 * ---
 *  
 */
(function (exports, node) {
		
// ## Global scope	
	
var NDDB = node.NDDB;

exports.EventEmitter = EventEmitter;

/**
 * ## EventEmitter constructor
 * 
 * Creates a new instance of EventEmitter
 */
function EventEmitter() {

// ## Public properties	
	
/**
 * ### EventEmitter._listeners
 * 
 * Global listeners always active during the game
 * 
 */	
    this._listeners = {};
    
 /**
  * ### EventEmitter._localListeners
  * 
  * Local listeners erased after every state update
  * 
  */   
    this._localListeners = {};

/**
 * ### EventEmitter.history
 * 
 * Database of emitted events
 * 
 * 	@see NDDB
 * 	@see EventEmitter.store
 * 
 */      
    this.history = new NDDB({
    	update: {
    		indexes: true,
    }});
    
    this.history.h('state', function(e) {
    	if (!e) return;
    	var state = ('object' === typeof e.state) ? e.state
    											  : node.game.state;
    	return node.GameState.toHash(state, 'S.s.r');
    });
 
/**
 * ### EventEmitter.store
 * 
 * If TRUE all emitted events are saved in the history database
 * 
 * 	@see EventEmitter.history
 */       
    this.store = true; // by default
}

// ## EventEmitter methods

EventEmitter.prototype = {

    constructor: EventEmitter,
	
/**
 * ### EventEmitter.addListener
 * 
 * Registers a global listener for an event
 * 
 * Listeners registered with this method are valid for the
 * whole length of the game
 * 
 * @param {string} type The event name
 * @param {function} listener The function to fire
 * 
 * @see EventEmitter.addLocalListener
 */
    addListener: function (type, listener) {
    	if (!type || !listener) return;
    	if ('undefined' === typeof this._listeners[type]){
    		this._listeners[type] = [];
    	}
        node.log('Added Listener: ' + type + ' ' + listener, 'DEBUG');
        this._listeners[type].push(listener);
    },
    
/**
 * ### EventEmitter.addLocalListener
 * 
 * Registers a local listener for an event
 * 
 * Listeners registered with this method are valid *only* 
 * for the same game state (step) in which they have been
 * registered 
 * 
 * @param {string} type The event name
 * @param {function} listener The function to fire
 * 
 * @see EventEmitter.addListener
 * 
 */
    addLocalListener: function (type, listener) {
    	if (!type || !listener) return;
    	if ('undefined' === typeof this._localListeners[type]){
            this._localListeners[type] = [];
        }
    	node.log('Added Local Listener: ' + type + ' ' + listener, 'DEBUG');
        this._localListeners[type].push(listener);
    },

/**
 * ### EventEmitter.emit
 * 
 * Fires all the listeners associated with an event
 * 
 * @param event {string|object} The event name or an object of the type
 * 
 * 		{ type: 'myEvent',
 * 		  target: this, } // optional
 * 
 * @param {object} p1 Optional. A parameter to be passed to the listener
 * @param {object} p2 Optional. A parameter to be passed to the listener
 * @param {object} p3 Optional. A parameter to be passed to the listener
 * 
 * @TODO accepts any number of parameters
 */
    emit: function(event, p1, p2, p3) { // Up to 3 parameters
    	if (!event) return;
    	
    	if ('string' === typeof event) {
            event = { type: event };
        }
        if (!event.target){
            event.target = this;
        }
        
        if (!event.type) {  //falsy
            throw new Error("Event object missing 'type' property.");
        }
    	// <!-- Debug
        // console.log('Fired ' + event.type); -->
        
        // Log the event into node.history object, if present
        if (this.store) {
        	var o = {
	        		event: event.type,
	        		//target: node.game,
	        		state: node.state,
	        		p1: p1,
	        		p2: p2,
	        		p3: p3,
	        	};
        	
        	this.history.insert(o);
        }
        
        
        // Fires global listeners
        if (this._listeners[event.type] instanceof Array) {
            var listeners = this._listeners[event.type];
            for (var i=0, len=listeners.length; i < len; i++){
            	listeners[i].call(this.game, p1, p2, p3);
            }
        }
        
        // Fires local listeners
        if (this._localListeners[event.type] instanceof Array) {
            var listeners = this._localListeners[event.type];
            for (var i=0, len=listeners.length; i < len; i++) {
            	listeners[i].call(this.game, p1, p2, p3);
            }
        }
       
    },

/**
 * ### EventEmitter.removeListener
 * 
 * Deregister an event, or an event listener
 * 
 * @param {string} type The event name
 * @param {function} listener Optional. The specific function to deregister 
 * 
 * @return Boolean TRUE, if the removal is successful
 */
	removeListener: function(type, listener) {
	
		function removeFromList(type, listener, list) {
	    	//<!-- console.log('Trying to remove ' + type + ' ' + listener); -->
	    	
	        if (list[type] instanceof Array) {
	        	if (!listener) {
	        		delete list[type];
	        		//console.log('Removed listener ' + type);
	        		return true;
	        	}
	        	
	            var listeners = list[type];
	            var len=listeners.length;
	            for (var i=0; i < len; i++) {
	            	//console.log(listeners[i]);
	            	
	                if (listeners[i] == listener) {
	                    listeners.splice(i, 1);
	                    node.log('Removed listener ' + type + ' ' + listener, 'DEBUG');
	                    return true;
	                }
	            }
	        }
	        
	        return false;
		}
		
		var r1 = removeFromList(type, listener, this._listeners);
		var r2 = removeFromList(type, listener, this._localListeners);
	
		return r1 || r2;
	},
    
/**
 * ### EventEmitter.clearState
 * 
 * Undocumented (for now)
 * 
 * @TODO: This method wraps up clearLocalListeners. To re-design.
 */ 
	clearState: function(state) {
		this.clearLocalListeners();
		return true;
	},
    
/**
 * ### EventEmitter.clearLocalListeners
 * 
 * Removes all entries from the local listeners register
 * 
 */
	clearLocalListeners: function() {
		node.log('Cleaning Local Listeners', 'DEBUG');
		for (var key in this._localListeners) {
			if (this._localListeners.hasOwnProperty(key)) {
				this.removeListener(key, this._localListeners[key]);
			}
		}
		
		this._localListeners = {};
	},
    
/**
 * ### EventEmitter.printAllListeners
 * 
 * Prints to console all the registered functions 
 */
	printAllListeners: function() {
		node.log('nodeGame:\tPRINTING ALL LISTENERS', 'DEBUG');
	    
		for (var i in this._listeners){
	    	if (this._listeners.hasOwnProperty(i)){
	    		console.log(i + ' ' + i.length);
	    	}
	    }
		
		for (var i in this._localListeners){
	    	if (this._listeners.hasOwnProperty(i)){
	    		console.log(i + ' ' + i.length);
	    	}
	    }
	    
}
};

/**
 * # Listener
 * 
 * Undocumented (for now)
 */

function Listener (o) {
	var o = o || {};
	
	// event name
	this.event = o.event; 					
	
	// callback function
	this.listener = o.listener; 			
	
	// events with higher priority are executed first
	this.priority = o.priority || 0; 	
	
	// the state in which the listener is
	// allowed to be executed
	this.state = o.state || node.state || undefined; 	
	
	// for how many extra steps is the event 
	// still valid. -1 = always valid
	this.ttl = ('undefined' !== typeof o.ttl) ? o.ttl : -1; 
	
	// function will be called with
	// target as 'this'		
	this.target = o.target || undefined;	
};
	 
// ## Closure

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
/**
 * # GameState
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * Representation of the state of a game: 
 * 
 * 	`state`: the higher-level building blocks of a game
 * 	`step`: the sub-unit of a state
 * 	`round`: the number of repetition for a state. Defaults round = 1
 * 	`is`: the *load-lavel* of the game as expressed in `GameState.iss`
 * 	`paused`: TRUE if the game is paused
 * 
 * 
 * @see GameLoop
 * 
 * ---
 * 
 */

(function (exports, node) {
	
// ## Global scope
	
var JSUS = node.JSUS;

// Expose constructor
exports.GameState = GameState;

/**
 * ### GameState.iss
 *  
 * Numeric representation of the state of the nodeGame engine 
 * the game
 *  
 */
GameState.iss = {};
GameState.iss.UNKNOWN = 0; 		// Game has not been initialized
GameState.iss.LOADING = 10;		// The game is loading
GameState.iss.LOADED  = 25;		// Game is loaded, but the GameWindow could still require some time
GameState.iss.PLAYING = 50;		// Everything is ready
GameState.iss.DONE = 100;		// The player completed the game state

GameState.defaults = {};

/**
 * ### GameState.defaults.hash
 * 
 * Default hash string for game-states
 * 
 * 	@see GameState.toHash
 */
GameState.defaults.hash = 'S.s.r.i.p';

/**
 * ## GameState constructor
 * 
 * Creates an instance of a GameState 
 * 
 * It accepts an object literal or an hash string as defined in `GameState.defaults.hash`.
 * 
 * If no parameter is passed, all the properties of the GameState 
 * object are set to 0
 * 
 * @param {object|string} gs An object literal | hash string representing the game state
 * 
 * 	@see GameState.defaults.hash 
 */
function GameState (gs) {

// ## Public properties	

/**
 * ### GameState.state
 * 
 * The N-th game-block (state) in the game-loop currently being executed
 * 
 * 	@see GameLoop
 * 
 */	
	this.state = 	0;

/**
 * ### GameState.step
 * 
 * The N-th game-block (step) nested in the current state
 * 
 * 	@see GameState.state
 * 
 */	
	this.step = 	0;

/**
 * ### GameState.round
 * 
 * The number of times the current state was repeated 
 * 
 */		
	this.round = 	0;
	
/**
 * ### GameState.is
 * 
 * 
 * 
 * 	@see GameState.iss
 * 
 */		
	this.is = 		GameState.iss.UNKNOWN;
	
/**
 * ### GameState.paused
 * 
 * TRUE if the game is paused
 * 
 */		
	this.paused = 	false;
	
	if ('string' === typeof gs) {
		var tokens = gs.split('.');		
		this.state = 	('undefined' !== typeof tokens[0]) ? Number(tokens[0]) : undefined;
		this.step = 	('undefined' !== typeof tokens[1]) ? Number(tokens[1]) : undefined;
		this.round = 	('undefined' !== typeof tokens[2]) ? Number(tokens[2]) : undefined;
		this.is = 		('undefined' !== typeof tokens[3]) ? Number(tokens[3]) : GameState.iss.UNKNOWN;
		this.paused = 	(tokens[4] === '1') ? true : false;
	}
	else if ('object' === typeof gs) {	
		this.state = 	gs.state;
		this.step = 	gs.step;
		this.round = 	gs.round;
		this.is = 		(gs.is) ? gs.is : GameState.iss.UNKNOWN;
		this.paused = 	(gs.paused) ? gs.paused : false;
	}
	
}

/**
 * ## GameState.toString
 * 
 * Converts the current instance of GameState to a string
 * 
 * @return {string} out The string representation of the state of the GameState
 */
GameState.prototype.toString = function () {
	var out = this.toHash('(r) S.s');
	if (this.paused) {
		out += ' [P]';
	}
	return out;
};

/**
 * ## GameState.toHash
 * 
 * Returns a simplified hash of the state of the GameState,
 * according to the input string
 * 
 * @param {string} str The hash code
 * @return {string} hash The hashed game states
 * 
 * @see GameState.toHash (static)
 */
GameState.prototype.toHash = function (str) {
	return GameState.toHash(this, str);
};

/**
 * ## GameState.toHash (static)
 * 
 * Returns a simplified hash of the state of the GameState,
 * according to the input string. 
 * 
 * The following characters are valid to determine the hash string
 * 
 * 	- S: state
 * 	- s: step
 * 	- r: round
 * 	- i: is
 * 	- P: paused
 * 
 * E.g. 
 * 
 * ```javascript
 * 		var gs = new GameState({
 * 							round: 1,
 * 							state: 2,
 * 							step: 1,
 * 							is: 50,
 * 							paused: false,
 * 		});
 * 
 * 		gs.toHash('(R) S.s'); // (1) 2.1
 * ```
 * 
 * @param {GameState} gs The game state to hash
 * @param {string} str The hash code
 * @return {string} hash The hashed game states
 */
GameState.toHash = function (gs, str) {
	if (!gs || 'object' !== typeof gs) return false;
	if (!str || !str.length) return gs.toString();
	
	var hash = '',
		symbols = 'Ssrip',
		properties = ['state', 'step', 'round', 'is', 'paused'];
	
	for (var i = 0; i < str.length; i++) {
		var idx = symbols.indexOf(str[i]); 
		hash += (idx < 0) ? str[i] : Number(gs[properties[idx]]);
	}
	return hash;
};

/**
 * ## GameState.compare (static)
 * 
 * Compares two GameState objects|hash strings and returns
 * 
 *  - 0 if they represent the same game state
 *  - a positive number if gs1 is ahead of gs2 
 *  - a negative number if gs2 is ahead of gs1 
 * 
 * If the strict parameter is set, also the `is` property is compared,
 * otherwise only `round`, `state`, and `step`
 * 
 * The accepted hash string format is the following: 'S.s.r.i.p'.
 * Refer to `GameState.toHash` for the semantic of the characters.
 * 
 * 
 * @param {GameState|string} gs1 The first GameState object|string to compare
 * @param {GameState|string} gs2 The second GameState object|string to compare
 * @param {Boolean} strict If TRUE, also the `is` attribute is checked
 * 
 * @return {Number} result The result of the comparison
 * 
 * @see GameState.toHash (static)
 * 
 */
GameState.compare = function (gs1, gs2, strict) {
	if (!gs1 && !gs2) return 0;
	if (!gs2) return 1;
	if (!gs1) return -1;

	strict = strict || false;

	// Convert the parameters to objects, if an hash string was passed
	if ('string' === typeof gs1) gs1 = new GameState(gs1);
	if ('string' === typeof gs2) gs2 = new GameState(gs2);
	
	
	// <!--		
	//		console.log('COMPARAING GSs','DEBUG')
	//		console.log(gs1,'DEBUG');
	//		console.log(gs2,'DEBUG');
	// -->
	var result = gs1.state - gs2.state;
	
	if (result === 0 && 'undefined' !== typeof gs1.round) {
		result = gs1.round - gs2.round;
		
		if (result === 0 && 'undefined' !== typeof gs1.step) {
			result = gs1.step - gs2.step;
			
			if (strict && result === 0 && 'undefined' !== typeof gs1.is) {
				result = gs1.is - gs2.is;
			}
		}
	}
	
	
//	<!-- console.log('EQUAL? ' + result); -->

	
	return result;
};

/**
 * ## GameState.stringify (static)
 * 
 * Converts an object GameState-like to its string representation
 * 
 * @param {GameState} gs The object to convert to string	
 * @return {string} out The string representation of a GameState object
 */ 
GameState.stringify = function (gs) {
	if (!gs) return;
	var out = new GameState(gs).toHash('(r) S.s_i');
	if (gs.paused) out += ' [P]';
	return out;
}; 

// ## Closure
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # PlayerList
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * Stores a collection of `Player` objects and offers methods
 * to perform operation on them
 * 
 * ---
 * 
 */

(function (exports, node) {


// ## Global scope
	
// Setting up global scope variables 
var	JSUS = node.JSUS,
	NDDB = node.NDDB;

var GameState = node.GameState;

// Exposing constructor
exports.PlayerList = PlayerList;

// Inheriting from NDDB	
PlayerList.prototype = JSUS.clone(NDDB.prototype);
PlayerList.prototype.constructor = PlayerList;


/**
 * ## PlayerList.array2Groups (static)
 * 
 * Transforms an array of array (of players) into an
 * array of PlayerList instances and returns it.
 * 
 * The original array is modified.
 * 
 * @param {Array} array The array to transform
 * @return {Array} array The array of `PlayerList` objects
 * 
 */
PlayerList.array2Groups = function (array) {
	if (!array) return;
	for (var i = 0; i < array.length; i++) {
		array[i] = new PlayerList({}, array[i]);
	};
	return array;
};

/**
 * ## PlayerList constructor
 *
 * Creates an instance of PlayerList.
 * 
 * The instance inherits from NDDB, an contains an internal 
 * database for storing the players 
 * 
 * @param {object} options Optional. Configuration options for the instance
 * @param {object} db Optional. An initial set of players to import 
 * @param {PlayerList} parent Optional. A parent object for the instance
 * 
 * @api public
 * 
 * 		@see NDDB constructor
 */

function PlayerList (options, db, parent) {
	options = options || {};
	if (!options.log) options.log = node.log;
	NDDB.call(this, options, db, parent);
  
	this.globalCompare = function (pl1, pl2) {
	  
		if (pl1.id === pl2.id) {
			return 0;
		}
		else if (pl1.count < pl2.count) {
			return 1;
		}
		else if (pl1.count > pl2.count) {
			return -1;
		}
		else {
			node.log('Two players with different id have the same count number', 'WARN');
			return 0;
		}
	};
};

// ## PlayerList methods

/**
 * ### PlayerList.add 
 * 
 * Adds a new player to the database
 * 
 * Before insertion, objects are checked to be valid `Player` objects.
 * 
 * @param {Player} player The player object to add to the database
 * @return {Boolean} TRUE, if the insertion was successful
 * 
 */
PlayerList.prototype.add = function (player) {
	// <!-- Check if the object contains the minimum requisite to act as Player -->
	if (!player || !player.sid || !player.id) {
		node.log('Only instance of Player objects can be added to a PlayerList', 'ERR');
		return false;
	}

	// <!-- Check if the id is unique -->
	if (this.exist(player.id)) {
		node.log('Attempt to add a new player already in the player list: ' + player.id, 'ERR');
		return false;
	}
	
	this.insert(player);
	player.count = player.nddbid;
	
	return true;
};

/**
 * ### PlayerList.remove
 * 
 * Removes a player from the database based on its id
 * 
 * Notice: this operation cannot be undone
 * 
 * @param {number} id The id of the player to remove
 * @return {Boolean} TRUE, if a player is found and removed successfully 
 * 
 * 		@see `PlayerList.pop`
 * 
 */
PlayerList.prototype.remove = function (id) {
	if (!id) return false;
		
	var p = this.select('id', '=', id);
	if (p.length) {
		p.delete();
		return true;
	}

	node.log('Attempt to remove a non-existing player from the the player list. id: ' + id, 'ERR');
	return false;
};

/**
 * ### PlayerList.get 
 * 
 * Retrieves a player with a given id and returns it
 * 
 * Displays a warning if more than one player is found with the same id
 * 
 * @param {number} id The id of the player to retrieve
 * @return {Player|Boolean} The player with the speficied id, or FALSE if no player was found
 * 
 * 		@see `PlayerList.pop`	
 * 
 */
PlayerList.prototype.get = function (id) {	
	if (!id) return false;
	
	var p = this.select('id', '=', id);
	
	if (p.count() > 0) {
		if (p.count() > 1) {
			node.log('More than one player found with id: ' + id, 'WARN');
			return p.fetch();
		}
		return p.first();
	}
	
	node.log('Attempt to access a non-existing player from the the player list. id: ' + id, 'ERR');
	return false;
};

/**
 * ### PlayerList.pop 
 * 
 * Retrieves a player with a given id, removes it from the database,
 * and returns it
 * 
 * Displays a warning if more than one player is found with the same id
 * 
 * @param {number} id The id of the player to retrieve
 * @return {Player|Boolean} The player with the speficied id, or FALSE if no player was found  
 * 
 * 		@see `PlayerList.remove`
 */
PlayerList.prototype.pop = function (id) {	
	if (!id) return false;
	
	var p = this.get(id);
	
	// <!-- can be either a Player object or an array of Players -->
	if ('object' === typeof p) {
		this.remove(id);
		return p;
	}
	
	return false;
};

/**
 * ### PlayerLIst.getAllIDs
 * 
 * Fetches all the id of the players in the database and
 * returns them into an array
 * 
 * @return {Array} The array of id of players
 * 
 */
PlayerList.prototype.getAllIDs = function () {	
	return this.map(function(o){return o.id;});
};

/**
 * ### PlayerList.updatePlayerState
 * 
 * Updates the value of the `state` object of a player in the database
 * 
 * @param {number} id The id of the player to update
 * @param {GameState} state The new value of the state property
 * @return {Boolean} TRUE, if update is successful
 * 
 */
PlayerList.prototype.updatePlayerState = function (id, state) {
	
	if (!this.exist(id)) {
		node.log('Attempt to access a non-existing player from the the player list ' + player.id, 'WARN');
		return false;	
	}
	
	if ('undefined' === typeof state) {
		node.log('Attempt to assign to a player an undefined state', 'WARN');
		return false;
	}
	
	this.select('id', '=', id).first().state = state;	

	return true;
};

/**
 * ### PlayerList.exist
 * 
 * Checks whether at least one player with a given player exists
 * 
 * @param {number} id The id of the player
 * @return {Boolean} TRUE, if a player with the specified id was found
 */
PlayerList.prototype.exist = function (id) {
	return (this.select('id', '=', id).count() > 0) ? true : false;
};

/**
 * ### PlayerList.isStateDone
 * 
 * Checks whether all players in the database are DONE
 * for the specified `GameState`.
 * 
 * @param {GameState} state Optional. The GameState to check. Defaults state = node.state
 * @param {Boolean} extended Optional. If TRUE, also newly connected players are checked. Defaults, FALSE
 * @return {Boolean} TRUE, if all the players are DONE with the specified `GameState`
 * 
 * 		@see `PlayerList.actives`
 * 		@see `PlayerList.checkState`
 */
PlayerList.prototype.isStateDone = function (state, extended) {
	
	// <!-- console.log('1--- ' + state); -->
	state = state || node.state;
	// <!-- console.log('2--- ' + state); -->
	extended = extended || false;
	
	var result = this.map(function(p){
		var gs = new GameState(p.state);
		// <!-- console.log('Going to compare ' + gs + ' and ' + state); -->
		
		// Player is done for his state
		if (p.state.is !== GameState.iss.DONE) {
			return 0;
		}
		// The state of the player is actually the one we are interested in
		if (GameState.compare(state, p.state, false) !== 0) {
			return 0;
		}
		
		return 1;
	});
	
	var i;
	var sum = 0;
	for (i=0; i<result.length;i++) {
		sum = sum + Number(result[i]);
	}
	
	var total = (extended) ? this.length : this.actives(); 
// <!--
//		console.log('ISDONE??')
//		console.log(total + ' ' + sum);
// -->	
	return (sum === total) ? true : false;
};

/**
 * ### PlayerList.actives
 * 
 * Counts the number of player whose state is different from 0:0:0
 * 
 * @return {number} result The number of player whose state is different from 0:0:0
 * 
 */
PlayerList.prototype.actives = function () {
	var result = 0;
	var gs;
	this.each(function(p) {
		gs = new GameState(p.state);	
		// <!-- Player is on 0.0.0 state -->
		if (GameState.compare(gs, new GameState()) !== 0) {
			result++;
		}
	});	
	// <!-- node.log('ACTIVES: ' + result); -->
	return result;
};

/**
 * ### PlayerList.checkState
 * 
 * If all the players are DONE with the specfied state,
 * emits a `STATEDONE` event
 * 
 * @param {GameState} state Optional. The GameState to check. Defaults state = node.state
 * @param {Boolean} extended Optional. If TRUE, also newly connected players are checked. Defaults, FALSE
 * 
 * 		@see `PlayerList.actives`
 * 		@see `PlayerList.isStateDone`
 * 
 */
PlayerList.prototype.checkState = function (state, extended) {
	if (this.isStateDone(state, extended)) {
		node.emit('STATEDONE');
	}
};

/**
 * ### PlayerList.toString
 * 
 * Returns a string representation of the state of the 
 * PlayerList
 * 
 * @param {string} eol Optional. End of line separator between players
 * @return {string} out The string representation of the state of the PlayerList
 */
PlayerList.prototype.toString = function (eol) {
	
	var out = '';
	var EOL = eol || '\n';
	
	this.forEach(function(p) {
    	out += p.id + ': ' + p.name;
    	var state = new GameState(p.state);
    	out += ': ' + state + EOL;
	});
	return out;
};

/**
 * ### PlayerList.getNGroups
 * 
 * Creates N random groups of players
 * 
 * @param {number} N The number of groups
 * @return {Array} Array containing N `PlayerList` objects 
 * 
 * 		@see `JSUS.getNGroups`
 */
PlayerList.prototype.getNGroups = function (N) {
	if (!N) return;
	var groups = JSUS.getNGroups(this.db, N);
	return PlayerList.array2Groups(groups);
};	

/**
 * ### PlayerList.getGroupsSizeN
 * 
 * Creates random groups of N players
 * 
 * @param {number} N The number player per group
 * @return {Array} Array containing N `PlayerList` objects 
 * 
 * 		@see `JSUS.getGroupsSizeN`
 */
PlayerList.prototype.getGroupsSizeN = function (N) {
	if (!N) return;
	var groups = JSUS.getGroupsSizeN(this.db, N);
	return PlayerList.array2Groups(groups);
};	

/**
 * ### PlayerList.getRandom
 * 
 * Returns a set of N random players 
 * 
 * @param {number} N The number of random players to include in the set. Defaults N = 1
 * @return {Player|Array} A single player object or an array of
 */
PlayerList.prototype.getRandom = function (N) {	
	if (!N) N = 1;
	if (N < 1) {
		node.log('N must be an integer >= 1', 'ERR');
		return false;
	}
	this.shuffle();
	
	if (N == 1) {
		return this.first();
	}
	
	return this.limit(N).fetch();
};

/**
 * # Player Class
 * 
 * A Player object is a wrapper object for a number of properties 
 * to associate to a player during the game. 
 * 
 * Some of the properties are `private` and can never be changed 
 * after an instance of a Player has been created. Defaults one are:
 * 
 * 	`sid`: The Socket.io session id associated to the player
 * 	`id`: The nodeGame session id associate to the player
 * 	`count`: The id of the player within a PlayerList object
 * 
 * Others properties are public and can be changed during the game.
 * 
 *	`name`: An alphanumeric name associated to the player 
 *	`state`: The current state of the player as relative to a game
 *	`ip`: The ip address of the player
 * 
 * All the additional properties in the configuration object passed 
 * to the constructor are also created as *private* and cannot be further
 * modified during the game. 
 * 
 * For security reasons, non-default properties cannot be `function`, and 
 * cannot overwrite any previously existing property.
 * 
 * ---
 * 
 */


// Expose Player constructor
exports.Player = Player;

/**
 * ## Player constructor
 * 
 * Creates an instance of Player
 * 
 * @param {object} pl The object literal representing the player
 * 
 * 
 */
function Player (pl) {
	pl = pl || {};
	
// ## Private properties
	
/**
 * ### Player.sid
 * 
 * The session id received from the nodeGame server 
 * 
 */	
	var sid = pl.sid;
	Object.defineProperty(this, 'sid', {
		value: sid,
    	enumerable: true,
	});
	
/**
 * ### Player.id
 * 
 * The nodeGame session id associate to the player 
 * 
 * Usually it is the same as the Socket.io id, but in 
 * case of reconnections it can change
 * 
 */	
	var id = pl.id || sid;
	Object.defineProperty(this, 'id', {
		value: id,
    	enumerable: true,
	});
	
/**
 * ### Player.count
 * 
 * The ordinal position of the player in a PlayerList object
 * 
 * 	@see PlayerList
 */		
	var count = pl.count;
	Object.defineProperty(this, 'count', {
    	value: count,
    	enumerable: true,
	});
	
// ## Player public properties

/**
 * ### Player.ip
 * 
 * The ip address of the player
 * 
 * Note: this can change in mobile networks
 * 
 */		
 	this.ip = pl.ip;
 
/**
 * ### Player.name
 * 
 * An alphanumeric name associated with the player
 * 
 */	 
	this.name = pl.name;
	
/**
 * ### Player.state
 * 
 * Reference to the game-state the player currently is
 * 
 * 	@see node.game.state
 * 	@see GameState
 */		
	this.state = pl.state || new GameState();

	
// ## Extra properties
// Non-default properties are all added as private
// For security reasons, they cannot be of type function, and they 
// cannot overwrite any previously defined variable
	for (var key in pl) {
		if (pl.hasOwnProperty(key)) {
			if ('function' !== typeof pl[key]) {
				if (!this.hasOwnProperty(key)) {
					this[key] = pl[key];
				}
			}
		}
	}
}

// ## Player methods

/**
 * ### Player.toString
 * 
 * Returns a string representation of a player
 * 
 * @return {string} The string representation of a player
 */
Player.prototype.toString = function() {
	return this.name + ' (' + this.id + ') ' + new GameState(this.state);
};
		
// ## Closure	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
/**
 * # GameMsg
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` exchangeable data format
 * 
 * ---
 */
(function (exports, node) {

// ## Global scope	
var GameState = node.GameState,
	JSUS = node.JSUS;

exports.GameMsg = GameMsg;

/**
 * ### GameMsg.actions
 * 
 * Collection of available nodeGame actions
 * 
 * The action adds an initial semantic meaning to the
 * message. It specify the nature of requests
 * "Why the message was sent?"
 * 
 */
GameMsg.actions = {};

GameMsg.actions.SET 		= 'set'; 	// Changes properties of the receiver
GameMsg.actions.GET 		= 'get'; 	// Ask a properties of the receiver
GameMsg.actions.SAY			= 'say'; 	// Announce properties of the sender

/**
 * ### GameMsg.targets
 * 
 * Collection of available nodeGame targets
 * 
 * The target adds an additional level of semantic 
 * for the message, and specifies the nature of the
 * information carried in the message. 
 * 
 * It answers the question: "What is the content of the message?" 
 */
GameMsg.targets = {};
GameMsg.targets.HI			= 'HI';		// Introduction
GameMsg.targets.HI_AGAIN	= 'HI_AGAIN'; // CLient reconnects
GameMsg.targets.STATE		= 'STATE';	// STATE
GameMsg.targets.PLIST 		= 'PLIST';	// PLIST
GameMsg.targets.TXT 		= 'TXT';	// Text msg
GameMsg.targets.DATA		= 'DATA';	// Contains a data-structure in the data field

GameMsg.targets.ACK			= 'ACK';	// A reliable msg was received correctly

GameMsg.targets.WARN 		= 'WARN';	// To do.
GameMsg.targets.ERR			= 'ERR';	// To do.

GameMsg.IN					= 'in.';	// Prefix for incoming msgs
GameMsg.OUT					= 'out.';	// Prefix for outgoing msgs


/**
 * ### GameMSg.clone (static)
 * 
 * Returns a perfect copy of a game-message
 * 
 * @param {GameMsg} gameMsg The message to clone
 * @return {GameMsg} The cloned messaged
 * 
 * 	@see JSUS.clone
 */
GameMsg.clone = function (gameMsg) {	
	return new GameMsg(gameMsg);
};


/**
 * ## GameMsg constructor
 * 
 * Creates an instance of GameMsg
 */
function GameMsg (gm) {
	gm = gm || {};
	
// ## Private properties

/**
 * ### GameMsg.id
 * 
 * A randomly generated unique id
 * 
 * @api private
 */	
	var id = gm.id || Math.floor(Math.random()*1000000);
	Object.defineProperty(this, 'id', {
		value: id,
		enumerable: true,
	});

/**
 * ### GameMsg.session
 * 
 * The session id in which the message was generated
 * 
 * @api private
 */	
	var session = gm.session;
	Object.defineProperty(this, 'session', {
		value: session,
		enumerable: true,
	});

// ## Public properties	

/**
 * ### GameMsg.state
 * 
 * The game-state in which the message was generated
 * 
 * 	@see GameState
 */	
	this.state = gm.state;

/**
 * ### GameMsg.action
 * 
 * The action of the message
 * 
 * 	@see GameMsg.actions
 */		
	this.action = gm.action;
	
/**
 * ### GameMsg.target
 * 
 * The target of the message
 * 
 * 	@see GameMsg.targets
 */	
	this.target = gm.target;
	
/**
 * ### GameMsg.from
 * 
 * The id of the sender of the message
 * 
 * 	@see Player.id
 */		
	this.from = gm.from;

/**
 * ### GameMsg.to
 * 
 * The id of the receiver of the message
 * 
 * 	@see Player.id
 * 	@see node.player.id
 */		
	this.to = gm.to;

/**
 * ### GameMsg.text
 * 
 * An optional text adding a description for the message
 */		
	this.text = gm.text; 
	
/**
 * ### GameMsg.data
 * 
 * An optional payload field for the message
 */			
	this.data = gm.data;
	
/**
 * ### GameMsg.priority
 * 
 * A priority index associated to the message
 */	
	this.priority = gm.priority;
	
/**
 * ### GameMsg.reliable
 * 
 * Experimental. Disabled for the moment
 * 
 * If set, requires ackwnoledgment of delivery
 * 
 */	
	this.reliable = gm.reliable;

/**
 * ### GameMsg.created
 * 
 * A timestamp of the date of creation
 */		
	this.created = JSUS.getDate();
	
/**
 * ### GameMsg.forward
 * 
 * If TRUE, the message is a forward. 
 * 
 * E.g. between nodeGame servers
 */	
	this.forward = 0;
};

/**
 * ### GameMsg.stringify
 * 
 * Calls JSON.stringify on the message
 * 
 * @return {string} The stringified game-message
 * 
 * 	@see GameMsg.toString
 */
GameMsg.prototype.stringify = function () {
	return JSON.stringify(this);
};


/**
 * ### GameMsg.toString
 * 
 * Creates a human readable string representation of the message
 * 
 * @return {string} The string representation of the message
 * 	@see GameMsg.stringify
 */
GameMsg.prototype.toString = function () {
	
	var SPT = ",\t";
	var SPTend = "\n";
	var DLM = "\"";
	
	var gs = new GameState(this.state);
	
	var line = this.created + SPT;
		line += this.id + SPT;
		line += this.session + SPT;
		line += this.action + SPT;
		line += this.target + SPT;
		line +=	this.from + SPT;
		line += this.to + SPT;
		line += DLM + this.text + DLM + SPT;
		line += DLM + this.data + DLM + SPT; // maybe to remove
		line += this.reliable + SPT;
		line += this.priority + SPTend;
		
	return line;
};

/**
 * ### GameMSg.toSMS
 * 
 * Creates a compact visualization of the most important properties
 * 
 * @return {string} A compact string representing the message 
 * 
 * @TODO: Create an hash method as for GameState
 */
GameMsg.prototype.toSMS = function () {
	
	var parseDate = /\w+/; // Select the second word;
	var results = parseDate.exec(this.created);

	var line = '[' + this.from + ']->[' + this.to + ']\t';
	line += '|' + this.action + '.' + this.target + '|'+ '\t';
	line += ' ' + this.text + ' ';
	
	return line;
};

/**
 * ### GameMsg.toInEvent
 * 
 * Hashes the action and target properties of an incoming message
 * 
 * @return {string} The hash string
 * 	@see GameMsg.toEvent 
 */
GameMsg.prototype.toInEvent = function() {
	return 'in.' + this.toEvent();
};

/**
 * ### GameMsg.toOutEvent
 * 
 * Hashes the action and target properties of an outgoing message
 * 
 * @return {string} The hash string
 *  @see GameMsg.toEvent
 */
GameMsg.prototype.toOutEvent = function() {
	return 'out.' + this.toEvent();
};

/**
 * ### GameMsg.toEvent
 * 
 * Hashes the action and target properties of the message
 * 
 * @return {string} The hash string
 */
GameMsg.prototype.toEvent = function () {
	return this.action + '.' + this.target;
}; 

// ## Closure
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
/**
 * # GameLoop
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` container of game-state functions, and parameters
 * 
 * ---
 * 
 */
(function (exports, node) {
	
// ## Global scope
var GameState = node.GameState,
	JSUS = node.JSUS;

exports.GameLoop = GameLoop;

/**
 * ### limits
 * 
 * Array containing the boundary limits of the game-loop
 * 
 * @api private
 */
var limits = [];

/**
 * ## GameLoop constructor
 * 
 * Creates a new instance of GameLoop
 * 
 * Takes as input parameter an object like
 * 
 *	{ 1:
 *		{
 *			state: myFunc,
 *			rounds: numRounds, // optional, defaults 1
 *		},
 *	 2:
 *		{
 *			state: myNestedState,
 *			rounds: numRounds, // optional, defaults 1
 *		},	
 * 		// any arbitray number of state-objects is allowed
 * 	}
 * 
 * From the above example, the value of the `state` property 
 * can be a function or a nested state object (with internal steps). 
 * For example
 * 
 * 	myFunc = function() {};
 * 
 * 	myNestedState = {
 * 			1: {
 * 				state: myFunc2,
 * 			}
 * 			2: {
 * 				state: myFunc3,
 * 			}
 * 	}
 * 
 * @param {object} loop Optional. An object containing the loop functions
 * 
 */
function GameLoop (loop) {
	// ### Public variables
	
/**
 * ### GameLoop.loop
 * 
 * The transformed loop container
 */
	this.loop = loop || {};

	for (var key in this.loop) {
		if (this.loop.hasOwnProperty(key)) {
			
			// Transform the loop obj if necessary.
			// When a state executes only one step,
			// it is allowed to pass directly the name of the function.
			// So such function must be incapsulated in a obj here.
			var loop = this.loop[key].state;
			if ('function' === typeof loop) {
				var o = JSUS.clone(this.loop[key]);
				this.loop[key].state = {1: o};
			}
			
			var steps = JSUS.size(this.loop[key].state)
			
			var round = this.loop[key].rounds || 1;
			limits.push({rounds: round, steps: steps});
		}
	}
	
/**
 * ### GameLoop.length
 * 
 * The total number of states + steps in the game-loop
 */
	Object.defineProperty(this, 'length', {
    	set: function(){},
    	get: function(){
    		return that.steps2Go(new GameState());
    	},
    	configurable: true
	});	
}

// ## GameLoop methods

/**
 * ### GameLoop.exist
 * 
 * Returns TRUE, if a gameState exists in the game-loop
 * 
 * @param {GameState} gameState The game-state to check
 */
GameLoop.prototype.exist = function (gameState) {
	if (!gameState) return false;
	
	if (typeof(this.loop[gameState.state]) === 'undefined') {
		node.log('Unexisting state: ' + gameState.state, 'WARN');
		return false;
	}
	
	if (typeof(this.loop[gameState.state]['state'][gameState.step]) === 'undefined'){
		node.log('Unexisting step: ' + gameState.step, 'WARN');
		return false;
	}
	// States are 1 based, arrays are 0-based => -1
	if (gameState.round > limits[gameState.state-1]['rounds']) {
		node.log('Unexisting round: ' + gameState.round + 'Max round: ' + limits[gameState.state]['rounds'], 'WARN');
		return false;
	}
		
	return true;
};

/**
 * ### GameLoop.next
 * 
 * Returns the next state in the loop
 * 
 * An optional input parameter can control the state from which 
 * to compute the next state
 * 
 * @param {GameState} gameState Optional. The reference game-state. Defaults, node.state
 * @return {GameState|boolean} The next game-state, or FALSE if it does not exist
 * 
 */
GameLoop.prototype.next = function (gameState) {
	gameState = gameState || node.state;
	
	// Game has not started yet, do it!
	if (gameState.state === 0) {
		return new GameState({
							 state: 1,
							 step: 1,
							 round: 1
		});
	}
	
	if (!this.exist(gameState)) {
		node.log('No next state of non-existing state: ' + gameState, 'WARN');
		return false;
	}
	
	var idxLimit = Number(gameState.state)-1; // 0 vs 1 based
	
	if (limits[idxLimit]['steps'] > gameState.step){
		var newStep = Number(gameState.step)+1;
		return new GameState({
			state: gameState.state,
			step: newStep,
			round: gameState.round
		});
	}
	
	if (limits[idxLimit]['rounds'] > gameState.round){
		var newRound = Number(gameState.round)+1;
		return new GameState({
			state: gameState.state,
			step: 1,
			round: newRound
		});
	}
	
	if (limits.length > gameState.state){		
		var newState = Number(gameState.state)+1;
		return new GameState({
			state: newState,
			step: 1,
			round: 1
		});
	}
	
	// No next state: game over
	return false; 
};

/**
 * ### GameLoop.previous
 * 
 * Returns the previous state in the loop
 * 
 * An optional input parameter can control the state from which 
 * to compute the previous state
 * 
 * @param {GameState} gameState Optional. The reference game-state. Defaults, node.state
 * @return {GameState|boolean} The previous game-state, or FALSE if it does not exist
 */
GameLoop.prototype.previous = function (gameState) {
	gameState = gameState || node.state;
	
	if (!this.exist(gameState)) {
		node.log('No previous state of non-existing state: ' + gameState, 'WARN');
	}
	
	var idxLimit = Number(gameState.state)-1; // 0 vs 1 based
	
	if (gameState.step > 1){
		var oldStep = Number(gameState.step)-1;
		return new GameState({
			state: gameState.state,
			step: oldStep,
			round: gameState.round
		});
	}
	else if (gameState.round > 1){
		var oldRound = Number(gameState.round)-1;
		var oldStep = limits[idxLimit]['steps'];
		return new GameState({
			state: gameState.state,
			step: oldStep,
			round: oldRound
		});
	}
	else if (gameState.state > 1){
		var oldRound = limits[idxLimit-1]['rounds'];
		var oldStep = limits[idxLimit-1]['steps'];
		var oldState = idxLimit;
		return new GameState({
			state: oldState,
			step: oldStep,
			round: oldRound
		});
	}
	
	// game init
	return false; 
};

/**
 * ### GameLoop.getName
 * 
 * Returns the name associated with a game-state
 * 
 * @param {GameState} gameState Optional. The reference game-state. Defaults, node.state
 * @return {string|boolean} The name of the game-state, or FALSE if state does not exists
 */
GameLoop.prototype.getName = function (gameState) {
	gameState = gameState || node.state;
	if (!this.exist(gameState)) return false;
	return this.loop[gameState.state]['state'][gameState.step]['name'];
};

/**
 * ### GameLoop.getFunction
 * 
 * Returns the function associated with a game-state
 * 
 * @param {GameState} gameState The reference game-state
 * @return {object|boolean} The function of the game-state, or FALSE if state does not exists
 */
GameLoop.prototype.getFunction = function (gameState) {
	gameState = gameState || node.state;
	if (!this.exist(gameState)) return false;
	return this.loop[gameState.state]['state'][gameState.step]['state'];
};

/**
 * ### GameLoop.getAllParams
 * 
 * Returns all the parameters associated with a game-state
 * 
 * @param {GameState} gameState The reference game-state
 * @return {object|boolean} The state object, or FALSE if state does not exists
 */
GameLoop.prototype.getAllParams = function (gameState) {
	gameState = gameState || node.state;
	if (!this.exist(gameState)) return false;
	return this.loop[gameState.state]['state'][gameState.step];
};

/**
 * ### GameLoop.jumpTo
 * 
 * Returns a state N steps away from the reference state
 * 
 * A negative value for N jumps backward in the game-loop, 
 * and a positive one jumps forward in the game-loop
 * 
 * @param {GameState} gameState The reference game-state
 * @param {number} N The number of steps to jump
 * @return {GameState|boolean} The previous game-state, or FALSE if it does not exist
 */
GameLoop.prototype.jumpTo = function (gameState, N) {
	if (!this.exist(gameState)) return false;
	if (N || N === 0) return gameState;
	
	var func = (N > 0) ? this.next : this.previous;
	
	for (var i=0; i < Math.abs(N); i++) {
		gameState = func.call(this, gameState);
		if (!gameState) return false;
	}
	return gameState;
};

/**
 * ### GameLoop.steps2Go
 * 
 * Computes the total number steps left to the end of the game.
 * 
 * An optional input parameter can control the starting state
 * for the computation
 * 
 * @param {GameState} gameState Optional. The reference game-state. Defaults, node.state
 * @return {number} The total number of steps left
 */
GameLoop.prototype.steps2Go = function (gameState) {
	gameState = gameState || node.state;
	var count = 0;
	while (gameState) { 
		count++;
		gameState = this.next(gameState);
	}
	return count;
};

GameLoop.prototype.toArray = function() {
	var state = new GameState();
	var out = [];
	while (state) { 
		out.push(state.toString());
		var state = this.next(state);
	}
	return out;
};

/**
 * 
 * ### GameLoop.indexOf
 * 
 * Returns the ordinal position of a state in the game-loop 
 * 
 * All steps and rounds in between are counted.
 * 
 * @param {GameState} gameState The reference game-state
 * @return {number} The state index in the loop, or -1 if it does not exist
 * 
 * 	@see GameLoop.diff
 */
GameLoop.prototype.indexOf = function (state) {
	if (!state) return -1;
	return this.diff(state, new GameState());
};

/**
 * ### GameLoop.diff
 * 
 * Returns the distance in steps between two states in the game-loop 
 * 
 * All steps and rounds in between are counted.
 * 
 * It works under the assumption that state1 comes first than state2
 * in the game-loop.
 * 
 * @param {GameState} state1 The reference game-state
 * @param {GameState} state2 Optional. The second state for comparison. Defaults node.state
 * 
 * @return {number} The state index in the loop, or -1 if it does not exist
 * 
 * @TODO: compute also negative distances
 */
GameLoop.prototype.diff = function (state1, state2) {
	if (!state1) return false;
	
	if (!state2) {
		if (!node.state) return false;
		state2 = node.state
	}
	
	var idx = 0;
	while (state2) {
		if (GameState.compare(state1, state2) === 0){
			return idx;
		}
		state2 = this.next(state2);
		idx++;
	}
	return -1;
};
	
// ## Closure	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
/**
 * # GameMsgGenerator
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` component rensponsible creating messages 
 * 
 * Static factory of objects of type `GameMsg`.
 * 
 * All message are reliable, but TXT messages.
 * 
 * 	@see GameMSg
 * 	@see GameMsg.targets
 * 	@see GameMsg.actions
 * 
 * ---
 *
 */
(function (exports, node) {
	
// ## Global scope
	
var GameMsg = node.GameMsg,
	GameState = node.GameState,
	Player = node.Player,
	JSUS = node.JSUS;

exports.GameMsgGenerator = GameMsgGenerator; 

/**
 * ## GameMsgGenerator constructor
 * 
 * Creates an instance of GameMSgGenerator
 * 
 */
function GameMsgGenerator () {}

// ## General methods

/**
 * ### GameMsgGenerator.create 
 * 
 * Primitive for creating any type of game-message
 * 
 * Merges a set of default settings with the object passed
 * as input parameter
 * 
 * 	@see JSUS.merge
 */
GameMsgGenerator.create = function (msg) {

  var base = {
		session: node.gsc.session, 
		state: node.state,
		action: GameMsg.actions.SAY,
		target: GameMsg.targets.DATA,
		from: node.player.sid,
		to: 'SERVER',
		text: null,
		data: null,
		priority: null,
		reliable: 1,
  };

  msg = JSUS.merge(base, msg);
  return new GameMsg(msg);

};

//## HI messages

/**
 * ### GameMSgGenerator.createHI
 * 
 * Notice: this is different from the server;
 * 
 * @param {Player} player The player to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknoledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 */
GameMsgGenerator.createHI = function (player, to, reliable) {
	player = player || node.player;
	if (!player) return false;
	reliable = reliable || 1;
  
	return new GameMsg( {
            			session: node.gsc.session,
            			state: node.state,
            			action: GameMsg.actions.SAY,
            			target: GameMsg.targets.HI,
            			from: node.player.sid,
            			to: to,
            			text: new Player(player) + ' ready.',
            			data: player,
            			priority: null,
            			reliable: reliable,
	});
};

// ## STATE messages

/**
 * ### GameMSgGenerator.saySTATE
 * 
 * Creates a say.STATE message
 * 
 * Notice: state is different from node.state
 * 
 * @param {GameState} state The game-state to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknoledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see GameState
 */
GameMsgGenerator.saySTATE = function (state, to, reliable) {
	return this.createSTATE(GameMsg.SAY, state, to, reliable);
};

/**
 * ### GameMSgGenerator.setSTATE
 * 
 * Creates a set.STATE message
 * 
 * @param {GameState} state The game-state to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknoledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see GameState
 */
GameMsgGenerator.setSTATE = function (state, to, reliable) {
	return this.createSTATE(GameMsg.SET, state, to, reliable);
};

/**
 * ### GameMSgGenerator.getSTATE
 * 
 * Experimental. Creates a get.STATE message
 * 
 * @param {GameState} state The game-state to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknoledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see GameState
 */
GameMsgGenerator.getSTATE = function (state, to, reliable) {
	return this.createSTATE(GameMsg.GET, state, to,reliable);
};

/**
 * ### GameMSgGenerator.createSTATE
 * 
 * Creates a STATE message
 * 
 * @param {string} action A nodeGame action (e.g. 'get' or 'set')
 * @param {GameState} state The game-state to communicate
 * @param {string} to Optional. The recipient of the message. Defaults, SERVER
 * @param {boolean} reliable Optional. Experimental. Requires an acknoledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see GameState
 * 	@see GameMsg.actions
 */
GameMsgGenerator.createSTATE = function (action, state, to, reliable) {
	if (!action || !state) return false;
	to = to || 'SERVER';
	reliable = reliable || 1;
	return new GameMsg({
						session: node.gsc.session,
						state: node.state,
						action: action,
						target: GameMsg.targets.STATE,
						from: node.player.sid,
						to: to,
						text: 'New State: ' + GameState.stringify(state),
						data: state,
						priority: null,
						reliable: reliable
	});
};

//## PLIST messages

/**
 * ### GameMSgGenerator.sayPLIST
 * 
 * Creates a say.PLIST message
 * 
 * @param {PlayerList} plist The player-list to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknoledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see PlayerList
 */
GameMsgGenerator.sayPLIST = function (plist, to, reliable) {
	return this.createPLIST(GameMsg.actions.SAY, plist, to, reliable);
};

/**
 * ### GameMSgGenerator.setPLIST
 * 
 * Creates a set.PLIST message
 * 
 * @param {PlayerList} plist The player-list to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknoledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see PlayerList
 */
GameMsgGenerator.setPLIST = function (plist, to, reliable) {
	return this.createPLIST(GameMsg.actions.SET, plist, to, reliable);
};

/**
 * ### GameMSgGenerator.getPLIST
 * 
 * Experimental. Creates a get.PLIST message
 * 
 * @param {PlayerList} plist The player-list to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknoledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see PlayerList
 */
GameMsgGenerator.getPLIST = function (plist, to, reliable) {
	return this.createPLIST(GameMsg.actions.GET, plist, to, reliable);
};

/**
 * ### GameMSgGenerator.createPLIST
 * 
 * Creates a PLIST message
 * 
 * @param {string} action A nodeGame action (e.g. 'get' or 'set')
 * @param {PlayerList} plist The player-list to communicate
 * @param {string} to Optional. The recipient of the message. Defaults, SERVER
 * @param {boolean} reliable Optional. Experimental. Requires an acknoledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see GameMsg.actions
 *  @see PlayerList
 */
GameMsgGenerator.createPLIST = function (action, plist, to, reliable) {
	plist = plist || !node.game || node.game.pl;
	if (!action || !plist) return false;
	
	to = to || 'SERVER';
	reliable = reliable || 1;
	
	return new GameMsg({
						session: node.gsc.session, 
						state: node.state,
						action: action,
						target: GameMsg.targets.PLIST,
						from: node.player.sid,
						to: to,
						text: 'List of Players: ' + plist.length,
						data: plist.pl,
						priority: null,
						reliable: reliable,
	});
};

// ## TXT messages

/**
 * ### GameMSgGenerator.createTXT
 * 
 * Creates a say.TXT message
 * 
 * TXT messages are always of action 'say'
 * 
 * @param {string} text The text to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknoledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 */
GameMsgGenerator.createTXT = function (text, to, reliable) {
	if (!text) return false;
	reliable = reliable || 0;
	
	return new GameMsg({
						session: node.gsc.session,
						state: node.state,
						action: GameMsg.actions.SAY,
						target: GameMsg.targets.TXT,
						from: node.player.sid,
						to: to,
						text: text,
						data: null,
						priority: null,
						reliable: reliable,
	});
};


// ## DATA messages

/**
 * ### GameMSgGenerator.sayDATA
 * 
 * Creates a say.DATA message
 * 
 * @param {object} data An object to exchange
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknoledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 */
GameMsgGenerator.sayDATA = function (data, to, text, reliable) {
	return this.createDATA(GameMsg.actions.SAY, data, to, text, reliable);
};

/**
 * ### GameMSgGenerator.setDATA
 * 
 * Creates a set.DATA message
 * 
 * @param {object} data An object to exchange
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknoledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 */
GameMsgGenerator.setDATA = function (data, to, text, reliable) {
	return this.createDATA(GameMsg.actions.SET, data, to, text, reliable);
};

/**
 * ### GameMSgGenerator.getDATA
 * 
 * Experimental. Creates a say.DATA message
 * 
 * @param {object} data An object to exchange
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknoledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 */
GameMsgGenerator.getDATA = function (data, to, text, reliable) {
	return this.createDATA(GameMsg.actions.GET, data, to, text, reliable);
};

/**
 * ### GameMSgGenerator.createDATA
 * 
 * Creates a DATA message
 * 
 * @param {string} action A nodeGame action (e.g. 'get' or 'set')
 * @param {object} data An object to exchange
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknoledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 */
GameMsgGenerator.createDATA = function (action, data, to, text, reliable) {
	if (!action) return false;
	reliable = reliable || 1;
	text = text || 'data msg';
	
	return new GameMsg({
						session: node.gsc.session, 
						state: node.state,
						action: action,
						target: GameMsg.targets.DATA,
						from: node.player.sid,
						to: to,
						text: text,
						data: data,
						priority: null,
						reliable: reliable,
	});
};

// ## ACK messages

/**
 * ### GameMSgGenerator.setACK
 * 
 * Experimental. Undocumented (for now)
 * 
 */
GameMsgGenerator.createACK = function (gm, to, reliable) {
	if (!gm) return false;
	reliable = reliable || 0;
	
	var newgm = new GameMsg({
							session: node.gsc.session, 
							state: node.state,
							action: GameMsg.actions.SAY,
							target: GameMsg.targets.ACK,
							from: node.player.sid,
							to: to,
							text: 'Msg ' + gm.id + ' correctly received',
							data: gm.id,
							priority: null,
							reliable: reliable,
	});
	
	if (gm.forward) {
		newgm.forward = 1;
	}
	
	return newgm;
}; 


// ## Closure
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
/**
 * # GameSocketClient
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` component rensponsible for dispatching events and messages 
 * 
 * ---
 * 
 */

(function (exports, node, io) {
	
// ## Global scope
	
var GameMsg = node.GameMsg,
	GameState = node.GameState,
	Player = node.Player,
	GameMsgGenerator = node.GameMsgGenerator;

var buffer,
	session;
	

exports.GameSocketClient = GameSocketClient;

/**
 * ## GameSocketClient constructor
 * 
 * Creates a new instance of GameSocketClient
 * 
 * @param {object} options Optional. A configuration object
 */
function GameSocketClient (options) {
	options = options || {};
	
// ## Private properties
	
/**
 * ### GameSocketClient.buffer
 * 
 * Buffer of queued messages 
 * 
 * @api private
 */ 
	buffer = [];
	Object.defineProperty(this, 'buffer', {
		value: buffer,
		enumerable: true,
	});
	
/**
 * ### GameSocketClient.session
 * 
 * The session id shared with the server
 * 
 * This property is initialized only when a game starts
 * 
 */
	session = null;
	Object.defineProperty(this, 'session', {
		value: session,
		enumerable: true,
	});
	
// ## Public properties
	
/**
 * ### GameSocketClient.io
 * 
 * 
 */	
	this.io 		= null;
/**
 * ### GameSocketClient.url
 * 
 */		
	this.url 		= null;
	
/**
 * ### GameSocketClient.servername
 * 
 */	
	this.servername = null;

}

// ## GameSocketClient methods

/**
 * ### GameSocketClient.getSession
 * 
 * Searches the node.session object for a saved session matching the passed 
 * game-message
 * 
 * If found, the session object will have the following a structure
 * 
 *	var session = {
 * 		id: 	node.gsc.session,
 * 		player: node.player,
 * 		memory: node.game.memory,
 * 		state: 	node.game.gameState,
 * 		game: 	node.game.name,
 * 		history: undefined,
 * 	};	
 * 
 * 
 * @param {GameMsg} msg A game-msg
 * @return {object|boolean} A session object, or FALSE if not was not found
 * 
 * 	@see node.session
 */
GameSocketClient.prototype.getSession = function (msg) {
	if (!msg) return false;
	
	var session = false;
	if ('function' === typeof node.session)	{
		session = node.session(msg.session);
	}
	
	// TODO: check if session is still valid
	return (session) ? session : false;
};

/**
 * ### GameSocketClient.startSession
 * 
 * Initializes a nodeGame session
 * 
 * Creates a the player and saves it in node.player, and stores the session ids
 * in the session object (GameSocketClient.session)
 * 
 * @param {GameMsg} msg A game-msg
 * @return {boolean} TRUE, if session was correctly initialized
 * 
 * 	@see GameSocketClient.createPlayer
 */
GameSocketClient.prototype.startSession = function (msg) {
	var player = {
			id:		msg.data,	
			sid: 	msg.data,
	};
	this.createPlayer(player);
	session = msg.session;
	return true;
};

/**
 * ### GameSocketClient.restoreSession
 * 
 * Restores a session object
 * 
 * @param {object} session A session object as loaded by GameSocketClient.getSession
 * 
 * 
 * 	@emit NODEGAME_RECOVERY
 * 	@emit LOADED
 * 
 * 	@see GameSocketClient.createPlayer
 * 	@see node.session
 */
GameSocketClient.prototype.restoreSession = function (sessionObj, sid) {
	if (!sessionObj) return;
	
	var log_prefix = 'nodeGame session recovery: ';
	
	node.log('Starting session recovery ' + sid, 'INFO', log_prefix);
	node.emit('NODEGAME_RECOVERY', sid);
	
	sid = sid || sessionObj.player.sid;
	
	this.session = sessionObj.id;
	
	// Important! The new socket.io ID
	session.player.sid = sid;

	this.createPlayer(session.player);
	node.game.memory = session.memory;
	node.goto(session.state);
	
	if (!sessionObj.history) {
		node.log('No event history was found to recover', 'WARN', log_prefix);
		return true;
	}
	
	node.log('Recovering ' + session.history.length + ' events', 'DEBUG', log_prefix);
	
	node.events.history.import(session.history);
	var hash = new GameState(session.state).toHash('S.s.r'); 
	if (!node.events.history.state) {
		node.log('No old events to re-emit were found during session recovery', 'DEBUG', log_prefix);
		return true; 
	}
	if (!node.events.history.state[hash]){
		node.log('The current state ' + hash + ' has no events to re-emit', 'DEBUG', log_prefix);
		return true; 
	}
	
	var discard = ['LOG', 
	               'STATECHANGE',
	               'WINDOW_LOADED',
	               'BEFORE_LOADING',
	               'LOADED',
	               'in.say.STATE',
	               'UPDATED_PLIST',
	               'NODEGAME_READY',
	               'out.say.STATE',
	               'out.set.STATE',
	               'in.say.PLIST',
	               'STATEDONE', // maybe not here
	               'out.say.HI',
		               
	];
	
	var to_remit = node.events.history.state[hash];
	to_remit.select('event', 'in', discard).delete();
	
	if (!to_remit.length){
		node.log('The current state ' + hash + ' has no valid events to re-emit', 'DEBUG', log_prefix);
		return true;
	}
	
	var remit = function () {
		node.log('Re-emitting ' + to_remit.length + ' events', 'DEBUG', log_prefix);
		// We have events that were fired at the state when 
		// disconnection happened. Let's fire them again 
		to_remit.each(function(e) {
			// Falsy, should already been discarded
			if (!JSUS.in_array(e.event, discard)) {
				node.emit(e.event, e.p1, e.p2, e.p3);
			}
		});
	};
	
	if (node.game.ready) {
		remit.call(node.game);
	}
	else {
		node.on('LOADED', function(){
			remit.call(node.game);
		});
	}
	
	return true;
};

/**
 * ### GameSocketClient.createPlayer
 * 
 * Mixes in default properties for the player object and
 * additional configuration variables from node.conf.player
 * 
 * Writes the node.player object
 * 
 * Properties: `id`, `sid`, `ip` can never be overwritten.
 * 
 * Properties added as local configuration cannot be further
 * modified during the game. 
 * 
 * Only the property `name`, can be changed.
 * 
 */
GameSocketClient.prototype.createPlayer = function (player) {	
	player = new Player(player);
	
	if (node.conf && node.conf.player) {			
		var pconf = node.conf.player;
		for (var key in pconf) {
			if (pconf.hasOwnProperty(key)) {
				if (JSUS.in_array(key, ['id', 'sid', 'ip'])) {
					continue;
				} 
				
				// Cannot be overwritten properties previously 
				// set in other sessions (recovery)
//				if (player.hasOwnProperty(key)) {
//					continue;
//				}
				
				Object.defineProperty(player, key, {
			    	value: pconf[key],
			    	enumerable: true,
				});
			}
		}
	}
	
	Object.defineProperty(node, 'player', {
    	value: player,
    	enumerable: true,
	});

	return player;
};

/**
 * ### GameSocketClient.connect
 * 
 * Initializes the connection to a nodeGame server
 * 
 * 
 * 
 * @param {object} conf A configuration object
 */
GameSocketClient.prototype.connect = function (conf) {
	conf = conf || {};
	if (!conf.url) {
		node.log('cannot connect to empty url.', 'ERR');
		return false;
	}
	
	this.url = conf.url;
	
	node.log('connecting to ' + conf.url);
	this.io = io.connect(conf.url, conf.io);
    this.attachFirstListeners(this.io);
    return this.io;
};

// ## I/O Functions


var logSecureParseError = function (text, e) {
	text = text || 'Generic error while parsing a game message';
	var error = (e) ? text + ": " + e : text;
	node.log(error, 'ERR');
	node.emit('LOG', 'E: ' + error);
	return false;
}

/**
 * ### GameSocketClient.secureParse
 * 
 * Parse the message received in the Socket
 * 
 * @param {object|GameMsg} msg The game-message to parse
 * @return {GameMsg|boolean} The parsed GameMsg object, or FALSE if an error occurred
 *  
 */
GameSocketClient.prototype.secureParse = function (msg) {
	
	var gameMsg;
	try {
		gameMsg = GameMsg.clone(JSON.parse(msg));
	}
	catch(e) {
		return logSecureParseError('Malformed msg received',  e);
	}
	
	if (this.session && gameMsg.session !== this.session) {
		return logSecureParseError('Local session id does not match incoming message session id');
	}
	
	return gameMsg;
};

/**
 * ### GameSocketClient.clearBuffer
 * 
 * Emits and removes all the events in the message buffer
 * 
 * 	@see node.emit
 */
GameSocketClient.prototype.clearBuffer = function () {
	var nelem = buffer.length;
	for (var i=0; i < nelem; i++) {
		var msg = this.buffer.shift();
		node.emit(msg.toInEvent(), msg);
		node.log('Debuffered ' + msg, 'DEBUG');
	}
};

/**
 * ### GameSocketClient.attachFirstListeners
 *
 * Initializes the socket to wait for a HI message from the server
 * 
 * Nothing is done until the SERVER send an HI msg. All the others msgs will
 * be ignored otherwise.
 * 
 * @param {object} socket The socket.io socket
 */
GameSocketClient.prototype.attachFirstListeners = function (socket) {
	
	var that = this;
	
	socket.on('connect', function (msg) {
		var connString = 'nodeGame: connection open';
	    node.log(connString); 
	    
	    socket.on('message', function (msg) {	
	    	
	    	var msg = that.secureParse(msg);
	    	
	    	if (msg) { // Parsing successful
				if (msg.target === 'HI') {

					// Setting global info
					that.servername = msg.from;
					// Keep serverid = msg.from for now
					that.serverid = msg.from;
					
					var sessionObj = that.getSession(msg);
					
					if (sessionObj) {
						that.restoreSession(sessionObj, socket.id);
						
						// Get Ready to play
						that.attachMsgListeners(socket, msg.session);
						
						var msg = node.msg.create({
							action: GameMsg.actions.SAY,
							target: 'HI_AGAIN',
							data: node.player,
						});
//							console.log('HI_AGAIN MSG!!');
//							console.log(msg);
						that.send(msg);
						
					}
					else {
						that.startSession(msg);
						// Get Ready to play
						that.attachMsgListeners(socket, msg.session);
						
						// Send own name to SERVER
						that.sendHI(node.player, 'ALL');
					}
					

					// Ready to play
					node.emit('out.say.HI');
			   	 } 
	    	}
	    });
	    
	});
	
    socket.on('disconnect', function() {
    	// Save the current state of the game
    	node.session.store();
    	node.log('closed');
    });
};

/**
 * ### GameSocketClient.attachMsgListeners
 * 
 * Attaches standard message listeners
 * 
 * This method is called after the client has received a valid HI message from
 * the server, and a session number has been issued
 * 
 * @param {object} socket The socket.io socket
 * @param {number} session The session id issued by the server
 * 
 * @emit NODEGAME_READY
 */
GameSocketClient.prototype.attachMsgListeners = function (socket, session) {   
	var that = this;
	
	node.log('Attaching FULL listeners');
	socket.removeAllListeners('message');
		
	socket.on('message', function(msg) {
		var msg = that.secureParse(msg);
		
		if (msg) { // Parsing successful
			// Wait to fire the msgs if the game state is loading
			if (node.game && node.game.ready) {	
				node.emit(msg.toInEvent(), msg);
			}
			else {
				node.log('Buffering: ' + msg, 'DEBUG');
				buffer.push(msg);
			}
		}
	});
	
	node.emit('NODEGAME_READY');
};

// ## SEND methods

/**
 * ### GameSocketClient.sendHI
 * 
 * Creates a HI message and pushes it into the socket
 *   
 * @param {string} from Optional. The message sender. Defaults node.player
 * @param {string} to Optional. The recipient of the message. Defaults 'SERVER'
 * 
 */
GameSocketClient.prototype.sendHI = function (from, to) {
	from = from || node.player;
	to = to || 'SERVER';
	var msg = node.msg.createHI(from, to);
	this.send(msg);
};

/**
 * ### GameSocketClient.sendSTATE
 * 
 * Creates a STATE message and pushes it into the socket
 * 
 * @param {string} action A nodeGame action (e.g. 'get' or 'set')
 * @param {GameState} state The GameState object to send
 * @param {string} to Optional. The recipient of the message.
 * 
 * 	@see GameMsg.actions
 */
GameSocketClient.prototype.sendSTATE = function (action, state, to) {	
	var msg = node.msg.createSTATE(action, state, to);
	this.send(msg);
};

/**
 * ### GameSocketClient.sendTXT
 *
 * Creates a TXT message and pushes it into the socket
 * 
 * @param {string} text Text to send
 * @param {string} to Optional. The recipient of the message
 */
GameSocketClient.prototype.sendTXT = function(text, to) {	
	var msg = node.msg.createTXT(text,to);
	this.send(msg);
};

/**
 * ### GameSocketClient.sendDATA
 * 
 * Creates a DATA message and pushes it into the socket
 * 
 * @param {string} action Optional. A nodeGame action (e.g. 'get' or 'set'). Defaults 'say'
 * @param {object} data An object to exchange
 * @param {string} to Optional. The recipient of the message. Defaults 'SERVER'
 * @param {string} text Optional. A descriptive text associated to the message.
 * 
 * 	@see GameMsg.actions
 * 
 * @TODO: invert parameter order: first data then action
 */
GameSocketClient.prototype.sendDATA = function (action, data, to, text) {
	action = action || GameMsg.say;
	to = to || 'SERVER';
	text = text || 'DATA';
	var msg = node.msg.createDATA(action, data, to, text);
	this.send(msg);
};

/**
 * ### GameSocketClient.send
 * 
 * Pushes a message into the socket.
 * 
 * The msg is actually received by the client itself as well.
 * 
 * @param {GameMsg} The game message to send
 * 
 * 	@see GameMsg
 * 
 * @TODO: Check Do volatile msgs exist for clients?
 */
GameSocketClient.prototype.send = function (msg) {

	// if (msg.reliable) {
		this.io.send(msg.stringify());
	// }
	// else {
	// this.io.volatile.send(msg.stringify());
	// }
	node.log('S: ' + msg);
	node.emit('LOG', 'S: ' + msg.toSMS());
};

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
  , 'undefined' != typeof io ? io : module.parent.exports.io
);
/**
 * # GameDB
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * ### Provides a simple, lightweight NO-SQL database for nodeGame
 * 
 * Entries are stored as GameBit messages.
 * 
 * It automatically creates three indexes.
 * 
 * 1. by player,
 * 2. by state,
 * 3. by key.
 * 
 * Uses GameState.compare to compare the state property of each entry.
 * 
 * 	@see GameBit
 * 	@see GameState.compare
 * 
 * ---
 * 
 */
(function (exports, node) {

// ## Global scope	
var JSUS = node.JSUS,
	NDDB = node.NDDB;
	
var GameState = node.GameState;

// Inheriting from NDDB	
GameDB.prototype = JSUS.clone(NDDB.prototype);
GameDB.prototype.constructor = GameDB;


// Expose constructors
exports.GameDB = GameDB;
exports.GameBit = GameBit;

/**
 * ## GameDB constructor 
 *
 * Creates an instance of GameDB
 * 
 * @param {object} options Optional. A configuration object
 * @param {array} db Optional. An initial array of items to import into the database
 * @param {NDDB|GameDB} parent Optional. A reference to the parent database
 * 
 * 	@see NDDB constructor 
 */

function GameDB (options, db, parent) {
	options = options || {};
	
	
	if (!options.update) options.update = {};
	// Auto build indexes by default
	options.update.indexes = true;
	
	NDDB.call(this, options, db, parent);
	
	this.c('state', GameBit.compareState);
	  
	
	if (!this.player) {
		this.h('player', function(gb) {
			return gb.player;
		});
	}
	if (!this.state) {
		this.h('state', function(gb) {
			return GameState.toHash(gb.state, 'S.s.r');
		});
	}  
	if (!this.key) {
		this.h('key', function(gb) {
			return gb.key;
		});
	}
	
}

// ## GameDB methods

/**
 * ### GameDB.add
 * 
 * Creates a GameBit and adds it to the database
 * 
 * @param {string} key An alphanumeric id for the entry
 * @param {mixed} value Optional. The value to store
 * @param {Player} player Optional. The player associated to the entry. Defaults, node.player
 * @param {GameState} player Optional. The state associated to the entry. Defaults, node.game.gameState
 * 
 * @return {boolean} TRUE, if insertion was successful
 * 
 * 	@see GameBit
 */
GameDB.prototype.add = function (key, value, player, state) {
	if (!key) return false;
	
	state = state || node.game.gameState;
	player = player || node.player;

	this.insert(new GameBit({
						player: player, 
						key: key,
						value: value,
						state: state,
	}));

	return true;
};

/**
 * # GameBit
 * 
 * ### Container of relevant information for the game
 * 
 *  ---
 *  
 * A GameBit unit always contains the following properties
 * 
 * - state GameState
 * - player Player
 * - key 
 * - value
 * - time 
 */

// ## GameBit methods

/**
 * ### GameBit constructor
 * 
 * Creates a new instance of GameBit
 */
function GameBit (options) {
	
	this.state = options.state;
	this.player = options.player;
	this.key = options.key;
	this.value = options.value;
	this.time = (Date) ? Date.now() : null;
};


/**
 * ### GameBit.toString
 * 
 * Returns a string representation of the instance of GameBit
 * 
 * @return {string} string representation of the instance of GameBit
 */
GameBit.prototype.toString = function () {
	return this.player + ', ' + GameState.stringify(this.state) + ', ' + this.key + ', ' + this.value;
};

/** 
 * ### GameBit.equals (static)
 * 
 * Compares two GameBit objects
 * 
 * Returns TRUE if the attributes of `player`, `state`, and `key`
 * are identical. 
 *  
 * If the strict parameter is set, also the `value` property 
 * is used for comparison
 *  
 * @param {GameBit} gb1 The first game-bit to compare
 * @param {GameBit} gb2 The second game-bit to compare
 * @param {boolean} strict Optional. If TRUE, compares also the `value` property
 * 
 * @return {boolean} TRUE, if the two objects are equals
 * 
 * 	@see GameBit.comparePlayer
 * 	@see GameBit.compareState
 * 	@see GameBit.compareKey
 * 	@see GameBit.compareValue
 */
GameBit.equals = function (gb1, gb2, strict) {
	if (!gb1 || !gb2) return false;
	strict = strict || false;
	if (GameBit.comparePlayer(gb1, gb2) !== 0) return false;
	if (GameBit.compareState(gb1, gb2) !== 0) return false;
	if (GameBit.compareKey(gb1, gb2) !== 0) return false;
	if (strict && gb1.value && GameBit.compareValue(gb1, gb2) !== 0) return false;
	return true;	
};

/**
 * ### GameBit.comparePlayer (static)
 * 
 * Sort two game-bits by player numerical id
 * 
 * Returns a numerical id that can assume the following values
 * 
 * - `-1`: the player id of the second game-bit is larger 
 * - `1`: the player id of the first game-bit is larger
 * - `0`: the two gamebits belong to the same player
 * 
 * @param {GameBit} gb1 The first game-bit to compare
 * @param {GameBit} gb2 The second game-bit to compare
 * 
 * @return {number} The result of the comparison
 */
GameBit.comparePlayer = function (gb1, gb2) {
	if (!gb1 && !gb2) return 0;
	if (!gb1) return 1;
	if (!gb2) return -1;
	if (gb1.player === gb2.player) return 0;

	if (gb1.player > gb2.player) return 1;
	return -1;
};

/**
 * ### GameBit.compareState (static)
 * 
 * Sort two game-bits by their state property
 * 
 * GameState.compare is used for comparison
 * 
 * @param {GameBit} gb1 The first game-bit to compare
 * @param {GameBit} gb2 The second game-bit to compare
 * 
 * @return {number} The result of the comparison
 * 
 * 	@see GameState.compare
 */
GameBit.compareState = function (gb1, gb2) {
	return GameState.compare(gb1.state, gb2.state);
};

/**
 * ### GameBit.compareKey (static)
 * 
 * 	Sort two game-bits by their key property 
 * 
 * Returns a numerical id that can assume the following values
 * 
 * - `-1`: the key of the first game-bit comes first alphabetically  
 * - `1`: the key of the second game-bit comes first alphabetically 
 * - `0`: the two gamebits have the same key
 * 
 * @param {GameBit} gb1 The first game-bit to compare
 * @param {GameBit} gb2 The second game-bit to compare
 * 
 * @return {number} The result of the comparison
 */
GameBit.compareKey = function (gb1, gb2) {
	if (!gb1 && !gb2) return 0;
	if (!gb1) return 1;
	if (!gb2) return -1;
	if (gb1.key === gb2.key) return 0;
	if (gb1.key < gb2.key) return -1;
	return 1;
};

/**
 * ### GameBit.compareValue (static)
 *  
 * Sorts two game-bits by their value property
 * 
 * Uses JSUS.equals for equality. If they differs, 
 * further comparison is performed, but results will be inaccurate
 * for objects. 
 * 
 * Returns a numerical id that can assume the following values
 * 
 * - `-1`: the value of the first game-bit comes first alphabetically / numerically
 * - `1`: the value of the second game-bit comes first alphabetically / numerically 
 * - `0`: the two gamebits have identical value properties
 * 
 * @param {GameBit} gb1 The first game-bit to compare
 * @param {GameBit} gb2 The second game-bit to compare
 * 
 * @return {number} The result of the comparison
 * 
 * 	@see JSUS.equals
 */
GameBit.compareValue = function (gb1, gb2) {
	if (!gb1 && !gb2) return 0;
	if (!gb1) return 1;
	if (!gb2) return -1;
	if (JSUS.equals(gb1.value, gb2.value)) return 0;
	if (gb1.value > gb2.value) return 1;
	return -1;
};	

// ## Closure
	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
/**
 * # Game
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 *
 * Wrapper class for a `GameLoop` object and functions to control the game flow
 * 
 * Defines a number of event listeners, diveded in
 * 	
 * - incoming,
 * - outgoing,
 * - internal 
 *  
 *  ---
 *  
 */
	
(function (exports, node) {
	
// ## Global scope
	
var GameState = node.GameState,
	GameMsg = node.GameMsg,
	GameDB = node.GameDB,
	PlayerList = node.PlayerList,
	GameLoop = node.GameLoop,
	JSUS = node.JSUS;


exports.Game = Game;

var name,
	description,
	gameLoop,
	pl;
	

/**
 * ## Game constructor
 * 
 * Creates a new instance of Game
 * 
 * @param {object} settings Optional. A configuration object
 */
function Game (settings) {
	settings = settings || {};

// ## Private properties

/**
 * ### Game.name
 * 
 * The name of the game
 * 
 * @api private
 */
	name = settings.name || 'A nodeGame game';
	Object.defineProperty(this, 'name', {
		value: name,
		enumerable: true,
	});

/**
 * ### Game.description
 * 
 * A text describing the game
 * 
 * @api private
 */
	description = settings.description || 'No Description';
	Object.defineProperty(this, 'description', {
		value: description,
		enumerable: true,
	});

/**
 * ### Game.gameLoop
 * 
 * An object containing the game logic 
 * 
 * @see GameLoop
 * @api private
 */
	gameLoop = new GameLoop(settings.loops);
	Object.defineProperty(this, 'gameLoop', {
		value: gameLoop,
		enumerable: true,
	});

/**
 * ### Game.pl
 * 
 * The list of players connected to the game
 * 
 * The list may be empty, depending on the server settings
 * 
 * @api private
 */
	pl = new PlayerList();
	Object.defineProperty(this, 'pl', {
		value: pl,
		enumerable: true,
		configurable: true,
		writable: true,
	});

/**
 * ### Game.ready
 * 
 * If TRUE, the nodeGame engine is fully loaded
 * 
 * During stepping between functions in the game-loop
 * the flag is temporarily turned to FALSE, and all events 
 * are queued and fired only after nodeGame is ready to 
 * handle them again.
 * 
 * @api private
 */
	Object.defineProperty(this, 'ready', {
		set: function(){},
		get: function(){
			if (this.gameState.is < GameState.iss.LOADED) return false;
			
			// Check if there is a gameWindow obj and whether it is loading
			if (node.window) {	
				return (node.window.state >= GameState.iss.LOADED) ? true : false;
			}
			return true;
		},
		enumerable: true,
	});



// ## Public properties

/**
 * ### Game.observer
 * 
 * If TRUE, silently observes the game. Defaults FALSE
 * 
 * An nodeGame observer will not send any automatic notification
 * to the server, but it will just *observe* the game played by
 * other clients.
 * 
 */
	this.observer = ('undefined' !== typeof settings.observer) ? settings.observer 
		   													: false;

/**
 * ### Game.auto_step
 * 
 * If TRUE, automatically advances to the next state
 * 
 * After a successful DONE event is fired, the client will automatically 
 * goes to the next function in the game-loop without waiting for a STATE
 * message from the server. 
 * 
 * Depending on the configuration settings, it can still perform additional
 * checkings (e.g.wheter the mininum number of players is connected) 
 * before stepping to the next state.
 * 
 */
	this.auto_step = ('undefined' !== typeof settings.auto_step) ? settings.auto_step 
															 : true;

/**
 * ### Game.auto_wait
 * 
 * If TRUE, fires a WAITING... event immediately after a successful DONE event
 * 
 * Under default settings, the WAITING... event temporarily prevents the user
 * to access the screen and displays a message to the player
 */
	this.auto_wait = ('undefined' !== typeof settings.auto_wait) ? settings.auto_wait 
																 : false; 
	
	this.minPlayers = settings.minPlayers || 1;
	this.maxPlayers = settings.maxPlayers || 1000;
	
	// TODO: Check this
	this.init = settings.init || this.init;


/**
 * ### Game.memory
 * 
 * A storage database for the game
 * 
 * In the server logic the content of SET messages are
 * automatically inserted in this object
 * 
 * 	@see node.set
 */
	this.memory = new GameDB();
	
	this.player = null;	
	this.state = this.gameState = new GameState();
	
	
	var that = this,
		say = GameMsg.actions.SAY + '.',
		set = GameMsg.actions.SET + '.',
		get = GameMsg.actions.GET + '.',
		IN  = GameMsg.IN,
		OUT = GameMsg.OUT;

// ## Game incoming listeners
// Incoming listeners are fired in response to incoming messages
	var incomingListeners = function() {
	
/**
 * ### in.get.DATA
 * 
 * Experimental feature. Undocumented (for now)
 */ 
	node.on( IN + get + 'DATA', function (msg) {
		if (msg.text === 'LOOP'){
			node.gsc.sendDATA(GameMsg.actions.SAY, this.gameLoop, msg.from, 'GAME');
		}
		// <!-- We could double emit
		// node.emit(msg.text, msg.data); -->
	});

/**
 * ### in.set.STATE
 * 
 * Adds an entry to the memory object 
 * 
 */
	node.on( IN + set + 'STATE', function (msg) {
		that.memory.add(msg.text, msg.data, msg.from);
	});

/**
 * ### in.set.DATA
 * 
 * Adds an entry to the memory object 
 * 
 */
	node.on( IN + set + 'DATA', function (msg) {
		that.memory.add(msg.text, msg.data, msg.from);
	});

/**
 * ### in.say.STATE
 * 
 * Updates the game state or updates a player's state in
 * the player-list object
 *
 * If the message is from the server, it updates the game state,
 * else the state in the player-list object from the player who
 * sent the message is updated 
 * 
 *  @emit UPDATED_PLIST
 *  @see Game.pl 
 */
	node.on( IN + say + 'STATE', function (msg) {
		console.log('updateState: ' + msg.from + ' -- ' + new GameState(msg.data), 'DEBUG');
		console.log(that.pl.length)
		
		console.log(node.gsc.serverid + 'AAAAAA');
		if (node.gsc.serverid && msg.from === node.gsc.serverid) {
			console.log(node.gsc.serverid + ' ---><--- ' + msg.from);
			console.log('NOT EXISTS');
		}
		
		if (that.pl.exist(msg.from)) {
			console.log('EXIST')
			
			that.pl.updatePlayerState(msg.from, msg.data);
			node.emit('UPDATED_PLIST');
			that.pl.checkState();
		}
		// <!-- Assume this is the server for now
		// TODO: assign a string-id to the server -->
		else {
			console.log('NOT EXISTS')
			that.updateState(msg.data);
		}
	});

/**
 * ### in.say.PLIST
 * 
 * Creates a new player-list object from the data contained in the message
 * 
 * @emit UPDATED_PLIST
 * @see Game.pl 
 */
	node.on( IN + say + 'PLIST', function (msg) {
		if (!msg.data) return;
		that.pl = new PlayerList({}, msg.data);
		node.emit('UPDATED_PLIST');
		that.pl.checkState();
	});
	
}(); // <!-- ends incoming listener -->

// ## Game outgoing listeners
// Incoming listeners are fired in response to outgoing messages
var outgoingListeners = function() {
	
/** 
 * ### out.say.HI
 * 
 * Updates the game-state of the game upon connection to a server
 * 
 */
	node.on( OUT + say + 'HI', function() {
		// Enter the first state
		if (that.auto_step) {
			that.updateState(that.next());
		}
		else {
			// The game is ready to step when necessary;
			that.gameState.is = GameState.iss.LOADED;
			node.gsc.sendSTATE(GameMsg.actions.SAY, that.gameState);
		}
	});

/**
 * ### out.say.STATE
 * 
 * Sends out a STATE message to the specified recipient
 * 
 * TODO: check with the server 
 * The message is for informative purpose
 * 
 */
	node.on( OUT + say + 'STATE', function (state, to) {
		node.gsc.sendSTATE(GameMsg.actions.SAY, state, to);
	});	

/**
 * ### out.say.TXT
 * 
 * Sends out a TXT message to the specified recipient
 */
	node.on( OUT + say + 'TXT', function (text, to) {
		node.gsc.sendTXT(text,to);
	});

/**
 * ### out.say.DATA
 * 
 * Sends out a DATA message to the specified recipient
 */
	node.on( OUT + say + 'DATA', function (data, to, key) {
		node.gsc.sendDATA(GameMsg.actions.SAY, data, to, key);
	});

/**
 * ### out.set.STATE
 * 
 * Sends out a STATE message to the specified recipient
 * 
 * TODO: check with the server 
 * The receiver will update its representation of the state
 * of the sender
 */
	node.on( OUT + set + 'STATE', function (state, to) {
		node.gsc.sendSTATE(GameMsg.actions.SET, state, to);
	});

/**
 * ### out.set.DATA
 * 
 * Sends out a DATA message to the specified recipient
 * 
 * The sent data will be stored in the memory of the recipient
 * 
 * 	@see Game.memory
 */
	node.on( OUT + set + 'DATA', function (data, to, key) {
		node.gsc.sendDATA(GameMsg.actions.SET, data, to, key);
	});

/**
 * ### out.get.DATA
 * 
 * Issues a DATA request
 * 
 * Experimental. Undocumented (for now)
 */
	node.on( OUT + get + 'DATA', function (data, to, key) {
		node.gsc.sendDATA(GameMsg.actions.GET, data, to, data);
	});
	
}(); // <!-- ends outgoing listener -->
	
// ## Game internal listeners
// Internal listeners are not directly associated to messages,
// but they are usually responding to internal nodeGame events, 
// such as progressing in the loading chain, or finishing a game state 
var internalListeners = function() {
	
/**
 * ### STATEDONE
 * 
 * Fired when all the 
 */ 
	node.on('STATEDONE', function() {
		// <!-- If we go auto -->
		if (that.auto_step && !that.observer) {
			node.log('We play AUTO', 'DEBUG');
			var morePlayers = ('undefined' !== that.minPlayers) ? that.minPlayers - that.pl.length : 0 ;
			node.log('Additional player required: ' + morePlayers > 0 ? MorePlayers : 0, 'DEBUG');
			
			if (morePlayers > 0) {
				node.emit('OUT.say.TXT', morePlayers + ' player/s still needed to play the game');
				node.log(morePlayers + ' player/s still needed to play the game');
			}
			// TODO: differentiate between before the game starts and during the game
			else {
				node.emit('OUT.say.TXT', this.minPlayers + ' players ready. Game can proceed');
				node.log(pl.length + ' players ready. Game can proceed');
				that.updateState(that.next());
			}
		}
		else {
			node.log('Waiting for monitor to step', 'DEBUG');
		}
	});

/**
 * ### DONE
 * 
 * Updates and publishes that the client has successfully terminated a state 
 * 
 * If a DONE handler is defined in the game-loop, it will executes it before
 * continuing with further operations. In case it returns FALSE, the update
 * process is stopped. 
 * 
 * @emit BEFORE_DONE
 * @emit WAITING...
 */
	node.on('DONE', function(p1, p2, p3) {
		
		// Execute done handler before updatating state
		var ok = true;
		var done = that.gameLoop.getAllParams(that.gameState).done;
		
		if (done) ok = done.call(that, p1, p2, p3);
		if (!ok) return;
		that.gameState.is = GameState.iss.DONE;
		
		// Call all the functions that want to do 
		// something before changing state
		node.emit('BEFORE_DONE');
		
		if (that.auto_wait) {
			if (node.window) {	
				node.emit('WAITING...');
			}
		}
		that.publishState();	
	});

/**
 * ### PAUSE
 * 
 * Sets the game to PAUSE and publishes the state
 * 
 */
	node.on('PAUSE', function(msg) {
		that.gameState.paused = true;
		that.publishState();
	});

/**
 * ### WINDOW_LOADED
 * 
 * Checks if the game is ready, and if so fires the LOADED event
 * 
 * @emit BEFORE_LOADING
 * @emit LOADED
 */
	node.on('WINDOW_LOADED', function() {
		if (that.ready) node.emit('LOADED');
	});

/**
 * ### GAME_LOADED
 * 
 * Checks if the window was loaded, and if so fires the LOADED event
 * 
 * @emit BEFORE_LOADING
 * @emit LOADED
 */
	node.on('GAME_LOADED', function() {
		if (that.ready) node.emit('LOADED');
	});

/**
 * ### LOADED
 * 
 * 
 */
	node.on('LOADED', function() {
		node.emit('BEFORE_LOADING');
		that.gameState.is =  GameState.iss.PLAYING;
		//TODO: the number of messages to emit to inform other players
		// about its own state should be controlled. Observer is 0 
		//that.publishState();
		node.gsc.clearBuffer();
		
	});
	
}(); // <!-- ends internal listener -->
} // <!-- ends constructor -->

// ## Game methods

/**
 * ### Game.pause
 * 
 * Experimental. Sets the game to pause
 * 
 * @TODO: check with Game.ready
 */
Game.prototype.pause = function () {
	this.gameState.paused = true;
};

/**
 * ### Game.resume
 * 
 * Experimental. Resumes the game from a pause
 * 
 * @TODO: check with Game.ready
 */
Game.prototype.resume = function () {
	this.gameState.paused = false;
};

/**
 * ### Game.next
 * 
 * Fetches a state from the game-loop N steps ahead
 * 
 * Optionally, a parameter can control the number of steps to take
 * in the game-loop before returning the state
 * 
 * @param {number} N Optional. The number of steps to take in the game-loop. Defaults 1
 * @return {boolean|GameState} The next state, or FALSE if it does not exist
 * 
 * 	@see GameState
 * 	@see Game.gameLoop
 */
Game.prototype.next = function (N) {
	if (!N) return this.gameLoop.next(this.gameState);
	return this.gameLoop.jumpTo(this.gameState, Math.abs(N));
};

/**
 * ### Game.previous
 * 
 * Fetches a state from the game-loop N steps back
 * 
 * Optionally, a parameter can control the number of steps to take
 * backward in the game-loop before returning the state
 * 
 * @param {number} times Optional. The number of steps to take in the game-loop. Defaults 1
 * @return {boolean|GameState} The previous state, or FALSE if it does not exist
 * 
 * 	@see GameState
 * 	@see Game.gameLoop
 */
Game.prototype.previous = function (N) {
	if (!N) return this.gameLoop.previous(this.gameState);
	return this.gameLoop.jumpTo(this.gameState, -Math.abs(N));
};

/**
 * ### Game.jumpTo
 * 
 * Moves the game forward or backward in the game-loop
 * 
 * Optionally, a parameter can control the number of steps to take
 * in the game-loop before executing the next function. A negative 
 * value jumps backward in the game-loop, and a positive one jumps
 * forward in the game-loop
 * 
 * @param {number} jump  The number of steps to take in the game-loop
 * @return {boolean} TRUE, if the game succesfully jumped to the desired state
 * 
 * 	@see GameState
 * 	@see Game.gameLoop
 */
Game.prototype.jumpTo = function (jump) {
	if (!jump) return false;
	var gs = this.gameLoop.jumpTo(this.gameState, jump);
	if (!gs) return false;
	return this.updateState(gs);
};

/**
 * ### Game.publishState
 * 
 * Notifies internal listeners, the server and other connected clients 
 * of the current game-state
 * 
 * If the *observer* flag is set, external notification is inhibited, 
 * but the STATECHANGE event is emitted anyway 
 * 
 * @emit STATECHANGE
 * 
 * @see GameState
 * @see	Game.observer
 */
Game.prototype.publishState = function() {
	// <!-- Important: SAY -->
	if (!this.observer) {
		var stateEvent = GameMsg.OUT + GameMsg.actions.SAY + '.STATE'; 
		node.emit(stateEvent, this.gameState, 'ALL');
	}
	
	node.emit('STATECHANGE');
	
	node.log('New State = ' + new GameState(this.gameState), 'DEBUG');
};

/**
 * ### Game.updateState
 * 
 * Updates the game to the specified game-state
 * 
 * @param {GameState} state The state to load and run
 * 
 * @emit BEFORE_LOADING
 * @emit LOADED
 * @emit TXT
 */
Game.prototype.updateState = function (state) {
	
	node.log('New state is going to be ' + new GameState(state), 'DEBUG');
	
	if (this.step(state) !== false) {
		this.paused = false;
		this.gameState.is =  GameState.iss.LOADED;
		if (this.ready) {
			node.emit('LOADED');
		}
	}		
	else {
		node.log('Error in stepping', 'ERR');
		// TODO: implement sendERR
		node.emit('TXT','State was not updated');
	}
};

/**
 * ### Game.step
 * 
 * Retrieves from the game-loop and executes the function for the 
 * specified game-state
 * 
 * @param {GameState} gameState 4 54 Optional. The GameState to run
 * @return {Boolean} FALSE, if the execution encountered an error
 * 
 * 	@see Game.gameLoop
 * 	@see GameState
 */
Game.prototype.step = function (gameState) {
	
	gameState = gameState || this.next();
	if (gameState) {
		
		var func = this.gameLoop.getFunction(gameState);
		
		// Experimental: node.window should load the func as well
//			if (node.window) {
//				var frame = this.gameLoop.getAllParams(gameState).frame;
//				node.window.loadFrame(frame);
//			}
		
		
		
		if (func) {

			// For NDDB EventEmitter
			//console.log('HOW MANY LISTENERS???');
			//console.log(node._ee._listeners.count());
			
			// Local Listeners from previous state are erased 
			// before proceeding to next one
			node._ee.clearState(this.gameState);
			
			// For NDDB EventEmitter
			//console.log(node._ee._listeners.count());
			
			gameState.is = GameState.iss.LOADING;
			this.gameState = gameState;
		
			// This could speed up the loading in other client,
			// but now causes problems of multiple update
			this.publishState();
					
			return func.call(node.game);
		}
	}
	return false;
};

// ## Closure
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
/**
 * # nodeGame
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * ### nodeGame: Web Experiments in the Browser
 * 
 * *nodeGame* is a free, open source, event-driven javascript framework for on line, 
 * multiplayer games in the browser.
 */
(function (node) {
	
	// Declaring variables
	////////////////////////////////////////////
		
	var EventEmitter = node.EventEmitter;
	var GameSocketClient = node.GameSocketClient;
	var GameState = node.GameState;
	var GameMsg = node.GameMsg;
	var Game = node.Game;
	var Player = node.Player;
	var GameSession = node.GameSession;
	
	
	// Adding constants directly to node
	//////////////////////////////////////////
	
	node.actions 	= GameMsg.actions;
	node.IN 		= GameMsg.IN;
	node.OUT 		= GameMsg.OUT;
	node.targets 	= GameMsg.targets;		
	node.states 	= GameState.iss;
	
	// Creating EventEmitter
	///////////////////////////////////////////
	
	var ee = node.events = node._ee = new EventEmitter();


	// Creating objects
	///////////////////////////////////////////
	
	node.msg		= node.GameMsgGenerator;	
	node.gsc 		= new GameSocketClient();

	node.game 		= null;
	node.player 	= null;
	
	Object.defineProperty(node, 'state', {
    	get: function() {
    		return (node.game) ? node.game.gameState : false;
    	},
    	configurable: false,
    	enumerable: true,
	});
	
	// Adding methods
	///////////////////////////////////////////
	
	/**
	 * Parses the a node configuration object and add default and missing
	 * values. Stores the final configuration in node.conf.
	 * 
	 */
	node._analyzeConf = function (conf) {
		if (!conf) {
			node.log('Invalid configuration object found.', 'ERR');
			return false;
		}
		
		// URL
		if (!conf.host) {
			if ('undefined' !== typeof window) {
				if ('undefined' !== typeof window.location) {
					var host = window.location.href;
				}
			}
			else {
				var host = conf.url;
			}
			if (host) {
				var tokens = host.split('/').slice(0,-2);
				// url was not of the form '/channel'
				if (tokens.length > 1) {
					conf.host = tokens.join('/');
				}
			}
		}
		
		
		// Add a trailing slash if missing
		if (conf.host.lastIndexOf('/') !== host.length) {
			conf.host = conf.host + '/';
		}
		
		// VERBOSITY
		if ('undefined' !== typeof conf.verbosity) {
			node.verbosity = conf.verbosity;
		}
		
		this.conf = conf;
		return conf;
	};
	
	
	node.on = function (event, listener) {
		// It is in the init function;
		if (!node.state || (GameState.compare(node.state, new GameState(), true) === 0 )) {
			ee.addListener(event, listener);
			// node.log('global');
		}
		else {
			ee.addLocalListener(event, listener);
			// node.log('local');
		}
	};
	
	node.once = function (event, listener) {
		node.on(event, listener);
		node.on(event, function(event, listener) {
			ee.removeListener(event, listener);
		});
	};
	
	node.removeListener = function (event, func) {
		return ee.removeListener(event, func);
	};
	
	// TODO: create conf objects
	node.play = function (conf, game) {	
		node._analyzeConf(conf);
		
		//node.gsc.connect(conf);
		
		node.game = new Game(game);
		node.emit('NODEGAME_GAME_CREATED');
		
		
		// INIT the game
		node.game.init.call(node.game);
		node.gsc.connect(conf); // was node.gsc.setGame(node.game);
		
		node.log('game loaded...');
		node.log('ready.');
	};	
	
//	node.observe = function (conf, game) {
//		node._analyzeConf(conf);
//		
//		var game = game || {loops: {1: {state: function(){}}}};
//		node.gsc = that.gsc = new GameSocketClient(conf);
//		
//		node.game = that.game = new Game(game, that.gsc);
//		node.gsc.setGame(that.game);
//		
//		node.on('NODEGAME_READY', function(){
//			
//			// Retrieve the game and set is as observer
//			node.get('LOOP', function(game) {
//				
//				// alert(game);
//				// console.log('ONLY ONE');
//				// console.log(game);
//	// var game = game.observer = true;
//	// node.game = that.game = game;
//	//			
//	// that.game.init();
//	//			
//	// that.gsc.setGame(that.game);
//	//			
//	// node.log('nodeGame: game loaded...');
//	// node.log('nodeGame: ready.');
//			});
//		});
		
		
// node.onDATA('GAME', function(data){
// alert(data);
// console.log(data);
// });
		
// node.on('DATA', function(msg){
// console.log('--------->Eh!')
// console.log(msg);
// });
//	};	
	
	node.emit = function (event, p1, p2, p3) {	
		ee.emit(event, p1, p2, p3);
	};	
	
	node.say = function (data, what, whom) {
		ee.emit('out.say.DATA', data, whom, what);
	};
	
	/**
	 * Set the pair (key,value) into the server
	 * 
	 * @value can be an object literal.
	 * 
	 * 
	 */
	node.set = function (key, value) {
		// TODO: parameter to say who will get the msg
		ee.emit('out.set.DATA', value, null, key);
	};
	
	
	node.get = function (key, func) {
		ee.emit('out.get.DATA', key);
		
		var listener = function(msg) {
			if (msg.text === key) {
				func.call(node.game, msg.data);
				ee.removeListener('in.say.DATA',listener);
			}
			// ee.printAllListeners();
		};
		
		node.on('in.say.DATA', listener);
	};
	
	node.replay = function (reset) {
		if (reset) node.game.memory.clear(true);
		node.goto(new GameState({state: 1, step: 1, round: 1}));
	}
	
	node.goto = function (state) {
		node.game.updateState(state);
	};
	
	// *Aliases*
	//
	// Conventions:
	//
	// - Direction:
	// 'in' for all
	//
	// - Target:
	// DATA and TXT are 'say' as default
	// STATE and PLIST are 'set' as default
	
	
	// Sending
		
	
// this.setSTATE = function(action,state,to){
// var stateEvent = GameMsg.OUT + action + '.STATE';
// fire(stateEvent,action,state,to);
// };
	
	// Receiving
	
	// Say
	
	node.onTXT = function(func) {
		node.on("in.say.TXT", function(msg) {
			func.call(node.game,msg);
		});
	};
	
	node.onDATA = function(text, func) {
		node.on('in.say.DATA', function(msg) {
			if (text && msg.text === text) {
				func.call(node.game,msg);
			}
		});
		
		node.on('in.set.DATA', function(msg) {
			func.call(node.game,msg);
		});
	};
	
	// Set
	
	node.onSTATE = function(func) {
		node.on("in.set.STATE", function(msg) {
			func.call(node.game, msg);
		});
	};
	
	node.onPLIST = function(func) {
		node.on("in.set.PLIST", function(msg) {
			func.call(node.game, msg);
		});
		
		node.on("in.say.PLIST", function(msg) {
			func.call(node.game, msg);
		});
	};
	
	node.DONE = function (text) {
		node.emit("DONE",text);
	};
	
	node.TXT = function (text, to) {
		node.emit('out.say.TXT', text, to);
	};	
	
	
	node.random = {};
	
	// Generates event at RANDOM timing in milliseconds
	// if timing is missing, default is 6000
	node.random.emit = function (event, timing){
		var timing = timing || 6000;
		setTimeout(function(event) {
			node.emit(event);
		}, Math.random()*timing, event);
	};
	
	node.random.exec = function (func, timing) {
		var timing = timing || 6000;
		setTimeout(function(func) {
			func.call();
		}, Math.random()*timing, func);
	}
		
	node.log(node.version + ' loaded', 'ALWAYS');
	
})('undefined' != typeof node ? node : module.parent.exports);

/**
 * # GameTimer
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * Creates a controllable timer object for nodeGame 
 * 
 * ---
 * 
 */

(function (exports, node) {
	
// ## Global scope
	
exports.GameTimer = GameTimer;

JSUS = node.JSUS;

/**
 * ### GameTimer status levels
 * Numerical levels representing the state of the GameTimer
 * 
 * 	@see GameTimer.status
 */
GameTimer.STOPPED = -5
GameTimer.PAUSED = -3;
GameTimer.UNINITIALIZED = -1;
GameTimer.INITIALIZED = 0;
GameTimer.LOADING = 3;
GameTimer.RUNNING = 5;
	
/**
 * ## GameTimer constructor
 * 
 * Creates an instance of GameTimer
 * 
 * @param {object} options. Optional. A configuration object
 */	
function GameTimer (options) {
	options = options || {};

// ## Public properties

/**
 * ### GameTimer.status
 * 
 * Numerical index representing the current the state of the GameTimer object
 * 
 */
	this.status = GameTimer.UNINITIALIZED;	
	
/**
 * ### GameTimer.options
 * 
 * The current settings for the GameTimer
 * 
 */	
	this.options = options;

/**
 * ### GameTimer.timer
 * 
 * The ID of the javascript interval
 * 
 */	
	this.timer = null; 		

/**
 * ### GameTimer.timeLeft
 * 
 * Milliseconds left before time is up
 * 
 */	
	this.timeLeft = null;
	
/**
 * ### GameTimer.timePassed
 * 
 * Milliseconds already passed from the start of the timer
 * 
 */	
	this.timePassed = 0;

/**
 * ### GameTimer.update
 * 
 * The frequency of update for the timer (in milliseconds)
 * 
 */	
	this.update = 1000;	
	
/**
 * ### GameTimer.timeup
 * 
 * Event string or function to fire when the time is up
 * 
 * 	@see GameTimer.fire
 */		
	this.timeup = 'TIMEUP';	
	
/**
 * ### GameTimer.hooks
 * 
 * Array of hook functions to fire at every update
 * 
 * The array works as a LIFO queue
 * 
 * 	@see GameTimer.fire
 */	
	this.hooks = [];
	
	this.init();
	// TODO: remove into a new addon
	this.listeners();
};

// ## GameTimer methods

/**
 * ### GameTimer.init
 * 
 * Inits the GameTimer
 * 
 * Takes the configuration as an input parameter or 
 * recycles the settings in `this.options`.
 * 
 * The configuration object is of the type
 * 
 * 	var options = {
 * 		milliseconds: 4000, // The length of the interval
 * 		update: 1000, // How often to update the time counter. Defaults every 1sec
 * 		timeup: 'MY_EVENT', // An event ot function to fire when the timer expires
 * 		hooks: [ myFunc, // Array of functions or events to fire at every update
 * 				'MY_EVENT_UPDATE', 
 * 				{ hook: myFunc2,
 * 				  ctx: that, }, 	
 * 				], 
 * 	} 
 * 	// Units are in milliseconds 
 * 
 * @param {object} options Optional. Configuration object
 * 
 * 	@see GameTimer.addHook
 */
GameTimer.prototype.init = function (options) {
	options = options || this.options;
	this.status = GameTimer.UNINITIALIZED;
	if (this.timer) clearInterval(this.timer);
	this.milliseconds = options.milliseconds || 0;
	this.timeLeft = this.milliseconds;
	this.timePassed = 0;
	this.update = options.update || 1000;
	this.timeup = options.timeup || 'TIMEUP'; // event to be fire when timer is expired
	// TODO: update and milliseconds must be multiple now
	if (options.hooks) {
		for (var i=0; i < options.hooks.length; i++){
			this.addHook(options.hooks[i]);
		}
	}
	
	this.status = GameTimer.INITIALIZED;
};


/**
 * ### GameTimer.fire
 * 
 * Fires a registered hook
 * 
 * If it is a string it is emitted as an event, 
 * otherwise it called as a function.
 * 
 * @param {mixed} h The hook to fire
 * 
 */
GameTimer.prototype.fire = function (h) {
	if (!h && !h.hook) return;
	var hook = h.hook || h;
	if ('function' === typeof hook) {
		var ctx = h.ctx || node.game;
		hook.call(ctx);
	}
	else {
		node.emit(hook);
	}	
};
	
/**
 * ### GameTimer.start
 * 
 * Starts the timer
 * 
 * Updates the status of the timer and calls `setInterval`
 * At every update all the registered hooks are fired, and 
 * time left is checked. 
 * 
 * When the timer expires the timeup event is fired, and the
 * timer is stopped
 * 
 * 	@see GameTimer.status
 * 	@see GameTimer.timeup
 * 	@see GameTimer.fire 
 * 
 */
GameTimer.prototype.start = function() {
	this.status = GameTimer.LOADING;
	// fire the event immediately if time is zero
	if (this.options.milliseconds === 0) {
		node.emit(this.timeup);
		return;
	}

	var that = this;
	this.timer = setInterval(function() {
		that.status = GameTimer.RUNNING;
		node.log('interval started: ' + that.timeLeft, 'DEBUG', 'GameTimer: ');
		that.timePassed = that.timePassed + that.update;
		that.timeLeft = that.milliseconds - that.timePassed;
		// Fire custom hooks from the latest to the first if any
		for (var i = that.hooks.length; i > 0; i--) {
			that.fire(that.hooks[(i-1)]);
		}
		// Fire Timeup Event
		if (that.timeLeft <= 0) {
			// First stop the timer and then call the timeup
			that.stop();
			that.fire(that.timeup);
			node.log('time is up: ' + that.timeup, 'DEBUG', 'GameTimer: ');
		}
		
	}, this.update);
};
	
/**
 * ### GameTimer.addHook
 * 
 * 
 * Add an hook to the hook list after performing conformity checks.
 * The first parameter hook can be a string, a function, or an object
 * containing an hook property.
 */
GameTimer.prototype.addHook = function (hook, ctx) {
	if (!hook) return;
	var ctx = ctx || node.game;
	if (hook.hook) {
		ctx = hook.ctx || ctx;
		var hook = hook.hook;
	}
	this.hooks.push({hook: hook, ctx: ctx});
};

/**
 * ### GameTimer.pause
 * 
 * Pauses the timer
 * 
 * If the timer was running, clear the interval and sets the
 * status property to `GameTimer.PAUSED`
 * 
 */
GameTimer.prototype.pause = function() {
	if (this.status > 0) {
		this.status = GameTimer.PAUSED;
		//console.log('Clearing Interval... pause')
		clearInterval(this.timer);
	}
};	

/**
 * ### GameTimer.resume
 * 
 * Resumes a paused timer
 * 
 * If the timer was paused, restarts it with the current configuration
 * 
 * 	@see GameTimer.restart
 */
GameTimer.prototype.resume = function() {
	if (this.status !== GameTimer.PAUSED) return; // timer was not paused
	var options = JSUS.extend({milliseconds: this.milliseconds - this.timePassed}, this.options);
	this.restart(options);
};	

/**
 * ### GameTimer.stop
 * 
 * Stops the timer
 * 
 * If the timer was paused or running, clear the interval, sets the
 * status property to `GameTimer.STOPPED`, and reset the time passed
 * and time left properties
 * 
 */
GameTimer.prototype.stop = function() {
	if (this.status === GameTimer.UNINITIALIZED) return;
	if (this.status === GameTimer.INITIALIZED) return;
	if (this.status === GameTimer.STOPPED) return;
	this.status = GameTimer.STOPPED;
	clearInterval(this.timer);
	this.timePassed = 0;
	this.timeLeft = null;
};	

/**
 * ### GameTimer.restart
 * 
 * Restarts the timer
 *  
 * Uses the input parameter as configuration object, 
 * or the current settings, if undefined 
 *  
 * @param {object} options Optional. A configuration object
 *  
 * 	@see GameTimer.init
 */
GameTimer.prototype.restart = function (options) {
	this.init(options);
	this.start();
};

/**
 * ### GameTimer.listeners
 * 
 * Experimental. Undocumented (for now)
 * 
 */
GameTimer.prototype.listeners = function () {
	var that = this;
// <!--	
//		node.on('GAME_TIMER_START', function() {
//			that.start();
//		}); 
//		
//		node.on('GAME_TIMER_PAUSE', function() {
//			that.pause();
//		});
//		
//		node.on('GAME_TIMER_RESUME', function() {
//			that.resume();
//		});
//		
//		node.on('GAME_TIMER_STOP', function() {
//			that.stop();
//		});
	
//		node.on('DONE', function(){
//			console.log('TIMER PAUSED');
//			that.pause();
//		});
	
	// TODO: check what is right behavior for this
//		node.on('WAITING...', function(){
//			that.pause();
//		});
// -->
	
};

// ## Closure
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
/**
 * 
 * # TriggerManager: 
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * Manages a collection of trigger functions to be called sequentially
 *  
 * ## Note for developers
 * 
 * Triggers are functions that operate on a common object, and each 
 * sequentially adds further modifications to it. 
 * 
 * If the TriggerManager were a beauty saloon, the first trigger function
 * would wash the hair, the second would cut the washed hair, and the third
 * would style it. All these operations needs to be done sequentially, and
 * the TriggerManager takes care of handling this process.
 * 
 * If `TriggerManager.return` is set equal to `TriggerManager.first`, 
 * the first trigger function returning a truthy value will stop the process
 * and the target object will be immediately returned. In these settings,
 * if a trigger function returns `undefined`, the target is passed to the next
 * trigger function. 
 * 
 * Notice: TriggerManager works as a *LIFO* queue, i.e. new trigger functions
 * will be executed first.
 * 
 * ---
 * 
 */

(function(exports, node){

// ## Global scope
	
exports.TriggerManager = TriggerManager;

TriggerManager.first = 'first';
TriggerManager.last = 'last';

var triggersArray;

/**
 * ## TriggerManager constructor
 * 
 * Creates a new instance of TriggerManager
 * 
 */
function TriggerManager (options) {
// ## Private properties
	
/**
 * ### TriggerManager.triggers
 * 
 * Array of trigger functions 
 * 
 */
	triggersArray = [];
	Object.defineProperty(this, 'triggers', {
		value: triggersArray,
		enumerable: true,
	});
	
// ## Public properties

/**
 * ### TriggerManager.options
 * 
 * Reference to current configuration
 * 
 */	
	this.options = options || {};

/**
 * ### TriggerManager.return
 * 
 * Controls the behavior of TriggerManager.pullTriggers
 * 
 */	
	this.return = TriggerManager.first; // options are first, last 


/**
 * ### TriggerManager.length
 * 
 * The number of registered trigger functions
 * 
 */
	Object.defineProperty(this, 'length', {
		set: function(){},
		get: function(){
			return triggersArray.length;
		},
		configurable: true
	});
	
	this.init();
};

// ## TriggerManager methods

/**
 * ### TriggerManager.init
 * 
 * Configures the TriggerManager instance
 * 
 * Takes the configuration as an input parameter or 
 * recycles the settings in `this.options`.
 * 
 * The configuration object is of the type
 * 
 * 	var options = {
 * 		return: 'first', // or 'last'
 * 		triggers: [ myFunc,
 * 					myFunc2 
 * 		],
 * 	} 
 * 	 
 * @param {object} options Optional. Configuration object
 * 
 */
TriggerManager.prototype.init = function (options) {
	this.options = options || this.options;
	if (this.options.return === TriggerManager.first || this.options.return === TriggerManager.last) {
		this.return = this.options.return;
	}
	this.resetTriggers();
};

/**
 * ### TriggerManager.initTriggers
 * 
 * Adds a collection of trigger functions to the trigger array
 * 
 * @param {function|array} triggers An array of trigger functions or a single function 
 */
TriggerManager.prototype.initTriggers = function (triggers) {
	if (!triggers) return;
	
	if (!(triggers instanceof Array)) {
		triggers = [triggers];
	}
	for (var i=0; i< triggers.length; i++) {
		triggersArray.push(triggers[i]);
	}
  };
	
/**
 * ### TriggerManager.resetTriggers
 *   
 * Resets the trigger array to initial configuration
 *   
 * Delete existing trigger functions and re-add the ones
 * contained in `TriggerManager.options.triggers`
 * 
 */
TriggerManager.prototype.resetTriggers = function () {
	triggersArray = [];
	this.initTriggers(this.options.triggers);
};

/**
 * ### TriggerManager.clear
 * 
 * Clears the trigger array
 * 
 * Requires a boolean parameter to be passed for confirmation
 * 
 * @param {boolean} clear TRUE, to confirm clearing
 * @return {boolean} TRUE, if clearing was successful
 */
TriggerManager.prototype.clear = function (clear) {
	if (!clear) {
		node.log('Do you really want to clear the current TriggerManager obj? Please use clear(true)', 'WARN');
		return false;
	}
	triggersArray = [];
	return clear;
};
	
/**
 * ### TriggerManager.addTrigger
 * 
 * Pushes a trigger into the trigger array
 * 
 * @param {function} trigger The function to add
 * @param {number} pos Optional. The index of the trigger in the array
 * @return {boolean} TRUE, if insertion is successful
 */	  
TriggerManager.prototype.addTrigger = function (trigger, pos) {
	if (!trigger) return false;
	if (!('function' === typeof trigger)) return false;
	if (!pos) {
		triggersArray.push(trigger);
	}
	else {
		triggersArray.splice(pos, 0, trigger);
	}
	return true;
};
	  
/**
 * ### TriggerManager.removeTrigger
 * 
 * Removes a trigger from the trigger array
 * 
 * @param {function} trigger The function to remove
 * @return {boolean} TRUE, if removal is successful
 */	  
TriggerManager.prototype.removeTrigger = function (trigger) {
	if (!trigger) return false;
	for (var i=0; i< triggersArray.length; i++) {
		if (triggersArray[i] == trigger) {
			return triggersArray.splice(i,1);
		}
	}  
	return false;
};

/**
 * ### TriggerManager.pullTriggers
 * 
 * Fires the collection of trigger functions on the target object
 * 
 * Triggers are fired according to a LIFO queue, i.e. new trigger
 * functions are fired first.
 * 
 * Depending on the value of `TriggerManager.return`, some trigger
 * functions may not be called. In fact a value is returned 
 * 
 * 	- 'first': after the first trigger returns a truthy value
 * 	- 'last': after all triggers have been executed
 * 
 * If no trigger is registered the target object is returned unchanged
 * 
 * @param {object} o The target object
 * @return {object} The target object after the triggers have been fired
 * 
 */	
TriggerManager.prototype.pullTriggers = function (o) {
	if ('undefined' === typeof o) return;
	if (!this.length) return o;
	
	for (var i = triggersArray.length; i > 0; i--) {
		var out = triggersArray[(i-1)].call(this, o);
		if ('undefined' === typeof out) {
			if (this.return === TriggerManager.first) {
				return out;
			}
		}
	}
	// Safety return
	return ('undefined' !== typeof out) ? out : o;
};

// <!-- old pullTriggers
TriggerManager.prototype.pullTriggers = function (o) {
	if (!o) return;
	
	for (var i = triggersArray.length; i > 0; i--) {
		var out = triggersArray[(i-1)].call(this, o);
		if (out) {
			if (this.return === TriggerManager.first) {
				return out;
			}
		}
	}
	// Safety return
	return o;
}; 
//-->


/**
 * ### TriggerManager.size
 * 
 * Returns the number of registered trigger functions
 * 
 * Use TriggerManager.length instead 
 * 
 * @deprecated
 */
TriggerManager.prototype.size = function () {
	return triggersArray.length;
};
	

// ## Closure	
})(
	('undefined' !== typeof node) ? node : module.exports
  , ('undefined' !== typeof node) ? node : module.parent.exports
);
/**
 * # GameSession
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * Addon to save and load the nodeGame session in the browser
 * 
 *  @see node.store
 *  
 * ---
 * 
 */

(function (node) {
	
	// ## Global scope
	
	var JSUS = node.JSUS,
		NDDB = node.NDDB,
		store = node.store;

	var prefix = 'nodegame_';

/**
 * ## node.session
 *
 * Loads a nodeGame session
 *
 * If no parameter is passed it will return the current session.
 * Else, it will try to load a session with the given id. 
 *
 * This method interact with the `node.store` object that provides
 * lower level capabilities to write to a persistent support (e.g. 
 * the browser localStorate).
 * 
 * @param {number} sid Optional. The session id to load
 * @return {object} The session object
 * 
 *  @see node.store
 * 
 */
	node.session = function (sid) {
				
		// Returns the current session
		if (!sid) {
			var session = {
					id: 	node.gsc.session,
					player: node.player,
					memory: node.game.memory,
					state: 	node.game.gameState,
					game: 	node.game.name,
					history: undefined,
			};
			
			// If we saved the emitted events, add them to the
			// session object
			if (node.events.history || node.events.history.length) {
				session.history = node.events.history.fetch();
			}
			
			return session;
		}
		
		if (!node.session.enabled) {
			return false;
		}
		
		// Tries to return a stored session
		return node.store(prefix + sid);
	};

/**
 * ## node.session.enabled
 * 
 * TRUE, if the session can be saved to a persistent support
 * 
 */	
	Object.defineProperty(node.session, 'enabled', {
    	get: function(){
    		return (node.store) ? node.store.persistent : false;
    	},
    	configurable: false,
    	enumerable: true,
	});

/**
 * ## node.session.store
 * 
 * Stores the current session to a persistent medium
 * 
 * @return {boolean} TRUE, if session saving was successful
 */	
	node.session.store = function() {
		if (!node.session.enabled) {
			node.log('Could not save the session');
			return false;
		}
		
		var session = node.session();
		var sid = session.id;
		node.store(prefix + sid, session);
		node.log('Session saved with id ' + sid);
		return true;
	}
	
// <!--	
//	node.session.restore = function (sessionObj, sid) {
//		
//		if (!sessionObj) return false;
//		if (!sessionObj.player) return false;
//		if (!sessionObj.state) return false;
//		
//		sid = sid || sessionObj.player.sid;
//		if (!sid) return false;
//		
//		var player = {
//				id: 	sessionObj.player.id,
//				sid: 	sid,
//				name:	node.gsc.name,
//		};
//	
//		that.createPlayer(player);
//		
//		node.gsc.session 	= sessionObj.id;
//		node.game.memory 	= sessionObj.memory;
//		
//		node.goto(session.state);	
//		
//		return true;
//		
//	};
// -->

// ## Closure	
})('undefined' != typeof node ? node : module.parent.exports);
(function (window, node) {
	
	/**
	 * 
	 * nodeGame-window: GameWindow
	 * 
	 * GameWindow provides a handy API to interface nodeGame with the 
	 * browser window.
	 * 
	 * Creates a custom root element inside the HTML page, and insert an
	 * iframe element inside it.
	 * 
	 * Dynamic content can be loaded inside the iframe without losing the
	 * javascript state inside the page.
	 * 
	 * Loads and unloads special javascript/HTML snippets, called widgets,
	 * in the page.
	 * 
	 * Defines a number of pre-defined profiles associated with special
	 * configuration of widgets.
	 * 
	 * Depends on nodegame-client. 
	 * GameWindow.Table and GameWindow.List depend on NDDB and JSUS.
	 * 
	 * Widgets can have custom dependencies, which are checked internally 
	 * by the GameWindow engine.
	 * 
	 */
	
	var JSUS = node.JSUS;
	
	var Player = node.Player;
	var PlayerList = node.PlayerList;
	var GameState = node.GameState;
	var GameMsg = node.GameMsg;
	var GameMsgGenerator = node.GameMsgGenerator;
	
	var DOM = JSUS.get('DOM');
	GameWindow.prototype = DOM;
	GameWindow.prototype.constructor = GameWindow;
	
	// The widgets container
	GameWindow.prototype.widgets = {};
	
	
	// Configuration object
	GameWindow.defaults = {};
	
	// Default settings
	GameWindow.defaults.promptOnleave = true;
	GameWindow.defaults.noEscape = true;
	
	
	/**
	 * The constructor performs the following operations:
	 * 
	 * 		- creates a root div element (this.root)
	 * 		- creates an iframe element inside the root element	(this.frame)
	 * 		- defines standard event listeners for showing and hiding elements
	 * 
	 */
	function GameWindow() {
		var that = this;
		
		if ('undefined' === typeof window) {
			throw new Error('nodeWindow: no DOM found. Are we in a browser? Aborting.');
		}
		
		if ('undefined' === typeof node) {
			node.log('nodeWindow: nodeGame not found', 'ERR');
		}
		
		node.log('nodeWindow: loading...');
		var gsc = node.gsc || null;
		var game = node.game || null;
		
		
		
		this.frame = null; // contains an iframe 
		this.mainframe = 'mainframe';
		this.root = null;
		
		this.conf = {};
		
		this.state = GameState.iss.LOADED;
		this.areLoading = 0; 
		
		// Init default behavior
		this.init();
		
		
		var listeners = function() {
			
			node.on('NODEGAME_GAME_CREATED', function() {
				that.init(node.conf.window);
			});
			
			node.on('HIDE', function(id) {
				var el = that.getElementById(id);
				if (!el) {
					node.log('Cannot hide element ' + id);
					return;
				}
				el.style.visibility = 'hidden';    
			});
			
			node.on('SHOW', function(id) {
				var el = that.getElementById(id);
				if (!el) {
					node.log('Cannot show element ' + id);
					return;
				}
				el.style.visibility = 'visible'; 
			});
			
			node.on('TOGGLE', function(id) {
				var el = that.getElementById(id);
				if (!el) {
					node.log('Cannot toggle element ' + id);
					return;
				}
				if (el.style.visibility === 'visible') {
					el.style.visibility = 'hidden';
				}
				else {
					el.style.visibility = 'visible';
				}
			});
			
			// Disable all the input forms found within a given id element
			node.on('INPUT_DISABLE', function(id) {
				that.toggleInputs(id, true);			
			});
			
			// Disable all the input forms found within a given id element
			node.on('INPUT_ENABLE', function(id) {
				that.toggleInputs(id, false);
			});
			
			// Disable all the input forms found within a given id element
			node.on('INPUT_TOGGLE', function(id) {
				that.toggleInputs(id);
			});
			
		}();
	};
	
	/**
	 * Set global variables based on local configuration.
	 * 
	 * Defaults:
	 * 
	 * 		- promptOnleave TRUE
	 * 		- captures ESC key
	 * 
	 */
	GameWindow.prototype.init = function(options) {
		options = options || {};
		this.conf = JSUS.merge(GameWindow.defaults, options);
		
		if (this.conf.promptOnleave) {
			this.promptOnleave();
		}
		else if (this.conf.promptOnleave === false) {
			this.restoreOnleave();
		}
		
		if (this.conf.noEscape) {
			this.noEscape();
		}
		else if (this.conf.noEscape === false){
			this.restoreEscape();
		}
		
	};
	
	/**
	 * Binds the ESC key to a function that always returns FALSE.
	 * 
	 * This prevents socket.io to break the connection with the
	 * server.
	 * 
	 */
	GameWindow.prototype.noEscape = function (windowObj) {
		windowObj = windowObj || window;
		windowObj.document.onkeydown = function(e) {
			var keyCode = (window.event) ? event.keyCode : e.keyCode;
			if (keyCode === 27) {
				return false;
			}
		}; 
	};
	
	/**
	 * Removes the the listener on the ESC key.
	 * 
	 * @see GameWindow.noEscape()
	 */
	GameWindow.prototype.restoreEscape = function (windowObj) {
		windowObj = windowObj || window;
		windowObj.document.onkeydown = null;
	};
	
	
	
	/**
	 * Captures the onbeforeunload event, and warns the user
	 * that leaving the page may halt the game.
	 * 
	 * @see https://developer.mozilla.org/en/DOM/window.onbeforeunload
	 * 
	 */
	GameWindow.prototype.promptOnleave = function (windowObj, text) {
		windowObj = windowObj || window;
		text = ('undefined' === typeof text) ? this.conf.textOnleave : text; 
		windowObj.onbeforeunload = function(e) {	  
			  e = e || window.event;
			  // For IE<8 and Firefox prior to version 4
			  if (e) {
			    e.returnValue = text;
			  }
			  // For Chrome, Safari, IE8+ and Opera 12+
			  return text;
		};
	};
	
	/**
	 * Removes the onbeforeunload event listener.
	 * 
	 * @see GameWindow.promptOnleave
	 * @see https://developer.mozilla.org/en/DOM/window.onbeforeunload
	 * 
	 */
	GameWindow.prototype.restoreOnleave = function (windowObj) {
		windowObj = windowObj || window;
		windowObj.onbeforeunload = null;
	};
	
	
	
	/**
	 * Setups the page with a predefined configuration of widgets.
	 * 
	 */
	GameWindow.prototype.setup = function (type){
	
		if (!this.root) {
			this.root = this.generateNodeGameRoot();
		}
		
		switch (type) {
		
		case 'MONITOR':
			
			// TODO: Check this
			node.removeListener('in.STATE');
			
			this.addWidget('NextPreviousState');
			this.addWidget('GameSummary');
			this.addWidget('StateDisplay');
			this.addWidget('StateBar');
			this.addWidget('DataBar');
			this.addWidget('MsgBar');
			this.addWidget('GameBoard');
			this.addWidget('ServerInfoDisplay');
			this.addWidget('Wall');
			//this.addWidget('GameTable');
	
			// Add default CSS
			if (node.conf.host) {
				this.addCSS(document.body, node.conf.host + '/stylesheets/monitor.css');
			}
			
			break;
			
		case 'PLAYER':
			
			//var maincss		= this.addCSS(this.root, 'style.css');
			this.header 	= this.generateHeader();
		    var mainframe 	= this.addIFrame(this.root,'mainframe');
		    
			node.game.vs 	= this.addWidget('VisualState', this.header);
			node.game.timer = this.addWidget('VisualTimer', this.header);
			//node.game.doneb = this.addWidget('DoneButton', this.header);
			node.game.sd 	= this.addWidget('StateDisplay', this.header);

			this.addWidget('WaitScreen');
		    
			// Add default CSS
			if (node.conf.host) {
				this.addCSS(document.body, node.conf.host + '/stylesheets/player.css');
			}
		
			this.frame = window.frames[this.mainframe]; // there is no document yet
			var initPage = this.getBlankPage();
			if (this.conf.noEscape) {
				// TODO: inject the no escape code here
				// not working
				//this.addJS(initPage, node.conf.host + 'javascripts/noescape.js');
			}
			
			window.frames[this.mainframe].src = initPage;
		    
			break;
		}
		
		

	};
	

	/**
	 * Returns the screen of the game, i.e. the innermost element
	 * inside which to display content. 
	 * 
	 * In the following order the screen can be:
	 * 
	 * 		- the body element of the iframe 
	 * 		- the document element of the iframe 
	 * 		- the body element of the document 
	 * 		- the last child element of the document
	 * 
	 */
	GameWindow.prototype.getScreen = function() {
		var el = this.frame;
		if (el) {
			el = this.frame.body || el;
		}
		else {
			el = document.body || document.lastElementChild;
		}
		return 	el;
	};
	
	/**
	 * Returns the document element of the iframe of the game.
	 * 
	 * @TODO: What happens if the mainframe is not called mainframe?
	 */
	GameWindow.prototype.getFrame = function() {
		return this.frame = window.frames['mainframe'].document;
	};
	
	
	/**
	 * Loads content from an uri (remote or local) into the iframe, 
	 * and after it is loaded executes the callback function. 
	 * 
	 * The third parameter is the id of the frame in which to load the content. 
	 * If it is not specified, the default iframe of the game is assumed.
	 * 
	 * Warning: Security policies may block this methods, if the 
	 * content is coming from another domain.
	 * 
	 */
	GameWindow.prototype.load = GameWindow.prototype.loadFrame = function (url, func, frame) {
		if (!url) return;
 		
 		this.state = GameState.iss.LOADING;
 		this.areLoading++; // keep track of nested call to loadFrame
 		
		var frame =  frame || this.mainframe;
 		var that = this;	
 				
 		// First add the onload event listener
		var iframe = document.getElementById(frame);
		iframe.onload = function () {
			if (that.conf.noEscape) {
				
				// TODO: inject the no escape code here
				
				//that.addJS(iframe.document, node.conf.host + 'javascripts/noescape.js');
				//that.addJS(that.getElementById('mainframe'), node.conf.host + 'javascripts/noescape.js');
			}
			that.updateStatus(func, frame);
		};
	
		// Then update the frame location
		window.frames[frame].location = url;
		
		
		// Adding a reference to nodeGame also in the iframe
		window.frames[frame].window.node = node;
//		console.log('the frame just as it is');
//		console.log(window.frames[frame]);
		// Experimental
//		if (url === 'blank') {
//			window.frames[frame].src = this.getBlankPage();
//			window.frames[frame].location = '';
//		}
//		else {
//			window.frames[frame].location = url;
//		}
		
 						
 	};
 	
 	
 	GameWindow.prototype.updateStatus = function(func, frame) {
 		// Update the reference to the frame obj
		this.frame = window.frames[frame].document;
			
		if (func) {
    		func.call(node.game); // TODO: Pass the right this reference
    		//node.log('Frame Loaded correctly!');
    	}
			
		this.areLoading--;
		//console.log('ARE LOADING: ' + this.areLoading);
		if (this.areLoading === 0) {
			this.state = GameState.iss.LOADED;
			node.emit('WINDOW_LOADED');
		}
		else {
			node.log('Attempt to update state, before the window object was loaded', 'DEBUG');
		}
 	};
 		
 	/**
 	 * Retrieves, instantiates and returns the specified widget.
 	 * 
 	 * It can attach standard javascript listeners to the root element of
 	 * the widget if specified in the options.
 	 * 
 	 * @TODO: add supports for any listener. Maybe requires some refactoring.
 	 * @TODO: add example.
 	 * 
 	 * The dependencies are checked, and if the conditions are not met, 
 	 * returns FALSE.
 	 * 
 	 * @see GameWindow.addWidget
 	 * 
 	 */
 	GameWindow.prototype.getWidget = function (w_str, options) {
		if (!w_str) return;
		var that = this;
		var options = options || {};
		
		function attachListeners (options, w) {
			if (!options || !w) return;
			for (var i in options) {
				if (options.hasOwnProperty(i)) {
					if (JSUS.in_array(i, ['onclick', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onload', 'onunload', 'onmouseover'])) {
						w.getRoot()[i] = function() {
							options[i].call(w);
						};
					}
				}			
			};
		};
		
		var w = JSUS.getNestedValue(w_str, this.widgets);
		
		if (!w) {
			node.log('Widget ' + w_str + ' not found.', 'ERR');
			return;
		}
		
		node.log('nodeWindow: registering gadget ' + w.name + ' v.' +  w.version);
		
		if (! this.checkDependencies(w)) return false;
		
		var id = ('undefined' !== typeof options.id) ? options.id : w.id; 
		options.id = this.generateUniqueId(id);
		
		
		w = new w(options);
	
		
		try {
	
			// nodeGame listeners
			w.listeners();
			// user listeners
			attachListeners(options, w);
			}
			catch(e){
				throw 'Error while loading widget ' + w.name + ': ' + e;
			}
		return w;
	};
	
	/**
	 * Appends a widget to the specified root element. If no root element
	 * is specified the widget is append to the global root. 
	 * 
	 * The first parameter can be string representing the name of the widget or 
	 * a valid widget already loaded, for example through GameWindow.getWidget. 
	 * In the latter case, dependencies are checked, and it returns FALSE if
	 * conditions are not met.
	 * 
	 * It automatically creates a fieldset element around the widget if 
	 * requested by the internal widget configuration, or if specified in the
	 * options parameter.
	 * 
 	 * @see GameWindow.getWidget
	 * 
	 */
	GameWindow.prototype.addWidget = function (w, root, options) {
		if (!w) return;
		var that = this;
		
		function appendFieldset(root, options, w) {
			if (!options) return root;
			var idFieldset = options.id || w.id + '_fieldset';
			var legend = options.legend || w.legend;
			return that.addFieldset(root, idFieldset, legend, options.attributes);
		};
		
		
		// Init default values
		root = root || this.root;
		options = options || {};
		

		// Check if it is a object (new gadget)
		// If it is a string is the name of an existing gadget
		// In this case a dependencies check is done
		if ('object' !== typeof w) w = this.getWidget(w, options);
		if (!w) return false;	
		
		// options exists and options.fieldset exist
		var fieldsetOptions = ('undefined' !== typeof options.fieldset) ? options.fieldset : w.fieldset; 
		root = appendFieldset(root, fieldsetOptions, w);
		w.append(root);

		return w;
	};
	
	/**
	 * Checks if all the necessary objects are already loaded and returns TRUE,
	 * or FALSE otherwise.
	 * 
	 * TODO: Check for version and other constraints.
	 * 
	 * @see GameWindow.getWidgets
	 * 
	 */ 
	GameWindow.prototype.checkDependencies = function (w, quiet) {
		if (!w.dependencies) return true;
		
		var errMsg = function (w, d) {
			var name = w.name || w.id;// || w.toString();
			node.log(d + ' not found. ' + name + ' cannot be loaded.', 'ERR');
		};
		
		var parents = [window, node, node.window.widgets, node.window];
		
		var d = w.dependencies;
		for (var lib in d) {
			if (d.hasOwnProperty(lib)) {
				var found = false;
				for (var i=0; i<parents.length; i++) {
					if (JSUS.getNestedValue(lib, parents[i])) {
						var found = true;
						break;
					}
				}
				if (!found) {	
					if (!quiet) errMsg(w, lib);
					return false;
				}
			
			}
		}
		return true;
	};
	
	// Overriding Document.write and DOM.writeln and DOM.write
	GameWindow.prototype._write = DOM.write;
	GameWindow.prototype._writeln = DOM.writeln;
	/**
	 * Appends a text string, an HTML node or element inside
	 * the specified root element. 
	 * 
	 * If no root element is specified, the default screen is 
	 * used.
	 * 
	 * @see GameWindow.writeln
	 * 
	 */
	GameWindow.prototype.write = function (text, root) {		
		var root = root || this.getScreen();
		if (!root) {
			node.log('Could not determine where writing', 'ERR');
			return false;
		}
		return this._write(root, text);
	};
	
	/**
	 * Appends a text string, an HTML node or element inside
	 * the specified root element, and adds a break element
	 * immediately afterwards.
	 * 
	 * If no root element is specified, the default screen is 
	 * used.
	 * 
	 * @see GameWindow.write
	 * 
	 */
	GameWindow.prototype.writeln = function (text, root, br) {
		var root = root || this.getScreen();
		if (!root) {
			node.log('Could not determine where writing', 'ERR');
			return false;
		}
		return this._writeln(root, text, br);
	};
	
	
	/**
	 * Enables / Disables all input in a container with id @id.
	 * If no container with id @id is found, then the whole document is used.
	 * 
	 * If @op is defined, all the input are set to @op, otherwise, the disabled
	 * property is toggled. (i.e. false means enable, true means disable) 
	 * 
	 */
	GameWindow.prototype.toggleInputs = function (id, op) {
		
		if ('undefined' !== typeof id) {
			var container = this.getElementById(id);
		}
		if ('undefined' === typeof container) {
			var container = this.frame.body;
		}
		
		var inputTags = ['button', 'select', 'textarea', 'input'];

		var j=0;
		for (;j<inputTags.length;j++) {
			var all = container.getElementsByTagName(inputTags[j]);
			var i=0;
			var max = all.length;
			for (; i < max; i++) {
				
				// If op is defined do that
				// Otherwise toggle
				state = ('undefined' !== typeof op) ? op 
													: all[i].disabled ? false 
																	  : true;
				
				if (state) {
					all[i].disabled = state;
				}
				else {
					all[i].removeAttribute('disabled');
				}
			}
		}
	};
	
	/**
	 * Creates a div element with the given id and 
	 * tries to append it in the following order to:
	 * 
	 * 		- the specified root element
	 * 		- the body element
	 * 		- the last element of the document
	 * 
	 * If it fails, it creates a new body element, appends it
	 * to the document, and then appends the div element to it.
	 * 
	 * Returns the newly created root element.
	 * 
	 * @api private
	 * 
	 */
	GameWindow.prototype._generateRoot = function (root, id) {
		var root = root || document.body || document.lastElementChild;
		if (!root) {
			this.addElement('body', document);
			root = document.body;
		}
		this.root = this.addElement('div', root, id);
		return this.root;
	};
	
	
	/**
	 * Creates a div element with id 'nodegame' and returns it.
	 * 
	 * @see GameWindow._generateRoot()
	 * 
	 */
	GameWindow.prototype.generateNodeGameRoot = function (root) {
		return this._generateRoot(root, 'nodegame');
	};
	
	/**
	 * Creates a div element with id 'nodegame' and returns it.
	 * 
	 * @see GameWindow._generateRoot()
	 * 
	 */
	GameWindow.prototype.generateRandomRoot = function (root, id) {
		return this._generateRoot(root, this.generateUniqueId());
	};
	

	
	
	/**
	 * Creates and adds a container div with id 'gn_header' to 
	 * the root element. 
	 * 
	 * If an header element has already been created, deletes it, 
	 * and creates a new one.
	 * 
	 * @TODO: Should be always added as first child
	 * 
	 */
	GameWindow.prototype.generateHeader = function () {
		if (this.header) {
			this.header.innerHTML = '';
			this.header = null;
		}
		
		return this.addElement('div', this.root, 'gn_header');
	};
	
	
	
	/**
	 * Returns the element with id 'id'. Looks first into the iframe,
	 * and then into the rest of the page.
	 * 
	 * @see GameWindow.getElementsByTagName
	 */
	GameWindow.prototype.getElementById = function (id) {
		var el = null; // @TODO: should be init to undefined instead ?
		if (this.frame && this.frame.getElementById) {
			el = this.frame.getElementById(id);
		}
		if (!el) {
			el = document.getElementById(id);
		}
		return el; 
	};
	
	/**
	 * Returns a collection of elements with the tag name equal to @tag . 
	 * Looks first into the iframe and then into the rest of the page.
	 * 
	 * @see GameWindow.getElementById
	 * 
	 */
	GameWindow.prototype.getElementsByTagName = function (tag) {
		// @TODO: Should that be more similar to GameWindow.getElementById
		return (this.frame) ? this.frame.getElementsByTagName(tag) : document.getElementsByTagName(tag);
	};
	
	
	
	
	// Header
//	GameWindow.prototype.addHeader = function (root, id) {
//		return this.addDiv(root,id);
//	};
	
	/**
	 * Creates an HTML select element already populated with the 
	 * of the data of other players.
	 * 
	 * @TODO: adds options to control which players/servers to add.
	 * 
	 * @see GameWindow.addRecipientSelector
	 * @see GameWindow.addStandardRecipients
	 * @see GameWindow.populateRecipientSelector
	 * 
	 */
	GameWindow.prototype.getRecipientSelector = function (id) {
		var toSelector = document.createElement('select');
		if ('undefined' !== typeof id) {
			toSelector.id = id;
		}
		this.addStandardRecipients(toSelector);
		return toSelector;
	};
	
	/**
	 * Appends a RecipientSelector element to the specified root element.
	 * 
	 * Returns FALSE if no valid root element is found.
	 * 
	 * @TODO: adds options to control which players/servers to add.
	 * 
	 * @see GameWindow.addRecipientSelector
	 * @see GameWindow.addStandardRecipients 
	 * @see GameWindow.populateRecipientSelector
	 * 
	 */
	GameWindow.prototype.addRecipientSelector = function (root, id) {
		if (!root) return false;
		var toSelector = this.getRecipientSelector(id);
		return root.appendChild(toSelector);		
	};
	
	/**
	 * Adds an ALL and a SERVER option to a specified select element.
	 * 
	 * @TODO: adds options to control which players/servers to add.
	 * 
	 * @see GameWindow.populateRecipientSelector
	 * 
	 */
	GameWindow.prototype.addStandardRecipients = function (toSelector) {
			
		var opt = document.createElement('option');
		opt.value = 'ALL';
		opt.appendChild(document.createTextNode('ALL'));
		toSelector.appendChild(opt);
		
		var opt = document.createElement('option');
		opt.value = 'SERVER';
		opt.appendChild(document.createTextNode('SERVER'));
		toSelector.appendChild(opt);
		
	};
	
	/**
	 * Adds all the players from a specified playerList object to a given
	 * select element.
	 * 
	 * @see GameWindow.addStandardRecipients 
	 * 
	 */
	GameWindow.prototype.populateRecipientSelector = function (toSelector, playerList) {
		
		if ('object' !==  typeof playerList || 'object' !== typeof toSelector) return;
		
		this.removeChildrenFromNode(toSelector);
		this.addStandardRecipients(toSelector);
		
		var opt;
		var pl = new PlayerList({}, playerList);
		try {
			pl.forEach( function(p) {
				opt = document.createElement('option');
				opt.value = p.id;
				opt.appendChild(document.createTextNode(p.name));
				toSelector.appendChild(opt);
			});
		}
		catch (e) {
			node.log('Bad Formatted Player List. Discarded. ' + p, 'ERR');
		}
	};
	
	/**
	 * Creates an HTML select element with all the predefined actions
	 * (SET,GET,SAY,SHOW*) as options and returns it.
	 * 
	 * *not yet implemented
	 * 
	 * @see GameWindow.addActionSelector
	 * 
	 */
	GameWindow.prototype.getActionSelector = function (id) {
		var actionSelector = document.createElement('select');
		if ('undefined' !== typeof id ) {
			actionSelector.id = id;
		}
		this.populateSelect(actionSelector, node.actions);
		return actionSelector;
	};
	
	/**
	 * Appends an ActionSelector element to the specified root element.
	 * 
	 * @see GameWindow.getActionSelector
	 * 
	 */
	GameWindow.prototype.addActionSelector = function (root, id) {
		if (!root) return;
		var actionSelector = this.getActionSelector(id);
		return root.appendChild(actionSelector);
	};
	
	/**
	 * Creates an HTML select element with all the predefined targets
	 * (HI,TXT,DATA, etc.) as options and returns it.
	 * 
	 * *not yet implemented
	 * 
	 * @see GameWindow.addActionSelector
	 * 
	 */
	GameWindow.prototype.getTargetSelector = function (id) {
		var targetSelector = document.createElement('select');
		if ('undefined' !== typeof id ) {
			targetSelector.id = id;
		}
		this.populateSelect(targetSelector, node.targets);
		return targetSelector;
	};
	
	/**
	 * Appends a Target Selector element to the specified root element.
	 * 
	 * @see GameWindow.getTargetSelector
	 * 
	 */
	GameWindow.prototype.addTargetSelector = function (root, id) {
		if (!root) return;
		var targetSelector = this.getTargetSelector(id);
		return root.appendChild(targetSelector);
	};
	
	
	/**
	 * @experimental
	 * 
	 * Creates an HTML text input element where a nodeGame state can
	 * be inserted. This method should be improved to automatically
	 * show all the available states of a game.
	 * 
	 * @see GameWindow.addActionSelector
	 */
	GameWindow.prototype.getStateSelector = function (id) {
		var stateSelector = this.getTextInput(id);
		return stateSelector;
	};
	
	/**
	 * @experimental
	 * 
	 * Appends a StateSelector to the specified root element.
	 * 
	 * @see GameWindow.getActionSelector
	 * 
	 */
	GameWindow.prototype.addStateSelector = function (root, id) {
		if (!root) return;
		var stateSelector = this.getStateSelector(id);
		return root.appendChild(stateSelector);
	};
	
	/**
	 * Creates an HTML button element that will emit the specified
	 * nodeGame event when clicked and returns it.
	 * 
	 */
	GameWindow.prototype.getEventButton = function (event, text, id, attributes) {
		if (!event) return;
		var b = this.getButton(id, text, attributes);
		b.onclick = function () {
			node.emit(event);
		};
		return b;
	};
	
	/**
	 * Adds an EventButton to the specified root element.
	 * 
	 * If no valid root element is provided, it is append as last element
	 * in the current screen.
	 * 
	 * @see GameWindow.getEventButton
	 * 
	 */
	GameWindow.prototype.addEventButton = function (event, text, root, id, attributes) {
		if (!event) return;
		if (!root) {
//			var root = root || this.frame.body;
//			root = root.lastElementChild || root;
			var root = this.getScreen();
		}
		var eb = this.getEventButton(event, text, id, attributes);
		return root.appendChild(eb);
	};
	
	/**
	 * Overrides JSUS.DOM.generateUniqueId
	 * 
	 * @experimental
	 * @TODO: it is not always working fine. 
	 * @TODO: fix doc
	 * 
	 */
	GameWindow.prototype.generateUniqueId = function (prefix) {
		var id = '' + (prefix || JSUS.randomInt(0, 1000));
		var found = this.getElementById(id);
		
		while (found) {
			id = '' + prefix + '_' + JSUS.randomInt(0, 1000);
			found = this.getElementById(id);
		}
		return id;
	};
	
	//Expose nodeGame to the global object
	node.window = new GameWindow();
	if ('undefined' !== typeof window) window.W = node.window;
	
})(
	// GameWindow works only in the browser environment. The reference 
	// to the node.js module object is for testing purpose only
	('undefined' !== typeof window) ? window : module.parent.exports.window,
	('undefined' !== typeof window) ? window.node : module.parent.exports.node
);
(function(exports) {
	
	/*!
	* Canvas
	* 
	*/ 
	
	exports.Canvas = Canvas;
	
	function Canvas(canvas) {

		this.canvas = canvas;
		// 2D Canvas Context 
		this.ctx = canvas.getContext('2d');
		
		this.centerX = canvas.width / 2;
		this.centerY = canvas.height / 2;
		
		this.width = canvas.width;
		this.height = canvas.height;
		
//		console.log(canvas.width);
//		console.log(canvas.height);		
	}
	
	Canvas.prototype = {
				
		constructor: Canvas,
		
		drawOval: function (settings) {
		
			// We keep the center fixed
			var x = settings.x / settings.scale_x;
			var y = settings.y / settings.scale_y;
		
			var radius = settings.radius || 100;
			//console.log(settings);
			//console.log('X,Y(' + x + ', ' + y + '); Radius: ' + radius + ', Scale: ' + settings.scale_x + ',' + settings.scale_y);
			
			this.ctx.lineWidth = settings.lineWidth || 1;
			this.ctx.strokeStyle = settings.color || '#000000';
			
			this.ctx.save();
			this.ctx.scale(settings.scale_x, settings.scale_y);
			this.ctx.beginPath();
			this.ctx.arc(x, y, radius, 0, Math.PI*2, false);
			this.ctx.stroke();
			this.ctx.closePath();
			this.ctx.restore();
		},
		
		drawLine: function (settings) {
		
			var from_x = settings.x;
			var from_y = settings.y;
		
			var length = settings.length;
			var angle = settings.angle;
				
			// Rotation
			var to_x = - Math.cos(angle) * length + settings.x;
			var to_y =  Math.sin(angle) * length + settings.y;
			//console.log('aa ' + to_x + ' ' + to_y);
			
			//console.log('From (' + from_x + ', ' + from_y + ') To (' + to_x + ', ' + to_y + ')');
			//console.log('Length: ' + length + ', Angle: ' + angle );
			
			this.ctx.lineWidth = settings.lineWidth || 1;
			this.ctx.strokeStyle = settings.color || '#000000';
			
			this.ctx.save();
			this.ctx.beginPath();
			this.ctx.moveTo(from_x,from_y);
			this.ctx.lineTo(to_x,to_y);
			this.ctx.stroke();
			this.ctx.closePath();
			this.ctx.restore();
		},
		
		scale: function (x,y) {
			this.ctx.scale(x,y);
			this.centerX = this.canvas.width / 2 / x;
			this.centerY = this.canvas.height / 2 / y;
		},
		
		clear: function() {
			this.ctx.clearRect(0, 0, this.width, this.height);
			// For IE
			var w = this.canvas.width;
			this.canvas.width = 1;
			this.canvas.width = w;
		}
		
	};
})(node.window);
(function(exports, window, node){
	
	var document = window.document;
	var JSUS = node.JSUS;

	var TriggerManager = node.TriggerManager;
	/*!
	* 
	* HTMLRenderer: renders objects to HTML according to a series
	* of criteria.
	* 
	*/
	
	exports.HTMLRenderer = HTMLRenderer;
	exports.HTMLRenderer.Entity = Entity;
	
	function HTMLRenderer (options) {
		this.options = options = options || {};
		this.tm = new TriggerManager();
		this.init(this.options);
	}
	
	HTMLRenderer.prototype.init = function(options) {
		if (options) {
			if (options.render) {
				options.triggers = options.render;
			}
			this.options = options;
		}
		this.resetRender();
	};
	
	/**
	* Delete existing render functions and add two 
	* standards. By default objects are displayed in
	* a HTMLRenderer of key: values.
	*/
	HTMLRenderer.prototype.resetRender = function () {
		this.tm.clear(true);
		
		this.tm.addTrigger(function(el){
			return document.createTextNode(el.content);
		});
		
		this.tm.addTrigger(function (el) { 
			if ('object' === typeof el.content) {
				var div = document.createElement('div');
				for (var key in el.content) {
					if (el.content.hasOwnProperty(key)) {
						var str = key + ':\t' + el.content[key];
						div.appendChild(document.createTextNode(str));
						div.appendChild(document.createElement('br'));
					}
				}
				return div;
			}
		});
		
		this.tm.addTrigger(function (el) { 
			if (el.content && el.content.parse && 'function' === typeof el.content.parse) {
				var html = el.content.parse();
				if (JSUS.isElement(html) || JSUS.isNode(html)) {
					return html;
				}
			}
		});	
		
		this.tm.addTrigger(function (el) { 
			if (JSUS.isElement(el.content) || JSUS.isNode(el.content)) {
				return el.content;
			}
		});
	};
	
	HTMLRenderer.prototype.clear = function (clear) {
		return this.tm.clear(clear);
	};

	HTMLRenderer.prototype.addRenderer = function (renderer, pos) {
		return this.tm.addTrigger(renderer, pos);
	};
	
	HTMLRenderer.prototype.removeRenderer = function (renderer) {
		return this.tm.removeTrigger(renderer);
	};
	
	HTMLRenderer.prototype.render = function (o) {
		return this.tm.pullTriggers(o);
	};
	
	HTMLRenderer.prototype.size = function () {
		return this.tm.size();
	};
	
	// Abstract HTML Entity reprentation
	function Entity (e) {
		e = e || {};
		this.content = ('undefined' !== typeof e.content) ? e.content : '';
		this.className = ('undefined' !== typeof e.style) ? e.style : null;
	}
	
})(
	('undefined' !== typeof node) ? node.window || node : module.exports, // Exports
	('undefined' !== typeof window) ? window : module.parent.exports.window, // window
	('undefined' !== typeof node) ? node : module.parent.exports.node // node
);
(function(exports, node){
	
	var JSUS = node.JSUS;
	var NDDB = node.NDDB;

	var HTMLRenderer = node.window.HTMLRenderer;
	var Entity = node.window.HTMLRenderer.Entity;
	
	/*!
	* 
	* List: handle list operation
	* 
	*/
	
	exports.List = List;
	
	List.prototype = new NDDB();
	List.prototype.constructor = List;	
	
	function List (options, data) {
		options = options || {};
		this.options = options;
		
		NDDB.call(this, options, data); 
		
		this.id = options.id || 'list_' + Math.round(Math.random() * 1000);
		
		this.DL = null;
		this.auto_update = this.options.auto_update || false;
		this.htmlRenderer = null; 
		this.lifo = false;
		
		this.init(this.options);
	}
	
	// TODO: improve init
	List.prototype.init = function (options) {
		options = options || this.options;
		
		this.FIRST_LEVEL = options.first_level || 'dl';
		this.SECOND_LEVEL = options.second_level || 'dt';
		this.THIRD_LEVEL = options.third_level || 'dd';
		
		this.last_dt = 0;
		this.last_dd = 0;
		this.auto_update = ('undefined' !== typeof options.auto_update) ? options.auto_update
																		: this.auto_update;
		
		var lifo = this.lifo = ('undefined' !== typeof options.lifo) ? options.lifo : this.lifo;
		
		this.globalCompare = function (o1, o2) {
			if (!o1 && !o2) return 0;
			if (!o2) return 1;
			if (!o1) return -1;

			// FIFO
			if (!lifo) {
				if (o1.dt < o2.dt) return -1;
				if (o1.dt > o2.dt) return 1;
			}
			else {
				if (o1.dt < o2.dt) return 1;
				if (o1.dt > o2.dt) return -1;
			}
			if (o1.dt === o2.dt) {
				if ('undefined' === typeof o1.dd) return -1;
				if ('undefined'=== typeof o2.dd) return 1;
				if (o1.dd < o2.dd) return -1;
				if (o1.dd > o2.dd) return 1;
				if (o1.nddbid < o2.nddbid) return 1;
				if (o1.nddbid > o2.nddbid) return -1;
			}
			return 0;
		}; 
		
		
		this.DL = options.list || document.createElement(this.FIRST_LEVEL);
		this.DL.id = options.id || this.id;
		if (options.className) {
			this.DL.className = options.className;
		}
		if (this.options.title) {
			this.DL.appendChild(document.createTextNode(options.title));
		}
		
		// was
		//this.htmlRenderer = new HTMLRenderer({renderers: options.renderer});
		this.htmlRenderer = new HTMLRenderer({render: options.render});
	};
	
	List.prototype._add = function (node) {
		if (!node) return;
//		console.log('about to add node');
//		console.log(node);
		this.insert(node);
		if (this.auto_update) {
			this.parse();
		}
	};
	
	List.prototype.addDT = function (elem, dt) {
		if ('undefined' === typeof elem) return;
		this.last_dt++;
		dt = ('undefined' !== typeof dt) ? dt: this.last_dt;  
		this.last_dd = 0;
		var node = new Node({dt: dt, content: elem});
		return this._add(node);
	};
	
	List.prototype.addDD = function (elem, dt, dd) {
		if ('undefined' === typeof elem) return;
		dt = ('undefined' !== typeof dt) ? dt: this.last_dt;
		dd = ('undefined' !== typeof dd) ? dd: this.last_dd++;
		var node = new Node({dt: dt, dd: dd, content: elem});
		return this._add(node);
	};
	
	List.prototype.parse = function() {
		this.sort();
		var old_dt = null;
		var old_dd = null;
		
		var appendDT = function() {
			var node = document.createElement(this.SECOND_LEVEL);
			this.DL.appendChild(node);
			old_dd = null;
			old_dt = node;
			return node;
		};
		
		var appendDD = function() {
			var node = document.createElement(this.THIRD_LEVEL);
//			if (old_dd) {
//				old_dd.appendChild(node);
//			}
//			else if (!old_dt) {
//				old_dt = appendDT.call(this);
//			}
//			old_dt.appendChild(node);
			this.DL.appendChild(node);
//			old_dd = null;
//			old_dt = node;
			return node;
		};
		
		// Reparse all every time
		// TODO: improve this
		if (this.DL) {
			while (this.DL.hasChildNodes()) {
				this.DL.removeChild(this.DL.firstChild);
			}
			if (this.options.title) {
				this.DL.appendChild(document.createTextNode(this.options.title));
			}
		}
		
		for (var i=0; i<this.db.length; i++) {
			var el = this.db[i];
			var node;
			if ('undefined' === typeof el.dd) {
				node = appendDT.call(this);
				//console.log('just created dt');
			}
			else {
				node = appendDD.call(this);
			}
//			console.log('This is the el')
//			console.log(el);
			var content = this.htmlRenderer.render(el);
//			console.log('This is how it is rendered');
//			console.log(content);
			node.appendChild(content);		
		}
		
		return this.DL;
	};
	
	List.prototype.getRoot = function() {
		return this.DL;
	};
	
	
	
//	List.prototype.createItem = function(id) {
//		var item = document.createElement(this.SECOND_LEVEL);
//		if (id) {
//			item.id = id;
//		}
//		return item;
//	};
	
	// Cell Class
	Node.prototype = new Entity();
	Node.prototype.constructor = Node;
	
	function Node (node) {
		Entity.call(this, node);
		this.dt = ('undefined' !== typeof node.dt) ? node.dt : null;
		if ('undefined' !== typeof node.dd) {
			this.dd = node.dd;
		}
	}
	
})(
	('undefined' !== typeof node) ? (('undefined' !== typeof node.window) ? node.window : node) : module.parent.exports, 
	('undefined' !== typeof node) ? node : module.parent.exports
);

(function(exports, window, node) {
	
//	console.log('---------')
//	console.log(node.window);
	
	var document = window.document;
	
	/*!
	* 
	* Table: abstract representation of an HTML table
	* 
	*/
	exports.Table = Table;
	exports.Table.Cell = Cell;
	
	// For simple testing
	// module.exports = Table;
	
	var JSUS = node.JSUS;
	var NDDB = node.NDDB;
	var HTMLRenderer = node.window.HTMLRenderer;
	var Entity = node.window.HTMLRenderer.Entity;
	
	
	Table.prototype = JSUS.clone(NDDB.prototype);
	//Table.prototype = new NDDB();
	Table.prototype.constructor = Table;	
	
	Table.H = ['x','y','z'];
	Table.V = ['y','x', 'z'];
	
	Table.log = node.log;
	
	function Table (options, data, parent) {
		options = options || {};
		
		Table.log = options.log || Table.log;
		this.defaultDim1 = options.defaultDim1 || 'x';
		this.defaultDim2 = options.defaultDim2 || 'y';
		this.defaultDim3 = options.defaultDim3 || 'z';
		
		this.table = options.table || document.createElement('table'); 
		this.id = options.id || 'table_' + Math.round(Math.random() * 1000);
		
		this.auto_update = ('undefined' !== typeof options.auto_update) ? options.auto_update : false;
		
		// Class for missing cells
		this.missing = options.missing || 'missing';
		this.pointers = {
						x: options.pointerX || 0,
						y: options.pointerY || 0,
						z: options.pointerZ || 0
		};
		
		this.header = [];
		this.footer = [];
		
		this.left = [];
		this.right = [];
		
		
		NDDB.call(this, options, data, parent);  
		
		// From NDDB
		this.options = this.__options;
	}
  
	// TODO: improve init
	Table.prototype.init = function (options) {
		NDDB.prototype.init.call(this, options);
		
		options = options || this.options;
		if ('undefined' !== typeof options.id) {
			
			this.table.id = options.id;
			this.id = options.id;
		}
		if (options.className) {
			this.table.className = options.className;
		}
		this.initRenderer(options.render);
	};
	
	Table.prototype.initRenderer = function(options) {
		this.htmlRenderer = new HTMLRenderer();	
		this.htmlRenderer.addRenderer(function(el) {
			if ('object' === typeof el.content) {
				var tbl = new Table();
				for (var key in el.content) {
					if (el.content.hasOwnProperty(key)){
						tbl.addRow([key,el.content[key]]);
					}
				}
				return tbl.parse();
			}
		}, 2);
		if (options) {
			if (!(options instanceof Array)) {
				options = [options];
			}
			for (var i=0; i< options.length; i++) {
				this.htmlRenderer.addRenderer(options[i]);
			}
		}
	};
  
	// TODO: make it 3D
	Table.prototype.get = function (x, y) {
		var out = this;
		if ('undefined' !== typeof x) {
			out = this.select('x','=',x);
		}
		if ('undefined' !== typeof y) {
			out = out.select('y','=',y);
		}

		return out.fetch();
	};
  
	Table.prototype.addClass = function (c) {
		if (!c) return;
		if (c instanceof Array) c = c.join(' ');
		this.forEach(function (el) {
			node.window.addClass(el, c);
		});
		
		if (this.auto_update) {
			this.parse();
		}
		
		return this;
	};

	// Depends on node.window
	Table.prototype.removeClass = function (c) {
		if (!c) return;
		
		var func;
		if (c instanceof Array) {
			func = function(el, c) {
				for (var i=0; i< c.length; i++) {
					node.window.removeClass(el, c[i]);
				}
			};
		}
		else {
			func = node.window.removeClass;
		}
		
		this.forEach(function (el) {
			func.call(this,el,c);
		});
		
		if (this.auto_update) {
			this.parse();
		}
		
		return this;
	};
  
	Table.prototype._addSpecial = function (data, type) {
		if (!data) return;
		type = type || 'header';
		if ('object' !== typeof data) {
			return {content: data, type: type};
		}
		
		var out = [];
		for (var i=0; i < data.length; i++) {
			out.push({content: data[i], type: type});
		} 
		return out;
	};
  

	Table.prototype.setHeader = function (header) {
		this.header = this._addSpecial(header);
	};

	Table.prototype.add2Header = function (header) {
		this.header = this.header.concat(this._addSpecial(header));
	};
  
	Table.prototype.setLeft = function (left) {
		this.left = this._addSpecial(left, 'left');
	};
	
	Table.prototype.add2Left = function (left) {
		this.left = this.left.concat(this._addSpecial(left, 'left'));
	};

	// TODO: setRight  
	//Table.prototype.setRight = function (left) {
	//	this.right = this._addSpecial(left, 'right');
	//};
  
	Table.prototype.setFooter = function (footer) {
		this.footer = this._addSpecial(footer, 'footer');
	};
	
	Table._checkDim123 = function (dims) {
		var t = Table.H.slice(0);
		for (var i=0; i< dims.length; i++) {
			if (!JSUS.removeElement(dims[i],t)) return false;
		}
		return true;
	};
  
	/**
	* Updates the reference to the foremost element in the table. 
	* 
	* @param 
	*/
	Table.prototype.updatePointer = function (pointer, value) {
		if (!pointer) return false;
		if (!JSUS.in_array(pointer, Table.H)) {
			Table.log('Cannot update invalid pointer: ' + pointer, 'ERR');
			return false;
		}
		
		if (value > this.pointers[pointer]) {
			this.pointers[pointer] = value;
			return true;
		}
		
	};
  
	Table.prototype._add = function (data, dims, x, y, z) {
		if (!data) return false;
		if (dims) {
			if (!Table._checkDim123(dims)) {
				Table.log('Invalid value for dimensions. Accepted only: x,y,z.');
				return false;
			}
		}
		else {
			dims = Table.H;
		}
			
		var insertCell = function (content){	
			//Table.log('content');
			//Table.log(x + ' ' + y + ' ' + z);
			//Table.log(i + ' ' + j + ' ' + h);
			
			var cell = {};
			cell[dims[0]] = i; // i always defined
			cell[dims[1]] = (j) ? y+j : y;
			cell[dims[2]] = (h) ? z+h : z;
			cell.content = content;	
			//Table.log(cell);
			this.insert(new Cell(cell));
			this.updatePointer(dims[0],cell[dims[0]]);
			this.updatePointer(dims[1],cell[dims[1]]);
			this.updatePointer(dims[2],cell[dims[2]]);
		};
		
		// By default, only the second dimension is incremented
		x = x || this.pointers[dims[0]]; 
		y = y || this.pointers[dims[1]] + 1;
		z = z || this.pointers[dims[2]];
		
		if ('object' !== typeof data) data = [data]; 
		
		var cell = null;
		// Loop Dim1
		for (var i = 0; i < data.length; i++) {
			//Table.log('data_i');
			//Table.log(data[i]);
			if (data[i] instanceof Array) {
				// Loop Dim2
				for (var j = 0; j < data[i].length; j++) {
				//Table.log(data[i]);
					if (data[i][j] instanceof Array) {
						//Table.log(data[i][j]);
						//Table.log(typeof data[i][j]);
						// Loop Dim3
						for (var h = 0; h < data[i][j].length; h++) {
							//Table.log('Here h');
							insertCell.call(this, data[i][j][h]);
						}
						h=0; // reset h
					}
					else {
						//Table.log('Here j');
						insertCell.call(this, data[i][j]);
					}
				}
				j=0; // reset j
			}
			else {
				//Table.log('Here i');
				insertCell.call(this, data[i]);
			}
		}
		
		//Table.log('After insert');
		//Table.log(this.db);
		
		// TODO: if coming from addRow or Column this should be done only at the end
		if (this.auto_update) {
			this.parse(true);
		}
		
	};
  
	Table.prototype.add = function (data, x, y) {
		if (!data) return;
		var cell = (data instanceof Cell) ? data : new Cell({
			x: x,
			y: y,
			content: data
		});
		var result = this.insert(cell);

		if (result) {
			this.updatePointer('x',x);
			this.updatePointer('y',y);
		}
		return result;
	};
    
	Table.prototype.addColumn = function (data, x, y) {
		if (!data) return false;
		return this._add(data, Table.V, x, y);
	};
  
	Table.prototype.addRow = function (data, x, y) {
		if (!data) return false;
		return this._add(data, Table.H, x, y);
	};
  
	//Table.prototype.bind = function (dim, property) {
		//this.binds[property] = dim;
	//};
  
	// TODO: Only 2D for now
	// TODO: improve algorithm, rewrite
	Table.prototype.parse = function () {
		
		// Create a cell element (td,th...)
		// and fill it with the return value of a
		// render value. 
		var fromCell2TD = function (cell, el) {
			if (!cell) return;
			el = el || 'td';
			var TD = document.createElement(el);
			var content = this.htmlRenderer.render(cell);
			//var content = (!JSUS.isNode(c) || !JSUS.isElement(c)) ? document.createTextNode(c) : c;
			TD.appendChild(content);
			if (cell.className) TD.className = cell.className;
			return TD;
		};
		
		if (this.table) {
			while (this.table.hasChildNodes()) {
				this.table.removeChild(this.table.firstChild);
			}
		}
		
		var TABLE = this.table,
			TR, 
			TD,
			i;
		
		// HEADER
		if (this.header && this.header.length > 0) {
			var THEAD = document.createElement('thead');
			TR = document.createElement('tr');
			// Add an empty cell to balance the left header column
			if (this.left && this.left.length > 0) {
				TR.appendChild(document.createElement('th'));
			}
			for (i=0; i < this.header.length; i++) {
				TR.appendChild(fromCell2TD.call(this, this.header[i],'th'));
			}
			THEAD.appendChild(TR);
			i=0;
			TABLE.appendChild(THEAD);
		}
		
		//console.log(this.table);
		//console.log(this.id);
		//console.log(this.db.length);
		
		// BODY
		if (this.length) {
			var TBODY = document.createElement('tbody');

			this.sort(['y','x']); // z to add first
			var trid = -1;
			// TODO: What happens if the are missing at the beginning ??
			var f = this.first();
			var old_x = f.x;
			var old_left = 0;

			for (i=0; i < this.db.length; i++) {
				//console.log('INSIDE TBODY LOOP');
				//console.log(this.id);
				if (trid !== this.db[i].y) {
					TR = document.createElement('tr');
					TBODY.appendChild(TR);
					trid = this.db[i].y;
					//Table.log(trid);
					old_x = f.x - 1; // must start exactly from the first
					
					// Insert left header, if any
					if (this.left && this.left.length) {
						TD = document.createElement('td');
						//TD.className = this.missing;
						TR.appendChild(fromCell2TD.call(this, this.left[old_left]));
						old_left++;
					}
				}

				// Insert missing cells
				if (this.db[i].x > old_x + 1) {
					var diff = this.db[i].x - (old_x + 1);
					for (var j=0; j < diff; j++ ) {
						TD = document.createElement('td');
						TD.className = this.missing;
						TR.appendChild(TD);
					}
				}
				// Normal Insert
				TR.appendChild(fromCell2TD.call(this, this.db[i]));

				// Update old refs
				old_x = this.db[i].x;
			}
			TABLE.appendChild(TBODY);
		}
		
		
		//FOOTER
		if (this.footer && this.footer.length > 0) {
			var TFOOT = document.createElement('tfoot');
			TR = document.createElement('tr');
			for (i=0; i < this.header.length; i++) {
				TR.appendChild(fromCell2TD.call(this, this.footer[i]));
			}
			TFOOT.appendChild(TR);
			TABLE.appendChild(TFOOT);
		}
		
		return TABLE;
	};
  
	Table.prototype.resetPointers = function (pointers) {
		pointers = pointers || {};
		this.pointers = {
				x: pointers.pointerX || 0,
				y: pointers.pointerY || 0,
				z: pointers.pointerZ || 0
		};
	};
  
  
	Table.prototype.clear = function (confirm) {
		if (NDDB.prototype.clear.call(this, confirm)) {
			this.resetPointers();
		}
	};
  
  // Cell Class
	Cell.prototype = new Entity();
	Cell.prototype.constructor = Cell;
  
	function Cell (cell){
		Entity.call(this, cell);
		this.x = ('undefined' !== typeof cell.x) ? cell.x : null;
		this.y = ('undefined' !== typeof cell.y) ? cell.y : null;
		this.z = ('undefined' !== typeof cell.z) ? cell.z : null;
	}
  
})(
	('undefined' !== typeof node) ? node.window || node : module.exports, // Exports
	('undefined' !== typeof window) ? window : module.parent.exports.window, // window
	('undefined' !== typeof node) ? node : module.parent.exports.node // node
);

(function (exports, JSUS) {
	
	var Table = node.window.Table;
	
	/**
	* Expose constructor
	*/
	exports.ChernoffFaces = ChernoffFaces;
	exports.ChernoffFaces.FaceVector = FaceVector;
	exports.ChernoffFaces.FacePainter = FacePainter;
	
	
	ChernoffFaces.defaults = {};
	ChernoffFaces.defaults.canvas = {};
	ChernoffFaces.defaults.canvas.width = 100;
	ChernoffFaces.defaults.canvas.heigth = 100;
	
	ChernoffFaces.id = 'ChernoffFaces';
	ChernoffFaces.name = 'Chernoff Faces';
	ChernoffFaces.version = '0.3';
	ChernoffFaces.description = 'Display parametric data in the form of a Chernoff Face.';
	
	ChernoffFaces.dependencies = {
		JSUS: {},
		Table: {},
		Canvas: {},
		'Controls.Slider': {}
	};
	
	function ChernoffFaces (options) {
		this.options = options;
		this.id = options.id;
		this.table = new Table({id: 'cf_table'});
		this.root = options.root || document.createElement('div');
		this.root.id = this.id;
		
		this.sc = node.window.getWidget('Controls.Slider');	// Slider Controls
		this.fp = null;	// Face Painter
		this.canvas = null;
		this.dims = null;	// width and height of the canvas

		this.change = 'CF_CHANGE';
		var that = this;
		this.changeFunc = function () {
			that.draw(that.sc.getAllValues());
		};
		
		this.features = null;
		this.controls = null;
		
		this.init(this.options);
	}
	
	ChernoffFaces.prototype.init = function (options) {
		var that = this;
		this.id = options.id || this.id;
		var PREF = this.id + '_';
		
		this.features = options.features || this.features || FaceVector.random();
		
		this.controls = ('undefined' !== typeof options.controls) ?  options.controls : true;
		
		var idCanvas = (options.idCanvas) ? options.idCanvas : PREF + 'canvas';
		var idButton = (options.idButton) ? options.idButton : PREF + 'button';

		this.dims = {
				width: (options.width) ? options.width : ChernoffFaces.defaults.canvas.width, 
				height:(options.height) ? options.height : ChernoffFaces.defaults.canvas.heigth
		};
		
		this.canvas = node.window.getCanvas(idCanvas, this.dims);
		this.fp = new FacePainter(this.canvas);		
		this.fp.draw(new FaceVector(this.features));
		
		var sc_options = {
			id: 'cf_controls',
			features: JSUS.mergeOnKey(FaceVector.defaults, this.features, 'value'),
			change: this.change,
			fieldset: {id: this.id + '_controls_fieldest', 
						legend: this.controls.legend || 'Controls'
			},
			submit: 'Send'
		};
		
		this.sc = node.window.getWidget('Controls.Slider', sc_options);
		
		// Controls are always there, but may not be visible
		if (this.controls) {
			this.table.add(this.sc);
		}
		
		// Dealing with the onchange event
		if ('undefined' === typeof options.change) {	
			node.on(this.change, this.changeFunc); 
		} else {
			if (options.change) {
				node.on(options.change, this.changeFunc);
			}
			else {
				node.removeListener(this.change, this.changeFunc);
			}
			this.change = options.change;
		}
		
		
		this.table.add(this.canvas);
		this.table.parse();
		this.root.appendChild(this.table.table);
	};
	
	ChernoffFaces.prototype.getRoot = function() {
		return this.root;
	};
	
	ChernoffFaces.prototype.getCanvas = function() {
		return this.canvas;
	};
	
	ChernoffFaces.prototype.append = function (root) {
		root.appendChild(this.root);
		this.table.parse();
		return this.root;
	};
	
	ChernoffFaces.prototype.listeners = function () {};
	
	ChernoffFaces.prototype.draw = function (features) {
		if (!features) return;
		var fv = new FaceVector(features);
		this.fp.redraw(fv);
		// Without merging wrong values are passed as attributes
		this.sc.init({features: JSUS.mergeOnKey(FaceVector.defaults, features, 'value')});
		this.sc.refresh();
	};
	
	ChernoffFaces.prototype.getAllValues = function() {
		//if (this.sc) return this.sc.getAllValues();
		return this.fp.face;
	};
	
	ChernoffFaces.prototype.randomize = function() {
		var fv = FaceVector.random();
		this.fp.redraw(fv);
	
		var sc_options = {
				features: JSUS.mergeOnValue(FaceVector.defaults, fv),
				change: this.change
		};
		this.sc.init(sc_options);
		this.sc.refresh();
	
		return true;
	};
	
	// FacePainter
	// The class that actually draws the faces on the Canvas
	function FacePainter (canvas, settings) {
			
		this.canvas = new node.window.Canvas(canvas);
		
		this.scaleX = canvas.width / ChernoffFaces.defaults.canvas.width;
		this.scaleY = canvas.height / ChernoffFaces.defaults.canvas.heigth;
	}
	
	//Draws a Chernoff face.
	FacePainter.prototype.draw = function (face, x, y) {
		if (!face) return;
		this.face = face;
		this.fit2Canvas(face);
		this.canvas.scale(face.scaleX, face.scaleY);
		
		//console.log('Face Scale ' + face.scaleY + ' ' + face.scaleX );
		
		x = x || this.canvas.centerX;
		y = y || this.canvas.centerY;
		
		this.drawHead(face, x, y);
			
		this.drawEyes(face, x, y);
	
		this.drawPupils(face, x, y);
	
		this.drawEyebrow(face, x, y);
	
		this.drawNose(face, x, y);
		
		this.drawMouth(face, x, y);
		
	};		
		
	FacePainter.prototype.redraw = function (face, x, y) {
		this.canvas.clear();
		this.draw(face,x,y);
	};
	
	FacePainter.prototype.scale = function (x, y) {
		this.canvas.scale(this.scaleX, this.scaleY);
	};
	
	// TODO: Improve. It eats a bit of the margins
	FacePainter.prototype.fit2Canvas = function(face) {
		if (!this.canvas) {
		console.log('No canvas found');
			return;
		}
		
		var ration;
		if (this.canvas.width > this.canvas.height) {
			ratio = this.canvas.width / face.head_radius * face.head_scale_x;
		}
		else {
			ratio = this.canvas.height / face.head_radius * face.head_scale_y;
		}
		
		face.scaleX = ratio / 2;
		face.scaleY = ratio / 2;
	};
	
	FacePainter.prototype.drawHead = function (face, x, y) {
		
		var radius = face.head_radius;
		
		this.canvas.drawOval({
						x: x, 
						y: y,
						radius: radius,
						scale_x: face.head_scale_x,
						scale_y: face.head_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
		});
	};
	
	FacePainter.prototype.drawEyes = function (face, x, y) {
		
		var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
		var spacing = face.eye_spacing;
			
		var radius = face.eye_radius;
		//console.log(face);
		this.canvas.drawOval({
						x: x - spacing,
						y: height,
						radius: radius,
						scale_x: face.eye_scale_x,
						scale_y: face.eye_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
						
		});
		//console.log(face);
		this.canvas.drawOval({
						x: x + spacing,
						y: height,
						radius: radius,
						scale_x: face.eye_scale_x,
						scale_y: face.eye_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
		});
	};
	
	FacePainter.prototype.drawPupils = function (face, x, y) {
			
		var radius = face.pupil_radius;
		var spacing = face.eye_spacing;
		var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
		
		this.canvas.drawOval({
						x: x - spacing,
						y: height,
						radius: radius,
						scale_x: face.pupil_scale_x,
						scale_y: face.pupil_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
		});
		
		this.canvas.drawOval({
						x: x + spacing,
						y: height,
						radius: radius,
						scale_x: face.pupil_scale_x,
						scale_y: face.pupil_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
		});
	
	};
	
	FacePainter.prototype.drawEyebrow = function (face, x, y) {
		
		var height = FacePainter.computeEyebrowOffset(face,y);
		var spacing = face.eyebrow_spacing;
		var length = face.eyebrow_length;
		var angle = face.eyebrow_angle;
		
		this.canvas.drawLine({
						x: x - spacing,
						y: height,
						length: length,
						angle: angle,
						color: face.color,
						lineWidth: face.lineWidth
					
						
		});
		
		this.canvas.drawLine({
						x: x + spacing,
						y: height,
						length: 0-length,
						angle: -angle,	
						color: face.color,
						lineWidth: face.lineWidth
		});
		
	};
	
	FacePainter.prototype.drawNose = function (face, x, y) {
		
		var height = FacePainter.computeFaceOffset(face, face.nose_height, y);
		var nastril_r_x = x + face.nose_width / 2;
		var nastril_r_y = height + face.nose_length;
		var nastril_l_x = nastril_r_x - face.nose_width;
		var nastril_l_y = nastril_r_y; 
		
		this.canvas.ctx.lineWidth = face.lineWidth;
		this.canvas.ctx.strokeStyle = face.color;
		
		this.canvas.ctx.save();
		this.canvas.ctx.beginPath();
		this.canvas.ctx.moveTo(x,height);
		this.canvas.ctx.lineTo(nastril_r_x,nastril_r_y);
		this.canvas.ctx.lineTo(nastril_l_x,nastril_l_y);
		//this.canvas.ctx.closePath();
		this.canvas.ctx.stroke();
		this.canvas.ctx.restore();
	
	};
			
	FacePainter.prototype.drawMouth = function (face, x, y) {
		
		var height = FacePainter.computeFaceOffset(face, face.mouth_height, y);
		var startX = x - face.mouth_width / 2;
		var endX = x + face.mouth_width / 2;
		
		var top_y = height - face.mouth_top_y;
		var bottom_y = height + face.mouth_bottom_y;
		
		// Upper Lip
		this.canvas.ctx.moveTo(startX,height);
		this.canvas.ctx.quadraticCurveTo(x, top_y, endX, height);
		this.canvas.ctx.stroke();
		
		//Lower Lip
		this.canvas.ctx.moveTo(startX,height);
		this.canvas.ctx.quadraticCurveTo(x, bottom_y, endX, height);
		this.canvas.ctx.stroke();
	
	};	
	
	
	//TODO Scaling ?
	FacePainter.computeFaceOffset = function (face, offset, y) {
		y = y || 0;
		//var pos = y - face.head_radius * face.scaleY + face.head_radius * face.scaleY * 2 * offset;
		var pos = y - face.head_radius + face.head_radius * 2 * offset;
		//console.log('POS: ' + pos);
		return pos;
	};
	
	FacePainter.computeEyebrowOffset = function (face, y) {
		y = y || 0;
		var eyemindistance = 2;
		return FacePainter.computeFaceOffset(face, face.eye_height, y) - eyemindistance - face.eyebrow_eyedistance;
	};
	
	
	/*!
	* 
	* A description of a Chernoff Face.
	*
	* This class packages the 11-dimensional vector of numbers from 0 through 1 that completely
	* describe a Chernoff face.  
	*
	*/

	
	FaceVector.defaults = {
			// Head
			head_radius: {
				// id can be specified otherwise is taken head_radius
				min: 10,
				max: 100,
				step: 0.01,
				value: 30,
				label: 'Face radius'
			},
			head_scale_x: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 0.5,
				label: 'Scale head horizontally'
			},
			head_scale_y: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale head vertically'
			},
			// Eye
			eye_height: {
				min: 0.1,
				max: 0.9,
				step: 0.01,
				value: 0.4,
				label: 'Eye height'
			},
			eye_radius: {
				min: 2,
				max: 30,
				step: 0.01,
				value: 5,
				label: 'Eye radius'
			},
			eye_spacing: {
				min: 0,
				max: 50,
				step: 0.01,
				value: 10,
				label: 'Eye spacing'
			},
			eye_scale_x: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale eyes horizontally'
			},
			eye_scale_y: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale eyes vertically'
			},
			// Pupil
			pupil_radius: {
				min: 1,
				max: 9,
				step: 0.01,
				value: 1,  //this.eye_radius;
				label: 'Pupil radius'
			},
			pupil_scale_x: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale pupils horizontally'
			},
			pupil_scale_y: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale pupils vertically'
			},
			// Eyebrow
			eyebrow_length: {
				min: 1,
				max: 30,
				step: 0.01,
				value: 10,
				label: 'Eyebrow length'
			},
			eyebrow_eyedistance: {
				min: 0.3,
				max: 10,
				step: 0.01,
				value: 3, // From the top of the eye
				label: 'Eyebrow from eye'
			},
			eyebrow_angle: {
				min: -2,
				max: 2,
				step: 0.01,
				value: -0.5,
				label: 'Eyebrow angle'
			},
			eyebrow_spacing: {
				min: 0,
				max: 20,
				step: 0.01,
				value: 5,
				label: 'Eyebrow spacing'
			},
			// Nose
			nose_height: {
				min: 0.4,
				max: 1,
				step: 0.01,
				value: 0.4,
				label: 'Nose height'
			},
			nose_length: {
				min: 0.2,
				max: 30,
				step: 0.01,
				value: 15,
				label: 'Nose length'
			},
			nose_width: {
				min: 0,
				max: 30,
				step: 0.01,
				value: 10,
				label: 'Nose width'
			},
			// Mouth
			mouth_height: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 0.75, 
				label: 'Mouth height'
			},
			mouth_width: {
				min: 2,
				max: 100,
				step: 0.01,
				value: 20,
				label: 'Mouth width'
			},
			mouth_top_y: {
				min: -10,
				max: 30,
				step: 0.01,
				value: -2,
				label: 'Upper lip'
			},
			mouth_bottom_y: {
				min: -10,
				max: 30,
				step: 0.01,
				value: 20,
				label: 'Lower lip'
			}					
	};
	
	//Constructs a random face vector.
	FaceVector.random = function () {
		var out = {};
		for (var key in FaceVector.defaults) {
			if (FaceVector.defaults.hasOwnProperty(key)) {
				if (!JSUS.in_array(key,['color','lineWidth','scaleX','scaleY'])) {
					out[key] = FaceVector.defaults[key].min + Math.random() * FaceVector.defaults[key].max;
				}
			}
		}
	
		out.scaleX = 1;
		out.scaleY = 1;
		
		out.color = 'green';
		out.lineWidth = 1; 
		
		return new FaceVector(out);
	};
	
	function FaceVector (faceVector) {
		faceVector = faceVector || {};

		this.scaleX = faceVector.scaleX || 1;
		this.scaleY = faceVector.scaleY || 1;


		this.color = faceVector.color || 'green';
		this.lineWidth = faceVector.lineWidth || 1;
		
		// Merge on key
		for (var key in FaceVector.defaults) {
			if (FaceVector.defaults.hasOwnProperty(key)){
				if (faceVector.hasOwnProperty(key)){
					this[key] = faceVector[key];
				}
				else {
					this[key] = FaceVector.defaults[key].value;
				}
			}
		}
		
	}

	//Constructs a random face vector.
	FaceVector.prototype.shuffle = function () {
		for (var key in this) {
			if (this.hasOwnProperty(key)) {
				if (FaceVector.defaults.hasOwnProperty(key)) {
					if (key !== 'color') {
						this[key] = FaceVector.defaults[key].min + Math.random() * FaceVector.defaults[key].max;
						
					}
				}
			}
		}
	};
	
	//Computes the Euclidean distance between two FaceVectors.
	FaceVector.prototype.distance = function (face) {
		return FaceVector.distance(this,face);
	};
		
		
	FaceVector.distance = function (face1, face2) {
		var sum = 0.0;
		var diff;
		
		for (var key in face1) {
			if (face1.hasOwnProperty(key)) {
				diff = face1[key] - face2[key];
				sum = sum + diff * diff;
			}
		}
		
		return Math.sqrt(sum);
	};
	
	FaceVector.prototype.toString = function() {
		var out = 'Face: ';
		for (var key in this) {
			if (this.hasOwnProperty(key)) {
				out += key + ' ' + this[key];
			}
		}
		return out;
	};

})(node.window.widgets, node.JSUS);
(function (exports) {
	

	// TODO: handle different events, beside onchange
	
	/**
	* Controls
	* 
	*/
	
	exports.Controls = Controls;	
	exports.Controls.Slider = SliderControls;
	exports.Controls.jQuerySlider = jQuerySliderControls;
	exports.Controls.Radio	= RadioControls;
	
	Controls.id = 'controls';
	Controls.name = 'Controls';
	Controls.version = '0.2';
	Controls.description = 'Wraps a collection of user-inputs controls.';
		
	function Controls (options) {
		this.options = options;
		this.id = options.id;
		this.root = null;
		
		this.listRoot = null;
		this.fieldset = null;
		this.submit = null;
		
		this.changeEvent = this.id + '_change';
		
		this.init(options);
	}

	Controls.prototype.add = function (root, id, attributes) {
		// TODO: node.window.addTextInput
		//return node.window.addTextInput(root, id, attributes);
	};
	
	Controls.prototype.getItem = function (id, attributes) {
		// TODO: node.window.addTextInput
		//return node.window.getTextInput(id, attributes);
	};
	
	Controls.prototype.init = function (options) {

		this.hasChanged = false; // TODO: should this be inherited?
		if ('undefined' !== typeof options.change) {
			if (!options.change){
				this.changeEvent = false;
			}
			else {
				this.changeEvent = options.change;
			}
		}
		this.list = new node.window.List(options);
		this.listRoot = this.list.getRoot();
		
		if (!options.features) return;
		if (!this.root) this.root = this.listRoot;
		this.features = options.features;
		this.populate();
	};
	
	Controls.prototype.append = function (root) {
		this.root = root;
		var toReturn = this.listRoot;
		this.list.parse();
		root.appendChild(this.listRoot);
		
		if (this.options.submit) {
			var idButton = 'submit_' + this.id;
			if (this.options.submit.id) {
				idButton = this.options.submit.id;
				delete this.options.submit.id;
			}
			this.submit = node.window.addButton(root, idButton, this.options.submit, this.options.attributes);
			
			var that = this;
			this.submit.onclick = function() {
				if (that.options.change) {
					node.emit(that.options.change);
				}
			};
		}		
		
		return toReturn;
	};
	
	Controls.prototype.parse = function() {
		return this.list.parse();
	};
	
	Controls.prototype.populate = function () {
		var that = this;
		
		for (var key in this.features) {
			if (this.features.hasOwnProperty(key)) {
				// Prepare the attributes vector
				var attributes = this.features[key];
				var id = key;
				if (attributes.id) {
					id = attributes.id;
					delete attributes.id;
				}
							
				var container = document.createElement('div');
				// Add a different element according to the subclass instantiated
				var elem = this.add(container, id, attributes);
								
				// Fire the onChange event, if one defined
				if (this.changeEvent) {
					elem.onchange = function() {
						node.emit(that.changeEvent);
					};
				}
				
				if (attributes.label) {
					node.window.addLabel(container, elem, null, attributes.label);
				}
				
				// Element added to the list
				this.list.addDT(container);
			}
		}
	};
	
	Controls.prototype.listeners = function() {	
		var that = this;
		// TODO: should this be inherited?
		node.on(this.changeEvent, function(){
			that.hasChanged = true;
		});
				
	};

	Controls.prototype.refresh = function() {
		for (var key in this.features) {	
			if (this.features.hasOwnProperty(key)) {
				var el = node.window.getElementById(key);
				if (el) {
//					node.log('KEY: ' + key, 'DEBUG');
//					node.log('VALUE: ' + el.value, 'DEBUG');
					el.value = this.features[key].value;
					// TODO: set all the other attributes
					// TODO: remove/add elements
				}
				
			}
		}
		
		return true;
	};
	
	Controls.prototype.getAllValues = function() {
		var out = {};
		for (var key in this.features) {	
			if (this.features.hasOwnProperty(key)) {
				var el = node.window.getElementById(key);
				if (el) {
//					node.log('KEY: ' + key, 'DEBUG');
//					node.log('VALUE: ' + el.value, 'DEBUG');
					out[key] = Number(el.value);
				}
				
			}
		}
		
		return out;
	};
	
	Controls.prototype.highlight = function (code) {
		return node.window.highlight(this.listRoot, code);
	};
	
	// Sub-classes
	
	// Slider 
	
	SliderControls.prototype.__proto__ = Controls.prototype;
	SliderControls.prototype.constructor = SliderControls;
	
	SliderControls.id = 'slidercontrols';
	SliderControls.name = 'Slider Controls';
	SliderControls.version = '0.2';
	
	SliderControls.dependencies = {
		Controls: {}
	};
	
	
	function SliderControls (options) {
		Controls.call(this, options);
	}
	
	SliderControls.prototype.add = function (root, id, attributes) {
		return node.window.addSlider(root, id, attributes);
	};
	
	SliderControls.prototype.getItem = function (id, attributes) {
		return node.window.getSlider(id, attributes);
	};
	
	// jQuerySlider
    
    jQuerySliderControls.prototype.__proto__ = Controls.prototype;
    jQuerySliderControls.prototype.constructor = jQuerySliderControls;
    
    jQuerySliderControls.id = 'jqueryslidercontrols';
    jQuerySliderControls.name = 'Experimental: jQuery Slider Controls';
    jQuerySliderControls.version = '0.13';
    
    jQuerySliderControls.dependencies = {
        jQuery: {},
        Controls: {}
    };
    
    
    function jQuerySliderControls (options) {
        Controls.call(this, options);
    }
    
    jQuerySliderControls.prototype.add = function (root, id, attributes) {
        var slider = jQuery('<div/>', {
			id: id
		}).slider();
	
		var s = slider.appendTo(root);
		return s[0];
	};
	
	jQuerySliderControls.prototype.getItem = function (id, attributes) {
		var slider = jQuery('<div/>', {
			id: id
			}).slider();
		
		return slider;
	};


    ///////////////////////////

	
	
	

	
	// Radio
	
	RadioControls.prototype.__proto__ = Controls.prototype;
	RadioControls.prototype.constructor = RadioControls;
	
	RadioControls.id = 'radiocontrols';
	RadioControls.name = 'Radio Controls';
	RadioControls.version = '0.1.1';
	
	RadioControls.dependencies = {
		Controls: {}
	};
	
	function RadioControls (options) {
		Controls.call(this,options);
		this.groupName = ('undefined' !== typeof options.name) ? options.name : 
																node.window.generateUniqueId(); 
		//alert(this.groupName);
	}
	
	RadioControls.prototype.add = function (root, id, attributes) {
		//console.log('ADDDING radio');
		//console.log(attributes);
		// add the group name if not specified
		// TODO: is this a javascript bug?
		if ('undefined' === typeof attributes.name) {
//			console.log(this);
//			console.log(this.name);
//			console.log('MODMOD ' + this.name);
			attributes.name = this.groupName;
		}
		//console.log(attributes);
		return node.window.addRadioButton(root, id, attributes);	
	};
	
	RadioControls.prototype.getItem = function (id, attributes) {
		//console.log('ADDDING radio');
		//console.log(attributes);
		// add the group name if not specified
		// TODO: is this a javascript bug?
		if ('undefined' === typeof attributes.name) {
//			console.log(this);
//			console.log(this.name);
//			console.log('MODMOD ' + this.name);
			attributes.name = this.groupName;
		}
		//console.log(attributes);
		return node.window.getRadioButton(id, attributes);	
	};
	
	// Override getAllValues for Radio Controls
	RadioControls.prototype.getAllValues = function() {
		
		for (var key in this.features) {
			if (this.features.hasOwnProperty(key)) {
				var el = node.window.getElementById(key);
				if (el.checked) {
					return el.value;
				}
			}
		}
		return false;
	};
	
})(node.window.widgets);
(function (exports) {
	
	exports.DataBar	= DataBar;
	
	DataBar.id = 'databar';
	DataBar.name = 'Data Bar';
	DataBar.version = '0.3';
	DataBar.description = 'Adds a input field to send DATA messages to the players';
		
	function DataBar (options) {
		
		this.game = node.game;
		this.id = options.id || DataBar.id;
		
		this.bar = null;
		this.root = null;
		
		this.fieldset = {
			legend: 'Send DATA to players'
		};
		
		this.recipient = null;
	}
	
	DataBar.prototype.init = function (options) {};
	
	DataBar.prototype.append = function (root) {
		
		var sendButton = node.window.addButton(root);
		var dataInput = node.window.addTextInput(root);
		this.recipient = node.window.addRecipientSelector(root);
		
		var that = this;
	
		sendButton.onclick = function() {
			
			var to = that.recipient.value;
	
			//try {
				//var data = JSON.parse(dataInput.value);
				data = dataInput.value;
				console.log('Parsed Data: ' + JSON.stringify(data));
				
				node.fire(node.OUT + node.actions.SAY + '.DATA',data,to);
	//			}
	//			catch(e) {
	//				console.log('Impossible to parse the data structure');
	//			}
		};
		
		return root;
		
	};
	
	DataBar.prototype.listeners = function () {
		var that = this;
		var PREFIX = 'in.';
		
		node.onPLIST( function(msg) {
			node.window.populateRecipientSelector(that.recipient,msg.data);
		}); 
	};
	
})(node.window.widgets);
(function (exports) {

	var GameState = node.GameState;
	var PlayerList = node.PlayerList;
	var Table = node.window.Table;
	var HTMLRenderer = node.window.HTMLRenderer;
	
	/*!
	* DynamicTable
	* 
	* Show the memory state of the game
	*/
	
	DynamicTable.prototype = new Table();
	DynamicTable.prototype.constructor = Table;	
	
	exports.DynamicTable = DynamicTable;
	
	DynamicTable.id = 'dynamictable';
	DynamicTable.name = 'Dynamic Table';
	DynamicTable.version = '0.3.1';
	
	DynamicTable.dependencies = {
		Table: {},
		JSUS: {},
		HTMLRenderer: {}
	};
	
	function DynamicTable (options, data) {
		//JSUS.extend(node.window.Table,this);
		Table.call(this, options, data);
		this.options = options;
		this.id = options.id;
		this.name = options.name || 'Dynamic Table';
		this.fieldset = { legend: this.name,
							id: this.id + '_fieldset'
		};
		
		this.root = null;
		this.bindings = {};
		this.init(this.options);
	}
	
	DynamicTable.prototype.init = function (options) {
		this.options = options;
		this.name = options.name || this.name;
		this.auto_update = ('undefined' !== typeof options.auto_update) ? options.auto_update : true;
		this.replace = options.replace || false;
		this.htmlRenderer = new HTMLRenderer({renderers: options.renderers});
		this.c('state', GameState.compare);
		this.setLeft([]);
		this.parse(true);
	};
		
	DynamicTable.prototype.bind = function (event, bindings) {
		if (!event || !bindings) return;
		var that = this;

		node.on(event, function(msg) {
			
			if (bindings.x || bindings.y) {
				// Cell
				var func;
				if (that.replace) {
					func = function (x, y) {
						var found = that.get(x,y);
						if (found.length !== 0) {
							for (var ci=0; ci < found.length; ci++) {
								bindings.cell.call(that, msg, found[ci]);
							}
						}
						else {
							var cell = bindings.cell.call(that, msg, new Table.Cell({x: x, y: y}));
							that.add(cell);
						}
					};
				}
				else {
					func = function (x, y) {
						var cell = bindings.cell.call(that, msg, new Table.Cell({x: x, y: y}));
						that.add(cell, x, y);
					};
				}
				
				var x = bindings.x.call(that, msg);
				var y = bindings.y.call(that, msg);
				
				if (x && y) {
					
					x = (x instanceof Array) ? x : [x];
					y = (y instanceof Array) ? y : [y];
					
//					console.log('Bindings found:');
//					console.log(x);
//					console.log(y);
					
					for (var xi=0; xi < x.length; xi++) {
						for (var yi=0; yi < y.length; yi++) {
							// Replace or Add
							func.call(that, x[xi], y[yi]);
						}
					}
				}
				// End Cell
			}
			
			// Header
			if (bindings.header) {
				var h = bindings.header.call(that, msg);
				h = (h instanceof Array) ? h : [h];
				that.setHeader(h);
			}
			
			// Left
			if (bindings.left) {
				var l = bindings.left.call(that, msg);
				if (!JSUS.in_array(l, that.left)) {
					that.header.push(l);
				}
			}
			
			// Auto Update?
			if (that.auto_update) {
				that.parse();
			}
		});
		
	};

	DynamicTable.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.table);
		return root;
	};
	
	DynamicTable.prototype.listeners = function () {}; 

})(node.window.widgets);
(function (exports) {
	
	
	/*
	* EventButton
	* 
	* Sends DATA msgs
	* 
	*/
	
	exports.EventButton	= EventButton;
	
	JSUS = node.JSUS;
	
	EventButton.id = 'eventbutton';
	EventButton.name = 'Event Button';
	EventButton.version = '0.2';
	EventButton.dependencies = {
		JSUS: {}
	};
	
	function EventButton (options) {
		this.options = options;
		this.id = options.id;

		this.root = null;		// the parent element
		this.text = 'Send';
		this.button = document.createElement('button');
		this.callback = null;
		this.init(this.options);
	}
	
	EventButton.prototype.init = function (options) {
		options = options || this.options;
		this.button.id = options.id || this.id;
		var text = options.text || this.text;
		while (this.button.hasChildNodes()) {
			this.button.removeChild(this.button.firstChild);
		}
		this.button.appendChild(document.createTextNode(text));
		this.event = options.event || this.event;
		this.callback = options.callback || this.callback;
		var that = this;
		if (this.event) {
			// Emit Event only if callback is successful
			this.button.onclick = function() {
				var ok = true;
				if (this.callback){
					ok = options.callback.call(node.game);
				}
				if (ok) node.emit(that.event);
			};
		}
		
//		// Emit DONE only if callback is successful
//		this.button.onclick = function() {
//			var ok = true;
//			if (options.exec) ok = options.exec.call(node.game);
//			if (ok) node.emit(that.event);
//		}
	};
	
	EventButton.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.button);
		return root;	
	};
	
	EventButton.prototype.listeners = function () {};
		
	// Done Button

	exports.DoneButton = DoneButton;
	
	DoneButton.prototype.__proto__ = EventButton.prototype;
	DoneButton.prototype.constructor = DoneButton;
	
	DoneButton.id = 'donebutton';
	DoneButton.version = '0.1';
	DoneButton.name = 'Done Button';
	DoneButton.dependencies = {
		EventButton: {}
	};
	
	function DoneButton (options) {
		options.event = 'DONE';
		options.text = options.text || 'Done!';
		EventButton.call(this, options);
	}
	
})(node.window.widgets);
(function (exports) {
	
	exports.GameBoard = GameBoard;
	
	GameState = node.GameState;
	PlayerList = node.PlayerList;
	
	GameBoard.id = 'gboard';
	GameBoard.name = 'GameBoard';
	GameBoard.version = '0.3.2';
	GameBoard.description = 'Offer a visual representation of the state of all players in the game.';
	
	function GameBoard (options) {
		
		this.id = options.id;
		
		this.board = null;
		this.root = null;
		
		this.noPlayers = 'No players connected...';
		
		this.fieldset = {
			legend: 'Game State'
		};
	}
	
	// TODO: Write a proper INIT method
	GameBoard.prototype.init = function () {};
	
	GameBoard.prototype.getRoot = function() {
		return this.root;
	};
	
	GameBoard.prototype.append = function (root) {
		this.root = root;
		this.board = node.window.addDiv(root, this.id);
		this.updateBoard(node.game.pl);
		return root;
	};
	
	GameBoard.prototype.listeners = function() {
		var that = this;
		
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		
		
		node.on('UPDATED_PLIST', function () {
			node.log('I Updating Board');
			that.updateBoard(node.game.pl);

		});
	};
	
	GameBoard.prototype.updateBoard = function (pl) {
		var that = this;
		that.board.innerHTML = 'Updating...';
		
		if (pl.length) {
			that.board.innerHTML = '';
			pl.forEach( function(p) {
				//node.log(p);
				var line = '[' + p.id + "|" + p.name + "]> \t"; 
				
				var pState = '(' +  p.state.round + ') ' + p.state.state + '.' + p.state.step; 
				pState += ' ';
				
				switch (p.state.is) {

					case GameState.iss.UNKNOWN:
						pState += '(unknown)';
						break;
						
					case GameState.iss.LOADING:
						pState += '(loading)';
						break;
						
					case GameState.iss.LOADED:
						pState += '(loaded)';
						break;
						
					case GameState.iss.PLAYING:
						pState += '(playing)';
						break;
					case GameState.iss.DONE:
						pState += '(done)';
						break;		
					default:
						pState += '('+p.state.is+')';
						break;		
				}
				
				if (p.state.paused) {
					pState += ' (P)';
				}
				
				that.board.innerHTML += line + pState +'\n<hr style="color: #CCC;"/>\n';
			});
		}
		else {
			that.board.innerHTML = that.noPlayers;
		}
	};
	
})(node.window.widgets);
(function (exports) {

	exports.GameSummary	= GameSummary;
	
	GameSummary.id = 'gamesummary';
	GameSummary.name = 'Game Summary';
	GameSummary.version = '0.3';
	GameSummary.description = 'Show the general configuration options of the game.';
	
	function GameSummary(options) {
		
		this.game = node.game;
		this.id = options.id;
		
		this.fieldset = {
			legend: 'Game Summary'
		};
		this.summaryDiv = null;
	}
	
	// TODO: Write a proper INIT method
	GameSummary.prototype.init = function () {};
	
	GameSummary.prototype.append = function (root) {
		this.root = root;
		this.summaryDiv = node.window.addDiv(root);
		this.writeSummary();
		return root;
	};
	
	GameSummary.prototype.getRoot = function () {
		return this.root;
	};
	
	GameSummary.prototype.writeSummary = function (idState, idSummary) {
		var gName = document.createTextNode('Name: ' + this.game.name);
		var gDescr = document.createTextNode('Descr: ' + this.game.description);
		var gMinP = document.createTextNode('Min Pl.: ' + this.game.minPlayers);
		var gMaxP = document.createTextNode('Max Pl.: ' + this.game.maxPlayers);
		
		this.summaryDiv.appendChild(gName);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gDescr);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gMinP);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gMaxP);
		
		node.window.addDiv(this.root, this.summaryDiv, idSummary);
	};
	
	GameSummary.prototype.listeners = function() {}; 

})(node.window.widgets);
(function (exports) {

	var GameState = node.GameState;
	var PlayerList = node.PlayerList;
	
	/*!
	* GameTable
	* 
	* Show the memory state of the game
	*/
	
	exports.GameTable = GameTable;
	
	GameTable.id = 'gametable';
	GameTable.name = 'Game Table';
	GameTable.version = '0.2';
	
	GameTable.dependencies = {
		JSUS: {}
	};
	
	function GameTable (options) {
		this.options = options;
		this.id = options.id;
		this.name = options.name || GameTable.name;
		
		this.fieldset = { legend: this.name,
							id: this.id + '_fieldset'
		};
		
		this.root = null;
		this.gtbl = null;
		this.plist = null;
		
		this.init(this.options);
	}
	
	GameTable.prototype.init = function (options) {
		
		if (!this.plist) this.plist = new PlayerList();
		
		this.gtbl = new node.window.Table({
											auto_update: true,
											id: options.id || this.id,
											render: options.render
		}, node.game.memory.db);
		
		
		this.gtbl.c('state', GameState.compare);
		
		this.gtbl.setLeft([]);
		
//		if (this.gtbl.length === 0) {
//			this.gtbl.table.appendChild(document.createTextNode('Empty table'));
//		}
		
		this.gtbl.parse(true);
	};
	

	GameTable.prototype.addRenderer = function (func) {
		return this.gtbl.addRenderer(func);
	};
	
	GameTable.prototype.resetRender = function () {
		return this.gtbl.resetRenderer();
	};
	
	GameTable.prototype.removeRenderer = function (func) {
		return this.gtbl.removeRenderer(func);
	};
	
	GameTable.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.gtbl.table);
		return root;
	};
	
	GameTable.prototype.listeners = function () {
		var that = this;
		
		node.onPLIST(function(msg) {	
			if (!msg.data.length) return;
			
			//var diff = JSUS.arrayDiff(msg.data,that.plist.db);
			var plist = new PlayerList({}, msg.data);
			var diff = plist.diff(that.plist);
			if (diff) {
//				console.log('New Players found');
//				console.log(diff);
				diff.forEach(function(el){that.addPlayer(el);});
			}

			that.gtbl.parse(true);
		});
		
		node.on('in.set.DATA', function (msg) {

			that.addLeft(msg.state, msg.from);
			var x = that.player2x(msg.from);
			var y = that.state2y(node.game.gameState);
			
			that.gtbl.add(msg.data, x, y);
			that.gtbl.parse(true);
		});
	}; 
	
	GameTable.prototype.addPlayer = function (player) {
		this.plist.add(player);
		var header = this.plist.map(function(el){return el.name;});
		this.gtbl.setHeader(header);
	};
	
	GameTable.prototype.addLeft = function (state, player) {
		if (!state) return;
		state = new GameState(state);
		if (!JSUS.in_array({content:state.toString(), type: 'left'}, this.gtbl.left)){
			this.gtbl.add2Left(state.toString());
		}
		// Is it a new display associated to the same state?
		else {
			var y = this.state2y(state);
			var x = this.player2x(player);
			if (this.gtbl.select('y','=',y).select('x','=',x).count() > 1) {
				this.gtbl.add2Left(state.toString());
			}
		}
			
	};
	
	GameTable.prototype.player2x = function (player) {
		if (!player) return false;
		return this.plist.select('id', '=', player).first().count;
	};
	
	GameTable.prototype.x2Player = function (x) {
		if (!x) return false;
		return this.plist.select('count', '=', x).first().count;
	};
	
	GameTable.prototype.state2y = function (state) {
		if (!state) return false;
		return node.game.gameLoop.indexOf(state);
	};
	
	GameTable.prototype.y2State = function (y) {
		if (!y) return false;
		return node.game.gameLoop.jumpTo(new GameState(),y);
	};
	
	

})(node.window.widgets);
(function (exports) {

	var GameMsg = node.GameMsg;
	var Table = node.window.Table;
	
	exports.MsgBar	= MsgBar;
		
	MsgBar.id = 'msgbar';
	MsgBar.name = 'Msg Bar';
	MsgBar.version = '0.4';
	MsgBar.description = 'Send a nodeGame message to players';
	
	function MsgBar (options) {
		
		this.game = node.game;
		this.id = options.id;
		
		this.recipient = null;
		this.actionSel = null;
		this.targetSel = null;
		
		this.table = new Table();
		
		this.fieldset = {
			legend: 'Send MSG'
		};
		
		this.init();
	}
	
	// TODO: Write a proper INIT method
	MsgBar.prototype.init = function () {
		var that = this;
		var gm = new GameMsg();
		var y = 0;
		for (var i in gm) {
			if (gm.hasOwnProperty(i)) {
				var id = this.id + '_' + i;
				this.table.add(i, 0, y);
				this.table.add(node.window.getTextInput(id), 1, y);
				if (i === 'target') {
					this.targetSel = node.window.getTargetSelector(this.id + '_targets');
					this.table.add(this.targetSel, 2, y);
					
					this.targetSel.onchange = function () {
						node.window.getElementById(that.id + '_target').value = that.targetSel.value; 
					};
				}
				else if (i === 'action') {
					this.actionSel = node.window.getActionSelector(this.id + '_actions');
					this.table.add(this.actionSel, 2, y);
					this.actionSel.onchange = function () {
						node.window.getElementById(that.id + '_action').value = that.actionSel.value; 
					};
				}
				else if (i === 'to') {
					this.recipient = node.window.getRecipientSelector(this.id + 'recipients');
					this.table.add(this.recipient, 2, y);
					this.recipient.onchange = function () {
						node.window.getElementById(that.id + '_to').value = that.recipient.value; 
					};
				}
				y++;
			}
		}
		this.table.parse();
	};
	
	MsgBar.prototype.append = function (root) {
		
		var sendButton = node.window.addButton(root);
		var stubButton = node.window.addButton(root, 'stub', 'Add Stub');
		
		var that = this;
		sendButton.onclick = function() {
			// Should be within the range of valid values
			// but we should add a check
			
			var msg = that.parse();
			node.node.gsc.send(msg);
			//console.log(msg.stringify());
		};
		stubButton.onclick = function() {
			that.addStub();
		};
		
		root.appendChild(this.table.table);
		
		this.root = root;
		return root;
	};
	
	MsgBar.prototype.getRoot = function () {
		return this.root;
	};
	
	MsgBar.prototype.listeners = function () {
		var that = this;	
		node.onPLIST( function(msg) {
			node.window.populateRecipientSelector(that.recipient, msg.data);
		
		}); 
	};
	
	MsgBar.prototype.parse = function () {
		var msg = {};
		var that = this;
		var key = null;
		var value = null;
		this.table.forEach( function(e) {
			
				if (e.x === 0) {
					key = e.content;
					msg[key] = ''; 
				}
				else if (e.x === 1) {
					
					value = e.content.value;
					if (key === 'state' || key === 'data') {
						try {
							value = JSON.parse(e.content.value);
						}
						catch (ex) {
							value = e.content.value;
						}
					}
					
					msg[key] = value;
				}
		});
		console.log(msg);
		return new GameMsg(msg);
	};
	
	MsgBar.prototype.addStub = function () {
		node.window.getElementById(this.id + '_from').value = this.game.player.id;
		node.window.getElementById(this.id + '_to').value = this.recipient.value;
		node.window.getElementById(this.id + '_forward').value = 0;
		node.window.getElementById(this.id + '_reliable').value = 1;
		node.window.getElementById(this.id + '_priority').value = 0;
		
		if (node.gsc && node.gsc.session) {
			node.window.getElementById(this.id + '_session').value = node.gsc.session;
		}
		
		node.window.getElementById(this.id + '_state').value = JSON.stringify(node.state);
		node.window.getElementById(this.id + '_action').value = this.actionSel.value;
		node.window.getElementById(this.id + '_target').value = this.targetSel.value;
		
	};
	
})(node.window.widgets);
(function (exports) {

	/*
	* NDDBBrowser
	* 
	* Sends DATA msgs
	* 
	*/
	
	exports.NDDBBrowser = NDDBBrowser;
	
	JSUS = node.JSUS;
	NDDB = node.NDDB;
	TriggerManager = node.TriggerManager;
	
	NDDBBrowser.id = 'nddbbrowser';
	NDDBBrowser.name = 'NDDBBrowser';
	NDDBBrowser.version = '0.1.2';
	NDDBBrowser.description = 'Provides a very simple interface to control a NDDB istance.';
	
	NDDBBrowser.dependencies = {
		JSUS: {},
		NDDB: {},
		TriggerManager: {}
	};
	
	function NDDBBrowser (options) {
		this.options = options;
		this.nddb = null;
		
		this.commandsDiv = document.createElement('div');
		this.id = options.id;
		if ('undefined' !== typeof this.id) {
			this.commandsDiv.id = this.id;
		}
		
		this.info = null;
		this.init(this.options);
	}
	
	NDDBBrowser.prototype.init = function (options) {
		
		function addButtons() {
			var id = this.id;
			node.window.addEventButton(id + '_GO_TO_FIRST', '<<', this.commandsDiv, 'go_to_first');
			node.window.addEventButton(id + '_GO_TO_PREVIOUS', '<', this.commandsDiv, 'go_to_previous');
			node.window.addEventButton(id + '_GO_TO_NEXT', '>', this.commandsDiv, 'go_to_next');
			node.window.addEventButton(id + '_GO_TO_LAST', '>>', this.commandsDiv, 'go_to_last');
			node.window.addBreak(this.commandsDiv);
		}
		function addInfoBar() {
			var span = this.commandsDiv.appendChild(document.createElement('span'));
			return span;
		}
		
		
		addButtons.call(this);
		this.info = addInfoBar.call(this);
		
		this.tm = new TriggerManager();
		this.tm.init(options.triggers);
		this.nddb = options.nddb || new NDDB({auto_update_pointer: true});
	};
	
	NDDBBrowser.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.commandsDiv);
		return root;
	};
	
	NDDBBrowser.prototype.getRoot = function (root) {
		return this.commandsDiv;
	};
	
	NDDBBrowser.prototype.add = function (o) {
		return this.nddb.insert(o);
	};
	
	NDDBBrowser.prototype.sort = function (key) {
		return this.nddb.sort(key);
	};
	
	NDDBBrowser.prototype.addTrigger = function (trigger) {
		return this.tm.addTrigger(trigger);
	};
	
	NDDBBrowser.prototype.removeTrigger = function (trigger) {
		return this.tm.removeTrigger(trigger);
	};
	
	NDDBBrowser.prototype.resetTriggers = function () {
		return this.tm.resetTriggers();
	};
	
	NDDBBrowser.prototype.listeners = function() {
		var that = this;
		var id = this.id;
		
		function notification (el, text) {
			if (el) {
				node.emit(id + '_GOT', el);
				this.writeInfo((this.nddb.nddb_pointer + 1) + '/' + this.nddb.length);
			}
			else {
				this.writeInfo('No element found');
			}
		}
		
		node.on(id + '_GO_TO_FIRST', function() {
			var el = that.tm.pullTriggers(that.nddb.first());
			notification.call(that, el);
		});
		
		node.on(id + '_GO_TO_PREVIOUS', function() {
			var el = that.tm.pullTriggers(that.nddb.previous());
			notification.call(that, el);
		});
		
		node.on(id + '_GO_TO_NEXT', function() {
			var el = that.tm.pullTriggers(that.nddb.next());
			notification.call(that, el);
		});

		node.on(id + '_GO_TO_LAST', function() {
			var el = that.tm.pullTriggers(that.nddb.last());
			notification.call(that, el);
			
		});
	};
	
	NDDBBrowser.prototype.writeInfo = function (text) {
		if (this.infoTimeout) clearTimeout(this.infoTimeout);
		this.info.innerHTML = text;
		var that = this;
		this.infoTimeout = setTimeout(function(){
			that.info.innerHTML = '';
		}, 2000);
	};
	
	
})(node.window.widgets);
(function (exports) {
	
	
	// TODO: Introduce rules for update: other vs self
	
	exports.NextPreviousState =	NextPreviousState;
	
	NextPreviousState.id = 'nextprevious';
	NextPreviousState.name = 'Next,Previous State';
	NextPreviousState.version = '0.3.1';
	NextPreviousState.description = 'Adds two buttons to push forward or rewind the state of the game by one step.';
		
	function NextPreviousState(options) {
		this.game = node.game;
		this.id = options.id || NextPreviousState.id;
		
		this.fieldset = {
			legend: 'Rew-Fwd'
		};
	}
	
	// TODO: Write a proper INIT method
	NextPreviousState.prototype.init = function () {};
	
	NextPreviousState.prototype.getRoot = function () {
		return this.root;
	};
	
	NextPreviousState.prototype.append = function (root) {
		var idRew = this.id + '_button';
		var idFwd = this.id + '_button';
		
		var rew = node.window.addButton(root, idRew, '<<');
		var fwd = node.window.addButton(root, idFwd, '>>');
		
		
		var that = this;
	
		var updateState = function (state) {
			if (state) {
				var stateEvent = node.IN + node.actions.SAY + '.STATE';
				var stateMsg = node.msg.createSTATE(stateEvent, state);
				// Self Update
				node.emit(stateEvent, stateMsg);
				
				// Update Others
				stateEvent = node.OUT + node.actions.SAY + '.STATE';
				node.emit(stateEvent, state, 'ALL');
			}
			else {
				node.log('No next/previous state. Not sent', 'ERR');
			}
		};
		
		fwd.onclick = function() {
			updateState(that.game.next());
		};
			
		rew.onclick = function() {
			updateState(that.game.previous());
		};
		
		this.root = root;
		return root;
	};
	
	NextPreviousState.prototype.listeners = function () {}; 

})(node.window.widgets);
(function (exports) {
	

	/*
	* ServerInfoDisplay
	* 
	* Sends STATE msgs
	*/
	
	exports.ServerInfoDisplay = ServerInfoDisplay;	
		
	ServerInfoDisplay.id = 'serverinfodisplay';
	ServerInfoDisplay.name = 'Server Info Display';
	ServerInfoDisplay.version = '0.2';
	
	function ServerInfoDisplay (options) {	
		this.game = node.game;
		this.id = options.id;
		
		this.fieldset = { legend: 'Server Info',
							id: this.id + '_fieldset'
		};
		
		this.root = null;
		this.div = document.createElement('div');
		this.table = null; //new node.window.Table();
		this.button = null;
		
	}
	
	ServerInfoDisplay.prototype.init = function (options) {
		var that = this;
		if (!this.div) {
			this.div = document.createElement('div');
		}
		this.div.innerHTML = 'Waiting for the reply from Server...';
		if (!this.table) {
			this.table = new node.window.Table(options);
		}
		this.table.clear(true);
		this.button = document.createElement('button');
		this.button.value = 'Refresh';
		this.button.appendChild(document.createTextNode('Refresh'));
		this.button.onclick = function(){
			that.getInfo();
		};
		this.root.appendChild(this.button);
		this.getInfo();
	};
	
	ServerInfoDisplay.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.div);
		return root;
	};
	
	ServerInfoDisplay.prototype.getInfo = function() {
		var that = this;
		node.get('INFO', function (info) {
			node.window.removeChildrenFromNode(that.div);
			that.div.appendChild(that.processInfo(info));
		});
	};
	
	ServerInfoDisplay.prototype.processInfo = function(info) {
		this.table.clear(true);
		for (var key in info) {
			if (info.hasOwnProperty(key)){
				this.table.addRow([key,info[key]]);
			}
		}
		return this.table.parse();
	};
	
	ServerInfoDisplay.prototype.listeners = function () {
		var that = this;
		node.on('NODEGAME_READY', function(){
			that.init();
		});
	}; 
	
})(node.window.widgets);
(function (exports) {
	
	// TODO: Introduce rules for update: other vs self
	
	exports.StateBar = StateBar;	
	
	StateBar.id = 'statebar';
	StateBar.name = 'State Bar';
	StateBar.version = '0.3.1';
	StateBar.description = 'Provides a simple interface to change the state of the game.';
	
	function StateBar (options) {
		this.id = options.id;
		
		this.actionSel = null;
		this.recipient = null;
		
		this.fieldset = {
			legend: 'Change Game State'
		};
	}
	
	// TODO: Write a proper INIT method
	StateBar.prototype.init = function () {};
	
	StateBar.prototype.getRoot = function () {
		return this.root;
	};
	
	StateBar.prototype.append = function (root) {
		
		var PREF = this.id + '_';
		
		var idButton = PREF + 'sendButton';
		var idStateSel = PREF + 'stateSel';
		var idActionSel = PREF + 'actionSel';
		var idRecipient = PREF + 'recipient'; 
				
		var sendButton = node.window.addButton(root, idButton);
		var stateSel = node.window.addStateSelector(root, idStateSel);
		this.actionSel = node.window.addActionSelector(root, idActionSel);
		this.recipient = node.window.addRecipientSelector(root, idRecipient);
		
		var that = this;
	
		sendButton.onclick = function() {
	
			// Should be within the range of valid values
			// but we should add a check
			var to = that.recipient.value;
			
			//var parseState = /(\d+)(?:\.(\d+))?(?::(\d+))?/;
			//var parseState = /^\b\d+\.\b[\d+]?\b:[\d+)]?$/;
			//var parseState = /^(\d+)$/;
			//var parseState = /(\S+)?/;
			var parseState = /^(\d+)(?:\.(\d+))?(?::(\d+))?$/;
			
			var result = parseState.exec(stateSel.value);
			
			if (result !== null) {
				// Note: not result[0]!
				var state = result[1];
				var step = result[2] || 1;
				var round = result[3] || 1;
				console.log('Action: ' + that.actionSel.value + ' Parsed State: ' + result.join("|"));
				
				state = new node.GameState({
													state: state,
													step: step,
													round: round
				});
				
				var stateEvent;
				
				// Self Update
				if (to === 'ALL') {
					stateEvent = node.IN + node.actions.SAY + '.STATE';
					var stateMsg = node.msg.createSTATE(stateEvent, state);
					node.emit(stateEvent, stateMsg);
				}
				
				// Update Others
				stateEvent = node.OUT + that.actionSel.value + '.STATE';
				node.emit(stateEvent,state,to);
			}
			else {
				console.log('Not valid state. Not sent.');
				node.gsc.sendTXT('E: not valid state. Not sent');
			}
		};
		
		this.root = root;
		return root;
		
	};
	
	StateBar.prototype.listeners = function () {
		var that = this;
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		
		node.onPLIST( function(msg) {
			node.window.populateRecipientSelector(that.recipient,msg.data);
		}); 
	}; 
})(node.window.widgets);
(function (exports) {

	JSUS = node.JSUS;
	Table = node.window.Table;
	
	exports.StateDisplay = StateDisplay;	
	
	StateDisplay.id = 'statedisplay';
	StateDisplay.name = 'State Display';
	StateDisplay.version = '0.4.1';
	StateDisplay.description = 'Display basic information about player\'s status.';
	
	function StateDisplay (options) {
		
		this.id = options.id;
		
		this.fieldset = {
			legend: 'Player Status'
		};
		
		this.root = null;
		this.table = new Table();
	}
	
	// TODO: Write a proper INIT method
	StateDisplay.prototype.init = function () {};
	
	StateDisplay.prototype.getRoot = function () {
		return this.root;
	};
	
	
	StateDisplay.prototype.append = function (root) {
		var that = this;
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset';
		var idPlayer = PREF + 'player';
		var idState = PREF + 'state'; 
			
		var checkPlayerName = setInterval(function(idState,idPlayer){
			if (node.player !== null){
				clearInterval(checkPlayerName);
				that.updateAll();
			}
		}, 100);
	
		root.appendChild(this.table.table);
		this.root = root;
		return root;
		
	};
	
	StateDisplay.prototype.updateAll = function() {
		this.table.clear(true);
		this.table.addRow(['Name: ', node.player.name]);
		this.table.addRow(['State: ', new GameState(node.state).toString()]);
		this.table.addRow(['Id: ', node.player.id]);
		this.table.parse();
		
	};
	
	StateDisplay.prototype.listeners = function () {
		var that = this;
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		var IN =  node.IN;
		var OUT = node.OUT;
		
		node.on( 'STATECHANGE', function() {
			that.updateAll(node.state);
		}); 
	}; 
	
})(node.window.widgets);
(function (exports) {
	
	exports.VisualState	= VisualState;
	
	GameState = node.GameState;
	JSUS = node.JSUS;
	Table = node.window.Table;
	
	VisualState.id = 'visualstate';
	VisualState.name = 'Visual State';
	VisualState.version = '0.2.1';
	VisualState.description = 'Visually display current, previous and next state of the game.';
	
	VisualState.dependencies = {
		JSUS: {},
		Table: {}
	};
	
	
	function VisualState (options) {
		this.id = options.id;
		this.gameLoop = node.game.gameLoop;
		
		this.fieldset = {legend: 'State'};
		
		this.root = null;		// the parent element
		this.table = new Table();
		//this.init(options);
	}
	
	// TODO: Write a proper INIT method
	VisualState.prototype.init = function () {};
	
	VisualState.prototype.getRoot = function () {
		return this.root;
	};
	
	VisualState.prototype.append = function (root, ids) {
		var that = this;
		var PREF = this.id + '_';
		root.appendChild(this.table.table);
		this.writeState();
		return root;
	};
		
	VisualState.prototype.listeners = function () {
		var that = this;
		node.on('STATECHANGE', function() {
			that.writeState();
		}); 
	};
	
	VisualState.prototype.writeState = function () {
		var state = false;
		var pr = false;
		var nx = false;
		
		var miss = '-';
		
		if (node.game && node.game.gameState) {
			state = this.gameLoop.getName(node.game.gameState) || miss;
			pr = this.gameLoop.getName(node.game.previous()) || miss;
			nx = this.gameLoop.getName(node.game.next()) || miss;
		}
		else {
			state = 'Uninitialized';
			pr = miss;
			nx = miss;
		}
		this.table.clear(true);

		this.table.addRow(['Previous: ', pr]);
		this.table.addRow(['Current: ', state]);
		this.table.addRow(['Next: ', nx]);
	
		var t = this.table.select('y', '=', 2);
		t.addClass('strong');
		t.select('x','=',0).addClass('underline');
		this.table.parse();
	};
	
})(node.window.widgets);
(function (exports) {
	
	exports.VisualTimer	= VisualTimer;
	
	JSUS = node.JSUS;
	
	VisualTimer.id = 'visualtimer';
	VisualTimer.name = 'Visual Timer';
	VisualTimer.version = '0.3.3';
	VisualTimer.description = 'Display a timer for the game. Timer can trigger events. Only for countdown smaller than 1h.';
	
	VisualTimer.dependencies = {
		GameTimer : {},
		JSUS: {}
	};
	
	function VisualTimer (options) {
		this.options = options;
		this.id = options.id;

		this.gameTimer = null;
		
		this.timerDiv = null;	// the DIV in which to display the timer
		this.root = null;		// the parent element
		this.fieldset = {
						legend: 'Time left',
						id: this.id + '_fieldset'
		};
		
		this.init(this.options);
	}
	
	VisualTimer.prototype.init = function (options) {
		options = options || this.options;
		var that = this;
		(function initHooks() {
			if (options.hooks) {
				if (!options.hooks instanceof Array) {
					options.hooks = [options.hooks];
				}
			}
			else {
				options.hooks = [];
			}
			
			options.hooks.push({hook: that.updateDisplay,
								ctx: that
			});
		})();
		
		
		this.gameTimer = (options.gameTimer) || new node.GameTimer();
		
		if (this.gameTimer) {
			this.gameTimer.init(options);
		}
		else {
			node.log('GameTimer object could not be initialized. VisualTimer will not work properly.', 'ERR');
		}
		
		
	};
	
	VisualTimer.prototype.getRoot = function () {
		return this.root;
	};
	
	VisualTimer.prototype.append = function (root) {
		this.root = root;
		this.timerDiv = node.window.addDiv(root, this.id + '_div');
		this.updateDisplay();
		return root;	
	};
	
	VisualTimer.prototype.updateDisplay = function () {
		if (!this.gameTimer.milliseconds || this.gameTimer.milliseconds === 0) {
			this.timerDiv.innerHTML = '00:00';
			return;
		}
		var time = this.gameTimer.milliseconds - this.gameTimer.timePassed;
		time = JSUS.parseMilliseconds(time);
		var minutes = (time[2] < 10) ? '' + '0' + time[2] : time[2];
		var seconds = (time[3] < 10) ? '' + '0' + time[3] : time[3];
		this.timerDiv.innerHTML = minutes + ':' + seconds;
	};
	
	VisualTimer.prototype.start = function() {
		this.updateDisplay();
		this.gameTimer.start();
	};
	
	VisualTimer.prototype.restart = function (options) {
		this.init(options);
		this.start();
	};
	
	VisualTimer.prototype.stop = function (options) {
		this.gameTimer.stop();
	};
	
	VisualTimer.prototype.resume = function (options) {
		this.gameTimer.resume();
	};
		
	VisualTimer.prototype.listeners = function () {
		var that = this;
		node.on('LOADED', function() {
			var timer = node.game.gameLoop.getAllParams(node.game.gameState).timer;
			if (timer) {
				timer = JSUS.clone(timer);
				that.timerDiv.className = '';
				var options = {},
					typeoftimer = typeof timer; 
				switch (typeoftimer) {
				
					case 'number':
						options.milliseconds = timer;
						break;
					case 'object':
						options = timer;
						break;
					case 'function':
						options.milliseconds = timer
						break;
					case 'string':
						options.milliseconds = Number(timer);
						break;
				};
			
				if (!options.milliseconds) return;
			
				if ('function' === typeof options.milliseconds) {
					options.milliseconds = options.milliseconds.call(node.game);
				}
				
				if (!options.timeup) {
					options.timeup = 'DONE';
				}
				
				that.gameTimer.init(options);
				that.start();
			}
		});
		
		node.on('DONE', function() {
			// TODO: This should be enabled again
			that.gameTimer.stop();
			that.timerDiv.className = 'strike';
		});
	};
	
})(node.window.widgets);
(function (exports) {

	exports.WaitScreen = WaitScreen;
	
	WaitScreen.id = 'waiting';
	WaitScreen.name = 'WaitingScreen';
	WaitScreen.version = '0.3.2';
	WaitScreen.description = 'Show a standard waiting screen';
	
	function WaitScreen (options) {
		this.id = options.id;
		
		this.text = 'Waiting for other players to be done...';
		this.waitingDiv = null;
	}
	
	// TODO: Write a proper init function
	WaitScreen.prototype.init = function (options) {};	
	
	WaitScreen.prototype.append = function (root) {
		return root;
	};
	
	WaitScreen.prototype.getRoot = function () {
		return this.waitingDiv;
	};
	
	WaitScreen.prototype.listeners = function () {
		var that = this;
		node.on('WAITING...', function (text) {
			if (!that.waitingDiv) {
				that.waitingDiv = node.window.addDiv(document.body, that.id);
			}
			
			if (that.waitingDiv.style.display === 'none'){
				that.waitingDiv.style.display = '';
			}			
		
			that.waitingDiv.innerHTML = text || that.text;
			node.game.pause();
		});
		
		// It is supposed to fade away when a new state starts
		node.on('LOADED', function(text) {
			if (that.waitingDiv) {
				
				if (that.waitingDiv.style.display === ''){
					that.waitingDiv.style.display = 'none';
				}
			// TODO: Document.js add method to remove element
			}
		});
		
	}; 
})(node.window.widgets);
(function (exports) {
	
	exports.Wall = Wall;
	
	var JSUS = node.JSUS;
	
	Wall.id = 'wall';
	Wall.name = 'Wall';
	Wall.version = '0.3';
	Wall.description = 'Intercepts all LOG events and prints them ';
	Wall.description += 'into a DIV element with an ordinal number and a timestamp.';
	
	Wall.dependencies = {
		JSUS: {}
	};
	
	function Wall (options) {
		this.id = options.id || Wall.id;
		this.name = options.name || this.name;
		this.buffer = [];
		this.counter = 0;

		this.wall = node.window.getElement('pre', this.id);
		
		this.fieldset = {
			legend: 'Game Log',
			id: this.id
		};
	}
	
	Wall.prototype.init = function (options) {
		options = options || {};
		this.counter = options.counter || this.counter;
	};
	
	Wall.prototype.append = function (root) {
		return root.appendChild(this.wall);
	};
	
	Wall.prototype.getRoot = function () {
		return this.wall;
	};
	
	Wall.prototype.listeners = function() {
		var that = this;	
		node.on('LOG', function (msg) {
			that.debuffer();
			that.write(msg);
		});
	}; 
	
	Wall.prototype.write = function (text) {
		if (document.readyState !== 'complete') {
			this.buffer.push(s);
		} else {
			var mark = this.counter++ + ') ' + JSUS.getTime() + ' ';
			this.wall.innerHTML = mark + text + "\n" + this.wall.innerHTML;
		}
	};

	Wall.prototype.debuffer = function () {
		if (document.readyState === 'complete' && this.buffer.length > 0) {
			for (var i=0; i < this.buffer.length; i++) {
				this.write(this.buffer[i]);
			}
			this.buffer = [];
		}
	};
	
})(node.window.widgets);