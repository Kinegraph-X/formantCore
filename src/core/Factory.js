/**
 * @Singletons : Core factories
 */

var TypeManager = require('src/core/TypeManager');

logLevelQuery = window.location.href.match(/(log_level=)(\d+)/); 					// Max log_level = 8 
window.logLevel = Array.isArray(logLevelQuery) ? logLevelQuery[2] : undefined;
delete window.logLevelQuery;

var Factory = (function() {
	
	/**
	 * from https://github.com/Dash-Industry-Forum/dash.js/.../Factory.js
	 */
	/**
	 * The copyright in this software is being made available under the BSD License,
	 * included below. This software may be subject to other third party and contributor
	 * rights, including patent rights, and no such rights are granted under this license.
	 *
	 * Copyright (c) 2013, Dash Industry Forum.
	 * All rights reserved.
	 *
	 * Redistribution and use in source and binary forms, with or without modification,
	 * are permitted provided that the following conditions are met:
	 *  * Redistributions of source code must retain the above copyright notice, this
	 *  list of conditions and the following disclaimer.
	 *  * Redistributions in binary form must reproduce the above copyright notice,
	 *  this list of conditions and the following disclaimer in the documentation and/or
	 *  other materials provided with the distribution.
	 *  * Neither the name of Dash Industry Forum nor the names of its
	 *  contributors may be used to endorse or promote products derived from this software
	 *  without specific prior written permission.
	 *
	 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
	 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
	 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
	 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
	 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
	 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
	 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
	 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
	 *  POSSIBILITY OF SUCH DAMAGE.
	 */
	/**
	 * @module FactoryMaker
	 */
	var FactoryMaker = (function () {

	    var instance;
	    var extensions = [];
	    var singletonContexts = [];

	    function extend(name, childInstance, override, context) {
	        var extensionContext = getExtensionContext(context);
	        if (!extensionContext[name] && childInstance) {
	            extensionContext[name] = {instance: childInstance, override: override};
	        }
	    }

	    /**
	     * Use this method from your extended object.  this.factory is injected into your object.
	     * this.factory.getSingletonInstance(this.context, 'VideoModel')
	     * will return the video model for use in the extended object.
	     *
	     * @param {Object} context - injected into extended object as this.context
	     * @param {string} className - string name found in all dash.js objects
	     * with name __factory_name Will be at the bottom. Will be the same as the object's name.
	     * @returns {*} Context aware instance of specified singleton name.
	     * @memberof module:FactoryMaker
	     * @instance
	     */
	    function getSingletonInstance(context, className) {
	        for (var i in singletonContexts) {
	            var obj = singletonContexts[i];
	            if (obj.context === context && obj.name === className) {
	                return obj.instance;
	            }
	        }
	        return null;
	    }

	    /**
	     * Use this method to add an singleton instance to the system.  Useful for unit testing to mock objects etc.
	     *
	     * @param {Object} context
	     * @param {string} className
	     * @param {Object} instance
	     * @memberof module:FactoryMaker
	     * @instance
	     */
	    function setSingletonInstance(context, className, instance) {
	        for (var i in singletonContexts) {
	            var obj = singletonContexts[i];
	            if (obj.context === context && obj.name === className) {
	                singletonContexts[i].instance = instance;
	                return;
	            }
	        }
	        singletonContexts.push({ name: className, context: context, instance: instance });
	    }

	    function getClassFactory(classConstructor) {
	        return function (context) {
	            if (context === undefined) {
	                context = {};
	            }
	            return {
	                create: function () {
	                    return merge(classConstructor.__factory_name, classConstructor.apply({ context: context }, arguments), context, arguments);
	                }
	            };
	        };
	    }

	    function getSingletonFactory(classConstructor) {
	        return function (context) {
	            var instance;
	            if (context === undefined) {
	                context = {};
	            }
	            return {
	                getInstance: function () {
	                    // If we don't have an instance yet check for one on the context
	                    if (!instance) {
	                        instance = getSingletonInstance(context, classConstructor.__factory_name);
	                    }
	                    // If there's no instance on the context then create one
	                    if (!instance) {
	                        instance = merge(classConstructor.__factory_name, classConstructor.apply({ context: context }, arguments), context, arguments);
	                        singletonContexts.push({ name: classConstructor.__factory_name, context: context, instance: instance });
	                    }
	                    return instance;
	                }
	            };
	        };
	    }

	    function merge(name, classConstructor, context, args) {
	        var extensionContext = getExtensionContext(context);
	        var extensionObject = extensionContext[name];
	        if (extensionObject) {
	            var extension = extensionObject.instance;
	            if (extensionObject.override) { //Override public methods in parent but keep parent.
	                extension = extension.apply({ context: context, factory: instance, parent: classConstructor}, args);
	                for (var prop in extension) {
	                    if (classConstructor.hasOwnProperty(prop)) {
	                        classConstructor[prop] = extension[prop];
	                    }
	                }
	            } else { //replace parent object completely with new object. Same as dijon.
	                return extension.apply({ context: context, factory: instance}, args);
	            }
	        }
	        return classConstructor;
	    }

	    function getExtensionContext(context) {
	        var extensionContext;
	        extensions.forEach(function (obj) {
	            if (obj === context) {
	                extensionContext = obj;
	            }
	        });
	        if (!extensionContext) {
	            extensionContext = extensions.push(context);
	        }
	        return extensionContext;
	    }

	    instance = {
	        extend: extend,
	        getExtensionContext : getExtensionContext,
	        getSingletonInstance: getSingletonInstance,
	        setSingletonInstance: setSingletonInstance,
	        getSingletonFactory: getSingletonFactory,
	        getClassFactory: getClassFactory
	    };

	    return instance;

	})();
	
	/**
	 * An Interface to be implemented by a module which needs to host childModules
	 * @implements an event emitter pattern
	 * @constructor
	 * @interface
	 */
	var CoreModule = function(def, containerID, automakeable, enableEventSetters) {
		
		this.objectType = 'CoreModule';
		this._key;
		this._parent;
		this.hostComponent;
		this.modules = [];
		this._eventHandlers = {};
		this._one_eventHandlers = {};
		this._identified_eventHandlers = {};
		
		this.enableEventSetters = enableEventSetters || false;
		
		this.subscribeOnChild = [];
		this.subscribeOnSelf = [];
	};
	
	// Theses methods should be implemented further down in the inheritance chain : 
	// 		asynchronously adding children : progressive creation in UIModule implies managing a "raw" status on the component
	CoreModule.prototype.asyncAddChild = function(child) {} 						// Virtual
	CoreModule.prototype.asyncAddChildren = function(oneShot) {} 					// Virtual
	// 		attaching observables for reactivity : the ObservableComponent class is responsible for implementing this virtual method
	CoreModule.prototype.onRegisterModule = function() {} 							// Virtual
	
	/**
	 * @param {object} candidateModule : an instance of another module
	 */
	CoreModule.prototype.registerModule = function(moduleName, candidateModule, moduleDefinition, atIndex, noNum) {
		if (!candidateModule)
			return;
		
		candidateModule.__created_as_name = moduleName;
		candidateModule._parent = this;
		if (!isNaN(parseInt(atIndex))) {
			((candidateModule.hostElem && this.modules[atIndex - 1] && this.modules[atIndex - 1].hostElem) ? this.modules[atIndex - 1].hostElem.insertAdjacentElement('afterEnd', candidateModule.hostElem) : this.hostElem.appendChild(candidateModule.hostElem));
			this.modules.splice(atIndex, 0, candidateModule);
			if (!noNum)
				this.generateNumeration(atIndex);
		}
		else
			this.modules.push(candidateModule);
		
		if (candidateModule instanceof HTMLElement)
			return candidateModule;
		else {
			
			// Subscribing to events pertains to the CoreModule
			this.handleModuleSubscriptions(candidateModule);
			
			if (moduleDefinition)
				// heuristic targetSlot definition (reactivity may rely on "early-defined" slots)
				this.handleSlotDefinitionRelativeToParent(candidateModule, moduleDefinition);
			
			// The ObservableComponent class is responsible for implementing the reactions on parent and on self (binding to streams) 
			this.onRegisterModule(candidateModule);
		}
		
		return candidateModule;
	}
	
	CoreModule.prototype.handleModuleSubscriptions = function(candidateModule) {
//		console.log(candidateModule);
		if (candidateModule.subscribeOnParent.length)
			candidateModule.subscribeOnParent.forEach(function(subscription, key) {
				subscription.subscribeToEvent(this, candidateModule);
			}, this);
		
		if (this.subscribeOnChild.length)
			this.subscribeOnChild.forEach(function(subscription, key) {
				subscription.subscribeToEvent(candidateModule, this);
			}, this);
		
		if (candidateModule.subscribeOnSelf.length)
			candidateModule.subscribeOnSelf.forEach(function(subscription, key) {
				subscription.subscribeToEvent(this, this);
			}, candidateModule);
	}
	
	CoreModule.prototype.generateNumeration = function(atIndex) {
		for (var i = atIndex, l = this.modules.length; i < l; i++) {
			this.modules[i]._key = atIndex + i;
		}
	}
	
	
	
	
	
	/**
	 * @param {string} moduleName
	 */
	CoreModule.prototype.removeModule = function(moduleKey) {
		if (!this.modules.length)
			return false;
		var removed;
		this.modules[moduleKey].hostElem.remove();
		removed = this.modules.splice(moduleKey, 1)[0];
		(moduleKey < this.modules.length && this.generateNumeration(moduleKey));
		return removed;
	}
	
	/**
	 * @param {string} moduleName
	 */
	CoreModule.prototype.getModule = function(moduleName) {
		if (!this.modules.length)
			return false;
		var idx;
		if (!isNaN(parseInt(idx = this.modules.indexOfObjectByValue('__created_as_name', moduleName)))) {
			return this.modules[idx];
		}
		return false;
	}
	
	/**
	 * @param {string} moduleName
	 */
	CoreModule.prototype.queryModules = function(moduleName) {
		if (!this.modules.length)
			return false;
		var arr;
		if (Array.isArray((arr = this.modules.findObjectsByPartialValue('__created_as_name', moduleName)))) {
			return arr;
		}
		return false;
	}
	
	/**
	 * @param {TypeManager.HierarchicalComponentDefModel{
	 * 		host : ComponentListDefModel
	 * 	}
	 * } cListDef
	 * @param {Number} atIndex
	 */
	CoreModule.prototype.addModules = function(cListDef, atIndex) {
		
		if (atIndex > this.modules.length)
			return false;
		
		var baseName, name, key, def, root, componentGroup,
			componentCtor = cListDef.getHostDef().templateCtor;
		var idx = (isNaN(parseInt(atIndex)) || atIndex >= this.modules.length) ? this.modules.length : (atIndex || 0);

		// TODO : handle the case where a listItem is appended to a "not last child" subSection  (NOT WORKING)
		var root = this.hostElem,
			def = cListDef.getHostDef().template,
			baseName = 'componentListItem';

		cListDef.getHostDef().each.forEach(function(item, key) {
			key = key + idx;
			name = baseName + key.toString();

			UIModule.prototype.makeAndRegisterModule.call(this, name, (componentGroup = new componentCtor(def, root)), def, atIndex++, 'noNum');
			componentGroup._key = key;
			componentCtor.prototype.handleReflectionOnModel.call(this, cListDef, componentGroup.streams, item);
		}, this);
		this.generateNumeration(idx);
	}
	
	/**
	 * @param {TypeManager.HierarchicalComponentDefModel{
	 * 		host : ComponentListDefModel
	 * 	}
	 * } cListDef
	 * @param {Number} atIndex
	 */
	CoreModule.prototype.addModule = function(cListDef, atIndex) {
		
		if (atIndex > this.modules.length)
			return false;
		
		var name, def, root, componentGroup, componentCtor = cListDef.getHostDef().templateCtor;
		var idx = (isNaN(parseInt(atIndex)) || atIndex >= this.modules.length) ? this.modules.length : (atIndex || 0),
			name = 'componentListItem' + idx;

		// TODO : handle the case where a listItem is appended to a "not last child" subSection (NOT WORKING)
//		var root = ((this.modules[1] && ([...this.hostElem.childNodes]).indexOf(this.modules[1].hostElem) !== -1) || !this.modules.length) ? this.hostElem : this.hostElem.lastChild,

		UIModule.prototype.makeAndRegisterModule.call(this, name, (componentGroup = new componentCtor(cListDef.host.template, this.hostElem)), cListDef.host.template, atIndex);
		componentGroup._key = idx;
		componentCtor.prototype.handleReflectionOnModel.call(this, cListDef, componentGroup.streams, cListDef.getHostDef().item);
	}
	
	/**
	 * @param {string} moduleName
	 */
	CoreModule.prototype.clearAllModules = function() {
		(this.hostElem && this.hostElem.remove());
		this.modules.length = 0;
		return true;
	}
	
	/**
	 * @param {string} moduleName
	 */
	CoreModule.prototype.remove = function() {
		if (!this.modules.length)
			return false;
		if (this._parent.modules.indexOf(this) !== -1) {
			return this._parent.removeModule(this._key);
		}
		return false;
	}
	
	
	/**
	 * Creates a listenable event : generic event creation (onready, etc.)
	 * 
	 * @param {string} eventType
	 */
	CoreModule.prototype.createEvent = function(eventType) {
		this._eventHandlers[eventType] = []; // ['forcejQueryExtension']
		this._one_eventHandlers[eventType] = []; // ['forcejQueryExtension']
		this._identified_eventHandlers[eventType] = []; // ['forcejQueryExtension'] 	// identified event handlers are meant to be disposable
	}

	/**
	 * Deletes... an event
	 * 
	 * @param {string} eventType
	 */
	CoreModule.prototype.deleteEvent = function(eventType) {
		delete this['on' + eventType];
	}

	/**
	 * @param {string} eventType
	 * @param {function} handler : the handler to remove (the associated event stays available) 
	 */
	CoreModule.prototype.removeEventListener = function(eventType, handler) {
		if (typeof this._eventHandlers[eventType] === 'undefined')
			return;
		for(var i = 0, l = this._eventHandlers[eventType].length; i < l; i++) {
			if (this._eventHandlers[eventType][i] === handler) {
				this._eventHandlers[eventType].splice(i, 1);
			}
		}
		for(var i = 0, l = this._one_eventHandlers[eventType].length; i < l; i++) {
			if (this._one_eventHandlers[eventType][i] === handler) {
				this._one_eventHandlers[eventType].splice(i, 1);
			}
		}
		for(var i = 0, l = this._identified_eventHandlers[eventType].length; i < l; i++) {
			if (this._identified_eventHandlers[eventType][i] === handler) {
				this._identified_eventHandlers[even-tType].splice(i, 1);
			}
		}
	}
	
	
	
	/**
	 * These methods are only able to add "permanent" handlers : "one-shot" handlers must be added by another mean 
	 * @param {string} eventType
	 * @param {function} handler : the handler to add 
	 * @param {number} index : where to add
	 */
	CoreModule.prototype.addEventListener = function(eventType, handler) {
		if (typeof this._eventHandlers[eventType] === 'undefined')
			return;
		this._eventHandlers[eventType].push(handler);
	}
	CoreModule.prototype.addEventListenerAt = function(eventType, handler, index) {
		if (typeof this._eventHandlers[eventType] === 'undefined')
			return;
		this._eventHandlers[eventType].splice(index, 0, handler);
	}
	
	CoreModule.prototype.removeEventListenerAt = function(eventType, index) {
		if (typeof this._eventHandlers[eventType] === 'undefined')
			return;
		if (typeof index === 'number' && index < this._eventHandlers[eventType].length) {
			this._eventHandlers[eventType].splice(index, 1);
		}
	}
	
	CoreModule.prototype.clearEventListeners = function(eventType) {
		if (typeof this._eventHandlers[eventType] === 'undefined')
			return;
		this._eventHandlers[eventType].length = 0;
		this._one_eventHandlers[eventType].length = 0;
	}

	/**
	 * Generic Alias for this['on' + eventType].eventCall : this alias can be called rather than the eventCall property
	 * @param {string} eventType
	 * @param {any} payload 
	 */ 
	CoreModule.prototype.trigger = function(eventType, payload, eventIdOrBubble, eventID) {
		if (typeof this._eventHandlers[eventType] === 'undefined' && typeof this._one_eventHandlers[eventType] === 'undefined' && typeof this._identified_eventHandlers[eventType] === 'undefined') {
			if (logLevel > 7)
				console.warn(this.objectType, 'event ' + eventType + ' triggered', 'Not an event');
			return;
		}
		else if (this._eventHandlers[eventType].length === 0 && this._one_eventHandlers[eventType].length === 0 && this._identified_eventHandlers[eventType].lentgh === 0) {
			if (logLevel > 7)
				console.log(this.objectType, 'event ' + eventType + ' triggered', 'No Handler');
			return;
		}
		
		var bubble = false;
		if (typeof eventIdOrBubble === 'boolean')
			bubble = eventIdOrBubble;
		else
			eventID = eventIdOrBubble;
		
		if (logLevel > 7)
			console.log(this.objectType, 'event ' + eventType + ' triggered', payload, eventID);//, this._eventHandlers);
//		if (logLevel > 7)
//			console.log(this.objectType, 'event ' + eventType, this._one_eventHandlers);
		
//		console.log('trigger ' + eventType, this._eventHandlers[eventType]);
		
		for(var i = 0, l = this._eventHandlers[eventType].length; i < l; i++) {
//			console.log(eventType);
			if (typeof this._eventHandlers[eventType][i] === 'function')
				this._eventHandlers[eventType][i]({type : eventType, data : payload, bubble : bubble});
		}
		
//		console.log('trigger ' + eventType, this._one_eventHandlers[eventType])
		for(var i = this._one_eventHandlers[eventType].length - 1; i >= 0; i--) {
//			console.log('trigger ' + typeof this._one_eventHandlers[eventType][i])
			if (typeof this._one_eventHandlers[eventType][i] === 'function') {
				this._one_eventHandlers[eventType][i]({type : eventType, data : payload, bubble : bubble});
				delete this._one_eventHandlers[eventType][i];
			}
		}
		
		var deleted = 0;
		if (typeof eventID !== 'undefined' && eventID !== 0) {
//			console.log('trigger ' + eventType, this._identified_eventHandlers[eventType])
			for(var i = this._identified_eventHandlers[eventType].length - 1; i >= 0; i--) {
//				if (typeof this._identified_eventHandlers[eventType][i] === 'object' && eventID === this._identified_eventHandlers[eventType][i]['id']) {
//					this._identified_eventHandlers[eventType][i]({type : eventType, data : payload})
//					delete this._identified_eventHandlers[eventType][i];
//				}
//				else
//					deleted++;
				if (typeof this._identified_eventHandlers[eventType][i] === 'undefined')
					deleted++;
				else if (eventID === this._identified_eventHandlers[eventType][i]['id']) {
					if (typeof this._identified_eventHandlers[eventType][i] === 'object') {
						this._identified_eventHandlers[eventType][i].f({type : eventType, data : payload, bubble : bubble})
						delete this._identified_eventHandlers[eventType][i];
					}
				}
			}
		}
			
//		console.log('reset ' + eventType, this.objectType, arguments)
		this._one_eventHandlers[eventType] = []; // ['forcejQueryExtension']
		if (deleted === this._identified_eventHandlers[eventType].length)
			this._identified_eventHandlers[eventType] = []; // ['forcejQueryExtension']
//		console.trace();
//		console.log(eventType, this._one_eventHandlers[eventType].length);
	}
	
	CoreModule.prototype.callModuleMethod = function(calledModule, calledMethod) {
		var args = Array.prototype.slice.call(arguments, 2);
		if (this.modules[calledModule] && typeof this.modules[calledModule][calledMethod] === 'function')
			return this.modules[calledModule][calledMethod].apply(this.modules[calledModule], args);
	}
	
	
	
	/**
	 * Core Module {implements} method
	 */
	// static method
	CoreModule.prototype.addInterface = CoreModule.addInterface = function(base, extension) {
		var self = this, objectType = base.prototype.objectType;

		var mergedConstructor = function() {
			base.apply(this, arguments);
			extension.apply(this, arguments);
//			
			// cf. upper com ("CAUTION")
			(this.command && (this.command = new Command(this.command.action, this.command.canAct, this.command.undo)));

			(extension.prototype.pushToRenderQueue && this.DOMRenderQueue.push(extension.prototype.pushToRenderQueue.call(this)));
			(extension.prototype.pushToBindingQueue && this.bindingQueue.push(extension.prototype.pushToBindingQueue.call(this)));
			
			this.objectType = objectType;
			this.implements.push(extension.prototype.objectType);
		};

		// interface prototype depth is limited to 1 (mergeOwnProperties tests hasOwnProperty)
		// limit extended to 2 when setting keepNonStdProtos to "true"
		mergedConstructor.prototype = this.mergeOwnProperties(base.prototype, extension.prototype);
		mergedConstructor.prototype.constructor = mergedConstructor;
		mergedConstructor.prototype.objectType = objectType;
		return mergedConstructor;
	}
	// mergeOwnProperties is part of the abstract class but also usable as a static method
	// Pass "true" as first argument if we want to retrieve the custom prototype of the injected object in the target object
	// (though still seemingly not allowing to merge objects referencing domElements : 
	// appart from instances of jQuery, which MAY be already loaded, and to which we simply create a reference, then the first boolean is not necessary)
	CoreModule.prototype.mergeOwnProperties = CoreModule.mergeOwnProperties = function() {
		var self = this, keepNonStdProtos = false, obj, desc, isArray, isObj, len,
			target = (typeof arguments[0] === 'boolean'
						&& arguments[0]
						&& (keepNonStdProtos = true))
							? arguments[1]
									: arguments[0] || {},
			i = keepNonStdProtos ? 2 : 1,
			length = arguments.length,
			testObj;

		for ( ; i < length; i++ ) {
			// Only deal with non-null/undefined values
			if ((obj = arguments[ i ]) != null) {
				testObj = Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(obj)));

				// Extend the base object
				testObj.forEach(function(name) {
					if (!obj.hasOwnProperty(name) && !keepNonStdProtos)
						return;
					else if (keepNonStdProtos && target.prototype === Object.prototype && obj.prototype[name]) {
						target.prototype = obj.prototype;
						return;
					}
					desc = Object.getOwnPropertyDescriptor(obj, name);
					if (!desc.get) {
						if ((isArray = Array.isArray(obj[name])) || (isObj = (Object.prototype.toString.call(obj[name]) === '[object Object]'))) {
							len = obj[name].length || Object.keys(obj[name]).length;
							if (len) {
								if (typeof $ !== 'undefined' && obj[name] instanceof $)
									target[name] = obj[name];
								else
									target[name] = self.mergeOwnProperties(target[name] || (isArray ? [] : {}), obj[name]);
							}
							else
								target[name] = isArray ? [] : {};
						}
						else if (obj[name] || obj[name] === null) 	// copy null values : null is sometimes explicitly tested
							target[name] = obj[name];
						else if (typeof obj[name] !== 'function' && typeof obj[name] !== 'undefined' && obj[name] !== null)
							target[name] = typeof obj[name] === 'string' ? '' : 0;
					}
					else {
						Object.defineProperty(target, name, {
							enumerable : desc.enumerable,
							configurable : desc.configurable,
							get : desc.get,
							set : desc.set
						});
					}
				});
			}
		}
		return target;
	}
	
	
	CoreModule.prototype.destroy = function() {
		for (var i = 0, l = this.modules.length; i < l; i++) {
			this.modules[i].destroy();
			this.modules[i].trigger('destroy');
		}
	}
	CoreModule.prototype.objectType = 'CoreModule';
	CoreModule.__factory_name = 'CoreModule';
	
	
	
	
	/**
	 * An Interface to be implemented by a module designed as asynchronous (will then publish state changes)
	 * @constructor
	 * @extends CoreModule
	 * @interface
	 */
	
	var AsynchronousModule = function(parent) {
		CoreModule.call(this);
		this.state = 'init';
		this.oldStatusCached = this.statusCached = 'idle';
		this.parent = parent;
		this.statusResolve = Promise.resolve(this.statusCached);
		this.objectType = 'AsynchronousModule';
		this.createEvent('readystatechange');
		this.createEvent('statuschange');
	};

	AsynchronousModule.prototype = Object.create(CoreModule.prototype);
	AsynchronousModule.prototype.objectType = 'AsynchronousModule';
	AsynchronousModule.prototype.constructor = AsynchronousModule;
	
	Object.defineProperty(AsynchronousModule.prototype, 'readyState', {
		enumerable : false,
		configurable : true,
		get : function() {
			return this.state;
		},
		set : function(state) {
//			console.log(state)
			this.state = state;
			if (typeof this.parent !== 'undefined' && typeof this.parent._eventHandlers['readyStateChange'] !== 'undefined')
				this.parent.trigger('readyStateChange', [this.objectType + 'readystatechange'].concat(this.getPublicValues()));
			else
				this.trigger('readystatechange', [this.state].concat(this.getReadyStateParams()));
		}
	});
	
	Object.defineProperty(AsynchronousModule.prototype, 'status', {
		enumerable : false,
		configurable : true,
		get : function() {
			return this.statusCached;
		},
		set : function(status) {
			var self = this;
			this.oldStatusCached = this.statusCached;
			this.statusCached = status;
			if (['seeking', 'pending'].indexOf(status) !== -1) {
				this.statusResolve = new Promise(function(resolve, reject) {
					var func = function(e) {
						if (['paused', 'playing'].indexOf(e.data) !== -1) {
							resolve(e.data);
							self.removeEventListener('statuschange', func);
						}
					}.bind(this);
					self.onstatuschange = func
				});
			}
			else
				this.statusResolve = Promise.resolve(this.statusCached);

			this.trigger('statuschange', status);
		}
	});
	
	AsynchronousModule.prototype.getReadyStateParams = function() {		// dummy
		return [];
	}
	
	
	
	
		
	/**
	 * An Interface to be implemented by a module supposed to be hosted (and eventually host child instances)
	 * @constructor
	 * @extends CoreModule
	 * @interface
	 */
	var DependancyModule = function() {
		CoreModule.call(this);
		this.objectType = 'DependancyModule';
		this.subscribeOnParent = [];
		this.createEvent('destroy');
		this.createEvent('exportdata');
	};

	DependancyModule.prototype = Object.create(CoreModule.prototype);
	DependancyModule.prototype.objectType = 'DependancyModule';
	DependancyModule.prototype.constructor = DependancyModule;
	
	DependancyModule.prototype.callMethod = function(methodName) {
		var args = arguments.slice(1);
		if (typeof this[methodName] === 'function')
			return this[methodName].apply(this, args);
	}
	
	DependancyModule.prototype.exportData = function(data) { 	// default
		// additional code here //
		this.trigger('exportdata', data);
	}

	DependancyModule.__factory_name = 'DependancyModule';
	
	
	
	/**
	 * An Interface to be implemented by a UI Module
	 * 
	 * There are various allowed instanciation principles :
	 * 
	 * 	- composition of components, through the initial def => 2 cases :
	 * 		-* composition from flat def : the main path is to declare a type in the def, then the componentGroup ctor pushes the whole bunch in a hierarchy of components (3 levels max)
	 * 		-* extension through an inherited class : a special case has been defined for the "basically informative" pictograms (valid, disabled, etc.) : they are "secretly" appended through an inherited subClass 
	 * 	- composition of "(not necessarily) passive" DOM nodes, through a default def on the child component,
	 * 	- DOM extension, where we wish it'd be flat extension (but depth is allowed through innerHTML <== EVIL, use it with caution), through decorators, as mixins on a "child or host" component,
	 * and last but not least,
	 * 	- composition through "by default instanciated children" (mainly in the component's ctor). You may give thanks, it's queued (comes, in any case, after all other DOM extensions, and then children declared in the ctor, finally a unique child declared by overloading the addChild method).
	 * 
	 * @constructor
	 * @extends DependancyModule
	 * @interface
	 * 
	 * @param {Object} def : custom object that defines the UI (generally a list of properties and behaviors for a button)
	 * @param {Object} (DOMElem Instance) parentNode
	 * @param {string} buttonClassName
	 */
	var UIModule = function(definition, parentNodeDOMId, automakeable) {
		this.raw = true;
		
		DependancyModule.call(this);
		this.objectType = 'UIModule';
		
		this.reactOnParent = [];
		this.reactOnSelf = [];
		
		this.attributes = [];
		this.props = [];
		this.states = [];
		
		this.parentDOMNode;
		this.hostElem;
		this.rootElem;
		this.hoverElem;
		this.defaultSlot;
		this.slots;
		
		this.DOMRenderQueue = [];
		this.childrenToAdd = [];
		this.bindingQueue = [];
		
		this.mergeWithComponentDefaultDef(definition, this.createDefaultDef());
		
		this.parentNodeDOMId = parentNodeDOMId;
		this.command = (definition.getHostDef() && definition.getHostDef().command);
		this.keyboardSettings;
		this.keyboardEvents = definition.getHostDef().keyboardEvents || [];

//		(typeof targetSlot === 'number' && (this.defaultSlot = (this.rootElem || this.hostElem).children[targetSlot]));
		
		(definition && this.immediateInit());
		(automakeable && this.raw && this.Make(definition));
	};

	/**
	 * HOOKS
	 */
	UIModule.prototype = Object.assign(Object.create(DependancyModule.prototype), {
		objectType : 'UIModule',
		constructor : UIModule,
		beforeMake : function() {},						// virtual
		afterMake : function() {},						// virtual
		beforeCreateDOM : function() {},				// virtual
		createDOM : function() {},						// virtual
		completeDOM : function() {},					// virtual
		basicEarlyDOMExtend : function() {},			// virtual
		basicLateDOMExtend : function() {},				// virtual
		asyncAddChild : function() {},					// virtual
		afterCreateDOM : function() {},					// virtual
		setDOMTypes : function() {},					// virtual
		setArias : function() {},						// virtual
		beforeRegisterEvents : function() {},			// virtual
		createObservables : function() {},				// virtual
		initGenericEvent : function() {					// virtual		// this is implemented by the genericComponent : and is of no use here
//			return this.genericEvent();
		},
		registerClickEvents : function() {},			// virtual
		registerLearnEvents : function() {},			// virtual
		registerKeyboardEvents : function() {},			// virtual
		registerDOMChangeObservers : function() {},		// virtual
		afterRegisterEvents : function() {},			// virtual
		registerValidators : function() {},				// virtual
		resize : function() {}							// virtual
	});
	
	/**
	 * @extends CoreModule (not virtual)
	 */
	UIModule.prototype.makeAndRegisterModule = function(moduleName, candidateModule, moduleDefinition, atIndex) {
		if (candidateModule.raw)
			candidateModule.Make(moduleDefinition);
		this.registerModule(moduleName, candidateModule, moduleDefinition, atIndex);
		return candidateModule;
	}
	
	/**
	 * @abstract
	 */
	UIModule.prototype.immediateInit = function() {
		this.createEvents();
		this.createObservables();
		this.registerValidators();
		
	}
	/**
	 * @abstract
	 */
	UIModule.prototype.Make = function(definition) {
		this.raw = false;						// disable "raw" first (seems logical... TODO:  was there a purpose on that comment ?)
		this.beforeMake(definition);
		this.init(definition);
		this.afterMake(definition);
	}
	/**
	 * @abstract
	 */
	UIModule.prototype.init = function(definition) {
		this.create(definition);
		this.registerEvents();

		this.firstRender();
		
		this.execBindingQueue(definition);
	}
	/**
	 * @abstract
	 */
	UIModule.prototype.createEvents = function() {
		this.createEvent('clicked');
		this.createEvent('update');
		this.createEvent('stroke');
	}
	/**
	 * @abstract
	 */
	UIModule.prototype.create = function(definition) {
		this.beforeCreateDOM(definition);
		this.createDOM(definition);
		this.completeDOM();
		this.basicEarlyDOMExtend();
		this.renderDOMQueue(definition);
		this.basicLateDOMExtend();
		this.compose();
		this.afterCreateDOM(definition);
		this.setDOMTypes();
		this.setArias();
	}

	/**
	 * @virtual with default implementation
	 */
	UIModule.prototype.createDefaultDef = function() {				// virtual
		return TypeManager.createComponentDef({host : {}}, 'defaultDef');
	}
	
	/**
	 * @abstract
	 */
	UIModule.prototype.mergeWithComponentDefaultDef = function(definition, defaultDef) {
		
		if (definition.getGroupHostDef() || definition.getHostDef().getType() === 'ComponentList')
			return;

		var defaultHostDef = defaultDef.getHostDef(),
		hostDef = definition.getHostDef();
		
		for(var prop in defaultHostDef) {
			// TODO : try to precisely avoid to keep references on attributes, props & states (and more difficult : on reactOnParent, reactOnSelf, subscribeOnChild, subscribeOnParent)
			if (Array.isArray(this[prop]))
				this[prop] = this[prop].concat(defaultHostDef[prop], hostDef[prop]);
//				this[prop] = this[prop].concat(defaultHostDef[prop], TypeManager.ValueObject.prototype.renewArray(hostDef[prop], prop));
			else if (prop === 'sWrapper')							// TODO : use the cache for stylesheets : in a shadowRoot, appending many times won't work, so we need here a clone of the styleElem
				this[prop] = hostDef[prop] || defaultHostDef[prop];
			else if (hostDef[prop] === null)
				hostDef[prop] = defaultHostDef[prop];
		}
		
		if (defaultDef.subSections.length || defaultDef.members.length) {
			if (defaultDef.subSections.length)
				definition.subSections = defaultDef.subSections.concat(definition.subSections);
			if (defaultDef.members.length)
				definition.members = defaultDef.members.concat(definition.members);
		}
	};
	
	/**
	 * @abstract
	 */
	UIModule.prototype.compose = function() {
		this.asyncAddChild();
		// finalize DOM composition
		if (this.childrenToAdd.length)
			this.asyncAddChildren();
		// define "slots" for DOM children fast access from child components
		if (this.rootElem || this.hostElem) {
			(!this.defaultSlot && (this.defaultSlot = (this.rootElem || this.hostElem).firstChild) || this.hostElem);
			this.slots = (this.rootElem || this.hostElem).childNodes;
		}
	}
	
	UIModule.prototype.registerEvents = function() {
		this.beforeRegisterEvents();
		this.registerDOMChangeObservers();
		this.registerClickEvents();
		this.registerKeyboardEvents();
		(this.hoverElem && this.registerLearnEvents());
		this.afterRegisterEvents();
	}
	
	
	
	/**
	 * A whole lot of async abilities for extending the DOM
	 * 
	 * @method renderDOMQueue : mixins may have set a list of DOM nodes to append
	 * @method asyncAddChild : call this method in the ctor -or- overload it in the proto to add a child to the async children list
	 * @method asyncAddChildren : ctors and/or component-override-in-the-proto may have set a list of non-raw components to append
	 */
	
	
	/**
	 * @abstract
	 */
	UIModule.prototype.renderDOMQueue = function(definition) {
		var componentDef = definition.getHostDef(),
			def,
			elem;
//		console.log(this.DOMRenderQueue);
		this.DOMRenderQueue.forEach(function(renderFunc, key) {
			// DOM extension is considered as an "allowed" goal of the offered mixin mecanism
			// BUT : renderFunc may not always return a def : this allow mixins to use "targeted composition" instead of "basic nodes concatenation"
			// => they should then define and append themselves some child-modules (call to registerModule with a component as arg)
			// but still, we encourage devs (in both cases) to use the 'renderQueue" mecanism, as it frees the lifecycle from "custom" lifecycle phases (these phases may then be used for "real" special cases)
			if (!(def = renderFunc.call(this, componentDef)))
				return;
			
			if (def.wrapper)
				(this.rootElem || this.hostElem).appendChild(def.wrapper);
			if (def.members && def.members.length) {
				if (def.wrapper) {
					elem = this.rootElem ? this.rootElem.lastChild : this.hostElem.lastChild;
					def.members.forEach(function(member, k) {
						elem.appendChild(member);
					}, this);
				}
				else {
					elem = this.rootElem ? this.rootElem : this.hostElem;
					def.members.forEach(function(member, k) {
						elem.appendChild(member);
					}, this);
				}
			}
		}, this);
	}

	/**
	 * @abstract
	 */
	UIModule.prototype.asyncAddChildren = function(oneShot) {
		
		var names = {};
		// prevent masking of already "incremented" subModule names
		this.modules.forEach(function(module) {
			(typeof names[module.objectType] === 'undefined' ? names[module.objectType] = 0 : ++names[module.objectType])
		});
		
		this.childrenToAdd.forEach(function(module) {
			// it's not allowed to add "raw" children
			// if the module is referenced in the array AND as a parameter, it'll be registered immediately
			if (module.raw || (oneShot && module !== oneShot))
				return;
			// register subModule
			this.makeAndRegisterModule(this.maintainUniqueNames(names, module.objectType), module);
		}, this);
	}
	
	
	/**
	 * @abstract
	 */
	UIModule.prototype.handleSlotDefinitionRelativeToParent = function(candidateModule, def) {
		candidateModule.targetSlot = (typeof def.targetSlot === 'number' ? this.slots[def.targetSlot] : candidateModule.targetSlot) || this.defaultSlot;
	}
	
	
	/**
	 * @abstract
	 */
	UIModule.prototype.execBindingQueue = function(definition) {
		this.bindingQueue.forEach(function(renderFunc, key) {
			renderFunc.call(this, definition);
		}, this);
	}
	
	
	
	
	
	
	
	
	/**
	 * @abstract
	 */
	UIModule.prototype.firstRender = function() {
		// Shortcut to allow children instanciation of non-appended parents (using a selector is not applicable at instantiation step, due to DOM update latency)
		(this.parentNodeDOMId && 
				((this.parentNodeDOMId instanceof HTMLElement || this.parentNodeDOMId instanceof ShadowRoot)
					? this.parentDOMNode = this.parentNodeDOMId
						: this.parentDOMNode = document.querySelector('#' + this.parentNodeDOMId)));
		
		(this.parentDOMNode && this.hostElem && this.parentDOMNode.appendChild(this.hostElem));
	}
	
	/**
	 * @generic
	 */
	UIModule.prototype.resizeAll = function() {

	}
	
	
	/**
	 * HELPERS 
	 */

	/**
	 * @abstract
	 * 		quite complicated way of maintaining uniqueness when naming the subModules :
			subModules are referenced by the component through the "modules" prop (which is an associative array),
			but we want to offer an easy access to subModules, and though also refence them as a prop in the component => we keep subModules names unique
	 */
	UIModule.prototype.maintainUniqueNames = function(names, type) {
		if (!names || !type)
			return;
		names[type] = typeof names[type] !=='undefined' ? ++names[type] : 0;
		return type.slice(0, 1).toLowerCase() + type.slice(1) + (names[type] ? names[type].toString() : '');
	}
	
	
	
	
	
	
	
	
	
	/**
	 * A interface based on a pattern similar to the Command pattern
	 * 
	 * new Command(
			function() {					// action
				// code here //
				this.trigger('action');
			},
			function() {					// canAct
				
			},
			function() {					// undo
				
			}
		)
	 * 
	 */
	
	var Command = function(action, canAct, undo) {
		CoreModule.call(this);

		this.objectType = 'Command ' + action.name;
		this.canActQuery = false;
		this.action = action;
		this.canAct = canAct || null;
		this.undo = undo;
		this.resetSiblings = false;
	}

	Command.prototype.objectType = 'Command';
	Command.prototype.constructor = Command;
	
	Command.prototype.act = function() {
		var self = this, canActResult, args = Array.prototype.slice.call(arguments);

		if (this.canAct === null) {
			this.action.apply(null, args);
			this.canActQuery = Promise.resolve();
		}
		else {
			this.canActQuery = this.canAct.apply(null, args); 
			if (typeof this.canActQuery === 'object' && this.canActQuery instanceof Promise) {
				this.canActQuery.then(
						function(queryResult) {
							args.push(queryResult);
							self.action.apply(null, args);
							return queryResult;
						},
						function(queryResult) {
							return queryResult;
						}
				);
			}
			else if (this.canActQuery) {
				this.canActQuery = Promise.resolve(this.canActQuery);
				this.action.apply(null, args);
			}
			else {
				this.canActQuery = Promise.reject(this.canActQuery);
			}
		}
		return this.canActQuery;
	}


	Command.__factory_name = 'Command';
	
	
	
	
	
	
	/**
	 * A constructor for STREAMS : streams may be instanciated by the implementation at "component" level (observableComponent automates the stream creation),
	 * 					or as standalones when a view needs a simple "internal" reference to a stream (may also be totally elsewhere)
	 */
	
	var Stream = function(name, value, reflectedObj, transform, lazy) {
		if (!name) {
			console.error('Stream constructor error : no name given');
			return;
		}
		this.forward = true;
		this.name = name;
		this.lazy = typeof lazy !== 'undefined' ? lazy : false;
		this.reflectedObj = reflectedObj;
		this.transform = transform || undefined;
		this.inverseTransform;
		this.subscriptions = [];
		
		this._value;
		this.value = typeof reflectedObj === 'object' ? reflectedObj[name] : value;
		this.dirty;
	}
	Stream.prototype.objectType = 'Stream';
	Object.defineProperty(Stream.prototype, 'value', {
		get : function() {
			if (this.lazy) {
				if (typeof this.transform === 'function')
					this._value = this.transform(this.get());
				this.dirty = false;
			}
			
			return this.get();
		},
		
		set : function(value) {
			this.setAndUpdateConditional(value);
			this.set(value);
		}
	});

	Stream.prototype.get = function() {
		return this._value;
	}

	Stream.prototype.set = function(value) {
		if (this.forward && this.reflectedObj) {
			this.forward = false;
			this.reflectedObj[this.name] = value;
			this.forward = true;
//			console.log(this.reflectedObj, this.name, value, this.reflectedObj[this.name]);
		}
		else
			this.forward = true;
	}
	
	/**
	 * @method setAndUpdateConditional
	 * 		Avoid infinite recursion when setting a prop on a custom element : 
	 * 			- when set from outside : update and set the prop on the custom element
	 *			- after updating a prop on a custom element : update only
	 * 			- don't update when set from downward (reflected stream shall only call "set")
	 */
	Stream.prototype.setAndUpdateConditional = function(value) {
//		console.log('setAndUpdateConditional', this.name, value);
		this._value = value;
		if (!this.lazy) {
			if (this.forward) {
				if (!this.transform)
					this.update();
				else if (typeof this.transform === 'function') {
					this._value = this.transform(value);
					this.update();
				}
			}
//			else
//				this.forward = true;
		}
		else {
			this.dirty = true;
//			this.forward = true;
		}
	}
	
	Stream.prototype.update = function() {
		this.subscriptions.forEach(function(subscription) {
			subscription.execute(this._value);
		}, this);
	}
	
	Stream.prototype.lazyUpdate = function() {
		if (typeof this.transform === 'function')
			this._value = this.transform(this._value);
		this.update();
		this.dirty = false;
	}

	Stream.prototype.react = function(prop, reflectedHost) {
		this.get = function() {
			return reflectedHost[prop];
		}
		this.subscribe(prop, reflectedHost);
	}
	
	/**
	 * reflect method  :
	 *	triggers the local update loop when the reflectedHost updates
	 *	AND
	 *		simply sets a reflection mecanism if the reflectedHost[prop] was a literal
	 *		OR
	 *		lazy "sets" the reflectedHost (no infinite recursion, but no change propagation neither on the host) and triggers the given event when the local stream updates
	 */ 
	Stream.prototype.reflect = function(prop, reflectedHost, transform, inverseTransform, event) {
//		console.log(prop, reflectedHost[prop]);
		this._value = reflectedHost[prop];
		
		if (transform && this.transform)
			console.warn('Bad transform assignment : this.transform already exists');
		else if (!this.transform)
			this.transform = transform;
		
		var desc = Object.getOwnPropertyDescriptor(reflectedHost, prop);
		var stdDesc = Object.getOwnPropertyDescriptor(Stream.prototype, 'value');
		var propertyDescriptor = {
				get : stdDesc.get.bind(this),
				set : stdDesc.set.bind(this)
		};
		
		if (!desc || (!desc.get && desc.writable))
			Object.defineProperty(reflectedHost, prop, propertyDescriptor);
		
		else if (reflectedHost.streams && reflectedHost.streams[prop]) {
			this._value = reflectedHost.streams[prop].get(); // we need transformed value if lazy
			
			reflectedHost.streams[prop].subscribe(this);
			
			if (typeof reflectedHost.trigger === 'function')
				this.subscribe(reflectedHost.trigger.bind(reflectedHost, event));
			
			return this.subscribe(reflectedHost.streams[prop].set, null, inverseTransform);
		}
	}

	/**
	 * subscribe method  :
	 *	instanciates and registers a new subscription, and returns it for the caller to define the refinement functions (filter & map)
	 */ 
	Stream.prototype.subscribe = function(handlerOrHost, prop, inverseTransform) {
		if (!handlerOrHost || (typeof handlerOrHost !== 'function' && typeof handlerOrHost !== 'object')) {
			console.warn('Bad observable handlerOrHost assigned : handler type is ' + typeof handler + ' instead of "function or getter/setter"', 'StreamName ' + this.name);
			return;
		}
		else
			return this.addSubscription(handlerOrHost, prop, inverseTransform).subscribe();
	}
	
	/**
	 * filter method (syntactic sugar) :
	 *	instanciates and registers a new subscription, and returns it for the caller to define the refinement functions (map) and the effective subscribtion
	 */ 
	Stream.prototype.filter = function(filterFunc) {
		return this.addSubscription().filter(filterFunc);
	}
	
	/**
	 * map method (syntactic sugar) :
	 *	instanciates and registers a new subscription, and returns it for the caller to define the refinement functions (filter) and the effective subscribtion
	 */ 
	Stream.prototype.map = function(mapFunc) {
		return this.addSubscription().map(mapFunc);
	}
	
	Stream.prototype.addSubscription = function(handlerOrHost, prop, inverseTransform) {
		this.subscriptions.push(new Subscription(handlerOrHost, prop, this, inverseTransform));
		return this.subscriptions[this.subscriptions.length - 1];
	}

	Stream.prototype.unsubscribe = function(handler) {
		if (typeof handler !== 'function') {
			console.warn('Bad observableHandler given for removal : handler type is ' + typeof handler + ' instead of "function or object"', 'StreamName ' + this.name);
			return;
		}
		for(var i = this.subscriptions.length - 1; i > 0; i--) {
			if (this.subscriptions[i] === handler || this.subscriptions[i].host === handler) {
				(function(j) {this.subscriptions.splice(j, 1);})(i);
			}
		}
	}
	
	
	
	
	
	/**
	 * An Abstract Class to be used by the Stream Ctor
	 * 
	 * returns chainable callback assignment functions on subscription
	 * e.g. : childModules make use of this mecanism when automatically subscribing to streams on their parent :
	 * 		this.streams[parentState].subscribe(candidate.hostElem, childState).filter(desc.filter).map(desc.map);
	 */
	var Subscription = function(subscriberObjOrHandler, subscriberProp, parent, inverseTransform) {
		this.subscriber = {
				prop : typeof subscriberProp === 'string' ? subscriberProp : null,
				obj : typeof subscriberObjOrHandler === 'object' ? subscriberObjOrHandler : null,
				cb : typeof subscriberObjOrHandler === 'function' ? subscriberObjOrHandler : function() {return this._stream._value},
				inverseTransform : inverseTransform || function(value) {return value;},
				_subscription : this,
				_stream : parent
		}
		
		this._stream = parent;
		this._firstPass = true;
	}
	
	Subscription.prototype.subscribe = function(subscriberObjOrHandler, subscriberProp, inverseTransform) {
		if (typeof subscriberObjOrHandler !== 'function' && typeof subscriberObjOrHandler !== 'object' && !this.subscriber.obj && !this.subscriber.cb) {
			console.warn('Bad observableHandler given : handler type is ' + typeof subscriberObjOrHandler + ' instead of "function or object"', 'StreamName ' + this._parent.name);
			return;
		}
		if (typeof subscriberObjOrHandler === 'object')
			this.subscriber.obj = subscriberObjOrHandler;
		else if (typeof subscriberObjOrHandler === 'function')
			this.subscriber.cb = subscriberObjOrHandler;
		
		if (typeof subscriberProp === 'string')
			this.subscriber.prop = subscriberProp;
		
		return this;
	}
	
	Subscription.prototype.filter = function(filterFunc) {
		if (typeof filterFunc !== 'function')
			return this;

		// Optimize by breaking the reference : not sure it shall be faster (at least there is only one closure, which is internal to "this" : benchmark shows a slight improvement, as timings are identical although there is an overhaed with defineProperty)
		var f = new Function('value', 'return (' + filterFunc.toString() + ').call(this.subscriber, value) === true ? true : false;');
		Object.defineProperty(this, 'filter', {
			value : f,
			enumerable : true
		});
		
		return this;
	}
	
	Subscription.prototype.map = function(mapFunc) {
		if(typeof mapFunc !== 'function')
			return this;

		// Optimize by breaking the reference : not sure it shall be faster (at least there is only one closure, which is internal to "this" : benchmark shows a slight improvement, as timings are identical although there is an overhaed with defineProperty)
		var f = new Function('value', 'return (' + mapFunc.toString() + ').call(this.subscriber, value);');
		Object.defineProperty(this, 'map', {
			value : f,
			enumerable : true
		});
		
		return this;
	}
	
	Subscription.prototype.reverse = function(inverseTransform) {
		if(typeof inverseTransform !== 'function')
			return this;

		// Optimize by breaking the reference : not sure it shall be faster (at least there is only one closure, which is internal to "this" : benchmark needed)
		this.subscriber.inverseTransform = new Function('return (' + inverseTransform.toString() + ').apply(null, arguments);');
		
		return this;
	}
	
	Object.defineProperty(Subscription.prototype, 'execute', {
		value : function(value) {
//			console.log('value', value);
			var flag = true, val, desc;
			if (value !== undefined) {
				if (this.hasOwnProperty('filter'))
					flag = this.filter(value);
				if (flag && this.hasOwnProperty('map'))
					val = this.map(value);
				else if (flag)
					val = value;
				else
					return;
//				console.log('val', this._stream.name, val);
				
//				console.log('subscriber', this.subscriber);
				if (this.subscriber.obj !== null && this.subscriber.prop !== null)
					this.subscriber.obj[this.subscriber.prop] = val;
				// second case shall only be reached if no prop is given : on a "reflected" subscription by a child component
				else if (this.subscriber.obj && (desc = Object.getOwnPropertyDescriptor(this.subscriber.obj, 'value')) && typeof desc.set === 'function')
					this.subscriber.obj.value = val;
				else if (this.subscriber.obj === null)
					this.subscriber.cb(this.subscriber.inverseTransform(val)); // inverseTransform may be a transparent function (is not when reflecting : we must not reflect the child state "as is" : the parent value may be "mapped requested" by the child)   
			}
			this._firstPass = false;
		},
		enumerable : true
	});
	
	
	
	
	
	
	
	
	/**
	 * An interface to be implemented by a module based on a worker
	 */
	var WorkerInterface = function(workerName, stringifiedWorker, url) {
		CoreModule.call(this);
		this.objectType = workerName || 'WorkerInterface';
		this._responseHandler = {};
		this.createEvent('message');
		this.name = workerName;
		
		var blob = new Blob([stringifiedWorker /*https://www.npmjs.com/package/stringify*/], {type: 'application/javascript'});
		var blobURL = window.URL.createObjectURL(blob);
		url = typeof blobURL === 'string' ? blobURL : url;
		this.worker = new Worker(url);
		this.worker.onmessage = this.handleResponse.bind(this); 
	}
	WorkerInterface.prototype = Object.create(CoreModule.prototype);
	WorkerInterface.prototype.objectType = 'WorkerInterface';
	WorkerInterface.prototype.constructor = WorkerInterface;

	WorkerInterface.prototype.postMessage = function(action, e) { 	// e.data = File Object (blob)
		// syntax [(messageContent:any)arg0, (transferableObjectsArray:[transferable, transferable, etc.])arg1]

		if (typeof e === 'undefined')
			this.worker.postMessage.call(this.worker, [action]);
		else if (e.data instanceof ArrayBuffer)
			this.worker.postMessage.call(this.worker, [action, e.data], [e.data]);
		else
			this.worker.postMessage.call(this.worker, [action, e.data]);
	}
	
	WorkerInterface.prototype.addResponseHandler = function(handlerName, handler) {
		if (typeof handler === 'function')
			this._responseHandler[handlerName] = handler;
	}

	WorkerInterface.prototype.handleResponse = function(response) {
//		console.log(response);
		
		if (!this.handleError(response))
			return;
		
		if (typeof this._responseHandler[response.data[0]] === 'function') {
			if (response.data.length > 1) {
				var args = Array.prototype.slice.call(response.data, 1);
				this._responseHandler[response.data[0]].apply(this, args);
				this.trigger('message', response.data, ['string', 'number'].indexOf(typeof args[0]) !== -1 ? args[0] : ''); // only pass strings or numbers as eventID
			}
			else {
				this._responseHandler[response.data[0]]();
				this.trigger('message', response.data);
			}
		}
		
	}

	WorkerInterface.prototype.handleError = function(response) {
		if (response.data.constructor !== Array) {
			console.log([this.name + ' error generic', '']);
			return;
		}

		switch (response.data[0]) {
			case 'error' :
			case 'warning' :
				console.log(this.name + ' ' + response.data[0], response.data[1]);
				return;
		}
		
		return true;
	}
	
	WorkerInterface.__factory_name = 'WorkerInterface';
	
	
	
	/**
	 * A static definition of some DOM attributes :
	 * 		reminded here as useful for storing a component's "persistent state"
	 * 		used by the visibleStateComponent to map glyphs on states
	 */
	var commonStates = {
			hidden : false,
			disabled : false,
			checked : false,
			focused : false,
			selected : false,
			highlighted : false,
			blurred : false,
			valid : false,
			recent : false, 	// boolean otherwise handled by specific mecanism (component should be referenced in a list, etc.)
			roleInTree : '',	// replaces CSS classes : enum ('root', 'branch', 'leaf') 
			position : 0,		// position as a state : degrees, 'min', 'man', nbr of pixels from start, etc. 
			size : 0,			// size as a state : length, height, radius
			tabIndex : 0,
			'delete' : false		// isn't a -persistent- state (cause it removes the node, hm) but deserves a glyph
	}
	
	/**
	 * A Helper function to merge two options hash
	 */
	var optionSetter = function(baseOptions, options) {
		options = (typeof options === 'object' && options !== null) ? options : {};
		if (!baseOptions)
			return options;
		else if (!options)
			return baseOptions;
		for(var prop in baseOptions) {
			if (baseOptions.hasOwnProperty(prop) && (typeof options[prop] === 'undefined' || options[prop] === null)) {
				options[prop] = baseOptions[prop];
			}
		};
		return options;
	}

	
	
	return {
		CoreModule : CoreModule,
		AsynchronousModule : AsynchronousModule,
		DependancyModule : DependancyModule,
		UIModule : UIModule,
		Command : Command,
		Worker : WorkerInterface,
		commonStates : commonStates,
		Stream : Stream,
		optionSetter : optionSetter,
		Maker : FactoryMaker
	}
	
})();

module.exports = Factory;