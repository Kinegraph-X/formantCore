/**
 * @def LazyHostComponent
 * @isGroup true
 * 
 * @CSSify hostName : smartTabs
 * @CSSifyRule rule : smartTabs
 * 
 */


var TypeManager = require('src/core/TypeManager');

var CreateStyle = require('src/UI/generics/GenericStyleConstructor');
var pseudoSlotsStyles = require('src/UI/defs/extraStyles/pseudoSlot');


var lazySlottedComponentDef = function(uniqueID, options, model) {
	var context = this.context;
		
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
			sWrapper : CreateStyle('pseudo-slot-style', null, pseudoSlotsStyles).sWrapper
		}, null, 'hostOnly')
	}, null, 'rootOnly');
	
	
	/*
	 * Build the schematic-def of the component: 
	 * 
	 * this one is pretty special...
	 * 
	 * This def is the base-def for any LazySlottedComponent instance
	 * But, CAUTION: In order to implement different -individual- defs for the slots (and/or being able to -reduce- the slots count, if needed, without breaking the execution)
	 * 		=> we have to take into account that there is a !second! def obj, which is injected via a closure directly into the LazySlottedComponent ctor
	 * 		=> so the LazySlottedComponent must then be extended through prototypal inheritance, and :
	 * 			-*- eventually, his slotsDef property overridden (pre-defined) in the derived ctor
	 * 			-*- eventually, his slotsCount property {number} also overridden (pre-defined) in the derived ctor
	 * 			-*- and if the type of the slots must be different than "Dataset", his affectSlots() method must be overridden
	 */
	var moduleDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
//			type : 'ComposedCompnent', 				// this is implicit, as we call the ComposedComponent ctor in the TabPanel ctor
			nodeName : 'smart-tabs',
			sWrapper : CreateStyle('lazySlottedComponent', null, styles).sWrapper
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

lazySlottedComponentDef.__factory_name = 'lazySlottedComponentDef';
module.exports = lazySlottedComponentDef;