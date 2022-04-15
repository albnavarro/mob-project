const STAGGER_START = 'start';
const STAGGER_END = 'end';
const STAGGER_CENTER = 'center';
const STAGGER_EDGES = 'edges';
const STAGGER_RANDOM = 'random';

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
export const getStaggerIndex = (
    index,
    arraylenght,
    stagger,
    randomChoice = []
) => {
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
