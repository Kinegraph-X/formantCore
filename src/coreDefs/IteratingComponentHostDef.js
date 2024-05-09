/**
 * @def IteratingComponent
 * @author : Kinegraphx
 * @isGroup true
 * 
 * @CSSify styleName : IteratingComponentHost
 * @CSSify styleName : IteratingComponentTemplate
 * @CSSifyTheme themeName : basic-light
 * 
 */
var TemplateFactory = require('src/core/TemplateFactory');
var CreateStyle = require('src/core/GenericStyleConstructor');


var IteratingComponentDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// Remove the whitespace between @CSSify and the word DEBUG to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	return TemplateFactory.createHostDef({
		nodeName : 'ul',
	});
}

module.exports = IteratingComponentDef;