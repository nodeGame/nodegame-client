/**
 * # FS
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` file system module.
 * ---
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope

    exports.NodeGameFS = NodeGameFS;

    var J = parent.JSUS,
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
     * @param {array} data The data to serialze
     * @param {options} options Optional. Configuration options format specific
     *
     * @see [node fs api](http://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options)
     */
    NodeGameFS.prototype.writeCsv = function(path, data, options) {
        var writer, headers, i;
        if ('string' !== typeof path) {
            throw new TypeError('node.writeCsv: path must be string.');
        }
        if (!J.isArray(data)) {
            throw new TypeError('node.writeCsv: data must be array.');
        }
        if (options && 'object' !== typeof options) {
            throw new TypeError('node.writeCsv: options must be object or ' +
                                'undefined.');
        }

        options = options || {};
        options.flags = options.flags || 'a';

        writer = csv.createCsvStreamWriter(fs.createWriteStream(path, options));

        // Add headers, if not otherwise requested, and if found.
        if ('undefined' === typeof options.writeHeaders) {
            options.writeHeaders = true;
        }

        if (options.writeHeaders) {
            headers = [];
            if (J.isArray(options.headers)) {
                headers = options.headers;
            }
            else {
                headers = J.keys(data[0], 1);
            }

            if (headers && headers.length) {
                writer.writeRecord(headers);
            }
            else {
                this.node.warn('node.fs.writeCsv: no headers found.');
            }
        }

        for (i = 0; i < data.length; i++) {
            if (J.isArray(data[i])) {
                writer.writeRecord(data[i]);
            }
            else if (data[i] && 'object' === typeof data[i]) {
                writer.writeRecord(J.obj2Array(data[i]));
            }
            else {
                throw new Error('node.fs.writeCsv: data array contains ' +
                                'invalid entries: ' + data[i]);
            }
        }
    };

    /**
     * ### NodeGameFS.saveMemory (Node.JS)
     *
     * Serializes as a csv file all the entries of the memory object
     *
     * By defaults, no headers are added. If requested, headers can
     * be specified in the `options` parameter.
     *
     * @param {string} format The format of the files
     * @param {string} path The path to the csv file
     * @param {options} options Optional. Configuration options
     *
     * @see NodeGameFS.writeCsv
     */
    NodeGameFS.prototype.saveMemory = function(format, path, options) {
        if ('string' !== typeof format) {
            throw new TypeError('node.saveMemory: format must be string.');
        }
        
        if (!J.in_array(format, ['json', 'csv'])) {
            throw new TypeError('node.saveMemory: unknown format: ' +
                                format + '.');
        }
        if ('string' !== typeof path) {
            throw new TypeError('node.memory2csv: path must be string.');
        }
        if (options && 'object' !== typeof options) {
            throw new TypeError('node.saveMemory: options must be object or ' +
                                'undefined.');
        }
        options = options || {};
        if (!options.headers && !options.writeHeaders) {
            options.writeHeaders = false;
        }
        if (format === 'csv') {
            this.writeCsv(path, this.node.game.memory.split().fetch(), options);
        }
        else {
            // Params: path, callback, compress.
            this.node.game.memory.save(path, null, false);
        }
    };

    /**
     * ### NodeGameFS.saveMemoryIndexes (Node.JS)
     *
     * Saves the indexes of the memory object to file system
     *
     * A new file is created for every index, named after the index. E.g.,
     * stage_3.1.1.nddb, or player_18432986411.nddb`, etc.
     *
     * Two file formats are available: _csv_ and _json_.
     *
     * @param {string} format The format of the files
     * @param {string} dir The path to the folder in which all files
     *   will be saved
     * @param {options} options Optional. Configuration options
     *
     * @see NodeGameFS.memory2csv
     * @see NodeGameFS.writeCsv
     */
    NodeGameFS.prototype.saveMemoryIndexes = function(format, dir, options) {
        var hash, index, ipath, indexData, node, memory;
        node = this.node;
        memory = node.game.memory;

        if ('string' !== typeof format) {
            throw new TypeError('node.fs.saveMemoryIndexes: format must be ' +
                                'string.');
        }
        
        if (!J.in_array(format, ['json', 'csv'])) {
            throw new TypeError('node.fs.saveMemoryIndexes: unknown format: ' +
                                format + '.');
        }

        if ('string' !== typeof dir) {
            throw new TypeError('node.fs.saveMemoryIndexes: dir must be ' +
                                'string.');
        }
        if (options && 'object' !== typeof options) {
            throw new TypeError('node.fs.saveMemoryIndexes: options must be ' +
                                'object or undefined.');
        }

        if (J.isEmpty(memory.__H)) {
            this.node.warn('node.fs.saveMemoryIndexes: no index found.');
            return;
        }
        
        if (!J.existsSync(dir)) {
            throw new Error('node.fs.saveMemoryIndexes: dir is not  ' +
                            'existing or not readable: ' + dir + '.');
        }

        if (dir[dir.length-1] !== '/') dir = dir + '/';

        for (hash in memory.__H) {
            if (memory.__H.hasOwnProperty(hash)){
                if ('undefined' !== typeof memory[hash]) {
                    for (index in memory[hash]) {
                        if (memory[hash].hasOwnProperty(index)) {
                            ipath = dir + hash + '_' + index;
                            indexData = memory[hash][index];
                            if (format === 'csv') {
                                ipath += '.csv';
                                debugger
                                node.fs.writeCsv(ipath,
                                                 indexData.split().fetch(),
                                                 options);
                            }
                            else {
                                ipath += '.nddb';
                                indexData.save(ipath);
                            }

                        }
                    }

                }
            }
        }
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);