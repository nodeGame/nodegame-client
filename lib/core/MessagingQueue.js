/**
 * # MessagingQueue
 * Copyright(c) 2015 Jan Wilken Doerrie
 * MIT Licensed
 *
 * Handles network connections through Socket.IO
 * ---
 */
(function(exports, parent) {

    'use strict';

    // ## Global scope
    var NDDB = parent.NDDB;

    // Expose constructor
    exports.MessagingQueue = MessagingQueue;

     /**
      * ## MessagingQueue constructor
      *
      * Creates an instance of MessagingQueue
      *
      * @param {function} log Log function used to keep track of messages.
      */
    function MessagingQueue(log) {
        var options;

        /**
         * ### MessagingQueue.log
         *
         * Log function to keep track of messages. Defaults to console.log
         * if it is not specified in the constructor.
         *
         * @type {function}
         */
        this.log = log || console.log;

        // Defines an options object that tells NDDB to update its indexes when
        // items are inserted into it.
        options = { update: { indexes: true } };

        /**
         * ### MessagingQueue.msgQueue
         *
         * A queue for regular messages. It has an associated index on the id
         * of the messages inserted to it and a global compare function on the
         * creation date of messages that allows for temporal sorting.
         *
         * @type {NDDB}
         */
        this.msgQueue = new NDDB(options);

        /**
         * ### MessagingQueue.msgIntQueue
         *
         * A queue for messages with an associated interval. It has an
         * associated index on the id of the messages inserted to it and a
         * global compare function on the creation date of messages that allows
         * for temporal sorting.
         *
         * @type {NDDB}
         */
        this.msgIntQueue = new NDDB(options);


        this.msgQueue.index('msgIdIdx', function(msg) {
            return msg.id;
        });

        this.msgIntQueue.index('msgIdIdx', function(obj) {
            return obj.msgId;
        });

        // Defines a globalCompare function for the messages inside the
        // msgQueue. The message creation time is used as a comparison key.
        // TODO: Check whether different system times cause a problem.
        this.msgQueue.globalCompare = function(o1, o2) {
            var time1, time2;

            time1 = new Date(o1.created).getTime();
            time2 = new Date(o2.created).getTime();
            return time2 - time1;
        };

        // Defines a globalCompare function for the messages inside the
        // msgIntQueue. The message creation time is used as a comparison key.
        // TODO: Check whether different system times cause a problem.
        this.msgIntQueue.globalCompare = function(o1, o2) {
            var time1, time2;

            time1 = new Date(o1.msg.created).getTime();
            time2 = new Date(o2.msg.created).getTime();
            return time2 - time1;
        };
    }

    /**
     * ### MessagingQueue.addMessage
     *
     * Adds a message to the queue.
     *
     * @param {GameMessage} msg A GameMessage.
     *
     * @return {boolean} True on success, throws Error on failure.
     */
    MessagingQueue.prototype.addMessage = function(msg) {
        this.validateMessage(msg);
        if (this.msgQueue.msgIdIdx.get(msg.id) !== false) {
            throw new Error(
                'MessagingQueue.addMessage: A message with id ' + msg.id +
                ' already exists.'
             );
        }

        this.msgQueue.insert(msg);
        return true;
    };

    /**
     * ### MessagingQueue.addMessageWithInterval
     *
     * Adds a message with a corresponding interval function.
     *
     * @param {GameMsg} msg A game message.
     * @param {function} func Function to be executed after every `del` ms.
     * @param {number} del Interval duration in milliseconds.
     *
     * @return {boolean} True on success, throws Error on failure.
     */
    MessagingQueue.prototype.addMessageWithInterval = function(msg, func, del) {
        var intervalId;

        // Validates the message and sets the corresponding interval.
        // Then it wraps everything into an object and inserts it into the
        // message interval queue.
        this.validateMessage(msg);
        if (this.msgIntQueue.msgIdIdx.get(msg.id) !== false) {
            throw new Error(
                'MessagingQueue.addMessageWithInterval: ' +
                'A message with id ' + msg.id + ' already exists.'
            );
        }

        intervalId = setInterval(func, del);
        this.msgIntQueue.insert({
            msgId: String(msg.id),
            msg: msg,
            intId: intervalId
        });

        return true;
    };

    /**
     * ### MessagingQueue.deleteMessageById
     *
     * Deletes a given message specified by its id.
     *
     * @param {number} msgId The id of the message.
     *
     * @return {boolean} True on success, throws Error on failure.
     */
    MessagingQueue.prototype.deleteMessageById = function(msgId) {
        var result;

        result = this.msgQueue.msgIdIdx.remove(msgId);

        if (result === false) {
            throw new Error(
                'MessagingQueue.deleteMessagelById: ' +
                'Tried to delete non-existent Message.'
            );
        }

        return true;
    };

    /**
     * ### MessagingQueue.deleteMessageById
     *
     * Deletes a message and the corresponding interval by specifying the id of
     * the message.
     *
     * @param {number} msgId The id of the message.
     *
     * @return {boolean} True on success, throws Error on failure.
     */
    MessagingQueue.prototype.deleteMessageWithIntervalById = function(msgId) {
        var result;

        result = this.msgIntQueue.msgIdIdx.remove(msgId);

        if (result === false) {
            throw new Error(
                'MessagingQueue.deleteMessageWithIntervalById: ' +
                'Tried to delete non-existent Message.'
            );
        }

        clearInterval(result.intId);
        return true;
    };

    /**
     * ### MessagingQueue.getAllMessagesForClient
     *
     * Returns all messages for a given client id
     *
     * @param {number} clientId Id number of the client
     *
     * @return {array} Array of the client messages.
     */
    MessagingQueue.prototype.getAllMessagesForClient = function(clientId) {
        return this.msgQueue.select('to', '=', clientId).fetch();
    };

    /**
     * ### MessagingQueue.validateMessage
     *
     * Validates a given message
     *
     * @param  {GameMsg} msg game message
     *
     * @return {boolean} True is message is valid, throws TypeError otherwise.
     */
    MessagingQueue.prototype.validateMessage = function(msg) {
        if (!msg || 'object' !== typeof msg) {
            throw new TypeError(
                'MessagingQueue.validateMessage: ' +
                'message must be object.'
            );
        }

        // Non strict equality checking is used to trigger errors on both 'null'
        // and 'undefined'.
        // References:
        // - http://stackoverflow.com/a/15992131/2528077
        // - http://contribute.jquery.org/style-guide/js/#equality
        if (msg.id == null) {
            throw new TypeError(
                'MessagingQueue.validateMessage: ' +
                'message must have an "id" property.'
            );
        }

        if (msg.to == null) {
            throw new TypeError(
                'MessagingQueue.validateMessage: ' +
                'message must have a "to" property.'
            );
        }

        if (msg.created == null) {
            throw new TypeError(
                'MessagingQueue.validateMessage: ' +
                'message must have a "created" property.'
            );
        }

        return true;
    };
    // ## Closure
})(
    'undefined' !== typeof node ? node : module.exports,
    'undefined' !== typeof node ? node : module.parent.exports
);
