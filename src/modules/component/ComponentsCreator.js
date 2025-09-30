/**
 * @module MemberComponentsFactory
 */


import ComponentError from '../error/Error.js';
import { ComponentTemplate, ViewTemplate } from '../template/TemplateFactory.js';
import ViewFactory from '../view/ViewFactory.js';
import registries from '../Registries.js';
import { RootComponent, ComponentWithView } from './Component.js';
/** @ts-ignore Virtual modules can't be statically resolved */
import {componentTypes} from 'virtual:auto-import.js'
const knownTypes = Object.assign(componentTypes, {RootComponent, ComponentWithView });

class ComponentFactory {
    /** @type {ComponentWithView[]} */
    subComponents = [];

    constructor() {
        throw new Error("MemberComponentsFactory is static-only; do not instantiate.");
    }
    /**
     * Recursive template processor
     * subSection templates must not have multiple hierarchical levels
     * (may be views or single-level components, but not mixed)
     * member templates are handled recursively if needed
     * @param {ComponentWithView|RootComponent} parentComponent
     * @param {ComponentTemplate} cTemplate
     */
    static process(parentComponent, cTemplate) {
        // subComponents array is just a temporary helper
        this.subComponents.length = 0;
        if (cTemplate.subSections.length) {
            this.firstSubSectionType = cTemplate.subSections[0].constructor;
            this.handleSubSections(cTemplate.subSections, parentComponent);
        }
        this.handleMembers(cTemplate.members, parentComponent);
    }
    
    /** 
     * @param {(ComponentTemplate|ViewTemplate)[]} subSections
     * @param {ComponentWithView} parentComponent
     * */
	static handleSubSections(subSections, parentComponent) {
        let newComponent;
		subSections.forEach((subSection) => {
            if (subSection.constructor !== this.firstSubSectionType)
                throw new ComponentError(parentComponent, 'Mixed subSection types is forbidden: please define subSections as being all ComponentTemplate or ViewTemplate', subSection);
			if (subSection instanceof ComponentTemplate) {
				if (subSection.type) {
                    if (subSection.type in knownTypes)
                        this.subComponents.push((newComponent = new knownTypes[subSection.type](parentComponent, subSection)));
                    else
                        new ComponentError(parentComponent, 'Unknown component type declared as subSection:', subSection.type);
                }
                else {
                    this.subComponents.push((newComponent = new ComponentWithView(parentComponent, subSection)));
                }
                if (subSection.subSections.length || subSection.members.length) {
                    throw new ComponentError(parentComponent, 'Multi-level subSections are forbidden: please constrain your component template to only one view', subSection);
                }
		        registries.component.set(newComponent.regUID, newComponent);
			}
            else {
                parentComponent.subViews.push(ViewFactory.newView(member, targetView, parentComponent.regUID));
            }
		})
	}

    /** 
     * @param {(ComponentTemplate|ViewTemplate)[]} members
     * @param {ComponentWithView} parentComponent
     * */
	static handleMembers(ComponentWithView, members, parentComponent) {
        let targetComponent, newComponent, targetView;
		members.forEach((member) => {
            targetView = parentComponent.view, targetComponent = parentComponent;
			if (member instanceof ComponentTemplate) {
                if (member.view.section) {
                    targetComponent = this.handleTargetComponentOnparentComponent(member.view.section, parentComponent);
                }
				if (member.type) {
                    if (member.type in knownTypes)
                        newComponent = new knownTypes[member.type](targetComponent, member);
                    else
                        new ComponentError(parentComponent, 'Unknown component type declared as member:', member.type);
                }
                else {
                    newComponent = new ComponentWithView(targetComponent, member);
                }
		        registries.component.set(newComponent.regUID, newComponent);
                this.process(targetComponent, member);
			}
            else {
                if (member.section) {
                    targetView = this.handleTargetViewOnparentComponent(member.section, parentComponent);
                }
                parentComponent.memberViews.push(ViewFactory.newView(member, targetView, parentComponent.regUID));
            }
		})
	}
    /**
     * @param {number} section 
     * @param {ComponentWithView} parentComponent 
     * @returns {ComponentWithView}
     */
    static handleTargetComponentOnparentComponent(section, parentComponent) {
        if (!this.subComponents[section])
            throw new ComponentError(parentComponent, 'A member component as a declared "section" number refering to a non-component object. Section is', section, 'parentComponent is', parentComponent);
        return this.subComponents[section];
    }
    /**
     * @param {number} section 
     * @param {ComponentWithView} parentComponent 
     * @returns {InstanceType<ComponentView>}   parsing bug, seemingly (TODO: find out why)
     */
    static handleTargetViewOnparentComponent(section, parentComponent) {
        if (this.subComponents.length) {
            if (!parentComponent.subViews[section])
                throw new ComponentError(parentComponent, 'A member component as a declared "section" number refering to a non-view object. Section is', section, 'parentComponent is', parentComponent);
            else
                return this.subComponents[section].view;
        }
        else {
            if (!parentComponent.subViews[section])
                throw new ComponentError(parentComponent, 'A member component as a declared "section" number refering to a non-view object. Section is', section, 'parentComponent is', parentComponent);
            else
                return parentComponent.subViews[section];
        }
    }
}

export default ComponentFactory;