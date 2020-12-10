/**
 * @def AbstractTree
 * @isGroup true
 * 
 * @CSSify hostName : foldedTree
 * @CSSifyRule rule : host block
 */


var TypeManager = require('src/core/TypeManager');

var CreateStyle = require('src/UI/generics/GenericStyleConstructor');
var pseudoSlotsStyles = require('src/UI/defs/extraStyles/pseudoSlot');


var abstractTreeDef = function(uniqueID, options, model) {
		
	// Some CSS stuff (styles are directly injected in the main def below)
	var styles = [
/*@CSSifySlot*/
		];
	
	
	
	var moduleDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
//			type : 'ComposedCompnent', 				// this is implicit, as we call the ComposedComponent ctor in the TabPanel ctor
			nodeName : 'folded-tree',
			props : [
				{selected : undefined}
			],
			sWrapper : CreateStyle('abstractTree', null, styles).sWrapper
		}),
		members : [
			TypeManager.createComponentDef({
				type : 'VaritextButtonWithPicto',
				nodeName : 'header',
				// this is a big hack of shit (should be an attribute, but not... should be a "DOM" attribute... -> setAttribute(). TODO: fix after re-implementation of _arias&glyphs)
				states : [
					{role : "heading"},
					{expanded : undefined} 
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
			})
		]
	}, null, 'rootOnly');
	
	return moduleDef;
}

abstractTreeDef.__factory_name = 'abstractTreeDef';
module.exports = abstractTreeDef;