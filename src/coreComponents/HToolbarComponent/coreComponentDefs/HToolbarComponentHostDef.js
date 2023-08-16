/**
 * @def ToolbarComponent
 * @isGroup true
 * 
 * @CSSify styleName : ToolbarComponentHost/true
 * @CSSify styleName : ToolbarComponentTemplate/false
 * @CSSifyTheme themeName : basic-light
 * 
 */
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/core/GenericStyleConstructor');


var ToolbarComponentDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	var moduleDef = TypeManager.createComponentDef({
		nodeName : 'h-toolbar'/**@CSSify Style componentStyle : ToolbarComponentHost */
	})
	
	return moduleDef;
}

module.exports = ToolbarComponentDef;