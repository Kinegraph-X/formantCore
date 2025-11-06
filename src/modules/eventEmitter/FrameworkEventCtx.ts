/**
 * @module FrameworkEventCtx
 */

import { ComponentError } from '../error/Error.js';
import { getComponent, getStreams } from '../registryAccessors.js';
import { ComponentWithView } from '../component/ComponentWithView.js';
import Stream from '../reactivity/Stream.js';
import type { EventEmitter } from './EventEmitter.js';

/**
 * Context provided to event subscription callbacks.
 * Provides access to event emitters and reactive streams for the component.
 * 
 * /!\ Type safety: Event emitters and streams are dynamically bound.
 * Cast manually when accessing them for type safety.
 * (Existence of emitters and streams is already checked at runtime by the framework)
 * 
 * @example
 * class ParentComponent extends ComponentWithView {
 *   static createDefaultDef() {
 *     return new ComponentTemplate({
 *       subscribeOnChild: [{
 *         on: 'valueChange',
 *         subscribe: (e, ctx, meta) => {
 *           // Access payload with type cast
 *           const newValue = e.payload as number;
 *           
 *           // Access child's emitters
 *           const emitter = ctx.emitters['customEvent'] as EventEmitter<string>;
 *           
 *           // Access reactive streams
 *           const countStream = ctx.streams.get('count') as Stream<number>;
 *           countStream.next(countStream.value + 1);
 *           
 *           // Get event metadata
 *           console.log('Event from component:', meta.regUID);
 *           console.log('Child index:', meta.key);
 *         }
 *       }],
 *       
 *       subscribeOnSelf: [{
 *         on: 'click',
 *         subscribe: (e, ctx, meta) => {
 *           // Self events: access own emitters and streams
 *           const clickEmitter = ctx.emitters['click'] as EventEmitter<void>;
 *           
 *           // Emit to parent
 *           clickEmitter.emit(undefined, undefined, true); // bubble = true
 *         }
 *       }]
 *     });
 *   }
 * }
 * 
 * @example
 * // Component with @Output declarations
 * class MyButton extends ComponentWithView {
 *   
 *   // These will be automatically bound as EventEmitters in ctx.emitters
 *   @Output onClick = new EventEmitter<void>('onClick');
 *   @Output onHover = new EventEmitter<{x: number, y: number}>('onHover');
 * }
 */
export class FrameworkEventCtx {
    /** 
     * Map of event names to event emitters.
     * Populated from the component's @Output declarations.
     * 
     * @example
     * const emitter = ctx.emitters['onClick'] as EventEmitter<void>;
     */
    emitters: Record<string, EventEmitter<unknown>> = {};

    /** 
     * Registry of reactive streams for this component.
     * Access with type casting:
     * 
     * @example
     * const stream = ctx.streams.get('count') as Stream<number>;
     */
    streams: Map<string, Stream<unknown>>;

    constructor(regUID: string) {
        const component = getComponent(regUID);
        if (!component) {
            throw new ComponentError(
                this,
                'Component instance not found in component registry. UID is',
                regUID
            );
        }

        // Bind event emitters from @Output declarations
        const ctor = component.constructor as typeof ComponentWithView;
        if (ctor._outputs) {
            ctor._outputs.forEach((output) => {
                // Event emitters are bound via reflection at component creation
                this.emitters[output] = (component as any)[output];
            });
        }

        // Bind reactive streams
        const streamRegistry = getStreams(regUID);
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