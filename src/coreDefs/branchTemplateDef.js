/**
 * @def treeBranch
 * @isGroup true
 * 
 * @CSSify styleName : AbstractTreeBranch/true
 * @CSSifyRule rule : host block
 * @CSSifyRule rule : header hPadding
 * 
 */


var TypeManager = require('src/core/TypeManager');

var CreateStyle = require('src/core/GenericStyleConstructor');
//var pseudoSlotsStyles = require('src/UI/defs/extraStyles/pseudoSlot');


var treeBranchDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	var moduleDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
			type : 'CompoundComponent',
			nodeName : 'tree-branch',
			states : [
				{expanded : undefined}
			],
			props : [
				{headerTitle : undefined},
				{displayedas : undefined},
				{selected : undefined},
				{branchintree : undefined},
				{nodeintree : undefined}
			],
			reactOnParent : [
				{
					from : 'selected',
					to : 'selected'
				}
			]/**@CSSifyStyle componentStyle : AbstractTreeBranch */
		}),
		members : [
			TypeManager.createComponentDef({
				type : 'VaritextButtonWithPictoFirst',
				nodeName : 'header',
				// this is a big hack of shit (should be an attribute, but not... should be a "DOM" attribute... -> setAttribute(). TODO: fix after re-implementation of _arias&glyphs)
				states : [
					{role : "heading"},
					{expanded : undefined},
					{displayedas : undefined},
					{selected : undefined},
					{branchintree : undefined},
					{nodeintree : undefined}
				],
				reactOnParent : [
					{
						from : 'headerTitle',
						to : 'content'
					},
					{
						from : 'selected',
						cbOnly : true,
						subscribe : function(value) {this.streams.selected.value = value === this._UID ? 'selected' : null;}
					},
					{
						from : 'expanded',
						to : 'expanded'
					},
					{
						from : 'displayedas',
						to : 'displayedas'
					},
					{
						from : 'branchintree',
						to : 'branchintree'
					},
					{
						from : 'nodeintree',
						to : 'nodeintree'
					}
				]
			})
		]
	}, null, 'rootOnly');
	
	return moduleDef;
}

treeBranchDef.__factory_name = 'treeBranchDef';
module.exports = treeBranchDef;