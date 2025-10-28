/**
 * @module FrameworkEvent
 */

/**
 * Represents a framework-level event with payload and optional DOM native event.
 */
export class FrameworkEvent<EventPayload> {
    constructor(
        public type: string,
        public payload: EventPayload,
        public bubble: boolean = false,
        public nativeEvent: Event | null = null
    ) {}
}
