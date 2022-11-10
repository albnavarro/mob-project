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
import { getTweenFn, tweenConfig } from '../tween/tweenConfig';
import {
    addAsyncFunctionWarining,
    addFunctionWarining,
    asyncTimelineDelayWarning,
    asyncTimelineTweenWaring,
    booleanWarning,
    createStaggerItemsWarning,
    createStaggerTypeWarning,
    durationNumberOrFunctionWarining,
    durationWarining,
    initialDataPropWarining,
    initialDataValueWarining,
    lerpPrecisionWarining,
    lerpVelocityWarining,
    parallaxDirectionWarining,
    parallaxDynmicValueWarining,
    parallaxTweenWarning,
    playLabelWarining,
    relativeWarining,
    repeatWarining,
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
import { parallaxConstant } from '../parallax/parallaxConstant.js';

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
 * Check if value is A function
 **/
export const addFunctionIsValid = (fn) => {
    const isValid = checkType(Function, fn);
    if (!isValid && fn !== undefined && fn !== null) addFunctionWarining(fn);

    return isValid ? fn : () => {};
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
