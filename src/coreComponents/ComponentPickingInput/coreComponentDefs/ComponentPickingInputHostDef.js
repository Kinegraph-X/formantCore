/**
 * @def ComponentPickingInput
 * @isGroup true
 * 
 * @CSSify styleName : ComponentPickingInputHost/false
 * @CSSify styleName : ComponentPickingInputButton/false
 * @CSSifyTheme themeName : basic-light
 * 
 */
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var ComponentPickingInputDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// DEBUG must be stuck (RED and bold) to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	
	var moduleDef = TypeManager.createComponentDef({
		host : TypeManager.createComponentDef({
//			type : 'ComponentWithView',
			nodeName : 'picking-input',
			props : [
				{inChannel : undefined},
				{outChannel : undefined}
			],
			states : [],
			subscribeOnChild : [
				{
					on : 'update',
					subscribe : function(e) {
						if (e.bubble)
							this.trigger('update', e.data, true);
					}
				}
			]/**@CSSifyStyle componentStyle : ComponentPickingInputHost */
		}),
		members : [
			TypeManager.createComponentDef({
				type : 'VisibleStateComponent',
				nodeName : 'label',
				props : [
					
				]
			}),
			TypeManager.createComponentDef({
				type : 'VisibleStateComponent',
				nodeName : 'pad-in',
				props : [
					
				]/**@CSSifyStyle componentStyle : ComponentPickingInputButton */
			}),
			TypeManager.createComponentDef({
				type : 'TypedListBuilderComponent',
				nodeName : 'section',
				props : [
					{accepts : undefined}
				],
				reactOnParent : [
					{
						from : 'accepts',
						to : 'accepts'
					},
					{
						from :  'inChannel',
						cbOnly : true,
						subscribe : function(value) {
							var type = this.streams.accepts.value;
							this.defineHostedComponentDef(type, 1);
							this.typedHosts[0].push(
								this.typedHosts[0].newItem(value)
							) 
						}
					}
				]
			}),
			TypeManager.createComponentDef({
				type : 'VisibleStateComponent',
				nodeName : 'pad-out',
				props : [
					
				]/**@CSSifyStyle componentStyle : ComponentPickingInputButton */
			}),
		]
	}, null, 'rootOnly');
	
	
	return moduleDef;
}

module.exports = ComponentPickingInputDef;