import { sliceIntoChunks, arrayColumn } from '../animationUtils.js';
import {
    STAGGER_START,
    STAGGER_END,
    STAGGER_CENTER,
    STAGGER_EDGES,
    STAGGER_RANDOM,
    DIRECTION_ROW,
} from './staggerCostant';

// Get random frame without duplicate
export const getRandomChoice = (arr, each, index) => {
    // Get previous result
    const previousFrame = arr.slice(0, index).map((item) => item.frame);

    // Get possibile result
    const posibileFrame = arr.map((item, i) => i * each);

    // Get array of possibile result without previous
    const randomChoice = posibileFrame.filter(
        (x) => !previousFrame.includes(x)
    );

    return randomChoice;
};

// Get frame per index
const getStaggerIndex = (index, arraylenght, stagger, randomChoice = []) => {
    const { from, each } = stagger;
    const isOdd = (num) => num % 2;
    const getRandomInt = (max) => Math.floor(Math.random() * max);

    // STAGGER_INDEX
    const isNumer = (value) => {
        return (
            Object.prototype.toString.call(value) === '[object Number]' &&
            isFinite(value)
        );
    };

    if (from === STAGGER_RANDOM) {
        return {
            index: index,
            frame: (() => randomChoice[getRandomInt(randomChoice.length)])(),
        };
    }

    if (from === STAGGER_START) {
        return {
            index: index,
            frame: index * each,
        };
    }

    if (from === STAGGER_END) {
        return {
            index: index,
            frame: (arraylenght - 1 - index) * each,
        };
    }

    if (from === STAGGER_CENTER) {
        const half = parseInt(arraylenght / 2);

        return (() => {
            if (index > half) {
                // From 0 half
                return {
                    index: index,
                    frame: (index - half) * each,
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
                                    frame: (half - index - 1) * each,
                                }
                              : {
                                    index: index,
                                    frame: (half - index) * each,
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
        const half = parseInt(arraylenght / 2);

        return (() => {
            if (index > half) {
                // From 0 half
                return {
                    index: index,
                    frame: (arraylenght - half - 1 - (index - half)) * each,
                };
            } else if (index < half) {
                // From half to end half
                return isOdd(arraylenght) === 0 && half - index === 1
                    ? {
                          index: index,
                          frame: (half - 1) * each,
                      }
                    : (() => {
                          return isOdd(arraylenght) === 0
                              ? {
                                    index: index,
                                    frame:
                                        (arraylenght - half - (half - index)) *
                                        each,
                                }
                              : {
                                    index: index,
                                    frame:
                                        (arraylenght -
                                            half -
                                            1 -
                                            (half - index)) *
                                        each, // dfault,
                                };
                      })();
            } else {
                return isOdd(arraylenght)
                    ? {
                          index: index,
                          frame: half * each, // dfault,
                      }
                    : {
                          index: index,
                          frame: (half - 1) * each, // dfault,
                      }; // center item
            }
        })();
    }

    if (isNumer(parseInt(from))) {
        // Secure check from must be a value in array length
        const half =
            parseInt(from) >= arraylenght ? arraylenght - 1 : parseInt(from);

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
    cb,
    endCb,
    stagger,
    slowlestStagger,
    fastestStagger,
}) => {
    // get chunk size by col if there is a size ( > -1 )
    const chunckSizeCol =
        stagger.grid.col === -1 ? cb.length : stagger.grid.col;

    // get chunk size by row if there is a size ( > -1 )
    const chunckSizeRow =
        stagger.grid.row === -1 ? cb.length : stagger.grid.row;

    // Function that convert row matrix to col matrix
    const getCbByRow = (arr) => {
        // Reorder main array if direction === row
        if (stagger.grid.direction === DIRECTION_ROW) {
            const chunkByCol = sliceIntoChunks(arr, chunckSizeCol);

            const colToRowArray = [...Array(stagger.grid.col).keys()].reduce(
                (p, c, i) => {
                    return [...p, ...arrayColumn(chunkByCol, i)];
                },
                []
            );

            return [...colToRowArray].flat();
        } else {
            return arr;
        }
    };

    // main callBack
    const cbByRow = getCbByRow(cb);
    const cbNow = cbByRow.map((item) => {
        return item != undefined ? item : { cb: () => {} };
    });

    // onComplete callBack
    const cbCompleteByRow = getCbByRow(endCb);
    const cbCompleteNow = cbCompleteByRow.map((item) => {
        return item != undefined ? item : { cb: () => {} };
    });

    // get chunkes array
    const chuncked = (() => {
        const chunckSize =
            stagger.grid.direction === DIRECTION_ROW
                ? chunckSizeRow
                : chunckSizeCol;

        return sliceIntoChunks(cbNow, chunckSize);
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
    chuncked.forEach((chunkItem, chunkIndex) => {
        chunkItem.forEach((item, i) => {
            if (item) {
                item.index = chuncked[0][i].index;
                item.frame = chuncked[0][i].frame;
            }
        });
    });

    // Flat the chunked array
    const flat = chuncked.flat();

    // set data to original (this.callback) array
    flat.forEach((item, i) => {
        cbNow[i].index = item.index;
        cbNow[i].frame = item.frame;

        // If there an OnCompelte callack
        if (cbCompleteNow.length > 0) {
            cbCompleteNow[i].index = item.index;
            cbCompleteNow[i].frame = item.frame;
        }
    });

    return {
        cbNow,
        cbCompleteNow,
        fastestStagger,
        slowlestStagger,
    };
};
