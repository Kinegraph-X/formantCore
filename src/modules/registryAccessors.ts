// src/modules/registryAccessors.ts

import registries from './registries';
import { ComponentError } from './error/Error';

// Type definitions for better type safety
type RegistryKey = string | number | symbol;

/**
 * Type-safe registry accessor that throws in development if the key doesn't exist
 */
function getFromRegistry<T extends object>(
  registry: Map<RegistryKey, T>,
  key: RegistryKey,
  registryName: string
): T {
  const value = registry.get(key);
  if (process.env.NODE_ENV === 'development') {
    if (value === undefined) {
        let component;
        if (registryName !== 'component')
            component = getFromRegistry(registries.component, key, 'component');
        else
            component = value;
        throw new ComponentError(
            component!,
            `Registry access error: Key "${String(key)}" not found in ${registryName} registry`
        );
    }
  }
  return value!;
}

// Individual registry accessors
export function getComponent(regUID: string) {
  return getFromRegistry(registries.component, regUID, 'component');
}

export function getStreams(regUID: string) {
  return getFromRegistry(registries.streams, regUID, 'streams');
}

export function getState(regUID: string) {
  return getFromRegistry(registries.state, regUID, 'state');
}

export function getProps(regUID: string) {
  return getFromRegistry(registries.prop, regUID, 'props');
}

export function getDomListens(regUID: string) {
  return getFromRegistry(registries.domListens, regUID, 'domListens');
}

export function getNode(uid: string) {
  return getFromRegistry(registries.node, uid, 'node');
}

export function getAttribute(uid: string) {
  return getFromRegistry(registries.attribute, uid, 'attribute');
}

export function getReactOnParent(regUID: string) {
  return getFromRegistry(registries.reactOnParent, regUID, 'reactOnParent');
}

export function getSubscribeOnSelf(regUID: string) {
  return getFromRegistry(registries.subscribeOnSelf, regUID, 'subscribeOnSelf');
}

export function getSubscribeOnChild(regUID: string) {
  return getFromRegistry(registries.subscribeOnChild, regUID, 'subscribeOnChild');
}

export function getFontSizeBuffer(key: string) {
  return getFromRegistry(registries.fontSizeBuffer, key, 'fontSizeBuffer');
}

// Specialized getters for nested structures
export function getStream(regUID: string, streamName: string) {
  const streams = getStreams(regUID);
  const stream = streams.get(streamName);
  if (process.env.NODE_ENV === 'development') {
    if (!stream) {
        const component = getFromRegistry(registries.component, regUID, 'component');;
        throw new ComponentError(
        component,
        `Stream "${streamName}" not found for component ${regUID}`
        );
    }
  }
  return stream!;
}

// Batch operations
// export function forEachComponent(callback: (component: any, regUID: string) => void) {
//   registries.component.forEach(callback);
// }

// export function clearComponentRegistry() {
//   registries.component.clear();
// }

// Type exports for better type safety
export type { RegistryKey };