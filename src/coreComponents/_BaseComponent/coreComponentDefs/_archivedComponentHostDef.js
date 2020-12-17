/**
 * @def RootViewComponent
 * @isGroup true
 * 
 * @CSSify hostName : RootViewComponentHost
 * @CSSify hostName : RootViewComponentHeader
 * @CSSify hostName : RootViewComponentPage
 * @CSSifyTheme themeName : basic-light
 * 
 */
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var RootViewComponentDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	
	
	
	var hostStyles = [
/**@CSSifySlot styleSlotName : RootViewComponentHost */
	];
	var headerStyles = [
/**@CSSifySlot styleSlotName : RootViewComponentHeader */
	];
	var pageStyles = [
/**@CSSifySlot styleSlotName : RootViewComponentPage */
	];
	var hostStylesUseCache = {
		use : true,
		nameInCache : 'RootViewComponentHostStyles'
	}
	var headerStylesUseCache = {
		use : true,
		nameInCache : 'RootViewComponentHeaderStyles'
	}
	var pageStylesUseCache = {
		use : true,
		nameInCache : 'RootViewComponentPageStyles'
	}
	
//	console.log(hostStyles);
	var moduleDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
//			type : 'ComposedCompnent', 				// this is implicit, as we call the ComposedComponent ctor in the TabPanel ctor
			nodeName : 'app-root'/**@CSSifyStyle componentStyle : RootViewComponentHost */,
			sWrapper : CreateStyle(
					hostStylesUseCache.use ? hostStylesUseCache.nameInCache : null,
					null,
					hostStyles
				).sWrapper
		}),
		members : [
			TypeManager.createComponentDef({
				type : 'ComponentWithView',
				nodeName : 'app-header'/**@CSSifyStyle componentStyle : RootViewComponentHeader */,
				sWrapper : CreateStyle(
						headerStylesUseCache.use ? headerStylesUseCache.nameInCache : null,
						null,
						headerStyles
					).sWrapper
			}),
			TypeManager.createComponentDef({
				type : 'ComponentWithView',
				nodeName : 'app-body'/**@CSSifyStyle componentStyle : RootViewComponentPage */,
				sWrapper : CreateStyle(
						pageStylesUseCache.use ? pageStylesUseCache.nameInCache : null,
						null,
						pageStyles
					).sWrapper
			})
		]
	}, null, 'rootOnly');
	
//	console.log(moduleDef);
	
	return moduleDef;
}

module.exports = RootViewComponentDef;