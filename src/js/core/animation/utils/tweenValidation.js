import {
    STAGGER_START,
    STAGGER_END,
    STAGGER_CENTER,
    STAGGER_EDGES,
    STAGGER_RANDOM,
    DIRECTION_RADIAL,
    DIRECTION_ROW,
    DIRECTION_COL,
    STAGGER_TYPE_EQUAL,
    STAGGER_TYPE_START,
    STAGGER_TYPE_END,
    STAGGER_TYPE_CENTER,
} from './stagger/staggerCostant.js';
import { handleSetUp } from '../../setup';
import { checkType } from '../../store/storeType';
import { tweenConfig } from '../tween/tweenConfig';
import {
    createStaggerItemsWarning,
    durationWarining,
    initialDataPropWarining,
    initialDataValueWarining,
    repeatWarining,
    sequencerRangeEndWarning,
    sequencerRangeStartWarning,
    staggerEachWarning,
    staggerFromGenericWarning,
    staggerGridDirectionWarning,
    staggerRowColGenericWarining,
    staggerWaitCompleteWarning,
    tweenEaseWarning,
    yoyoWarining,
} from './warning';

/**
 *
 * @param {(Number|Function)} val
 * @returns {Boolean}
 *
 * @description
 * Check if new prop value to update is valid
 **/
export const dataTweenValueIsValid = (val) => {
    return (
        checkType(Number, val) ||
        (checkType(Function, val) && checkType(Number, val()))
    );
};

/**
 * @param {Object} myObj
 * @param {Number} myObj.start
 * @param {Number} myObj.end
 * @returns {Boolean}
 *
 * @description
 * Check if sequencer start && end value is valid
 */
export const sequencerRangeValidate = ({ start, end }) => {
    const startIsValid = checkType(Number, start);
    const endIsValid = checkType(Number, end);
    if (!startIsValid) sequencerRangeStartWarning(start);
    if (!endIsValid) sequencerRangeEndWarning(end);
    return startIsValid && endIsValid;
};

/**
 *
 * @param {Number} duration
 * @returns {Number}
 *
 * @description
 * Check if new duration value is Valid
 **/
export const durationIsValid = (duration) => {
    const isValid = checkType(Number, duration);
    if (!isValid && duration !== undefined && duration !== null)
        durationWarining(duration);

    return isValid ? duration : handleSetUp.get('sequencer').duration;
};

/**
 *
 * @param {Boolean} yoyo
 * @returns {Boolean}
 *
 * @description
 * Check if yoyo definition is valid
 **/
export const yoyIsValid = (yoyo) => {
    const isValid = checkType(Boolean, yoyo);
    if (!isValid && yoyo !== undefined && yoyo !== null) yoyoWarining(yoyo);

    return isValid ? yoyo : false;
};

/**
 *
 * @param {Number} repeat
 * @returns {Number}
 *
 * @description
 * Check if repeat definition is valid
 **/
export const repeatIsValid = (repeat) => {
    const isValid = checkType(Number, repeat);
    if (!isValid && repeat !== undefined && repeat !== null)
        repeatWarining(repeat);

    return isValid ? repeat : 1;
};

/**
 *
 * @param {String} ease
 * @returns {String}
 *
 * @description
 * Check if ease definition is valid
 **/
export const easeIsValid = (ease) => {
    const isValid = ease in tweenConfig;
    if (!isValid && ease !== undefined && ease !== null) tweenEaseWarning(ease);

    return isValid ? ease : handleSetUp.get('sequencer').ease;
};

/**
 * @param {String} prop
 * @param {Number} value
 * @returns {Boolean}
 *
 * @description
 * Check if new tween prop is valid
 **/
export const initialDataPropValidate = (prop, value) => {
    const propIsValid = checkType(String, prop);
    const valueIsValid = checkType(Number, value);

    if (!propIsValid) initialDataPropWarining(prop);
    if (!valueIsValid) initialDataValueWarining(value);

    return propIsValid && valueIsValid;
};

/**
 * @param {Number} each
 * @returns {Boolean}
 *
 * @description
 **/
export const validateStaggerEach = (each) => {
    if (!each) return null;
    const eachIsValid = checkType(Number, each);
    if (!eachIsValid) staggerEachWarning();

    return eachIsValid;
};

/**
 * @param {('start'|'end'|'center'|'edges'|'random'|{x:number,y:number}|number)}  from
 * @returns {Boolean}
 *
 * @description
 **/
export const validateStaggerFrom = (from) => {
    if (!from) return null;

    const fromList = [
        STAGGER_START,
        STAGGER_END,
        STAGGER_CENTER,
        STAGGER_EDGES,
        STAGGER_RANDOM,
    ];

    const fromIsAValidString = fromList.includes(from);
    const fromIsANumber = checkType(Number, from);
    const fromIsAValidObject = (() => {
        if (!checkType(Object, from)) return false;
        const propIsValid = 'x' in from && 'y' in from;
        const valIsValid = Object.values(from).every((val) =>
            checkType(Number, val)
        );
        return propIsValid && valIsValid;
    })();
    const fromIsValid =
        fromIsAValidString || fromIsANumber || fromIsAValidObject;
    if (!fromIsValid) staggerFromGenericWarning(from);

    return fromIsValid;
};

/**
 * @param {Number} val
 * @returns {Boolean}
 *
 * @description
 **/
export const validateStaggerColRow = (val) => {
    if (!val) return null;
    const valIsValid = checkType(Number, val);
    if (!valIsValid) staggerRowColGenericWarining(val);

    return valIsValid;
};

/**
 * @param {('row'|'col'|'radial')} direction
 * @returns {Boolean}
 *
 * @description
 **/
export const validateStaggerDirection = (direction) => {
    if (!direction) return null;

    const directionList = [DIRECTION_RADIAL, DIRECTION_ROW, DIRECTION_COL];

    const directionisValid = directionList.includes(direction);
    if (!directionisValid) staggerGridDirectionWarning(direction);

    return directionisValid;
};

/**
 * @param {Boolean} waitComplete
 * @returns {Boolean}
 *
 * @description
 **/
export const validateStaggerWaitComplete = (waitComplete) => {
    if (!waitComplete) return null;
    const valIsValid = checkType(Boolean, waitComplete);
    if (!valIsValid) staggerWaitCompleteWarning(waitComplete);

    return valIsValid;
};

/**
 * @param {array} arr
 * @returns {boolean}
 *
 * @description
 **/
export const createStaggerItemsIsValid = (arr = []) => {
    const isValid = checkType(Array, [...arr]) && arr.length > 0;
    if (!isValid) createStaggerItemsWarning();

    return isValid;
};

/**
 * @param {string} arr
 * @returns {boolean}
 *
 * @description
 **/
export const createStaggerTypeIsValid = (type) => {
    const stagerTypeList = [
        STAGGER_TYPE_EQUAL,
        STAGGER_TYPE_START,
        STAGGER_TYPE_END,
        STAGGER_TYPE_CENTER,
    ];

    return stagerTypeList.includes(type);
};
