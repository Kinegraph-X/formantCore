/**
 * @programmatic_style generic defs
 */

var StylesheetWrapper = require('src/editing/StylesheetWrapper');

var styleDef = function() {
	var context = this.context,
		uniqueID = '';
	var def = {
			id : uniqueID, 
			className : 'helper_styles',
			sWrapper : null
	}

	// If style node not already injected : the style node has the same class and id as the first defined class (?)
	if (document.querySelector('.' + uniqueID + '_' + def.className) === null) {
		
		def.sWrapper = new StylesheetWrapper(null, [
			{
				id : uniqueID + '_' + def.className
			}
		]);
	}
	
	return def;
}

styleDef.__factory_name = 'helperStyles';
module.exports = styleDef;