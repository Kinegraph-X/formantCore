/**
 * @def AppOverlayComponent
 * @isGroup true
 * 
 * @CSSify styleName : AppOverlayComponentHost/true
 * @CSSify styleName : AppOverlayComponentTemplate/false
 * @CSSifyTheme themeName : basic-light
 * 
 */
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var AppOverlayComponentDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	
	var moduleDef = TypeManager.createComponentDef({
		nodeName : 'app-overlay'/**@CSSifyStyle componentStyle : AppOverlayComponentHost */
	});
	
	return moduleDef;
}

module.exports = AppOverlayComponentDef;