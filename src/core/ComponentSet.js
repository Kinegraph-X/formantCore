/**
 * @constructor ComponentSet
 * This type is a re-implementation of the ReactiveDataset type.
 * (it follows the same structure and logic, but hasn't the same purpose)
 * Instead of being passed a template to instanciate components,
 * it's passed a complete "launcher"" script
 */

var TemplateFactory = require('src/core/TemplateFactory');
var App = require('src/core/App');
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

/**
 * this is a virtual method which overrides the setSchema method of the ReactiveDataset: 
 * a handy way to let the LazySlottedComponent ctor execute till the end,
 * even if an inheriting class has messed up the typedSlots... for example, the tabPanel defines the typedSlot[1] as a ComponentSet...
 * And that's why we are here : to let the LazySlottedComponent execute a loop 
 * that is based on the hypothesis there are as much ReactiveDatasets as there are slotsDef... (and none hase been replaced by a dumb other unknown type, like a ComponentSet...)
 */
Object.defineProperty(ComponentSet.prototype, 'setSchema', {
	value : function(factoryPropsArray) {}
});

/**
 * An override for the setItemFactory method of the ReactiveDataset
 * It adds the itemLauncher and itemKeyword properties
 * as well as references to its env and the _ignited flag
 */
Object.defineProperty(ComponentSet.prototype, 'setItemFactory', {
	value : function() {

		var factory = function(itemAsArray) {
			this.itemLauncher = itemAsArray[0];
			this.itemKeyword = itemAsArray[1];
		}
		factory.prototype = Object.create(Object.prototype);
		factory.prototype.itemLauncher = null;
		factory.prototype.itemKeyword = null;
		factory.prototype._parent = null;
		factory.prototype._key = null;
		factory.prototype._ignited = null;
		
		return factory;
	}
});

/**
 * Not needed : same as the implementatoin of the ReactiveDataset
 */
Object.defineProperty(ComponentSet.prototype, 'newItem', {
	value : function() {
		return (new this.Item(arguments));
	}
});

Object.defineProperty(ComponentSet.prototype, 'ignite', {
	value : function(idx) {
		var injectedComponent;
		this.forEach(function(item, key) {
			if (key === idx) {
				if (item._ignited !== true) {
//					console.log(item);
					injectedComponent = item.itemLauncher(item.itemKeyword, item._parent.view).init.call(item.itemLauncher.init);	// , item._parent.view, item._parent
//					console.log(injectedComponent);
					
					// The source-code viewer doesn't return a component
					if (injectedComponent instanceof Component.ComponentWithView)
						this.rootComponent._children[key].view.getWrappingNode().appendChild(injectedComponent.view.getMasterNode());

					item._ignited = true;
				}
				this.rootComponent._children[key].view.getMasterNode().style.display = 'flex';
			}
			else {
				this.rootComponent._children[key].view.getMasterNode().style.display = 'none';
			}
		}, this);
	}
});

Object.defineProperty(ComponentSet.prototype, 'ignition', {
	value : function() {
		var keywordHandler;
		this.forEach(function(componentLauncherItem, idx) {
			keywordHandler = componentLauncherItem.itemLauncher.init.call(componentLauncherItem.itemLauncher.init, componentLauncherItem._parent.view);
			if (typeof keywordHandler === 'function')
				keywordHandler(componentLauncherItem.itemKeyword, componentLauncherItem._parent.view);
			componentLauncherItem._ignited = true;
		}, this);
	}
});

Object.defineProperty(ComponentSet.prototype, 'push', {
	value : function(componentLauncherItem) {
		Array.prototype.push.call(this, componentLauncherItem);
//		console.log(componentLauncherItem);
//		console.log(this.rootComponent.view);
		new Component.ComponentWithView(this.slotTemplate, this.rootComponent.view);
		componentLauncherItem._parent = this.rootComponent._children[this.rootComponent._children.length - 1];
//		console.log(this.rootComponent);
//		this.rootComponent._children[this.rootComponent._children.length - 1].pushChild(componentLauncherItem);
		App.renderDOM();
	}
});

// TODO: each member of the array IS a memberLauncherTupple (so we can't default to Array())
Object.defineProperty(ComponentSet.prototype, 'pushApply', {
	value : function(memberLauncherArray) {
		if (!Array.isArray(memberLauncherArray))
			memberLauncherArray = [memberLauncherArray];
		
		memberLauncherArray.forEach(function(memberLauncher) {
			Array.prototype.push.call(this, memberLauncher);
			this.rootComponent.pushChild(memberLauncher);
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