/**
 * @def AbstractAccordionSlot
 * @isGroup true
 * 
 * @CSSify styleName : AbstractAccordionTemplate/true
 * @CSSifyTheme themeName : basic-light
*/


var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var AbstractAccordionSlotDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */

	
	return TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
			type : 'ComponentWithView',
			nodeName : 'accordion-panel'/**@CSSify Style componentStyle : AbstractAccordionTemplate */
		}, null, 'hostOnly'),
		members : [
			TypeManager.createComponentDef({
				nodeName : 'header'
			}, null, 'hostOnly'),
			TypeManager.createComponentDef({
				nodeName : 'div',
				attributes : [
					{className : 'accordion_panel_shadow'}
				]
			}, null, 'hostOnly'),
			TypeManager.createComponentDef({
				nodeName : 'ul'
			}, null, 'hostOnly'),
			TypeManager.createComponentDef({
				nodeName : 'div',
				attributes : [
					{className : 'accordion_panel_inverse_shadow'}
				]
			}, null, 'hostOnly'),
			TypeManager.createComponentDef({
				nodeName : 'footer',
			}, null, 'hostOnly')
		]
	}, null, 'rootOnly');
}


module.exports = AbstractAccordionSlotDef;