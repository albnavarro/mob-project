import { sliceIntoChunks, arrayColumn } from '../animationUtils.js';
import {
    STAGGER_START,
    STAGGER_END,
    STAGGER_CENTER,
    STAGGER_EDGES,
    STAGGER_RANDOM,
    DIRECTION_ROW,
} from './staggerCostant';
import { getEachByFps } from './staggerUtils.js';

const isOdd = (num) => num % 2;
const getRandomInt = (max) => Math.floor(Math.random() * max);

// STAGGER_INDEX
const isNumer = (value) => {
    return (
        Object.prototype.toString.call(value) === '[object Number]' &&
        Number.isFinite(value)
    );
};

// Get random frame without duplicate
export const getRandomChoice = (arr, each, index) => {
    // Get previous result
    const previousFrame = new Set(
        arr.slice(0, index).map((item) => item.frame)
    );

    // Get possibile result
    const posibileFrame = arr.map((_item, i) => i * each);

    // Get array of possibile result without previous
    const randomChoice = posibileFrame.filter((x) => !previousFrame.has(x));

    return randomChoice;
};

// Get frame per index
const getStaggerIndex = (index, arraylenght, stagger, randomChoice = []) => {
    const { from, each } = stagger;
    /*
    Get stagger each by fps
    */
    const eachByFps = getEachByFps(each);

    if (from === STAGGER_RANDOM) {
        return {
            index: index,
            frame: (() => randomChoice[getRandomInt(randomChoice.length)])(),
        };
    }

    if (from === STAGGER_START) {
        return {
            index: index,
            frame: index * eachByFps,
        };
    }

    if (from === STAGGER_END) {
        return {
            index: index,
            frame: (arraylenght - 1 - index) * eachByFps,
        };
    }

    if (from === STAGGER_CENTER) {
        const half = Number.parseInt(arraylenght / 2);

        return (() => {
            if (index > half) {
                // From 0 half
                return {
                    index: index,
                    frame: (index - half) * eachByFps,
                };
            } else if (index < half) {
                // From half to end half
                return isOdd(arraylenght) === 0 && half - index === 1
                    ? {
                          index: index,
                          frame: 0,
                      } // Center with even array
                    : (() => {
                          return isOdd(arraylenght) === 0
                              ? {
                                    index: index,
                                    frame: (half - index - 1) * eachByFps,
                                }
                              : {
                                    index: index,
                                    frame: (half - index) * eachByFps,
                                };
                      })();
            } else {
                return {
                    index: index,
                    frame: 0,
                }; // center item
            }
        })();
    }

    if (from === STAGGER_EDGES) {
        const half = Number.parseInt(arraylenght / 2);

        return (() => {
            if (index > half) {
                // From 0 half
                return {
                    index: index,
                    frame:
                        (arraylenght - half - 1 - (index - half)) * eachByFps,
                };
            } else if (index < half) {
                // From half to end half
                return isOdd(arraylenght) === 0 && half - index === 1
                    ? {
                          index: index,
                          frame: (half - 1) * eachByFps,
                      }
                    : (() => {
                          return isOdd(arraylenght) === 0
                              ? {
                                    index: index,
                                    frame:
                                        (arraylenght - half - (half - index)) *
                                        eachByFps,
                                }
                              : {
                                    index: index,
                                    frame:
                                        (arraylenght -
                                            half -
                                            1 -
                                            (half - index)) *
                                        eachByFps, // dfault,
                                };
                      })();
            } else {
                return isOdd(arraylenght)
                    ? {
                          index: index,
                          frame: half * eachByFps, // dfault,
                      }
                    : {
                          index: index,
                          frame: (half - 1) * eachByFps, // dfault,
                      }; // center item
            }
        })();
    }

    if (isNumer(Number.parseInt(from))) {
        // Secure check from must be a value in array length
        const half =
            Number.parseInt(from) >= arraylenght
                ? arraylenght - 1
                : Number.parseInt(from);

        return (() => {
            if (index > half) {
                // From 0 half
                return {
                    index: index,
                    frame: (index - half) * each,
                };
            } else if (index < half) {
                // From half to end half
                return {
                    index: index,
                    frame: (half - index) * each,
                };
            } else {
                return {
                    index: index,
                    frame: 0,
                };
            }
        })();
    }
};

export const getDefaultStagger = ({
    arr,
    endArr,
    stagger,
    slowlestStagger,
    fastestStagger,
}) => {
    /**
     * If col/row is 1 use lenght of array, is used for default stagger without grid.
     * With a value greater than 1 row/col logic is active
     */
    const chunckSizeCol =
        stagger?.grid?.col <= 1 ? arr.length : stagger.grid.col;
    const chunckSizeRow =
        stagger?.grid?.row <= 1 ? arr.length : stagger.grid.row;

    /**
     * Default grid direction is COL
     * In case of ROW grid covert col to row, something like rotate the matrix
     */
    const getItemsByRow = (arr) => {
        // Reorder main array if direction === row
        if (stagger.grid.direction === DIRECTION_ROW) {
            const chunkByCol = sliceIntoChunks(arr, chunckSizeCol);

            const colToRowArray = [
                ...new Array(stagger.grid.col).keys(),
            ].reduce((p, _c, i) => {
                return [...p, ...arrayColumn(chunkByCol, i)];
            }, []);

            return [...colToRowArray].flat();
        } else {
            return arr;
        }
    };

    // main callBack
    const itemByRow = getItemsByRow(arr);
    const staggerArray = itemByRow.map((item) => {
        return item && item !== undefined ? item : { arr: () => {} };
    });

    // onComplete callBack
    const itemCompleteByRow = getItemsByRow(endArr);
    const staggerArrayOnComplete = itemCompleteByRow.map((item) => {
        return item && item !== undefined ? item : { arr: () => {} };
    });

    // get chunkes array
    const chuncked = (() => {
        const chunckSize =
            stagger.grid.direction === DIRECTION_ROW
                ? chunckSizeRow
                : chunckSizeCol;

        return sliceIntoChunks(staggerArray, chunckSize);
    })();

    const firstChunk = chuncked[0];

    // Get First row stagger
    firstChunk.forEach((item, i) => {
        const { index, frame } = getStaggerIndex(
            i,
            chuncked[0].length,
            stagger,
            getRandomChoice(firstChunk, stagger.each, i)
        );

        item.index = index;
        item.frame = frame;

        if (frame >= slowlestStagger.frame)
            slowlestStagger = {
                index,
                frame,
            };

        if (frame <= fastestStagger.frame)
            fastestStagger = {
                index,
                frame,
            };
    });

    // Set other chunk, copy from first [0]
    chuncked.forEach((chunkItem) => {
        chunkItem.forEach((item, i) => {
            if (item) {
                item.index = chuncked[0][i].index;
                item.frame = chuncked[0][i].frame;
            }
        });
    });

    // Flat the chunked array
    const flatArray = chuncked.flat();

    // set data to original (this.callback) array
    flatArray.forEach((item, i) => {
        staggerArray[i].index = item.index;
        staggerArray[i].frame = item.frame;

        // If there an OnCompelte callack
        if (staggerArrayOnComplete.length > 0) {
            staggerArrayOnComplete[i].index = item.index;
            staggerArrayOnComplete[i].frame = item.frame;
        }
    });

    return {
        staggerArray,
        staggerArrayOnComplete,
        fastestStagger,
        slowlestStagger,
    };
};
