/**
 * # JSUS: JavaScript UtilS.
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Collection of general purpose javascript functions. JSUS helps!
 *
 * See README.md for extra help.
 * ---
 */
(function(exports) {

    var JSUS = exports.JSUS = {};

    // ## JSUS._classes
    // Reference to all the extensions
    JSUS._classes = {};

    // Make sure that the console is available also in old browser, e.g. < IE8.
    if ('undefined' === typeof console) console = {};
    if ('undefined' === typeof console.log) console.log = function() {};

    /**
     * ## JSUS.log
     *
     * Reference to standard out, by default `console.log`
     *
     * Override to redirect the standard output of all JSUS functions.
     *
     * @param {string} txt Text to output
     */
    JSUS.log = function(txt) {
        console.log(txt);
    };

    /**
     * ## JSUS.extend
     *
     * Extends JSUS with additional methods and or properties
     *
     * The first parameter can be an object literal or a function.
     * A reference of the original extending object is stored in
     * JSUS._classes
     *
     * If a second parameter is passed, that will be the target of the
     * extension.
     *
     * @param {object} additional Text to output
     * @param {object|function} target The object to extend
     *
     * @return {object|function} target The extended object
     *
     * @see JSUS.get
     */
    JSUS.extend = function(additional, target) {
        var name, prop;
        if ('object' !== typeof additional &&
            'function' !== typeof additional) {
            return target;
        }

        // If we are extending JSUS, store a reference
        // of the additional object into the hidden
        // JSUS._classes object;
        if ('undefined' === typeof target) {
            target = target || this;
            if ('function' === typeof additional) {
                name = additional.toString();
                name = name.substr('function '.length);
                name = name.substr(0, name.indexOf('('));
            }
            // Must be object.
            else {
                name = additional.constructor ||
                    additional.__proto__.constructor;
            }
            if (name) {
                this._classes[name] = additional;
            }
        }

        for (prop in additional) {
            if (additional.hasOwnProperty(prop)) {
                if (typeof target[prop] !== 'object') {
                    target[prop] = additional[prop];
                } else {
                    JSUS.extend(additional[prop], target[prop]);
                }
            }
        }

        // Additional is a class (Function)
        // TODO: this is true also for {}
        if (additional.prototype) {
            JSUS.extend(additional.prototype, target.prototype || target);
        }

        return target;
    };

    /**
     * ## JSUS.require
     *
     * Returns a copy of one / all the objects extending JSUS
     *
     * The first parameter is a string representation of the name of
     * the requested extending object. If no parameter is passed a copy
     * of all the extending objects is returned.
     *
     * @param {string} className The name of the requested JSUS library
     *
     * @return {function|boolean} The copy of the JSUS library, or
     *   FALSE if the library does not exist
     */
    JSUS.require = JSUS.get = function(className) {
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

    /**
     * ## JSUS.isNodeJS
     *
     * Returns TRUE when executed inside Node.JS environment
     *
     * @return {boolean} TRUE when executed inside Node.JS environment
     */
    JSUS.isNodeJS = function() {
        return 'undefined' !== typeof module &&
            'undefined' !== typeof module.exports &&
            'function' === typeof require;
    };

    // ## Node.JS includes
    // if node
    if (JSUS.isNodeJS()) {
        require('./lib/compatibility');
        require('./lib/obj');
        require('./lib/array');
        require('./lib/time');
        require('./lib/eval');
        require('./lib/dom');
        require('./lib/random');
        require('./lib/parse');
        require('./lib/queue');
        require('./lib/fs');
    }
    // end node

})(
    'undefined' !== typeof module && 'undefined' !== typeof module.exports ?
        module.exports: window
);

/**
 * # COMPATIBILITY
 *
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Tests browsers ECMAScript 5 compatibility
 *
 * For more information see http://kangax.github.com/es5-compat-table/
 */
(function(JSUS) {
    "use strict";

    function COMPATIBILITY() {}

    /**
     * ## COMPATIBILITY.compatibility
     *
     * Returns a report of the ECS5 features available
     *
     * Useful when an application routinely performs an operation
     * depending on a potentially unsupported ECS5 feature.
     *
     * Transforms multiple try-catch statements in a if-else
     *
     * @return {object} support The compatibility object
     */
    COMPATIBILITY.compatibility = function() {

        var support = {};

        try {
            Object.defineProperty({}, "a", {enumerable: false, value: 1});
            support.defineProperty = true;
        }
        catch(e) {
            support.defineProperty = false;
        }

        try {
            eval('({ get x(){ return 1 } }).x === 1');
            support.setter = true;
        }
        catch(err) {
            support.setter = false;
        }

        try {
            var value;
            eval('({ set x(v){ value = v; } }).x = 1');
            support.getter = true;
        }
        catch(err) {
            support.getter = false;
        }

        return support;
    };


    JSUS.extend(COMPATIBILITY);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # ARRAY
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions to manipulate arrays
 */
(function(JSUS) {

    "use strict";

    function ARRAY() {}

    /**
     * ## ARRAY.filter
     *
     * Add the filter method to ARRAY objects in case the method is not
     * supported natively.
     *
     * @see https://developer.mozilla.org/en/JavaScript/Reference/
     *              Global_Objects/ARRAY/filter
     */
    if (!Array.prototype.filter) {
        Array.prototype.filter = function(fun /*, thisp */) {
            if (this === void 0 || this === null) throw new TypeError();

            var t = new Object(this);
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
     * ## ARRAY.isArray
     *
     * Returns TRUE if a variable is an Array
     *
     * This method is exactly the same as `Array.isArray`,
     * but it works on a larger share of browsers.
     *
     * @param {object} o The variable to check.
     * @see Array.isArray
     */
    ARRAY.isArray = function(o) {
        if (!o) return false;
        return Object.prototype.toString.call(o) === '[object Array]';
    };

    /**
     * ## ARRAY.seq
     *
     * Returns an array of sequential numbers from start to end
     *
     * If start > end the series goes backward.
     *
     * The distance between two subsequent numbers can be controlled
     * by the increment parameter.
     *
     * When increment is not a divider of Abs(start - end), end will
     * be missing from the series.
     *
     * A callback function to apply to each element of the sequence
     * can be passed as fourth parameter.
     *
     * Returns FALSE, in case parameters are incorrectly specified
     *
     * @param {number} start The first element of the sequence
     * @param {number} end The last element of the sequence
     * @param {number} increment Optional. The increment between two
     *   subsequents element of the sequence
     * @param {Function} func Optional. A callback function that can modify
     *   each number of the sequence before returning it
     *
     * @return {array} The final sequence
     */
    ARRAY.seq = function(start, end, increment, func) {
        var i, out;
        if ('number' !== typeof start) return false;
        if (start === Infinity) return false;
        if ('number' !== typeof end) return false;
        if (end === Infinity) return false;
        if (start === end) return [start];

        if (increment === 0) return false;
        if (!JSUS.inArray(typeof increment, ['undefined', 'number'])) {
            return false;
        }

        increment = increment || 1;
        func = func || function(e) {return e;};

        i = start;
        out = [];

        if (start < end) {
            while (i <= end) {
                out.push(func(i));
                i = i + increment;
            }
        }
        else {
            while (i >= end) {
                out.push(func(i));
                i = i - increment;
            }
        }

        return out;
    };

    /**
     * ## ARRAY.each
     *
     * Executes a callback on each element of the array
     *
     * If an error occurs returns FALSE.
     *
     * @param {array} array The array to loop in
     * @param {Function} func The callback for each element in the array
     * @param {object} context Optional. The context of execution of the
     *   callback. Defaults ARRAY.each
     *
     * @return {boolean} TRUE, if execution was successful
     */
    ARRAY.each = function(array, func, context) {
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
     * ## ARRAY.map
     *
     * Executes a callback to each element of the array and returns the result
     *
     * Any number of additional parameters can be passed after the
     * callback function.
     *
     * @return {array} The result of the mapping execution
     *
     * @see ARRAY.each
     */
    ARRAY.map = function() {
        var i, len, args, out, o;
        var array, func;

        array = arguments[0];
        func = arguments[1];

        if (!ARRAY.isArray(array)) {
            JSUS.log('ARRAY.map: first parameter must be array. Found: ' +
                     array);
            return;
        }
        if ('function' !== typeof func) {
            JSUS.log('ARRAY.map: second parameter must be function. Found: ' +
                     func);
            return;
        }

        len = arguments.length;
        if (len === 3) args = [null, arguments[2]];
        else if (len === 4) args = [null, arguments[2], arguments[3]];
        else {
            len = len - 1;
            args = new Array(len);
            for (i = 1; i < (len); i++) {
                args[i] = arguments[i+1];
            }
        }

        out = [], len = array.length;
        for (i = 0; i < len; i++) {
            args[0] = array[i];
            o = func.apply(this, args);
            if ('undefined' !== typeof o) out.push(o);
        }
        return out;
    };


    /**
     * ## ARRAY.removeElement
     *
     * Removes an element from the the array, and returns it
     *
     * For objects, deep equality comparison is performed
     * through JSUS.equals.
     *
     * If no element is removed returns FALSE.
     *
     * @param {mixed} needle The element to search in the array
     * @param {array} haystack The array to search in
     *
     * @return {mixed} The element that was removed, FALSE if none was removed
     *
     * @see JSUS.equals
     */
    ARRAY.removeElement = function(needle, haystack) {
        var func, i;
        if ('undefined' === typeof needle || !haystack) return false;

        if ('object' === typeof needle) {
            func = JSUS.equals;
        }
        else {
            func = function(a, b) {
                return (a === b);
            };
        }

        for (i = 0; i < haystack.length; i++) {
            if (func(needle, haystack[i])){
                return haystack.splice(i,1);
            }
        }
        return false;
    };

    /**
     * ## ARRAY.inArray
     *
     * Returns TRUE if the element is contained in the array,
     * FALSE otherwise
     *
     * For objects, deep equality comparison is performed
     * through JSUS.equals.
     *
     * Alias ARRAY.in_array (deprecated)
     *
     * @param {mixed} needle The element to search in the array
     * @param {array} haystack The array to search in
     *
     * @return {boolean} TRUE, if the element is contained in the array
     *
     *  @see JSUS.equals
     */
    ARRAY.inArray = ARRAY.in_array = function(needle, haystack) {
        var func, i, len;
        if (!haystack) return false;
        func = JSUS.equals;
        len = haystack.length;
        for (i = 0; i < len; i++) {
            if (func.call(this, needle, haystack[i])) {
                return true;
            }
        }
        return false;
    };

    /**
     * ## ARRAY.getNGroups
     *
     * Returns an array of N array containing the same number of elements
     * If the length of the array and the desired number of elements per group
     * are not multiple, the last group could have less elements
     *
     * The original array is not modified.
     *
     *  @see ARRAY.getGroupsSizeN
     *  @see ARRAY.generateCombinations
     *  @see ARRAY.matchN
     *
     * @param {array} array The array to split in subgroups
     * @param {number} N The number of subgroups
     *
     * @return {array} Array containing N groups
     */
    ARRAY.getNGroups = function(array, N) {
        return ARRAY.getGroupsSizeN(array, Math.floor(array.length / N));
    };

    /**
     * ## ARRAY.getGroupsSizeN
     *
     * Returns an array of arrays containing N elements each
     *
     * The last group could have less elements
     *
     * @param {array} array The array to split in subgroups
     * @param {number} N The number of elements in each subgroup
     *
     * @return {array} Array containing groups of size N
     *
     * @see ARRAY.getNGroups
     * @see ARRAY.generateCombinations
     * @see ARRAY.matchN
     */
    ARRAY.getGroupsSizeN = function(array, N) {

        var copy = array.slice(0);
        var len = copy.length;
        var originalLen = copy.length;
        var result = [];

        // Init values for the loop algorithm.
        var i, idx;
        var group = [], count = 0;
        for (i=0; i < originalLen; i++) {

            // Get a random idx between 0 and array length.
            idx = Math.floor(Math.random()*len);

            // Prepare the array container for the elements of a new group.
            if (count >= N) {
                result.push(group);
                count = 0;
                group = [];
            }

            // Insert element in the group.
            group.push(copy[idx]);

            // Update.
            copy.splice(idx,1);
            len = copy.length;
            count++;
        }

        // Add any remaining element.
        if (group.length > 0) {
            result.push(group);
        }

        return result;
    };

    /**
     * ## ARRAY._latinSquare
     *
     * Generate a random Latin Square of size S
     *
     * If N is defined, it returns "Latin Rectangle" (SxN)
     *
     * A parameter controls for self-match, i.e. whether the symbol "i"
     * is found or not in in column "i".
     *
     * @api private
     * @param {number} S The number of rows
     * @param {number} Optional. N The number of columns. Defaults N = S
     * @param {boolean} Optional. If TRUE self-match is allowed. Defaults TRUE
     *
     * @return {array} The resulting latin square (or rectangle)
     */
    ARRAY._latinSquare = function(S, N, self) {
        self = ('undefined' === typeof self) ? true : self;
        // Infinite loop.
        if (S === N && !self) return false;
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
     * ## ARRAY.latinSquare
     *
     * Generate a random Latin Square of size S
     *
     * If N is defined, it returns "Latin Rectangle" (SxN)
     *
     * @param {number} S The number of rows
     * @param {number} Optional. N The number of columns. Defaults N = S
     *
     * @return {array} The resulting latin square (or rectangle)
     */
    ARRAY.latinSquare = function(S, N) {
        if (!N) N = S;
        if (!S || S < 0 || (N < 0)) return false;
        if (N > S) N = S;

        return ARRAY._latinSquare(S, N, true);
    };

    /**
     * ## ARRAY.latinSquareNoSelf
     *
     * Generate a random Latin Square of size Sx(S-1), where
     * in each column "i", the symbol "i" is not found
     *
     * If N < S, it returns a "Latin Rectangle" (SxN)
     *
     * @param {number} S The number of rows
     * @param {number} Optional. N The number of columns. Defaults N = S-1
     *
     * @return {array} The resulting latin square (or rectangle)
     */
    ARRAY.latinSquareNoSelf = function(S, N) {
        if (!N) N = S-1;
        if (!S || S < 0 || (N < 0)) return false;
        if (N > S) N = S-1;

        return ARRAY._latinSquare(S, N, false);
    };


    /**
     * ## ARRAY.generateCombinations
     *
     * Generates all distinct combinations of exactly r elements each
     *
     * @param {array} array The array from which the combinations are extracted
     * @param {number} r The number of elements in each combination
     *
     * @return {array} The total sets of combinations
     *
     * @see ARRAY.getGroupSizeN
     * @see ARRAY.getNGroups
     * @see ARRAY.matchN
     *
     * Kudos: http://rosettacode.org/wiki/Combinations#JavaScript
     */
    ARRAY.generateCombinations = function combinations(arr, k) {
        var i, subI, ret, sub, next;
        ret = [];
        for (i = 0; i < arr.length; i++) {
            if (k === 1) {
                ret.push( [ arr[i] ] );
            }
            else {
                sub = combinations(arr.slice(i+1, arr.length), k-1);
                for (subI = 0; subI < sub.length; subI++ ){
                    next = sub[subI];
                    next.unshift(arr[i]);
                    ret.push( next );
                }
            }
        }
        return ret;
    };

    /**
     * ## ARRAY.matchN
     *
     * Match each element of the array with N random others
     *
     * If strict is equal to true, elements cannot be matched multiple times.
     *
     * *Important*: this method has a bug / feature. If the strict parameter
     * is set, the last elements could remain without match, because all the
     * other have been already used. Another recombination would be able
     * to match all the elements instead.
     *
     * @param {array} array The array in which operate the matching
     * @param {number} N The number of matches per element
     * @param {boolean} strict Optional. If TRUE, matched elements cannot be
     *   repeated. Defaults, FALSE
     *
     * @return {array} The results of the matching
     *
     * @see ARRAY.getGroupSizeN
     * @see ARRAY.getNGroups
     * @see ARRAY.generateCombinations
     */
    ARRAY.matchN = function(array, N, strict) {
        var result, i, copy, group, len, found;
        if (!array) return;
        if (!N) return array;

        result = [];
        len = array.length;
        found = [];
        for (i = 0 ; i < len ; i++) {
            // Recreate the array.
            copy = array.slice(0);
            copy.splice(i,1);
            if (strict) {
                copy = ARRAY.arrayDiff(copy,found);
            }
            group = ARRAY.getNRandom(copy,N);
            // Add to the set of used elements.
            found = found.concat(group);
            // Re-add the current element.
            group.splice(0,0,array[i]);
            result.push(group);

            // Update.
            group = [];
        }
        return result;
    };

    /**
     * ## ARRAY.rep
     *
     * Appends an array to itself a number of times and return a new array
     *
     * The original array is not modified.
     *
     * @param {array} array the array to repeat
     * @param {number} times The number of times the array must be appended
     *   to itself
     *
     * @return {array} A copy of the original array appended to itself
     */
    ARRAY.rep = function(array, times) {
        var i, result;
        if (!array) return;
        if (!times) return array.slice(0);
        if (times < 1) {
            JSUS.log('times must be greater or equal 1', 'ERR');
            return;
        }

        i = 1;
        result = array.slice(0);
        for (; i < times; i++) {
            result = result.concat(array);
        }
        return result;
    };

    /**
     * ## ARRAY.stretch
     *
     * Repeats each element of the array N times
     *
     * N can be specified as an integer or as an array. In the former case all
     * the elements are repeat the same number of times. In the latter, each
     * element can be repeated a custom number of times. If the length of the
     * `times` array differs from that of the array to stretch a recycle rule
     * is applied.
     *
     * The original array is not modified.
     *
     * E.g.:
     *
     * ```js
     *  var foo = [1,2,3];
     *
     *  ARRAY.stretch(foo, 2); // [1, 1, 2, 2, 3, 3]
     *
     *  ARRAY.stretch(foo, [1,2,3]); // [1, 2, 2, 3, 3, 3];
     *
     *  ARRAY.stretch(foo, [2,1]); // [1, 1, 2, 3, 3];
     * ```
     *
     * @param {array} array the array to strech
     * @param {number|array} times The number of times each element
     *   must be repeated
     * @return {array} A stretched copy of the original array
     */
    ARRAY.stretch = function(array, times) {
        var result, i, repeat, j;
        if (!array) return;
        if (!times) return array.slice(0);
        if ('number' === typeof times) {
            if (times < 1) {
                JSUS.log('times must be greater or equal 1', 'ERR');
                return;
            }
            times = ARRAY.rep([times], array.length);
        }

        result = [];
        for (i = 0; i < array.length; i++) {
            repeat = times[(i % times.length)];
            for (j = 0; j < repeat ; j++) {
                result.push(array[i]);
            }
        }
        return result;
    };


    /**
     * ## ARRAY.arrayIntersect
     *
     * Computes the intersection between two arrays
     *
     * Arrays can contain both primitive types and objects.
     *
     * @param {array} a1 The first array
     * @param {array} a2 The second array
     * @return {array} All the values of the first array that are found
     *   also in the second one
     */
    ARRAY.arrayIntersect = function(a1, a2) {
        return a1.filter( function(i) {
            return JSUS.in_array(i, a2);
        });
    };

    /**
     * ## ARRAY.arrayDiff
     *
     * Performs a diff between two arrays
     *
     * Arrays can contain both primitive types and objects.
     *
     * @param {array} a1 The first array
     * @param {array} a2 The second array
     * @return {array} All the values of the first array that are not
     *   found in the second one
     */
    ARRAY.arrayDiff = function(a1, a2) {
        return a1.filter( function(i) {
            return !(JSUS.in_array(i, a2));
        });
    };

    /**
     * ## ARRAY.shuffle
     *
     * Shuffles the elements of the array using the Fischer algorithm
     *
     * The original array is not modified, and a copy is returned.
     *
     * @param {array} shuffle The array to shuffle
     *
     * @return {array} copy The shuffled array
     *
     * @see http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
     */
    ARRAY.shuffle = function(array) {
        var copy, len, j, tmp, i;
        if (!array) return;
        copy = Array.prototype.slice.call(array);
        len = array.length-1; // ! -1
        for (i = len; i > 0; i--) {
            j = Math.floor(Math.random()*(i+1));
            tmp = copy[j];
            copy[j] = copy[i];
            copy[i] = tmp;
        }
        return copy;
    };

    /**
     * ## ARRAY.getNRandom
     *
     * Select N random elements from the array and returns them
     *
     * @param {array} array The array from which extracts random elements
     * @paran {number} N The number of random elements to extract
     *
     * @return {array} An new array with N elements randomly chosen
     */
    ARRAY.getNRandom = function(array, N) {
        return ARRAY.shuffle(array).slice(0,N);
    };

    /**
     * ## ARRAY.distinct
     *
     * Removes all duplicates entries from an array and returns a copy of it
     *
     * Does not modify original array.
     *
     * Comparison is done with `JSUS.equals`.
     *
     * @param {array} array The array from which eliminates duplicates
     *
     * @return {array} A copy of the array without duplicates
     *
     * @see JSUS.equals
     */
    ARRAY.distinct = function(array) {
        var out = [];
        if (!array) return out;

        ARRAY.each(array, function(e) {
            if (!ARRAY.in_array(e, out)) {
                out.push(e);
            }
        });
        return out;
    };

    /**
     * ## ARRAY.transpose
     *
     * Transposes a given 2D array.
     *
     * The original array is not modified, and a new copy is
     * returned.
     *
     * @param {array} array The array to transpose
     *
     * @return {array} The Transposed Array
     */
    ARRAY.transpose = function(array) {
        if (!array) return;

        // Calculate width and height
        var w, h, i, j, t = [];
        w = array.length || 0;
        h = (ARRAY.isArray(array[0])) ? array[0].length : 0;
        if (w === 0 || h === 0) return t;

        for ( i = 0; i < h; i++) {
            t[i] = [];
            for ( j = 0; j < w; j++) {
                t[i][j] = array[j][i];
            }
        }
        return t;
    };

    JSUS.extend(ARRAY);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # DOM
 *
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions related to DOM manipulation
 *
 * Helper library to perform generic operation with DOM elements.
 *
 * The general syntax is the following: Every HTML element has associated
 * a get* and a add* method, whose syntax is very similar.
 *
 * - The get* method creates the element and returns it.
 * - The add* method creates the element, append it as child to a root element,
 *     and then returns it.
 *
 * The syntax of both method is the same, but the add* method
 * needs the root element as first parameter. E.g.
 *
 * - getButton(id, text, attributes);
 * - addButton(root, id, text, attributes);
 *
 * The last parameter is generally an object containing a list of
 * of key-values pairs as additional attributes to set to the element.
 *
 * Only the methods which do not follow the above-mentioned syntax
 * will receive further explanation.
 */
(function(JSUS) {

    "use strict";

    var onFocusChange;

    function DOM() {}

    // ## GENERAL

    /**
     * ### DOM.write
     *
     * Write a text, or append an HTML element or node, into a root element
     *
     * @param {Element} root The HTML element where to write into
     * @param {mixed} text The text to write. Default, an ampty string
     *
     * @return {TextNode} The text node inserted in the root element
     *
     * @see DOM.writeln
     */
    DOM.write = function(root, text) {
        var content;
        if ('undefined' === typeof text || text === null) text = "";
        if (JSUS.isNode(text) || JSUS.isElement(text)) content = text;
        else content = document.createTextNode(text);
        root.appendChild(content);
        return content;
    };

    /**
     * ### DOM.writeln
     *
     * Write a text and a break into a root element
     *
     * Default break element is <br> tag
     *
     * @param {Element} root The HTML element where to write into
     * @param {mixed} text The text to write. Default, an ampty string
     * @param {string} rc the name of the tag to use as a break element
     *
     * @return {TextNode} The text node inserted in the root element
     *
     * @see DOM.write
     * @see DOM.addBreak
     */
    DOM.writeln = function(root, text, rc) {
        var content;
        content = DOM.write(root, text);
        this.addBreak(root, rc);
        return content;
    };

    /**
     * ### DOM.sprintf
     *
     * Builds up a decorated HTML text element
     *
     * Performs string substitution from an args object where the first
     * character of the key bears the following semantic:
     *
     * - '@': variable substitution with escaping
     * - '!': variable substitution without variable escaping
     * - '%': wraps a portion of string into a _span_ element to which is
     *        possible to associate a css class or id. Alternatively,
     *        it also possible to add in-line style. E.g.:
     *
     * ```javascript
     *      sprintf('%sImportant!%s An error has occurred: %pre@err%pre', {
     *              '%pre': {
     *                      style: 'font-size: 12px; font-family: courier;'
     *              },
     *              '%s': {
     *                      id: 'myId',
     *                      'class': 'myClass',
     *              },
     *              '@err': 'file not found',
     *      }, document.body);
     * ```
     *
     * Special span elements are %strong and %em, which add
     * respectively a _strong_ and _em_ tag instead of the default
     * _span_ tag. They cannot be styled.
     *
     * @param {string} string A text to transform
     * @param {object} args Optional. An object containing string
     *   transformations
     * @param {Element} root Optional. An HTML element to which append the
     *    string. Defaults, a new _span_ element
     *
     * @return {Element} The root element.
     */
    DOM.sprintf = function(string, args, root) {

        var text, span, idx_start, idx_finish, idx_replace, idxs;
        var spans, key, i;

        root = root || document.createElement('span');
        spans = {};

        // Create an args object, if none is provided.
        // Defaults %em and %strong are added.
        args = args || {};
        args['%strong'] = '';
        args['%em'] = '';

        // Transform arguments before inserting them.
        for (key in args) {
            if (args.hasOwnProperty(key)) {

                switch(key.charAt(0)) {

                case '%': // Span/Strong/Emph .

                    idx_start = string.indexOf(key);

                    // Pattern not found. No error.
                    if (idx_start === -1) continue;

                    idx_replace = idx_start + key.length;
                    idx_finish = string.indexOf(key, idx_replace);

                    if (idx_finish === -1) {
                        JSUS.log('Error. Could not find closing key: ' + key);
                        continue;
                    }

                    // Can be strong, emph or a generic span.
                    spans[idx_start] = key;

                    break;

                case '@': // Replace and sanitize.
                    string = string.replace(key, escape(args[key]));
                    break;

                case '!': // Replace and not sanitize.
                    string = string.replace(key, args[key]);
                    break;

                default:
                    JSUS.log('Identifier not in [!,@,%]: ' + key[0]);

                }
            }
        }

        // No span to create, return what we have.
        if (!JSUS.size(spans)) {
            return root.appendChild(document.createTextNode(string));
        }

        // Re-assamble the string.

        idxs = JSUS.keys(spans).sort(function(a, b){ return a - b; });
        idx_finish = 0;
        for (i = 0; i < idxs.length; i++) {

            // Add span.
            key = spans[idxs[i]];
            idx_start = string.indexOf(key);

            // Add fragments of string.
            if (idx_finish !== idx_start-1) {
                root.appendChild(document.createTextNode(
                    string.substring(idx_finish, idx_start)));
            }

            idx_replace = idx_start + key.length;
            idx_finish = string.indexOf(key, idx_replace);

            if (key === '%strong') {
                span = document.createElement('strong');
            }
            else if (key === '%em') {
                span = document.createElement('em');
            }
            else {
                span = JSUS.getElement('span', null, args[key]);
            }

            text = string.substring(idx_replace, idx_finish);

            span.appendChild(document.createTextNode(text));

            root.appendChild(span);
            idx_finish = idx_finish + key.length;
        }

        // Add the final part of the string.
        if (idx_finish !== string.length) {
            root.appendChild(document.createTextNode(
                string.substring(idx_finish)));
        }

        return root;
    };

    /**
     * ### DOM.isNode
     *
     * Returns TRUE if the object is a DOM node
     *
     * @param {mixed} The variable to check
     *
     * @return {boolean} TRUE, if the the object is a DOM node
     */
    DOM.isNode = function(o) {
        if ('object' !== typeof o) return false;
        return 'object' === typeof Node ? o instanceof Node :
            'number' === typeof o.nodeType &&
            'string' === typeof o.nodeName;
    };

    /**
     * ### DOM.isElement
     *
     * Returns TRUE if the object is a DOM element
     *
     * Notice: instanceof HTMLElement is not reliable in Safari, even if
     * the method is defined.
     *
     * @param {mixed} The variable to check
     *
     * @return {boolean} TRUE, if the the object is a DOM element
     */
    DOM.isElement = function(o) {
        return 'object' === typeof o && o.nodeType === 1 &&
            'string' === typeof o.nodeName;
    };

    /**
     * ### DOM.shuffleElements
     *
     * Shuffles the children element nodes
     *
     * All children must have the id attribute.
     *
     * Notice the difference between Elements and Nodes:
     *
     * http://stackoverflow.com/questions/7935689/
     * what-is-the-difference-between-children-and-childnodes-in-javascript
     *
     * @param {Node} parent The parent node
     * @param {array} order Optional. A pre-specified order. Defaults, random
     *
     * @return {array} The order used to shuffle the nodes
     */
    DOM.shuffleElements = function(parent, order) {
        var i, len, idOrder, children, child;
        if (!JSUS.isNode(parent)) {
            throw new TypeError('DOM.shuffleNodes: parent must node.');
        }
        if (!parent.children || !parent.children.length) {
            JSUS.log('DOM.shuffleNodes: parent has no children.', 'ERR');
            return false;
        }
        if (order) {
            if (!JSUS.isArray(order)) {
                throw new TypeError('DOM.shuffleNodes: order must array.');
            }
            if (order.length !== parent.children.length) {
                throw new Error('DOM.shuffleNodes: order length must match ' +
                                'the number of children nodes.');
            }
        }

        // DOM4 compliant browsers.
        children = parent.children;

        //https://developer.mozilla.org/en/DOM/Element.children
        //[IE lt 9] IE < 9
        if ('undefined' === typeof children) {
            child = this.firstChild;
            while (child) {
                if (child.nodeType == 1) children.push(child);
                child = child.nextSibling;
            }
        }

        len = children.length;
        idOrder = [];
        if (!order) order = JSUS.sample(0, (len-1));
        for (i = 0 ; i < len; i++) {
            idOrder.push(children[order[i]].id);
        }
        // Two fors are necessary to follow the real sequence.
        // However parent.children is a special object, so the sequence
        // could be unreliable.
        for (i = 0 ; i < len; i++) {
            parent.appendChild(children[idOrder[i]]);
        }

        return idOrder;
    };

    /**
     * ### DOM.shuffleNodes
     *
     * It actually shuffles Elements.
     *
     * @deprecated
     */
    DOM.shuffleNodes = DOM.shuffleElements;

    /**
     * ### DOM.getElement
     *
     * Creates a generic HTML element with id and attributes as specified
     *
     * @param {string} elem The name of the tag
     * @param {string} id Optional. The id of the tag
     * @param {object} attributes Optional. Object containing attributes for
     *   the newly created element
     *
     * @return {HTMLElement} The newly created HTML element
     *
     * @see DOM.addAttributes2Elem
     */
    DOM.getElement = function(elem, id, attributes) {
        var e = document.createElement(elem);
        if ('undefined' !== typeof id) {
            e.id = id;
        }
        return this.addAttributes2Elem(e, attributes);
    };

    /**
     * ### DOM.addElement
     *
     * Creates and appends a generic HTML element with specified attributes
     *
     * @param {string} elem The name of the tag
     * @param {HTMLElement} root The root element to which the new element will
     *   be appended
     * @param {string} id Optional. The id of the tag
     * @param {object} attributes Optional. Object containing attributes for
     *   the newly created element
     *
     * @return {HTMLElement} The newly created HTML element
     *
     * @see DOM.getElement
     * @see DOM.addAttributes2Elem
     */
    DOM.addElement = function(elem, root, id, attributes) {
        var el = this.getElement(elem, id, attributes);
        return root.appendChild(el);
    };

    /**
     * ### DOM.addAttributes2Elem
     *
     * Adds attributes to an HTML element and returns it.
     *
     * Attributes are defined as key-values pairs.
     * Attributes 'label' is ignored, attribute 'className' ('class') and
     * 'style' are special and are delegated to special methods.
     *
     * @param {HTMLElement} e The element to decorate
     * @param {object} a Object containing attributes to add to the element
     *
     * @return {HTMLElement} The decorated element
     *
     * @see DOM.addLabel
     * @see DOM.addClass
     * @see DOM.style
     */
    DOM.addAttributes2Elem = function(e, a) {
        var key;
        if (!e || !a) return e;
        if ('object' != typeof a) return e;
        for (key in a) {
            if (a.hasOwnProperty(key)) {
                if (key === 'id') {
                    e.id = a[key];
                }
                else if (key === 'class' || key === 'className') {
                    DOM.addClass(e, a[key]);
                }
                else if (key === 'style') {
                    DOM.style(e, a[key]);
                }
                else if (key === 'label') {
                    // Handle the case.
                    JSUS.log('DOM.addAttributes2Elem: label attribute is not ' +
                             'supported. Use DOM.addLabel instead.');
                }
                else {
                    e.setAttribute(key, a[key]);
                }


                // TODO: handle special cases
                // <!--
                //else {
                //
                //    // If there is no parent node,
                //    // the legend cannot be created
                //    if (!e.parentNode) {
                //        node.log('Cannot add label: ' +
                //                 'no parent element found', 'ERR');
                //        continue;
                //    }
                //
                //    this.addLabel(e.parentNode, e, a[key]);
                //}
                // -->
            }
        }
        return e;
    };

    /**
     * ### DOM.populateSelect
     *
     * Appends a list of options into a HTML select element.
     * The second parameter list is an object containing
     * a list of key-values pairs as text-value attributes for
     * the option.
     *
     * @param {HTMLElement} select HTML select element
     * @param {object} list Options to add to the select element
     */
    DOM.populateSelect = function(select, list) {
        var key, opt;
        if (!select || !list) return;
        for (key in list) {
            if (list.hasOwnProperty(key)) {
                opt = document.createElement('option');
                opt.value = list[key];
                opt.appendChild(document.createTextNode(key));
                select.appendChild(opt);
            }
        }
    };

    /**
     * ### DOM.removeChildrenFromNode
     *
     * Removes all children from a node.
     *
     * @param {HTMLElement} e HTML element.
     */
    DOM.removeChildrenFromNode = function(e) {
        while (e.hasChildNodes()) {
            e.removeChild(e.firstChild);
        }
    };

    /**
     * ### DOM.insertAfter
     *
     * Insert a node element after another one.
     *
     * The first parameter is the node to add.
     *
     */
    DOM.insertAfter = function(node, referenceNode) {
        referenceNode.insertBefore(node, referenceNode.nextSibling);
    };

    /**
     * ### DOM.generateUniqueId
     *
     * Generate a unique id for the page (frames included).
     *
     * TODO: now it always create big random strings, it does not actually
     * check if the string exists.
     *
     */
    DOM.generateUniqueId = function(prefix) {
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
        }


        return scanDocuments(prefix + '_' + JSUS.randomInt(0, 10000000));
        //return scanDocuments(prefix);
    };

    // ## GET/ADD

    /**
     * ### DOM.getButton
     *
     */
    DOM.getButton = function(id, text, attributes) {
        var sb;
        sb = document.createElement('button');
        if ('undefined' !== typeof id) sb.id = id;
        sb.appendChild(document.createTextNode(text || 'Send'));
        return this.addAttributes2Elem(sb, attributes);
    };

    /**
     * ### DOM.addButton
     *
     */
    DOM.addButton = function(root, id, text, attributes) {
        var b = this.getButton(id, text, attributes);
        return root.appendChild(b);
    };

    /**
     * ### DOM.getFieldset
     *
     */
    DOM.getFieldset = function(id, legend, attributes) {
        var f = this.getElement('fieldset', id, attributes);
        var l = document.createElement('Legend');
        l.appendChild(document.createTextNode(legend));
        f.appendChild(l);
        return f;
    };

    /**
     * ### DOM.addFieldset
     *
     */
    DOM.addFieldset = function(root, id, legend, attributes) {
        var f = this.getFieldset(id, legend, attributes);
        return root.appendChild(f);
    };

    /**
     * ### DOM.getTextInput
     *
     */
    DOM.getTextInput = function(id, attributes) {
        var ti =  document.createElement('input');
        if ('undefined' !== typeof id) ti.id = id;
        ti.setAttribute('type', 'text');
        return this.addAttributes2Elem(ti, attributes);
    };

    /**
     * ### DOM.addTextInput
     *
     */
    DOM.addTextInput = function(root, id, attributes) {
        var ti = this.getTextInput(id, attributes);
        return root.appendChild(ti);
    };

    /**
     * ### DOM.getTextArea
     *
     */
    DOM.getTextArea = function(id, attributes) {
        var ta =  document.createElement('textarea');
        if ('undefined' !== typeof id) ta.id = id;
        return this.addAttributes2Elem(ta, attributes);
    };

    /**
     * ### DOM.addTextArea
     *
     */
    DOM.addTextArea = function(root, id, attributes) {
        var ta = this.getTextArea(id, attributes);
        return root.appendChild(ta);
    };

    /**
     * ### DOM.getCanvas
     *
     */
    DOM.getCanvas = function(id, attributes) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        if (!context) {
            alert('Canvas is not supported');
            return false;
        }

        canvas.id = id;
        return this.addAttributes2Elem(canvas, attributes);
    };

    /**
     * ### DOM.addCanvas
     *
     */
    DOM.addCanvas = function(root, id, attributes) {
        var c = this.getCanvas(id, attributes);
        return root.appendChild(c);
    };

    /**
     * ### DOM.getSlider
     *
     */
    DOM.getSlider = function(id, attributes) {
        var slider = document.createElement('input');
        slider.id = id;
        slider.setAttribute('type', 'range');
        return this.addAttributes2Elem(slider, attributes);
    };

    /**
     * ### DOM.addSlider
     *
     */
    DOM.addSlider = function(root, id, attributes) {
        var s = this.getSlider(id, attributes);
        return root.appendChild(s);
    };

    /**
     * ### DOM.getRadioButton
     *
     */
    DOM.getRadioButton = function(id, attributes) {
        var radio = document.createElement('input');
        radio.id = id;
        radio.setAttribute('type', 'radio');
        return this.addAttributes2Elem(radio, attributes);
    };

    /**
     * ### DOM.addRadioButton
     *
     */
    DOM.addRadioButton = function(root, id, attributes) {
        var rb = this.getRadioButton(id, attributes);
        return root.appendChild(rb);
    };

    /**
     * ### DOM.getLabel
     *
     */
    DOM.getLabel = function(forElem, id, labelText, attributes) {
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

    /**
     * ### DOM.addLabel
     *
     */
    DOM.addLabel = function(root, forElem, id, labelText, attributes) {
        if (!root || !forElem || !labelText) return false;
        var l = this.getLabel(forElem, id, labelText, attributes);
        root.insertBefore(l, forElem);
        return l;
    };

    /**
     * ### DOM.getSelect
     *
     */
    DOM.getSelect = function(id, attributes) {
        return this.getElement('select', id, attributes);
    };

    /**
     * ### DOM.addSelect
     *
     */
    DOM.addSelect = function(root, id, attributes) {
        return this.addElement('select', root, id, attributes);
    };

    /**
     * ### DOM.getIFrame
     *
     */
    DOM.getIFrame = function(id, attributes) {
        attributes = attributes || {};
        if (!attributes.name) {
            attributes.name = id; // For Firefox
        }
        return this.getElement('iframe', id, attributes);
    };

    /**
     * ### DOM.addIFrame
     *
     */
    DOM.addIFrame = function(root, id, attributes) {
        var ifr = this.getIFrame(id, attributes);
        return root.appendChild(ifr);
    };

    /**
     * ### DOM.addBreak
     *
     */
    DOM.addBreak = function(root, rc) {
        var RC = rc || 'br';
        var br = document.createElement(RC);
        return root.appendChild(br);
        //return this.insertAfter(br,root);
    };

    /**
     * ### DOM.getDiv
     *
     */
    DOM.getDiv = function(id, attributes) {
        return this.getElement('div', id, attributes);
    };

    /**
     * ### DOM.addDiv
     *
     */
    DOM.addDiv = function(root, id, attributes) {
        return this.addElement('div', root, id, attributes);
    };

    // ## CSS / JS

    /**
     * ### DOM.addCSS
     *
     * If no root element is passed, it tries to add the CSS
     * link element to document.head, document.body, and
     * finally document. If it fails, returns FALSE.
     *
     */
    DOM.addCSS = function(root, css, id, attributes) {
        root = root || document.head || document.body || document;
        if (!root) return false;

        attributes = attributes || {};

        attributes = JSUS.merge(attributes, {rel : 'stylesheet',
                                             type: 'text/css',
                                             href: css
                                            });

        return this.addElement('link', root, id, attributes);
    };

    /**
     * ### DOM.addJS
     *
     */
    DOM.addJS = function(root, js, id, attributes) {
        root = root || document.head || document.body || document;
        if (!root) return false;

        attributes = attributes || {};

        attributes = JSUS.merge(attributes, {charset : 'utf-8',
                                             type: 'text/javascript',
                                             src: js
                                            });

        return this.addElement('script', root, id, attributes);
    };

    /**
     * ### DOM.highlight
     *
     * Provides a simple way to highlight an HTML element
     * by adding a colored border around it.
     *
     * Three pre-defined modes are implemented:
     *
     * - OK: green
     * - WARN: yellow
     * - ERR: red (default)
     *
     * Alternatively, it is possible to specify a custom
     * color as HEX value. Examples:
     *
     * ```javascript
     * highlight(myDiv, 'WARN'); // yellow border
     * highlight(myDiv);          // red border
     * highlight(myDiv, '#CCC'); // grey border
     * ```
     *
     * @see DOM.addBorder
     * @see DOM.style
     */
     DOM.highlight = function(elem, code) {
        var color;
        if (!elem) return;

        // default value is ERR
        switch (code) {
        case 'OK':
            color =  'green';
            break;
        case 'WARN':
            color = 'yellow';
            break;
        case 'ERR':
            color = 'red';
            break;
        default:
            if (code.charAt(0) === '#') {
                color = code;
            }
            else {
                color = 'red';
            }
        }

        return this.addBorder(elem, color);
    };

    /**
     * ### DOM.addBorder
     *
     * Adds a border around the specified element. Color,
     * width, and type can be specified.
     */
    DOM.addBorder = function(elem, color, width, type) {
        var properties;
        if (!elem) return;

        color = color || 'red';
        width = width || '5px';
        type = type || 'solid';

        properties = { border: width + ' ' + type + ' ' + color };
        return DOM.style(elem, properties);
    };

    /**
     * ### DOM.style
     *
     * Styles an element as an in-line css.
     *
     * Existing style properties are maintained, and new ones added.
     *
     * @param {HTMLElement} elem The element to style
     * @param {object} Objects containing the properties to add.
     *
     * @return {HTMLElement} The styled element
     */
    DOM.style = function(elem, properties) {
        var i;
        if (!elem || !properties) return;
        if (!DOM.isElement(elem)) return;

        for (i in properties) {
            if (properties.hasOwnProperty(i)) {
                elem.style[i] = properties[i];
            }
        }
        return elem;
    };

    /**
     * ### DOM.removeClass
     *
     * Removes a specific class from the classNamex attribute of a given element
     *
     * @param {HTMLElement} el An HTML element
     * @param {string} c The name of a CSS class already in the element
     *
     * @return {HTMLElement|undefined} The HTML element with the removed
     *   class, or undefined if the inputs are misspecified
     */
    DOM.removeClass = function(el, c) {
        var regexpr, o;
        if (!el || !c) return;
        regexpr = new RegExp('(?:^|\\s)' + c + '(?!\\S)');
        o = el.className = el.className.replace( regexpr, '' );
        return el;
    };

    /**
     * ### DOM.addClass
     *
     * Adds one or more classes to the className attribute of the given element
     *
     * Takes care not to overwrite already existing classes.
     *
     * @param {HTMLElement} el An HTML element
     * @param {string|array} c The name/s of CSS class/es
     *
     * @return {HTMLElement|undefined} The HTML element with the additional
     *   class, or undefined if the inputs are misspecified
     */
    DOM.addClass = function(el, c) {
        if (!el) return;
        if (c instanceof Array) c = c.join(' ');
        else if ('string' !== typeof c) return;
        el.className = el.className ? el.className + ' ' + c : c;
        return el;
    };

    /**
     * ### DOM.getElementsByClassName
     *
     * Returns an array of elements with requested class name
     *
     * @param {object} document The document object of a window or iframe
     * @param {string} className The requested className
     * @param {string}  nodeName Optional. If set only elements with
     *   the specified tag name will be searched
     *
     * @return {array} Array of elements with the requested class name
     *
     * @see https://gist.github.com/E01T/6088383
     * @see http://stackoverflow.com/
     *      questions/8808921/selecting-a-css-class-with-xpath
     */
    DOM.getElementsByClassName = function(document, className, nodeName) {
        var result, node, tag, seek, i, rightClass;
        result = [];
        tag = nodeName || '*';
        if (document.evaluate) {
            seek = '//' + tag +
                '[contains(concat(" ", normalize-space(@class), " "), "' +
                className + ' ")]';
            seek = document.evaluate(seek, document, null, 0, null );
            while ((node = seek.iterateNext())) {
                result.push(node);
            }
        }
        else {
            rightClass = new RegExp( '(^| )'+ className +'( |$)' );
            seek = document.getElementsByTagName(tag);
            for (i = 0; i < seek.length; i++)
                if (rightClass.test((node = seek[i]).className )) {
                    result.push(seek[i]);
                }
        }
        return result;
    };

    // ## IFRAME

    /**
     * ### DOM.getIFrameDocument
     *
     * Returns a reference to the document of an iframe object
     *
     * @param {HTMLIFrameElement} iframe The iframe object
     *
     * @return {HTMLDocument|null} The document of the iframe, or
     *   null if not found.
     */
    DOM.getIFrameDocument = function(iframe) {
        if (!iframe) return null;
        return iframe.contentDocument ||
            iframe.contentWindow ? iframe.contentWindow.document : null;
    };

    /**
     * ### DOM.getIFrameAnyChild
     *
     * Gets the first available child of an IFrame
     *
     * Tries head, body, lastChild and the HTML element
     *
     * @param {HTMLIFrameElement} iframe The iframe object
     *
     * @return {HTMLElement|undefined} The child, or undefined if none is found
     */
    DOM.getIFrameAnyChild = function(iframe) {
        var contentDocument;
        if (!iframe) return;
        contentDocument = W.getIFrameDocument(iframe);
        return contentDocument.head || contentDocument.body ||
            contentDocument.lastChild ||
            contentDocument.getElementsByTagName('html')[0];
    };

    // ## RIGHT-CLICK

    /**
     * ### DOM.disableRightClick
     *
     * Disables the popup of the context menu by right clicking with the mouse
     *
     * @param {Document} Optional. A target document object. Defaults, document
     *
     * @see DOM.enableRightClick
     */
    DOM.disableRightClick = function(doc) {
        doc = doc || document;
        if (doc.layers) {
            doc.captureEvents(Event.MOUSEDOWN);
            doc.onmousedown = function clickNS4(e) {
                if (doc.layers || doc.getElementById && !doc.all) {
                    if (e.which == 2 || e.which == 3) {
                        return false;
                    }
                }
            };
        }
        else if (doc.all && !doc.getElementById) {
            doc.onmousedown = function clickIE4() {
                if (event.button == 2) {
                    return false;
                }
            };
        }
        doc.oncontextmenu = new Function("return false");
    };

    /**
     * ### DOM.enableRightClick
     *
     * Enables the popup of the context menu by right clicking with the mouse
     *
     * It unregisters the event handlers created by `DOM.disableRightClick`
     *
     * @param {Document} Optional. A target document object. Defaults, document
     *
     * @see DOM.disableRightClick
     */
    DOM.enableRightClick = function(doc) {
        doc = doc || document;
        if (doc.layers) {
            doc.releaseEvents(Event.MOUSEDOWN);
            doc.onmousedown = null;
        }
        else if (doc.all && !doc.getElementById) {
            doc.onmousedown = null;
        }
        doc.oncontextmenu = null;
    };

    /**
     * ### DOM.addEvent
     *
     * Adds an event listener to an element (cross-browser)
     *
     * @param {Element} element A target element
     * @param {string} event The name of the event to handle
     * @param {function} func The event listener
     * @param {boolean} Optional. If TRUE, the event will initiate a capture.
     *   Available only in some browsers. Default, FALSE
     *
     * @return {boolean} TRUE, on success. However, the return value is
     *   browser dependent.
     *
     * @see DOM.removeEvent
     *
     * Kudos:
     * http://stackoverflow.com/questions/6348494/addeventlistener-vs-onclick
     */
    DOM.addEvent = function(element, event, func, capture) {
        capture = !!capture;
        if (element.attachEvent) return element.attachEvent('on' + event, func);
        else return element.addEventListener(event, func, capture);
    };

    /**
     * ### DOM.removeEvent
     *
     * Removes an event listener from an element (cross-browser)
     *
     * @param {Element} element A target element
     * @param {string} event The name of the event to remove
     * @param {function} func The event listener
     * @param {boolean} Optional. If TRUE, the event was registered
     *   as a capture. Available only in some browsers. Default, FALSE
     *
     * @return {boolean} TRUE, on success. However, the return value is
     *   browser dependent.
     *
     * @see DOM.addEvent
     */
    DOM.removeEvent = function(element, event, func, capture) {
        capture = !!capture;
        if (element.detachEvent) return element.detachEvent('on' + event, func);
        else return element.removeEventListener(event, func, capture);
    };

    /**
     * ### DOM.playSound
     *
     * Plays a sound
     *
     * @param {various} sound Audio tag or path to audio file to be played
     */
    DOM.playSound = function(sound) {
        var audio;
        if ("string" === typeof(sound)) {
            audio = new Audio(sound);
        }
        else if ("object" === typeof(sound)
            && "function" === typeof(sound.play)) {
            audio = sound;
        }
        else {
            throw new TypeError("JSUS.playSound: sound must be string" +
               " or audio element.");
        }
        audio.play();
    };

    /**
     * ### DOM.onFocusIn
     *
     * Registers a callback to be executed when the page acquires focus
     *
     * @param {function} cb Executed if page acquires focus
     * @param {object|function} ctx Optional. Context of execution for cb
     *
     * @see onFocusChange
     */
    DOM.onFocusIn = function(cb, ctx) {
        var origCb;
        if ('function' !== typeof cb && null !== cb) {
            throw new TypeError('JSUS.onFocusIn: cb must be function or null.');
        }
        if (ctx) {
            if ('object' !== typeof ctx && 'function' !== typeof ctx) {
                throw new TypeError('JSUS.onFocusIn: ctx must be object, ' +
                                    'function or undefined.');
            }
            origCb = cb;
            cb = function() { origCb.call(ctx); };
        }

        onFocusChange(cb);
    };

    /**
     * ### DOM.onFocusOut
     *
     * Registers a callback to be executed when the page loses focus
     *
     * @param {function} cb Executed if page loses focus
     * @param {object|function} ctx Optional. Context of execution for cb
     *
     * @see onFocusChange
     */
    DOM.onFocusOut = function(cb, ctx) {
        var origCb;
        if ('function' !== typeof cb && null !== cb) {
            throw new TypeError('JSUS.onFocusOut: cb must be ' +
                                'function or null.');
        }
        if (ctx) {
            if ('object' !== typeof ctx && 'function' !== typeof ctx) {
                throw new TypeError('JSUS.onFocusIn: ctx must be object, ' +
                                    'function or undefined.');
            }
            origCb = cb;
            cb = function() { origCb.call(ctx); };
        }
        onFocusChange(undefined, cb);
    };

    /**
     * ### DOM.changeTitle
     *
     * Changes title of page
     *
     * @param {string} title New title of the page
     */
    DOM.changeTitle = function(title) {
        if ("string" === typeof(title)) {
            document.title = title;
        }
        else {
            throw new TypeError("JSUS.changeTitle: title must be string.");
        }
    };

    /**
     * ### DOM.blinkTitle
     *
     * Alternates between two titles
     *
     * Calling the function a second time clears the current
     * blinking. If called without arguments the current title
     * blinking is cleared.
     *
     * @param {string} title New title to blink
     * @param {string} alternateTitle Title to alternate
     */
    DOM.blinkTitle = function(id) {
        return function(title, alternateTitle, options) {
            var frequency;

            options = options || {};
            frequency = options.frequency || 2000;

            if (options.stopOnFocus) {
                window.onfocus = function() {
                    JSUS.blinkTitle()
                };
            }
            if (options.startOnBlur) {
                options.startOnBlur = null;
                window.onblur = function() {
                    JSUS.blinkTitle(title, alternateTitle, options);
                }
                return;
            }
            if (!alternateTitle) {
                alternateTitle = '!!!';
            }
            if (null !== id) {
                clearInterval(id);
                id = null;
            }
            if ('undefined' !== typeof title) {
                JSUS.changeTitle(title);
                id = setInterval(function() {
                    JSUS.changeTitle(alternateTitle);
                    setTimeout(function() {
                        JSUS.changeTitle(title);
                    },frequency/2);
                },frequency);
            }
        };
    }(null);


    // ## Helper methods

    /**
     * ### onFocusChange
     *
     * Helper function for DOM.onFocusIn and DOM.onFocusOut (cross-browser)
     *
     * Expects only one callback, either inCb, or outCb.
     *
     * @param {function} inCb Optional. Executed if page acquires focus
     * @param {function} outCb Optional. Executed if page loses focus
     *
     * Kudos: http://stackoverflow.com/questions/1060008/
     *   is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active
     *
     * @see http://www.w3.org/TR/page-visibility/
     */
    onFocusChange = (function(document) {
        var inFocusCb, outFocusCb, event, hidden, evtMap;

        if (!document) {
            return function() {
                JSUS.log('onFocusChange: no document detected.');
                return;
            };
        }

        if ('hidden' in document) {
            hidden = 'hidden';
            event = 'visibilitychange';
        }
        else if ('mozHidden' in document) {
            hidden = 'mozHidden';
            event = 'mozvisibilitychange';
        }
        else if ('webkitHidden' in document) {
            hidden = 'webkitHidden';
            event = 'webkitvisibilitychange';
        }
        else if ('msHidden' in document) {
            hidden = 'msHidden';
            event = 'msvisibilitychange';
        }

        evtMap = {
            focus: true, focusin: true, pageshow: true,
            blur: false, focusout: false, pagehide: false
        };

        function onchange(evt) {
            var isHidden;
            evt = evt || window.event;
            // If event is defined as one from event Map.
            if (evt.type in evtMap) isHidden = evtMap[evt.type];
            // Or use the hidden property.
            else isHidden = this[hidden] ? true : false;
            // Call the callback, if defined.
            if (!isHidden) { if (inFocusCb) inFocusCb(); }
            else { if (outFocusCb) outFocusCb(); }
        }

        return function(inCb, outCb) {
            var onchangeCb;

            if ('undefined' !== typeof inCb) inFocusCb = inCb;
            else outFocusCb = outCb;

            onchangeCb = !inFocusCb && !outFocusCb ? null : onchange;

            // Visibility standard detected.
            if (event) {
                // Remove any pre-existing listeners.
                document.removeEventListener(event);
                if (onchangeCb) document.addEventListener(event, onchangeCb);

            }
            else if ('onfocusin' in document) {
                document.onfocusin = document.onfocusout = onchangeCb;
            }
            // All others.
            else {
                window.onpageshow = window.onpagehide
                    = window.onfocus = window.onblur = onchangeCb;
            }
        };
    })('undefined' !== typeof document ? document : null);

    JSUS.extend(DOM);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # EVAL
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Evaluation of strings as JavaScript commands
 */
(function(JSUS) {

    "use strict";

    function EVAL() {}

    /**
     * ## EVAL.eval
     *
     * Cross-browser eval function with context.
     *
     * If no context is passed a reference, `this` is used.
     *
     * In old IEs it will use _window.execScript_ instead.
     *
     * @param {string} str The command to executes
     * @param {object} context Optional. Execution context. Defaults, `this`
     *
     * @return {mixed} The return value of the executed commands
     *
     * @see eval
     * @see execScript
     * @see JSON.parse
     */
    EVAL.eval = function(str, context) {
        var func;
        if (!str) return;
        context = context || this;
        // Eval must be called indirectly
        // i.e. eval.call is not possible
        func = function(str) {
            // TODO: Filter str.
            str = '(' + str + ')';
            if ('undefined' !== typeof window && window.execScript) {
                // Notice: execScript doesn’t return anything.
                window.execScript('__my_eval__ = ' + str);
                return __my_eval__;
            }
            else {
                return eval(str);
            }
        };
        return func.call(context, str);
    };

    JSUS.extend(EVAL);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # OBJ
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions to manipulate JavaScript objects
 */
(function(JSUS) {

    "use strict";

    function OBJ() {}

    var compatibility = null;

    if ('undefined' !== typeof JSUS.compatibility) {
        compatibility = JSUS.compatibility();
    }

    /**
     * ## OBJ.createObj
     *
     * Polyfill for Object.create (when missing)
     */
    OBJ.createObj = (function() {
        // From MDN Object.create (Polyfill)
        if (typeof Object.create !== 'function') {
            // Production steps of ECMA-262, Edition 5, 15.2.3.5
            // Reference: http://es5.github.io/#x15.2.3.5
            return (function() {
                // To save on memory, use a shared constructor
                function Temp() {}

                // make a safe reference to Object.prototype.hasOwnProperty
                var hasOwn = Object.prototype.hasOwnProperty;

                return function(O) {
                    // 1. If Type(O) is not Object or Null
                    if (typeof O != 'object') {
                        throw new TypeError('Object prototype may only ' +
                                            'be an Object or null');
                    }

                    // 2. Let obj be the result of creating a new object as if
                    //    by the expression new Object() where Object is the
                    //    standard built-in constructor with that name
                    // 3. Set the [[Prototype]] internal property of obj to O.
                    Temp.prototype = O;
                    var obj = new Temp();
                    Temp.prototype = null;

                    // 4. If the argument Properties is present and not
                    //    undefined, add own properties to obj as if by calling
                    //    the standard built-in function Object.defineProperties
                    //    with arguments obj and Properties.
                    if (arguments.length > 1) {
                        // Object.defineProperties does ToObject on
                        // its first argument.
                        var Properties = new Object(arguments[1]);
                        for (var prop in Properties) {
                            if (hasOwn.call(Properties, prop)) {
                                obj[prop] = Properties[prop];
                            }
                        }
                    }

                    // 5. Return obj
                    return obj;
                };
            })();
        }
        return Object.create;
    })();

    /**
     * ## OBJ.equals
     *
     * Checks for deep equality between two objects, strings or primitive types
     *
     * All nested properties are checked, and if they differ in at least
     * one returns FALSE, otherwise TRUE.
     *
     * Takes care of comparing the following special cases:
     *
     * - undefined
     * - null
     * - NaN
     * - Infinity
     * - {}
     * - falsy values
     *
     * @param {object} o1 The first object
     * @param {object} o2 The second object
     *
     * @return {boolean} TRUE if the objects are deeply equal
     */
    OBJ.equals = function(o1, o2) {
        var type1, type2, primitives, p;
        type1 = typeof o1;
        type2 = typeof o2;

        if (type1 !== type2) return false;

        if ('undefined' === type1 || 'undefined' === type2) {
            return (o1 === o2);
        }
        if (o1 === null || o2 === null) {
            return (o1 === o2);
        }
        if (('number' === type1 && isNaN(o1)) &&
            ('number' === type2 && isNaN(o2))) {
            return (isNaN(o1) && isNaN(o2));
        }

        // Check whether arguments are not objects
        primitives = {number: '', string: '', boolean: ''};
        if (type1 in primitives) {
            return o1 === o2;
        }

        if ('function' === type1) {
            return o1.toString() === o2.toString();
        }

        for (p in o1) {
            if (o1.hasOwnProperty(p)) {

                if ('undefined' === typeof o2[p] &&
                    'undefined' !== typeof o1[p]) return false;

                if (!o2[p] && o1[p]) return false;

                if ('function' === typeof o1[p]) {
                    if (o1[p].toString() !== o2[p].toString()) return false;
                }
                else
                    if (!OBJ.equals(o1[p], o2[p])) return false;
            }
        }

        // Check whether o2 has extra properties
        // TODO: improve, some properties have already been checked!
        for (p in o2) {
            if (o2.hasOwnProperty(p)) {
                if ('undefined' === typeof o1[p] &&
                    'undefined' !== typeof o2[p]) return false;

                if (!o1[p] && o2[p]) return false;
            }
        }

        return true;
    };

    /**
     * ## OBJ.isEmpty
     *
     * Returns TRUE if an object has no own properties
     *
     * Does not check properties of the prototype chain.
     *
     * @param {object} o The object to check
     *
     * @return {boolean} TRUE, if the object has no properties
     */
    OBJ.isEmpty = function(o) {
        var key;
        if ('undefined' === typeof o) return true;
        for (key in o) {
            if (o.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    };

    /**
     * ## OBJ.size
     *
     * Counts the number of own properties of an object.
     *
     * Prototype chain properties are excluded.
     *
     * @param {object} obj The object to check
     *
     * @return {number} The number of properties in the object
     */
    OBJ.size = OBJ.getListSize = function(obj) {
        var n, key;
        if (!obj) return 0;
        if ('number' === typeof obj) return 0;
        if ('string' === typeof obj) return 0;

        n = 0;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                n++;
            }
        }
        return n;
    };

    /**
     * ## OBJ._obj2Array
     *
     * Explodes an object into an array of keys and values,
     * according to the specified parameters.
     *
     * A fixed level of recursion can be set.
     *
     * @api private
     * @param {object} obj The object to convert in array
     * @param {boolean} keyed TRUE, if also property names should be included.
     *   Defaults, FALSE
     * @param {number} level Optional. The level of recursion.
     *   Defaults, undefined
     *
     * @return {array} The converted object
     */
    OBJ._obj2Array = function(obj, keyed, level, cur_level) {
        var result, key;
        if ('object' !== typeof obj) return [obj];

        if (level) {
            cur_level = ('undefined' !== typeof cur_level) ? cur_level : 1;
            if (cur_level > level) return [obj];
            cur_level = cur_level + 1;
        }

        result = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (keyed) result.push(key);
                if ('object' === typeof obj[key]) {
                    result = result.concat(OBJ._obj2Array(obj[key], keyed,
                                                          level, cur_level));
                }
                else {
                    result.push(obj[key]);
                }
            }
        }
        return result;
    };

    /**
     * ## OBJ.obj2Array
     *
     * Converts an object into an array, keys are lost
     *
     * Recursively put the values of the properties of an object into
     * an array and returns it.
     *
     * The level of recursion can be set with the parameter level.
     * By default recursion has no limit, i.e. that the whole object
     * gets totally unfolded into an array.
     *
     * @param {object} obj The object to convert in array
     * @param {number} level Optional. The level of recursion. Defaults,
     *   undefined
     *
     * @return {array} The converted object
     *
     * @see OBJ._obj2Array
     * @see OBJ.obj2KeyedArray
     */
    OBJ.obj2Array = function(obj, level) {
        return OBJ._obj2Array(obj, false, level);
    };

    /**
     * ## OBJ.obj2KeyedArray
     *
     * Converts an object into array, keys are preserved
     *
     * Creates an array containing all keys and values of an object and
     * returns it.
     *
     * @param {object} obj The object to convert in array
     * @param {number} level Optional. The level of recursion. Defaults,
     *   undefined
     *
     * @return {array} The converted object
     *
     * @see OBJ.obj2Array
     */
    OBJ.obj2KeyedArray = OBJ.obj2KeyArray = function(obj, level) {
        return OBJ._obj2Array(obj, true, level);
    };

    /**
     * ## OBJ.obj2QueryString
     *
     * Creates a querystring with the key-value pairs of the given object.
     *
     * @param {object} obj The object to convert
     *
     * @return {string} The created querystring
     *
     * Kudos:
     * @see http://stackoverflow.com/a/1714899/3347292
     */
    OBJ.obj2QueryString = function(obj) {
        var str;
        var key;

        if ('object' !== typeof obj) {
            throw new TypeError(
                    'JSUS.objectToQueryString: obj must be object.');
        }

        str = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key) + '=' +
                         encodeURIComponent(obj[key]));
            }
        }

        return '?' + str.join('&');
    };

    /**
     * ## OBJ.keys
     *
     * Scans an object an returns all the keys of the properties,
     * into an array.
     *
     * The second paramter controls the level of nested objects
     * to be evaluated. Defaults 0 (nested properties are skipped).
     *
     * @param {object} obj The object from which extract the keys
     * @param {number} level Optional. The level of recursion. Defaults 0
     *
     * @return {array} The array containing the extracted keys
     *
     * @see Object.keys
     */
    OBJ.keys = OBJ.objGetAllKeys = function(obj, level, curLevel) {
        var result, key;
        if (!obj) return [];
        level = 'number' === typeof level && level >= 0 ? level : 0;
        curLevel = 'number' === typeof curLevel && curLevel >= 0 ? curLevel : 0;
        result = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                result.push(key);
                if (curLevel < level) {
                    if ('object' === typeof obj[key]) {
                        result = result.concat(OBJ.objGetAllKeys(obj[key],
                                                                 (curLevel+1)));
                    }
                }
            }
        }
        return result;
    };

    /**
     * ## OBJ.implode
     *
     * Separates each property into a new object and returns them into an array
     *
     * E.g.
     *
     * ```javascript
     * var a = { b:2, c: {a:1}, e:5 };
     * OBJ.implode(a); // [{b:2}, {c:{a:1}}, {e:5}]
     * ```
     *
     * @param {object} obj The object to implode
     *
     * @return {array} The array containing all the imploded properties
     */
    OBJ.implode = OBJ.implodeObj = function(obj) {
        var result, key, o;
        if (!obj) return [];
        result = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                o = {};
                o[key] = obj[key];
                result.push(o);
            }
        }
        return result;
    };

    /**
     * ## OBJ.clone
     *
     * Creates a perfect copy of the object passed as parameter
     *
     * Recursively scans all the properties of the object to clone.
     * Properties of the prototype chain are copied as well.
     *
     * Primitive types and special values are returned as they are.
     *
     * @param {object} obj The object to clone
     *
     * @return {object} The clone of the object
     */
    OBJ.clone = function(obj) {
        var clone, i, value;
        if (!obj) return obj;
        if ('number' === typeof obj) return obj;
        if ('string' === typeof obj) return obj;
        if ('boolean' === typeof obj) return obj;
        // NaN and +-Infinity are numbers, so no check is necessary.

        if ('function' === typeof obj) {
            clone = function() {
                var len, args;
                len = arguments.length;
                if (!len) return obj.call(clone);
                else if (len === 1) return obj.call(clone, arguments[0]);
                else if (len === 2) {
                    return obj.call(clone, arguments[0], arguments[1]);
                }
                else {
                    args = new Array(len);
                    for (i = 0; i < len; i++) {
                        args[i] = arguments[i];
                    }
                    return obj.apply(clone, args);
                }
            };
        }
        else {
            clone = Object.prototype.toString.call(obj) === '[object Array]' ?
                [] : {};
        }
        for (i in obj) {
            // It is not NULL and it is an object.
            // Even if it is an array we need to use CLONE,
            // because `slice()` does not clone arrays of objects.
            if (obj[i] && 'object' === typeof obj[i]) {
                value = OBJ.clone(obj[i]);
            }
            else {
                value = obj[i];
            }

            if (obj.hasOwnProperty(i)) {
                clone[i] = value;
            }
            else {
                // We know if object.defineProperty is available.
                if (compatibility && compatibility.defineProperty) {
                    Object.defineProperty(clone, i, {
                        value: value,
                        writable: true,
                        configurable: true
                    });
                }
                else {
                    setProp(clone, i, value);
                }
            }
        }
        return clone;
    };

    function setProp(clone, i, value) {
        try {
            Object.defineProperty(clone, i, {
                value: value,
                writable: true,
                configurable: true
            });
        }
        catch(e) {
            clone[i] = value;
        }
    }


    /**
     * ## OBJ.classClone
     *
     * Creates a copy (keeping class) of the object passed as parameter
     *
     * Recursively scans all the properties of the object to clone.
     * The clone is an instance of the type of obj.
     *
     * @param {object} obj The object to clone
     * @param {Number} depth how deep the copy should be
     *
     * @return {object} The clone of the object
     */
    OBJ.classClone = function(obj, depth) {
        var clone, i;
        if (depth === 0) {
            return obj;
        }

        if (obj && 'object' === typeof obj) {
            clone = Object.prototype.toString.call(obj) === '[object Array]' ?
                [] : JSUS.createObj(obj.constructor.prototype);

            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (obj[i] && 'object' === typeof obj[i]) {
                        clone[i] = JSUS.classClone(obj[i], depth - 1);
                    }
                    else {
                        clone[i] = obj[i];
                    }
                }
            }
            return clone;
        }
        else {
            return JSUS.clone(obj);
        }
    };

    /**
     * ## OBJ.join
     *
     * Performs a *left* join on the keys of two objects
     *
     * Creates a copy of obj1, and in case keys overlap
     * between obj1 and obj2, the values from obj2 are taken.
     *
     * Returns a new object, the original ones are not modified.
     *
     * E.g.
     *
     * ```javascript
     * var a = { b:2, c:3, e:5 };
     * var b = { a:10, b:2, c:100, d:4 };
     * OBJ.join(a, b); // { b:2, c:100, e:5 }
     * ```
     *
     * @param {object} obj1 The object where the merge will take place
     * @param {object} obj2 The merging object
     *
     * @return {object} The joined object
     *
     * @see OBJ.merge
     */
    OBJ.join = function(obj1, obj2) {
        var clone, i;
        clone = OBJ.clone(obj1);
        if (!obj2) return clone;
        for (i in clone) {
            if (clone.hasOwnProperty(i)) {
                if ('undefined' !== typeof obj2[i]) {
                    if ('object' === typeof obj2[i]) {
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
     * ## OBJ.merge
     *
     * Merges two objects in one
     *
     * In case keys overlap the values from obj2 are taken.
     *
     * Only own properties are copied.
     *
     * Returns a new object, the original ones are not modified.
     *
     * E.g.
     *
     * ```javascript
     * var a = { a:1, b:2, c:3 };
     * var b = { a:10, b:2, c:100, d:4 };
     * OBJ.merge(a, b); // { a: 10, b: 2, c: 100, d: 4 }
     * ```
     *
     * @param {object} obj1 The object where the merge will take place
     * @param {object} obj2 The merging object
     *
     * @return {object} The merged object
     *
     * @see OBJ.join
     * @see OBJ.mergeOnKey
     */
    OBJ.merge = function(obj1, obj2) {
        var clone, i;
        // Checking before starting the algorithm
        if (!obj1 && !obj2) return false;
        if (!obj1) return OBJ.clone(obj2);
        if (!obj2) return OBJ.clone(obj1);

        clone = OBJ.clone(obj1);
        for (i in obj2) {

            if (obj2.hasOwnProperty(i)) {
                // it is an object and it is not NULL
                if (obj2[i] && 'object' === typeof obj2[i]) {
                    // If we are merging an object into
                    // a non-object, we need to cast the
                    // type of obj1
                    if ('object' !== typeof clone[i]) {
                        if (Object.prototype.toString.call(obj2[i]) ===
                            '[object Array]') {

                            clone[i] = [];
                        }
                        else {
                            clone[i] = {};
                        }
                    }
                    clone[i] = OBJ.merge(clone[i], obj2[i]);
                }
                else {
                    clone[i] = obj2[i];
                }
            }
        }
        return clone;
    };

    /**
     * ## OBJ.mixin
     *
     * Adds all the properties of obj2 into obj1
     *
     * Original object is modified.
     *
     * @param {object} obj1 The object to which the new properties will be added
     * @param {object} obj2 The mixin-in object
     */
    OBJ.mixin = function(obj1, obj2) {
        var i;
        if (!obj1 && !obj2) return;
        if (!obj1) return obj2;
        if (!obj2) return obj1;
        for (i in obj2) {
            obj1[i] = obj2[i];
        }
    };

    /**
     * ## OBJ.mixout
     *
     * Copies only non-overlapping properties from obj2 to obj1
     *
     * Check only if a property is defined, not its value.
     * Original object is modified.
     *
     * @param {object} obj1 The object to which the new properties will be added
     * @param {object} obj2 The mixin-in object
     */
    OBJ.mixout = function(obj1, obj2) {
        var i;
        if (!obj1 && !obj2) return;
        if (!obj1) return obj2;
        if (!obj2) return obj1;
        for (i in obj2) {
            if ('undefined' === typeof obj1[i]) obj1[i] = obj2[i];
        }
    };

    /**
     * ## OBJ.mixcommon
     *
     * Copies only overlapping properties from obj2 to obj1
     *
     * Check only if a property is defined, not its value.
     * Original object is modified.
     *
     * @param {object} obj1 The object to which the new properties will be added
     * @param {object} obj2 The mixin-in object
     */
    OBJ.mixcommon = function(obj1, obj2) {
        var i;
        if (!obj1 && !obj2) return;
        if (!obj1) return obj2;
        if (!obj2) return obj1;
        for (i in obj2) {
            if ('undefined' !== typeof obj1[i]) obj1[i] = obj2[i];
        }
    };

    /**
     * ## OBJ.mergeOnKey
     *
     * Merges the properties of obj2 into a new property named 'key' in obj1.
     *
     * Returns a new object, the original ones are not modified.
     *
     * This method is useful when we want to merge into a larger
     * configuration (e.g. with properties min, max, value) object, another one
     * that contains just a subset of properties (e.g. value).
     *
     * @param {object} obj1 The object where the merge will take place
     * @param {object} obj2 The merging object
     * @param {string} key The name of property under which the second object
     *   will be merged
     *
     * @return {object} The merged object
     *
     * @see OBJ.merge
     */
    OBJ.mergeOnKey = function(obj1, obj2, key) {
        var clone, i;
        clone = OBJ.clone(obj1);
        if (!obj2 || !key) return clone;
        for (i in obj2) {
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
     * ## OBJ.subobj
     *
     * Creates a copy of an object containing only the properties
     * passed as second parameter
     *
     * The parameter select can be an array of strings, or the name
     * of a property.
     *
     * Use '.' (dot) to point to a nested property, however if a property
     * with a '.' in the name is found, it will be used first.
     *
     * @param {object} o The object to dissect
     * @param {string|array} select The selection of properties to extract
     *
     * @return {object} The subobject with the properties from the parent
     *
     * @see OBJ.getNestedValue
     */
    OBJ.subobj = function(o, select) {
        var out, i, key;
        if (!o) return false;
        out = {};
        if (!select) return out;
        if (!(select instanceof Array)) select = [select];
        for (i=0; i < select.length; i++) {
            key = select[i];
            if (o.hasOwnProperty(key)) {
                out[key] = o[key];
            }
            else if (OBJ.hasOwnNestedProperty(key, o)) {
                OBJ.setNestedValue(key, OBJ.getNestedValue(key, o), out);
            }
        }
        return out;
    };

    /**
     * ## OBJ.skim
     *
     * Creates a copy of an object with some of the properties removed
     *
     * The parameter `remove` can be an array of strings, or the name
     * of a property.
     *
     * Use '.' (dot) to point to a nested property, however if a property
     * with a '.' in the name is found, it will be deleted first.
     *
     * @param {object} o The object to dissect
     * @param {string|array} remove The selection of properties to remove
     *
     * @return {object} The subobject with the properties from the parent
     *
     * @see OBJ.getNestedValue
     */
    OBJ.skim = function(o, remove) {
        var out, i;
        if (!o) return false;
        out = OBJ.clone(o);
        if (!remove) return out;
        if (!(remove instanceof Array)) remove = [remove];
        for (i = 0; i < remove.length; i++) {
            if (out.hasOwnProperty(i)) {
                delete out[i];
            }
            else {
                OBJ.deleteNestedKey(remove[i], out);
            }
        }
        return out;
    };


    /**
     * ## OBJ.setNestedValue
     *
     * Sets the value of a nested property of an object and returns it.
     *
     * If the object is not passed a new one is created.
     * If the nested property is not existing, a new one is created.
     *
     * Use '.' (dot) to point to a nested property.
     *
     * The original object is modified.
     *
     * @param {string} str The path to the value
     * @param {mixed} value The value to set
     *
     * @return {object|boolean} The modified object, or FALSE if error
     *   occurrs
     *
     * @see OBJ.getNestedValue
     * @see OBJ.deleteNestedKey
     */
    OBJ.setNestedValue = function(str, value, obj) {
        var keys, k;
        if (!str) {
            JSUS.log('Cannot set value of undefined property', 'ERR');
            return false;
        }
        obj = ('object' === typeof obj) ? obj : {};
        keys = str.split('.');
        if (keys.length === 1) {
            obj[str] = value;
            return obj;
        }
        k = keys.shift();
        obj[k] = OBJ.setNestedValue(keys.join('.'), value, obj[k]);
        return obj;
    };

    /**
     * ## OBJ.getNestedValue
     *
     * Returns the value of a property of an object, as defined
     * by a path string.
     *
     * Use '.' (dot) to point to a nested property.
     *
     * Returns undefined if the nested property does not exist.
     *
     * E.g.
     *
     * ```javascript
     * var o = { a:1, b:{a:2} };
     * OBJ.getNestedValue('b.a', o); // 2
     * ```
     *
     * @param {string} str The path to the value
     * @param {object} obj The object from which extract the value
     *
     * @return {mixed} The extracted value
     *
     * @see OBJ.setNestedValue
     * @see OBJ.deleteNestedKey
     */
    OBJ.getNestedValue = function(str, obj) {
        var keys, k;
        if (!obj) return;
        keys = str.split('.');
        if (keys.length === 1) {
            return obj[str];
        }
        k = keys.shift();
        return OBJ.getNestedValue(keys.join('.'), obj[k]);
    };

    /**
     * ## OBJ.deleteNestedKey
     *
     * Deletes a property from an object, as defined by a path string
     *
     * Use '.' (dot) to point to a nested property.
     *
     * The original object is modified.
     *
     * E.g.
     *
     * ```javascript
     * var o = { a:1, b:{a:2} };
     * OBJ.deleteNestedKey('b.a', o); // { a:1, b: {} }
     * ```
     *
     * @param {string} str The path string
     * @param {object} obj The object from which deleting a property
     * @param {boolean} TRUE, if the property was existing, and then deleted
     *
     * @see OBJ.setNestedValue
     * @see OBJ.getNestedValue
     */
    OBJ.deleteNestedKey = function(str, obj) {
        var keys, k;
        if (!obj) return;
        keys = str.split('.');
        if (keys.length === 1) {
            delete obj[str];
            return true;
        }
        k = keys.shift();
        if ('undefined' === typeof obj[k]) {
            return false;
        }
        return OBJ.deleteNestedKey(keys.join('.'), obj[k]);
    };

    /**
     * ## OBJ.hasOwnNestedProperty
     *
     * Returns TRUE if a (nested) property exists
     *
     * Use '.' to specify a nested property.
     *
     * E.g.
     *
     * ```javascript
     * var o = { a:1, b:{a:2} };
     * OBJ.hasOwnNestedProperty('b.a', o); // TRUE
     * ```
     *
     * @param {string} str The path of the (nested) property
     * @param {object} obj The object to test
     *
     * @return {boolean} TRUE, if the (nested) property exists
     */
    OBJ.hasOwnNestedProperty = function(str, obj) {
        var keys, k;
        if (!obj) return false;
        keys = str.split('.');
        if (keys.length === 1) {
            return obj.hasOwnProperty(str);
        }
        k = keys.shift();
        return OBJ.hasOwnNestedProperty(keys.join('.'), obj[k]);
    };


    /**
     * ## OBJ.split
     *
     * Splits an object along a specified dimension, and returns
     * all the copies in an array.
     *
     * It creates as many new objects as the number of properties
     * contained in the specified dimension. The object are identical,
     * but for the given dimension, which was split. E.g.
     *
     * ```javascript
     *  var o = { a: 1,
     *            b: {c: 2,
     *                d: 3
     *            },
     *            e: 4
     *  };
     *
     *  o = OBJ.split(o, 'b');
     *
     *  // o becomes:
     *
     *  [{ a: 1,
     *     b: {c: 2},
     *     e: 4
     *  },
     *  { a: 1,
     *    b: {d: 3},
     *    e: 4
     *  }];
     * ```
     *
     * @param {object} o The object to split
     * @param {sting} key The name of the property to split
     *
     * @return {object} A copy of the object with split values
     */
    OBJ.split = function(o, key) {
        var out, model, splitValue;
        if (!o) return;
        if (!key || 'object' !== typeof o[key]) {
            return JSUS.clone(o);
        }

        out = [];
        model = JSUS.clone(o);
        model[key] = {};

        splitValue = function(value) {
            var i, copy;
            for (i in value) {
                copy = JSUS.clone(model);
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
     * ## OBJ.melt
     *
     * Creates a new object with the specified combination of
     * properties - values
     *
     * The values are assigned cyclically to the properties, so that
     * they do not need to have the same length. E.g.
     *
     * ```javascript
     *  J.createObj(['a','b','c'], [1,2]); // { a: 1, b: 2, c: 1 }
     * ```
     * @param {array} keys The names of the keys to add to the object
     * @param {array} values The values to associate to the keys
     *
     * @return {object} A new object with keys and values melted together
     */
    OBJ.melt = function(keys, values) {
        var o = {}, valen = values.length;
        for (var i = 0; i < keys.length; i++) {
            o[keys[i]] = values[i % valen];
        }
        return o;
    };

    /**
     * ## OBJ.uniqueKey
     *
     * Creates a random unique key name for a collection
     *
     * User can specify a tentative unique key name, and if already
     * existing an incremental index will be added as suffix to it.
     *
     * Notice: the method does not actually create the key
     * in the object, but it just returns the name.
     *
     * @param {object} obj The collection for which a unique key will be created
     * @param {string} prefixName Optional. A tentative key name. Defaults,
     *   a 15-digit random number
     * @param {number} stop Optional. The number of tries before giving up
     *   searching for a unique key name. Defaults, 1000000.
     *
     * @return {string|undefined} The unique key name, or undefined if it was
     *   not found
     */
    OBJ.uniqueKey = function(obj, prefixName, stop) {
        var name;
        var duplicateCounter = 1;
        if (!obj) {
            JSUS.log('Cannot find unique name in undefined object', 'ERR');
            return;
        }
        prefixName = '' + (prefixName ||
                           Math.floor(Math.random()*1000000000000000));
        stop = stop || 1000000;
        name = prefixName;
        while (obj[name]) {
            name = prefixName + duplicateCounter;
            duplicateCounter++;
            if (duplicateCounter > stop) {
                return;
            }
        }
        return name;
    };

    /**
     * ## OBJ.augment
     *
     * Pushes the values of the properties of an object into another one
     *
     * User can specifies the subset of keys from both objects
     * that will subject to augmentation. The values of the other keys
     * will not be changed
     *
     * Notice: the method modifies the first input paramteer
     *
     * E.g.
     *
     * ```javascript
     * var a = { a:1, b:2, c:3 };
     * var b = { a:10, b:2, c:100, d:4 };
     * OBJ.augment(a, b); // { a: [1, 10], b: [2, 2], c: [3, 100]}
     *
     * OBJ.augment(a, b, ['b', 'c', 'd']);
     * // { a: 1, b: [2, 2], c: [3, 100], d: [4]});
     *
     * ```
     *
     * @param {object} obj1 The object whose properties will be augmented
     * @param {object} obj2 The augmenting object
     * @param {array} key Optional. Array of key names common to both objects
     *   taken as the set of properties to augment
     */
    OBJ.augment = function(obj1, obj2, keys) {
        var i, k;
        keys = keys || OBJ.keys(obj1);

        for (i = 0 ; i < keys.length; i++) {
            k = keys[i];
            if ('undefined' !== typeof obj1[k] &&
                Object.prototype.toString.call(obj1[k]) !== '[object Array]') {
                obj1[k] = [obj1[k]];
            }
            if ('undefined' !== obj2[k]) {
                if (!obj1[k]) obj1[k] = [];
                obj1[k].push(obj2[k]);
            }
        }
    };


    /**
     * ## OBJ.pairwiseWalk
     *
     * Executes a callback on all pairs of  attributes with the same name
     *
     * The results of each callback are aggregated in a new object under the
     * same property name.
     *
     * Does not traverse nested objects, and properties of the prototype
     * are excluded.
     *
     * Returns a new object, the original ones are not modified.
     *
     * E.g.
     *
     * ```javascript
     * var a = { b:2, c:3, d:5 };
     * var b = { a:10, b:2, c:100, d:4 };
     * var sum = function(a,b) {
     *     if ('undefined' !== typeof a) {
     *         return 'undefined' !== typeof b ? a + b : a;
     *     }
     *     return b;
     * };
     * OBJ.pairwiseWalk(a, b, sum); // { a:10, b:4, c:103, d:9 }
     * ```
     *
     * @param {object} o1 The first object
     * @param {object} o2 The second object
     *
     * @return {object} The object aggregating the results
     */
    OBJ.pairwiseWalk = function(o1, o2, cb) {
        var i, out;
        if (!o1 && !o2) return;
        if (!o1) return o2;
        if (!o2) return o1;

        out = {};
        for (i in o1) {
            if (o1.hasOwnProperty(i)) {
                out[i] = o2.hasOwnProperty(i) ? cb(o1[i], o2[i]) : cb(o1[i]);
            }
        }

        for (i in o2) {
            if (o2.hasOwnProperty(i)) {
                if ('undefined' === typeof out[i]) {
                    out[i] = cb(undefined, o2[i]);
                }
            }
        }
        return out;
    };

    /**
     * ## OBJ.getKeyByValue
     *
     * Returns the key/s associated with a specific value
     *
     * Uses OBJ.equals so it can perform complicated comparisons of
     * the value of the keys.
     *
     * Properties of the prototype are not skipped.
     *
     * @param {object} obj The object to search
     * @param {mixed} value The value to match
     * @param {boolean} allKeys Optional. If TRUE, all keys with the
     *   specific value are returned. Default FALSE
     *
     * @return {object} The object aggregating the results
     *
     * @see OBJ.equals
     */
    OBJ.getKeyByValue = function(obj, value, allKeys) {
        var key, out;
        if ('object' !== typeof obj) {
            throw new TypeError('OBJ.getKeyByValue: obj must be object.');
        }
        if (allKeys) out = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key) ) {
                if (OBJ.equals(value, obj[key])) {
                    if (!allKeys) return key;
                    else out.push(key);
                }
            }
        }
        return out;
    };

    JSUS.extend(OBJ);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # RANDOM
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Generates pseudo-random numbers
 */
(function(JSUS) {

    "use strict";

    function RANDOM() {}

    /**
     * ## RANDOM.random
     *
     * Generates a pseudo-random floating point number between
     * [a,b), a inclusive and b exclusive.
     *
     * @param {number} a The lower limit
     * @param {number} b The upper limit
     *
     * @return {number} A random floating point number in [a,b)
     */
    RANDOM.random = function(a, b) {
        var c;
        a = ('undefined' === typeof a) ? 0 : a;
        b = ('undefined' === typeof b) ? 0 : b;
        if (a === b) return a;

        if (b < a) {
            c = a;
            a = b;
            b = c;
        }
        return (Math.random() * (b - a)) + a;
    };

    /**
     * ## RANDOM.randomInt
     *
     * Generates a pseudo-random integer between (a,b] a exclusive, b inclusive
     *
     * @param {number} a The lower limit
     * @param {number} b The upper limit
     *
     * @return {number} A random integer in (a,b]
     *
     * @see RANDOM.random
     */
    RANDOM.randomInt = function(a, b) {
        if (a === b) return a;
        return Math.floor(RANDOM.random(a, b) + 1);
    };

    /**
     * ## RANDOM.sample
     *
     * Generates a randomly shuffled sequence of numbers in (a,b)
     *
     * Both _a_ and _b_ are inclued in the interval.
     *
     * @param {number} a The lower limit
     * @param {number} b The upper limit
     *
     * @return {array} The randomly shuffled sequence.
     *
     * @see RANDOM.seq
     */
    RANDOM.sample = function(a, b) {
        var out;
        out = JSUS.seq(a,b);
        if (!out) return false;
        return JSUS.shuffle(out);
    };

    /**
     * ## RANDOM.getNormalGenerator
     *
     * Returns a new generator of normally distributed pseudo random numbers
     *
     * The generator is independent from RANDOM.nextNormal
     *
     * @return {function} An independent generator
     *
     * @see RANDOM.nextNormal
     */
    RANDOM.getNormalGenerator = function() {

        return (function() {

            var oldMu, oldSigma;
            var x2, multiplier, genReady;

            return function normal(mu, sigma) {

                var x1, u1, u2, v1, v2, s;

                if ('number' !== typeof mu) {
                    throw new TypeError('nextNormal: mu must be number.');
                }
                if ('number' !== typeof sigma) {
                    throw new TypeError('nextNormal: sigma must be number.');
                }

                if (mu !== oldMu || sigma !== oldSigma) {
                    genReady = false;
                    oldMu = mu;
                    oldSigma = sigma;
                }

                if (genReady) {
                    genReady = false;
                    return (sigma * x2) + mu;
                }

                u1 = Math.random();
                u2 = Math.random();

                // Normalize between -1 and +1.
                v1 = (2 * u1) - 1;
                v2 = (2 * u2) - 1;

                s = (v1 * v1) + (v2 * v2);

                // Condition is true on average 1.27 times,
                // with variance equal to 0.587.
                if (s >= 1) {
                    return normal(mu, sigma);
                }

                multiplier = Math.sqrt(-2 * Math.log(s) / s);

                x1 = v1 * multiplier;
                x2 = v2 * multiplier;

                genReady = true;

                return (sigma * x1) + mu;

            };
        })();
    };

    /**
     * ## RANDOM.nextNormal
     *
     * Generates random numbers with Normal Gaussian distribution.
     *
     * User must specify the expected mean, and standard deviation a input
     * parameters.
     *
     * Implements the Polar Method by Knuth, "The Art Of Computer
     * Programming", p. 117.
     *
     * @param {number} mu The mean of the distribution
     * param {number} sigma The standard deviation of the distribution
     *
     * @return {number} A random number following a Normal Gaussian distribution
     *
     * @see RANDOM.getNormalGenerator
     */
    RANDOM.nextNormal = RANDOM.getNormalGenerator();

    /**
     * ## RANDOM.nextLogNormal
     *
     * Generates random numbers with LogNormal distribution.
     *
     * User must specify the expected mean, and standard deviation of the
     * underlying gaussian distribution as input parameters.
     *
     * @param {number} mu The mean of the gaussian distribution
     * @param {number} sigma The standard deviation of the gaussian distribution
     *
     * @return {number} A random number following a LogNormal distribution
     *
     * @see RANDOM.nextNormal
     */
    RANDOM.nextLogNormal = function(mu, sigma) {
        if ('number' !== typeof mu) {
            throw new TypeError('nextLogNormal: mu must be number.');
        }
        if ('number' !== typeof sigma) {
            throw new TypeError('nextLogNormal: sigma must be number.');
        }
        return Math.exp(RANDOM.nextNormal(mu, sigma));
    };

    /**
     * ## RANDOM.nextExponential
     *
     * Generates random numbers with Exponential distribution.
     *
     * User must specify the lambda the _rate parameter_ of the distribution.
     * The expected mean of the distribution is equal to `Math.pow(lamba, -1)`.
     *
     * @param {number} lambda The rate parameter
     *
     * @return {number} A random number following an Exponential distribution
     */
    RANDOM.nextExponential = function(lambda) {
        if ('number' !== typeof lambda) {
            throw new TypeError('nextExponential: lambda must be number.');
        }
        if (lambda <= 0) {
            throw new TypeError('nextExponential: ' +
                                'lambda must be greater than 0.');
        }
        return - Math.log(1 - Math.random()) / lambda;
    };

    /**
     * ## RANDOM.nextBinomial
     *
     * Generates random numbers following the Binomial distribution.
     *
     * User must specify the probability of success and the number of trials.
     *
     * @param {number} p The probability of success
     * @param {number} trials The number of trials
     *
     * @return {number} The sum of successes in n trials
     */
    RANDOM.nextBinomial = function(p, trials) {
        var counter, sum;

        if ('number' !== typeof p) {
            throw new TypeError('nextBinomial: p must be number.');
        }
        if ('number' !== typeof trials) {
            throw new TypeError('nextBinomial: trials must be number.');
        }
        if (p < 0 || p > 1) {
            throw new TypeError('nextBinomial: p must between 0 and 1.');
        }
        if (trials < 1) {
            throw new TypeError('nextBinomial: trials must be greater than 0.');
        }

        counter = 0;
        sum = 0;

        while(counter < trials){
            if (Math.random() < p) {
                sum += 1;
            }
            counter++;
        }

        return sum;
    };

    /**
     * ## RANDOM.nextGamma
     *
     * Generates random numbers following the Gamma distribution.
     *
     * This function is experimental and untested. No documentation.
     *
     * @experimental
     */
    RANDOM.nextGamma = function(alpha, k) {
        var intK, kDiv, alphaDiv;
        var u1, u2, u3;
        var x, i, tmp;

        if ('number' !== typeof alpha) {
            throw new TypeError('nextGamma: alpha must be number.');
        }
        if ('number' !== typeof k) {
            throw new TypeError('nextGamma: k must be number.');
        }
        if (alpha < 1) {
            throw new TypeError('nextGamma: alpha must be greater than 1.');
        }
        if (k < 1) {
            throw new TypeError('nextGamma: k must be greater than 1.');
        }

        u1 = Math.random();
        u2 = Math.random();
        u3 = Math.random();

        intK = Math.floor(k) + 3;
        kDiv = 1 / k;

        alphaDiv = 1 / alpha;

        x = 0;
        for (i = 3 ; ++i < intK ; ) {
            x += Math.log(Math.random());
        }

        x *= - alphaDiv;

        tmp = Math.log(u3) *
            (Math.pow(u1, kDiv) /
             ((Math.pow(u1, kDiv) + Math.pow(u2, 1 / (1 - k)))));

        tmp *=  - alphaDiv;

        return x + tmp;
    };

    JSUS.extend(RANDOM);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # TIME
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions related to the generation,
 * manipulation, and formatting of time strings in JavaScript
 */
(function (JSUS) {

    "use strict";

    function TIME() {}

    // Polyfill for Date.toISOString (IE7, IE8, IE9)
    // Kudos: https://developer.mozilla.org/en-US/docs/Web/
    // JavaScript/Reference/Global_Objects/Date/toISOString
    if (!Date.prototype.toISOString) {
        (function() {

            function pad(number) {
                return (number < 10) ? '0' + number : number;
            }

            Date.prototype.toISOString = function() {
                var ms = (this.getUTCMilliseconds() / 1000).toFixed(3);
                return this.getUTCFullYear() +
                    '-' + pad(this.getUTCMonth() + 1) +
                    '-' + pad(this.getUTCDate()) +
                    'T' + pad(this.getUTCHours()) +
                    ':' + pad(this.getUTCMinutes()) +
                    ':' + pad(this.getUTCSeconds()) +
                    '.' + ms.slice(2, 5) + 'Z';
            };

        }());
    }

    /**
     * ## TIME.getDate
     *
     * Returns a string representation of the current date and time (ISO)
     *
     * String is formatted as follows:
     *
     * YYYY-MM-DDTHH:mm:ss.sssZ
     *
     * @return {string} Formatted time string YYYY-MM-DDTHH:mm:ss.sssZ
     */
    TIME.getDate = TIME.getFullDate = function() {
        return new Date().toISOString();
    };

    /**
     * ## TIME.getTime
     *
     * Returns a string representation of the current time
     *
     * String is ormatted as follows:
     *
     * hh:mm:ss
     *
     * @return {string} Formatted time string hh:mm:ss
     */
    TIME.getTime = function() {
        var d = new Date();
        var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();

        return time;
    };

    /**
     * ## TIME.parseMilliseconds
     *
     * Parses an integer number representing milliseconds,
     * and returns an array of days, hours, minutes and seconds
     *
     * @param {number} ms Integer representing milliseconds
     *
     * @return {array} Milleconds parsed in days, hours, minutes, and seconds
     */
    TIME.parseMilliseconds = function (ms) {
        if ('number' !== typeof ms) return;

        var result = [];
        var x = ms / 1000;
        result[4] = x;
        var seconds = x % 60;
        result[3] = Math.floor(seconds);
        x = x / 60;
        var minutes = x % 60;
        result[2] = Math.floor(minutes);
        x = x / 60;
        var hours = x % 24;
        result[1] = Math.floor(hours);
        x = x / 24;
        var days = x;
        result[1] = Math.floor(days);

        return result;
    };

    JSUS.extend(TIME);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # PARSE
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions related to parsing strings
 */
(function(JSUS) {

    "use strict";

    function PARSE() {}

    /**
     * ## PARSE.stringify_prefix
     *
     * Prefix used by PARSE.stringify and PARSE.parse
     * to decode strings with special meaning
     *
     * @see PARSE.stringify
     * @see PARSE.parse
     */
    PARSE.stringify_prefix = '!?_';

    PARSE.marker_func = PARSE.stringify_prefix + 'function';
    PARSE.marker_null = PARSE.stringify_prefix + 'null';
    PARSE.marker_und = PARSE.stringify_prefix + 'undefined';
    PARSE.marker_nan = PARSE.stringify_prefix + 'NaN';
    PARSE.marker_inf = PARSE.stringify_prefix + 'Infinity';
    PARSE.marker_minus_inf = PARSE.stringify_prefix + '-Infinity';

    /**
     * ## PARSE.getQueryString
     *
     * Parses current querystring and returns the requested variable.
     *
     * If no variable name is specified, returns the full query string.
     * If requested variable is not found returns false.
     *
     * @param {string} name Optional. If set, returns only the value
     *   associated with this variable
     * @param {string} referer Optional. If set, searches this string
     *
     * @return {string|boolean} The querystring, or a part of it, or FALSE
     *
     * Kudos:
     * @see http://stackoverflow.com/q/901115/3347292
     */
    PARSE.getQueryString = function(name, referer) {
        var regex, results;
        if (referer && 'string' !== typeof referer) {
            throw new TypeError('JSUS.getQueryString: referer must be string ' +
                                'or undefined.');
        }
        referer = referer || window.location.search;
        if ('undefined' === typeof name) return referer;
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        results = regex.exec(referer);
        return results === null ? false :
            decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    /**
     * ## PARSE.tokenize
     *
     * Splits a string in tokens that users can specified as input parameter.
     * Additional options can be specified with the modifiers parameter
     *
     * - limit: An integer that specifies the number of split items
     *     after the split limit will not be included in the array
     *
     * @param {string} str The string to split
     * @param {array} separators Array containing the separators words
     * @param {object} modifiers Optional. Configuration options
     *   for the tokenizing
     *
     * @return {array} Tokens in which the string was split
     */
    PARSE.tokenize = function(str, separators, modifiers) {
        var pattern, regex;
        if (!str) return;
        if (!separators || !separators.length) return [str];
        modifiers = modifiers || {};

        pattern = '[';

        JSUS.each(separators, function(s) {
            if (s === ' ') s = '\\s';

            pattern += s;
        });

        pattern += ']+';

        regex = new RegExp(pattern);
        return str.split(regex, modifiers.limit);
    };

    /**
     * ## PARSE.stringify
     *
     * Stringifies objects, functions, primitive, undefined or null values
     *
     * Makes uses `JSON.stringify` with a special reviver function, that
     * strinfifies also functions, undefined, and null values.
     *
     * A special prefix is prepended to avoid name collisions.
     *
     * @param {mixed} o The value to stringify
     * @param {number} spaces Optional the number of indentation spaces.
     *   Defaults, 0
     *
     * @return {string} The stringified result
     *
     * @see JSON.stringify
     * @see PARSE.stringify_prefix
     */
    PARSE.stringify = function(o, spaces) {
        return JSON.stringify(o, function(key, value) {
            var type = typeof value;
            if ('function' === type) {
                return PARSE.stringify_prefix + value.toString();
            }

            if ('undefined' === type) return PARSE.marker_und;
            if (value === null) return PARSE.marker_null;
            if ('number' === type && isNaN(value)) return PARSE.marker_nan;
            if (value === Number.POSITIVE_INFINITY) return PARSE.marker_inf;
            if (value === Number.NEGATIVE_INFINITY) {
                return PARSE.marker_minus_inf;
            }

            return value;

        }, spaces);
    };

    /**
     * ## PARSE.stringifyAll
     *
     * Copies all the properties of the prototype before stringifying
     *
     * Notice: The original object is modified!
     *
     * @param {mixed} o The value to stringify
     * @param {number} spaces Optional the number of indentation spaces.
     *   Defaults, 0
     *
     * @return {string} The stringified result
     *
     * @see PARSE.stringify
     */
    PARSE.stringifyAll = function(o, spaces) {
        for (var i in o) {
            if (!o.hasOwnProperty(i)) {
                if ('object' === typeof o[i]) {
                    o[i] = PARSE.stringifyAll(o[i]);
                }
                else {
                    o[i] = o[i];
                }
            }
        }
        return PARSE.stringify(o);
    };

    /**
     * ## PARSE.parse
     *
     * Decodes strings in objects and other values
     *
     * Uses `JSON.parse` and then looks  for special strings
     * encoded by `PARSE.stringify`
     *
     * @param {string} str The string to decode
     * @return {mixed} The decoded value
     *
     * @see JSON.parse
     * @see PARSE.stringify_prefix
     */
    PARSE.parse = function(str) {

        var len_prefix = PARSE.stringify_prefix.length,
            len_func = PARSE.marker_func.length,
            len_null = PARSE.marker_null.length,
            len_und = PARSE.marker_und.length,
            len_nan = PARSE.marker_nan.length,
            len_inf = PARSE.marker_inf.length,
            len_minus_inf = PARSE.marker_minus_inf.length;


        var o = JSON.parse(str);
        return walker(o);

        function walker(o) {
            if ('object' !== typeof o) return reviver(o);

            for (var i in o) {
                if (o.hasOwnProperty(i)) {
                    if ('object' === typeof o[i]) {
                        walker(o[i]);
                    }
                    else {
                        o[i] = reviver(o[i]);
                    }
                }
            }

            return o;
        }

        function reviver(value) {
            var type = typeof value;

            if (type === 'string') {
                if (value.substring(0, len_prefix) !== PARSE.stringify_prefix) {
                    return value;
                }
                else if (value.substring(0, len_func) === PARSE.marker_func) {
                    return JSUS.eval(value.substring(len_prefix));
                }
                else if (value.substring(0, len_null) === PARSE.marker_null) {
                    return null;
                }
                else if (value.substring(0, len_und) === PARSE.marker_und) {
                    return undefined;
                }

                else if (value.substring(0, len_nan) === PARSE.marker_nan) {
                    return NaN;
                }
                else if (value.substring(0, len_inf) === PARSE.marker_inf) {
                    return Infinity;
                }
                else if (value.substring(0, len_minus_inf) ===
                         PARSE.marker_minus_inf) {

                    return -Infinity;
                }

            }
            return value;
        }
    };

    /**
     * ## PARSE.isInt
     *
     * Checks if a value is an integer number or a string containing one
     *
     * Non-numbers, Infinity, NaN, and floats will return FALSE
     *
     * @param {mixed} n The value to check
     * @param {number} lower Optional. If set, n must be greater than lower
     * @param {number} upper Optional. If set, n must be smaller than upper
     *
     * @return {boolean|number} The parsed integer, or FALSE if none was found
     *
     * @see PARSE.isFloat
     * @see PARSE.isNumber
     */
    PARSE.isInt = function(n, lower, upper) {
        var regex, i;
        regex = /^-?\d+$/;
        if (!regex.test(n)) return false;
        i = parseInt(n, 10);
        if (i !== parseFloat(n)) return false;
        return PARSE.isNumber(i, lower, upper);
    };

    /**
     * ## PARSE.isFloat
     *
     * Checks if a value is a float number or a string containing one
     *
     * Non-numbers, Infinity, NaN, and integers will return FALSE
     *
     * @param {mixed} n The value to check
     * @param {number} lower Optional. If set, n must be greater than lower
     * @param {number} upper Optional. If set, n must be smaller than upper
     *
     * @return {boolean|number} The parsed float, or FALSE if none was found
     *
     * @see PARSE.isInt
     * @see PARSE.isNumber
     */
    PARSE.isFloat = function(n, lower, upper) {
        var regex;
        regex = /^-?\d*(\.\d+)?$/;
        if (!regex.test(n)) return false;
        if (n.toString().indexOf('.') === -1) return false;
        return PARSE.isNumber(n, lower, upper);
    };

    /**
     * ## PARSE.isNumber
     *
     * Checks if a value is a number (int or float) or a string containing one
     *
     * Non-numbers, Infinity, NaN will return FALSE
     *
     * @param {mixed} n The value to check
     * @param {number} lower Optional. If set, n must be greater than lower
     * @param {number} upper Optional. If set, n must be smaller than upper
     *
     * @return {boolean|number} The parsed number, or FALSE if none was found
     *
     * @see PARSE.isInt
     * @see PARSE.isFloat
     */
    PARSE.isNumber = function(n, lower, upper) {
        if (isNaN(n) || !isFinite(n)) return false;
        n = parseFloat(n);
        if ('number' === typeof lower && n < lower) return false;
        if ('number' === typeof upper && n > upper) return false;
        return n;
    };

    /**
     * ## PARSE.range
     *
     * Decodes semantic strings into an array of integers
     *
     * Let n, m  and l be integers, then the tokens of the string are
     * interpreted in the following way:
     *
     *  - `*`: Any integer
     *  - `n`: The integer `n`
     *  - `begin`: The smallest integer in `available`
     *  - `end`: The largest integer in `available`
     *  - `<n`, `<=n`, `>n`, `>=n`: Any integer (strictly) smaller/larger than n
     *  - `n..m`, `[n,m]`: Any integer between n and m (both inclusively)
     *  - `n..l..m`: Any i
     *  - `[n,m)`: Any integer between n (inclusively) and m (exclusively)
     *  - `(n,m]`: Any integer between n (exclusively) and m (inclusively)
     *  - `(n,m)`: Any integer between n and m (both exclusively)
     *  - `%n`: Divisible by n
     *  - `%n = m`: Divisible with rest m
     *  - `!`: Logical not
     *  - `|`, `||`, `,`: Logical or
     *  - `&`, `&&`: Logical and
     *
     * The elements of the resulting array are all elements of the `available`
     * array which satisfy the expression defined by `expr`.
     *
     * Examples:
     *
     *   PARSE.range('2..5, >8 & !11', '[-2,12]'); // [2,3,4,5,9,10,12]
     *
     *   PARSE.range('begin...end/2 | 3*end/4...3...end', '[0,40) & %2 = 1');
     *        // [1,3,5,7,9,11,13,15,17,19,29,35] (end == 39)
     *
     *   PARSE.range('<=19, 22, %5', '>6 & !>27');
     *        // [7,8,9,10,11,12,13,14,15,16,17,18,19,20,22,25]
     *
     *   PARSE.range('*','(3,8) & !%4, 22, (10,12]'); // [5,6,7,11,12,22]
     *
     *   PARSE.range('<4', {
     *       begin: 0,
     *       end: 21,
     *       prev: 0,
     *       cur: 1,
     *       next: function() {
     *           var temp = this.prev;
     *           this.prev = this.cur;
     *           this.cur += temp;
     *           return this.cur;
     *       },
     *       isFinished: function() {
     *           return this.cur + this.prev > this.end;
     *       }
     *   }); // [5, 8, 13, 21]
     *
     * @param {string|number} expr The selection expression
     * @param {mixed} available Optional. If undefined `expr` is used. If:
     *  - string: it is interpreted according to the same rules as `expr`;
     *  - array: it is used as it is;
     *  - object: provide functions next, isFinished and attributes begin, end
     *
     * @return {array} The array containing the specified values
     *
     * @see JSUS.eval
     */
    PARSE.range = function(expr, available) {
        var i,len, x;
        var solution;
        var begin, end, lowerBound, numbers;
        var invalidChars, invalidBeforeOpeningBracket, invalidDot;

        solution = [];
        if ('undefined' === typeof expr) return solution;

        // TODO: this could be improved, i.e. if it is a number, many
        // checks and regular expressions could be avoided.
        if ('number' === typeof expr) expr = '' + expr;
        else if ('string' !== typeof expr) {
            throw new TypeError('PARSE.range: expr must be string, number, ' +
                                'undefined.');
        }
        // If no available numbers defined, assumes all possible are allowed.
        if ('undefined' === typeof available) {
            available = expr;
        }
        else if (JSUS.isArray(available)) {
            if (available.length === 0) return solution;
            begin = Math.min.apply(null, available);
            end = Math.max.apply(null, available);
        }
        else if ('object' === typeof available) {
            if ('function' !== typeof available.next) {
                throw new TypeError('PARSE.range: available.next must be ' +
                                    'function.');
            }
            if ('function' !== typeof available.isFinished) {
                throw new TypeError('PARSE.range: available.isFinished must ' +
                                    'be function.');
            }
            if ('number' !== typeof available.begin) {
                throw new TypeError('PARSE.range: available.begin must be ' +
                                    'number.');
            }
            if ('number' !== typeof available.end) {
                throw new TypeError('PARSE.range: available.end must be ' +
                                    'number.');
            }

            begin = available.begin;
            end = available.end;
        }
        else if ('string' === typeof available) {
            // If the availble points are also only given implicitly,
            // compute set of available numbers by first guessing a bound.
            available = preprocessRange(available);

            numbers = available.match(/([-+]?\d+)/g);
            if (numbers === null) {
                throw new Error(
                    'PARSE.range: no numbers in available: ' + available);
            }
            lowerBound = Math.min.apply(null, numbers);

            available = PARSE.range(available, {
                begin: lowerBound,
                end: Math.max.apply(null, numbers),
                value: lowerBound,
                next: function() {
                    return this.value++;
                },
                isFinished: function() {
                    return this.value > this.end;
                }
            });
            begin = Math.min.apply(null, available);
            end = Math.max.apply(null, available);
        }
        else {
            throw new TypeError('PARSE.range: available must be string, ' +
                                'array, object or undefined.');
        }

        // end -> maximal available value.
        expr = expr.replace(/end/g, parseInt(end, 10));

        // begin -> minimal available value.
        expr = expr.replace(/begin/g, parseInt(begin, 10));

        // Do all computations.
        expr = preprocessRange(expr);

        // Round all floats
        expr = expr.replace(/([-+]?\d+\.\d+)/g, function(match, p1) {
            return parseInt(p1, 10);
        });

        // Validate expression to only contain allowed symbols.
        invalidChars = /[^ \*\d<>=!\|&\.\[\],\(\)\-\+%]/g;
        if (expr.match(invalidChars)) {
            throw new Error('PARSE.range: invalid characters found: ' + expr);
        }

        // & -> && and | -> ||.
        expr = expr.replace(/([^& ]) *& *([^& ])/g, "$1&&$2");
        expr = expr.replace(/([^| ]) *\| *([^| ])/g, "$1||$2");

        // n -> (x == n).
        expr = expr.replace(/([-+]?\d+)/g, "(x==$1)");

        // n has already been replaced by (x==n) so match for that from now on.

        // %n -> !(x%n)
        expr = expr.replace(/% *\(x==([-+]?\d+)\)/,"!(x%$1)");

        // %n has already been replaced by !(x%n) so match for that from now on.
        // %n = m, %n == m -> (x%n == m).
        expr = expr.replace(/!\(x%([-+]?\d+)\) *={1,} *\(x==([-+]?\d+)\)/g,
            "(x%$1==$2)");

        // <n, <=n, >n, >=n -> (x < n), (x <= n), (x > n), (x >= n)
        expr = expr.replace(/([<>]=?) *\(x==([-+]?\d+)\)/g, "(x$1$2)");

        // n..l..m -> (x >= n && x <= m && !((x-n)%l)) for positive l.
        expr = expr.replace(
            /\(x==([-+]?\d+)\)\.{2,}\(x==(\+?\d+)\)\.{2,}\(x==([-+]?\d+)\)/g,
            "(x>=$1&&x<=$3&&!((x- $1)%$2))");

        // n..l..m -> (x <= n && x >= m && !((x-n)%l)) for negative l.
        expr = expr.replace(
            /\(x==([-+]?\d+)\)\.{2,}\(x==(-\d+)\)\.{2,}\(x==([-+]?\d+)\)/g,
            "(x<=$1&&x>=$3&&!((x- $1)%$2))");

        // n..m -> (x >= n && x <= m).
        expr = expr.replace(/\(x==([-+]?\d+)\)\.{2,}\(x==([-+]?\d+)\)/g,
                "(x>=$1&&x<=$2)");

        // (n,m), ... ,[n,m] -> (x > n && x < m), ... , (x >= n && x <= m).
        expr = expr.replace(
            /([(\[]) *\(x==([-+]?\d+)\) *, *\(x==([-+]?\d+)\) *([\])])/g,
                function (match, p1, p2, p3, p4) {
                    return "(x>" + (p1 == '(' ? '': '=') + p2 + "&&x<" +
                        (p4 == ')' ? '' : '=') + p3 + ')';
            }
        );

        // * -> true.
        expr = expr.replace('*', 1);

        // Remove spaces.
        expr = expr.replace(/\s/g, '');

        // a, b -> (a) || (b)
        expr = expr.replace(/\)[,] *(!*)\(/g, ")||$1(");

        // Validating the expression before eval"ing it.
        invalidChars = /[^ \d<>=!\|&,\(\)\-\+%x\.]/g;
        // Only & | ! may be before an opening bracket.
        invalidBeforeOpeningBracket = /[^ &!|\(] *\(/g;
        // Only dot in floats.
        invalidDot = /\.[^\d]|[^\d]\./;

        if (expr.match(invalidChars)) {
            throw new Error('PARSE.range: invalid characters found: ' + expr);
        }
        if (expr.match(invalidBeforeOpeningBracket)) {
            throw new Error('PARSE.range: invalid character before opending ' +
                            'bracket found: ' + expr);
        }
        if (expr.match(invalidDot)) {
            throw new Error('PARSE.range: invalid dot found: ' + expr);
        }

        if (JSUS.isArray(available)) {
            i = -1, len = available.length;
            for ( ; ++i < len ; ) {
                x = parseInt(available[i], 10);
                if (JSUS.eval(expr.replace(/x/g, x))) {
                    solution.push(x);
                }
            }
        }
        else {
            while (!available.isFinished()) {
                x = parseInt(available.next(), 10);
                if (JSUS.eval(expr.replace(/x/g, x))) {
                    solution.push(x);
                }
            }
        }
        return solution;
    };

    function preprocessRange(expr) {
        var mult = function(match, p1, p2, p3) {
            var n1 = parseInt(p1, 10);
            var n3 = parseInt(p3, 10);
            return p2 == '*' ? n1*n3 : n1/n3;
        };
        var add = function(match, p1, p2, p3) {
            var n1 = parseInt(p1, 10);
            var n3 = parseInt(p3, 10);
            return p2 == '-' ? n1 - n3 : n1 + n3;
        };
        var mod = function(match, p1, p2, p3) {
            var n1 = parseInt(p1, 10);
            var n3 = parseInt(p3, 10);
            return n1 % n3;
        };

        while (expr.match(/([-+]?\d+) *([*\/]) *([-+]?\d+)/g)) {
            expr = expr.replace(/([-+]?\d+) *([*\/]) *([-+]?\d+)/, mult);
        }

        while (expr.match(/([-+]?\d+) *([-+]) *([-+]?\d+)/g)) {
            expr = expr.replace(/([-+]?\d+) *([-+]) *([-+]?\d+)/, add);
        }
        while (expr.match(/([-+]?\d+) *% *([-+]?\d+)/g)) {
            expr = expr.replace(/([-+]?\d+) *% *([-+]?\d+)/, mod);
        }
        return expr;
    }

    /**
     * ## PARSE.funcName
     *
     * Returns the name of the function
     *
     * Function.name is a non-standard JavaScript property,
     * although many browsers implement it. This is a cross-browser
     * implementation for it.
     *
     * In case of anonymous functions, an empty string is returned.
     *
     * @param {function} func The function to check
     *
     * @return {string} The name of the function
     *
     * Kudos to:
     * http://matt.scharley.me/2012/03/09/monkey-patch-name-ie.html
     */
    if ('undefined' !== typeof Function.prototype.name) {
        PARSE.funcName = function(func) {
            if ('function' !== typeof func) {
                throw new TypeError('PARSE.funcName: func must be function.');
            }
            return func.name;
        };
    }
    else {
        PARSE.funcName = function(func) {
            var funcNameRegex, res;
            if ('function' !== typeof func) {
                throw new TypeError('PARSE.funcName: func must be function.');
            }
            funcNameRegex = /function\s([^(]{1,})\(/;
            res = (funcNameRegex).exec(func.toString());
            return (res && res.length > 1) ? res[1].trim() : "";
        };
    }

    JSUS.extend(PARSE);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # NDDB: N-Dimensional Database
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * NDDB is a powerful and versatile object database for node.js and the browser.
 * ---
 */
(function(exports, J, store) {

    "use strict";

    // Expose constructors
    exports.NDDB = NDDB;

    if (!J) throw new Error('NDDB: missing dependency: JSUS.');

    /**
     * ### df
     *
     * Flag indicating support for method Object.defineProperty
     *
     * If support is missing, the index `_nddbid` will be as a normal
     * property, and, therefore, it will be enumerable.
     *
     * @see nddb_insert
     * JSUS.compatibility
     */
    var df = J.compatibility().defineProperty;

    /**
     * ### NDDB.decycle
     *
     * Removes cyclic references from an object
     *
     * @param {object} e The object to decycle
     *
     * @return {object} e The decycled object
     *
     * @see https://github.com/douglascrockford/JSON-js/
     */
    NDDB.decycle = function(e) {
        if (JSON && JSON.decycle && 'function' === typeof JSON.decycle) {
            e = JSON.decycle(e);
        }
        return e;
    };

    /**
     * ### NDDB.retrocycle
     *
     * Restores cyclic references in an object previously decycled
     *
     * @param {object} e The object to retrocycle
     *
     * @return {object} e The retrocycled object
     *
     * @see https://github.com/douglascrockford/JSON-js/
     */
    NDDB.retrocycle = function(e) {
        if (JSON && JSON.retrocycle && 'function' === typeof JSON.retrocycle) {
            e = JSON.retrocycle(e);
        }
        return e;
    };

    /**
     * ## NDDB constructor
     *
     * Creates a new instance of NDDB
     *
     * @param {object} options Optional. Configuration options
     * @param {db} db Optional. An initial set of items to import
     */
    function NDDB(options, db) {
        var that;
        that = this;
        options = options || {};

        // ## Public properties.

        // ### nddbid
        // A global index of all objects.
        this.nddbid = new NDDBIndex('nddbid', this);

        // ### db
        // The default database.
        this.db = [];

        // ### lastSelection
        // The subset of items that were selected during the last operations
        // Notice: some of the items might not exist any more in the database.
        // @see NDDB.fetch
        this.lastSelection = [];

        // ### nddbid
        // A global index of all hashed objects
        // @see NDDBHashtray
        this.hashtray = new NDDBHashtray();

        // ###tags
        // The tags list.
        this.tags = {};

        // ### hooks
        // The list of hooks and associated callbacks
        this.hooks = {
            insert: [],
            remove: [],
            update: []
        };

        // ### nddb_pointer
        // Pointer for iterating along all the elements
        this.nddb_pointer = 0;

        // ### query
        // QueryBuilder obj
        // @see QueryBuilder
        this.query = new QueryBuilder();

        // ### filters
        // Available db filters
        this.addDefaultFilters();

        // ### __userDefinedFilters
        // Filters that are defined with addFilter
        // The field is needed by cloneSettings
        // @see NDDB.addFilter
        this.__userDefinedFilters = {};

        // ### __C
        // List of comparator functions
        this.__C = {};

        // ### __H
        // List of hash functions
        this.__H = {};

        // ### __I
        // List of index functions
        this.__I = {};

        // ### __I
        // List of view functions
        this.__V = {};

        // ### __update
        // Auto update options container
        this.__update = {};

        // ### __update.pointer
        // If TRUE, nddb_pointer always points to the last insert
        this.__update.pointer = false;

        // ### __update.indexes
        // If TRUE, rebuild indexes on every insert and remove
        this.__update.indexes = false;

        // ### __update.sort
        // If TRUE, sort db on every insert and remove
        this.__update.sort = false;

        // ### __shared
        // Objects shared (not cloned) among breeded NDDB instances
        this.__shared = {};

        // ### __formats
        // Currently supported formats for saving/loading items.
        this.__formats = {};

        // ### __defaultFormat
        // Default format for saving and loading items.
        this.__defaultFormat = null;

        // ### log
        // Std out for log messages
        //
        // It can be overriden in options by another function (`options.log`).
        // `options.logCtx` specif the context of execution.
        // @see NDDB.initLog
        this.log = console.log;

        // ### globalCompare
        // Dummy compare function used to sort elements in the database
        //
        // It can be overriden with a compare function returning:
        //
        //  - 0 if the objects are the same
        //  - a positive number if o2 precedes o1
        //  - a negative number if o1 precedes o2
        //
        this.globalCompare = function(o1, o2) {
            return -1;
        };

        // Adding the "compareInAllFields" function.
        //
        // @see NDDB.comparator
        this.comparator('*', function(o1, o2, trigger1, trigger2) {
            var d, c, res;
            for (d in o1) {
               c = that.getComparator(d);
               o2[d] = o2['*'];
               res = c(o1, o2);
               if (res === trigger1) return res;
               if ('undefined' !== trigger2 && res === trigger2) return res;
               // No need to delete o2[d] afer comparison.
            }

           // We are not interested in sorting.
           // Figuring out the right return value.
           if (trigger1 === 0) {
               return trigger2 === 1 ? -1 : 1;
           }
           if (trigger1 === 1) {
               return trigger2 === 0 ? -1 : 0;
           }

           return trigger2 === 0 ? 1 : 0;
        });

        // Add default formats (e.g. CSV, JSON in Node.js).
        // See `/lib/fs.js`.
        if ('function' === typeof this.addDefaultFormats) {
            this.addDefaultFormats();
        }

        // Mixing in user options and defaults.
        this.init(options);

        // Importing items, if any.
        if (db) this.importDB(db);
    }

    /**
     * ### NDDB.addFilter
     *
     * Registers a _select_ function under an alphanumeric id
     *
     * When calling `NDDB.select('d','OP','value')` the second parameter (_OP_)
     * will be matched with the callback function specified here.
     *
     * Callback function must accept three input parameters:
     *
     *  - d: dimension of comparison
     *  - value: second-term of comparison
     *  - comparator: the comparator function as defined by `NDDB.comparator`
     *
     * and return a function that execute the desired operation.
     *
     * Registering a new filter with the same name of an already existing
     * one, will overwrite the old filter without warnings.
     *
     * A reference to newly added filters are registered under
     * `__userDefinedFilter`, so that they can be copied by `cloneSettings`.
     *
     * @param {string} op An alphanumeric id
     * @param {function} cb The callback function
     *
     * @see QueryBuilder.addDefaultOperators
     */
    NDDB.prototype.addFilter = function(op, cb) {
        this.filters[op] = cb;
        this.__userDefinedFilters[op] = this.filters[op];
    };

    /**
     * ### NDDB.addDefaultFilters
     *
     * Register default filters for NDDB
     *
     * Default filters include standard logical operators:
     *
     *   - '=', '==', '!=', ''>', >=', '<', '<=',
     *
     * and:
     *
     *   - 'E': field exists (can be omitted, it is the default one)
     *   - '><': between values
     *   - '<>': not between values
     *   - 'in': element is found in array
     *   - '!in': element is noi found in array
     *   - 'LIKE': string SQL LIKE (case sensitive)
     *   - 'iLIKE': string SQL LIKE (case insensitive)
     *
     * @see NDDB.filters
     */
    NDDB.prototype.addDefaultFilters = function() {
        if (!this.filters) this.filters = {};
        var that;
        that = this;

        // Exists.
        this.filters['E'] = function(d, value, comparator) {
            if ('object' === typeof d) {
                return function(elem) {
                    var d, c;
                    for (d in elem) {
                        c = that.getComparator(d);
                        value[d] = value[0]['*'];
                        if (c(elem, value, 1) > 0) {
                            value[d] = value[1]['*'];
                            if (c(elem, value, -1) < 0) {
                                return elem;
                            }
                        }
                    }
                    if ('undefined' !== typeof elem[d]) {
                        return elem;
                    }
                    else if ('undefined' !== typeof J.getNestedValue(d,elem)) {
                        return elem;
                    }
                };
            }
            else {
                return function(elem) {
                    if ('undefined' !== typeof elem[d]) {
                        return elem;
                    }
                    else if ('undefined' !== typeof J.getNestedValue(d,elem)) {
                        return elem;
                    }
                };
            }
        };

        // (strict) Equals.
        this.filters['=='] = function(d, value, comparator) {
            return function(elem) {
                if (comparator(elem, value, 0) === 0) return elem;
            };
        };

        // (strict) Not Equals.
        this.filters['!='] = function(d, value, comparator) {
            return function(elem) {
                if (comparator(elem, value, 0) !== 0) return elem;
            };
        };

        // Smaller than.
        this.filters['>'] = function(d, value, comparator) {
            if ('object' === typeof d || d === '*') {
                return function(elem) {
                    if (comparator(elem, value, 1) === 1) return elem;
                };
            }
            else {
                return function(elem) {
                    if ('undefined' === typeof elem[d]) return;
                    if (comparator(elem, value, 1) === 1) return elem;
                };
            }
        };

        // Greater than.
        this.filters['>='] = function(d, value, comparator) {
            if ('object' === typeof d || d === '*') {
                return function(elem) {
                    var compared = comparator(elem, value, 0, 1);
                    if (compared === 1 || compared === 0) return elem;
                };
            }
            else {
                return function(elem) {
                    if ('undefined' === typeof elem[d]) return;
                    var compared = comparator(elem, value, 0, 1);
                    if (compared === 1 || compared === 0) return elem;
                };
            }
        };

        // Smaller than.
        this.filters['<'] = function(d, value, comparator) {
            if ('object' === typeof d || d === '*') {
                return function(elem) {
                    if (comparator(elem, value, -1) === -1) return elem;
                };
            }
            else {
                return function(elem) {
                    if ('undefined' === typeof elem[d]) return;
                    if (comparator(elem, value, -1) === -1) return elem;
                };
            }
        };

        //  Smaller or equal than.
        this.filters['<='] = function(d, value, comparator) {
            if ('object' === typeof d || d === '*') {
                return function(elem) {
                    var compared = comparator(elem, value, 0, -1);
                    if (compared === -1 || compared === 0) return elem;
                };
            }
            else {
                return function(elem) {
                    if ('undefined' === typeof elem[d]) return;
                    var compared = comparator(elem, value, 0, -1);
                    if (compared === -1 || compared === 0) return elem;
                };
            }
        };

        // Between.
        this.filters['><'] = function(d, value, comparator) {
            if ('object' === typeof d) {
                return function(elem) {
                    var i, len;
                    len = d.length;
                    for (i = 0; i < len ; i++) {
                        if (comparator(elem, value[0], 1) > 0 &&
                            comparator(elem, value[1], -1) < 0) {
                            return elem;
                        }
                    }
                };
            }
            else if (d === '*') {
                return function(elem) {
                    var d, c;
                    for (d in elem) {
                        c = that.getComparator(d);
                        value[d] = value[0]['*'];
                        if (c(elem, value, 1) > 0) {
                            value[d] = value[1]['*'];
                            if (c(elem, value, -1) < 0) {
                                return elem;
                            }
                        }
                    }
                };
            }
            else {
                return function(elem) {
                    if (comparator(elem, value[0], 1) > 0 &&
                        comparator(elem, value[1], -1) < 0) {
                        return elem;
                    }
                };
            }
        };

        // Not Between.
        this.filters['<>'] = function(d, value, comparator) {
            if ('object' === typeof d || d === '*') {
                return function(elem) {
                    if (comparator(elem, value[0], -1) < 0 ||
                        comparator(elem, value[1], 1) > 0) {
                        return elem;
                    }
                };
            }
            else {
                return function(elem) {
                    if ('undefined' === typeof elem[d]) return;
                    if (comparator(elem, value[0], -1) < 0 ||
                        comparator(elem, value[1], 1) > 0) {
                        return elem;
                    }
                };
            }
        };

        // In Array.
        this.filters['in'] = function(d, value, comparator) {
            if ('object' === typeof d) {
                return function(elem) {
                    var i, len;
                    len = value.length;
                    for (i = 0; i < len; i++) {
                        if (comparator(elem, value[i], 0) === 0) {
                            return elem;
                        }
                    }
                };
            }
            else {
                return function(elem) {
                    var i, obj, len;
                    obj = {}, len = value.length;
                    for (i = 0; i < len; i++) {
                        obj[d] = value[i];
                        if (comparator(elem, obj, 0) === 0) {
                            return elem;
                        }
                    }
                };
            }
        };

        // Not In Array.
        this.filters['!in'] = function(d, value, comparator) {
            if ('object' === typeof d) {
                return function(elem) {
                    var i, len;
                    len = value.length;
                    for (i = 0; i < len; i++) {
                        if (comparator(elem, value[i], 0) === 0) {
                            return;
                        }
                    }
                    return elem;
                };
            }
            else {
                return function(elem) {
                    var i, obj, len;
                    obj = {}, len = value.length;
                    for (i = 0; i < len; i++) {
                        obj[d] = value[i];
                        if (comparator(elem, obj, 0) === 0) {
                            return;
                        }
                    }
                    return elem;
                };
            }
        };

        // Supports `_` and `%` wildcards.
        function generalLike(d, value, comparator, sensitive) {
            var regex;

            RegExp.escape = function(str) {
                return str.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
            };

            regex = RegExp.escape(value);
            regex = regex.replace(/%/g, '.*').replace(/_/g, '.');
            regex = new RegExp('^' + regex + '$', sensitive);

            if ('object' === typeof d) {
                return function(elem) {
                    var i, len;
                    len = d.length;
                    for (i = 0; i < len; i++) {
                        if ('undefined' !== typeof elem[d[i]]) {
                            if (regex.test(elem[d[i]])) {
                                return elem;
                            }
                        }
                    }
                };
            }
            else if (d === '*') {
                return function(elem) {
                    var d;
                    for (d in elem) {
                        if ('undefined' !== typeof elem[d]) {
                            if (regex.test(elem[d])) {
                                return elem;
                            }
                        }
                    }
                };
            }
            else {
                return function(elem) {
                    if ('undefined' !== typeof elem[d]) {
                        if (regex.test(elem[d])) {
                            return elem;
                        }
                    }
                };
            }
        }

        // Like operator (Case Sensitive).
        this.filters['LIKE'] = function likeOperator(d, value, comparator) {
            return generalLike(d, value, comparator);
        };

        // Like operator (Case Insensitive).
        this.filters['iLIKE'] = function likeOperatorI(d, value, comparator) {
            return generalLike(d, value, comparator, 'i');
        };

    };

    // ## METHODS

    /**
     * ### NDDB.throwErr
     *
     * Throws an error with a predefined format
     *
     * The format is "constructor name" . "method name" : "error text" .
     *
     * It does **not** perform type checking on itw own input parameters.
     *
     * @param {string} type Optional. The error type, e.g. 'TypeError'.
     *   Default, 'Error'
     * @param {string} method Optional. The name of the method
     * @param {string} text Optional. The error text. Default, 'generic error'
     */
    NDDB.prototype.throwErr = function(type, method, text) {
        var errMsg;
        text = text || 'generic error';
        errMsg = this._getConstrName();
        if (method) errMsg = errMsg + '.' + method;
        errMsg = errMsg + ': ' + text + '.';
        if (type === 'TypeError') throw new TypeError(errMsg);
        throw new Error(errMsg);
    };

    /**
     * ### NDDB.init
     *
     * Sets global options based on local configuration
     *
     * @param {object} options Optional. Configuration options
     *
     * TODO: type checking on input params
     */
    NDDB.prototype.init = function(options) {
        var filter, sh, i;
        var errMsg;
        options = options || {};

        this.__options = options;

        if (options.tags) {
            if ('object' !== typeof options.tags) {
                errMsg = 'options.tag must be object or undefined';
                this.throwErr('TypeError', 'init', errMsg);
            }
            this.tags = options.tags;
        }

        if ('undefined' !== typeof options.nddb_pointer) {
            if ('number' !== typeof options.nddb_pointer) {
                errMsg = 'options.nddb_pointer must be number or undefined';
                this.throwErr('TypeError', 'init', errMsg);
            }
            this.nddb_pointer = options.nddb_pointer;
        }

        if (options.hooks) {
            if ('object' !== typeof options.hooks) {
                errMsg = 'options.hooks must be object or undefined';
                this.throwErr('TypeError', 'init', errMsg);
            }
            this.hooks = options.hooks;
        }

        if (options.globalCompare) {
            if ('function' !== typeof options.globalCompare) {
                errMsg = 'options.globalCompare must be function or undefined';
                this.throwErr('TypeError', 'init', errMsg);
            }
            this.globalCompare = options.globalCompare;
        }

        if (options.update) {
            if ('object' !== typeof options.update) {
                errMsg = 'options.update must be object or undefined';
                this.throwErr('TypeError', 'init', errMsg);
            }
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

        if ('object' === typeof options.filters) {
            if ('object' !== typeof options.filters) {
                errMsg = 'options.filters must be object or undefined';
                this.throwErr('TypeError', 'init', errMsg);
            }
            for (filter in options.filters) {
                this.addFilter(filter, options.filters[filter]);
            }
        }

        if ('object' === typeof options.shared) {
            for (sh in options.shared) {
                if (options.shared.hasOwnProperty(sh)) {
                    this.__shared[sh] = options.shared[sh];
                }
            }
        }
        // Delete the shared object, it must not be copied by _cloneSettings_.
        delete this.__options.shared;

        if (options.log) {
            this.initLog(options.log, options.logCtx);
        }

        if (options.C) {
            if ('object' !== typeof options.C) {
                errMsg = 'options.C must be object or undefined';
                this.throwErr('TypeError', 'init', errMsg);
            }
            this.__C = options.C;
        }

        if (options.H) {
            if ('object' !== typeof options.H) {
                errMsg = 'options.H must be object or undefined';
                this.throwErr('TypeError', 'init', errMsg);
            }
            for (i in options.H) {
                if (options.H.hasOwnProperty(i)) {
                    this.hash(i, options.H[i]);
                }
            }
        }

        if (options.I) {
            if ('object' !== typeof options.I) {
                errMsg = 'options.I must be object or undefined';
                this.throwErr('TypeError', 'init', errMsg);
            }
            this.__I = options.I;
            for (i in options.I) {
                if (options.I.hasOwnProperty(i)) {
                    this.index(i, options.I[i]);
                }
            }
        }
        // Views must be created at the end because they are cloning
        // all the previous settings (the method would also pollute
        // this.__options if called before all options in init are set).
        if (options.V) {
            if ('object' !== typeof options.V) {
                errMsg = 'options.V must be object or undefined';
                this.throwErr('TypeError', 'init', errMsg);
            }
            this.__V = options.V;
            for (i in options.V) {
                if (options.V.hasOwnProperty(i)) {
                    this.view(i, options.V[i]);
                }
            }
        }

        if (options.formats) {
            if ('object' !== typeof options.formats) {
                errMsg = 'options.formats must be object or undefined';
                this.throwErr('TypeError', 'init', errMsg);
            }
            for (i in options.formats) {
                if (options.formats.hasOwnProperty(i)) {
                    this.addFormat(i, options.formats[i]);
                }
            }
        }
    };

    /**
     * ### NDDB.initLog
     *
     * Setups and external log function to be executed in the proper context
     *
     * @param {function} cb The logging function
     * @param {object} ctx Optional. The context of the log function
     */
    NDDB.prototype.initLog = function(cb, ctx) {
        if ('function' !== typeof cb) {
            this.throwErr('TypeError', 'initLog', 'cb must be function');
        }
        ctx = ctx || this;
        if ('function' !== typeof ctx && 'object' !== typeof ctx) {
            this.throwErr('TypeError', 'initLog', 'ctx must be object or ' +
                          'function');
        }
        this.log = function() {
            var args, i, len;
            len = arguments.length;
            args = new Array(len);
            for (i = 0; i < len; i++) {
                args[i] = arguments[i];
            }
            return cb.apply(ctx, args);
        };
    };

    /**
     * ### NDDB._getConstrName
     *
     * Returns 'NDDB' or the name of the inheriting class.
     */
    NDDB.prototype._getConstrName = function() {
        return this.constructor && this.constructor.name ?
            this.constructor.name : 'NDDB';
    };

    // ## CORE

    /**
     * ### NDDB._autoUpdate
     *
     * Performs a series of automatic checkings and updates the db
     *
     * Checkings are performed according to current configuration, or to
     * local options.
     *
     * @param {object} options Optional. Configuration object
     *
     * @api private
     */
    NDDB.prototype._autoUpdate = function(options) {
        var update = options ? J.merge(this.__update, options) : this.__update;

        if (update.pointer) {
            this.nddb_pointer = this.db.length-1;
        }
        if (update.sort) {
            this.sort();
        }

        if (update.indexes) {
            this.rebuildIndexes();
        }
    };

    /**
     * ### NDDB.importDB
     *
     * Imports an array of items at once
     *
     * @param {array} db Array of items to import
     */
    NDDB.prototype.importDB = function(db) {
        var i;
        if (!J.isArray(db)) {
            this.throwErr('TypeError', 'importDB', 'db must be array');
        }
        for (i = 0; i < db.length; i++) {
            nddb_insert.call(this, db[i], this.__update.indexes);
        }
        this._autoUpdate({indexes: false});
    };

    /**
     * ### NDDB.insert
     *
     * Insert an item into the database
     *
     * Item must be of type object or function.
     *
     * The following entries will be ignored:
     *
     *  - strings
     *  - numbers
     *  - undefined
     *  - null
     *
     * @param {object} o The item or array of items to insert
     * @see NDDB._insert
     */
    NDDB.prototype.insert = function(o) {
        nddb_insert.call(this, o, this.__update.indexes);
        this._autoUpdate({indexes: false});
    };

    /**
     * ### NDDB.size
     *
     * Returns the number of elements in the database
     *
     * It always returns the length of the full database, regardless of
     * current selection.
     *
     * @return {number} The length of the database
     *
     * @see NDDB.count
     */
    NDDB.prototype.size = function() {
        return this.db.length;
    };

    /**
     * ### NDDB.breed
     *
     * Creates a clone of the current NDDB object
     *
     * Takes care of calling the actual constructor of the class,
     * so that inheriting objects will preserve their prototype.
     *
     * @param {array} db Optional. Array of items to import in the new database.
     *   Default, items currently in the database
     *
     * @return {NDDB|object} The new database
     */
    NDDB.prototype.breed = function(db) {
        if (db && !J.isArray(db)) {
            this.throwErr('TypeError', 'importDB', 'db must be array ' +
                          'or undefined');
        }
        // In case the class was inherited.
        return new this.constructor(this.cloneSettings(), db || this.fetch());
    };

    /**
     * ### NDDB.cloneSettings
     *
     * Creates a clone of the configuration of this instance
     *
     * Clones:
     *  - the hashing, indexing, comparator, and view functions
     *  - the current tags
     *  - the update settings
     *  - the callback hooks
     *  - the globalCompare callback
     *
     * Copies by reference:
     *  - the shared objects
     *  - the log and logCtx options (might have cyclyc structures)
     *
     * It is possible to specifies the name of the properties to leave out
     * out of the cloned object as a parameter. By default, all options
     * are cloned.
     *
     * @param {object} leaveOut Optional. An object containing the name of
     *   the properties to leave out of the clone as keys.
     *
     * @return {object} options A copy of the current settings
     *   plus the shared objects
     */
    NDDB.prototype.cloneSettings = function(leaveOut) {
        var i, options, keepShared;
        var logCopy, logCtxCopy;
        options = this.__options || {};
        keepShared = true;

        options.H = this.__H;
        options.I = this.__I;
        options.C = this.__C;
        options.V = this.__V;
        options.tags = this.tags;
        options.update = this.__update;
        options.hooks = this.hooks;
        options.globalCompare = this.globalCompare;
        options.filters = this.__userDefinedFilters;
        options.formats = this.__formats;

        // Must be removed before cloning.
        if (options.log) {
            logCopy = options.log;
            delete options.log;
        }
        // Must be removed before cloning.
        if (options.logCtx) {
            logCtxCopy = options.logCtx;
            delete options.logCtx;
        }

        // Cloning.
        options = J.clone(options);

        // Removing unwanted options.
        for (i in leaveOut) {
            if (leaveOut.hasOwnProperty(i)) {
                if (i === 'shared') {
                    // 'shared' is not in `options`, we just have
                    // to remember not to add it later.
                    keepShared = false;
                    continue;
                }
                delete options[i];
            }
        }

        if (keepShared) {
            options.shared = this.__shared;
        }
        if (logCopy) {
            options.log = logCopy;
            this.__options.log = logCopy;
        }
        if (logCtxCopy) {
            options.logCtx = logCtxCopy;
            this.__options.logCtx = logCtxCopy;
        }
        return options;
    };

    /**
     * ### NDDB.toString
     *
     * Returns a human-readable representation of the database
     *
     * @return {string} out A human-readable representation of the database
     */
    NDDB.prototype.toString = function() {
        var out, i;
        out = '';
        for (i = 0; i < this.db.length; i++) {
            out += this.db[i] + "\n";
        }
        return out;
    };

    /**
     * ### NDDB.stringify
     *
     * Returns a machine-readable representation of the database
     *
     * Cyclic objects are decycled.
     *
     * @param {boolean} TRUE, if compressed
     *
     * @return {string} out A machine-readable representation of the database
     *
     * @see JSUS.stringify
     */
    NDDB.prototype.stringify = function(compressed) {
        var spaces, out;
        if (!this.size()) return '[]';
        compressed = ('undefined' === typeof compressed) ? true : compressed;

        spaces = compressed ? 0 : 4;

        out = '[';
        this.each(function(e) {
            // Decycle, if possible
            e = NDDB.decycle(e);
            out += J.stringify(e, spaces) + ', ';
        });
        out = out.replace(/, $/,']');

        return out;
    };

    /**
     * ### NDDB.comparator
     *
     * Registers a comparator function for dimension d
     *
     * Each time a comparison between two objects containing
     * property named as the specified dimension, the registered
     * comparator function will be used.
     *
     * @param {string} d The name of the dimension
     * @param {function} comparator The comparator function
     */
    NDDB.prototype.comparator = function(d, comparator) {
        if ('string' !== typeof d) {
            this.throwErr('TypeError', 'comparator', 'd must be string');
        }
        if ('function' !== typeof comparator) {
            this.throwErr('TypeError', 'comparator', 'comparator ' +
                          'must be function');
        }
        this.__C[d] = comparator;
    };

    /**
     * ### NDDB.getComparator
     *
     * Retrieves the comparator function for dimension d.
     *
     * If no comparator function is found, returns a general comparator
     * function. Supports nested attributes search, but if a property
     * containing dots with the same name is found, this will
     * returned first.
     *
     * The dimension can be the wildcard '*' or an array of dimesions.
     * In the latter case a custom comparator function is built on the fly.
     *
     * @param {string|array} d The name/s of the dimension/s
     * @return {function} The comparator function
     *
     * @see NDDB.compare
     */
    NDDB.prototype.getComparator = function(d) {
        var i, len, comparator, comparators;

        // Given field or '*'.
        if ('string' === typeof d) {
            if ('undefined' !== typeof this.__C[d]) {
                comparator = this.__C[d];
            }
            else {
                comparator = function generalComparator(o1, o2) {
                    var v1, v2;
                    if ('undefined' === typeof o1 &&
                        'undefined' === typeof o2) return 0;
                    if ('undefined' === typeof o1) return 1;
                    if ('undefined' === typeof o2) return -1;

                    if ('undefined' !== typeof o1[d]) {
                        v1 = o1[d];
                    }
                    else if (d.lastIndexOf('.') !== -1) {
                        v1 = J.getNestedValue(d, o1);
                    }

                    if ('undefined' !== typeof o2[d]) {
                        v2 = o2[d];
                    }
                    else if (d.lastIndexOf('.') !== -1) {
                        v2 = J.getNestedValue(d, o2);
                    }

                    if ('undefined' === typeof v1 &&
                        'undefined' === typeof v2) return 0;
                    if ('undefined' === typeof v1) return 1;
                    if ('undefined' === typeof v2) return -1;
                    if (v1 > v2) return 1;
                    if (v2 > v1) return -1;

                    // In case v1 and v2 are of different types
                    // they might not be equal here.
                    if (v2 === v1) return 0;

                    // Return 1 if everything else fails.
                    return 1;
                };
            }
        }
        // Pre-defined array o fields to check.
        else {
            // Creates the array of comparators functions.
            comparators = {};
            len = d.length;
            for (i = 0; i < len; i++) {
                // Every comparator has its own d in scope.
                // TODO: here there should be no wildcard '*' (check earlier)
                comparators[d[i]] = this.getComparator(d[i]);
            }

            comparator = function(o1, o2, trigger1, trigger2) {
                var i, res, obj;
                for (i in comparators) {
                    if (comparators.hasOwnProperty(i)) {
                        if ('undefined' === typeof o1[i]) continue;
                        obj = {};
                        obj[i] = o2;
                        res = comparators[i](o1, obj);
                        if (res === trigger1) return res;
                        if ('undefined' !== trigger2 && res === trigger2) {
                            return res;
                        }
                    }
                }
                // We are not interested in sorting.
                // Figuring out the right return value
                if (trigger1 === 0) {
                    return trigger2 === 1 ? -1 : 1;
                }
                if (trigger1 === 1) {
                    return trigger2 === 0 ? -1 : 0;
                }

                return trigger2 === 0 ? 1 : 0;

            };
        }
        return comparator;
    };

    /**
     * ### NDDB.isReservedWord
     *
     * Returns TRUE if a key is a reserved word
     *
     * A word is reserved if a property or a method with
     * the same name already exists in the current instance
     *
     * @param {string} key The name of the property
     *
     * @return {boolean} TRUE, if the property exists
     */
    NDDB.prototype.isReservedWord = function(key) {
        return (this[key]) ? true : false;
    };

    /**
     * ### NDDB.index
     *
     * Registers a new indexing function
     *
     * Indexing functions give fast direct access to the
     * entries of the dataset.
     *
     * A new object `NDDB[idx]` is created, whose properties
     * are the elements indexed by the function.
     *
     * An indexing function must return a _string_ with a unique name of
     * the property under which the entry will registered, or _undefined_ if
     * the entry does not need to be indexed.
     *
     * @param {string} idx The name of index
     * @param {function} func The hashing function
     *
     * @see NDDB.isReservedWord
     * @see NDDB.rebuildIndexes
     */
    NDDB.prototype.index = function(idx, func) {
        if (('string' !== typeof idx) && ('number' !== typeof idx)) {
            this.throwErr('TypeError', 'index', 'idx must be string or number');
        }
        if (this.isReservedWord(idx)) {
            this.throwErr('TypeError', 'index', 'idx is reserved word: ' + idx);
        }
        if ('function' !== typeof func) {
            this.throwErr('TypeError', 'index', 'func must be function');
        }
        this.__I[idx] = func, this[idx] = new NDDBIndex(idx, this);
    };

    /**
     * ### NDDB.view
     *
     * Registers a new view function
     *
     * View functions create a _view_ on the database that
     * excludes automatically some of the entries.
     *
     * A nested NDDB dataset is created as `NDDB[idx]`, containing
     * all the items that the callback function returns. If the
     * callback returns _undefined_ the entry will be ignored.
     *
     * @param {string} idx The name of index
     * @param {function} func The hashing function
     *
     * @see NDDB.hash
     * @see NDDB.isReservedWord
     * @see NDDB.rebuildIndexes
     */
    NDDB.prototype.view = function(idx, func) {
        var settings;
        if (('string' !== typeof idx) && ('number' !== typeof idx)) {
            this.throwErr('TypeError', 'view', 'idx must be string or number');
        }
        if (this.isReservedWord(idx)) {
            this.throwErr('TypeError', 'view', 'idx is reserved word: ' + idx);
        }
        if ('function' !== typeof func) {
            this.throwErr('TypeError', 'view', 'func must be function');
        }
        // Create a copy of the current settings, without the views
        // functions, else we create an infinite loop in the constructor.
        settings = this.cloneSettings( {V: ''} );
        this.__V[idx] = func, this[idx] = new NDDB(settings);
    };

    /**
     * ### NDDB.hash
     *
     * Registers a new hashing function
     *
     * Hash functions create an index containing multiple sub-_views_.
     *
     * A new object `NDDB[idx]` is created, whose properties
     * are _views_ on the original dataset.
     *
     * An hashing function must return a _string_ representing the
     * view under which the entry will be added, or _undefined_ if
     * the entry does not belong to any view of the index.
     *
     * @param {string} idx The name of index
     * @param {function} func The hashing function
     *
     * @see NDDB.view
     * @see NDDB.isReservedWord
     * @see NDDB.rebuildIndexes
     */
    NDDB.prototype.hash = function(idx, func) {
        if (('string' !== typeof idx) && ('number' !== typeof idx)) {
            this.throwErr('TypeError', 'hash', 'idx must be string or number');
        }
        if (this.isReservedWord(idx)) {
            this.throwErr('TypeError', 'hash', 'idx is reserved word: ' + idx);
        }
        if ('function' !== typeof func) {
            this.throwErr('TypeError', 'hash', 'func must be function');
        }
        this.__H[idx] = func, this[idx] = {};
    };

    /**
     * ### NDDB.resetIndexes
     *
     * Resets all the database indexes, hashs, and views
     *
     * @see NDDB.rebuildIndexes
     * @see NDDB.index
     * @see NDDB.view
     * @see NDDB.hash
     * @see NDDB._indexIt
     * @see NDDB._viewIt
     * @see NDDB._hashIt
     */
    NDDB.prototype.resetIndexes = function(options) {
        var key, reset;
        reset = options || J.merge({
            h: true,
            v: true,
            i: true
        }, options);

        if (reset.h) {
            for (key in this.__H) {
                if (this.__H.hasOwnProperty(key)) {
                    this[key] = {};
                }
            }
        }
        if (reset.v) {
            for (key in this.__V) {
                if (this.__V.hasOwnProperty(key)) {
                    this[key] = new this.constructor();
                }
            }
        }
        if (reset.i) {
            for (key in this.__I) {
                if (this.__I.hasOwnProperty(key)) {
                    this[key] = new NDDBIndex(key, this);
                }
            }
        }

    };

    /**
     * ### NDDB.rebuildIndexes
     *
     * Rebuilds all the database indexes, hashs, and views
     *
     * @see NDDB.resetIndexes
     * @see NDDB.index
     * @see NDDB.view
     * @see NDDB.hash
     * @see NDDB._indexIt
     * @see NDDB._viewIt
     * @see NDDB._hashIt
     */
    NDDB.prototype.rebuildIndexes = function() {
        var h = !(J.isEmpty(this.__H)),
        i = !(J.isEmpty(this.__I)),
        v = !(J.isEmpty(this.__V));

        var cb, idx;
        if (!h && !i && !v) return;

        if (h && !i && !v) {
            cb = this._hashIt;
        }
        else if (!h && i && !v) {
            cb = this._indexIt;
        }
        else if (!h && !i && v) {
            cb = this._viewIt;
        }
        else if (h && i && !v) {
            cb = function(o, idx) {
                this._hashIt(o);
                this._indexIt(o, idx);
            };
        }
        else if (!h && i && v) {
            cb = function(o, idx) {
                this._indexIt(o, idx);
                this._viewIt(o);
            };
        }
        else if (h && !i && v) {
            cb = function(o, idx) {
                this._hashIt(o);
                this._viewIt(o);
            };
        }
        else {
            cb = function(o, idx) {
                this._indexIt(o, idx);
                this._hashIt(o);
                this._viewIt(o);
            };
        }

        // Reset current indexes.
        this.resetIndexes({h: h, v: v, i: i});

        for (idx = 0 ; idx < this.db.length ; idx++) {
            // _hashIt and viewIt do not need idx, it is no harm anyway
            cb.call(this, this.db[idx], idx);
        }
    };

    /**
     * ### NDDB._indexIt
     *
     * Indexes an element
     *
     * Parameter _oldIdx_ is needed if indexing is updating a previously
     * indexed item. In fact if new index is different, the old one must
     * be deleted.
     *
     * @param {object} o The element to index
     * @param {number} dbidx The position of the element in the database array
     * @param {string} oldIdx Optional. The old index name, if any.
     */
    NDDB.prototype._indexIt = function(o, dbidx, oldIdx) {
        var func, index, key;
        if (!o || J.isEmpty(this.__I)) return;

        for (key in this.__I) {
            if (this.__I.hasOwnProperty(key)) {
                func = this.__I[key];
                index = func(o);
                // If the same object has been  previously
                // added with another index delete the old one.
                if (index !== oldIdx) {
                    if ('undefined' !== typeof oldIdx) {
                        if ('undefined' !== typeof this[key].resolve[oldIdx]) {
                            delete this[key].resolve[oldIdx];
                        }
                    }
                }
                if ('undefined' !== typeof index) {
                    if (!this[key]) this[key] = new NDDBIndex(key, this);
                    this[key]._add(index, dbidx);
                }
            }
        }
    };

    /**
     * ### NDDB._viewIt
     *
     * Adds an element to a view
     *
     * @param {object} o The element to index
     *
     * @see NDDB.view
     */
    NDDB.prototype._viewIt = function(o) {
        var func, index, key, settings;
        if (!o || J.isEmpty(this.__V)) return false;

        for (key in this.__V) {
            if (this.__V.hasOwnProperty(key)) {
                func = this.__V[key];
                index = func(o);
                if ('undefined' === typeof index) {
                    // Element must be deleted, if already in hash.
                    if (!this[key]) continue;
                    if ('undefined' !== typeof
                        this[key].nddbid.resolve[o._nddbid]) {

                        this[key].nddbid.remove(o._nddbid);
                    }
                    continue;
                }
                //this.__V[idx] = func, this[idx] = new this.constructor();
                if (!this[key]) {
                    // Create a copy of the current settings,
                    // without the views functions, otherwise
                    // we establish an infinite loop in the
                    // constructor, and the hooks.
                    settings = this.cloneSettings({ V: true, hooks: true });
                    this[key] = new NDDB(settings);
                }
                this[key].insert(o);
            }
        }
    };

    /**
     * ### NDDB._hashIt
     *
     * Hashes an element
     *
     * @param {object} o The element to hash
     *
     * @see NDDB.hash
     */
    NDDB.prototype._hashIt = function(o) {
        var h, hash, key, settings, oldHash;
        if (!o || J.isEmpty(this.__H)) return false;

        for (key in this.__H) {
            if (this.__H.hasOwnProperty(key)) {
                h = this.__H[key];
                hash = h(o);

                if ('undefined' === typeof hash) {
                    oldHash = this.hashtray.get(key, o._nddbid);
                    if (oldHash) {
                        this[key][oldHash].nddbid.remove(o._nddbid);
                        this.hashtray.remove(key, o._nddbid);
                    }
                    continue;
                }
                if (!this[key]) this[key] = {};

                if (!this[key][hash]) {
                    // Create a copy of the current settings,
                    // without the hashing functions, otherwise
                    // we create an infinite loop at first insert,
                    // and the hooks (should be called only on main db).
                    settings = this.cloneSettings({ H: true, hooks: true });
                    this[key][hash] = new NDDB(settings);
                }
                this[key][hash].insert(o);
                this.hashtray.set(key, o._nddbid, hash);
            }
        }
    };

    // ## Event emitter / listener

    /**
     * ### NDDB.on
     *
     * Registers an event listeners
     *
     * Available events:
     *
     *   - `insert`: each time an item is inserted
     *   - `remove`: each time an item, or a collection of items, is removed
     *   - `update`: each time an item is updated
     *
     * Examples.
     *
     * ```javascript
     * var db = new NDDB();
     *
     * var trashBin = new NDDB();
     *
     * db.on('insert', function(item) {
     *     item.id = getMyNextId();
     * });
     *
     * db.on('remove', function(array) {
     *     trashBin.importDB(array);
     * });
     * ```
     *
     * @param {string} event The name of an event: 'insert', 'update', 'remove'
     * @param {function} func The callback function associated to the event
     */
    NDDB.prototype.on = function(event, func) {
        if ('string' !== typeof event) {
            this.throwErr('TypeError', 'on', 'event must be string');
        }
        if ('function' !== typeof func) {
            this.throwErr('TypeError', 'on', 'func must be function');
        }
        if (!this.hooks[event]) {
            this.throwErr('TypeError', 'on', 'unknown event: ' + event);
        }
        this.hooks[event].push(func);
    };

    /**
     * ### NDDB.off
     *
     * Deregister an event, or an event listener
     *
     * @param {string} event The event name
     * @param {function} func Optional. The specific function to deregister.
     *   If empty, all the event listensers for `event` are cleared.
     *
     * @return {boolean} TRUE, if the removal is successful
     */
    NDDB.prototype.off = function(event, func) {
        var i;
        if ('string' !== typeof event) {
            this.throwErr('TypeError', 'off', 'event must be string');
        }
        if (func && 'function' !== typeof func) {
            this.throwErr('TypeError', 'off',
                          'func must be function or undefined');
        }
        if (!this.hooks[event]) {
            this.throwErr('TypeError', 'off', 'unknown event: ' + event);
        }
        if (!this.hooks[event].length) return false;

        if (!func) {
            this.hooks[event] = [];
            return true;
        }
        for (i = 0; i < this.hooks[event].length; i++) {
            if (this.hooks[event][i] == func) {
                this.hooks[event].splice(i, 1);
                return true;
            }
        }
        return false;
    };

    /**
     * ### NDDB.emit
     *
     * Fires all the listeners associated with an event (optimized)
     *
     * Accepts any number of parameters, the first one is the name
     * of the event, and the remaining will be passed to the event listeners.
     */
    NDDB.prototype.emit = function() {
        var event;
        var h, h2;
        var i, len, argLen, args;
        event = arguments[0];
        if ('string' !== typeof event) {
            this.throwErr('TypeError', 'emit', 'first argument must be string');
        }
        if (!this.hooks[event]) {
            this.throwErr('TypeError', 'emit', 'unknown event: ' + event);
        }
        len = this.hooks[event].length;
        if (!len) return;
        argLen = arguments.length;

        switch(len) {

        case 1:
            h = this.hooks[event][0];
            if (argLen === 1) h.call(this);
            else if (argLen === 2) h.call(this, arguments[1]);
            else if (argLen === 3) {
                h.call(this, arguments[1], arguments[2]);
            }
            else {
                args = new Array(argLen-1);
                for (i = 0; i < argLen; i++) {
                    args[i] = arguments[i+1];
                }
                h.apply(this, args);
            }
            break;
        case 2:
            h = this.hooks[event][0], h2 = this.hooks[event][1];
            if (argLen === 1) {
                h.call(this);
                h2.call(this);
            }
            else if (argLen === 2) {
                h.call(this, arguments[1]);
                h2.call(this, arguments[1]);
            }
            else if (argLen === 3) {
                h.call(this, arguments[1], arguments[2]);
                h2.call(this, arguments[1], arguments[2]);
            }
            else {
                args = new Array(argLen-1);
                for (i = 0; i < argLen; i++) {
                    args[i] = arguments[i+1];
                }
                h.apply(this, args);
                h2.apply(this, args);
            }
            break;
        default:

             if (argLen === 1) {
                 for (i = 0; i < len; i++) {
                     this.hooks[event][i].call(this);
                 }
            }
            else if (argLen === 2) {
                for (i = 0; i < len; i++) {
                    this.hooks[event][i].call(this, arguments[1]);
                }
            }
            else if (argLen === 3) {
                for (i = 0; i < len; i++) {
                    this.hooks[event][i].call(this, arguments[1], arguments[2]);
                }
            }
            else {
                args = new Array(argLen-1);
                for (i = 0; i < argLen; i++) {
                    args[i] = arguments[i+1];
                }
                for (i = 0; i < len; i++) {
                    this.hooks[event][i].apply(this, args);
                }

            }
        }
    };

    // ## Sort and Select

    function queryError(text, d, op, value) {
        var miss, err;
        miss = '(?)';
        err = this._getConstrName() + '._analyzeQuery: ' + text +
            '. Malformed query: ' + d || miss + ' ' + op || miss +
            ' ' + value || miss + '.';
        throw new Error(err);
    }

    /**
     * ### NDDB._analyzeQuery
     *
     * Validates and prepares select queries before execution
     *
     * @api private
     * @param {string} d The dimension of comparison
     * @param {string} op The operation to perform
     * @param {string} value The right-hand element of comparison
     * @return {boolean|object} The object-query or FALSE,
     *   if an error was detected
     */
    NDDB.prototype._analyzeQuery = function(d, op, value) {
        var i, len, errText;

        if ('undefined' === typeof d) {
            queryError.call(this, 'undefined dimension', d, op, value);
        }

        // Verify input.
        if ('undefined' !== typeof op) {

            if (op === '=') {
                op = '==';
            }
            else if (op === '!==') {
                op = '!=';
            }

            if (!(op in this.filters)) {
                queryError.call(this, 'unknown operator ' + op, d, op, value);
            }

            // Range-queries need an array as third parameter instance of Array.
            if (J.in_array(op,['><', '<>', 'in', '!in'])) {

                if (!(value instanceof Array)) {
                    errText = 'range-queries need an array as third parameter';
                    queryError.call(this, errText, d, op, value);
                }
                if (op === '<>' || op === '><') {

                    // It will be nested by the comparator function.
                    if (!J.isArray(d)){
                        // TODO: when to nest and when keep the '.' in the name?
                        value[0] = J.setNestedValue(d, value[0]);
                        value[1] = J.setNestedValue(d, value[1]);
                    }
                }
            }

            else if (J.in_array(op, ['!=', '>', '==', '>=', '<', '<='])){
                // Comparison queries need a third parameter.
                if ('undefined' === typeof value) {
                    errText = 'value cannot be undefined in comparison queries';
                    queryError.call(this, errText, d, op, value);
                }
                // TODO: when to nest and when keep the '.' in the name?
                // Comparison queries need to have the same
                // data structure in the compared object
                if (J.isArray(d)) {
                    len = d.length;
                    for (i = 0; i < len; i++) {
                        J.setNestedValue(d[i],value);
                    }

                }
                else {
                    value = J.setNestedValue(d,value);
                }
            }

            // other (e.g. user-defined) operators do not have constraints,
            // e.g. no need to transform the value

        }
        else if ('undefined' !== typeof value) {
            errText = 'undefined filter and defined value';
            queryError.call(this, errText, d, op, value);
        }
        else {
            op = 'E'; // exists
            value = '';
        }

        return { d:d, op:op, value:value };
    };

    /**
     * ### NDDB.distinct
     *
     * Eliminates duplicated entries
     *
     * A new database is returned and the original stays unchanged
     *
     * @return {NDDB} A copy of the current selection without duplicated entries
     *
     * @see NDDB.select()
     * @see NDDB.fetch()
     * @see NDDB.fetchValues()
     */
    NDDB.prototype.distinct = function() {
        return this.breed(J.distinct(this.db));
    };

    /**
     * ### NDDB.select
     *
     * Initiates a new query selection procedure
     *
     * Input parameters:
     *
     * - d: string representation of the dimension used to filter. Mandatory.
     * - op: operator for selection. Allowed: >, <, >=, <=, = (same as ==),
     *   ==, ===, !=, !==, in (in array), !in, >< (not in interval),
     *   <> (in interval)
     * - value: values of comparison. The following operators require
     *   an array: in, !in, ><, <>.
     *
     * Important!! No actual selection is performed until
     * the `execute` method is called, so that further selections
     * can be chained with the `or`, and `and` methods.
     *
     * To retrieve the items use one of the fetching methods.
     *
     * @param {string} d The dimension of comparison
     * @param {string} op Optional. The operation to perform
     * @param {mixed} value Optional. The right-hand element of comparison
     *
     * @return {NDDB} A new NDDB instance with the currently
     *   selected items in memory
     *
     * @see NDDB.and
     * @see NDDB.or
     * @see NDDB.execute()
     * @see NDDB.fetch()
     */
    NDDB.prototype.select = function(d, op, value) {
        this.query.reset();
        return arguments.length ? this.and(d, op, value) : this;
    };

    /**
     * ### NDDB.and
     *
     * Chains an AND query to the current selection
     *
     * @param {string} d The dimension of comparison
     * @param {string} op Optional. The operation to perform
     * @param {mixed} value Optional. The right-hand element of comparison
     *
     * @return {NDDB} A new NDDB instance with the currently
     *   selected items in memory
     *
     * @see NDDB.select
     * @see NDDB.or
     * @see NDDB.execute()
     */
    NDDB.prototype.and = function(d, op, value) {
        // TODO: Support for nested query
        //      if (!arguments.length) {
        //              addBreakInQuery();
        //      }
        //      else {
        var q, cb;
        q = this._analyzeQuery(d, op, value);
        cb = this.filters[q.op](q.d, q.value, this.getComparator(q.d));
        this.query.addCondition('AND', cb);
        //      }
        return this;
    };

    /**
     * ### NDDB.or
     *
     * Chains an OR query to the current selection
     *
     * @param {string} d The dimension of comparison
     * @param {string} op Optional. The operation to perform
     * @param {mixed} value Optional. The right-hand element of comparison
     *
     * @return {NDDB} A new NDDB instance with the currently
     *   selected items in memory
     *
     * @see NDDB.select
     * @see NDDB.and
     * @see NDDB.execute()
     */
    NDDB.prototype.or = function(d, op, value) {
        // TODO: Support for nested query
        //      if (!arguments.length) {
        //              addBreakInQuery();
        //      }
        //      else {
        var q, cb;
        q = this._analyzeQuery(d, op, value);
        cb = this.filters[q.op](q.d, q.value, this.getComparator(q.d));
        this.query.addCondition('OR', cb);
        //this.query.addCondition('OR', condition, this.getComparator(d));
        //      }
        return this;
    };


    /**
     * ### NDDB.selexec
     *
     * Shorthand for select and execute methods
     *
     * Adds a single select condition and executes it.
     *
     * @param {string} d The dimension of comparison
     * @param {string} op Optional. The operation to perform
     * @param {mixed} value Optional. The right-hand element of comparison
     *
     * @return {NDDB} A new NDDB instance with the currently
     *   selected items in memory
     *
     * @see NDDB.select
     * @see NDDB.and
     * @see NDDB.or
     * @see NDDB.execute
     * @see NDDB.fetch
     */
    NDDB.prototype.selexec = function(d, op, value) {
        return this.select(d, op, value).execute();
    };

    /**
     * ### NDDB.execute
     *
     * Returns a new NDDB instance containing only the items currently selected
     *
     * This method is deprecated and might not longer be supported in future
     * versions of NDDB. Use NDDB.breed instead.
     *
     * Does not reset the query object, and it is possible to reuse the current
     * selection multiple times.
     *
     * @param {string} d The dimension of comparison
     * @param {string} op Optional. The operation to perform
     * @param {mixed} value Optional. The right-hand element of comparison
     *
     * @return {NDDB} A new NDDB instance with selected items in the db
     *
     * @see NDDB.select
     * @see NDDB.selexec
     * @see NDDB.and
     * @see NDDB.or
     *
     * @deprecated
     */
    NDDB.prototype.execute = function() {
        return this.filter(this.query.get.call(this.query));
    };

    /**
     * ### NDDB.exists
     *
     * Returns TRUE if a copy of the object exists in the database / selection
     *
     * @param {object} o The object to look for
     *
     * @return {boolean} TRUE, if a copy is found
     *
     * @see JSUS.equals
     * @see NDDB.fetch
     */
    NDDB.prototype.exists = function(o) {
        var i, len, db;
        if ('object' !== typeof o && 'function' !== typeof o) {
            this.throwErr('TypeError', 'exists',
                          'o must be object or function');
        }
        db = this.fetch();
        len = db.length;
        for (i = 0 ; i < db.length ; i++) {
            if (J.equals(db[i], o)) {
                return true;
            }
        }
        return false;
    };

    /**
     * ### NDDB.limit
     *
     * Breeds a new NDDB instance with only the first N entries
     *
     * If a selection is active it will apply the limit to the
     * current selection only.
     *
     * If limit is a negative number, selection is made starting
     * from the end of the database.
     *
     * @param {number} limit The number of entries to include
     *
     * @return {NDDB} A "limited" copy of the current instance of NDDB
     *
     * @see NDDB.breed
     * @see NDDB.first
     * @see NDDB.last
     */
    NDDB.prototype.limit = function(limit) {
        var db;
        if ('number' !== typeof limit) {
            this.throwErr('TypeError', 'exists', 'limit must be number');
        }
        db = this.fetch();
        if (limit !== 0) {
            db = (limit > 0) ? db.slice(0, limit) : db.slice(limit);
        }
        return this.breed(db);
    };

    /**
     * ### NDDB.reverse
     *
     * Reverses the order of all the entries in the database / selection
     *
     * @see NDDB.sort
     */
    NDDB.prototype.reverse = function() {
        this.db.reverse();
        return this;
    };

    /**
     * ### NDDB.sort
     *
     * Sort the db according to one of the several criteria.
     *
     * Available sorting options:
     *
     *  - globalCompare function, if no parameter is passed
     *  - one of the dimension, if a string is passed
     *  - a custom comparator function
     *
     * A reference to the current NDDB object is returned, so that
     * further methods can be chained.
     *
     * Notice: the order of entries is changed.
     *
     * @param {string|array|function} d Optional. The criterium of sorting
     *
     * @return {NDDB} A sorted copy of the current instance of NDDB
     *
     * @see NDDB.globalCompare
     */
    NDDB.prototype.sort = function(d) {
        var func, that;

        // Global compare.
        if (!d) {
            func = this.globalCompare;
        }
        // User-defined function.
        else if ('function' === typeof d) {
            func = d;
        }
        // Array of dimensions.
        else if (d instanceof Array) {
            that = this;
            func = function(a,b) {
                var i, result;
                for (i = 0; i < d.length; i++) {
                    result = that.getComparator(d[i]).call(that, a, b);
                    if (result !== 0) return result;
                }
                return result;
            };
        }
        // Single dimension.
        else {
            func = this.getComparator(d);
        }

        this.db.sort(func);
        return this;
    };

    /**
     * ### NDDB.shuffle
     *
     * Returns a copy of the current database with randomly shuffled items
     *
     * @param {boolean} update Optional. If TRUE, items in the current database
     *   are also shuffled. Defaults, FALSE.
     *
     * @return {NDDB} A new instance of NDDB with the shuffled entries
     */
    NDDB.prototype.shuffle = function(update) {
        var shuffled;
        shuffled = J.shuffle(this.db);
        if (update) {
            this.db = shuffled;
            this.rebuildIndexes();
        }
        return this.breed(shuffled);
    };

    // ## Custom callbacks

    /**
     * ### NDDB.filter
     *
     * Filters the entries according to a user-defined function
     *
     * If a selection is active it will filter items only within the
     * current selection.
     *
     * A new NDDB instance is breeded.
     *
     * @param {function} func The filtering function
     *
     * @return {NDDB} A new instance of NDDB containing the filtered entries
     *
     * @see NDDB.breed
     */
    NDDB.prototype.filter = function(func) {
        return this.breed(this.fetch().filter(func));
    };

    /**
     * ### NDDB.each || NDDB.forEach (optimized)
     *
     * Applies a callback function to each element in the db
     *
     * If a selection is active, the callback will be applied to items
     * within the current selection only.
     *
     * It accepts a variable number of input arguments, but the first one
     * must be a valid callback, and all the following are passed as parameters
     * to the callback
     *
     * @see NDDB.map
     */
    NDDB.prototype.each = NDDB.prototype.forEach = function() {
        var func, i, db, len, args, argLen;
        func = arguments[0];
        if ('function' !== typeof func) {
            this.throwErr('TypeError', 'each',
                          'first argument must be function');
        }
        db = this.fetch();
        len = db.length;
        argLen = arguments.length;
        switch(argLen) {
        case 1:
            for (i = 0 ; i < len ; i++) {
                func.call(this, db[i]);
            }
            break;
        case 2:
            for (i = 0 ; i < len ; i++) {
                func.call(this, db[i], arguments[1]);
            }
            break;
        case 3:
            for (i = 0 ; i < len ; i++) {
                func.call(this, db[i], arguments[1], arguments[2]);
            }
            break;
        default:
            args = new Array(argLen+1);
            args[0] = null;
            for (i = 1; i < argLen; i++) {
                args[i] = arguments[i];
            }
            for (i = 0 ; i < len ; i++) {
                args[0] = db[i];
                func.apply(this, args);
            }
        }
    };

    /**
     * ### NDDB.map
     *
     * Applies a callback function to each element in the db, store
     * the results in an array and returns it.
     *
     * It accepts a variable number of input arguments, but the first one
     * must be a valid callback, and all the following are passed as parameters
     * to the callback
     *
     * @return {array} out The result of the mapping
     *
     * @see NDDB.each
     */
    NDDB.prototype.map = function() {
        var func, i, db, len, out, o;
        var args, argLen;
        func = arguments[0];
        if ('function' !== typeof func) {
            this.throwErr('TypeError', 'map',
                          'first argument must be function');
        }
        db = this.fetch();
        len = db.length;
        argLen = arguments.length;
        out = [];
        switch(argLen) {
        case 1:
            for (i = 0 ; i < len ; i++) {
                o = func.call(this, db[i]);
                if ('undefined' !== typeof o) out.push(o);
            }
            break;
        case 2:
            for (i = 0 ; i < len ; i++) {
                o = func.call(this, db[i], arguments[1]);
                if ('undefined' !== typeof o) out.push(o);
            }
            break;
        case 3:
            for (i = 0 ; i < len ; i++) {
                o = func.call(this, db[i], arguments[1], arguments[2]);
                if ('undefined' !== typeof o) out.push(o);
            }
            break;
        default:
            args = new Array(argLen+1);
            args[0] = null;
            for (i = 1; i < argLen; i++) {
                args[i] = arguments[i];
            }
            for (i = 0 ; i < len ; i++) {
                args[0] = db[i];
                o = func.apply(this, args);
                if ('undefined' !== typeof o) out.push(o);
            }
        }
        return out;
    };

    // ## Update

    /**
     * ### NDDB.update
     *
     * Updates all selected entries
     *
     * Mix ins the properties of the _update_ object in each
     * selected item.
     *
     * Properties from the _update_ object that are not found in
     * the selected items will be created.
     *
     * @param {object} update An object containing the properties
     *  that will be updated.
     *
     * @return {NDDB} A new instance of NDDB with updated entries
     *
     * @see JSUS.mixin
     */
    NDDB.prototype.update = function(update) {
        var i, len, db;
        if ('object' !== typeof update) {
            this.throwErr('TypeError', 'update', 'update must be object');
        }

        // Gets items and resets the current selection.
        db = this.fetch();
        if (db.length) {
            len = db.length;
            for (i = 0; i < len; i++) {
                this.emit('update', db[i], update);
                J.mixin(db[i], update);
                this._indexIt(db[i]);
                this._hashIt(db[i]);
                this._viewIt(db[i]);
            }
            this._autoUpdate({indexes: false});
        }
        return this;
    };

    //## Deletion

    /**
     * ### NDDB.removeAllEntries
     *
     * Removes all entries from the database
     *
     * @return {NDDB} A new instance of NDDB with no entries
     */
    NDDB.prototype.removeAllEntries = function() {
        if (!this.db.length) return this;
        this.emit('remove', this.db);
        this.nddbid.resolve = {};
        this.db = [];
        this._autoUpdate();
        return this;
    };

    /**
     * ### NDDB.clear
     *
     * Removes all volatile data
     *
     * Removes all entries, indexes, hashes, views, and tags,
     * and resets the current query selection
     *
     * Hooks, indexing, comparator, views, and hash functions are not deleted.
     *
     * Requires an additional parameter to confirm the deletion.
     *
     * @return {boolean} TRUE, if the database was cleared
     */
    NDDB.prototype.clear = function(confirm) {
        var i;
        if (confirm) {
            this.db = [];
            this.nddbid.resolve = {};
            this.tags = {};
            this.query.reset();
            this.nddb_pointer = 0;
            this.lastSelection = [];
            this.hashtray.clear();

            for (i in this.__H) {
                if (this[i]) delete this[i];
            }
            for (i in this.__C) {
                if (this[i]) delete this[i];
            }
            for (i in this.__I) {
                if (this[i]) delete this[i];
            }
        }
        else {
            this.log('Do you really want to clear the current dataset? ' +
                     'Please use clear(true)', 'WARN');
        }

        return confirm;
    };


    // ## Advanced operations

    /**
     * ### NDDB.join
     *
     * Performs a *left* join across all the entries of the database
     *
     * @param {string} key1 First property to compare
     * @param {string} key2 Second property to compare
     * @param {string} pos Optional. The property under which the join
     *   is performed. Defaults 'joined'
     * @param {string|array} select Optional. The properties to copy
     *   in the join. Defaults undefined
     *
     * @return {NDDB} A new database containing the joined entries
     *
     * @see NDDB._join
     * @see NDDB.breed
     *
     * TODO: allow join on multiple properties.
     */
    NDDB.prototype.join = function(key1, key2, pos, select) {
        // <!--
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
        // -->
        return this._join(key1, key2, J.equals, pos, select);
    };

    /**
     * ### NDDB.concat
     *
     * Copies the (sub)entries with 'key2' in all the entries with 'key1'
     *
     * Nested properties can be accessed with '.'.
     *
     * @param {string} key1 First property to compare
     * @param {string} key2 Second property to compare
     * @param {string} pos Optional. The property under which the join is
     *   performed. Defaults 'joined'
     * @param {string|array} select Optional. The properties to copy in
     *   the join. Defaults undefined
     *
     * @return {NDDB} A new database containing the concatenated entries
     *
     *  @see NDDB._join
     *  @see JSUS.join
     */
    NDDB.prototype.concat = function(key1, key2, pos, select) {
        return this._join(key1, key2, function(){ return true; }, pos, select);
    };

    /**
     * ### NDDB._join
     *
     * Performs a *left* join across all the entries of the database
     *
     * The values of two keys (also nested properties are accepted) are compared
     * according to the specified comparator callback, or using `JSUS.equals`.
     *
     * If the comparator function returns TRUE, matched entries are appended
     * as a new property of the matching one.
     *
     * By default, the full object is copied in the join, but it is possible to
     * specify the name of the properties to copy as an input parameter.
     *
     * A new NDDB object breeded, so that further methods can be chained.
     *
     * @param {string} key1 First property to compare
     * @param {string} key2 Second property to compare
     * @param {function} comparator Optional. A comparator function.
     *   Defaults, `JSUS.equals`
     * @param {string} pos Optional. The property under which the join
     *   is performed. Defaults 'joined'
     * @param {string|array} select Optional. The properties to copy
     *   in the join. Defaults undefined
     *
     * @return {NDDB} A new database containing the joined entries
     *
     * @see NDDB.breed
     *
     * @api private
     */
    NDDB.prototype._join = function(key1, key2, comparator, pos, select) {
        var out, idxs, foreign_key, key;
        var i, j, o, o2;
        if (!key1 || !key2) return this.breed([]);

        comparator = comparator || J.equals;
        pos = ('undefined' !== typeof pos) ? pos : 'joined';
        if (select) {
            select = (select instanceof Array) ? select : [select];
        }

        out = [], idxs = [];
        for (i = 0; i < this.db.length; i++) {

            foreign_key = J.getNestedValue(key1, this.db[i]);
            if ('undefined' !== typeof foreign_key) {
                for (j = i+1; j < this.db.length; j++) {

                    key = J.getNestedValue(key2, this.db[j]);

                    if ('undefined' !== typeof key) {
                        if (comparator(foreign_key, key)) {
                            // Inject the matched obj into the reference one.
                            o = J.clone(this.db[i]);
                            o2 = select ?
                                J.subobj(this.db[j], select) : this.db[j];
                            o[pos] = o2;
                            out.push(o);
                        }
                    }
                }
            }
        }
        return this.breed(out);
    };

    /**
     * ### NDDB.split
     *
     * Splits all the entries  containing the specified dimension
     *
     * If a active selection if found, operation is applied only to the subset.
     *
     * New entries are created and a new NDDB object is breeded
     * to allows method chaining.
     *
     * @param {string} key The dimension along which items will be split
     *
     * @return {NDDB} A new database containing the split entries
     *
     * @see JSUS.split
     */
    NDDB.prototype.split = function(key) {
        var out, i, db, len;
        if ('string' !== typeof key) {
            this.throwErr('TypeError', 'split', 'key must be string');
        }
        db = this.fetch();
        len = db.length;
        out = [];
        for (i = 0; i < len; i++) {
            out = out.concat(J.split(db[i], key));
        }
        return this.breed(out);
    };

    // ## Fetching

    /**
     * ### NDDB.fetch
     *
     * Returns array of selected entries in the database
     *
     * If no selection criteria is specified returns all entries.
     *
     * By default, it resets the current selection, and further calls to
     * `fetch` will return the full database.
     *
     * It stores a reference to the most recent array of selected items
     * under `this.lastSelection`.
     *
     * Examples:
     *
     * ```javascript
     * var db = new NDDB();
     * db.importDB([ { a: 1, b: {c: 2}, d: 3 } ]);
     *
     * db.fetch();    // [ { a: 1, b: {c: 2}, d: 3 } ]
     *
     * db.select('a', '=', 1);
     *
     * db.fetch(); // [ { a: 1 } ]
     * ```
     *
     * No further chaining is permitted after fetching.
     *
     * @param {boolean} doNotReset Optional. If TRUE, it does not reset
     *   the current selection. Default, TRUE
     *
     * @return {array} out The fetched values
     *
     * @see NDDB.fetchValues
     * @see NDDB.fetchArray
     * @see NDDB.fetchKeyArray
     * @see NDDB.fetchSubObj
     * @see NDDB.lastSelection
     */
    NDDB.prototype.fetch = function(doNotReset) {
        var db;
        if (this.db.length && this.query.query.length) {
            if (doNotReset && 'boolean' !== typeof doNotReset) {
                this.throwErr('TypeError', 'fetch',
                              'doNotReset must be undefined or boolean.');
            }
            db = this.db.filter(this.query.get.call(this.query));
            if (!doNotReset) this.query.reset();
        }
        else {
            db = this.db;
        }
        this.lastSelection = db;
        return db;
    };

    /**
     * ### NDDB.fetchSubObj
     *
     * Fetches all the entries in the database and trims out unwanted properties
     *
     * Examples
     *
     * ```javascript
     * var db = new NDDB();
     * db.insert([ { a:1, b:{c:2}, d:3 } ]);
     * db.insert([ { a:4, b:{c:5}, d:6 } ]);
     *
     * db.fetchSubObj('a'); // [ { a: 1} , {a: 4}]
     * ```
     *
     * No further chaining is permitted after fetching.
     *
     * @param {string|array} key Optional. If set, returned objects will
     *   have only such properties
     *
     * @return {array} out The fetched objects
     *
     * @see NDDB.fetch
     * @see NDDB.fetchValues
     * @see NDDB.fetchArray
     * @see NDDB.fetchKeyArray
     */
    NDDB.prototype.fetchSubObj= function(key) {
        var i, el, db, out;
        if (!key) return [];
        db = this.fetch(), out = [];
        for (i = 0; i < db.length; i++) {
            el = J.subobj(db[i], key);
            if (!J.isEmpty(el)) out.push(el);
        }
        return out;
    };


    /**
     * ### NDDB.fetchValues
     *
     * Fetches all the values of the entries in the database
     *
     * The type of the input parameter determines the return value:
     *  - `string`: returned value is a one-dimensional array.
     *  - `array`: returned value is an object whose properties
     *    are arrays containing all the values found for those keys.
     *
     * Nested properties can be specified too.
     *
     * Examples
     *
     * ```javascript
     * var db = new NDDB();
     * db.insert([ { a:1, b:{c:2}, d:3 } ]);
     *
     * db.fetchValues();    // [ [ 1, 2, 3 ] ]
     * db.fetchValues('b'); // { b: [ {c: 2} ] }
     * db.fetchValues('d'); // { d: [ 3 ] };
     *
     * db.insert([ { a:4, b:{c:5}, d:6 } ]);
     *
     * db.fetchValues([ 'a', 'd' ]); // { a: [ 1, 4] , d: [ 3, 6] };
     * ```
     *
     * No further chaining is permitted after fetching.
     *
     * @param {string|array} key Optional. If set, returns only
     *   the value from the specified property
     *
     * @return {array} out The fetched values
     *
     * @see NDDB.fetch
     * @see NDDB.fetchArray
     * @see NDDB.fetchKeyArray
     * @see NDDB.fetchSubObj
     */
    NDDB.prototype.fetchValues = function(key) {
        var db, el, i, out, typeofkey;

        db = this.fetch();

        typeofkey = typeof key, out = {};

        if (typeofkey === 'undefined') {
            for (i=0; i < db.length; i++) {
                J.augment(out, db[i], J.keys(db[i]));
            }
        }

        else if (typeofkey === 'string') {
            out[key] = [];
            for (i=0; i < db.length; i++) {
                el = J.getNestedValue(key, db[i]);
                if ('undefined' !== typeof el) {
                    out[key].push(el);
                }
            }
        }

        else if (J.isArray(key)) {
            out = J.melt(key, J.rep([], key.length)); // object not array
            for ( i = 0 ; i < db.length ; i++) {
                el = J.subobj(db[i], key);
                if (!J.isEmpty(el)) {
                    J.augment(out, el);
                }
            }
        }

        return out;
    };

    function getValuesArray(o, key) {
        return J.obj2Array(o, 1);
    }

    function getKeyValuesArray(o, key) {
        return J.obj2KeyedArray(o, 1);
    }


    function getValuesArray_KeyString(o, key) {
        var el = J.getNestedValue(key, o);
        if ('undefined' !== typeof el) {
            return J.obj2Array(el,1);
        }
    }

    function getValuesArray_KeyArray(o, key) {
        var el = J.subobj(o, key);
        if (!J.isEmpty(el)) {
            return J.obj2Array(el,1);
        }
    }


    function getKeyValuesArray_KeyString(o, key) {
        var el = J.getNestedValue(key, o);
        if ('undefined' !== typeof el) {
            return key.split('.').concat(J.obj2KeyedArray(el));
        }
    }

    function getKeyValuesArray_KeyArray(o, key) {
        var el = J.subobj(o, key);
        if (!J.isEmpty(el)) {
            return J.obj2KeyedArray(el);
        }
    }

    /**
     * ### NDDB._fetchArray
     *
     * Low level primitive for fetching the entities as arrays
     *
     * Examples
     *
     * ```javascript
     * var db = new NDDB();
     * var items = [{a:1, b:2}, {a:3, b:4}, {a:5, c:6}];
     * db.importDB(items);
     *
     * db._fetch(null, 'VALUES');
     * // [ [ 1, 2 ], [ 3, 4 ], [ 5, 6] ]
     *
     * db._fetch(null, 'KEY_VALUES');
     * // [ [ 'a', 1, 'b', 2 ], [ 'a', 3, 'b', 4 ], [ 'a', 5, 'c', 6 ] ]
     *
     * db._fetch('a', 'VALUES');
     * //  [ [ 1 ], [ 3 ], [ 5 ] ]
     *
     * db._fetch('a', 'KEY_VALUES');
     * // [ [ 'a', 1 ], [ 'a', 3 ], [ 'a', 5 ] ]
     *
     * db._fetch(['a','b'], 'VALUES');
     * //  [ [ 1 , 2], [ 3, 4 ], [ 5 ] ]
     *
     * db._fetch([ 'a', 'c'] 'KEY_VALUES');
     * // [ [ 'a', 1 ], [ 'a', 3 ], [ 'a', 5, 'c', 6 ] ]
     * ```
     *
     * No further chaining is permitted after fetching.
     *
     * @api private
     * @param {string|array} key Optional. If set, returns key/values only
     *   from the specified property
     * @param {boolean} keyed. Optional. If set, also the keys are returned
     *
     * @return {array} out The fetched values
     */
    NDDB.prototype._fetchArray = function(key, keyed) {
        var db, cb, out, el, i;

        if (keyed) {

            if (!key) cb = getKeyValuesArray;

            else if ('string' === typeof key) {
                cb = getKeyValuesArray_KeyString;
            }
            else {
                cb = getKeyValuesArray_KeyArray;
            }
        }
        else {
            if (!key) cb = getValuesArray;

            else if ('string' === typeof key) {
                cb = getValuesArray_KeyString;
            }
            else {
                cb = getValuesArray_KeyArray;
            }
        }

        db = this.fetch(), out = [];
        for (i = 0; i < db.length; i++) {
            el = cb.call(db[i], db[i], key);
            if ('undefined' !== typeof el) out.push(el);
        }

        return out;
    };

    /**
     * ### NDDB.fetchArray
     *
     * Fetches the entities in the database as arrays instead of objects
     *
     * Examples
     *
     * ```javascript
     * var db = new NDDB();
     * db.insert([ { a:1, b:{c:2}, d:3 } ]);
     * db.insert([ { a:4, b:{c:5}, d:6 } ]);
     *
     * db.fetchArray();     // [ [ 1, 'c', 2, 3 ],  ]
     * db.fetchArray('b');  // [ [ 'c', 2 ] ]
     * db.fetchArray('d');  // [ [ 3 ] ]
     * ```
     *
     * No further chaining is permitted after fetching.
     *
     * @see NDDB._fetchArray
     * @see NDDB.fetchValues
     * @see NDDB.fetchKeyArray
     * @see NDDB.fetchSubObj
     */
    NDDB.prototype.fetchArray = function(key) {
        return this._fetchArray(key);
    };

    /**
     * ### NDDB.fetchKeyArray
     *
     * Like NDDB.fetchArray, but also the keys are added
     *
     * Examples
     *
     * ```javascript
     * var db = new NDDB();
     * db.insert([ { a:1, b:{c:2}, d:3 } ]);
     *
     * db.fetchKeyArray();       // [ [ 'a', 1, 'c', 2, 'd', 3 ] ]
     * db.fetchKeyArray('b'); // [ [ 'b', 'c', 2 ] ]
     * db.fetchKeyArray('d');    // [ [ 'd', 3 ] ]
     * ```
     *
     * No further chaining is permitted after fetching.
     *
     * @param {string} key Optional. If set, returns only the value
     *   from the specified property
     *
     * @return {array} out The fetched values
     *
     * @see NDDB._fetchArray
     * @see NDDB.fetchArray
     * @see NDDB.fetchValues
     * @see NDDB.fetchSubObj
     */
    NDDB.prototype.fetchKeyArray = function(key) {
        return this._fetchArray(key, true);
    };

    /**
     * ### NDDB.groupBy
     *
     * Splits the entries in the database in subgroups
     *
     * Each subgroup is formed up by elements which have the
     * same value along the specified dimension.
     *
     * An array of NDDB instances is returned, therefore no direct
     * method chaining is allowed afterwards.
     *
     * Entries containing undefined values in the specified
     * dimension will be skipped
     *
     * Examples
     *
     * ```javascript
     * var db = new NDDB();
     * var items = [{a:1, b:2}, {a:3, b:4}, {a:5}, {a:6, b:2}];
     * db.importDB(items);
     *
     * var groups = db.groupBy('b');
     * groups.length; // 2
     *
     * groups[0].fetch(); // [ { a: 1, b: 2 }, { a: 6, b: 2 } ]
     *
     * groups[1].fetch(); // [ { a: 3, b: 4 } ]
     * ```
     *
     * @param {string} key If the dimension for grouping
     *
     * @return {array} outs The array of NDDB (or constructor) groups
     */
    NDDB.prototype.groupBy = function(key) {
        var groups, outs, i, el, out, db;
        db = this.fetch();
        if (!key) return db;

        groups = [], outs = [];
        for (i = 0 ; i < db.length ; i++) {
            el = J.getNestedValue(key, db[i]);
            if ('undefined' === typeof el) continue;
            // Creates a new group and add entries to it.
            if (!J.in_array(el, groups)) {
                groups.push(el);
                out = this.filter(function(elem) {
                    if (J.equals(J.getNestedValue(key, elem), el)) {
                        return elem;
                    }
                });
                // Reset nddb_pointer in subgroups.
                out.nddb_pointer = 0;
                outs.push(out);
            }
        }
        return outs;
    };

    // ## Statistics

    /**
     * ### NDDB.count
     *
     * Counts the entries containing the specified key
     *
     * If key is undefined, the size of the databse is returned.
     *
     * @param {string} key The dimension to count
     *
     * @return {number} count The number of items along the specified dimension
     *
     * @see NDDB.size
     */
    NDDB.prototype.count = function(key) {
        var i, count, len, db;
        db = this.fetch();
        len = db.length;
        if ('undefined' === typeof key) return len;
        if ('string' !== typeof key) {
            this.throwErr('TypeError', 'count',
                          'key must be string or undefined');
        }
        count = 0;
        for (i = 0; i < len; i++) {
            if (J.hasOwnNestedProperty(key, db[i])){
                count++;
            }
        }
        return count;
    };

    /**
     * ### NDDB.sum
     *
     * Returns the sum of the values of all the entries with the specified key
     *
     * Non numeric values are ignored.
     *
     * @param {string} key The dimension to sum
     *
     * @return {number} sum The sum of the values for the dimension,
     *   or NaN if it does not exist
     */
    NDDB.prototype.sum = function(key) {
        var sum, i, len, tmp, db;
        if ('string' !== typeof key) {
            this.throwErr('TypeError', 'sum', 'key must be string');
        }
        db = this.fetch(), len = db.length, sum = NaN;
        for (i = 0; i < len; i++) {
            tmp = J.getNestedValue(key, db[i]);
            if (!isNaN(tmp)) {
                if (isNaN(sum)) sum = 0;
                sum += tmp;
            }
        }
        return sum;
    };

    /**
     * ### NDDB.mean
     *
     * Returns the mean of the values of all the entries with the specified key
     *
     * Entries with non numeric values are ignored, and excluded
     * from the computation of the mean.
     *
     * @param {string} key The dimension to average
     *
     * @return {number} The mean of the values for the dimension,
     *   or NaN if it does not exist
     */
    NDDB.prototype.mean = function(key) {
        var sum, count, tmp, db;
        var i, len;
        if ('string' !== typeof key) {
            this.throwErr('TypeError', 'mean', 'key must be string');
        }
        db = this.fetch();
        len = db.length;
        sum = 0, count = 0;
        for (i = 0; i < len; i++) {
            tmp = J.getNestedValue(key, db[i]);
            if (!isNaN(tmp)) {
                sum += tmp;
                count++;
            }
        }
        return (count === 0) ? NaN : sum / count;
    };

    /**
     * ### NDDB.stddev
     *
     * Returns the std. dev. of the values of the entries with the specified key
     *
     * It uses the computational formula for sample standard deviation,
     * using N - 1 at the denominator of the sum of squares.
     *
     * Entries with non numeric values are ignored, and excluded
     * from the computation of the standard deviation.
     *
     * @param {string} key The dimension to average
     *
     * @return {number} The standard deviations of the values for the dimension,
     *   or NaN if it does not exist
     */
    NDDB.prototype.stddev = function(key) {
        var count, tmp, db, i, len;
        var sum, sumSquared;
        if ('string' !== typeof key) {
            this.throwErr('TypeError', 'stddev', 'key must be string');
        }
        db = this.fetch();
        len = db.length;
        if (!len || len === 1) return NaN;
        i = -1;
        sum = 0, sumSquared = 0, count = 0;
        for ( ; ++i < len ; ) {
            tmp = J.getNestedValue(key, db[i]);
            if (!isNaN(tmp)) {
                count++;
                sum += tmp;
                sumSquared += Math.pow(tmp, 2);
            }
        }
        tmp = sumSquared - (Math.pow(sum, 2) / count);
        return Math.sqrt( tmp / (count - 1) );
    };

    /**
     * ### NDDB.min
     *
     * Returns the min of the values of all the entries
     * in the database containing the specified key.
     *
     * Entries with non numeric values are ignored.
     *
     * @param {string} key The dimension of which to find the min
     *
     * @return {number} The smallest value for the dimension,
     *   or NaN if it does not exist
     *
     * @see NDDB.max
     */
    NDDB.prototype.min = function(key) {
        var min, tmp, db, i, len;
        if ('string' !== typeof key) {
            this.throwErr('TypeError', 'min', 'key must be string');
        }
        db = this.fetch();
        len = db.length;
        min = NaN;
        for (i = 0; i < len; i++) {
            tmp = J.getNestedValue(key, db[i]);
            if (!isNaN(tmp) && (tmp < min || isNaN(min))) {
                min = tmp;
            }
        }
        return min;
    };

    /**
     * ### NDDB.max
     *
     * Returns the max of the values of all the entries
     * in the database containing the specified key.
     *
     * Entries with non numeric values are ignored.
     *
     * @param {string} key The dimension of which to find the max
     *
     * @return {number} The biggest value for the dimension,
     *   or NaN if it does not exist
     *
     * @see NDDB.min
     */
    NDDB.prototype.max = function(key) {
        var max, i, len, tmp, db;
        if ('string' !== typeof key) {
            this.throwErr('TypeError', 'max', 'key must be string');
        }
        db = this.fetch();
        len = db.length;
        max = NaN;
        for (i = 0; i < len; i++) {
            tmp = J.getNestedValue(key, db[i]);
            if (!isNaN(tmp) && (tmp > max || isNaN(max))) {
                max = tmp;
            }
        }
        return max;
    };

    // ## Skim

    /**
     * ### NDDB.skim
     *
     * Removes the specified properties from the items
     *
     * If a active selection if found, operation is applied only to the subset.
     *
     * Use '.' (dot) to point to a nested property.
     *
     * Items with no property are automatically removed.
     *
     * @param {string|array} skim The selection of properties to remove
     *
     * @return {NDDB} A new database containing the result of the skim
     *
     * @see NDDB.keep
     * @see JSUS.skim
     */
    NDDB.prototype.skim = function(skim) {
        if ('string' !== typeof skim && !J.isArray(skim)) {
            this.throwErr('TypeError', 'skim', 'skim must be string or array');
        }
        return this.breed(this.map(function(e){
            var skimmed = J.skim(e, skim);
            if (!J.isEmpty(skimmed)) {
                return skimmed;
            }
        }));
    };

    /**
     * ### NDDB.keep
     *
     * Removes all the properties that are not specified from the items
     *
     * If a active selection if found, operation is applied only to the subset.
     *
     * Use '.' (dot) to point to a nested property.
     *
     * Items with no property are automatically removed.
     *
     * @param {string|array} skim The selection of properties to keep

     * @return {NDDB} A new database containing the result of the keep operation
     *
     * @see NDDB.skim
     * @see JSUS.keep
     */
    NDDB.prototype.keep = function(keep) {
        if ('string' !== typeof keep && !J.isArray(keep)) {
            this.throwErr('TypeError', 'keep', 'keep must be string or array');
        }
        return this.breed(this.map(function(e){
            var subobj = J.subobj(e, keep);
            if (!J.isEmpty(subobj)) {
                return subobj;
            }
        }));
    };

    // ## Diff


    /**
     * ### NDDB.diff
     *
     * Performs a diff of the entries of a specified databases
     *
     * Returns a new NDDB instance containing all the entries that
     * are present in the current instance, and *not* in the
     * database obj passed as parameter.
     *
     * @param {NDDB|array} nddb The external database to compare
     *
     * @return {NDDB} A new database containing the result of the diff
     *
     * @see NDDB.intersect
     * @see JSUS.arrayDiff
     */
    NDDB.prototype.diff = function(nddb) {
        if (!J.isArray(nddb)) {
            if ('object' !== typeof nddb || !J.isArray(nddb.db)) {
                this.throwErr('TypeError', 'diff',
                              'nddb must be array or NDDB');
            }
            nddb = nddb.db;
        }
        if (!nddb.length) {
            return this.breed([]);
        }
        return this.breed(J.arrayDiff(this.fetch(), nddb));
    };

    /**
     * ### NDDB.intersect
     *
     * Finds the entries in common with a specified database
     *
     * Returns a new NDDB instance containing all the entries that
     * are present both in the current instance of NDDB and in the
     * database obj passed as parameter.
     *
     * @param {NDDB|array} nddb The external database to compare
     *
     * @return {NDDB} A new database containing the result of the intersection
     *
     * @see NDDB.diff
     * @see JSUS.arrayIntersect
     */
    NDDB.prototype.intersect = function(nddb) {
        if (!J.isArray(nddb)) {
            if ('object' !== typeof nddb || !J.isArray(nddb.db)) {
                this.throwErr('TypeError', 'intersect',
                              'nddb must be array or NDDB');
            }
            nddb = nddb.db;
        }
        if (!nddb.length) {
            return this.breed([]);
        }
        return this.breed(J.arrayIntersect(this.fetch(), nddb));
    };


    // ## Iterator

    /**
     * ### NDDB.get
     *
     * Returns the entry at the given numerical position
     *
     * @param {number} pos The position of the entry
     *
     * @return {object|undefined} The requested item, or undefined if
     *  the index is invalid
     */
    NDDB.prototype.get = function(pos) {
        if ('number' !== typeof pos) {
            this.throwErr('TypeError', 'get', 'pos must be number');
        }
        return this.db[pos];
    };

    /**
     * ### NDDB.current
     *
     * Returns the entry at which the iterator is currently pointing
     *
     * The pointer is *not* updated.
     *
     * @return {object|undefined} The current entry, or undefined if the
     *   pointer is at an invalid position
     */
    NDDB.prototype.current = function() {
        return this.db[this.nddb_pointer];
    };

    /**
     * ### NDDB.next
     *
     * Moves the pointer to the next entry in the database and returns it
     *
     * @return {object|undefined} The next entry, or undefined
     *   if none is found
     *
     * @see NDDB.previous
     */
    NDDB.prototype.next = function() {
        var el;
        this.nddb_pointer++;
        el = NDDB.prototype.current.call(this);
        if (!el) this.nddb_pointer--;
        return el;
    };

    /**
     * ### NDDB.previous
     *
     * Moves the pointer to the previous entry in the database and returns it
     *
     * @return {object|undefined} The previous entry, or undefined
     *   if none is found
     *
     * @see NDDB.next
     */
    NDDB.prototype.previous = function() {
        var el;
        this.nddb_pointer--;
        el = NDDB.prototype.current.call(this);
        if (!el) this.nddb_pointer++;
        return el;
    };

    /**
     * ### NDDB.first
     *
     * Returns the last entry in the current selection / database
     *
     * Returns undefined if the current selection / database is empty.
     *
     * @param {string} updatePointer Optional. If set, the pointer
     *   is not moved to the first entry (if any)
     *
     * @return {object} The first entry found
     *
     * @see NDDB.last
     * @see NDDB.fetch
     * @see NDDB.nddb_pointer
     */
    NDDB.prototype.first = function(doNotUpdatePointer) {
        var db = this.fetch();
        if (db.length) {
            if (!doNotUpdatePointer) this.nddb_pointer = 0;
            return db[0];
        }
        return undefined;
    };

    /**
     * ### NDDB.last
     *
     * Returns the last entry in the current selection / database
     *
     * Returns undefined if the current selection / database is empty.
     *
     * @param {string} doNotUpdatePointer Optional. If set, the pointer is not
     *   moved to the last entry (if any)
     *
     * @return {object} The last entry found
     *
     * @see NDDB.first
     * @see NDDB.fetch
     * @see NDDB.nddb_pointer
     */
    NDDB.prototype.last = function(doNotUpdatePointer) {
        var db = this.fetch();
        if (db.length) {
            if (!doNotUpdatePointer) this.nddb_pointer = db.length-1;
            return db[db.length-1];
        }
        return undefined;
    };

    // ## Tagging


    /**
     * ### NDDB.tag
     *
     * Registers a tag associated to an object
     *
     * The second parameter can be the index of an object
     * in the database, the object itself, or undefined. In
     * the latter case, the current value of `nddb_pointer`
     * is used to create the reference.
     *
     * The tag is independent from sorting and deleting operations,
     * but changes on update of the elements of the database.
     *
     * @param {string|number} tag An alphanumeric id
     * @param {mixed} idx Optional. The reference to the object.
     *   Defaults, `nddb_pointer`
     * @return {object} ref A reference to the tagged object
     *
     * @see NDDB.resolveTag
     */
    NDDB.prototype.tag = function(tag, idx) {
        var ref, typeofIdx;
        if ('string' !== typeof tag && 'number' !== typeof tag) {
            this.throwErr('TypeError', 'tag', 'tag must be string or number');
        }

        ref = null, typeofIdx = typeof idx;

        if (typeofIdx === 'undefined') {
            ref = this.db[this.nddb_pointer];
        }
        else if (typeofIdx === 'number') {

            if (idx > this.length || idx < 0) {
                this.throwErr('Error', 'tag', 'invalid index provided: ' + idx);
            }
            ref = this.db[idx];
        }
        else {
            ref = idx;
        }

        this.tags[tag] = ref;
        return ref;
    };

    /**
     * ### NDDB.resolveTag
     *
     * Returns the element associated with the given tag.
     *
     * @param {string} tag An alphanumeric id
     *
     * @return {object} The object associated with the tag
     *
     * @see NDDB.tag
     */
    NDDB.prototype.resolveTag = function(tag) {
        if ('string' !== typeof tag) {
            this.throwErr('TypeError', 'resolveTag', 'tag must be string');
        }
        return this.tags[tag];
    };

    // ## Save/Load.


    /**
     * ### NDDB.load
     *
     * Reads items in the specified format and loads them into db asynchronously
     *
     * @param {string} file The name of the file or other persistent storage
     * @param {object} options Optional. A configuration object. Available
     *    options are format-dependent.
     * @param {function} cb Optional. A callback function to execute at
     *    the end of the operation. If options is not specified,
     *    cb is the second parameter.
     *
     * @see NDDB.loadSync
     */
    NDDB.prototype.load = function(file, options, cb) {
        if (arguments.length === 2 && 'function' === typeof options) {
            cb = options;
            options = undefined;
        }
        executeSaveLoad(this, 'load', file, cb, options);
    };

    /**
     * ### NDDB.save
     *
     * Saves items in the specified format asynchronously
     *
     * @see NDDB.saveSync
     */
    NDDB.prototype.save = function(file, options, cb) {
        if (arguments.length === 2 && 'function' === typeof options) {
            cb = options;
            options = undefined;
        }
        executeSaveLoad(this, 'save', file, cb, options);
    };

    /**
     * ### NDDB.loadSync
     *
     * Reads items in the specified format and loads them into db synchronously
     *
     * @see NDDB.load
     */
    NDDB.prototype.loadSync = function(file, options, cb) {
        if (arguments.length === 2 && 'function' === typeof options) {
            cb = options;
            options = undefined;
        }
        executeSaveLoad(this, 'loadSync', file, cb, options);
    };

    /**
     * ### NDDB.saveSync
     *
     * Saves items in the specified format synchronously
     *
     * @see NDDB.save
     */
    NDDB.prototype.saveSync = function(file, options, cb) {
        if (arguments.length === 2 && 'function' === typeof options) {
            cb = options;
            options = undefined;
        }
        executeSaveLoad(this, 'saveSync', file, cb, options);
    };

    // ## Formats.

    /**
     * ### NDDB.addFormat
     *
     * Registers a _format_ function
     *
     * The format object is of the type:
     *
     *     {
     *       load:     function() {}, // Async
     *       save:     function() {}, // Async
     *       loadSync: function() {}, // Sync
     *       saveSync: function() {}  // Sync
     *     }
     *
     * @param {string|array} format The format name/s
     * @param {object} The format object containing at least one
     *   pair of save/load functions (sync and async)
     */
    NDDB.prototype.addFormat = function(format, obj) {
        var f, i, len;
        validateFormatParameters(this, format, obj);
        if (!J.isArray(format)) format = [format];
        i = -1, len = format.length;
        for ( ; ++i < len ; ) {
            f = format[i];
            if ('string' !== typeof f || f.trim() === '') {
                this.throwErr('TypeError', 'addFormat', 'format must be ' +
                              'a non-empty string');
            }
            this.__formats[f] = obj;
        }
    };

    /**
     * ### NDDB.getFormat
     *
     * Returns the requested  _format_ function
     *
     * @param {string} format The format name
     * @param {string} method Optional. One of:
     *   `save`,`load`,`saveString`,`loadString`.
     *
     * @return {function|object} Format object or function or NULL if not found.
     */
    NDDB.prototype.getFormat = function(format, method) {
        var f;
        if ('string' !== typeof format) {
            this.throwErr('TypeError', 'getFormat', 'format must be string');
        }
        if (method && 'string' !== typeof method) {
            this.throwErr('TypeError', 'getFormat', 'method must be string ' +
                          'or undefined');
        }
        f = this.__formats[format];
        if (f && method) f = f[method];
        return f || null;
    };

    /**
     * ### NDDB.setDefaultFormat
     *
     * Sets the default format
     *
     * @param {string} format The format name or null
     *
     * @see NDDB.getDefaultFormat
     */
    NDDB.prototype.setDefaultFormat = function(format) {
         if (format !== null &&
            ('string' !== typeof format || format.trim() === '')) {

            this.throwErr('TypeError', 'setDefaultFormat', 'format must be ' +
                          'a non-empty string or null');
        }
        if (format && !this.__formats[format]) {
            this.throwErr('Error', 'setDefaultFormat', 'unknown format: ' +
                          format);
        }
        this.__defaultFormat = format;
    };

    /**
     * ### NDDB.getDefaultFormat
     *
     * Returns the default format
     *
     * @see NDDB.setDefaultFormat
     */
    NDDB.prototype.getDefaultFormat = function() {
        return this.__defaultFormat;
    };

    /**
     * ### NDDB.addDefaultFormats
     *
     * Dummy property. If overwritten it will be invoked by constructor
     */
    NDDB.prototype.addDefaultFormats = null;


    // ## Helper Methods


    /**
     * ### nddb_insert
     *
     * Insert an item into db and performs update operations
     *
     * A new property `.nddbid` is created in the object, and it will be
     * used to add the element into the global index: `NDDB.nddbid`.
     *
     * Emits the 'insert' event, and updates indexes, hashes and views
     * accordingly.
     *
     * @param {object|function} o The item to add to database
     * @param {boolean} update Optional. If TRUE, updates indexes, hashes,
     *    and views. Default, FALSE
     *
     * @see NDDB.nddbid
     * @see NDDB.emit
     *
     * @api private
     */
    function nddb_insert(o, update) {
        var nddbid;
        if (('object' !== typeof o) && ('function' !== typeof o)) {
            this.throwErr('TypeError', 'insert', 'object or function ' +
                          'expected, ' + typeof o + ' received.');
        }

        // Check / create a global index.
        if ('undefined' === typeof o._nddbid) {
            // Create internal idx.
            nddbid = J.uniqueKey(this.nddbid.resolve);
            if (!nddbid) {
                this.throwErr('Error', 'insert',
                              'failed to create index: ' + o);
            }
            if (df) {
                Object.defineProperty(o, '_nddbid', { value: nddbid });
            }
            else {
                o._nddbid = nddbid;
            }
        }
        // Add to index directly (bypass api).
        this.nddbid.resolve[o._nddbid] = this.db.length;
        // End create index.
        this.db.push(o);
        this.emit('insert', o);
        if (update) {
            this._indexIt(o, (this.db.length-1));
            this._hashIt(o);
            this._viewIt(o);
        }
    }

    /**
     * ### validateSaveLoadParameters
     *
     * Validates the parameters of a call to save, saveSync, load, loadSync
     *
     * @param {NDDB} that The reference to the current instance
     * @param {string} method The name of the method invoking validation
     * @param {string} file The file parameter
     * @param {function} cb The callback parameter
     * @param {object} The options parameter
     */
    function validateSaveLoadParameters(that, method, file, cb, options) {
        if ('string' !== typeof file || file.trim() === '') {
            that.throwErr('TypeError', method, 'file must be ' +
                          'a non-empty string');
        }
        if (cb && 'function' !== typeof cb) {
            that.throwErr('TypeError', method, 'cb must be function ' +
                          'or undefined');
        }
        if (options && 'object' !== typeof options) {
            that.throwErr('TypeError', method, 'options must be object ' +
                          'or undefined');
        }
    }

    /**
     * ### extractExtension
     *
     * Extracts the extension from a file name
     *
     * @param {string} file The filename
     *
     * @return {string} The extension or NULL if not found
     */
    function extractExtension(file) {
        var format;
        format = file.lastIndexOf('.');
        return format < 0 ? null : file.substr(format+1);
    }

    /**
     * ### executeSaveLoad
     *
     * Fetches the right format and executes save, saveSync, load, or loadSync
     *
     * @param {NDDB} that The reference to the current instance
     * @param {string} method The name of the method invoking validation
     * @param {string} file The file parameter
     * @param {function} cb The callback parameter
     * @param {object} The options parameter
     */
    function executeSaveLoad(that, method, file, cb, options) {
        var ff, format;
        validateSaveLoadParameters(that, method, file, cb, options);
        if (!that.storageAvailable()) {
            that.throwErr('Error', 'save', 'no persistent storage available');
        }
        options = options || {};
        format = extractExtension(file);
        // If try to get the format function based on the extension,
        // otherwise try to use the default one. Throws errors.
        ff = findFormatFunction(that, method, format);
        ff(that, file, cb, options);
    }

    /**
     * ### findFormatFunction
     *
     * Returns the requested format function or the default one
     *
     * Throws errors.
     *
     * @param {NDDB} that The reference to the current instance
     * @param {string} method The name of the method invoking validation
     * @param {string} format The requested parameter
     *
     * @return {function} The requested format function
     */
    function findFormatFunction(that, method, format) {
        var ff, defFormat;
        if (format) ff = that.getFormat(format);
        if (ff) {
            if (!ff[method]) {
                that.throwErr('Error', method, 'format ' + format + ' found, ' +
                              'but method ' + method + ' not available');
            }
            ff = ff[method];
        }
        // Try to get default format, if the extension is not recognized.
        if (!ff) {
            defFormat = that.getDefaultFormat();
            if (!defFormat) {
                that.throwErr('Error', method, 'format ' + format + ' not ' +
                              'found and no default format specified');
            }
            ff = that.getFormat(defFormat, method);
            if (!ff) {
                that.throwErr('Error', method, 'format ' + format + ' not ' +
                              'found, but default format has no method ' +
                              method);
            }
        }
        return ff;
    }
    /**
     * ### validateFormatParameters
     *
     * Validates the parameters of a call to save, saveSync, load, loadSync
     *
     * @param {NDDB} that The reference to the current instance
     * @param {string|array} method The name/s of format/s
     * @param {object} obj The format object
     */
    function validateFormatParameters(that, format, obj) {
        if ('string' !== typeof format &&
            !J.isArray(format) && !format.length) {

            that.throwErr('TypeError', 'addFormat', 'format must be ' +
                            'a non-empty string or array');
        }
        if ('object' !== typeof obj) {
            that.throwErr('TypeError', 'addFormat', 'obj must be object');
        }
        if (!obj.save && !obj.saveSync) {
            that.throwErr('Error', 'addFormat', 'format must ' +
                          'at least one save function: sync or async');
        }
        if (!obj.load && !obj.loadSync) {
            that.throwErr('Error', 'addFormat', 'format must ' +
                          'at least one load function: sync or async');
        }
        if (obj.save || obj.load) {
            if ('function' !== typeof obj.save) {
                that.throwErr('TypeError', 'addFormat',
                              'save function is not a function');
            }
            if ('function' !== typeof obj.load) {
                that.throwErr('TypeError', 'addFormat',
                              'load function is not a function');
            }
        }
        if (obj.saveSync || obj.loadSync) {
            if ('function' !== typeof obj.saveSync) {
                that.throwErr('TypeError', 'addFormat',
                              'saveSync function is not a function');
            }
            if ('function' !== typeof obj.loadSync) {
                that.throwErr('TypeError', 'addFormat',
                              'loadSync function is not a function');
            }
        }
    }

    /**
     * # QueryBuilder
     *
     * MIT Licensed
     *
     * Helper class for NDDB query selector
     *
     * ---
     */

    /**
     * ## QueryBuilder Constructor
     *
     * Manages the _select_ queries of NDDB
     */
    function QueryBuilder() {
        // Creates the query array and internal pointer.
        this.reset();
    }

    /**
     * ### QueryBuilder.addCondition
     *
     * Adds a new _select_ condition
     *
     * @param {string} type. The type of the operation (e.g. 'OR', or 'AND')
     * @param {function} filter. The filter callback
     */
    QueryBuilder.prototype.addCondition = function(type, filter) {
        this.query[this.pointer].push({
            type: type,
            cb: filter
        });
    };

    /**
     * ### QueryBuilder.addBreak
     *
     * undocumented
     */
    QueryBuilder.prototype.addBreak = function() {
        this.pointer++;
        this.query[this.pointer] = [];
    };

    /**
     * ### QueryBuilder.reset
     *
     * Resets the current query selection
     */
    QueryBuilder.prototype.reset = function() {
        this.query = [];
        this.pointer = 0;
        this.query[this.pointer] = [];
    };


    function findCallback(obj) {
        return obj.cb;
    }

    /**
     * ### QueryBuilder.get
     *
     * Builds up the select function
     *
     * Up to three conditions it builds up a custom function without
     * loop. For more than three conditions, a loop is created.
     *
     * Expressions are evaluated from right to left, so that the last one
     * always decides the overall logic value. E.g. :
     *
     *  true AND false OR true => false OR true => TRUE
     *  true AND true OR false => true OR false => TRUE
     *
     * @return {function} The select function containing all the specified
     *   conditions
     */
    QueryBuilder.prototype.get = function() {
        var line, lineLen, f1, f2, f3, type1, type2;
        var query = this.query, pointer = this.pointer;

        // Ready to support nested queries, not yet implemented.
        if (pointer === 0) {
            line = query[pointer];
            lineLen = line.length;

            if (lineLen === 1) {
                return findCallback(line[0]);
            }

            else if (lineLen === 2) {
                f1 = findCallback(line[0]);
                f2 = findCallback(line[1]);
                type1 = line[1].type;

                switch (type1) {
                case 'OR':
                    return function(elem) {
                        if ('undefined' !== typeof f1(elem)) return elem;
                        if ('undefined' !== typeof f2(elem)) return elem;
                    };
                case 'AND':
                    return function(elem) {
                        if ('undefined' !== typeof f1(elem) &&
                            'undefined' !== typeof f2(elem)) return elem;
                    };

                case 'NOT':
                    return function(elem) {
                        if ('undefined' !== typeof f1(elem) &&
                            'undefined' === typeof f2(elem)) return elem;
                    };
                }
            }

            else if (lineLen === 3) {
                f1 = findCallback(line[0]);
                f2 = findCallback(line[1]);
                f3 = findCallback(line[2]);
                type1 = line[1].type;
                type2 = line[2].type;
                type1 = type1 + '_' + type2;
                switch (type1) {
                case 'OR_OR':
                    return function(elem) {
                        if ('undefined' !== typeof f1(elem)) return elem;
                        if ('undefined' !== typeof f2(elem)) return elem;
                        if ('undefined' !== typeof f3(elem)) return elem;
                    };

                case 'OR_AND':
                    return function(elem) {

                        if ('undefined' === typeof f3(elem)) return;
                        if ('undefined' !== typeof f2(elem)) return elem;
                        if ('undefined' !== typeof f1(elem)) return elem;
                    };

                case 'AND_OR':
                    return function(elem) {
                        if ('undefined' !== typeof f3(elem)) return elem;
                        if ('undefined' === typeof f2(elem)) return;
                        if ('undefined' !== typeof f1(elem)) return elem;
                    };

                case 'AND_AND':
                    return function(elem) {
                        if ('undefined' === typeof f3(elem)) return;
                        if ('undefined' === typeof f2(elem)) return;
                        if ('undefined' !== typeof f1(elem)) return elem;
                    };
                }
            }

            else {
                return function(elem) {
                    var i, f, type, resOK;
                    var prevType = 'OR', prevResOK = true;
                    for (i = lineLen-1 ; i > -1 ; i--) {
                        f = findCallback(line[i]);
                        type = line[i].type,
                        resOK = 'undefined' !== typeof f(elem);

                        if (type === 'OR') {
                            // Current condition is TRUE OR
                            if (resOK) return elem;
                        }

                        // Current condition is FALSE AND
                        else if (type === 'AND') {
                            if (!resOK) {
                                return;
                            }
                            // Previous check was an AND or a FALSE OR
                            else if (prevType === 'OR' && !prevResOK) {
                                return;
                            }
                        }
                        prevType = type;
                        // A previous OR is TRUE also if follows a TRUE AND
                        prevResOK = type === 'AND' ? resOK : resOK || prevResOK;

                    }
                    return elem;
                };

            }

        }
    };

    /**
     * # NDDBHashtray
     *
     * MIT Licensed
     *
     * Helper class for NDDB hash management
     *
     * ---
     */

    /**
     * ## NDDBHashtray constructor
     *
     * Creates an hashtray object to manage maps item-hashes
     *
     * @param {string} The name of the index
     * @param {array} The reference to the original database
     */
    function NDDBHashtray() {
        this.resolve = {};
    }

    NDDBHashtray.prototype.set = function(key, nddbid, hash) {
        this.resolve[key + '_' + nddbid] = hash;
    };

    NDDBHashtray.prototype.get = function(key, nddbid) {
        return this.resolve[key + '_' + nddbid];
    };

    NDDBHashtray.prototype.remove = function(key, nddbid) {
        delete this.resolve[key + '_' + nddbid];
    };

    NDDBHashtray.prototype.clear = function() {
        this.resolve = {};
    };

    /**
     * # NDDBIndex
     *
     * MIT Licensed
     *
     * Helper class for NDDB indexing
     *
     * ---
     */

    /**
     * ## NDDBIndex Constructor
     *
     * Creates direct access index objects for NDDB
     *
     * @param {string} The name of the index
     * @param {array} The reference to the original database
     */
    function NDDBIndex(idx, nddb) {
        this.idx = idx;
        this.nddb = nddb;
        this.resolve = {};
    }

    /**
     * ### NDDBIndex._add
     *
     * Adds an item to the index
     *
     * @param {mixed} idx The id of the item
     * @param {number} dbidx The numerical id of the item in the original array
     */
    NDDBIndex.prototype._add = function(idx, dbidx) {
        this.resolve[idx] = dbidx;
    };

    /**
     * ### NDDBIndex._remove
     *
     * Adds an item to the index
     *
     * @param {mixed} idx The id to remove from the index
     */
    NDDBIndex.prototype._remove = function(idx) {
        delete this.resolve[idx];
    };

    /**
     * ### NDDBIndex.size
     *
     * Returns the size of the index
     *
     * @return {number} The number of elements in the index
     */
    NDDBIndex.prototype.size = function() {
        return J.size(this.resolve);
    };

    /**
     * ### NDDBIndex.get
     *
     * Gets the entry from database with the given id
     *
     * @param {mixed} idx The id of the item to get
     * @return {object|boolean} The indexed entry, or FALSE if index is invalid
     *
     * @see NDDB.index
     * @see NDDBIndex.remove
     * @see NDDBIndex.update
     */
    NDDBIndex.prototype.get = function(idx) {
        if ('undefined' === typeof this.resolve[idx]) return false;
        return this.nddb.db[this.resolve[idx]];
    };


    /**
     * ### NDDBIndex.remove
     *
     * Removes and entry from the database with the given id and returns it
     *
     * @param {mixed} idx The id of item to remove
     * @return {object|boolean} The removed item, or FALSE if index is invalid
     *
     * @see NDDB.index
     * @see NDDBIndex.get
     * @see NDDBIndex.update
     */
    NDDBIndex.prototype.remove = function(idx) {
        var o, dbidx;
        dbidx = this.resolve[idx];
        if ('undefined' === typeof dbidx) return false;
        o = this.nddb.db[dbidx];
        if ('undefined' === typeof o) return;
        this.nddb.db.splice(dbidx, 1);
        delete this.resolve[idx];
        this.nddb.emit('remove', o);
        this.nddb._autoUpdate();
        return o;
    };

    // ### NDDBIndex.pop
    // @deprecated
    NDDBIndex.prototype.pop = NDDBIndex.prototype.remove;

    /**
     * ### NDDBIndex.update
     *
     * Removes and entry from the database with the given id and returns it
     *
     * @param {mixed} idx The id of item to update
     * @return {object|boolean} The updated item, or FALSE if index is invalid
     *
     * @see NDDB.index
     * @see NDDBIndex.get
     * @see NDDBIndex.remove
     */
    NDDBIndex.prototype.update = function(idx, update) {
        var o, dbidx, nddb;
        dbidx = this.resolve[idx];
        if ('undefined' === typeof dbidx) return false;
        nddb = this.nddb;
        o = nddb.db[dbidx];
        nddb.emit('update', o, update);
        J.mixin(o, update);
        // We do indexes separately from the other components of _autoUpdate
        // to avoid looping through all the other elements that are unchanged.
        if (nddb.__update.indexes) {
            nddb._indexIt(o, dbidx, idx);
            nddb._hashIt(o);
            nddb._viewIt(o);
        }
        nddb._autoUpdate({indexes: false});
        return o;
    };

    /**
     * ### NDDBIndex.getAllKeys
     *
     * Returns the list of all keys in the index
     *
     * @return {array} The array of alphanumeric keys in the index
     *
     * @see NDDBIndex.getAllKeyElements
     */
    NDDBIndex.prototype.getAllKeys = function() {
        return J.keys(this.resolve);
    };

    /**
     * ### NDDBIndex.getAllKeyElements
     *
     * Returns all the elements indexed by their key in one object
     *
     * @return {object} The object of key-elements
     *
     * @see NDDBIndex.getAllKeys
     */
    NDDBIndex.prototype.getAllKeyElements = function() {
        var out = {}, idx;
        for (idx in this.resolve) {
            if (this.resolve.hasOwnProperty(idx)) {
                out[idx] = this.nddb.db[this.resolve[idx]];
            }
        }
        return out;
    };

})(
    ('undefined' !== typeof module && 'undefined' !== typeof module.exports) ?
        module.exports : window ,
    ('undefined' !== typeof module && 'undefined' !== typeof module.exports) ?
        module.parent.exports.JSUS || require('JSUS').JSUS : JSUS,
    ('object' === typeof module && 'function' === typeof require) ?
        module.parent.exports.store ||
        require('shelf.js/build/shelf-fs.js').store : this.store
);

/**
 * # nodeGame: Social Experiments in the Browser
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * nodeGame is a free, open source, event-driven javascript framework,
 * for real-time multiplayer games in the browser.
 */
(function(window) {
    if ('undefined' !== typeof window.node) {
        throw new Error('nodegame-client: a global node variable is already ' +
                        'defined. Aborting...');
    }

    // Defining an empty node object. Will be overwritten later on.
    var node = window.node = {};

    if ('undefined' !== typeof JSUS) node.JSUS = JSUS;
    if ('undefined' !== typeof NDDB) node.NDDB = NDDB;
    if ('undefined' !== typeof store) node.store = store;
    node.support = JSUS.compatibility();

    // Auto-Generated.
    node.version = '1.0.0';

})(window);

/**
 * # Variables
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` variables and constants module
 */
(function(node) {

    "use strict";

    // ## Constants

    var k = node.constants = {};

    /**
     * ### node.constants.nodename
     *
     * Default nodename if none is specified
     *
     * @see node.setup.nodename
     */
    k.nodename = 'ng';

    /**
     * ### node.constants.verbosity_levels
     *
     * ALWAYS, ERR, WARN, INFO, DEBUG
     */
    k.verbosity_levels = {
        ALWAYS: -Number.MAX_VALUE,
        error: -1,
        warn: 0,
        info: 1,
        silly: 10,
        debug: 100,
        NEVER: Number.MAX_VALUE
    };

    /**
     * ### node.constants.actions
     *
     * Collection of available nodeGame actions
     *
     * The action adds an initial semantic meaning to the
     * message. It specify the nature of requests
     * "Why the message was sent?"
     *
     * Semantics:
     *
     * - SET: Store / changes the value of a property in the receiver of the msg
     * - GET: Asks the value value of a property to the receiver of the msg
     * - SAY: Announces a change of state or property in the sender of the msg
     */
    k.action = {};

    k.action.SET = 'set';
    k.action.GET = 'get';
    k.action.SAY = 'say';

    /**
     * ### node.constants.target
     *
     * Collection of available nodeGame targets
     *
     * The target adds an additional level of semantic
     * for the message, and specifies the nature of the
     * information carried in the message.
     *
     * It answers the question: "What is the content of the message?"
     */
    k.target = {};

    // #### target.DATA
    // Generic identifier for any type of data
    k.target.DATA = 'DATA';

    // #### target.HI
    // A client is connecting for the first time
    k.target.HI = 'HI';

    // #### target.PCONNECT
    // A new client just connected to the player endpoint
    k.target.PCONNECT = 'PCONNECT';

    // #### target.PDISCONNECT
    // A client that just disconnected from the player endpoint
    k.target.PDISCONNECT = 'PDISCONNECT';

    // #### target.PRECONNECT
    // A previously disconnected client just re-connected to the player endpoint
    k.target.PRECONNECT = 'PRECONNECT';

    // #### target.MCONNECT
    // A client that just connected to the admin (monitor) endpoint
    k.target.MCONNECT = 'MCONNECT';

    // #### target.MDISCONNECT
    // A client just disconnected from the admin (monitor) endpoint
    k.target.MDISCONNECT = 'MDISCONNECT';

    // #### target.MRECONNECT
    // A previously disconnected client just re-connected to the admin endpoint
    k.target.MRECONNECT = 'MRECONNECT';

    // #### target.PLIST
    // The list of clients connected to the player endpoint was updated
    k.target.PLIST = 'PLIST';

    // #### target.MLIST
    // The list of clients connected to the admin (monitor) endpoint was updated
    k.target.MLIST = 'MLIST';

    // #### target.PLAYER_UPDATE
    // A client updates his Player object
    k.target.PLAYER_UPDATE = 'PLAYER_UPDATE';

    // #### target.STAGE
    // A client notifies his own stage
    k.target.STAGE = 'STAGE';

    // #### target.STAGE_LEVEL
    // A client notifies his own stage level
    k.target.STAGE_LEVEL = 'STAGE_LEVEL';

    // #### target.REDIRECT
    // Redirects a client to a new uri
    k.target.REDIRECT = 'REDIRECT';

    // #### target.LANG
    // Requests language information
    k.target.LANG = 'LANG';

    // #### target.SETUP
    // Asks a client update its configuration
    k.target.SETUP = 'SETUP';

    // #### target.GAMECOMMAND
    // Ask a client to start/pause/stop/resume the game
    k.target.GAMECOMMAND = 'GAMECOMMAND';

    // #### target.SERVERCOMMAND
    // Ask a server to execute a command
    k.target.SERVERCOMMAND = 'SERVERCOMMAND';

    // #### target.ALERT
    // Displays an alert message in the receiving client (if in the browser)
    k.target.ALERT = 'ALERT';

    // #### target.LOG
    // A generic log message used to send info to the server
    // @see node.constants.remoteVerbosity
    k.target.LOG = 'LOG';

    // #### target.BYE
    // Force disconnection upon reception.
    k.target.BYE  = 'BYE';

    //#### not used targets (for future development)


    k.target.JOIN = 'JOIN';   // Asks a client to join another channel

    k.target.TXT  = 'TXT';    // Text msg

    k.target.ACK  = 'ACK';    // A reliable msg was received correctly

    k.target.WARN = 'WARN';   // To do.
    k.target.ERR  = 'ERR';    // To do.


    // ### node.constants.gamecommands
    k.gamecommands = {
        start: 'start',
        pause: 'pause',
        resume: 'resume',
        stop: 'stop',
        restart: 'restart',
        step: 'step',
        goto_step: 'goto_step',
        clear_buffer: 'clear_buffer',
        erase_buffer: 'erase_buffer'
    };

    /**
     * ### Direction
     *
     * Distiguishes between incoming and outgoing messages
     *
     * - node.constants.IN
     * - node.constants.OUT
     */
    k.IN  = 'in.';
    k.OUT = 'out.';

    /**
     * ### node.constants.stateLevels
     *
     * Levels associated with the states of the nodeGame engine.
     */
    k.stateLevels = {
        UNINITIALIZED:  0,  // creating the game object
        STARTING:       1,  // constructor executed
        INITIALIZING:   2,  // calling game's init
        INITIALIZED:    5,  // init executed
        STAGE_INIT:    10,  // calling stage's init
        STEP_INIT:     20,  // calling step's init
        PLAYING_STEP:  30,  // executing step
        STAGE_EXIT:    50,  // calling stage's cleanup
        STEP_EXIT:     60,  // calling step's clenaup
        FINISHING:     70,  // calling game's gameover
        GAMEOVER:     100,  // game complete
        RUNTIME_ERROR: -1
    };

    /**
     * ### node.constants.stageLevels
     *
     * Levels associated with the states of the stages of a game.
     */
    k.stageLevels = {

        UNINITIALIZED:       0,  // Constructor called.

        INITIALIZING:        1,  // Executing init.

        INITIALIZED:         5,  // Init executed.

        LOADING_FRAME:       20, // A frame is being loaded (only in browser).

        FRAME_LOADED:        25, // The frame has been loaded (only in browser).

        EXECUTING_CALLBACK:  30, // Executing the stage callback.

        CALLBACK_EXECUTED:   40, // Stage callback executed.

        LOADED:              45, // Both GameWindow loaded and cb executed.

        PLAYING:             50, // Player playing.

        PAUSING:             55, // TODO: to be removed?

        PAUSED:              60, // TODO: to be removed?

        RESUMING:            65, // TODO: to be removed?

        RESUMED:             70, // TODO: to be removed?

        DONE_CALLED:         80, // Done is called,
                                 // will be asynchronously evaluated.

        GETTING_DONE:        90, // Done is being called,
                                 // and the step rule evaluated.

        DONE:               100, // Player completed the stage

        EXITING:            110, // Cleanup function being called (if found)
    };

    /**
     * ### node.constants.windowLevels
     *
     * Levels associated with the loading of the GameWindow object.
     *
     * @see GameWindow
     * @see GameWindow.state
     */
    k.windowLevels = {
        UNINITIALIZED:  0, // GameWindow constructor called
        INITIALIZING:   1, // Executing init.
        INITIALIZED:    5, // Init executed.
        LOADING:       30, // Loading a new Frame.
        LOADED:        40  // Frame Loaded.
    };

    /**
     * ### node.constants.screenState
     *
     * Levels describing whether the user can interact with the screen.
     *
     * @see GameWindow.screenState
     * @see GameWindow.lockFrame
     */
    k.screenLevels = {
        ACTIVE:        1,  // User can interact with screen (if LOADED)
        UNLOCKING:     -1,  // The screen is about to be unlocked.
        LOCKING:       -2, // The screen is about to be locked.
        LOCKED:        -3  // The screen is locked.
    };

    /**
     * ### node.constants.UNDEFINED_PLAYER
     *
     * Undefined player ID
     */
    k.UNDEFINED_PLAYER = -1;

    /**
     * ### node.constants.UNAUTH_PLAYER
     *
     * Unauthorized player ID
     *
     * This string is returned by the server if authentication fails.
     */
    k.UNAUTH_PLAYER = 'unautorized_player';


     /**
     * ### node.constants.verbosity_levels
     *
     * The level of updates that the server receives about the state of a game
     *
     * - ALL: all stateLevel, stageLevel, and gameStage updates
     * - MOST: all stageLevel and gameStage updates
     * - REGULAR: only stageLevel PLAYING and DONE, and all gameStage updates
     * - MODERATE: only gameStage updates (might not work for multiplayer games)
     * - NONE: no updates. The same as observer.
     */
    k.publishLevels = {
        ALL: 4,
        MOST: 3,
        REGULAR: 2,
        FEW: 1,
        NONE: 0
    };

})('undefined' != typeof node ? node : module.exports);

/**
 * # Stepping Rules
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Collections of rules to determine whether the game should step.
 */
(function(exports, parent) {

    "use strict";

    exports.stepRules = {};

    // Renaming parent to node, so that functions can be executed
    // context-less in the browser too.
    var node = parent;

    // ## SOLO
    // Player proceeds to the next step as soon as the current one
    // is DONE, regardless to the situation of other players
    exports.stepRules.SOLO = function(stage, myStageLevel, pl, game) {
        return myStageLevel === node.constants.stageLevels.DONE;
    };

    // ## WAIT
    // Player waits for explicit step command
    exports.stepRules.WAIT = function(stage, myStageLevel, pl, game) {
        return false;
    };

    // ## SYNC_STEP
    // Player waits that all the clients have terminated the
    // current step before going to the next
    exports.stepRules.SYNC_STEP = function(stage, myStageLevel, pl, game) {
        return myStageLevel === node.constants.stageLevels.DONE &&
            pl.isStepDone(stage);
    };

    // ## SYNC_STAGE
    // Player can advance freely within the steps of one stage,
    // but has to wait before going to the next one
    exports.stepRules.SYNC_STAGE = function(stage, myStageLevel, pl, game) {
        var iamdone = myStageLevel === node.constants.stageLevels.DONE;
        if (game.plot.stepsToNextStage(stage) > 1) {
            return iamdone;
        }
        else {
            // If next step is going to be a new stage, wait for others.
            return iamdone && pl.isStepDone(stage, 'STAGE_UPTO');
        }
    };

    // ## OTHERS_SYNC_STEP
    // All the players in the player list must be sync in the same
    // step and DONE. My own stage does not matter.
    exports.stepRules.OTHERS_SYNC_STEP = function(stage, myStageLevel, pl) {
        if (!pl.size()) return false;
        stage = pl.first().stage;
        return pl.arePlayersSync(stage, node.constants.stageLevels.DONE,
                                 'EXACT');
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # ErrorManager
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Handles runtime errors
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    var J = parent.JSUS;

    parent.ErrorManager = ErrorManager;

    /**
     * ## ErrorManager constructor
     *
     * Creates a new instance of ErrorManager
     *
     * @param {NodeGameClient} node Reference to the active node object.
     */
    function ErrorManager(node) {

        /**
         * ### ErrorManager.lastError
         *
         * Reference to the last error occurred.
         */
        this.lastError = null;

        this.init(node);
    }

    // ## ErrorManager methods

    /**
     * ### ErrorManager.init
     *
     * Starts catching run-time errors
     *
     * Only active in the browser's window.
     * In node.js, the ServerNode Error Manager is active.
     *
     * @param {NodeGameClient} node Reference to the active node object.
     */
    ErrorManager.prototype.init = function(node) {
        var that;
        that = this;
        if (!J.isNodeJS()) {
            window.onerror = function(msg, url, linenumber) {
                msg = url + ' ' + linenumber + ': ' + msg;
                that.lastError = msg;
                node.err(msg);
                return !node.debug;
            };
        }
//         else {
//             process.on('uncaughtException', function(err) {
//                 that.lastError = err;
//                 node.err('Caught exception: ' + err);
//                 if (node.debug) {
//                     throw err;
//                 }
//             });
//         }
    };


// ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # EventEmitter
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Event emitter engine for `nodeGame`
 *
 * Keeps a register of events listeners.
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    var J = parent.JSUS,
    NDDB = parent.NDDB,
    GameStage = parent.GameStage;

    exports.EventEmitter = EventEmitter;
    exports.EventEmitterManager = EventEmitterManager;

    /**
     * ## EventEmitter constructor
     *
     * Creates a new instance of EventEmitter
     */
    function EventEmitter(name, node) {
        if ('string' !== typeof name) {
            throw new TypeError('EventEmitter constructor: ' +
                                'name must be string.');
        }

        this.node = node;

        // ## Public properties

        this.name = name;

        /**
         * ### EventEmitter.listeners
         *
         * Event listeners collection
         */
        this.events = {};

        /**
         * ## EventEmitter.recordChanges
         *
         * If TRUE, keeps tracks of addition and deletion of listeners
         *
         * @see EventEmitter.changes
         */
        this.recordChanges = false;

        /**
         * ## EventEmitter.changes
         *
         * If TRUE, keeps tracks of addition and deletion of listeners
         *
         * @see EventEmitter.recordChanges
         */
        this.changes = {
            added: [],
            removed: []
        };

        /**
         * ### EventEmitter.history
         *
         * Database of emitted events
         *
         * @experimental
         *
         * @see NDDB
         * @see EventEmitter.EventHistory
         * @see EventEmitter.store
         */
        this.history = new EventHistory(this.node);
    }

    // ## EventEmitter methods

    /**
     * ### EventEmitter.on
     *
     * Registers a callback function for an event (event listener)
     *
     * @param {string} type The event name
     * @param {function} listener The function to emit
     */
    EventEmitter.prototype.on = function(type, listener) {
        if ('string' !== typeof type) {
            throw new TypeError('EventEmitter.on: type must be string.');
        }
        if ('function' !== typeof listener) {
            throw new TypeError('EventEmitter.on: listener must be function.');
        }

        if (!this.events[type]) {
            // Optimize the case of one listener.
            // Don't need the extra array object.
            this.events[type] = listener;
        }
        else if (typeof this.events[type] === 'object') {
            // If we've already got an array, just append.
            this.events[type].push(listener);
        }
        else {
            // Adding the second element, need to change to array.
            this.events[type] = [this.events[type], listener];
        }

        // Storing changes if necessary.
        if (this.recordChanges) {
            this.changes.added.push({type: type, listener: listener});
        }

        this.node.silly(this.name + '.on: added: ' + type + '.');
    };

    /**
     * ### EventEmitter.once
     *
     * Registers an event listener that will be removed after its first call
     *
     * @param {string} event The name of the event
     * @param {function} listener The callback function
     *
     * @see EventEmitter.on
     * @see EventEmitter.off
     */
    EventEmitter.prototype.once = function(type, listener) {
        var that = this;
        function g() {
            var i, len, args;
            args = [];
            i = -1, len = arguments.length;
            for ( ; ++i < len ; ) {
                args[i] = arguments[i];
            }
            that.remove(type, g);
            listener.apply(that.node.game, args);
        }
        this.on(type, g);
    };

    /**
     * ### EventEmitter.emit
     *
     * Fires all the listeners associated with an event
     *
     * The first parameter is the name of the event as _string_,
     * followed by any number of parameters that will be passed to the
     * callback.
     *
     * Return values of each callback are aggregated and returned as
     * an array. If the array contains less than 2 elements, only
     * element or _undefined_ is returned.
     *
     * @return {mixed} The return value of the callback/s
     */
    EventEmitter.prototype.emit = function() {
        var handler, len, args, i, listeners, type, ctx, node;
        var res, tmpRes;

        type = arguments[0];
        handler = this.events[type];
        if ('undefined' === typeof handler) return;

        node = this.node;
        ctx = node.game;

        // Useful for debugging.
        if (this.node.conf.events && this.node.conf.events.dumpEvents) {
            this.node.info('F: ' + this.name + ': ' + type);
        }

        if ('function' === typeof handler) {

            switch (arguments.length) {
                // fast cases
            case 1:
                res = handler.call(ctx);
                break;
            case 2:
                res = handler.call(ctx, arguments[1]);
                break;
            case 3:
                res = handler.call(ctx, arguments[1], arguments[2]);
                break;
            case 4:
                res = handler.call(ctx, arguments[1], arguments[2],
                                   arguments[3]);
                break;

            default:
                len = arguments.length;
                args = new Array(len - 1);
                for (i = 1; i < len; i++) {
                    args[i - 1] = arguments[i];
                }
                res = handler.apply(ctx, args);
            }
        }
        else if ('object' === typeof handler) {
            len = arguments.length;
            args = new Array(len - 1);
            for (i = 1; i < len; i++) {
                args[i - 1] = arguments[i];
            }
            listeners = handler.slice();
            len = listeners.length;
            // If more than one event listener is registered,
            // we will return an array.
            res = [];
            for (i = 0; i < len; i++) {
                tmpRes = listeners[i].apply(node.game, args);
                if ('undefined' !== typeof tmpRes)
                res.push(tmpRes);
            }
            // If less than 2 listeners returned a value, compact the result.
            if (!res.length) res = undefined;
            else if (res.length === 1) res = res[0];
        }

        // Log the event into node.history object, if present.
        if (node.conf && node.conf.events &&
            node.conf.events.history) {

            len = arguments.length;
            args = new Array(len);
            for (i = -1 ; ++i < len ; ) {
                args[i] = arguments[i];
            }

            this.history.insert({
                stage: node.game.getCurrentGameStage(),
                args: args
            });
        }

        return res;
    };

    /**
     * ### EventEmitter.emitAsync
     *
     * Fires all the listeners associated with an event asynchronously
     *
     * The event must be already existing, cannot be added after the call.
     *
     * Unlike normal emit, it does not return a value.
     *
     * @see EventEmitter.emit
     */
    EventEmitter.prototype.emitAsync = function() {
        var that, len, args, i;
        var arg1, arg2, arg3;
        arg1 = arguments[0];

        if (!this.events[arg1]) return;

        len = arguments.length;
        that = this;

        // The arguments object must not be passed or leaked anywhere.
        // Therefore, we recreate an args array here. We have a different
        // timeout in a different branch for optimization.
        switch(len) {

        case 1:
            setTimeout(function() { that.emit(arg1); }, 0);
            break;
        case 2:
            arg2 = arguments[1];
            setTimeout(function() { that.emit(arg1, arg2); }, 0);
            break;
        case 3:
            arg2 = arguments[1], arg3 = arguments[2];
            setTimeout(function() { that.emit(arg1, arg2, arg3); }, 0);
            break;
        default:
            args = new Array(len);
            for (i = -1 ; ++i < len ; ) {
                args[i] = arguments[i];
            }
            setTimeout(function() { that.emit.apply(that, args); }, 0);
        }
    };

    /**
     * ### EventEmitter.off || remove
     *
     * Deregisters one or multiple event listeners
     *
     * @param {string} type The event name
     * @param {mixed} listener Optional. The specific function
     *   to deregister, its name, or undefined to remove all listeners
     *
     * @return {array} The array of removed listener/s
     */
    EventEmitter.prototype.remove = EventEmitter.prototype.off =
    function(type, listener) {

        var listeners, len, i, node, found, oneFound, name, removed;

        removed = [];
        node = this.node;

        if ('string' !== typeof type) {
            throw new TypeError('EventEmitter.remove (' + this.name +
                      '): type must be string.');
        }

        if (listener &&
            ('function' !== typeof listener && 'string' !== typeof listener)) {
            throw new TypeError('EventEmitter.remove (' + this.name +
                                '): listener must be function, string, or ' +
                               'undefined.');
        }

        if ('string' === typeof listener && listener.trim() === '') {
            throw new Error('EventEmitter.remove (' + this.name + '): ' +
                            'listener cannot be an empty string.');
        }

        if (this.events[type]) {

            if (!listener) {
                oneFound = true;
                i = -1, len = this.events[type].length;
                for ( ; ++i < len ; ) {
                    removed.push(this.events[type][i]);
                }
                delete this.events[type];
            }

            else {
                // Handling multiple cases:
                // this.events[type] can be array or function,
                // and listener can be function or string.

                if ('function' === typeof this.events[type]) {

                    if ('function' === typeof listener) {
                        if (listener == this.events[type]) oneFound = true;
                    }
                    else {
                        // String.
                        name = J.funcName(this.events[type]);
                        if (name === listener) oneFound = true;
                    }

                    if (oneFound) {
                        removed.push(this.events[type]);
                        delete this.events[type];
                    }
                }
                // this.events[type] is an array.
                else {
                    listeners = this.events[type];
                    len = listeners.length;
                    for (i = 0; i < len; i++) {
                        found = false;
                        if ('function' === typeof listener) {
                            if (listeners[i] == listener) found = true;
                        }
                        else {
                            // String.
                            name = J.funcName(listeners[i]);
                            if (name === listener) found = true;
                        }

                        if (found) {
                            oneFound = true;
                            removed.push(listeners[i]);
                            if (len === 1) {
                                delete this.events[type];
                            }
                            else {
                                listeners.splice(i, 1);
                                // Update indexes,
                                // because array size has changed.
                                len--;
                                i--;
                            }
                        }
                    }
                }
            }
        }

        if (oneFound) {
            // Storing changes if necessary.
            if (this.recordChanges) {
                i = -1, len = removed.length;
                for ( ; ++i < len ; ) {
                    this.changes.removed.push({
                        type: type,
                        listener: removed[i]
                    });
                }
            }
            node.silly('ee.' + this.name + ' removed listener: ' + type + '.');
        }
        else {
            node.warn('EventEmitter.remove (' + this.name + '): requested ' +
                      'listener was not found for event ' + type + '.');
        }

        return removed;
    };

    /**
     * ### EventEmitter.clear
     *
     * Removes all registered event listeners
     */
    EventEmitter.prototype.clear = function() {
        var event, i, len;
        if (this.recordChanges) {
            for (event in this.events) {
                if ('function' === typeof this.events[event]) {
                    this.changes.removed.push({
                        type: event,
                        listener: this.events[event]
                    });
                }
                else if (J.isArray(this.events[event])) {
                    i = -1, len = this.events[event].length;
                    for ( ; ++i < len ; ) {
                        this.changes.removed.push({
                            type: event,
                            listener: this.events[event][i]
                        });
                    }
                }
            }
        }
        this.events = {};
    };

    /**
     * ### EventEmitter.size
     *
     * Returns the number of registered events / event listeners
     *
     * @param {mixed} Optional. Modifier controlling the return value
     *
     * @return {number} Depending on the value of the modifier returns
     *   the total number of:
     *
     *    - Not set:  events registered
     *    - String:   event listeners for the specified event
     *    - true:     event listeners for all events
     */
    EventEmitter.prototype.size = function(mod) {
        var count;
        if (!mod) return J.size(this.events);
        if ('string' === typeof mod) {
            if (!this.events[mod]) return 0;
            if ('function' === typeof this.events[mod]) return 1;
            return this.events[mod].length;
        }
        count = 0;
        for (mod in this.events) {
            count += this.size(mod);
        }
        return count;
    };

    /**
     * ### EventEmitter.printAll
     *
     * Prints to console all the registered functions
     *
     * @return {number} The total number of registered functions
     */
    EventEmitter.prototype.printAll = function() {
        var i, len, totalLen, str;
        totalLen = 0, str = '';
        for (i in this.events) {
            if (this.events.hasOwnProperty(i)) {
                len = this.size(i);
                str += i + ': ' + len + "\n";
                totalLen += len;
            }
        }
        console.log('[' + this.name + '] ' + totalLen + ' listener/s.');
        if (str) console.log(str);
        return totalLen;
    };

    /**
     * ### EventEmitter.getChanges
     *
     * Returns the list of added and removed event listeners
     *
     * @param {boolean} clear Optional. If TRUE, the list of current changes
     *   is cleared. Default FALSE
     *
     * @return {object} Object containing list of additions and deletions,
     *   or null if no changes have been recorded
     */
    EventEmitter.prototype.getChanges = function(clear) {
        var changes;
        if (this.changes.added.length || this.changes.removed.length) {
            changes = this.changes;
            if (clear) {
                this.changes = {
                    added: [],
                    removed: []
                };
            }
        }
        return changes;
    };

    /**
     * ### EventEmitter.setRecordChanges
     *
     * Sets the value of recordChanges and returns it
     *
     * If called with undefined, just returns current value.
     *
     * @param {boolean} record If TRUE, starts recording changes. Default FALSE
     *
     * @return {boolean} Current value of recordChanges
     *
     * @see EventEmitter.recordChanges
     */
    EventEmitter.prototype.setRecordChanges = function(record) {
        if ('boolean' === typeof record) this.recordChanges = record;
        else if ('undefined' !== typeof record) {
            throw new TypeError('EventEmitter.setRecordChanged: record must ' +
                                'be boolean or undefined');
        }
        return this.recordChanges;
    };


    /**
     * ## EventEmitterManager constructor
     *
     * @param {NodeGameClient} node A reference to the node object
     */
    function EventEmitterManager(node) {

        this.node = node;

        this.ee = {};

        this.createEE('ng');
        this.createEE('game');
        this.createEE('stage');
        this.createEE('step');
    }

    // ## EventEmitterManager methods

    /**
     * ### EventEmitterManager.createEE
     *
     * Creates and registers an event emitter
     *
     * A double reference is added to _this.ee_ and to _this_.
     *
     * @param {string} name The name of the event emitter
     *
     * @return {EventEmitter} A reference to the newly created event emitter
     *
     * @see EventEmitter constructor
     */
    EventEmitterManager.prototype.createEE = function(name) {
        this.ee[name] = new EventEmitter(name, this.node);
        this[name] = this.ee[name];
        return this.ee[name];
    };

    /**
     * ### EventEmitterManager.destroyEE
     *
     * Removes an existing event emitter
     *
     * @param {string} name The name of the event emitter
     *
     * @return {boolean} TRUE, on success
     *
     * @see EventEmitterManager.createEE
     */
    EventEmitterManager.prototype.destroyEE = function(name) {
        var ee;
        if ('string' !== typeof name) {
            throw new TypeError('EventEmitterManager.destroyEE: name must be ' +
                                'string.');
        }
        if (!this.ee[name]) return false;
        delete this[name];
        delete this.ee[name];
        return true;
    };

    /**
     * ### EventEmitterManager.clear
     *
     * Removes all registered event listeners from all event emitters
     */
    EventEmitterManager.prototype.clear = function() {
        this.ng.clear();
        this.game.clear();
        this.stage.clear();
        this.step.clear();
    };

    /**
     * ### EventEmitterManager.emit
     *
     * Emits an event on all registered event emitters
     *
     * Accepts a variable number of input parameters.
     *
     * @param {string} eventName The name of the event
     *
     * @return {mixed} The values returned by all fired event listeners
     *
     * @see EventEmitterManager.emit
     */
    EventEmitterManager.prototype.emit = function(eventName) {
        var i, tmpRes, res, args, len, ees;

        if ('string' !== typeof eventName) {
            throw new TypeError(
                'EventEmitterManager.emit: eventName must be string.');
        }
        res = [];

        len = arguments.length;

        // The scope might `node` if this method is invoked from `node.emit`.
        ees = this.ee || this.events.ee;

        // The arguments object must not be passed or leaked anywhere.
        switch(len) {

        case 1:
            tmpRes = ees.ng.emit(eventName);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
            tmpRes = ees.game.emit(eventName);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
            tmpRes = ees.stage.emit(eventName);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
            tmpRes = ees.step.emit(eventName);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
            break;
        case 2:
            tmpRes = ees.ng.emit(eventName, arguments[1]);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
            tmpRes = ees.game.emit(eventName, arguments[1]);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
            tmpRes = ees.stage.emit(eventName, arguments[1]);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
            tmpRes = ees.step.emit(eventName, arguments[1]);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
            break;
        case 3:
            tmpRes = ees.ng.emit(eventName, arguments[1], arguments[2]);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
            tmpRes = ees.game.emit(eventName, arguments[1], arguments[2]);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
            tmpRes = ees.stage.emit(eventName, arguments[1], arguments[2]);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
            tmpRes = ees.step.emit(eventName, arguments[1], arguments[2]);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
            break;
        default:
            args = new Array(len);
            for (i = -1 ; ++i < len ; ) {
                args[i] = arguments[i];
            }
            tmpRes = ees.ng.emit.apply(ees.ng, args);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
            tmpRes = ees.game.emit.apply(ees.game, args);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
            tmpRes = ees.stage.emit.apply(ees.stage, args);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
            tmpRes = ees.step.emit.apply(ees.step, args);
            if ('undefined' !== typeof tmpRes) res.push(tmpRes);
        }

        // If there are less than 2 elements, unpack the array.
        // res[0] is either undefined or some value.
        return res.length < 2 ? res[0] : res;
    };

    /**
     * ### EventEmitterManager.emitAsync
     *
     * Emits an event on all registered event emitters asynchrounsly
     *
     * Accepts a variable number of input parameters.
     *
     * @param {string} eventName The name of the event
     *
     * @see EventEmitterManager.emit
     */
    EventEmitterManager.prototype.emitAsync = function(eventName) {
        var i, len, args, ees;

        if ('string' !== typeof eventName) {
            throw new TypeError(
                'EventEmitterManager.emit: eventName must be string.');
        }

        len = arguments.length;

        // The scope might `node` if this method is invoked from `node.emit`.
        ees = this.ee || this.events.ee;

        // The arguments object must not be passed or leaked anywhere.
        switch(len) {

        case 1:
            ees.ng.emitAsync(eventName);
            ees.game.emitAsync(eventName);
            ees.stage.emitAsync(eventName);
            ees.step.emitAsync(eventName);
            break;
        case 2:
            ees.ng.emitAsync(eventName, arguments[1]);
            ees.game.emitAsync(eventName, arguments[1]);
            ees.stage.emitAsync(eventName, arguments[1]);
            ees.step.emitAsync(eventName, arguments[1]);
            break;
        case 3:
            ees.ng.emitAsync(eventName, arguments[1], arguments[2]);
            ees.game.emitAsync(eventName, arguments[1], arguments[2]);
            ees.stage.emitAsync(eventName, arguments[1], arguments[2]);
            ees.step.emitAsync(eventName, arguments[1], arguments[2]);
            break;
        default:
            args = new Array(len);
            for (i = -1 ; ++i < len ; ) {
                args[i] = arguments[i];
            }
            ees.ng.emitAsync.apply(ees.ng, args);
            ees.game.emitAsync.apply(ees.game, args);
            ees.stage.emitAsync.apply(ees.stage, args);
            ees.step.emitAsync.apply(ees.step, args);
        }
    };

    /**
     * ### EventEmitterManager.remove
     *
     * Removes an event / event listener from all registered event emitters
     *
     * @param {string} eventName The name of the event
     * @param {function|string} listener Optional A reference to the
     *   function to remove, or its name
     *
     * @return {object} Object containing removed listeners by event emitter
     */
    EventEmitterManager.prototype.remove = function(eventName, listener) {
        var res;
        if ('string' !== typeof eventName) {
            throw new TypeError('EventEmitterManager.remove: ' +
                                'eventName must be string.');
        }
        if (listener &&
            ('function' !== typeof listener && 'string' !== typeof listener)) {
            throw new TypeError('EventEmitter.remove (' + this.name +
                                '): listener must be function, string, or ' +
                                'undefined.');
        }
        res = {};
        res.ng = this.ng.remove(eventName, listener);
        res.game = this.game.remove(eventName, listener);
        res.stage = this.stage.remove(eventName, listener);
        res.step = this.step.remove(eventName, listener);
        return res;
    };

    /**
     * ### EventEmitterManager.printAll
     *
     * Prints all registered events
     *
     * @param {string} eventEmitterName Optional The name of the event emitter
     */
    EventEmitterManager.prototype.printAll = function(eventEmitterName) {
        var total;
        if (eventEmitterName && 'string' !== typeof eventEmitterName) {
            throw new TypeError('EventEmitterManager.printAll: ' +
                                'eventEmitterName must be string or ' +
                                'undefined.');
        }
        if (eventEmitterName && !this.ee[eventEmitterName]) {
            throw new TypeError('EventEmitterManager.printAll: event' +
                                'emitter not found: ' + eventEmitterName + '.');
        }
        if (eventEmitterName) {
            total = this.ee[eventEmitterName].printAll();
        }
        else {
            total = 0;
            total += this.ng.printAll();
            total += this.game.printAll();
            total += this.stage.printAll();
            total += this.step.printAll();

            console.log('Total number of registered listeners: ' + total + '.');
        }
        return total;
    };

    /**
     * ### EventEmitterManager.getAll
     *
     * Returns all registered events
     *
     * @param {string} eventEmitterName Optional The name of the event emitter
     */
    EventEmitterManager.prototype.getAll = function(eventEmitterName) {
        var events;
        if (eventEmitterName && 'string' !== typeof eventEmitterName) {
            throw new TypeError('EventEmitterManager.printAll: ' +
                                'eventEmitterName must be string or ' +
                                'undefined.');
        }
        if (eventEmitterName && !this.ee[eventEmitterName]) {
            throw new TypeError('EventEmitterManager.printAll: event' +
                                'emitter not found: ' + eventEmitterName + '.');
        }
        if (eventEmitterName) {
            events = this.ee[eventEmitterName].events;
        }
        else {
            events = {
                ng: this.ng.events,
                game: this.game.events,
                stage: this.stage.events,
                step: this.step.events
            };
        }
        return events;
    };

    /**
     * ### EventEmitterManager.getChanges
     *
     * Returns the list of changes from all event emitters
     *
     * Considered event emitters: ng, game, stage, step.
     *
     * @param {boolean} clear Optional. If TRUE, the list of current changes
     *   is cleared. Default FALSE
     *
     * @return {object} Object containing changes for all event emitters, or
     *   null if no changes have been recorded
     *
     * @see EventEmitter.getChanges
     */
    EventEmitterManager.prototype.getChanges = function(clear) {
        var changes, tmp;
        changes = {};
        tmp = this.ee.ng.getChanges(clear);
        if (tmp) changes.ng = tmp;
        tmp = this.ee.game.getChanges(clear);
        if (tmp) changes.game = tmp;
        tmp = this.ee.stage.getChanges(clear);
        if (tmp) changes.stage = tmp;
        tmp = this.ee.step.getChanges(clear);
        if (tmp) changes.step = tmp;
        return J.isEmpty(changes) ? null : changes;
    };

    /**
     * ### EventEmitterManager.setRecordChanges
     *
     * Sets the value of recordChanges for all event emitters and returns it
     *
     * If called with undefined, just returns current value.
     *
     * @param {boolean} record If TRUE, starts recording changes. Default FALSE
     *
     * @return {object} Current values of recordChanges for all event emitters
     *
     * @see EventEmitter.recordChanges
     */
    EventEmitterManager.prototype.setRecordChanges = function(record) {
        var out;
        out = {};
        out.ng = this.ee.ng.setRecordChanges(record);
        out.game = this.ee.game.setRecordChanges(record);
        out.stage = this.ee.stage.setRecordChanges(record);
        out.step = this.ee.step.setRecordChanges(record);
        return out;
    };

    /**
     * ### EventEmitterManager.size
     *
     * Returns the number of registered events / event listeners
     *
     * Calls the `size` method of each event emitter.
     *
     * @param {mixed} Optional. Modifier controlling the return value
     *
     * @return {number} Total number of registered events / event listeners
     *
     * @see EventEmitter.size
     */
    EventEmitterManager.prototype.size = function(mod) {
        var count;
        count = this.ng.size(mod);
        count += this.game.size(mod);
        count += this.stage.size(mod);
        count += this.step.size(mod);
        return count;
    };

    /**
     * ## EventHistory constructor
     *
     * TODO: might require updates.
     */
    function EventHistory(node) {

        this.node = node;

        /**
         * ### EventHistory.history
         *
         * Database of emitted events
         *
         * @see NDDB
         * @see EventEmitter.store
         *
         */
        this.history = new NDDB();

        this.history.hash('stage', function(e) {
            var stage;
            if (!e) return;
            stage = 'object' === typeof e.stage ?
                e.stage : this.node.game.stage;
            return node.GameStage.toHash(stage, 'S.s.r');
        });

    }

    EventHistory.prototype.remit = function(stage, discard, keep) {
        var hash, db, remit, node;
        node = this.node;
        if (!this.history.count()) {
            node.warn('no event history was found to remit');
            return false;
        }

        node.silly('remitting ' + node.events.history.count() + ' events');

        if (stage) {

            this.history.rebuildIndexes();

            hash = new GameStage(stage).toHash('S.s.r');

            if (!this.history.stage) {
                node.silly('No past events to re-emit found.');
                return false;
            }
            if (!this.history.stage[hash]){
                node.silly('Current stage ' + hash + ' has no events ' +
                           'to re-emit');
                return false;
            }

            db = this.history.stage[hash];
        }
        else {
            db = this.history;
        }

        // cleaning up the events to remit
        // TODO NDDB commands have changed, update
        if (discard) {
            db.select('event', 'in', discard).remove();
        }

        if (keep) {
            db = db.select('event', 'in', keep);
        }

        if (!db.count()){
            node.silly('no valid events to re-emit after cleanup');
            return false;
        }

        remit = function() {
            node.silly('re-emitting ' + db.count() + ' events');
            // We have events that were fired at the stage when
            // disconnection happened. Let's fire them again
            db.each(function(e) {
                node.emit(e.event, e.p1, e.p2, e.p3);
            });
        };

        if (node.game.isReady()) {
            remit.call(node.game);
        }
        else {
            node.on('LOADED', function(){
                remit.call(node.game);
            });
        }

        return true;
    };

    // ## Closure

})(
    'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # GameStage
 *
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Representation of the stage of a game:
 *
 * - `stage`: the higher-level building blocks of a game
 * - `step`: the sub-unit of a stage
 * - `round`: the number of repetition for a stage. Defaults round = 1
 *
 * @see GamePlot
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope

    // Expose constructor
    exports.GameStage = GameStage;

    GameStage.defaults = {};

    /**
     * ### GameStage.defaults.hash
     *
     * Default hash string for game-stages
     *
     *  @see GameStage.toHash
     */
    GameStage.defaults.hash = 'S.s.r';

    /**
     * ## GameStage constructor
     *
     * Creates an instance of a GameStage
     *
     * It accepts an object literal, a number, or an hash string as defined in
     * `GameStage.defaults.hash`.
     *
     * The stage and step can be either an integer (1-based index) or a string
     * (valid stage/step name). The round must be an integer.
     *
     * If no parameter is passed, all the properties of the GameStage
     * object are set to 0
     *
     * @param {object|string|number} gameStage Optional. The game stage
     *
     * @see GameStage.defaults.hash
     */
    function GameStage(gameStage) {
        var tokens, stageNum, stepNum, roundNum, err;

        // ## Public properties

        /**
         * ### GameStage.stage
         *
         * The N-th game-block (stage) in the game-plot currently being executed
         */
        this.stage = 0;

        /**
         * ### GameStage.step
         *
         * The N-th game-block (step) nested in the current stage
         */
        this.step = 0;

        /**
         * ### GameStage.round
         *
         * The number of times the current stage was repeated
         */
        this.round = 0;

        // String.
        if ('string' === typeof gameStage) {
            if (gameStage === '') {
                throw new Error('GameStage constructor: gameStage name ' +
                                'cannot be an empty string.');
            }
            if (gameStage.charAt(0) === '.') {
                throw new Error('GameStage constructor: gameStage name ' +
                                'cannot start with a dot.');
            }

            tokens = gameStage.split('.');

            stageNum = parseInt(tokens[0], 10);
            this.stage = !isNaN(stageNum) ? stageNum : tokens[0];

            if ('string' === typeof tokens[1]) {
                if (!tokens[1].length) {
                    throw new Error('GameStage constructor: gameStage ' +
                                    'contains empty step: ' + gameStage);
                }
                stepNum = parseInt(tokens[1], 10);
                this.step = !isNaN(stepNum) ? stepNum : tokens[1];
            }
            else if (this.stage !== 0) {
                this.step = 1;
            }
            if ('string' === typeof tokens[2]) {
                if (!tokens[2].length) {
                    throw new Error('GameStage constructor: gameStage ' +
                                    'contains empty round: ' + gameStage);
                }
                roundNum = parseInt(tokens[2], 10);
                this.round = roundNum;
            }
            else if (this.stage !== 0) {
                this.round = 1;
            }
        }
        // Not null object.
        else if (gameStage && 'object' === typeof gameStage) {
            this.stage = gameStage.stage;
            this.step = 'undefined' !== typeof gameStage.step ?
                gameStage.step : this.stage === 0 ? 0 : 1;
            this.round = 'undefined' !== typeof gameStage.round ?
                gameStage.round : this.stage === 0 ? 0 : 1;
        }
        // Number.
        else if ('number' === typeof gameStage) {
            if (gameStage % 1 !== 0) {
               throw new TypeError('GameStage constructor: gameStage ' +
                                   'cannot be a non-integer number.');
            }
            this.stage = gameStage;
            if (this.stage === 0) {
                this.step = 0;
                this.round = 0;
            }
            else {
                this.step = 1;
                this.round = 1;
            }
        }
        // Defaults or error.
        else if (gameStage !== null && 'undefined' !== typeof gameStage) {
            throw new TypeError('GameStage constructor: gameStage must be ' +
                                'string, object, number, undefined, or null.');
        }

        // At this point we must have positive numbers, or strings for step
        // and stage, round can be only a positive number, or 0.0.0.
        if ('number' === typeof this.stage) {
            if (this.stage < 0) err = 'stage';
        }
        else if ('string' !== typeof this.stage) {
            throw new Error('GameStage constructor: gameStage.stage must be ' +
                            'number or string: ' + typeof this.stage);
        }

        if ('number' === typeof this.step) {
            if (this.step < 0) err = err ? err + ', step' : 'step';
        }
        else if ('string' !== typeof this.step) {
            throw new Error('GameStage constructor: gameStage.step must be ' +
                            'number or string: ' + typeof this.step);
        }

        if ('number' === typeof this.round) {
            if (this.round < 0) err = err ? err + ', round' : 'round';
        }
        else {
            throw new Error('GameStage constructor: gameStage.round must ' +
                            'be number.');
        }

        if (err) {
            throw new TypeError('GameStage constructor: ' + err + ' field/s ' +
                                'contain/s negative numbers.');
        }

        // Either 0.0.0 or no 0 is allowed.
        if (!(this.stage === 0 && this.step === 0 && this.round === 0)) {
            if (this.stage === 0 || this.step === 0 || this.round === 0) {
                throw new Error('GameStage constructor: malformed game ' +
                                'stage: ' + this.toString());
            }
        }
    }

    // ## GameStage methods

    /**
     * ### GameStage.toString
     *
     * Converts the current instance of GameStage to a string
     *
     * @return {string} out The string representation of game stage
     */
    GameStage.prototype.toString = function() {
        return this.toHash('S.s.r');
    };

    /**
     * ### GameStage.toHash
     *
     * Returns a simplified hash of the stage of the GameStage,
     * according to the input string
     *
     * @param {string} str The hash code
     * @return {string} hash The hashed game stages
     *
     * @see GameStage.toHash (static)
     */
    GameStage.prototype.toHash = function(str) {
        return GameStage.toHash(this, str);
    };

    /**
     * ### GameStage.toHash (static)
     *
     * Returns a simplified hash of the stage of the GameStage,
     * according to the input string.
     *
     * The following characters are valid to determine the hash string
     *
     * - S: stage
     * - s: step
     * - r: round
     *
     * E.g.
     *
     * ```javascript
     *      var gs = new GameStage({
     *          round: 1,
     *          stage: 2,
     *          step: 1
     *      });
     *
     *      gs.toHash('(R) S.s'); // (1) 2.1
     * ```
     *
     * @param {GameStage} gs The game stage to hash
     * @param {string} str The hash code
     * @return {string} hash The hashed game stages
     */
    GameStage.toHash = function(gs, str) {
        var hash, i, idx, properties, symbols;
        if (!gs || 'object' !== typeof gs) {
            throw new TypeError('GameStage.toHash: gs must be object.');
        }
        if (!str || !str.length) return gs.toString();

        hash = '',
        symbols = 'Ssr',
        properties = ['stage', 'step', 'round'];

        for (i = 0; i < str.length; i++) {
            idx = symbols.indexOf(str.charAt(i));
            hash += (idx < 0) ? str.charAt(i) : gs[properties[idx]];
        }
        return hash;
    };

    /**
     * ### GameStage.compare (static)
     *
     * Converts inputs to GameStage objects and sort them by sequence order
     *
     * Returns value is:
     *
     * - 0 if they represent the same game stage
     * - -1 if gs1 is ahead of gs2
     * - +1 if gs2 is ahead of gs1
     *
     * The accepted hash string format is the following:
     *
     *   - 'S.s.r' (stage.step.round)
     *
     * When comparison contains a missing value or a string (e.g. a step id),
     * the object is placed ahead.
     *
     * @param {mixed} gs1 The first game stage to compare
     * @param {mixed} gs2 The second game stage to compare
     *
     * @return {number} result The result of the comparison
     *
     * @see GameStage constructor
     * @see GameStage.toHash (static)
     */
    GameStage.compare = function(gs1, gs2) {
        var result;
        // null, undefined, 0.
        if (!gs1 && !gs2) return 0;
        if (!gs2) return 1;
        if (!gs1) return -1;

        gs1 = new GameStage(gs1);
        gs2 = new GameStage(gs2);

        if ('number' === typeof gs1.stage) {
            if ('number' === typeof gs2.stage) {
                result = gs1.stage - gs2.stage;
            }
            else {
                result = -1;
            }
        }
        else if ('number' === typeof gs2.stage) {
            result = 1;
        }

        if (result === 0) {
            if ('number' === typeof gs1.step) {
                if ('number' === typeof gs2.step) {
                    result = gs1.step - gs2.step;
                }
                else {
                    result = -1;
                }

            }
            else if ('number' === typeof gs2.step) {
                result = 1;
            }
        }

        if (result === 0) {
            if ('number' === typeof gs1.round) {
                if ('number' === typeof gs2.round) {
                    result = gs1.round - gs2.round;
                }
                else {
                    result = -1;
                }

            }
            else if ('number' === typeof gs2.round) {
                result = 1;
            }
        }

        return result > 0 ? 1 : result < 0 ? -1 : 0;
    };

    /**
     * ### GameStage.stringify (static)
     *
     * Converts an object GameStage-like to its string representation
     *
     * @param {GameStage} gs The object to convert to string
     * @return {string} out The string representation of a GameStage object
     */
    GameStage.stringify = function(gs) {
        if (!gs) return;
        return new GameStage(gs).toHash('(r) S.s_i');
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # PlayerList
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Handles a collection of `Player` objects
 *
 * Offers methods to update, search and retrieve players.
 *
 * It extends the NDDB class.
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope

    // Exposing constructor
    exports.PlayerList = PlayerList;

    // Setting up global scope variables
    var J = parent.JSUS,
        NDDB = parent.NDDB,
        GameStage = parent.GameStage;

    var stageLevels = parent.constants.stageLevels;
    var stateLevels = parent.constants.stateLevels;

    // Inheriting from NDDB
    PlayerList.prototype = new NDDB();
    PlayerList.prototype.constructor = PlayerList;

    // Sync types used by PlayerList.arePlayersSync
    var syncTypes;

    /**
     * ## PlayerList.comparePlayers
     *
     * Comparator functions between two players
     *
     * @param {Player} p1 The first player
     * @param {Player} p2 The second player
     * @return {number} The result of the comparison
     *
     * @see NDDB.globalCompare
     */
    PlayerList.comparePlayers = function(p1, p2) {
        if (p1.id === p2.id) return 0;
        if (p1.count < p2.count) return 1;
        if (p1.count > p2.count) return -1;
        return 0;
    };

    /**
     * ## PlayerList constructor
     *
     * Creates an instance of PlayerList
     *
     * The class inherits his prototype from `node.NDDB`.
     *
     * It indexes players by their _id_.
     *
     * @param {object} options Optional. Configuration object
     * @param {array} db Optional. An initial set of players to import
     * @param {PlayerList} parent Optional. A parent object for the instance
     *
     * @see NDDB.constructor
     */
    function PlayerList(options, db) {
        options = options || {};

        options.name = options.name || 'plist';

        // Updates indexes on the fly.
        if (!options.update) options.update = {};
        if ('undefined' === typeof options.update.indexes) {
            options.update.indexes = true;
        }

        // The internal counter that will be used to assing the `count`
        // property to each inserted player.
        this.pcounter = 0;

        // Invoking NDDB constructor.
        NDDB.call(this, options);

        // We check if the index are not existing already because
        // it could be that the constructor is called by the breed function
        // and in such case we would duplicate them.
        if (!this.id) {
            this.index('id', function(p) {
                return p.id;
            });
        }

        // Importing initial items
        // (should not be done in constructor of NDDB)
        if (db) this.importDB(db);

        // Assigns a global comparator function.
        this.globalCompare = PlayerList.comparePlayers;
    }

    // ## PlayerList methods

    /**
     * ### PlayerList.importDB
     *
     * Adds an array of players to the database at once
     *
     * Overrides NDDB.importDB
     *
     * @param {array} db The array of player to import at once
     */
    PlayerList.prototype.importDB = function(db) {
        var i, len;
        if (!J.isArray(db)) {
            throw new TypeError('PlayerList.importDB: db must be array.');
        }
        i = -1, len = db.length;
        for ( ; ++i < len ; ) {
            this.add(db[i]);
        }
    };

    /**
     * ### PlayerList.add
     *
     * Adds a new player to the database
     *
     * Before insertion, objects are checked to be valid `Player` objects,
     * that is they must have a unique player id. Objects will then
     * automatically casted to type Player.
     *
     * The `count` property is added to the player object, and
     * the internal `pcounter` variable is incremented.
     *
     * @param {Player} player The player object to add to the database
     *
     * @return {player} The inserted player
     */
    PlayerList.prototype.add = function(player) {
        if (!(player instanceof Player)) {
            if ('object' !== typeof player) {
                throw new TypeError('PlayerList.add: player must be object.');
            }
            if ('string' !== typeof player.id) {
                throw new TypeError('PlayerList.add: ' +
                                    'player.id must be string.');
            }
            player = new Player(player);
        }

        if (this.exist(player.id)) {
            throw new Error('PlayerList.add: player already existing: ' +
                            player.id + '.');
        }
        this.insert(player);
        player.count = this.pcounter;
        this.pcounter++;
        return player;
    };

// NEW GET AND REMOVE (no errors are thrown)

//     /**
//      * ### PlayerList.get
//      *
//      * Retrieves a player with the given id
//      *
//      * @param {number} id The client id of the player to retrieve
//      *
//      * @return {Player} The player with the speficied id
//      */
//     PlayerList.prototype.get = function(id) {
//         if ('string' !== typeof id) {
//             throw new TypeError('PlayerList.get: id must be string.');
//         }
//         return this.id.get(id);
//     };
//
//     /**
//      * ### PlayerList.remove
//      *
//      * Removes the player with the given id
//      *
//      * Notice: this operation cannot be undone
//      *
//      * @param {number} id The id of the player to remove
//      *
//      * @return {object} The removed player object
//      */
//     PlayerList.prototype.remove = function(id) {
//         if ('string' !== typeof id) {
//             throw new TypeError('PlayerList.remove: id must be string.');
//         }
//         return this.id.remove(id);
//     };

// OLD GET AND REMOVE: throw errors

    /**
     * ### PlayerList.get
     *
     * Retrieves a player with the given id
     *
     * @param {number} id The id of the player to retrieve
     * @return {Player} The player with the speficied id
     */
    PlayerList.prototype.get = function(id) {
        var player;
        if ('string' !== typeof id) {
            throw new TypeError('PlayerList.get: id must be string.');

        }
        player = this.id.get(id);
        if (!player) {
            throw new Error('PlayerList.get: Player not found: ' + id + '.');
        }
        return player;
    };

    /**
     * ### PlayerList.remove
     *
     * Removes the player with the given id
     *
     * Notice: this operation cannot be undone
     *
     * @param {number} id The id of the player to remove
     * @return {object} The removed player object
     */
    PlayerList.prototype.remove = function(id) {
        var player;
        if ('string' !== typeof id) {
            throw new TypeError('PlayerList.remove: id must be string.');
        }
        player = this.id.remove(id);
        if (!player) {
            throw new Error('PlayerList.remove: player not found: ' + id + '.');
        }
        return player;
    };

    // ### PlayerList.pop
    // @deprecated
    // TODO remove after transition is complete
    PlayerList.prototype.pop = PlayerList.prototype.remove;

    /**
     * ### PlayerList.exist
     *
     * Checks whether a player with the given id already exists
     *
     * @param {string} id The id of the player
     *
     * @return {boolean} TRUE, if a player with the specified id is found
     */
    PlayerList.prototype.exist = function(id) {
        return this.id.get(id) ? true : false;
    };

    /**
     * ### PlayerList.clear
     *
     * Clears the PlayerList and rebuilds the indexes
     *
     * @param {boolean} confirm Must be TRUE to actually clear the list
     *
     * @return {boolean} TRUE, if a player with the specified id is found
     */
    PlayerList.prototype.clear = function(confirm) {
        NDDB.prototype.clear.call(this, confirm);
        // TODO: check do we need this?
        this.rebuildIndexes();
    };

    /**
     * ### PlayerList.updatePlayer
     *
     * Updates the state of a player
     *
     * @param {number} id The id of the player
     * @param {object} playerState An update with fields to update in the player
     *
     * @return {object} The updated player object
     */
    PlayerList.prototype.updatePlayer = function(id, update) {
        var player;
        if ('string' !== typeof id) {
            throw new TypeError(
                'PlayerList.updatePlayer: id must be string.');
        }
        if ('object' !== typeof update) {
            throw new TypeError(
                'PlayerList.updatePlayer: update must be object.');
        }

        if ('undefined' !== typeof update.id) {
            throw new Error('PlayerList.updatePlayer: update cannot change ' +
                            'the player id.');
        }

        player = this.id.update(id, update);

        if (!player) {
            throw new Error(
                'PlayerList.updatePlayer: player not found: ' + id + '.');
        }
    };

    /**
     * ### PlayerList.isStepDone
     *
     * Checks whether all players have terminated the specified game step
     *
     * A stage is considered _DONE_ if all players that are found playing
     * that game step have the property `stageLevel` equal to:
     *
     * `node.constants.stageLevels.DONE`.
     *
     * By default, players at other steps are ignored.
     *
     * If no player is found at the desired step, it returns TRUE
     *
     * @param {GameStage} gameStage The GameStage of reference
     * @param {string} type Optional. The type of checking. Default 'EXACT'
     * @param {boolean} checkOutliers Optional. If TRUE, players at other
     *   steps are also checked. Default FALSE
     *
     * @return {boolean} TRUE, if all checked players have terminated the stage
     *
     * @see PlayerList.arePlayersSync
     */
    PlayerList.prototype.isStepDone = function(gameStage, type, checkOutliers) {
        return this.arePlayersSync(gameStage, stageLevels.DONE, type,
                                   checkOutliers);
    };

    /**
     * ### PlayerList.isStepLoaded
     *
     * Checks whether all players have loaded the specified game step
     *
     * A stage is considered _LOADED_ if all players that are found playing
     * that game step have the property `stageLevel` equal to:
     *
     * `node.constants.stageLevels.LOADED`.
     *
     * By default, players at other steps are ignored.
     *
     * If no player is found at the desired step, it returns TRUE.
     *
     * @param {GameStage} gameStage The GameStage of reference
     *
     * @return {boolean} TRUE, if all checked players have loaded the stage
     *
     * @see PlayerList.arePlayersSync
     */
    PlayerList.prototype.isStepLoaded = function(gameStage) {
        return this.arePlayersSync(gameStage, stageLevels.LOADED, 'EXACT');
    };

    /**
     * ### PlayerList.arePlayersSync
     *
     * Verifies that all players in the same stage are at the same stageLevel
     *
     * Players at other game steps are ignored, unless the
     * `checkOutliers` parameter is set. In this case, if players are
     * found in earlier game steps, the method will return
     * false. Players at later game steps will still be ignored.
     *
     * The `type` parameter can assume one of the following values:
     *
     *  - 'EXACT': same stage, step, round
     *  - 'STAGE': same stage, but different steps and rounds are accepted
     *  - 'STAGE_UPTO': up to the same stage is ok
     *
     * Finally, if `stageLevel` is set, it even checks for the stageLevel,
     * for example: PLAYING, DONE, etc.
     *
     * TODO: see the checkOutliers param, if it is needed after all.
     *
     * @param {GameStage} gameStage The GameStage of reference
     * @param {number} stageLevel The stageLevel of reference
     * @param {string} type Optional. Flag to say what players will be checked
     * @param {boolean} checkOutliers Optional. Whether to check for outliers.
     *   Can't be TRUE if type is 'exact'
     *
     * @return {boolean} TRUE, if all checked players are sync
     */
    PlayerList.prototype.arePlayersSync = function(gameStage, stageLevel, type,
                                                   checkOutliers) {

        var p, i, len, cmp, outlier;

        // Cast the gameStage to object. It can throw errors.
        gameStage = new GameStage(gameStage);

        if ('undefined' !== typeof stageLevel &&
            'number'    !== typeof stageLevel) {

            throw new TypeError('PlayerList.arePlayersSync: stagelevel must ' +
                                'be number or undefined.');
        }

        type = type || 'EXACT';
        if ('string' !== typeof type) {
            throw new TypeError('PlayerList.arePlayersSync: type must be ' +
                                'string or undefined.');
        }

        if ('undefined' === typeof syncTypes[type]) {
            throw new Error('PlayerList.arePlayersSync: unknown type: ' +
                            type + '.');
        }

        checkOutliers = 'undefined' === typeof checkOutliers ?
            true : checkOutliers;

        if ('boolean' !== typeof checkOutliers) {
            throw new TypeError('PlayerList.arePlayersSync: checkOutliers ' +
                                'must be boolean or undefined.');
        }

        if (!checkOutliers && type === 'EXACT') {
            throw new Error('PlayerList.arePlayersSync: incompatible options:' +
                            ' type=EXACT and checkOutliers=FALSE.');
        }

        i = -1, len = this.db.length;
        for ( ; ++i < len ; ) {

            p = this.db[i];

            switch(type) {

            case 'EXACT':
                // Players in same stage, step and round.
                cmp = GameStage.compare(gameStage, p.stage);
                if (cmp !== 0) return false;
                break;

            case 'STAGE':
                if (gameStage.stage !== p.stage.stage) {
                    outlier = true;
                }
                break;

             case 'STAGE_UPTO':
                // Players in current stage up to the reference step.
                cmp = GameStage.compare(gameStage, p.stage);

                // Player in another stage or in later step.
                if (gameStage.stage !== p.stage.stage || cmp < 0) {
                    outlier = true;
                    break;
                }
                // Player before given step.
                if (cmp > 0) {
                    return false;
                }
                break;
            }

            // If outliers are not allowed returns false if one was found.
            if (checkOutliers && outlier) return false;

            // If the stageLevel check is required let's do it!
            if ('undefined' !== typeof stageLevel &&
                p.stageLevel !== stageLevel) {
                return false;
            }
        }
        return true;
    };

    /**
     * ### PlayerList.toString
     *
     * Returns a string representation of the PlayerList
     *
     * @param {string} eol Optional. End of line separator between players
     *
     * @return {string} out The string representation of the PlayerList
     */
    PlayerList.prototype.toString = function(eol) {
        var out = '', EOL = eol || '\n', stage;
        this.each(function(p) {
            out += p.id + ': ' + p.name;
            stage = new GameStage(p.stage);
            out += ': ' + stage + EOL;
        });
        return out;
    };

    /**
     * ### PlayerList.getNGroups
     *
     * Creates N random groups of players
     *
     * @param {number} N The number of groups
     *
     * @return {array} Array containing N `PlayerList` objects
     *
     * @see JSUS.getNGroups
     */
    PlayerList.prototype.getNGroups = function(N) {
        var groups;
        if ('number' !== typeof N || isNaN(N) || N < 1) {
            throw new TypeError('PlayerList.getNGroups: N must be a number ' +
                                '> 0: ' + N + '.');
        }
        groups = J.getNGroups(this.db, N);
        return array2Groups(groups);
    };

    /**
     * ### PlayerList.getGroupsSizeN
     *
     * Creates random groups of N players
     *
     * @param {number} N The number player per group
     *
     * @return {array} Array containing N `PlayerList` objects
     *
     * @see JSUS.getGroupsSizeN
     */
    PlayerList.prototype.getGroupsSizeN = function(N) {
        var groups;
        if ('number' !== typeof N || isNaN(N) || N < 1) {
            throw new TypeError('PlayerList.getNGroups: N must be a number ' +
                                '> 0: ' + N + '.');
        }
        groups = J.getGroupsSizeN(this.db, N);
        return array2Groups(groups);
    };

    /**
     * ### PlayerList.getRandom
     *
     * Returns a set of N random players
     *
     * @param {number} N The number of players in the random set. Defaults N = 1
     *
     * @return {Player|array} A single player object or an array of
     */
    PlayerList.prototype.getRandom = function(N) {
        var shuffled;
        if ('undefined' === typeof N) N = 1;
        if ('number' !== typeof N || isNaN(N) || N < 1) {
            throw new TypeError('PlayerList.getRandom: N must be a number ' +
                                '> 0 or undefined: ' + N + '.');
        }
        shuffled = this.shuffle();
        return N === 1 ? shuffled.first() : shuffled.limit(N).fetch();
    };


    // ## Helper Methods and Objects

    /**
     * ### array2Groups
     *
     * Transforms an array of array (of players) into an
     * array of PlayerList instances and returns it.
     *
     * The original array is modified.
     *
     * @param {array} array The array to transform
     *
     * @return {array} array The array of `PlayerList` objects
     */
    function array2Groups(array) {
        var i, len, settings;
        settings = this.cloneSettings();
        i = -1, len = array.length;
        for ( ; ++i < len ; ) {
            array[i] = new PlayerList(settings, array[i]);
        }
        return array;
    }

    syncTypes = {STAGE: '', STAGE_UPTO: '', EXACT: ''};

    /**
     * # Player
     *
     * Wrapper for a number of properties for players
     *
     *  `sid`: The Socket.io session id associated to the player
     *  `id`: The nodeGame session id associate to the player
     *  `count`: The id of the player within a PlayerList object
     *  `admin`: Whether the player is an admin
     *  `disconnected`: Whether the player has disconnected
     *  `lang`: the language chosen by player (default English)
     *  `name`: An alphanumeric name associated to the player
     *  `stage`: The current stage of the player as relative to a game
     *  `ip`: The ip address of the player
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
     */
    function Player(player) {
        var key;

        if ('object' !== typeof player) {
            throw new TypeError('Player constructor: player must be object.');
        }
        if ('string' !== typeof player.id) {
            throw new TypeError('Player constructor: id must be string.');
        }

        // ## Default properties

        /**
         * ### Player.id
         *
         * The nodeGame session id associate to the player
         *
         * Usually it is the same as the Socket.io id, but in
         * case of reconnections it can change
         */
        this.id = player.id;

        /**
         * ### Player.sid
         *
         * The session id received from the nodeGame server
         */
        this.sid = player.sid;

        /**
         * ### Player.clientType
         *
         * The client type (e.g. player, admin, bot, ...)
         */
        this.clientType = player.clientType || null;

        /**
         * ### Player.group
         *
         * The group to which the player belongs
         */
        this.group = player.group || null;

        /**
         * ### Player.role
         *
         * The role of the player
         */
        this.role = player.role || null;

        /**
         * ### Player.count
         *
         * The ordinal position of the player in a PlayerList object
         *
         * @see PlayerList
         */
        this.count = 'undefined' === typeof player.count ? null : player.count;

        /**
         * ### Player.admin
         *
         * The admin status of the client
         */
        this.admin = !!player.admin;

        /**
         * ### Player.disconnected
         *
         * The connection status of the client
         */
        this.disconnected = !!player.disconnected;

        /**
         * ### Player.ip
         *
         * The ip address of the player
         *
         * Note: this can change in mobile networks
         */
        this.ip = player.ip || null;

        /**
         * ### Player.name
         *
         * An alphanumeric name associated with the player
         */
        this.name = player.name || null;

        /**
         * ### Player.stage
         *
         * Reference to the game-stage the player currently is
         *
         * @see node.game.stage
         * @see GameStage
         */
        this.stage = player.stage || new GameStage();

        /**
         * ### Player.stageLevel
         *
         * The current stage level of the player in the game
         *
         * @see node.stageLevels
         */
        this.stageLevel = player.stageLevel || stageLevels.UNINITIALIZED;

        /**
         * ### Player.stateLevel
         *
         * The current state level of the player in the game
         *
         * @see node.stateLevels
         */
        this.stateLevel = player.stateLevel || stateLevels.UNINITIALIZED;

        /**
         * ### Player.lang
         *
         * The current language used by the player
         *
         * Default language is English with the default path `en/`.
         */
        this.lang = {
            name: 'English',
            shortName: 'en',
            nativeName: 'English',
            path: 'en/'
        };

        /**
         * ## Extra properties
         *
         * For security reasons, they cannot be of type function, and they
         * cannot overwrite any previously defined variable
         */
        for (key in player) {
            if (player.hasOwnProperty(key)) {
                if ('function' !== typeof player[key]) {
                    if (!this.hasOwnProperty(key)) {
                        this[key] = player[key];
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
        return (this.name || '' ) + ' (' + this.id + ') ' +
            new GameStage(this.stage);
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports
 ,  'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # GameMsg
 *
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` exchangeable data format
 */
(function(exports, node) {

    "use strict";

    // ## Global scope
    var GameStage = node.GameStage,
    J = node.JSUS;

    exports.GameMsg = GameMsg;

    /**
     * ### GameMSg.clone (static)
     *
     * Returns a perfect copy of a game-message
     *
     * @param {GameMsg} gameMsg The message to clone
     * @return {GameMsg} The cloned messaged
     */
    GameMsg.clone = function(gameMsg) {
        return new GameMsg(gameMsg);
    };

    /**
     * ## GameMsg constructor
     *
     * Creates an instance of GameMsg
     *
     * @param {object} gm Optional. Initial values for the game message fields
     */
    function GameMsg(gm) {
        gm = gm || {};

        /**
         * ### GameMsg.id
         *
         * A randomly generated unique id
         */
        this.id = 'undefined' === typeof gm.id ?
            Math.floor(Math.random()*1000000) : gm.id;

        /**
         * ### GameMsg.session
         *
         * The session id in which the message was generated
         */
        this.session = gm.session;

        /**
         * ### GameMsg.stage
         *
         * The game-stage in which the message was generated
         *
         * @see GameStage
         */
        this.stage = gm.stage;

        /**
         * ### GameMsg.action
         *
         * The action of the message
         *
         * @see node.constants.action
         */
        this.action = gm.action;

        /**
         * ### GameMsg.target
         *
         * The target of the message
         *
         * @see node.constants.target
         */
        this.target = gm.target;

        /**
         * ### GameMsg.from
         *
         * The id of the sender of the message
         *
         * @see Player.id
         * @see node.player.id
         */
        this.from = gm.from;

        /**
         * ### GameMsg.to
         *
         * The id of the receiver of the message
         *
         * @see Player.id
         * @see node.player.id
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
         */
        this.reliable = gm.reliable;

        /**
         * ### GameMsg.created
         *
         * A timestamp of the date of creation
         */
        this.created = J.getDate();

        /**
         * ### GameMsg.forward
         *
         * If TRUE, the message is a forward.
         *
         * E.g. between nodeGame servers
         */
        this.forward = 0;
    }

    /**
     * ### GameMsg.stringify
     *
     * Calls JSON.stringify on the message
     *
     * @return {string} The stringified game-message
     *
     * @see GameMsg.toString
     */
    GameMsg.prototype.stringify = function() {
        return JSON.stringify(this);
    };

    // ## GameMsg methods

    /**
     * ### GameMsg.toString
     *
     * Creates a human readable string representation of the message
     *
     * @return {string} The string representation of the message
     * @see GameMsg.stringify
     */
    GameMsg.prototype.toString = function() {
        var SPT, TAB, DLM, line, UNKNOWN, tmp;
        SPT = ",\t";
        TAB = "\t";
        DLM = "\"";
        UNKNOWN = "\"unknown\"\t";
        line  = this.created + SPT;
        line += this.id + SPT;
        line += this.session + SPT;
        line += this.action + SPT;

        line += this.target ?
            this.target.length < 6  ?
            this.target + SPT + TAB : this.target + SPT : UNKNOWN;
        line += this.from ?
            this.from.length < 6  ?
            this.from + SPT + TAB : this.from + SPT : UNKNOWN;
        line += this.to ?
            this.to.length < 6  ?
            this.to + SPT + TAB : this.to + SPT : UNKNOWN;

        if (this.text === null || 'undefined' === typeof this.text) {
            line += "\"no text\"" + SPT;
        }
        else if ('number' === typeof this.text) {
            line += "" + this.text;
        }
        else {
            tmp = this.text.toString();

            if (tmp.length > 12) {
                line += DLM + tmp.substr(0,9) + "..." + DLM + SPT;
            }
            else if (tmp.length < 6) {
                line += DLM + tmp + DLM + SPT + TAB;
            }
            else {
                line += DLM + tmp + DLM + SPT;
            }
        }

        if (this.data === null || 'undefined' === typeof this.data) {
            line += "\"no data\"" + SPT;
        }
        else if ('number' === typeof this.data) {
            line += "" + this.data;
        }
        else {
            tmp = this.data.toString();
            if (tmp.length > 12) {
                line += DLM + tmp.substr(0,9) + "..." + DLM + SPT;
            }
            else if (tmp.length < 9) {
                line += DLM + tmp + DLM + SPT + TAB;
            }
            else {
                line += DLM + tmp + DLM + SPT;
            }
        }

        line += new GameStage(this.stage) + SPT;
        line += this.reliable + SPT;
        line += this.priority;
        return line;
    };

    /**
     * ### GameMSg.toSMS
     *
     * Creates a compact visualization of the most important properties
     *
     * @return {string} A compact string representing the message
     *
     * TODO: Create an hash method as for GameStage
     */
    GameMsg.prototype.toSMS = function() {
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
     * @see GameMsg.toEvent
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
     * @see GameMsg.toEvent
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
    GameMsg.prototype.toEvent = function() {
        return this.action + '.' + this.target;
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # GamePlot
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` container of game stages functions
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    exports.GamePlot = GamePlot;

    var GameStage = parent.GameStage;
    var J = parent.JSUS;

    // ## Constants
    GamePlot.GAMEOVER = 'NODEGAME_GAMEOVER';
    GamePlot.END_SEQ  = 'NODEGAME_END_SEQ';
    GamePlot.NO_SEQ   = 'NODEGAME_NO_SEQ';

    /**
     * ## GamePlot constructor
     *
     * Creates a new instance of GamePlot
     *
     * Takes a sequence object created with Stager.
     *
     * If the Stager parameter has an empty sequence, flexible mode is assumed
     * (used by e.g. GamePlot.next).
     *
     * @param {NodeGameClient} node Reference to current node object
     * @param {Stager} stager Optional. The Stager object.
     *
     * @see Stager
     */
    function GamePlot(node, stager) {

        /**
         * ## GamePlot.node
         *
         * Reference to the node object
         */
        this.node = node;

        /**
         * ## GamePlot.stager
         *
         * The stager object used to perform stepping operations
         */
        this.stager = null;

        this.init(stager);
    }

    // ## GamePlot methods

    /**
     * ### GamePlot.init
     *
     * Initializes the GamePlot with a stager
     *
     * @param {Stager} stager Optional. The Stager object.
     *
     * @see Stager
     */
    GamePlot.prototype.init = function(stager) {
        if (stager) {
            if ('object' !== typeof stager) {
                throw new Error('GamePlot.init: called with invalid stager.');
            }
            this.stager = stager;
        }
        else {
            this.stager = null;
        }
    };

    /**
     * ### GamePlot.next
     *
     * Returns the next stage in the sequence
     *
     * If the step in `curStage` is an integer and out of bounds,
     * that bound is assumed.
     *
     * @param {GameStage} curStage The GameStage of reference
     * @param {bolean} execLoops Optional. If true, loop and doLoop
     *   conditional function will be executed to determine next stage.
     *   If false, null will be returned if the next stage depends
     *   on the execution of the loop/doLoop conditional function.
     *   Default: true.
     *
     * @return {GameStage|string} The GameStage after _curStage_
     *
     * @see GameStage
     */
    GamePlot.prototype.next = function(curStage, execLoops) {
        var seqObj, stageObj;
        var stageNo, stepNo, steps;
        var normStage, nextStage;
        var flexibleMode;

        // GamePlot was not correctly initialized.
        if (!this.stager) return GamePlot.NO_SEQ;

        // Init variables.
        seqObj = null, stageObj = null, normStage = null, nextStage = null;
        // Find out flexibility mode.
        flexibleMode = this.isFlexibleMode();

        if (flexibleMode) {
            curStage = new GameStage(curStage);

            if (curStage.stage === 0) {
                // Get first stage:
                if (this.stager.generalNextFunction) {
                    nextStage = this.stager.generalNextFunction();
                }

                if (nextStage) {
                    return new GameStage({
                        stage: nextStage,
                        step:  1,
                        round: 1
                    });
                }

                return GamePlot.END_SEQ;
            }

            // Get stage object:
            stageObj = this.stager.stages[curStage.stage];

            if ('undefined' === typeof stageObj) {
                throw new Error('Gameplot.next: received nonexistent stage: ' +
                                curStage.stage);
            }

            // Find step number:
            if ('number' === typeof curStage.step) {
                stepNo = curStage.step;
            }
            else {
                stepNo = stageObj.steps.indexOf(curStage.step) + 1;
            }
            if (stepNo < 1) {
                throw new Error('GamePlot.next: received nonexistent step: ' +
                                stageObj.id + '.' + curStage.step);
            }

            // Handle stepping:
            if (stepNo + 1 <= stageObj.steps.length) {
                return new GameStage({
                    stage: stageObj.id,
                    step:  stepNo + 1,
                    round: 1
                });
            }

            // Get next stage:
            if (this.stager.nextFunctions[stageObj.id]) {
                nextStage = this.stager.nextFunctions[stageObj.id]();
            }
            else if (this.stager.generalNextFunction) {
                nextStage = this.stager.generalNextFunction();
            }

            // If next-deciding function returns GamePlot.GAMEOVER,
            // consider it game over.
            if (nextStage === GamePlot.GAMEOVER)  {
                return GamePlot.GAMEOVER;
            }
            else if (nextStage) {
                return new GameStage({
                    stage: nextStage,
                    step:  1,
                    round: 1
                });
            }

            return GamePlot.END_SEQ;
        }

        // Standard Mode.
        else {
            // Get normalized GameStage:
            // makes sures stage is with numbers and not strings.
            normStage = this.normalizeGameStage(curStage);
            if (normStage === null) {
                this.node.warn('GamePlot.next: invalid stage: ' + curStage);
                return null;
            }

            stageNo = normStage.stage;

            if (stageNo === 0) {
                return new GameStage({
                    stage: 1,
                    step:  1,
                    round: 1
                });
            }

            stepNo = normStage.step;
            seqObj = this.stager.sequence[stageNo - 1];

            if (seqObj.type === 'gameover') return GamePlot.GAMEOVER;

            execLoops = 'undefined' === typeof execLoops ? true : execLoops;

            // Get stage object.
            stageObj = this.stager.stages[seqObj.id];

            steps = seqObj.steps;

            // Handle stepping:
            if (stepNo + 1 <= steps.length) {
                return new GameStage({
                    stage: stageNo,
                    step:  stepNo + 1,
                    round: normStage.round
                });
            }

            // Handle repeat block:
            if (seqObj.type === 'repeat' && normStage.round + 1 <= seqObj.num) {
                return new GameStage({
                    stage: stageNo,
                    step:  1,
                    round: normStage.round + 1
                });
            }

            // Handle looping blocks:
            if (seqObj.type === 'doLoop' || seqObj.type === 'loop') {

                // Return null if a loop is found and can't be executed.
                if (!execLoops) return null;

                // Call loop function. True means continue loop.
                if (seqObj.cb.call(this.node.game)) {
                    return new GameStage({
                        stage: stageNo,
                        step:  1,
                        round: normStage.round + 1
                    });
                }
            }

            // Go to next stage.
            if (stageNo < this.stager.sequence.length) {
                seqObj = this.stager.sequence[stageNo];

                // Return null if a loop is found and can't be executed.
                if (!execLoops && seqObj.type === 'loop') return null;

                // Skip over loops if their callbacks return false:
                while (seqObj.type === 'loop' &&
                       !seqObj.cb.call(this.node.game)) {

                    stageNo++;
                    if (stageNo >= this.stager.sequence.length) {
                        return GamePlot.END_SEQ;
                    }
                    // Update seq object.
                    seqObj = this.stager.sequence[stageNo];
                }

                // Handle gameover:
                if (this.stager.sequence[stageNo].type === 'gameover') {
                    return GamePlot.GAMEOVER;
                }

                return new GameStage({
                    stage: stageNo + 1,
                    step:  1,
                    round: 1
                });
            }

            // No more stages remaining:
            return GamePlot.END_SEQ;
        }
    };

    /**
     * ### GamePlot.previous
     *
     * Returns the previous stage in the stager
     *
     * Works only in simple mode.
     *
     * Previous of 0.0.0 is 0.0.0.
     *
     * @param {GameStage} curStage The GameStage of reference
     * @param {bolean} execLoops Optional. If true, loop and doLoop
     *   conditional function will be executed to determine previous stage.
     *   If false, null will be returned if the previous stage depends
     *   on the execution of the loop/doLoop conditional function.
     *   Default: true.
     *
     * @return {GameStage|null} The GameStage before _curStage_, or null
     *   if _curStage_ is invalid.
     *
     * @see GameStage
     */
    GamePlot.prototype.previous = function(curStage, execLoops) {
        var normStage;
        var seqObj, stageObj;
        var prevSeqObj;
        var stageNo, stepNo, prevStepNo;

        // GamePlot was not correctly initialized.
        if (!this.stager) return GamePlot.NO_SEQ;

        seqObj = null, stageObj = null;

        // Get normalized GameStage (calls GameStage constructor).
        normStage = this.normalizeGameStage(curStage);
        if (normStage === null) {
            this.node.warn('GamePlot.previous: invalid stage: ' + curStage);
            return null;
        }
        stageNo = normStage.stage;

        // Already 0.0.0, there is nothing before.
        if (stageNo === 0) return new GameStage();

        stepNo = normStage.step;
        seqObj = this.stager.sequence[stageNo - 1];

        execLoops = 'undefined' === typeof execLoops ? true : execLoops;

        // Within same stage.

        // Handle stepping.
        if (stepNo > 1) {
            return new GameStage({
                stage: stageNo,
                step:  stepNo - 1,
                round: normStage.round
            });
        }

        // Handle rounds:
        if (normStage.round > 1) {
            return new GameStage({
                stage: stageNo,
                step:  seqObj.steps.length,
                round: normStage.round - 1
            });
        }

        // Handle beginning (0.0.0).
        if (stageNo === 1) return new GameStage();

        // Go to previous stage.

        // Get previous sequence object:
        prevSeqObj = this.stager.sequence[stageNo - 2];

        // Return null if a loop is found and can't be executed.
        if (!execLoops && seqObj.type === 'loop') return null;

        // Skip over loops if their callbacks return false:
        while (prevSeqObj.type === 'loop' &&
               !prevSeqObj.cb.call(this.node.game)) {

            stageNo--;
            // (0.0.0).
            if (stageNo <= 1) return new GameStage();

            // Update seq object.
            prevSeqObj = this.stager.sequence[stageNo - 2];
        }

        // Get number of steps in previous stage:
        prevStepNo = prevSeqObj.steps.length;

        // Handle repeat block:
        if (prevSeqObj.type === 'repeat') {
            return new GameStage({
                stage: stageNo - 1,
                step:  prevStepNo,
                round: prevSeqObj.num
            });
        }

        // Handle normal blocks:
        return new GameStage({
            stage: stageNo - 1,
            step:  prevStepNo,
            round: 1
        });
    };

    /**
     * ### GamePlot.jump
     *
     * Returns a distant stage in the stager
     *
     * Works with negative delta only in simple mode.
     *
     * Uses `GamePlot.previous` and `GamePlot.next` for stepping.
     *
     * @param {GameStage} curStage The GameStage of reference
     * @param {number} delta The offset. Negative number for backward stepping.
     * @param {bolean} execLoops Optional. If true, loop and doLoop
     *   conditional function will be executed to determine next stage.
     *   If false, null will be returned when a loop or doLoop is found
     *   and more evaluations are still required. Default: true.
     *
     * @return {GameStage|string|null} The distant game stage
     *
     * @see GameStage
     * @see GamePlot.previous
     * @see GamePlot.next
     */
    GamePlot.prototype.jump = function(curStage, delta, execLoops) {
        var stageType;
        execLoops = 'undefined' === typeof execLoops ? true : execLoops;
        if (delta < 0) {
            while (delta < 0) {
                curStage = this.previous(curStage, execLoops);

                if (!(curStage instanceof GameStage) || curStage.stage === 0) {
                    return curStage;
                }
                delta++;
                if (!execLoops) {
                    // If there are more steps to jump, check if we have loops.
                    stageType = this.stager.sequence[curStage.stage -1].type
                    if (stageType === 'loop') {
                        if (delta < 0) return null;
                    }
                    else if (stageType === 'doLoop') {
                        if (delta < -1) return null;
                        else return curStage;
                    }
                }
            }
        }
        else {
            while (delta > 0) {
                curStage = this.next(curStage, execLoops);
                // If we find a loop return null.
                if (!(curStage instanceof GameStage)) return curStage;

                delta--;
                if (!execLoops) {
                    // If there are more steps to jump, check if we have loops.
                    stageType = this.stager.sequence[curStage.stage -1].type
                    if (stageType === 'loop' || stageType === 'doLoop') {
                        if (delta > 0) return null;
                        else return curStage;
                    }
                }
            }
        }

        return curStage;
    };

    /**
     * ### GamePlot.stepsToNextStage
     *
     * Returns the number of steps from next stage (normalized)
     *
     * The next stage can be a repetition of the current one, if inside a
     * loop or a repeat stage.
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     *
     * @return {number|null} The number of steps including current one,
     *   or NULL on error.
     */
    GamePlot.prototype.stepsToNextStage = function(gameStage) {
        var seqObj, stepNo, limit;
        if (!this.stager) return null;

        gameStage = this.normalizeGameStage(gameStage);
        if (!gameStage) return null;
        if (gameStage.stage === 0) return 1;
        seqObj = this.getSequenceObject(gameStage);
        if (!seqObj) return null;
        stepNo = gameStage.step;
        return 1 + seqObj.steps.length - stepNo;
    };


    GamePlot.prototype.stepsToPreviousStage = function(gameStage) {
        console.log('GamePlot.stepsToPreviousStage is **deprecated**. Use' +
                    'GamePlot.stepsFromPreviousStage instead.');
        return this.stepsFromPreviousStage(gameStage);
    };

    /**
     * ### GamePlot.stepsFromPreviousStage
     *
     * Returns the number of steps from previous stage (normalized)
     *
     * The previous stage can be a repetition of the current one, if inside a
     * loop or a repeat stage.
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     *
     * @return {number|null} The number of steps including current one, or
     *   NULL on error.
     */
    GamePlot.prototype.stepsFromPreviousStage = function(gameStage) {
        var seqObj, stepNo, limit;
        if (!this.stager) return null;

        gameStage = this.normalizeGameStage(gameStage);
        if (!gameStage || gameStage.stage === 0) return null;
        seqObj = this.getSequenceObject(gameStage);
        if (!seqObj) return null;
        stepNo = gameStage.step;
        return (stepNo < 1 || stepNo > seqObj.steps.length) ? null : stepNo;
    };

    /**
     * ### GamePlot.getSequenceObject
     *
     * Returns the sequence object corresponding to a GameStage
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *   or its string representation
     *
     * @return {object|null} The corresponding sequence object,
     *   or NULL if not found
     */
    GamePlot.prototype.getSequenceObject = function(gameStage) {
        if (!this.stager) return null;
        gameStage = this.normalizeGameStage(gameStage);
        return gameStage ? this.stager.sequence[gameStage.stage - 1] : null;
    };

    /**
     * ### GamePlot.getStage
     *
     * Returns the stage object corresponding to a GameStage
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     *
     * @return {object|null} The corresponding stage object, or NULL
     *  if the step was not found
     */
    GamePlot.prototype.getStage = function(gameStage) {
        var stageObj;
        if (!this.stager) return null;
        gameStage = this.normalizeGameStage(gameStage);
        if (gameStage) {
            stageObj = this.stager.sequence[gameStage.stage - 1];
            stageObj = stageObj ? this.stager.stages[stageObj.id] : null;
        }
        return stageObj || null;
    };

    /**
     * ### GamePlot.getStep
     *
     * Returns the step object corresponding to a GameStage
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     *
     * @return {object|null} The corresponding step object, or NULL
     *  if the step was not found
     */
    GamePlot.prototype.getStep = function(gameStage) {
        var seqObj, stepObj;
        if (!this.stager) return null;
        gameStage = this.normalizeGameStage(gameStage);
        if (gameStage) {
            seqObj = this.getSequenceObject(gameStage);
            if (seqObj) {
                stepObj = this.stager.steps[seqObj.steps[gameStage.step - 1]];
            }
        }
        return stepObj || null;
    };

    /**
     * ### GamePlot.getStepRule
     *
     * Returns the step-rule function corresponding to a GameStage
     *
     * If gameStage.stage = 0, it returns a function that always returns TRUE.
     *
     * Otherwise, the order of lookup is:
     *
     * 1. `steprule` property of the step object
     *
     * 2. `steprule` property of the stage object
     *
     * 3. default step-rule of the Stager object
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     *
     * @return {function|null} The step-rule function. NULL on error.
     */
    GamePlot.prototype.getStepRule = function(gameStage) {
        var stageObj, stepObj, rule;

        gameStage = new GameStage(gameStage);

        if (gameStage.stage === 0) {
            return function() { return false; };
        }

        stageObj = this.getStage(gameStage);
        stepObj  = this.getStep(gameStage);

        if (!stageObj || !stepObj) {
            // TODO is this an error?
            return null;
        }

        // return a step-defined rule
        if ('string' === typeof stepObj.stepRule) {
            rule = parent.stepRules[stepObj.stepRule];
        }
        else if ('function' === typeof stepObj.stepRule) {
            rule = stepObj.stepRule;
        }
        if ('function' === typeof rule) return rule;

        // return a stage-defined rule
        if ('string' === typeof stageObj.stepRule) {
            rule = parent.stepRules[stageObj.stepRule];
        }
        else if ('function' === typeof stageObj.stepRule) {
            rule = stageObj.stepRule;
        }
        if ('function' === typeof rule) return rule;

        // Default rule.
        // TODO: Use first line once possible (serialization issue):
        //return this.stager.getDefaultStepRule();
        return this.stager.defaultStepRule;
    };

    /**
     * ### GamePlot.getGlobal
     *
     * Looks up the value of a global variable
     *
     * Looks for definitions of a global variable in
     *
     * 1. the globals property of the step object of the given gameStage,
     *
     * 2. the globals property of the stage object of the given gameStage,
     *
     * 3. the defaults, defined in the Stager.
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     * @param {string} globalVar The name of the global variable
     *
     * @return {mixed|null} The value of the global variable if found,
     *   NULL otherwise.
     */
    GamePlot.prototype.getGlobal = function(gameStage, globalVar) {
        var stepObj, stageObj;
        var stepGlobals, stageGlobals, defaultGlobals;

        gameStage = new GameStage(gameStage);

        // Look in current step:
        stepObj = this.getStep(gameStage);
        if (stepObj) {
            stepGlobals = stepObj.globals;
            if (stepGlobals && stepGlobals.hasOwnProperty(globalVar)) {
                return stepGlobals[globalVar];
            }
        }

        // Look in current stage:
        stageObj = this.getStage(gameStage);
        if (stageObj) {
            stageGlobals = stageObj.globals;
            if (stageGlobals && stageGlobals.hasOwnProperty(globalVar)) {
                return stageGlobals[globalVar];
            }
        }

        // Look in Stager's defaults:
        if (this.stager) {
            defaultGlobals = this.stager.getDefaultGlobals();
            if (defaultGlobals && defaultGlobals.hasOwnProperty(globalVar)) {
                return defaultGlobals[globalVar];
            }
        }

        // Not found:
        return null;
    };

    /**
     * ### GamePlot.getGlobals
     *
     * Looks up and build the _globals_ object for the specified game stage
     *
     * Globals properties are mixed in at each level (defaults, stage, step)
     * to form the complete set of globals available for the specified
     * game stage.
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     *
     * @return {object} The _globals_ object for the specified  game stage
     */
    GamePlot.prototype.getGlobals = function(gameStage) {
        var stepstage, globals;
        if ('string' !== typeof gameStage && 'object' !== typeof gameStage) {
            throw new TypeError('GamePlot.getGlobals: gameStage must be ' +
                                'string or object.');
        }
        globals = {};
        // No stager found, no globals!
        if (!this.stager) return globals;

        // Look in Stager's defaults:
        J.mixin(globals, this.stager.getDefaultGlobals());

        // Look in current stage:
        stepstage = this.getStage(gameStage);
        if (stepstage) J.mixin(globals, stepstage.globals);

        // Look in current step:
        stepstage = this.getStep(gameStage);
        if (stepstage) J.mixin(globals, stepstage.globals);

        return globals;
    };

    /**
     * ### GamePlot.getProperty
     *
     * Looks up the value of a property
     *
     * Looks for definitions of a property in
     *
     * 1. the step object of the given gameStage,
     *
     * 2. the stage object of the given gameStage,
     *
     * 3. the defaults, defined in the Stager.
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     * @param {string} property The name of the property
     *
     * @return {mixed|null} The value of the property if found, NULL otherwise.
     */
    GamePlot.prototype.getProperty = function(gameStage, property) {
        var stepObj, stageObj, defaultProps;

        gameStage = new GameStage(gameStage);

        if ('string' !== typeof property) {
            throw new TypeError('GamePlot.getProperty: property must be ' +
                                'string');
        }

        // Look in current step:
        stepObj = this.getStep(gameStage);
        if (stepObj && stepObj.hasOwnProperty(property)) {
            return stepObj[property];
        }

        // Look in current stage:
        stageObj = this.getStage(gameStage);
        if (stageObj && stageObj.hasOwnProperty(property)) {
            return stageObj[property];
        }

        // Look in Stager's defaults:
        if (this.stager) {
            defaultProps = this.stager.getDefaultProperties();
            if (defaultProps && defaultProps.hasOwnProperty(property)) {
                return defaultProps[property];
            }
        }

        // Not found:
        return null;
    };

    /**
     * ### GamePlot.updateProperty
     *
     * Looks up a property and updates it to the new value
     *
     * Looks follows the steps described in _GamePlot.getProperty_.
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     * @param {string} property The name of the property
     * @param {mixed} value The new value for the property.
     *
     * @return {bool} TRUE, if property is found and updated, FALSE otherwise.
     */
    GamePlot.prototype.updateProperty = function(gameStage, property, value) {
        var stepObj, stageObj, defaultProps;

        gameStage = new GameStage(gameStage);

        if ('string' !== typeof property) {
            throw new TypeError('GamePlot.updateProperty: property must be ' +
                                'string');
        }

        // Look in current step:
        stepObj = this.getStep(gameStage);
        if (stepObj && stepObj.hasOwnProperty(property)) {
            stepObj[property] = value;
            return true;
        }

        // Look in current stage:
        stageObj = this.getStage(gameStage);
        if (stageObj && stageObj.hasOwnProperty(property)) {
            stageObj[property] = value;
            return true;
        }

        // Look in Stager's defaults:
        if (this.stager) {
            defaultProps = this.stager.getDefaultProperties();
            if (defaultProps && defaultProps.hasOwnProperty(property)) {
                defaultProps[property] = value;
                return true;
            }
        }

        // Not found:
        return false;
    };

    /**
     * ### GamePlot.isReady
     *
     * Returns whether the stager has any content
     *
     * @return {boolean} FALSE if stager is empty, TRUE otherwise
     */
    GamePlot.prototype.isReady = function() {
        return this.stager &&
            (this.stager.sequence.length > 0 ||
             this.stager.generalNextFunction !== null ||
             !J.isEmpty(this.stager.nextFunctions));
    };

    /**
     * ### GamePlot.getName
     *
     * TODO: To remove once transition is complete
     * @deprecated
     */
    GamePlot.prototype.getName = function(gameStage) {
        var s = this.getStep(gameStage);
        return s ? s.name : s;
    };

    /**
     * ### GamePlot.normalizeGameStage
     *
     * Converts the GameStage fields to numbers
     *
     * Works only in simple mode.
     *
     * @param {GameStage|string} gameStage The GameStage object
     *
     * @return {GameStage|null} The normalized GameStage object; NULL on error
     */
    GamePlot.prototype.normalizeGameStage = function(gameStage) {
        var stageNo, stageObj, stepNo, seqIdx, seqObj, tokens, round;
        var gs;

        gs = new GameStage(gameStage);

        // Find stage number.
        if ('number' === typeof gs.stage) {
            if (gs.stage === 0) return new GameStage();
            stageNo = gs.stage;
        }
        else if ('string' === typeof gs.stage) {
            for (seqIdx = 0; seqIdx < this.stager.sequence.length; seqIdx++) {
                if (this.stager.sequence[seqIdx].id === gs.stage) {
                    break;
                }
            }
            stageNo = seqIdx + 1;
        }
        else {
            throw new Error('GamePlot.normalizeGameStage: gameStage.stage ' +
                            'must be number or string: ' +
                            (typeof gs.stage));
        }

        if (stageNo < 1 || stageNo > this.stager.sequence.length) {
            this.node.warn('GamePlot.normalizeGameStage: nonexistent stage: ' +
                           gs.stage);
            return null;
        }

        // Get sequence object.
        seqObj = this.stager.sequence[stageNo - 1];
        if (!seqObj) return null;

        if (seqObj.type === 'gameover') {
            return new GameStage({
                stage: stageNo,
                step:  1,
                round: gs.round
            });
        }

        // Get stage object.
        stageObj = this.stager.stages[seqObj.id];
        if (!stageObj) return null;

        // Find step number.
        if ('number' === typeof gs.step) {
            stepNo = gs.step;
        }
        else if ('string' === typeof gs.step) {
            stepNo = seqObj.steps.indexOf(gs.step) + 1;
        }
        else {
            throw new Error('GamePlot.normalizeGameStage: gameStage.step ' +
                            'must be number or string: ' +
                            (typeof gs.step));
        }

        if (stepNo < 1 || stepNo > stageObj.steps.length) {
            this.node.warn('normalizeGameStage received nonexistent step: ' +
                           stageObj.id + '.' + gs.step);
            return null;
        }

        // Check round property.
        if ('number' !== typeof gs.round) return null;

        return new GameStage({
            stage: stageNo,
            step:  stepNo,
            round: gs.round
        });
    };

    /**
     * ### GamePlot.isFlexibleMode
     *
     * Returns TRUE if operating in _flexible_ mode
     *
     * In _flexible_ mode the next step to be executed is decided by a
     * a callback function.
     *
     * In standard mode all steps are already inserted in a sequence.
     *
     * @return {boolean} TRUE if flexible mode is on
     */
    GamePlot.prototype.isFlexibleMode = function() {
        return this.stager.sequence.length === 0;
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # GameMsgGenerator
 *
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` component rensponsible creating messages
 *
 * Static factory of objects of type `GameMsg`.
 *
 * @see GameMsg
 * @see node.target
 * @see node.action
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope

    exports.GameMsgGenerator = GameMsgGenerator;

    var GameMsg = parent.GameMsg,
    GameStage = parent.GameStage,
    constants = parent.constants;

    /**
     * ## GameMsgGenerator constructor
     *
     * Creates an instance of GameMSgGenerator
     *
     */
    function GameMsgGenerator(node) {
        this.node = node;
    }

    // ## GameMsgGenerator methods

    /**
     * ### GameMsgGenerator.create
     *
     * Primitive for creating a new GameMsg object
     *
     * Decorates an input object with all the missing properties
     * of a full GameMsg object.
     *
     * By default GAMECOMMAND, REDIRECT, PCONNET, PDISCONNECT, PRECONNECT
     * have priority 1, all the other targets have priority 0.
     *
     * @param {object} msg Optional. The init object
     *
     * @return {GameMsg} The full GameMsg object
     *
     * @see GameMsg
     */
    GameMsgGenerator.prototype.create = function(msg) {
        var gameStage, priority, node;
        node = this.node;

        if (msg.stage) {
            gameStage = msg.stage;
        }
        else {
            gameStage = node.game ?
                node.game.getCurrentGameStage() : new GameStage('0.0.0');
        }

        if ('undefined' !== typeof msg.priority) {
            priority = msg.priority;
        }
        else if (msg.target === constants.target.GAMECOMMAND ||
                 msg.target === constants.target.REDIRECT ||
                 msg.target === constants.target.PCONNECT ||
                 msg.target === constants.target.PDISCONNECT ||
                 msg.target === constants.target.PRECONNECT ||
                 msg.target === constants.target.SETUP) {

            priority = 1;
        }
        else {
            priority = 0;
        }

        return new GameMsg({
            session: 'undefined' !== typeof msg.session ?
                msg.session : node.socket.session,
            stage: gameStage,
            action: msg.action || constants.action.SAY,
            target: msg.target || constants.target.DATA,
            from: node.player ? node.player.id : constants.UNDEFINED_PLAYER,
            to: 'undefined' !== typeof msg.to ? msg.to : 'SERVER',
            text: 'undefined' !== typeof msg.text ? "" + msg.text : null,
            data: 'undefined' !== typeof msg.data ? msg.data : null,
            priority: priority,
            reliable: msg.reliable || 1
        });

    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Stager stages and steps
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    var J = node.JSUS;

    // Export Stager.
    var Stager = exports.Stager = {};

    /**
     * ## Block.blockTypes
     *
     * List of available block types
     */
    var blockTypes = {

        // #### BLOCK_DEFAULT
        //
        // The first block automatically added to the stager.
        //
        BLOCK_DEFAULT:           '__default',

        // #### BLOCK_STAGEBLOCK
        //
        // A block that is a collection of stages.
        //
        BLOCK_STAGEBLOCK:        '__stageBlock_',

        // #### BLOCK_STAGE
        //
        //
        //
        BLOCK_STAGE:             '__stage',

        // #### BLOCK_STEPBLOCK
        //
        // A block that is a collection of steps
        //
        BLOCK_STEPBLOCK:         '__stepBlock_',

        // #### BLOCK_STEP
        //
        // ?
        //
        BLOCK_STEP:              '__step',

        // BLOCK_ENCLOSING
        //
        //
        //
        BLOCK_ENCLOSING:         '__enclosing_',

        // #### BLOCK_ENCLOSING_STEPS
        //
        //
        //
        BLOCK_ENCLOSING_STEPS:   '__enclosing_steps',

        // #### BLOCK_ENCLOSING_STAGES
        //
        //
        //
        BLOCK_ENCLOSING_STAGES:  '__enclosing_stages',
    };

    // Add private functions to Stager.
    Stager.blockTypes = blockTypes;
    Stager.checkPositionsParameter = checkPositionsParameter;
    Stager.addStageBlock = addStageBlock;
    Stager.addBlock = addBlock;
    Stager.checkFinalized = checkFinalized;
    Stager.handleStepsArray = handleStepsArray;
    Stager.makeDefaultCb = makeDefaultCb;
    Stager.isDefaultCb = isDefaultCb;
    Stager.isDefaultStep = isDefaultStep;
    Stager.makeDefaultStep = makeDefaultStep;
    Stager.unmakeDefaultStep = unmakeDefaultStep;
    Stager.addStepToBlock = addStepToBlock;

    var BLOCK_DEFAULT     = blockTypes.BLOCK_DEFAULT;
    var BLOCK_STAGEBLOCK  = blockTypes.BLOCK_STAGEBLOCK;
    var BLOCK_STAGE       = blockTypes. BLOCK_STAGE;
    var BLOCK_STEPBLOCK   = blockTypes. BLOCK_STEPBLOCK;
    var BLOCK_STEP        = blockTypes.BLOCK_STEP;

    var BLOCK_ENCLOSING          = blockTypes.BLOCK_ENCLOSING;
    var BLOCK_ENCLOSING_STEPS    = blockTypes. BLOCK_ENCLOSING_STEPS;
    var BLOCK_ENCLOSING_STAGES   = blockTypes.BLOCK_ENCLOSING_STAGES;

    /**
     * #### handleStepsArray
     *
     * Validates the items of a steps array, creates new steps if necessary
     *
     * @param {Stager} that Stager object
     * @param {string} stageId The original stage id
     * @param {array} steps The array of steps to validate
     * @param {string} method The name of the method invoking the method
     */
    function handleStepsArray(that, stageId, steps, method) {
        var i, len;
        i = -1, len = steps.length;
        // Missing steps are added with default callback (if string),
        // or as they are if object.
        for ( ; ++i < len ; ) {
            if ('object' === typeof steps[i]) {
                // Throw error if step.id is not unique.
                that.addStep(steps[i]);
                // Substitute with its id.
                steps[i] = steps[i].id;
            }
            else if ('string' === typeof steps[i]) {
                if (!that.steps[steps[i]]) {
                    // Create a step with a default cb (will be substituted).
                    // Note: default callback and default step are two
                    // different things.
                    that.addStep({
                        id: steps[i],
                        cb: that.getDefaultCb()
                    });
                }
            }
            else {
                throw new TypeError('Stager.' + method + ': stage ' +
                                    stageId  + ': items of the steps array ' +
                                    'must be string or object.');
            }
        }
    }


    /**
     * #### addStageBlock
     *
     * Close last step and stage blocks and add a new stage block
     *
     * @param {Stager} that The stager instance
     * @param {string} id Optional. The id of the stage block
     * @param {string} type The type of the stage block
     * @param {string|number} The allowed positions for the block
     *
     * @see addBlock
     */
    function addStageBlock(that, id, type, positions) {
        // Begin stage block (closes two: steps and stage).
        if (that.currentType !== BLOCK_DEFAULT) that.endBlocks(2);
        that.currentType = BLOCK_DEFAULT;
        addBlock(that, id, type, positions, BLOCK_STAGE);
    }

    /**
     * #### addBlock
     *
     * Adds a new block of the specified type to the sequence
     *
     * @param {Stager} that The stager instance
     * @param {string} id Optional. The id of the stage block
     * @param {string} type The block type
     * @param {string|number} positions The allowed positions for the block
     * @param {string} type2 The value that the currentBlock variable
     *    will be set to (BLOCK_STAGE or BLOCK_STEP)
     */
    function addBlock(that, id, type, positions, type2) {
        var block, options;
        options = {};

        options.id = id || J.uniqueKey(that.blocksIds, type);
        options.type = type;
        options.positions = positions;

        that.currentBlockType = type2;

        // Create the new block, and add it block arrays.
        block = new node.Block(options);
        that.unfinishedBlocks.push(block);
        that.blocks.push(block);

        // Save block id into the blocks map.
        that.blocksIds[options.id] = (that.blocks.length - 1);
    }

    /**
     * #### checkFinalized
     *
     * Check whether the stager is already finalized, and throws an error if so
     *
     * @param {object} that Reference to Stager object
     * @param {string} method The name of the method calling the validation
     *
     * @api private
     */
    function checkFinalized(that, method) {
        if (that.finalized) {
            throw new Error('Stager.' + method + ': stager has been ' +
                            'already finalized.');
        }
    }

    /**
     * #### checkPositionsParameter
     *
     * Check validity of a positions parameter
     *
     * Called by: `stage`, `repeat`, `doLoop`, 'loop`.
     *
     * @param {string|number} stage The positions parameter to validate
     * @param {string} method The name of the method calling the validation
     *
     * @api private
     */
    function checkPositionsParameter(positions, method) {
        var err;
        if ('undefined' === typeof positions) return;
        if ('number' === typeof positions) {
            if (isNaN(positions) ||
                positions < 0 ||
                !isFinite(positions)) {
                err = true;
            }
            else {
                positions += '';
            }
        }

        if (err || 'string' !== typeof positions || positions.trim() === '') {
            throw new TypeError('Stager.' + method + ': positions must ' +
                                'be a non-empty string, a positive finite ' +
                                'number, or undefined. Found: ' +
                                positions + '.');
        }
        return positions;
    }

    /**
     * #### addStepToBlock
     *
     * Adds a step to a block
     *
     * Checks if a step with the same id was already added.
     *
     * @param {object} that Reference to Stager object
     * @param {object} stage The block object
     * @param {string} stepId The id of the step
     * @param {string} stageId The id of the stage the step belongs to
     * @param {string|number} positions Optional. Positions allowed for
     *    step in the block
     *
     * @return {boolean} TRUE if the step is added to the block
     */
    function addStepToBlock(that, block, stepId, stageId, positions) {
        var stepInBlock;
        // Add step, if not already added.
        if (block.hasItem(stepId)) return false;

        stepInBlock = {
            type: stageId,
            item: stepId,
            id: stepId
        };

        if (isDefaultStep(that.steps[stepId])) {
            makeDefaultStep(stepInBlock);
        }
        block.add(stepInBlock, positions);
        return true;
    }

    /**
     * #### makeDefaultCb
     *
     * Flags or create a callback function marked as `default`
     *
     * @param {function} cb Optional. The function to mark. If undefined,
     *   an empty function is used
     *
     * @return {function} A function flagged as `default`
     *
     * @see isDefaultCb
     */
    function makeDefaultCb(cb) {
        if ('undefined' === typeof cb) cb = function() {};
        cb._defaultCb = true;
        return cb;
    }

    /**
     * #### isDefaultCb
     *
     * Returns TRUE if a callback was previously marked as `default`
     *
     * @param {function} cb The function to check
     *
     * @return {boolean} TRUE if function is default callback
     *
     * @see makeDefaultCb
     */
    function isDefaultCb(cb) {
        return cb._defaultCb;
    }

    /**
     * #### makeDefaultStep
     *
     * Flags or create a step object marked as `default`
     *
     * @param {object|string} step The step object to mark. If a string
     *   is passed, a new step object with default cb is created.
     * @ param {function} cb Optional A function to create the step cb
     *
     * @return {object} step the step flagged as `default`
     *
     * @see makeDefaultCb
     * @see isDefaultStep
     */
    function makeDefaultStep(step, cb) {
        if ('string' === typeof step) {
            step = {
                id: step,
                cb: makeDefaultCb(cb)
            };
        }
        step._defaultStep = true;
        return step;
    }

    /**
     * #### unmakeDefaultStep
     *
     * Removes the flag from a step marked as `default`
     *
     * @param {object} step The step object to unmark.
     *
     * @return {object} step the step without the `default` flag
     *
     * @see makeDefaultDefaultStep
     * @see isDefaultStep
     */
    function unmakeDefaultStep(step) {
        if (step._defaultStep) step._defaultStep = null;
        return step;
    }

    /**
     * #### isDefaultStep
     *
     * Returns TRUE if a step object was previously marked as `default`
     *
     * @param {object} step The step object to check
     *
     * @return {boolean} TRUE if step object is default step
     *
     * @see makeDefaultStep
     */
    function isDefaultStep(step) {
        return step._defaultStep;
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Block
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Blocks contain items that can be sorted in the sequence.
 *
 * Blocks can also contains other block as items, and in this case all
 * items are sorted recursevely.
 *
 * Each item must contain a id (unique within the block), and a type parameter.
 * Optionally, a `positions` parameter, controlling the positions that the item
 * can take in the sequence, can be be passed along.
 *
 * Items is encapsulated in objects of the type:
 *
 * { item: item, positions: positions }
 *
 * and added to the unfinishedItems array.
 *
 * When the finalized method is called, items are sorted according to the
 * `positions` parameter and moved into the items array.
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    exports.Block = Block;

    var J = parent.JSUS;

    // Mock stager object. Contains only shared variables at this point.
    // The stager class will be added later.
    var Stager = parent.Stager;

    // Referencing shared entities.
    var isDefaultStep = Stager.isDefaultStep;

    var blockTypes = Stager.blockTypes;

    var BLOCK_DEFAULT     = blockTypes.BLOCK_DEFAULT;
    var BLOCK_STAGEBLOCK  = blockTypes.BLOCK_STAGEBLOCK;
    var BLOCK_STAGE       = blockTypes. BLOCK_STAGE;
    var BLOCK_STEPBLOCK   = blockTypes. BLOCK_STEPBLOCK;
    var BLOCK_STEP        = blockTypes.BLOCK_STEP;

    var BLOCK_ENCLOSING          = blockTypes.BLOCK_ENCLOSING;
    var BLOCK_ENCLOSING_STEPS    = blockTypes. BLOCK_ENCLOSING_STEPS;
    var BLOCK_ENCLOSING_STAGES   = blockTypes.BLOCK_ENCLOSING_STAGES;


    /**
     * ## Block constructor
     *
     * Creates a new instance of Block
     *
     * @param {object} options Configuration object
     */
    function Block(options) {

        if ('object' !== typeof options) {
            throw new TypeError('Block constructor: options must be object: ' +
                                options);
        }

        if ('string' !== typeof options.type || options.type.trim() === '') {
            throw new TypeError('Block constructor: options.type must ' +
                                'be a non-empty string: ' + options.type);
        }

        if ('string' !== typeof options.id || options.id.trim() === '') {
            throw new TypeError('Block constructor: options.id must ' +
                                'be a non-empty string: ' + options.id);
        }

        // ### Properties

        /**
         * #### Block.type
         *
         * Stage or Step block
         */
        this.type = options.type;

        /**
         * #### Block.id
         *
         * An identifier (name) for the block instance
         */
        this.id = options.id;

        /**
         * #### Block.positions
         *
         * Positions in the enclosing Block that this block can occupy
         */
        this.positions = 'undefined' !== typeof options.positions ?
            options.positions : 'linear';

        /**
         * #### Block.takenPositions
         *
         * Positions within this Block that this are occupied
         */
        this.takenPositions = [];

        /**
         * #### Block.items
         *
         * The sequence of items within this Block
         */
        this.items = [];

        /**
         * #### Block.itemsIds
         *
         * List of the items added to the block so far
         */
        this.itemsIds = {};

        /**
         * #### Block.unfinishedItems
         *
         * Items that have not been assigned a position in this block
         */
        this.unfinishedItems = [];

         /**
         * #### Block.index
         *
         * Index of the current element to be returned by Block.next
         *
         * @see Block.next
         */
        this.index = 0;

        /**
         * #### Block.finalized
         *
         * Flag to indicate whether a block is completed
         */
        this.finalized = false;

        /**
         * #### Block.resetCache
         *
         * Cache object to reset Block after finalization
         */
        this.resetCache = null;

    }

    // ### Methods

    /**
     * #### Block.add
     *
     * Adds an item to a block
     *
     * @param {object} item. The item to be added
     * @param {string} positions. The positions where item can be added
     *   Setting this parameter to "linear" or undefined adds the
     *   item to the next free n-th position where this is the n-th
     *   call to add.
     */
    Block.prototype.add = function(item, positions) {

        if (this.finalized) {
            throw new Error('Block.add: block already finalized, ' +
                            'cannot add further items.');
        }

        if ('string' !== typeof item.id) {
            throw new TypeError('Block.add: block ' + this.id + ': item id ' +
                                'must be string: ' + item.id || 'undefined.');
        }
        if ('string' !== typeof item.type) {
            throw new TypeError('Block.add: block ' + this.id +
                                ': item type must be string: ' +
                                item.type || 'undefined.');
        }

        if (this.itemsIds[item.id]) {
            throw new TypeError('Block.add: block ' + this.id +
                                ': item was already added to block: ' +
                                item.id + '.');
        }


        // We cannot set the position as a number here,
        // because it might change with future modifications of
        // the block. Only on block.finalize the position is fixed.
        if ('undefined' === typeof positions) {
            positions = 'linear';
        }

        this.unfinishedItems.push({
            item: item,
            positions: positions
        });

        // Save item's id.
        this.itemsIds[item.id] = true;
    };

    /**
     * #### Block.remove
     *
     * Removes an item from a block
     *
     * @param {string} itemId The id of the item to be removed
     *
     * @return {object} The removed item, or undefined if the item
     *    does not exist
     */
    Block.prototype.remove = function(itemId) {
        var i, len;

        if (this.finalized) {
            throw new Error('Block.remove: block already finalized, ' +
                            'cannot remove items.');
        }

        if (!this.hasItem(itemId)) return;

        i = -1, len = this.unfinishedItems.length;
        for ( ; ++i < len ; ) {
            if (this.unfinishedItems[i].item.id === itemId) {
                this.itemsIds[itemId] = null;

                // Delete from cache as well.
                if (this.resetCache &&
                    this.resetCache.unfinishedItems[itemId]) {

                    delete this.resetCache.unfinishedItems[itemId];
                }
                return this.unfinishedItems.splice(i,1);
            }
        }

        throw new Error('Block.remove: item ' + itemId + ' was found in the ' +
                        'in the itemsIds list, but could not be removed ' +
                        'from block ' + this.id);
    };

    /**
     * #### Block.removeAllItems
     *
     * Removes all items from a block
     *
     * @see Block.remove
     */
    Block.prototype.removeAllItems = function(itemId) {
        var i, len;

        if (this.finalized) {
            throw new Error('Block.remove: block already finalized, ' +
                            'cannot remove items.');
        }

        i = -1, len = this.unfinishedItems.length;
        for ( ; ++i < len ; ) {
            this.remove(this.unfinishedItems[i].item.id);
        }

    };

    /**
     * #### Block.hasItem
     *
     * Checks if an item has been previously added to block
     *
     * @param {string} itemId The id of item to check
     *
     * @return {boolean} TRUE, if the item is found
     */
    Block.prototype.hasItem = function(itemId) {
        return !!this.itemsIds[itemId];
    };

    /**
     * #### Block.finalize
     *
     * Processes all unfinished entries, assigns each to a position
     *
     * Sets the finalized flag.
     */
    Block.prototype.finalize = function() {
        var entry, item, positions, i, len, chosenPosition;
        var available;

        if (this.finalized) return;
        if (!this.unfinishedItems.length) {
            this.finalized = true;
            return;
        }

        // Remove default step if it is BLOCK_STEP and further steps were added.
        if (this.isType(BLOCK_ENCLOSING_STEPS) && this.size() > 1) {
            if (isDefaultStep(this.unfinishedItems[0].item)) {
                // Remove the id of the removed item from the lists of ids.
                this.itemsIds[this.unfinishedItems[0].item.id] = null;
                this.unfinishedItems.splice(0,1);
            }
        }

        i = -1, len = this.unfinishedItems.length;
        // Update the positions of other steps as needed.
        for ( ; ++i < len ; ) {
            if (this.unfinishedItems[i].positions === 'linear') {
                this.unfinishedItems[i].positions = i;
            }
        }

        // Creating array of available positions:
        // from 0 to nItems accounting for already taken positions.
        available = J.seq(0, this.size()-1);

        // TODO: this could be done inside the while loop. However, as
        // every iterations also other entries are updated, it requires
        // multiple calls to J.range.
        // Parsing all of the position strings into arrays.
        i = -1, len = this.unfinishedItems.length;
        for ( ; ++i < len ; ) {
            positions = this.unfinishedItems[i].positions;
            this.unfinishedItems[i].positions =
                J.range(positions, available);
        }

        // Assigning positions.
        while (this.unfinishedItems.length > 0) {
            // Select entry with least possibilities of where to go.
            this.unfinishedItems.sort(sortFunction);
            entry = this.unfinishedItems.pop();
            item = entry.item;
            positions = entry.positions;

            // No valid position specified.
            if (positions.length === 0) {
                throw new Error('Block.finalize: No valid position for ' +
                                'entry ' + item.id + ' in Block ' +
                                this.id + '.');
            }

            // Chose position randomly among possibilities.
            chosenPosition =  positions[J.randomInt(0, positions.length) - 1];
            this.items[chosenPosition] = item;
            this.takenPositions.push(chosenPosition);

            // Adjust possible positions in remaining entries.
            i = -1, len = this.unfinishedItems.length;
            for ( ; ++i < len ; ) {
                J.removeElement(chosenPosition,
                                this.unfinishedItems[i].positions);
            }
        }
        this.finalized = true;
    };

    /**
     * #### Block.next
     *
     * Gets the next item in a hierarchy of Blocksg
     *
     * If there is not next item, false is returned.
     * If the next item is another Block, next is called recursively.
     *
     * @return {object|boolean} The the item in hierarchy, or FALSE
     *   if none is found.
     */
    Block.prototype.next = function() {
        var item;
        if (this.index < this.items.length) {
            item = this.items[this.index];
            if (item instanceof Block) {
                item = item.next();
                if (item === false) {
                    this.index++;
                    return this.next();
                }
                else {
                    return item;
                }
            }
            else {
                this.index++;
                return item;
            }
        }
        return false;
    };

    /**
     * #### Block.backup
     *
     * Saves the current state of the block
     *
     * @see Block.restore
     */
    Block.prototype.backup = function() {
        this.resetCache = J.classClone({
            takenPositions: this.takenPositions,
            unfinishedItems: this.unfinishedItems,
            items: this.items,
            itemsIds: this.itemsIds
        }, 3);
    };

    /**
     * #### Block.restore
     *
     * Resets the state of the block to the latest saved state
     *
     * Even if the reset cache for the block is empty, it sets
     * index to 0 and finalized to false.
     *
     * Marks the block as not `finalized`
     *
     * @see Block.finalize
     */
    Block.prototype.restore = function() {
        this.index = 0;
        this.finalized = false;

        if (!this.resetCache) return;
        this.unfinishedItems = this.resetCache.unfinishedItems;
        this.takenPositions = this.resetCache.takenPositions;
        this.items = this.resetCache.items;
        this.itemsIds = this.resetCache.itemsIds;
        this.resetCache = null;
    };

    /**
     * ## Block.size
     *
     * Returns the total number of items inside the block
     *
     * @return {number} The total number of items in the block
     */
    Block.prototype.size = function() {
        return this.items.length + this.unfinishedItems.length;
    };

    /**
     * ## Block.isType | isOfType
     *
     * Returns TRUE if the block is of the specified type
     *
     * @param {string} type The type to check
     *
     * @return {boolean} TRUE if the block is of the specified type
     */
    Block.prototype.isType = Block.prototype.isOfType = function(type) {
        return this.type === type;
    };

    /**
     * ## Block.clone
     *
     * Returns a copy of the block
     *
     * @return {Block} A new instance of block with the same settings and items
     */
    Block.prototype.clone = function() {
        var block;
        block = new Block({
            type: this.type,
            id: this.id
        });
        block.positions = J.clone(this.positions);
        block.takenPositions = J.clone(this.takenPositions);
        block.items = J.clone(this.items);
        block.itemsIds = this.itemsIds;
        block.unfinishedItems = J.clone(this.unfinishedItems);
        block.index = this.index;
        block.finalized = this.finalized;
        block.resetCache = J.clone(this.resetCache);
        return block;
    };

    // ## Helper Functions

    /**
     * #### sortFunction
     *
     * Sorts elements in block by number of available positions
     *
     * Those with fewer positions go last, because then Array.pop is used.
     *
     * @api private
     */
    function sortFunction(left, right) {
        if (left.positions.length <= right.positions.length) return 1;
        return -1;
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Stager
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` container and builder of the game sequence
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope

    var J = parent.JSUS;
    var stepRules = parent.stepRules;
    var Block = parent.Block;

    // What is in the Stager obj at this point.
    var tmpStager = parent.Stager
    // Add it to the Stager class.
    J.mixin(Stager, tmpStager);
    // Export the Stager class.
    exports.Stager = Stager;

    // Referencing shared entities.
    var blockTypes = Stager.blockTypes;
    var makeDefaultCb = Stager.makeDefaultCb;
    var isDefaultStep = Stager.isDefaultStep;

    // ## Static Methods

    /**
     * #### Stager.defaultCallback
     *
     * Default callback added to steps when none is specified
     *
     * @see Stager.setDefaultCallback
     * @see Stager.getDefaultCallback
     */
    Stager.defaultCallback = function() {
        this.node.log(this.getCurrentStepObj().id);
        this.node.done();
    };

    // Flag it as `default`.
    Stager.makeDefaultCb(Stager.defaultCallback);

    /**
     * ## Stager Constructor
     *
     * Creates a new instance of Stager
     *
     * @param {object} stateObj Optional. State to initialize the new
     *   Stager object with. See `Stager.setState`.
     *
     * @see Stager.setState
     */
    function Stager(stateObj) {

        // ## Properties

        /**
         * #### Stager.steps
         *
         * Step object container
         *
         * key: step ID,  value: step object
         *
         * @see Stager.addStep
         */
        this.steps = {};

        /**
         * #### Stager.stages
         *
         * Stage object container
         *
         * key: stage ID,  value: stage object
         *
         * Stage aliases are stored the same way, with a reference to
         * the original stage object as the value.
         *
         * @see Stager.addStage
         */
        this.stages = {};

        /**
         * #### Stager.sequence
         *
         * Sequence block container
         *
         * Stores the game plan in 'simple mode'.
         *
         * @see Stager.gameover
         * @see Stager.next
         * @see Stager.repeat
         * @see Stager.loop
         * @see Stager.doLoop
         */
        this.sequence = [];

        /**
         * #### Stager.generalNextFunction
         *
         * General next-stage decider function
         *
         * Returns the id of the next game step.
         * Available only when nodegame is executed in _flexible_ mode.
         *
         * @see Stager.registerGeneralNext
         */
        this.generalNextFunction = null;

        /**
         * #### Stager.nextFunctions
         *
         * Per-stage next-stage decider function
         *
         * key: stage ID,  value: callback function
         *
         * Stores functions to be called to yield the id of the next
         * game stage for a specific previous stage.
         *
         * @see Stager.registerNext
         */
        this.nextFunctions = {};

        /**
         * #### Stager.defaultStepRule
         *
         * Default step-rule function
         *
         * This function decides whether it is possible to proceed to
         * the next step/stage. If a step/stage object defines a
         * `steprule` property, then that function is used instead.
         *
         * @see Stager.getDefaultStepRule
         * @see GamePlot.getStepRule
         */
        this.setDefaultStepRule();

        /**
         * #### Stager.defaultGlobals
         *
         * Defaults of global variables
         *
         * This map holds the default values of global variables. These
         * values are overridable by more specific version in step and
         * stage objects.
         *
         * @see Stager.setDefaultGlobals
         * @see GamePlot.getGlobal
         */
        this.defaultGlobals = {};

        /**
         * #### Stager.defaultProperties
         *
         * Defaults of properties
         *
         * This map holds the default values of properties. These values
         * are overridable by more specific version in step and stage
         * objects.
         *
         * @see Stager.setDefaultProperties
         * @see GamePlot.getProperty
         */
        this.defaultProperties = {};

        /**
         * #### Stager.onInit
         *
         * Initialization function
         *
         * This function is called as soon as the game is instantiated,
         * i.e. at stage 0.0.0.
         *
         * Event listeners defined here stay valid throughout the whole
         * game, unlike event listeners defined inside a function of the
         * gamePlot, which are valid only within the specific function.
         */
        this.onInit = null;

        /**
         * #### Stager.onGameover
         *
         * Cleaning up function
         *
         * This function is called after the last stage of the gamePlot
         * is terminated.
         */
        this.onGameover = null;

        /**
         * #### Stager.blocks
         *
         * Array of blocks as they in the order they were added to the stager
         */
        this.blocks = [];

        /**
         * #### Stager.blocksIds
         *
         * Map block-id to block-position in the blocks array
         *
         * @see blocks
         */
        this.blocksIds = {};

        /**
         * #### Stager.unfinishedBlocks
         *
         * List of all Blocks stager might still modify
         */
        this.unfinishedBlocks = [];

        /**
         * #### Stager.finalized
         *
         * Flag indicating if the hierarchy of has been set
         *
         * Indicates if the hierarchy of stages and steps has been set.
         */
        this.finalized = false;

        /**
         * #### Stager.currentType
         *
         * Name of the stage currently worked with in building hierarchy
         */
        this.currentType = blockTypes.BLOCK_DEFAULT;

        /**
         * #### Stager.currentBlockType
         *
         * Indicates what type of Block was added last
         */
        this.currentBlockType = blockTypes.BLOCK_DEFAULT;

        /**
         * #### Stager.toSkip
         *
         * List of stages and steps to skip when building the sequence
         */
        this.toSkip = {
            stages: {},
            steps: {}
        };

        /**
         * #### Stager.defaultCallback
         *
         * Default callback assigned to a step if none is provided
         */
        this.defaultCallback = Stager.defaultCallback;

        /**
         * #### Stager.cacheReset
         *
         * Cache used to reset the state of the stager after finalization
         */
        this.cacheReset = {
            unfinishedBlocks: []
        };

        /**
         * #### Stager.log
         *
         * Default standard output. Override to redirect.
         */
        this.log = console.log;

        // Set the state if one is passed.
        if (stateObj) {
            if ('object' !== typeof stateObj) {
                throw new TypeError('Stager: stateObj must be object.');
            }
            this.setState(stateObj);
        }
        else {
            // Add first block.
            this.stageBlock(blockTypes.BLOCK_DEFAULT, 'linear');
        }
    }

    // ## Methods

    // ### Clear, init, finalize, reset.

    /**
     * #### Stager.clear
     *
     * Clears the state of the stager
     *
     * @return {Stager} this object
     */
    Stager.prototype.clear = function() {
        this.steps = {};
        this.stages = {};
        this.sequence = [];
        this.generalNextFunction = null;
        this.nextFunctions = {};
        this.setDefaultStepRule();
        this.defaultGlobals = {};
        this.defaultProperties = {};
        this.onInit = null;
        this.onGameover = null;
        this.blocks = [];
        this.blocksIds = {};
        this.unfinishedBlocks = [];
        this.finalized = false;
        this.currentType = blockTypes.BLOCK_DEFAULT;
        this.currentBlockType = blockTypes.BLOCK_DEFAULT;
        this.toSkip = { stages: {}, steps: {} };
        this.defaultCallback = Stager.defaultCallback;
        this.cacheReset = { unfinishedBlocks: [] };
        return this;
    };

    /**
     * #### Stager.init
     *
     * Clears the state of the stager and adds a default block
     *
     * @return {Stager} this object
     *
     * @see Stager.clear
     */
    Stager.prototype.init = function() {
        this.clear();
        this.stageBlock(blockTypes.BLOCK_DEFAULT, 'linear');
        return this;
    };

    /**
     * #### Stager.finalize
     *
     * Builds stage and step sequence from the Block hieararchy
     *
     * Stages and steps are excluded from the sequence if they were marked
     * as _toSkip_.
     *
     * Steps are excluded from the sequence if they were added as
     * _default step_, but then other steps have been added to the same stage.
     *
     * @see Stager.reset
     */
    Stager.prototype.finalize = function() {
        var currentItem, stageId, stepId;
        var outermostBlock, blockIndex;
        var i, len, seqItem;

        // Already finalized.
        if (this.finalized) return;

        // Nothing to do, finalize called too early.
        if (!this.blocks.length) return;

        // Cache the ids of unfinishedBlocks for future calls to .reset.
        i = -1, len = this.unfinishedBlocks.length;
        for ( ; ++i < len ; ) {
            this.cacheReset.unfinishedBlocks.push(this.unfinishedBlocks[i].id);
        }

        // Need to backup all blocks before calling endAllBlocks().
        for (blockIndex = 0; blockIndex < this.blocks.length; ++blockIndex) {
            this.blocks[blockIndex].backup();
        }

        // Closes unclosed blocks.
        this.endAllBlocks();

        // Fixes the position of unfixed elements inside each block.
        for (blockIndex = 0; blockIndex < this.blocks.length; ++blockIndex) {
            this.blocks[blockIndex].finalize();
        }

        // Take outermost block and start building sequence.
        outermostBlock = this.blocks[0];
        currentItem = outermostBlock.next();
        while (!!currentItem) {
            if (currentItem.type === blockTypes.BLOCK_STAGE) {
                stageId = currentItem.item.id;
                // Add it to sequence if it was
                // not marked as `toSkip`, or it is a gameover stage.
                if (currentItem.item.type === 'gameover' ||
                    !this.isSkipped(stageId)) {

                    seqItem = J.clone(currentItem.item);
                    seqItem.steps = [];
                    this.sequence.push(seqItem);
                }
            }
            else {
                // It is a step, currentItem.type = stage id (TODO: change).
                stageId = currentItem.type;
                stepId = currentItem.item;

                // 1 - Step was marked as `toSkip`.
                if (!this.isSkipped(stageId, stepId) &&

                    // 2 - Step was a default step,
                    //     but other steps have been added.
                    (!isDefaultStep(this.steps[stepId]) ||
                     this.stages[stageId].steps.length === 1)) {

                    // Ok, add the step to the sequence (must look up stage).
                    i = -1, len = this.sequence.length;
                    for ( ; ++i < len ; ) {
                        if (this.sequence[i].id === stageId) {
                            this.sequence[i].steps.push(stepId);
                            break;
                        }
                    }
                }
            }
            currentItem = outermostBlock.next();
        }
        this.finalized = true;
    };

    /**
     * #### Stager.reset
     *
     * Undoes a previous call to `finalize`
     *
     * Allows to call `Stager.finalize` again to build a potentially
     * different sequence from the Block hierarchy.
     *
     * @see Stager.finalize
     * @see Stager.cacheReset
     */
    Stager.prototype.reset = function() {
        var blockIdx, i, len;

        if (!this.finalized) return this;

        // Restore unfinishedBlocks, if any.
        len = this.cacheReset.unfinishedBlocks.length;
        if (len) {
            // Copy by reference cached blocks.
            i = -1;
            for ( ; ++i < len ; ) {
                blockIdx = this.blocksIds[this.cacheReset.unfinishedBlocks[i]];
                this.unfinishedBlocks.push(this.blocks[blockIdx]);
            }
            this.cacheReset = { unfinishedBlocks: []};
        }
        // End restore unfinishedBlocks.

        // Call restore on individual blocks.
        for (blockIdx = 0; blockIdx < this.blocks.length; ++blockIdx) {
            this.blocks[blockIdx].restore();
        }

        this.sequence = [];
        this.finalized = false;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Stager stages and steps
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    var J      = node.JSUS;
    var Stager = node.Stager;
    var Block  = node.Block;

    // Get reference to shared entities in Stager.
    var checkPositionsParameter = Stager.checkPositionsParameter;
    var addStageBlock           = Stager.addStageBlock;
    var addBlock                = Stager.addBlock;
    var checkFinalized          = Stager.checkFinalized;
    var handleStepsArray        = Stager.handleStepsArray;
    var makeDefaultCb           = Stager.makeDefaultCb;
    var isDefaultCb             = Stager.isDefaultCb;
    var makeDefaultStep         = Stager.makeDefaultStep;
    var isDefaultStep           = Stager.isDefaultStep;
    var addStepToBlock          = Stager.addStepToBlock;

    var blockTypes              = Stager.blockTypes;

    var BLOCK_DEFAULT           = blockTypes.BLOCK_DEFAULT;
    var BLOCK_STAGEBLOCK        = blockTypes.BLOCK_STAGEBLOCK;
    var BLOCK_STAGE             = blockTypes. BLOCK_STAGE;
    var BLOCK_STEPBLOCK         = blockTypes. BLOCK_STEPBLOCK;
    var BLOCK_STEP              = blockTypes.BLOCK_STEP;

    var BLOCK_ENCLOSING         = blockTypes.BLOCK_ENCLOSING;
    var BLOCK_ENCLOSING_STEPS   = blockTypes. BLOCK_ENCLOSING_STEPS;
    var BLOCK_ENCLOSING_STAGES  = blockTypes.BLOCK_ENCLOSING_STAGES;

    /**
     * #### Stager.addStep | createStep
     *
     * Adds a new step
     *
     * Registers a new game step object. Must have the following fields:
     *
     * - id (string): The step's name
     * - cb (function): The step's callback function
     *
     * @param {object} step A valid step object. Shallowly copied.
     */
    Stager.prototype.createStep = Stager.prototype.addStep = function(step) {
        checkStepValidity(step, 'addStep');

        if (this.steps.hasOwnProperty(step.id)) {
            throw new Error('Stager.addStep: step id already ' +
                            'existing: ' + step.id +
                            '. Use extendStep to modify it.');
        }
        this.steps[step.id] = step;
    };

    /**
     * #### Stager.addStage | createStage
     *
     * Adds a new stage
     *
     * Registers a new game stage object. Must have an id field:
     *
     * - id (string): The stage's name
     *
     * and either of the two following fields:
     *
     * - steps (array of strings|objects): The names of the steps belonging
     *     to this stage, or the steps objects to define them. In the latter
     *     case steps with the same id must not have been defined before.
     *
     * - cb (function): The callback function. If this field is used,
     *     then a step with the same name as the stage will be created,
     *     containing all the properties. The stage will be an empty
     *     container referencing
     *
     * @param {object} stage A valid stage or step object. Shallowly
     *    copied.
     *
     * @see checkStageValidity
     */
    Stager.prototype.createStage = Stager.prototype.addStage = function(stage) {
        var id;

        checkStageValidity(stage, 'addStage');

        id = stage.id;

        if (this.stages.hasOwnProperty(id)) {
            throw new Error('Stager.addStage: stage id already existing: ' +
                            id + '. Use extendStage to modify it.');
        }

        // The stage contains only 1 step inside given through the callback
        // function. A step will be created with same id and callback.
        if (stage.cb) {
            this.addStep({
                id: id,
                cb: stage.cb
            });
            delete stage.cb;
            stage.steps = [ id ];
        }
        else {
            // Process every step in the array. Steps array is modified.
            handleStepsArray(this, id, stage.steps, 'addStage');
        }
        this.stages[id] = stage;
    };

    /**
     * #### Stager.cloneStep
     *
     * Clones a stage and assigns a new id to it
     *
     * @param {string} stepId The name of the stage to clone
     * @param {string} newStepId The new unique id to assign to the clone
     *
     * @return {object} step Reference to the cloned step
     *
     * @see Stager.addStep
     */
    Stager.prototype.cloneStep = function(stepId, newStepId) {
        var step;
        if ('string' !== typeof stepId) {
            throw new TypeError('Stager.cloneStep: stepId must be string.');
        }
        if ('string' !== typeof newStepId) {
            throw new TypeError('Stager.cloneStep: newStepId must be string.');
        }
        if (this.steps[newStepId]) {
            throw new Error('Stager.cloneStep: newStepId already taken: ' +
                            newStepId + '.');
        }
        step = this.steps[stepId];
        if (!step) {
            throw new Error('Stager.cloneStep: step not found: ' +
                            stepId + '.');
        }
        step = J.clone(step);
        step.id = newStepId;
        this.addStep(step);
        return step;
    };

    /**
     * #### Stager.cloneStage
     *
     * Clones a stage and assigns a new id to it
     *
     * @param {string} stageId The id of the stage to clone
     * @param {string} newStageId The new unique id to assign to the clone
     *
     * @return {object} stage Reference to the cloned stage
     *
     * @see Stager.addStage
     */
    Stager.prototype.cloneStage = function(stageId, newStageId) {
        var stage;
        if ('string' !== typeof stageId) {
            throw new TypeError('Stager.cloneStage: stageId must be string.');
        }
        if ('string' !== typeof newStageId) {
            throw new TypeError('Stager.cloneStage: newStageId must ' +
                                'be string.');
        }
        if (this.stages[newStageId]) {
            throw new Error('Stager.cloneStage: newStageId already taken: ' +
                            newStageId + '.');
        }
        stage = this.stages[stageId];
        if (!stage) {
            throw new Error('Stager.cloneStage: stage not found: ' +
                            stageId + '.');
        }
        stage = J.clone(stage);
        stage.id = newStageId;
        this.addStage(stage);
        return stage;
    };

    /**
     * #### Stager.step
     *
     * Adds a step to the current Block.
     *
     * @param {string|object} stage A valid step object or the stepId string.
     * @param {string} positions Optional. Positions within the
     *    enclosing Block that this step can occupy.
     *
     * @return {Stager} Reference to this instance for method chaining
     *
     * @see Stager.addStep
     */
    Stager.prototype.step = function(step, positions) {
        var id, curBlock;

        curBlock = this.getCurrentBlock();
        if (!curBlock.isType(BLOCK_ENCLOSING_STEPS) &&
            !curBlock.isType(BLOCK_STEPBLOCK)) {

            throw new Error('Stager.step: step cannot be added at this ' +
                            'point. Have you add at least one stage? ', step);
        }

        checkFinalized(this, 'step');
        id = handleStepParameter(this, step, 'step');
        positions = checkPositionsParameter(positions, 'step');

        addStepToBlock(this, curBlock, id, this.currentType, positions);

        this.stages[this.currentType].steps.push(id);

        return this;
    };

    /**
     * #### Stager.next | stage
     *
     * Adds a stage block to sequence
     *
     * The `id` parameter must have the form 'stageID' or 'stageID AS alias'.
     * stageID must be a valid stage and it (or alias if given) must be
     * unique in the sequence.
     *
     * @param {string|object} id A stage name with optional alias
     *   or a stage object.
     * @param {string} positions Optional. Allowed positions for the stage
     *
     * @return {Stager} Reference to this instance for method chaining
     *
     * @see Stager.addStage
     */
    Stager.prototype.stage = Stager.prototype.next =
        function(stage, positions) {
            var stageName;

            checkFinalized(this, 'next');
            stageName = handleStageParameter(this, stage, 'next');
            positions = checkPositionsParameter(positions, 'next');

            addStageToCurrentBlock(this, {
                type: 'plain',
                id: stageName
            }, positions);

            // Must be done after addStageToCurrentBlock is called.
            addStepsToCurrentBlock(this, this.stages[stageName].steps);
            return this;
        };

    /**
     * #### Stager.repeat | repeatStage
     *
     * Adds repeated stage block to sequence
     *
     * @param {string|object} stage A stage name with optional alias
     *   or a stage object.
     * @param {string} positions Optional. Allowed positions for the stage
     *
     * @return {Stager} Reference to this instance for method chaining
     *
     * @see Stager.addStage
     * @see Stager.next
     */
    Stager.prototype.repeatStage = Stager.prototype.repeat =
        function(stage, nRepeats, positions) {
            var stageName;

            checkFinalized(this, 'repeat');

            stageName = handleStageParameter(this, stage, 'next');

            if ('number' !== typeof nRepeats ||
                isNaN(nRepeats) ||
                nRepeats <= 0) {

                throw new Error('Stager.repeat: nRepeats must be a positive ' +
                                'number. Found: ' + nRepeats + '.');
            }

            positions = checkPositionsParameter(positions, 'repeat');

            addStageToCurrentBlock(this, {
                type: 'repeat',
                id: stageName,
                num: parseInt(nRepeats, 10)
            }, positions);

            // Must be done after addStageToCurrentBlock is called.
            addStepsToCurrentBlock(this, this.stages[stageName].steps);
            return this;
        };

    /**
     * #### Stager.loop | loopStage
     *
     * Adds looped stage block to sequence
     *
     * The given stage will be repeated as long as the `func` callback
     * returns TRUE. If it returns FALSE on the first time, the stage is
     * never executed.
     *
     * @param {string|object} stage A stage name with optional alias
     *   or a stage object.
     * @param {function} loopFunc Callback returning TRUE for
     *   repetition.
     *
     * @return {Stager} Reference to this instance for method chaining
     *
     * @see Stager.addStage
     * @see Stager.next
     * @see Stager.doLoop
     */
    Stager.prototype.loopStage = Stager.prototype.loop =
        function(stage, loopFunc, positions) {

            return addLoop(this, 'loop', stage, loopFunc, positions);
        };

    /**
     * #### Stager.doLoop | doLoopStage
     *
     * Adds alternatively looped stage block to sequence
     *
     * The given stage will be repeated once plus as many times as the
     * `func` callback returns TRUE.
     *
     * @param {string|object} stage A stage name with optional alias
     *   or a stage object.
     * @param {function} loopFunc Optional. Callback returning TRUE for
     *   repetition.
     *
     * @return {Stager} Reference to this instance for method chaining
     *
     * @see Stager.addStage
     * @see Stager.next
     * @see Stager.loop
     */
    Stager.prototype.doLoopStage = Stager.prototype.doLoop =
        function(stage, loopFunc, positions) {

            return addLoop(this, 'doLoop', stage, loopFunc, positions);
        };

    /**
     * #### Stager.gameover
     *
     * Adds gameover block to sequence
     *
     * @return {Stager} this object
     */
    Stager.prototype.gameover = function() {
        addStageToCurrentBlock(this, {
            id: 'gameover',
            type: 'gameover'
        });
        return this;
    };

    // ## Private Methods

    /**
     * #### addLoop
     *
     * Handles adding a looped stage (doLoop or loop)
     *
     * @param {object} that Reference to Stager object
     * @param {string} type The type of loop (doLoop or loop)
     * @param {string|object} stage The stage to loop
     * @param {function} loopFunc The function checking the
     * @param {string} positions Optional. Positions within the
     *      enclosing Block that this block can occupy.
     *
     * @return {Stager|null} this object on success, NULL on error
     *
     * @see Stager.loop
     * @see Stager.doLoop
     *
     * @api private
     */
    function addLoop(that, type, stage, loopFunc, positions) {
        var stageName;

        checkFinalized(that, type);

        stageName = handleStageParameter(that, stage, type);

        if ('function' !== typeof loopFunc) {
            throw new TypeError('Stager.' + type + ': loopFunc must be ' +
                                'function. Found: ' + loopFunc + '.');
        }

        positions = checkPositionsParameter(positions, type);

        addStageToCurrentBlock(that, {
            type: type,
            id: stageName,
            cb: loopFunc
        }, positions);

        // Must be done after addStageToCurrentBlock is called.
        addStepsToCurrentBlock(that, that.stages[stageName].steps);
        return that;
    }

    /**
     * #### addStageToCurrentBlock
     *
     * Performs several meta operations necessary to add a stage block
     *
     * Operations:
     *
     *  - Ends any unclosed blocks.
     *  - Begin a new enclosing block.
     *  - Adds a stage block.
     *  - Adds a steps block.
     *
     * @param {Stager} that Stager object
     * @param {object} stage The stage to add containing its type
     * @param {string} positions Optional. The allowed positions for the stage
     *
     * @api private
     */
    function addStageToCurrentBlock(that, stage, positions) {
        var name, curBlock, rndName;
        name = stage.id || stage.type;

        // was:
        // rndName = '_' + J.randomInt(10000);
        rndName = '_' + Math.floor((that.blocks.length + 1)/2);

        addStageBlock(that,
                      BLOCK_ENCLOSING + name + rndName,
                      BLOCK_ENCLOSING_STAGES,
                      positions,
                      BLOCK_STAGE);

        curBlock = that.getCurrentBlock();
        curBlock.add({
            type: BLOCK_STAGE,
            item: stage,
            id: stage.id
        });

        that.currentType = name;

        addBlock(that,
                 BLOCK_ENCLOSING + name + '_steps' + rndName,
                 BLOCK_ENCLOSING_STEPS,
                 'linear',
                 BLOCK_STEP);
    }

    /**
     * #### addStepsToCurrentBlock
     *
     * Adds steps to current block
     *
     * For each step inside stage.step, it checks whether the step was
     * already added to current block, and if not, it adds it.
     *
     * @param {object} that Reference to Stager object
     * @param {array} steps Array containing the id of the steps
     *
     * @see addStepToBlock
     */
    function addStepsToCurrentBlock(that, steps) {
        var curBlock, i, len;
        curBlock = that.getCurrentBlock();
        i = -1, len = steps.length;
        for ( ; ++i < len ; ) {
            addStepToBlock(that, curBlock, steps[i], that.currentType);
        }
    }

    /**
     * #### extractAlias
     *
     * Returns an object where alias and id are separated
     *
     * @param {string} nameAndAlias The stage-name string
     *
     * @return {object} Object with properties id and alias (if found)
     *
     * @api private
     *
     * @see handleAlias
     */
    function extractAlias(nameAndAlias) {
        var tokens;
        tokens = nameAndAlias.split(' AS ');
        return {
            id: tokens[0].trim(),
            alias: tokens[1] ? tokens[1].trim() : undefined
        };
    }

    /**
     * #### handleAlias
     *
     * Handles stage id and alias strings
     *
     * Takes a string like 'stageID' or 'stageID AS alias' and return 'alias'.
     * Checks that alias and stage id are different.
     *
     * @param {object} that Reference to Stager object
     * @param {string} nameAndAlias The stage-name string
     * @param {string} method The name of the method calling the validation
     *
     * @return {object} Object with properties id and alias (if found)
     *
     * @see Stager.next
     * @see handleAlias
     *
     * @api private
     */
    function handleAlias(that, nameAndAlias, method) {
        var tokens, id, alias;
        tokens = extractAlias(nameAndAlias);
        id = tokens.id;
        alias = tokens.alias;
        if (id === alias) {
            throw new Error('Stager.' + method + ': id equal to alias: ' +
                            nameAndAlias + '.');
        }
        if (alias && !that.stages[id]) {
            throw new Error('Stager.' + method + ': alias is referencing ' +
                            'non-existing stage: ' + id + '.');
        }
        if (alias && that.stages[alias]) {
            throw new Error('Stager.' + method + ': alias is not unique: ' +
                            alias + '.');
        }
        return tokens;
    }

    /**
     * #### checkStepValidity
     *
     * Returns whether given step is valid
     *
     * Checks for syntactic validity of the step object. Does not validate
     * whether the name is unique, etc.
     *
     * @param {object} step The step object
     * @param {string} method The name of the method calling the validation
     *
     * @see Stager.addStep
     *
     * @api private
     */
    function checkStepValidity(step, method) {
        if ('object' !== typeof step) {
            throw new TypeError('Stager.' + method + ': step must be object.');
        }
        if ('function' !== typeof step.cb) {
            throw new TypeError('Stager.' + method + ': step.cb must be ' +
                                'function.');
        }
        if ('string' !== typeof step.id) {
            throw new TypeError('Stager.' + method + ': step.id must ' +
                                'be string.');
        }
        if (step.id.trim() === '') {
            throw new TypeError('Stager.' + method + ': step.id cannot ' +
                                'be an empty string.');
        }
    }

     /**
      * checkStageValidity
      *
      * Returns whether given stage is valid
      *
      * Checks for syntactic validity of the stage object. Does not validate
      * whether the stage name is unique, the steps exists, etc.
      *
      * @param {object} stage The stage to validate
      * @param {string} method The name of the method calling the validation
      *
      * @see Stager.addStage
      *
      * @api private
      */
    function checkStageValidity(stage, method) {
        if ('object' !== typeof stage) {
            throw new TypeError('Stager.' + method + ': stage must be object.');
        }
        if ((!stage.steps && !stage.cb) || (stage.steps && stage.cb)) {
            throw new TypeError('Stager.' + method + ': stage must have ' +
                                'either a steps or a cb property.');
        }
        if (J.isArray(stage.steps)) {
            if (!stage.steps.length) {
                throw new Error('Stager.' + method + ': stage.steps cannot ' +
                                'be empty.');
            }
        }
        else if (stage.steps) {
            throw new TypeError('Stager.' + method + ': stage.steps must be ' +
                                'array or undefined.');
        }
        if ('string' !== typeof stage.id) {
            throw new TypeError('Stager.' + method + ': stage.id must ' +
                                'be string.');
        }
        if (stage.id.trim() === '') {
            throw new TypeError('Stager.' + method + ': stage.id cannot ' +
                                'be an empty string.');
        }
     }

    /**
     * #### handleStepParameter
     *
     * Check validity of a stage parameter, eventually adds it if missing
     *
     * @param {Stager} that Stager object
     * @param {string|object} step The step to validate
     * @param {string} method The name of the method calling the validation
     *
     * @return {string} The id of the step
     *
     * @api private
     */
    function handleStepParameter(that, step, method) {
        var id;
        if ('object' === typeof step) {
            id = step.id;
            if (that.steps[id]) {
                throw new Error('Stager.' + method + ': step is object, ' +
                                'but a step with the same id already ' +
                                'exists: ', id);
            }
            // Add default callback, if missing.
            if (!step.cb) step.cb = that.getDefaultCallback();
        }
        else if ('string' === typeof step) {
            id = step;
            step = {
                id: id,
                cb: that.getDefaultCallback()
            };
        }
        else {
            throw new TypeError('Stager.' + method + ': step must be ' +
                                'string or object.');
        }

        // A new step is created if not found (performs validation).
        if (!that.steps[id]) that.addStep(step);

        return id;
    }

    /**
     * #### handleStageParameter
     *
     * Check validity of a stage parameter, eventually adds it if missing
     *
     * Called by: `stage`, `repeat`, `doLoop`, 'loop`.
     *
     * @param {Stager} that Stager object
     * @param {string|object} stage The stage to validate
     * @param {string} method The name of the method calling the validation
     *
     * @return {string} The id or alias of the stage
     *
     * @api private
     *
     * @see checkStageValidity
     */
    function handleStageParameter(that, stage, method) {
        var tokens, id, alias;
        if ('object' === typeof stage) {
            id = stage.id;

            // Check only if it is already existing
            // (type checking is done later).
            if (that.stages[id]) {
                throw new Error('Stager.' + method + ': stage is object, ' +
                                'but a stage with the same id already ' +
                                'exists: ', id);
            }

            // If both cb and steps are missing, adds steps array,
            // and create new step, if necessary.
            if (!stage.cb && !stage.steps) {
                stage.steps = [ id ];
                if (!that.steps[id]) {
                    that.addStep({ id: id, cb: that.getDefaultCb() });
                }
            }
            // If a cb property is present create a new step with that cb.
            // If a step with same id is already existing, raise an error.
            else if (stage.cb) {
                if (that.steps[id]) {
                    throw new Error('Stager.' + method + ': stage has ' +
                                    'cb property, but a step with the same ' +
                                    'id is already defined: ' + id + '.');
                }
                that.addStep({ id: id, cb: stage.cb });
                delete stage.cb;
                stage.steps = [ id ];
            }
            that.addStage(stage);
        }
        else if ('string' === typeof stage) {

            // See whether the stage id contains an alias. Throws errors.
            tokens = handleAlias(that, stage, method);
            alias = tokens.alias;
            id = tokens.id;
            // Alias must reference an existing stage (checked before).
            if (alias) {
                that.stages[alias] = that.stages[id];
            }
            else if (!that.stages[id]) {
                // Add the step if not existing and flag it as default.
                if (!that.steps[id]) {
                    that.addStep(makeDefaultStep(id, that.getDefaultCb()));
                }
                that.addStage({
                    id: id,
                    steps: [ id ]
                });
            }
        }
        else {
            throw new TypeError('Stager.' + method + ': stage must be ' +
                                'string or object.');
        }

        return alias || id;
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Stager Setter and Getters
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    var J = node.JSUS;
    var Stager = node.Stager;
    var stepRules = node.stepRules;

    // Referencing shared entities.
    var blockTypes = Stager.blockTypes;
    var isDefaultCb = Stager.isDefaultCb;
    var makeDefaultCb = Stager.makeDefaultCb;
    var isDefaultStep = Stager.isDefaultStep;

    /**
     * #### Stager.setState
     *
     * Sets the internal state of the Stager
     *
     * The passed state object can have the following fields:
     * steps, stages, sequence, generalNextFunction, nextFunctions,
     * defaultStepRule, defaultGlobals, defaultProperties, onInit,
     * onGameover.
     * All fields are optional.
     *
     * This function calls the corresponding functions to set these
     * fields, and performs error checking.
     *
     * If updateRule is 'replace', the Stager is cleared before applying
     * the state.
     *
     * @param {object} stateObj The Stager's state
     * @param {string} updateRule Optional. Whether to
     *    'replace' (default) or to 'append'.
     *
     * @see Stager.getState
     */
    Stager.prototype.setState = function(stateObj, updateRule) {
        var idx;
        var stageObj, seqObj, blockObj;

        if ('object' !== typeof stateObj) {
            throw new TypeError('Stager.setState: stateObj must be object.');
        }

        updateRule = updateRule || 'replace';

        if ('string' !== typeof updateRule) {
            throw new TypeError('Stager.setState: updateRule must be object ' +
                                'or undefined.');
        }

        // Clear previous state:
        if (updateRule === 'replace') {
            this.clear();
        }
        else if (updateRule !== 'append') {
            throw new Error('Stager.setState: invalid updateRule: ' +
                            updateRule);
        }

        // Add steps:
        for (idx in stateObj.steps) {
            if (stateObj.steps.hasOwnProperty(idx)) {
                this.addStep(stateObj.steps[idx]);
            }
        }

        // Add stages:
        // first, handle all non-aliases
        // (key of `stages` entry is same as `id` field of its value)
        for (idx in stateObj.stages) {
            stageObj = stateObj.stages[idx];
            if (stateObj.stages.hasOwnProperty(idx) &&
                stageObj.id === idx) {
                    this.addStage(stageObj);
            }
        }
        // second, handle all aliases
        // (key of `stages` entry is different from `id` field of
        // its value)
        for (idx in stateObj.stages) {
            stageObj = stateObj.stages[idx];
            if (stateObj.stages.hasOwnProperty(idx) &&
                stageObj.id !== idx) {
                    this.stages[idx] = this.stages[stageObj.id];
            }
        }

        // Add sequence:
        if (stateObj.hasOwnProperty('sequence')) {
            for (idx = 0; idx < stateObj.sequence.length; idx++) {
                seqObj = stateObj.sequence[idx];
                this.sequence[idx] = seqObj;
            }
        }

        // Set general next-decider:
        if (stateObj.hasOwnProperty('generalNextFunction')) {
            this.registerGeneralNext(stateObj.generalNextFunction);
        }

        // Set specific next-deciders:
        for (idx in stateObj.nextFunctions) {
            if (stateObj.nextFunctions.hasOwnProperty(idx)) {
                this.registerNext(idx, stateObj.nextFunctions[idx]);
            }
        }

        // Set default step-rule:
        if (stateObj.hasOwnProperty('defaultStepRule')) {
            this.setDefaultStepRule(stateObj.defaultStepRule);
        }

        // Set default globals:
        if (stateObj.hasOwnProperty('defaultGlobals')) {
            this.setDefaultGlobals(stateObj.defaultGlobals);
        }

        // Set default properties:
        if (stateObj.hasOwnProperty('defaultProperties')) {
            this.setDefaultProperties(stateObj.defaultProperties);
        }

        // Set onInit:
        if (stateObj.hasOwnProperty('onInit')) {
            this.setOnInit(stateObj.onInit);
        }

        // Set onGameover:
        if (stateObj.hasOwnProperty('onGameover')) {
            this.setOnGameover(stateObj.onGameover);
        }

        // Set toSkip.
        if (stateObj.hasOwnProperty('toSkip')) {
            this.toSkip = stateObj.toSkip;
        }

        // Set defaultCallback.
        if (stateObj.hasOwnProperty('defaultCallback')) {
            this.setDefaultCallback(stateObj.defaultCallback);
        }

        // Cache reset.
        if (stateObj.hasOwnProperty('cacheReset')) {
            this.cacheReset = stateObj.cacheReset;
        }

        // Blocks.
        if (stateObj.hasOwnProperty('blocks')) {
            this.blocksIds = {};
            for (idx = 0; idx < stateObj.blocks.length; idx++) {
                blockObj = stateObj.blocks[idx];
                this.blocks[idx] = blockObj;
                // Save block id into the blocks map.
                this.blocksIds[blockObj.id] = idx;
            }
        }
        if (stateObj.hasOwnProperty('currentType')) {
            this.currentType = stateObj.currentType;
        }
        if (stateObj.hasOwnProperty('currentBlockType')) {
            this.currentBlockType = stateObj.currentBlockType;
        }

        // Mark finalized.
        this.finalized = true;
    };

    /**
     * #### Stager.getState
     *
     * Finalizes the stager and returns a copy of internal state
     *
     * Fields of returned object:
     *
     * steps, stages, sequence, generalNextFunction, nextFunctions,
     * defaultStepRule, defaultGlobals, defaultProperties, onInit,
     * onGameover, blocks.
     *
     * @return {object} Clone of the Stager's state
     *
     * @see Stager.setState
     * @see Stager.finalize
     */
    Stager.prototype.getState = function() {
        var out, i, len;

        this.finalize();

        out = J.clone({
            steps:               this.steps,
            stages:              this.stages,
            sequence:            this.sequence,
            generalNextFunction: this.generalNextFunction,
            nextFunctions:       this.nextFunctions,
            defaultStepRule:     this.defaultStepRule,
            defaultGlobals:      this.defaultGlobals,
            defaultProperties:   this.defaultProperties,
            onInit:              this.onInit,
            onGameover:          this.onGameover,
            toSkip:              this.toSkip,
            defaultCallback:     this.defaultCallback,
            cacheReset:          this.cacheReset,
            currentType:         this.currentType,
            currentBlockType:    this.currentBlockType
        });

        // Cloning blocks separately.
        out.blocks = [];
        i = -1, len = this.blocks.length;
        for ( ; ++i < len ; ) {
            out.blocks.push(this.blocks[i].clone());
        }
        return out;
    };

    /**
     * #### Stager.setDefaultStepRule
     *
     * Sets the default step-rule function
     *
     * @param {function} stepRule Optional. The step-rule function.
     *   If undefined, the `SOLO` rule is set.
     *
     * @see Stager.defaultStepRule
     * @see stepRules
     */
    Stager.prototype.setDefaultStepRule = function(stepRule) {
        if (stepRule) {
            if ('function' !== typeof stepRule) {
                throw new TypeError('Stager.setDefaultStepRule: ' +
                                    'stepRule must be function or ' +
                                    'undefined.');
            }

            this.defaultStepRule = stepRule;
        }
        else {
            // Initial default.
            this.defaultStepRule = stepRules.SOLO;
        }
    };

    /**
     * #### Stager.getDefaultStepRule
     *
     * Returns the default step-rule function
     *
     * @return {function} The default step-rule function
     */
    Stager.prototype.getDefaultStepRule = function() {
        return this.defaultStepRule;
    };

    /**
     * #### Stager.setDefaultCallback
     *
     * Sets the default callback
     *
     * The callback immediately replaces the current callback
     * in all the steps that have a default callback.
     *
     * Function will be modified and flagged as `default`.
     *
     * @param {function|null} cb The default callback or null to unset it
     *
     * @see Stager.defaultCallback
     * @see Stager.getDefaultCallback
     * @see makeDefaultCallback
     */
    Stager.prototype.setDefaultCallback = function(cb) {
        var i;
        if (cb === null) {
            cb = Stager.defaultCallback;
        }
        else if ('function' !== typeof cb) {
            throw new TypeError('Stager.setDefaultCallback: ' +
                                'defaultCallback must be function or null.');
        }
        this.defaultCallback = makeDefaultCb(cb);

        for ( i in this.steps ) {
            if (this.steps.hasOwnProperty(i)) {
                if (isDefaultCb(this.steps[i].cb)) {
                    this.steps[i].cb = this.defaultCallback;
                }
            }
        }
    };

    /**
     * #### Stager.getDefaultCallback | getDefaultCb
     *
     * Returns the default callback
     *
     * If the default callback is not set return the static function
     * `Stager.defaultCallback`
     *
     * @return {function} The default callback
     *
     * @see Stager.defaultCallback (static)
     * @see Stager.defaultCallback
     * @see Stager.setDefaultCallback
     */
    Stager.prototype.getDefaultCb =
        Stager.prototype.getDefaultCallback = function() {
        return this.defaultCallback || Stager.defaultCallback;
    };

    /**
     * #### Stager.setDefaultGlobals
     *
     * Sets/mixes in the default globals
     *
     * @param {object} defaultGlobals The map of default global
     *   variables
     * @param {boolean} mixin Optional. If TRUE, parameter defaultGlobals
     *    will be mixed-in with current globals, otherwise it will replace
          it. Default FALSE.
     *
     * @see Stager.defaultGlobals
     * @see GamePlot.getGlobal
     */
    Stager.prototype.setDefaultGlobals = function(defaultGlobals, mixin) {
        if (!defaultGlobals || 'object' !== typeof defaultGlobals) {
            throw new TypeError('Stager.setDefaultGlobals: ' +
                                'defaultGlobals must be object.');
        }
        if (mixin) J.mixin(this.defaultGlobals, defaultGlobals);
        else this.defaultGlobals = defaultGlobals;
    };

    /**
     * #### Stager.getDefaultGlobals
     *
     * Returns the default globals
     *
     * @return {object} The map of default global variables
     *
     * @see Stager.defaultGlobals
     * @see GamePlot.getGlobal
     */
    Stager.prototype.getDefaultGlobals = function() {
        return this.defaultGlobals;
    };

    /**
     * #### Stager.setDefaultProperty
     *
     * Sets a default property
     *
     * @param {string} name The name of the default property
     * @param {mixed} value The value for the default property
     *
     * @see Stager.defaultProperties
     * @see Stager.setDefaultProperties
     * @see GamePlot.getProperty
     */
    Stager.prototype.setDefaultProperty = function(name, value) {
        if ('string' !== typeof name) {
            throw new TypeError('Stager.setDefaultProperty: name ' +
                                'must be string.');
        }
        this.defaultProperties[name] = value;
    };

    /**
     * #### Stager.setDefaultProperties
     *
     * Sets the default properties
     *
     * @param {object} defaultProperties The map of default properties
     * @param {boolean} mixin Optional. If TRUE, parameter defaulProperties
     *    will be mixed-in with current globals, otherwise it will replace
          it. Default FALSE.
     *
     * @see Stager.defaultProperties
     * @see GamePlot.getProperty
     */
    Stager.prototype.setDefaultProperties = function(defaultProperties,
                                                     mixin) {
        if (!defaultProperties ||
            'object' !== typeof defaultProperties) {
            throw new TypeError('Stager.setDefaultProperties: ' +
                                'defaultProperties must be object.');
        }
        if (mixin) J.mixin(this.defaultProperties, defaultProperties);
        else this.defaultProperties = defaultProperties;
    };

    /**
     * #### Stager.getDefaultProperties
     *
     * Returns the default properties
     *
     * @return {object} The map of default properties
     *
     * @see Stager.defaultProperties
     * @see GamePlot.getProperty
     */
    Stager.prototype.getDefaultProperties = function() {
        return this.defaultProperties;
    };

    /**
     * #### Stager.setOnInit
     *
     * Sets onInit function
     *
     * @param {function|null} func The onInit function.
     *   NULL can be given to signify non-existence.
     *
     * @see Stager.onInit
     */
    Stager.prototype.setOnInit = function(func) {
        if (func && 'function' !== typeof func) {
            throw new TypeError('Stager.setOnInit: func must be' +
                                ' function or undefined.');
        }
        this.onInit = func;
    };

    /**
     * #### Stager.getOnInit
     *
     * Gets onInit function
     *
     * @return {function|null} The onInit function.
     *  NULL signifies non-existence.
     *
     * @see Stager.onInit
     */
    Stager.prototype.getOnInit = function(func) {
        return this.onInit;
    };

    /**
     * #### Stager.setOnGameover
     *
     * Sets onGameover function
     *
     * @param {function|null} func The onGameover function.
     *   NULL can be given to signify non-existence.
     *
     * @see Stager.onGameover
     */
    Stager.prototype.setOnGameover = function(func) {
        if (func && 'function' !== typeof func) {
            throw new Error('Stager.setOnGameover: func must be ' +
                                'function or undefined.');
        }
        this.onGameover = func;
    };

    /**
     * #### Stager.setOnGameOver
     *
     * Alias for `setOnGameover`
     *
     * @see Stager.setOnGameover
     */
    Stager.prototype.setOnGameOver = Stager.prototype.setOnGameover;

    /**
     * #### Stager.getOnGameover
     *
     * Gets onGameover function
     *
     * @return {function|null} The onGameover function, or NULL if none
     *    is found
     *
     * @see Stager.onGameover
     */
    Stager.prototype.getOnGameover = function(func) {
        return this.onGameover;
    };

    /**
     * #### Stager.getOnGameOver
     *
     * Alias for `getOnGameover`
     *
     * @see Stager.getOnGameover
     */
    Stager.prototype.getOnGameOver = Stager.prototype.getOnGameover;

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Stager flexible mode
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    var Stager = node.Stager;

    /**
     * #### Stager.registerGeneralNext
     *
     * Sets general callback for next stage decision
     *
     * Available only when nodegame is executed in _flexible_ mode.
     * The callback given here is used to determine the next stage.
     *
     * @param {function|null} func The decider callback. It should
     *   return the name of the next stage, 'NODEGAME_GAMEOVER' to end
     *   the game or FALSE for sequence end. NULL can be given to
     *   signify non-existence.
     */
    Stager.prototype.registerGeneralNext = function(func) {
        if (func !== null && 'function' !== typeof func) {
            throw new TypeError('Stager.registerGeneralNext: ' +
                                'func must be function or undefined.');
        }
        this.generalNextFunction = func;
    };

    /**
     * #### Stager.registerNext
     *
     * Registers a step-decider callback for a specific stage
     *
     * The function overrides the general callback for the specific
     * stage, and determines the next stage.
     * Available only when nodegame is executed in _flexible_ mode.
     *
     * @param {string} id The name of the stage after which the decider
     *   function will be called
     * @param {function} func The decider callback. It should return the
     *   name of the next stage, 'NODEGAME_GAMEOVER' to end the game or
     *   FALSE for sequence end.
     *
     * @see Stager.registerGeneralNext
     */
    Stager.prototype.registerNext = function(id, func) {
        if ('function' !== typeof func) {
            throw new TypeError('Stager.registerNext: func must be ' +
                'function.');
        }

        if (!this.stages[id]) {
            throw new TypeError('Stager.registerNext: non existent ' +
                               'stage id: ' + id + '.');
        }

        this.nextFunctions[id] = func;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Stager extend stages, modify sequence
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    var J = node.JSUS;
    var Stager = node.Stager;

    var checkFinalized    = Stager.checkFinalized;
    var handleStepsArray  = Stager.handleStepsArray;
    var addStepToBlock    = Stager.addStepToBlock;
    var isDefaultStep     = Stager.isDefaultStep;
    var unmakeDefaultStep = Stager.unmakeDefaultStep;

    /**
     * #### Stager.extendStep
     *
     * Extends an existing step
     *
     * Notice: properties `id` cannot be modified, and property `cb`
     * must always be a function.
     *
     * @param {string} stepId The id of the step to update
     * @param {object|function} update The object containing the
     *   properties to update, or an update function that takes a copy
     *   of current step and returns the whole new updated step
     *
     * @see Stager.addStep
     * @see validateExtendedStep
     */
    Stager.prototype.extendStep = function(stepId, update) {
        var step;
        if ('string' !== typeof stepId) {
            throw new TypeError('Stager.extendStep: stepId must be a' +
                                ' string.');
        }
        step = this.steps[stepId];
        if (!step) {
            throw new Error('Stager.extendStep: stepId not found: ' +
                            stepId + '.');
        }
        if ('function' === typeof update) {
            step = update(J.clone(step));
            validateExtendedStep(stepId, step, true);
            this.steps[stepId] = step;

        }
        else if (update && 'object' === typeof update) {
            validateExtendedStep(stepId, update, false);
            J.mixin(step, update);
        }
        else {
            throw new TypeError('Stager.extendStep: update must be object ' +
                                'or function. Step id: ' + stepId + '.');
        }
    };

    /**
     * #### Stager.extendStage
     *
     * Extends an existing stage
     *
     * Notice: properties `id` and `cb` cannot be modified / added.
     *
     * @param {string} stageId The id of the stage to update
     * @param {object|function} update The object containing the
     *   properties to update, or an update function that takes a copy
     *   of current stage and returns the whole new updated stage
     *
     * @see Stager.addStage
     * @see validateExtendedStage
     */
    Stager.prototype.extendStage = function(stageId, update) {
        var stage;

        if ('string' !== typeof stageId) {
            throw new TypeError('Stager.extendStage: stageId must be ' +
                                'a string.');
        }
        stage = this.stages[stageId];
        if (!stage) {
            throw new Error('Stager.extendStage: stageId not found: ' +
                            stageId + '.');
        }

        if ('function' === typeof update) {
            stage = update(J.clone(stage));
            if (!stage || 'object' !== typeof stage ||
                !stage.id || !stage.steps) {

                throw new TypeError('Stager.extendStage: update function ' +
                                    'must return an object with id and steps.');
            }
            validateExtendedStage(this, stageId, stage, true);
            this.stages[stageId] = stage;

        }
        else if (update && 'object' === typeof update) {
            validateExtendedStage(this, stageId, update, false);
            J.mixin(stage, update);
        }
        else {
            throw new TypeError('Stager.extendStage: update must be object ' +
                                'or function. Stage id: ' + stageId + '.');
        }
    };

    /**
     * #### Stager.extendAllSteps
     *
     * Extends all existing steps
     *
     * @param {object|function} update The object containing the
     *   properties to update, or an update function that takes a copy
     *   of current step and returns the whole new updated step
     *
     * @see Stager.addStep
     * @see Stager.extendStep
     */
    Stager.prototype.extendAllSteps = function(update) {
        var step;
        for (step in this.steps) {
            if (this.steps.hasOwnProperty(step)) {
                this.extendStep(step, update);
            }
        }
    };

    /* #### Stager.extendAllStages
     *
     * Extends all existing stages
     *
     * @param {object|function} update The object containing the
     *   properties to update, or an update function that takes a copy
     *   of current stage and returns the whole new updated stage
     *
     * @see Stager.addStage
     * @see Stager.extendStage
     */
    Stager.prototype.extendAllStages = function(update) {
        var stage;
        for (stage in this.stages) {
            if (this.stages.hasOwnProperty(stage)) {
                this.extendStage(stage, update);
            }
        }
    };

    /**
     * #### Stager.skip
     *
     * Marks a stage or as step as `toSkip` and won't be added to sequence
     *
     * Must be called before invoking `Stager.finalize()`.
     *
     * @param {string} stageId The id of the stage to skip
     * @param {string} stepId Optional. The id of the step within
     *   the stage to skip
     *
     * @see Stager.unskip
     * @see Stager.finalize
     */
    Stager.prototype.skip = function(stageId, stepId) {
        checkFinalized(this, 'skip');
        setSkipStageStep(this, stageId, stepId, true, 'skip');
    };

    /**
     * #### Stager.unskip
     *
     * Unskips a stage or step
     *
     * Must be called before invoking `Stager.finalize()`.
     *
     * @param {string} stageId The id of the stage
     * @param {string} stepId Optional. The id of the step within the stage
     *
     * @see Stager.skip
     * @see Stager.finalize
     */
    Stager.prototype.unskip = function(stageId, stepId) {
        checkFinalized(this, 'unskip');
        setSkipStageStep(this, stageId, stepId, null, 'unskip');
    };

    /**
     * #### Stager.isSkipped
     *
     * Returns TRUE if a stage or step is currently marked as `toSkip`
     *
     * @param {string} stageId The id of the stage
     * @param {string} stepId Optional. The id of the step within the stage
     *
     * @return {boolean} TRUE, if the stage or step is marked as `toSkip`
     *
     * @see Stager.skip
     * @see Stager.unskip
     */
    Stager.prototype.isSkipped = function(stageId, stepId) {
        return !!setSkipStageStep(this, stageId, stepId, undefined,
                                  'isSkipped');
    };

    /**
     * #### setSkipStageStep
     *
     * Sets/Gets the value for the flag `toSkip` for a stage or a step
     *
     * @param {Stager} that Stager object
     * @param {string} stageId The id of the stage
     * @param {string} stepId Optional. The id of the step within the stage
     * @param {mixed} value If defined, is assigned to the stage or step
     * @param {string} method The name of the method calling the validation
     *
     * @return {boolean|null} The current value for the stage or step
     *
     * @api private
     */
    function setSkipStageStep(that, stageId, stepId, value, method) {
        if ('string' !== typeof stageId || stageId.trim() === '') {
            throw new TypeError('Stager.' + method + ': stageId must ' +
                                'be a non-empty string.');
        }
        if (stepId) {
            if ('string' !== typeof stepId || stepId.trim() === '') {
                throw new TypeError('Stager.' + method + ': stepId must ' +
                                    'be a non-empty string or undefined.');
            }
            if ('undefined' !== typeof value) {
                that.toSkip.steps[stageId + '.' + stepId] = value;
            }
            return that.toSkip.steps[stageId + '.' + stepId];
        }
        if ('undefined' !== typeof value) that.toSkip.stages[stageId] = value;
        return that.toSkip.stages[stageId];
    }


    /**
     * #### validateExtendedStep
     *
     * Validates the modification to a step (already known as object)
     *
     * Each step inside the steps array is validated via `handleStepsArray`.
     *
     * @param {string} stepId The original step id
     * @param {object} update The update/updated object
     * @param {boolean} updateFunction TRUE if the update object is the
     *    value returned by an update function
     *
     * @see handleStepsArray
     */
    function validateExtendedStep(stepId, update, updateFunction) {
        var errBegin;
        if (updateFunction) {
            errBegin = 'Stager.extendStep: update function must return ' +
                'an object with ';

            if (!update || 'object' !== typeof update) {
                throw new TypeError(errBegin + 'id and cb. Found: ' + update +
                                    '. Step id: ' +  stepId + '.');
            }
            if (update.id !== stepId) {
                throw new Error('Stager.extendStep: update function ' +
                                'cannot alter the step id: ' + stepId + '.');
            }
            if ('function' !== typeof update.cb) {
                throw new TypeError(errBegin + 'a valid callback. Step id:' +
                                    stepId + '.');
            }
            if (update.init && 'function' !== typeof update.init) {
                throw new TypeError(errBegin + 'invalid init property. ' +
                                    'Function or undefined expected, found: ' +
                                    typeof update.init + '. Step id:' +
                                    stepId + '.');
            }
            if (update.exit && 'function' !== typeof update.exit) {
                throw new TypeError(errBegin + 'invalid exit property. ' +
                                    'Function or undefined expected, found: ' +
                                    typeof update.exit + '. Step id:' +
                                    stepId + '.');
            }
            if (update.done && 'function' !== typeof update.done) {
                throw new TypeError(errBegin + 'invalid done property. ' +
                                    'Function or undefined expected, found: ' +
                                    typeof update.done + '. Step id:' +
                                    stepId + '.');
            }
        }
        else {
            if (update.hasOwnProperty('id')) {
                throw new Error('Stager.extendStep: update.id cannot be set. ' +
                                'Step id: ' + stepId + '.');
            }
            if (update.cb && 'function' !== typeof update.cb) {
                throw new TypeError('Stager.extendStep: update.cb must be ' +
                                    'function or undefined. Step id:' +
                                    stepId + '.');
            }
            if (update.init && 'function' !== typeof update.init) {
                throw new TypeError('Stager.extendStep: update.init must be ' +
                                    'function or undefined. Step id:' +
                                    stepId + '.');
            }
            if (update.exit && 'function' !== typeof update.exit) {
                throw new TypeError('Stager.extendStep: update.exit must be ' +
                                    'function or undefined. Step id:' +
                                    stepId + '.');
            }
            if (update.done && 'function' !== typeof update.done) {
                throw new TypeError('Stager.extendStep: update.done must be ' +
                                    'function or undefined. Step id:' +
                                    stepId + '.');
            }

        }
    }

    /**
     * #### validateExtendedStage
     *
     * Validates the modification to a stage (already known as object)
     *
     * Each step inside the steps array is validated via `handleStepsArray`.
     *
     * @param {Stager} that Stager object
     * @param {string} stageId The original stage id
     * @param {object} update The update/updated object
     * @param {boolean} updateFunction TRUE if the update object is the
     *    value returned by an update function
     *
     * @see handleStepsArray
     */
    function validateExtendedStage(that, stageId, update, updateFunction) {
        var block, i, len;
        if ((updateFunction && update.id !== stageId) ||
            (!updateFunction && update.hasOwnProperty('id'))) {

            throw new Error('Stager.extendStage: id cannot be altered: ' +
                            stageId + '.');
        }
        if (update.cb) {
            throw new TypeError('Stager.extendStage: update.cb cannot be ' +
                                'specified. Stage id: ' + stageId + '.');
        }
        if (update.init && 'function' !== typeof update.init) {
            throw new TypeError('Stager.extendStage: update.init must be ' +
                                'function or undefined. Stage id:' +
                                stageId + '.');
        }
        if (update.exit && 'function' !== typeof update.exit) {
            throw new TypeError('Stager.extendStage: update.exit must be ' +
                                'function or undefined. Stage id:' +
                                stageId + '.');
        }
        if (update.done && 'function' !== typeof update.done) {
            throw new TypeError('Stager.extendStage: update.done must be ' +
                                'function or undefined. Stage id:' +
                                stageId + '.');
        }
        if (update.steps) {
            if ((!J.isArray(update.steps) || !update.steps.length) ||
                update.steps === undefined || update.steps === null) {

                throw new Error('Stager.extendStage: found update.steps, but ' +
                                'it is not a non-empty array. Stage id: ' +
                               stageId + '.');
            }

            // No changes to the steps array, just exit.
            if (J.equals(that.stages[stageId].steps, update.steps)) return;

            // Process every step in the array. Steps array is modified.
            handleStepsArray(that, stageId, update.steps, 'extendStage');

            // We need to get the enclosing steps block,
            // following the stage block.
            block = that.findBlockWithItem(stageId);

            // Stage is not in any block, just exit.
            if (!block) return;

            // We need to update the block in which the stage was.

            if ('undefined' !== typeof block.unfinishedItems[1]) {
                block = block.unfinishedItems[1].item;
            }
            // The stage block was not ended yet,
            // so the the step block is the last of the sequence.
            else {
                block = that.blocks[that.blocks.length -1];
            }

            // Remove all previous steps before adding the updated steps.
            block.removeAllItems();

            // Add steps to block (if necessary).
            i = -1, len = update.steps.length;
            for ( ; ++i < len ; ) {
                // If the default step is contained in the list of updated
                // steps, then it's not a default step and we keep it.
                if (isDefaultStep(that.steps[update.steps[i]])) {
                    unmakeDefaultStep(that.steps[update.steps[i]]);
                }
                addStepToBlock(that, block, update.steps[i], stageId);
            }
        }
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Stager blocks operations
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    var Stager     = node.Stager;
    var Block      = node.Block;
    var blockTypes = Stager.blockTypes;

    var checkPositionsParameter = Stager.checkPositionsParameter;
    var addStageBlock = Stager.addStageBlock;
    var addBlock = Stager.addBlock;

    var BLOCK_DEFAULT     = blockTypes.BLOCK_DEFAULT;
    var BLOCK_STAGEBLOCK  = blockTypes.BLOCK_STAGEBLOCK;
    var BLOCK_STAGE       = blockTypes. BLOCK_STAGE;
    var BLOCK_STEPBLOCK   = blockTypes. BLOCK_STEPBLOCK;
    var BLOCK_STEP        = blockTypes.BLOCK_STEP;

    var BLOCK_ENCLOSING          = blockTypes.BLOCK_ENCLOSING;
    var BLOCK_ENCLOSING_STEPS    = blockTypes. BLOCK_ENCLOSING_STEPS;
    var BLOCK_ENCLOSING_STAGES   = blockTypes.BLOCK_ENCLOSING_STAGES;

    /**
     * #### Stager.stepBlock
     *
     * Begins a new Block of steps
     *
     * This function just validates the input paramters and passes them
     * to lower level function `addBlock`.
     *
     * @param {string} id Optional. The id of the block.
     * @param {string|number} positions Optional. Positions within the
     *   enclosing Block that this block can occupy.
     *
     * @return {Stager} Reference to the current instance for method chainining
     */
    Stager.prototype.stepBlock = function() {
        var positions, id;

        if (arguments.length === 1) {
            positions = arguments[0];
        }
        else if (arguments.length === 2) {
            id = arguments[0];
            positions = arguments[1];

            if ('string' !== typeof id) {
                throw new TypeError('Stager.stepBlock: id must be string.');
            }
            if (this.blocksIds[id]) {
                throw new Error('Stager.stepBlock: non-unique id: ' + id);
            }
        }

        checkPositionsParameter(positions, 'stepBlock');

        addBlock(this, id, BLOCK_STEPBLOCK, positions, BLOCK_STEP);

        return this;
    };

    /**
     * #### Stager.stageBlock
     *
     * Begins a new Block of stages
     *
     * This function just validates the input paramters and passes them
     * to lower level function `addStageBlock`.
     *
     * @param {string} id Optional. The id of the block.
     * @param {string|number} positions Optional. Positions within the
     *   enclosing Block that this block can occupy.
     *
     * @return {Stager} Reference to the current instance for method chainining
     *
     * @see addStageBlock
     */
    Stager.prototype.stageBlock = function() {
        var positions, id;
        if (arguments.length === 1) {
            positions = arguments[0];
        }
        else if (arguments.length === 2) {
            id = arguments[0];
            positions = arguments[1];

            if ('string' !== typeof id) {
                throw new TypeError('Stager.stageBlock: id must be string.');
            }
            if (this.blocksIds[id]) {
                throw new Error('Stager.stageBlock: non-unique id: ' + id);
            }
        }

        checkPositionsParameter(positions, 'stageBlock');

        addStageBlock(this, id, BLOCK_STAGEBLOCK, positions, BLOCK_STAGE);
        return this;
    };

    /**
     * #### Stager.getCurrentBlock
     *
     * Returns the Block that Stager is currently working on
     *
     * @param {string} positions Optional. Positions within the
     *      enclosing Block that this block can occupy.
     *
     * @return {object|boolean} Currently open block, or FALSE if no
     *   unfinished block is found
     */
    Stager.prototype.getCurrentBlock = function(options) {
        if (this.unfinishedBlocks.length > 0) {
            return this.unfinishedBlocks[this.unfinishedBlocks.length -1];
        }
        return false;
    };

    /**
     * #### Stager.endBlock
     *
     * Ends the current Block
     *
     * param {object} options Optional If `options.finalize` is set, the
     *   block gets finalized.
     *
     * @return {Stager} Reference to the current instance for method chainining
     */
    Stager.prototype.endBlock = function(options) {
        var block, currentBlock;
        var found, i;
        if (!this.unfinishedBlocks.length) return this;
        options = options || {};

        block = this.unfinishedBlocks.pop();

        // Step block.
        if (block.isType(BLOCK_STEPBLOCK)) {

            // We find the first enclosing block for the step block
            // (in between there could several steps).
            i = this.blocks.length-1;
            do {
                currentBlock = this.blocks[i];
                found = currentBlock.id.indexOf(BLOCK_ENCLOSING) !== -1;
                i--;
            }
            while (!found && i >= 0)

            if (found) {
                currentBlock.add(block, block.positions);
            }
            else {
                throw new Error('Stager.endBlock: could not find enclosing ' +
                                'block for stepBlock ' + block.name);
            }

        }
        // Normal stage / step block, add it to previous
        else if (!block.isType(BLOCK_STAGEBLOCK)) {

            currentBlock = this.getCurrentBlock();
            if (currentBlock) currentBlock.add(block, block.positions);

        }
        // Add stage block to default block.
        else if (block.id !== BLOCK_DEFAULT &&
                 block.id.indexOf(BLOCK_ENCLOSING) === -1) {

            this.blocks[0].add(block, block.positions);
        }
        if (options.finalize) block.finalize();
        return this;
    };

    /**
     * #### Stager.endBlocks
     *
     * Ends multiple unfinished Blocks
     *
     * @param Number n Number of unfinished Blocks to be ended.
     * @param {object} options Optional If options.finalize is set, the
     *    block gets finalized.
     */
    Stager.prototype.endBlocks = function(n, options) {
        var i;
        for (i = 0; i < n; ++i) {
            this.endBlock(options);
        }
        return this;
    };

    /**
     * #### Stager.endAllBlocks
     *
     * Ends all unfinished Blocks.
     */
    Stager.prototype.endAllBlocks = function() {
        this.endBlocks(this.unfinishedBlocks.length);
    };

    /**
     * #### Stager.findBlockWithItem
     *
     * Returns the block where the item (step|stage) with specified id is found
     *
     * @param {string} itemId The id of the item
     *
     * @return {object|boolean} The block containing the requested item,
     *    or FALSE if none is found
     */
    Stager.prototype.findBlockWithItem = function(itemId) {
        var i, len;
        i = -1, len = this.blocks.length;
        for ( ; ++i < len ; ) {
            if (this.blocks[i].hasItem(itemId)) return this.blocks[i];
        }
        return false;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Stager Extract Info
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    var Stager = node.Stager;

    /**
     * #### Stager.getSequence
     *
     * Returns the sequence of stages
     *
     * @param {string} format 'hstages' for an array of human-readable
     *   stage descriptions, 'hsteps' for an array of human-readable
     *   step descriptions, 'o' for the internal JavaScript object
     *
     * @return {array|object|null} The stage sequence in requested
     *   format. NULL on error.
     */
    Stager.prototype.getSequence = function(format) {
        var result;
        var seqIdx;
        var seqObj;
        var stepPrefix;

        switch (format) {
        case 'hstages':
            result = [];

            for (seqIdx in this.sequence) {
                if (this.sequence.hasOwnProperty(seqIdx)) {
                    seqObj = this.sequence[seqIdx];

                    switch (seqObj.type) {
                    case 'gameover':
                        result.push('[game over]');
                        break;

                    case 'plain':
                        result.push(seqObj.id);
                        break;

                    case 'repeat':
                        result.push(seqObj.id + ' [x' + seqObj.num +
                            ']');
                        break;

                    case 'loop':
                        result.push(seqObj.id + ' [loop]');
                        break;

                    case 'doLoop':
                        result.push(seqObj.id + ' [doLoop]');
                        break;

                    default:
                        throw new Error('Stager.getSequence: unknown' +
                                        'sequence object type.');
                    }
                }
            }
            break;

        case 'hsteps':
            result = [];

            for (seqIdx in this.sequence) {
                if (this.sequence.hasOwnProperty(seqIdx)) {
                    seqObj = this.sequence[seqIdx];
                    stepPrefix = seqObj.id + '.';

                    switch (seqObj.type) {
                    case 'gameover':
                        result.push('[game over]');
                        break;

                    case 'plain':
                        seqObj.steps.map(
                            function(stepID) {
                                result.push(stepPrefix + stepID);
                            }
                        );
                        break;

                    case 'repeat':
                        seqObj.steps.map(
                            function(stepID) {
                                result.push(stepPrefix + stepID +
                                    ' [x' + seqObj.num + ']');
                            }
                        );
                        break;

                    case 'loop':
                        seqObj.steps.map(
                            function(stepID) {
                                result.push(stepPrefix +
                                            stepID + ' [loop]');
                            }
                        );
                        break;

                    case 'doLoop':
                        seqObj.steps.map(
                            function(stepID) {
                                result.push(stepPrefix +
                                            stepID + ' [doLoop]');
                            }
                        );
                        break;

                    default:
                        throw new Error('Stager.getSequence: unknown' +
                                        'sequence object type.');
                    }
                }
            }
            break;

        case 'o':
            result = this.sequence;
            break;

        default:
            throw new Error('Stager.getSequence: invalid format.');
        }

        return result;
    };

    /**
     * #### Stager.extractStage
     *
     * Returns a minimal state package containing one or more stages
     *
     * The returned package consists of a `setState`-compatible object
     * with the `steps` and `stages` properties set to include the given
     * stages.
     * The `sequence` is optionally set to a single `next` block for the
     * stage.
     *
     * @param {string|array} ids Valid stage name(s)
     * @param {boolean} useSeq Optional. Whether to generate a singleton
     *   sequence.  TRUE by default.
     *
     * @return {object|null} The state object on success, NULL on error
     *
     * @see Stager.setState
     */
    Stager.prototype.extractStage = function(ids, useSeq) {
        var result;
        var stepIdx, stepId;
        var stageId;
        var stageObj;
        var idArray, idIdx, id;

        if (ids instanceof Array) {
            idArray = ids;
        }
        else if ('string' === typeof ids) {
            idArray = [ ids ];
        }
        else return null;

        result = { steps: {}, stages: {}, sequence: [] };

        // undefined (default) -> true
        useSeq = (useSeq === false) ? false : true;

        for (idIdx in idArray) {
            if (idArray.hasOwnProperty(idIdx)) {
                id = idArray[idIdx];

                stageObj = this.stages[id];

                if (!stageObj) return null;

                // Add step objects:
                for (stepIdx in stageObj.steps) {
                    if (stageObj.steps.hasOwnProperty(stepIdx)) {
                        stepId = stageObj.steps[stepIdx];
                        result.steps[stepId] = this.steps[stepId];
                    }
                }

                // Add stage object:
                stageId = stageObj.id;
                result.stages[stageId] = stageObj;

                // If given id is alias, also add alias:
                if (stageId !== id) result.stages[id] = stageObj;

                // Add mini-sequence:
                if (useSeq) {
                    result.sequence.push({
                        type: 'plain',
                        id: stageId
                    });
                }
            }
        }

        return result;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # SocketFactory
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` component responsible for registering and instantiating
 * new GameSocket clients
 *
 * Contract: Socket prototypes must implement the following methods:
 *
 * - connect: establish a communication channel with a ServerNode instance
 * - send: pushes messages into the communication channel
 */
(function(exports) {

    "use strict";

    // Storage for socket types.
    var types = {};

    function checkContract(Proto) {
        var test;
        test = new Proto();
        if (!test.send) return false;
        if (!test.connect) return false;
        return true;
    }

    function getTypes() {
        return types;
    }

    function get( node, type, options ) {
        var Socket = types[type];
        return (Socket) ? new Socket(node, options) : null;
    }

    function register( type, proto ) {
        if (!type || !proto) return;

        // only register classes that fulfill the contract
        if ( checkContract(proto) ) {
            types[type] = proto;
        }
        else {
            throw new Error('Cannot register invalid Socket class: ' + type);
        }
    }

    // expose the socketFactory methods
    exports.SocketFactory = {
        checkContract: checkContract,
        getTypes: getTypes,
        get: get,
        register: register
    };


    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports
);

/**
 * # Socket
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Wrapper class for the actual socket to send messages
 *
 * http://nodegame.org
 */
(function(exports, parent) {

    "use strict";

    exports.Socket = Socket;

    // ## Global scope

    var GameMsg = parent.GameMsg,
    SocketFactory = parent.SocketFactory,
    J = parent.JSUS;

    /**
     * ## Socket constructor
     *
     * Creates a new instance of Socket
     *
     * @param {NodeGameClient} node Reference to the node instance
     */
    function Socket(node) {

        // ## Public properties

        /**
         * ### Socket.buffer
         *
         * Buffer of queued messages
         *
         * @api private
         */
        this.buffer = [];

        /**
         * ### Socket.session
         *
         * The session id shared with the server
         *
         * This property is initialized only when a game starts
         *
         */
        this.session = null;

        /**
         * ### Socket.userOptions
         *
         * Contains the options that will be passed to the `connect` method
         *
         * The property is set by `node.setup.socket`.
         * Passing options to the `connect` method will overwrite this property.
         *
         * @see node.setup
         * @see Socket.connect
         */
        this.userOptions = {};

        /**
         * ### Socket.socket
         *
         * The actual socket object (e.g. SocketDirect, or SocketIo)
         */
        this.socket = null;

         /**
         * ### Socket.connected
         *
         * Socket connection established.
         *
         * @see Socket.connecting
         * @see Socket.isConnected
         * @see Socket.onConnect
         * @see Socket.onDisconnect
         */
        this.connected = false;

         /**
         * ### Socket.connecting
         *
         * Socket connection being established
         *
         * TODO see whether we should merge connected / connecting
         * in one variable with socket states.
         *
         * @see Socket.connected
         * @see Socket.isConnected
         * @see Socket.onConnect
         * @see Socket.onDisconnect
         */
        this.connecting = false;

        /**
         * ### Socket.url
         *
         * The url to which the socket is connected
         *
         * It might not be meaningful for all types of sockets. For example,
         * in case of SocketDirect, it is not an real url.
         */
        this.url = null;

        /**
         * ### Socket.type
         *
         * The type of socket used
         */
        this.type = null;

        /**
         * ### Socket.type
         *
         * If TRUE, outgoing messages will be emitted upon sending
         *
         * This allows, for example, to modify all outgoing messages.
         */
        this.emitOutMsg = false;

        // Experimental Journal.
        // TODO: check if we need it.
        this.journalOn = false;

        // Experimental
        this.journal = new parent.NDDB({
            update: {
                indexes: true
            }
        });
        this.journal.comparator('stage', function(o1, o2) {
            return parent.GameStage.compare(o1.stage, o2.stage);
        });

        if (!this.journal.player) {
            this.journal.hash('to', function(gb) {
                return gb.to;
            });
        }
        if (!this.journal.stage) {
            this.journal.hash('stage', function(gb) {
                if (gb.stage) {
                    return parent.GameStage.toHash(gb.stage, 'S.s.r');
                }
            });
        }
        // End Experimental Code.

        /**
         * ### Socket.node
         *
         * Reference to the node object.
         */
        this.node = node;
    }

    // ## Socket methods

    /**
     * ### Socket.setup
     *
     * Configures the socket
     *
     * @param {object} options Optional. Configuration options.
     * @see node.setup.socket
     */
    Socket.prototype.setup = function(options) {
        options = options ? J.clone(options) : {};
        if (options.type) {
            this.setSocketType(options.type, options);
            options.type = null;
        }
        if ('undefined' !== typeof options.emitOutMsg) {
            this.emitOutMsg = options.emitOutMsg;
            options.emitOutMsg = null;
        }
        this.userOptions = options;
    };

    /**
     * ### Socket.setSocketType
     *
     * Sets the default socket by requesting it to the Socket Factory
     *
     * Supported types: 'Direct', 'SocketIo'.
     *
     * @param {string} type The name of the socket to use.
     * @param {object} options Optional. Configuration options for the socket.
     *
     * @return {object} The newly created socket object.
     *
     * @see SocketFactory
     */
    Socket.prototype.setSocketType = function(type, options) {
        if ('string' !== typeof type) {
            throw new TypeError('Socket.setSocketType: type must be string.');
        }
        if (options && 'object' !== typeof options) {
            throw new TypeError('Socket.setSocketType: options must be ' +
                                'object or undefined.');
        }
        this.socket = SocketFactory.get(this.node, type, options);

        if (!this.socket) {
            throw new Error('Socket.setSocketType: type not found: ' +
                            type + '.');
        }

        this.type = type;
        return this.socket;
    };

    /**
     * ### Socket.connect
     *
     * Calls the connect method on the actual socket object
     *
     * Uri is usually empty when using SocketDirect.
     *
     * @param {string} uri Optional. The uri to which to connect.
     * @param {object} options Optional. Configuration options for the socket.
     */
    Socket.prototype.connect = function(uri, options) {
        var humanReadableUri;

        if (this.isConnected()) {
            throw new Error('Socket.connect: socket is already connected. ' +
                            'Only one connection is allowed.');
        }
        if (this.connecting) {
            throw new Error('Socket.connecting: one connection attempt is ' +
                            'already in progress. Please try again later.');
        }
        if (uri && 'string' !== typeof uri) {
            throw new TypeError('Socket.connect: uri must be string or ' +
                                'undefined.');
        }
        if (options) {
            if ('object' !== typeof options) {
                throw new TypeError('Socket.connect: options must be ' +
                                    'object or undefined.');
            }
            this.userOptions = options;
        }

        humanReadableUri = uri || 'local server';

        if (!this.socket) {
            throw new Error('Socket.connet: cannot connet to ' +
                            humanReadableUri + ' . No socket defined.');
        }
        this.node.emit('SOCKET_CONNECTING');
        this.connecting = true;
        this.url = uri;
        this.node.info('connecting to ' + humanReadableUri + '.');
        this.socket.connect(uri, this.userOptions);
    };

    /**
     * ### Socket.reconnect
     *
     * Calls the connect method with previous parameters
     *
     * @see Socket.connect
     * @see Socket.disconnect
     */
    Socket.prototype.reconnect = function() {
        if (!this.url) {
            throw new Error('Socket.reconnect: cannot find previous uri.');
        }
        if (this.isConnected()) this.disconnect();
        this.connect(this.url, this.userOptions);
    };

    /**
     * ### Socket.disconnect
     *
     * Calls the disconnect method on the actual socket object
     */
    Socket.prototype.disconnect = function(force) {
        if (!force && !this.connecting && !this.connected) {
            node.warn('Socket.disconnect: socket is not connected.');
            return;
        }
        this.socket.disconnect();
    };


    /**
     * ### Socket.onConnect
     *
     * Handler for connections to the server
     *
     * @emit SOCKET_CONNECT
     */
    Socket.prototype.onConnect = function() {
        this.connected = true;
        this.connecting = false;
        this.node.emit('SOCKET_CONNECT');

        // The testing framework expects this, do not remove.
        this.node.info('socket connected.');
    };

    /**
     * ### Socket.onDisconnect
     *
     * Handler for disconnections from the server
     *
     * Clears the player and monitor lists.
     *
     * @emit SOCKET_DISCONNECT
     */
    Socket.prototype.onDisconnect = function() {
        this.connected = false;
        this.connecting = false;
        node.emit('SOCKET_DISCONNECT');
        // Save the current stage of the game
        //this.node.session.store();

        // On re-connection will receive a new ones.
        this.node.game.pl.clear(true);
        this.node.game.ml.clear(true);

        // Restore original message handler.
        this.setMsgListener(this.onMessageHI);

        // Delete session.
        this.session = null;

        this.node.info('socket closed.');
    };

    /**
     * ### Socket.secureParse
     *
     * Parses a string representing a game msg into a game msg object
     *
     * Checks that the id of the session is correct.
     *
     * @param {string} msg The msg string as received by the socket.
     * @return {GameMsg|undefined} gameMsg The parsed msg, or
     *   undefined on error.
     */
    Socket.prototype.secureParse = function(msg) {
        var gameMsg;
        try {
            gameMsg = GameMsg.clone(JSON.parse(msg));
            this.node.info('R: ' + gameMsg);
        }
        catch(e) {
            return logSecureParseError.call(this, 'malformed msg received', e);
        }
        return gameMsg;
    };

    /**
     * ### Socket.validateIncomingMsg
     *
     * Checks whether an incoming message is valid.
     *
     * Checks that the id of the session is correct.
     *
     * @param {object} msg The msg object to check
     * @return {GameMsg|undefined} gameMsg The parsed msg, or
     *   undefined on error.
     */
    Socket.prototype.validateIncomingMsg = function(gameMsg) {
        if (this.session && gameMsg.session !== this.session) {
            return logSecureParseError.call(this, 'mismatched session in ' +
                                            'incoming message.');
        }
        return gameMsg;
    };

    /**
     * ### Socket.onMessageHI
     *
     * Initial handler for incoming messages from the server
     *
     * This handler will be replaced by the FULL handler, upon receiving
     * a HI message from the server.
     *
     * This method starts the game session, by creating a player object
     * with the data received by the server.
     *
     * @param {GameMsg} msg The game message received and parsed by a socket.
     *
     * @see Socket.validateIncomingMsg
     * @see Socket.startSession
     * @see Socket.onMessageFull
     * @see node.createPlayer
     */
    Socket.prototype.onMessageHI = function(msg) {
        msg = this.validateIncomingMsg(msg);
        if (!msg) return;

        // Parsing successful.
        if (msg.target === 'HI') {
            // TODO: do we need to more checkings, besides is HI?

            // Replace itself: will change onMessage to onMessageFull.
            this.setMsgListener();

            // This will emit PLAYER_CREATED
            this.startSession(msg);
            // Functions listening to these events can be executed before HI.

            this.node.emit('NODEGAME_READY');
        }
    };

    /**
     * ### Socket.onMessageFull
     *
     * Full handler for incoming messages from the server
     *
     * All parsed messages are either emitted immediately or buffered,
     * if the game is not ready, and the message priority is low.x
     *
     * @param {GameMsg} msg The game message received and parsed by a socket.
     *
     * @see Socket.validateIncomingMsg
     * @see Socket.onMessage
     * @see Game.isReady
     */
    Socket.prototype.onMessageFull = function(msg) {
        msg = this.validateIncomingMsg(msg);
        if (!msg) return;

        // Message with high priority are executed immediately.
        if (msg.priority > 0 || this.node.game.isReady()) {
            this.node.emit(msg.toInEvent(), msg);
        }
        else {
            this.node.silly('B: ' + msg);
            this.buffer.push(msg);
        }
    };

    /**
     * ### Socket.onMessage
     *
     * Handler for incoming messages from the server
     *
     * @see Socket.onMessageHI
     * @see Socket.onMessageFull
     */
    Socket.prototype.onMessage = Socket.prototype.onMessageHI;

    /**
     * ### Socket.shouldClearBuffer
     *
     * Clears buffer conditionally
     *
     * @param msgHandler {function} Optional. Callback function which is
     *  called for every message in the buffer instead of the messages
     *  being emitted.
     *  Default: Emit every buffered message.
     *
     * @see this.node.emit
     * @see Socket.clearBuffer
     */
    Socket.prototype.setMsgListener = function(msgHandler) {
        if (msgHandler && 'function' !== typeof msgHandler) {
            throw new TypeError('Socket.setMsgListener: msgHandler must be a ' +
                                'function or undefined');
        }

        this.onMessage = msgHandler || this.onMessageFull;
    };

    /**
     * ### Socket.shouldClearBuffer
     *
     * Returns TRUE, if buffered messages can be emitted
     *
     * @see node.emit
     * @see Socket.clearBuffer
     * @see Game.isReady
     */
    Socket.prototype.shouldClearBuffer = function() {
        return this.node.game.isReady();
    };

    /**
     * ### Socket.clearBuffer
     *
     * Emits and removes all the events in the message buffer
     *
     * @param msgHandler {function} Optional. Callback function which is
     *  called for every message in the buffer instead of the messages
     *  being emitted.
     *  Default: Emit every buffered message.
     *
     * @see node.emit
     * @see Socket.shouldClearBuffer
     */
    Socket.prototype.clearBuffer = function(msgHandler) {
        var nelem, msg, i;
        var funcCtx, func;

        if (msgHandler) {
            funcCtx = this.node.game;
            func = msgHandler;
        }
        else {
            funcCtx = this.node.events;
            func = this.node.events.emit;
        }

        nelem = this.buffer.length;
        for (i = 0; i < nelem; i++) {
            // Modify the buffer at every iteration, so that if an error
            // occurs, already emitted messages are out of the way.
            msg = this.buffer.shift();
            if (msg) {
                func.call(funcCtx, msg.toInEvent(), msg);
                this.node.silly('D: ' + msg);
            }
        }
    };

    /**
     * ### Socket.eraseBuffer
     *
     * Removes all messages currently in the buffer
     *
     * This operation is not reversible
     *
     * @see Socket.clearBuffer
     */
    Socket.prototype.eraseBuffer = function() {
        this.buffer = [];
    };

    /**
     * ### Socket.startSession
     *
     * Initializes a nodeGame session
     *
     * Creates a the player and saves it in node.player, and
     * stores the session ids in the session object.
     *
     * If a game window reference is found, sets the `uriChannel` variable.
     *
     * @param {GameMsg} msg A game-msg
     * @return {boolean} TRUE, if session was correctly initialized
     *
     * @see node.createPlayer
     * @see Socket.registerServer
     * @see GameWindow.setUriChannel
     */
    Socket.prototype.startSession = function(msg) {
        this.session = msg.session;
        this.node.createPlayer(msg.data);
        if (this.node.window) this.node.window.setUriChannel(msg.text);
    };

    /**
     * ### Socket.isConnected
     *
     * Returns TRUE if socket connection is ready.
     */
    Socket.prototype.isConnected = function() {
        return this.connected && this.socket && this.socket.isConnected();
    };

    /**
     * ### Socket.send
     *
     * Pushes a message into the socket
     *
     * The msg is actually received by the client itself as well.
     *
     * @param {GameMsg} msg The game message to send
     *
     * @return {boolean} TRUE on success
     *
     * @see GameMsg
     *
     * TODO: when trying to send a message and the socket is not connected
     * the message is just discarded. Outgoing messages could be buffered
     * and sent out whenever the connection is available again.
     */
    Socket.prototype.send = function(msg) {
        var outEvent;

        if (!this.isConnected()) {
            this.node.err('Socket.send: cannot send message. No open socket.');
            return false;
        }

        if (!msg.from || msg.from === this.node.UNDEFINED_PLAYER) {
            this.node.err('Socket.send: cannot send message. ' +
                          'Player undefined.');
            return false;
        }

        // Emit out event, if required.
        if (this.emitOutMsg) {
            outEvent = msg.toOutEvent();
            this.node.events.ee.game.emit(outEvent, msg);
            this.node.events.ee.stage.emit(outEvent, msg);
            this.node.events.ee.step.emit(outEvent, msg);
        }

        this.socket.send(msg);
        this.node.info('S: ' + msg);

        // Experimental code.
        if (this.journalOn) {
            this.journal.insert(msg);
        }
        // End experimental code.

        return true;
    };

    // Helper methods.

    function logSecureParseError(text, e) {
        var error;
        text = text || 'generic error while parsing a game message.';
        error = (e) ? text + ": " + e : text;
        this.node.err('Socket.secureParse: ' + error);
        return false;
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # SocketIo
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Implementation of a remote socket communicating over HTTP
 * through Socket.IO
 *
 * This file requires that the socket.io library is already loaded before
 * nodeGame is loaded to work (see closure).
 */
(function(exports, node, io) {

    // TODO io will be undefined in Node.JS because
    // module.parents.exports.io does not exists

    // ## Global scope

    var J = node.JSUS;

    exports.SocketIo = SocketIo;

    /**
     * ## SocketIo constructor
     *
     * Creates a new instance of SocketIo
     *
     * @param {NodeGameClient} node Reference to the node instance
     */
    function SocketIo(node) {

        // ## Private properties

        /**
         * ### SocketIo.node
         *
         * Reference to the node object.
         */
        this.node = node;

        /**
         * ### Socket.socket
         *
         * Reference to the actual socket-io socket created on connection
         */
        this.socket = null;
    }

    /**
     * ### SocketIo.connect
     *
     * Establishes a socket-io connection with a server
     *
     * Sets the on: 'connect', 'message', 'disconnect' event listeners.
     *
     * @param {string} url The address of the server channel
     * @param {object} options Optional. Configuration options
     */
    SocketIo.prototype.connect = function(url, options) {
        var node, socket;
        node = this.node;

        if ('string' !== typeof url) {
            throw TypeError('SocketIO.connect: url must be string.');
        }

        // See https://github.com/Automattic/socket.io-client/issues/251
        J.mixin(options, { 'force new connection': true });

        socket = io.connect(url, options); //conf.io

        socket.on('connect', function(msg) {
            node.info('socket.io connection open');
            node.socket.onConnect.call(node.socket);
            socket.on('message', function(msg) {
                msg = node.socket.secureParse(msg);
                if (msg) {
                    node.socket.onMessage(msg);
                }
            });
        });

        socket.on('disconnect', function() {
            node.socket.onDisconnect.call(node.socket);
        });

        this.socket = socket;

        return true;
    };

    /**
     * ### SocketIo.disconnect
     *
     * Triggers the disconnection from a server
     */
    SocketIo.prototype.disconnect = function() {
        this.socket.disconnect();
    };

    /**
     * ### SocketIo.isConnected
     *
     * Returns TRUE, if currently connected
     */
    SocketIo.prototype.isConnected = function() {
        return this.socket && this.socket.connected;
    };

    /**
     * ### SocketIo.send
     *
     * Stringifies and send a message through the socket-io socket
     *
     * @param {object} msg Object implementing a stringiy method. Usually,
     *    a game message.
     *
     * @see GameMessage
     */
    SocketIo.prototype.send = function(msg) {
        this.socket.send(msg.stringify());
    };

    node.SocketFactory.register('SocketIo', SocketIo);

})(
    'undefined' !== typeof node ? node : module.exports,
    'undefined' !== typeof node ? node : module.parent.exports,
    'undefined' !== typeof module && 'undefined' !== typeof require ?
        require('socket.io-client') : 'undefined' !== typeof io ? io : {}
);

/**
 * # GameDB
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Provides a simple, lightweight NO-SQL database for nodeGame
 *
 * Entries are stored as GameBit messages.
 *
 * It automatically creates indexes.
 *
 * 1. by player,
 * 2. by stage
 *
 * @see GameStage.compare
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope.
    var NDDB = parent.NDDB,
    GameStage = parent.GameStage,
    J = parent.JSUS;

    // Inheriting from NDDB.
    GameDB.prototype = new NDDB();
    GameDB.prototype.constructor = GameDB;

    // Expose constructors
    exports.GameDB = GameDB;

    /**
     * ## GameDB constructor
     *
     * Creates an instance of GameDB
     *
     * @param {object} options Optional. A configuration object
     * @param {array} db Optional. An initial array of items
     *
     * @see NDDB constructor
     */
    function GameDB(options, db) {
        var that;
        that = this;
        options = options || {};
        options.name = options.name || 'gamedb';

        if (!options.update) options.update = {};

        // Auto build indexes by default.
        options.update.indexes = true;

        NDDB.call(this, options, db);

        this.comparator('stage', function(o1, o2) {
            var _o2;
            if ('string' === typeof o2.stage && that.node) {
                debugger
                if (false === J.isInt(o2.stage)) {
                    _o2 = that.node.game.plot.normalizeGameStage(o2.stage);
                    if (_o2) o2.stage = _o2;
                }
            }
            return GameStage.compare(o1.stage, o2.stage);
        });

        if (!this.player) {
            this.hash('player', function(o) {
                return o.player;
            });
        }
        if (!this.stage) {
            this.hash('stage', function(o) {
                if (o.stage) {
                    return GameStage.toHash(o.stage, 'S.s.r');
                }
            });
        }

        this.node = this.__shared.node;
    }

    /**
     * ### GameDB.add
     *
     * Wrapper around NDDB.insert
     *
     * Checks that the object contains a player and stage
     * property and also adds a timestamp and session field.
     *
     * @param {object} o The object to add
     *
     * @NDDB.insert
     */
    GameDB.prototype.add = function(o) {
        if ('string' !== typeof o.player) {
            throw new TypeError('GameDB.add: player field ' +
                                'missing or invalid: ', o);
        }
        if ('object' !== typeof o.stage) {
            throw new Error('GameDB.add: stage field ' +
                            'missing or invalid: ', o);
        }
        // if (node.nodename !== nodename) o.session = node.nodename;
        if (!o.timestamp) o.timestamp = Date ? Date.now() : null;
        this.insert(o);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Game
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Handles the flow of the game
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope

    // Exposing Game constructor
    exports.Game = Game;

    var GameStage = parent.GameStage,
    GameDB = parent.GameDB,
    GamePlot = parent.GamePlot,
    PlayerList = parent.PlayerList,
    Stager = parent.Stager;

    var constants = parent.constants;

    /**
     * ## Game constructor
     *
     * Creates a new instance of Game
     *
     * @param {NodeGameClient} node A valid NodeGameClient object
     */
    function Game(node) {

        this.node = node;

        // This updates are never published.
        this.setStateLevel(constants.stateLevels.UNINITIALIZED, 'S');
        this.setStageLevel(constants.stageLevels.UNINITIALIZED, 'S');

        // ## Properties

        /**
         * ### Game.metadata
         *
         * The game's metadata
         *
         * This object is under normal auto filled with the data
         * from the file `package.json` inside the game folder.
         *
         * Contains at least the following properties:
         *
         *  - name,
         *  - description,
         *  - version
         */
        this.metadata = {
            name:        'A nodeGame game',
            description: 'No description',
            version:     '0.0.1'
        };

        /**
         * ### Game.settings
         *
         * The game's settings
         *
         * This object is under normal auto filled with the settings
         * contained in the game folder: `game/game.settings`,
         * depending also on the chosen treatment.
         */
        this.settings = {};

        /**
         * ### Game.pl
         *
         * The list of players connected to the game
         *
         * The list may be empty, depending on the server settings.
         *
         * Two players with the same id, or any player with id equal to
         * `node.player.id` is not allowed, and it will throw an error.
         */
        this.pl = new PlayerList({
            log: this.node.log,
            logCtx: this.node,
            name: 'pl_' + this.node.nodename
        });

        this.pl.on('insert', function(p) {
            if (p.id === node.player.id) {
                throw new Error('node.game.pl.on.insert: cannot add player ' +
                                'with id equal to node.player.id.');
            }
        });

        /**
         * ### Game.ml
         *
         * The list of monitor clients connected to the game
         *
         * The list may be empty, depending on the server settings
         */
        this.ml = new PlayerList({
            log: this.node.log,
            logCtx: this.node,
            name: 'ml_' + this.node.nodename
        });

        /**
         * ### Game.memory
         *
         * A storage database for the game
         *
         * In the server logic the content of SET messages are
         * automatically inserted in this object
         *
         * @see NodeGameClient.set
         */
        this.memory = new GameDB({
            log: this.node.log,
            logCtx: this.node,
            shared: { node: this.node }
        });

        /**
         * ### Game.plot
         *
         * The Game plot
         *
         * @see GamePlot
         */
        this.plot = new GamePlot(this.node, new Stager());

        /**
         * ### Game.checkPlistSize
         *
         * Applies to the PlayerList the constraints defined in the Stager
         *
         * Reads the properties min/max/exactPlayers valid for the current step
         * and checks them with the PlayerList object.
         *
         * @return {boolean} TRUE if all checks are passed
         *
         * @see Game.step
         */
        this.checkPlistSize = function() { return true; };

        // Setting to stage 0.0.0 and starting.
        this.setCurrentGameStage(new GameStage(), 'S');
        this.setStateLevel(constants.stateLevels.STARTING, 'S');

        /**
         * ### Game.paused
         *
         * TRUE, if the game is paused
         *
         * @see Game.pause
         * @see Game.resume
         */
        this.paused = false;

        /**
         * ### Game.willBeDone
         *
         * TRUE, if DONE was emitted and evaluated successfully
         *
         * If TRUE, when PLAYING is emitted the game will try to step
         * immediately.
         *
         * @see NodeGameClient.done
         * @see Game.doneCalled
         */
        this.willBeDone = false;

        /**
         * ### Game.minPlayerCbCalled
         *
         * TRUE, if the mininum-player callback has already been called
         *
         * This is reset when the min-condition is satisfied again.
         *
         * @see Game.gotoStep
         */
        this.minPlayerCbCalled = false;

        /**
         * ### Game.maxPlayerCbCalled
         *
         * TRUE, if the maxinum-player callback has already been called
         *
         * This is reset when the max-condition is satisfied again.
         *
         * @see Game.gotoStep
         */
        this.maxPlayerCbCalled = false;

        /**
         * ### Game.exactPlayerCbCalled
         *
         * TRUE, if the exact-player callback has already been called
         *
         * This is reset when the exact-condition is satisfied again.
         *
         * @see Game.gotoStep
         */
        this.exactPlayerCbCalled = false;

        /**
         * ### Game.globals
         *
         * Object pointing to the current step _globals_ properties
         *
         * Whenever a new step is executed the _globals_ properties of
         * the step are copied here. The _globals_ properties of the previous
         * stage are deleted.
         *
         * @see GamePlot
         * @see Stager
         */
        this.globals = {};

        /**
         * ### Game._steppedSteps
         *
         * Array of steps previously played
         *
         * @see Game.step
         */
        this._steppedSteps = [new GameStage()];
    }

    // ## Game methods

    /**
     * ### Game.start
     *
     * Starts the game
     *
     * Calls the init function, and steps.
     *
     * Important: it does not use `Game.publishUpdate` because that is
     * just for change of state after the game has started.
     *
     * @param {object} options Optional. Configuration object. Fields:
     *
     *   - step: true/false. If false, jus call the init function, and
     *     does not enter the first step. Default, TRUE.
     */
    Game.prototype.start = function(options) {
        var onInit, node, startStage;

        node = this.node;

        if (options && 'object' !== typeof options) {
            throw new TypeError('Game.start: options must be object or ' +
                                'undefined.');
        }
        if (node.player.placeholder) {
            throw new Error('Game.start: no player defined.');
        }
        if (!this.isStartable()) {
            throw new Error('Game.start: game cannot be started.');
        }
        node.info('game started.');

        // Store time.
        node.timer.setTimestamp('start');

        options = options || {};

        // Starts from beginning (default) or from a predefined stage
        // This options is useful when a player reconnets.
        startStage = options.startStage || new GameStage();

        // INIT the game.

        onInit = this.plot.stager.getOnInit();
        this.globals = this.plot.getGlobals(startStage);
        if (onInit) {
            this.setStateLevel(constants.stateLevels.INITIALIZING);
            node.emit('INIT');
            onInit.call(node.game);
        }

        this.setStateLevel(constants.stateLevels.INITIALIZED);

        this.setCurrentGameStage(startStage, 'S');

        node.log('game started.');

        if (options.step !== false) {
            this.step();
        }
    };

    /**
     * ### Game.restart
     *
     * Stops and starts the game.
     *
     * @see Game.stop
     * @see Game.start
     */
    Game.prototype.restart = function() {
        this.stop();
        this.start();
    };

    /**
     * ### Game.stop
     *
     * Stops the current game
     *
     * Clears timers, event handlers, local memory, and window frame (if any).
     *
     * Does **not** clear _node.env_ variables and any node.player extra
     * property.
     *
     * If additional properties (e.g. widgets) have been added to the game
     * object by any of the previous game callbacks, they will not be removed.
     * TODO: avoid pollution of the game object.
     *
     * GameStage is set to 0.0.0 and server is notified.
     */
    Game.prototype.stop = function() {
        var node;

        node = this.node;
        if (!this.isStoppable()) {
            throw new Error('Game.stop: game cannot be stopped.');
        }
        // Destroy currently running timers.
        node.timer.destroyAllTimers(true);

        // Remove all events registered during the game.
        node.events.ee.game.clear();
        node.events.ee.stage.clear();
        node.events.ee.step.clear();

        // Clear memory.
        this.memory.clear(true);

        // If a _GameWindow_ object is found, clears it.
        if (node.window) {
            node.window.reset();
        }

        // Update state/stage levels and game stage.
        this.setStateLevel(constants.stateLevels.STARTING, 'S');
        this.setStageLevel(constants.stageLevels.UNINITIALIZED, 'S');
        // This command is notifying the server.
        this.setCurrentGameStage(new GameStage());

        // Temporary change:
        delete node.game;
        node.game = new Game(node);
        node.game.pl = this.pl;
        node.game.ml = this.ml;

        node.log('game stopped.');
    };

    /**
     * ### Game.gameover
     *
     * Ends the game
     *
     * Calls the gameover function, sets levels.
     *
     * TODO: should it set the game stage to 0.0.0 again ?
     */
    Game.prototype.gameover = function() {
        var onGameover, node;
        node = this.node;

        if (this.getStateLevel() >= constants.stateLevels.FINISHING) {
            node.warn('Game.gameover called on a finishing game.');
            return;
        }

        node.emit('GAME_ALMOST_OVER');

        // Call gameover callback, if it exists.
        onGameover = this.plot.stager.getOnGameover();
        if (onGameover) {
            this.setStateLevel(constants.stateLevels.FINISHING);
            onGameover.call(node.game);
        }

        this.setStateLevel(constants.stateLevels.GAMEOVER);
        this.setStageLevel(constants.stageLevels.DONE);

        node.log('game over.');
        node.emit('GAME_OVER');
    };

    /**
     * ### Game.pause
     *
     * Sets the game to pause
     *
     * @param {string} param Optional. A parameter to pass along the
     *   emitted events PAUSING and PAUSED.
     *
     * @see Game.resume
     */
    Game.prototype.pause = function(param) {
        var msgHandler, node;

        if (!this.isPausable()) {
            throw new Error('Game.pause: game cannot be paused.');
        }

        node = this.node;
        node.emit('PAUSING', param);

        this.paused = true;

        // If the Stager has a method for accepting messages during a
        // pause, pass them to it. Otherwise, buffer the messages
        // until the game is resumed.
        msgHandler = this.plot.getProperty(this.getCurrentGameStage(),
                                           'pauseMsgHandler');
        if (msgHandler) {
            node.socket.setMsgListener(function(msg) {
                msg = node.socket.secureParse(msg);
                msgHandler.call(node.game, msg.toInEvent(), msg);
            });
        }

        node.timer.setTimestamp('paused');
        node.emit('PAUSED', param);

        // TODO: broadcast?

        node.log('game paused.');
    };

    /**
     * ### Game.resume
     *
     * Resumes the game from pause
     *
     * @param {string} param Optional. A parameter to pass along the
     *   emitted events RESUMING and RESUMED.
     *
     * @see Game.pause
     */
    Game.prototype.resume = function(param) {
        var msgHandler, node;

        if (!this.isResumable()) {
            throw new Error('Game.resume: game cannot be resumed.');
        }

        node = this.node;

        node.emit('RESUMING', param);

        this.paused = false;

        // If the Stager defines an appropriate handler, give it the messages
        // that were buffered during the pause.
        // Otherwise, emit the buffered messages normally.
        msgHandler = this.plot.getProperty(this.getCurrentGameStage(),
                                           'resumeMsgHandler');

        node.socket.clearBuffer(msgHandler);

        // Reset the Socket's message handler to the default:
        node.socket.setMsgListener();
        node.timer.setTimestamp('resumed');
        node.emit('RESUMED', param);

        // TODO: broadcast?

        // Maybe the game was LOADED during the pausing.
        // In this case the PLAYING event got lost.
        if (this.shouldEmitPlaying()) {
            this.node.emit('PLAYING');
        }

        node.log('game resumed.');
    };

    /**
     * ### Game.shouldStep
     *
     * Checks if the next step can be executed
     *
     * Checks the number of players required.
     * If the game has been initialized and is not in GAME_OVER, then
     * evaluates the stepRule function for the current step and returns
     * its result.
     *
     * @param {number} stageLevel Optional. If set, it is used instead
     *   of `Game.getStageLevel()`
     *
     * @return {boolean} TRUE, if stepping is allowed;
     *   FALSE, if stepping is not allowed
     *
     * @see Game.step
     * @see Game.checkPlistSize
     * @see stepRules
     */
    Game.prototype.shouldStep = function(stageLevel) {
        var stepRule;

        if (!this.checkPlistSize() || !this.isSteppable()) {
            return false;
        }

        stepRule = this.plot.getStepRule(this.getCurrentGameStage());

        if ('function' !== typeof stepRule) {
            throw new TypeError('Game.shouldStep: stepRule is not a function.');
        }

        stageLevel = stageLevel || this.getStageLevel();

        return stepRule(this.getCurrentGameStage(), stageLevel, this.pl, this);
    };

    /**
     * ### Game.step
     *
     * Executes the next stage / step
     *
     * @return {boolean} FALSE, if the execution encountered an error
     *
     * @see Game.stager
     * @see Game.currentStage
     * @see Game.gotoStep
     * @see Game.execStep
     */
    Game.prototype.step = function() {
        var curStep, nextStep;
        curStep = this.getCurrentGameStage();
        nextStep = this.plot.next(curStep);
        return this.gotoStep(nextStep);
    };

    /**
     * ### Game.gotoStep
     *
     * Updates the current game step to toStep and executes it.
     *
     * It unloads the old step listeners, before loading the listeners of the
     * new one.
     *
     * It does note check if the next step is different from the current one,
     * and in this case the same step is re-executed.
     *
     * @param {string|GameStage} nextStep A game stage object, or a string like
     *   GAME_OVER.
     * @param {object} options Optional. Additional options, such as:
     *   `willBeDone` (immediately calls `node.done()`, useful
     *   for reconnections)
     *
     * @see Game.execStep
     * @see GameStage
     *
     * TODO: harmonize return values
     * TODO: remove some unused comments in the code.
     */
    Game.prototype.gotoStep = function(nextStep, options) {
        var curStep;
        var curStepObj, curStageObj, nextStepObj, nextStageObj;
        var ev, node;
        var property, handler;
        var minThreshold, maxThreshold, exactThreshold;
        var minCallback = null, maxCallback = null, exactCallback = null;

        if (!this.isSteppable()) {
            throw new Error('Game.gotoStep: game cannot be stepped.');
        }

        if ('string' !== typeof nextStep && 'object' !== typeof nextStep) {
            throw new TypeError('Game.gotoStep: nextStep must be ' +
                                'an object or a string.');
        }

        if (options && 'object' !== typeof options) {
            throw new TypeError('Game.gotoStep: options must be object or ' +
                                'undefined.');
        }

        node = this.node;
        options = options || {};

        node.silly('Next step ---> ' + nextStep);

        curStep = this.getCurrentGameStage();
        curStageObj = this.plot.getStage(curStep);
        curStepObj = this.plot.getStep(curStep);

        // Sends start / step command to connected clients if option is on.
        if (this.plot.getProperty(nextStep, 'syncStepping')) {
            if (curStep.stage === 0) {
                node.remoteCommand('start', 'ROOM');
            }
            else {
                node.remoteCommand('goto_step', 'ROOM', nextStep);
            }
        }

        // Calling exit function of the step.
        if (curStepObj && curStepObj.exit) {
            this.setStateLevel(constants.stateLevels.STEP_EXIT);
            this.setStageLevel(constants.stageLevels.EXITING);

            curStepObj.exit.call(this);
        }

        // Listeners from previous step are cleared (must be after exit).
        node.events.ee.step.clear();

        // Emit buffered messages.
        if (node.socket.shouldClearBuffer()) {
            node.socket.clearBuffer();
        }

        if ('string' === typeof nextStep) {

            // TODO: see if we can avoid code duplication below.
            // Calling exit function of the stage.
            if (curStageObj && curStageObj.exit) {
                this.setStateLevel(constants.stateLevels.STAGE_EXIT);
                this.setStageLevel(constants.stageLevels.EXITING);

                curStageObj.exit.call(this);
            }
            // Clear any event listeners added in the stage exit function.
            node.events.ee.stage.clear();

            if (nextStep === GamePlot.GAMEOVER) {
                this.gameover();
                // Emit buffered messages:
                if (node.socket.shouldClearBuffer()) {
                    node.socket.clearBuffer();
                }
                return null;
            }
            // else do nothing
            return null;
        }
        else {
            // TODO maybe update also in case of string.
            node.emit('STEPPING');

            // Check for stage/step existence:
            nextStageObj = this.plot.getStage(nextStep);
            if (!nextStageObj) return false;
            nextStepObj = this.plot.getStep(nextStep);
            if (!nextStepObj) return false;

            // Check options.
            // TODO: this does not lock screen / stop timer.
            if (options.willBeDone) this.willBeDone = true;

            // If we enter a new stage we need to update a few things.
            if (!curStageObj || nextStageObj.id !== curStageObj.id) {

                // Calling exit function.
                if (curStageObj && curStageObj.exit) {
                    this.setStateLevel(constants.stateLevels.STAGE_EXIT);
                    this.setStageLevel(constants.stageLevels.EXITING);

                    curStageObj.exit.call(this);
                }
                // TODO: avoid duplication.
                // stageLevel needs to be changed (silent), otherwise it stays
                // DONE for a short time in the new game stage:
                this.setStageLevel(constants.stageLevels.UNINITIALIZED, 'S');
                this.setCurrentGameStage(nextStep);

                // Store time:
                this.node.timer.setTimestamp('stage', (new Date()).getTime());

                // Clear the previous stage listeners.
                node.events.ee.stage.clear();

                this.setStateLevel(constants.stateLevels.STAGE_INIT);
                this.setStageLevel(constants.stageLevels.INITIALIZING);

                // Execute the init function of the stage, if any:
                if (nextStageObj.hasOwnProperty('init')) {
                    nextStageObj.init.call(node.game);
                }
            }
            else {
                // TODO: avoid duplication.
                // stageLevel needs to be changed (silent), otherwise it stays
                // DONE for a short time in the new game stage:
                this.setStageLevel(constants.stageLevels.UNINITIALIZED, 'S');
                this.setCurrentGameStage(nextStep);
            }

            // Execute the init function of the step, if any:
            if (nextStepObj.hasOwnProperty('init')) {
                this.setStateLevel(constants.stateLevels.STEP_INIT);
                this.setStageLevel(constants.stageLevels.INITIALIZING);
                nextStepObj.init.call(node.game);
            }

            this.setStateLevel(constants.stateLevels.PLAYING_STEP);
            this.setStageLevel(constants.stageLevels.INITIALIZED);

            // Updating the globals object.
            this.globals = this.plot.getGlobals(nextStep);

            // Add min/max/exactPlayers listeners for the step.
            // The fields must be of the form
            //   [ min/max/exactNum, callbackFn ]
            property = this.plot.getProperty(nextStep, 'minPlayers');
            if (property) {
                if (property.length < 2) {
                    throw new TypeError(
                        'Game.gotoStep: minPlayers field must be an array ' +
                            'of length 2.');
                }

                minThreshold = property[0];
                minCallback = property[1];
                if ('number' !== typeof minThreshold ||
                    'function' !== typeof minCallback) {
                    throw new TypeError(
                        'Game.gotoStep: minPlayers field must contain a ' +
                            'number and a function.');
                }
            }
            property = this.plot.getProperty(nextStep, 'maxPlayers');
            if (property) {
                if (property.length < 2) {
                    throw new TypeError(
                        'Game.gotoStep: maxPlayers field must be an array ' +
                            'of length 2.');
                }

                maxThreshold = property[0];
                maxCallback = property[1];
                if ('number' !== typeof maxThreshold ||
                    'function' !== typeof maxCallback) {
                    throw new TypeError(
                        'Game.gotoStep: maxPlayers field must contain a ' +
                            'number and a function.');
                }
            }
            property = this.plot.getProperty(nextStep, 'exactPlayers');
            if (property) {
                if (property.length < 2) {
                    throw new TypeError(
                        'Game.gotoStep: exactPlayers field must be an array ' +
                            'of length 2.');
                }

                exactThreshold = property[0];
                exactCallback = property[1];
                if ('number' !== typeof exactThreshold ||
                    'function' !== typeof exactCallback) {
                    throw new TypeError(
                        'Game.gotoStep: exactPlayers field must contain a ' +
                            'number and a function.');
                }
            }
            if (minCallback || maxCallback || exactCallback) {
                // Register event handler:
                handler = function() {
                    var nPlayers = node.game.pl.size();
                    // Players should count themselves too.
                    if (!node.player.admin) {
                        nPlayers++;
                    }

                    if (nPlayers < minThreshold) {
                        if (minCallback && !node.game.minPlayerCbCalled) {
                            node.game.minPlayerCbCalled = true;
                            minCallback.call(node.game);
                        }
                    }
                    else {
                        node.game.minPlayerCbCalled = false;
                    }

                    if (nPlayers > maxThreshold) {
                        if (maxCallback && !node.game.maxPlayerCbCalled) {
                            node.game.maxPlayerCbCalled = true;
                            maxCallback.call(node.game);
                        }
                    }
                    else {
                        node.game.maxPlayerCbCalled = false;
                    }

                    if (nPlayers !== exactThreshold) {
                        if (exactCallback && !node.game.exactPlayerCbCalled) {
                            node.game.exactPlayerCbCalled = true;
                            exactCallback.call(node.game);
                        }
                    }
                    else {
                        node.game.exactPlayerCbCalled = false;
                    }
                };

                node.events.ee.step.on('in.say.PCONNECT', handler);
                node.events.ee.step.on('in.say.PDISCONNECT', handler);
                // PRECONNECT doesn't change the PlayerList so we don't have to
                // handle it here.

                // Check conditions explicitly:
                handler();

                // Set bounds-checking function:
                this.checkPlistSize = function() {
                    var nPlayers = node.game.pl.size();
                    // Players should count themselves too.
                    if (!node.player.admin) {
                        nPlayers++;
                    }

                    if (minCallback && nPlayers < minThreshold) {
                        return false;
                    }

                    if (maxCallback && nPlayers > maxThreshold) {
                        return false;
                    }

                    if (exactCallback && nPlayers !== exactThreshold) {
                        return false;
                    }

                    return true;
                };
            }
            else {
                // Set bounds-checking function:
                this.checkPlistSize = function() { return true; };
            }

            // Emit buffered messages:
            if (node.socket.shouldClearBuffer()) {
                node.socket.clearBuffer();
            }

        }
        // Update list of stepped steps.
        this._steppedSteps.push(nextStep);
        this.execStep(this.getCurrentGameStage());
        return true;
    };

    /**
     * ### Game.execStep
     *
     * Executes the specified stage object
     *
     * @param {GameStage} step Step to execute
     *
     * @return {boolean} The result of the execution of the step callback
     */
    Game.prototype.execStep = function(step) {
        var cb;
        var frame, frameOptions;

        if ('object' !== typeof step) {
            throw new Error('Game.execStep: step must be object.');
        }

        cb = this.plot.getProperty(step, 'cb');
        frame = this.plot.getProperty(step, 'frame');

        if (frame) {
            if (!this.node.window) {
                throw new Error('Game.execStep: frame option in step ' +
                                step + ', but nodegame-window is not loaded.');
            }

            if ('object' === typeof frame) {
                frameOptions = frame.options;
                frame = frame.uri;
            }

            this.node.window.loadFrame(frame, function() {
                this.execCallback(cb);
            }, frameOptions);
        }
        else {
            this.execCallback(cb);
        }
    };

    /**
     * ## Game.execCallback
     *
     * Executes a game callback
     *
     * Sets the stage levels before and after executing the callback,
     * and emits an event before exiting.
     *
     * @param {function} cb The callback to execute
     *
     * @return {mixed} res The return value of the callback
     *
     * @emit 'STEP_CALLBACK_EXECUTED'
     */
    Game.prototype.execCallback = function(cb) {
        var res;
        this.setStageLevel(constants.stageLevels.EXECUTING_CALLBACK);

        // Execute custom callback. Can throw errors.
        res = cb.call(this.node.game);
        if (res === false) {
            // A non fatal error occurred.
            this.node.err('A non fatal error occurred in callback ' +
                          'of stage ' + this.getCurrentGameStage());
        }

        this.setStageLevel(constants.stageLevels.CALLBACK_EXECUTED);
        this.node.emit('STEP_CALLBACK_EXECUTED');
        // Internal listeners will check whether we need to emit PLAYING.
    };

    /**
     * ### Game.getCurrentStepObj
     *
     * Returns the object representing the current game step.
     *
     * The returning object includes all the properties, such as:
     * _id_, _cb_, _timer_, etc.
     *
     * @return {object} The game-step as defined in the stager.
     *
     * @see Stager
     * @see GamePlot
     */
    Game.prototype.getCurrentStepObj = function() {
        return this.plot.getStep(this.getCurrentGameStage());
    };

     /**
     * ### Game.getCurrentStep
     *
     * Alias for Game.prototype.getCurrentStepObj
     *
     * @deprecated
     */
    Game.prototype.getCurrentStep = Game.prototype.getCurrentStepObj;

    /**
     * ### Game.getCurrentStepProperty
     *
     * Returns the object representing the current game step.
     *
     * The returning object includes all the properties, such as:
     * _id_, _cb_, _timer_, etc.
     *
     * @return {object} The game-step as defined in the stager.
     *
     * @see Stager
     * @see GamePlot
     */
    Game.prototype.getCurrentStepProperty = function(propertyName) {
        var step;
        if ('string' !== typeof propertyName) {
            throw new TypeError('Game.getCurrentStepProperty: propertyName ' +
                                'must be string');
        }
        step = this.plot.getStep(this.getCurrentGameStage());
        return 'undefined' === typeof step[propertyName] ?
            null : step[propertyName];
    };

    /**
     * ### Game.getCurrentGameStage
     *
     * Return the GameStage that is currently being executed.
     *
     * The return value is a reference to node.player.stage.
     *
     * @return {GameStage} The stage currently played.
     * @see node.player.stage
     */
    Game.prototype.getCurrentGameStage = function() {
        return this.node.player.stage;
    };

    /**
     * ### Game.setCurrentGameStage
     *
     * Sets the current game stage and notifies the server
     *
     * Stores the value of current game stage in `node.player.stage`.
     *
     * By default, it does not send the update to the server if the
     * new stage is the same as the previous one. However, it is
     * possible to override this behavior with specyfing a second
     * parameter `mod`.
     *
     * @param {string|GameStage} gameStage The value of the update.
     *   For example, an object, or a string like '1.1.1'.
     * @param {string} mod Optional. A string modifiying the default
     *   behavior ('F' = force, 'S' = silent').
     *
     * @see Game.publishUpdate
     */
    Game.prototype.setCurrentGameStage = function(gameStage, mod) {
        gameStage = new GameStage(gameStage);
        if (mod === 'F' ||
            (!mod && GameStage.compare(this.getCurrentGameStage(),
                                       gameStage) !== 0)) {

            // Important: First publish, then actually update.
            // The stage level, must also be sent in the published update,
            // otherwise we could have a mismatch in the remote
            // representation of the stage + stageLevel of the client.
            this.publishUpdate('stage', {
                stage: gameStage,
                stageLevel: this.getStageLevel()
            });
        }

        this.node.player.stage = gameStage;
    };

    /**
     * ### Game.getStateLevel
     *
     * Returns the state of the nodeGame engine
     *
     * The engine states are defined in `node.constants.stateLevels`,
     * and it is of the type: STAGE_INIT, PLAYING_STEP, GAMEOVER, etc.
     * The return value is a reference to `node.player.stateLevel`.
     *
     * @return {number} The state of the engine.
     * @see node.player.stateLevel
     * @see node.constants.stateLevels
     */
    Game.prototype.getStateLevel = function() {
        return this.node.player.stateLevel;
    };

    /**
     * ### Game.setStateLevel
     *
     * Sets the current game state level, and optionally notifies the server
     *
     * The value is actually stored in `node.player.stateLevel`.
     *
     * Stage levels are defined in `node.constants.stageLevels`, for example:
     * STAGE_INIT, PLAYING_STEP, GAMEOVER, etc.
     *
     * By default, it does not send the update to the server if the
     * new state level is the same as the previous one. However, it is
     * possible to override this behavior with specyfing a second
     * parameter `mod`.
     *
     * @param {number} stateLevel The value of the update.
     * @param {string} mod Optional. A string modifiying the default
     *   behavior ('F' = force, 'S' = silent').
     *
     * @see Game.publishUpdate
     * @see node.constants.stageLevels
     */
    Game.prototype.setStateLevel = function(stateLevel, mod) {
        var node;
        node = this.node;
        if ('number' !== typeof stateLevel) {
            throw new TypeError('Game.setStateLevel: stateLevel must be ' +
                                'number. Found: ' + stateLevel);
        }
        // Important: First publish, then actually update.
        if (mod === 'F' || (!mod && this.getStateLevel() !== stateLevel)) {
            this.publishUpdate('stateLevel', {
                stateLevel: stateLevel
            });
        }
        node.player.stateLevel = stateLevel;
    };

    /**
     * ### Game.getStageLevel
     *
     * Return the execution level of the current game stage
     *
     * The execution level is defined in `node.constants.stageLevels`,
     * and it is of the type INITIALIZED, CALLBACK_EXECUTED, etc.
     * The return value is a reference to `node.player.stageLevel`.
     *
     * @return {number} The level of the stage execution.
     * @see node.player.stageLevel
     * @see node.constants.stageLevels
     */
    Game.prototype.getStageLevel = function() {
        return this.node.player.stageLevel;
    };

    /**
     * ### Game.setStageLevel
     *
     * Sets the current game stage level, and optionally notifies the server
     *
     * The value is actually stored in `node.player.stageLevel`.
     *
     * Stage levels are defined in `node.constants.stageLevels`, for example:
     * PLAYING, DONE, etc.
     *
     * By default, it does not send the update to the server if the
     * new state level is the same as the previous one. However, it is
     * possible to override this behavior with specyfing a second
     * parameter `mod`.
     *
     * @param {string|GameStage} gameStage The value of the update.
     * @param {string} mod Optional. A string modifiying the default
     *   behavior ('F' = force, 'S' = silent').
     *
     * @see Game.publishUpdate
     * @see node.constants.stageLevels
     */
    Game.prototype.setStageLevel = function(stageLevel, mod) {
        var node;
        node = this.node;
        if ('number' !== typeof stageLevel) {
            throw new TypeError('Game.setStageLevel: stageLevel must be ' +
                                'number. Found: ' + stageLevel);
        }
        // Important: First publish, then actually update.
        if (mod === 'F' || (!mod && this.getStageLevel() !== stageLevel)) {
            this.publishUpdate('stageLevel', {
                stageLevel: stageLevel
            });
        }
        node.player.stageLevel = stageLevel;
    };

    /**
     * ### Game.publishUpdate
     *
     * Sends out a PLAYER_UPDATE message, if conditions are met.
     *
     * Type is a property of the `node.player` object.
     *
     * @param {string} type The type of update:
     *   'stateLevel', 'stageLevel', 'gameStage'.
     * @param {mixed} newValue Optional. The actual value of update to be sent.
     *
     * @see Game.shouldPublishUpdate
     */
    Game.prototype.publishUpdate = function(type, update) {
        var node;
        if ('string' !== typeof type) {
            throw new TypeError('Game.publishUpdate: type must be string.');
        }
        if (type !== 'stage' &&
            type !== 'stageLevel' &&
            type !== 'stateLevel') {

            throw new Error(
                'Game.publishUpdate: unknown update type (' + type + ')');
        }
        node = this.node;

        if (this.shouldPublishUpdate(type, update)) {
            node.socket.send(node.msg.create({
                target: constants.target.PLAYER_UPDATE,
                data: update,
                text: type,
                to: 'ROOM'
            }));
        }
    };

    /**
     * ### Game.shouldPublishUpdate
     *
     * Checks whether a game update should be sent to the server
     *
     * Evaluates the current `publishLevel`, the type of update, and the
     * value of the update to decide whether is to be published or not.
     *
     * Checks also if the `syncOnLoaded` option is on.
     *
     * Updates rules are described in '/lib/modules/variables.js'.
     *
     * @param {string} type The type of update:
     *   'stateLevel', 'stageLevel', 'gameStage'.
     * @param {mixed} value Optional. The actual update to be sent
     *
     * @return {boolean} TRUE, if the update should be sent
     */
    Game.prototype.shouldPublishUpdate = function(type, value) {
        var myStage;
        var levels, myPublishLevel, stageLevels;
        if ('string' !== typeof type) {
            throw new TypeError(
                'Game.shouldPublishUpdate: type must be string.');
        }

        myStage = this.getCurrentGameStage();
        levels = constants.publishLevels;
        stageLevels = constants.stageLevels;

        myPublishLevel = this.plot.getProperty(myStage, 'publishLevel');

        // Two cases are handled outside of the switch: NO msg
        // and LOADED stage with syncOnLoaded option.
        if (myPublishLevel === levels.NONE) {
            return false;
        }
        if (this.plot.getProperty(myStage, 'syncOnLoaded')) {
            if (type === 'stageLevel' &&
                value.stageLevel === stageLevels.LOADED) {
                return true;
            }
            // Else will be evaluated below.
        }

        // Check all the other cases.
        switch(myPublishLevel) {
        case levels.FEW:
            return type === 'stage';
        case levels.REGULAR:
            if (type === 'stateLevel') return false;
            if (type === 'stageLevel') {
                return (value.stageLevel === stageLevels.PLAYING ||
                        value.stageLevel === stageLevels.DONE);
            }
            return true; // type === 'stage'
        case levels.MOST:
            return type !== 'stateLevel';
        case levels.ALL:
            return true;
        default:
            // Unknown values of publishLevels are treated as ALL.
            return true;
        }
    };

    /**
     * ### Game.isReady
     *
     * Returns TRUE if a game is set and interactive
     *
     * A game is ready unless a stage or step is currently being
     * loaded or DONE procedure has been started, i.e. between the
     * stage levels: PLAYING and GETTING_DONE.
     *
     * If a game is paused, it is also NOT ready.
     *
     * @see node.constants.stageLevels
     */
    Game.prototype.isReady = function() {
        var node, stageLevel, stateLevel;

        if (this.paused) return false;

        stateLevel = this.getStateLevel();
        stageLevel = this.getStageLevel();
        node = this.node;

        switch (stateLevel) {
        case constants.stateLevels.UNINITIALIZED:
        case constants.stateLevels.INITIALIZING:
        case constants.stateLevels.STAGE_INIT:
        case constants.stateLevels.STEP_INIT:
        case constants.stateLevels.FINISHING:
        case constants.stateLevels.STAGE_EXIT:
        case constants.stateLevels.STEP_EXIT:
            return false;

        case constants.stateLevels.PLAYING_STEP:
            switch (stageLevel) {
            case constants.stageLevels.EXECUTING_CALLBACK:
            case constants.stageLevels.CALLBACK_EXECUTED:
            case constants.stageLevels.PAUSING:
            case constants.stageLevels.RESUMING:
            case constants.stageLevels.GETTING_DONE:
                return false;
            }
            break;
        }
        return true;
    };

    /**
     * ### Game.isStartable
     *
     * Returns TRUE if Game.start can be called
     *
     * @return {boolean} TRUE if the game can be started.
     */
    Game.prototype.isStartable = function() {
        return this.plot.isReady() &&
            this.getStateLevel() < constants.stateLevels.INITIALIZING;
    };


    /**
     * ### Game.isStoppable
     *
     * Returns TRUE if Game.stop can be called
     *
     * @return {boolean} TRUE if the game can be stopped.
     */
    Game.prototype.isStoppable = function() {
        return this.getStateLevel() > constants.stateLevels.INITIALIZING;
    };


    /**
     * ### Game.isPausable
     *
     * Returns TRUE if Game.pause can be called
     *
     * @return {boolean} TRUE if the game can be paused.
     */
    Game.prototype.isPausable = function() {
        return !this.paused &&
            this.getStateLevel() > constants.stateLevels.INITIALIZING;
    };


    /**
     * ### Game.isResumable
     *
     * Returns TRUE if Game.resume can be called
     *
     * @return {boolean} TRUE if the game can be resumed.
     */
    Game.prototype.isResumable = function() {
        return this.paused &&
            this.getStateLevel() > constants.stateLevels.INITIALIZING;
    };


    /**
     * ### Game.isSteppable
     *
     * Returns TRUE if Game.step and Game.gotoStep can be called
     *
     * @return {boolean} TRUE if the game can be stepped.
     */
    Game.prototype.isSteppable = function() {
        var stateLevel;
        stateLevel = this.getStateLevel();

        return stateLevel > constants.stateLevels.INITIALIZING &&
               stateLevel < constants.stateLevels.FINISHING;
    };

    /**
     * ### Game.isGameover
     *
     * Returns TRUE if gameover was called and state level set
     *
     * @return {boolean} TRUE if is game over
     */
    Game.prototype.isGameover = Game.prototype.isGameOver = function() {
        return this.getStateLevel() === constants.stateLevels.GAMEOVER;
    };

    /**
     * ### Game.shouldEmitPlaying
     *
     * Gives the last green light to let the players play a step.
     *
     * Sometimes we want to synchronize players to the very last
     * moment before they start playing. Here we check again.
     * This handles the case also if some players has disconnected
     * between the beginning of the stepping procedure and this
     * method call.
     *
     * Checks also the GameWindow object.
     *
     * @param {boolean} strict If TRUE, PLAYING can be emitted only coming
     *   from the LOADED stage level. Default: TRUE
     * @return {boolean} TRUE, if the PLAYING event should be emitted.
     */
    Game.prototype.shouldEmitPlaying = function(strict) {
        var curGameStage, curStageLevel, syncOnLoaded, node;
        if ('undefined' === typeof strict || strict) {
            // Should emit PLAYING only after LOADED.
            curStageLevel = this.getStageLevel();
            if (curStageLevel !== constants.stageLevels.LOADED) return false;
        }
        node = this.node;
        curGameStage = this.getCurrentGameStage();
        if (!this.isReady()) return false;
        if (!this.checkPlistSize()) return false;

        syncOnLoaded = this.plot.getProperty(curGameStage, 'syncOnLoaded');
        if (!syncOnLoaded) return true;
        return node.game.pl.isStepLoaded(curGameStage);
    };

    /**
     * ### Game.compareCurrentStep
     *
     * Returns the relative order of a step with the current step
     *
     * @param {GameStage|string} step The step to compare
     *
     * @return {number} 0 if comparing step is the same as current step,
     *   -1 if current step is before comparing step, 1 if current step
     *   is after comparing step
     */
    Game.prototype.compareCurrentStep = function(step) {
        var normalizedStep;
        normalizedStep = this.plot.normalizeGameStage(new GameStage(step));
        return GameStage.compare(this.getCurrentGameStage(), normalizedStep);
    };

    /**
     * ### Game.getPreviousStep
     *
     * Returns the game-stage played delta steps ago
     *
     * @param {number} delta Optional. The number of past steps. Default 1
     *
     * @return {GameStage|null} The game-stage played delta steps ago,
     *   or null if none is found
     */
    Game.prototype.getPreviousStep = function(delta) {
        var len;
        delta = delta || 1;
        if ('number' !== typeof delta || delta < 1) {
            throw new TypeError('Game.getPreviousStep: delta must be a ' +
                                'positive number or undefined: ', delta);
        }
        len = this._steppedSteps.length - delta - 1;
        if (len < 0) return null;
        return this._steppedSteps[len];
    };

    /**
     * ### Game.getNextStep
     *
     * Returns the game-stage that will be played in delta steps
     *
     * @param {number} delta Optional. The number of future steps. Default 1
     *
     * @return {GameStage|null} The game-stage that will be played in
     *   delta future steps, or null if none is found, or if the game
     *   sequence contains a loop in between
     */
    Game.prototype.getNextStep = function(delta) {
        delta = delta || 1;
        if ('number' !== typeof delta || delta < 1) {
            throw new TypeError('Game.getNextStep: delta must be a ' +
                                'positive number or undefined: ', delta);
        }
        return this.plot.jump(this.getCurrentGameStage(), delta, false);
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # GameSession
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` session manager
 */
(function(exports, node) {

    "use strict";

    // ## Global scope

    var J = node.JSUS;

    // Exposing constructor.
    exports.GameSession = GameSession;
    exports.GameSession.SessionManager = SessionManager;

    GameSession.prototype = new SessionManager();
    GameSession.prototype.constructor = GameSession;

    /**
     * ## GameSession constructor
     *
     * Creates a new instance of GameSession
     *
     * @param {NodeGameClient} node A reference to the node object.
     */
    function GameSession(node) {
        SessionManager.call(this);

        /**
         * ### GameSession.node
         *
         * The reference to the node object.
         */
        this.node = node;

        // Register default variables in the session.
        this.register('player', {
            set: function(p) {
                node.createPlayer(p);
            },
            get: function() {
                return node.player;
            }
        });

        this.register('game.memory', {
            set: function(value) {
                node.game.memory.clear(true);
                node.game.memory.importDB(value);
            },
            get: function() {
                return (node.game.memory) ? node.game.memory.fetch() : null;
            }
        });

        this.register('events.history', {
            set: function(value) {
                node.events.history.history.clear(true);
                node.events.history.history.importDB(value);
            },
            get: function() {
                return node.events.history ?
                    node.events.history.history.fetch() : null;
            }
        });

        this.register('stage', {
            set: function() {
                // GameSession.restoreStage
            },
            get: function() {
                return node.player.stage;
            }
        });

        this.register('node.env');
    }


//    GameSession.prototype.restoreStage = function(stage) {
//
//        try {
//            // GOTO STATE
//            node.game.execStage(node.plot.getStep(stage));
//
//            var discard = ['LOG',
//                           'STATECHANGE',
//                           'WINDOW_LOADED',
//                           'BEFORE_LOADING',
//                           'LOADED',
//                           'in.say.STATE',
//                           'UPDATED_PLIST',
//                           'NODEGAME_READY',
//                           'out.say.STATE',
//                           'out.set.STATE',
//                           'in.say.PLIST',
//                           'STAGEDONE', // maybe not here
//                           'out.say.HI'
//                          ];
//
//            // RE-EMIT EVENTS
//            node.events.history.remit(node.game.getStateLevel(), discard);
//            node.info('game stage restored');
//            return true;
//        }
//        catch(e) {
//            node.err('could not restore game stage. ' +
//                     'An error has occurred: ' + e);
//            return false;
//        }
//
//    };

    /**
     * ## SessionManager constructor
     *
     * Creates a new session manager.
     */
    function SessionManager() {

        /**
         * ### SessionManager.session
         *
         * Container of all variables registered in the session.
         */
        this.session = {};
    }

    // ## SessionManager methods

    /**
     * ### SessionManager.getVariable (static)
     *
     * Default session getter.
     *
     * @param {string} p The path to a variable included in _node_
     * @return {mixed} The requested variable
     */
    SessionManager.getVariable = function(p) {
        return J.getNestedValue(p, node);
    };

    /**
     * ### SessionManager.setVariable (static)
     *
     * Default session setter.
     *
     * @param {string} p The path to the variable to set in _node_
     * @param {mixed} value The value to set
     */
    SessionManager.setVariable = function(p, value) {
        J.setNestedValue(p, value, node);
    };

    /**
     * ### SessionManager.register
     *
     * Register a new variable to the session
     *
     * Overwrites previously registered variables with the same name.
     *
     * Usage example:
     *
     * ```javascript
     * node.session.register('player', {
     *       set: function(p) {
     *           node.createPlayer(p);
     *       },
     *       get: function() {
     *           return node.player;
     *       }
     * });
     * ```
     *
     * @param {string} path A string containing a path to a variable
     * @param {object} conf Optional. Configuration object containing setters
     *   and getters
     */
    SessionManager.prototype.register = function(path, conf) {
        if ('string' !== typeof path) {
            throw new TypeError('SessionManager.register: path must be ' +
                                'string.');
        }
        if (conf && 'object' !== typeof conf) {
            throw new TypeError('SessionManager.register: conf must be ' +
                                'object or undefined.');
        }

        this.session[path] = {

            get: (conf && conf.get) ?
                conf.get : function() {
                    return J.getNestedValue(path, node);
                },

            set: (conf && conf.set) ?
                conf.set : function(value) {
                    J.setNestedValue(path, value, node);
                }
        };

        return this.session[path];
    };

    /**
     * ### SessionManager.unregister
     *
     * Unegister a variable from session
     *
     * @param {string} path A string containing a path to a variable previously
     *   registered.
     *
     * @see SessionManager.register
     */
    SessionManager.prototype.unregister = function(path) {
        if ('string' !== typeof path) {
            throw new TypeError('SessionManager.unregister: path must be ' +
                                'string.');
        }
        if (!this.session[path]) {
            node.warn('SessionManager.unregister: path is not registered ' +
                      'in the session: ' + path + '.');
            return false;
        }

        delete this.session[path];
        return true;
    };

    /**
     * ### SessionManager.clear
     *
     * Unegister all registered session variables
     *
     * @see SessionManager.unregister
     */
    SessionManager.prototype.clear = function() {
        this.session = {};
    };

    /**
     * ### SessionManager.get
     *
     * Returns the value/s of one/all registered session variable/s
     *
     * @param {string|undefined} path A previously registred variable or
     *   undefined to return all values
     *
     * @see SessionManager.register
     */
    SessionManager.prototype.get = function(path) {
        var session = {};
        // Returns one variable.
        if ('string' === typeof path) {
            return this.session[path] ? this.session[path].get() : undefined;
        }
        // Returns all registered variables.
        else if ('undefined' === typeof path) {
            for (path in this.session) {
                if (this.session.hasOwnProperty(path)) {
                    session[path] = this.session[path].get();
                }
            }
            return session;
        }
        else {
            throw new TypeError('SessionManager.get: path must be string or ' +
                                'undefined.');
        }
    };

    /**
     * ### SessionManager.isRegistered
     *
     * Returns TRUE, if a variable is registred
     *
     * @param {string} path A previously registred variable
     *
     * @return {boolean} TRUE, if the variable is registered
     *
     * @see SessionManager.register
     * @see SessionManager.unregister
     */
    SessionManager.prototype.isRegistered = function(path) {
        if ('string' !== typeof path) {
            throw new TypeError('SessionManager.isRegistered: path must be ' +
                                'string.');
        }
        return this.session.hasOwnProperty(path);
    };

    /**
     * ### SessionManager.serialize
     *
     * Returns an object containing that can be to restore the session
     *
     * The serialized session is an object containing _getter_, _setter_, and
     * current value of each of the registered session variables.
     *
     * @return {object} session The serialized session
     *
     * @see SessionManager.restore
     */
    SessionManager.prototype.serialize = function() {
        var session = {};
        for (var path in this.session) {
            if (this.session.hasOwnProperty(path)) {
                session[path] = {
                    value: this.session[path].get(),
                    get: this.session[path].get,
                    set: this.session[path].set
                };
            }
        }
        return session;
    };

    /**
     * ### SessionManager.restore
     *
     * Restore a previously serialized session object
     *
     * @param {object} session A serialized session object
     * @param {boolean} register Optional. If TRUE, every path is also
     *    registered before being restored.
     */
    SessionManager.prototype.restore = function(session, register) {
        var i;
        if ('object' !== typeof session) {
            throw new TypeError('SessionManager.restore: session must be ' +
                                'object.');
        }
        register = 'undefined' !== typeof register ? register : true;
        for (i in session) {
            if (session.hasOwnProperty(i)) {
                if (register) this.register(i, session[i]);
                session[i].set(session[i].value);
            }
        }
    };

//    SessionManager.prototype.store = function() {
//        //node.store(node.socket.id, this.get());
//    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Timer
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Timing-related utility functions
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    var J = parent.JSUS;

    // Exposing Timer constructor
    exports.Timer = Timer;

    /**
     * ## Timer constructor
     *
     * Creates a new instance of Timer
     *
     * @param {NodeGameClient} node. A valid NodeGameClient object
     * @param {object} settings Optional. A configuration object
     */
    function Timer(node, settings) {
        this.node = node;

        this.settings = settings || {};

        /**
         * ### Timer.timers
         *
         * Collection of currently active timers created by `Timer.createTimer`
         * @see Timer.createTimer
         */
        this.timers = {};

        /**
         * ### Timer.timestamps
         *
         * Named timestamp collection
         *
         * Maps names to numbers (milliseconds since epoch)
         *
         * @see Timer.setTimestamp
         * @see Timer.getTimestamp
         * @see Timer.getTimeSince
         */
        this.timestamps = {};
    }

    // ## Timer methods

    /**
     * ### Timer.createTimer
     *
     * Returns a new GameTimer
     *
     * The GameTimer instance is automatically paused and resumed on
     * the respective events.
     *
     * Timer creation is flexible, and input parameter can be a full
     * configuration object, the number of millieconds or nothing. In the
     * latter case, the new timer will need to be configured manually. If
     * only the number of milliseconds is passed the timer will fire a 'TIMEUP'
     * event once the time expires.
     *
     * @param {mixed} options The configuration object passed to the GameTimer
     *   constructor. Alternatively, it is possble to pass directly the number
     *   of milliseconds and the remaining settings will be added, or to leave
     *   it undefined.
     *
     * @return {GameTimer} timer The requested timer
     *
     * @see GameTimer
     */
    Timer.prototype.createTimer = function(options) {
        var gameTimer, pausedCb, resumedCb;
        var ee;

        if (options &&
            ('object' !== typeof options && 'number' !== typeof options)) {

            throw new TypeError('Timer.createTimer: options must be ' +
                                'undefined, object or number.');
        }

        if ('number' === typeof options) options = { milliseconds: options };
        options = options || {};

        options.name = options.name ||
            J.uniqueKey(this.timers, 'timer_' + J.randomInt(0, 10000000));

        if (this.timers[options.name]) {
            throw new Error('Timer.createTimer: timer ' + options.name +
                            ' already existing.');
        }

        // If game is paused add options startPaused, unless user
        // specified a value in the options object.
        if (this.node.game.paused) {
            if ('undefined' === typeof options.startPaused) {
                options.startPaused = true;
            }
        }

        ee = this.node.getCurrentEventEmitter();

        options.eventEmitterName = ee.name;

        // Create the GameTimer:
        gameTimer = new GameTimer(this.node, options);

        // Attach pause / resume listeners:
        pausedCb = function() {
            if (!gameTimer.isPaused()) {
                gameTimer.pause();
            }
        };
        resumedCb = function() {
            // startPaused=true also counts as a "paused" state:
            if (gameTimer.isPaused() || gameTimer.startPaused) {
                gameTimer.resume();
            }
        };

        ee.on('PAUSED', pausedCb);
        ee.on('RESUMED', resumedCb);

        // Attach listener handlers to GameTimer object so they can be
        // unregistered later:
        gameTimer.timerPausedCallback = pausedCb;
        gameTimer.timerResumedCallback = resumedCb;

        // Add a reference into this.timers.
        this.timers[gameTimer.name] = gameTimer;

        return gameTimer;
    };

    /**
     * ### Timer.destroyTimer
     *
     * Stops and removes a GameTimer
     *
     * The event handlers listening on PAUSED/RESUMED that are attached to
     * the given GameTimer object are removed.
     *
     * @param {object|string} gameTimer The gameTimer object or the name of
     *   the gameTimer created with Timer.createTimer
     */
    Timer.prototype.destroyTimer = function(gameTimer) {
        var eeName;
        if ('string' === typeof gameTimer) {
            if (!this.timers[gameTimer]) {
                throw new Error('node.timer.destroyTimer: gameTimer not ' +
                                'found: ' + gameTimer + '.');
            }
            gameTimer = this.timers[gameTimer];
        }
        if ('object' !== typeof gameTimer) {
            throw new Error('node.timer.destroyTimer: gameTimer must be ' +
                            'string or object.');
        }

        // Stop timer.
        if (!gameTimer.isStopped()) {
            gameTimer.stop();
        }

        eeName = gameTimer.eventEmitterName;
        // Detach listeners.
        if (eeName) {
            // We know where the timer was registered.
            this.node.events.ee[eeName].remove('PAUSED',
                                               gameTimer.timerPausedCallback);
            this.node.events.ee[eeName].remove('RESUMED',
                                               gameTimer.timerResumedCallback);
        }
        else {
            // We try to unregister from all.
            this.node.off('PAUSED', gameTimer.timerPausedCallback);
            this.node.off('RESUMED', gameTimer.timerResumedCallback);
        }

        // Delete reference in this.timers.
        delete this.timers[gameTimer.name];
    };

    /**
     * ### Timer.destroyAllTimers
     *
     * Stops and removes all registered GameTimers
     */
    Timer.prototype.destroyAllTimers = function(confirm) {
        if (!confirm) {
            node.warn('Timer.destroyAllTimers: confirm must be true to ' +
                      'proceed. No timer destroyed.');
            return false;
        }
        for (var i in this.timers) {
            this.destroyTimer(this.timers[i]);
        }
    };

    // Common handler for randomEmit and randomExec
    function randomFire(hook, maxWait, emit) {
        var that = this;
        var waitTime;
        var callback;
        var timerObj;
        var tentativeName;

        // Get time to wait:
        maxWait = maxWait || 6000;
        waitTime = Math.random() * maxWait;

        // Define timeup callback:
        if (emit) {
            callback = function() {
                that.destroyTimer(timerObj);
                that.node.emit(hook);
            };
        }
        else {
            callback = function() {
                that.destroyTimer(timerObj);
                hook.call();
            };
        }

        tentativeName = emit ? 'rndEmit_' + hook + '_' + J.randomInt(0, 1000000)
            : 'rndExec_' + J.randomInt(0, 1000000);

        // Create and run timer:
        timerObj = this.createTimer({
            milliseconds: waitTime,
            timeup: callback,
            name: J.uniqueKey(this.timers, tentativeName)
        });

        // TODO: check if this condition is ok.
        if (this.node.game.isReady()) {
            timerObj.start();
        }
        else {
            // TODO: this is not enough. Does not cover all use cases.
            this.node.once('PLAYING', function() {
                timerObj.start();
            });
        }
    }

    /**
     * ### Timer.setTimestamp
     *
     * Adds or changes a named timestamp
     *
     * @param {string} name The name of the timestamp
     * @param {number|undefined} time Optional. The time in ms as returned by
     *   Date.getTime(). Default: Current time.
     */
    Timer.prototype.setTimestamp = function(name, time) {
        // Default time: Current time
        if ('undefined' === typeof time) time = (new Date()).getTime();

        // Check inputs:
        if ('string' !== typeof name) {
            throw new Error('Timer.setTimestamp: name must be a string');
        }
        if ('number' !== typeof time) {
            throw new Error('Timer.setTimestamp: time must be a number or ' +
                            'undefined');
        }

        this.timestamps[name] = time;
    };

    /**
     * ### Timer.getTimestamp
     *
     * Retrieves a named timestamp
     *
     * @param {string} name The name of the timestamp
     *
     * @return {number|null} The time associated with the timestamp,
     *   NULL if it doesn't exist
     */
    Timer.prototype.getTimestamp = function(name) {
        // Check input:
        if ('string' !== typeof name) {
            throw new Error('Timer.getTimestamp: name must be a string');
        }

        if (this.timestamps.hasOwnProperty(name)) {
            return this.timestamps[name];
        }
        else {
            return null;
        }
    };

    /**
     * ### Timer.getAllTimestamps
     *
     * Returns the map with all timestamps
     *
     * Do not change the returned object.
     *
     * @return {object} The timestamp map
     */
    Timer.prototype.getAllTimestamps = function() {
        return this.timestamps;
    };

    /**
     * ### Timer.getTimeSince
     *
     * Gets the time in ms since a timestamp
     *
     * @param {string} name The name of the timestamp
     *
     * @return {number|null} The time since the timestamp in ms,
     *   NULL if it doesn't exist
     *
     * @see Timer.getTimeDiff
     */
    Timer.prototype.getTimeSince = function(name) {
        var currentTime;

        // Get current time:
        currentTime = (new Date()).getTime();

        // Check input:
        if ('string' !== typeof name) {
            throw new TypeError('Timer.getTimeSince: name must be string.');
        }

        if (this.timestamps.hasOwnProperty(name)) {
            return currentTime - this.timestamps[name];
        }
        else {
            return null;
        }
    };

    /**
     * ### Timer.getTimeDiff
     *
     * Returns the time difference between two registered timestamps
     *
     * @param {string} nameFrom The name of the first timestamp
     * @param {string} nameTo The name of the second timestamp
     *
     * @return {number} The time difference between the timestamps
     */
    Timer.prototype.getTimeDiff = function(nameFrom, nameTo) {
        var timeFrom, timeTo;

        // Check input:
        if ('string' !== typeof nameFrom) {
            throw new TypeError('Timer.getTimeDiff: nameFrom must be string.');
        }
        if ('string' !== typeof nameTo) {
            throw new TypeError('Timer.getTimeDiff: nameTo must be string.');
        }

        timeFrom = this.timestamps[nameFrom];

        if ('undefined' === typeof timeFrom || timeFrom === null) {
            throw new Error('Timer.getTimeDiff: nameFrom does not resolve to ' +
                            'a valid timestamp.');
        }

        timeTo = this.timestamps[nameTo];

        if ('undefined' === typeof timeTo || timeTo === null) {
            throw new Error('Timer.getTimeDiff: nameTo does not resolve to ' +
                            'a valid timestamp.');
        }

        return timeTo - timeFrom;
    };


    /**
     * ### Timer.getTimer
     *
     * Returns a reference to a previosly registered game timer.
     *
     * @param {string} name The name of the timer
     *
     * @return {GameTimer|null} The game timer with the given name, or
     *   null if none is found
     */
    Timer.prototype.getTimer = function(name) {
        if ('string' !== typeof name) {
            throw new TypeError('Timer.getTimer: name must be string.');
        }
        return this.timers[name] || null;
    };

    /**
     * ### Timer.randomEmit
     *
     * Emits an event after a random time interval between 0 and maxWait
     *
     * Respects pausing / resuming.
     *
     * @param {string} event The name of the event
     * @param {number} maxWait Optional. The maximum time (in milliseconds)
     *   to wait before emitting the event. Default: 6000
     */
    Timer.prototype.randomEmit = function(event, maxWait) {
        randomFire.call(this, event, maxWait, true);
    };

    /**
     * ### Timer.randomExec
     *
     * Executes a callback function after a random time interval
     *
     * Respects pausing / resuming.
     *
     * @param {function} func The callback function to execute
     * @param {number} maxWait Optional. The maximum time (in milliseconds)
     *   to wait before executing the callback. Default: 6000
     */
    Timer.prototype.randomExec = function(func, maxWait) {
        randomFire.call(this, func, maxWait, false);
    };

    /**
     * # GameTimer
     *
     * Copyright(c) 2015 Stefano Balietti
     * MIT Licensed
     *
     * Creates a controllable timer object for nodeGame.
     */
    exports.GameTimer = GameTimer;

    /**
     * ### GameTimer status levels
     * Numerical levels representing the state of the GameTimer
     *
     * @see GameTimer.status
     */
    GameTimer.STOPPED = -5;
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
    function GameTimer(node, options) {
        options = options || {};

        // ## Public properties

        /**
         * ### node
         *
         * Internal reference to node.
         */
        this.node = node;

        /**
         * ### name
         *
         * Internal name of the timer.
         */
        this.name = options.name || 'timer_' + J.randomInt(0, 1000000);

        /**
         * ### GameTimer.status
         *
         * Numerical index keeping the current the state of the GameTimer obj.
         */
        this.status = GameTimer.UNINITIALIZED;

        /**
         * ### GameTimer.options
         *
         * The current settings for the GameTimer.
         */
        this.options = options;

        /**
         * ### GameTimer.timerId
         *
         * The ID of the javascript interval.
         */
        this.timerId = null;

        /**
         * ### GameTimer.timeLeft
         *
         * Milliseconds left before time is up.
         */
        this.timeLeft = null;

        /**
         * ### GameTimer.timePassed
         *
         * Milliseconds already passed from the start of the timer.
         */
        this.timePassed = 0;

        /**
         * ### GameTimer.update
         *
         * The frequency of update for the timer (in milliseconds).
         */
        this.update = undefined;

        /**
         * ### GameTimer.updateRemaining
         *
         * Milliseconds remaining for current update.
         */
        this.updateRemaining = 0;

        /**
         * ### GameTimer.updateStart
         *
         * Timestamp of the start of the last update
         */
        this.updateStart = 0;

        /**
         * ### GameTimer.startPaused
         *
         * Whether to enter the pause state when starting
         */
        this.startPaused = null;

        /**
         * ### GameTimer.timeup
         *
         * Event string or function to fire when the time is up
         *
         * @see GameTimer.fire
         */
        this.timeup = 'TIMEUP';

        /**
         * ### GameTimer.hooks
         *
         * Array of hook functions to fire at every update
         *
         * The array works as a LIFO queue
         *
         * @see GameTimer.fire
         */
        this.hooks = [];

        /**
         * ### GameTimer.hookNames
         *
         * Object containing all names used for the hooks
         *
         * @see GameTimer.hooks
         */
        this.hookNames = {};

        /**
         * ### GameTimer.hookNames
         *
         * The name of the event emitter where the timer was registered
         *
         * @see EventEmitter
         */
        this.eventEmitterName = null;

        // Init!
        this.init();
    }

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
     *  var options = {
     *      // The length of the interval.
     *      milliseconds: 4000,
     *      // How often to update the time counter. Default: milliseconds
     *      update: 1000,
     *      // An event or function to fire when the timer expires.
     *      timeup: 'MY_EVENT',
     *      hooks: [
     *              // Array of functions or events to fire at every update.
     *              myFunc,
     *              'MY_EVENT_UPDATE',
     *              { hook: myFunc2,
     *                ctx: that, },
     *              ],
     *  }
     *  // Units are in milliseconds.
     *
     * Note: if `milliseconds` is a negative number the timer fire
     * immediately.
     *
     * @param {object} options Optional. Configuration object
     *
     * @see GameTimer.addHook
     */
    GameTimer.prototype.init = function(options) {
        var i, len;
        options = options || this.options;

        this.status = GameTimer.UNINITIALIZED;
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.milliseconds = options.milliseconds;
        this.update = options.update || this.update || this.milliseconds;
        this.timeLeft = this.milliseconds;
        this.timePassed = 0;
        this.updateStart = 0;
        this.updateRemaining = 0;
        // Event to be fired when timer expires.
        this.timeup = options.timeup || 'TIMEUP';
        // TODO: update and milliseconds must be multiple now
        if (options.hooks) {
            len = options.hooks.length;
            for (i = 0; i < len; i++) {
                this.addHook(options.hooks[i]);
            }
        }

        // Set startPaused option. if specified. Default: FALSE
        this.startPaused = 'undefined' !== options.startPaused ?
            options.startPaused : false;

        // Only set status to INITIALIZED if all of the state is valid and
        // ready to be used by this.start etc.
        if (checkInitialized(this) === null) {
            this.status = GameTimer.INITIALIZED;
        }

        this.eventEmitterName = options.eventEmitterName;
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
     */
    GameTimer.prototype.fire = function(h) {
        var hook, ctx;
        if (!h) {
            throw new Error('GameTimer.fire: missing argument');
        }
        hook = h.hook || h;
        if ('function' === typeof hook) {
            ctx = h.ctx || this.node.game;
            hook.call(ctx);
        }
        else {
            this.node.emit(hook);
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
     * @see GameTimer.status
     * @see GameTimer.timeup
     * @see GameTimer.fire
     */
    GameTimer.prototype.start = function() {
        var error, that;

        // Check validity of state
        error = checkInitialized(this);
        if (error !== null) {
            throw new Error('GameTimer.start: ' + error);
        }

        if (this.isRunning()) {
            throw new Error('GameTimer.start: timer is already running.');
        }

        this.status = GameTimer.LOADING;

        if (this.startPaused) {
            this.pause();
            return;
        }

        // Remember time of start (used by this.pause to compute remaining time)
        this.updateStart = (new Date()).getTime();

        // Fires the event immediately if time is zero.
        // Double check necessary in strict mode.
        if ('undefined' !== typeof this.options.milliseconds &&
                this.options.milliseconds === 0) {
            this.stop();
            this.fire(this.timeup);
            return;
        }

        this.updateRemaining = this.update;

        that = this;
        // It is not possible to pass extra parameters to updateCallback,
        // by adding them after _this.update_. In IE does not work.
        this.timerId = setInterval(function() {
            updateCallback(that);
        }, this.update);
    };

    /**
     * ### GameTimer.addHook
     *
     * Add an hook to the hook list after performing conformity checks.
     * The first parameter hook can be a string, a function, or an object
     * containing an hook property.
     *
     * @params {mixed} hook Either the hook to be called or an object containing
     *  at least the hook to be called and possibly even ctx and name
     * @params {object} ctx A reference to the context wherein the hook is
     *  called.
     * @params {string} name The name of the hook. If not provided, this method
     *  provides an uniqueKey for the hook
     *
     * @returns {mixed} The name of the hook, if it was added; false otherwise.
     */
    GameTimer.prototype.addHook = function(hook, ctx, name) {
        var i;

        if (!hook) {
            throw new Error('GameTimer.addHook: missing argument');
        }
        ctx = ctx || this.node.game;
        if (hook.hook) {
            ctx = hook.ctx || ctx;
            if(hook.name) {
                name = hook.name;
            }
            hook = hook.hook;
        }
        if (!name) {
            name = J.uniqueKey(this.hookNames, 'timerHook');
        }
        for (i = 0; i < this.hooks.length; i++) {
            if (this.hooks[i].name === name) {
                return false;
            }
        }
        this.hookNames[name] = true;
        this.hooks.push({hook: hook, ctx: ctx, name: name});
        return name;
    };

    /*
     * ### GameTimer.removeHook
     *
     * Removes a hook given its' name
     *
     * @param {string} name Name of the hook to be removed
     * @return {mixed} the hook if it was removed; false otherwise.
     */
    GameTimer.prototype.removeHook = function(name) {
        var i;
        if (this.hookNames[name]) {
            for (i = 0; i < this.hooks.length; i++) {
                if (this.hooks[i].name === name) {
                    delete this.hookNames[name];
                    return this.hooks.splice(i,1);
                }
            }
        }
        return false;
    };

    /**
     * ### GameTimer.pause
     *
     * Pauses the timer
     *
     * If the timer was running, clear the interval and sets the
     * status property to `GameTimer.PAUSED`.
     */
    GameTimer.prototype.pause = function() {
        var timestamp;

        if (this.isRunning()) {
            clearInterval(this.timerId);
            clearTimeout(this.timerId);
            this.timerId = null;

            this.status = GameTimer.PAUSED;

            // Save time of pausing.
            // If start was never called, or called with startPaused on.
            if (this.updateStart === 0) {
                this.updateRemaining = this.update;
            }
            else {
                // Save the difference of time left.
                timestamp = (new Date()).getTime();
                this.updateRemaining =
                    this.update - (timestamp - this.updateStart);
            }
        }
        else if (this.status === GameTimer.STOPPED) {
            // If the timer was explicitly stopped, we ignore the pause:
            return;
        }
        else if (!this.isPaused()) {
            // pause() was called before start(); remember it:
            this.startPaused = true;
        }
        else {
            throw new Error('GameTimer.pause: timer was already paused');
        }
    };

    /**
     * ### GameTimer.resume
     *
     * Resumes a paused timer
     *
     * If the timer was paused, restarts it with the current configuration
     *
     * @see GameTimer.restart
     */
    GameTimer.prototype.resume = function() {
        var that = this;

        // Don't start if the initialization is incomplete (invalid state):
        if (this.status === GameTimer.UNINITIALIZED) {
            this.startPaused = false;
            return;
        }

        if (!this.isPaused() && !this.startPaused) {
            throw new Error('GameTimer.resume: timer was not paused');
        }

        this.status = GameTimer.LOADING;

        this.startPaused = false;

        this.updateStart = (new Date()).getTime();

        // Run rest of this "update" interval:
        this.timerId = setTimeout(function() {
            if (updateCallback(that)) {
                // start() needs the timer to not be running.
                that.status = GameTimer.INITIALIZED;

                that.start();

                // start() sets status to LOADING, so change it back to RUNNING.
                that.status = GameTimer.RUNNING;
            }
        }, this.updateRemaining);
    };

    /**
     * ### GameTimer.stop
     *
     * Stops the timer
     *
     * If the timer was paused or running, clear the interval, sets the
     * status property to `GameTimer.STOPPED`, and reset the time passed
     * and time left properties
     */
    GameTimer.prototype.stop = function() {
        if (this.isStopped()) {
            throw new Error('GameTimer.stop: timer was not running');
        }

        this.status = GameTimer.STOPPED;
        clearInterval(this.timerId);
        clearTimeout(this.timerId);
        this.timerId = null;
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
     * @see GameTimer.init
     */
    GameTimer.prototype.restart = function(options) {
        if (!this.isStopped()) {
            this.stop();
        }
        this.init(options);
        this.start();
    };

    /**
     * ### GameTimer.isRunning
     *
     * Returns whether timer is running
     *
     * Running means either LOADING or RUNNING.
     */
    GameTimer.prototype.isRunning = function() {
        return (this.status > 0);
    };

    /**
     * ### GameTimer.isStopped
     *
     * Returns whether timer is stopped
     *
     * Stopped means either UNINITIALIZED, INITIALIZED or STOPPED.
     *
     * @see GameTimer.isPaused
     */
    GameTimer.prototype.isStopped = function() {
        if (this.status === GameTimer.UNINITIALIZED ||
            this.status === GameTimer.INITIALIZED ||
            this.status === GameTimer.STOPPED) {

            return true;
        }
        else {
            return false;
        }
    };

    /**
     * ### GameTimer.isPaused
     *
     * Returns whether timer is paused
     */
    GameTimer.prototype.isPaused = function() {
        return this.status === GameTimer.PAUSED;
    };

    /**
     * ### GameTimer.isPaused
     *
     * Return TRUE if the time expired
     */
    GameTimer.prototype.isTimeup = function() {
        // return this.timeLeft !== null && this.timeLeft <= 0;
        return this.timeLeft <= 0;
    };

    // Do a timer update.
    // Return false if timer ran out, true otherwise.
    function updateCallback(that) {
        that.status = GameTimer.RUNNING;
        that.timePassed += that.update;
        that.timeLeft -= that.update;
        that.updateStart = (new Date()).getTime();
        // Fire custom hooks from the latest to the first if any
        for (var i = that.hooks.length; i > 0; i--) {
            that.fire(that.hooks[(i-1)]);
        }
        // Fire Timeup Event
        if (that.timeLeft <= 0) {
            // First stop the timer and then call the timeup
            that.stop();
            that.fire(that.timeup);
            return false;
        }
        else {
            return true;
        }
    }

    // Check whether the timer has a valid initialized state.
    // Returns null if true, an error string otherwise.
    function checkInitialized(that) {
        if ('number' !== typeof that.milliseconds) {
            return 'this.milliseconds must be a number';
        }
        if (that.update > that.milliseconds) {
            return 'this.update must not be greater than this.milliseconds';
        }

        return null;
    }


    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Matcher
 * Copyright(c) 2016 Stefano Balietti <s.balietti@neu.edu>
 * MIT Licensed
 *
 * Class handling the creation of tournament schedules.
 *
 * http://www.nodegame.org
 * ---
 */
(function(exports, node) {

    var J = node.JSUS;

    exports.Matcher = Matcher;

    // ## Static methods.

    /**
     * ### Matcher.bye
     *
     * Symbol used to complete matching when partner is missing
     *
     * @see Matcher.matches
     */
    Matcher.bye = -1;

    /**
     * ### Matcher.missingId
     *
     * Symbol assigned to matching number without valid id
     *
     * @see Matcher.resolvedMatches
     */
    Matcher.missingId = 'bot';

    /**
     * ## Matcher.randomAssigner
     *
     * Assigns ids to positions randomly.
     *
     * @param {array} ids The ids to assign
     *
     * @return The sorted array
     *
     * @see JSUS.shuffle
     */
    Matcher.randomAssigner = function(ids) {
        return J.shuffle(ids);
    };

    /**
     * ### Matcher.linearAssigner
     *
     * Assigns ids to positions linearly.
     *
     * @param {array} ids The ids to assign
     *
     * @return The sorted array
     */
    Matcher.linearAssigner = function(ids) {
        return J.clone(ids);
    };

    /**
     * ## Matcher constructor
     *
     * Creates a new Matcher object
     *
     * @param {object} options Optional. Configuration options
     */
    function Matcher(options) {

        /**
         * ### Matcher.x
         *
         * The current round returned by Matcher.getMatch
         *
         * @see Matcher.getMatch
         */
        this.x = 0;

        /**
         * ### Matcher.y
         *
         * The next match in current round returned by Matcher.getMatch
         *
         * @see Matcher.getMatch
         */
        this.y = 0;

        /**
         * ### Matcher.matches
         *
         * Nested array of matches (with position-numbers)
         *
         * Nestes a new array for each round, and within each round
         * individual matches are also array. For example:
         *
         * ```javascript
         *
         * // Matching array.
         * [
         *
         *   // First round.
         *   [ [ p1, p2 ], [ p3, p4 ], ... ],
         *
         *   // Second round.
         *   [ [ p2, p3 ], [ p4, p1 ], ... ],
         *
         *   // Further rounds.
         * ];
         * ```
         *
         * @see Matcher.setMatches
         */
        this.matches = null;

        /**
         * ### Matcher.resolvedMatches
         *
         * Nested array of matches (with id-strings)
         *
         * Exactly Matcher.matches, but with with ids instead of numbers
         *
         * @see Matcher.matches
         * @see Matcher.setIds
         * @see Matcher.setAssignerCb
         * @see Matcher.match
         */
        this.resolvedMatches = null;

        /**
         * ### Matcher.resolvedMatchesById
         *
         * Array of maps id to partner, one map per round
         *
         * ```javascript
         *
         * // Matching array.
         * [
         *
         *   // First round.
         *   { p1: 'p2', p2: 'p1', p3: 'p4', p4: 'p3',  ... },
         *
         *   // Second round.
         *   { p2: 'p3', p3: 'p2', p4: 'p1', p1: 'p4',  ... },
         *
         *   // Further rounds.
         * ];
         * ```
         *
         * @see Matcher.resolvedMatches
         * @see Matcher.setIds
         * @see Matcher.match
         */
        this.resolvedMatchesById = null;

        /**
         * ### Matcher.ids
         *
         * Array ids to match
         *
         * @see Matcher.setIds
         */
        this.ids = null;

        /**
         * ### Matcher.ids
         *
         * Array mapping each ordinal position to an id
         *
         * @see Matcher.ids
         * @see Matcher.assignerCb
         */
        this.assignedIds = null;

        /**
         * ### Matcher.assignerCb
         *
         * Callback that assigns ids to positions
         *
         * An assigner callback must take as input an array of ids,
         * reorder them according to some criteria, and return it.
         * The order of the items in the returned array will be used to
         * match the numbers in the `matches` array.
         *
         * @see Matcher.ids
         * @see Matcher.matches
         * @see Matcher.assignedIds
         */
        this.assignerCb = Matcher.randomAssigner;

        /**
         * ## Matcher.missingId
         *
         * An id used to replace missing players ids
         */
        this.missingId = Matcher.missingId;

        /**
         * ## Matcher.missingId
         *
         * An id used by matching algorithms to complete unfinished matches
         */
        this.bye = Matcher.bye;

        // Init.
        this.init(options);
    }

    /**
     * ### Matcher.init
     *
     * Inits the Matcher instance
     *
     * @param {object} options
     */
    Matcher.prototype.init = function(options) {
        options = options || {};

        if (options.assignerCb) this.setAssignerCb(options.assignerCb);
        if (options.ids) this.setIds(options.ids);
        if (options.bye) this.bye = options.bye;
        if (options.missingId) this.missingId = options.missingId;
        if ('number' === typeof options.x) {
            if (options.x < 0) {
                throw new Error('Matcher.init: options.x cannot be negative.');
            }
            this.x = options.x;
        }
        if ('number' === typeof options.y) {
            if (options.y < 0) {
                throw new Error('Matcher.init: options.y cannot be negative.');
            }
            this.y = options.y;
        }
    };

    /**
     * ### Matcher.generateMatches
     *
     * Creates a matches array according to the chosen scheduling algorithm
     *
     * Throws an error if the selected algorithm is not found.
     *
     * @param {string} alg The chosen algorithm. Available: 'roundrobin'.
     *
     * @return {array} The array of matches
     */
    Matcher.prototype.generateMatches = function(alg) {
        var matches;
        if ('string' !== typeof alg) {
            throw new TypeError('Matcher.generateMatches: alg must be string.');
        }
        alg = alg.toLowerCase();
        if (alg !== 'roundrobin' && alg !== 'random') {
            throw new Error('Matcher.generateMatches: unknown algorithm: ' +
                            alg + '.');
        }

        matches = pairMatcher(alg, arguments[1], arguments[2]);
        this.setMatches(matches);
        return matches;
    };

    /**
     * ### Matcher.setMatches
     *
     * Sets the matches for current instance
     *
     * Resets resolvedMatches and resolvedMatchesById to null.
     *
     * @param {array} The array of matches
     *
     * @see this.matches
     */
    Matcher.prototype.setMatches = function(matches) {
        if (!J.isArray(matches) || !matches.length) {
            throw new TypeError('Matcher.setMatches: matches must be array.');
        }
        this.matches = matches;
        resetResolvedData(this);
    };

    /**
     * ### Matcher.setIds
     *
     * Sets the ids to be used for the matches
     *
     * @param {array} ids Array containing the id of the matches
     *
     * @see Matcher.ids
     */
    Matcher.prototype.setIds = function(ids) {
        if (!J.isArray(ids) || !ids.length) {
            throw new TypeError('Matcher.setIds: ids must be array.');
        }
        this.ids = ids;
        resetResolvedData(this);
    };

    /**
     * ### Matcher.assignIds
     *
     * Calls the assigner callback to assign existing ids to positions
     *
     * @param {array} ids Array containing the id of the matches
     *
     * @see Matcher.ids
     */
    Matcher.prototype.assignIds = function() {
        if (!J.isArray(this.ids) || !this.ids.length) {
            throw new Error('Matcher.assignIds: no id found.');
        }
        this.assignedIds = this.assignerCb(this.ids);
    };

    /**
     * ### Matcher.setAssignerCb
     *
     * Specify a callback to be used to assign existing ids to positions
     *
     * @param {function} cb The assigner cb
     *
     * @see Matcher.ids
     * @see Matcher.matches
     * @see Matcher.assignerCb
     */
    Matcher.prototype.setAssignerCb = function(cb) {
        if ('function' !== typeof cb) {
            throw new TypeError('Matcher.setAssignerCb: cb must be function.');
        }
        this.assignerCb = cb;
    };

    /**
     * ### Matcher.match
     *
     * Substitutes the ids to the matches
     *
     * Populates the objects `resolvedMatchesById` and `resolvedMatches`.
     *
     * It requires to have the matches array already set, or an error
     * will be thrown.
     *
     * If the ids have not been assigned, it will do it automatically.
     *
     * @see Matcher.assignIds
     * @see Matcher.resolvedMatchesById
     * @see Matcher.resolvedMatches
     */
    Matcher.prototype.match = function() {
        var i, lenI, j, lenJ, pair;
        var matched, matchedId, id1, id2;

        if (!J.isArray(this.matches) || !this.matches.length) {
            throw new Error('Matcher.match: no matches found.');
        }

        // Assign/generate ids if not done before.
        if (!this.assignedIds) {
            if (!J.isArray(this.ids) || !this.ids.length) {
                this.ids = J.seq(0, this.matches.length -1, 1, function(i) {
                    return '' + i;
                });
            }
            this.assignIds();
        }

        // Parse the matches array and creates two data structures
        // where the absolute position becomes the player id.
        i = -1, lenI = this.matches.length;
        matched = new Array(lenI);
        matchedId = new Array(lenI);
        for ( ; ++i < lenI ; ) {
            j = -1, lenJ = this.matches[i].length;
            matched[i] = [];
            matchedId[i] = {};
            for ( ; ++j < lenJ ; ) {
                id1 = null, id2 = null;
                pair = this.matches[i][j];
                // Resolve matches.
                id1 = importMatchItem(i, j,
                                      pair[0],
                                      this.assignedIds,
                                      this.missingId);
                id2 = importMatchItem(i, j,
                                      pair[1],
                                      this.assignedIds,
                                      this.missingId);
                // Create resolved matches.
                matched[i].push([id1, id2]);
                matchedId[i][id1] = id2;
                matchedId[i][id2] = id1;
            }
        }
        // Substitute matching-structure.
        this.resolvedMatches = matched;
        this.resolvedMatchesById = matchedId;
        // Set getMatch indexes to 0.
        this.x = 0;
        this.y = 0;
    };

    /**
     * ### Matcher.getMatch
     *
     * Returns the next match, or the specified match
     *
     * @param {number} x Optional. The x-th round. Default: the round
     * @param {number} y Optional. The y-th match within the x-th round
     *
     * @return {array} The next or requested match, or null if not found
     *
     * @see Matcher.x
     * @see Matcher.y
     * @see Matcher.resolvedMatches
     */
    Matcher.prototype.getMatch = function(x, y) {
        var nRows, nCols;
        // Check both x and y.
        if ('undefined' === typeof x && 'undefined' !== typeof y) {
            throw new Error('Matcher.getMatch: cannot specify y without x.');
        }
        // Check if there is any match yet.
        if (!J.isArray(this.resolvedMatches) || !this.resolvedMatches.length) {
            throw new Error('Matcher.getMatch: no resolved matches found.');
        }

        // Check x.
        if ('undefined' === typeof x) {
            x = this.x;
        }
        else if ('number' !== typeof x) {
            throw new TypeError('Matcher.getMatch: x must be number ' +
                                'or undefined.');
        }
        else if (x < 0) {
            throw new Error('Matcher.getMatch: x cannot be negative');
        }
        else if ('undefined' === typeof y) {
            // Return the whole row.
            return this.resolvedMatches[x];
        }

        nRows = this.matches.length - 1;
        if (x > nRows) return null;

        nCols = this.matches[x].length - 1;

        // Check y.
        if ('undefined' === typeof y) {
            y = this.y;
            if (y < nCols) {
                this.y++;
            }
            else {
                this.x++;
                this.y = 0;
            }
        }
        else if ('number' !== typeof y) {
            throw new TypeError('Matcher.getMatch: y must be number ' +
                                'or undefined.');
        }
        else if (y < 0) {
            throw new Error('Matcher.getMatch: y cannot be negative');
        }
        else if (y > nCols) {
            return null;
        }
        return this.resolvedMatches[x][y];
    };

    /**
     * ### Matcher.getMatchObject
     *
     * Returns all the matches of the next or requested round as key-value pairs
     *
     * @param {number} x Optional. The x-th round. Default: the round
     *
     * @return {object} The next or requested match, or null if not found
     *
     * @see Matcher.x
     * @see Matcher.resolvedMatchesById
     */
    Matcher.prototype.getMatchObject = function(x) {
        var nRows;

        // Check if there is any match yet.
        if (!J.isArray(this.resolvedMatches) || !this.resolvedMatches.length) {
            throw new Error('Matcher.getMatch: no resolved matches found.');
        }

        // Check x.
        if ('undefined' === typeof x) {
            x = this.x;
            this.x++;
        }
        else if ('number' !== typeof x) {
            throw new TypeError('Matcher.getMatch: x must be number ' +
                                'or undefined.');
        }
        else if (x < 0) {
            throw new Error('Matcher.getMatch: x cannot be negative');
        }

        nRows = this.matches.length - 1;
        if (x > nRows) return null;

        return this.resolvedMatchesById[x];
    };

    // ## Helper methods.

    /**
     * ### importMatchItem
     *
     * Handles importing items from the matches array
     *
     * Items in matches array must be numbers or strings. If numbers
     * they are translated into an id using the supplied map, otherwise
     * they are considered as already an id.
     *
     * Items that are not numbers neither strings will throw an error.
     *
     * @param {number} i The row-id of the item
     * @param {number} j The position in the row of the item
     * @param {string|number} item The item to check
     * @param {array} map The map of positions to ids
     * @param {string} miss The id of number that cannot be resolved in map
     *
     * @return {string} The resolved id of the item
     */
    function importMatchItem(i, j, item, map, miss) {
        if ('number' === typeof item) {
            return 'undefined' !== typeof map[item] ? map[item] : miss;
        }
        else if ('string' === typeof item) {
            return item;
        }
        throw new TypeError('Matcher.match: items can be only string or ' +
                            'number. Found: ' + item + ' at position ' +
                            i + ',' + j);
    }



    /**
     * ### resetResolvedData
     *
     * Resets resolved data of a matcher object
     *
     * @param {Matcher} matcher The matcher to reset
     */
    function resetResolvedData(matcher) {
        matcher.resolvedMatches = null;
        matcher.resolvedMatchesById = null;
    }



    /**
     * ### Matcher.roundRobin
     *
     *
     *
     * @return The round robin matches
     */
    Matcher.roundRobin = function(n, options) {
        return pairMatcher('roundrobin', n, options);
    };

    /**
     * ### pairMatcher
     *
     * Creates tournament schedules for different algorithms
     *
     * @param {string} alg The name of the algorithm
     *
     * @param {number|array} n The number of participants (>1) or
     *   an array containing the ids of the participants
     * @param {object} options Optional. Configuration object
     *   contains the following options:
     *
     *   - bye: identifier for dummy competitor. Default: -1.
     *   - skypeBye: flag whether players matched with the dummy
     *        competitor should be added or not. Default: true.
     *
     * @return {array} matches The matches according to the algorithm
     */
    function pairMatcher(alg, n, options) {
        var ps, matches, bye;
        var i, lenI, j, lenJ;
        var skipBye;

        if ('number' === typeof n && n > 1) {
            ps = J.seq(0, (n-1));
        }
        else if (J.isArray(n) && n.length > 1) {
            ps = n.slice();
            n = ps.length;
        }
        else {
            throw new TypeError('pairMatcher.' + alg + ': n must be ' +
                                'number > 1 or array of length > 1.');
        }
        options = options || {};
        matches = new Array(n-1);
        bye = 'undefined' !== typeof options.bye ? options.bye : -1;
        skipBye = options.skipBye || false;
        if (n % 2 === 1) {
            // Make sure we have even numbers.
            ps.push(bye);
            n += 1;
        }
        i = -1, lenI = n-1;
        for ( ; ++i < lenI ; ) {
            // Shuffle list of ids for random.
            if (alg === 'random') ps = J.shuffle(ps);
            // Create a new array for round i.
            matches[i] = [];
            j = -1, lenJ = n / 2;
            for ( ; ++j < lenJ ; ) {
                if (!skipBye || (ps[j] !== bye && ps[n - 1 - j] !== bye)) {
                    // Insert match.
                    matches[i].push([ps[j], ps[n - 1 - j]]);
                }
            }
            // Permutate for next round.
            ps.splice(1, 0, ps.pop());
        }
        return matches;
    }

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # NodeGameClient
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * nodeGame: Real-time social experiments in the browser.
 *
 * `nodeGame` is a free, open source javascript framework for online,
 * multiplayer games in the browser.
 */
(function(exports, parent) {

    "use strict";

    // ## Exposing Class
    exports.NodeGameClient = NodeGameClient;

    var ErrorManager = parent.ErrorManager,
        EventEmitterManager = parent.EventEmitterManager,
        GameMsgGenerator = parent.GameMsgGenerator,
        Socket = parent.Socket,
        Game = parent.Game,
        GameSession = parent.GameSession,
        Timer = parent.Timer,
        constants = parent.constants;

    /**
     * ## NodeGameClient constructor
     *
     * Creates a new NodeGameClient object
     */
    function NodeGameClient() {

        this.info('node: loading.');

        /**
         * ### node.nodename
         *
         * The name of this node, used in logging output
         *
         * Default: 'ng'
         */
        this.nodename = 'ng';

        /**
         * ### node.verbosity
         *
         * The minimum level for a log entry to be displayed as output
         *
         * Default: only warnings and errors are displayed
         */
        this.verbosity = constants.verbosity_levels.warn;

        /**
         * ### node.remoteVerbosity
         *
         * The minimum level for a log entry to be reported to the server
         *
         * Default: errors and warnings are reported
         */
        this.remoteVerbosity = constants.verbosity_levels.error;

        /**
         * ### node.remoteVerbosity
         *
         * Maps remotely logged messages to avoid infinite recursion
         *
         * In normal conditions this should always stay empty.
         */
        this.remoteLogMap = {};

        /**
         * ### node.errorManager
         *
         * Catches run-time errors
         *
         * In debug mode errors are re-thrown.
         */
        this.errorManager = new ErrorManager(this);

        /**
         * ### node.events
         *
         * Instance of the EventEmitterManager class
         *
         * Takes care of emitting the events and calling the
         * proper listener functions
         *
         * @see EventEmitter
         */
        this.events = new EventEmitterManager(this);

        /**
         * ### node.msg
         *
         * Factory of game messages
         *
         * @see GameMsgGenerator
         */
        this.msg = new GameMsgGenerator(this);


        /**
         * ### node.socket
         *
         * Instantiates the connection to a nodeGame server
         *
         * @see GameSocketClient
         */
        this.socket = new Socket(this);

        /**
         * ### node.session
         *
         * Contains a reference to all session variables
         *
         * Session variables can be saved and restored at a later stage
         *
         * @experimental
         */
        this.session = new GameSession(this);

        /**
         * ### node.player
         * Instance of node.Player
         *
         * Contains information about the player
         *
         * @see PlayerList.Player
         */
        this.player = { placeholder: true };

        /**
         * ### node.game
         *
         * Instance of node.Game
         *
         * @see Game
         */
        this.game = new Game(this);

        /**
         * ### node.timer
         *
         * Instance of node.Timer
         *
         * @see Timer
         */
        this.timer = new Timer(this);

        /**
         * ### node.store
         *
         * Makes the nodeGame session persistent, saving it
         * to the browser local database or to a cookie
         *
         * @see shelf.js
         */
        this.store = function() {};

        /**
         * ### node.conf
         *
         * A reference to the current nodegame configuration
         *
         * @see NodeGameClient.setup
         */
        this.conf = {};

        /**
         * ### node.support
         *
         * A collection of features that are supported by the current browser
         */
        this.support = {};

        // ## Configuration functions.

        this.info('node: adding emit/on functions.');

        /**
         * ### NodeGameClient.emit
         *
         * Emits an event locally on all registered event handlers
         *
         * The first parameter be the name of the event as _string_,
         * followed by any number of parameters that will be passed to the
         * handler callback.
         *
         * @see NodeGameClient.emitAsync
         * @see EventEmitterManager.emit
         */
        this.emit = this.events.emit;

        /**
         * ### NodeGameClient.emitAsync
         *
         * Emits an event locally on all registered event handlers
         *
         * Unlike normal emit, it does not return a value.
         *
         * @see NodeGameClient.emit
         * @see EventEmitterManager.emitSync
         */
        this.emitAsync = this.events.emitAsync;

        /**
         * ### NodeGameClient.on
         *
         * Registers an event listener on the active event emitter
         *
         * Different event emitters are active during the game. For
         * example, before a game is started, e.g. in the init
         * function of the game object, the `game` event emitter is
         * active. Events registered with the `game` event emitter
         * stay valid throughout the whole game. Listeners registered
         * after the game is started will be removed after the game
         * has advanced to its next stage or step.
         *
         * @param {string} event The name of the event
         * @param {function} listener The callback function
         *
         * @see NodeGameClient.off
         */
        this.on = function(event, listener) {
            var ee;
            ee = this.getCurrentEventEmitter();
            ee.on(event, listener);
        };

        /**
         * ### NodeGameClient.once
         *
         * Registers an event listener that will be removed after its first call
         *
         * @param {string} event The name of the event
         * @param {function} listener The callback function
         *
         * @see NodeGameClient.on
         * @see NodeGameClient.off
         */
        this.once = function(event, listener) {
            var ee;
            ee = this.getCurrentEventEmitter();
            ee.once(event, listener);
        };

        /**
         * ### NodeGameClient.off
         *
         * Deregisters one or multiple event listeners
         *
         * @param {string} event The name of the event
         * @param {function} listener The callback function
         *
         * @see NodeGameClient.on
         * @see NodeGameClient.EventEmitter.remove
         */
        this.off = function(event, func) {
            return this.events.remove(event, func);
        };

        // Configuration.

        // Setup functions.
        this.addDefaultSetupFunctions();
        // Aliases.
        this.addDefaultAliases();
        // Listeners.
        this.addDefaultIncomingListeners();
        this.addDefaultInternalListeners();

        this.info('node: object created.');
    }

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports
 ,  'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Log
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` logging module
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;
    var constants = parent.constants;

    var LOG = constants.target.LOG;

    /**
     * ### NodeGameClient.log
     *
     * Default nodeGame standard out, override to redirect
     *
     * Logs entries are displayed to the console if their level is
     * smaller than `this.verbosity`.
     *
     * Logs entries are forwarded to the server if their level is
     * smaller than `this.remoteVerbosity`.
     *
     * @param {string} txt The text to output
     * @param {string|number} level Optional. The verbosity level of this log.
     *   Default: 'warn'
     * @param {string} prefix Optional. A text to display at the beginning of
     *   the log entry. Default: 'ng> '
     */
    NGC.prototype.log = function(txt, level, prefix) {
        var numLevel;
        if ('undefined' === typeof txt) return;

        level  = level || 'info';
        prefix = 'undefined' === typeof prefix ? this.nodename + '> ' : prefix;

        numLevel = constants.verbosity_levels[level];

        if (this.verbosity >= numLevel) {
            console.log(prefix + txt);
        }
        if (this.remoteVerbosity >= numLevel) {
            // We need to avoid creating errors here,
            // otherwise we enter an infinite loop.
            if (this.socket.isConnected() && !this.player.placeholder) {
                if (!this.remoteLogMap[txt]) {
                    this.remoteLogMap[txt] = true;
                    this.socket.send(this.msg.create({
                        target: LOG,
                        text: level,
                        data: txt,
                        to: 'SERVER'
                    }));
                    delete this.remoteLogMap[txt];
                }
            }
        }
    };

    /**
     * ### NodeGameClient.info
     *
     * Logs an INFO message
     */
    NGC.prototype.info = function(txt, prefix) {
        prefix = this.nodename + (prefix ? '|' + prefix : '') + '> info - ';
        this.log(txt, 'info', prefix);
    };

    /**
     * ### NodeGameClient.warn
     *
     * Logs a WARNING message
     */
    NGC.prototype.warn = function(txt, prefix) {
        prefix = this.nodename + (prefix ? '|' + prefix : '') + '> warn - ';
        this.log(txt, 'warn', prefix);
    };

    /**
     * ### NodeGameClient.err
     *
     * Logs an ERROR message
     */
    NGC.prototype.err = function(txt, prefix) {
        prefix = this.nodename + (prefix ? '|' + prefix : '') + '> error - ';
        this.log(txt, 'error', prefix);
    };

    /**
     * ### NodeGameClient.silly
     *
     * Logs a SILLY message
     */
    NGC.prototype.silly = function(txt, prefix) {
        prefix = this.nodename + (prefix ? '|' + prefix : '') + '> silly - ';
        this.log(txt, 'silly', prefix);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Setup
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` configuration module
 */

(function(exports, node) {

    "use strict";

    // ## Global scope

    var J = node.JSUS;

    var NGC = node.NodeGameClient;

    // TODO: check this
    var frozen = false;

    /**
     * ### node.setup
     *
     * Setups the nodeGame object
     *
     * Configures a specific feature of nodeGame and and stores
     * the settings in `node.conf`.
     *
     * Accepts any number of extra parameters that are passed to the callback
     * function.
     *
     * See the examples folder for all available configuration options.
     *
     * @param {string} property The feature to configure
     * @return {boolean} TRUE, if configuration is successful
     *
     * @see node.setup.register
     */
    NGC.prototype.setup = function(property) {
        var res, func;

        if ('string' !== typeof property) {
            throw new Error('node.setup: expects a string as first parameter.');
        }

        if (frozen) {
            throw new Error('node.setup: nodeGame configuration is frozen. ' +
                            'Calling setup is not allowed.');
        }

        if (property === 'register') {
            throw new Error('node.setup: cannot setup property "register".');
        }

        func = this.setup[property];
        if (!func) {
            throw new Error('node.setup: no such property to configure: ' +
                            property + '.');
        }

        // Setup the property using rest of arguments:
        res = func.apply(this, Array.prototype.slice.call(arguments, 1));

        if (property !== 'nodegame') {
            this.conf[property] = res;
        }

        return true;
    };

    /**
     * ### node.registerSetup
     *
     * Registers a configuration function
     *
     * Setup functions can be invoked remotely with in.say.SETUP messages
     * and the name property stated in `msg.text`.
     *
     * @param {string} property The feature to configure
     * @param {mixed} options The value of the option to configure
     *
     * @see node.setup
     */
    NGC.prototype.registerSetup = function(property, func) {
        var that;
        if ('string' !== typeof property) {
            throw new TypeError('node.registerSetup: property must be string.');
        }
        if ('function' !== typeof func) {
            throw new TypeError('node.registerSetup: func must be function.');
        }
        that = this;
        this.setup[property] = function() {
            that.info('setup ' + property + '.');
            return func.apply(that, arguments);
        };
    };

    /**
     * ### node.deregisterSetup
     *
     * Registers a configuration function
     *
     * @param {string} feature The name of the setup feature to deregister
     *
     * @see node.setup
     */
    NGC.prototype.deregisterSetup = function(feature) {
        if ('string' !== typeof feature) {
            throw new TypeError('node.deregisterSetup: property must ' +
                                'be string.');
        }
        if (!this.setup[feature]) {
            this.warn('node.deregisterSetup: feature ' + feature + ' not ' +
                      'previously registered.');
            return;
        }
        this.setup[feature] = null;
    };

    /**
     * ### node.remoteSetup
     *
     * Sends a setup configuration to a connected client
     *
     * Accepts any number of extra parameters that are sent as option values.
     *
     * @param {string} feature The feature to configure
     * @param {string|array} to The id of the remote client to configure
     *
     * @return{boolean} TRUE, if configuration is successful
     *
     * @see node.setup
     * @see JSUS.stringifyAll
     */
    NGC.prototype.remoteSetup = function(feature, to) {
        var msg, payload, len;

        if ('string' !== typeof feature) {
            throw new TypeError('node.remoteSetup: feature must be string.');
        }
        if ('string' !== typeof to && !J.isArray(to)) {
            throw new TypeError('node.remoteSetup: to must be string or ' +
                                'array.');
        }
        len = arguments.length;
        if (len > 2) {
            if (len === 3) payload = [arguments[2]];
            else if (len === 4) payload = [arguments[2], arguments[3]];
            else {
                payload = new Array(len - 2);
                for (i = 2; i < len; i++) {
                    payload[i - 2] = arguments[i];
                }
            }
            payload = J.stringifyAll(payload);

            if (!payload) {
                this.err('node.remoteSetup: an error occurred while ' +
                         'stringifying payload.');
                return false;
            }
        }

        msg = this.msg.create({
            target: this.constants.target.SETUP,
            to: to,
            text: feature,
            data: payload
        });

        return this.socket.send(msg);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Alias
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` aliasing module
 */
(function(exports, node) {

    "use strict";

    // ## Global scope

    var J = node.JSUS;

    var NGC = node.NodeGameClient;

    /**
     * ### node.alias
     *
     * Creates event listeners aliases
     *
     * This method creates a new property to the `node.on` object named
     * after the alias. The alias can be used as a shortcut to register
     * to new listeners on the given events.
     *
     *
     * ```javascript
     *   // The node.on.data alias example with modifier function
     *   // only DATA msg with the right label will be fired.
     *   this.alias('data', ['in.say.DATA', 'in.set.DATA'], function(text, cb) {
     *       return function(msg) {
     *           if (msg.text === text) {
     *               cb.call(that.game, msg);
     *           }
     *       };
     *   });
     *
     *  node.on.data('myLabel', function(){ ... };
     *  node.once.data('myLabel', function(){ ... };
     * ```
     *
     * @param {string} alias The name of alias
     * @param {string|array} events The event/s under which the listeners
     *   will be registered
     * @param {function} modifier Optional. A function that makes a closure
     *   around its own input parameters, and returns a function that will
     *   actually be invoked when the aliased event is fired.
     */
    NGC.prototype.alias = function(alias, events, modifier) {
        var that;
        if ('string' !== typeof alias) {
            throw new TypeError('node.alias: alias must be string.');
        }
        if ('string' === typeof events) {
            events = [events];
        }
        if (!J.isArray(events)) {
            throw new TypeError('node.alias: events must be array or string.');
        }
        if (modifier && 'function' !== typeof modifier) {
            throw new TypeError(
                'node.alias: modifier must be function or undefined.');
        }

        that = this;
        if (!J.isArray(events)) events = [events];

        this.on[alias] = function(func) {
            // If set, we use the callback returned by the modifier.
            // Otherwise, we assume the first parameter is the callback.
            if (modifier) {
                func = modifier.apply(that.game, arguments);
            }
            J.each(events, function(event) {
                that.on(event, function() {
                    func.apply(that.game, arguments);
                });
            });
        };

        this.once[alias] = function(func) {
            // If set, we use the callback returned by the modifier.
            // Otherwise, we assume the first parameter is the callback.
            if (modifier) {
                func = modifier.apply(that.game, arguments);
            }
            J.each(events, function(event) {
                that.once(event, function() {
                    func.apply(that.game, arguments);
                });
            });
        };
    };
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Connect
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` connect module
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    /**
     * ### node.connect
     *
     * Establishes a connection with a nodeGame server
     *
     * Depending on the type of socket used (Direct or IO), the
     * channel parameter might be optional.
     *
     * If node is executed in the browser additional checks are performed:
     *
     * 1. If channel does not begin with `http://`, then `window.location.host`
     *    will be added in front of channel to avoid cross-domain errors
     *    (as of Socket.io >= 1).
     *
     * 2. If no socketOptions.query parameter is specified any query
     *    parameters found in `location.search(1)` will be passed.
     *
     * @param {string} channel Optional. The channel to connect to
     * @param {object} socketOptions Optional. A configuration object for
     *   the socket connect method.
     *
     * @emit SOCKET_CONNECT
     * @emit PLAYER_CREATED
     * @emit NODEGAME_READY
     */
    NGC.prototype.connect = function(channel, socketOptions) {
        // Browser adjustements.
        if ('undefined' !== typeof window) {
            // If no channel is defined use the pathname, and assume
            // that the name of the game is also the name of the endpoint.
            if ('undefined' === typeof channel) {
                if (window.location && window.location.pathname) {
                    channel = window.location.pathname;
                    // Making sure it is consistent with what we expect.
                    if (channel.charAt(0) !== '/') channel = '/' + channel;
                    if (channel.charAt(channel.length-1) === '/') {
                        channel = channel.substring(0, channel.length-1);
                    }
                }
            }
            // Make full path otherwise socket.io will complain.
            if (channel && channel.substr(0,7) !== 'http://') {
                if (window.location && window.location.host) {
                    channel = 'http://' + window.location.host + channel;
                }
            }
            // Pass along any query options. (?clientType=...).
            if (!socketOptions || (socketOptions && !socketOptions.query)) {
                if (('undefined' !== typeof location) && location.search) {
                    socketOptions = socketOptions || {};
                    socketOptions.query = location.search.substr(1);
                }
            }
        }
        this.socket.connect(channel, socketOptions);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Player
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Player related functions
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient,
    Player = parent.Player,
    constants = parent.constants;

    /**
     * ### NodeGameClient.createPlayer
     *
     * Creates player object and places it in node.player
     *
     * @param {object} player A player object with a valid id property
     * @return {object} The player object
     *
     * @see node.setup.player
     * @emit PLAYER_CREATED
     */
    NGC.prototype.createPlayer = function(player) {
        if (this.player &&
            this.player.stateLevel > constants.stateLevels.STARTING &&
            this.player.stateLevel !== constants.stateLevels.GAMEOVER) {
            throw new Error('node.createPlayer: cannot create player ' +
                            'while game is running.');
        }
        if (this.game.pl.exist(player.id)) {
            throw new Error('node.createPlayer: id already found in ' +
                            'playerList: ' + player.id);
        }
        // Cast to player (will perform consistency checks)
        player = new Player(player);
        player.stateLevel = this.player.stateLevel;
        player.stageLevel = this.player.stageLevel;


        this.player = player;
        this.emit('PLAYER_CREATED', this.player);

        return this.player;
    };

    /**
     * ### NodeGameClient.setLanguage
     *
     * Sets the language for a playerList
     *
     * @param {object} language Object describing language.
     *   Needs shortName property.
     * @param {boolean} prefix Optional. If TRUE, the window uri prefix is
     *   set to the value of lang.path. node.window must be defined,
     *   otherwise a warning is shown. Default, FALSE.
     *
     * @return {object} The language object
     *
     * @see node.setup.lang
     * @see GameWindow.setUriPrefix
     *
     * @emit LANGUAGE_SET
     */
    NGC.prototype.setLanguage = function(language, prefix) {
        if ('object' !== typeof language) {
            throw new TypeError('node.setLanguage: language must be object.');
        }
        if ('string' !== typeof language.shortName) {
            throw new TypeError(
                'node.setLanguage: language.shortName must be string.');
        }
        this.player.lang = language;
        if (!this.player.lang.path) {
            this.player.lang.path = language.shortName + '/';
        }

        if (prefix) {
            if ('undefined' !== typeof this.window) {
                this.window.setUriPrefix(this.player.lang.path);
            }
            else {
                node.warn('node.setLanguage: prefix is true, but no window ' +
                          'found.');
            }
        }

        this.emit('LANGUAGE_SET');

        return this.player.lang;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Events
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` events handling
 */

(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    var GameStage = parent.GameStage;

    var STAGE_INIT = parent.constants.stateLevels.STAGE_INIT;
    var STAGE_EXIT = parent.constants.stateLevels.STAGE_EXIT;

    /**
     * ### NodeGameClient.getCurrentEventEmitter
     *
     * Returns the currently active event emitter
     *
     * The following event emitters are active:
     *
     *  - NodeGame (ng): before a game is created or started.
     *    Events registered here never deleted.
     *
     *  - Game (game): during the initialization of a game
     *    Events registered here are deleted when a new game
     *    is created.
     *
     *  - Stage (stage): during the initialization of a stage.
     *    Events registered here are deleted when entering a
     *    new stage.
     *
     *  - Step (step): during the initialization of a step.
     *    Events registered here are deleted when entering a
     *    new step.
     *
     * @return {EventEmitter} The current event emitter
     *
     * @see EventEmitter
     * @see EventEmitterManager
     */
    NGC.prototype.getCurrentEventEmitter = function() {
        var gameStage, stateL;

        // NodeGame default listeners
        if (!this.game) return this.events.ee.ng;
        gameStage = this.game.getCurrentGameStage();
        if (!gameStage) return this.events.ee.ng;

        // Game listeners.
        if ((GameStage.compare(gameStage, new GameStage()) === 0 )) {
            return this.events.ee.game;
        }

        // Stage listeners.
        stateL = this.game.getStateLevel();
        if (stateL === STAGE_INIT || stateL === STAGE_EXIT) {
            return this.events.ee.stage;
        }

        // Step listeners.
        return this.events.ee.step;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # SAY, SET, GET, DONE
 *
 * Implementation of node.[say|set|get|done].
 *
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;
    var J = parent.JSUS;

    var GETTING_DONE = parent.constants.stageLevels.GETTING_DONE;

    /**
     * ### NodeGameClient.say
     *
     * Sends a DATA message to a specified recipient
     *
     * @param {string} text The label associated to the msg
     * @param {string} to The recipient of the msg.
     * @param {mixed} payload Optional. Addional data to send along
     *
     * @return {boolean} TRUE, if SAY message is sent
     */
    NGC.prototype.say = function(label, to, payload) {
        var msg;
        if ('string' !== typeof label) {
            throw new TypeError('node.say: label must be string.');
        }
        if (to && 'string' !== typeof to) {
            throw new TypeError('node.say: to must be string or undefined.');
        }
        msg = this.msg.create({
            target: this.constants.target.DATA,
            to: to,
            text: label,
            data: payload
        });
        return this.socket.send(msg);
    };

    /**
     * ### NodeGameClient.set
     *
     * Stores an object in the server's memory
     *
     * @param {object|string} The value to set
     * @param {string} to Optional. The recipient. Default `SERVER`
     * @param {string} text Optional. The text property of the message.
     *   If set, it allows one to define on.data listeners on receiver.
     *   Default: undefined
     *
     * @return {boolean} TRUE, if SET message is sent
     */
    NGC.prototype.set = function(o, to, text) {
        var msg, tmp;
        if ('string' === typeof o) {
            tmp = o, o = {}, o[tmp] = true;
        }
        else if ('object' !== typeof o) {
            throw new TypeError('node.set: o must be object or string.');
        }
        msg = this.msg.create({
            action: this.constants.action.SET,
            target: this.constants.target.DATA,
            to: to || 'SERVER',
            reliable: 1,
            data: o
        });
        if (text) msg.text = text;
        return this.socket.send(msg);
    };

    /**
     * ### NodeGameClient.get
     *
     * Sends a GET message to a recipient and listen to the reply
     *
     * The receiver of a GET message must be implement an *internal* listener
     * of the type "get.<label>", and return the value requested. For example,
     *
     * ```javascript
     *
     * // Sender.
     * node.get('myLabel, function(reply) {});
     *
     * // Receiver.
     * node.on('get.myLabel', function(msg) { return 'OK'; });
     *
     * ```
     *
     * The label string cannot contain any "." (dot) characther for security
     * reason.
     *
     * The listener function is removed immediately after its first execution.
     * To allow multiple execution, it is possible to specify a positive timeout
     * after which the listener will be removed, or specify the timeout as -1,
     * and in this case the listener will not be removed at all.
     *
     * If a timeout is specified is possible to specify also a timeout-callback,
     * which will be executed if no was reply was received until the end of
     * the timeout.
     *
     * If the socket is not able to send the GET message for any reason, the
     * listener function is never registered.
     *
     * Important: depending on the server settings, GET messages might
     * disclose the real ID of the sender. For this reason, GET messages from
     * admins to players should be used only if necessary.
     *
     * @param {string} key The label of the GET message
     * @param {function} cb The callback function to handle the return message
     * @param {string} to Optional. The recipient of the msg. Default: SERVER
     * @param {object} options Optional. Extra options as follows:
     *
     *      - {number} timeout The number of milliseconds after which
     *            the listener will be removed.
     *      - {function} timeoutCb A callback function to call if
     *            the timeout is fired (no reply recevied)
     *      - {boolean} executeOnce TRUE if listener should be removed after
     *            one execution. It will also terminate the timeout, if set
     *      - {mixed} data Data field of the GET msg
     *
     * @return {boolean} TRUE, if GET message is sent and listener registered
     */
    NGC.prototype.get = function(key, cb, to, options) {
        var msg, g, ee;
        var that, res;
        var timer, success;
        var data, timeout, timeoutCb, executeOnce;

        if ('string' !== typeof key) {
            throw new TypeError('node.get: key must be string.');
        }

        if (key === '') {
            throw new TypeError('node.get: key cannot be empty.');
        }

        if (key.split('.') > 1) {
            throw new TypeError(
                'node.get: key cannot contain the dot "." character.');
        }

        if ('function' !== typeof cb) {
            throw new TypeError('node.get: cb must be function.');
        }

        if ('undefined' === typeof to) {
            to = 'SERVER';
        }

        if ('string' !== typeof to) {
            throw new TypeError('node.get: to must be string or undefined.');
        }

        if (options) {
            if ('object' !== typeof options) {
                throw new TypeError('node.get: options must be object ' +
                                    'or undefined.');
            }

            timeout = options.timeout;
            timeoutCb = options.timeoutCb;
            data = options.data;
            executeOnce = options.executeOnce;

            if ('undefined' !== typeof timeout) {
                if ('number' !== typeof timeout) {
                    throw new TypeError('node.get: options.timeout must be ' +
                                        'number.');
                }
                if (timeout < 0 && timeout !== -1 ) {
                    throw new TypeError('node.get: options.timeout must be ' +
                                        'positive, 0, or -1.');
                }
            }

            if (timeoutCb && 'function' !== typeof timeoutCb) {
                throw new TypeError('node.get: options.timeoutCb must be ' +
                                    'function or undefined.');
            }

        }

        msg = this.msg.create({
            action: this.constants.action.GET,
            target: this.constants.target.DATA,
            to: to,
            reliable: 1,
            text: key,
            data: data
        });

        // TODO: check potential timing issues. Is it safe to send the GET
        // message before registering the relate listener? (for now yes)
        res = this.socket.send(msg);

        // The key is updated with the id of the message, so
        // that only those who received it can reply.
        key = key + '_' + msg.id;

        if (res) {
            that = this;
            ee = this.getCurrentEventEmitter();

            // If a timeout is set the listener is removed independently,
            // of its execution after the timeout is fired.
            // If timeout === -1, the listener is never removed.
            if (timeout > 0) {
                timer = this.timer.createTimer({
                    milliseconds: timeout,
                    timeup: function() {
                        ee.remove('in.say.DATA', g);
                        that.timer.destroyTimer(timer);
                        // success === true we have received a reply.
                        if (timeoutCb && !success) timeoutCb.call(that.game);
                    }
                });
                timer.start();
            }

            // Listener function. If a timeout is not set, the listener
            // will be removed immediately after its execution.
            g = function(msg) {
                if (msg.text === key) {
                    success = true;
                    cb.call(that.game, msg.data);
                    if (executeOnce) {
                        if ('undefined' !== typeof timer) {
                            that.timer.destroyTimer(timer);
                        }
                    }
                }
            };

            if (executeOnce) {
                ee.once('in.say.DATA', g);
            }
            else {
                ee.on('in.say.DATA', g);
            }
        }
        return res;
    };

    /**
     * ### NodeGameClient.done
     *
     * Marks the end of a game step
     *
     * It performs the following sequence of operations:
     *
     *  - Checks if `done` was already called in the same stage, and
     *      if so returns with a warning.
     *  - Checks it there a `done` hanlder in the step, and if so
     *      executes. If the return value is falsy procedure stops.
     *  - Marks the step as `willBeDone` and no further calls to
     *      `node.done` are allowed in the same step.
     *  - Creates and send a SET message to server containing the time
     *      passed from the beginning of the step, if `done` was a timeup
     *      event, passing along any other parameter given to `node.done`
     *  - Asynchronously emits 'DONE', which starts the procedure to
     *      evaluate the step rule, and eventually to enter into the next
     *      step.
     *
     * Technical note. The done event needs to be asynchronous because
     * it can be triggered by the callback of a load frame, and in
     * this case it must be emitted last.
     *
     * All input parameters are passed along to `node.emit`.
     *
     * @return {boolean} TRUE, if the method is authorized, FALSE otherwise
     *
     * @see NodeGameClient.emit
     * @emits DONE
     */
    NGC.prototype.done = function() {
        var that, game, doneCb, len, i;
        var arg1, arg2, args, args2;
        var stepTime, timeup;
        var autoSet;

        // Get step execution time.
        stepTime = this.timer.getTimeSince('step');

        game = this.game;
        if (game.willBeDone || game.getStageLevel() >= GETTING_DONE) {
            this.err('node.done: done already called in this step.');
            return false;
        }

        // Evaluating `done` callback if any.
        doneCb = game.plot.getProperty(game.getCurrentGameStage(), 'done');

        // A done callback can manipulate arguments, add new values to
        // send to server, or even halt the procedure if returning false.
        if (doneCb) {
            args = doneCb.apply(game, arguments);

            // If a `done` callback returns false, exit.
            if ('boolean' === typeof args) {
                if (args === false) {
                    this.silly('node.done: done callback returned false.');
                    return false;
                }
                else {
                    console.log('***');
                    console.log('node.done: done callback returned true. ' +
                                'For retro-compatibility the value is not ' +
                                'processed and sent to server. If you wanted ' +
                                'to return "true" return an array: [true]. ' +
                                'In future releases any value ' +
                                'different from false and undefined will be ' +
                                'treated as a done argument and processed.');
                    console.log('***');

                    args = null;
                }
            }
            // If a value was provided make it an array, it is it not one.
            else if ('undefined' !== typeof args &&
                Object.prototype.toString.call(args) !== '[object Array]') {

                args = [args];
            }
        }

        // Build set object (will be sent to server).
        // Back-compatible checks.
        if (game.timer && game.timer.isTimeup) {
            timeup = game.timer.isTimeup();
        }

        autoSet = game.plot.getProperty(game.getCurrentGameStage(), 'autoSet');

        // Keep track that the game will be done (done is asynchronous)
        // to avoid calling `node.done` multiple times in the same stage.
        game.willBeDone = true;

        // Args can be the original arguments array, or
        // the one returned by the done callback.
        // TODO: check if it safe to copy arguments by reference.
        if (!args) args = arguments;
        len = args.length;
        that = this;
        // The arguments object must not be passed or leaked anywhere.
        // Therefore, we recreate an args array here. We have a different
        // timeout in a different branch for optimization.
        switch(len) {

        case 0:
            if (autoSet) {
                this.set(getSetObj(stepTime, timeup), 'SERVER', 'done');
            }
            setTimeout(function() { that.events.emit('DONE'); }, 0);
            break;
        case 1:
            arg1 = args[0];
            if (autoSet) {
                this.set(getSetObj(stepTime, timeup, arg1), 'SERVER', 'done');
            }
            setTimeout(function() { that.events.emit('DONE', arg1); }, 0);
            break;
        case 2:
            arg1 = args[0], arg2 = args[1];
            // Send two setObjs.
            if (autoSet) {
                this.set(getSetObj(stepTime, timeup, arg1), 'SERVER', 'done');
                this.set(getSetObj(stepTime, timeup, arg2), 'SERVER', 'done');
            }
            setTimeout(function() { that.events.emit('DONE', arg1, arg2); }, 0);
            break;
        default:
            args2 = new Array(len+1);
            args2[0] = 'DONE';
            for (i = 0; i < len; i++) {
                args2[i+1] = args[i];
                if (autoSet) {
                    this.set(getSetObj(stepTime, timeup, args2[i+1]),
                             'SERVER', 'done');
                }
            }
            setTimeout(function() {
                that.events.emit.apply(that.events, args2);
            }, 0);
        }

        return true;
    };

    // ## Helper methods

    function getSetObj(time, timeup, arg) {
        var o;
        o = { time: time , timeup: timeup };
        if ('object' === typeof arg) J.mixin(o, arg);
        else if ('string' === typeof arg || 'number' === typeof arg) {
            o[arg] = true;
        }
        o.done = true;
        return o;
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Commands
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` commands
 */
(function(exports, node) {

    "use strict";

    var NGC = node.NodeGameClient;
    var J = node.JSUS;

    /**
     * ### NodeGameClient.redirect
     *
     * Redirects a player to the specified url
     *
     * Works only if it is a monitor client to send
     * the message, i.e. players cannot redirect each
     * other.
     *
     * Examples
     *
     *  // Redirect to http://mydomain/mygame/missing_auth
     *  node.redirect('missing_auth', 'xxx');
     *
     *  // Redirect to external urls
     *  node.redirect('http://www.google.com');
     *
     * @param {string} url the url of the redirection
     * @param {string} who A player id or any other valid _to_ field
     */
    NGC.prototype.redirect = function(url, who) {
        var msg;
        if ('string' !== typeof url) {
            throw new TypeError('node.redirect: url must be string.');
        }
        if ('string' !== typeof who) {
            throw new TypeError('node.redirect: who must be string.');
        }
        msg = this.msg.create({
            target: this.constants.target.REDIRECT,
            data: url,
            to: who
        });
        this.socket.send(msg);
    };

    /**
     * ### NodeGameClient.remoteCommand
     *
     * Executes a game command on a client
     *
     * By default, only admins can send use this method, as messages
     * sent by players will be filtered out by the server.
     *
     * @param {string} command The command to execute
     * @param {string} to The id of the player to command
     */
    NGC.prototype.remoteCommand = function(command, to, options) {
        var msg;
        if ('string' !== typeof command) {
            throw new TypeError('node.remoteCommand: command must be string.');
        }
        if (!node.constants.gamecommands[command]) {
            throw new Error('node.remoteCommand: unknown command: ' +
                            command + '.');
        }
        if ('string' !== typeof to && !J.isArray(to)) {
            throw new TypeError('node.remoteCommand: to must be string ' +
                                'or array.');
        }

        msg = this.msg.create({
            target: this.constants.target.GAMECOMMAND,
            text: command,
            data: options,
            to: to
        });
        this.socket.send(msg);
    };

    /**
     * ### NodeGameClient.remoteAlert
     *
     * Displays an alert message in the screen of the client
     *
     * Message is effective only if the client has a _window_ object
     * with a global _alert_ method.
     *
     * @param {string} text The text of of the messagex
     * @param {string} to The id of the player to alert
     */
    NGC.prototype.remoteAlert = function(text, to) {
        var msg;
        if ('string' !== typeof text) {
            throw new TypeError('node.remoteAlert: text must be string.');
        }
        if ('undefined' === typeof to) {
            throw new TypeError('node.remoteAlert: to must be string.');
        }
        msg = this.msg.create({
            target: this.constants.target.ALERT,
            text: text,
            to: to
        });
        this.socket.send(msg);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # Extra
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` extra functions
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    /**
     * ### node.env
     *
     * Executes a block of code conditionally to nodeGame environment variables
     *
     * Notice: the value of the requested variable is returned after
     * the execution of the callback, that could modify it.
     *
     * @param {string} env The name of the environment
     * @param {function} func Optional The callback to execute conditionally
     * @param {object} ctx Optional. The context of execution
     * @param {array} params Optional. An array of parameters for the callback
     *
     * @see node.setup.env
     * @see node.clearEnv
     */
    NGC.prototype.env = function(env, func, ctx, params) {
        var envValue;
        if ('string' !== typeof env) {
            throw new TypeError('node.env: env must be string.');
        }
        if (func && 'function' !== typeof func) {
            throw new TypeError('node.env: func must be function ' +
                                'or undefined.');
        }
        if (ctx && 'object' !== typeof ctx) {
            throw new TypeError('node.env: ctx must be object or undefined.');
        }
        if (params && 'object' !== typeof params) {
            throw new TypeError('node.env: params must be array-like ' +
                                'or undefined.');
        }

        envValue = this.env[env];
        // Executes the function conditionally to _envValue_.
        if (func && envValue) {
            ctx = ctx || this;
            params = params || [];
            func.apply(ctx, params);
        }
        // Returns the value of the requested _env_ variable in any case.
        return envValue;
    };

    /**
     * ### node.clearEnv
     *
     * Deletes all previously set enviroment variables
     *
     * @see node.env
     * @see node.setup.env
     */
    NGC.prototype.clearEnv = function() {
        for (var i in this.env) {
            if (this.env.hasOwnProperty(i)) {
                delete this.env[i];
            }
        }
    };



})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # GetJSON
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` JSON fetching
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    /**
     * ### NodeGameClient.getJSON
     *
     * Retrieves JSON data via JSONP from one or many URIs
     *
     * The dataCb callback will be called every time the data from one of the
     * URIs has been fetched.
     *
     * This method creates a temporary entry in the node instance,
     * `node.tempCallbacks`, to store a temporary internal callback.
     * This field is deleted again after the internal callbacks are done.
     *
     * @param {array|string} uris The URI(s)
     * @param {function} dataCb The function to call with the data
     * @param {function} doneCb Optional. The function to call after all the
     *   data has been retrieved
     */
    NGC.prototype.getJSON = function(uris, dataCb, doneCb) {
        var that;
        var loadedCount;
        var currentUri, uriIdx;
        var tempCb, cbIdx;
        var scriptTag, scriptTagName;

        // Check input:
        if ('string' === typeof uris) {
            uris = [ uris ];
        }
        else if ('object' !== typeof uris || 'number' !== typeof uris.length) {
            throw new Error('NGC.getJSON: uris must be an array or a string');
        }

        if ('function' !== typeof dataCb) {
            throw new Error('NGC.getJSON: dataCb must be a function');
        }

        if ('undefined' !== typeof doneCb && 'function' !== typeof doneCb) {
            throw new Error('NGC.getJSON: doneCb must be undefined or ' +
                            'function');
        }

        // If no URIs are given, we're done:
        if (uris.length === 0) {
            if (doneCb) doneCb();
            return;
        }

        that = this;

        // Keep count of loaded data:
        loadedCount = 0;

        // Create a temporary JSONP callback, store it with the node instance:
        if ('undefined' === typeof this.tempCallbacks) {
            this.tempCallbacks = { counter: 0 };
        }
        else {
            this.tempCallbacks.counter++;
        }
        cbIdx = this.tempCallbacks.counter;

        tempCb = function(data) {
            dataCb(data);

            // Clean up:
            delete that.tempCallbacks[cbIdx];
            if (JSUS.size(that.tempCallbacks) <= 1) {
                delete that.tempCallbacks;
            }
        };
        this.tempCallbacks[cbIdx] = tempCb;

        for (uriIdx = 0; uriIdx < uris.length; uriIdx++) {
            currentUri = uris[uriIdx];

            // Create a temporary script tag for the current URI:
            scriptTag = document.createElement('script');
            scriptTagName = 'tmp_script_' + cbIdx + '_' + uriIdx;
            scriptTag.id = scriptTagName;
            scriptTag.name = scriptTagName;
            scriptTag.src = currentUri +
                '?callback=node.tempCallbacks[' + cbIdx + ']';
            document.body.appendChild(scriptTag);

            // Register the onload handler:
            scriptTag.onload = (function(uri, thisScriptTag) {
                return function() {
                    // Remove the script tag:
                    document.body.removeChild(thisScriptTag);

                    // Increment loaded URIs counter:
                    loadedCount++;
                    if (loadedCount >= uris.length) {
                        // All requested URIs have been loaded at this point.
                        if (doneCb) doneCb();
                    }
                };
            })(currentUri, scriptTag);
        }
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # incoming
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Listeners for incoming messages
 *
 * TODO: PRECONNECT events are not handled, just emitted.
 * Maybe some default support should be given, or some
 * default handlers provided.
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    var PlayerList = parent.PlayerList,
    Player = parent.Player,
    J = parent.JSUS;

    var action = parent.constants.action;

    var say = action.SAY + '.',
    set = action.SET + '.',
    get = action.GET + '.',
    IN = parent.constants.IN;

    /**
     * ## NodeGameClient.addDefaultIncomingListeners
     *
     * Adds a battery of event listeners for incoming messages
     *
     * If executed once, it requires a force flag to re-add the listeners
     *
     * @param {boolean} force Whether to force re-adding the listeners
     * @return {boolean} TRUE on success
     */
    NGC.prototype.addDefaultIncomingListeners = function(force) {
        var node = this;

        if (node.conf.incomingAdded && !force) {
            node.err('node.addDefaultIncomingListeners: listeners already ' +
                     'added once. Use the force flag to re-add.');
            return false;
        }

        this.info('node: adding incoming listeners.');

        /**
         * ## in.say.PCONNECT
         *
         * Adds a new player to the player list
         *
         * @emit UDATED_PLIST
         * @see Game.pl
         */
        node.events.ng.on( IN + say + 'BYE', function(msg) {
            var force;
            if (msg.data) {
                // Options for reconnections, for example.
                // Sending data, do something before disconnect.
            }
            force = true;
            node.socket.disconnect(force);
        });

        /**
         * ## in.say.PCONNECT
         *
         * Adds a new player to the player list
         *
         * @emit UDATED_PLIST
         * @see Game.pl
         */
        node.events.ng.on( IN + say + 'PCONNECT', function(msg) {
            if (!msg.data) return;
            node.game.pl.add(new Player(msg.data));
            if (node.game.shouldStep()) {
                node.game.step();
            }
            node.emit('UPDATED_PLIST');
        });

        /**
         * ## in.say.PDISCONNECT
         *
         * Removes a player from the player list
         *
         * @emit UPDATED_PLIST
         * @see Game.pl
         */
        node.events.ng.on( IN + say + 'PDISCONNECT', function(msg) {
            if (!msg.data) return;
            node.game.pl.remove(msg.data.id);
            if (node.game.shouldStep()) {
                node.game.step();
            }
            node.emit('UPDATED_PLIST');
        });

        /**
         * ## in.say.MCONNECT
         *
         * Adds a new monitor to the monitor list
         *
         * @emit UPDATED_MLIST
         * @see Game.ml
         */
        node.events.ng.on( IN + say + 'MCONNECT', function(msg) {
            if (!msg.data) return;
            node.game.ml.add(new Player(msg.data));
            node.emit('UPDATED_MLIST');
        });

        /**
         * ## in.say.MDISCONNECT
         *
         * Removes a monitor from the player list
         *
         * @emit UPDATED_MLIST
         * @see Game.ml
         */
        node.events.ng.on( IN + say + 'MDISCONNECT', function(msg) {
            if (!msg.data) return;
            node.game.ml.remove(msg.data.id);
            node.emit('UPDATED_MLIST');
        });

        /**
         * ## in.say.PLIST
         *
         * Creates a new player-list object
         *
         * @emit UPDATED_PLIST
         * @see Game.pl
         */
        node.events.ng.on( IN + say + 'PLIST', function(msg) {
            if (!msg.data) return;
            node.game.pl = new PlayerList({}, msg.data);
            node.emit('UPDATED_PLIST');
        });

        /**
         * ## in.say.MLIST
         *
         * Creates a new monitor-list object
         *
         * @emit UPDATED_MLIST
         * @see Game.pl
         */
        node.events.ng.on( IN + say + 'MLIST', function(msg) {
            if (!msg.data) return;
            node.game.ml = new PlayerList({}, msg.data);
            node.emit('UPDATED_MLIST');
        });

        /**
         * ## in.get.DATA
         *
         * Re-emits the incoming message, and replies back to the sender
         *
         * Does the following operations:
         *
         * - Validates the msg.text field
         * - Emits a get.<msg.text> event
         * - Replies to the sender with with the return values of the emit call
         */
        node.events.ng.on( IN + get + 'DATA', function(msg) {
            var res;

            if ('string' !== typeof msg.text || msg.text.trim() === '') {
                node.err('"in.get.DATA": msg.data must be a non-empty string.');
                return;
            }
            res = node.emit(get + msg.text, msg);
            if (!J.isEmpty(res)) {
                node.say(msg.text + '_' + msg.id, msg.from, res);
            }
        });

        /**
         * ## in.set.DATA
         *
         * Adds an entry to the memory object
         *
         * Decorates incoming msg.data object with the following properties:
         *
         *   - player: msg.from
         *   - stage: msg.stage
         */
        node.events.ng.on( IN + set + 'DATA', function(msg) {
            var o = msg.data;
            o.player = msg.from, o.stage = msg.stage;
            node.game.memory.add(o);
        });

        /**
         * ## in.say.PLAYER_UPDATE
         *
         * Updates the player's state in the player-list object
         *
         * @emit UPDATED_PLIST
         * @see Game.pl
         */
        node.events.ng.on( IN + say + 'PLAYER_UPDATE', function(msg) {
            node.game.pl.updatePlayer(msg.from, msg.data);
            node.emit('UPDATED_PLIST');
            if (node.game.shouldStep()) {
                node.game.step();
            }
            else if (node.game.shouldEmitPlaying()) {
                node.emit('PLAYING');
            }
        });

        /**
         * ## in.say.REDIRECT
         *
         * Redirects to a new page
         *
         * @see node.redirect
         */
        node.events.ng.on( IN + say + 'REDIRECT', function(msg) {
            if ('string' !== typeof msg.data) {
                node.err('"in.say.REDIRECT": msg.data must be string: ' +
                         msg.data);
                return false;
            }
            if ('undefined' === typeof window || !window.location) {
                node.err('"in.say.REDIRECT": window.location not found.');
                return false;
            }

            window.location = msg.data;
        });

        /**
         * ## in.say.SETUP
         *
         * Setups a features of nodegame
         *
         * Unstrigifies the payload before calling `node.setup`.
         *
         * @see node.setup
         * @see JSUS.parse
         */
        node.events.ng.on( IN + say + 'SETUP', function(msg) {
            var payload, feature;
            feature = msg.text;
            if ('string' !== typeof feature) {
                node.err('"in.say.SETUP": msg.text must be string: ' +
                         ferature);
                return;
            }
            if (!node.setup[feature]) {
                node.err('"in.say.SETUP": no such setup function: ' +
                         feature);
                return;
            }

            payload = 'string' === typeof msg.data ?
                J.parse(msg.data) : msg.data;

            if (!payload) {
                node.err('"in.say.SETUP": error while parsing ' +
                         'payload of incoming remote setup message.');
                return;
            }
            node.setup.apply(node, [feature].concat(payload));
        });

        /**
         * ## in.say.GAMECOMMAND
         *
         * Setups a features of nodegame
         *
         * @see node.setup
         */
        node.events.ng.on( IN + say + 'GAMECOMMAND', function(msg) {
            // console.log('GM', msg);
            if ('string' !== typeof msg.text) {
                node.err('"in.say.GAMECOMMAND": msg.text must be string: ' +
                         msg.text);
                return;
            }
            if (!parent.constants.gamecommands[msg.text]) {
                node.err('"in.say.GAMECOMMAND": unknown game command ' +
                         'received: ' + msg.text);
                return;
            }
            node.emit('NODEGAME_GAMECOMMAND_' + msg.text, msg.data);
        });

        /**
         * ## in.say.ALERT
         *
         * Displays an alert message (if in the browser window)
         *
         * If in Node.js, the message will be printed to standard output.
         *
         * @see node.setup
         */
        node.events.ng.on( IN + say + 'ALERT', function(msg) {
            if ('string' !== typeof msg.text || msg.text.trim() === '') {
                node.err('"in.say.ALERT": msg.text must be a non-empty string');
                return;
            }
            if ('undefined' !== typeof window) {
                if ('undefined' === typeof alert) {
                    node.err('"in.say.ALERT": alert is not defined: ' +
                             msg.text);
                    return;
                }
                alert(msg.text);
            }
            else {
                console.log('****** ALERT ******');
                console.log(msg.text);
                console.log('*******************');
            }
        });

        /**
         * ## in.get.SESSION
         *
         * Gets the value of a variable registered in the session
         *
         * If msg.text is undefined returns all session variables
         *
         * @see GameSession.get
         */
        node.events.ng.on( IN + get + 'SESSION', function(msg) {
            return node.session.get(msg.text);
        });

        /**
         * ## in.get.PLOT
         *
         * Gets the current plot sequence or the full plot state.
         *
         * @see GamePlot
         * @see Stager
         */
        node.events.ng.on( IN + get + 'PLOT', function(msg) {
            if (!node.game.plot.stager) return null;
            if (msg.text === 'state') {
                return node.game.plot.stager.getState();
            }
            return node.game.plot.stager.getSequence();
        });

        /**
         * ## in.get.PLIST
         *
         * Gets the current _PlayerList_ object
         *
         * @see PlayerList
         * @see node.game.pl
         */
        node.events.ng.on( IN + get + 'PLIST', function() {
            return node.game.pl.db;
        });

        /**
         * ## in.get.PLAYER
         *
         * Gets the current _Player_ object
         *
         * @see Player
         */
        node.events.ng.on( get + 'PLAYER', function() {
            return node.player;
        });

        /**
         * ## in.get.LANG | get.LANG
         *
         * Gets the currently used language
         *
         * @see node.player.lang
         */
        node.events.ng.on( IN + get + 'LANG', function() {
            return node.player.lang;
        });

        node.events.ng.on( get + 'LANG', function() {
            return node.player.lang;
        });

        /**
         * ## in.set.LANG
         *
         * Sets the currently used language
         *
         * @see NodeGameClient.setLanguage
         * @see node.player.lang
         */
        node.events.ng.on( IN + set + 'LANG', function(msg) {
            node.setLanguage(msg.data);
        });

        /**
         * ## get.PING
         *
         * Returns a dummy reply to PING requests
         */
        node.events.ng.on( get + 'PING', function() {
            return 'pong';
        });


        node.conf.incomingAdded = true;
        node.silly('node: incoming listeners added.');
        return true;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # internal
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Listeners for internal messages.
 *
 * Internal listeners are not directly associated to messages,
 * but they are usually responding to internal nodeGame events,
 * such as progressing in the loading chain, or finishing a game stage.
 *
 * http://nodegame.org
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    var GameStage = parent.GameStage,
    constants = parent.constants;

    var stageLevels = constants.stageLevels,
    gcommands = constants.gamecommands;

    var CMD = 'NODEGAME_GAMECOMMAND_';

    /**
     * ## NodeGameClient.addDefaultInternalListeners
     *
     * Adds a battery of event listeners for internal events
     *
     * If executed once, it requires a force flag to re-add the listeners.
     *
     * @param {boolean} force Whether to force re-adding the listeners
     * @return {boolean} TRUE on success
     */
    NGC.prototype.addDefaultInternalListeners = function(force) {
        var node = this;
        if (this.conf.internalAdded && !force) {
            this.err('Default internal listeners already added once. ' +
                     'Use the force flag to re-add.');
            return false;
        }

        this.info('node: adding internal listeners.');

        function done() {
            var res;
            // No incoming messages should be emitted before
            // evaluating the step rule and definitely setting
            // the stageLevel to DONE, otherwise the stage of
            // other clients could change in between.
            node.game.setStageLevel(stageLevels.GETTING_DONE);
            node.game.willBeDone = false;
            node.emit('REALLY_DONE');
            res = node.game.shouldStep(stageLevels.DONE);
            node.game.setStageLevel(stageLevels.DONE);
            // Step forward, if allowed.
            if (res) node.game.step();
        }

        /**
         * ## DONE
         *
         * Registers the stageLevel _DONE_ and eventually steps forward.
         *
         * If a DONE handler is defined in the game-plot, it executes it.
         * In case the handler returns FALSE, the process is stopped.
         *
         * @emit REALLY_DONE
         */
        this.events.ng.on('DONE', function() {
            // Execute done handler before updating stage.
            var stageLevel;

            stageLevel = node.game.getStageLevel();

            // TODO check >=.
            if (stageLevel >= stageLevels.PLAYING) {
                done();
            }
            else {
                node.game.willBeDone = true;
            }

        });

        /**
         * ## STEP_CALLBACK_EXECUTED
         *
         * @emit LOADED
         */
        this.events.ng.on('STEP_CALLBACK_EXECUTED', function() {
            if (!node.window || node.window.isReady()) {
                node.emit('LOADED');
            }
        });

//         /**
//          * ## WINDOW_LOADED
//          *
//          * @emit LOADED
//          */
//         this.events.ng.on('WINDOW_LOADED', function() {
//             var stageLevel;
//             stageLevel = node.game.getStageLevel();
//             if (stageLevel === stageLevels.CALLBACK_EXECUTED) {
//                 node.emit('LOADED');
//             }
//         });

        /**
         * ## LOADED
         *
         * @emit PLAYING
         */
        this.events.ng.on('LOADED', function() {
            node.game.setStageLevel(constants.stageLevels.LOADED);
            if (node.socket.shouldClearBuffer()) {
                node.socket.clearBuffer();
            }
            if (node.game.shouldEmitPlaying()) {
                node.emit('PLAYING');
            }
        });

        /**
         * ## PLAYING
         *
         * @emit BEFORE_PLAYING
         */
        this.events.ng.on('PLAYING', function() {
            var currentTime;
            node.emit('BEFORE_PLAYING');
            node.game.setStageLevel(stageLevels.PLAYING);
            node.socket.clearBuffer();
            // Last thing to do, is to store time:
            currentTime = (new Date()).getTime();
            node.timer.setTimestamp(node.game.getCurrentGameStage().toString(),
                                    currentTime);
            node.timer.setTimestamp('step', currentTime);

            // DONE was previously emitted, we just execute done handler.
            if (node.game.willBeDone) {
                done();
            }

        });

        /**
         * ## NODEGAME_GAMECOMMAND: start
         */
        this.events.ng.on(CMD + gcommands.start, function(options) {
            if (!node.game.isStartable()) {
                node.err('"' + CMD + gcommands.start + '": game cannot ' +
                         'be started now.');
                return;
            }
            node.emit('BEFORE_GAMECOMMAND', gcommands.start, options);
            node.game.start(options);
        });

        /**
         * ## NODEGAME_GAMECMD: pause
         */
        this.events.ng.on(CMD + gcommands.pause, function(options) {
            if (!node.game.isPausable()) {
                node.err('"' + CMD + gcommands.pause + '": game cannot ' +
                         'be paused now.');
                return;
            }
            node.emit('BEFORE_GAMECOMMAND', gcommands.pause, options);
            node.game.pause(options);
        });

        /**
         * ## NODEGAME_GAMECOMMAND: resume
         */
        this.events.ng.on(CMD + gcommands.resume, function(options) {
            if (!node.game.isResumable()) {
                node.err('"' + CMD + gcommands.resume + '": game cannot ' +
                         'be resumed now.');
                return;
            }
            node.emit('BEFORE_GAMECOMMAND', gcommands.resume, options);
            node.game.resume(options);
        });

        /**
         * ## NODEGAME_GAMECOMMAND: step
         */
        this.events.ng.on(CMD + gcommands.step, function(options) {
            if (!node.game.isSteppable()) {
                node.err('"' + CMD + gcommands.step + '": game cannot ' +
                         'be stepped now.');
                return;
            }
            node.emit('BEFORE_GAMECOMMAND', gcommands.step, options);
            node.game.step();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: stop
         */
        this.events.ng.on(CMD + gcommands.stop, function(options) {
            if (!node.game.isStoppable()) {
                node.err('"' + CMD + gcommands.stop + '": game cannot ' +
                         'be stopped now.');
                return;
            }
            node.emit('BEFORE_GAMECOMMAND', gcommands.stop, options);
            node.game.stop();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: goto_step
         */
        this.events.ng.on(CMD + gcommands.goto_step, function(options) {
            var step;
            if (!node.game.isSteppable()) {
                node.err('"' + CMD + gcommands.goto_step + '": game cannot ' +
                         'be stepped now.');
                return;
            }
            // Adjust parameters.
            if (options.targetStep) step = options.targetStep;
            else {
                step = options;
                options = undefined;
            }
            node.emit('BEFORE_GAMECOMMAND', gcommands.goto_step, step, options);
            if (step !== parent.GamePlot.GAMEOVER) {
                step = new GameStage(step);
                if (!node.game.plot.getStep(step)) {
                    node.err('"' + CMD + gcommands.goto_step + '": ' +
                             'step not found: ' + step);
                    return;
                }
            }
            node.game.gotoStep(step, options);
        });

        /**
         * ## NODEGAME_GAMECOMMAND: clear_buffer
         */
        this.events.ng.on(CMD + gcommands.clear_buffer, function() {
            node.emit('BEFORE_GAMECOMMAND', gcommands.clear_buffer);
            node.socket.clearBuffer();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: erase_buffer
         */
        this.events.ng.on(CMD + gcommands.erase_buffer, function() {
            node.emit('BEFORE_GAMECOMMAND', gcommands.clear_buffer);
            node.socket.eraseBuffer();
        });

        this.conf.internalAdded = true;
        this.silly('node: internal listeners added.');
        return true;
    };
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # setups
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Listeners for incoming messages
 *
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    var J = parent.JSUS,
    GamePlot = parent.GamePlot,
    Stager = parent.Stager;

    var constants = parent.constants;

    /**
     * ## NodeGameClient.addDefaultSetupFunctions
     *
     * Adds a battery of setup functions
     *
     * Setup functions also add a listener on `in.say.SETUP` for remote setup
     *
     * @param {boolean} force Whether to force re-adding the listeners
     * @return {boolean} TRUE on success
     */
    NGC.prototype.addDefaultSetupFunctions = function(force) {

        if (this.conf.setupsAdded && !force) {
            this.err('node.addDefaultSetups: setup functions already ' +
                     'added. Use the force flag to re-add.');
            return false;
        }

        this.info('node: registering setup functions.');

        /**
         * ### node.setup.nodegame
         *
         * Runs all the registered configuration functions
         *
         * Matches the keys of the configuration objects with the name
         * of the registered functions and executes them.
         * If no match is found, the configuration function will set
         * the default values.
         *
         * @param {object} options The configuration object
         */
        this.registerSetup('nodegame', function(options) {
            var i, setupOptions;

            if (options && 'object' !== typeof options) {
                throw new TypeError('node.setup.nodegame: options must ' +
                                    'object or undefined.');
            }
            options = options || {};
            for (i in this.setup) {
                if (this.setup.hasOwnProperty(i) &&
                    'function' === typeof this.setup[i]) {

                    // Old Operas loop over the prototype property as well.
                    if (i !== 'register' &&
                        i !== 'nodegame' &&
                        i !== 'prototype') {
                        // Like this browsers do not complain in strict mode.
                        setupOptions = 'undefined' === typeof options[i] ?
                            undefined : options[i];
                        this.conf[i] = this.setup[i].call(this, setupOptions);
                    }
                }
            }
        });

        /**
         * ### node.setup.socket
         *
         * Configures the socket connection to the nodegame-server
         *
         * @see node.Socket
         * @see node.SocketFactory
         */
        this.registerSetup('socket', function(conf) {
            if (!conf) return;
            this.socket.setup(conf);
            return conf;
        });

        /**
         * ### node.setup.host
         *
         * Sets the uri of the host
         *
         * If no value is passed, it will try to set the host from
         * the window object in the browser enviroment.
         */
        this.registerSetup('host', function(host) {
            var tokens;
            // URL
            if (!host) {
                if ('undefined' !== typeof window) {
                    if ('undefined' !== typeof window.location) {
                        host = window.location.href;
                    }
                }
            }

            if (host) {
                tokens = host.split('/').slice(0,-2);
                // url was not of the form '/channel'
                if (tokens.length > 1) {
                    host = tokens.join('/');
                }

                // Add a trailing slash if missing
                if (host.lastIndexOf('/') !== host.length) {
                    host = host + '/';
                }
            }

            return host;
        });

        /**
         * ### node.setup.verbosity
         *
         * Sets the verbosity level for nodegame
         */
        this.registerSetup('verbosity', function(level) {
            if ('string' === typeof level &&
                constants.verbosity_levels.hasOwnProperty(level)) {

                this.verbosity = constants.verbosity_levels[level];
            }
            else if ('number' === typeof level) {
                this.verbosity = level;
            }
            return level;
        });

        /**
         * ### node.setup.nodename
         *
         * Sets the name for nodegame
         */
        this.registerSetup('nodename', function(newName) {
            newName = newName || constants.nodename;
            if ('string' !== typeof newName) {
                throw new TypeError('node.nodename must be of type string.');
            }
            this.nodename = newName;
            return newName;
        });

        /**
         * ### node.setup.debug
         *
         * Sets the debug flag for nodegame
         */
        this.registerSetup('debug', function(enable) {
            enable = enable || false;
            if ('boolean' !== typeof enable) {
                throw new TypeError('node.debug must be of type boolean.');
            }
            this.debug = enable;
            return enable;
        });

        /**
         * ### node.setup.env
         *
         * Defines global variables to be stored in `node.env[myvar]`
         */
        this.registerSetup('env', function(conf) {
            var i;
            if ('undefined' !== typeof conf) {
                for (i in conf) {
                    if (conf.hasOwnProperty(i)) {
                        this.env[i] = conf[i];
                    }
                }
            }

            return conf;
        });

        /**
         * ### node.setup.events
         *
         * Configure the EventEmitter object
         *
         * @see node.EventEmitter
         */
        this.registerSetup('events', function(conf) {
            conf = conf || {};
            if ('undefined' === typeof conf.history) {
                conf.history = false;
            }

            if ('undefined' === typeof conf.dumpEvents) {
                conf.dumpEvents = false;
            }

            return conf;
        });

        /**
         * ### node.setup.game_settings
         *
         * Sets up `node.game.settings`
         */
        this.registerSetup('settings', function(settings) {
            if (settings) {
                J.mixin(this.game.settings, settings);
            }

            return this.game.settings;
        });

        /**
         * ### node.setup.metadata
         *
         * Sets up `node.game.metadata`
         */
        this.registerSetup('metadata', function(metadata) {
            if (metadata) {
                J.mixin(this.game.metadata, metadata);
            }

            return this.game.metadata;
        });

        /**
         * ### node.setup.player
         *
         * Creates the `node.player` object
         *
         * @see node.Player
         * @see node.player
         * @see node.createPlayer
         */
        this.registerSetup('player', function(player) {
            if (!player) return null;
            return this.createPlayer(player);
        });

        /**
         * ### node.setup.lang
         *
         * Setups the language of the client
         *
         * The `lang` parameter can either be an array containing
         * input parameters for the method `setLanguage`, or an object,
         * and in that case, it is only the first parameter (the language
         * object).
         *
         * @see node.player
         * @see node.setLanguage
         */
        this.registerSetup('lang', function(lang) {
            if (!lang) return null;
            if (J.isArray(lang)) node.setLanguage(lang[0], lang[1]);
            else node.setLanguage(lang);
            return node.player.lang;
        });

        /**
         * ### node.setup.timer
         *
         * Setup a timer object
         *
         * @see node.timer
         * @see node.GameTimer
         */
        this.registerSetup('timer', function(name, data) {
            var timer;
            if (!name) return null;
            timer = this.timer.timers[name];
            if (!timer) return null;
            if (timer.options) {
                timer.init(data.options);
            }

            switch (timer.action) {
            case 'start':
                timer.start();
                break;
            case 'stop':
                timer.stop();
                break;
            case 'restart':
                timer.restart();
                break;
            case 'pause':
                timer.pause();
                break;
            case 'resume':
                timer.resume();
            }

            // Last configured timer options.
            return {
                name: name,
                data: data
            };
        });

        /**
         * ### node.setup.plot
         *
         * Creates the `node.game.plot` object
         *
         * It can either replace current plot object, or append to it.
         * Updates are not possible for the moment.
         *
         * TODO: allows updates in plot.
         *
         * @param {object} stagerState Stager state which is passed
         *   to `Stager.setState`
         * @param {string} updateRule Optional. Accepted: <replace>, <append>.
         *   Default: 'replace'
         *
         * @see node.game.plot
         * @see Stager.setState
         */
        this.registerSetup('plot', function(stagerState, updateRule) {
            stagerState = stagerState || {};

            this.game.plot.stager.setState(stagerState, updateRule);

            return this.game.plot.stager;
        });

        (function(node) {

            /**
             * ### node.setup.plist
             *
             * Updates the player list in Game
             *
             * @param {PlayerList} list The new player list
             * @param {string} updateRule Optional. Accepted: <replace>,
             *   <append>. Default: 'replace'
             */
            node.registerSetup('plist', function(list, updateRule) {
                return updatePlayerList.call(this, 'pl', list, updateRule);
            });

            /**
             * ### this.setup.mlist
             *
             * Updates the monitor list in Game
             *
             * @param {PlayerList} list The new monitor list
             * @param {string} updateRule Optional. Accepted: <replace>,
             *   <append>. Default: 'replace'
             */
            node.registerSetup('mlist', function(list, updateRule) {
                return updatePlayerList.call(this, 'ml', list, updateRule);
            });

            // Utility for setup.plist and setup.mlist:
            function updatePlayerList(dstListName, srcList, updateRule) {
                var dstList;
                // Initial setup call. Nothing to do.
                if (!srcList && !updateRule) return;

                dstList = dstListName === 'pl' ? this.game.pl : this.game.ml;
                updateRule = updateRule || 'replace';

                if (updateRule === 'replace') {
                    dstList.clear(true);
                }
                else if (updateRule !== 'append') {
                    throw new Error('setup.' + dstListName + 'ist: invalid ' +
                                    'updateRule: ' + updateRule + '.');
                }

                // Import clients (if any).
                // Automatic cast from Object to Player.
                if (srcList) dstList.importDB(srcList);

                return { updateRule: updateRule, list: srcList };
            }
        })(this);

        this.conf.setupsAdded = true;
        this.silly('node: setup functions added.');
        return true;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # aliases
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Event listener aliases.
 *
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    /**
     * ## NodeGameClient.addDefaultAliases
     *
     * Adds a battery of setup functions
     *
     * @param {boolean} force Whether to force re-adding the aliases
     * @return {boolean} TRUE on success
     */
    NGC.prototype.addDefaultAliases = function(force) {
        var that;
        if (this.conf.aliasesAdded && !force) {
            this.err('node.addDefaultAliases: aliases already ' +
                     'added. Use the force flag to re-add.');
            return false;
        }
        that = this;

        this.info('node: adding default aliases.');

        // ### node.on.txt
        this.alias('txt', 'in.say.TXT');

        // ### node.on.data
        this.alias('data', ['in.say.DATA', 'in.set.DATA'], function(text, cb) {
            return function(msg) {
                if (msg.text === text) {
                    cb.call(that.game, msg);
                }
            };
        });

        // ### node.on.stage
        this.alias('stage', 'in.set.STAGE');

        // ### node.on.plist
        this.alias('plist', ['in.set.PLIST', 'in.say.PLIST']);

        // ### node.on.pconnect
        this.alias('pconnect', 'in.say.PCONNECT', function(cb) {
            return function(msg) {
                cb.call(that.game, msg.data);
            };
        });

        // ### node.on.pdisconnect
        this.alias('pdisconnect', 'in.say.PDISCONNECT', function(cb) {
            return function(msg) {
                cb.call(that.game, msg.data);
            };
        });

        // ### node.on.preconnect
        this.alias('preconnect', 'in.say.PRECONNECT', function(cb) {
            return function(msg) {
                cb.call(that.game, msg.data);
            };
        });

        // ### node.on.mconnect
        this.alias('mconnect', 'in.say.MCONNECT', function(cb) {
            return function(msg) {
                cb.call(that.game, msg.data);
            };
        });

        // ### node.on.mreconnect
        this.alias('mreconnect', 'in.say.MRECONNECT', function(cb) {
            return function(msg) {
                cb.call(that.game, msg.data);
            };
        });

        // ### node.on.mdisconnect
        this.alias('mdisconnect', 'in.say.MDISCONNECT', function(cb) {
            return function(msg) {
                cb.call(that.game, msg.data);
            };
        });

        // ### node.on.stepdone
        // Uses the step rule to determine when a step is DONE.
        this.alias('stepdone', 'UPDATED_PLIST', function(cb) {
            return function() {
                if (that.game.shouldStep()) {
                    cb.call(that.game, that.game.pl);
                }
            };
        });

        // ### node.on.lang
        // Gets language information.
        this.alias('lang','in.say.LANG');

        this.silly('node: aliases added.');
        return true;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);

/**
 * # TriggerManager
 * Copyright(c) 2015 Stefano Balietti
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
 * If `TriggerManager.returnAt` is set equal to `TriggerManager.first`,
 * the first trigger function returning a truthy value will stop the process
 * and the target object will be immediately returned. In these settings,
 * if a trigger function returns `undefined`, the target is passed to the next
 * trigger function.
 *
 * Notice: TriggerManager works as a *LIFO* queue, i.e. new trigger functions
 * will be executed first.
 */
(function(exports, node) {

    "use strict";

    // ## Global scope

    exports.TriggerManager = TriggerManager;

    TriggerManager.first = 'first';
    TriggerManager.last = 'last';

    /**
     * ## TriggerManager constructor
     *
     * Creates a new instance of TriggerManager
     *
     * @param {object} options Configuration options
     */
    function TriggerManager(options) {
        // ## Public properties

        /**
         * ### TriggerManager.options
         *
         * Reference to current configuration
         */
        this.options = options || {};

        /**
         * ### TriggerManager.triggers
         *
         * Array of trigger functions
         */
        this.triggers = [];

        /**
         * ### TriggerManager.returnAt
         *
         * Controls the behavior of TriggerManager.pullTriggers
         *
         * By default it is equal to `TriggerManager.first`
         */
        this.returnAt = TriggerManager.first;

        this.init();
    };

    // ## TriggerManager methods


    /**
     * ### TriggerManager.size
     *
     * Returns the number of registered trigger functions
     */
    TriggerManager.prototype.size = function() {
        return this.triggers.length;
    };

    /**
     * ### TriggerManager.init
     *
     * Configures the TriggerManager instance
     *
     * Takes the configuration as an input parameter or recycles the settings
     * in `this.options`.
     *
     * The configuration object is of the type:
     *
     *  var options = {
     *      returnAt: 'last',
     *      triggers: [ myFunc, myFunc2 ]
     *  };
     *
     * @param {object} options Optional. Configuration object
     */
    TriggerManager.prototype.init = function(options) {
        if (options && 'object' !== typeof options) {
            throw new TypeError('TriggerManager.init: options must be ' +
                                'object or undefined.');
        }

        if (options) {
            if (options.returnAt) {
                this.setReturnAt(options.returnAt);
            }
            this.options = options;
        }

        this.resetTriggers();
    };


    /**
     * ### TriggerManager.setReturnAt
     *
     * Verifies and sets the returnAt option.x
     *
     * @param {string} returnAt The value of the returnAt policy
     *
     * @see TriggerManager.first
     * @see TriggerManager.last
     */
    TriggerManager.prototype.setReturnAt = function(returnAt) {
        var f =  TriggerManager.first, l = TriggerManager.last;
        if ('string' !== typeof returnAt) {
            throw new TypeError('TriggerManager.setReturnAt: returnAt must ' +
                                'be string.');
        }
        if (returnAt !== f && returnAt !== l) {
            throw new TypeError('TriggerManager.setReturnAt: returnAt must ' +
                                'be ' + f + ' or ' + l + '. Given: ' +
                                returnAt + '.');
        }
        this.returnAt = returnAt;
    };

    /**
     * ### TriggerManager.initTriggers
     *
     * Adds a collection of trigger functions to the trigger array
     *
     * @param {function|array} triggers An array of trigger functions
     *   or a single function.
     */
    TriggerManager.prototype.initTriggers = function(triggers) {
        var i;
        if (!triggers) return;
        if (!(triggers instanceof Array)) {
            triggers = [triggers];
        }
        for (i = 0 ; i < triggers.length ; i++) {
            this.triggers.push(triggers[i]);
        }
    };

    /**
     * ### TriggerManager.resetTriggers
     *
     * Resets the trigger array to initial configuration
     *
     * Delete existing trigger functions and re-add the ones
     * contained in `TriggerManager.options.triggers`.
     */
    TriggerManager.prototype.resetTriggers = function() {
        this.triggers = [];
        if ('undefined' !== typeof this.options.triggers) {
            this.initTriggers(this.options.triggers);
        }
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
    TriggerManager.prototype.clear = function(clear) {
        if (!clear) {
            node.warn('Do you really want to clear the current ' +
                      'TriggerManager obj? Please use clear(true)');
            return false;
        }
        this.triggers = [];
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
    TriggerManager.prototype.addTrigger = function(trigger, pos) {
        if (!trigger) return false;
        if (!('function' === typeof trigger)) return false;
        if (!pos) {
            this.triggers.push(trigger);
        }
        else {
            this.triggers.splice(pos, 0, trigger);
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
    TriggerManager.prototype.removeTrigger = function(trigger) {
        var i;
        if (!trigger) return false;
        for (i = 0 ; i < this.triggers.length ; i++) {
            if (this.triggers[i] == trigger) {
                return this.triggers.splice(i,1);
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
     * Depending on the value of `TriggerManager.returnAt`, some trigger
     * functions may not be called. In fact a value is returned:
     *
     *  - 'first': after the first trigger returns a truthy value
     *  - 'last': after all triggers have been executed
     *
     * If no trigger is registered the target object is returned unchanged
     *
     * @param {object} o The target object
     * @return {object} The target object after the triggers have been fired
     */
    TriggerManager.prototype.pullTriggers = function(o) {
        var i, out;
        if ('undefined' === typeof o) return;
        if (!this.size()) return o;

        for (i = this.triggers.length; i > 0; i--) {
            out = this.triggers[(i-1)].call(this, o);
            if ('undefined' !== typeof out) {
                if (this.returnAt === TriggerManager.first) {
                    return out;
                }
            }
        }
        // Safety return.
        return ('undefined' !== typeof out) ? out : o;
    };

    // <!-- old pullTriggers
    //TriggerManager.prototype.pullTriggers = function(o) {
    //  if (!o) return;
    //
    //  for (var i = triggersArray.length; i > 0; i--) {
    //          var out = triggersArray[(i-1)].call(this, o);
    //          if (out) {
    //                  if (this.returnAt === TriggerManager.first) {
    //                          return out;
    //                  }
    //          }
    //  }
    //  // Safety return
    //  return o;
    //};
    //-->

})(
    ('undefined' !== typeof node) ? node : module.exports
    , ('undefined' !== typeof node) ? node : module.parent.exports
);

/**
 * Exposing the node object
 */
(function() {
    var tmp = new window.node.NodeGameClient();
    JSUS.mixin(tmp, window.node);
    window.node = tmp;
})();
