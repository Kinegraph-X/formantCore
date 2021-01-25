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
//			type : 'ComponentPickingInput',
			nodeName : 'picking-input',
			props : [
				{accepts : undefined},
				{title : undefined},
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
				type : 'SimpleText',
				nodeName : 'label',
				reactOnParent : [
					{
						from : 'title',
						to : 'content'
					}
				]
			}),
			TypeManager.createComponentDef({
				type : 'VisibleStateComponent',
				nodeName : 'pad-in',
				props : [
					
				]/**@CSSifyStyle componentStyle : ComponentPickingInputButton */
			}),
			TypeManager.createComponentDef({
				type : 'FontSwatchComponent',
				nodeName : 'swatch-section',
//				props : [
//					{accepts : undefined}
//				],
				reactOnParent : [
//					{
//						from : 'accepts',
//						to : 'accepts'
//					},
					{
						from :  'inChannel',
						to : 'updateChannel',
						map : function(val) {return this.adaptDBTypedValue(val);}
					}
				]
			}),
//			TypeManager.createComponentDef({
//				host : TypeManager.createComponentDef({
//					type : 'TypedListBuilderComponent',
//					nodeName : 'section',
//					props : [
//						{accepts : undefined}
//					],
//					reactOnParent : [
//						{
//							from : 'accepts',
//							to : 'accepts'
//						},
//						{
//							from :  'inChannel',
//							cbOnly : true,
//							subscribe : function(value) {
//								var self = this;
//								this.streams.accepts.subscribe(function(val) {
//									console.log(val, self.typedSlots[0].newItem(value), value, self);
//									self.defineHostedComponentDef(val, 1);
//									self.typedSlots[0].push(
//										self.typedSlots[0].newItem(value)
//									);
//								})
////								var type = this.streams.accepts.value;
////								console.log(this.streams, type, value);
////								
////								this.defineHostedComponentDef(type, 1);
//////								this.typedSlots[0].push(
//////									this.typedSlots[0].newItem(value)
//////								);
//							}
//						}
//					]
//				})
//			}, null, 'rootOnly'),
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