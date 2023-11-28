// @ts-check

import { mobCore } from '../../../../mobCore/index.js';
import { springPresetConfig } from '../../spring/springConfig.js';

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
 * @param {import('./type.js').setUpType} obj
 */
export const setupValidation = (obj) => {
    const fpsScalePercent = checkSetUpType({
        prop: 'fpsScalePercent',
        value: obj?.fpsScalePercent,
        defaultValue: mobCore.store.getProp('fpsScalePercent'),
        type: Object,
    });

    const useScaleFps = checkSetUpType({
        prop: 'useScaleFps',
        value: obj?.useScaleFps,
        defaultValue: mobCore.store.getProp('useScaleFps'),
        type: Boolean,
    });

    const deferredNextTick = checkSetUpType({
        prop: 'deferredNextTick',
        value: obj?.deferredNextTick,
        defaultValue: mobCore.store.getProp('deferredNextTick'),
        type: Boolean,
    });

    const usePassive = checkSetUpType({
        prop: 'usePassive',
        value: obj?.usePassive,
        defaultValue: mobCore.store.getProp('usePassive'),
        type: Boolean,
    });

    const throttle = checkSetUpType({
        prop: 'throttle',
        value: obj?.throttle,
        defaultValue: mobCore.store.getProp('throttle'),
        type: Number,
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
     * @type {import('./type.js').setUpType}
     */
    const result = {
        fpsScalePercent,
        useScaleFps,
        deferredNextTick,
        throttle,
        usePassive,
        mq,
        defaultMq: {
            value: defaultMqValue,
            type: defaultMqType,
        },
        sequencer: {
            duration: sequencerDuration,
            // @ts-ignore
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
            // @ts-ignore
            ease: parallaxTweenEase,
        },
        tween: {
            duration: tweenDuration,
            // @ts-ignore
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
 * @param {Object} obj
 * @param {any} obj.prop
 * @param {any} obj.value
 * @param {any} obj.defaultValue
 * @param {any} obj.type
 *
 * @returns any
 *
 * @description
 * Check if prop valid
 */
const checkSetUpType = ({ prop, value, defaultValue, type }) => {
    const isValid = mobCore.checkType(type, value);
    if (!isValid)
        console.warn(
            `handleSetUp error: ${prop}: ${value}, is not valid must be a ${mobCore.getTypeName(
                type
            )}`
        );

    return isValid ? value : defaultValue;
};

/**
 * @param {Object} obj
 *
 * @returns any
 */
const checkSetUpMq = (obj) => {
    const isValid =
        mobCore.checkType(Object, obj) &&
        Object.values(obj).every((value) => {
            return mobCore.checkType(Number, value);
        });

    if (!isValid)
        console.warn(
            `handleSetUp error: mq must be an object as { ..., String: Number }`
        );

    return isValid ? obj : mqDefault;
};

/**
 * @param {string|undefined} value
 * @param {string} label
 *
 * @returns string
 */
export const checkSetUpEase = (value, label) => {
    // @ts-ignore
    const isValid = Object.keys(easeReference).includes(value);
    if (!isValid && value !== undefined && value !== null)
        console.warn(
            `handleSetUp error: ${label}.ease properties is not valid`
        );

    return isValid ? value : easeDefault;
};
