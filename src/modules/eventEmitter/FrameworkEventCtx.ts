/**
 * @module FrameworkEventCtx
 */

import { ComponentError } from '../error/Error';
import registries from '../registries';
import { ComponentWithView } from '../component/ComponentWithView';
import  Stream from '../reactivity/Stream';
import type { EventEmitter } from './EventEmitter.ts';

/**
 * Context for framework event handling — provides access to emitters and reactive streams.
 */
export class FrameworkEventCtx {
    /** Map of event names to event emitters. */
    emitters: Record<string, EventEmitter<unknown>> = {};

    /** Registry of streams for this component. */
    streams: Map<string, Stream<unknown>>;

    constructor(regUID: string) {
        const component = registries.component.get(regUID);
        if (!component) {
            throw new ComponentError(
                this,
                'Component instance not found in component registry. UID is',
                regUID
            );
        }

        const ctor = component.constructor as typeof ComponentWithView;
        if (ctor._outputs) {
            ctor._outputs.forEach((output) => {
                // @ts-ignore - bound via reflection
                this.emitters[output] = component[output];
            });
        }

        const streamRegistry = registries.streams.get(regUID);
        if (!streamRegistry) {
            throw new ComponentError(
                component,
                'FrameworkEventCtx: Component instance not found in streams registry. UID is',
                regUID
            );
        }

        this.streams = streamRegistry;
    }
}
