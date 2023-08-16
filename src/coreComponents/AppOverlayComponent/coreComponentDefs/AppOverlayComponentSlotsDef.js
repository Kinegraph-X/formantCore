/**
 * @def AppOverlayComponentSlots
 * @isGroup false
 * 
 * @CSSify styleName : AppOverlayComponentHeader/false
 * @CSSify styleName : AppOverlayComponentSection/false
 * @CSSifyTheme themeName : basic-light
 */
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/core/GenericStyleConstructor');


var AppOverlayComponentSlotsDef = function(uniqueID, options, model) {
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
			]/**@CSSifyStyle componentStyle : AppOverlayComponentHeader */
		}, null, 'hostOnly')
	}, null, 'rootOnly');
	
	var sectionDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
			type : 'ComponentWithView',
			nodeName : 'pseudoslot-panel'/**@CSSifyStyle componentStyle : AppOverlayComponentSection */
		}, null, 'hostOnly')
	}, null, 'rootOnly');
	
	
	
	return {
		headerDef : headerDef,
		sectionDef : sectionDef
	};
}

module.exports = AppOverlayComponentSlotsDef;