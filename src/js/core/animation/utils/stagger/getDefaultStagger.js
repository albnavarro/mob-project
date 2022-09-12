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
    /*
    Get stagger each by fps
    */
    const eachByFps = getEachByFps(each);
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
        const half = parseInt(arraylenght / 2);

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
        const half = parseInt(arraylenght / 2);

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
    arr,
    endArr,
    stagger,
    slowlestStagger,
    fastestStagger,
}) => {
    // get chunk size by col if there is a size ( > -1 )
    const chunckSizeCol =
        stagger.grid.col === -1 ? arr.length : stagger.grid.col;

    // get chunk size by row if there is a size ( > -1 )
    const chunckSizeRow =
        stagger.grid.row === -1 ? arr.length : stagger.grid.row;

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
    const cbByRow = getCbByRow(arr);
    const cbStagger = cbByRow.map((item) => {
        return item != undefined ? item : { arr: () => {} };
    });

    // onComplete callBack
    const cbCompleteByRow = getCbByRow(endArr);
    const cbCompleteStagger = cbCompleteByRow.map((item) => {
        return item != undefined ? item : { arr: () => {} };
    });

    // get chunkes array
    const chuncked = (() => {
        const chunckSize =
            stagger.grid.direction === DIRECTION_ROW
                ? chunckSizeRow
                : chunckSizeCol;

        return sliceIntoChunks(cbStagger, chunckSize);
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
    const flat = chuncked.flat();

    // set data to original (this.callback) array
    flat.forEach((item, i) => {
        cbStagger[i].index = item.index;
        cbStagger[i].frame = item.frame;

        // If there an OnCompelte callack
        if (cbCompleteStagger.length > 0) {
            cbCompleteStagger[i].index = item.index;
            cbCompleteStagger[i].frame = item.frame;
        }
    });

    return {
        cbStagger,
        cbCompleteStagger,
        fastestStagger,
        slowlestStagger,
    };
};
