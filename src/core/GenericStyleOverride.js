/**
 * @programmatic_style styleOverrideFactory
 */


var TypeManager = require('src/core/TypeManager');
var appConstants = require('src/appLauncher/appLauncher');
var StylesheetWrapper = require('src/editing/StylesheetWrapper');
//console.log(appConstants);

var styleDef = function(uniqueID, styles) {
	var name = (((uniqueID + ' ') || '') + 'Override CSS ID ' + TypeManager.UIDGenerator.newUID());
	
	if (!styles && uniqueID && Object.prototype.toString.call(uniqueID) === '[object Object]' && uniqueID.selector)
		styles = uniqueID;
	else if (!styles)
		return false;
	
	if (!Array.isArray(styles))
		styles = [styles];
		
	return new StylesheetWrapper(styles, null, null, name);
}

styleDef.__factory_name = 'styleOverrideFactory';
module.exports = styleDef;