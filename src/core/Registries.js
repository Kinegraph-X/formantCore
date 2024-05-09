/**
 * @Singletons : Registries to cache useful objects in the global scope
 */

const PropertyCache = require('src/core/PropertyCache').ObjectCache;
const RequestCache = require('src/core/PropertyCache').RequestCache;
const StateMachineCache = require('src/core/PropertyCache').StateMachineCache;
const stateMachineCache = new StateMachineCache('stateMachineCache');

var exportedObjects = {};

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

/**
 * @constructor ComponentDefCache
 * 
 */
var ComponentDefCache = function() {
	this.knownIDs = {};
	this.randomUID = 0;
}
ComponentDefCache.prototype = {};
ComponentDefCache.prototype.getUID = function(uniqueID) {
	if (uniqueID in this.knownIDs)
		return this.knownIDs[uniqueID];
	else if (!(uniqueID in this.knownIDs) || !uniqueID || !uniqueID.length) {
		uniqueID = uniqueID ? uniqueID : (this.randomUID++).toString();
		this.knownIDs[uniqueID] = uniqueID;
		return this.knownIDs[uniqueID];
	}
}

ComponentDefCache.prototype.isKnownUID = function(uniqueID) {
	return this.getUID(uniqueID);
}

ComponentDefCache.prototype.setUID = function(uniqueID, globalObj) {
	return (this.knownIDs[uniqueID] = globalObj);
}

/**
 * CORE CACHES
 */
/** Duplicated code from Template Factory (otherwise we would cause an include loop) */
var propsAreArray = [
	'attributes',
	'states',
	'props',
	'streams',
	'reactOnParent',
	'reactOnSelf',
	'subscribeOnParent',
	'subscribeOnChild',
	'subscribeOnSelf'//,
//	'keyboardSettings',			// TODO: FIX that bypass : implement keyboard handling in the context of the v0.2
//	'keyboardEvents'
];
var caches = {};
(function initCaches() {
	propsAreArray.forEach(function(prop) {
		caches[prop] = new PropertyCache(prop);
	});
})();

var hostsDefinitionsCacheRegistry = new PropertyCache('hostsDefinitionsCacheRegistry');
var listsDefinitionsCacheRegistry = new PropertyCache('listsDefinitionsCacheRegistry');
var permanentProvidersRegistry = new RequestCache('permanentProvidersRegistry');
var boundingBoxesCache = new PropertyCache('boundingBoxesCache');

// MAYBE TODO: this cache is used by the RichComponenentInternalsPicker, 
// to resolve the sWrapper associated with a component out of its UID (? to be confirmed/precised), but
// we also need a MasterStyleCache, to store each CSS rule at global level,
// and resolve the binding between a matched rules and a (pseudo-)DOM node, from any outer scope.
// 		=> could we enhance this cache so it would allow to retrieve a whole sWrapper
//		al well as a single CSS rule, in order -not- to duplicate the caches used for CSS ?
// 	=> think of that deeply, and validate any choice regarding performances.
var sWrappersCache = new PropertyCache('sWrappersCache');

var typedHostsRegistry = new PropertyCache('typedHostsRegistry');

/**
 * @typedCache {CachedNode} {UID : {nodeName : nodeName, isCustomElem : isCustomElem, cloneMother : DOMNode -but not yet-}}
 */
var nodesRegistry = new PropertyCache('nodesRegistry');

/**
 * @typedStore {StoredView} {UID : view}
 */
var viewsRegistry = [];

/**
 * @typedStore {StoredAssocWithModel} {UID : keyOnModel}
 */
var dataStoreRegistry = new PropertyCache('dataStoreRegistry');

/**
 * @typedStore {StoredStyleIFace} {UID : UID_OfTheOpitimizedSelectorBuffer}
 */
var masterStyleRegistry = new PropertyCache('masterStyleRegistry');

/**
 * @typedStore {StoredStyleIFace} {UID : UID_OfTheViewIdentifiedAsNeedingUpdate}
 */
var pendingStyleRegistry = new PropertyCache('pendingStyleRegistry');

/**
 * @typedStore {StoredStyleIFace} {UID : UID_OfTheViewIdentifiedAsNeedingUpdate}
 */
var UApendingStyleRegistry = new PropertyCache('UApendingStyleRegistry');

/**
 * @typedStore {StoredNodeFromNaiveDOM} {UID : nodeUID}
 */
var naiveDOMRegistry = new PropertyCache('naiveDOMRegistry');

/**
 * @typedStore {StoredLayoutNode} {UID : nodeUID}
 */
var layoutNodesRegistry = new PropertyCache('layoutNodesRegistry');

/**
 * @typedStore {StoredTextNode} {UID : nodeUID}
 */
var textNodesRegistry = new PropertyCache('textNodesRegistry');

/**
 * @typedStore {StoredRasterShape} {UID : nodeUID}
 */
var rasterShapesRegistry = new PropertyCache('rasterShapesRegistry');

/**
 * @typedStore {StoredFlexCtx} {UID : nodeUID}
 */
var flexCtxRegistry = new PropertyCache('flexCtxRegistry');

/**
 * @typedStore {StoredLayoutCallback} {UID : nodeUID}
 */
var layoutCallbacksRegistry = new PropertyCache('layoutCallbacksRegistry');

/**
 * @typedStore {FontSizeCache} {UID : nodeUID}
 */
var fontSizeBuffersCache = new PropertyCache('fontSizeBuffersCache');





/**
 * @aliases
 */
Object.assign(exportedObjects, {
	PropertyCache : PropertyCache,
	hostsDefinitionsCacheRegistry : hostsDefinitionsCacheRegistry,	// Object PropertyCache
	listsDefinitionsCacheRegistry : listsDefinitionsCacheRegistry,	// Object PropertyCache
	permanentProvidersRegistry : permanentProvidersRegistry,		// Object RequestCache
	boundingBoxesCache : boundingBoxesCache,						// Object PropertyCache
	stateMachineCache : stateMachineCache,							// Object PropertyCache
	sWrappersCache : sWrappersCache,								// Object PropertyCache
	typedHostsRegistry : typedHostsRegistry,						// Object PropertyCache {defUID : [Components]}
	naiveDOMRegistry : naiveDOMRegistry,							// Object PropertyCache
	masterStyleRegistry : masterStyleRegistry,						// Object PropertyCache
	UApendingStyleRegistry : UApendingStyleRegistry,				// Object PropertyCache
	pendingStyleRegistry : pendingStyleRegistry,					// Object PropertyCache
	rasterShapesRegistry : rasterShapesRegistry,					// Object PropertyCache
	layoutNodesRegistry :layoutNodesRegistry,						// Object PropertyCache
	textNodesRegistry : textNodesRegistry,							// Object PropertyCache
	flexCtxRegistry : flexCtxRegistry,								// Object PropertyCache
	layoutCallbacksRegistry : layoutCallbacksRegistry,				// Object PropertyCache
	fontSizeBuffersCache : fontSizeBuffersCache,					// Object PropertyCache
	caches : caches,												// Object {prop : PropertyCache}
	nodesRegistry : nodesRegistry,									// Object PropertyCache
	viewsRegistry : viewsRegistry,									// Object PropertyCache
	dataStoreRegistry : dataStoreRegistry,							// Object PropertyCache
	definitionsCache : new ComponentDefCache(),						// Object ComponentDefCache
});
	
	
	
	
	
	
	
	
module.exports = exportedObjects;