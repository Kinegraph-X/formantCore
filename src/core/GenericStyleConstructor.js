/**
 * @programmatic_style Generics
 */


var TypeManager = require('src/core/TypeManager');
var appConstants = require('src/appLauncher/appLauncher');
var StylesheetWrapper = require('src/editing/AbstractStylesheet');

var styleDef = function(uniqueID, styles) {
//	if (styles === null)
//		console.trace(styles);
//		
	if (Array.isArray(uniqueID) && uniqueID[0].selector) {
		styles = uniqueID;
		uniqueID = undefined;
	}
	
	var obj,
		cachedStylesheet,
		name = (uniqueID || 'Automatic_CSS_ID_' + TypeManager.UIDGenerator.newUID()),
		debug;
	
	if (uniqueID) {
//		console.log(uniqueID);
		cachedStylesheet = appConstants.isKnownUID(uniqueID);
	}

	if (Object.prototype.toString.call(cachedStylesheet) === '[object Object]')
		return cachedStylesheet;
	else if (typeof cachedStylesheet === 'string') {
		obj = new StylesheetWrapper(styles, cachedStylesheet); // cachedStylesheet may be a string (the future key of the object in the cache)
		appConstants.setUID(cachedStylesheet, obj);
	}
	else {
		obj = new StylesheetWrapper(styles, name);
		debug = appConstants.setUID(obj.getName(), obj);
//		console.log(name, debug);
	}

	return obj;
}

module.exports = styleDef;