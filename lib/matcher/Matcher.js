/**
 * # Bot type implementation of the game stages
 * Copyright(c) 2015 Stefano Balietti <sbalietti@ethz.ch>
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */
(function(exports, node) {

    var J = node.JSUS;

    exports.Matcher = Matcher;

    Matcher.randomAssigner = function(ids) {
        return J.shuffle(ids);
    };

    Matcher.linearAssigner = function(ids) {
        return J.clone(ids);
    };

    function Matcher() {

        this.x = 0;
        this.y = 0;

        this.matches = null;

        this.resolvedMatches = null;
        this.resolvedMatchesById = null;

        this.ids = null;
        this.assignedIds = null;

        this.assignerCb = Matcher.randomAssigner;

        this.missingId = 'bot';
    }

    Matcher.prototype.init = function(options) {
        options = options || {};

        if (options.assignerCb) this.setAssignerCb(options.assignerCb);
        if (options.ids) this.setIds(options.ids);

        this.assignIds();
    };

    Matcher.prototype.setMatches = function(matches) {
        if (!J.isArray(matches)) {
            throw new TypeError('Matcher.setMatches: matches must be array.');
        }
        this.matches = matches;
    };

    Matcher.prototype.setIds = function(ids) {
        if (!J.isArray(ids)) {
            throw new TypeError('Matcher.setIds: ids must be array.');
        }
        this.ids = ids;
    };

    Matcher.prototype.assignIds = function() {
        this.assignedIds = this.assignerCb(this.ids);
    };

    Matcher.prototype.setAssignerCb = function(cb) {
        if ('function' !== typeof cb) {
            throw new TypeError('Matcher.setAssignerCb: cb must be function.');
        }
        this.assignerCb = cb
    };

    Matcher.prototype.match = function() {
        var i, lenI, j, lenJ, pair;
        var matched, matchedId, id1, id2, m1, m2;
        // Re-structure data in a more convenient structure,
        // substituting absolute position of the matching with player ids.
        i = -1, lenI = this.matches.length;
        matched = new Array(lenI);
        matchedId = new Array(lenI);
        for ( ; ++i < lenI ; ) {
            j = -1, lenJ = this.matches[i].length;
            matched[i] = [];
            matchedId[i] = {};
            for ( ; ++j < lenJ ; ) {
                id1 = null, id2 = null;
                pair = this.matches[i][j];
                id1 = importMatchItem(i, j, pair[0], this.assignedIds);
                id2 = importMatchItem(i, j, pair[1], this.assignedIds);
                if (id1) m1 = id2 || this.missingId;
                if (id2) m2 = id1 || this.missingId;
                matchedId[i][id1] = m1;
                matchedId[i][id2] = m2;
                matched[i].push([m1, m2]);
            }
        }
        // Substitute matching-structure.
        this.resolvedMatches = matched;
        this.resolvedMatchesById = matchedId;
    };

    Matcher.prototype.getMatch = function(x, y) {
        var nRows, nCols;
        // Check both x and y.
        if ('undefined' === typeof x && 'undefined' !== typeof y) {
            throw new Error('Matcher.getMatch: cannot specify y without x.');
        }

        // Check x.
        if ('undefined' === typeof x) {
            x = this.x;
        }
        else if ('number' !== typeof x) {
            throw new TypeError('Matcher.getMatch: x must be number ' +
                                'or undefined.');
        }
        else if (x < 0) {
            throw new Error('Matcher.getMatch: x cannot be negative');
        }

        nRows = this.matches.length - 1;
        if (x > nRows) return null;

        nCols = this.matches[x].length - 1;

        if ('undefined' === typeof y) {
            y = this.y;
            if (y < nCols) {
                this.y++;
            }
            else {
                this.x++;
                this.y = 0;
                if (this.x > nRows) return null;
            }
        }
        else if ('number' !== typeof x) {
            throw new TypeError('Matcher.getMatch: x must be number ' +
                                'or undefined.');
        }
        else if (y < 0) {
            throw new Error('Matcher.getMatch: y cannot be negative');
        }
        else if (y > nCols) {
            return null;
        }
        return this.resolvedMatches[x][y];
    };

    // ## Helper methods.

    function importMatchItem(i, j, item, map) {
        if ('number' === typeof item) {
            return map[item];
        }
        else if ('string' === typeof item) {
            return item;
        }
        throw new TypeError('Matcher.match: items can be only string or ' +
                            'number. Found: ' + item + ' at position ' +
                            i + ',' + j);
    }


 //     var matcher = new Matcher();
 //
 //     matcher.setIds(['1','2','3']);
 //     matcher.assignIds();
 //
 //     var m = [
 //         // Round 1.
 //         [
 //             [ 0, 1 ], [ 2, 'bot' ],
 //         ],
 //         // Round 2.
 //         [
 //             [ 1, 2], [ 0, 'bot' ],
 //         ],
 //         // Round 3.
 //         [
 //             [ 2, 0], [ 1, 'bot' ]
 //         ]
 //     ];
 //
 //     matcher.setMatches(m);
 //
 //     matcher.match();
 //
 //     console.log(matcher.resolvedMatches);
 //     console.log(matcher.resolvedMatchesById);
 //
 //     debugger
 //     matcher.getMatch();

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
