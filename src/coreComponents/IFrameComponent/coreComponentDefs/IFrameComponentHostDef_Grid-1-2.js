/**
 * @def IFrameComponent
 * @isGroup false
 * 
 * @CSSify styleName : IFrameComponentHost_Grid-1-2/false
 * @CSSify styleName : IFrameComponentTemplate/false
 * @CSSifyTheme themeName : basic-light
 * 
 */
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var IFrameComponentDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	
	var moduleDef = TypeManager.createComponentDef({
			nodeName : 'iframe',
			attributes : [
				{title : ''}	// IFrames must have a title ()https://dequeuniversity.com/rules/axe/4.4/frame-title?utm_source=lighthouse&utm_medium=devtools)
			]/**@CSSifyStyle componentStyle : IFrameComponentHost_Grid-1-2 */
		});
	
	return moduleDef;
}

module.exports = IFrameComponentDef;