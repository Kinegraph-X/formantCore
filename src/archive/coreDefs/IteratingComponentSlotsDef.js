/**
 * @def IteratingComponentSlots
 * @author : Kinegraphx
 * @isGroup false
 * 
 * @CSSify styleName : IteratingComponentHeader
 * @CSSify styleName : IteratingComponentSection
 * @CSSifyTheme themeName : basic-light
 */
var TemplateFactory = require('src/core/TemplateFactory');
var CreateStyle = require('src/core/GenericStyleConstructor');


var IteratingComponentSlotsDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */ 	// Remove the whitespace between @CSSify and the word DEBUG to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	const slotDef = TemplateFactory.createDef({
		host : TemplateFactory.createDef({
			type : 'SimpleText',
			nodeName : 'li'
		})
	});
	
	
	
	return {
		slotDef : slotDef
	};
}

module.exports = IteratingComponentSlotsDef;