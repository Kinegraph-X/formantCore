/**
 * @def LazyHostComponentSlots
 * @isGroup false
 * 
 * @CSSify styleName : LazySlottedCompoundComponentTabpanel/false
 * @CSSifyTheme themeName : basic-light
 */


var TypeManager = require('src/core/TypeManager');

var CreateStyle = require('src/core/GenericStyleConstructor');


var lazySlottedComponentSlotsDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	var headerDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
			type : 'VaritextButton',
			nodeName : 'header',
			// this is a big hack of shit (should be an attribute, but not... should be a "DOM" attribute... -> setAttribute(). TODO: fix after re-implementation of _arias&glyphs)
			states : [
				{role : "heading"},
				{highlighted : undefined}
			],
			props : [
				{headerTitle : undefined}
			],
			reactOnSelf : [
				{
					from : 'headerTitle',
					to : 'content'
				}
			]
		}, null, 'hostOnly')
	}, null, 'rootOnly');
	
	var sectionDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
			type : 'ComponentWithView',
			nodeName : 'tab-panel'/**@CSSifyStyle componentStyle : LazySlottedCompoundComponentTabpanel */
		}, null, 'hostOnly')
	}, null, 'rootOnly');
	
	
	
	return {
		headerDef : headerDef,
		sectionDef : sectionDef
	};
}

lazySlottedComponentSlotsDef.__factory_name = 'lazySlottedComponentDef';
module.exports = lazySlottedComponentSlotsDef;