/**
 * # Stager blocks operations
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    const Stager = node.Stager;
    const J = node.JSUS;
    const path = require('path');

    // Stager.prototype.require = function(...paths) {
    //
    //     let myPath = path.join(...paths);
    //     let cb = require(myPath);
    //
    //     let s = this.__shared;
    //
    //     return cb(s.treatmentName, s.settings, this, s.setup,
    //               s.gameRoom, s.node, this.shared || {});
    // };

    Stager.prototype.require = function(...paths) {

        let myPath = path.join(...paths);
        let cb = require(myPath);

        return cb(this.shared);
    };

    // Stager.prototype.share = function(shared) {
    //     if (!this.shared) {
    //         let stager = this;
    //         this.shared = [ stager ] ;
    //     }
    //    if (Array.isArray(shared)) this.shared = [...this.shared, ...shared ];
    //     else this.shared.push(shared);
    // };

    // Stager.prototype.share = function(obj) {
    //     if (!this.shared) this.shared = {};
    //     J.mixin(this.shared, obj);
    // };

    Stager.prototype.share = function(obj) {
        if (!this.shared) this.shared = { stager: this, J: J };
        J.mixin(this.shared, obj);
    };
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
