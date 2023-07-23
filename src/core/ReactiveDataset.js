/**
 * @constructor RecitalDataset
 * 
 * => tight coupling with AppIgnition = mandatory static inclusion in core (Dataset requires App).
 * 		App.List is coupled with [Dataset.push(), pushApply(), splice(), & more]
 */

var TypeManager = require('src/core/TypeManager');
var App = require('src/core/AppIgnition');



var RecitalDataset = function(rootComponent, trackedComponent, template, factoryPropsArray, arrayFunctions) {
	if (!rootComponent || !trackedComponent || !template || !factoryPropsArray) {
		console.warn('ReactiveDataset initialization failed: Missing parameters. Returning...')
		return;
	}
	this.init(rootComponent, trackedComponent, template, factoryPropsArray);
	if (typeof arrayFunctions !== 'undefined') {
		if (Array.isArray(arrayFunctions))
			this.getFunctionList(arrayFunctions);
		else if (Object.keys(arrayFunctions || {}).length)		// allows
																// passing null
																// instead of an
																// object
			this.setArrayFunctions(arrayFunctions);
	}
}
RecitalDataset.prototype = Object.create(Array.prototype);
RecitalDataset.prototype.objectType = 'ReactiveDataset'; 
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
					template : null
				});
			}
});
Object.defineProperty(RecitalDataset.prototype, 'init', {
	value : function(rootComponent, trackedComponent, template, factoryPropsArray) {
		Object.defineProperty(this, 'rootComponent', {
			value : rootComponent
		});
		Object.defineProperty(this, 'trackedComponent', {
			value : trackedComponent
		});
		Object.defineProperty(this, 'defaultListDef', {
			value : this.getDefaultListDef()
		});
		this.defaultListDef.host.template = template;
		Object.defineProperty(this, 'funcList', {
			value : []
		});
		Object.defineProperty(this, 'Item', {
			value : this.setItemFactory(factoryPropsArray),
			writable : true
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
Object.defineProperty(RecitalDataset.prototype, 'setItemFactory', {
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
		Object.defineProperty(factory.prototype, 'keys', {value : factoryPropsArray.slice(0)});
		return factory;
	}
});
Object.defineProperty(RecitalDataset.prototype, 'setSchema', {
	value : function(factoryPropsArray) {
		this.Item = this.setItemFactory(factoryPropsArray);
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
		var lastIndex = this.trackedComponent._children.length;
		this.defaultListDef.host.each = [item];
		new App.List(this.defaultListDef, this.trackedComponent);
		this.trackedComponent.handleEventSubsOnChildrenAt(TypeManager.caches['subscribeOnChild'].cache[this.trackedComponent._defUID], lastIndex);
// this.trackedComponent.addModules(this.defaultListDef,
// this.trackedComponent._children.length);
		Array.prototype.push.call(this, item);
		this.updateDatasetState();
	}
});

Object.defineProperty(RecitalDataset.prototype, 'pushApply',  {
	value : function(itemArray) {
		if (!itemArray.length)
			return;
		var lastIndex = this.trackedComponent._children.length;
		this.defaultListDef.host.each = itemArray;
		new App.List(this.defaultListDef, this.trackedComponent);
		this.trackedComponent.handleEventSubsOnChildrenAt(TypeManager.caches['subscribeOnChild'].cache[this.trackedComponent._defUID], lastIndex);
// this.trackedComponent.addModules(this.defaultListDef,
// this.trackedComponent._children.length);
		Array.prototype.push.apply(this, itemArray);
		this.updateDatasetState();
	}
});

Object.defineProperty(RecitalDataset.prototype, 'flush',  {
	value : function() {
		new App.DelayedDecoration(null, this.trackedComponent, this.defaultListDef.getHostDef());
	}
});

Object.defineProperty(RecitalDataset.prototype, 'splice',  {
	value : function(index, length, replacedBy) {
		var c1, c2, mBackup;

		if (typeof replacedBy === 'number') {
			if (replacedBy > index) {
				c2 = this.trackedComponent._children[replacedBy].remove();
				c1 = this.trackedComponent._children[index].remove();
				this.trackedComponent.addChildAt(c2, index);
			}
			else {
				c1 = this.trackedComponent._children[index].remove();
				c2 = this.trackedComponent._children[replacedBy].remove();
				this.trackedComponent.addChildAt(c2, index - 1);
			}

			mBackup = Array.prototype.splice.call(this, index, 1, this[replacedBy])[0];
			this.updateDatasetState();
			return [mBackup, c1];
		}
		else if (typeof replacedBy === 'undefined' || replacedBy === null) {
			c1 = this.trackedComponent._children[index].remove();
			mBackup = Array.prototype.splice.call(this, index, 1)[0];
			this.updateDatasetState();
			return [mBackup, c1];
		}
		else if (Array.isArray(replacedBy)) {
			this.trackedComponent.addChildAt(replacedBy[1], index);
			Array.prototype.splice.call(this, index, 1, replacedBy[0]);
			this.updateDatasetState();
			return true;
		}
	}
});

Object.defineProperty(RecitalDataset.prototype, 'spliceOnProp',  {
	value : function(prop, value) {
		if (this.trackedComponent._children.length) {
			var module;
			for (let i = this.trackedComponent._children.length - 1; i >= 0; i--) {
				module = this.trackedComponent._children[i];
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
		if (this.trackedComponent._children.length) {
			var module;
			for (let i = this.trackedComponent._children.length - 1; i >= 0; i--) {
				module = this.trackedComponent._children[i];
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
	value : function() {
		this.forEach(function(value) {
			this.trackedComponent.removeChildAt(this.trackedComponent._children.length - 1);
		}, this);
//		if (this.trackedComponent.removeAllChildren())
		Array.prototype.splice.call(this, 0, this.length);
	}
});

Object.defineProperty(RecitalDataset.prototype, 'serialize', {
	value : function() {
		return JSON.stringify(Array.from(this));
	}
});

Object.defineProperty(RecitalDataset.prototype, 'childToFront', {
	value : function(idx) {
		this.forEach(function(item, key) {
			if (key === idx)
				this.trackedComponent._children[key].view.setPresence(true);
			else
				this.trackedComponent._children[key].view.setPresence(false);
		}, this);
	}
});

Object.defineProperty(RecitalDataset.prototype, 'parentToFront', {
	value : function(bool) {
		this.trackedComponent.view.setPresence(bool);
	}
});

Object.defineProperty(RecitalDataset.prototype, 'targetContainerDeploy', {
	value : function(idx) {
		this.forEach(function(item, key) {
//			console.log(key === idx);
			if (key === idx) {
				this.trackedComponent._children[key].view.styleHook.setFlex(':host', '1 1 0');
//				this.trackedComponent._children[key].streams.unfolded.value = 'unfolded';
//				this.trackedComponent._children[key].view.styleHook.setMaxHeight('ul', 'max-content');
			}
			else {
				this.trackedComponent._children[key].view.styleHook.setFlex(':host', 'none');
//				this.trackedComponent._children[key].streams.unfolded.value = null;
//				this.trackedComponent._children[key].view.styleHook.setMaxHeight('ul', '0px');
			}
			
//			console.log(this.trackedComponent._children[key].view.getWrappingNode().firstChild, this.trackedComponent._children[key].view.sWrapper.styleElem);
//			if (this.trackedComponent._children[key].view.getWrappingNode().firstChild !== this.trackedComponent._children[key].view.sWrapper.styleElem) {
//				if (key === 0)
//					this.trackedComponent._children[key].view.getWrappingNode().firstChild.replaceWith(this.trackedComponent._children[key].view.sWrapper.styleElem);
//				else
//					this.trackedComponent._children[key].view.getWrappingNode().firstChild.replaceWith(this.trackedComponent._children[key].view.sWrapper.styleElem.cloneNode(true));
//			}
		}, this);
	}
});


Object.defineProperty(RecitalDataset.prototype, 'sortForPropHostingArrayOnArrayIdx',  {
	value : function(prop, idx, invert) {

		var tmpThis = [];
		for (let i = 0, l = this.length; i < l; i++) {
			tmpThis.push(this[i][prop].slice(0));
		}
		if (invert)
			tmpThis.sort(Array.prototype.inverseSortOnObjectProp.bind(null, idx));
		else
			tmpThis.sort(Array.prototype.sortOnObjectProp.bind(null, idx));
		for (let i = 0, l = this.length; i < l; i++) {
			this[i][prop] = tmpThis[i];
		}
	}
});

Object.defineProperty(RecitalDataset.prototype, 'clone', {
	value : function() {
		var clone = new RecitalDataset(
			this.rootComponent,
			this.trackedComponent,
			this.defaultListDef.host.template,
			[]
		);
		Array.prototype.push.apply(clone, this);
//		console.log(clone);
		return clone;
	}
});

Object.defineProperty(RecitalDataset.prototype, 'reNewComponents',  {
	value : function() {
		var lastIndex = this.trackedComponent._children.length;
		this.defaultListDef.host.each = this;
		new App.List(this.defaultListDef, this.trackedComponent);
		this.trackedComponent.handleEventSubsOnChildrenAt(TypeManager.caches['subscribeOnChild'].cache[this.trackedComponent._defUID], lastIndex);
		this.updateDatasetState();
	}
});

//Object.defineProperty(RecitalDataset.prototype, 'sortStringsAsNumbers',  {
//	value : function(a, b) {
//		return (parseInt(a, 10) > parseInt(b, 10)
//					? 1 
//					: (parseInt(a, 10) === parseInt(b, 10)
//						? 0
//						: -1));
//	}
//});
//
//Object.defineProperty(RecitalDataset.prototype, 'invertSortStringsAsNumbers',  {
//	value : function(a, b) {
//		return (parseInt(a, 10) < parseInt(b, 10)
//					? 1 
//					: (parseInt(a, 10) === parseInt(b, 10)
//						? 0
//						: -1));
//	}
//});









module.exports = RecitalDataset;