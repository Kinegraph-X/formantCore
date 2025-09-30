/**
 * Singletons : Registries to cache useful objects in the global scope
 */

/**
 * @typedef {import('./style/Stylesheet.js')} Stylesheet
 * @typedef {import('./template/TemplateFactory.js').ComponentTemplate} ComponentTemplate
 * @typedef {import('./template/TemplateFactory.js').ViewTemplate} ViewTemplate
 * @typedef {import('./template/TemplateFactory.js').AbstractPropArray} AbstractPropArray
 * @typedef {import('./template/TemplateFactory.js').ReactivityQueryArray} ReactivityQueryArray
 * @typedef {import('./template/TemplateFactory.js').EventSubscriptionArray} EventSubscriptionArray
 * @typedef {import('./component/TemplateReconcilier').DomEventBindings} DomEventBindings
 * @typedef {import('./DOM/CachedNode.js')} CachedNode
 * @typedef {import('./view/ComponentView.js').ComponentView} ComponentView
 * @typedef {import('./view/ComponentView.js').RootComponentView} RootComponentView
 * @typedef {import('./reactivity/Stream.js').Stream<any>} Stream
 * @typedef {import('./component/Component.js').ComponentWithView} ComponentWithView
 * @typedef {import('./Imperative.js').Imperative} Imperative
 * typedef {import('./reactivity/StreamCtxProvider.js').StreamCtxProvider} StreamCtxProvider;
*/


/**
 * PROPS CACHES : for performance concerns, allows retrieving a prop on the def from anywhere
 * 		Usefull when instanciating components from a list, as reactivity doesn't change through iterations.
 * 
 * 		Internal workflow of the framework :
 * 			- first ensure the def is complete, and store constants : 
 * 				- the "reactivity" register stores reactivity queries
 * 				- the "nodes" register stores DOM attributes : relation are uniques, each ID from the def is bound to an attributes-list 
 * 						=> fill the "nodes" register ( {ID : {nodeName : nodeName, attributes : attributes, cloneMother : DOMNode -but not yet-} )
 * 			- then compose components, creating streams and views
 * 				- create static views without instanciating the DOM objects : parentView of the view is either a "View" or a "ChildView"
 * 						=> assign parentView
 * 						=> fill the "views" register ( {ID : [view] } )
 * 					- instanciate streams : if it has streams, it's a host
 * 						=> fill the "hosts" register ( {ref : Component} ) // alternatively, the "definitionRegister" already holds all "Components"
 * 				- on composition :
 * 					- handle reactivity and event subscription : each component as a "unique ID from the def" => retrieve queries from the "reactivity" register
 * 			- then instanciate DOM objects through cloning : DOM attributes are always static
 * 					=> iterate on the "views" register
 * 			- then get back to hosts elem : they're in the "hosts" register
 * 					- accessing to the component's view, decorate DOM Objects with :
 * 						- streams
 * 						- reflexive props
 * 					- assign reflectedObj to streams
 * 			- finally reflect streams on the model
 */


export default {
	/** @type {Map<string, AbstractPropArray>} */
	attribute : new Map(),
	/** @type {Map<string, AbstractPropArray>} */
	state : new Map(),
	/** @type {Map<string, AbstractPropArray>} */
	prop: new Map(),
	/** @type {Map<string, ReactivityQueryArray>} */
	reactOnParent : new Map(),
	/** @type {Map<string, ReactivityQueryArray>} */
	reactOnSelf : new Map(),
	/** @type {Map<string, EventSubscriptionArray>} */
	subscribeOnParent : new Map(),
	/** @type {Map<string, EventSubscriptionArray>} */
	subscribeOnChild : new Map(),
	/** @type {Map<string, EventSubscriptionArray>} */
	subscribeOnSelf : new Map(),
	/** @type {Map<string, DomEventBindings|null>} */
	domListens : new Map(),
	/** @type {Map<string, ComponentTemplate>} */
	componentTemplate : new Map(),
	/** @type {Map<string, Stylesheet>} */
	sWrapper : new Map(),
	/** @type {Map<string, ComponentWithView>} */
	component : new Map(),
	/** @type {(ComponentView)[]} */
	views : [],
	/** @type {Map<string, Map<string, Stream>>} */
	streams : new Map(),
	/** @type {Map<string, Map<string, Imperative>>} */
	imperatives : new Map(),
	/** @type {Map<string, CachedNode>} */
	node : new Map(),
	/** @type {Map<string, DOMRect>} */
	boundingBox : new Map(),
	/** @type {Map<string, NaiveDomNode>} */
	naiveElement : new Map(),
	/** @type {Map<string, Style>} */
	style : new Map(),
	/** @type {Map<string, LayoutNode>} */
	layoutNode : new Map(),
	/** @type {Map<string, textLayoutNode>} */
	textLayoutNode : new Map(),
	/** @type {Map<string, Shape>} */
	rasterShape : new Map(),
	/** @type {Map<string, FlexCtx>} */
	flexCtx : new Map(),
	/** @type {Map<string, function>} */
	layoutCallback : new Map(),
	/** @type {Map<string, FontSizeBuffer>} */
	fontSizeBuffer : new Map(),
};