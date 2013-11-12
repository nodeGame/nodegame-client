var J = JSUS = require('JSUS').JSUS;

function combinations(arr, k) {
    var i,
    subI,
    ret = [],
    sub,
    next;
    for (i = 0; i < arr.length; i++) {
        if (k === 1) {
            ret.push( [ arr[i] ] );
        }
        else {
            sub = combinations(arr.slice(i+1, arr.length), k-1);
            for (subI = 0; subI < sub.length; subI++) {
                next = sub[subI];
                next.unshift(arr[i]);
                ret.push(next);
            }
        }
    }
    return ret;
}


function combinations2(arr, k) {
    var i,
    subI,
    sub,
    next,
    entries = {},
    partialReturn;
    
    for (i = 0; i < arr.length; i++) {
        if (!entries[arr[i]]) {
            entries[arr[i]] = [];
        }

        if (k === 1) {
            ret.push([arr[i]]);
        }
        else {
            sub = combinations(arr.slice(i+1, arr.length), k-1);

            for (subI = 0; subI < sub.length; subI++) {
                
                next = sub[subI];
                next.unshift(arr[i]);
                entries[arr[i]].push(next);
                for (var j = 0; j < sub[subI].length; j++) {
                    var other = sub[subI][j];
                    if (!entries[other]) entries[other] = [];
                    if (arr[i] !== other) {
                        // next.push(arr[i])
                        entries[other].push(next);
                    }
                }
            }
        }
    }
    return entries;
}



function combinations3(arr, k) {
    var i,
    subI,
    sub,
    next,
    entries = {},
    index = {};
    
    for (i = 0; i < arr.length; i++) {
        if (!entries[arr[i]]) {
            entries[arr[i]] = [];
        }

        if (k === 1) {
            ret.push([arr[i]]);
        }
        else {
            sub = combinations(arr.slice(i+1, arr.length), k-1);

            for (subI = 0; subI < sub.length; subI++) {
                
                next = sub[subI];
                next.unshift(arr[i]);
                entries[arr[i]].push(next);

                if (!index[next]) index[next] = [];

                index[next].push([arr[i], (entries[arr[i]].length-1)]);

                for (var j = 0; j < sub[subI].length; j++) {
                    var other = sub[subI][j];
                    if (!entries[other]) entries[other] = [];
                    if (arr[i] !== other) {
                        // next.push(arr[i])
                        entries[other].push(next);
                        index[next].push([other, (entries[other].length-1)]);
                    }
                }
            }
        }
    }
    
    return {
        entries: entries,
        index: index,
    }
}


function perfectStranger(pool, k, R, shuffledPool) {
    var i, len;
    var out;
    var outComb = combinations3(pool, k);
    index = outComb.index;
    entries = outComb.entries;
    out = [];
    len = pool.length;

    // console.log(index);

    var thisComb, thisIndex;
    var finished = false;
    var leftOver, matched;

    for (j = -1; ++j < R;) {
        outRow = [];
        i = -1;
        leftOver = pool.length;
        matched = {};
        unmatched = {};
        unmatchedCount = 0;
        tmpMatches = [];
        while (leftOver > 0 && i < pool.length) {
            console.log(i);
            elem = shuffledPool[++i];
            
            if (matched[elem]) continue;
            thisComb = null;
            I = -1;
            
            if (!entries[elem]) {
                debugger;
            }
            

            while (!thisComb && I < entries[elem].length) {
                I++;
                thisComb = entries[elem][I];
                
                if (I > 10) debugger

                console.log(I);
                if (!thisComb) continue;
                // mark element as matched
                for (var m = 0; m < thisComb.length; m++) {
                    if (matched[thisComb[m]]) {
                        thisComb = null;
                        break;
                    }
                }

            }

            if (!thisComb) {
                unmatched[elem] = true;
                umatchedCount = 0;
                continue;
            }

            outRow.push(thisComb);
            
            leftOver-= k;
            
            // mark element as matched
            for (var m = 0; m < thisComb.length; m++) {
                matched[thisComb[m]] = true;
            }

            // delete matched combinations
            thisIndex = index[thisComb]
            for (var z = -1 ; ++z < thisIndex.length; ) {
                delete entries[thisIndex[z][0]][thisIndex[z][1]];
                // no need to clean the index...
            }
        }


        out.push(outRow);
    }
    return {
        out: out,
        entries: entries
    };

}



latinSquare = function(seq, N, self) {
    var latin, idx, start, limit, extracted;
    
    if (!J.isArray(seq)) {
        throw new Error('latinSquare: seq must be array.');
    }
    if (!seq.length) {
        throw new Error('latinSquare: seq has no element.');
    }

    S = seq.length;
    self = 'undefined' === typeof self ? true : self;
    
    if (N && 'number' !== typeof N) {
        throw new Error('latinSquare: N must be number or undefined.');
    }

    if (N < 1) {
        throw new Error('latinSquare: N must be greater than 0.');
    }

    if (S < N) {
        throw new Error('latinSquare: infinite loop detected for N > ' + 
                        'seq.length.');
    }

    if (S === N && !self) {
        throw new Error('latinSquare: infinite loop detected for S = N ' +
                        'and self = false');
    }

    latin = [];
    idx = null;

    start = 0;
    limit = self ? S-1 : S-2;
    extracted = [];

    for (i = 0 ; i < N ; i++) {
        thisSeq = self ? seq : seq.slice(i+1).concat(seq.slice(0,i));
        do {
            // start excluded, limit included.
            idx = JSUS.randomInt(start,limit);
            console.log(extracted);
            console.log(idx)
            console.log(i);
            console.log(extracted.length);
            console.log(thisSeq)
        }
        while (JSUS.in_array(thisSeq[idx], extracted));

        extracted.push(thisSeq[idx]);
        if (!thisSeq[idx]) debugger
        
        if (idx === 1) {
            latin[i] = thisSeq.slice(idx);
            latin[i].push(thisSeq[0]);
        }
        else {
            latin[i] = thisSeq.slice(idx).concat(thisSeq.slice(0, idx));
        }
    }
    return latin;
};


perfectStranger = function(pool, R) {
    var square, match;
    var i, j;
    var N, S;
    S = pool.length;
    N = pool.length -1;
    square = latinSquare(S, N, false, pool);
    match = [];
    j = -1;
    for ( ; ++j < R-1 ; ) {
        if (!match[j]) match[j] = [];
        i = -1;
        for ( ; ++i < N ; ) {
            match[j].push([pool[i]].concat(square[i][j]));
        }
    }
    return match;
};

perfectStranger = function(pool, R) {
    var square, match;
    var i, j;
    var N, S;
    S = pool.length;
    N = pool.length -1;
    square = latinSquare(S, N, false, pool);
    console.log(square)
    match = [];
    j = -1;
    for ( ; ++j < R  ; ) {
        if (!match[j]) match[j] = [];
        i = -1;
        for ( ; ++i < N / 2; ) {
            match[j].push([square[2*i][j], square[(2*i)+1][j]]);
        }
    }
    return match;
};

var pool = J.seq(1,10);

// var match = perfectStranger(pool, 9);

var square = latinSquare(pool, 10, true);
console.log(square);
console.log('b');

