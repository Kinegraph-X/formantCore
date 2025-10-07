/**
 * @def AbstractTree
 * @isGroup true
 * 
 * @CSSify styleName : AbstractTreeHost/true
 * @CSSify styleName : AbstractTreeHeader/true
 */


import {ComponentTemplate, ViewTemplate} from '../../../template/TemplateFactory.js';
import CreateStyle from '../../../style/CreateStyle.js'


/** @param {unknown} [options] @param {unknown} [model] */
var abstractTreeDef = function(options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	
	return new ComponentTemplate({
		view : new ViewTemplate({
			nodeName : 'folded-tree',
		}),
		props : [
			{selected : undefined},
			{expanded : true}
		]/**@CSSifyStyle componentStyle : AbstractTreeHost */,
		members : [
			new ComponentTemplate({
				type : 'VaritextButtonWithPicto',
				view : new ViewTemplate({
					nodeName : 'header',
				}),
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
	});
	
}

export default abstractTreeDef;