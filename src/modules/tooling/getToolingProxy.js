/**
 * @module getToolingProxy
 */

/**
 * @template {keyof HTMLElementTagNameMap|string} tagName
 * @typedef {import('../view/ComponentView.js').ComponentView<string>} ComponentView
 * @typedef {import('../reactivity/Stream.js').default<unknown>} Stream
 * @typedef {import('../tooling/ToolingEvents')} ToolingEvents
 */

import {elementTrap, viewTrap, viewArrayTrap, streamTrap} from '../proxies/proxyTraps.js';


/** 
 * @template effectCtxVal
 * @param {string} regUID
 * @param {keyof ToolingEvents<any>} type
 * @param {effectCtxVal} value 
 */
export default (regUID, type, value) => {
    switch(type) {
        case 'element' :
            return new Proxy(
                value,
                {
                    get : elementTrap.get.bind(null, regUID, type),
                    set : elementTrap.set.bind(null, regUID, type)
                }
            );
        case 'view' :
            return new Proxy(
                value,
                {
                    get : viewTrap.get.bind(null, regUID, type),
                    set : viewTrap.set
                }
            );
        case 'subViews' :
        case 'memberViews' :
            return new Proxy(
                value,
                {
                    get : viewArrayTrap.get.bind(null, regUID, type),
                    set : viewArrayTrap.set
                }
            );
        case 'streams' :
            const proxifiedStreams = new Map();
            for (const streamName in value) {
                proxifiedStreams.set(
                    streamName,
                    new Proxy(
                        value.get(streamName),
                        {
                            get : streamTrap.get.bind(null, regUID, type),
                            set : streamTrap.set.bind(null, regUID, type)
                        }
                    )
                )
            }
            return proxifiedStreams;
        default : 
            throw new Error('Normally unreachable code path: Unknown effect-target type to allocate on EffectCtx:', type, 'component UID is:', regUID);
    }
    
}