import { parallaxConstant } from '../parallax/parallaxConstant';
import {
    STAGGER_START,
    STAGGER_TYPE_CENTER,
    STAGGER_TYPE_END,
    STAGGER_TYPE_EQUAL,
} from './stagger/staggerCostant';

const possibleChoice = (choice) => {
    return choice
        .map((item) => {
            return `${item} | `;
        })
        .join('');
};

export const compareKeysWarning = (label, fromObj, toObj) => {
    console.warn(
        `${label}: ${JSON.stringify(fromObj)} and to ${JSON.stringify(
            toObj
        )} is not equal`
    );
};

export const staggerIsOutOfRangeWarning = (max) => {
    console.warn(
        `stagger col of grid is out of range, it must be less than ${max} ( staggers length )`
    );
};

export const dataTweenValueIsNotValidWarning = (label) => {
    console.warn(
        `tween | sequencer: ${label} is not valid value, must be a number or a Function that return a number`
    );
};

export const sequencerRangeStartWarning = (val) => {
    console.warn(
        `sequencer, start option: ${val} value is not valid, must be a Number`
    );
};

export const sequencerRangeEndWarning = (val) => {
    console.warn(
        `sequencer, end option: ${val} value is not valid, must be a Number`
    );
};

export const relativePropInsideTimelineWarning = () => {
    console.warn('relative prop is not allowed inside a timeline');
};

export const timelineSuspendWarning = (val) => {
    console.warn(
        `Timeline Supend: ${val()} is not a valid value, must be a boolean`
    );
};

export const timelineReverseGoFromWarning = () => {
    console.warn(
        `SyncTimeline: in revese ( or yoyo mode) only goTo || goFromTo || set action is allowed. Using goFrom makes no sense in this context. Timeline will stopped.`
    );
};

export const timelineSetTweenArrayWarining = (items) => {
    console.warn(`timeline setTween: ${items} is not an array of tween`);
};

export const timelineSetTweenLabelWarining = (label) => {
    console.warn(`timeline setTween: ${label} is not a string`);
};

export const timelineSetTweenLabelNotFoundWarining = (label) => {
    console.warn(`asyncTimeline.setTween() label: ${label} not found`);
};

export const timelineSetTweenFailWarining = () => {
    console.warn('setTween fail');
};

export const syncTimelineLabelWarning = (label) => {
    console.warn(`label ${label} not founded`);
};

export const syncTimelineAddFnWarning = (fn) => {
    console.warn(`sequencer.add(fn,time) ${fn}: fn must be Function`);
};

export const syncTimelineAddTimeWarning = (time) => {
    console.warn(`sequencer.add(fn,time) ${time}: time must be a Number`);
};

export const springPresetWarning = (preset) => {
    console.warn(`${preset} doasn't exist in spring configuration list`);
};

export const springConfigPropWarning = () => {
    console.warn(`Spring configProp: all prop must be a positive Number`);
};

export const springConfigSpecificPropWarning = (config) => {
    console.warn(
        `Spring config: ${config}: config must have friction/mass/precision/tesnion props and must be a number`
    );
};

export const tweenEaseWarning = (preset) => {
    console.warn(`${preset} doasn't exixst in tweens ease function`);
};

export const staggerEachWarning = () => {
    console.warn(`stagger each must be a Number `);
};

export const staggerRowColGenericWarining = (val) => {
    console.warn(
        `stagger, row/col: ${val} value is not valid, must be a Number`
    );
};

export const staggerWaitCompleteWarning = () => {
    console.warn('Stagger error: waitComplete propierties must be a Boolean');
};

export const staggerGridDirectionWarning = () => {
    console.warn(
        `Stagger error: in grid option direction should be a string radial/col/row`
    );
};

export const staggerRadialDirectionWarning = () => {
    console.warn(
        `Stagger error: in radial direction 'from' propierties must be a object {x:Number,y:Number}`
    );
};

export const staggerGridColRowWarning = () => {
    console.warn(
        `Stagger error: in grid configuration col/row is minor than 1, it should be greater or equal 1`
    );
};

export const staggerColRowWarning = () => {
    console.warn(
        `Stagger error: in col/row direction 'from' propierties must be a string start/end/center/edges or a number`
    );
};

export const staggerFromGenericWarning = (from) => {
    console.warn(
        `Stagger error: from: ${from} is not a valid value, must be a string start/end/center/edges or a number or a Object {x:Number,y:Number}`
    );
};

export const durationWarining = (value) => {
    console.warn(
        `duration error: ${value} is not valid duration must be a number`
    );
};

export const durationNumberOrFunctionWarining = (value) => {
    console.warn(
        `duration error: ${value} is not valid duration must be a number or a Function that return a number`
    );
};

export const repeatWarining = (value) => {
    console.warn(
        `repeat error: ${value} is not valid repeat value must be a Number`
    );
};

export const easeWarning = (ease) => {
    console.warn(`ease definition error: ${ease} is not a valid  definition`);
};

export const initialDataPropWarining = (prop) => {
    console.warn(
        `data inizializiation error; ${prop} is not a valid value, must be a string`
    );
};

export const initialDataValueWarining = (value) => {
    console.warn(
        `data inizializiation error; ${value} is not a valid value, must be a number`
    );
};

export const createStaggerItemsWarning = () => {
    console.warn(`createStaggers error: items array can not be empty`);
};

export const createStaggerItemsTypeWarning = () => {
    console.warn(
        `createStaggers error: each element of the array must be an Element or an Object`
    );
};

export const createStaggerTypeWarning = () => {
    console.warn(
        `screateStaggers error: type should be: ${STAGGER_TYPE_EQUAL} || ${STAGGER_START} || ${STAGGER_TYPE_END} || ${STAGGER_TYPE_CENTER}`
    );
};

export const createStaggerEachWarning = (eachProportion) => {
    console.warn(
        `createStagger:  each must be between 1 and ${eachProportion}`
    );
};

export const relativeWarining = (val, tweenType) => {
    console.warn(
        `${tweenType}: relative prop: ${val} is not a valid parameter, must be a boolean `
    );
};

export const booleanWarning = (val, label) => {
    console.warn(`${label}: '${val}' is not Boolean`);
};

export const stringWarning = (val, label) => {
    console.warn(`${label}: '${val}' is not String`);
};

export const naumberWarning = (val, label) => {
    console.warn(`${label}: '${val}' is not Number`);
};

export const lerpVelocityWarining = () => {
    console.warn(
        'Lerp error: velocity is not valid, must be a Number greater than 0 and less than 1'
    );
};

export const lerpPrecisionWarining = () => {
    console.warn(
        'Lerp error: precision is not valid, must be a number greater than 0'
    );
};

export const asyncTimelineMetodsInsideGroupWarining = (methodName) => {
    console.warn(
        `asyncTimeline error: ${methodName} cannot be used inside group`
    );
};

export const valueStringWarning = (label) => {
    console.warn(`${label} value must be a string`);
};

export const asyncTimelineTweenWaring = () => {
    console.warn(
        'tween added to asyncTimeline or used inside sync() method must be instance of HandleLerp | HandleTween | HandleSpring'
    );
};

export const asyncTimelineDelayWarning = () => {
    console.warn('asyncTimeline arror: delay must be a Number');
};

export const playLabelWarining = (label) => {
    console.warn(`${label} not found`);
};

export const addAsyncFunctionWarining = (value) => {
    console.warn(`timeline add async function, ${value} is not a function `);
};

export const parallaxDirectionWarining = (value) => {
    console.warn(
        `Parallax direction: ${value} is not valid value: must be ${parallaxConstant.DIRECTION_VERTICAL} | ${parallaxConstant.DIRECTION_HORIZONTAL}`
    );
};

export const parallaxDynmicValueWarining = (label) => {
    console.warn(
        `scrollTrigger error; ${label} propierties: value must be a Object like { position: top|bottom|left|right, value: () => { return Number} } `
    );
};

export const parallaxDynmicRangeValueWarining = () => {
    console.warn(
        `scrollTrigger error; dynamicRange propierties: value must be a Funtion that return a Number`
    );
};

export const parallaxTweenWarning = () => {
    console.warn(
        'parallax|scrolTrigger error: tween is not valid, must be an instance of HandleSequencer || ParallaxTween'
    );
};

export const parallaxAlignWarining = (value, choice) => {
    console.warn(
        `parallax error align propierties: ${value} is not valid must be one of ${possibleChoice(
            choice
        )} or a Number between 0 and 100`
    );
};

export const parallaxOnSwitchWarining = (value, choice) => {
    console.warn(
        `parallax error align propierties: ${value} is not valid must be one of ${possibleChoice(
            choice
        )}`
    );
};

export const parallaxOpacityWarning = (val, label) => {
    console.warn(
        `${label}: '${val}' is not Number, must be a number between 0 and 100`
    );
};

export const parallaxTypeWarining = (value, choice) => {
    console.warn(
        `parallax error type propierties: ${value} is not valid must be one of ${possibleChoice(
            choice
        )}`
    );
};

export const parallaxPropiertiesWarining = (value, choice) => {
    console.warn(
        `parallax/scrollTrigger error propierties props: ${value} is not valid must be one of ${possibleChoice(
            choice
        )} or a custom css propierites like margin|line-height|...`
    );
};

export const parallaxEaseTypeWarining = (value, choice) => {
    console.warn(
        `parallax error easeType props: ${value} is not valid must be one of ${possibleChoice(
            choice
        )}`
    );
};

export const parallaxEaseTypeSpringWarining = () => {
    console.warn(
        'Scrolltrigger warning: spring animation is only available for native properties and ParallaxTween, Check that with the "propierties" property set to "tween" no HandleSequencer is associated with the "tween" property'
    );
};

export const parallaxSpringCongifWarining = (value, choice) => {
    console.warn(
        `parallax/scrollTrigger error springConfig props: ${value} is not valid must be one of ${possibleChoice(
            choice
        )}`
    );
};

export const parallaxRangeNumberWarning = (value) => {
    console.warn(
        `parallax error range propierties, current value: ${value}, the value must be a number between 0 and 9.99`
    );
};

export const parallaxRangeStringWarning = (value) => {
    console.warn(
        `scrollTrigger error range propierties: ${value} is not a String`
    );
};

export const breakpointWarning = (mq, choice, label) => {
    console.warn(
        `parallax/sctrolltrigger error ${label} propierties: ${mq} is not valid must be one of ${possibleChoice(
            choice
        )}`
    );
};

export const parallaxUseSequencerWarining = () => {
    console.warn(
        'Parallax warning: if propierties is a tween the only choice is ParallaxTween, HandleSequencer or empty tween propierites is not allowed inside a parallax'
    );
};

export const parallaxLerpConfigWarning = () => {
    console.warn(
        'parallax/ScrollTrrigger error: velocity is not valid, must be a Number greater than 0 and less than 1'
    );
};

export const parallaxNoTweenDefinedWarning = () => {
    console.warn(
        'parallax/ScrollTrrigger warning:  The property is "tween" but no tween has been associated, associate a tween with the "tween" property'
    );
};

export const parallaxUseTweenButNotProsDefinedWarning = () => {
    console.warn(
        'parallax/ScrollTrrigger: there is tween associated but pros "propierties" is not setted to "tween"'
    );
};

export const functionIsValidAndReturnDefaultWarining = (label, value) => {
    console.warn(`${label}: ${value} is not a function`);
};

export const scrollTriggerRangeWarning = (string, properties, choice) => {
    console.warn(
        `scrollTrigger error range : with '${properties}' propierties ${string} is not valid, add one of the following unit misure: ${possibleChoice(
            choice
        )}, es: 45deg|100px|50vw etc..`
    );
};

export const scrollTriggerCustomRangeWarning = (properties) => {
    console.warn(
        `scrollTrigger error range : with custom css propierties '${properties}' no unit misure is necessary, the default unit misure will be used (px). Only '-' for negative value is allowed`
    );
};

export const scrollTriggerRangeScaleWarning = (string, properties) => {
    console.warn(
        `scrollTrigger error range : with '${properties}' propierties ${string} is not valid no unit misure is necessary. Only '-' for negative value is allowed`
    );
};
