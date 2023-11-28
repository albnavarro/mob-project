// @ts-check

import { parallaxConstant } from '../parallax/parallaxConstant';
import {
    STAGGER_START,
    STAGGER_TYPE_CENTER,
    STAGGER_TYPE_END,
    STAGGER_TYPE_EQUAL,
} from './stagger/staggerCostant';

/**
 * @param {Array<string>} choice
 *
 * @returns string
 */
const possibleChoice = (choice) => {
    return choice
        .map((item) => {
            return `${item} | `;
        })
        .join('');
};

/**
 * @param {string} label
 * @param {Object} fromObj
 * @param {Object} toObj
 *
 * @returns void
 */
export const compareKeysWarning = (label, fromObj, toObj) => {
    console.warn(
        `${label}: ${JSON.stringify(fromObj)} and to ${JSON.stringify(
            toObj
        )} is not equal`
    );
};

/**
 * @param {number} max
 *
 * @returns void
 */
export const staggerIsOutOfRangeWarning = (max) => {
    console.warn(
        `stagger col of grid is out of range, it must be less than ${max} ( staggers length )`
    );
};

/**
 * @param {any} label
 *
 * @returns void
 */
export const dataTweenValueIsNotValidWarning = (label) => {
    console.warn(
        `tween | sequencer: ${label} is not valid value, must be a number or a Function that return a number`
    );
};

/**
 * @param {any} val
 *
 * @returns void
 */
export const sequencerRangeStartWarning = (val) => {
    console.warn(
        `sequencer, start option: ${val} value is not valid, must be a Number`
    );
};

/**
 * @param {any} val
 *
 * @returns void
 */
export const sequencerRangeEndWarning = (val) => {
    console.warn(
        `sequencer, end option: ${val} value is not valid, must be a Number`
    );
};

/**
 * @returns void
 */
export const relativePropInsideTimelineWarning = () => {
    console.warn('relative prop is not allowed inside a timeline');
};

/**
 * @param {function} val
 *
 * @returns void
 */
export const timelineSuspendWarning = (val) => {
    console.warn(
        `Timeline Supend: ${val()} is not a valid value, must be a boolean`
    );
};

/**
 * @returns void
 */
export const timelineReverseGoFromWarning = () => {
    console.warn(
        `SyncTimeline: in revese ( or yoyo mode) only goTo || goFromTo || set action is allowed. Using goFrom makes no sense in this context. Timeline will stopped.`
    );
};

/**
 * @param {any} items
 *
 * @returns void
 */
export const timelineSetTweenArrayWarining = (items) => {
    console.warn(`timeline setTween: ${items} is not an array of tween`);
};

/**
 * @param {any} label
 *
 * @returns void
 */
export const timelineSetTweenLabelWarining = (label) => {
    console.warn(`timeline setTween: ${label} is not a string`);
};

/**
 * @param {any} label
 *
 * @returns void
 */
export const timelineSetTweenLabelNotFoundWarining = (label) => {
    console.warn(`asyncTimeline.setTween() label: ${label} not found`);
};

/**
 * @returns void
 */
export const timelineSetTweenFailWarining = () => {
    console.warn('setTween fail');
};

/**
 * @param {any} label
 *
 * @returns void
 */
export const syncTimelineLabelWarning = (label) => {
    console.warn(`label ${label} not founded`);
};

/**
 * @param {any} fn
 *
 * @returns void
 */
export const syncTimelineAddFnWarning = (fn) => {
    console.warn(`sequencer.add(fn,time) ${fn}: fn must be Function`);
};

/**
 * @param {any} time
 *
 * @returns void
 */
export const syncTimelineAddTimeWarning = (time) => {
    console.warn(`sequencer.add(fn,time) ${time}: time must be a Number`);
};

/**
 * @param {any} preset
 *
 * @returns void
 */
export const springPresetWarning = (preset) => {
    console.warn(`${preset} doesn't exist in spring configuration list`);
};

/**
 * @returns void
 */
export const springConfigPropWarning = () => {
    console.warn(`Spring configProp: all prop must be a positive Number`);
};

/**
 * @param {any} config
 *
 * @returns void
 */
export const springConfigSpecificPropWarning = (config) => {
    console.warn(
        `Spring config: ${config}: config must have friction/mass/precision/tesnion props and must be a number`
    );
};

/**
 * @param {any} preset
 *
 * @returns void
 */
export const tweenEaseWarning = (preset) => {
    console.warn(`${preset} doesn't exist in tweens ease function`);
};

/**
 * @returns void
 */
export const staggerEachWarning = () => {
    console.warn(`stagger each must be a Number `);
};

/**
 * @param {any} val
 *
 * @returns void
 */
export const staggerRowColGenericWarining = (val) => {
    console.warn(
        `stagger, row/col: ${val} value is not valid, must be a Number`
    );
};

/**
 * @returns void
 */
export const staggerWaitCompleteWarning = () => {
    console.warn('Stagger error: waitComplete propierties must be a Boolean');
};

/**
 * @returns void
 */
export const staggerGridDirectionWarning = () => {
    console.warn(
        `Stagger error: in grid option direction should be a string radial/col/row`
    );
};

/**
 * @returns void
 */
export const staggerRadialDirectionWarning = () => {
    console.warn(
        `Stagger error: in radial direction 'from' propierties must be a object {x:Number,y:Number}`
    );
};

/**
 * @returns void
 */
export const staggerGridColRowWarning = () => {
    console.warn(
        `Stagger error: in grid configuration col/row is minor than 1, it should be greater or equal 1`
    );
};

/**
 * @returns void
 */
export const staggerColRowWarning = () => {
    console.warn(
        `Stagger error: in col/row direction 'from' propierties must be a string start/end/center/edges or a number`
    );
};

/**
 * @param {any} from
 *
 * @returns void
 */
export const staggerFromGenericWarning = (from) => {
    console.warn(
        `Stagger error: from: ${from} is not a valid value, must be a string start/end/center/edges or a number or a Object {x:Number,y:Number}`
    );
};

/**
 * @param {any} value
 *
 * @returns void
 */
export const durationWarining = (value) => {
    console.warn(
        `duration error: ${value} is not valid duration must be a number`
    );
};

/**
 * @param {any} value
 *
 * @returns void
 */
export const durationNumberOrFunctionWarining = (value) => {
    console.warn(
        `duration error: ${value} is not valid duration must be a number or a Function that return a number`
    );
};

/**
 * @param {any} value
 *
 * @returns void
 */
export const repeatWarining = (value) => {
    console.warn(
        `repeat error: ${value} is not valid repeat value must be a Number`
    );
};

/**
 * @param {any} ease
 *
 * @returns void
 */
export const easeWarning = (ease) => {
    console.warn(`ease definition error: ${ease} is not a valid  definition`);
};

/**
 * @param {any} prop
 *
 * @returns void
 */
export const initialDataPropWarining = (prop) => {
    console.warn(
        `data inizializiation error; ${prop} is not a valid value, must be a string`
    );
};

/**
 * @param {any} value
 *
 * @returns void
 */
export const initialDataValueWarining = (value) => {
    console.warn(
        `data inizializiation error; ${value} is not a valid value, must be a number`
    );
};

/**
 * @returns void
 */
export const createStaggerItemsWarning = () => {
    console.warn(`createStaggers error: items array can not be empty`);
};

/**
 * @returns void
 */
export const createStaggerItemsTypeWarning = () => {
    console.warn(
        `createStaggers error: each element of the array must be an Element or an Object`
    );
};

/**
 * @returns void
 */
export const createStaggerTypeWarning = () => {
    console.warn(
        `screateStaggers error: type should be: ${STAGGER_TYPE_EQUAL} || ${STAGGER_START} || ${STAGGER_TYPE_END} || ${STAGGER_TYPE_CENTER}`
    );
};

/**
 * @param {any} eachProportion
 *
 * @returns void
 */
export const createStaggerEachWarning = (eachProportion) => {
    console.warn(
        `createStagger:  each must be between 1 and ${eachProportion}`
    );
};

/**
 * @param {any} val
 * @param {any} tweenType
 *
 * @returns void
 */
export const relativeWarining = (val, tweenType) => {
    console.warn(
        `${tweenType}: relative prop: ${val} is not a valid parameter, must be a boolean `
    );
};

/**
 * @param {any} val
 * @param {any} label
 *
 * @returns void
 */
export const booleanWarning = (val, label) => {
    console.warn(`${label}: '${val}' is not Boolean`);
};

/**
 * @param {any} val
 * @param {any} label
 *
 * @returns void
 */
export const stringWarning = (val, label) => {
    console.warn(`${label}: '${val}' is not String`);
};

/**
 * @param {any} val
 * @param {any} label
 *
 * @returns void
 */
export const naumberWarning = (val, label) => {
    console.warn(`${label}: '${val}' is not Number`);
};

/**
 * @param {any} val
 * @param {any} label
 *
 * @returns void
 */
export const functionWarning = (val, label) => {
    console.warn(`${label}: '${val}' is not Function`);
};

/**
 * @returns void
 */
export const lerpVelocityWarining = () => {
    console.warn(
        'Lerp error: velocity is not valid, must be a Number greater than 0 and less than 1'
    );
};

/**
 * @returns void
 */
export const lerpPrecisionWarining = () => {
    console.warn(
        'Lerp error: precision is not valid, must be a number greater than 0'
    );
};

/**
 * @param {any} methodName
 *
 * @returns void
 */
export const asyncTimelineMetodsInsideGroupWarining = (methodName) => {
    console.warn(
        `asyncTimeline error: ${methodName} cannot be used inside group`
    );
};

/**
 * @param {any} label
 *
 * @returns void
 */
export const valueStringWarning = (label) => {
    console.warn(`${label} value must be a string`);
};

/**
 * @returns void
 */
export const asyncTimelineTweenWaring = () => {
    console.warn(
        'tween added to asyncTimeline or used inside sync() method must be instance of HandleLerp | HandleTween | HandleSpring'
    );
};

/**
 * @returns void
 */
export const asyncTimelineDelayWarning = () => {
    console.warn('asyncTimeline arror: delay must be a Number');
};

/**
 * @param {any} label
 *
 * @returns void
 */
export const playLabelWarining = (label) => {
    console.warn(`${label} not found`);
};

/**
 * @param {any} value
 *
 * @returns void
 */
export const addAsyncFunctionWarining = (value) => {
    console.warn(`timeline add async function, ${value} is not a function `);
};

/**
 * @param {any} value
 * @param {any} component
 *
 * @returns void
 */
export const parallaxDirectionWarining = (value, component) => {
    console.warn(
        `${component} direction: ${value} is not valid value: must be ${parallaxConstant.DIRECTION_VERTICAL} | ${parallaxConstant.DIRECTION_HORIZONTAL}`
    );
};

/**
 * @param {any} label
 *
 * @returns void
 */
export const parallaxDynmicValueWarining = (label) => {
    console.warn(
        `scrollTrigger error; ${label} propierties: value must be a Object like { position: top|bottom|left|right, value: () => { return Number} } `
    );
};

/**
 * @returns void
 */
export const parallaxDynmicRangeValueWarining = () => {
    console.warn(
        `scrollTrigger error; dynamicRange propierties: value must be a Function that return a Number`
    );
};

/**
 * @returns void
 */
export const parallaxTweenWarning = () => {
    console.warn(
        'parallax|scrolTrigger error: tween is not valid, must be an instance of HandleSequencer || ParallaxTween'
    );
};

/**
 * @param {any} value
 * @param {any} choice
 *
 * @returns void
 */
export const parallaxAlignWarining = (value, choice) => {
    console.warn(
        `parallax error align propierties: ${value} is not valid must be one of ${possibleChoice(
            choice
        )} or a Number between 0 and 100`
    );
};

/**
 * @param {any} value
 * @param {any} choice
 *
 * @returns void
 */
export const parallaxOnSwitchWarining = (value, choice) => {
    console.warn(
        `parallax error align propierties: ${value} is not valid must be one of ${possibleChoice(
            choice
        )}`
    );
};

/**
 * @param {any} val
 * @param {any} label
 *
 * @returns void
 */
export const parallaxOpacityWarning = (val, label) => {
    console.warn(
        `${label}: '${val}' is not Number, must be a number between 0 and 100`
    );
};

/**
 * @param {any} value
 * @param {any} choice
 *
 * @returns void
 */
export const parallaxTypeWarining = (value, choice) => {
    console.warn(
        `parallax error type propierties: ${value} is not valid must be one of ${possibleChoice(
            choice
        )}`
    );
};

/**
 * @param {any} value
 * @param {any} choice
 *
 * @returns void
 */
export const parallaxPropiertiesWarining = (value, choice) => {
    console.warn(
        `parallax/scrollTrigger error propierties props: ${value} is not valid must be one of ${possibleChoice(
            choice
        )} or a custom css propierites like margin|line-height|...`
    );
};

/**
 * @param {any} value
 * @param {any} choice
 *
 * @returns void
 */
export const parallaxEaseTypeWarining = (value, choice) => {
    console.warn(
        `parallax error easeType props: ${value} is not valid must be one of ${possibleChoice(
            choice
        )}`
    );
};

/**
 * @param {any} value
 * @param {any} choice
 * @param {any} component
 *
 * @returns void
 */
export const genericEaseTypeWarining = (value, choice, component) => {
    console.warn(
        `${component} error easeType props: ${value} is not valid must be one of ${possibleChoice(
            choice
        )}`
    );
};

/**
 * @returns void
 */
export const parallaxEaseTypeSpringWarining = () => {
    console.warn(
        'Scrolltrigger warning: spring animation is only available for native properties and ParallaxTween, Check that with the "propierties" property set to "tween" no HandleSequencer is associated with the "tween" property'
    );
};

/**
 * @param {any} value
 * @param {any} choice
 *
 * @returns void
 */
export const parallaxSpringCongifWarining = (value, choice) => {
    console.warn(
        `parallax/scrollTrigger error springConfig props: ${value} is not valid must be one of ${possibleChoice(
            choice
        )}`
    );
};

/**
 * @param {any} value
 *
 * @returns void
 */
export const parallaxRangeNumberWarning = (value) => {
    console.warn(
        `parallax error range propierties, current value: ${value}, the value must be a number between 0 and 9.99`
    );
};

/**
 * @param {any} value
 *
 * @returns void
 */
export const parallaxRangeStringWarning = (value) => {
    console.warn(
        `scrollTrigger error range propierties: ${value} is not a String`
    );
};

/**
 * @param {any} mq
 * @param {any} choice
 * @param {any} label
 * @param {any} component
 *
 * @returns void
 */
export const breakpointWarning = (mq, choice, label, component) => {
    console.warn(
        `${component} error ${label} propierties: ${mq} is not valid must be one of ${possibleChoice(
            choice
        )}`
    );
};

/**
 * @returns void
 */
export const parallaxUseSequencerWarining = () => {
    console.warn(
        'Parallax warning: if propierties is a tween the only choice is ParallaxTween, HandleSequencer or empty tween propierites is not allowed inside a parallax'
    );
};

/**
 * @returns void
 */
export const parallaxLerpConfigWarning = () => {
    console.warn(
        'parallax/ScrollTrrigger error: velocity is not valid, must be a Number greater than 0 and less than 1'
    );
};

/**
 * @returns void
 */
export const parallaxNoTweenDefinedWarning = () => {
    console.warn(
        'parallax/ScrollTrrigger warning:  The property is "tween" but no tween has been associated, associate a tween with the "tween" property'
    );
};

/**
 * @returns void
 */
export const parallaxUseTweenButNotProsDefinedWarning = () => {
    console.warn(
        'parallax/ScrollTrrigger: there is tween associated but pros "propierties" is not set to "tween"'
    );
};

/**
 * @param {any} label
 * @param {any} value
 *
 * @returns void
 */
export const functionIsValidAndReturnDefaultWarining = (label, value) => {
    console.warn(`${label}: ${value} is not a function`);
};

/**
 * @param {any} string
 * @param {any} properties
 * @param {any} choice
 *
 * @returns void
 */
export const scrollTriggerRangeWarning = (string, properties, choice) => {
    console.warn(
        `scrollTrigger error range : with '${properties}' propierties ${string} is not valid, add one of the following unit misure: ${possibleChoice(
            choice
        )}, es: 45deg|100px|50vw etc..`
    );
};

/**
 * @param {any} properties
 *
 * @returns void
 */
export const scrollTriggerCustomRangeWarning = (properties) => {
    console.warn(
        `scrollTrigger error range : with custom css propierties '${properties}' no unit misure is necessary, the default unit misure will be used (px). Only '-' for negative value is allowed`
    );
};

/**
 * @param {any} string
 * @param {any} properties
 *
 * @returns void
 */
export const scrollTriggerRangeScaleWarning = (string, properties) => {
    console.warn(
        `scrollTrigger error range : with '${properties}' propierties ${string} is not valid no unit misure is necessary. Only '-' for negative value is allowed`
    );
};
