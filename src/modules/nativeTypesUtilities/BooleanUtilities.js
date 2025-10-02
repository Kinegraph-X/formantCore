/**
 * @module BooleanUtilities
 */
/**
 * @template Val
 * @param {Val} val 
 * @returns {boolean|Val}
 */
const tryParseBoolean = (val) => {
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
}

export default {
    tryParseBoolean,
}