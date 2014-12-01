/**
 * # MessagingQueue
 * Copyright(c) 2014 Jan Wilken Doerrie
 * MIT Licensed
 *
 * Handles network connections through Socket.IO
 * ---
 */

"use strict";

// Global scope

(function(exports, parent) {

    "use strict";

    exports.MessagingQueue = MessagingQueue;

    var NDDB = parent.NDDB;

    /**
     * ## MessagingQueue constructor
     *
     * Creates an instance of MessagingQueue
     *
     * @param {GameServer} server A GameServer instance
     *
     * @see GameServer
     */
    function MessagingQueue() {
        var options = {
            update: {
                indexes: true
            }
        };

        this.msgQueue = new NDDB(options);
        this.msgQueue.index('msgIdIdx', function (msg) {
            return msg.id;
        });

        this.msgQueue.globalCompare = function (o1, o2) {
            var time1 = new Date(o1.created).getTime();
            var time2 = new Date(o2.created).getTime();
            console.log(time1 + ":" + time2);
            return time2 - time1;
        }

        this.msgIntQueue = new NDDB(options);
        this.msgIntQueue.index('msgIdIdx', function (obj) {
            return obj.msgId;
        });
    }

    MessagingQueue.prototype.addMessage = function (msg) {
        this.validateMessage(msg);
        this.queue.insert(msg);
    }

    MessagingQueue.prototype.addMessageWithInterval = function(msg, func, del) {
        this.validateMessage(msg);
        var intervalID = setInterval(func, del);
        this.msgIntQueue.insert({
            msgId: msg.id,
            intId: intervalID
        });
    }

    MessagingQueue.prototype.deleteMessageById = function (msgId) {
        this.msgQueue['msgIdIdx'].remove(msgId);
    }

    MessagingQueue.prototype.deleteMessageWithInterval = function (msgId) {
        var intId = this.msgIntQueue.selexec('msgId', '=', msgId)
            .fetch().intId;

        clearInterval(intId);
        this.msgIntQueue['msgIdIdx'].remove(msgId);
    }

    MessagingQueue.prototype.getAllMessagesForClient = function (clientId) {
        return this.msgQueue.selexec('to', '=', clientId).fetch();
    }

    MessagingQueue.prototype.validateMessage = function(msg) {
        if (!msg || "object" !== typeof msg) {
            throw new TypeError('MessagingQueue.validateMessage: ' +
            'message must be object.');
        }

        // Non strict equality checking is used to trigger errors on both 'null'
        // and 'undefined'.
        if (msg.id == null) {
            throw new TypeError("MessagingQueue.validateMessage: " +
            "message must have an 'id' property.");
        }

        if (msg.to == null) {
            throw new TypeError("MessagingQueue.validateMessage: " +
            "message must have a 'to' property.");
        }

        if (msg.created == null) {
            throw new TypeError("MessagingQueue.validateMessage: " +
            "message must have a 'created' property.");
        }

        return true;
    }
    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
