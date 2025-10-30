/**
 * AbstractTree
 * ------------
 * A flexible tree renderer that can take JSON data and turn it into a visual tree of components.
 * Supports branch and leaf templates, event propagation, and dynamic filtering.
 * 
 * jsonData
 *   ↓
 * buildTree()              → creates data nodes (may be bypassed)
 *   ↓
 * instantiateTree()        → creates UI components for each node
 *   ↓
 * render()                 → actual visual rendering
 * 
 * @CSSify styleName : AbstractTreeHost
 * @CSSify styleName : AbstractTreeHeader
 */

import {
    ComponentError,
    // Output,
    Component,
    ComponentTemplate,
    ViewTemplate,
    CreateStyle,
    ComponentBase,
	ComponentView,
    EventEmitter
} from '../../component/ComponentCore.js';
import {Output} from '../../decorators'
import createBranchTemplateDef from './componentTemplates/branchTemplateDef.js';
import createLeafTemplateDef from './componentTemplates/leafTemplateDef.js';

/**
 * @typedef {import('../../view/ComponentView').ComponentView<string>} ComponentView
 */

type NodeTransformFunction = ((node: object) => TreeNode)|null;

type TreeNode = {
	key: string|null;
	value: any;
	type: string|null;
	parent: TreeNode | null;
	children: TreeNode[];
	isExpanded: boolean,
	depth: number|0;
	projectedData: any;
}



@Component({
    view : new ViewTemplate({
        nodeName : 'folded-tree' as const,
		/**@CSSifyStyle componentStyle : AbstractTreeHost */
    }),
    props : [
        {selected : undefined},
        {expanded : true}
    ],
    members : [
        new ComponentTemplate({
            type : 'VaritextButton',
            view : new ViewTemplate({
                nodeName : 'header',
				/**@CSSify Style componentStyle : AbstractTreeHeader */
            }),
            states : [
                {role : "heading"},
                {expanded : undefined} 
            ],
            props : [
                {headerTitle : undefined}
            ],
            reactOnSelf : [
                {
                    from : 'headerTitle',
                    to : 'content'
                }
            ],
        })
    ]
})

class AbstractTree extends ComponentBase {
    static objectType = 'AbstractTree';
    expanded = false;

    /** 
     * Optional node transform callback.
     * @type {((node: object) => TreeNode)|null}
     */
    nodeTransformFunction : NodeTransformFunction = null;
	
	/**
	 * 
	 * @param {ComponentBase} parent - Parent component.
     * @param {ComponentTemplate} cTemplate - Empty template
	 * @param {ComponentView} view 
	 */
	constructor(
		parent : ComponentBase,
		cTemplate : ComponentTemplate,
		view : ComponentView
	) {
		super(parent, cTemplate, view);

		this.update.addEventListener((e, ctx, meta) => {
            const stream = ctx.streams.get('selected');
            /** @debug-build start */
            if (!stream)
                throw new ComponentError(this, 'unknwown stream error (not declared?): streams entry not found in streams registry. UID is', meta.regUID);
            /** @debug-build end */
			stream.next = meta.regUID;
		});

        // this.renderJSON(cTemplate, this.jsonData);
	}

    @Output() exportData = new EventEmitter<TreeNode>('exportData');


	/**
    * Public API: renders a JSON tree.
	* @param {ComponentTemplate} rootTemplate - Root template.
    * @param {object|string} jsonData - JSON data or string.
    * @returns {TreeNode} Root data node.
    */
    renderJSON(
		rootTemplate : ComponentTemplate,
		jsonData : object|string
	) {
        const dataTree = this.buildTree(jsonData);
        this.instantiateTree(rootTemplate, dataTree);
        return dataTree;
    }




    /**
     * Converts JSON data to an internal tree structure.
     * @param {object|string} data - The JSON data or string.
     * @returns {TreeNode} The root node.
     */
    buildTree(data : object|string) {
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
    populateSubnodes(
		data : object,
		parent : TreeNode
	) {
        if (typeof data !== 'object' || data === null) return;
        
        if (this.nodeTransformFunction)
            data = this.nodeTransformFunction(data);

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
	getDataType(obj : unknown) {
		if (Array.isArray(obj)) return 'array';
		if (obj === null) return 'null';
		return typeof obj;
	}




    /**
     * Creates the full component tree from a data tree.
	 * @param {ComponentTemplate} rootTemplate - Root template.
     * @param {TreeNode} root - Root data node.
     * @param {(node: TreeNode) => TreeNode} [filter] - Optional node transform/filter.
     */
    instantiateTree(
		rootTemplate : ComponentTemplate,
		root : TreeNode
	) {
		// Build ComponentTemplate children
		const nodes = this.nodeTransformFunction 
			? root.children.map(this.nodeTransformFunction)
			: root.children;
		const childTemplates = nodes.map((n) => this.createMember(n));

		// Attach them to the host template created in the ctor
		childTemplates.forEach((tpl) => rootTemplate.members.push(tpl));

		return rootTemplate;
    }
	/**
	 * Creates a member component (branch or leaf).
	 * @param {TreeNode} spec - Node specification.
	 * @returns {ComponentTemplate} The created component.
	 */
	createMember(spec : TreeNode) {
		const isBranch = spec.children && spec.children.length > 0;

		if (isBranch) {
            // append recursively-built children after header
			const branchTpl = createBranchTemplateDef();
			const childTpls = spec.children.map((c) => this.createMember(c));
			branchTpl.members.push(...childTpls);
			return branchTpl;
		}
	
		// Leaf node: we return a fresh leaf template
		return createLeafTemplateDef();
	}

	/**
	 * Returns a header title object for branches.
	 * @param {TreeNode} spec - Node specification.
	 * @returns {Object} Header object.
	 */
	getHeaderTitle(spec : TreeNode) {
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
	 * @param {TreeNode} spec - Node specification.
	 * @returns {Object} Key-value pair descriptor.
	 */
	getKeyValueObj(spec : TreeNode) {
		const val =
			spec.type === 'string' ? `"${spec.value}"` : String(spec.value);
		return {
			keyValuePair: ['', `${spec.key}${spec.children.length ? ' : ' : ''}`, val],
			displayedas: spec.type
		};
	}

	/** Clears the tree. */
	reset() {
		this.removeAllChildren();
		// this.exportData.clearEventListeners();
	}

	/** Placeholder render method to be implemented externally. */
	render() {}

	/**
	 * Handles click event wiring (override-friendly).
	 * @param {TreeNode} node - Node descriptor.
	 * @param {ComponentBase} component - Component instance.
	 */
	wireEvents(
		node : TreeNode,
		component : ComponentBase
	) {
		// this.affectClickEvents_Base(node, component);
	}

	/**
	 * Default implementation for click event binding.
	 * @param {TreeNode} node - Node descriptor.
	 * @param {Component} component - Component instance.
	 */
	// affectClickEvents_Base(node, component) {
	// 	if (node.children.length) {
	// 		const header = component.children[0];
	// 		header.clicked_ok.addEventListener(function(e, ctx, meta) {
	// 			const clickedNode = e?.payload.target;
	// 			const span = header.view.wrappingNode.children[2];
	// 			if (!clickedNode || clickedNode === span) {
	// 				component.exportdata.emit(node.projectedData);
	// 			} else {
	// 				ctx.streams.get('expanded').next =
	// 					ctx.streams.get('expanded').next ? null : 'expanded';
	// 			}
	// 		});
	// 	} else {
	// 		component.registerClickEvents = function () {
	// 			if (!component.clicked_ok)
	// 				component.clicked_ok = new EventEmitter('clicked_ok');

	// 			Object.getPrototypeOf(this).registerClickEvents.call(this);

	// 			component.clicked_ok.addEventListener((e, ctx,  meta) => {
	// 				ctx.streams.get('selected').next = 'selected';
	// 				ctx.emitters['update'].emit(true);
	// 				ctx.emitters['exportdata'].emit(node.projectedData);
	// 			});
	// 		};
	// 	}
	// }
}

// coreComponents.AbstractTree = AbstractTree;
export default AbstractTree;
