/**
 * @module ComponentWithView
 */
import {ComponentError } from '../error/Error.js';
import {Output} from '../decorators.js'
import {ComponentTemplate} from '../template/TemplateFactory.js';
import {BaseComponentWithView, ComponentWithView} from './ComponentWithView.js';
import { EventEmitter } from '../eventEmitter/EventEmitter.js';
import { ComponentView} from '../view/ComponentView.js';
import type { stdTagNameType } from '../DOM/types.js';

export class ComponentBase extends ComponentWithView {

    static declareOutput(
		type: typeof ComponentBase,
		outputName: string
	): boolean {
        if (!type.hasOwnProperty('_outputs')) {
            type._outputs = [];
        }
        type._outputs.push(outputName);
        return true;
    }
    
    /**
     * @param {BaseComponentWithView} parent
     * @param {ComponentTemplate} cTemplate
     * @param {ComponentView<stdTagName|string>} view
     */
    constructor(
        parent : BaseComponentWithView,
        cTemplate : ComponentTemplate,
        view : ComponentView<stdTagNameType|string>
    ) {
        super(parent, cTemplate, view);
        
        // EventEmitters don't have a propoer "emit()" function when defining them
        // (EventEmitter has the ability to bind on DOM events, and the handler gets refs to "regUID" and "key")
        // Define here the correct emit function
        const ctor = this.constructor as unknown;
        (ctor as typeof ComponentBase)._outputs.forEach(
            (output) => {
                const prop = output as keyof this;
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
	@Output() update = new EventEmitter<any>('update');
}