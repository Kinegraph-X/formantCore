/**
 * @module FrameworkEvent
 */

/**
 * Represents a framework-level event with typed payload.
 * Wraps both custom framework events and native DOM events.
 * 
 * @template EventPayload - The type of data carried by this event (use `unknown` for dynamic typing)
 * 
 * 1. **DOM Events**: Declared via `listens` in the template
 *    - Automatically bound by the framework to component EventEmitters
 *    - Payload is `undefined`, access data via `e.nativeEvent`
 * 
 * 2. **Custom Events**: Declared via `_outputs` (similar to Angular @Output)
 *    - Emitted manually by components
 *    - Can have typed payloads
 * 
 * @example
 * // 1. DOM Events - declared in template's listens
 * 
 * @Component({
 *       view: {
 *         nodeName: 'button',
 *         listens: {
 *           click: 'handleClick',    // ⬅️ Framework binds this automatically
 *           input: 'handleInput'
 *         }
 *       }
 *     });
 * class MyButton extends ComponentBase {
 *   
 *   // EventEmitters for DOM events (payload is void)
 *   handleClick = new EventEmitter<void>('handleClick');
 *   handleInput = new EventEmitter<void>('handleInput');
 * }
 * 
 * @example
 * // 2. Custom Events - declared in _outputs
 * class MyCounter extends ComponentBase {
 *   
 *   @ Output onValueChange = new EventEmitter<number>('onValueChange');
 *   @ Output onReset = new EventEmitter<void>('onReset');
 *   
 *   increment() {
 *     const newValue = this.count + 1;
 *     this.onValueChange.emit(newValue); // ⬅️ Manual emit with payload
 *   }
 * }
 * 
 * @example
 * // Subscribing to events (both DOM and custom)
 * 
 * @Component({
 *       subscribeOnChild: [{
 *         on: 'handleClick',  // DOM event
 *         subscribe: (e, ctx, meta) => {
 *           // Access native DOM event
 *           if (e.nativeEvent) {
 *             const target = e.nativeEvent.target as HTMLButtonElement;
 *             console.log('Button clicked:', target.textContent);
 *           }
 *         }
 *       }, {
 *         on: 'onValueChange',  // Custom event
 *         subscribe: (e, ctx, meta) => {
 *           // Access typed payload
 *           const newValue = e.payload as number;
 *           console.log('Value changed to:', newValue);
 *         }
 *       }]
 *     });
 * 
 * class ParentComponent extends ComponentBase {
 * }
 */
export class FrameworkEvent<EventPayload> {
    constructor(
        /** Event type identifier (e.g., 'click', 'valueChange') */
        public type: string,
        
        /** 
         * Event payload data.
         * Cast to specific type when consuming:
         * `const data = e.payload as MyPayloadType;`
         */
        public payload: EventPayload,
        
        /** Whether this event should bubble up the component tree */
        public bubble: boolean = false,
        
        /** Optional reference to the native DOM event that triggered this framework event */
        public nativeEvent: Event | null = null
    ) {}
}