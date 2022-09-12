import { getRoundedValue } from '../utils/animationUtils.js';
import { setStagger } from '../utils/stagger/setStagger.js';
import { STAGGER_DEFAULT_OBJ } from '../utils/stagger/staggerCostant.js';
import { handleSetUp } from '../../setup.js';
import { checkType } from '../../store/storeType.js';

export const createStaggers = ({ items, stagger, duration }) => {
    const EQUAL = 'equal';
    const STAGGER_RANGE = 100;
    const durationNow = duration || handleSetUp.get('sequencer').duration;
    const staggerNow = { ...STAGGER_DEFAULT_OBJ, ...stagger };
    const eachList = [EQUAL];

    /**
     * Secure check
     **/
    if (staggerNow.grid?.col > items.length) {
        console.warn(
            'stagger col of grid is out of range, it must be less than the number of staggers '
        );
        stagger.each = 0;
    }

    const eachIsStrign = checkType(String, stagger?.each);
    const eachIsNumber = checkType(Number, stagger?.each);

    /**
     * Each Type check
     * Must be a number or 'equal' string
     **/
    if (
        (!eachIsStrign && !eachIsNumber) ||
        (eachIsStrign && !eachList.includes(stagger.each))
    ) {
        console.warn(
            `Stagger error: in each must be a number or a string setted to equal`
        );
        stagger.each = 0;
    }

    /**
     * Get the final stagger Object
     **/
    const isEqual = stagger?.each === EQUAL;
    const each = isEqual ? 1 : stagger.each;
    const staggerFinal = { ...staggerNow, ...{ each } };

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
        stagger: staggerFinal,
        slowlestStagger: {},
        fastestStagger: {},
    });

    /**
     * Remove element with no dom item ,is possible with row and item fantasiose
     * In tween there is no problem beciuse use NOOP callback
     * */
    const cbStaggerFiltered = cbStagger.filter(({ item }) =>
        checkType(Element, item)
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
            item,
            start,
            end,
            index,
        };
    });

    return staggers;
};
