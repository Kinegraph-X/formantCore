/**
 * @factory ElementFactory
 * 
 */


var AGDef = require('src/UI/defs/_arias&glyphsDef');

var elementConstructorDecorator_HSD = require('src/UI/_mixins/elementDecorator_HSD');
//var elementDecorator_Offset = require('src/UI/_mixins/elementDecorator_Offset');


var customElems;
	
	function ElementFactory () {
		this.implements = [];
//		this.defaultNodesDecorator = 'Hyphen-Star-Dash';
	}
	ElementFactory.prototype.objectType = 'ElementFactory';
	ElementFactory.prototype['Hyphen-Star-Dash'] = elementConstructorDecorator_HSD['Hyphen-Star-Dash'];
	
	ElementFactory.prototype.createElement = function (nodeName, isCustomElem, states) {
//		console.log(nodeName, isCustomElem);
		if (isCustomElem)
			return this.registerAndCreateElement(nodeName, states);
		else {
			var elem = document.createElement(nodeName);
			elem.setAria = ElementFactory.prototype.setAria;
			return elem;
		}
	}
	
	ElementFactory.prototype.createCollection = function (def, states) {
		var collection = document.createDocumentFragment();
		def.fragment.forEach(function(nodeDef, key) {
			nodeDef = nodeDef.getHostDef() || nodeDef;
			
			if (nodeDef.isCustomElem)
				elem = this.registerAndCreateElement(nodeDef, states);
			else
				elem = document.createElement(nodeDef.nodeName); 
//			elem = this.setAttributes(nodeDef.attributes, elem);
			collection.appendChild(elem);
		}, this);
		return collection
	}
	
	ElementFactory.prototype.registerAndCreateElement = function (nodeName, states) {
		if (!customElements.get(nodeName)) {
//			console.log('CustomElement ' + nodeName + ' shall be defined');
			this.defineCustomElem(nodeName, states);
		}
		return document.createElement(nodeName);
	}
	
	ElementFactory.prototype.defineCustomElem = function(nodeName, componentStates) {
		var values = [], states = componentStates ? componentStates.map(function(stateObject, key) {
			values[key] = stateObject.getValue();
			return stateObject.getName();
		}) : [];
		
		class HTMLExtendedElement extends HTMLElement {
			constructor() {
				super();
				this.attachShadow({mode : 'open'});
				states.forEach(function(stateName) {
					ElementFactory.prototype.propGetterSetter.call(this, stateName);
				}, this);
				this.setAria = ElementFactory.prototype.setAria;
			}
			
			// declare observables
			static get observedAttributes() {
				return states;
			}
			
			connectedCallback() {
//				states.forEach(function(stateName, key) {
//					// Init on forced state by the states obj (this allows to have no propagation on first prop setting)
//					// connectedCallback doesn't call attributeChangeCallback
//					if (this.streams[stateName]) {
//						this.streams[stateName].reflectedObj = this;
//						this[stateName] = values[key] === 'undefined' ? undefined : values[key];
//					}
//				}, this);
			}
			
			// mutation observer
			attributeChangedCallback(attrName, oldVal, newVal) {
				if (oldVal === newVal)
					return;
				var arias = AGDef.getArias(this.componentType);
				for(var aria in arias) {
					if (aria.indexOf(attrName) !== -1)
						(function(a) {this.setAttribute(a, newVal);})(aria);
				}
				if (this.streams[attrName] && this.streams[attrName].get() !== newVal)
					this.streams[attrName].value = this.getTypedValue(newVal);
					
				//Hack hidden behavior not inherited by custom elements (may be related to the presence of an explicit "diplay" in the CSS)
				if (attrName === 'hidden') {
					if (this.getTypedValue(newVal) === true)
						this.style.visibility = 'hidden';
					else
						this.style.visibility = 'visible';
				}
			}
			
			
			// helper methods
			getTypedValue(attrValue) {
				return ElementFactory.prototype.getTypedValue(attrValue);
			}
		}
//		console.log('CustomElement ' + nodeName + ' has been defined');
		customElements.define(nodeName, HTMLExtendedElement);
	}
	
	ElementFactory.prototype.setAria = function(ariaName, ariaValue) {
		this.setAttribute(ariaName.dromedarToHyphens(), ariaValue);
	}
	
	ElementFactory.prototype.setAttributes = function(attributes, node) {
		attributes.forEach(function(attrObject) {
			node[attrObject.getName()] = attrObject.getValue();
		});
	}
	
	ElementFactory.prototype.propGetterSetter = function(prop) {
		// FIXME: Big code duplication. Multi-test the override of native DOM getter-setters, and refactor
		var desc = (Object.getOwnPropertyDescriptor(this, prop) || Object.getPropertyDescriptor(this, prop));
		if (typeof desc !== 'undefined') {
			if (desc.configurable && desc.get) {
				desc.get = function() {
						return this.hasAttribute(prop) ? (this.getTypedValue ? this.getTypedValue(this.getAttribute(prop)) : ElementFactory.prototype.getTypedValue.call(this, this.getAttribute(prop))) : null;
					};
				desc.set = function(value) {
						// We're setting an attribute:  don't if the propName is camelCase 
						// For litteral values, Updating the Stream is handled by onAttributeChangeCallback
						if (prop !== 'content' && prop.toLowerCase() === prop && typeof value !== 'undefined' && typeof value !== 'object' && !Array.isArray(value)) {
							if (this.streams[prop].value !== value && this.nodeName.indexOf('-') === -1) {
								// special case for non-custom elements : attributeChange doesn't trigger the stream update
								this.streams[prop].value = value;
							}
							// case of double update on the attr can't be avoided when :
							// 		- we're reflecting the attr on the prop through the stream (marginal case of someone absolutely wanting to mutate the obj targetting the attr)
							// the stream won't update twice though : forward is set to false
							this.setAttribute(prop, value);
						}
						else {
							if (this.streams[prop].value !== value)
								this.streams[prop].value = value;
							((value === null || value === undefined) && this.removeAttribute(prop));
						}
					};
			}
		}
		else {
			Object.defineProperty(this, prop, {
				get : function() {
					return this.hasAttribute(prop) ? (this.getTypedValue ? this.getTypedValue(this.getAttribute(prop)) : ElementFactory.prototype.getTypedValue.call(this, this.getAttribute(prop))) : null;
				},
				set : function(value) {
					// We're setting an attribute:  don't if the propName is camelCase 
					
					// For litteral values, Updating the Stream is handled by onAttributeChangeCallback
					if (prop !== 'content' && prop.toLowerCase() === prop && typeof value !== 'undefined' && typeof value !== 'object' && !Array.isArray(value)) {
						if (this.streams[prop].value !== value && this.nodeName.indexOf('-') === -1) {
							// special case for non-custom elements : attributeChange doesn't trigger the stream update
							this.streams[prop].value = value;
						}
						// case of double update on the attr can't be avoided when :
						// 		- we're reflecting the attr on the prop through the stream (marginal case of someone absolutely wanting to mutate the obj targetting the attr)
						// the stream won't update twice though : forward is set to false
						this.setAttribute(prop, value);
						
					}
					else {
						if (this.streams[prop].value !== value)
							this.streams[prop].value = value;
						((value === null || value === undefined) && this.removeAttribute(prop));
					}
				}
			});
		}
	}
	
	ElementFactory.prototype.getTypedValue = function(attrValue) {
		var ret;
		if (typeof attrValue === 'string')
			return Boolean.prototype.tryParse(attrValue);
		else if (!isNaN((ret = parseInt(attrValue))))
			return ret;
		else
			return attrValue;
	}
	


module.exports = (new ElementFactory());