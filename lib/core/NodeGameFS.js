/**
 * # Fs
 *
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` file system module
 *
 * ---
 *
 */

(function (exports, parent) {

    // ## Global scope

    exports.NodeGameFS = NodeGameFS;

    var J = exports.JSUS,
    fs = require('fs'),
    path = require('path'),
    csv = require('ya-csv');

    //## File System

    function NodeGameFS(node) {
        this.node = node;
    }

    /**
     * ### NodeGameFS.writeCsv (Node.JS)
     *
     * Serializes an object as a csv file
     *
     * It accepts a configuration object as third paramter. Available options:
     *
     * ```
     * { headers: ['A', 'B', 'C'],      // specify the headers directly
     *   writeHeaders: false,           // default true,
     *   flags: 'w',                    // default, 'a'
     *   encoding: 'utf-8',             // default null
     *   mode: 0777,                    // default 0666
     * }
     * ```
     *
     * @param {string} path The path to the csv file
     * @param {object} obj The object to serialze as csv file
     * @param {options} options Optional. Configuration options
     *
     *  @see [node fs api](http://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options)
     */
    NodeGameFS.prototype.writeCsv = function (path, obj, options) {
        var writer, headers, i;
        if (!path || !obj) {
            this.node.log('Empty path or object. Aborting.', 'ERR', 'node.fs.writeCsv: ');
            return false;
        }

        options = options || {};
        options.flags = options.flags || 'a';

        writer = csv.createCsvStreamWriter(fs.createWriteStream(path, options));

        // <!-- Add headers, if not otherwise requested, and if found -->
        if ('undefined' === typeof options.writeHeaders) {
            options.writeHeaders = true;
        }

        if (options.writeHeaders) {
            headers = [];
            if (J.isArray(options.headers)) {
                headers = options.headers;
            }
            else {
                headers = J.keys(obj[0]);
            }

            if (headers && headers.length) {
                writer.writeRecord(headers);
            }
            else {
                this.node.log('Could not find headers', 'WARN');
            }
        }

        for (i = 0; i < obj.length; i++) {
            writer.writeRecord(obj[i]);
        }
    };

    /**
     * ### NodeGameFS.memory2csv (Node.JS)
     *
     * Serializes as a csv file all the entries of the memory object
     *
     * By defaults, no headers are added. If requested, headers can
     * be specified in the `options` parameter.
     *
     * @param {string} path The path to the csv file
     * @param {options} options Optional. Configuration options
     *
     * @see NodeGameFS.writeCsv
     *
     */
    NodeGameFS.prototype.memory2csv = function (path, options) {
        if ('undefined' === typeof path) {
            this.node.log('Missing path parameter', 'ERR', 'node.fs.memory2csv: ');
            return;
        }
        options = options || {};
        if (!options.headers && !options.writeHeaders) options.writeHeaders = false;

        this.writeCsv(path, this.node.game.memory.split().fetchValues(), options);
    };

    /**
     * ### NodeGameFS.memoryIndexes2json (Node.JS)
     *
     * Serializes to JSON files all the hashed indexes of the memory object
     *
     * Each file is named after the name of the hashed property
     * and the index. E.g. stage_3.1.1.nddb, or player_18432986411.nddb`, etc.
     *
     * @param {string} dir The path to the folder in which all files will be saved
     * @param {options} options Optional. Configuration options
     *
     * @see NodeGameFS.memory2csv
     * @see NodeGameFS.writeCsv
     */
    NodeGameFS.prototype.memoryIndexes2json = function (dir) {
        saveAllIndexes(this.node, dir);
    };

    /**
     * ### NodeGameFS.memoryIndexes2csv (Node.JS)
     *
     * Serializes to CSV files all the hashed indexes of the memory object
     *
     * @param {string} dir The path to the folder in which all files will be saved
     * @param {options} options Optional. Configuration options
     *
     * @see NodeGameFS.memoryIndexes2json
     * @see NodeGameFS.writeCsv
     */
    NodeGameFS.prototype.memoryIndexes2csv = function (dir, options) {
        saveAllIndexes(this.node, dir, true, options);
    };

    // ## Helper function


    function saveAllIndexes(node, dir, csv, options) {
        var hash, index, ipath;
        if (J.isEmpty(node.game.memory.__H)) return;
        if ('undefined' === typeof dir) {
            node.err('cannot save all indexes: missing dir parameter');
            return;
        }

        if (dir[dir.length-1] !== '/') dir = dir + '/';
 
        for (hash in node.game.memory.__H) {
            if (node.game.memory.__H.hasOwnProperty(hash)){
                if ('undefined' !== typeof node.game.memory[hash]) {
                    for (index in node.game.memory[hash]) {
                        if (node.game.memory[hash].hasOwnProperty(index)) {
                            ipath = dir + hash + '_' + index;
                            if (csv) {
                                ipath += '.csv';
                                node.fs.writeCsv(ipath,
                                                 node.game.memory[hash][index].split().fetchValues(),
                                                 options);
                            }
                            else {
                                ipath += '.nddb';
                                node.game.memory[hash][index].save(ipath);
                            }

                        }
                    }

                }
            }
        }
    }


})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
