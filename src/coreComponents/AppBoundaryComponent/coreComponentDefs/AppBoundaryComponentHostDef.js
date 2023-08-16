/**
 * @def AppBoundaryComponent
 * @isGroup true
 * 
 * @CSSify styleName : AppBoundaryComponentHost/true
 * @CSSifyTheme themeName : basic-light
 * 
 */
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/core/GenericStyleConstructor');


var AppBoundaryComponentDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	
		var moduleDef = TypeManager.createComponentDef({
			nodeName : 'app-boundary'/**@CSSifyStyle componentStyle : AppBoundaryComponentHost */
		});
	
	return moduleDef;
}

module.exports = AppBoundaryComponentDef;