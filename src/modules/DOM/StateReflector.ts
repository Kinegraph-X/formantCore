/**
 * @module StateReflector
 * Common interface for ElementFactories
 */

import {ComponentError } from '../error/Error.js';
import {Logger} from '../log/Logger.js';
import StreamToDomInterface from '../reactivity/StreamToDomInterface.js';
import { tryParseBoolean } from '../nativeTypesUtilities/BooleanUtilities.js';

import {
    type AttributeArray,
    type StateArray
} from '../template/Prop.js'
import type Stream from '../reactivity/Stream';

export default class StateReflector {
    constructor() {
        throw new Error('StateReflector is static only, do not instanciate');
    }

    static reflect(
        element: HTMLElement,
        states: string[],
        streams: Map<string, Stream<unknown>>
    ): string[] {
        const nonProtectedObservedStates : string[] = [];
        for (const stateName of states) {
            
            // Validation
            if (!this.#isValidStateForReflection(element, stateName, streams)) {
                continue;
            }
            
            // Reflection
            const stream = streams.get(stateName)!;
            Object.defineProperty(
                element, 
                stateName, 
                StreamToDomInterface.getPropertyDescriptor.bind(element, stream)
            );

            nonProtectedObservedStates.push(stateName);
        }
        return nonProtectedObservedStates;
    }
    
    static #isValidStateForReflection(
        element: HTMLElement,
        stateName: string,
        streams: Map<string, Stream<unknown>>
    ): boolean {
        // Collision with native prop ?
        if (stateName in element) {
            console.warn(
            `[${element.tagName}] State "${stateName}" collides with ` +
            `native property. Skipping reflection.`
            );
            return false;
        }
        
        // Stream exists ?
        if (!streams.has(stateName)) {
        if (process.env.NODE_ENV === 'development') {
            console.error(
            `[${element.tagName}] State "${stateName}" has no ` +
            `corresponding stream.`
            );
        }
        return false;
        }
        
        return true;
    }
}