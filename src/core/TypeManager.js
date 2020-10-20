/**
 * @Singletons : Core Object store
 */
//var appConstants = require('src/appLauncher/appLauncher')(factoryGlobalContext).getInstance();
var exports = {};

/**
 * @constructor ValueObject
 */
var ValueObject = function(defObj, isSpecial) {
//	this.init();
	this.set.apply(this, arguments);
}
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
		var objectType = Object.getPrototypeOf(this).objectType;

		for (let p in def) {
//			if (typeof this[p] === 'undefined' && objectType !== 'States' && objectType !== 'Props')
//				this.model[p] = null;

			if (isSpecial === 'hostOnly') {
				if (p === 'host' && !def[p].host)
					this[p] = new SingleLevelComponentDefModel(def[p]);
			}
			else if (isSpecial === 'rootOnly')
				this[p] = def[p];
			else if (isSpecial === 'isQuery')
				this[p] = new ReactivityQueryModel(def[p]);
			else if (isSpecial === 'isSubscription')
				this[p] = new EventSubscriptionModel(def[p]);
			else {
				const n = p + 'Model';
				if (n in exports) {
					if (Array.isArray(def[p])) {
//						this[p] = [];
						for(let i = 0, l = def[p].length; i < l; i++) {
							this[p].push(new exports[n](def[p][i], isSpecial));
						}
					}
					else if (def[p] && def[p].host)
						this[p] = new HierarchicalComponentDefModel(def[p], isSpecial);
					else if (def[p] && def[p].type === 'ComponentList')
						this[p] = new ComponentListDefModel(def[p], isSpecial);
					else if (def[p] !== null)
						this[p] = new exports[n](def[p], isSpecial);
				}
				else
					this[p] = def[p];
			}
		}
	}
});



/**
 * @constructor OptionsListModel
 * @extends ValueObject
 */
var OptionsListModel = function() {
//	Object.assign(this, {});
	ValueObject.apply(this, arguments);
}
OptionsListModel.prototype = Object.create(ValueObject.prototype);
exports.OptionsListModel = OptionsListModel
Object.defineProperty(OptionsListModel.prototype, 'objectType', {value :  'AttributesList'});


/**
 * @constructor KeyboardHotkeysModel
 * @extends ValueObject
 */
var KeyboardHotkeysModel = function() {
	Object.assign(this, {
		ctrlKey : false,						// Boolean
		shiftKey : false,						// Boolean
		altKey : false,							// Boolean
		keyCode : 0								// Number
	});
	ValueObject.apply(this, arguments);
};
KeyboardHotkeysModel.prototype = Object.create(ValueObject.prototype);
exports.KeyboardHotkeysModel = KeyboardHotkeysModel;
Object.defineProperty(KeyboardHotkeysModel.prototype, 'objectType', {value : 'KeyboardHotkeys'});






/**
 * @constructor AttributeModel
 * @extends ValueObject
 */
var AttributeModel = function(obj) {
	var model, key = Object.keys(obj)[0];;
	if (model = dictionary.solveFromDictionary('attributes', key))
		Object.assign(this, model);
	this[key] = obj[key];
}
AttributeModel.prototype = Object.create(ValueObject.prototype);
exports.AttributeModel = AttributeModel
Object.defineProperty(AttributeModel.prototype, 'objectType', {value :  'Attribute'});


/**
 * @constructor StateModel
 * @extends ValueObject
 */
var StateModel = function(obj) {
	var model, key = Object.keys(obj)[0];;
	if (model = dictionary.solveFromDictionary('states', key))
		Object.assign(this, model);
	this[key] = obj[key];
};
StateModel.prototype = Object.create(ValueObject.prototype);
exports.StateModel = StateModel;
Object.defineProperty(StateModel.prototype, 'objectType', {value : 'States'});


/**
 * @constructor PropModel
 * @extends ValueObject
 */
var PropModel = function(obj) {
	var model, key = Object.keys(obj)[0];
	if (model = dictionary.solveFromDictionary('props', key))
		Object.assign(this, model);
	this[key] = obj[key];
};
PropModel.prototype = Object.create(ValueObject.prototype);
exports.PropModel = PropModel;
Object.defineProperty(PropModel.prototype, 'objectType', {value : 'Props'});




/**
 * @constructor ReactivityQuery
 * @extends ValueObject
 */
var ReactivityQueryModel = function(defObj) {
	Object.assign(this, {
		from : null,							// String
		obj : null,								// Object [HTMLElement, Stream]
		filter : null,							// function (GlorifiedPureFunction ;)
		map : null,								// function (GlorifiedPureFunction ;)
		subscribe : null						// function CallBack
	});
	ValueObject.apply(this, [defObj]);
}
ReactivityQueryModel.prototype = Object.create(ValueObject.prototype);
exports.ReactivityQueryModel = ReactivityQueryModel;
Object.defineProperty(ReactivityQueryModel.prototype, 'objectType', {value : 'ReactivityQuery'});



/**
 * @constructor EventSubscription
 * @extends ValueObject
 */
var EventSubscriptionModel = function(defObj) {
	Object.assign(this, {
		subscribe : null							// function CallBack
	});
	ValueObject.apply(this, [defObj]);
}
EventSubscriptionModel.prototype = Object.create(ValueObject.prototype);
exports.EventSubscriptionModel = EventSubscriptionModel;
Object.defineProperty(EventSubscriptionModel.prototype, 'objectType', {value : 'EventSubscription'});









/**
 * @constructor SingleLevelComponentDefModel
 * @extends ValueObject
 */
var SingleLevelComponentDefModel = function(initObj, isSpecial) {
	Object.assign(this, {
		type : null,							// String
		nodeName : null,						// String
		attributes : [],						// Array [AttributeDesc]
		parentNodeIndex : null,					// Number
		targetSlotIndex : null,					// Number
		sWrapper : null,						// Object StylesheetWrapper
		states : [],							// Array [State]
		props : [],								// Array [Prop]
		command : null,							// Object Command
		reactOnParent : [],						// Array [ReactivityQuery]
		reactOnSelf : [],						// Array [ReactivityQuery]
		subscribeOnParent : [],					// Array [ReactivityQuery]
		subscribeOnChild : [],					// Array [ReactivityQuery]
		keyboardSettings : []					// Array [KeyboardHotkeys]
	});
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



/**
 * @constructor HierarchicalComponentDefModel
 * @extends ValueObject
 */
var HierarchicalComponentDefModel = function() {
	Object.assign(this, {
		host : null,							// Object SingleLevelComponentDef
		subSections : [],						// Array [SingleLevelComponentDef]
		members : [],							// Array [SingleLevelComponentDef]
		lists : [],								// Array [ComponentListDef]
		options : null							// Object : plain
	});
	ValueObject.apply(this, arguments);
}
HierarchicalComponentDefModel.prototype = Object.create(ValueObject.prototype);
exports.HierarchicalComponentDefModel = HierarchicalComponentDefModel;
Object.defineProperty(HierarchicalComponentDefModel.prototype, 'objectType', {value : 'MComponentDef'});



/**
 * @constructor ComponentListDef
 * @extends ValueObject
 */
var ComponentListDefModel = function() {
	Object.assign(this, {
		type : 'ComponentList',					// String
		reflectOnModel : null,					// Boolean
		each : null,							// Array [unknown_type] (model to iterate on)
		template : null,						// Object HierarchicalComponentDef
		section : null,							// Number
	});
	ValueObject.apply(this, arguments);
}
ComponentListDefModel.prototype = Object.create(ValueObject.prototype);
exports.ComponentListDefModel = ComponentListDefModel;
Object.defineProperty(ComponentListDefModel.prototype, 'objectType', {value : 'ComponentListDef'});





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
			def = new HierarchicalComponentDefModel({host : new SingleLevelComponentDefModel(defObj, isSpecial)}, 'rootOnly');
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
 * @dictionary
 */
var Dictionary = function() {
		this.attributes = {};
		this.states = {};
		this.props = {};
}
Dictionary.prototype.solveFromDictionary = function(type, key) {
		
	if (!(this[type] && this[type][key])) {
		if (this[type]) {
			this[type][key] = {};
			this[type][key][key] = null;
		}
		else {
			this[type] = {};
			this[type][key] = {};
			this[type][key][key] = null;
		}
	}
	
	return this[type][key];
}
var dictionary = new Dictionary();






/**
 * @aliases
 */
Object.assign(exports, {
	definitionsCache : new ComponentDefCache(),
	attributesModel : AttributeModel,								// Object AttributesList
	statesModel : StateModel,										// Object AttributesList
	propModel : PropModel,											// Object AttributesList
	optionsModel : OptionsListModel,								// Object OptionsList
	// "host" key catch the special condition and should always be flat ("artificial" deepening of flat defs is handled in the factory function)
	hostModel : SingleLevelComponentDefModel,						// Object SingleLevelComponentDef
	// "numericaly indexed" keys (in an array) catch the HierarchicalComponentDefModel
	subSectionsModel : HierarchicalComponentDefModel,				// Array [HierarchicalComponentDefModel]
	membersModel : HierarchicalComponentDefModel,					// Array [HierarchicalComponentDefModel]
	reactOnParentModel : ReactivityQueryModel,						// Object ReactivityQueryList
	reactOnSelfModel : ReactivityQueryModel,						// Object ReactivityQueryList
	subscribeOnParentModel : EventSubscriptionModel,				// Object EventSubscriptionsList
	subscribeOnChildModel : EventSubscriptionModel,					// Object EventSubscriptionsList
	createSimpleComponentDef : HierarchicalComponentDefModel		// Object HierarchicalComponentDef
});
module.exports = exports;