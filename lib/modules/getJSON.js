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
