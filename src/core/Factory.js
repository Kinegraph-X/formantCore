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
	
	// Theses two methods should be implemented further down in the inheritance chain : 
	// 		progressive creation in UIModule implies managing a "raw" status on the component
	CoreModule.prototype.asyncAddChild = function(child) {} 						// Virtual
	CoreModule.prototype.asyncAddChildren = function(oneShot) {} 					// Virtual
	
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
		candidateModule.__in_tree_name = moduleName;
		candidateModule._parent = this;
		this.modules[moduleName] = this[moduleName] = candidateModule;
		(!this[moduleName] && (this[moduleName] = this.modules[moduleName]));	// allow "protected" aliasing
		(!this[moduleName] && console.error('ModuleName Aliasing error'))
		
		// autoSubscribe to object own events
		var handler, desc;
		for (evt in candidateModule.autoSubscribe) {
			if (!this['on' + evt])
				console.warn(this.objectType, 'registers ' + candidateModule.objectType, ' : Registering a child module on a raw Component ("Make" function not already called, then no DOM/Event exists) : Automatic Bindings won\'t work');
			handler = candidateModule.autoSubscribe[evt];
			desc = Object.getOwnPropertyDescriptor(this, 'on' + evt);
			if (typeof desc !== 'undefined' && typeof desc.get === 'function')
				this['on' + evt] = handler; 	// setter for event subscribtion
		}
		
		// autoReact on parent's observables
		// (DONE : as there is no insurance that the DOM/Streams are existent nor created in this abstract interface, this code-block may not work.
		// this functionnality is ALSO handled in UIModule.prototype.execBindingQueue = after DOM creation)
		// Binding on "raw" childModules (module's "make" function hasn't still beeen called when "making" the parent) is tested and warned here & there
		// We also test here the case where the component state is held elsewhere than on the DOM hostElem (needs an explicit callback function on subscription)
		if (this.streams && Object.keys(this.streams).length && candidateModule.reactOnParent && Object.keys(candidateModule.reactOnParent).length) {
//			console.log(optionSetter(candidateModule.def.reactOnParent, candidateModule.reactOnParent));
			
			for (let moduleState in (optionSetter(candidateModule.def.reactOnParent, candidateModule.reactOnParent))) {
				desc = candidateModule.reactOnParent[moduleState];
				
				if (!candidateModule.hostElem && !desc.subscribe) {
					console.warn('reactOnParent binding of a "raw" child module (before calling "Make" or on a listComponent, which may have no hostElem) : childModule ' + moduleName + '=> From ' + desc.from + ' to ' + moduleState);
					continue;
				}
				
				if (!this.streams[desc.from]) {
					console.warn('reactOnParent binding of a child module (' + moduleName + ') on an unknown stream of the parent Component : From ' + desc.from + ' to ' + moduleState);
					continue;
				}
				CoreModule.bindModuleToStream.call(this, candidateModule, moduleState, desc);
			}
		}
		
		// autoReact on self-contained observables
		if (candidateModule.reactOnSelf && candidateModule.streams && Object.keys(candidateModule.streams).length) {
			CoreModule.setReactOnSelf.call(candidateModule);
		}
	}
	
	/**
	 * HELPER : this structure is also used for async children binding in the UIModule class
	 */
	CoreModule.setReactOnSelf = function() {
		for (let moduleState in this.reactOnSelf) {
	//		console.log(candidateModule.streams[moduleState]);
			let desc = this.reactOnSelf[moduleState];
			desc.from = moduleState;
			if(!this.streams[moduleState])
				continue;
			CoreModule.bindModuleToStream.call(this, this, moduleState, desc);
		}
	}
	
	/**
	 * @param {UIModule} candidateModule
	 * @param {string} moduleState
	 * @param {object} desc
	 */
	CoreModule.bindModuleToStream = function(candidateModule, moduleState, desc) {
		var def = this.def.host ? this.def.host : this.def;
		(!this.streams[desc.from].transform && (this.streams[desc.from].transform = desc.transform));
		(function(candidate, parentState, childState) {
			this.streams[parentState.from].subscribe(parentState.cbOnly ? parentState.subscribe : (candidate.hostElem || parentState.subscribe), childState).filter(parentState.filter).map(parentState.map).reverse(parentState.inverseTransform);
			// for reactOnSelf : there may be a hostElem AND a callback, then if we want complex reaction (on an Array for example), we pass a cb and bypass the "on hostElem" magical binding (which won't happen anyway if it's not a custom elem)
			(parentState.cbOnly && (this.streams[parentState.from].value = def.states[parentState.from]));
			// Don't arm autoReact twice : if done here, don't repeat in UIModule
			parentState.armed = true;
		}).call(this, candidateModule, desc, moduleState);
//			console.log('binding from parent ' + desc.from + ' to ' + moduleState, this.streams[desc.from]);
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
		
		/**@memberOf a CoreModule instance : each event is given 2 handy functions to register listeners : oneventType & one_eventType*/
		Object.defineProperty(this, 'on' + eventType, {
			enumerable : false,
			configurable : true,
			get : function() {
//				this.trigger(eventType);
			},
			set : function(handler) {
				if (typeof handler !== 'function') {
					console.warn('Bad eventHandler assigned : handler type is ' + typeof handler + ' instead of "function or object"', 'EventType ' + eventType);
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
			// HISTORY : constructors seems unreachable after the second inheritance...
			// base.apply(this, arguments);
			// extension.apply(this, arguments);
			
			// creating dummy objects with new base(arguments) seems to be a more useable construct :
			// CAUTION : jQuery objects (and other object of type "instance object") may loose their prototype (see com on mergeOwnProperties function)...
			var args = UIModule.prototype.isCalledFromFactory.apply(this, arguments) || arguments;
//			if (Object.getPrototypeOf(base) === Object.getPrototypeOf(Function)) {
//				console.log('merge', args);
//				self.mergeOwnProperties(this, new base(args));
				base.apply(this, args);
				extension.apply(this, args);
//			}
//			else {
//				extension.apply(this, args);
//			}
			// cf. upper com ("CAUTION")
//			(this.command && (this.command = new Command(this.command.action, this.command.canAct, this.command.undo)));
//			console.log(this.def);
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
	 * 
	 * There are various allowed instanciation principles :
	 * 
	 * 	- composition of components, through the initial def => 2 cases :
	 * 		- composition from flat def : the main path is to declare a type in the def, then the componentGroup ctor pushes the whole bunch in a hierarchy of components (3 levels max)
	 * 		- extension through an inherited class : a special case has been defined for the "basically informative" pictograms (valid, disabled, etc.) : they are "secretly" appended through an inherited subClass 
	 * 	- composition of "(not necessarily) passive" DOM nodes, through a default def on the child component,
	 * 	- DOM extension, where we wish it'd be flat extension (but depth is allowed through innerHTML <== EVIL, use it with caution), through decorators, as mixins on a "child or host" component,
	 * and last but not least,
	 * 	- composition through "by default instanciated children" (in the component's ctor). You may give thanks, it's lazy.
	 * 
	 * @constructor
	 * @extends DependancyModule
	 * @interface
	 * 
	 * @param {Object} def : custom object that defines the UI (generally a list of properties and behaviors for a button)
	 * @param {Object} (DOMElem Instance) parentSlot
	 * @param {string} buttonClassName
	 */
	var UIModule = function(def, parentSlotDOMId, automakeable, childrenToAdd, targetSlot) {
		
//		this.cDef = {};
//		this.cDef.children = [];
		
		this.autoSubscribe = {};
		this.reactOnParent = {};
		
		this.raw = true;
		
		this.DOMRenderQueue = this.DOMRenderQueue || [];
		this.bindingQueue = this.bindingQueue || [];
		this.childrenToAdd = (childrenToAdd && Array.isArray(childrenToAdd)) ? childrenToAdd : ((childrenToAdd && Array.isArray(childrenToAdd.DOMRenderQueue) ? [{module : childrenToAdd}] : [])); 	// DOMRenderQueue is used here as a "mark" : don't add children that don't come from this framework
		
		DependancyModule.call(this);
		this.objectType = 'UIModule';

		this.def = def || (this.def || undefined);
		this.mergeDefaultDef(this.setDefaultDef()); 	// TODO : should say createDeafultDef here
		this.parentSlot = this.parentSlot || undefined;
		
//		console.log(this.parentSlotDOMId);
		this.parentSlotDOMId = parentSlotDOMId || this.parentSlotDOMId;
//		console.log(this.parentSlotDOMId);

		this.hostElem;
		this.rootElem;
		this.hoverElem = this.hoverElem;
		this.slots = {};
		(targetSlot && (this.slots['default'] = (this.rootElem || this.hostElem).children[targetSlot]));

		this.command = this.def.command || undefined;
//		(this.command && console.log(this.command, this.command.prototype));
		this.keyboardEvents = this.keyboardEvents || [];
		
		(automakeable && this.Make.apply(this, arguments));
	};

	UIModule.prototype = Object.create(DependancyModule.prototype);
	UIModule.prototype.objectType = 'UIModule';
	UIModule.prototype.constructor = UIModule;
	UIModule.prototype.setDefaultDef = function() {}					// virtual
	UIModule.prototype.beforeMake = function() {}						// virtual
	UIModule.prototype.afterMake = function() {}						// virtual
	UIModule.prototype.beforeCreateDOM = function() {}					// virtual
	UIModule.prototype.createDOM = function() {}						// virtual
	UIModule.prototype.passToShadow = function() {}						// virtual
	UIModule.prototype.basicEarlyDOMExtend = function() {}				// virtual
	UIModule.prototype.basicLateDOMExtend = function() {}				// virtual
	UIModule.prototype.declareObservableDomAttributes =  function() {}	// virtual
	UIModule.prototype.afterCreateDOM = function() {}					// virtual
	UIModule.prototype.setDOMTypes = function() {}						// virtual
	UIModule.prototype.setArias = function() {}							// virtual
	UIModule.prototype.beforeRegisterEvents = function() {}				// virtual
	UIModule.prototype.createObservables = function() {}				// virtual
	UIModule.prototype.registerClickEvents = function() {}				// virtual
	UIModule.prototype.registerLearnEvents = function() {}				// virtual
	UIModule.prototype.registerKeyboardEvents = function() {}			// virtual
	UIModule.prototype.registerDOMChangeObservers = function() {}		// virtual
	UIModule.prototype.afterRegisterEvents = function() {}				// virtual
	UIModule.prototype.registerValidators = function() {}				// virtual
	UIModule.prototype.resize = function() {}							// virtual
	UIModule.__factory_name = 'UIModule';
	/**
	 * @abstract
	 */
	UIModule.prototype.Make = function() {
		this.raw = false;						// disable "raw" first : 
		this.beforeMake(arguments);
		this.init(arguments)
		this.afterMake(arguments);
	}
	/**
	 * @abstract
	 */
	UIModule.prototype.init = function(/* arguments : def, parentSlotDOMId */) {
		this.createEvents.apply(this, arguments);
		this.createObservables();
		this.registerValidators();
		this.create.apply(this, arguments);
//		console.log(this.parentSlotDOMId)
//		this.initGenericEvent(); 						// REMINDER : Don't call. That could call the descendant's method before the events are created
		this.registerEvents();
		
		// if the asyncAddChild method has been overridden, there could exist "non-raw" children we need to add
		(this.hasOwnProperty('asyncAddChild') && this.asyncAddChild());
		
		this.asyncAddChildren();
		
		this.resizeAll();
		this.firstRender();
		
		// define this.slots['default'] as :
		// 		- this.hostElem
		// 		OR
		//		- firstChild of (this.rootElem || this.hostElem)
		// define this.slots['key as number'] as :
		//		- each of their children
		if (!this.slots['default']) {
			this.slots['default'] = (this.hostElem
				? (
					(this.rootElem || this.hostElem).childNodes.length 
						? function() {
							(this.rootElem || this.hostElem).childNodes.forEach(function(child, key) {
								this.slots[parseInt(key)] = child;
							}, this);
							return ((this.rootElem || this.hostElem).firstChild.nodeName === 'STYLE' ? (this.rootElem || this.hostElem).children[1] : (this.rootElem || this.hostElem).firstChild);
							}.call(this)
						: this.hostElem) 
				: undefined);
		}
		
		// reflect default slot on def (currently only for debug purpose)
		(this.slots['default'] && (this.def.defaultSlot = this.slots['default']));
		
		this.execBindingQueue();
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
		// Shortcut to allow children instanciation of non-appended parents (using a selector is not applicable at instantiation step, due to DOM update latency)
		(this.parentSlotDOMId && 
				((this.parentSlotDOMId instanceof HTMLElement || this.parentSlotDOMId instanceof ShadowRoot)
					? this.parentSlot = this.parentSlotDOMId
						: this.parentSlot = document.querySelector('#' + this.parentSlotDOMId)));
//		console.log(this.parentSlotDOMId);
		this.createDOM(arguments);
		this.passToShadow();
		this.basicEarlyDOMExtend();
		this.renderDOMQueue();
		this.basicLateDOMExtend();
		// binding can't happen on 'non connected' custom elems : attr missing...
//		this.execBindingQueue();		// rejected at the end of the init process
		this.declareObservableDomAttributes();
		this.afterCreateDOM(arguments);
		this.setDOMTypes();
		this.setArias();
	}
	
	UIModule.prototype.registerEvents = function() {
		this.beforeRegisterEvents();
		this.registerDOMChangeObservers();
		// binding can't happen on 'non connected' custom elems : attr missing...
//		this.execBindingQueue();		// rejected at the end of the init process
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
	UIModule.prototype.renderDOMQueue = function() {
		var componentDef = this.def.host ? this.def.host : this.def,
			def,
			elem;
//		console.log(componentDef);
		this.DOMRenderQueue.forEach(function(renderFunc, key) {
			// DOM extension is considered as an "allowed" goal of the offered mixin mecanism
			// BUT : renderFunc may not always return a def : this allow mixins to use "targeted composition" instead of "basic nodes concatenation"
			// => they should then define and append themselves some child-modules (call to registerModule with a component as arg)
			// but still, we encourage devs (in both cases) to use the 'renderQueue" mecanism, as it frees the lifecycle from "custom" lifecycle phases (these phases may then be used for "real" special cases)
			if (!(def = renderFunc.call(this, componentDef)))
				return;
			
			if (def.wrapper) {
				if (this.rootElem) {
//					console.log('rootElem', def.wrapper);
					this.rootElem.appendChild(def.wrapper);
				}
				else
					this.hostElem.appendChild(def.wrapper);
			}
//			console.log(this, this.rootElem.children, this.rootElem.lastChild);
			if (def.members && def.members.length) {
				if (def.wrapper) {
					elem = this.rootElem ? this.rootElem.lastChild : this.hostElem.lastChild;
					def.members.forEach(function(member, k) {
						elem.appendChild(member)
					});
				}
				else {
					elem = this.rootElem ? this.rootElem : this.hostElem;
					def.members.forEach(function(member, k) {
						elem.appendChild(member)
					});
				}
			}
		}, this);
	}
	/**
	 * @abstract (Model to be overloaded)
	 */
	UIModule.prototype.asyncAddChild = function(candidateModule, forceAdd, eventBinding) {
		forceAdd = forceAdd || false 
		this.childrenToAdd.push({module : candidateModule, eventBinding : eventBinding});
		(forceAdd && this.asyncAddChildren(this.childrenToAdd[this.childrenToAdd.length - 1]));
	}
	/**
	 * @abstract
	 */
	UIModule.prototype.asyncAddChildren = function(oneShot) {
		// interesting question here : does the compiler optimize the code better when we check for "zero length" or just when filtering a "zeror length" array and re-assigning it ?
		// TODO : benchmark should be explicitly "talking" on long hierarchy
		if (!this.childrenToAdd.length)
			return;
		
		var name, names = {};
		// prevent masking of already "incremented" subModule names
		for (let moduleName in this.modules) {
			(typeof names[this.modules[moduleName].objectType] === 'undefined' ? names[this.modules[moduleName].objectType] = 0 : ++names[this.modules[moduleName].objectType]);
		}
		
		this.childrenToAdd = this.childrenToAdd.filter(function(childDef) {
			if (childDef.module.raw || (oneShot && childDef !== oneShot))
				return true;	// allow another method to add the "raw" children (don't delete them, but don't make them reactive for now : they don't have any DOM)
			
			// DEBUG : reflect the reactOnParent definition in the def
			// TODO : components should in the future be able to instanciate themselves independantly of the strategy chosen by the user : global def, inheritance, mixin... 
			childDef.module.def.reactOnParent = optionSetter(childDef.module.reactOnParent, childDef.module.def.reactOnParent);
			delete childDef.module.reactOnParent;

			name = this.maintainUniqueNames(names, childDef.module.objectType)
			
			// register subModule
			this.registerModule(name, childDef.module);
			
			// heuristic targetSlot definition
			childDef.module.targetSlot = (typeof childDef.module.def.targetSlot === 'number' ? this.slots[childDef.module.def.targetSlot] : childDef.module.targetSlot) || this.slots['default'];
			// reflect targetSlot on def (currently only for debug purpose)
			childDef.module.def.targetSlot = childDef.module.targetSlot;
			
			// bind requested events subModule
			for (let eventName in childDef.eventBinding) {
				let lowerCaseEventName = eventName.toLowerCase();
				if (!childDef.module.hasOwnProperty('on' + lowerCaseEventName))
					continue;
				childDef.module['on' + lowerCaseEventName] = childDef.eventBinding[eventName];
			}
			return false;
		}, this);
	}
	/**
	 * @abstract
	 * This method is not defined in the CoreModule class (it's basically a loop with some tests in the registerModule method)
	 * HERE : we test for the case of an "already handled" binding : desc.armed (in the CoreModule class, effectively)
	 */
	UIModule.prototype.reactOnParentBinding = function(candidateModule) {
		for (let moduleState in (candidateModule.reactOnParent)) {
//			console.log(candidateModule.objectType, candidateModule.reactOnParent[moduleState]);
			let desc = candidateModule.reactOnParent[moduleState];
			if(!this.streams[desc.from] || desc.armed)
				continue;
			CoreModule.bindModuleToStream.call(this, candidateModule, moduleState, desc);
		}
	}
//	/**
//	 * @abstract
//	 */
//	UIModule.prototype.reactOnSelfBinding = function() {
//		console.log(this.reactOnSelf);
//		for (let moduleState in this.reactOnSelf) {
//			console.log(this.streams[moduleState]);
//			let desc = this.reactOnSelf[moduleState];
//			desc.from = moduleState;
//			if(!this.streams[moduleState])
//				continue;
//			CoreModule.bindModuleToStream.call(this, this, moduleState, desc);
//		}
//	}
	
	
	
	
	
	
	/**
	 * @abstract
	 */
	// HACK - Y thing : although "childModules handling" pertains to the CoreModule Interface, UIModule handles here the special case of the autoReact-ive props in childModules
	// BUT : That should be only executed on very special cases : when the user choose to extend the def after having registered a childModule. Things should not be made that way 
	UIModule.prototype.execBindingQueue = function() {
		this.bindingQueue.forEach(function(renderFunc, key) {
			renderFunc.call(this);
		}, this);
		
		if (this.reactOnSelf && this.streams && Object.keys(this.streams).length)
			CoreModule.setReactOnSelf.call(this);
		
		// LATELY
		// (UIModule handles the special case of the reactOnParent prop on childModules in this "execBindingQueue" method)
		// case of the childComponents (when "registered" before parent's "Make") : autoReact (lately) on parent's observables
		if (this.streams && Object.keys(this.streams).length) {
			for (let moduleName in this.modules) {
				if (!this.modules[moduleName].reactOnParent)
					continue;
				
				// DEBUG cf. line 1010
				this.modules[moduleName].def.reactOnParent = optionSetter(this.modules[moduleName].reactOnParent, this.modules[moduleName].def.reactOnParent);
				
				this.reactOnParentBinding(this.modules[moduleName]);
				
				// DEBUG 
				delete this.modules[moduleName].reactOnParent;
			}
		}
	}
	
	
	
	
	
	
	
	
	/**
	 * @abstract
	 */
	UIModule.prototype.firstRender = function() {
//		console.log(this.parentSlot, this.hostElem, this);
		(this.parentSlot && this.hostElem && this.parentSlot.appendChild(this.hostElem));
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
//		this.resize();
//		setTimeout(function() {
//			for (var i in self.modules) {
//				if (self.modules[i].objectType === 'UIModule')
//					self.modules[i].resize();
//			}
//		}, 64);
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
	 * DEBUG
	 */
	UIModule.prototype.getComputedDef = function() {
//		var cDef = {};
//		for (var prop in this.def) {
//			if (this.def.hasOwnProperty(prop) && this.def[prop] !== null && this.def[prop] != {} && this.def[prop] != '')
//				cDef[prop] = this.def[prop];
//		}
//		Object.assign(cDef, this.reactOnParent);
//		Object.assign(cDef, this.autoSubscribe);
//
//		if (this._parent)
//			this._parent.cDef.children.push(cDef);
	}
	
	UIModule.traverseHierarchy = function(comp) {
		comp.cDef = {};
		if (comp.objectType !== 'ComponentGroup') {
			for (let prop in comp.def) {
				this.getCleanDesc(prop, comp.def, comp.cDef);
			}
			comp.cDef = this.sortDesc(comp.cDef);
		}
//		console.log(comp);
		if (Object.keys(comp.modules).length) {
			comp.cDef.children = [];
			for (let name in comp.modules) {
				comp.cDef.children.push(UIModule.traverseHierarchy(comp.modules[name]));
			}
		}
		return comp.cDef;
	}
	UIModule.getCleanDesc = function(prop, obj, newObj) {
//		if (!obj[newProp])
//			obj[newProp] = {};
		if (obj.hasOwnProperty(prop) && obj[prop] !== null && obj[prop] != '') {
			
			// Abstract the complex objects in the hierarchical despcription
			if (obj[prop] instanceof Command)
				newObj['Command'] = '[Object]';
			else if (obj[prop] instanceof StylesheetWrapper || obj[prop].styleElem)
				newObj['StylesheetWrapper'] = '[Object]';
			else if ((prop === 'reactOnParent') && Object.keys(obj[prop]).length)
				newObj['autoBindingOnParentStates'] = Object.keys(obj[prop]).map(function(item) {return item + ' <== ' + obj[prop][item].from});
			else if ((prop === 'reactOnSelf') && Object.keys(obj[prop]).length)
				newObj['autoBindingOnSelfStates'] = Object.keys(obj[prop]).map(function(item) {return item + ' <== ' + obj[prop][item].from});
			else if (prop === 'autoSubscribe' && Object.keys(obj[prop]).length)
				newObj['autoBindingOnDescendantEvents'] = Object.keys(obj[prop]);
			else if (prop === 'states' && Object.keys(obj[prop]).length)
				newObj['declaredObservableStates'] = Object.keys(obj[prop]);
			// clean the elementDef
			else if (prop === 'host' || prop === 'subSections' || prop === 'members' || prop === 'options' || !isNaN(parseInt(prop))) {
				if (Object.keys(obj[prop]).length) {
					newObj[prop] = {};
					
					for (let p in obj[prop]) {
						this.getCleanDesc(p, obj[prop], newObj[prop]);
					}
					newObj[prop] = this.sortDesc(newObj[prop]);
				}
			}
			else if (typeof obj[prop] === 'object' && obj[prop].nodeName) 		// prop === 'defaultSlot'
				(prop === 'defaultSlot' && (newObj['slots[\'default\']'] = obj[prop].nodeName)) || (newObj['targetSlotOnParent'] = obj[prop].nodeName);
			else if (!Object.keys(obj[prop]).length)
				return;
			else if (prop === 'type')
				newObj['isAutoBuiltType'] = obj[prop];
			else if (prop !== 'keyboardSettings')
				newObj[prop] = obj[prop];
		}
	}
	
	UIModule.sortDesc = function(desc) {
		var sampleDesc = {
				"0" : "sample",
				"1" : "sample",
				"2" : "sample",
				"3" : "sample",
				"4" : "sample",
				"5" : "sample",
				"isAutoBuiltType": "sample",
				"nodeName": "sample",
				"templateNodeName": "sample",
				"host" : "sample",
				"declaredObservableStates": "sample",
				"autoBindingOnParentStates" : "sample",
				"subSections" : "sample",
				"members" : "sample",
				"id": "sample",
				"title": "sample",
				"label": "sample",
				"name": "sample",
				"options" : "sample",
				"glyphNotvalid": "sample",
				"glyphValid": "sample",
				"glyphNotactive": "sample",
				"glyphActive": "sample",
				"glyphNotfocus": "sample",
				"glyphFocus": "sample",
				"StylesheetWrapper": "sample",
				"slots['default']": "sample",
				"targetSlotOnParent": "sample",
				"children": "sample"
			},
			result = {};
		
		Object.keys(sampleDesc).forEach(function(prop) {
			if (typeof desc[prop] !== 'undefined')
				result[prop] = desc[prop]; 
		});
		return result;
	}
	
	/**
	 * HELPERS 
	 */
	
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
	UIModule.prototype.mergeDefaultDef = function(defaultDef) {
//		console.log(this.def, defaultDef);
		if (this.def) {
//			console.log(this.objectType, this.def.title);
			var defSetTitle = this.def.title;
//			this.def = 
			optionSetter(defaultDef, this.def);
			(this.def.host && defSetTitle && (this.def.host.title = defSetTitle)); // hack when given def is moduleDef and default def is elementDef
			// TODO : fix that ugliness above
//			if (this.def.sections)
//				console.log(this.objectType, this.def.sections[0].title);
		}
		else
			this.def = defaultDef;
		
		
//		console.log(this.def.states);
//		console.log(this.def)
	}
	/**
	 * @abstract
	 */
	UIModule.prototype.asyncCSSActiveState = function() {// helper (locks behavior as "always async", then command can be initialized before animation ends)
		var self = this;
		var asyncExec = new Promise(function(resolve, reject) {
//			self.domElem.addClass('actionated');
//			setTimeout(function() {
//				self.domElem.removeClass('actionated');
//			}, 64);
		});
	}
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
		this.name = name || '';
		this.lazy = typeof lazy !== 'undefined' ? lazy : false;
		this.reflectedObj = reflectedObj;
		this.transform = transform || undefined;
		this.inverseTransform;
		this.subscriptions = [];
		
		// by calling the "reflect" method, the property descriptor of the "value" prop may be reflected on another object 
		Object.defineProperty(this, 'value', {
			get : function() {
				if (this.lazy) {
					if (typeof this.transform === 'function')
						this._value = this.transform(this.get());
					this.dirty = false;
				}
				
				return this.get();
			}.bind(this),
			
			set : function(value) {
				this.setAndUpdateConditional(value);
				this.set(value);
			}.bind(this),
			enumerable : true
		})
		this._value;
		this.value = typeof reflectedObj === 'object' ? reflectedObj[name] : value;
		this.dirty;
	}
	Stream.prototype.objectType = 'Stream';

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
		console.log(prop, reflectedHost[prop]);
		this._value = reflectedHost[prop];
		
		if (transform && this.transform)
			console.warn('Bad transform assignment : this.transform already exists');
		else if (!this.transform)
			this.transform = transform;
		
		var desc = Object.getOwnPropertyDescriptor(reflectedHost, prop);
		
		if (!desc.get && desc.writable)
			Object.defineProperty(reflectedHost, prop, Object.getOwnPropertyDescriptor(this, 'value'));
		
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
		var subscription = new Subscription(handlerOrHost, prop, this, inverseTransform);
		this.subscriptions.push(subscription);
		return subscription;
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
				cb : typeof subscriberObjOrHandler === 'function' ? subscriberObjOrHandler : function() {return this._value},
				inverseTransform : inverseTransform || function(value) {return value;},
				stream : this
		}
		
		this._parent = parent;
		this._firstPass = true;
		Object.defineProperty(this, 'execute', Object.getOwnPropertyDescriptor(Subscription.prototype, 'execute')); // make immutable
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
		if (typeof filterFunc !== 'function') {
//			if (typeof filterFunc === 'undefined')
//				console.warn('Bad filterFunc given on observable : filterFunc type is ' + typeof filterFunc + ' instead of "function"', 'StreamName ' + this._parent.name);
			return this;
		}
		// Optimize by breaking the reference : not sure it shall be faster (at least there is only one closure, which is internal to "this" : benchmark needed)
		var f = new Function('value', 'return (' + filterFunc.toString() + ').call(this, value) === true ? true : false;');
		Object.defineProperty(this, 'filter', {
			value : f,
			enumerable : true
		});
		
		return this;
	}
	
	Subscription.prototype.map = function(mapFunc) {
		if(typeof mapFunc !== 'function') {
//			if (typeof mapFunc === 'undefined')
//				console.warn('Bad mapFunc given on observable : mapFunc type is ' + typeof mapFunc + ' instead of "function"', 'StreamName ' + this._parent.name);
			return this;
		}
		// Optimize by breaking the reference : not sure it shall be faster (at least there is only one closure, which is internal to "this" : benchmark needed)
		var f = new Function('value', 'return (' + mapFunc.toString() + ').call(this, value);');
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
				if (this.subscriber.obj !== null && this.subscriber.prop !== null) {
//					console.log(this.subscriber.obj, this.subscriber.prop, val);
					this.subscriber.obj[this.subscriber.prop] = val;
//					console.log('this.subscriber.obj[this.subscriber.prop]', this.subscriber.obj[this.subscriber.prop], this.subscriber.obj);
				}
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
			tabIndex : 0
	}
	
	/**
	 * A Factory to instanciate virtual-DOM element definitions
	 */
	var elementDef = FactoryMaker.getClassFactory(function(type, title, nodeName, uniqueId, sWrapper, section, states, command, reactOnParent, reactOnSelf, children, targetSlot) {
		
		var def = {
			type : type || null,					// String
			nodeName : nodeName || null,			// String
			id : uniqueId || null,					// String
			sWrapper : sWrapper || null,			// Object : instanceof StylesheetWrapper
			section : section || null,				// Number
			title : title || null,					// String
			states : states || null,				// Object : plain
			command : command || null,				// Object : instanceof Command
			reactOnParent : reactOnParent || null,	// Object : plain
			reactOnSelf : reactOnSelf || null,		// Object : plain
			children : children || null,			// Array
			targetSlot : targetSlot || null,		// String
			keyboardSettings : [{
				ctrlKey : false,
				shiftKey : false,
				altKey : false,
				keyCode : 0
			}]
		};
		
		// allow "direct" instanciation : the user already knows all the params
		if (type && typeof type === 'object' && (type.type || type.nodeName)) {
			for (let param in type) {
				def[param] = type[param];
			} 
			return def;
		}
		else
			return def;
		}
	);
	// REMINDER : the DOM Element Constructor applies the whole elementDef based on the following test :
	// if (typeof attributes[attr] === 'boolean' || (attributes[attr]  && attr in elem && ['type', 'nodeName', 'label'].indexOf(attr) === -1))
	
	
	/**
	 * A Factory to instanciate UI Modules definitions
	 * @param host {elementDef} : eventually accepts receiving a fulldef {UIModuleDef} on the first args
	 */
	var UIModuleDef = FactoryMaker.getClassFactory(function(host, subSections, members, options, sWrapper, children, targetSlot) {
//		console.log(sWrapper)
		var def = {
			host : host || null,
			subSections : subSections || [],
			members : members || [],
			children : children || [],
			sWrapper : sWrapper || null,
			options : options || {},
			targetSlot : targetSlot || null,
			verticalMargins : 0
		};
		// allow "direct" instanciation : the user already knows all the params, and gives a full UIModule def as first arg
		if (host && typeof host === 'object' && host.host) {
			for (let param in host) {
				def[param] = host[param];
			} 
			return def;
		}
		else
			return def;
		}
	);
	
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
		options = (typeof options === 'object' && Object.keys(options).length) ? options : {};
		if (!baseOptions)
			return options;
		else if (!options)
			return baseOptions;
		for(var prop in baseOptions) {
//			console.log(prop, options[prop], baseOptions[prop], baseOptions.hasOwnProperty(prop), options[prop]);
			if (baseOptions.hasOwnProperty(prop) && (typeof (options[prop]) === 'undefined' || options[prop] === null)) {
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
		elementDef : elementDef,
		UIModuleDef : UIModuleDef,
		commonStates : commonStates,
		Stream : Stream,
		optionSetter : optionSetter,
		Maker : FactoryMaker
	}
	
})();

module.exports = Factory;