/**
 * @def RootViewComponentSlots
 * @isGroup false
 * 
 * @CSSify styleName : RootViewComponentHeader
 * @CSSify styleName : RootViewComponentSection
 */
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var RootViewComponentSlotsDef = function(uniqueID, options, model) {
		
	// Some CSS stuff (styles are directly injected in the main def below)
	var headerStyles = [
/**@CSSifySlot styleSlotName : RootViewComponentHeader */
		];
	var sectionStyles = [
/**@CSSifySlot styleSlotName : RootViewComponentSection */
		];
	var headerStylesUseCache = {
		use : false,
		nameInCache : 'RootViewComponentHeaderStyles'
	}
	var sectionStylesUseCache = {
		use : false,
		nameInCache : 'RootViewComponentSectionStyles'
	}
	
	var headerDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
			type : 'VaritextButton',
			nodeName : 'header',
			states : [
				{highlighted : undefined}
			],
			props : [
				{headerTitle : undefined}
			],
			reactOnSelf : [
				{
					from : 'headerTitle',
					to : 'content'
				}
			],
			sWrapper : CreateStyle(
					headerStylesUseCache.use ? headerStylesUseCache.nameInCache : null,
					null,
					headerStyles
				).sWrapper
		}, null, 'hostOnly')
	}, null, 'rootOnly');
	
	var sectionDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
			type : 'ComponentWithView',
			nodeName : 'pseudoslot-panel',
			sWrapper : CreateStyle(
					sectionStylesUseCache.use ? sectionStylesUseCache.nameInCache : null,
					null,
					sectionStyles
				).sWrapper
		}, null, 'hostOnly')
	}, null, 'rootOnly');
	
	
	
	return {
		headerDef : headerDef,
		sectionDef : sectionDef
	};
}

module.exports = RootViewComponentSlotsDef;