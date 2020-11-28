/**
 * @def treeBranch
 * @isGroup true
 * 
 */


var TypeManager = require('src/core/TypeManager');

var CreateStyle = require('src/UI/generics/GenericStyleConstructor');
//var pseudoSlotsStyles = require('src/UI/defs/extraStyles/pseudoSlot');


var treeBranchDef = function(uniqueID, options, model) {
		
	// Some CSS stuff (styles are directly injected in the main def below)
	var styles = [
/*@CSSifySlot*/
		];
	
	
	
	var moduleDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
			type : 'ComposedComponent',
			nodeName : 'tree-branch',
//			sWrapper : CreateStyle('lazySlottedComponent', null, styles).sWrapper
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

treeBranchDef.__factory_name = 'treeBranchDef';
module.exports = treeBranchDef;