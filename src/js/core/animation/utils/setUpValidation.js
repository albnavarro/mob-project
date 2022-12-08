import { checkType, getTypeName } from '../../store/storeType';
import { springPresetConfig } from '../spring/springConfig.js';

/**
 * @typedef {Object} handleSetUpSetType
 * @prop {Number} startFps -  The fallback FPS value before it is detected.
 * Default: `startFps: 60`.
 *
 * @prop {Object.<string, number>} fpsScalePercent - Control the render phase when fps drop occurs. The key represents the number of fps dropped, the value represents the interval of frames needed to perform a new rendering, eg: if from a stable value of 60fps it drops to 44fps (there is a drop of 15 fps) the rendering will be performed every 2 frames and so on. This mechanism is designed to make the browser work less whenever there are bottle caps that prevent it from working smoothly. You can disable this layering by disabling the `useScaleFps` property.
 * Default: `fpsScalePercent: { 0: 1, 15: 2, 30: 3, 45: 4 }`.
 *
 * @prop {Boolean} useScaleFps - Enable or disable conditional rendering based on fps drop.
 * Default: `useScaleFps: true`.
 *
 * @prop {Boolean}  deferredNextTick - If the property is set to true, all functions related to nextTick will be executed at the end of the request animation frame.
 * Default:  `deferredNextTick: true`.
 *
 * @prop {Number} throttle - Throttle value in milliseconds.
 * Default: `throttle: 100`.
 *
 * @prop {import('../../utils/mediaManager.js').breackPointTypeObjKeyValue} mq - Object representing key and value of the default breakpoints.
 * deafult keys: `xSmall, small, medium, tablet, desktop, large, xLarge`.
 * es: `desktop: 992`.
 *
 * @prop {Object} defaultMq - Object representing the default values of the media queries used by parallax and scrollTrigger.
 * @prop {import('../../utils/mediaManager.js').breackPointType} defaultMq.value - parallax/scrollTrigger breackpoint default value, choice: `xSmall, small, medium, tablet, desktop, large, xLarge`
 * Default:  `{ value: 'desktop' }`
 *
 * @prop {import('../../utils/mediaManager.js').mqChoiceType} defaultMq.type - parallax/scrollTrigger mediaQuery type default value, choice is `min , max`,
 * Default:  `{ type: 'min' }`
 *
 * @prop {Object} sequencer - sequencer default properties
 * @prop {Number} sequencer.duration - Default value of the time range of the animation, both syncTimeline and scrollTrigger will take care of processing the value as needed.
 * Default: `{ duration: 10 }`
 *
 * @prop {import('../tween/tweenConfig.js').easeStringTypes} sequencer.ease - Default essing function used by the sequencer.
 * Default: `{ ease: easeLinear }`
 *
 * @prop {Object} scrollTrigger - scrollTrigger default properties
 * @prop {import('../spring/springConfig.js').springConfigStringTypes} scrollTrigger.springConfig - Spring config, choice: `default, gentle, wobbly, bounce, scroller`.
 * Deafult: `{ springConfig: 'default' }`
 *
 * @prop {Number} scrollTrigger.lerpConfig - default value of lerp velocity,
 * Deafult: `{ lerpConfig: 0.06 }`
 *
 * @prop {Object} scrollTrigger.markerColor - default marker color.
 * @prop {String} scrollTrigger.markerColor.startEnd - Default color of start|end marker,
 * Default: `{ startEnd:  '#ff0000' }`.
 *
 * @prop {String} scrollTrigger.markerColor.item - Default color of item marker. This marker is only visible with the active pin.
 * Default: `{ item: '#14df3b' }`.
 *
 * @prop {Object} parallax - parallax default properties
 * @prop {Number} parallax.defaultRange - default value of the property that defines the calculation of the distance value,
 * Default: `{ defaultRange: 8 }`
 *
 * @prop {import('../spring/springConfig.js').springConfigStringTypes} parallax.springConfig - Deafult spring config, choice: `default, gentle, wobbly, bounce, scroller`,
 * Default: `{ springConfig: 'default' }`.
 *
 * @prop {Number} parallax.lerpConfig - default value of lerp velocity,
 * Default: `{ lerpConfig: 0.06 }`.
 *
 * @prop {Object} parallaxTween - parallaxTween default properties
 * @prop {Number} parallaxTween.duration - Default value of the time range of the animation, both syncTimeline and scrollTrigger will take care of processing the value as needed.
 * Default: `{ duration: 10 }`.
 *
 * @prop {import('../tween/tweenConfig.js').easeStringTypes} parallaxTween.ease - Default essing function used by the parallaxTween,
 * Default: `{ ease: 'easeLinear' }`.
 *
 * @prop {Object} tween - tween default properties
 * @prop {Number} tween.duration - default tween duration,
 * Default: `{ duration:  1000 }` ( value in milliseconds ).
 *
 * @prop {import('../tween/tweenConfig.js').easeStringTypes} tween.ease - Default essing function used by the tween,
 * Default: `{ ease: 'easeLinear' }`.
 *
 * @prop {Boolean} tween.relative - default value of relative properties.
 * Default:  `{ relative: false }`.
 *
 * @prop {Object} spring - spring default properties
 * @prop {Boolean} spring.relative - default value of relative properties.
 * Default: `{ relative: false }`.
 *
 * @prop {import('../spring/springConfig.js').springConfigStringTypes} spring.config - All spring configuration. It is possible to modify or add new configurations.
 *
 * @prop {Object} lerp - lerp default properties.
 * @prop {Boolean} lerp.relative - default value of relative properties.
 * Default: `{ relative: false }`.
 *
 * @prop {Number} lerp.precision - default value of precision properties.
 * Default: `{ precision:  'false' }`.
 *
 * @prop {Number} lerp.velocity - default value of velocity properties.
 * Default: `{ velocity: 'false' }`.
 */

export const easeReference = {
    easeLinear: 'easeLinear',
    easeInQuad: 'easeInQuad',
    easeOutQuad: 'easeOutQuad',
    easeInOutQuad: 'easeInOutQuad',
    easeInCubic: 'easeInCubic',
    easeOutCubic: 'easeOutCubic',
    easeInOutCubic: 'easeInOutCubic',
    easeInQuart: 'easeInQuart',
    easeOutQuart: 'easeOutQuart',
    easeInOutQuart: 'easeInOutQuart',
    easeInQuint: 'easeInQuint',
    easeOutQuint: 'easeOutQuint',
    easeInOutQuint: 'easeInOutQuint',
    easeInSine: 'easeInSine',
    easeOutSine: 'easeOutSine',
    easeInOutSine: 'easeInOutSine',
    easeInExpo: 'easeInExpo',
    easeOutExpo: 'easeOutExpo',
    easeInOutExpo: 'easeInOutExpo',
    easeInCirc: 'easeInCirc',
    easeOutCirc: 'easeOutCirc',
    easeInOutCirc: 'easeInOutCirc',
    easeInElastic: 'easeInElastic',
    easeOutElastic: 'easeOutElastic',
    easeInOutElastic: 'easeInOutElastic',
    easeInBack: 'easeInBack',
    easeOutBack: 'easeOutBack',
    easeInOutBack: 'easeInOutBack',
    easeInBounce: 'easeInBounce',
    easeOutBounce: 'easeOutBounce',
    easeInOutBounce: 'easeInOutBounce',
};
export const MQ_MIN = 'min';
export const MQ_MAX = 'max';
export const defaultMqValueDefault = 'desktop';
export const easeDefault = 'easeLinear';
export const springConfigDefault = 'default';
export const startFpsDefault = 60;
export const fpsScalePercentDefault = { 0: 1, 15: 2, 30: 3, 45: 4 };
export const useScaleFpsDefault = true;
export const deferredNextTickDefault = false;
export const throttleDefault = 100;
export const mqDefault = {
    xSmall: 320,
    small: 360,
    medium: 600,
    tablet: 768,
    desktop: 992,
    large: 1200,
    xLarge: 1400,
};
export const sequencerDurationDefault = 10;
export const lerpConfigDefault = 0.06;
export const markerStartDefault = '#ff0000';
export const markerItemDefault = '#14df3b';
export const parallaxRangeDefault = 8;
export const parallaxTweenDurationDefault = 10;
export const tweenDurationDefault = 1000;
export const tweenRealtiveDefault = false;
export const springRealtiveDefault = false;
export const lerpRelativeDefault = false;
export const lerpPrecisionDefault = 0.01;
export const lerpVelocityDefault = 0.06;

/**
 * @param {handleSetUpSetType} obj
 */
export const setupValidation = (obj) => {
    const startFps = checkSetUpType({
        prop: 'startFps',
        value: obj?.startFps,
        defaultValue: startFpsDefault,
        type: Number,
    });

    const fpsScalePercent = checkSetUpType({
        prop: 'fpsScalePercent',
        value: obj?.fpsScalePercent,
        defaultValue: fpsScalePercentDefault,
        type: Object,
    });

    const useScaleFps = checkSetUpType({
        prop: 'useScaleFps',
        value: obj?.useScaleFps,
        defaultValue: useScaleFpsDefault,
        type: Boolean,
    });

    const deferredNextTick = checkSetUpType({
        prop: 'deferredNextTick',
        value: obj?.deferredNextTick,
        defaultValue: deferredNextTickDefault,
        type: Boolean,
    });

    const mq = checkSetUpMq(obj?.mq);

    const defaultMqValue = checkSetUpType({
        prop: 'defaultMq.value',
        value: obj?.defaultMq?.value,
        defaultValue: defaultMqValueDefault,
        type: String,
    });

    const defaultMqType = checkSetUpType({
        prop: 'defaultMq.type',
        value: obj?.defaultMq?.type,
        defaultValue: MQ_MIN,
        type: String,
    });

    const sequencerDuration = checkSetUpType({
        prop: 'sequencer.duration',
        value: obj?.sequencer?.duration,
        defaultValue: sequencerDurationDefault,
        type: Number,
    });

    const sequencerEase = checkSetUpEase(obj?.sequencer?.ease, 'sequencer');

    const scrollTriggerSpringConfig = checkSetUpType({
        prop: 'scrolTrigger.springConfig',
        value: obj?.scrollTrigger?.springConfig,
        defaultValue: springConfigDefault,
        type: String,
    });

    const scrollTriggerLerpConfig = checkSetUpType({
        prop: 'scrolTrigger.lerpConfig',
        value: obj?.scrollTrigger?.lerpConfig,
        defaultValue: lerpConfigDefault,
        type: Number,
    });

    const scrollTriggerMarkerEnd = checkSetUpType({
        prop: 'scrolTrigger.markerColor.startEnd',
        value: obj?.scrollTrigger?.markerColor?.startEnd,
        defaultValue: markerStartDefault,
        type: String,
    });

    const scrollTriggerMarkerItem = checkSetUpType({
        prop: 'scrolTrigger.markerColor.item',
        value: obj?.scrollTrigger?.markerColor?.item,
        defaultValue: markerItemDefault,
        type: String,
    });

    const parallaxRange = checkSetUpType({
        prop: 'parallax.defaultRange',
        value: obj?.parallax?.defaultRange,
        defaultValue: parallaxRangeDefault,
        type: Number,
    });

    const parallaxSpringConfig = checkSetUpType({
        prop: 'parallax.springConfig',
        value: obj?.parallax?.springConfig,
        defaultValue: springConfigDefault,
        type: String,
    });

    const parallaxLerpConfig = checkSetUpType({
        prop: 'parallax.lerpConfig',
        value: obj?.parallax?.lerpConfig,
        defaultValue: lerpConfigDefault,
        type: Number,
    });

    const parallaxTweenDuration = checkSetUpType({
        prop: 'parallaxTween.duration',
        value: obj?.parallaxTween?.duration,
        defaultValue: parallaxTweenDurationDefault,
        type: Number,
    });

    const parallaxTweenEase = checkSetUpEase(
        obj?.parallaxTween?.ease,
        'parallaxTween'
    );

    const tweenDuration = checkSetUpType({
        prop: 'tween.duration',
        value: obj?.tween?.duration,
        defaultValue: tweenDurationDefault,
        type: Number,
    });

    const tweenEase = checkSetUpEase(obj?.tween?.ease, 'tween');

    const tweenRelative = checkSetUpType({
        prop: 'tween.relative',
        value: obj?.tween?.relative,
        defaultValue: tweenRealtiveDefault,
        type: Boolean,
    });

    const springRelative = checkSetUpType({
        prop: 'spring.relative',
        value: obj?.spring?.relative,
        defaultValue: springRealtiveDefault,
        type: Boolean,
    });

    const lerpRelative = checkSetUpType({
        prop: 'lerp.relative',
        value: obj?.lerp?.relative,
        defaultValue: lerpRelativeDefault,
        type: Boolean,
    });

    const lerpPrecision = checkSetUpType({
        prop: 'lerp.precision',
        value: obj?.lerp?.precision,
        defaultValue: lerpPrecisionDefault,
        type: Number,
    });

    const lerpVelocity = checkSetUpType({
        prop: 'lerp.velocity',
        value: obj?.lerp?.velocity,
        defaultValue: lerpVelocityDefault,
        type: Number,
    });

    /**
     * @constant
     * @type {handleSetUpSetType}
     */
    const result = {
        startFps,
        fpsScalePercent,
        useScaleFps,
        deferredNextTick,
        mq,
        defaultMq: {
            value: defaultMqValue,
            type: defaultMqType,
        },
        sequencer: {
            duration: sequencerDuration,
            ease: sequencerEase,
        },
        scrollTrigger: {
            springConfig: scrollTriggerSpringConfig,
            lerpConfig: scrollTriggerLerpConfig,
            markerColor: {
                startEnd: scrollTriggerMarkerEnd,
                item: scrollTriggerMarkerItem,
            },
        },
        parallax: {
            defaultRange: parallaxRange,
            springConfig: parallaxSpringConfig,
            lerpConfig: parallaxLerpConfig,
        },
        parallaxTween: {
            duration: parallaxTweenDuration,
            ease: parallaxTweenEase,
        },
        tween: {
            duration: tweenDuration,
            ease: tweenEase,
            relative: tweenRelative,
        },
        spring: {
            relative: springRelative,
            config: obj?.spring?.config
                ? { ...springPresetConfig, ...obj.spring.config }
                : springPresetConfig,
        },
        lerp: {
            relative: lerpRelative,
            precision: lerpPrecision,
            velocity: lerpVelocity,
        },
    };

    return result;
};

/**
 * Check if prop valid
 */
const checkSetUpType = ({ prop, value, defaultValue, type }) => {
    const isValid = checkType(type, value);
    if (!isValid)
        console.warn(
            `handleSetUp error: ${prop}: ${value}, is not valid must be a ${getTypeName(
                type
            )}`
        );

    return isValid ? value : defaultValue;
};

const checkSetUpMq = (obj) => {
    const isValid =
        checkType(Object, obj) &&
        Object.values(obj).every((value) => {
            return checkType(Number, value);
        });

    if (!isValid)
        console.warn(
            `handleSetUp error: mq must be an object as { ..., String: Number }`
        );

    return isValid ? obj : mqDefault;
};

export const checkSetUpEase = (value, label) => {
    const isValid = Object.keys(easeReference).includes(value);
    if (!isValid && value !== undefined && value !== null)
        console.warn(
            `handleSetUp error: ${label}.ease properties is not valid`
        );

    return isValid ? value : easeDefault;
};
