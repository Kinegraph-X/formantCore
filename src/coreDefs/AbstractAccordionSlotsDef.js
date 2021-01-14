/**
 * @def AbstractAccordionSlot
 * @isGroup true
 * 
 * @CSSify styleName : AbstractAccordionTemplate/false
 * @CSSifyTheme themeName : basic-light
*/


var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var AbstractAccordionSlotDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */

	
	return TypeManager.createComponentDef({
				type : 'GenericTitledPanelComponent',
				nodeName : 'accordion-panel'/**@CSSify Style componentStyle : AbstractAccordionTemplate */
			});
}


module.exports = AbstractAccordionSlotDef;