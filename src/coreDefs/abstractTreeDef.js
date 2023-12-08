/**
 * @def AbstractTree
 * @isGroup true
 * 
 * @CSSify styleName : AbstractTreeHost/true
 * @CSSify styleName : AbstractTreeHeader/true
 */


var TypeManager = require('src/core/TypeManager');

var CreateStyle = require('src/core/GenericStyleConstructor');
var pseudoSlotsStyles = require('src/UI/defs/extraStyles/pseudoSlot');


var abstractTreeDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	
	var moduleDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
			type : 'CompoundComponent',
			nodeName : 'folded-tree',
			props : [
				{selected : undefined},
				{expanded : true}
			]/**@CSSifyStyle componentStyle : AbstractTreeHost */
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
				]/**@CSSify Style componentStyle : AbstractTreeHeader */
			})
		]
	}, null, 'rootOnly');
	
	return moduleDef;
}

abstractTreeDef.__factory_name = 'abstractTreeDef';
module.exports = abstractTreeDef;