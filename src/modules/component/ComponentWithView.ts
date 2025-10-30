/**
 * @module Component
 */

import {ComponentError } from '../error/Error.js';
import {
    ReactOnSelf,
    ReactOnParent,
    ReactivityQueryArray,
    EventSubscriptionArray,
    SubscribeOnChild,
    SubscribeOnSelf,
    TaskDefinition,
    ComponentTemplate,
    ViewTemplate,
} from '../template/TemplateFactory.js';
import registries from '../Registries.js';
import {RootHierarchicalObject, HierarchicalObject} from './HierarchicalObject.js';
import { ComponentView, RootComponentView } from '../view/ComponentView.js';
import type { stdTagNameType } from '../DOM/types.js';



/**
 * Common Interface for types having a view
 */
interface IComponentWithView<V> {
    readonly view: V;
    regUID: string;
}




export abstract class BaseComponentWithView extends HierarchicalObject 
		implements IComponentWithView<ComponentView<stdTagNameType | string>> {
    static readonly objectType: string = 'BaseComponentWithView';
    
    children: BaseComponentWithView[] = [];
    parent: RootComponent | ComponentWithView;
    regUID: string;

    #view: ComponentView<stdTagNameType | string>;
    
    get view(): ComponentView<stdTagNameType | string> {
        return this.#view;
    }
    
    set view(view: ComponentView<stdTagNameType | string>) {
        throw new ComponentError(this, 'view cannot be overridden');
    }

    constructor(
        parent: BaseComponentWithView,
        cTemplate: ComponentTemplate,
        view: ComponentView<stdTagNameType | string>
    ) {
        super(parent);
        
        if (!parent || !(parent instanceof ComponentWithView || parent instanceof RootComponent)) {
            throw new ComponentError(
                this,
                `constructor: parent isn't instance of Component or the component has not been passed a parent. regUID is ${cTemplate.UID}`,
                parent
            );
        }
        
        this.regUID = cTemplate.UID;
        this.parent = parent;
        this.parent.pushChild(this);
        this.#view = view;
    }

    /**
     * @virtual 
     * This default template will potentially be overridden by the global application template
     * This method is used by the TemplateReconcilier to merge the explicit template (from the app template)
     * with the template by default. Explicit implementations of ComponentWithView
     * may use the @Component decorator to provide that default template,
     * (the decorator injects a default template in the createDefaultDef() method)
     */
    static createDefaultDef(): ComponentTemplate {
        return new ComponentTemplate(null);
    }
}





export class RootComponent extends RootHierarchicalObject 
		implements IComponentWithView<RootComponentView> {
    static readonly objectType: string = 'RootComponent';
    
    regUID: string = '';
    #view: RootComponentView;
    
    get view(): RootComponentView {
        return this.#view;
    }
    
    set view(view: RootComponentView) {
        throw new ComponentError(this, 'view cannot be overridden');
    }
    
    constructor() {
        super();
        this.#view = new RootComponentView();
    }
}





export abstract class ComponentWithView extends BaseComponentWithView {
    static readonly objectType: string = 'ComponentWithView';
    
    subViews: ComponentView<stdTagNameType | string>[] = [];
    memberViews: ComponentView<stdTagNameType | string>[] = [];

    /** 
     * We chose to mimic the behavior of the Angular compiler
     * which reflects @output annotations to the @component object
     * @see rollup-plugin-formant-annotations
     */
    static _outputs: string[] = [];
    
    constructor(
        parent: BaseComponentWithView,
        cTemplate: ComponentTemplate,
        view: ComponentView<stdTagNameType | string>
    ) {
        super(parent, cTemplate, view);
    }

	/**
	 * @param {ComponentWithView} child
	 */
	removeChild(child : ComponentWithView) {
		if (child.subViews.length) {
			child.subViews.forEach(
				function(subView, key) {
					while (subView.node.lastChild) {
						subView.node.removeChild(subView.node.lastChild);
					}
				}
			);
		}
		child.children.forEach(function(childOfChild, key) {
			childOfChild.view.node.remove();
		});

		if (child.memberViews.length) {
			child.memberViews.forEach(function(member, key) {
				member.node.remove();
			});
		}
		child.view.node.remove();
		
		const streams = registries.streams.get(child.regUID);
		if (streams) {
			for(const streamName in streams) {
				const stream = streams.get(streamName);
				/** @debug-build start */
				if (!stream)
					throw new ComponentError(child, 'Reflection');
				/** @debug-build end */
				stream.subscriptions.forEach((sub) => {
					sub.unsubscribe();
				});
			}
		}
	}
	
}

