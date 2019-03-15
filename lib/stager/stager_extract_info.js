/**
 * # Stager Extract Info
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    var Stager = node.Stager;

    /**
     * #### Stager.getSequence
     *
     * Returns the sequence of stages
     *
     * @param {string} format 'hstages' for an array of human-readable
     *   stage descriptions, 'hsteps' for an array of human-readable
     *   step descriptions, 'o' for the internal JavaScript object
     *
     * @return {array|object|null} The stage sequence in requested
     *   format. NULL on error.
     */
    Stager.prototype.getSequence = function(format) {
        var result;
        var seqIdx;
        var seqObj;
        var stepPrefix;

        switch (format) {
        case 'hstages':
            result = [];

            for (seqIdx in this.sequence) {
                if (this.sequence.hasOwnProperty(seqIdx)) {
                    seqObj = this.sequence[seqIdx];

                    switch (seqObj.type) {
                    case 'gameover':
                        result.push('[game over]');
                        break;

                    case 'plain':
                        result.push(seqObj.id);
                        break;

                    case 'repeat':
                        result.push(seqObj.id + ' [x' + seqObj.num +
                            ']');
                        break;

                    case 'loop':
                        result.push(seqObj.id + ' [loop]');
                        break;

                    case 'doLoop':
                        result.push(seqObj.id + ' [doLoop]');
                        break;

                    default:
                        throw new Error('Stager.getSequence: unknown' +
                                        'sequence object type: ' + seqObj.type);
                    }
                }
            }
            break;

        case 'hsteps':
            result = [];

            for (seqIdx in this.sequence) {
                if (this.sequence.hasOwnProperty(seqIdx)) {
                    seqObj = this.sequence[seqIdx];
                    stepPrefix = seqObj.id + '.';

                    switch (seqObj.type) {
                    case 'gameover':
                        result.push('[game over]');
                        break;

                    case 'plain':
                        seqObj.steps.map(
                            function(stepID) {
                                result.push(stepPrefix + stepID);
                            }
                        );
                        break;

                    case 'repeat':
                        seqObj.steps.map(
                            function(stepID) {
                                result.push(stepPrefix + stepID +
                                    ' [x' + seqObj.num + ']');
                            }
                        );
                        break;

                    case 'loop':
                        seqObj.steps.map(
                            function(stepID) {
                                result.push(stepPrefix +
                                            stepID + ' [loop]');
                            }
                        );
                        break;

                    case 'doLoop':
                        seqObj.steps.map(
                            function(stepID) {
                                result.push(stepPrefix +
                                            stepID + ' [doLoop]');
                            }
                        );
                        break;

                    default:
                        throw new Error('Stager.getSequence: unknown' +
                                        'sequence object type: ' + seqObj.type);
                    }
                }
            }
            break;

        case 'o':
            result = this.sequence;
            break;

        default:
            throw new Error('Stager.getSequence: invalid format: ' + format);
        }

        return result;
    };

    /**
     * #### Stager.extractStage
     *
     * Returns a minimal state package containing one or more stages
     *
     * The returned package consists of a `setState`-compatible object
     * with the `steps` and `stages` properties set to include the given
     * stages.
     * The `sequence` is optionally set to a single `next` block for the
     * stage.
     *
     * @param {string|array} ids Valid stage name(s)
     * @param {boolean} useSeq Optional. Whether to generate a singleton
     *   sequence.  TRUE by default.
     *
     * @return {object|null} The state object on success, NULL on error
     *
     * @see Stager.setState
     */
    Stager.prototype.extractStage = function(ids, useSeq) {
        var result;
        var stepIdx, stepId;
        var stageId;
        var stageObj;
        var idArray, idIdx, id;

        if (ids instanceof Array) {
            idArray = ids;
        }
        else if ('string' === typeof ids) {
            idArray = [ ids ];
        }
        else return null;

        result = { steps: {}, stages: {}, sequence: [] };

        // undefined (default) -> true
        useSeq = (useSeq === false) ? false : true;

        for (idIdx in idArray) {
            if (idArray.hasOwnProperty(idIdx)) {
                id = idArray[idIdx];

                stageObj = this.stages[id];

                if (!stageObj) return null;

                // Add step objects:
                for (stepIdx in stageObj.steps) {
                    if (stageObj.steps.hasOwnProperty(stepIdx)) {
                        stepId = stageObj.steps[stepIdx];
                        result.steps[stepId] = this.steps[stepId];
                    }
                }

                // Add stage object:
                stageId = stageObj.id;
                result.stages[stageId] = stageObj;

                // If given id is alias, also add alias:
                if (stageId !== id) result.stages[id] = stageObj;

                // Add mini-sequence:
                if (useSeq) {
                    result.sequence.push({
                        type: 'plain',
                        id: stageId
                    });
                }
            }
        }

        return result;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
