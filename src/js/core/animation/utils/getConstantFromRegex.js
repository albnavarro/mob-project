import { parallaxConstant } from '../parallax/parallaxConstant';
import {
    exactMatchInsensitive,
    exactMatchInsesitiveNumberProp,
} from './regexValidation';

/**
 * Support function for parallaxPropiertiesIsValid
 * Get exact prop name from constant ( resolve sensitive typing )
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

export const getStartEndUnitMisure = (pattern) => {
    if (pattern) {
        if (exactMatchInsesitiveNumberProp(pattern, parallaxConstant.PX))
            return parallaxConstant.PX;

        if (exactMatchInsesitiveNumberProp(pattern, parallaxConstant.VH))
            return parallaxConstant.VH;

        if (exactMatchInsesitiveNumberProp(pattern, parallaxConstant.VW))
            return parallaxConstant.VW;
    }
};

export const getParallaxPositionFromContanst = (position) => {
    if (exactMatchInsensitive(position, parallaxConstant.POSITION_TOP))
        return parallaxConstant.POSITION_TOP;

    if (exactMatchInsensitive(position, parallaxConstant.POSITION_BOTTOM))
        return parallaxConstant.POSITION_BOTTOM;

    if (exactMatchInsensitive(position, parallaxConstant.POSITION_LEFT))
        return parallaxConstant.POSITION_LEFT;

    if (exactMatchInsensitive(position, parallaxConstant.POSITION_RIGHT))
        return parallaxConstant.POSITION_RIGHT;
};

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
