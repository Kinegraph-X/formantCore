/**
 * AbstractTree
 * ------------
 * A flexible tree renderer that can take JSON data and turn it into a visual tree of components.
 * Supports branch and leaf templates, event propagation, and dynamic filtering.
 */
/**
 * @typedef {import('../../template/TemplateFactory').ComponentTemplate} ComponentTemplate
 */
/** @template EventPayload */
import {ComponentWithView} from '../../component/Component.js'
import ListTemplate from '../../template/ListTemplate.js'
import {EventEmitter} from '../../reactivity/EventEmitter.js'

/** @typedef {{
  key: string|null;
  value: any;
  type: string|null;
  parent: TreeNode | null;
  children: TreeNode[];
  isExpanded: boolean,
  depth: number|0;
  projectedData: any;
}} TreeNode */

import createAbstractTreeDef from './componentTemplates/abstractTreeDef';
import createBranchTemplateDef from './componentTemplates/branchTemplateDef';
import createLeafTemplateDef from './componentTemplates/leafTemplateDef';

/**
 * jsonData
 *   ↓
 * buildTree()              → creates data nodes
 *   ↓
 * instantiateTree()        → creates UI components for each node
 *   ↓
 * render()                 → actual visual rendering
 */
class AbstractTree extends ComponentWithView {
    static objectType = 'AbstractTree';
    pseudoModel = [];
    branchTemplate = createBranchTemplateDef();
    leafTemplate = createLeafTemplateDef();
    listTemplate = new ListTemplate(null);
    expanded = true;
	/**
	 * 
	 * @param {ComponentWithView} parent - Parent component.
     * @param {ComponentTemplate} cTemplate - Tree definition.
	 * @param {Object|string} [jsonData] - JSON data to render.
	 * @param {(node: TreeNode) => TreeNode} [nodeFilterFunction] - Optional node filter callback.
	 */
	constructor(parent, cTemplate, jsonData, nodeFilterFunction) {
		const stdTemplate = createAbstractTreeDef();

		if (cTemplate.view.sOverride) {
			stdTemplate.view.sOverride = cTemplate.view.sOverride;
		}

		super(parent, stdTemplate);

		this.listTemplate.each = this.pseudoModel;

		this.update.addEventListener(e => {
			this.streams.selected.value = e.data.self_UID;
		});

		if (jsonData && typeof jsonData === 'object') {
			this.renderJSON(jsonData, nodeFilterFunction);
		}
	}

    @output exportData = new EventEmitter<EventPayload>();

    /**
     * Converts JSON data to an internal tree structure.
     * @param {object|string} data - The JSON data or string.
     * @returns {TreeNode} The root node.
     */
    buildTree(data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        const root = {
            key: 'root',
            value: parsed,
            type: this.getDataType(parsed),
            parent: null,
            isExpanded: false,
			children: [],
            projectedData: null,
			depth: 0
        };
        this.populateSubnodes(parsed, root);
        return root;
    }
    /**
     * Adds subnodes recursively.
     * @param {*} data - Source data.
     * @param {TreeNode} parent - Parent node.
     */
    populateSubnodes(data, parent) {
        if (typeof data !== 'object' || data === null) return;
        for (const [key, value] of Object.entries(data)) {
            const child = {
                key,
                value,
                parent,
                type: this.getDataType(value),
                isExpanded: false,
                children: [],
                projectedData: value.projectedData,
                depth: parent.depth + 1
            };
            parent.children.push(child);
            this.populateSubnodes(value, child);
        }
    }
	/**
	 * Determines the data type of an object.
	 * @param {*} obj - The object to inspect.
	 * @returns {string} Data type string.
	 */
	getDataType(obj) {
		if (Array.isArray(obj)) return 'array';
		if (obj === null) return 'null';
		return typeof obj;
	}


    /**
     * Creates the full component tree from a data tree.
     * @param {TreeNode} root - Root data node.
     * @param {(node: TreeNode) => TreeNode} [filter] - Optional node transform/filter.
     */
    instantiateTree(root, filter) {
        this.walkTree(
            root,
            this,
            /** @param {TreeNode} node @param {ComponentWithView} parentComponent */
            (node, parentComponent) => {
                const nodeData = filter ? filter(node) : node;
                const component = this.createMember(nodeData, parentComponent);
                this.wireEvents(nodeData, component);
                return component;
            }
        );
    }
    /**
     * Traverses a data tree and executes a callback for each node.
     * @param {TreeNode} node
     * @param {ComponentWithView} parentComponent
     * @param {function} callback
     */
    walkTree(node, parentComponent, callback) {
        const comp = callback(node, parentComponent);
        for (const child of node.children) {
            this.walkTree(child, comp, callback);
        }
    }
	/**
	 * Creates a member component (branch or leaf).
	 * @param {TreeNode} spec - Node specification.
	 * @param {Object} parent - Parent component.
	 * @returns {Object} The created component.
	 */
	createMember(spec, parent) {
		const { type, children } = spec;
		let component;

		if (children.length > 0) {
			let branchTemplate = this.branchTemplate;
			component = new components[branchTemplate.type](parent, branchTemplate);
			this.pseudoModel.push(this.getHeaderTitle(spec));
		} else {
            let leafTemplate = this.leafTemplate;
			component = new components[leafTemplate.type](parent, leafTemplate);
			this.pseudoModel.push(this.getKeyValueObj(spec));
		}

		registries.dataStoreRegistry.set(component.regUID, this.pseudoModel.length);
		return component;
	}

	/**
	 * Returns a header title object for branches.
	 * @param {Object} spec - Node specification.
	 * @returns {Object} Header object.
	 */
	getHeaderTitle(spec) {
		const len = spec.children.length;
		const display = spec.type === 'array' ? `[${len}]` : `{${len}}`;
		return {
			headerTitle: display,
			displayedas: spec.type,
			expanded: this.expanded
		};
	}

	/**
	 * Returns a key-value object for leaves.
	 * @param {Object} spec - Node specification.
	 * @returns {Object} Key-value pair descriptor.
	 */
	getKeyValueObj(spec) {
		const val =
			spec.type === 'string' ? `"${spec.value}"` : String(spec.value);
		return {
			keyValuePair: ['', `${spec.key}${spec.children.length ? ' : ' : ''}`, val],
			displayedas: spec.type
		};
	}

	/**
    * Public API: renders a JSON tree.
    * @param {object|string} jsonData - JSON data or string.
    * @param {(node: TreeNode) => TreeNode} [filter] - Optional node filter.
    * @returns {TreeNode} Root data node.
    */
    renderJSON(jsonData, filter) {
        const dataTree = this.buildTree(jsonData);
        this.instantiateTree(dataTree, filter);
        this.render(); // Delegate to UI layer
        return dataTree;
    }


	/** Clears the tree. */
	reset() {
		this.removeAllChildren();
		this.exportData.clearEventListeners();
	}

	/** Placeholder render method to be implemented externally. */
	render() {}

	/**
	 * Handles click event wiring (override-friendly).
	 * @param {Object} node - Node descriptor.
	 * @param {Object} component - Component instance.
	 */
	wireEvents(node, component) {
		this.affectClickEvents_Base(node, component);
	}

	/**
	 * Default implementation for click event binding.
	 * @param {TreeNode} node - Node descriptor.
	 * @param {ComponentWithView} component - Component instance.
	 */
	affectClickEvents_Base(node, component) {
		if (node.children.length) {
			const header = component.children[0];
			header.clicked_ok.addEventListener(e => {
				const clickedNode = e?.data?.target;
				const span = header.view.getWrappingNode().children[2];
				if (!clickedNode || clickedNode === span) {
					component.exportdata.trigger(node.projectedData);
				} else {
					component.streams.expanded.value =
						component.streams.expanded.value ? null : 'expanded';
				}
			});
		} else {
			component.registerClickEvents = function () {
				if (!component.clicked_ok)
					component.clicked_ok = new EventEmitter<unknown>();

				Object.getPrototypeOf(this).registerClickEvents.call(this);
				const valueNode = component.memberViews[1].wrappingNode;

				valueNode.addEventListener('click', e => component.clicked_ok.trigger(e));

				component.clicked_ok.addEventListener(e => {
					component.streams.selected.next = 'selected';
					component.update.trigger(true);
					component.exportdata.trigger(node.projectedData);
				});
			};
		}
	}
}

coreComponents.AbstractTree = AbstractTree;
export default AbstractTree;
