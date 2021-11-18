import { eventManager } from '../../../js/base/eventManager.js';

export const parallaxUtils = {
    normalizeVelocity(value) {
        if (value < 1) {
            return 1;
        } else if (value >= 10) {
            return 9.9;
        } else {
            return (10 - value) * 10;
        }
    },

    normalizeRange(value) {
        if (value < 0) {
            return 9.9;
        } else if (value >= 10) {
            return 0.1;
        } else {
            return 10 - value;
        }
    },

    isInViewport({ offset, height, gap, wScrollTop, wHeight }) {
        return (
            offset + height > wScrollTop - gap &&
            offset < wScrollTop + (wHeight + gap)
        );
    },

    getFixedElementAlignNatural({
        scrollTop,
        windowsHeight,
        startPoint,
        offset,
        height,
    }) {
        if (scrollTop + windowsHeight - startPoint < offset) {
            return 'OVER';
        } else if (scrollTop + windowsHeight - startPoint > offset + height) {
            return 'DOWN';
        } else {
            return 'INSIDE';
        }
    },

    getFixedElementAlignInvert({
        scrollTop,
        windowsHeight,
        startPoint,
        offset,
        height,
    }) {
        if (scrollTop + startPoint < offset) {
            return 'OVER';
        } else if (scrollTop + startPoint > offset + height) {
            return 'DOWN';
        } else {
            return 'INSIDE';
        }
    },

    getFixedValueByAlign(elementAlign) {
        return ({
            fixedInward,
            maxVal,
            fixedStartOff,
            applyStyle,
            fixedEndOff,
            partialVal,
        }) => {
            switch (elementAlign) {
                case 'OVER':
                    return {
                        value: fixedInward ? maxVal : 0,
                        applyStyleComputed: fixedStartOff ? false : applyStyle,
                    };
                case 'DOWN':
                    return {
                        value: fixedInward ? 0 : -maxVal,
                        applyStyleComputed: fixedEndOff ? false : applyStyle,
                    };
                case 'INSIDE':
                    return {
                        value: fixedInward ? partialVal : partialVal - maxVal,
                        applyStyleComputed: applyStyle,
                    };
            }
        };
    },

    getValueOnSwitchNoPacity({ switchPropierties, isReverse, value }) {
        switch (switchPropierties) {
            case 'in-stop':
                return (!isReverse && value > 0) || (isReverse && value < 0)
                    ? 0
                    : value;

            case 'in-back':
                return (!isReverse && value > 0) || (isReverse && value < 0)
                    ? -value
                    : value;

            case 'out-stop':
                return (!isReverse && value < 0) || (isReverse && value > 0)
                    ? 0
                    : value;

            case 'out-back':
                return (!isReverse && value < 0) || (isReverse && value > 0)
                    ? -value
                    : value;

            default:
                return value;
        }
    },

    getOpacityElementAlign({
        isReverse,
        elementOffset,
        limitTop,
        limitBottom,
    }) {
        if (elementOffset >= limitTop && elementOffset <= limitBottom) {
            return 'INSIDE';
        } else if (elementOffset < limitTop && !isReverse) {
            return 'OVER';
        } else if (elementOffset < limitTop && isReverse) {
            return 'OVER-REVERSE';
        }
    },

    getOpacityValueByAlign(elementAlign) {
        return (val) => {
            switch (elementAlign) {
                case 'INSIDE':
                    const valStep1 = val > 1.999 ? 1.999 : val;
                    const valStep2 = valStep1 < 0 ? -valStep1 : valStep1;
                    const valStep3 =
                        valStep2 > 1 ? 1 - (valStep2 % 1) : valStep2;
                    return valStep3;

                case 'OVER':
                    return 0;

                case 'OVER-REVERSE':
                    return -val;

                default:
                    return val;
            }
        };
    },

    getRetReverseValue(propierties, val) {
        switch (propierties) {
            case 'opacity':
                return 1 - val;

            default:
                return -val;
        }
    },
};
