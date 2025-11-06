/**
 * @module StreamCtxProvider
 */

import { ComponentError } from '../error/Error.js';
import registries from '../registries.js';
import { 
  getState, 
  getStreams, 
  getComponent, 
  getDomListens,
  getNode,
  getAttribute
} from '../registryAccessors';
import getToolingProxy from '../tooling/getToolingProxy.js';
import type { ComponentView } from '../view/ComponentView.js';
import type Stream from '../reactivity/Stream.js';

/**
 * Context provided to reactive effect callbacks.
 * Provides access to component view, streams, and DOM elements.
 * 
 * /!\ Type safety: Streams and element properties are dynamically created.
 * Cast manually when accessing them for type safety.
 * (Existence of streams is already checked at runtime by the framework)
 * 
 * @example
 * @Component({
 *       states: [{ name: 'count', value: 0 }],
 *       reactOnSelf: [{
 *         query: ['count'],
 *         callback: (ctx, value) => {
 *           // Access streams with type cast
 *           const countStream = ctx.streams.get('count') as Stream<number>;
 *           console.log(countStream.value);
 *           
 *           // Access element (escape hatch)
 *           const button = ctx.element as HTMLButtonElement;
 *           button.disabled = true;
 *           
 *           // Access views
 *           ctx.view.setContent('Updated!');
 *         }
 *       }]
 *     });
 *   }
 * }
 */
class EffectCtx {
    static readonly objectType: string = 'EffectCtx';
    
    regUID: string;
    view: ComponentView;
    subViews: ComponentView[];
    memberViews: ComponentView[];
    
    /**
     * /!\ Direct DOM access is an escape hatch.
     * Prefer using states, props, and reactivity queries.
     * Type safety is not guaranteed - cast at your own risk.
     * 
     * @example
     * // If you must access the node:
     * const button = this.element as HTMLButtonElement;
     * button.disabled = true;
     */
    element: HTMLElement;
    
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
        
        this.regUID = regUID;
        
        if (process.env.NODE_ENV === 'development') {
            // Debug build with proxies for better DX
            this.element = getToolingProxy(regUID, 'element', component.view.node);
            this.view = getToolingProxy(regUID, 'view', component.view);
            this.subViews = getToolingProxy(regUID, 'subViews', component.subViews);
            this.memberViews = getToolingProxy(regUID, 'memberViews', component.memberViews);

            const streamRegistry = getStreams(regUID);
            this.streams = getToolingProxy(regUID, 'streams', streamRegistry);
        } else {
            // Production build - direct access
            this.element = component.view.node;
            this.view = component.view;
            this.subViews = component.subViews;
            this.memberViews = component.memberViews;
            this.streams = registries.streams.get(regUID)!;
        }
    }

    /**
     * Creates a bound effect function with the context
     * @param regUID - Component registry UID
     * @param effect - Effect callback (ReactivityQuery isn't generic, so value type unknown for now)
     * @returns Bound effect function
     */
    static getEffectFunction(
        regUID: string, 
        effect: (ctx: EffectCtx, value: unknown) => void
    ): (ctx: EffectCtx, value: unknown) => void {
        return effect.bind(null, new EffectCtx(regUID));
    }
}

export default EffectCtx;