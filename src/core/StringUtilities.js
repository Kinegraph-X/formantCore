/**
 * @module StringUtilities
 */

/**
 * @param {string} str
 */
camelToHyphens = function(str) {
    return str.replace(/[A-Z]/g, function(match, offset, str) {
        return (offset > 0 ? '-' : '') + String(match).toLowerCase() 	// accept camel & dromedar
    });
}

module.exports = {
    camelToHyphens,
    
}