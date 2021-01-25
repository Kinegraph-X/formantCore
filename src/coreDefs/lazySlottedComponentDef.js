/**
 * @def LazySlottedCompoundComponent
 * @isGroup true
 * 
 * @CSSify styleName : LazySlottedCompoundComponentHost/true
 * @CSSify styleName : LazySlottedCompoundComponentPseudoslot/false
 * @CSSifyTheme themeName : basic-light
 * 
 */


var TypeManager = require('src/core/TypeManager');

var CreateStyle = require('src/UI/generics/GenericStyleConstructor');
var pseudoSlotsStyles = require('src/UI/defs/extraStyles/pseudoSlot');


var lazySlottedComponentDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	
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
			]/**@CSSifyStyle componentStyle : LazySlottedCompoundComponentPseudoslot */
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
//			type : 'ComposedCompnent', 				// this is implicit, as we call the CompoundComponent ctor in the TabPanel ctor
			nodeName : 'smart-tabs'/**@CSSifyStyle componentStyle : LazySlottedCompoundComponentHost */
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