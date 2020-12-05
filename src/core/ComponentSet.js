/**
 * @constructor ComponentSet
 */

var TypeManager = require('src/core/TypeManager');
var App = require('src/core/AppIgnition');
var Component = require('src/core/Component');


var ComponentSet = function(rootComponent, slotTemplate) {
	if (!rootComponent)
		return;
	this.init(rootComponent, slotTemplate)
}
ComponentSet.prototype = Object.create(Array.prototype);
ComponentSet.prototype.objectType = 'ComponentSet';
Object.defineProperty(ComponentSet.prototype, 'init', {
	value : function(rootComponent, slotTemplate, keywordHandler) {
		Object.defineProperty(this, 'rootComponent', {
			value : rootComponent
		});
		Object.defineProperty(this, 'Item', {
			value : this.setItemFactory(),
			writable : true
		});
		Object.defineProperty(this, 'slotTemplate', {
			value : slotTemplate
		});
	}
});

Object.defineProperty(ComponentSet.prototype, 'setSchema', {
	value : function(factoryPropsArray) {
		// this is a virtual function : a handy way to let the LazySlottedComponent ctor execute till the end,
		// even if an inheriting class has messed up the typedSlots... for example, the tabPanel defines the typedSlot[1] as a ComponentSet...
		// And that's why we are here : to let the LazySlottedComponent execute a loop 
		// that is based on the hypothesis there are as much RecitalDatasets as there are slotsDef... (and none hase been replaced by a dumb other unknown type, like a ComponentSet...) 
	}
});

Object.defineProperty(ComponentSet.prototype, 'setItemFactory', {
	value : function() {

		var factory = function(itemAsArray) {
			this.itemRouter = itemAsArray[0];
			this.itemKeyword = itemAsArray[1];
		}
		factory.prototype = Object.create(Object.prototype);
		factory.prototype.itemRouter = null;
		factory.prototype.itemKeyword = null;
		factory.prototype._parent = null;
		factory.prototype._key = null;
		factory.prototype._ignited = null;
		
		return factory;
	}
});
Object.defineProperty(ComponentSet.prototype, 'newItem', {
	value : function() {
		return (new this.Item(arguments));
	}
});

Object.defineProperty(ComponentSet.prototype, 'ignite', {
	value : function(idx) {
		var keywordHandler;
		this.forEach(function(item, key) {
			if (key === idx) {
				if (item._ignited !== true) {
					keywordHandler = item.itemRouter.init.call(item.itemRouter.init, item._parent.view, item._parent);
					if (typeof keywordHandler === 'function')
						keywordHandler(item.itemKeyword, item._parent.view);
					item._ignited = true;
				}
				this.rootComponent._children[key].view.hostElem.style.display = 'block';
			}
			else
				this.rootComponent._children[key].view.hostElem.style.display = 'none';
		}, this);
	}
});

Object.defineProperty(ComponentSet.prototype, 'ignition', {
	value : function() {
		var keywordHandler;
		this.forEach(function(componentRouterItem, idx) {
			keywordHandler = componentRouterItem.itemRouter.init.call(componentRouterItem.itemRouter.init, componentRouterItem._parent.view);
			if (typeof keywordHandler === 'function')
				keywordHandler(componentRouterItem.itemKeyword, componentRouterItem._parent.view);
			componentRouterItem._ignited = true;
		}, this);
	}
});

Object.defineProperty(ComponentSet.prototype, 'push', {
	value : function(componentRouterItem) {
		Array.prototype.push.call(this, componentRouterItem);
		this.rootComponent.pushChild(new Component.ComponentWithView(this.slotTemplate, this.rootComponent.view));
		this.rootComponent._children[this.rootComponent._children.length - 1].pushChild(componentRouterItem);
		new App.DelayedDecoration();
	}
});

// TODO: each member of the array IS a memberRouterTupple (so we can't default to Array())
Object.defineProperty(ComponentSet.prototype, 'pushApply', {
	value : function(memberRouterArray) {
		if (!Array.isArray(memberRouterArray))
			memberRouterArray = [memberRouterArray];
		
		memberRouterArray.forEach(function(memberRouter) {
			Array.prototype.push.call(this, memberRouter);
			this.rootComponent.pushChild(memberRouter);
		}, this);
	}
});

Object.defineProperty(ComponentSet.prototype, 'splice',  {
	value : function(index, length, replacedBy) {
		var c1, c2, mBackup;

		if (typeof replacedBy === 'number') {
			if (replacedBy > index) {
				c2 = this.rootComponent._children[replacedBy].remove();
				c1 = this.rootComponent._children[index].remove();
				this.rootComponent.addChildAt(c2, index);
			}
			else {
				c1 = this.rootComponent._children[index].remove();
				c2 = this.rootComponent._children[replacedBy].remove();
				this.rootComponent.addChildAt(c2, index - 1);
			}
			mBackup = Array.prototype.splice.call(this, index, 1, this[replacedBy])[0];
			return [mBackup, c1];
		}
		else if (typeof replacedBy === 'undefined' || replacedBy === null) {
			c1 = this.rootComponent._children[index].remove();
			mBackup = Array.prototype.splice.call(this, index, 1)[0];
			return [mBackup, c1];
		}
		else if (Array.isArray(replacedBy)) {
			this.rootComponent.addChildAt(replacedBy[1], index);
			Array.prototype.splice.call(this, index, 1, replacedBy[0]);
			return true;
		}
	}
});


Object.defineProperty(ComponentSet.prototype, 'resetLength',  {
	value : function() {
		if (this.rootComponent.removeAllChildren())
			Array.prototype.splice.call(this, 0, this.length);
	}
});












module.exports = ComponentSet;