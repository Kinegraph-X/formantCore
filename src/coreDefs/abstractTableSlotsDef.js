/**
 * @def BasicTableSlots
 * @isGroup false

 * 
 */


var TypeManager = require('src/core/TypeManager');
var Component = require('src/core/Component');

var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var basicTableSlotsDef = function(uniqueID, options, model) {
	
	// Some CSS stuff
	var styles = [
/*@CSSifySlot*/
		];
	
	var headerDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
			type : 'VaritextButton',
			nodeName : 'th',
			// this is a big hack of shit (should be an attribute, but not... should be a "DOM" attribute... -> setAttribute(). TODO: fix after re-implementation of _arias&glyphs)
			states : [
				{role : "heading"},
				{sortedasc : undefined},
				{sorteddesc : undefined}
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
			type : 'ComponentWith_FastReactiveText',
			nodeName : 'tr',
			props : [
				{rowContentAsArray : undefined}
			],
			reactOnSelf : [
					{
						from : 'rowContentAsArray',
						cbOnly : true,
						subscribe : Component.ComponentWith_FastReactiveText.prototype.setContentFromArrayOnEachMemberView
					}
			]
		}, null, 'hostOnly')
	}, null, 'rootOnly');
	
	
	
	return {
		headerDef : headerDef,
		sectionDef : sectionDef
	};
}

basicTableSlotsDef.__factory_name = 'lazySlottedComponentDef';
module.exports = basicTableSlotsDef;