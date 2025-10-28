/**
 * @module EventEmitter
 */

import { FrameworkEvent } from './FrameworkEvent';
import { FrameworkEventCtx } from './FrameworkEventCtx';
import { FrameworkEventMeta } from './FrameworkEventMeta';
import { ComponentWithView } from '../component/ComponentWithView';

type EventHandler<T> = (
    e: FrameworkEvent<T>,
    ctx: FrameworkEventCtx, 
    meta: FrameworkEventMeta
) => void

/**
 * A generic event emitter supporting typed event payloads and framework event context.
 */
export class EventEmitter<EventPayload> {
    static readonly objectType = 'EventEmitter';
    private eventHandlers: Array<EventHandler<EventPayload>> = [];

    constructor(public eventType: string) {}

    removeEventListener(
        handler: (e: FrameworkEvent<EventPayload>, ctx: FrameworkEventCtx, meta: FrameworkEventMeta) => void
    ): void {
        this.eventHandlers = this.eventHandlers.filter((h) => h !== handler);
    }

    addEventListener(
        handler: (e: FrameworkEvent<EventPayload>, ctx: FrameworkEventCtx, meta: FrameworkEventMeta) => void
    ): void {
        this.eventHandlers.push(handler);
    }

    addEventListenerAt(
        handler: (e: FrameworkEvent<EventPayload>, ctx: FrameworkEventCtx, meta: FrameworkEventMeta) => void,
        index: number
    ): void {
        this.eventHandlers.splice(index, 0, handler);
    }

    removeEventListenerAt(index: number): void {
        if (index < this.eventHandlers.length) {
            this.eventHandlers.splice(index, 1);
        }
    }

    clearEventListeners(): void {
        this.eventHandlers.length = 0;
    }

    trigger(
        nativeEvent: Event | null,
        regUID: string,
        key: number,
        payload?: EventPayload,
        metaOverride?: FrameworkEventMeta,
        bubble?: boolean
    ): void {
        for (const handler of this.eventHandlers) {
            handler(
                new FrameworkEvent<EventPayload>(this.eventType, payload as EventPayload, bubble ?? false, nativeEvent),
                new FrameworkEventCtx(regUID),
                metaOverride ?? new FrameworkEventMeta(regUID, key)
            );
        }
    }

    emit(_payload?: EventPayload, _metaOverride?: FrameworkEventMeta, _bubble?: boolean): void {
        throw new Error(
            'Unknown Event binding error: Probable missing "outputs" declaration in template. Default implementation of EventEmitter has not been bound to a component.'
        );
    }

    static getDOMTriggerFunction<T>(
        component: ComponentWithView,
        eventEmitter: EventEmitter<T>
    ): (nativeEvent: Event) => void {
        return (nativeEvent: Event) => {
            eventEmitter.trigger(nativeEvent, component.regUID, component.key);
        };
    }

    static getTriggerFunction<T>(
        component: ComponentWithView,
        eventEmitter: EventEmitter<T>
    ): (payload?: T, metaOverride?: FrameworkEventMeta, bubble?: boolean) => void {
        return (payload?: T, metaOverride?: FrameworkEventMeta, bubble: boolean = false) => {
            eventEmitter.trigger(null, component.regUID, component.key, payload, metaOverride, bubble);
        };
    }
}
