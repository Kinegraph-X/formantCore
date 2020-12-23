/**
 * @def FlexRowComponent
 * @isGroup true
 * 
 * @CSSify styleName : FlexRowComponentHost/true
 * @CSSify styleName : FlexRowComponentTemplate/false
 * @CSSifyTheme themeName : basic-light
 * 
 */
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var FlexRowComponentDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	
	
	var moduleDef = TypeManager.createComponentDef({
			nodeName : 'box-row'/**@CSSifyStyle componentStyle : FlexRowComponentHost */
		});
	
	return moduleDef;
}

module.exports = FlexRowComponentDef;