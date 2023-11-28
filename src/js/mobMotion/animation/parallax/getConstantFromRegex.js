// @ts-check

import { parallaxConstant } from '../parallax/parallaxConstant';
import {
    exactMatchInsensitive,
    exactMatchInsesitiveNumberProp,
} from '../utils/regexValidation.js';

/**
 * @description
 * Support function for parallaxPropiertiesIsValid
 * Get exact prop name from constant ( resolve sensitive typing )
 *
 * @param {string} value
 * @returns string
 */
export const getPropiertiesValueFromConstant = (value) => {
    /**
     * If null provent regex error
     */
    if (!value) return value;

    if (exactMatchInsensitive(value, parallaxConstant.PROP_VERTICAL))
        return parallaxConstant.PROP_VERTICAL;

    if (exactMatchInsensitive(value, parallaxConstant.PROP_HORIZONTAL))
        return parallaxConstant.PROP_HORIZONTAL;

    if (exactMatchInsensitive(value, parallaxConstant.PROP_ROTATE))
        return parallaxConstant.PROP_ROTATE;

    if (exactMatchInsensitive(value, parallaxConstant.PROP_ROTATEY))
        return parallaxConstant.PROP_ROTATEY;

    if (exactMatchInsensitive(value, parallaxConstant.PROP_ROTATEX))
        return parallaxConstant.PROP_ROTATEX;

    if (exactMatchInsensitive(value, parallaxConstant.PROP_OPACITY))
        return parallaxConstant.PROP_OPACITY;

    if (exactMatchInsensitive(value, parallaxConstant.PROP_SCALE))
        return parallaxConstant.PROP_SCALE;

    if (exactMatchInsensitive(value, parallaxConstant.PROP_TWEEN))
        return parallaxConstant.PROP_TWEEN;

    return value;
};

/**
 * @description
 * Return unit misure for parallax form lower/upper mix case typing
 *
 * @param {string} pattern
 * @returns string
 */
export const getStartEndUnitMisure = (pattern) => {
    if (pattern) {
        if (exactMatchInsesitiveNumberProp(pattern, parallaxConstant.PX))
            return parallaxConstant.PX;

        if (exactMatchInsesitiveNumberProp(pattern, parallaxConstant.VH))
            return parallaxConstant.VH;

        if (exactMatchInsesitiveNumberProp(pattern, parallaxConstant.VW))
            return parallaxConstant.VW;
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
export const getParallaxPositionFromContanst = (position) => {
    if (exactMatchInsensitive(position, parallaxConstant.POSITION_TOP))
        return parallaxConstant.POSITION_TOP;

    if (exactMatchInsensitive(position, parallaxConstant.POSITION_BOTTOM))
        return parallaxConstant.POSITION_BOTTOM;

    if (exactMatchInsensitive(position, parallaxConstant.POSITION_LEFT))
        return parallaxConstant.POSITION_LEFT;

    if (exactMatchInsensitive(position, parallaxConstant.POSITION_RIGHT))
        return parallaxConstant.POSITION_RIGHT;

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
    if (exactMatchInsesitiveNumberProp(string, parallaxConstant.PX))
        return parallaxConstant.PX;
    if (exactMatchInsesitiveNumberProp(string, parallaxConstant.VH))
        return parallaxConstant.VH;
    if (exactMatchInsesitiveNumberProp(string, parallaxConstant.VW))
        return parallaxConstant.VW;
    if (exactMatchInsesitiveNumberProp(string, parallaxConstant.WPERCENT))
        return parallaxConstant.WPERCENT;
    if (exactMatchInsesitiveNumberProp(string, parallaxConstant.HPERCENT))
        return parallaxConstant.HPERCENT;
    if (exactMatchInsesitiveNumberProp(string, parallaxConstant.DEGREE))
        return parallaxConstant.DEGREE;

    return parallaxConstant.PX;
};
