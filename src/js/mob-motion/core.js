// @ts-check

import { mq as _mq } from './utils/media-manager.js';
import { handleSetUp } from './setup.js';

/**
 * - Here it is possible to modify the default values of the various modules of the library
 *
 * @example
 *     ```javascript
 *     Default value schema:
 *
 *     MobMotionCore.setDefault.set({
 *         startFps: 60,
 *         deferredNextTick: false,
 *         throttle: 100,
 *         usePassive: true
 *         mq: {
 *             xSmall: 320,
 *             small: 360,
 *             medium: 600,
 *             tablet: 768,
 *             desktop: 992,
 *             large: 1200,
 *             xLarge: 1400,
 *         },
 *         defaultMq: {
 *             value: 'desktop',
 *             type: 'min',
 *         },
 *         sequencer: {
 *             duration: 10,
 *             ease: 'easeLinear',
 *         },
 *         scrollTrigger: {
 *             springConfig: 'default',
 *             lerpConfig: 0.06,
 *             markerColor: {
 *                 startEnd: '#ff0000',
 *                 item: '#14df3b',
 *             },
 *         },
 *         parallax: {
 *             defaultRange: 8,
 *             springConfig: 'default',
 *             lerpConfig: 0.06,
 *         },
 *         parallaxTween: {
 *             duration: 10,
 *             ease: 'easeLinear',
 *         },
 *         tween: {
 *             duration: 1000,
 *             ease: 'easeLinear',
 *             relative: false,
 *         },
 *         spring: {
 *             relative: false,
 *             config: {
 *                 default: {
 *                     tension: 20,
 *                     mass: 1,
 *                     friction: 5,
 *                     velocity: 0,
 *                     precision: 0.01,
 *                 },
 *                 gentle: {
 *                     tension: 120,
 *                     mass: 1,
 *                     friction: 14,
 *                     velocity: 0,
 *                     precision: 0.01,
 *                 },
 *                 wobbly: {
 *                     tension: 180,
 *                     mass: 1,
 *                     friction: 12,
 *                     velocity: 0,
 *                     precision: 0.01,
 *                 },
 *                 bounce: {
 *                     tension: 200,
 *                     mass: 3,
 *                     friction: 5,
 *                     velocity: 0,
 *                     precision: 0.01,
 *                 },
 *                 scroller: {
 *                     tension: 10,
 *                     mass: 1,
 *                     friction: 5,
 *                     velocity: 0,
 *                     precision: 0.5,
 *                 },
 *             },
 *         },
 *         lerp: {
 *             relative: false,
 *             precision: 0.01,
 *             velocity: 0.06,
 *         },
 *     });
 *
 *
 *     ```;
 *
 * @type {import('./animation/utils/set-up/type.js').SetSetUp} props
 */
function setDefault(props) {
    handleSetUp.set(props);
}

/**
 * Returns the value of a specific property
 *
 * @example
 *     ```javascript
 *     MobMotionCore.getDefault('parallax');
 *     ```;
 *
 * @type {import('./animation/utils/set-up/type.js').GetSetUp} prop
 */
function getDefault(prop) {
    return handleSetUp.get(prop);
}

/**
 * Perform a console.log() of the default values
 *
 * @example
 *     ```javascript
 *     MobMotionCore.printDefault();
 *     ```;
 */
function printDefault() {
    handleSetUp.print();
}

/**
 * @example
 *     ```javascript
 *       Property schema:
 *       MobMotionCore.mq([String], [string])
 *
 *       const isDesktop = MobMotionCore.mq('min', 'desktop'); // true/false
 *       const isMobile = MobMotionCore.mq('max', 'desktop'); // true/false
 *       const desktopBreackPoint = core.mq('get', 'desktop'); // 992
 *
 *
 *
 *     ```;
 *
 * @param {import('./utils/type.js').MqActionMethods} action
 * @param {import('./utils/type.js').MqValues} breakpoint
 * @returns {boolean | number} Returns a boolean value if the action value is equal to 'min' or 'max', returns a numeric
 *   value if it is equal to 'get'
 */
function mq(action, breakpoint) {
    switch (action) {
        case 'min': {
            return _mq['min'](breakpoint);
        }

        case 'max': {
            return _mq['max'](breakpoint);
        }

        case 'get': {
            return _mq['getBreackpoint'](breakpoint);
        }
    }
}

export { setDefault, printDefault, getDefault, mq };
export { clamp } from './animation/utils/animation-utils.js';
