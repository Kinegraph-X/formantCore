/**
 * @def treeLeafTemplate
 * @isGroup true
 * 
 * @CSSify styleName : AbstractTreeLeaf/true
 * @CSSifyRule rule : host block
 * @CSSifyRule rule : div_2ndChild pointer
 */


import {ComponentTemplate, ViewTemplate} from '../../../template/TemplateFactory.js';
import CreateStyle from '../../../style/CreateStyle.js'


/** @param {unknown} options @param {unknown} model */
var treeLeafTemplateDef = function(options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	return new ComponentTemplate({
		type : 'KeyValuePairComponent',
		view : new ViewTemplate({
			nodeName : 'key-value-pair',
			listens : {click: 'handleClick'}
		}),
		props : [
			{projectedData : undefined}
		],
		states : [
			{selected : undefined}
		],
		reactOnParent : [
			{
				from : 'selected',
				effect : function(ctx, value) {ctx.streams.get('selected').next = value === ctx.regUID ? 'selected' : null;}
			}
		]/**@CSSifyStyle componentStyle : AbstractTreeLeaf */
	});
}

export default treeLeafTemplateDef;