/**
 * @def FlexColumnComponent
 * @isGroup true
 * 
 * @CSSify styleName : FlexColumnComponentHost/true
 * @CSSify styleName : FlexColumnComponentTemplate/false
 * @CSSifyTheme themeName : basic-light
 * 
 */
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/core/GenericStyleConstructor');


var FlexColumnComponentDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	
	var moduleDef = TypeManager.createComponentDef({
		nodeName : 'box-column'/**@CSSifyStyle componentStyle : FlexColumnComponentHost */
	});
	
	return moduleDef;
}

module.exports = FlexColumnComponentDef;