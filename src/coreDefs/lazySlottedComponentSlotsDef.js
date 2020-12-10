/**
 * @def LazyHostComponentSlots
 * @isGroup false
 * 
 * 
 */


var TypeManager = require('src/core/TypeManager');

var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var lazySlottedComponentSlotsDef = function(uniqueID, options, model) {
	var context = this.context;
		
	// Some CSS stuff
	var styles = [
/*@CSSifySlot*/
		];
	
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
			nodeName : 'tab-panel'
		}, null, 'hostOnly')
	}, null, 'rootOnly');
	
	
	
	return {
		headerDef : headerDef,
		sectionDef : sectionDef
	};
}

lazySlottedComponentSlotsDef.__factory_name = 'lazySlottedComponentDef';
module.exports = lazySlottedComponentSlotsDef;