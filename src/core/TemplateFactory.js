/**
 * @file TemplateFactory
 */

const {UIDGenerator} = require('formantjs');








class AbstractProp {
	/** @type {string} */
	#key = '';
	/** @type {string} */
	#name = '';
	/** @type {undefined|null|string|object} */
	#value = null;
	/** @type {'AbstractProp'} */
	objectType = 'AbstractProp';
	/**
	 * @param {object<string: undefined|null|string|object>} obj
	 */
	constructor(obj) {
		this.#name = this.#key = this.#getKey.call(obj);
		this.value = obj[this.key];
	}
	
	#getKey() {
		for(let name in this)
			return name;
	}
	get key() {
		return this.#key;
	}
	get name() {
		return this.#name;
	}
	get value() {
		return this.#value;
	}
	/* Legacy */
	getKey() {
		return this.#key;
	}
	getName() {
		return this.#name;
	}
	getValue() {
		return this.#value;
	}
}

class Attribute extends AbstractProp {
	/** @type {'Attribute'} */
	objectType = 'Attribute';
}
class State extends AbstractProp {
	/** @type {'State'} */
	objectType = 'State';
}
class Prop extends AbstractProp {
	/** @type {'Prop'} */
	objectType = 'Prop';
}





/**
 * @typedef {object} ReactivityQueryDef
 * @property {boolean} [cbOnly]
 * @property {string} from
 * @property {string} [to]
 * @property {HTMLElement|Stream} [obj]
 * @property {function} [filter]
 * @property {function} [map]
 * @property {function} [subscribe]
 * @property {function} [inverseTransform]
 */

class ReactivityQuery {
	/** @type {boolean} */
	cbOnly = false;
	/** @type {string} */
	from = '';
	/** @type {string|null} */
	to = null;
	/** @type {HTMLElement|Stream|null} */
	obj = null;
	/** @type {function|null} */
	filter = null;
	/** @type {function|null} */
	map = null;
	/** @type {function|null} */
	subscribe = null;
	/** @type {function|null} */
	inverseTransform = null;
	/** @type {'ReactivityQuery'} */
	objectType = 'ReactivityQuery';
	
	/**
	 * @param {ReactivityQueryDef} obj
	 */
	constructor(obj) {
		if (!obj.to && !obj.subscribe) {
			console.error(this.objectType, 'When the "to" field isn\'t defined, the "cbOnly" and "subscribe" field must be defined',  this);
		}
		
		Object.assign(this, obj);
	}
	
	/**
	 * Old doc
	 * param {Stream} stream
	 * param {ComponentWithObservables} queriedOrQueryingObj
	 */
	subscribeToStream(stream, queriedOrQueryingObj) {
		if (!this.cbOnly
			// @ts-ignore : "expression of type any can't be used to type {}"
			// queriedOrQueryingObj.streams isn't typed cause naming the streams is at the discretion of the user
			// => We're indeed testing if that name exists
			&& !queriedOrQueryingObj.streams[this.to] 
			&& !this.subscribe) {
			console.warn('Missing stream or subscription callback on child subscribing from ' + stream.name + ' to ' + this.to);
			return;
		}
		else if (typeof stream === 'undefined') {
			console.error('No stream object passed for subscription. Probable usage of stream without a prior declaration: ', this.from, this.to, queriedOrQueryingObj);
			return;
		}
		if (this.cbOnly) {
			queriedOrQueryingObj._subscriptions.push(
				stream.subscribe(this.subscribe.bind(queriedOrQueryingObj))
					.filter(this.filter, queriedOrQueryingObj)
					.map(this.map, queriedOrQueryingObj)
					.reverse(this.inverseTransform)
			);
		}
		else {
			queriedOrQueryingObj._subscriptions.push(
				// @ts-ignore : "expression of type any can't be used to type {}"
				// queriedOrQueryingObj.streams isn't typed cause naming the streams is at the discretion of the user
				// => We've indeed already tested if that name exists
				stream.subscribe(queriedOrQueryingObj.streams[this.to], 'value')
					.filter(this.filter, queriedOrQueryingObj)
					.map(this.map, queriedOrQueryingObj)
					.reverse(this.inverseTransform)
			);
		}

		var subscription = queriedOrQueryingObj._subscriptions[queriedOrQueryingObj._subscriptions.length - 1];
		
		if (stream._value)
			stream.subscriptions[stream.subscriptions.length - 1].execute(stream._value);
			
		return subscription;
	}
}








/**
 * @typedef {object} EventSubscriptionDef
 * @property {string} on
 * @property {function} subscribe
 */

class EventSubscription {
	/** @type {string|null} */
	on = null;
	/** @type {function} */
	subscribe = () => {};
	/** @type {'EventSubscription'} */
	objectType = 'EventSubscription';
	/**
	 * @param {EventSubscriptionDef} obj
	 */
	constructor(obj) {
		this.on = obj.on;
		this.subscribe = obj.subscribe;
	}
	
	/**
	 * @param {EventEmitter} targetComponent
	 * @param {EventEmitter} requestingComponent
	 */
	subscribeToEvent(targetComponent, requestingComponent) {
		targetComponent.addEventListener(this.on, this.subscribe.bind(requestingComponent));
	}
}




/**
 * @typedef {"viewExtend"|"lateAddChild"|"lateInit"|"lateBinding"} TaskNameType
 */


/**
 * @typedef {Object} TaskDefinitionDef
 * @prperty {TaskNameType} type
 * @prperty {Function} task 
 * @prperty {Number} [index]
 */


var TaskDefinition = function(obj) {
	/** @type {TaskNameType} */
	type = '';
	/** @type {function} */
	task = () => {};
	/** @type {number} */
	index = 0;
	/** @type {'TaskSubscription'} */
	objectType = 'TaskSubscription';
	
	/**
	 * @param {TaskDefinitionDef} obj
	 */
	constructor(obj) {
		Object.assign(this, obj);
	}
	
	/**
	 * @param {TaskDefinition} thisArg
	 * @param {HierarchicalComponentTemplate} definition
	 */
	execute(thisArg, definition) {
		this.task.call(thisArg, definition);
	}
}









/**
 * @typedef {object} ViewTemplateDef
 * @property {string} nodeName
 * @property {boolean} isCustomElem
 * @property {AttributeDef[]} attributes 
 * @property {number|null} section
 * @property {StylesheetWrapper|null} sWrapper
 * @property {StylesheetWrapper|null} sOverride
 */

class ViewTemplate {
	/** @type {string} overriden in ctor*/
	UID = '';
	/** @type {string}*/
	nodeName = '';
	/** @type {boolean} */
	isCustomElem = false;
	/** @type AttributeDesc[] */
	attributes = [];
	/** @type {number|null} */
	section = null;
	/** @type {StylesheetWrapper|null} */
	sWrapper = null;
	/** @type {StylesheetWrapper|null} */
	sOverride = null;
	
	/**
	 * @param {ViewTemplateDef} obj
	 */
	constructor(obj) {
		this.UID = UIDGenerator.ViewUIDGenerator.newUID().toString();
		this.nodeName = obj.nodeName;
		this.section = obj.section;
		this.sWrapper = obj.sWrapper;
		this.sOverride = obj.sOverride;
		
		this.isCustomElem = typeof obj.nodeName !==
			? obj.nodeName.indexOf('-') !== -1
			: null;
		
		obj.attributes.forEach(
			/** @param {AttributeDef} attrObj */
			function(attrObj) {
				this.attributes.push(new Attribute(attrObj));
			},
		this);
	}
 }
 
 /**
 * @typedef {object} ComponentTemplateDef
 * @property {ViewTemplateDef} view
 * @property {string} [type]
 * @property {boolean} [isCompound] 
 * @property {PropDef[]} [props]
 * @property {StatesDef[]} [states]
 * @property {Command} [command]
 * @property {ReactivityQueryDef[]} [reactOnParent]
 * @property {ReactivityQueryDef[]} [reactOnSelf]
 * @property {EventSubscriptionDef[]} [subscribeOnParent]
 * @property {EventSubscriptionDef[]} [subscribeOnChild]
 * @property {EventSubscriptionDef[]} [subscribeOnSelf]
 * @property {KeyboardHotkeys} [keyboardSettings]
 * @property {KeyboardListeners} [keyboardEvents]
 * 
 * @property {(ComponentTemplateDef|ViewTemplateDef)[]} [members]
 * @property {(ComponentTemplateDef|ViewTemplateDef)[]} [subSections]
 * @property {ListTemplateDef} [list]
 */

 class ComponentTemplate {
	/** @type {string|null} overriden in ctor*/
	UID = null;
	/** @type {ViewTemplate} */
	view = new ViewTemplate();
	/** @type {string|null} */
	type = null;
	/** @type {boolean} */
	isCompound = false;
	/** @type Prop[] */
	props = [];
	/** @type State[] */
	states = [];
	/** @type (Prop|State)[] */
	streams = [];
	/** @type {Command|null} */
	command = null;
	/** @type ReactivityQuery[] */
	reactOnParent = [];
	/** @type ReactivityQuery[] */
	reactOnSelf = [];
	/** @type EventSubscription[] */
	subscribeOnParent = [];
	/** @type EventSubscription[] */
	subscribeOnChild = [];
	/** @type EventSubscription[] */
	subscribeOnSelf = [];
	/** @type KeyboardHotkeys[] */
	keyboardSettings = [];
	/** @type KeyboardListeners[] */
	keyboardEvents = [];
	
	/** @type {(ComponentTemplate|ViewTemplate)[]} */
	members = [];
	/** @type {(ComponentTemplate|ViewTemplate)[]} */
	subSections = [];
	/** @type {ListDefinitonDef|null} list */
	list = null;
	
	/**
	 * @param {ComponentTemplateDef} obj
	 */
	constructor(obj) {
		this.view = new ViewTemplate(obj.view);
		this.type = obj.type;
		this.isCompound = obj.isCompound;
		
		obj.props.forEach(
			/** @param {PropDef} propObj */
			function(propObj) {
				this.props.push(new Prop(propObj));
			},
		this);
		
		obj.states.forEach(
			/** @param {StateDef} stateObj */
			function(stateObj) {
				this.states.push(new State(stateObj));
			},
		this);
		
		obj.reactOnParent.forEach(
			/** @param {ReactivityQueryDef} reactivityQueryObj */
			function(reactivityQueryObj) {
				this.reactOnParent.push(new ReactivityQuery(reactivityQueryObj));
			},
		this);
		
		obj.reactOnSelf.forEach(
			/** @param {ReactivityQueryDef} reactivityQueryObj */
			function(reactivityQueryObj) {
				this.reactOnParent.push(new ReactivityQuery(reactivityQueryObj));
			},
		this);
		
		obj.subscribeOnParent.forEach(
			/** @param {EventSubscriptionDef} subscribeOnParentObj */
			function(subscribeOnParentObj) {
				this.subscribeOnParent.push(new EventSubscription(subscribeOnParentObj));
			},
		this);
		
		obj.subscribeOnChild.forEach(
			/** @param {EventSubscriptionDef} subscribeOnChildObj */
			function(subscribeOnChildObj) {
				this.subscribeOnChild.push(new EventSubscription(subscribeOnChildObj));
			},
		this);
		
		obj.subscribeOnSelf.forEach(
			/** @param {EventSubscriptionDef} subscribeOnSelfObj */
			function(subscribeOnParentObj) {
				this.subscribeOnSelf.push(new EventSubscription(subscribeOnSelfObj));
			},
		this);
		
		obj.subSections.forEach(
			/** @param {ComponentTemplateDef|ViewTemplateDef} subSection */
			function(subSection) {
				this.subSections.push(new ComponentTemplate(subSection));
			},
		this);
		
		this.list = new ListDefinition(obj.list);
		this.streams = this.props.concat(this.states);
		this.UID = UIDGenerator.TemplateUIDGenerator.newUID().toString();
	}
	
	getHostDef() {
		return this.view;
	}
 }
 
 
 
 
 
 
 /**
 * @typedef {Object} ListDefinitonDef
 * @property {Boolean} [reflectOnModel
 * @property {Boolean} [augmentModel
 * @property {ComponentTemplateDef[]} each
 * @prperty {object|null} item			// and instance of ReactiveDataset.item
 * @prperty {ComponentTemplateDef} [template]
 * @prperty {Number} [section]
 * @prperty {Boolean} [isInternal]
 */
 
 class ListDefinition {
	/** @type {string} to be overridden by the ctor */
	UID = '';
	/** @type {boolean} */
	reflectOnModel = true;
	/** @type {boolean} */
	augmentModel = false;
	/** @type {ComponentTemplateDef[]} */
	each = [];
	/** @type {object|null} */		// an instance of ReactiveDataset.item
	item = null;
	/** @type {ComponentTemplateDef|null} */
	template = null;
	/** @type {number|null} */
	section = null;
	/** @type {boolean} */
	isInternal = false;
	/** @type {'ListDefiniton'} */
	objectType = 'ListDefiniton';
	
	/**
	 * @param {ListDefinitonDef} obj
	 */
	constructor(obj) {
		this.reflectOnModel = obj.reflectOnModel;
		this.augmentModel = obj.augmentModel;
		this.each = obj.each; // carefull with this reference assigned
		this.item = obj.item;
		this.template = new ComponentTemplate(obj.template);
		this.section = obj.section;
		this.isInternal = obj.isInternal;
		this.UID = UIDGenerator.DefUIDGenerator.newUID().toString();
	}
 }
 
 
 module.exports = {
	ViewTemplate,
 	ComponentTemplate,
 	ListTemplate,
 	TaskDefinition,
 	EventSubscription,
 	ReactivityQuery,
 	Attribute,
 	State,
 	Prop,
 }