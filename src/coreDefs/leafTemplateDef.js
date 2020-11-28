/**
 * @def treeLeafTemplate
 * @isGroup true
 * 
 * @CSSify hostName : treeLeaf
 * @CSSifyRule rule : div
 * @CSSifyRule rule : div_2ndChild 
 * 
 */


var TypeManager = require('src/core/TypeManager');

var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var treeLeafTemplateDef = function(uniqueID, options, model) {
		
	// Some CSS stuff
	var styles = [
/*@CSSifySlot*/
		];
	
	var headerDef = TypeManager.createComponentDef({
			type : 'KeyValuePairComponent',
			nodeName : 'key-value-pair',
			states : [
				{displayed_as : undefined}
			]
		}, 'KeyValuePair');
	
	
	return headerDef;
}

treeLeafTemplateDef.__factory_name = 'treeLeafTemplateDef';
module.exports = treeLeafTemplateDef;