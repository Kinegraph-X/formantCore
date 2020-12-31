/**
 * @def IFrameComponent
 * @isGroup false
 * 
 * @CSSify styleName : IFrameComponentHost/true
 * @CSSify styleName : IFrameComponentTemplate/false
 * @CSSifyTheme themeName : basic-light
 * 
 */
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var IFrameComponentDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	
	var moduleDef = TypeManager.createComponentDef({
			nodeName : 'iframe'/**@CSSify Style componentStyle : IFrameComponentHost */
		});
	
	return moduleDef;
}

module.exports = IFrameComponentDef;