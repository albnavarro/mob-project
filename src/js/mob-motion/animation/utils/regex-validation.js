/**
 * Replaces all special regex characters with their escaped versions, making the string safe for use in regular
 * expressions
 *
 * @example
 *     escapeRegex("Hello [world]? $100") // "Hello \[world\]\? \$100"
 *
 *     Escaped characters: spaces, #$()*+,.?[]^{|}-
 *     Each special character is preceded by a backslash (\)
 *     to disable its special meaning in regex
 *
 * @param {string} text - The string to protect/escape
 * @returns {string} The string with special characters escaped
 */
const escapeRegExp = (text) => {
    // @ts-ignore
    return text
        ? text.replaceAll(/[\s#$()*+,.?[\\\]^{|}-]/g, String.raw`\$&`)
        : '';
};

/**
 * Checks if a string represents a valid number (integer or decimal with optional sign)
 *
 * @example
 *     isValidNumber("123")     // true - integer number
 *     isValidNumber("-45.67")  // true - decimal number with sign
 *     isValidNumber("+8.9")    // true - decimal number with positive sign
 *     isValidNumber("12.")     // false - missing decimal part
 *     isValidNumber(".34")     // false - missing integer part
 *     isValidNumber("1a2")     // false - non-numeric characters
 *
 *     Accepted patterns:
 *     - Optional sign: + or -
 *     - Integer part: one or more digits
 *     - Optional decimal part: . followed by one or more digits
 *
 * @param {string} pattern - The string to validate
 * @returns {boolean} True if the string is a valid number, false otherwise
 */
export const checkIfIsOnlyNumberPositiveNegative = (pattern) => {
    return /^[+-]?\d+(\.\d+)?$/.test(pattern);
};

/**
 * Checks if a string contains only numbers, supporting both integers and decimals
 *
 * @example
 *     // Returns true
 *     checkIfIsOnlyNumber('123');
 *     checkIfIsOnlyNumber('123.45');
 *     checkIfIsOnlyNumber('0.5');
 *
 * @example
 *     // Returns false
 *     checkIfIsOnlyNumber('123a');
 *     checkIfIsOnlyNumber('12.3.4');
 *     checkIfIsOnlyNumber('abc');
 *     checkIfIsOnlyNumber('123.');
 *     checkIfIsOnlyNumber('.456');
 *
 * @param {string} pattern - The string to check
 * @returns {boolean} True if the string contains only numbers (integers or decimals), false otherwise
 */
export const checkIfIsOnlyNumber = (pattern) => {
    return /^\d+\.\d+$|^\d+$/.test(pattern);
};

/**
 * Compare two string exact match case insensitive
 *
 * @param {string} string
 * @param {string} pattern
 * @returns Number
 */
export const exactMatchInsensitive = (string, pattern) => {
    const regex = new RegExp(`^${escapeRegExp(pattern)}$`, 'i');
    const result = string.match(regex) || [];
    return result.length;
};

/**
 * Searches for exact matches of a pattern preceded by a numeric digit at the end of the string. The search is
 * case-insensitive and checks for the presence of a digit (0-9) before the pattern.
 *
 * @example
 *     // Returns 1 (finds "3test" at the end)
 *     exactMatchInsesitiveNumberProp('abc123test', 'test');
 *
 * @example
 *     // Returns 1 (case-insensitive)
 *     exactMatchInsesitiveNumberProp('hello5TEST', 'test');
 *
 * @example
 *     // Returns 0 (missing digit before the pattern)
 *     exactMatchInsesitiveNumberProp('helloTest', 'test');
 *
 * @example
 *     // Returns 0 (pattern not at the end)
 *     exactMatchInsesitiveNumberProp('123testabc', 'test');
 *
 * @param {string} string - The string to search for matches in
 * @param {string} pattern - The pattern to search for, preceded by a numeric digit
 * @returns {number} The number of matches found (0 or 1)
 */
export const exactMatchInsesitiveNumberProp = (string, pattern) => {
    const regex = new RegExp(`[0-9]${pattern}$`, 'i');
    const result = string.match(regex) || [];
    return result.length;
};

/**
 * @param {string[]} arr
 * @param {string} string
 * @returns Boolean
 */
export const exactMatchInsesitiveNumberPropArray = (arr, string) => {
    return arr.some((unitMisure) => {
        const regex = new RegExp(`[0-9]${unitMisure}$`, 'i');
        const result = string.match(regex) || [];
        return result.length;
    });
};

/**
 * @param {string[]} arr
 * @param {string} string
 * @returns Boolean
 */
export const exactMatchInsesitivePropArray = (arr, string) => {
    return arr.some((unitMisure) => {
        const regex = new RegExp(`^${escapeRegExp(unitMisure)}$`, 'i');
        const result = string.match(regex) || [];
        return result.length;
    });
};
