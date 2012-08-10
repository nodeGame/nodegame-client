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
		p.remove();
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
	to_remit.select('event', 'in', discard).remove();
	
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