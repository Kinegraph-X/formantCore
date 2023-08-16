/**
 * @def treeLeafTemplate
 * @isGroup true
 * 
 * @CSSify styleName : AbstractTreeLeaf/true
 * @CSSifyRule rule : host block
 * @CSSifyRule rule : div_2ndChild pointer
 */


var TypeManager = require('src/core/TypeManager');

var CreateStyle = require('src/core/GenericStyleConstructor');


var treeLeafTemplateDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	var secondSlotDef = TypeManager.createComponentDef({
			type : 'KeyValuePairComponent',
			nodeName : 'key-value-pair',
			states : [
				{selected : undefined}
			],
			reactOnParent : [
				{
					from : 'selected',
					cbOnly : true,
					subscribe : function(value) {this.streams.selected.value = value === this._UID ? 'selected' : null;}
				}
			]/**@CSSifyStyle componentStyle : AbstractTreeLeaf */
		}, 'KeyValuePair');
	
	
	return secondSlotDef;
}

treeLeafTemplateDef.__factory_name = 'treeLeafTemplateDef';
module.exports = treeLeafTemplateDef;