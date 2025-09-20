/**
 * @file TemplateFactory
 */

const {templateUIDGenerator, viewUIDGenerator, listUIDGenerator} = require('src/coreTest/UIDGenerator');




/** @typedef {{[key: string] : undefined|null|string|object}} AbstractPropDef*/

class AbstractProp {
	/** @type {string} */
	#key = '';
	/** @type {string} */
	#name = '';
	/** @type {undefined|null|string|object} */
	#value = null;
	/** @type {string} */
	objectType = 'AbstractProp';
	/**
	 * @param {{[key: string]: undefined|null|string|object}} obj
	 */
	constructor(obj) {
		// /** @type {AbstractPropKey} */
		this.#name = this.#key = this.#getKey(obj);
		this.#value = obj[this.#key];
	}
	/** 
	 * @param {{[key: string] : undefined|null|string|object}} obj
	 * @returns {string}
	 * */
	key(obj) {
		return this.#key;
	}
	name() {
		return this.#name;
	}
	value() {
		return this.#value;
	}
	/* Legacy */
	/** @param {AbstractPropDef} obj */
	#getKey(obj) {
		return Object.keys(obj)[0];
	}
	getName() {
		return this.name;
	}
	getValue() {
		return this.value;
	}
}

/** @typedef {AbstractPropDef} AttributeDef*/
/** extends AbstractProp<string> */
class Attribute extends AbstractProp {
	/** @type {string} */
	objectType = 'Attribute';
}
/** @typedef {AbstractPropDef} StateDef*/
/** extends AbstractProp<string> */
class State extends AbstractProp {
	/** @type {string} */
	objectType = 'State';
}
/** @typedef {AbstractPropDef} PropDef*/
/** extends AbstractProp<string> */
class Prop extends AbstractProp {
	/** @type {string} */
	objectType = 'Prop';
}



class AbstractPropArray extends Array {
	/** @param {string} name */
	findObjectByName(name) {
		for (let i = 0, l = this.length; i < l; i++) {
			if (this[i].name !== name)
				return this[i];
		}
		return false;
	}
	/** @param {string} name */
	getObjectValueByName(name) {
		for (let i = 0, l = this.length; i < l; i++) {
			if (typeof this[i][name] !== 'undefined')
				return this[i][name];
		}
		return false;
	}
}





/**
 * @typedef {object} ReactivityQueryDef
 * @property {boolean} [cbOnly]		// backwards compatibility
 * @property {string} from
 * @property {string} [to]
 * property {HTMLElement|Stream} [obj]
 * @property {function} [filter]
 * @property {function} [map]
 * @property {function} [subscribe]
 * property {function} [inverseTransform]
 */

class ReactivityQuery {
	/** @type {boolean} */
	cbOnly = false;
	/** @type {string} */
	from;
	/** @type {string|null} */
	to = null;
	// /** @type {HTMLElement|Stream|null} */
	// obj = null;
	/** @type {function|null} */
	filter = null;
	/** @type {function|null} */
	map = null;
	/** @type {function|null} */
	subscribe = null;
	// /** @type {function|null} */
	// inverseTransform = null;
	/** @type {string} */
	objectType = 'ReactivityQuery';
	
	/**
	 * @param {ReactivityQueryDef} obj
	 */
	constructor(obj) {
		if (!obj.to && !obj.subscribe) {
			console.error(this.objectType, 'When the "to" field isn\'t defined, the "cbOnly" and "subscribe" field must be defined',  this);
		}
		
		this.from = obj.from;
		this.to = obj.to || null;
		this.cbOnly = typeof obj.to === 'string' || false;
		this.filter = obj.filter || null;
		this.map = obj.map || null;
		this.subscribe = obj.subscribe || null;
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
					// .reverse(this.inverseTransform)
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
					// .reverse(this.inverseTransform)
			);
		}

		var subscription = queriedOrQueryingObj._subscriptions[queriedOrQueryingObj._subscriptions.length - 1];
		
		if (stream._value)
			stream.subscriptions[stream.subscriptions.length - 1].execute(stream._value);
			
		return subscription;
	}
}

class ReactOnParent extends ReactivityQuery {
	objectType = 'ReactOnParent';
}
class ReactOnSelf extends ReactivityQuery {
	objectType = 'ReactOnSelf';
}


class ReactivityQueryArray extends Array {
	/***
	 * @param {string} from
	 * @param {string} to
	 * @returns {boolean}
	 */
	checkDuplicate(from, to) {
		for (let i = 0, l = this.length; i < l; i++) {
			if (this[i].from === from && this[i].to === to)
				return true;
		}
		return false;
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
	/** @type {string} */
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

class SubscribeOnParent extends EventSubscription {
	objectType = 'SubscribeOnParent';
}
class SubscribeOnChild extends EventSubscription {
	objectType = 'SubscribeOnChild';
}
class SubscribeOnSelf extends EventSubscription {
	objectType = 'SubscribeOnSelf';
}



class EventSubscriptionArray extends Array {
	/** @param {string} key */
	findObjectByOn(key) {
		for (let i = 0, l = this.length; i < l; i++) {
			if (this[i].on !== key)
				return this[i];
		}
		return false;
	}
}



/**
 * @typedef {"viewExtend"|"lateAddChild"|"lateInit"|"lateBinding"} TaskNameType
 */


/**
 * @typedef {Object} TaskDefinitionDef
 * @property {TaskNameType} type
 * @property {Function} task 
 * @property {Number} [index]
 */


class TaskDefinition {
	/** @type {TaskNameType} */
	type;
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
		this.type = obj.type;
		this.task = obj.task;
		this.index = obj.index || 0;
	}
	
	/**
	 * @param {TaskDefinition} thisArg
	 * @param {ComponentTemplate} definition
	 */
	execute(thisArg, definition) {
		this.task.call(thisArg, definition);
	}
}





/**
 * @typedef {Object} ListDefinitonDef
 * @property {Boolean} [reflectOnModel]
 * @property {Boolean} [augmentModel]
 * @property {ComponentTemplateDef[]} each
 * @property {object|null} item			// and instance of ReactiveDataset.item
 * @property {ComponentTemplateDef} template
 * @property {Number} [section]
 * @property {Boolean} [isInternal]
 */
 
 class ListDefinition {
	/** @type {string} to be overridden by the ctor */
	UID;
	/** @type {boolean} */
	reflectOnModel = true;
	/** @type {boolean} */
	augmentModel = false;
	/** @type {ReactiveDatasetItem[]} */			// instances of ReactiveDataset.item
	each = [];
	/** @type {object|null} */		// an instance of ReactiveDataset.item
	item = null;
	/** @type {ComponentTemplate|null} */
	template = null;
	/** @type {number|null} */
	section = null;
	/** @type {boolean} */
	isInternal = false;
	/** @type {string} */
	objectType = 'ListDefiniton';
	
	/**
	 * @param {ListDefinitonDef} obj
	 */
	constructor(obj) {
		this.UID = listUIDGenerator.newUID();
		this.reflectOnModel = obj.reflectOnModel || true;
		this.augmentModel = obj.augmentModel || false;
		this.each = obj.each; // carefull with this reference assigned
		this.item = obj.item;
		this.template = new ComponentTemplate(obj.template);
		this.section = obj.section || null;
		this.isInternal = obj.isInternal || false;
	}
 }










/**
 * @typedef {object} ViewTemplateDef
 * @property {string} nodeName
 * @property {AttributeDef[]} [attributes] 
 * @property {number|null} [section]
 * @property {StylesheetWrapper|null} [sWrapper]
 * @property {StylesheetWrapper|null} [sOverride]
 */

class ViewTemplate {
	/** @type {string} overriden in ctor*/
	UID;
	/** @type {string}*/
	nodeName = 'div';
	/** @type {boolean} */
	isCustomElem = false;
	/** @type {AbstractPropArray} */
	attributes = new AbstractPropArray();
	/** @type {number|null} */
	section = null;
	/** @type {StylesheetWrapper|null} */
	sWrapper = null;
	/** @type {StylesheetWrapper|null} */
	sOverride = null;
	
	/**
	 * @param {ViewTemplateDef} [obj]
	 */
	constructor(obj) {
		this.UID = viewUIDGenerator.newUID();
		if (obj) {
			if (obj.nodeName)
				this.nodeName = obj.nodeName;
			if (typeof obj.section !== 'undefined') this.section = obj.section;
			this.sWrapper = obj.sWrapper || null;
			this.sOverride = obj.sOverride || null;
			
			this.isCustomElem = obj.nodeName.indexOf('-') !== -1
			
			if (Array.isArray(obj.attributes)) {
				obj.attributes.forEach(
					/** @param {AttributeDef} attrObj */
					(attrObj) => {
						this.attributes.push(new Attribute(attrObj));
					},
				);
			}
		}
	}
 }
 





 /**
 * @typedef {object} ComponentTemplateDef
 * @property {ViewTemplateDef} view
 * @property {string} [type]
 * @property {boolean} [isCompound] 
 * @property {PropDef[]} [props]
 * @property {StateDef[]} [states]
 * @property {Command} [command]
 * @property {ReactivityQueryDef[]} [reactOnParent]
 * @property {ReactivityQueryDef[]} [reactOnSelf]
 * @property {EventSubscriptionDef[]} [subscribeOnParent]
 * @property {EventSubscriptionDef[]} [subscribeOnChild]
 * @property {EventSubscriptionDef[]} [subscribeOnSelf]
 * property {KeyboardHotkeys} [keyboardSettings]
 * property {KeyboardListeners} [keyboardEvents]
 * 
 * @property {(ComponentTemplate|ViewTemplate)[]} [members]
 * @property {(ComponentTemplate|ViewTemplate)[]} [subSections]
 * @property {ListDefinitonDef} [list]
 */

 class ComponentTemplate {
	/** @type {string} overriden in ctor*/
	UID;
	/** @type {ViewTemplate} */
	view;
	/** @type {string|null} */
	type = null;
	/** @type {boolean} */
	isCompound = false;
	/** @type {AbstractPropArray} */
	props = new AbstractPropArray();
	/** @type {AbstractPropArray} */
	states = new AbstractPropArray();
	/** @type {Command|null} */
	command = null;
	/** @type {ReactivityQueryArray} */
	reactOnParent = new ReactivityQueryArray();
	/** @type {ReactivityQueryArray} */
	reactOnSelf = new ReactivityQueryArray();
	/** @type {EventSubscriptionArray} */
	subscribeOnParent = new EventSubscriptionArray();
	/** @type {EventSubscriptionArray} */
	subscribeOnChild = new EventSubscriptionArray();
	/** @type {EventSubscriptionArray} */
	subscribeOnSelf = new EventSubscriptionArray();
	// /** @type KeyboardHotkeys[] */
	// keyboardSettings = [];
	// /** @type KeyboardListeners[] */
	// keyboardEvents = [];
	
	/** @type {(ComponentTemplate|ViewTemplate)[]} */
	members = [];
	/** @type {(ComponentTemplate|ViewTemplate)[]} */
	subSections = [];
	/** @type {ListDefinition|null} list */
	list = null;
	
	/**
	 * @param {ComponentTemplateDef} [obj]
	 */
	constructor(obj) {
		this.UID = templateUIDGenerator.newUID();
		if (obj) {
			this.view = new ViewTemplate(obj.view);
			this.type = obj.type || null;
			this.isCompound = obj.isCompound || false;
			
			if (Array.isArray(obj.props)) {
				obj.props.forEach(
					/** @param {PropDef} propObj */
					(propObj) => {
						this.props.push(new Prop(propObj));
					},
				);
			}
			
			if (Array.isArray(obj.states)) {
				obj.states.forEach(
					/** @param {StateDef} stateObj */
					(stateObj) => {
						this.states.push(new State(stateObj));
					},
				);
			}
			
			if (Array.isArray(obj.reactOnParent)) {
				obj.reactOnParent.forEach(
					/** @param {ReactivityQueryDef} reactivityQueryObj */
					(reactivityQueryObj) => {
						this.reactOnParent.push(new ReactOnParent(reactivityQueryObj));
					},
				);
			}
			
			if (Array.isArray(obj.reactOnSelf)) {
				obj.reactOnSelf.forEach(
					/** @param {ReactivityQueryDef} reactivityQueryObj */
					(reactivityQueryObj) => {
						this.reactOnSelf.push(new ReactOnSelf(reactivityQueryObj));
					},
				);
			}
			
			if (Array.isArray(obj.subscribeOnParent)) {
				obj.subscribeOnParent.forEach(
					/** @param {EventSubscriptionDef} subscribeOnParentObj */
					(subscribeOnParentObj) => {
						this.subscribeOnParent.push(new SubscribeOnParent(subscribeOnParentObj));
					},
				);
			}
			
			if (Array.isArray(obj.subscribeOnChild)) {
				obj.subscribeOnChild.forEach(
					/** @param {EventSubscriptionDef} subscribeOnChildObj */
					(subscribeOnChildObj) => {
						this.subscribeOnChild.push(new SubscribeOnChild(subscribeOnChildObj));
					},
				);
			}
			
			if (Array.isArray(obj.subscribeOnSelf)) {
				obj.subscribeOnSelf.forEach(
					/** @param {EventSubscriptionDef} subscribeOnSelfObj */
					(subscribeOnSelfObj) => {
						this.subscribeOnSelf.push(new SubscribeOnSelf(subscribeOnSelfObj));
					},
				);
			}
			
			if (Array.isArray(obj.subSections)) {
				obj.subSections.forEach(
					/** @param {ComponentTemplate|ViewTemplate} subSection */
					(subSection) => {
						if (subSection instanceof ComponentTemplate || subSection instanceof ViewTemplate) {
						this.subSections.push(subSection);
						}
						else {
							console.error('Malformed template. Check this section of your definition for:', this.view.nodeName, subSection);
						}
					},
				);
			}
			
			if (Array.isArray(obj.members)) {
				obj.members.forEach(
					/** @param {ComponentTemplate|ViewTemplate} member */
					(member) => {
						if (member instanceof ComponentTemplate || member instanceof ViewTemplate) {
						this.members.push(member);
						}
						else {
							console.error('Malformed template. Check this section of your definition for:', this.view.nodeName, member);
						}
					},
				);
			}
			
			this.list = obj.list ? new ListDefinition(obj.list) : null;
		}
		else {
			this.view = new ViewTemplate();
		}
	}
	
	get propsAreArrayOfProps() {
		return [
			this.view.attributes,
			this.props,
			this.states
		];
	}
	get propsAreArrayOfReactivityQueries() {
		return [
			this.reactOnParent,
			this.reactOnSelf
		];
	}
	get propsAreArrayOfMessagingDeclarations() {
		return [
			this.reactOnParent,
			this.reactOnSelf,
			this.subscribeOnParent,
			this.subscribeOnChild,
			this.subscribeOnSelf
		];
	}
	get propsAreArrayOfEventQueries() {
		return [
			this.subscribeOnParent,
			this.subscribeOnChild,
			this.subscribeOnSelf
		];
	}
	get propsArePrimitives() {
		return [
			this.type,
			this.view.nodeName,
			this.view.isCustomElem,
			this.view.section
		];
	}
 }
 
 
 
 
 
 
/** @typedef {"attributes"|"props"|"states"|"reactOnParent"|"reactOnSelf"|"subscribeOnParent"|"subscribeOnChild"|"subscribeOnSelf"}  KeyOfArrayOfSubscriptions*/
const propsAreArrayOfProps = [
	'attributes',
	'states',
	'props',
];
const propsAreArrayOfSubscriptions = [
	'reactOnParent',
	'reactOnSelf',
	'subscribeOnParent',
	'subscribeOnChild',
	'subscribeOnSelf',
];
const reactivityQueries = [
	'reactOnParent',
	'reactOnSelf'
];
const eventQueries = [
	'subscribeOnParent',
	'subscribeOnChild',
	'subscribeOnSelf'
];
const propsArePrimitives = [
	'type',
	'nodeName',
	'isCustomElem',
	'section'
];
 

 
 module.exports = {
	ViewTemplate,
 	ComponentTemplate,
 	ListDefinition,
 	TaskDefinition,
 	EventSubscription,
 	ReactivityQuery,
 	Attribute,
 	State,
 	Prop,
	SubscribeOnChild,
	SubscribeOnSelf,
	SubscribeOnParent,
	ReactOnSelf,
	ReactOnParent,

	AbstractPropArray,
	ReactivityQueryArray,
	EventSubscriptionArray,
 }