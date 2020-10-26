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
		
		// PERF OPTIMIZATION
//		Object.defineProperty(this, 'objectType', {
//			enumerable : false,
//			writable : true,
//			configurable : true,
//			value : 'CoreModule'
//		});
//		
//		Object.defineProperty(this, 'modules', {
//			enumerable : false,
//			writable : true,
//			configurable : true,
//			value : {}
//		});
//		
//		Object.defineProperty(this, '_eventHandlers', {
//			enumerable : false,
//			writable : false,
//			configurable : true,
//			value : {}
//		});
//		
//		Object.defineProperty(this, '_one_eventHandlers', {
//			enumerable : false,
//			writable : false,
//			configurable : true,
//			value : {}
//		});
//		
//		Object.defineProperty(this, '_identified_eventHandlers', {
//			enumerable : false,
//			writable : false,
//			configurable : true,
//			value : {}
//		});
		
		this.objectType = 'CoreModule';
		this._parent;
		this.hostComponent;
		this.modules = [];
		this._eventHandlers = {};
		this._one_eventHandlers = {};
		this._identified_eventHandlers = {};
		
		this.enableEventSetters = enableEventSetters || false;
		
		this.subscribeOnChild = [];
	};
	
	CoreModule.onEventPropertyDescriptor = {
			set : function(handler) {
				if (typeof handler !== 'function') {
					console.warn('Bad eventHandler assigned : handler type is ' + typeof handler + ' instead of "function or object"', 'EventType ' + eventType);
					return;
				}
//				if (this._eventHandlers[eventType].indexOf(handler) === -1)
					this._eventHandlers[eventType].push(handler);
			}
		}
		
	CoreModule.oneEventPropertyDescriptor = {
		set : function(handler) {
			if (typeof handler === 'function') {
//					if (this._one_eventHandlers[eventType].indexOf(handler) === -1)
					this._one_eventHandlers[eventType].push(handler);
			}
			else if (typeof handler === 'object' && typeof handler['f'] === 'function' && ['number', 'string'].indexOf(typeof handler['id']) !== -1) {
//					if (this._one_eventHandlers[eventType].indexOf(handler) === -1)
					this._identified_eventHandlers[eventType].push(handler);
			}
		}
	}
	
	// Theses methods should be implemented further down in the inheritance chain : 
	// 		asynchronously adding children : progressive creation in UIModule implies managing a "raw" status on the component
	CoreModule.prototype.asyncAddChild = function(child) {} 						// Virtual
	CoreModule.prototype.asyncAddChildren = function(oneShot) {} 					// Virtual
	// 		attaching observables for reactivity : the ObservableComponent class is responsible for implementing this virtual method
	CoreModule.prototype.onRegisterModule = function() {} 							// Virtual
	
	/**
	 * HELPER
	 * should be used enywhere it is usefull : shall enforce "function inlining" at compile time
	 */
	CoreModule.getSmoothedDef = function(def) {
		return this.def.host ? this.def.host : this.def;
	}
	
	/**
	 * @param {object} candidateModule : an instance of another module
	 */
	CoreModule.prototype.registerModule = function(moduleName, candidateModule, moduleDefinition) {
//		console.log(moduleName, candidateModule);
		if (!candidateModule)
			return;

		candidateModule.__in_tree_name = moduleName;
		candidateModule._parent = this;
		this.modules.push({moduleName : candidateModule});
//		(!this[moduleName] && (this[moduleName] = this.modules[moduleName]));	// allow "protected" aliasing
//		(!this[moduleName] && console.error('ModuleName Aliasing error'));
		
		if (candidateModule instanceof HTMLElement)
			return candidateModule;
		else {
			// autoSubscribe to object own events
			if (!moduleDefinition.getHostDef().subscribeOnParent)
				return candidateModule;
			if (moduleDefinition.getHostDef().subscribeOnParent.length || candidateModule.subscribeOnParent.length || this.subscribeOnChild.length)
				this.handleModuleSubscriptions(candidateModule, moduleDefinition);
			
			// heuristic targetSlot definition (reactivity may rely on "early-defined" slots)
			this.handleSlotDefinitionRelativeToParent(candidateModule, moduleDefinition);
			this.onRegisterModule(candidateModule, moduleDefinition);
		}
		
		return candidateModule;
	}
	
	CoreModule.prototype.handleModuleSubscriptions = function(candidateModule, moduleDefinition) {
//		var candidateModule = this[moduleName];
		// A ComponentList may meet the case : 2 cases :
		//		- subscribeOnChild : it's been registered as a child of a component thas requires an event hook on his children
		// 			but the actual children are the chidren of the ComponentList (registered on the right _parent, i.e. one level up, but only after the ComponentList)
		//		- subscribeOnParent : that's not allowed : only the host of a component may subscribe on parent
		if (candidateModule.objectType === 'ComponentList')
			return;
		
		var evt,
			handler,
			desc,
			subscriptionInDef = (moduleDefinition.getGroupHostDef() || moduleDefinition.getHostDef()).subscribeOnParent;
		
		subscriptionInDef.forEach(function(subscription, key) {
			evt = subscription.on;
			if (!(evt in this._eventHandlers))
				console.warn(this.objectType, 'registers ' + candidateModule.objectType, ' : Registering a child module on a raw Component ("Make" function not already called, then no DOM/Event exists) => Automatic Bindings won\'t work');
			handler = subscription.subscribe;

			if (evt in candidateModule._eventHandlers)
				this.addEventListener(evt, handler); 	// setter for event subscribtion
		}, this);
		console.log(this);
		this.subscribeOnChild.forEach(function(subscription, key) {
			evt = subscription.on;

			handler = subscription.subscribe;
			if (evt in candidateModule._eventHandlers)
				candidateModule.addEventListener(evt, handler.bind(this)); 	// setter for event subscribtion
			else if ('on' + evt in candidateModule.hostElem)
				candidateModule.hostElem['on' + evt] = handler.bind(this); 	// setter for delegated native event subscribtion
			else
				console.warn(this.objectType, 'registers on event ' + evt + ' on his child : ' + candidateModule.objectType, ' : unknown event on child when Registering a child module => Automatic Bindings won\'t work');
		}, this);
	}
	
	
	
	
	
	
	/**
	 * @param {string} moduleName
	 */
	CoreModule.prototype.removeModule = function(moduleName) {
		if (typeof this.modules[moduleName] !== 'undefined')
			delete this.modules[moduleName];
	}
	
	/**
	 * @param {string} moduleName
	 */
	CoreModule.prototype.getModule = function(moduleName) {
		if (typeof this.modules[moduleName] !== 'undefined')
			return this.modules[moduleName];
	}
	
	/**
	 * @param {string} moduleName
	 */
	CoreModule.prototype.queryModules = function(moduleName) {
		var ret = [];
		for (var name in this.modules) {
			if (name.toLowerCase().indexOf(moduleName.toLowerCase()) !== -1)
				ret.push(this.modules[name]);
		}
		return ret;
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
//		
		/*
		 * THIS A HUGE PERF BOTTLENECK : potential optimization would be caching the propertyDescriptor 
		 * 		As implemented and commented : HUGE benchmark improvement, although there are still 2ms to gain for real effectiveness in long lists...
		 * 		Reserve this usage to "needed" cases. TODO : how ?
		 */
		if (this.enableEventSetters) {
			/**@memberOf a CoreModule instance : each event is given 2 handy functions to register listeners : oneventType & one_eventType*/
			Object.defineProperty(this, 'on' + eventType, CoreModule.onEventPropertyDescriptor);

			/**@memberOf a CoreModule instance : each event is given 2 handy functions to register listeners : oneventType & one_eventType*/
			Object.defineProperty(this, 'one_' + eventType, CoreModule.oneEventPropertyDescriptor);
		}
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
				this._identified_eventHandlers[eventType].splice(i, 1);
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
	CoreModule.prototype.trigger = function(eventType, payload, eventID) {
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
		
		if (logLevel > 7)
			console.log(this.objectType, 'event ' + eventType + ' triggered', payload, eventID);//, this._eventHandlers);
//		if (logLevel > 7)
//			console.log(this.objectType, 'event ' + eventType, this._one_eventHandlers);
		
//		console.log('trigger ' + eventType, this._eventHandlers[eventType]);
		
		for(var i = 0, l = this._eventHandlers[eventType].length; i < l; i++) {
//			console.log(eventType);
			if (typeof this._eventHandlers[eventType][i] === 'function')
				this._eventHandlers[eventType][i]({type : eventType, data : payload});
		}
		
//		console.log('trigger ' + eventType, this._one_eventHandlers[eventType])
		for(var i = this._one_eventHandlers[eventType].length - 1; i >= 0; i--) {
//			console.log('trigger ' + typeof this._one_eventHandlers[eventType][i])
			if (typeof this._one_eventHandlers[eventType][i] === 'function') {
				this._one_eventHandlers[eventType][i]({type : eventType, data : payload});
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
						this._identified_eventHandlers[eventType][i].f({type : eventType, data : payload})
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
	var UIModule = function(definition, parentNodeDOMId, automakeable, childrenToAdd, targetSlot) {
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
		this.bindingQueue = [];
		
		this.definition = this.mergeWithComponentDefaultDef(definition, this.createDefaultDef()) || definition;
//		console.log(this.definition);
		
		this.parentNodeDOMId = parentNodeDOMId;
		this.command = (definition && definition.command);
		this.keyboardSettings;
		this.keyboardEvents = definition.keyboardEvents || [];
		this.childrenToAdd = childrenToAdd ? (Array.isArray(childrenToAdd) ? childrenToAdd : [{module : childrenToAdd}]) : [];

		(typeof targetSlot === 'number' && (this.defaultSlot = (this.rootElem || this.hostElem).children[targetSlot]));
		
		(definition && this.immediateInit.apply(this, arguments));
		(automakeable && this.raw && this.Make.apply(this, arguments));
	};

	/**
	 * HOOKS
	 */
	UIModule.prototype = Object.assign(Object.create(DependancyModule.prototype), {
		objectType : 'UIModule',
		constructor : UIModule,
		createDefaultDef : function() {},				// virtual
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
	UIModule.prototype.makeAndRegisterModule = function(moduleName, candidateModule, moduleDefinition) {
		if (candidateModule.raw)
//			candidateModule.Make(moduleDefinition);
			candidateModule.Make(candidateModule.definition);
//		this.registerModule(moduleName, candidateModule, moduleDefinition);
		this.registerModule(moduleName, candidateModule, candidateModule.definition);
		return candidateModule;
	}
	
	/**
	 * @abstract
	 */
	UIModule.prototype.immediateInit = function() {
		this.createEvents.apply(this, arguments);
		this.createObservables.apply(this, arguments);
		this.registerValidators.apply(this, arguments);
		
	}
	/**
	 * @abstract
	 */
	UIModule.prototype.Make = function() {
		this.raw = false;						// disable "raw" first (seems logical... TODO:  was there a purpose on that comment ?)
		this.beforeMake.apply(this, arguments);
		this.init.apply(this, arguments);
		this.afterMake.apply(this, arguments);
	}
	/**
	 * @abstract
	 */
	UIModule.prototype.init = function() {
		this.create.apply(this, arguments);
		this.registerEvents.apply(this, arguments);
		
//		this.resizeAll.apply(this, arguments);
		this.firstRender.apply(this, arguments);
		
		this.execBindingQueue.apply(this, arguments);
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
	UIModule.prototype.create = function() {
		this.beforeCreateDOM.apply(this, arguments);
		this.createDOM.apply(this, arguments);
		this.completeDOM.apply(this, arguments);
		this.basicEarlyDOMExtend.apply(this, arguments);
		this.renderDOMQueue.apply(this, arguments);
		this.basicLateDOMExtend.apply(this, arguments);
		this.compose.apply(this, arguments);
		this.afterCreateDOM.apply(this, arguments);
		this.setDOMTypes.apply(this, arguments);
		this.setArias.apply(this, arguments);
	}
	
	/**
	 * @abstract
	 */
	UIModule.prototype.mergeWithComponentDefaultDef = function(definition, defaultDef) {
//		console.log(definition);
		
		if (!defaultDef && !definition) {
			console.error('UIModule : Merging Component\'s definition with default failed : neither a specific nor a default def found');
			return;
		}
		else if (definition.getGroupHostDef() || definition.getHostDef().getType() === 'ComponentList')
			return;
		else if (!defaultDef)
			defaultDef = TypeManager.createComponentDef({host : {}}, 'defaultDef');

		var defaultHostDef = defaultDef.getHostDef(),
		hostDef = definition.getHostDef();
		
//		var def,
//			UID = this.__proto__.objectType
//					+ '_' + hostDef.nodeName
//					+ '_' + hostDef.attributes.reduce((accu, val) => accu + '_' + val.getName(), '')
//					+ '_' + hostDef.reactOnParent.reduce((accu, val) => accu + '_' + val.from, ''),
//			cache = TypeManager.getUID(UID);
//		
//		
//		if (typeof cache === 'string')
//			def = TypeManager.createComponentDef(new TypeManager.SingleLevelComponentDefModel(hostDef, undefined, defaultHostDef), UID, 'rootOnly');
//		else
//			def = cache;
//		console.clear();
		return TypeManager.createComponentDef({host : new TypeManager.SingleLevelComponentDefModel(hostDef, undefined, defaultHostDef)}, null, 'rootOnly');
			
		
//		console.log(this.__proto__.objectType, UID);
		
//		if (!definition.subSections.length)
//			definition.subSections = defaultDef.subSections;
//		if (!definition.members.length)
//			definition.members = defaultDef.members;
//		if (!definition.lists.length)
//			definition.lists = defaultDef.lists;
//		if (definition.options === null)
//			definition.options = defaultDef.options;
		
		
//		for(var prop in defaultHostDef) {
//			if (Array.isArray(this[prop]))
//				this[prop] = this[prop].concat(defaultHostDef[prop], hostDef[prop]);
//			else if (prop === 'sWrapper')
//				this[prop] = defaultHostDef[prop] || hostDef[prop];
//			else if (hostDef[prop] === null)
//				hostDef[prop] = defaultHostDef[prop];
//		}
//		console.log(defaultDef);
//		console.log(this);
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
	
	UIModule.prototype.registerEvents = function(definition) {
		this.beforeRegisterEvents(definition);
		this.registerDOMChangeObservers(definition);
		this.registerClickEvents(definition);
		this.registerKeyboardEvents();
		(this.hoverElem && this.registerLearnEvents(definition));
		this.afterRegisterEvents(definition);
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
		
		var name, names = {};
		// prevent masking of already "incremented" subModule names
		this.modules.forEach(function(module) {
			(typeof names[module.objectType] === 'undefined' ? names[module.objectType] = 0 : ++names[module.objectType])
		});
		
		this.childrenToAdd.forEach(function(childDef) {
			// it's not allowed to add "raw" children
			if (childDef.module.raw || (oneShot && childDef !== oneShot))
				return;

			name = this.maintainUniqueNames(names, childDef.module.objectType);
			
			// register subModule
			this.makeAndRegisterModule(name, childDef.module);
			
			// bind requested self events subModule TODO : what's that ? is it really usefull ?
			for (let eventName in childDef.eventBinding) {
				let lowerCaseEventName = eventName.toLowerCase();
				if (!(lowerCaseEventName in childDef.module._eventListeners))
					continue;
				childDef.module.addEventListener(lowerCaseEventName, childDef.eventBinding[eventName]);
			}
		}, this);
	}
	
	
	/**
	 * @abstract
	 */
	UIModule.prototype.handleSlotDefinitionRelativeToParent = function(candidateModule, def) {
		candidateModule.targetSlot = (typeof def.targetSlot === 'number' ? this.slots[def.targetSlot] : candidateModule.targetSlot) || this.slots['default'];
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
		var self = this;
//		console.log('resizeAll');
//		console.log(this.resize)
//		this.resize();
//		setTimeout(function() {
//			for (var i in self.modules) {
//				if (self.modules[i].objectType === 'UIModule')
//					self.modules[i].resize();
//			}
//		}, 64);
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
		this.canAct = canAct;
		this.undo = undo;
		this.resetSiblings = false;
//		this.createEvent('action');
//		this.createEvent('actionrefused');
	}
//	Command.prototype = Object.create(CoreModule.prototype);
	Command.prototype.objectType = 'Command';
	Command.prototype.constructor = Command;
	
	Command.prototype.act = function() {
		var self = this, canActResult, args = Array.prototype.slice.call(arguments);

		if (this.canAct === null) {
			this.action.apply(this, args);
			this.canActQuery = Promise.resolve();
		}
		else {
			this.canActQuery = this.canAct.apply(this, args); 
			if (typeof this.canActQuery === 'object' && this.canActQuery instanceof Promise) {
				this.canActQuery.then(
						function(queryResult) {
							args.push(queryResult);
							self.action.apply(self, args);
//							self.trigger('action');
							return queryResult;
						},
						function(queryResult) {
//							self.trigger('actionrefused');
							return queryResult;
						}
				);
			}
			else if (this.canActQuery) {
				this.canActQuery = Promise.resolve(this.canActQuery);
				this.action.apply(this, args);
//				this.trigger('action');
			}
			else {
				this.canActQuery = Promise.reject(this.canActQuery);
//				this.trigger('actionrefused', ['canActQuery', this.canActQuery]);
			}
		}
		return this.canActQuery;
	}
	
//	Command.prototype.resetSiblings = false;

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
		
		// by calling the "reflect" method, the property descriptor of the "value" prop may be reflected on another object
		// (the perf optimization hasn't really any effect: the bottleneck comes from the "bind" method)
//		var propertyDescriptor = {
//				get : Stream.defaultPropertyDescriptor.get.bind(this),
//				set : Stream.defaultPropertyDescriptor.set.bind(this),
//				enumerable : true
//		};
//		Object.defineProperty(this, 'value', propertyDescriptor);
//		Object.defineProperty(this, 'value', {
//			get : function() {
//				if (this.lazy) {
//					if (typeof this.transform === 'function')
//						this._value = this.transform(this.get());
//					this.dirty = false;
//				}
//				
//				return this.get();
//			}.bind(this),
//			
//			set : function(value) {
//				this.setAndUpdateConditional(value);
//				this.set(value);
//			}.bind(this),
//			enumerable : true
//		});
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
//	Stream.defaultPropertyDescriptor = {
//		get : function() {
//			if (this.lazy) {
//				if (typeof this.transform === 'function')
//					this._value = this.transform(this.get());
//				this.dirty = false;
//			}
//			
//			return this.get();
//		},//.bind(this),
//		
//		set : function(value) {
//			this.setAndUpdateConditional(value);
//			this.set(value);
//		},//.bind(this),
//		enumerable : true
//	}

	Stream.prototype.get = function() {
		return this._value;
	}

	Stream.prototype.set = function(value) {
		if (this.reflectedObj) {
			this.forward = false;
			this.reflectedObj[this.name] = value;
		}
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
			else
				this.forward = true;
		}
		else {
			this.dirty = true;
			this.forward = true;
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
//		Object.defineProperty(this, 'execute', Object.getOwnPropertyDescriptor(Subscription.prototype, 'execute')); // make immutable : DELETED for perf improvement...
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
		if(typeof inverseTransform !== 'function') {
//			if (typeof mapFunc === 'undefined')
//				console.warn('Bad inverseTransform given on observable : inverseTransform type is ' + typeof inverseTransform + ' instead of "function"', 'StreamName ' + this._parent.name);
			return this;
		}
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
//				console.log('val', val);
				
//				console.log('subscriber', this.subscriber);
				if (this.subscriber.obj !== null && this.subscriber.prop !== null) {
//					console.log(this.subscriber.obj, this.subscriber.prop, val);
					this.subscriber.obj[this.subscriber.prop] = val;
//					console.log('this.subscriber.obj[this.subscriber.prop]', this.subscriber.obj[this.subscriber.prop], this.subscriber.obj);
				}
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
//		console.log(e);
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
//		var errorHandler = FactoryMaker.getSingletonInstance(this.factory.context, 'errorHandler'); // unusable here as factory context hasn't yet been initialized
//		if (typeof errorHandler === 'undefined')
//			return;
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
	 * A Factory to instanciate virtual-DOM element definitions
	 */
	var elementDef = function(type, title, nodeName, uniqueId, sWrapper, section, states, props, command, reactOnParent, reactOnSelf, children, targetSlot) {
		
		var def = {
			type : type || null,					// String
			nodeName : nodeName || null,			// String
			id : uniqueId || null,					// String
			sWrapper : sWrapper || null,			// Object : instanceof StylesheetWrapper
			section : section || null,				// Number
			title : title || null,					// String
			states : (states && typeof states === 'object') ? iterateOnObject(states) : null,				// Object : plain		// enforce type (def.state MUST have un unchanged prototype) TODO: benchmark
			props : (props && typeof props === 'object') ? iterateOnObject(props) : null,					// Object : plain
			command : command || null,				// Object : instanceof Command
			reactOnParent : reactOnParent || null,	// Object : plain
			reactOnSelf : reactOnSelf || null,		// Object : plain
			targetSlot : targetSlot || null,		// String
			keyboardSettings : [{
				ctrlKey : false,
				shiftKey : false,
				altKey : false,
				keyCode : 0
			}],
			signed : 'elementDef'
		};
		
		// allow "direct" instanciation : the user already knows all the params
		if (type && typeof type === 'object') {
			for (let param in type) {
				def[param] = type[param];
			} 
			return def;
		}
		else
			return def;
	}
//	);
	// REMINDER : the DOM Element Constructor applies the whole elementDef based on the following test :
	// if (typeof attributes[attr] === 'boolean' || (attributes[attr]  && attr in elem && ['type', 'nodeName', 'label'].indexOf(attr) === -1))
	
	
	/**
	 * A Factory to instanciate UI Modules definitions
	 * @param host {elementDef} : eventually accepts receiving a fulldef {UIModuleDef} on the first args
	 */
	var UIModuleDef = function(host, subSections, members, options, sWrapper, children, targetSlot, reactOnParent, reactOnSelf) {
//		console.log(sWrapper)
		var def = {
			host : !Array.isArray(host) ? Object.assign({}, host) : null,
			subSections : subSections || [],
			members : members || [],
			sWrapper : sWrapper || null,
			options : options || {},
			targetSlot : targetSlot || null,
			reactOnParent : reactOnParent || null,	// Object : plain
			reactOnSelf : reactOnSelf || null,		// Object : plain
			verticalMargins : 0
		};
		
		
		// allow "direct" instanciation : the user already knows all the params, and gives a full UIModule def as first arg
		// with a def as array
		if (Array.isArray(host) && host[0].signed === 'elementDef')
			host = UIModuleDef.apply(null, host);
		// with a def as object
		if (host && typeof host === 'object' && host.host) {
//			def.host = {};
//			// Ensure we don't reference an already used and immutable getter/setter
//			for (let param in host.host) {
//				if (!Object.getOwnPropertyDescriptor(host.host, param).writable
//						|| host.host[param] instanceof HTMLElement
//						|| param.indexOf('reactOn') !== -1)
//					def.host[param] = null;
//				else
//					def.host[param] = host.host[param];
//			}
//			
//			def.members = [];
//			host.members.forEach(function(obj, key) {
//				var newObj = {};
//				for (let param in obj) {
//					if (!Object.getOwnPropertyDescriptor(obj, param).writable
//							|| obj[param] instanceof HTMLElement
//							|| param.indexOf('reactOnSelf') !== -1)
//						newObj[param] = null;
//					else
//						newObj[param] = obj[param];
//				}
//				def.members.push(newObj);
//			});

			// then take care to keep the ref broken
			for (let param in host) {
//				if (param !== 'host' && param !== 'members')
					def[param] = host[param];
			} 
			return def;
		}
		else
			return def;
	}
	
	var ObjectCopy = function(source) {
		return iterate(source);
	}
	function iterate(obj) {
		if (Array.isArray(obj))
			return iterateOnArray(obj);
		else if (obj && typeof obj === 'object')
			return iterateOnObject(obj);
		else
			return obj;
	}
	function iterateOnArray(arr) {
		var newObj = [];
		for (let i = 0, l = arr.length ; i < l; i++) {
			newObj.push(iterate(arr[i]));
		}
		return newObj;
	}
	function iterateOnObject(obj) {
		if (obj instanceof HTMLElement)
			return obj;
		var newObj = {};
		for (let prop in obj) {
			if (!obj.hasOwnProperty(prop))
				continue;
			newObj[prop] = iterate(obj[prop]);
		}
		return newObj;
	}
	
//	var ObjectCopy = function(source) {
////		var newObj;
////		var sources = Array.prototype.slice.call(arguments);
////		sources.forEach(function(source) {
////			newObj = this.iterate(source);
////		}, this);
////		return newObj;
//		return this.iterate(source);
//	}
//	ObjectCopy.prototype.iterate = function(obj) {
//		if (Array.isArray(obj))
//			return this.iterateOnArray(obj);
//		else if (obj && typeof obj === 'object')
//			return this.iterateOnObject(obj);
//		else
//			return obj;
////			return this.copy(obj);
//	}
//	ObjectCopy.prototype.iterateOnArray = function(arr) {
//		var newObj = [];
//		for (let i = 0, l = arr.length ; i < l; i++) {
//			newObj.push(this.iterate(arr[i]));
//		}
//		return newObj;
//	}
//	ObjectCopy.prototype.iterateOnObject = function(obj) {
//		if (obj instanceof HTMLElement)
//			return obj;
//		var newObj = {};
//		for (let prop in obj) {
//			if (!obj.hasOwnProperty(prop))
//				continue;
//			newObj[prop] = this.iterate(obj[prop]);
//		}
//		return newObj;
//	}
//	
//	ObjectCopy.prototype.copy = function(val) {
//		var type = (typeof val);
//		switch(type) {
//			case 'string' :
//				return val.slice(0);
//			case 'number' :
//				return val + 0;
//			case 'boolean' :
//				return Boolean.prototype.tryParse(val);
//			case 'undefined' :
//				return undefined;
//				// allow copying "pure" functions : they should return something related to their "value" or "e" named argument
//			case 'function' :
//				var str = val.toString(); 
//				if (str.indexOf('(e)') !== -1)
//					return new Function('e', val.toString().match(/^\{[.\s\S]+\}$/));
//				if (str.indexOf('(value)') !== -1)
//					return new Function('value', val.toString().match(/^\{[.\s\S]+\}$/));
//				else
//					return val;
//			default :
//				return null;
//		}
//	}
	
//	var recomposeUIModuleDef = function(defToPreserve) {
//		var newObj;
//		if (Array.isArray(defToPreserve) && defToPreserve.length) {
//			newObj = [...defToPreserve];
//			newObj.forEach(function(obj, key){
//				if (Array.isArray(obj) || (typeof obj === 'object' && obj !== null))
//					obj = recomposeUIModuleDef(obj);
//			});
//		}
//		else if (typeof defToPreserve === 'object' && defToPreserve !== null) {
//			newObj = {...defToPreserve};
//			for (let prop in newObj) {
//				if (newObj.hasOwnProperty(prop) && Array.isArray(newObj[prop]) || (typeof newObj[prop] === 'object' && newObj[prop] !== null))
//					newObj[prop] = recomposeUIModuleDef(newObj[prop]);
//			}
//		}
////		console.log(newObj);
//		return newObj || defToPreserve;
//	}
	
//	var recomposeUIModuleDef = function(defToPreserve) {
//		var def = [];
//		defToPreserve.forEach(function(obj, prop) {
//			if (!this.checkType(prop, def, defToPreserve))
//				def[prop] = obj;
//		}, this);
////		console.log(def);
//		return def;
//	}
//	recomposeUIModuleDef.prototype.checkType = function(prop, def, defToPreserve) {
////		console.log(prop);
//		if (Array.isArray(defToPreserve[prop]) && defToPreserve[prop].length) {
//			(typeof def[prop] === 'undefined' && (def[prop] = []));
//			this.loopOnArray(def[prop], defToPreserve[prop]);
//		}
//		else if (typeof defToPreserve[prop] === 'object' && defToPreserve[prop] !== null) {
//			(typeof def[prop] === 'undefined' && (def[prop] = {}));
//			this.loopOnObject(def[prop], defToPreserve[prop]);
//		}
//		else
//			return false;
//	}
//	recomposeUIModuleDef.prototype.loopOnObject = function(def, defToPreserve) {
//		for (let prop in defToPreserve) {
//			if (!this.checkType(prop, def, defToPreserve))
//				def[prop] = defToPreserve[prop];
//		}
////		console.log(def);
//	}
//	recomposeUIModuleDef.prototype.loopOnArray = function(def, defToPreserve) {
//		defToPreserve.forEach(function(obj, key){
//			if (!this.checkType(key, def, defToPreserve))
//				def[key] = obj;
//		}, this);
////		console.log(def);
//	}

	
	/**
	 * A Factory to instanciate UI Lazy Module Hosts (e.g. a tab component)
	 */
	var UILazyHostDef = FactoryMaker.getClassFactory(function(host, headers, pages, options, sWrapper) {
		var def = {
			host : host || null,
			headers : headers || [],
			pages : pages || [],
			options : options,
			sWrapper : sWrapper || null
		};
	});
	
	
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
//			console.log(prop, options[prop], baseOptions[prop], baseOptions.hasOwnProperty(prop), typeof (options[prop]) === 'undefined');
			// always override any object if it IS set in the default def : simplest HACK to avoid blocked-reference when re-unsing the same def on a list
			if (baseOptions.hasOwnProperty(prop) && (typeof options[prop] === 'undefined' || options[prop] === null)) {
				options[prop] = baseOptions[prop];
			}
		};
//		console.log(baseOptions, options);
		return options;
	}

	
	
	return {
		CoreModule : CoreModule,
		AsynchronousModule : AsynchronousModule,
		DependancyModule : DependancyModule,
		UIModule : UIModule,
		Command : Command,
		Worker : WorkerInterface,
		createElementDef : elementDef,
		createUIModuleDef : UIModuleDef,
		commonStates : commonStates,
		Stream : Stream,
		optionSetter : optionSetter,
		ObjectCopy : ObjectCopy,
		Maker : FactoryMaker
	}
	
})();

module.exports = Factory;