// @ts-check

import { parallaxConstant } from './parallaxConstant.js';
import { handleSetUp } from '../../setup.js';
import { mobCore } from '../../../mobCore/index.js';

/**
 * @param {object} obj
 * @param {Element|undefined} obj.startMarker
 * @param {Element|undefined} obj.endMarker
 * @param {string} obj.label
 *
 * @returns {{lastStartMarker:(Element|undefined), lastEndMarkerEl:(Element|undefined)}}
 */
const getMarker = ({ startMarker, endMarker, label }) => {
    if (!startMarker && !endMarker) {
        // Replace illegal character with '-'
        // @ts-ignore
        const labelSanitized = label.replaceAll(/^[^a-z]+|[^\w.:-]+/gi, '-');

        const startMarkerEL = document.createElement('span');
        startMarkerEL.className += `p-marker p-marker--start  p-marker-${labelSanitized}`;
        startMarkerEL.innerHTML = `start ${labelSanitized}`;

        const endMarkerEL = document.createElement('span');
        endMarkerEL.className += `p-marker p-marker--end  p-marker-${labelSanitized}`;
        endMarkerEL.innerHTML = `end ${labelSanitized}`;

        document.body.append(startMarkerEL);
        document.body.append(endMarkerEL);

        const startMarkerGenerated = document.querySelector(
            `.p-marker--start.p-marker-${labelSanitized}`
        );

        const endMarkerElGenerated = document.querySelector(
            `.p-marker--end.p-marker-${labelSanitized}`
        );

        return {
            lastStartMarker: startMarkerGenerated ?? undefined,
            lastEndMarkerEl: endMarkerElGenerated ?? undefined,
        };
    }

    return {
        lastStartMarker: startMarker,
        lastEndMarkerEl: endMarker,
    };
};

/**
 * @param {object} obj
 * @param {HTMLElement|Window|null} obj.screen
 *
 * @returns {{top:number,right:number,bottom:number,left:number}}
 */
const getPosition = ({ screen }) => {
    if (screen === window) {
        return {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        };
    }

    // @ts-ignore
    const rect = screen.getBoundingClientRect();

    return {
        top: rect.top,
        right:
            document.documentElement.clientWidth -
            // @ts-ignore
            (rect.left + screen.offsetWidth),
        // @ts-ignore
        bottom: window.innerHeight - (rect.top + screen.offsetHeight),
        left: rect.left,
    };
};

/**
 * @param {object} obj
 * @param {number} obj.startPoint
 * @param {string} obj.direction
 * @param {boolean} obj.invertSide
 * @param {number} obj.top
 * @param {number} obj.bottom
 * @param {number} obj.left
 * @param {number} obj.right
 *
 * @returns {Object}
 */
const getStartStyle = ({
    startPoint,
    direction,
    invertSide,
    top,
    bottom,
    left,
    right,
}) => {
    if (direction === parallaxConstant.DIRECTION_VERTICAL) {
        return invertSide
            ? {
                  right: 0,
                  width: '100vw',
                  height: '3px',
                  top: `${startPoint + top}px`,
                  padding: '0 30px',
                  pointerEvents: 'none',
              }
            : {
                  right: 0,
                  width: '100vw',
                  height: '3px',
                  bottom: `${startPoint + bottom}px`,
                  padding: '0 30px',
                  pointerEvents: 'none',
              };
    }

    return invertSide
        ? {
              top: 0,
              height: '100vw',
              width: '3px',
              left: `${startPoint + left}px`,
              padding: '30px 0',
              pointerEvents: 'none',
          }
        : {
              top: 0,
              height: '100vw',
              width: '3px',
              right: `${startPoint + right}px`,
              padding: '30px 0',
              pointerEvents: 'none',
          };
};

/**
 * @param {object} obj
 * @param {number} obj.startPoint
 * @param {number} obj.endPoint
 * @param {string} obj.direction
 * @param {boolean} obj.invertSide
 * @param {number} obj.top
 * @param {number} obj.bottom
 * @param {number} obj.left
 * @param {number} obj.right
 *
 * @returns {Object}
 */
const getEndStyle = ({
    startPoint,
    endPoint,
    direction,
    invertSide,
    top,
    bottom,
    left,
    right,
}) => {
    if (direction === parallaxConstant.DIRECTION_VERTICAL) {
        return invertSide
            ? {
                  right: 0,
                  width: '100vw',
                  height: '3px',
                  top: `${startPoint + endPoint + top}px`,
                  padding: '0 30px',
                  pointerEvents: 'none',
              }
            : {
                  right: 0,
                  width: '100vw',
                  height: '3px',
                  bottom: `${startPoint + endPoint + bottom}px`,
                  padding: '0 30px',
                  pointerEvents: 'none',
              };
    }

    return invertSide
        ? {
              top: 0,
              height: '100vw',
              width: '3px',
              left: `${startPoint + endPoint + left}px`,
              padding: '30px 0',
              pointerEvents: 'none',
          }
        : {
              top: 0,
              height: '100vw',
              width: '3px',
              right: `${startPoint + endPoint + right}px`,
              padding: '30px 0',
              pointerEvents: 'none',
          };
};
/**
 * @param {object} obj
 * @param {Element|undefined} obj.startMarker
 * @param {Element|undefined} obj.endMarker
 * @param {number} obj.startPoint
 * @param {number} obj.endPoint
 * @param {HTMLElement|Window|null} obj.screen
 * @param {string} obj.direction
 * @param {boolean} obj.invertSide
 * @param {string} obj.label
 *
 * @returns {{startMarker:(Element|undefined), endMarker:(Element|undefined)}}
 */
export const parallaxMarker = ({
    startMarker,
    endMarker,
    startPoint,
    endPoint,
    screen,
    direction,
    invertSide,
    label,
}) => {
    // Creat emarker if not exist
    const { lastStartMarker, lastEndMarkerEl } = getMarker({
        startMarker,
        endMarker,
        label,
    });

    const { top, right, bottom, left } = getPosition({ screen });

    const startStyle = getStartStyle({
        startPoint,
        direction,
        invertSide,
        top,
        bottom,
        left,
        right,
    });

    const endStyle = getEndStyle({
        startPoint,
        endPoint,
        direction,
        invertSide,
        top,
        bottom,
        left,
        right,
    });

    const style = {
        position: 'fixed',
        zIndex: '99999',
        background:
            handleSetUp.get('scrollTrigger')?.markerColor?.startEnd ||
            '#ff0000',
        fontSize: '14px',
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
    };

    mobCore.useFrame(() => {
        // @ts-ignore
        Object.assign(lastStartMarker?.style, { ...style, ...startStyle });
        // @ts-ignore
        Object.assign(lastEndMarkerEl?.style, { ...style, ...endStyle });
    });

    return {
        startMarker: lastStartMarker,
        endMarker: lastEndMarkerEl,
    };
};
