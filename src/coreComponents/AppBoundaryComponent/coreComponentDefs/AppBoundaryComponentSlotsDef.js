/**
 * @def AppBoundaryComponentSlots
 * @isGroup false
 * 
 * @CSSify styleName : AppBoundaryComponentHeader/false
 * @CSSify styleName : AppBoundaryComponentSection/false
 * @CSSifyTheme themeName : basic-light
 */
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/core/GenericStyleConstructor');


var AppBoundaryComponentSlotsDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */ 		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	
	
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
			]/**@CSSifyStyle componentStyle : AppBoundaryComponentHeader */
		}, null, 'hostOnly')
	}, null, 'rootOnly');
	
	var sectionDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
			type : 'ComponentWithView',
			nodeName : 'pseudoslot-panel'/**@CSSifyStyle componentStyle : AppBoundaryComponentSection */
		}, null, 'hostOnly')
	}, null, 'rootOnly');
	
	
	
	return {
		headerDef : headerDef,
		sectionDef : sectionDef
	};
}

module.exports = AppBoundaryComponentSlotsDef;