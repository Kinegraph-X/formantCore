/**
 * @def treeLeafTemplate
 * @isGroup true
 * 
 * @CSSify hostName : treeLeaf
 * @CSSifyRule rule : host block
 * @CSSifyRule rule : div_2ndChild pointer
 */


var TypeManager = require('src/core/TypeManager');

var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var treeLeafTemplateDef = function(uniqueID, options, model) {
		
	// Some CSS stuff
	var styles = [
/*@CSSifySlot*/
		];
	
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
			]
		}, 'KeyValuePair');
	
	
	return secondSlotDef;
}

treeLeafTemplateDef.__factory_name = 'treeLeafTemplateDef';
module.exports = treeLeafTemplateDef;