import { handleSetUp } from '../../../setup';
import { MQ_MAX, MQ_MIN } from '../setUp/setUpValidation.js';
import { parallaxConstant } from '../../parallax/parallaxConstant.js';
import { getTweenFn, tweenConfig } from '../../tween/tweenConfig';
import {
    DIRECTION_COL,
    DIRECTION_RADIAL,
    DIRECTION_ROW,
    STAGGER_CENTER,
    STAGGER_EDGES,
    STAGGER_END,
    STAGGER_RANDOM,
    STAGGER_START,
    STAGGER_TYPE_CENTER,
    STAGGER_TYPE_END,
    STAGGER_TYPE_EQUAL,
    STAGGER_TYPE_START,
} from '../stagger/staggerCostant.js';
import {
    addAsyncFunctionWarining,
    asyncTimelineDelayWarning,
    asyncTimelineTweenWaring,
    booleanWarning,
    breakpointWarning,
    createStaggerItemsWarning,
    createStaggerTypeWarning,
    durationNumberOrFunctionWarining,
    durationWarining,
    functionIsValidAndReturnDefaultWarining,
    functionWarning,
    genericEaseTypeWarining,
    initialDataPropWarining,
    initialDataValueWarining,
    lerpPrecisionWarining,
    lerpVelocityWarining,
    naumberWarning,
    parallaxAlignWarining,
    parallaxDirectionWarining,
    parallaxDynmicRangeValueWarining,
    parallaxDynmicValueWarining,
    parallaxEaseTypeSpringWarining,
    parallaxEaseTypeWarining,
    parallaxLerpConfigWarning,
    parallaxNoTweenDefinedWarning,
    parallaxOnSwitchWarining,
    parallaxOpacityWarning,
    parallaxPropiertiesWarining,
    parallaxRangeNumberWarning,
    parallaxRangeStringWarning,
    parallaxSpringCongifWarining,
    parallaxTweenWarning,
    parallaxTypeWarining,
    parallaxUseSequencerWarining,
    parallaxUseTweenButNotProsDefinedWarning,
    playLabelWarining,
    relativeWarining,
    repeatWarining,
    scrollTriggerCustomRangeWarning,
    scrollTriggerRangeScaleWarning,
    scrollTriggerRangeWarning,
    sequencerRangeEndWarning,
    sequencerRangeStartWarning,
    springConfigPropWarning,
    springConfigSpecificPropWarning,
    springPresetWarning,
    staggerEachWarning,
    staggerFromGenericWarning,
    staggerGridDirectionWarning,
    staggerRowColGenericWarining,
    staggerWaitCompleteWarning,
    stringWarning,
    timelineSetTweenArrayWarining,
    timelineSetTweenLabelWarining,
    tweenEaseWarning,
    valueStringWarning,
} from '../warning';
import {
    checkIfIsOnlyNumber,
    checkIfIsOnlyNumberPositiveNegative,
    exactMatchInsesitiveNumberPropArray,
} from '../regexValidation';
import { getPropiertiesValueFromConstant } from '../../parallax/getConstantFromRegex.js';
import { mobCore } from '../../../../mobCore';

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
        mobCore.checkType(Number, val) ||
        (mobCore.checkType(Function, val) && mobCore.checkType(Number, val()))
    );
};

/**
 * @param {Object|undefined} myObj
 * @param {Number|undefined} myObj.start
 * @param {Number|undefined} myObj.end
 * @returns {Boolean}
 *
 * @description
 * Check if sequencer start && end value is valid
 */
export const sequencerRangeValidate = ({ start, end }) => {
    const startIsValid = mobCore.checkType(Number, start);
    const endIsValid = mobCore.checkType(Number, end);
    if (!startIsValid) sequencerRangeStartWarning(start);
    if (!endIsValid) sequencerRangeEndWarning(end);
    return startIsValid && endIsValid;
};

/**
 *
 * @param {Number|undefined} duration
 * @returns {Number}
 *
 * @description
 * Check if new duration value is Valid
 **/
export const durationIsValid = (duration) => {
    const isValid = mobCore.checkType(Number, duration);
    if (!isValid && duration !== undefined && duration !== null)
        durationWarining(duration);

    return isValid ? duration : handleSetUp.get('sequencer').duration;
};

/**
 *
 * @param {Number|undefined} repeat
 * @returns {Number}
 *
 * @description
 * Check if repeat definition is valid
 **/
export const repeatIsValid = (repeat) => {
    const isValid = mobCore.checkType(Number, repeat);
    if (!isValid && repeat !== undefined && repeat !== null)
        repeatWarining(repeat);

    return isValid ? repeat : 1;
};

/**
 *
 * @param {String|undefined} ease
 * @returns {import('../../tween/type').easeTypes}
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
 *
 * @param {import('../../tween/type').easeTypes|undefined} ease
 * @returns {function}
 *
 * @description
 * Check if ease definition is valid
 **/
export const easeParallaxTweenIsValid = (ease) => {
    const isValid = ease in tweenConfig;
    if (!isValid && ease !== undefined && ease !== null) tweenEaseWarning(ease);

    return isValid
        ? getTweenFn(ease)
        : getTweenFn(handleSetUp.get('parallaxTween').ease);
};

/**
 * @param {String|undefined} prop
 * @param {Number|undefined} value
 * @returns {Boolean}
 *
 * @description
 * Check if new tween prop is valid
 **/
export const initialDataPropValidate = (prop, value) => {
    const propIsValid = mobCore.checkType(String, prop);
    const valueIsValid = mobCore.checkType(Number, value);

    if (!propIsValid) initialDataPropWarining(prop);
    if (!valueIsValid) initialDataValueWarining(value);

    return propIsValid && valueIsValid;
};

/**
 * @param {Number|undefined} each
 * @returns {Boolean}
 *
 * @description
 **/
export const validateStaggerEach = (each) => {
    if (!each) return null;
    const eachIsValid = mobCore.checkType(Number, each);
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
    const fromIsANumber = mobCore.checkType(Number, from);
    const fromIsAValidObject = mobCore.checkType(Object, from);
    const fromIsValid =
        fromIsAValidString || fromIsANumber || fromIsAValidObject;
    if (!fromIsValid) staggerFromGenericWarning(from);

    return fromIsValid;
};

/**
 * @param {Number|undefined} val
 * @returns {Boolean}
 *
 * @description
 **/
export const validateStaggerColRow = (val) => {
    if (!val) return null;
    const valIsValid = mobCore.checkType(Number, val);
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
 * @param {Boolean|undefined} waitComplete
 * @returns {Boolean}
 *
 * @description
 **/
export const validateStaggerWaitComplete = (waitComplete) => {
    if (!waitComplete) return null;
    const valIsValid = mobCore.checkType(Boolean, waitComplete);
    if (!valIsValid) staggerWaitCompleteWarning(waitComplete);

    return valIsValid;
};

/**
 * @param {array|undefined} arr
 * @returns {boolean}
 *
 * @description
 * Return only the boolean value
 **/
export const validateStaggerItems = (arr = []) => {
    const isValid = mobCore.checkType(Array, [...arr]) && arr.length > 0;
    if (!isValid) createStaggerItemsWarning();

    return isValid;
};

/**
 * @param {array|undefined} arr
 * @returns {Array}
 *
 * @description
 * Return the array fallback
 **/
export const staggerItemsIsValid = (arr = []) => {
    const isValid = mobCore.checkType(Array, [...arr]) && arr.length > 0;
    return isValid ? arr : [];
};

/**
 * @param {string|undefined} arr
 * @returns {boolean}
 *
 * @description
 **/
export const validateStaggerType = (type) => {
    if (!type) return null;

    const stagerTypeList = [
        STAGGER_TYPE_EQUAL,
        STAGGER_TYPE_START,
        STAGGER_TYPE_END,
        STAGGER_TYPE_CENTER,
    ];

    const isValid = stagerTypeList.includes(type);
    if (!isValid) return createStaggerTypeWarning();

    return isValid;
};

/**
 *
 * @param {Number|undefined} tween duration
 * @returns {Number}
 *
 * @description
 * Check if new tween duration value is Valid
 **/
export const durationTweenIsValid = (duration) => {
    const isValid = mobCore.checkType(Number, duration);
    if (!isValid && duration !== undefined && duration !== null)
        durationWarining(duration);

    return isValid ? duration : handleSetUp.get('tween').duration;
};

/**
 *
 * @param {Boolean|undefined} val  relative prop
 * @param {('tween'|'spring'|'lerp')} tweenType relative prop
 * @returns {Boolean}
 *
 * @description
 * Check if new relative value is Valid
 **/
export const relativeIsValid = (val, tweenType) => {
    const isValid = mobCore.checkType(Boolean, val);
    if (!isValid && val !== undefined && val !== null)
        relativeWarining(val, tweenType);

    return isValid ? val : handleSetUp.get(tweenType).relative;
};

/**
 *
 * @param {String|undefined} ease
 * @returns {Function}
 *
 * @description
 * Check if ease definition is valid
 **/
export const easeTweenIsValidGetFunction = (ease) => {
    const isValid = ease in tweenConfig;
    if (!isValid && ease !== undefined && ease !== null) tweenEaseWarning(ease);

    return isValid
        ? getTweenFn(ease)
        : getTweenFn(handleSetUp.get('tween').ease);
};

/**
 *
 * @param {String|undefined} ease
 * @returns {String}
 *
 * @description
 * Check if ease definition is valid
 **/
export const easeTweenIsValid = (ease) => {
    const isValid = ease in tweenConfig;
    if (!isValid && ease !== undefined && ease !== null) tweenEaseWarning(ease);

    return isValid ? ease : handleSetUp.get('tween').ease;
};

/**
 *
 * @param {String} spring config
 * @returns {Object}
 *
 * @description
 * Check if spring config is valid and return new config
 **/
export const springConfigIsValidAndGetNew = (config) => {
    const { config: allConfig } = handleSetUp.get('spring');

    //Get config from store
    const isInConfig = config in allConfig;

    // Get obj config
    const obj = isInConfig ? allConfig[config] : {};

    // Check if there is all key
    const isValidPropsKey = isInConfig
        ? (() => {
              return (
                  mobCore.checkType(Object, obj) &&
                  'tension' in obj &&
                  'mass' in obj &&
                  'friction' in obj &&
                  'velocity' in obj &&
                  'precision' in obj
              );
          })()
        : false;

    // Check if all key is a positive number
    const isValidPropsValue = isValidPropsKey
        ? Object.values(obj).every((prop) => {
              return mobCore.checkType(Number, prop) && prop >= 0;
          })
        : null;

    // warning gif config don't exist
    if (!isInConfig && config !== undefined && config !== null)
        springPresetWarning(config);

    // warning if config props is not valid
    if (!isValidPropsValue && isInConfig)
        springConfigSpecificPropWarning(config);

    return isValidPropsValue ? allConfig[config] : allConfig.default;
};

/**
 *
 * @param {String} spring config
 * @returns {String}
 *
 * @description
 * Check if spring config is valid
 **/
export const springConfigIsValid = (config) => {
    const { config: allConfig } = handleSetUp.get('spring');
    const isValid = config in allConfig;
    if (!isValid && config !== undefined && config !== null)
        springPresetWarning(config);

    return isValid;
};

/**
 *
 * @param {String} spring config
 * @returns {import('../../spring/type').springPropsOptional}
 *
 * @description
 * Check if every spring config prop is valid
 **/
export const springConfigPropIsValid = (obj) => {
    const isValid =
        mobCore.checkType(Object, obj) &&
        Object.values(obj).every((prop) => {
            return mobCore.checkType(Number, prop) && prop >= 0;
        });

    if (!isValid && obj !== undefined && obj !== null)
        springConfigPropWarning();

    return isValid ? obj : {};
};

/**
 *
 * @param {(Number|Function|undefined)} duration
 * @returns {Number}
 *
 * @description
 * Check if duration definition is valid
 **/
export const durationIsNumberOrFunctionIsValid = (duration) => {
    const durationIsFn = mobCore.checkType(Function, duration);
    const durationResult = durationIsFn ? duration() : duration;
    const isValid = mobCore.checkType(Number, durationResult);
    if (!isValid && duration !== undefined && duration !== null)
        durationNumberOrFunctionWarining(duration);

    return isValid ? durationResult : handleSetUp.get('tween').duration;
};

/**
 *
 * @param {Boolean} value
 * @param {String} label
 *
 * @description
 * Check if value is Boolan and true
 **/
export const valueIsBooleanAndTrue = (value, label) => {
    const isValid = mobCore.checkType(Boolean, value);
    if (!isValid && value !== undefined && value !== null)
        booleanWarning(value, label);

    return isValid && value === true;
};

/**
 *
 * @param {Boolean|undefined} value
 * @param {String} label
 * @param {Boolean} defaultValue
 * @returns {Boolean}
 *
 * @description
 * Check if value is Boolan and reteurn Default
 **/
export const valueIsBooleanAndReturnDefault = (value, label, defaultValue) => {
    const isValid = mobCore.checkType(Boolean, value);
    if (!isValid && value !== undefined && value !== null)
        booleanWarning(value, label);

    return isValid ? value : defaultValue;
};

/**
 *
 * @param {String|undefined} value
 * @returns {String}
 *
 * @description
 * Check if value is String and return default
 **/
export const valueIsStringAndReturnDefault = (value, label, defaultValue) => {
    const isValid = mobCore.checkType(String, value);
    if (!isValid && value !== undefined && value !== null)
        stringWarning(value, label);

    return isValid ? value : defaultValue;
};

/**
 *
 * @param {Number|undefined} value
 * @returns {Number}
 *
 * @description
 * Check if value is Number and return default
 **/
export const valueIsNumberAndReturnDefault = (value, label, defaultValue) => {
    const isValid = mobCore.checkType(Number, Number.parseFloat(value));
    if (!isValid && value !== undefined && value !== null)
        naumberWarning(value, label);

    return isValid ? value : defaultValue;
};

/**
 *
 * @param {Function|undefined} value
 * @returns {Function}
 *
 * @description
 * Check if value is Function and return default
 **/
export const valueIsFunctionAndReturnDefault = (value, label, defaultValue) => {
    const isValid = mobCore.checkType(Function, value);
    if (!isValid && value !== undefined && value !== null)
        functionWarning(value, label);

    return isValid ? value : defaultValue;
};

/**
 *
 * @param {Number|undefined} velocity
 * @returns {Number}
 *
 * @description
 * Check if velocity is valid
 **/
export const lerpVelocityIsValid = (value) => {
    const isValid = mobCore.checkType(Number, value) && value > 0 && value <= 1;
    if (!isValid && value !== undefined && value !== null)
        lerpVelocityWarining();

    return isValid ? value : handleSetUp.get('lerp').velocity;
};

/**
 *
 * @param {Number|undefined} velocity
 * @returns {Number}
 *
 * @description
 * Check if precision is valid
 **/
export const lerpPrecisionIsValid = (value) => {
    const isValid = mobCore.checkType(Number, value);
    if (!isValid && value !== undefined && value !== null)
        lerpPrecisionWarining();

    return isValid ? value : handleSetUp.get('lerp').precision;
};

/**
 *
 * @param {String|undefined} value
 * @param {String} label
 * @returns {Boolean}
 *
 * @description
 * Check if value is a string.
 **/
export const valueStringIsValid = (value, label) => {
    const isValid = mobCore.checkType(String, value);
    if (!isValid && value !== undefined && value !== null)
        valueStringWarning(label);

    return isValid;
};

/**
 *
 * @param {Number|undefined} value
 * @returns {NUmber|null}
 *
 * @description
 * Check if Delay is a Number and return Number || null.
 **/
export const asyncTimelineDelayIsValid = (value) => {
    const isValid = mobCore.checkType(Number, value);
    if (!isValid && value !== undefined && value !== null)
        asyncTimelineDelayWarning();

    return isValid ? value : null;
};

/**
 *
 * @param {Object|undefined} value
 * @returns {Boolean}
 *
 * @description
 * Check if tween is lerp|spring|tween
 **/
export const asyncTimelineTweenIsValid = (instance) => {
    const isValid =
        instance?.getType?.() &&
        (instance.getType() === 'LERP' ||
            instance.getType() === 'SPRING' ||
            instance.getType() === 'TWEEN');

    if (!isValid && instance !== undefined && instance !== null)
        asyncTimelineTweenWaring();

    return isValid;
};

/**
 *
 * @param {string|Number|null} index
 * @param {String|null} label
 *
 * @description
 * Check if label is found
 **/
export const playLabelIsValid = (index, label) => {
    if (index === -1) playLabelWarining(label);
};

/**
 *
 * @param {Function|undefined} fn
 *
 * @description
 * Check if value is A function and return default
 **/
export const functionIsValidAndReturnDefault = (fn, defaultValue, label) => {
    const isValid = mobCore.checkType(Function, fn);
    if (!isValid && fn !== undefined && fn !== null)
        functionIsValidAndReturnDefaultWarining(label, fn);

    return isValid ? fn : defaultValue;
};

/**
 *
 * @param {Function|undefined} fn
 *
 * @description
 * Check if value is A function
 **/
export const addAsyncFunctionIsValid = (fn) => {
    const isValid = mobCore.checkType(Function, fn);
    if (!isValid && fn !== undefined && fn !== null)
        addAsyncFunctionWarining(fn);

    return isValid
        ? fn
        : ({ resolve }) => {
              resolve();
          };
};

/**
 *
 * @param {Array|undefined} arr
 *
 * @description
 * Check if value is an Array
 **/
export const timelineSetTweenArrayIsValid = (arr) => {
    const isValid = mobCore.checkType(Array, arr);
    if (!isValid && arr !== undefined && arr !== null)
        timelineSetTweenArrayWarining(arr);

    return isValid;
};

/**
 *
 * @param {String|undefined} label
 *
 * @description
 * Check if value is an string
 **/
export const timelineSetTweenLabelIsValid = (label) => {
    const isValid = mobCore.checkType(String, label);
    if (!isValid && label !== undefined && label !== null)
        timelineSetTweenLabelWarining(label);

    return isValid;
};

/**
 *
 * @param {(string|HTMLElement|Window|undefined)} element
 * @returns {HTMLElement}
 *
 * @description
 * Check if value is a valid Element and return element|window|element
 **/
export const domNodeIsValidAndReturnElOrWin = (
    element,
    returnWindow = false
) => {
    const isNode = mobCore.checkType(Element, element);
    const realEl = isNode ? element : document.querySelector(element);
    const isValid = realEl && realEl !== undefined && realEl !== null;

    if (returnWindow) {
        return isValid ? realEl : window;
    } else {
        return isValid ? realEl : document.createElement('div');
    }
};

/**
 *
 * @param {(String|HTMLElement|undefined)} element
 * @returns {HTMLElement|null}
 *
 * @description
 * Check if value is a valid Element
 **/
export const domNodeIsValidAndReturnNull = (element) => {
    const isNode = mobCore.checkType(Element, element);
    const realEl = isNode ? element : document.querySelector(element);
    const isValid = realEl && realEl !== undefined && realEl !== null;
    return isValid ? realEl : null;
};

/**
 * Specific parallax
 */

/**
 *
 * @param {String|undefined} label
 * @returns {string}
 *
 * @description
 * Check if value is a valid direction
 **/
export const directionIsValid = (direction, component) => {
    const choice = [
        parallaxConstant.DIRECTION_VERTICAL,
        parallaxConstant.DIRECTION_HORIZONTAL,
    ];

    const isValid = choice.includes(direction);
    if (!isValid && direction !== undefined && direction !== null)
        parallaxDirectionWarining(direction, component);

    return isValid ? direction : parallaxConstant.DIRECTION_VERTICAL;
};

/**
 *
 * @param {Object|undefined} obj
 * @param {label} string
 * @returns {Object} dynamicStart|dynamicEnd|null Object
 *
 * @description
 * Check if dynamicStart|dynamicEnd is a valid direction
 **/
export const parallaxDynamicValueIsValid = (obj, label) => {
    const positionChoice = [
        parallaxConstant.POSITION_TOP,
        parallaxConstant.POSITION_LEFT,
        parallaxConstant.POSITION_RIGHT,
        parallaxConstant.POSITION_BOTTOM,
    ];

    // obj is an Object
    const valueIsObject = mobCore.checkType(Object, obj);
    //
    // position is a String and contains the right value
    const positionIsValid =
        valueIsObject &&
        mobCore.checkType(String, obj?.position) &&
        positionChoice.includes(obj.position);

    // Value is a function and return a number
    const valueIsValid =
        valueIsObject &&
        mobCore.checkType(Function, obj.value) &&
        mobCore.checkType(Number, obj.value());

    // Validate all
    const isValid = valueIsObject && positionIsValid && valueIsValid;
    if (!isValid) parallaxDynmicValueWarining(label);

    return isValid ? obj : null;
};

/**
 *
 * @param {Function|undefined} value
 * @returns {Function}
 *
 * @description
 * Check if dynamicRange is a functiom that return a Number
 **/
export const parallaxDynamicRangeIsValid = (fn) => {
    const isValid =
        mobCore.checkType(Function, fn) && mobCore.checkType(Number, fn());

    if (!isValid && fn !== undefined && fn !== null)
        parallaxDynmicRangeValueWarining();

    return isValid ? fn : null;
};

/**
 *
 * @param {Object|undefined} value
 * @returns {Object} parallaxTween|HandleSequencer|{}
 *
 * @description
 * Check if tween is parallaxTween|HandleSequencer
 **/
export const parallaxTweenIsValid = (instance) => {
    const isValid =
        instance?.getType?.() &&
        (instance.getType() === parallaxConstant.TWEEN_TWEEN ||
            instance.getType() === parallaxConstant.TWEEN_TIMELINE);

    if (!isValid && instance !== undefined && instance !== null)
        parallaxTweenWarning();

    return isValid ? instance : {};
};

/**
 *
 * @param {( String|Number|undefined )} value
 * @returns {( String|Number )} ALign value
 *
 * @description
 * Check if Align value is valid
 **/
export const parallaxAlignIsValid = (value) => {
    const choice = [
        parallaxConstant.ALIGN_START,
        parallaxConstant.ALIGN_TOP,
        parallaxConstant.ALIGN_RIGHT,
        parallaxConstant.ALIGN_CENTER,
        parallaxConstant.ALIGN_BOTTOM,
        parallaxConstant.ALIGN_LEFT,
        parallaxConstant.ALIGN_END,
    ];

    const isValid =
        choice.includes(value) ||
        mobCore.checkType(Number, Number.parseFloat(value));

    if (!isValid && value !== undefined && value !== null)
        parallaxAlignWarining(value, choice);

    return isValid ? value : parallaxConstant.ALIGN_CENTER;
};

/**
 *
 * @param {String|undefined} value
 * @returns {String} ALign value
 *
 * @description
 * Check if unSwitch value is valid
 **/
export const parallaxOnSwitchIsValid = (value) => {
    const choice = [
        parallaxConstant.IN_BACK,
        parallaxConstant.IN_STOP,
        parallaxConstant.OUT_BACK,
        parallaxConstant.OUT_STOP,
    ];

    const isValid = choice.includes(value);

    if (!isValid && value !== undefined && value !== null)
        parallaxOnSwitchWarining(value, choice);

    return isValid ? value : false;
};

/**
 *
 * @param {Number|undefined} value
 * @returns {Number}
 *
 * @description
 * Check if value is Number and return default
 **/
export const parallaxOpacityIsValid = (value, label, defaultValue) => {
    const isValid = mobCore.checkType(Number, Number.parseFloat(value));
    if (!isValid && value !== undefined && value !== null)
        parallaxOpacityWarning(value, label);

    return isValid ? value : defaultValue;
};

/**
 *
 * @param {String|undefined} value
 * @returns {String}
 *
 * @description
 * Check if type propierties is valid
 **/
export const parallaxTypeIsValid = (value) => {
    const valueParsed = value ? value.toLowerCase() : null;

    const choice = [
        parallaxConstant.TYPE_PARALLAX,
        parallaxConstant.TYPE_SCROLLTRIGGER,
    ];

    const isValid = choice.includes(valueParsed);

    if (!isValid && valueParsed !== undefined && valueParsed !== null)
        parallaxTypeWarining(valueParsed, choice);

    return isValid ? valueParsed : parallaxConstant.TYPE_PARALLAX;
};

/**
 *
 * @param {string|number|undefined} value
 * @returns {String}
 *
 * @description
 * Check if range propierties is valid
 **/
export const parallaxRangeIsValid = (value, type) => {
    const parsedValue = () => {
        if (type === parallaxConstant.TYPE_PARALLAX) {
            const isOnlyNumber = checkIfIsOnlyNumber(value);
            const isValid =
                mobCore.checkType(Number, Number.parseFloat(value)) &&
                isOnlyNumber &&
                value >= 0 &&
                value < 10;

            if (!isValid && value !== undefined && value !== null)
                parallaxRangeNumberWarning(value);

            return isValid
                ? 10 - value
                : 10 - handleSetUp.get('parallax').defaultRange;
        } else {
            const isValid = mobCore.checkType(String, value);
            if (!isValid && value !== undefined && value !== null)
                parallaxRangeStringWarning(value);

            return isValid ? value : '0px';
        }
    };

    return parsedValue();
};

/**
 *
 * @param {String|undefined} value
 * @returns {String}
 *
 * @description
 * Check if breakpoint prop is valid
 **/
export const breakpointIsValid = (mq, label, component) => {
    const mqObj = handleSetUp.get('mq');
    const defaultMq = handleSetUp.get('defaultMq').value;
    const choice = Object.keys(mqObj);

    const isValid = mobCore.checkType(String, mq) && choice.includes(mq);
    if (!isValid && mq !== undefined && mq !== null)
        breakpointWarning(mq, choice, label, component);

    return isValid ? mq : defaultMq;
};

/**
 *
 * @param {String|undefined} value
 * @returns {String}
 *
 * @description
 * Check if queryType prop is valid
 **/
export const breakpointTypeIsValid = (type, label, component) => {
    const defaultType = handleSetUp.get('defaultMq').type;
    const choice = [MQ_MAX, MQ_MIN];

    const isValid = mobCore.checkType(String, type) && choice.includes(type);
    if (!isValid && type !== undefined && type !== null)
        breakpointWarning(type, choice, label, component);

    return isValid ? type : defaultType;
};

/**
 *
 * @param {String|undefined} value
 * @returns {String}
 *
 * @description
 * Check if propierties prop is valid
 **/
export const parallaxPropiertiesIsValid = (
    value,
    type,
    tweenIsParallaxTween,
    tweenIsSequencer
) => {
    /**
     * Support suggestion for console.warn();
     */
    const choice = [
        parallaxConstant.PROP_VERTICAL,
        parallaxConstant.PROP_HORIZONTAL,
        parallaxConstant.PROP_ROTATE,
        parallaxConstant.PROP_ROTATEY,
        parallaxConstant.PROP_ROTATEX,
        parallaxConstant.PROP_ROTATEZ,
        parallaxConstant.PROP_OPACITY,
        parallaxConstant.PROP_SCALE,
        parallaxConstant.PROP_TWEEN,
    ];

    /**
     * Check if is a string, custom css propierties is allowed
     */
    const isValid = mobCore.checkType(String, value);
    if (!isValid && value !== undefined && value !== null)
        parallaxPropiertiesWarining(value, choice);

    /**
     * Inside Parallax sequencer is not allowed
     * So return verticasl props
     */
    const notParallaxTweenInsideParallax =
        type === parallaxConstant.TYPE_PARALLAX &&
        value === parallaxConstant.PROP_TWEEN &&
        !tweenIsParallaxTween;

    /**
     * Check if with tween propierties there is a tween associated
     */
    if (
        !tweenIsParallaxTween &&
        !tweenIsSequencer &&
        value === parallaxConstant.PROP_TWEEN
    )
        parallaxNoTweenDefinedWarning();

    /**
     * Check if there a tween but propierties is not settled to tween
     */
    if (
        (tweenIsParallaxTween || tweenIsSequencer) &&
        value !== parallaxConstant.PROP_TWEEN
    )
        parallaxUseTweenButNotProsDefinedWarning();

    if (notParallaxTweenInsideParallax) parallaxUseSequencerWarining();
    const valueParsed = notParallaxTweenInsideParallax
        ? parallaxConstant.PROP_VERTICAL
        : value;

    /**
     * Get original value from constant
     */
    const valueFromConstant = getPropiertiesValueFromConstant(valueParsed);

    return isValid ? valueFromConstant : parallaxConstant.PROP_VERTICAL;
};

/**
 *
 * @param {String|undefined} value
 * @returns {String}
 *
 * @description
 * Check if easeType is valid
 **/
export const parallaxEaseTypeIsValid = (
    value,
    isSequencer,
    isScrollTtrigger
) => {
    const choice = [parallaxConstant.EASE_SPRING, parallaxConstant.EASE_LERP];
    const sequencerUseSpringInsideScrolltrigger =
        isSequencer &&
        isScrollTtrigger &&
        value === parallaxConstant.EASE_SPRING;

    const isValid = choice.includes(value);
    if (!isValid && value !== undefined && value !== null)
        parallaxEaseTypeWarining(value, choice);

    /**
     * Sequencer can not use spring
     */
    if (sequencerUseSpringInsideScrolltrigger) parallaxEaseTypeSpringWarining();
    const fallbackIfIsValid = isValid ? value : parallaxConstant.EASE_LERP;
    const fallback = sequencerUseSpringInsideScrolltrigger
        ? parallaxConstant.EASE_LERP
        : fallbackIfIsValid;

    return isValid ? value : fallback;
};

export const genericEaseTypeIsValid = (value, component) => {
    const choice = [parallaxConstant.EASE_SPRING, parallaxConstant.EASE_LERP];

    const isValid = choice.includes(value);
    if (!isValid && value !== undefined && value !== null)
        genericEaseTypeWarining(value, choice, component);

    return isValid ? value : parallaxConstant.EASE_LERP;
};

/**
 *
 * @param {String|undefined} value
 * @returns {String}
 *
 * @description
 * Check if springConfig is valid
 **/
export const parallaxSpringConfigIsValid = (config, type) => {
    const springDefaultConfig = handleSetUp.get('spring').config;
    const choice = Object.keys(springDefaultConfig);

    const defaultConfig =
        type === parallaxConstant.TYPE_PARALLAX
            ? handleSetUp.get('parallax').springConfig
            : handleSetUp.get('scrollTrigger').springConfig;

    const isValid = choice.includes(config);
    if (!isValid && config !== undefined && config !== null)
        parallaxSpringCongifWarining(config, choice);

    return isValid ? config : defaultConfig;
};

/**
 *
 * @param {Number|undefined} value
 * @returns {Number}
 *
 * @description
 * Check if lerpConfig is valid
 **/
export const parallaxLerpConfigIsValid = (value, type) => {
    const isValid =
        mobCore.checkType(Number, Number.parseFloat(value)) &&
        value > 0 &&
        value <= 1;
    if (!isValid && value !== undefined && value !== null)
        parallaxLerpConfigWarning();

    const defaultConfig =
        type === parallaxConstant.TYPE_PARALLAX
            ? handleSetUp.get('parallax').lerpConfig
            : handleSetUp.get('scrollTrigger').lerpConfig;

    return isValid ? Number.parseFloat(value) : defaultConfig;
};

export const checkStringRangeOnPropierties = (string, properties) => {
    const parallalxXYRangeChoice = [
        parallaxConstant.PX,
        parallaxConstant.VW,
        parallaxConstant.VH,
        parallaxConstant.WPERCENT,
        parallaxConstant.HPERCENT,
    ];
    /**
     * Check X,Y prop
     */
    if (
        properties === parallaxConstant.PROP_VERTICAL ||
        properties === parallaxConstant.PROP_HORIZONTAL
    ) {
        const isValid = exactMatchInsesitiveNumberPropArray(
            parallalxXYRangeChoice,
            string
        );
        if (!isValid)
            scrollTriggerRangeWarning(
                string,
                properties,
                parallalxXYRangeChoice
            );
        return isValid ? string : '0px';
    }

    /**
     * Check ROTATE PROP
     */
    if (
        properties === parallaxConstant.PROP_ROTATE ||
        properties === parallaxConstant.PROP_ROTATEX ||
        properties === parallaxConstant.PROP_ROTATEY ||
        properties === parallaxConstant.PROP_ROTATEZ
    ) {
        const isValid = exactMatchInsesitiveNumberPropArray(
            [parallaxConstant.DEGREE],
            string
        );
        if (!isValid)
            scrollTriggerRangeWarning(string, properties, [
                parallaxConstant.DEGREE,
            ]);

        return isValid ? string : '0';
    }

    /**
     * Check SCALE PROP
     */
    if (properties === parallaxConstant.PROP_SCALE) {
        const isValid = checkIfIsOnlyNumberPositiveNegative(string);
        if (!isValid) scrollTriggerRangeScaleWarning(string, properties);
        return isValid ? string : '0';
    }

    /**
     * Other props without unit misure
     * Only Number
     */
    const isValid = checkIfIsOnlyNumberPositiveNegative(string);
    if (!isValid) scrollTriggerCustomRangeWarning(properties);

    return isValid ? string : '0';
};
