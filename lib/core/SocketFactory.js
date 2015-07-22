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
