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

export default {
    camelToHyphens,
    
}