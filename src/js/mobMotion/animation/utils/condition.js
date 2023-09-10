// @ts-check

import { mobCore } from '../../../mobCore';
import { staggerEachWarning } from './warning';

/**
 * @param {Number} each
 * @param {Boolean} firstRun
 * @param {Array.<{cb:function,id:number,index:Number,frame:Number}>} arrayToCompare1
 * @param {Array.<{cb:function,id:number,index:Number,frame:Number}>} arrayToCompare2
 */
export const shouldInizializzeStagger = (
    each,
    firstRun,
    arrayToCompare1,
    arrayToCompare2
) => {
    if (!mobCore.checkType(Number, each)) {
        staggerEachWarning();
    }

    return (
        each > 0 &&
        firstRun &&
        (arrayToCompare1.length > 0 || arrayToCompare2.length > 0)
    );
};
