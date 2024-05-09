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


var AbstractAccordionDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	var template = TypeManager.createComponentDef({
			type : 'ComponentWithView',
			nodeName : 'accordion-set',
			states : [
				{"accordion-set" : undefined}
			]/**@CSSify Style componentStyle : AbstractAccordionPseudoSlot */
	});
	

	var moduleDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
//			type : 'ComposedCompnent', 				// this is implicit, as we call the CompoundComponent ctor in the TabPanel ctor
			nodeName : 'reactive-accordion'/**@CSSifyStyle componentStyle : AbstractAccordionHost */
		}),
		lists : [
			TypeManager.createComponentDef({
					type : 'ComponentList',
					template : template
			})
		]
	}, null, 'rootOnly');
	
	return moduleDef;
}

module.exports = AbstractAccordionDef;