/**
 * Singletons : Registries to cache useful objects in the global scope
 */


/**
 * @typedef {import('./style/StyleIFace.js').default} StyleIFace
 * @typedef {import('./style/Stylesheet.js').default} Stylesheet
 * @typedef {import('./template/TemplateFactory.js').ComponentTemplate} ComponentTemplate
 * @typedef {import('./template/TemplateFactory.js').ViewTemplate} ViewTemplate
 * @typedef {import('./template/TemplateFactory.js').AttributeArray} AttributeArray
 * @typedef {import('./template/TemplateFactory.js').PropArray} PropArray
 * @typedef {import('./template/TemplateFactory.js').StateArray} StateArray
 * @typedef {import('./template/TemplateFactory.js').ReactivityQueryArray} ReactivityQueryArray
 * @typedef {import('./template/TemplateFactory.js').EventSubscriptionArray} EventSubscriptionArray
 * @typedef {import('./template/TemplateFactory').DomEventBindings} DomEventBindings
 * @typedef {import('./DOM/CachedNode.js').default} CachedNode
 * @typedef {import('./view/ComponentView.js').ComponentView} ComponentView
 * @typedef {import('./view/ComponentView.js').RootComponentView} RootComponentView
 * @typedef {import('./reactivity/Stream.js').default<any>} Stream
 * @typedef {import('./component/Component.js').ComponentBase} Component
 * @typedef {import('./Imperative.js').Imperative} Imperative
 * @typedef {import('./style/FontSizeBuffer.js').default} FontSizeBuffer
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


// /**
//  * Hacked type-checker: forcing return type to be not-null
//  */
// /**
//  * @template T
//  */
// class UnSafeMap {
// 	/** @type {Map<keyof T, T[keyof T]>} */ 
//     map = new Map();
// 	/** @param {keyof T} key @returns {T[keyof T]*/
//     get(key) {return ( /**@type {T[keyof T]}*/ (this.map.get(key)))};
// 	/** @param {keyof T} key @param {T[keyof T]} value @returns void*/
//     set(key, value) {this.map.set(key, value)};
// }

// /**
//  * Hacked type-checker: typing Object<string, value> preserves type-inference
//  * and disables "potentially undefined when accessing unknown keys"
//  */
// export default {
// 	/** @type {UnSafeMap<Object<string, AbstractPropArray>>} */
// 	attribute : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, AbstractPropArray>>} */
// 	state : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, AbstractPropArray>>} */
// 	prop: new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, ReactivityQueryArray>>} */
// 	reactOnParent : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, ReactivityQueryArray>>} */
// 	reactOnSelf : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, EventSubscriptionArray>>} */
// 	subscribeOnParent : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, EventSubscriptionArray>>} */
// 	subscribeOnChild : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, EventSubscriptionArray>>} */
// 	subscribeOnSelf : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, DomEventBindings|null>>} */
// 	domListens : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, ComponentTemplate>>} */
// 	componentTemplate : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, Stylesheet>>} */
// 	sWrapper : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, Component>>} */
// 	component : new UnSafeMap(),
// 	/** @type {(ComponentView)[]} */
// 	views : [],
// 	/** @type {UnSafeMap<Object<string, Map<string, Stream>>>} */
// 	streams : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, Map<string, Imperative>>>} */
// 	imperatives : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, CachedNode>>} */
// 	node : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, DOMRect>>} */
// 	boundingBox : new UnSafeMap(),
// 	// /** @type {UnSafeMap<Object<string, NaiveDomNode>>} */
// 	// naiveElement : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, Stylesheet>>} */
// 	style : new UnSafeMap(),
// 	// /** @type {UnSafeMap<Object<string, LayoutNode>>} */
// 	// layoutNode : new UnSafeMap(),
// 	// /** @type {UnSafeMap<Object<string, textLayoutNode>>} */
// 	// textLayoutNode : new UnSafeMap(),
// 	// /** @type {UnSafeMap<Object<string, Shape>>} */
// 	// rasterShape : new UnSafeMap(),
// 	// /** @type {UnSafeMap<Object<string, FlexCtx>>} */
// 	// flexCtx : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, function>>} */
// 	layoutCallback : new UnSafeMap(),
// 	/** @type {UnSafeMap<Object<string, FontSizeBuffer>>} */
// 	fontSizeBuffer : new UnSafeMap(),
// };


export default {
	/** @type {Map<string, AttributeArray>} */
	attribute : new Map(),
	/** @type {Map<string, StateArray>} */
	state : new Map(),
	/** @type {Map<string, PropArray>} */
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
	/** @type {Map<string, Component>} */
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
	// /** @type {Map<string, NaiveDomNode>} */
	// naiveElement : new Map(),
	/** @type {Map<string, StyleIFace>} */
	style : new Map(),
	// /** @type {Map<string, LayoutNode>} */
	// layoutNode : new Map(),
	// /** @type {Map<string, textLayoutNode>} */
	// textLayoutNode : new Map(),
	// /** @type {Map<string, Shape>} */
	// rasterShape : new Map(),
	// /** @type {Map<string, FlexCtx>} */
	// flexCtx : new Map(),
	/** @type {Map<string, function>} */
	layoutCallback : new Map(),
	/** @type {Map<string, FontSizeBuffer>} */
	fontSizeBuffer : new Map(),
};