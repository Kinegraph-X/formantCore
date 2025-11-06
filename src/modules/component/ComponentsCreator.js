/**
 * @module MemberComponentsFactory
 */

/**
 * @typedef {import('../component/ComponentWithView.js').RootComponent} RootComponent
 * @typedef {import('./Component.js').ComponentBase} Component
 * @typedef {import('../view/ComponentView.js').ComponentView<string>} ComponentView
 */
import {ComponentError} from '../error/Error.js';
import { ComponentTemplate, ViewTemplate } from '../template/TemplateFactory';
import ViewFactory from '../view/ViewFactory.js';
import ComponentFactory from './ComponentFactory.js'
const newComponent = ComponentFactory.newComponent;


class ComponentCreator {
    /** @type {Component[]} */
    static subComponents = [];

    constructor() {
        throw new Error("MemberComponentsFactory is static-only; do not instantiate.");
    }
    /**
     * Recursive template processor
     * subSection templates must not have multiple hierarchical levels
     * (may be views or single-level components, but not mixed, so we test that via "this.firstSubSectionType")
     * member templates are handled recursively if needed
     * @param {Component|RootComponent} parentComponent
     * @param {ComponentTemplate} cTemplate
     */
    static process(parentComponent, cTemplate) {
        // subComponents array is just a temporary helper
        this.subComponents.length = 0;
        if (cTemplate.subSections.length) {
            this.firstSubSectionType = cTemplate.subSections[0].constructor;
            this.handleSubSections(cTemplate.subSections, /** @type {Component} */ (parentComponent));
        }
        this.handleMembers(cTemplate.members, /** @type {Component} */ (parentComponent));
    }
    
    /** 
     * @param {(ComponentTemplate|ViewTemplate)[]} subSections
     * @param {Component} parentComponent
     * */
	static handleSubSections(subSections, parentComponent) {
        let newComp, targetView;
		subSections.forEach((subSection) => {
            if (subSection.constructor !== this.firstSubSectionType)
                throw new ComponentError(parentComponent, 'Mixed subSection types is forbidden: please define subSections as being all ComponentTemplate or ViewTemplate', subSection);
            
			if (subSection instanceof ComponentTemplate) {
                this.subComponents.push((newComp = newComponent(subSection, parentComponent)));
                
                if (subSection.subSections.length || subSection.members.length) {
                    throw new ComponentError(parentComponent, 'Multi-level subSections are forbidden: please constrain your component template to only one view', subSection);
                }
			}
            else {
                parentComponent.subViews.push(ViewFactory.newView(subSection, parentComponent.view, parentComponent.regUID));
            }
		})
	}

    /** 
     * @param {(ComponentTemplate|ViewTemplate)[]} members
     * @param {Component} parentComponent
     * */
	static handleMembers(members, parentComponent) {
        let targetComponent, newComp, targetView;
		members.forEach((member) => {
            targetView = parentComponent.view, targetComponent = parentComponent;
			if (member instanceof ComponentTemplate) {
                if (member.view.section) {
                    targetComponent = this.handleTargetComponentOnparentComponent(member.view.section, parentComponent);
                }
                newComp = newComponent(member, targetComponent);
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
     * @param {Component} parentComponent 
     * @returns {Component}
     */
    static handleTargetComponentOnparentComponent(section, parentComponent) {
        if (!this.subComponents[section])
            throw new ComponentError(parentComponent, 'A member component as a declared "section" number refering to a non-component object. Section is', section, 'parentComponent is', parentComponent);
        return this.subComponents[section];
    }
    /**
     * @param {number} section 
     * @param {Component} parentComponent 
     * @returns {ComponentView>
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

export default ComponentCreator;