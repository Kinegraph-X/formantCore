/**
 * @module decorators
 * These are theoritical TS decorators: decorators are transformed at build time
 */

/**
 * typedef {import('./component/Component.js').Component} Component
 * typedef {import('./template/TemplateFactory.js').ComponentTemplateDef} ComponentTemplateDef
 * typedef {import('./template/TemplateFactory.js').ViewTemplateDef} ViewTemplateDef
 */

import {
    type ComponentTemplateDef,
    type ViewTemplateDef,
    ComponentTemplate,
    ViewTemplate
} from './template/TemplateFactory.js';
import {type ComponentBase} from './component/Component'



/**
 * @param {ComponentTemplateDef} options 
 */
export function Component(options : ComponentTemplateDef) {
    /** 
     * @param {any} constructor 
     */
    return (constructor : any) => {
        if (typeof constructor.createDefaultDef === 'undefined') {
            constructor.createDefaultDef = () => {
                return new ComponentTemplate(options);
            }
            constructor.declareOutput = Object.getPrototypeOf(constructor).constructor.declareOutput
        }
        return constructor;
    }
};



/** 
 * Just an attempt, not TS compatible
 * @param {ViewTemplateDef} options
 */
export function View(options : ViewTemplateDef) {
    /** 
     * @param {any} target 
     */
    return  (target : any) => {
        return new ViewTemplate(options);
    }
}




export function Output() {
    /** @param {any} target @param {string} propertyName */ 
    return (
            target : ComponentBase,
            propertyNam : string
        ) => {}
}

/**
 * Just an attempt, not TS compatible
 */
export function Imperative() {
    return /** @param {any} target */ (target : any) => {}
}
