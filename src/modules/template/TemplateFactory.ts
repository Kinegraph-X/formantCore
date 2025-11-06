/**
 * @file TemplateFactory
 */

import { templateUIDGenerator, viewUIDGenerator } from '../UIDGenerator.js';

import { 
    Attribute,
    Prop,
    State,
    AbstractPropArray,
    AttributeArray,
    PropArray,
    StateArray
} from './Prop.js';

import {
    ReactivityQuery,
    ReactOnParent,
    ReactOnSelf,
    ReactivityQueryArray
} from './ReactivityQuery.js';

import {
    EventSubscription,
    SubscribeOnSelf,
    SubscribeOnChild,
    EventSubscriptionArray
} from './EventSubscription.js';

import TaskDefinition from './TaskDefinition.js';
import ListTemplate from './List.js';

import type { AttributeDef, PropDef, StateDef } from './Prop.js';
import type { ReactivityQueryDef } from './ReactivityQuery.js';
import type { EventSubscriptionDef } from './EventSubscription.js';
import type { ListTemplateDef } from './List.js';
import type {default as Stylesheet} from '../style/Stylesheet.js';

/**
 * Standard DOM event types
 */
export type DomEventType = 
    | 'click'
    | 'dblclick'
    | 'mousedown'
    | 'mouseup'
    | 'mousemove'
    | 'keydown'
    | 'keyup'
    | 'keypress'
    | 'input'
    | 'change'
    | 'submit'
    | 'focus'
    | 'blur'
    | 'dragstart'
    | 'dragover'
    | 'drop'
    | 'touchstart'
    | 'touchend'
    | 'touchmove';

/**
 * Provides the name of the event handler defined on the component type
 */
export type DomEventBindings = Partial<Record<DomEventType, string>>;

export interface ViewTemplateDef {
    nodeName: string;
    attributes?: AttributeDef[];
    listens?: DomEventBindings;
    section?: number;
    sWrapper?: Stylesheet;
    sOverride?: Record<string, string>[];
}

export class ViewTemplate {
    readonly UID: string;
    nodeName: string = 'div';
    isCustomElem: boolean = false;
    readonly attributes: AttributeArray = new AttributeArray();
    readonly listens: DomEventBindings | null = null;
    section: number | null = null;
    readonly sWrapper: Stylesheet | null = null;
    sOverride: Record<string, string>[] | null = null;
    readonly objectType: string = 'ViewTemplate';
    
    constructor(obj?: ViewTemplateDef) {
        this.UID = viewUIDGenerator.newUID();
        
        if (obj) {
            if (obj.nodeName) {
                this.nodeName = obj.nodeName;
            }
            if (typeof obj.section !== 'undefined') {
                this.section = obj.section;
            }
            if (typeof obj.listens !== 'undefined') {
                this.listens = obj.listens;
            }
            this.sWrapper = obj.sWrapper || null;
            this.sOverride = obj.sOverride || null;
            
            this.isCustomElem = obj.nodeName.indexOf('-') !== -1;
            
            if (Array.isArray(obj.attributes)) {
                obj.attributes.forEach((attrObj) => {
                    this.attributes.push(new Attribute(attrObj));
                });
            }
        }
    }
}

/**
 * uuid is dynamically added by rollup-plugin-formant-annotations (if @Component() decorator is used)
 */
export interface ComponentTemplateDef {
    uuid?: string;
    view: ViewTemplateDef | ViewTemplate;
    type?: string;
    props?: PropDef[];
    states?: StateDef[];
    // command?: Command; // Commented in original
    reactOnParent?: ReactivityQueryDef[];
    reactOnSelf?: ReactivityQueryDef[];
    subscribeOnChild?: EventSubscriptionDef[];
    subscribeOnSelf?: EventSubscriptionDef[];
    // outputs?: string[]; // Commented in original
    members?: (ComponentTemplate | ViewTemplate)[];
    subSections?: (ComponentTemplate | ViewTemplate)[];
    list?: ListTemplateDef;
}

export class ComponentTemplate {
    readonly uuid: string | null = null;
    readonly UID: string;
    readonly view: ViewTemplate;
    readonly type: string | null = null;
    readonly props: PropArray = new PropArray();
    readonly states: StateArray = new StateArray();
    // command: Command | null = null; // Commented in original
    readonly reactOnParent: ReactivityQueryArray = new ReactivityQueryArray();
    readonly reactOnSelf: ReactivityQueryArray = new ReactivityQueryArray();
    readonly subscribeOnChild: EventSubscriptionArray = new EventSubscriptionArray();
    readonly subscribeOnSelf: EventSubscriptionArray = new EventSubscriptionArray();
    readonly members: (ComponentTemplate | ViewTemplate)[] = [];
    readonly subSections: (ComponentTemplate | ViewTemplate)[] = [];
    list: ListTemplate | null = null;
    readonly objectType: string = 'ComponentTemplate';
    
    constructor(obj?: ComponentTemplateDef | null) {
        this.UID = templateUIDGenerator.newUID();
        
        if (obj) {
            if (obj.uuid) {
                this.uuid = obj.uuid;
            }

            this.view = obj.view instanceof ViewTemplate 
                ? obj.view 
                : new ViewTemplate(obj.view);
            
            this.type = obj.type || null;

            if (Array.isArray(obj.props)) {
                obj.props.forEach((propObj) => {
                    this.props.push(new Prop(propObj));
                });
            }
            
            if (Array.isArray(obj.states)) {
                obj.states.forEach((stateObj) => {
                    this.states.push(new State(stateObj));
                });
            }
            
            if (Array.isArray(obj.reactOnParent)) {
                obj.reactOnParent.forEach((reactivityQueryObj) => {
                    this.reactOnParent.push(new ReactOnParent(reactivityQueryObj));
                });
            }
            
            if (Array.isArray(obj.reactOnSelf)) {
                obj.reactOnSelf.forEach((reactivityQueryObj) => {
                    this.reactOnSelf.push(new ReactOnSelf(reactivityQueryObj));
                });
            }
            
            if (Array.isArray(obj.subscribeOnChild)) {
                obj.subscribeOnChild.forEach((subscribeOnChildObj) => {
                    this.subscribeOnChild.push(new SubscribeOnChild(subscribeOnChildObj));
                });
            }
            
            if (Array.isArray(obj.subscribeOnSelf)) {
                obj.subscribeOnSelf.forEach((subscribeOnSelfObj) => {
                    this.subscribeOnSelf.push(new SubscribeOnSelf(subscribeOnSelfObj));
                });
            }
            
            if (Array.isArray(obj.subSections)) {
                obj.subSections.forEach((subSection) => {
                    if (subSection instanceof ComponentTemplate || 
                        subSection instanceof ViewTemplate) {
                        this.subSections.push(subSection);
                    } else {
                        console.error(
                            'Malformed template. Check this section of your definition for:', 
                            this.view.nodeName, 
                            subSection
                        );
                    }
                });
            }
            
            if (Array.isArray(obj.members)) {
                obj.members.forEach((member) => {
                    if (member instanceof ComponentTemplate || 
                        member instanceof ViewTemplate) {
                        this.members.push(member);
                    } else {
                        console.error(
                            'Malformed template. Check this section of your definition for:', 
                            this.view.nodeName, 
                            member
                        );
                    }
                });
            }
            
            this.list = obj.list ? new ListTemplate(obj.list) : null;
        } else {
            this.view = new ViewTemplate();
        }
    }
    
    /**
     * NOTE: These getters return arrays grouped by type.
     * Consider: Are these used for iteration/validation? Could be more explicit.
     */
    get propsAreArrayOfProps(): AbstractPropArray[] {
        return [
            this.view.attributes,
            this.props,
            this.states
        ];
    }
    
    get propsAreArrayOfReactivityQueries(): ReactivityQueryArray[] {
        return [
            this.reactOnParent,
            this.reactOnSelf
        ];
    }
    
    get propsAreArrayOfMessagingDeclarations(): (ReactivityQueryArray | EventSubscriptionArray)[] {
        return [
            this.reactOnParent,
            this.reactOnSelf,
            this.subscribeOnChild,
            this.subscribeOnSelf
        ];
    }
    
    get propsAreArrayOfEventQueries(): EventSubscriptionArray[] {
        return [
            this.subscribeOnChild,
            this.subscribeOnSelf
        ];
    }
    
    get propsArePrimitives(): (string | boolean | number | null)[] {
        return [
            this.type,
            this.view.nodeName,
            this.view.isCustomElem,
            this.view.section
        ];
    }
}

export {
    ListTemplate,
    TaskDefinition,
    EventSubscription,
    ReactivityQuery,
    Attribute,
    State,
    Prop,
    SubscribeOnChild,
    SubscribeOnSelf,
    ReactOnSelf,
    ReactOnParent,
    AbstractPropArray,
    AttributeArray,
    PropArray,
    StateArray,
    ReactivityQueryArray,
    EventSubscriptionArray,
};