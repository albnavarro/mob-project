import { handleSetUp } from '../../setup';
import { checkType } from '../../store/storeType';
import { MQ_MAX, MQ_MIN } from './setUpValidation.js';
import { parallaxConstant } from '../parallax/parallaxConstant.js';
import { getTweenFn, tweenConfig } from '../tween/tweenConfig';
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
} from './stagger/staggerCostant.js';
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
} from './warning';
import {
    checkIfIsOnlyNumber,
    checkIfIsOnlyNumberPositiveNegative,
    exactMatchInsesitiveNumberPropArray,
} from './regexValidation';
import { getPropiertiesValueFromConstant } from './getConstantFromRegex';

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
 *
 * @param {String} ease
 * @returns {String}
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
    const fromIsAValidObject = checkType(Object, from);
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
 * Return only the boolean value
 **/
export const validateStaggerItems = (arr = []) => {
    const isValid = checkType(Array, [...arr]) && arr.length > 0;
    if (!isValid) createStaggerItemsWarning();

    return isValid;
};

/**
 * @param {array} arr
 * @returns {boolean}
 *
 * @description
 * Return the array fallback
 **/
export const staggerItemsIsValid = (arr = []) => {
    const isValid = checkType(Array, [...arr]) && arr.length > 0;
    return isValid ? arr : [];
};

/**
 * @param {string} arr
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
 * @param {Number} tween duration
 * @returns {Number}
 *
 * @description
 * Check if new tween duration value is Valid
 **/
export const durationTweenIsValid = (duration) => {
    const isValid = checkType(Number, duration);
    if (!isValid && duration !== undefined && duration !== null)
        durationWarining(duration);

    return isValid ? duration : handleSetUp.get('tween').duration;
};

/**
 *
 * @param {Boolean} val  relative prop
 * @param {('tween'|'spring'|'lerp')} tweenType relative prop
 * @returns {Boolean}
 *
 * @description
 * Check if new relative value is Valid
 **/
export const relativeIsValid = (val, tweenType) => {
    const isValid = checkType(Boolean, val);
    if (!isValid && val !== undefined && val !== null)
        relativeWarining(val, tweenType);

    return isValid ? val : handleSetUp.get(tweenType).relative;
};

/**
 *
 * @param {String} ease
 * @returns {String}
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
 * @param {String} ease
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
 * @returns {String}
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
                  checkType(Object, obj) &&
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
              return checkType(Number, prop) && prop >= 0;
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
 * @returns {String}
 *
 * @description
 * Check if every spring config prop is valid
 **/
export const springConfigPropIsValid = (obj) => {
    const isValid =
        checkType(Object, obj) &&
        Object.values(obj).every((prop) => {
            return checkType(Number, prop) && prop >= 0;
        });

    if (!isValid && obj !== undefined && obj !== null)
        springConfigPropWarning();

    return isValid ? obj : {};
};

/**
 *
 * @param {(Number|Function)} duration
 * @returns {Number}
 *
 * @description
 * Check if duration definition is valid
 **/
export const durationIsNumberOrFunctionIsValid = (duration) => {
    const durationIsFn = checkType(Function, duration);
    const durationResult = durationIsFn ? duration() : duration;
    const isValid = checkType(Number, durationResult);
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
    const isValid = checkType(Boolean, value);
    if (!isValid && value !== undefined && value !== null)
        booleanWarning(value, label);

    return isValid && value === true;
};

/**
 *
 * @param {Boolean} value
 * @param {String} label
 * @param {Boolean} defaultValue
 * @returns {Boolean}
 *
 * @description
 * Check if value is Boolan and reteurn Default
 **/
export const valueIsBooleanAndReturnDefault = (value, label, defaultValue) => {
    const isValid = checkType(Boolean, value);
    if (!isValid && value !== undefined && value !== null)
        booleanWarning(value, label);

    return isValid ? value : defaultValue;
};

/**
 *
 * @param {String} value
 * @returns {String}
 *
 * @description
 * Check if value is String and return defualt
 **/
export const valueIsStringAndReturnDefault = (value, label, defaultValue) => {
    const isValid = checkType(String, value);
    if (!isValid && value !== undefined && value !== null)
        stringWarning(value, label);

    return isValid ? value : defaultValue;
};

/**
 *
 * @param {Number} value
 * @returns {Number}
 *
 * @description
 * Check if value is Number and return defualt
 **/
export const valueIsNumberAndReturnDefault = (value, label, defaultValue) => {
    const isValid = checkType(Number, parseFloat(value));
    if (!isValid && value !== undefined && value !== null)
        naumberWarning(value, label);

    return isValid ? value : defaultValue;
};

/**
 *
 * @param {Function} value
 * @returns {Function}
 *
 * @description
 * Check if value is Function and return defualt
 **/
export const valueIsFunctionAndReturnDefault = (value, label, defaultValue) => {
    const isValid = checkType(Function, value);
    if (!isValid && value !== undefined && value !== null)
        functionWarning(value, label);

    return isValid ? value : defaultValue;
};

/**
 *
 * @param {Number} velocity
 * @returns {Number}
 *
 * @description
 * Check if velocity is valid
 **/
export const lerpVelocityIsValid = (value) => {
    const isValid = checkType(Number, value) && value > 0 && value <= 1;
    if (!isValid && value !== undefined && value !== null)
        lerpVelocityWarining();

    return isValid ? value : handleSetUp.get('lerp').velocity;
};

/**
 *
 * @param {Number} velocity
 * @returns {Number}
 *
 * @description
 * Check if precision is valid
 **/
export const lerpPrecisionIsValid = (value) => {
    const isValid = checkType(Number, value);
    if (!isValid && value !== undefined && value !== null)
        lerpPrecisionWarining();

    return isValid ? value : handleSetUp.get('lerp').precision;
};

/**
 *
 * @param {String} value
 * @param {String} label
 * @returns {Boolean}
 *
 * @description
 * Check if value is a string.
 **/
export const valueStringIsValid = (value, label) => {
    const isValid = checkType(String, value);
    if (!isValid && value !== undefined && value !== null)
        valueStringWarning(label);

    return isValid;
};

/**
 *
 * @param {Number} value
 * @returns {NUmber|null}
 *
 * @description
 * Check if Delay is a Number and return Number || null.
 **/
export const asyncTimelineDelayIsValid = (value) => {
    const isValid = checkType(Number, value);
    if (!isValid && value !== undefined && value !== null)
        asyncTimelineDelayWarning();

    return isValid ? value : null;
};

/**
 *
 * @param {Object} value
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
 * @param {Number} index
 * @param {String} label
 *
 * @description
 * Check if label is found
 **/
export const playLabelIsValid = (index, label) => {
    if (index === -1) playLabelWarining(label);
};

/**
 *
 * @param {Function} fn
 *
 * @description
 * Check if value is A function and return defualt
 **/
export const functionIsValidAndReturnDefault = (fn, defualt, label) => {
    const isValid = checkType(Function, fn);
    if (!isValid && fn !== undefined && fn !== null)
        functionIsValidAndReturnDefaultWarining(label, fn);

    return isValid ? fn : defualt;
};

/**
 *
 * @param {Function} fn
 *
 * @description
 * Check if value is A function
 **/
export const addAsyncFunctionIsValid = (fn) => {
    const isValid = checkType(Function, fn);
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
 * @param {Array} arr
 *
 * @description
 * Check if value is an Array
 **/
export const timelineSetTweenArrayIsValid = (arr) => {
    const isValid = checkType(Array, arr);
    if (!isValid && arr !== undefined && arr !== null)
        timelineSetTweenArrayWarining(arr);

    return isValid;
};

/**
 *
 * @param {String} label
 *
 * @description
 * Check if value is an string
 **/
export const timelineSetTweenLabelIsValid = (label) => {
    const isValid = checkType(String, label);
    if (!isValid && label !== undefined && label !== null)
        timelineSetTweenLabelWarining(label);

    return isValid;
};

/**
 *
 * @param {(String|Element)} element
 * @returns {Element}
 *
 * @description
 * Check if value is a valid Element and return element|window|element
 **/
export const domNodeIsValidAndReturnElOrWin = (
    element,
    returnWindow = false
) => {
    const isNode = checkType(Element, element);
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
 * @param {(String|Element)} element
 * @returns {Boolean}
 *
 * @description
 * Check if value is a valid Element
 **/
export const domNodeIsValidAndReturnNull = (element) => {
    const isNode = checkType(Element, element);
    const realEl = isNode ? element : document.querySelector(element);
    const isValid = realEl && realEl !== undefined && realEl !== null;
    return isValid ? realEl : null;
};

/**
 * Specific parallax
 */

/**
 *
 * @param {String} label
 * @returns {Boolean}
 *
 * @description
 * Check if value is a valid direction
 **/
export const parallaxDirectionIsValid = (direction) => {
    const choice = [
        parallaxConstant.DIRECTION_VERTICAL,
        parallaxConstant.DIRECTION_HORIZONTAL,
    ];

    const isValid = choice.includes(direction);
    if (!isValid && direction !== undefined && direction !== null)
        parallaxDirectionWarining(direction);

    return isValid ? direction : parallaxConstant.DIRECTION_VERTICAL;
};

/**
 *
 * @param {Object} obj
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
    const valueIsObject = checkType(Object, obj);
    //
    // position is a String and cotains the right value
    const positionIsValid =
        valueIsObject &&
        checkType(String, obj?.position) &&
        positionChoice.includes(obj.position);

    // Value is a function and return a number
    const valueIsValid =
        valueIsObject &&
        checkType(Function, obj.value) &&
        checkType(Number, obj.value());

    // Validate all
    const isValid = valueIsObject && positionIsValid && valueIsValid;
    if (!isValid) parallaxDynmicValueWarining(label);

    return isValid ? obj : null;
};

/**
 *
 * @param {Function} value
 * @returns {Function}
 *
 * @description
 * Check if dynamicRange is a functiom that return a Number
 **/
export const parallaxDynamicRangeIsValid = (fn) => {
    const isValid = checkType(Function, fn) && checkType(Number, fn());

    if (!isValid && fn !== undefined && fn !== null)
        parallaxDynmicRangeValueWarining();

    return isValid ? fn : null;
};

/**
 *
 * @param {Object} value
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
 * @param {( String|NUmber )} value
 * @returns {( String|NUmber )} ALign value
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
        choice.includes(value) || checkType(Number, parseFloat(value));

    if (!isValid && value !== undefined && value !== null)
        parallaxAlignWarining(value, choice);

    return isValid ? value : parallaxConstant.ALIGN_CENTER;
};

/**
 *
 * @param {String} value
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
 * @param {Number} value
 * @returns {Number}
 *
 * @description
 * Check if value is Number and return defualt
 **/
export const parallaxOpacityIsValid = (value, label, defaultValue) => {
    const isValid = checkType(Number, parseFloat(value));
    if (!isValid && value !== undefined && value !== null)
        parallaxOpacityWarning(value, label);

    return isValid ? value : defaultValue;
};

/**
 *
 * @param {String} value
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
 * @param {String} value
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
                checkType(Number, parseFloat(value)) &&
                isOnlyNumber &&
                value >= 0 &&
                value < 10;

            if (!isValid && value !== undefined && value !== null)
                parallaxRangeNumberWarning(value);

            return isValid
                ? 10 - value
                : 10 - handleSetUp.get('parallax').defaultRange;
        } else {
            const isValid = checkType(String, value);
            if (!isValid && value !== undefined && value !== null)
                parallaxRangeStringWarning(value);

            return isValid ? value : '0px';
        }
    };

    return parsedValue();
};

/**
 *
 * @param {String} value
 * @returns {String}
 *
 * @description
 * Check if breackpoint prop is valid
 **/
export const breakpointIsValid = (mq, label) => {
    const mqObj = handleSetUp.get('mq');
    const defaultMq = handleSetUp.get('defaultMq').value;
    const choice = Object.keys(mqObj);

    const isValid = checkType(String, mq) && choice.includes(mq);
    if (!isValid && mq !== undefined && mq !== null)
        breakpointWarning(mq, choice, label);

    return isValid ? mq : defaultMq;
};

/**
 *
 * @param {String} value
 * @returns {String}
 *
 * @description
 * Check if queryType prop is valid
 **/
export const breakpointTypeIsValid = (type, label) => {
    const defaultType = handleSetUp.get('defaultMq').type;
    const choice = [MQ_MAX, MQ_MIN];

    const isValid = checkType(String, type) && choice.includes(type);
    if (!isValid && type !== undefined && type !== null)
        breakpointWarning(type, choice, label);

    return isValid ? type : defaultType;
};

/**
 *
 * @param {String} value
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
    const isValid = checkType(String, value);
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
 * @param {String} value
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

/**
 *
 * @param {String} value
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
 * @param {Number} value
 * @returns {Number}
 *
 * @description
 * Check if lerpConfig is valid
 **/
export const parallaxLerpConfigIsValid = (value, type) => {
    const isValid =
        checkType(Number, parseFloat(value)) && value > 0 && value <= 1;
    if (!isValid && value !== undefined && value !== null)
        parallaxLerpConfigWarning();

    const defaultConfig =
        type === parallaxConstant.TYPE_PARALLAX
            ? handleSetUp.get('parallax').lerpConfig
            : handleSetUp.get('scrollTrigger').lerpConfig;

    return isValid ? parseFloat(value) : defaultConfig;
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
