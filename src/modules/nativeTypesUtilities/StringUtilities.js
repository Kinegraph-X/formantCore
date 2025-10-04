/**
 * @module StringUtilities
 */

/**
 * @param {string} str
 */
const camelToHyphens = function(str) {
    return str.replace(/[A-Z]/g, function(match, offset, str) {
        return (offset > 0 ? '-' : '') + String(match).toLowerCase() 	// accept camel & dromedar
    });
}

/**
 * @param {string} str
 */
const hyphensToCameel = function(str) {
    return str.replace(/\-(\w)/g, function(match, p1, offset, str) {
        return p1.toUpperCase();
    });
}

/**
 * @param {string} str
 */
const capitalizeFirstLetter = function(str) {
    return `${str.slice(0, 1).toUpperCase()}${str.slice(1).toLowerCase()}`;
}

/**
 * @param {string} str
 */
const lowercaseFirstLetter = function(str) {
    return `${str.slice(0, 1).toLowerCase()}${str.slice(1)}`;
}

/**
 * @param {string} str
 * @param {number} length
 * @param {number} offset
 */
const getNcharsAsCharCodesArray = (str, length, offset) => {
    if (offset >= str.length) {
        offset = 0;
        length = str.length < length ? str.length : length;
    }
    else if ((offset + length) > str.length) {
        // Avoid capturing only one char...
        if ((offset + length) > (str.length - (length - 1))) {
            offset = 0;
            length = str.length < length ? str.length : length;
        }
        else
            length = str.length - offset;
    }
    var i = offset, end = i + length, ret = [];
    while (i < end) {
        ret.push(str.charCodeAt(i));
        i++;
    }
    return [offset, ret];
}

export {
    camelToHyphens,
    hyphensToCameel,
    capitalizeFirstLetter,
    lowercaseFirstLetter,
    getNcharsAsCharCodesArray,
}