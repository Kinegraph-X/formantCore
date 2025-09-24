/**
 * @module AbstractTree
 * 
 * This type is a mix of an old inspiration and a cleaner logic
 * The "jsonData" and "nodeFilterFunction"" were handy when this component had too much responsability
 * You should now instanciate it "bare" (with only "definition"" and "parentView", and even "definition" is optional, just pass null)
 * And call `instanciateTreeMembers()` with a correctly formed tree.
 * (The possibility to pass the dataset directly to the ctor comes from a time when the type handled strings and objects... quite ugly...)
 * (The possibility to use a `nodeFilterFunction` callback is also a legacy from the insiration of this type: it's not recommanded to use it: just pass an object correspondig to the expected spec.
 * expected spec as pseudo-code (similar to the createNode() method, which was meant to normalize what the component receives)
 * type TreeNode {
        key: number (obj.key || null),
        parent: TreeNode (obj.parent || null),
        value: string|number|object (obj.value : null),
        isExpanded: boolean (obj.isExpanded || false),
        type: type enum (tbd obj.type || null),
        children: array (obj.children || []),
        depth: number (obj.depth || 0)
    }
 */

const createAbstractTreeDef = require('src/coreTestComponents/AbstractTree/componentTemplates/AbstractTreeHostTemplate');
const createBranchTemplateDef = require('src/coreTestComponents/AbstractTree/componentTemplates/AbstractTreeBranchTemplate');
const createLeafTemplateDef = require('src/coreTestComponents/AbstractTree/componentTemplates/AbstractTreeLeafTemplate');

const AbstractTree = function(definition, parentView, parent, jsonData, nodeFilterFunction) {
//		console.log(definition, parentView, parent, jsonData);
    var stdDefinition = createAbstractTreeDef();
    // HACK: no solution for now to override the default def : there is no createDefaultDef method on a compound component
    if (definition) {
        if (definition.getGroupHostDef())
            stdDefinition.getGroupHostDef().sOverride = definition.getGroupHostDef().sOverride
        else
            console.error('The AbstractTree Component expects a doubly hierarchical template');
    }
    
    /**
     * Standard Implementation :
     * (this requirements may be overridden through extension. see affectClickEvents())
     */
    // Banch Component MUST implement the 'clicked_ok' event (and though inherit from ComponentWithHooks)
    this.branchTemplate = this.branchTemplate || createBranchTemplateDef();
    // Leaf Component MUST at least inherit from ComponentWithHooks
    this.leafTemplate = this.leafTemplate || createLeafTemplateDef();
    this.pseudoModel = [];
    this.listTemplate = TypeManager.createComponentDef({ type: 'ComponentList' });
    this.listTemplate.getHostDef().each = this.pseudoModel;

    this.expanded = this.expanded || 'expanded';

    CompoundComponent.call(this, stdDefinition, parentView, parent);
    this.objectType = 'AbstractTree';

    this.addEventListener('selecte', function(e) {
        //		console.log('abstractTree receives update and sets "selected"', e.data);
        this.streams.selected.value = e.data.self_UID;
    }.bind(this));
    this.createEvent('exportdata');
    
    if (jsonData && Object.prototype.toString.call(jsonData) === '[object Object]')
        this.renderJSON(jsonData, nodeFilterFunction);
}
AbstractTree.prototype = Object.create(CompoundComponentWithHooks.prototype);
AbstractTree.prototype.objectType = 'AbstractTree';

AbstractTree.prototype.createEvents = function() {
    this.createEvent('selected');
}

AbstractTree.prototype.createMember = function(memberSpec, parent) {
    var type = memberSpec.type, componentDef, component;
//	console.log(memberSpec);
    //	console.log(memberSpec);
    if (memberSpec.children.length) {
        // When a def isn't already cached, isKnownUID() returns a string : the definitionsCache creates an emty entry and returns the newly added cacheID
        if (typeof (componentDef = TypeManager.definitionsCache.isKnownUID('branchTemplate_' + type)) === 'string') {
            componentDef = TypeManager.createComponentDef(this.branchTemplate);
            //			componentDef.getGroupHostDef().attributes.push(TypeManager.PropsFactory({textContent : this.getHeaderTitle(type)}));
        }

        component = new CompoundComponent(componentDef, parent.view, parent);
        Registries.dataStoreRegistry.setItem(component._UID, this.pseudoModel.length);
        this.pseudoModel.push(this.getHeaderTitle(memberSpec));
    }
    else {
        component = new Components[this.leafTemplate.getHostDef().type](this.leafTemplate, parent.view, parent);
        Registries.dataStoreRegistry.setItem(component._UID, this.pseudoModel.length);
        this.pseudoModel.push(this.getKeyValueObj(memberSpec));
    }
    return component;
};

AbstractTree.prototype.getHeaderTitle = function(memberSpec) {
    var len = memberSpec.children.length;
    if (memberSpec.type === 'array')
        return {
            headerTitle: "[".concat(len, "]"),
            displayedas: memberSpec.type,
            expanded: this.expanded
        };
    else if (memberSpec.type === 'object')
        return {
            headerTitle: "{".concat(len, "}"),
            displayedas: memberSpec.type,
            expanded: this.expanded
        };
}

AbstractTree.prototype.getKeyValueObj = function(memberSpec) {
    return {
        keyValuePair: ['', memberSpec.key + (memberSpec.children.length ? '&nbsp;:&nbsp;' : ''), (memberSpec.type === 'string' ? ' "' + memberSpec.value.toString() + '"' : memberSpec.value.toString())],
        displayedas: memberSpec.type
    };
}

AbstractTree.prototype._typeof = function(obj) {
    var _typeof;
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function(obj) {
            return typeof obj;
        };
    } else {
        _typeof = function(obj) {
            return obj && typeof Symbol === "function" && obj.constructobj == Symbol && obj === Symbol.prototype ? "symbol" : typeof obj;
        };
    }

    return _typeof(obj);
}

AbstractTree.prototype.getDataType = function(obj) {

    var type = this._typeof(obj);

    if (Array.isArray(obj))
        type = 'array';
    if (obj === null)
        type = 'null';

    return type;
}

AbstractTree.prototype.createNode = function() {
    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
        key: opt.key || null,
        parent: opt.parent || null,
        value: opt.hasOwnProperty('value') ? opt.value : null,
        isExpanded: opt.isExpanded || false,
        type: opt.type || null,
        children: opt.children || [],
        el: opt.el || null,
        depth: opt.depth || 0
    };
}

AbstractTree.prototype.createSubnodes = function(data, node) {
    if (this._typeof(data) === 'object') {
        for (var key in data) {
            var child = this.createNode({
                value: data[key],
                key: key,
                depth: node.depth + 1,
                type: this.getDataType(data[key]),
                parent: node
            });
            node.children.push(child);
            this.createSubnodes(data[key], child);
        }
    }
}

AbstractTree.prototype.createTree = function(jsonData) {
    // We may want to bypass the ctor, and pass either a string or an object to this method
    var data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    var rootNode = this.createNode({
        value: data,
        key: 'root',
        type: this.getDataType(data)
    });
    this.createSubnodes(data, rootNode);
    return rootNode;
}

AbstractTree.prototype.traverseTree = function(memberDesc, parentComponent, callback) {
    //console.log(node);
    var component = callback(memberDesc, parentComponent);
    //console.log(node);

    if (memberDesc.children.length > 0) {
        memberDesc.children.forEach(function(child) {
            this.traverseTree(child, component, callback);
        }, this);
    }
}

AbstractTree.prototype.instanciateTreeMembers = function(tree, nodeFilterFunction) {
    var self = this;
    this.traverseTree(tree, this, function(memberDesc, parentComponent) {
        var component;
        if (typeof nodeFilterFunction !== 'function') {
            component = self.createMember(memberDesc, parentComponent);
        }
        else {
            memberDesc = nodeFilterFunction(memberDesc);
            component = self.createMember(memberDesc, parentComponent);
        }
        self.affectClickEvents(memberDesc, component);
        return component;
    });
}

/**
 * @method renderJSON
 * Inheritied from the implementation which was the inspiration for this type.
 * This should not necessarily be used, the component may be instanciated empty
 * (It shall have everything it needs to work, you could call instanciateTreeMembers() directly, as it's the next step after this method)
 * @param {string|object} jsonData
 * @param {function} nodeFilterFunction : a callback to normalize the tree when it's not adapted to this component
 * (The possibility to use a callback is also a legacy from the insiration of this type: it's not recommanded to use it)
 */
AbstractTree.prototype.renderJSON = function(jsonData, nodeFilterFunction) {
    // The ctor accepts a JSON string or a JS object
    var parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    var tree = this.createTree(parsedData);
    //	console.log(parsedData, tree);
    this.instanciateTreeMembers(tree, nodeFilterFunction);

    var DOMNodeId;
    this.render(DOMNodeId);
    return tree;
}

AbstractTree.prototype.reset = function() {
    this.removeAllChildren();
    this.clearEventListeners('exportdata');
}

AbstractTree.prototype.render = function() { } 									// pure virtual (injected as a dependancy by AppIgnition)
AbstractTree.prototype.affectClickEvents = function(memberDesc, component) { 	// virtual with default (implemented through override on extension)
    this.affectClickEvents_Base(memberDesc, component);
}

AbstractTree.prototype.affectClickEvents_Base = function(memberDesc, component) {
    var self = this;

    if (memberDesc.children.length) {
        // Say we have a header node, containing 2 pictos (arrows), and an appended span, key: value
        component._children[0].addEventListener('clicked_ok', function(e) {
            // When artificially clicked from outside of the component, there is no e.data.target
            if ((!e.data || !e.data.target) || e.data.target === this.view.getWrappingNode().children[2])
                self.trigger('exportdata', memberDesc.projectedData); // the component shall trigger update and receive the "selected" attribute: not needed here
            else
                component.streams.expanded.value = !component.streams.expanded.value ? 'expanded' : null;
        }.bind(component._children[0]));
    }
    else {
        // Leaf Component MUST inherit from ComponentWithHooks
        component.registerClickEvents = function() {
            if (!component._eventHandlers.clicked_ok)
                component.createEvent('clicked_ok');
            
            Object.getPrototypeOf(this).registerClickEvents.call(this);

            // Say we have 2 divs with key : value
            this.view.subViewsHolder.memberViews[1].getWrappingNode().addEventListener('click', function(e) {
                this.trigger('clicked_ok', e);
            }.bind(component));
            component.addEventListener('clicked_ok', function(e) {
                this.streams.selected.value = 'selected';
                this.trigger('update', { self_UID: component._UID }, true);
                self.trigger('exportdata', memberDesc.projectedData);
            }.bind(component));
        }
    }
}