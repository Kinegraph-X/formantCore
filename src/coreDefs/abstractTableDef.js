/**
 * @def BasicTable
 * @isGroup true
 * 
 * @CSSify hostName : keyValueListSlots
 * @CSSifyRule rule : tdth three_columns
 * @CSSifyRule rule : tdthspecial special_table
 */

// hostname abstractTable
var TypeManager = require('src/core/TypeManager');

var CreateStyle = require('src/UI/generics/GenericStyleConstructor');
//var pseudoSlotsStyles = require('src/UI/defs/extraStyles/basicTable');


var basicTableDef = function(uniqueID, options, model) {
		
	// Some CSS stuff (styles are directly injected in the main def below)
	var styles = [
/*@CSSifySlot*/
		];
	
	
	var slotDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
			type : 'ComponentWithView',
			nodeName : 'pseudo-slot',
			states : [
				{'slot-id' : undefined},
				{'is-embedded' : undefined},
				{'position' : undefined}
				
			],
			subscribeOnChild : [
				{
					on : 'update',
					subscribe : function(e) {
						if (e.bubble)
							this.trigger('update', e.data, true);
					}
				}
			],
			sWrapper : CreateStyle('abstract_table_pseudo_slot-style', null, styles).sWrapper
		}, null, 'hostOnly')
	}, null, 'rootOnly');

	var moduleDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
//			type : 'ComposedCompnent', 				// this is implicit, as we call the ComposedComponent ctor in the TabPanel ctor
			nodeName : 'extensible-table',
			props : [
				{updateChannel : undefined}
			],
			sWrapper : CreateStyle('abstractTable', null, styles).sWrapper
		}),
		lists : [
			TypeManager.createComponentDef({
				type : 'ComponentList',
				template : slotDef
			})
		]
	}, null, 'rootOnly');
	
	return moduleDef;
}

basicTableDef.__factory_name = 'basicTableDef';
module.exports = basicTableDef;