/**
 * @def RootViewComponent
 * @isGroup true
 * 
 * @CSSify styleName : RootViewComponentHost/true
 * @CSSify styleName : RootViewComponentHeader/true
 * @CSSify styleName : RootViewComponentPage/true
 * @CSSifyTheme themeName : basic-light
 * 
 */
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var RootViewComponentDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must "stick" to the annotation (ie. be RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	

	 

	var moduleDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
//			type : 'ComposedCompnent', 				// this is implicit, as we call the CompoundComponent ctor in the TabPanel ctor
			nodeName : 'app-root'/**@CSSifyStyle componentStyle : RootViewComponentHost */
		}),
		members : [
			TypeManager.createComponentDef({
				type : 'ComponentWithView',
				nodeName : 'app-header'/**@CSSifyStyle componentStyle : RootViewComponentHeader */
			}),
			TypeManager.createComponentDef({
				type : 'ComponentWithView',
				nodeName : 'app-body'/**@CSSifyStyle componentStyle : RootViewComponentPage */
			})
		]
	}, null, 'rootOnly');
	
	var minimalModuleDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
//			type : 'ComposedCompnent', 				// this is implicit, as we call the CompoundComponent ctor in the TabPanel ctor
			nodeName : 'app-root'/**@CSSifyStyle componentStyle : RootViewComponentHost */
		})
	}, null, 'rootOnly');
	
//	console.log(moduleDef);
	
	return {
		moduleDef : moduleDef,
		minimalModuleDef : minimalModuleDef
	};
}

module.exports = RootViewComponentDef;