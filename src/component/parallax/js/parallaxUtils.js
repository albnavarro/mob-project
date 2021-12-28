import { parallaxConstant } from './parallaxConstant.js';

export const parallaxUtils = {
    isInViewport({ offset, height, gap, wScrollTop, wHeight }) {
        return (
            offset + height > wScrollTop - gap &&
            offset < wScrollTop + (wHeight + gap)
        );
    },

    getRangeUnitMisure(string) {
        if (string.includes(parallaxConstant.PX)) return parallaxConstant.PX;
        else if (string.includes(parallaxConstant.VH))
            return parallaxConstant.VH;
        else if (string.includes(parallaxConstant.VW))
            return parallaxConstant.VW;
        else if (string.includes(parallaxConstant.Wpercent))
            return parallaxConstant.Wpercent;
        else if (string.includes(parallaxConstant.Hpercent))
            return parallaxConstant.Hpercent;
        else return '';
    },

    /**
     * getStartEndValue - Filter input value with number in value and additonal value
     *
     * @param  {array}  values spitted inut value es: 100px +h => ['100px','+height', 'top']
     * @return {Object} return object with values or default
     *
     * @example
     *  { numberVal: '100px', additionalVal: '+height', position:"top" }
     *  default:  { numberVal: '0', additionalVal: '', position:"bottom" }
     */
    getStartEndValue(values) {
        // Get number value if exist, check values array to find a item wih almost 1 number ad get it
        const getNumberVal = values.find((item) => {
            return [...item].some((c) => !Number.isNaN(parseFloat(c)));
        });

        // Get aditonal value +height +halfHeight -height -etc... if exist
        const additionaChoice = [
            parallaxConstant.PLUS_HEIGHT,
            parallaxConstant.PLUS_HEIGHT_HALF,
            parallaxConstant.PLUS_WIDTH,
            parallaxConstant.PLUS_WIDTH_HALF,
            parallaxConstant.MINUS_HEIGHT,
            parallaxConstant.MINUS_HEIGHT_HALF,
            parallaxConstant.MINUS_WIDTH,
            parallaxConstant.MINUS_WIDTH_HALF,
        ];
        const getAdditionalVal = values.find((item) => {
            return additionaChoice.includes(item);
        });

        // Get position top || bottom || left || right
        const positionMap = [
            parallaxConstant.POSITION_BOTTOM,
            parallaxConstant.POSITION_TOP,
            parallaxConstant.POSITION_LEFT,
            parallaxConstant.POSITION_RIGHT,
        ];
        const getPosition = values.find((item) => {
            return positionMap.includes(item);
        });

        return {
            numberVal: getNumberVal ? getNumberVal : 0,
            additionalVal: getAdditionalVal ? getAdditionalVal : '',
            position: getPosition
                ? getPosition
                : parallaxConstant.POSITION_BOTTOM,
        };
    },

    // Get start point withuot addition value
    getStartPoint(screenUnit, data) {
        // SPLIT INTO CHUNK DATA
        const str = String(data);
        const values = str.split(' ');

        const { numberVal, additionalVal, position } =
            parallaxUtils.getStartEndValue(values);

        // CHECK IF NUMBER IS NEGATIVE
        const firstChar = String(numberVal).charAt(0);
        const isNegative = firstChar === '-' ? -1 : 1;

        // GET NUMBER WITHOT PX OR VW etc..
        const number = parseFloat(String(numberVal).replace(/^\D+/g, ''));
        const startValInNumber = number ? number : 0;

        // GET FINAL VLAUE
        if (str.includes('px')) {
            return {
                value: startValInNumber * isNegative,
                additionalVal,
                position,
            };
        } else {
            return {
                value: screenUnit * startValInNumber * isNegative,
                additionalVal,
                position,
            };
        }
    },

    // Get end point withuot addition value
    getEndPoint(screenUnit, data, startPoint, scrollerHeight, invertSide) {
        // SPLIT INTO CHUNK DATA
        const str = String(data);
        const values = str.split(' ');
        const { numberVal, additionalVal, position } =
            parallaxUtils.getStartEndValue(values);

        // CHECK IF NUMBER IS NEGATIVE
        const firstChar = String(numberVal).charAt(0);
        const isNegative = firstChar === '-' ? -1 : 1;

        // GET NUMBER WITHOT PX OR VW etc..
        const number = parseFloat(String(numberVal).replace(/^\D+/g, ''));
        const endValInNumber = number ? number : 0;

        // GET FINAL VLAUE
        if (str.includes('px')) {
            const valueFromTop = endValInNumber - startPoint * isNegative;
            const valueFromBottom =
                scrollerHeight - endValInNumber - startPoint * isNegative;

            return {
                value: invertSide
                    ? (() => {
                          return position === parallaxConstant.POSITION_TOP ||
                              position === parallaxConstant.POSITION_LEFT
                              ? valueFromTop
                              : valueFromBottom;
                      })()
                    : (() => {
                          return position === parallaxConstant.POSITION_TOP ||
                              position === parallaxConstant.POSITION_LEFT
                              ? valueFromBottom
                              : valueFromTop;
                      })(),
                additionalVal,
                position,
            };
        } else {
            return {
                value: invertSide
                    ? (() => {
                          return position === parallaxConstant.POSITION_TOP ||
                              position === parallaxConstant.POSITION_LEFT
                              ? scrollerHeight -
                                    screenUnit * (100 - endValInNumber) -
                                    startPoint * isNegative
                              : screenUnit * (100 - endValInNumber) -
                                    startPoint * isNegative;
                      })()
                    : (() => {
                          return position === parallaxConstant.POSITION_TOP ||
                              position === parallaxConstant.POSITION_LEFT
                              ? scrollerHeight -
                                    screenUnit * endValInNumber -
                                    startPoint * isNegative
                              : screenUnit * endValInNumber -
                                    startPoint * isNegative;
                      })(),
                additionalVal,
                position,
            };
        }
    },

    processFixedLimit(value, stringValue, height, width) {
        const str = String(stringValue);

        // plus
        if (str.includes(parallaxConstant.PLUS_HEIGHT_HALF)) {
            return value + height / 2;
        }

        if (str.includes(parallaxConstant.PLUS_HEIGHT)) {
            return value + height;
        }

        if (str.includes(parallaxConstant.PLUS_WIDTH_HALF)) {
            return value + width / 2;
        }

        if (str.includes(parallaxConstant.PLUS_WIDTH)) {
            return value + width;
        }

        // minus
        if (str.includes(parallaxConstant.MINUS_HEIGHT_HALF)) {
            return value - height / 2;
        }

        if (str.includes(parallaxConstant.MINUS_HEIGHT)) {
            return value - height;
        }

        if (str.includes(parallaxConstant.MINUS_WIDTH_HALF)) {
            return value - width / 2;
        }

        if (str.includes(parallaxConstant.MINUS_WIDTH)) {
            return value - width;
        }

        return value;
    },

    getValueOnSwitch({ switchPropierties, isReverse, value }) {
        switch (switchPropierties) {
            case parallaxConstant.IN_STOP:
                return (!isReverse && value > 0) || (isReverse && value < 0)
                    ? 0
                    : value;

            case parallaxConstant.IN_BACK:
                return (!isReverse && value > 0) || (isReverse && value < 0)
                    ? -value
                    : value;

            case parallaxConstant.OUT_STOP:
                return (!isReverse && value < 0) || (isReverse && value > 0)
                    ? 0
                    : value;

            case parallaxConstant.OUT_BACK:
                return (!isReverse && value < 0) || (isReverse && value > 0)
                    ? -value
                    : value;

            default:
                return value;
        }
    },

    getRetReverseValue(propierties, val, opacity) {
        switch (propierties) {
            case parallaxConstant.PROP_OPACITY:
                return 1 - val;

            default:
                return -val;
        }
    },

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    },
};
