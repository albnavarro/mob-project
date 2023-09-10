// @ts-check

import { handleSetUp } from '../setup.js';

/**
 * @typedef {('min'|'max')} mqChoiceType - string
 **/

/**
 * @typedef {('min'|'max'|'get')} mqType - string
 **/

/**
 * @typedef {Object} mqTypeObject
 * @prop {('min'|'max')} [ queryType = "min" ] - Defines whether the defined breakpoint will be a max-with or a min-width. The default is 'min-width'.
 **/

/**
 * @typedef {('xSmall'|'small'|'medium'|'tablet'|"desktop"|'large'|'xLarge' )} breackPointType
 */

/**
 * @typedef {Object} breackPointTypeObj
 * @prop {('xSmall'|'small'|'medium'|'tablet'|"desktop"|'large'|'xLarge' )} [ breackpoint ]
 */

/**
 * @typedef {Object} breackPointTypeObjKeyValue
 * @prop { Number } [ xSmall ]
 * @prop { Number } [ small ]
 * @prop { Number } [ medium ]
 * @prop { Number } [ tablet ]
 * @prop { Number } [ desktop ]
 * @prop { Number } [ large ]
 * @prop { Number } [ xLarge ]
 */

/**
 * @description
 *
 * @example
 *
 * ```js
 *   Property schema:
 *   mq.min([string])
 *   mq.max([string])
 *   mq.getBreackpoint([string])
 *
 *   const isDesktop = mq.min('desktop'); // true/false
 *   const isMobile = mq.min('desktop'); // true/false
 *   const desktopBreackPoint = mobbu.getBreackpoint('desktop'); // 992
 *
 *
 *
 * ```
 */
export const mq = (() => {
    /**
     * @param { breackPointType } breackpoint -
     * @return {Boolean}
     */
    const max = (breackpoint = 'desktop') => {
        return window.innerWidth < handleSetUp.get('mq')[breackpoint];
    };

    /**
     * @param { breackPointType } breackpoint -
     * @return {Boolean}
     */
    const min = (breackpoint = 'desktop') => {
        return window.innerWidth >= handleSetUp.get('mq')[breackpoint];
    };

    /**
     * @param { breackPointType } breackpoint -
     * @return {Number}
     */
    const getBreackpoint = (breackpoint = 'desktop') => {
        return handleSetUp.get('mq')[breackpoint];
    };

    return { max, min, getBreackpoint };
})();
