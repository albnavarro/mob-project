import { clamp } from '../utils/animationUtils.js';
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

    // Num of total different stagger by frame
    const frameArray = cbNow.map(({ frame }) => frame);

    // Remove duplicate and sort from 0
    const frameSet = [...new Set(frameArray)].sort((a, b) => a - b);

    // Number of stagger chunk
    const numItem = frameSet.length;

    const staggers = cbNow.map(({ cb, frame }) => {
        const index = frameSet.findIndex((item) => item === frame);

        const { start, end } = (() => {
            if (isEqual) {
                const stepDuration = durationNow / numItem;
                const start = index * stepDuration;
                const end = start + stepDuration;

                return { start, end };
            } else {
                return (() => {
                    const unit = durationNow / numItem;
                    const cleanStart = unit * index;
                    const noopSpace = durationNow - (durationNow - cleanStart);
                    const gap = (noopSpace / STAGGER_RANGE) * stagger.each;

                    return {
                        start: cleanStart - gap,
                        end: durationNow,
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
