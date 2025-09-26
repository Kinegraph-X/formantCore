/**
 * @module BooleanUtilities
 */

module.exports = {
    tryParseBoolean = (val) {
		if (typeof val !== 'string')
			return val;
		else {
			if (val === 'false')
				return false;
			else if (val === 'true')
				return true;
			else
				return val;
		}
	},
}