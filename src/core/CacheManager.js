/**
 * @Singletons : Core Object store
 */
//var appConstants = require('src/appLauncher/appLauncher')(factoryGlobalContext).getInstance();
var exports = {};

/**
 * @constructor ValueObject
 */
var ValueObject = function(defObj, isSpecial) {this.init(); this.set.apply(this, arguments);};
ValueObject.prototype.objectType = 'ValueObject';
exports.ValueObject = ValueObject;
Object.defineProperty(ValueObject.prototype, 'model', {value : null});			// virtual
Object.defineProperty(ValueObject.prototype, 'get',{
	value : function() {}
});
Object.defineProperty(ValueObject.prototype, 'getGroupHostDef',{
	value : function() {return (this.host && this.host.host);}
});
Object.defineProperty(ValueObject.prototype, 'getHostDef',{
	value : function() {return this.host;}
});
Object.defineProperty(ValueObject.prototype, 'getType',{
	value : function() {return this.type;}
});
Object.defineProperty(ValueObject.prototype, 'init',{
	value : function() {
//		if (!this.isEmpty(this.model))
			Object.assign(this, this.model);
	}
});
Object.defineProperty(ValueObject.prototype, 'fromArray',{
	value : function(arr) {
		var i = 0;
		for (let p in this.model) {
			this[p] = arr[i++];
		}
	}
});
Object.defineProperty(ValueObject.prototype, 'isEmpty', {
	value : function(obj) {
		for(var prop in obj) {
				return false;
		};
		return true;
	}
});
Object.defineProperty(ValueObject.prototype, 'set', {
	value : function(def, isSpecial) {
		
//		if (Object.getPrototypeOf(this).objectType === 'MComponentDef')
//			console.log(Object.getPrototypeOf(this).objectType, def);
		
//		if (Object.getPrototypeOf(this).objectType === 'AttributesList')
//		console.log(Object.getPrototypeOf(this).objectType, def);
		var objectType = Object.getPrototypeOf(this).objectType;
//		this.init();
		for (let p in def) {
//			console.log(p);
//			if (typeof this[p] === 'undefined' && objectType !== 'States' && objectType !== 'Props')
//				this.model[p] = null;
			
			const n = p.slice(0, 1).toUpperCase() + p.slice(1) + 'Model';
			
			if (isSpecial !== 'noLog' && isSpecial !== 'isQuery' && isSpecial !== 'isSubscription')
				console.log(p, isSpecial);
			
			if (isSpecial === 'hostOnly' && p === 'host' && !def[p].host)
				this[p] = new SingleLevelComponentDefModel(def[p], 'noLog');
			else if (isSpecial === 'rootOnly')
				this[p] = def[p];
			else if (n in exports) {
				if (Array.isArray(def[p])) {
					this[p] = [];
					for(let i = 0, l = def[p].length; i < l; i++) {
						this[p].push(new exports[n](def[p][i], isSpecial));
					}
				}
				else if (def[p] && def[p].host)
					this[p] = new HierarchicalComponentDefModel(def[p], isSpecial);
				else if (def[p] && def[p].type === 'ComponentList')
					this[p] = new ComponentListDefModel(def[p], isSpecial);
				else if (def[p] !== null) {
					this[p] = new exports[n](def[p], isSpecial);
//					if (n === 'AttributesModel')
//						console.log(Object.getPrototypeOf(this).objectType, p, this[p]);
				}
			}
			else if (isSpecial === 'isQuery')
				this[p] = new ReactivityQueryModel(def[p]);
			else if (isSpecial === 'isSubscription')
				this[p] = new EventSubscriptionModel(def[p]);
			else
				this[p] = def[p];
		}
//		console.log(this, isSpecial);
	}
});



/**
 * @constructor AttributesListModel
 * @extends ValueObject
 */
var AttributesListModel = function(defObj) {ValueObject.apply(this, arguments);};
AttributesListModel.prototype = Object.create(ValueObject.prototype);
exports.AttributesListModel = AttributesListModel
Object.defineProperty(AttributesListModel.prototype, 'objectType', {value :  'AttributesList'});
Object.defineProperty(AttributesListModel.prototype, 'model', {value :  {
	id : null,								// String
	title : null							// String
}});


/**
 * @constructor OptionsListModel
 * @extends ValueObject
 */
var OptionsListModel = function(defObj) {ValueObject.apply(this, arguments)};
OptionsListModel.prototype = Object.create(ValueObject.prototype);
exports.OptionsListModel = OptionsListModel
Object.defineProperty(OptionsListModel.prototype, 'objectType', {value :  'AttributesList'});
Object.defineProperty(OptionsListModel.prototype, 'model', {value :  {

}});


/**
 * @constructor KeyboardHotkeysModel
 * @extends ValueObject
 */
var KeyboardHotkeysModel = function(defObj) {ValueObject.apply(this, arguments)};
KeyboardHotkeysModel.prototype = Object.create(ValueObject.prototype);
exports.KeyboardHotkeysModel = KeyboardHotkeysModel;
Object.defineProperty(KeyboardHotkeysModel.prototype, 'objectType', {value : 'KeyboardHotkeys'});
Object.defineProperty(KeyboardHotkeysModel.prototype, 'model', {value : {
	ctrlKey : false,						// Boolean
	shiftKey : false,						// Boolean
	altKey : false,							// Boolean
	keyCode : 0								// Number
}});


/**
 * @constructor StatesModel
 * @extends ValueObject
 */
var StatesModel = function(defObj) {ValueObject.apply(this, arguments)};
StatesModel.prototype = Object.create(ValueObject.prototype);
exports.StatesModel = StatesModel;
Object.defineProperty(StatesModel.prototype, 'objectType', {value : 'States'});
Object.defineProperty(StatesModel.prototype, 'model', {value :  {

}});

/**
 * @constructor PropsModel
 * @extends ValueObject
 */
var PropsModel = function(defObj) {ValueObject.apply(this, arguments)};
PropsModel.prototype = Object.create(ValueObject.prototype);
exports.PropsModel = PropsModel;
Object.defineProperty(PropsModel.prototype, 'objectType', {value : 'Props'});
Object.defineProperty(PropsModel.prototype, 'model', {value :  {

}});



/**
 * @constructor ReactivityQueriesList
 * @extends ValueObject
 */
var ReactivityQueriesListModel = function(defObj) {ValueObject.call(this, defObj, 'isQuery')};
ReactivityQueriesListModel.prototype = Object.create(ValueObject.prototype);
exports.ReactivityQueriesListModel = ReactivityQueriesListModel;
Object.defineProperty(ReactivityQueriesListModel.prototype, 'objectType', {value : 'ReactivityQueriesList'});
Object.defineProperty(ReactivityQueriesListModel.prototype, 'model', {value :  {}});

/**
 * @constructor ReactivityQuery
 * @extends ValueObject
 */
var ReactivityQueryModel = function(defObj) {ValueObject.apply(this, arguments)};
ReactivityQueryModel.prototype = Object.create(ValueObject.prototype);
exports.ReactivityQueryModel = ReactivityQueryModel;
Object.defineProperty(ReactivityQueryModel.prototype, 'objectType', {value : 'ReactivityQuery'});
Object.defineProperty(ReactivityQueryModel.prototype, 'model', {value :  {
	from : null,							// String
	obj : null,								// Object [HTMLElement, Stream]
	filter : null,							// function (GlorifiedPureFunction ;)
	map : null,								// function (GlorifiedPureFunction ;)
	subscribe : null						// function CallBack
}});

/**
 * @constructor EventSubscriptionsList
 * @extends ValueObject
 */
var EventSubscriptionsListModel = function(defObj) {ValueObject.call(this, defObj, 'isSubscription')};
EventSubscriptionsListModel.prototype = Object.create(ValueObject.prototype);
exports.EventSubscriptionsListModel = EventSubscriptionsListModel;
Object.defineProperty(EventSubscriptionsListModel.prototype, 'objectType', {value : 'EventSubscriptionsList'});
Object.defineProperty(EventSubscriptionsListModel.prototype, 'model', {value :  {}});

/**
 * @constructor EventSubscription
 * @extends ValueObject
 */
var EventSubscriptionModel = function(defObj) {ValueObject.apply(this, arguments)};
EventSubscriptionModel.prototype = Object.create(ValueObject.prototype);
exports.EventSubscriptionModel = EventSubscriptionModel;
Object.defineProperty(EventSubscriptionModel.prototype, 'objectType', {value : 'EventSubscription'});
Object.defineProperty(EventSubscriptionModel.prototype, 'model', {value :  {
	subscribe : null						// function CallBack
}});








/**
 * @constructor SingleLevelComponentDefModel
 * @extends ValueObject
 */
var SingleLevelComponentDefModel = function(initObj, isSpecial) {
	// shorthand to create defs with just a "type", maybe an attributesList, but only the first props in the model
	if (initObj !== 'bare') {
		this.init();
		this.set(initObj, isSpecial);
	}
	else if (initObj === 'bare')
		this.init();
};
SingleLevelComponentDefModel.prototype = Object.create(ValueObject.prototype);
exports.SingleLevelComponentDefModel = SingleLevelComponentDefModel;
Object.defineProperty(SingleLevelComponentDefModel.prototype, 'objectType', {value : 'SComponentDef'});
Object.defineProperty(SingleLevelComponentDefModel.prototype, 'model', {
	value : {
		type : null,							// String
		nodeName : null,						// String
		attributes : null,						// Object AttributesList
		parentNodeIndex : null,					// Number
		targetSlotIndex : null,					// Number
		sWrapper : null,						// Object StylesheetWrapper
		states : null,							// Object States
		props : null,							// Object Props
		command : null,							// Object Command
		reactOnParent : null,					// Object ReactivityQuery
		reactOnSelf : null,						// Object ReactivityQuery
		subscribeOnParent : null,				// Object ReactivityQuery
		subscribeOnChild : null,				// Object ReactivityQuery
		keyboardSettings : null					// Object KeyboardHotkeys
	}
});


/**
 * @constructor HierarchicalComponentDefModel
 * @extends ValueObject
 */
var HierarchicalComponentDefModel = function(defObj, isSpecial) {ValueObject.apply(this, arguments);};
HierarchicalComponentDefModel.prototype = Object.create(ValueObject.prototype);
exports.HierarchicalComponentDefModel = HierarchicalComponentDefModel;
Object.defineProperty(HierarchicalComponentDefModel.prototype, 'objectType', {value : 'MComponentDef'});
Object.defineProperty(HierarchicalComponentDefModel.prototype, 'model', {value : {
	host : null,							// Object SingleLevelComponentDef
	subSections : null,						// Array [SingleLevelComponentDef]
	members : null,							// Array [SingleLevelComponentDef]
	lists : null,							// Array [ComponentListDef]
	options : null							// Object : plain
}});
HierarchicalComponentDefModel.prototype.set = SingleLevelComponentDefModel.prototype.set;


/**
 * @constructor ComponentListDef
 * @extends ValueObject
 */
var ComponentListDefModel = function(defObj) {ValueObject.apply(this, arguments)};
ComponentListDefModel.prototype = Object.create(ValueObject.prototype);
exports.ComponentListDefModel = ComponentListDefModel;
Object.defineProperty(ComponentListDefModel.prototype, 'objectType', {value : 'ComponentListDef'});
Object.defineProperty(ComponentListDefModel.prototype, 'model', {value :  {
	type : 'ComponentList',					// String
	reflectOnModel : null,					// Boolean
	each : null,							// Array [unknown_type] (model to iterate on)
	template : null,						// Object HierarchicalComponentDef
	section : null,							// Number
}});




/**
 * @constructor ComponentDefCache
 * 
 */
var ComponentDefCache = function() {
	this.knownIDs = {};
//	this.UIDPrefix = appConstants.options.UIDPrefix;
}
ComponentDefCache.prototype = {};
ComponentDefCache.prototype.getUID = function(uniqueID) {
	if ((this.UIDPrefix + uniqueID) in this.knownIDs) {
//		console.log(uniqueID, this.knownIDs);
		return this.knownIDs[this.UIDPrefix + uniqueID];
	}
	else if (!((this.UIDPrefix + uniqueID) in this.knownIDs) || !uniqueID || !uniqueID.length) {
		uniqueID = uniqueID ? (this.UIDPrefix + uniqueID) : (this.UIDPrefix + ($.guid++).toString());
		this.knownIDs[uniqueID] = uniqueID;
		return this.knownIDs[uniqueID];
	}
	else if (uniqueID in this.knownIDs) // Hacky : this.knownIDs.hasOwnProperty('') won't ever return truthy
		return this.knownIDs[uniqueID];
}

ComponentDefCache.prototype.isKnownUID = function(uniqueID) {
	return this.getUID(uniqueID);
}

ComponentDefCache.prototype.setUID = function(uniqueID, globalObj) {
	return (this.knownIDs[uniqueID] = globalObj);
}






/**
 * @constructor ComponentDefModel
 * @extends ValueObject
 */
var createComponentDef = function(defObj, useCache, isSpecial) {
	var def, UID;

	if (useCache) {
		UID = exports.definitionsCache.isKnownUID(useCache);
	}
	
	if (!UID || typeof UID === 'string') {
		// shorthand to create defs with just a "type", maybe an attributesList, but only the first props in the model...
		if (typeof defObj === 'string') {
			var c = new SingleLevelComponentDefModel('bare');
			ValueObject.prototype.fromArray.call(c, arguments);
			def = new HierarchicalComponentDefModel({host : c}, isSpecial);
		}
		if (typeof defObj === 'object' && defObj.host)
			def = new HierarchicalComponentDefModel(defObj, isSpecial);
		if (typeof defObj === 'object' && defObj.type === 'ComponentList')
			def = new HierarchicalComponentDefModel({host : new ComponentListDefModel(defObj, isSpecial)}, isSpecial);
		else if (typeof defObj === 'object' && defObj.nodeName || defObj.type || (defObj.attributes || defObj.states || defObj.props))
			def = new HierarchicalComponentDefModel({host : new SingleLevelComponentDefModel(defObj, isSpecial)}, isSpecial);
	}
//	console.log(def);
	if (typeof UID === 'string')
		return exports.definitionsCache.setUID(UID, def);
	else if (typeof UID !== 'undefined')
		return UID;
	else
		return def;
};
exports.createComponentDef = createComponentDef;

/**
 * @aliases
 */
Object.assign(exports, {
	definitionsCache : new ComponentDefCache(),
	AttributesModel : AttributesListModel,							// Object AttributesList
	OptionsModel : OptionsListModel,								// Object OptionsList
	// "host" key catch the special condition and should always be flat ("artificial" deepening of flat defs is handled in the factory function)
	HostModel : SingleLevelComponentDefModel,						// Object SingleLevelComponentDef
	// "numericaly indexed" keys (in an array) catch the HierarchicalComponentDefModel
	SubSectionsModel : HierarchicalComponentDefModel,				// Array [HierarchicalComponentDefModel]
	MembersModel : HierarchicalComponentDefModel,					// Array [HierarchicalComponentDefModel]
	ReactOnParentModel : ReactivityQueriesListModel,				// Object ReactivityQueryList
	ReactOnSelfModel : ReactivityQueriesListModel,					// Object ReactivityQueryList
	SubscribeOnParentModel : EventSubscriptionsListModel,			// Object EventSubscriptionsList
	SubscribeOnChildModel : EventSubscriptionsListModel,			// Object EventSubscriptionsList
	createSimpleComponentDef : HierarchicalComponentDefModel		// Object HierarchicalComponentDef
});
module.exports = exports;