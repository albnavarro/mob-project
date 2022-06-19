import { clamp, getRoundedValue } from '../utils/animationUtils.js';
import { setStagger } from '../utils/stagger/setStagger.js';
import {
    DIRECTION_COL,
    STAGGER_DEFAULT_OBJ,
    STAGGER_DEFAULT_INDEX_OBJ,
} from '../utils/stagger/staggerCostant.js';

export const SEQUENCER_DEFAULT_DURATION = 10;

export const createStaggers = ({ items, stagger, duration }) => {
    const EQUAL = 'equal';
    const STAGGER_RANGE = 100;
    const durationNow = duration ? duration : SEQUENCER_DEFAULT_DURATION;
    const staggerNow = { ...STAGGER_DEFAULT_OBJ, ...stagger };

    if (staggerNow.grid.col > items.length) {
        console.warn(
            'stagger col of grid is out of range, it must be less than the number of staggers '
        );
        return;
    }

    const isEqual = 'each' in stagger && stagger.each === EQUAL;
    const each = isEqual ? 1 : stagger.each;
    const staggerFinal = { ...staggerNow, ...{ each } };

    const cb = [...items].map((item, i) => {
        return {
            id: i,
            index: 0,
            frame: 0,
            cb: item,
        };
    });

    const { cbNow } = setStagger({
        cb,
        endCb: [],
        stagger: staggerFinal,
        slowlestStagger: {},
        fastestStagger: {},
    });

    /**
     * Remove element with no dom item ,is possible with row and item fantasiose
     * In tween there is no problem beciuse use NOOP callback
     * */
    const cbNowFiltered = cbNow.filter(
        ({ cb }) => cb instanceof Element || cb instanceof HTMLDocument
    );

    // Num of total different stagger by frame
    const frameArray = cbNowFiltered.map(({ frame }) => frame);

    // Remove duplicate and sort from 0
    const frameSet = [...new Set(frameArray)].sort((a, b) => a - b);

    // Number of stagger chunk
    const numItem = frameSet.length;

    const staggers = cbNowFiltered.map(({ cb, frame }) => {
        const index = frameSet.findIndex((item) => item === frame);

        const { start, end } = (() => {
            if (isEqual) {
                const stepDuration = durationNow / numItem;
                const start = getRoundedValue(index * stepDuration);
                const end = getRoundedValue(start + stepDuration);

                return { start, end };
            } else {
                return (() => {
                    const unit = durationNow / numItem;
                    const cleanStart = unit * index;
                    const noopSpace = durationNow - (durationNow - cleanStart);
                    const gap = (noopSpace / STAGGER_RANGE) * stagger.each;

                    return {
                        start: getRoundedValue(cleanStart - gap),
                        end: getRoundedValue(durationNow),
                    };
                })();
            }
        })();

        return {
            item: cb,
            start,
            end,
            index,
        };
    });

    return staggers;
};
