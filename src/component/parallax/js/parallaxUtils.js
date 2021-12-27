export const parallaxUtils = {
    isInViewport({ offset, height, gap, wScrollTop, wHeight }) {
        return (
            offset + height > wScrollTop - gap &&
            offset < wScrollTop + (wHeight + gap)
        );
    },

    /**
     * getStartEndValue - Filter input value with number in value and additonal value
     *
     * @param  {array}  values spitted inut value es: 100px +h => ['100px','+h']
     * @param  {Object} additionalConstant constant : { plus_height: '+h', plus_height_half: '+h/' ...
     * @return {Object} return object with values or default { numberVal: '100px', additionalVal: '+h' }
     */
    getStartEndValue(values, additionalConstant) {
        // Get number value if exist, check values array to find a item wih almost 1 number ad get it
        const getNumberVal = values.find((item) => {
            return [...item].some((c) => !Number.isNaN(parseFloat(c)));
        });

        // Get aditonal value +h +h/ -h -h/ etc... if exist
        const additionaChoice = [
            additionalConstant.plus_height.toLowerCase(),
            additionalConstant.plus_height_half.toLowerCase(),
            additionalConstant.plus_width.toLowerCase(),
            additionalConstant.plus_width_half.toLowerCase(),
            additionalConstant.minus_height.toLowerCase(),
            additionalConstant.minus_height_half.toLowerCase(),
            additionalConstant.minus_width.toLowerCase(),
            additionalConstant.minus_width_half.toLowerCase(),
        ];
        const getAdditionalVal = values.find((item) => {
            return additionaChoice.includes(item);
        });

        return {
            numberVal: getNumberVal ? getNumberVal : 0,
            additionalVal: getAdditionalVal ? getAdditionalVal : '',
        };
    },

    // Get start point withuot addition value
    getStartPoint(screenUnit, data, additionalConstant) {
        // SPLIT INTO CHUNK DATA
        const str = String(data);
        const values = str.split(' ');

        const { numberVal, additionalVal } = parallaxUtils.getStartEndValue(
            values,
            additionalConstant
        );

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
            };
        } else {
            return {
                value: screenUnit * startValInNumber * isNegative,
                additionalVal,
            };
        }
    },

    // Get end point withuot addition value
    getEndPoint(
        screenUnit,
        data,
        additionalConstant,
        startPoint,
        scrollerHeight
    ) {
        // SPLIT INTO CHUNK DATA
        const str = String(data);
        const values = str.split(' ');
        const { numberVal, additionalVal } = parallaxUtils.getStartEndValue(
            values,
            additionalConstant
        );

        // CHECK IF NUMBER IS NEGATIVE
        const firstChar = String(numberVal).charAt(0);
        const isNegative = firstChar === '-' ? -1 : 1;

        // GET NUMBER WITHOT PX OR VW etc..
        const number = parseFloat(String(numberVal).replace(/^\D+/g, ''));
        const endValInNumber = number ? number : 0;

        // GET FINAL VLAUE
        if (str.includes('px')) {
            return {
                value:
                    scrollerHeight - endValInNumber - startPoint * isNegative,
                additionalVal,
            };
        } else {
            return {
                value:
                    screenUnit * (100 - endValInNumber) -
                    startPoint * isNegative,
                additionalVal,
            };
        }
    },

    processFixedLimit(value, stringValue, height, width, additionalConstant) {
        const str = String(stringValue);

        // plus
        if (str.includes(additionalConstant.plus_height_half)) {
            return value + height / 2;
        }

        if (str.includes(additionalConstant.plus_height)) {
            return value + height;
        }

        if (str.includes(additionalConstant.plus_width_half)) {
            return value + width / 2;
        }

        if (str.includes(additionalConstant.plus_width)) {
            return value + width;
        }

        // minus
        if (str.includes(additionalConstant.minus_height_half)) {
            return value - height / 2;
        }

        if (str.includes(additionalConstant.minus_height)) {
            return value - height;
        }

        if (str.includes(additionalConstant.minus_width_half)) {
            return value - width / 2;
        }

        if (str.includes(additionalConstant.minus_width)) {
            return value - width;
        }

        return value;
    },

    getValueOnSwitch({ switchPropierties, isReverse, value, prop }) {
        switch (switchPropierties) {
            case prop.inStop:
                return (!isReverse && value > 0) || (isReverse && value < 0)
                    ? 0
                    : value;

            case prop.inBack:
                return (!isReverse && value > 0) || (isReverse && value < 0)
                    ? -value
                    : value;

            case prop.outStop:
                return (!isReverse && value < 0) || (isReverse && value > 0)
                    ? 0
                    : value;

            case prop.outBack:
                return (!isReverse && value < 0) || (isReverse && value > 0)
                    ? -value
                    : value;

            default:
                return value;
        }
    },

    getRetReverseValue(propierties, val, opacity) {
        switch (propierties) {
            case opacity:
                return 1 - val;

            default:
                return -val;
        }
    },

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    },
};
