/**
 * @def FlexRowComponent
 * @isGroup true
 * 
 * @CSSify styleName : FlexRowComponentHost/true
 * @CSSify styleName : FlexRowComponentTemplate/false
 * @CSSifyTheme themeName : basic-light
 * 
 */
var TemplateFactory = require('src/core/TemplateFactory');
var CreateStyle = require('src/core/GenericStyleConstructor');


var FlexRowComponentDef = function(options) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	
	
	var moduleDef = TemplateFactory.createHostDef({
			nodeName : 'box-row'/**@CSSifyStyle componentStyle : FlexRowComponentHost */
		});
	
	return moduleDef;
}

module.exports = FlexRowComponentDef;