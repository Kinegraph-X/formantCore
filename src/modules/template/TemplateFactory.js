/**
 * @file TemplateFactory
 */
/**
 * @typedef {import('./Prop').AttributeDef} AttributeDef
 * @typedef {import('./Prop').PropDef} PropDef
 * @typedef {import('./Prop').StateDef} StateDef
 * @typedef {import('./ReactivityQuery').ReactivityQueryDef} ReactivityQueryDef
 * @typedef {import('./EventSubscription').EventSubscriptionDef} EventSubscriptionDef
 * @typedef {import('./ListTemplate').ListTemplateDef} ListTemplateDef
 * @typedef {import('../component/Component').ComponentWithView} ComponentWithView
 * @typedef {import('../reactivity/EffectCtx')} EffectCtx
 * @typedef {import('../style/Stylesheet')} Stylesheet
 */
import {templateUIDGenerator, viewUIDGenerator} from '../UIDGenerator.js';
import registries from '../Registries.js';
import {Imperative} from '../Imperative.js'; 


import { 
	AbstractProp,
	Attribute,
	Prop,
	State,
	AbstractPropArray,
	AttributeArray,
	PropArray,
	StateArray
} from './Prop';

import {
	ReactivityQuery,
	ReactOnParent,
	ReactOnSelf,
	ReactivityQueryArray
} from './ReactivityQuery';

import {
	EventSubscription,
	SubscribeOnSelf,
	SubscribeOnChild,
	EventSubscriptionArray
} from './EventSubscription';

import TaskDefinition from './TaskDefinition';
import ListTemplate from './ListTemplate';








/**
 * @typedef {'click'
 * |'dblclick'
 * |'mousedown'
 * |'mouseup'
 * |'mousemove'
 * |'keydown'
 * |'keyup'
 * |'keypress'
 * |'input'
 * |'change'
 * |'submit'
 * |'focus'
 * |'blur'
 * |'dragstart'
 * |'dragover'
 * |'drop'
 * |'touchstart'
 * |'touchend'
 * |'touchmove'
 * } DomEventType
 * @typedef {{DomEventType: string}} DomEventBindings
 */


/**
 * @typedef {object} ViewTemplateDef
 * @property {string} nodeName
 * @property {AttributeDef[]} [attributes]
 * @property {DomEventBindings} [listens]
 * @property {number} [section]
 * @property {Stylesheet} [sWrapper]
 * @property {{[key: string]: string}[]} [sOverride]
 */

class ViewTemplate {
	/** @type {string} defined in ctor*/
	UID;
	/** @type {string}*/
	nodeName = 'div';
	/** @type {boolean} */
	isCustomElem = false;
	/** @type {AbstractPropArray} @readonly */
	attributes = new AbstractPropArray();
	/** @type {DomEventBindings|null} */
	listens = null;
	/** @type {number|null} */
	section = null;
	/** @type {Stylesheet|null} */
	sWrapper = null;
	/** @type {{[key: string]: string}[]|null} */
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
			if (typeof obj.listens !== 'undefined') 
				/** @readonly */ this.listens = obj.listens;
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
 * @property {[string, string][]} [imperatives]
 * @property {PropDef[]} [props]
 * @property {StateDef[]} [states]
 * property {Command} [command]
 * @property {ReactivityQueryDef[]} [reactOnParent]
 * @property {ReactivityQueryDef[]} [reactOnSelf]
 * @property {EventSubscriptionDef[]} [subscribeOnParent]
 * @property {EventSubscriptionDef[]} [subscribeOnChild]
 * @property {EventSubscriptionDef[]} [subscribeOnSelf]
 * @property {string[]} [outputs]
 * @property {(ComponentTemplate|ViewTemplate)[]} [members]
 * @property {(ComponentTemplate|ViewTemplate)[]} [subSections]
 * @property {ListTemplateDef} [list]
 */

 class ComponentTemplate {
	/** @type {string} defined in ctor*/
	UID;
	/** @type {ViewTemplate} */
	view;
	/** @type {string|null} */
	type = null;
	/** @type {AbstractPropArray} @readonly */
	props = new AbstractPropArray();
	/** @type {AbstractPropArray} @readonly */
	states = new AbstractPropArray();
	// /** @type {Command|null} */
	// command = null;
	/** @type {ReactivityQueryArray} @readonly */
	reactOnParent = new ReactivityQueryArray();
	/** @type {ReactivityQueryArray} @readonly */
	reactOnSelf = new ReactivityQueryArray();
	/** @type {EventSubscriptionArray} @readonly */
	subscribeOnChild = new EventSubscriptionArray();
	/** @type {EventSubscriptionArray} @readonly */
	subscribeOnSelf = new EventSubscriptionArray();
	/** @type {string[]} */
	outputs = ['update'];
	/** @type {(ComponentTemplate|ViewTemplate)[]} @readonly */
	members = [];
	/** @type {(ComponentTemplate|ViewTemplate)[]} @readonly */
	subSections = [];
	/** @type {ListTemplate|null} */
	list = null;
	/** @type {string} @readonly */
	objectType = 'ComponentTemplate';
	
	/**
	 * @param {ComponentTemplateDef|null} [obj]
	 */
	constructor(obj) {
		/** @readonly */ this.UID = templateUIDGenerator.newUID();
		if (obj) {
			/** @readonly */ this.view = new ViewTemplate(obj.view);
			/** @readonly */ this.type = obj.type || null;
			/** @readonly */ if (obj.outputs) this.outputs = obj.outputs;

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
			
			/** @readonly */ this.list = obj.list ? new ListTemplate(obj.list) : null;
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
			this.subscribeOnChild,
			this.subscribeOnSelf
		];
	}
	get propsAreArrayOfEventQueries() {
		return [
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
 
 
 
 
 
 
 

 export {
	ViewTemplate,
 	ComponentTemplate,
 	ListTemplate,
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