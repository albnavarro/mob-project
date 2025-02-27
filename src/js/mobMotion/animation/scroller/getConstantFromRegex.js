// @ts-check

import { HandleScrollerConstant } from './HandleScrollerConstant';
import {
    exactMatchInsensitive,
    exactMatchInsesitiveNumberProp,
} from '../utils/regexValidation.js';

/**
 * @description
 * Support function for parallaxPropiertiesIsValid
 * Get exact prop name from constant ( resolve sensitive typing )
 *
 * @param {string|undefined} value
 * @returns string
 */
export const getPropiertiesValueFromConstant = (value) => {
    /**
     * If null prevent regex error
     */
    if (!value) return value;

    if (exactMatchInsensitive(value, HandleScrollerConstant.PROP_VERTICAL))
        return HandleScrollerConstant.PROP_VERTICAL;

    if (exactMatchInsensitive(value, HandleScrollerConstant.PROP_HORIZONTAL))
        return HandleScrollerConstant.PROP_HORIZONTAL;

    if (exactMatchInsensitive(value, HandleScrollerConstant.PROP_ROTATE))
        return HandleScrollerConstant.PROP_ROTATE;

    if (exactMatchInsensitive(value, HandleScrollerConstant.PROP_ROTATEY))
        return HandleScrollerConstant.PROP_ROTATEY;

    if (exactMatchInsensitive(value, HandleScrollerConstant.PROP_ROTATEX))
        return HandleScrollerConstant.PROP_ROTATEX;

    if (exactMatchInsensitive(value, HandleScrollerConstant.PROP_OPACITY))
        return HandleScrollerConstant.PROP_OPACITY;

    if (exactMatchInsensitive(value, HandleScrollerConstant.PROP_SCALE))
        return HandleScrollerConstant.PROP_SCALE;

    if (exactMatchInsensitive(value, HandleScrollerConstant.PROP_SCALE_X))
        return HandleScrollerConstant.PROP_SCALE_X;

    if (exactMatchInsensitive(value, HandleScrollerConstant.PROP_SCALE_Y))
        return HandleScrollerConstant.PROP_SCALE_Y;

    if (exactMatchInsensitive(value, HandleScrollerConstant.PROP_TWEEN))
        return HandleScrollerConstant.PROP_TWEEN;

    return value;
};

/**
 * @description
 * Return unit misure for parallax form lower/upper mix case typing
 *
 * @param {string|undefined} pattern
 * @returns {string}
 */
export const getStartEndUnitMisure = (pattern) => {
    if (pattern) {
        if (exactMatchInsesitiveNumberProp(pattern, HandleScrollerConstant.PX))
            return HandleScrollerConstant.PX;

        if (exactMatchInsesitiveNumberProp(pattern, HandleScrollerConstant.VH))
            return HandleScrollerConstant.VH;

        if (exactMatchInsesitiveNumberProp(pattern, HandleScrollerConstant.VW))
            return HandleScrollerConstant.VW;
    }

    return '';
};

/**
 * @description
 * Return position for parallax form lower/upper mix case typing
 *
 * @param {string} position
 * @returns string
 */
export const getScrollerPositionFromContanst = (position) => {
    if (exactMatchInsensitive(position, HandleScrollerConstant.POSITION_TOP))
        return HandleScrollerConstant.POSITION_TOP;

    if (exactMatchInsensitive(position, HandleScrollerConstant.POSITION_BOTTOM))
        return HandleScrollerConstant.POSITION_BOTTOM;

    if (exactMatchInsensitive(position, HandleScrollerConstant.POSITION_LEFT))
        return HandleScrollerConstant.POSITION_LEFT;

    if (exactMatchInsensitive(position, HandleScrollerConstant.POSITION_RIGHT))
        return HandleScrollerConstant.POSITION_RIGHT;

    return '';
};

/**
 * @description
 * Return range unit misure for parallax form lower/upper mix case typing
 *
 * @param {string} string
 * @returns string
 */
export const getRangeUnitMisure = (string) => {
    if (exactMatchInsesitiveNumberProp(string, HandleScrollerConstant.PX))
        return HandleScrollerConstant.PX;
    if (exactMatchInsesitiveNumberProp(string, HandleScrollerConstant.VH))
        return HandleScrollerConstant.VH;
    if (exactMatchInsesitiveNumberProp(string, HandleScrollerConstant.VW))
        return HandleScrollerConstant.VW;
    if (exactMatchInsesitiveNumberProp(string, HandleScrollerConstant.WPERCENT))
        return HandleScrollerConstant.WPERCENT;
    if (exactMatchInsesitiveNumberProp(string, HandleScrollerConstant.HPERCENT))
        return HandleScrollerConstant.HPERCENT;
    if (exactMatchInsesitiveNumberProp(string, HandleScrollerConstant.DEGREE))
        return HandleScrollerConstant.DEGREE;

    return HandleScrollerConstant.PX;
};
