/**
 * @def RootViewComponent
 * @isGroup true
 * 
 * @CSSify styleName : RootViewComponentHost/false
 * @CSSify styleName : RootViewComponentHeader/false
 * @CSSify styleName : RootViewComponentPage/false
 * @CSSifyTheme themeName : basic-light
 * 
 */
const TemplateFactory = require('src/core/TemplateFactory');
const CreateStyle = require('src/core/GenericStyleConstructor');


const rootViewComponentDef = function(options, model) {
	/**@CSSify DEBUG */		// DEBUG must "stick" to the annotation (ie. be RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	var moduleDef = TemplateFactory.createDef({
		host : TemplateFactory.createHostDef({
//			type : 'CompoundCompnent', 				// this is implicit, as we call the CompoundComponent ctor in the ctor
			nodeName : 'app-root'/**@CSSifyStyle componentStyle : RootViewComponentHost */
		}),
		members : [
			TemplateFactory.createDef({
				type : 'ComponentWithView',
				nodeName : 'app-header'/**@CSSifyStyle componentStyle : RootViewComponentHeader */
			}),
			TemplateFactory.createDef({
				type : 'ComponentWithView',
				nodeName : 'app-body'/**@CSSifyStyle componentStyle : RootViewComponentPage */
			})
		]
	});
	
	var minimalModuleDef = TemplateFactory.createDef({
		host : TemplateFactory.createHostDef({
//			type : 'CompoundCompnent', 				// this is implicit, as we call the CompoundComponent ctor in the ctor
			nodeName : 'app-root'/**@CSSifyStyle componentStyle : RootViewComponentHost */
		})
	});
	
	return {
		moduleDef : moduleDef,
		minimalModuleDef : minimalModuleDef
	};
}

module.exports = rootViewComponentDef;