import { getRoundedValue } from '../utils/animationUtils.js';
import { setStagger } from '../utils/stagger/setStagger.js';
import {
    STAGGER_DEFAULT_OBJ,
    STAGGER_TYPE_CLASSIC,
    STAGGER_TYPE_EQUAL,
} from '../utils/stagger/staggerCostant.js';
import { handleSetUp } from '../../setup.js';
import { checkType } from '../../store/storeType.js';

export const createStaggers = ({ items, stagger, duration }) => {
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

    const stagerTypeList = [STAGGER_TYPE_EQUAL, STAGGER_TYPE_CLASSIC];

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
            `stager.type should be: ${STAGGER_TYPE_EQUAL} || ${STAGGER_TYPE_CLASSIC}`
        );
        return fallBack;
    }

    /**
     * In classic mode each must be between 1 and 100
     */
    if (
        type === STAGGER_TYPE_CLASSIC &&
        checkType(Number, each) &&
        (each > 100 || each < 1)
    ) {
        console.warn(
            `createStagger: in classic mode each must be between 1 and 100`
        );
        each = 1;
    }

    /**
     * In equal mode each is always 1
     */
    if (type === STAGGER_TYPE_EQUAL && checkType(Number, each) && each !== 1) {
        console.warn(`createStagger: in equal mode each is always 1`);
        each = 1;
    }

    /**
     * Create the arry for setStagger utils, add id, index and frame propierties
     *
     * Normally cb is the callback array
     * In this case we have an arry of dom element
     */
    const initialArray = [...items].map((item, i) => {
        return {
            id: i,
            index: 0,
            frame: 0,
            item,
        };
    });

    const { cbStagger } = setStagger({
        arr: initialArray,
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
    const cbStaggerFiltered = cbStagger.filter(
        ({ item }) => checkType(Element, item) || checkType(Object, item)
    );

    /*
     * Get the 'Chunk' number
     * 1 - Create an arry with all the frame es: [1,1,2,2,2,3,3,3]
     * 2 - Remove the duplicate frame es; [1,2,3]
     * 3 - The lenght of resulted array is the number of 'chunck' es: 3
     */
    const frameArray = cbStaggerFiltered.map(({ frame }) => frame);
    const frameSet = [...new Set(frameArray)].sort((a, b) => a - b);
    const numItem = frameSet.length;

    /*
     * Final Array
     */
    const staggers = cbStaggerFiltered.map(({ item, frame }) => {
        const index = frameSet.findIndex((item) => item === frame);

        const { start, end } = (() => {
            if (type === STAGGER_TYPE_EQUAL) {
                const stepDuration = durationNow / numItem;
                const start = getRoundedValue(index * stepDuration);
                const end = getRoundedValue(start + stepDuration);

                return { start, end };
            }

            if (type === STAGGER_TYPE_CLASSIC) {
                const STAGGER_RANGE = 100;
                const unit = durationNow / numItem;
                const cleanStart = unit * index;
                const noopSpace = durationNow - (durationNow - cleanStart);
                const gap = (noopSpace / STAGGER_RANGE) * each;

                return {
                    start: getRoundedValue(cleanStart - gap),
                    end: getRoundedValue(durationNow),
                };
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
