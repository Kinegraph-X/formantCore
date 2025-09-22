/**
 * @file TemplateFactory
 */
const {Logger, ComponentError} = require('src/coreTest/Error&Log');
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
		/** @readonly */ this.#name = this.#key = this.#getKey(obj);
		/** @readonly */ this.#value = obj[this.#key];
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
 * @property {function} [effect]
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
	effect = null;
	// /** @type {function|null} */
	// inverseTransform = null;
	/** @type {string} @readonly */
	objectType = 'ReactivityQuery';
	
	/**
	 * @param {ReactivityQueryDef} obj
	 */
	constructor(obj) {
		if (!obj.to && !obj.effect) {
			new ComponentError(this, 'When the "to" field isn\'t defined, the "effect" field must be defined',  this);
		}
		else if (obj.to && obj.effect) {
			new ComponentError(this, 'When the "effect" field is defined, no propagation via the "to" field is allowed.',  this);
		}
		
		/** @readonly */ this.from = obj.from;
		/** @readonly */ this.to = obj.to || null;
		/** @readonly */ this.filter = obj.filter || null;
		/** @readonly */ this.map = obj.map || null;
		/** @readonly */ this.effect = obj.effect || null;
	}
}

class ReactOnParent extends ReactivityQuery {
	/** @readonly  */
	objectType = 'ReactOnParent';
}
class ReactOnSelf extends ReactivityQuery {
	/** @readonly  */
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
	/** @type {string} @readonly */
	objectType = 'EventSubscription';
	/**
	 * @param {EventSubscriptionDef} obj
	 */
	constructor(obj) {
		/** @readonly */ this.on = obj.on;
		/** @readonly */ this.subscribe = obj.subscribe;
	}
	
	/**
	 * @param {EventEmitter} targetComponent
	 * @param {EventEmitter} requestingComponent
	 */
	subscribeToEvent(targetComponent, requestingComponent) {
		targetComponent.addEventListener(this.on, this.subscribe.bind(requestingComponent));
	}
}

class SubscribeOnChild extends EventSubscription {
	/** @readonly  */
	objectType = 'SubscribeOnChild';
}
class SubscribeOnSelf extends EventSubscription {
	/** @readonly  */
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
	/** @type {'TaskSubscription'} @readonly */
	objectType = 'TaskSubscription';
	
	/**
	 * @param {TaskDefinitionDef} obj
	 */
	constructor(obj) {
		/** @readonly */ this.type = obj.type;
		/** @readonly */ this.task = obj.task;
		/** @readonly */ this.index = obj.index || 0;
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
 * @property {ReactiveDatasetItem[]} item			// and instance of ReactiveDataset.item
 * @property {ComponentTemplateDef} template
 * @property {Number} [section]
 */
 
 class ListDefinition {
	/** @type {string} to be overridden by the ctor */
	UID;
	/** @type {boolean} */
	reflectOnModel = true;
	/** @type {boolean} */
	augmentModel = false;
	/** @type {ReactiveDatasetItem[]|null} */			// instances of ReactiveDataset.item
	each = null;
	/** @type {object|null} */		// an instance of ReactiveDataset.item
	item = null;
	/** @type {ComponentTemplate|null} */
	template = null;
	/** @type {number|null} */
	section = null;
	/** @type {string} @readonly */
	objectType = 'ListDefiniton';
	
	/**
	 * @param {ListDefinitonDef} obj
	 */
	constructor(obj) {
		/** @readonly */ this.UID = listUIDGenerator.newUID();
		if (obj) {
			/** @readonly */ this.reflectOnModel = obj.reflectOnModel || true;
			/** @readonly */ this.augmentModel = obj.augmentModel || false;
			/** @readonly */ if (obj.each) this.each = obj.each ; // carefull with this reference assigned
			/** @readonly */ if (obj.item) this.item = obj.item;
			/** @readonly */ if (obj.template) this.template = new ComponentTemplate(obj.template);
			/** @readonly */ this.section = obj.section || null;
		}
	}
 }










/**
 * @typedef {object} ViewTemplateDef
 * @property {string} nodeName
 * @property {AttributeDef[]} [attributes] 
 * @property {number} [section]
 * @property {StylesheetWrapper} [sWrapper]
 * @property {StylesheetWrapper} [sOverride]
 */

class ViewTemplate {
	/** @type {string} overriden in ctor*/
	UID;
	/** @type {string}*/
	nodeName = 'div';
	/** @type {boolean} */
	isCustomElem = false;
	/** @type {AbstractPropArray} @readonly */
	attributes = new AbstractPropArray();
	/** @type {number|null} */
	section = null;
	/** @type {StylesheetWrapper|null} */
	sWrapper = null;
	/** @type {StylesheetWrapper|null} */
	sOverride = null;
	/** @type {string} @readonly */
	objectType = 'ViewTemplate';
	
	/**
	 * @param {ViewTemplateDef} [obj]
	 */
	constructor(obj) {
		/** @readonly */ this.UID = viewUIDGenerator.newUID();
		if (obj) {
			if (obj.nodeName)
				/** @readonly */ this.nodeName = obj.nodeName;
			if (typeof obj.section !== 'undefined') 
				/** @readonly */ this.section = obj.section;
			/** @readonly */ this.sWrapper = obj.sWrapper || null;
			/** @readonly */ this.sOverride = obj.sOverride || null;
			
			/** @readonly */ this.isCustomElem = obj.nodeName.indexOf('-') !== -1
			
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
	/** @type {AbstractPropArray} @readonly */
	props = new AbstractPropArray();
	/** @type {AbstractPropArray} @readonly */
	states = new AbstractPropArray();
	/** @type {Command|null} */
	command = null;
	/** @type {ReactivityQueryArray} @readonly */
	reactOnParent = new ReactivityQueryArray();
	/** @type {ReactivityQueryArray} @readonly */
	reactOnSelf = new ReactivityQueryArray();
	/** @type {EventSubscriptionArray} @readonly */
	subscribeOnChild = new EventSubscriptionArray();
	/** @type {EventSubscriptionArray} @readonly */
	subscribeOnSelf = new EventSubscriptionArray();
	/** @type {(ComponentTemplate|ViewTemplate)[]} @readonly */
	members = [];
	/** @type {(ComponentTemplate|ViewTemplate)[]} @readonly */
	subSections = [];
	/** @type {ListDefinition|null} */
	list = null;
	/** @type {string} @readonly */
	objectType = 'ComponentTemplate';
	
	/**
	 * @param {ComponentTemplateDef} [obj]
	 */
	constructor(obj) {
		/** @readonly */ this.UID = templateUIDGenerator.newUID();
		if (obj) {
			/** @readonly */ this.view = new ViewTemplate(obj.view);
			/** @readonly */ this.type = obj.type || null;
			
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
			
			/** @readonly */ this.list = obj.list ? new ListDefinition(obj.list) : null;
		}
		else {
			/** @readonly */ this.view = new ViewTemplate();
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
 
 
 
 
 
 
// /** @typedef {"attributes"|"props"|"states"|"reactOnParent"|"reactOnSelf"|"subscribeOnParent"|"subscribeOnChild"|"subscribeOnSelf"}  KeyOfArrayOfSubscriptions*/
// const propsAreArrayOfProps = [
// 	'attributes',
// 	'states',
// 	'props',
// ];
// const propsAreArrayOfSubscriptions = [
// 	'reactOnParent',
// 	'reactOnSelf',
// 	'subscribeOnParent',
// 	'subscribeOnChild',
// 	'subscribeOnSelf',
// ];
// const reactivityQueries = [
// 	'reactOnParent',
// 	'reactOnSelf'
// ];
// const eventQueries = [
// 	'subscribeOnParent',
// 	'subscribeOnChild',
// 	'subscribeOnSelf'
// ];
// const propsArePrimitives = [
// 	'type',
// 	'nodeName',
// 	'isCustomElem',
// 	'section'
// ];
 

 
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
	ReactOnSelf,
	ReactOnParent,

	AbstractPropArray,
	ReactivityQueryArray,
	EventSubscriptionArray,
 }