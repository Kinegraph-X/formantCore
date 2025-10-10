/**
 * Template for AbstractTree
 * 
 * @CSSify styleName : AbstractTreeHost
 * @CSSify styleName : AbstractTreeHeader
 */

import {ComponentTemplate, ViewTemplate} from '../../../template/TemplateFactory.js';
import CreateStyle from '../../../style/CreateStyle.js'


/** @param {unknown} [options] @param {unknown} [model] */
var abstractTreeDef = function(options, model) {
	/**@CSSify DEBUG */		// DEBUG: remove the space to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	return new ComponentTemplate({
		view : new ViewTemplate({
			nodeName : 'folded-tree' /**@CSSifyStyle componentStyle : AbstractTreeHost */
		}),
		props : [
			{selected : undefined},
			{expanded : true}
		],
		members : [
			new ComponentTemplate({
				type : 'VaritextButtonWithPicto',
				view : new ViewTemplate({
					nodeName : 'header' /**@CSSify Style componentStyle : AbstractTreeHeader */
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
				]
			})
		]
	})
	
}

export default abstractTreeDef;