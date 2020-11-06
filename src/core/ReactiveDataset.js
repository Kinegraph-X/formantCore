/**
 * @constructor RecitalDataset
 */

var TypeManager = require('src/core/TypeManager');
var ComponentGroup = require('src/UI/groups/ComponentGroup');



var RecitalDataset = function(rootComponent, trackedModule, template, factoryPropsArray, arrayFunctions, childrenOffset) {
	if (!rootComponent || !trackedModule || !template || !factoryPropsArray)
		return;
	this.init(rootComponent, trackedModule, template, factoryPropsArray, childrenOffset || 0);
	if (typeof arrayFunctions !== 'undefined') {
		if (Array.isArray(arrayFunctions))
			this.getFunctionList(arrayFunctions);
		else if (Object.keys(arrayFunctions || {}).length)		// allows passing null instead of an object
			this.setArrayFunctions(arrayFunctions);
	}
}
RecitalDataset.prototype = Object.create(Array.prototype);
Object.defineProperty(RecitalDataset.prototype, 'arrayFunc', {
	value : {
		trackedProp : 'active',
		every : function(item) {return item[this.trackedProp];},
		none : function(item) {return !item[this.trackedProp];},
		some : function(item) {return item[this.trackedProp];},
		someNot : function(item) {return !item[this.trackedProp];},
		filter : function(item) {return item[this.trackedProp];},
		filterNot : function(item) {return !item[this.trackedProp];}
	}
});
Object.defineProperty(RecitalDataset.prototype, 'getDefaultListDef', {
	value : function() {
				return TypeManager.createComponentDef({
					type : 'ComponentList',
					each : [],
					item : null,
					template : null,
					templateCtor : ComponentGroup
				});
			}
});
Object.defineProperty(RecitalDataset.prototype, 'init', {
	value : function(rootComponent, trackedModule, template, factoryPropsArray, childrenOffset) {
		Object.defineProperty(this, 'rootComponent', {
			value : rootComponent
		});
		Object.defineProperty(this, 'trackedModule', {
			value : trackedModule
		});
		Object.defineProperty(this, 'defaultListDef', {
			value : this.getDefaultListDef()
		});
		this.defaultListDef.host.template = template;
		Object.defineProperty(this, 'funcList', {
			value : []
		});
		Object.defineProperty(this, 'Item', {
			value : this.setFactory(factoryPropsArray)
		});
		Object.defineProperty(this, 'childrenOffset', {
			value : childrenOffset
		});
	}
});

Object.defineProperty(RecitalDataset.prototype, 'getFunctionList', {
	value : function(arrayFunc) {
		Array.prototype.push.apply(this.funcList, arrayFunc);
	}
});
Object.defineProperty(RecitalDataset.prototype, 'setArrayFunctions', {
	value : function(arrayFunctions) {
		this.getFunctionList(Object.keys(arrayFunctions));
		Object.defineProperty(this, 'arrayFunc', {
			value : arrayFunctions
		});
	}
});
Object.defineProperty(RecitalDataset.prototype, 'setFactory', {
	value : function(factoryPropsArray) {
		if (!factoryPropsArray) {
			console.warn('factoryPropsArray is ' + (typeof factoryPropsArray) + ' : This changes the "newItem()" method\'s signature (arg0 is now Object). Nevertheless, that shouldn\'t have any other repercussion.');
			return function() {return arguments[0][0];};
		}
		var factory = function() {
			[...arguments[0]].forEach(function(arg, key) {
				this[factoryPropsArray[key]] = arg;
			}, this);
		}
		factory.prototype = Object.create(Object.prototype);
		factoryPropsArray.forEach(function(propName) {
			factory.prototype[propName] = null; 
		});
		return factory;
	}
});

Object.defineProperty(RecitalDataset.prototype, 'newItem', {
	value : function() {
		return (new this.Item(arguments));
	}
});


Object.defineProperty(RecitalDataset.prototype, 'updateDatasetState', {
	value : function() {
		this.funcList.forEach(function(prop) {
			if (prop === 'filter' || prop === 'filterNot')
				this.rootComponent.streams[prop].value = Array.prototype.filter.call(this, this.arrayFunc[prop], this.arrayFunc).length;
			else {
				this.rootComponent.streams[prop].value = Array.prototype[prop] 
					? Array.prototype[prop].call(this, this.arrayFunc[prop], this.arrayFunc)
						: (prop === 'none' 
							? Array.prototype.every.call(this, this.arrayFunc[prop], this.arrayFunc)
								: Array.prototype.some.call(this, this.arrayFunc[prop], this.arrayFunc));
			}
		}, this);
		if (this.rootComponent.streams['length'])
			this.rootComponent.streams['length'].value = this.length;
	}
});

Object.defineProperty(RecitalDataset.prototype, 'setDatasetState', {
	value : function(stateName, value, setSingle) {
		this.rootComponent.streams[stateName].value = value;
		if (!setSingle)
			this.updateDatasetState();
	}
});

Object.defineProperty(RecitalDataset.prototype, 'getDatasetState', {
	value : function(stateName) {
		return this.rootComponent.streams[stateName].value;
	}
});

Object.defineProperty(RecitalDataset.prototype, 'push',  {
	value : function(item) {
		this.defaultListDef.host.each = [item];
		this.trackedModule.addModules(this.defaultListDef, this.trackedModule.modules.length);
		Array.prototype.push.call(this, item);
		this.updateDatasetState();
	}
});

Object.defineProperty(RecitalDataset.prototype, 'pushApply',  {
	value : function(itemArray) {
		this.defaultListDef.host.each = itemArray;
		this.trackedModule.addModules(this.defaultListDef, this.trackedModule.modules.length);
		Array.prototype.push.apply(this, itemArray);
		this.updateDatasetState();
	}
});

Object.defineProperty(RecitalDataset.prototype, 'splice',  {
	value : function(index, length, replacedBy) {
		var c1, c2, mBackup;

		if (typeof replacedBy === 'number') {
			if (replacedBy > index) {
				c2 = this.trackedModule.modules[replacedBy].remove();
				c1 = this.trackedModule.modules[index].remove();
				this.trackedModule.registerModule(c2, null, index + this.childrenOffset);
			}
			else {
				c1 = this.trackedModule.modules[index].remove();
				c2 = this.trackedModule.modules[replacedBy].remove();
				this.trackedModule.registerModule(c2, null, index - 1 + this.childrenOffset);
			}

			mBackup = Array.prototype.splice.call(this, index, 1, this[replacedBy])[0];
			this.updateDatasetState();
			return [mBackup, c1];
		}
		else if (typeof replacedBy === 'undefined' || replacedBy === null) {
			c1 = this.trackedModule.modules[index].remove();
			mBackup = Array.prototype.splice.call(this, index, 1)[0];
			this.updateDatasetState();
			return [mBackup, c1];
		}
		else if (Array.isArray(replacedBy)) {
			this.trackedModule.registerModule(replacedBy[1], null, index + this.childrenOffset);
			Array.prototype.splice.call(this, index, 1, replacedBy[0]);
			this.updateDatasetState();
			return true;
		}
	}
});

Object.defineProperty(RecitalDataset.prototype, 'spliceOnProp',  {
	value : function(prop, value) {
		if (this.trackedModule.modules.length) {
			var module;
			for (let i = this.trackedModule.modules.length - 1; i >= 0; i--) {
				module = this.trackedModule.modules[i];
				if (module.streams[prop] && module.streams[prop].value === value) {
					module.remove();
					Array.prototype.splice.call(this, i, 1);
				}
			}
			this.updateDatasetState();
		}
		else
			return false;
	}	
});

Object.defineProperty(RecitalDataset.prototype, 'spliceOnPropInverse',  {
	value : function(prop, value) {
		if (this.trackedModule.modules.length) {
			var module;
			for (let i = this.trackedModule.modules.length - 1; i >= 0; i--) {
				module = this.trackedModule.modules[i];
				if (module.streams[prop] && module.streams[prop].value !== value) {
					module.remove();
					Array.prototype.splice.call(this, i, 1);
				}
			}
			this.updateDatasetState();
		}
		else
			return false;
	}	
});

Object.defineProperty(RecitalDataset.prototype, 'resetLength',  {
	value : function(ComponentGroupObj) {
		if (this.trackedModule.clearAllModules())
			Array.prototype.splice.call(this, 0, this.length);
	}
});

Object.defineProperty(RecitalDataset.prototype, 'serialize', {
	value : function() {
		return JSON.stringify(Array.from(this));
	}
});








module.exports = RecitalDataset;