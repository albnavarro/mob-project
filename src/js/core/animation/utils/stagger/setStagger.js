import { getDefaultStagger } from './getDefaultStagger.js';
import { getRadialArray } from './getRadialStagger.js';
import { DIRECTION_RADIAL } from './staggerCostant.js';

export const setStagger = ({
    cb,
    endCb,
    stagger,
    slowlestStagger,
    fastestStagger,
}) => {
    const result = (() => {
        // Check if direction is an object like {x: n, y: n}
        if (
            Object.prototype.toString.call(stagger.from) ===
                '[object Object]' &&
            'x' in stagger.from &&
            'y' in stagger.from &&
            stagger.grid.direction === DIRECTION_RADIAL
        ) {
            /**
             * GRID STAGGER
             * stagger: {
             *    each: 15,
             *    from: { x: 6, y: 2 },
             *    grid: { col: 9, row: 9, direction: 'radial' },
             *    waitComplete: false,
             *  },
             * **/
            const { cleanArray: cleanCb } = getRadialArray(cb, stagger);

            // Get stagger index the minumn and the fastest and the slowest
            let counter = 0;
            cleanCb.forEach((chunk, i) => {
                chunk.forEach((item, iChunk) => {
                    const frame = i * stagger.each;
                    item.index = counter;
                    item.frame = frame;

                    if (frame >= slowlestStagger.frame)
                        slowlestStagger = {
                            index: counter,
                            frame,
                        };

                    if (frame <= fastestStagger.frame)
                        fastestStagger = {
                            index: counter,
                            frame,
                        };

                    counter++;
                });
            });

            // Get on Complete Callback
            const cleanEndCb = (() => {
                if (endCb.length > 0) {
                    const { cleanArray } = getRadialArray(endCb, stagger);
                    return cleanArray.flat();
                } else {
                    return [];
                }
            })();

            const cbNow = cleanCb.flat();
            const endCbNow = cleanEndCb.flat();

            // Update onComplete cb with right stagger
            cbNow.forEach((item, i) => {
                // If there an OnCompelte callack
                if (endCbNow.length > 0) {
                    endCbNow[i].index = item.index;
                    endCbNow[i].frame = item.frame;
                }
            });

            return {
                cbNow,
                cbCompleteNow: endCbNow,
                fastestStagger,
                slowlestStagger,
            };
        } else {
            /**
             * DEFAULT STAGGER
             * grid: { col: n, row: n, direction: 'row' },
             * **/
            return getDefaultStagger({
                cb,
                endCb,
                stagger,
                slowlestStagger,
                fastestStagger,
            });
        }
    })();

    const cbNow = result.cbNow;
    const cbCompleteNow = result.cbCompleteNow;
    fastestStagger = result.fastestStagger;
    slowlestStagger = result.slowlestStagger;

    return {
        cbNow,
        cbCompleteNow,
        fastestStagger,
        slowlestStagger,
    };
};
