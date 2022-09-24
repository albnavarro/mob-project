import { getRoundedValue } from '../utils/animationUtils.js';
import { setStagger } from '../utils/stagger/setStagger.js';
import {
    STAGGER_DEFAULT_OBJ,
    STAGGER_TYPE_START,
    STAGGER_TYPE_END,
    STAGGER_TYPE_CENTER,
    STAGGER_TYPE_EQUAL,
} from '../utils/stagger/staggerCostant.js';
import { handleSetUp } from '../../setup.js';
import { checkType } from '../../store/storeType.js';

export const createStaggers = ({ items, stagger, duration }) => {
    const eachProportion = 10;
    const durationNow = duration || handleSetUp.get('sequencer').duration;
    const staggerNow = { ...STAGGER_DEFAULT_OBJ, ...stagger };
    const type = staggerNow.type;
    let each = staggerNow.each;

    /*
     * Fallback is something goes wron
     */
    const fallBack = [...items].map((item, i) => {
        return {
            item,
            start: 0,
            end: duration,
            index: i,
        };
    });

    const stagerTypeList = [
        STAGGER_TYPE_EQUAL,
        STAGGER_TYPE_START,
        STAGGER_TYPE_END,
        STAGGER_TYPE_CENTER,
    ];

    /**
     * Secure check
     **/
    if (staggerNow.grid?.col > items.length) {
        console.warn(
            'stagger col of grid is out of range, it must be less than the number of staggers '
        );
        each = 0;
    }

    /**
     * Check type prop
     */
    if (!stagerTypeList.includes(type)) {
        console.warn(
            `stager.type should be: 
            ${STAGGER_TYPE_EQUAL} ||
            ${STAGGER_TYPE_START} || 
            ${STAGGER_TYPE_END} || 
            ${STAGGER_TYPE_CENTER}`
        );
        return fallBack;
    }

    /**
     * In classic mode each must be between 1 and eachProportion
     */
    if (checkType(Number, each) && (each > eachProportion || each < 1)) {
        console.warn(
            `createStagger: in classic mode each must be between 1 and ${eachProportion}`
        );
        each = 1;
    }

    /**
     * Create stagger Array
     */
    const { staggerArray } = setStagger({
        arr: [...items].map((item) => ({ item })),
        endArr: [],
        stagger: staggerNow,
        slowlestStagger: {},
        fastestStagger: {},
    });

    /**
     * Remove element with no dom item ,is possible with row and item fantasiose
     * In tween there is no problem beciuse use NOOP callback
     * Accpt only dom element and object
     * */
    const staggerArrayFiltered = staggerArray.filter(
        ({ item }) => checkType(Element, item) || checkType(Object, item)
    );

    /*
     * Get the 'Chunk' number
     * 1 - Create an arry with all the frame es: [1,1,2,2,2,3,3,3]
     * 2 - Remove the duplicate frame es; [1,2,3]
     * 3 - The lenght of resulted array is the number of 'chunck' es: 3
     */
    const frameArray = staggerArrayFiltered.map(({ frame }) => frame);
    const frameSet = [...new Set(frameArray)].sort((a, b) => a - b);
    const numItem = frameSet.length;

    /*
     * Final Array
     */
    const staggers = staggerArrayFiltered.map(({ item, frame }) => {
        const index = frameSet.findIndex((item) => item === frame);
        const eachByNumItem = (each * numItem) / eachProportion;

        const { start, end } = (() => {
            if (type === STAGGER_TYPE_EQUAL) {
                if (each === 1) {
                    const stepDuration = durationNow / numItem;
                    const start = getRoundedValue(index * stepDuration);
                    const end = getRoundedValue(start + stepDuration);
                    return { start, end };
                } else {
                    const unit = durationNow / numItem;
                    const staggerDuration = unit * eachByNumItem;
                    const remainSpace = durationNow - staggerDuration;
                    const remainSpaceUnit = remainSpace / (numItem - 1);
                    const staggerStart = remainSpaceUnit * index;
                    return {
                        start: getRoundedValue(staggerStart),
                        end: getRoundedValue(staggerDuration + staggerStart),
                    };
                }
            }

            if (
                type === STAGGER_TYPE_START ||
                type === STAGGER_TYPE_END ||
                type === STAGGER_TYPE_CENTER
            ) {
                const unit = durationNow / numItem;
                const cleanStart = unit * index;
                const noopSpace = durationNow - (durationNow - cleanStart);
                const gap = (noopSpace / numItem) * eachByNumItem;

                if (type === STAGGER_TYPE_START) {
                    return {
                        start: 0,
                        end: getRoundedValue(durationNow - (cleanStart - gap)),
                    };
                }

                if (type === STAGGER_TYPE_CENTER) {
                    const space = (cleanStart - gap) / 2;
                    return {
                        start: getRoundedValue(space),
                        end: getRoundedValue(durationNow - space),
                    };
                }

                if (type === STAGGER_TYPE_END) {
                    return {
                        start: getRoundedValue(cleanStart - gap),
                        end: getRoundedValue(durationNow),
                    };
                }
            }
        })();

        return {
            item,
            start,
            end,
            index,
        };
    });

    return staggers;
};
