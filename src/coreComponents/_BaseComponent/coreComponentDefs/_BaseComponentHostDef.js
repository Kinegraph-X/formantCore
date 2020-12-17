/**
 * @def _componentNameComponent
 * @isGroup true
 * 
 * @CSSify styleName : _componentNameComponentHost/false
 * @CSSify styleName : _componentNameComponentTemplate/false
 * @CSSifyTheme themeName : basic-light
 * 
 */
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var _componentNameComponentDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	
	var slotDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
			type : 'ComponentWithView',
			nodeName : 'pseudo-slot',
			states : [],
			subscribeOnChild : [
				{
					on : 'update',
					subscribe : function(e) {
						if (e.bubble)
							this.trigger('update', e.data, true);
					}
				}
			]/**@CSSifyStyle componentStyle : _componentNameComponentTemplate */
		}, null, 'hostOnly')
	}, null, 'rootOnly');
	
	
	/*
	 * Build the schematic-def of the component: 
	 * 
	 * this one is pretty special...
	 * 
	 * This def is the base-def for any _componentNameComponent instance
	 * But, CAUTION: In order to implement different -individual- defs for the slots (and/or being able to -reduce- the slots count, if needed, without breaking the execution)
	 * 		=> we have to take into account that there is a !second! def obj, which is injected directly into the _componentNameComponent ctor
	 * 		=> so the _componentNameComponent must then be extended through prototypal inheritance, and :
	 * 			-*- eventually, his slotsDef property overridden (pre-defined) in the derived ctor
	 * 			-*- eventually, his slotsCount property {number} also overridden (pre-defined) in the derived ctor
	 * 			-*- and if the type of the slots must be different than "Dataset", his affectSlots() method must be overridden
	 */
	var moduleDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
//			type : 'ComposedCompnent', 				// this is implicit, as we call the ComposedComponent ctor in the TabPanel ctor
			nodeName : '_componentName'.toLowerCase() + '-component'/**@CSSifyStyle componentStyle : _componentNameComponentHost */
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

module.exports = _componentNameComponentDef;