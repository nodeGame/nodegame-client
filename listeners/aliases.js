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
     *
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
        this.alias('stage', 'STEPPING', function(cb) {
            return function(curStep, newStep) {
                if (curStep.stage !== newStep.stage) cb(curStep, newStep);
            };
        });

        // ### node.on.stage
        this.alias('step', 'STEPPING');

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
