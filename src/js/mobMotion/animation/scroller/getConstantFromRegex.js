// @ts-check

import { MobScrollerConstant } from './MobScrollerConstant';
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

    if (exactMatchInsensitive(value, MobScrollerConstant.PROP_VERTICAL))
        return MobScrollerConstant.PROP_VERTICAL;

    if (exactMatchInsensitive(value, MobScrollerConstant.PROP_HORIZONTAL))
        return MobScrollerConstant.PROP_HORIZONTAL;

    if (exactMatchInsensitive(value, MobScrollerConstant.PROP_ROTATE))
        return MobScrollerConstant.PROP_ROTATE;

    if (exactMatchInsensitive(value, MobScrollerConstant.PROP_ROTATEY))
        return MobScrollerConstant.PROP_ROTATEY;

    if (exactMatchInsensitive(value, MobScrollerConstant.PROP_ROTATEX))
        return MobScrollerConstant.PROP_ROTATEX;

    if (exactMatchInsensitive(value, MobScrollerConstant.PROP_OPACITY))
        return MobScrollerConstant.PROP_OPACITY;

    if (exactMatchInsensitive(value, MobScrollerConstant.PROP_SCALE))
        return MobScrollerConstant.PROP_SCALE;

    if (exactMatchInsensitive(value, MobScrollerConstant.PROP_SCALE_X))
        return MobScrollerConstant.PROP_SCALE_X;

    if (exactMatchInsensitive(value, MobScrollerConstant.PROP_SCALE_Y))
        return MobScrollerConstant.PROP_SCALE_Y;

    if (exactMatchInsensitive(value, MobScrollerConstant.PROP_TWEEN))
        return MobScrollerConstant.PROP_TWEEN;

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
        if (exactMatchInsesitiveNumberProp(pattern, MobScrollerConstant.PX))
            return MobScrollerConstant.PX;

        if (exactMatchInsesitiveNumberProp(pattern, MobScrollerConstant.VH))
            return MobScrollerConstant.VH;

        if (exactMatchInsesitiveNumberProp(pattern, MobScrollerConstant.VW))
            return MobScrollerConstant.VW;
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
    if (exactMatchInsensitive(position, MobScrollerConstant.POSITION_TOP))
        return MobScrollerConstant.POSITION_TOP;

    if (exactMatchInsensitive(position, MobScrollerConstant.POSITION_BOTTOM))
        return MobScrollerConstant.POSITION_BOTTOM;

    if (exactMatchInsensitive(position, MobScrollerConstant.POSITION_LEFT))
        return MobScrollerConstant.POSITION_LEFT;

    if (exactMatchInsensitive(position, MobScrollerConstant.POSITION_RIGHT))
        return MobScrollerConstant.POSITION_RIGHT;

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
    if (exactMatchInsesitiveNumberProp(string, MobScrollerConstant.PX))
        return MobScrollerConstant.PX;
    if (exactMatchInsesitiveNumberProp(string, MobScrollerConstant.VH))
        return MobScrollerConstant.VH;
    if (exactMatchInsesitiveNumberProp(string, MobScrollerConstant.VW))
        return MobScrollerConstant.VW;
    if (exactMatchInsesitiveNumberProp(string, MobScrollerConstant.WPERCENT))
        return MobScrollerConstant.WPERCENT;
    if (exactMatchInsesitiveNumberProp(string, MobScrollerConstant.HPERCENT))
        return MobScrollerConstant.HPERCENT;
    if (exactMatchInsesitiveNumberProp(string, MobScrollerConstant.DEGREE))
        return MobScrollerConstant.DEGREE;

    return MobScrollerConstant.PX;
};
