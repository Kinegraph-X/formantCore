logLevelQuery = window.location.href.match(/(log_level=)(\d+)/); 					// Max log_level = 8 
window.logLevel = Array.isArray(logLevelQuery) ? logLevelQuery[2] : undefined;
delete window.logLevelQuery;

var Factory = (function() {
	
	/**
	 * from https://github.com/Dash-Industry-Forum/dash.js/.../FactoryMaker.js
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
	        getSingletonInstance: getSingletonInstance,
	        setSingletonInstance: setSingletonInstance,
	        getSingletonFactory: getSingletonFactory,
	        getClassFactory: getClassFactory
	    };

	    return instance;

	})();
	
	/**
	 * An Interface to be implemented by a module supposed to host children singleton modules
	 * @implements an event emitter pattern
	 * @constructor
	 * @interface
	 */
	var CoreModule = function() {
		
		Object.defineProperty(this, 'objectType', {
			enumerable : false,
			writable : true,
			configurable : true,
			value : 'CoreModule'
		});
		
		Object.defineProperty(this, 'modules', {
			enumerable : false,
			writable : true,
			configurable : true,
			value : {}
		});
		
		Object.defineProperty(this, '_eventHandlers', {
			enumerable : false,
			writable : false,
			configurable : true,
			value : {}
		});
		
		Object.defineProperty(this, '_one_eventHandlers', {
			enumerable : false,
			writable : false,
			configurable : true,
			value : {}
		});
		
		Object.defineProperty(this, '_identified_eventHandlers', {
			enumerable : false,
			writable : false,
			configurable : true,
			value : {}
		});
	};
	
	/**
	 * @param {object} candidateModule : an instance of another module
	 */
	CoreModule.prototype.registerModule = function(moduleName, candidateModule) {
		if (!candidateModule)
			return;
		for (var module in this.modules) {
			if (this.modules[module] === candidateModule || module === moduleName)
				return;
		}
		candidateModule.__tree_name = moduleName;
		this.modules[moduleName] = candidateModule;
		
		// autoSubscribe to object own events
		var handler, desc;
		for (evt in candidateModule.autoSubscribe) {
			handler = candidateModule.autoSubscribe[evt];
			desc = Object.getOwnPropertyDescriptor(this, 'on' + evt);
			if (typeof desc !== 'undefined' && typeof desc.get === 'function')
				this['on' + evt] = handler; 	// setter for event subscribtion
		}
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
	 * Creates a listenable event : generic event creation (onready, etc.)
	 * 
	 * @param {string} eventType
	 */
	CoreModule.prototype.createEvent = function(eventType) {
		this._eventHandlers[eventType] = []; // ['forcejQueryExtension']
		this._one_eventHandlers[eventType] = []; // ['forcejQueryExtension']
		this._identified_eventHandlers[eventType] = []; // ['forcejQueryExtension'] 	// identified event handlers are meant to be disposable
		
		/**@memberOf a CoreModule instance : each event is given 2 handy functions to register listeners : oneventType & one_eventType*/
		Object.defineProperty(this, 'on' + eventType, {
			enumerable : false,
			configurable : true,
			get : function() {
//				this.trigger(eventType);
			},
			set : function(handler) {
				if (typeof handler !== 'function') {
					console.warn('Bad eventHandler assigned : type is ' + typeof handler + ' instead of "function or object"', 'EventType ' + eventType);
					return;
				}
//				if (this._eventHandlers[eventType].indexOf(handler) === -1)
					this._eventHandlers[eventType].push(handler);
			}
		});
		
		/**@memberOf a CoreModule instance : each event is given 2 handy functions to register listeners : oneventType & one_eventType*/
		Object.defineProperty(this, 'one_' + eventType, {
			enumerable : false,
			configurable : true,
			get : function() {
//				this.trigger(eventType);
			},
			set : function(handler) {
				if (typeof handler === 'function') {
//					console.log(eventType, handler, this);
//					if (this._one_eventHandlers[eventType].indexOf(handler) === -1)
						this._one_eventHandlers[eventType].push(handler);
				}
				else if (typeof handler === 'object' && typeof handler['f'] === 'function'&& ['number', 'string'].indexOf(typeof handler['id']) !== -1) {
//					if (this._one_eventHandlers[eventType].indexOf(handler) === -1)
						this._identified_eventHandlers[eventType].push(handler);
				}
			}
		});
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
	 * This method is only able to add "permanent" handlers : "one-shot" handlers must be added by another mean 
	 * @param {string} eventType
	 * @param {function} handler : the handler to add 
	 * @param {number} index : where to add
	 */
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
			// CAUTION : constructors seems unreachable after the second inheritance...
			// base.apply(this, arguments);
			// extension.apply(this, arguments);
			
			// creating dummy objects with new base(arguments) seems to be a more functional construct :
			// CAUTION : jQuery objects may loose their prototype (see com on mergeOwnProperties function)...
			var args = UIModule.prototype.isCalledFromFactory.apply(this, arguments) || arguments;
			self.mergeOwnProperties(this, new base(args), new extension(args));
			
			this.objectType = objectType;
			this.implements = extension.prototype.objectType;
		};

		// interface prototype depth is limited to 1 (mergeOwnProperties tests hasOwnProperty)
		// limit extended to 2 when setting keepNonStdProtos to "true"
		mergedConstructor.prototype = this.mergeOwnProperties(base.prototype, extension.prototype);
		mergedConstructor.prototype.constructor = mergedConstructor;
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
						else if (obj[name])
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
	 * An Interface to be implemented by a module supposed to be asynchronous (and then publish state changes)
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
		this.autoSubscribe = {};
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
	 * @constructor
	 * @extends DependancyModule
	 * @interface
	 * 
	 * @param {Object} def : custom object that defines the UI (generally a list of properties and behaviors for a button)
	 * @param {Object} (jQuery Instance) container
	 * @param {string} buttonClassName
	 */
	var UIModule = function(def, containerDOMId, automakeable, buttonClassName) {
		this.raw = true;
		DependancyModule.call(this);
		this.objectType = 'UIModule';

		this.def = def || (this.def || undefined);
		this.container = this.container || undefined;
		this.buttonClassName = buttonClassName || (this.buttonClassName || undefined);
		
		this.containerDOMId = containerDOMId || this.containerDOMId;
		this.container = this.container;
		this.domElem = this.domElem || $(''); 		// not functional ($('') === {})
		this.hoverElem = this.hoverElem;

		this.renderChain = [];
		this.command;
		this.keyboardEvents = this.keyboardEvents || [];
		
		(automakeable && this.Make.apply(this, arguments));
	};

	UIModule.prototype = Object.create(DependancyModule.prototype);
	UIModule.prototype.objectType = 'UIModule';
	UIModule.prototype.constructor = UIModule;
	UIModule.prototype.beforeMake = function() {}				// virtual
	UIModule.prototype.afterMake = function() {}				// virtual
	UIModule.prototype.beforeCreateDOM = function() {}			// virtual
	UIModule.prototype.createDOM = function() {}				// virtual
	UIModule.prototype.afterCreateDOM = function() {}			// virtual
	UIModule.prototype.beforeRegisterEvents = function() {}		// virtual
	UIModule.prototype.registerClickEvents = function() {}		// virtual
	UIModule.prototype.registerLearnEvents = function() {}		// virtual
	UIModule.prototype.registerKeyboardEvents = function() {}	// virtual
	UIModule.prototype.afterRegisterEvents = function() {}		// virtual
	UIModule.prototype.registerValidators = function() {}		// virtual
	UIModule.prototype.resize = function() {}					// virtual
	UIModule.__factory_name = 'UIModule';
	/**
	 * @abstract
	 */
	UIModule.prototype.Make = function() {
		this.beforeMake(arguments);
		this.init(arguments)
		this.afterMake(arguments);
		this.raw = false;
	}
	/**
	 * @abstract
	 */
	UIModule.prototype.init = function(/* arguments : def, container */) {
		this.createEvents.apply(this, arguments);
		this.create.apply(this, arguments);
//		this.initGenericEvent(); 						// REMINDER : Don't call. That could call the descendant's method before the events are created
		this.registerEvents();
		this.resizeAll();
		this.firstRender();
		this.renderChain.push();
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
		this.beforeCreateDOM(arguments);
		(this.containerDOMId && (this.container = $('#' + this.containerDOMId)));
		this.createDOM(arguments)
		this.afterCreateDOM(arguments);
	}
	
	UIModule.prototype.registerEvents = function() {
		this.beforeRegisterEvents();
		this.registerClickEvents();
		this.registerKeyboardEvents();
		(this.hoverElem && this.registerLearnEvents());
		this.afterRegisterEvents();
		this.registerValidators();
	}
	/**
	 * @abstract
	 */
	UIModule.prototype.firstRender = function() {
		(this.container && this.container.append(this.domElem));
	}
	/**
	 * @abstract
	 */
	UIModule.prototype.initGenericEvent = function() {
		this.genericEvent();
		// generic event may be : this.createEvent('action'); triggered by any individual event among the -whole- set of events the module may trigger
		// CAUTION : only end-heriting object MAY call initGenericEvent in the constructor.
		// The other classes (one level uppon this abstract class and upper) may define a default method,
		// but would risk an init race failure when calling (calling to soon) the method from their constructor
		// intermediate- (two levels uppon this abstract class) & end- classes should then call super.initGenericEvent()
		// before connecting their own events to the generic event
	}
	/**
	 * @abstract
	 */
	UIModule.prototype.isCalledFromFactory = function() {
//		console.log(arguments);
		var args = null,
			bool = (arguments.length === 1 && (args = Array.prototype.slice.call(arguments[0])).length && typeof args[0].sections !== 'undefined');
//		console.log(args);
		return args;
	}
	/**
	 * @abstract
	 */
	UIModule.prototype.asyncCSSActiveState = function() {// helper (locks behavior as "always async", then command can be initialized before animation ends)
		var self = this;
		var asyncExec = new Promise(function(resolve, reject) {
			self.domElem.addClass('actionated');
			setTimeout(function() {
				self.domElem.removeClass('actionated');
			}, 64);
		});
	}
	/**
	 * @abstract
	 */
	UIModule.prototype.update = function() {
		// code here //
		this.trigger('update');
	}
	/**
	 * @generic
	 */
	UIModule.prototype.resizeAll = function() {
		var self = this;
//		console.log('resizeAll');
//		console.log(this.resize)
		this.resize();
		setTimeout(function() {
			for (var i in self.modules) {
				if (self.modules[i].objectType === 'UIModule')
					self.modules[i].resize();
			}
		}, 64);
	}
	/**
	 * @generic
	 */
	UIModule.prototype.updateAll = function() {
		this.update();
		for (var i in self.modules) {
				this.modules[i].update();
		}
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
		this.createEvent('action');
		this.createEvent('actionrefused');
	}
	Command.prototype = Object.create(CoreModule.prototype);
	Command.prototype.objectType = 'Command';
	Command.prototype.constructor = Command;
	
	Command.prototype.act = function() {
		var self = this, canActResult, args = Array.prototype.apply(arguments); 
		if (this.canAct === null) {
			this.action.apply(this, args);
		}
		else {
			this.canActQuery = this.canAct.apply(this, args); 
			if (typeof this.canActQuery === 'object' && this.canActQuery instanceof Promise) {
				this.canActQuery.then(
						function(queryResult) {
							args.push(queryResult);
							self.action.apply(self, args);
							self.trigger('action');
							return queryResult;
						},
						function(queryResult) {
							self.trigger('actionrefused');
							return queryResult;
						}
				);
			}
			else if (this.canActQuery) {
				this.canActQuery = Promise.resolve(this.canActQuery);
				this.action.apply(this, args);
				this.trigger('action');
			}
			else {
				this.canActQuery = Promise.reject(this.canActQuery);
				this.trigger('actionrefused', ['canActQuery', this.canActQuery]);
			}
		}
		return this.canActQuery;
	}
	
//	Command.prototype.resetSiblings = false;

	Command.__factory_name = 'Command';
	
	
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
	 * A Factory to instanciate virtual-DOM element definitions
	 */
	var elementDef = FactoryMaker.getClassFactory(function(type, nodeName, uniqueId, className, section, title) {
			return {
				type : type || '',
				nodeName : nodeName || '',
				id : uniqueId || '',
				buttonClassName : '',
				className : className || '',
				css : {},
				section : section || 0,
				title : title || '',
				command : null,
				keyboardSettings : [{
					ctrlKey : false,
					shiftKey : false,
					altKey : false,
					keyCode : 0
				}]
			};
		}
	);
	
	
	/**
	 * A Factory to instanciate UI Modules definitions
	 */
	var UIModuleDef = FactoryMaker.getClassFactory(function(sections, subSections, members, stylesheet, options) {
			return {
				sections : sections || [],
				subSections : subSections || [],
				members : members || [],
				stylesheet : stylesheet || null,
				options : options || {},
				verticalMargins : 0
			};
		}
	);
	
	var optionSetter = function(baseOptions, options) {
		options = (typeof options === 'object' && Object.keys(options).length) ? options : {};
		for(var prop in baseOptions) {
			if (baseOptions.hasOwnProperty(prop) && typeof options[prop] === 'undefined')
				options[prop] = baseOptions[prop];
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
		elementDef : elementDef,
		UIModuleDef : UIModuleDef,
		optionSetter : optionSetter,
		Maker : FactoryMaker
	}
	
})();

module.exports = Factory;