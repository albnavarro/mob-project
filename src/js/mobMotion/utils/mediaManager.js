// @ts-check

import { handleSetUp } from '../setup.js';

/**
 * @param { import('./type.js').mqValues } breakpoint
 * @return {boolean}
 */
const max = (breakpoint = 'desktop') => {
    return window.innerWidth < handleSetUp.get('mq')[breakpoint];
};

/**
 * @param { import('./type.js').mqValues } breakpoint
 * @return {boolean}
 */
const min = (breakpoint = 'desktop') => {
    return window.innerWidth >= handleSetUp.get('mq')[breakpoint];
};

/**
 * @param { import('./type.js').mqValues } breakpoint
 * @return {number}
 */
const getBreackpoint = (breakpoint = 'desktop') => {
    return handleSetUp.get('mq')[breakpoint];
};

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
 * ```
 */
export const mq = (() => {
    return { max, min, getBreackpoint };
})();
