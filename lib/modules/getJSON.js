/**
 * # NodeGameClient JSON fetching  
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * ---
 */

(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    /**
     * ### NodeGameClient.getJSON
     *
     * Retrieves JSON data via JSONP from one or many URIs
     *
     * The callback will be called with the JSON object as the parameter.
     *
     * TODO: Update doc
     * @param {array|string} uris The URI(s)
     * @param {function} callback The function to call with the data
     */
    NGC.prototype.getJSON = function(uris, dataCb, doneCb) {
        // TODO: Work in progress
        var that;
        var loadedCount;
        var currentUri, uriIdx;
        var cbScriptTag;
        var jsonpCallbackName;
        var scriptTag, scriptTagName;

        if ('string' === typeof uris) {
            uris = [ uris ];
        }

        // Do nothing if no URIs are given:
        if (!uris || !uris.length) {
            if (doneCb) doneCb();
            return;
        }

        that = this;

        // Keep count of loaded data:
        loadedCount = 0;

        // Create a temporary script tag with the JSONP callback:
        cbScriptTag = document.createElement('script');
        cbScriptTag.id = 'tmp_script_' + uriIdx;
        cbScriptTag.innerHTML =
            'function NGC_getJSON_callback(data){' +
                //'dataCb(data);' +
                'console.log("JSONP!!!");' +
                'console.log(data);' +
            '}';
        document.body.appendChild(cbScriptTag);

        for (uriIdx = 0; uriIdx < uris.length; uriIdx++) {
            currentUri = uris[uriIdx];

            // Create a temporary script tag for the current URI:
            scriptTag = document.createElement('script');
            scriptTagName = 'tmp_script_' + uriIdx;
            scriptTag.id = scriptTagName;
            scriptTag.name = scriptTagName;
            document.body.appendChild(scriptTag);

            // Register the onload handler:
            scriptTag.onload = (function(uri, thisScriptTag) {
                return function() {
                    var frameDocumentElement;

                    frameDocumentElement =
                        (thisScriptTag.contentDocument ?
                         thisScriptTag.contentDocument :
                         thisScriptTag.contentWindow.document)
                        .documentElement;

                    // Store the contents in the cache:
                    that.cache[uri] = {
                        contents: frameDocumentElement.innerHTML,
                        cacheOnClose: false
                    };

                    // Remove the internal frame:
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
