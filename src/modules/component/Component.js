/**
 * @module ComponentWithView
 */
import {ComponentError } from '../error/Error.js';
import {Output} from '../decorators.js'
import {
    ComponentTemplate,
} from '../template/TemplateFactory.js';
import {BaseComponentWithView, ComponentWithView} from './ComponentWithView.js';
import { EventEmitter } from '../eventEmitter/EventEmitter.js';
//import { FrameworkEvent } from '../eventEmitter/FrameworkEvent.js';
import { ComponentView, RootComponentView } from '../view/ComponentView.js';

/** 
 * @typedef {import('../DOM/types.js').stdTagNameType} stdTagName
*/

export class Component extends ComponentWithView {
    /**
     * @param {BaseComponentWithView} parent
     * @param {ComponentTemplate} cTemplate
     * @param {ComponentView<stdTagName|string>} view
     */
    constructor(parent, cTemplate, view) {
        super(parent, cTemplate, view);
        
        // EventEmitters don't have a propoer "emit()" function when defining them
        // (EventEmitter has the ability to bind on DOM events, and the handler gets refs to "regUID" and "key")
        // Define here the correct emit function
        const ctor = /** @type {unknown} */(this.constructor);
        /** @type {typeof Component} */(ctor)._outputs.forEach(
            (/**@type{string}*/output) => {
                const prop = /** @type {keyof this} */ (output);
                const emitter = this[prop];
                if (!(emitter instanceof EventEmitter))
                    throw new ComponentError(this, 'An output declared on a component isn\'t an EventEmitter. output is', output);
                
                emitter.emit = EventEmitter.getTriggerFunction(this, emitter);
        })
    }

    /*
	 * @example:
	 * 	@ Output() output = new EventEmitter<EventPayload>('eventName');
	 * 	will be transformed at build time to
	 * 	`output = Component.declareOutput(${typeName}, ${outputName)} && new EventEmitter<EventPayload>();`
	 */
	@Output() update = new EventEmitter('update');
}