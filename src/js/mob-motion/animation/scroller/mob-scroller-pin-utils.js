// @ts-check

import { handleSetUp } from '../../setup';
import { MobScrollerConstant } from './mob-scroller-constant';

/**
 * @param {Object} param
 * @param {string} [param.marker]
 * @param {string} param.direction
 * @param {boolean | undefined} param.invertSide
 * @returns {Object}
 */
export const getMarkerWrapperStyle = ({ marker, direction, invertSide }) => {
    if (!marker) return {};

    const borderColor =
        handleSetUp.get('scrollTrigger')?.markerColor?.item || '#14df3b';
    const borderStyle = `3px ${borderColor} solid`;

    if (direction === MobScrollerConstant.DIRECTION_VERTICAL) {
        return invertSide
            ? { borderBottom: borderStyle }
            : { borderTop: borderStyle };
    } else {
        return invertSide
            ? { borderRight: borderStyle }
            : { borderLeft: borderStyle };
    }
};
