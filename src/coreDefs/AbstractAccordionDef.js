/**
 * @def AbstractAccordion
 * @isGroup true
 * 
 * @CSSify styleName : AbstractAccordionHost/true
 * @CSSify styleName : AbstractAccordionPseudoSlot/true
 * @CSSifyTheme themeName : basic-light
 * 
 */


var TypeManager = require('src/core/TypeManager');

var CreateStyle = require('src/UI/generics/GenericStyleConstructor');
var pseudoSlotsStyles = require('src/UI/defs/extraStyles/pseudoSlot');


var AbstractAccordionDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	

	var moduleDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
//			type : 'ComposedCompnent', 				// this is implicit, as we call the ComposedComponent ctor in the TabPanel ctor
			nodeName : 'reactive-accordion'/**@CSSify Style componentStyle : AbstractAccordionHost */
		})
	}, null, 'rootOnly');
	
	return moduleDef;
}

module.exports = AbstractAccordionDef;