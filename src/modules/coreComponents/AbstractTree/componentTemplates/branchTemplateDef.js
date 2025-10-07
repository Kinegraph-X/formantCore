/**
 * @def treeBranch
 * @isGroup true
 * 
 * @CSSify styleName : AbstractTreeBranch/true
 * @CSSifyRule rule : host block
 * @CSSifyRule rule : header hPadding
 * 
 */

/**
 * @typedef {import('../../../reactivity/Stream').default<string|null>} Stream
 * @typedef {import('../../../reactivity/EffectCtx.js').default} EffectCtx
 */


import {ComponentTemplate, ViewTemplate} from '../../../template/TemplateFactory.js';
import CreateStyle from '../../../style/CreateStyle.js';


/** @param {unknown} [options] @param {unknown} [model] */
const treeBranchDef = function(options, model) {
	/**@CSSify DEBUG */		// DEBUG must be set (remove the space) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	return new ComponentTemplate({
		type : 'TreeBranch',
		view : new ViewTemplate({nodeName : 'tree-branch'}),
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
		],
		subscribeOnChild : [
			{
				on : 'projectedData',
				subscribe : (e, ctx, meta) => {ctx.emitters['exportData'].emit(e.payload, meta);}
			}
		]/**@CSSifyStyle componentStyle : AbstractTreeBranch */,
		members : [
			new ComponentTemplate({
				type : 'VaritextButton',
				view : new ViewTemplate({nodeName : 'header'}),
				// this is a big hack of shit (should be an attribute, but not... should be a "DOM" attribute... -> setAttribute(). TODO: fix after re-implementation of _arias&glyphs)
				states : [
					{role : "heading"},
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
						effect : function(ctx, value) {/**@type{Stream}*/(ctx.streams.get('selected')).next = value === ctx.regUID ? 'selected' : null;}
					},
					{
						from : 'expanded',
						to : 'toggled'
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
	});
	
}

export default treeBranchDef;