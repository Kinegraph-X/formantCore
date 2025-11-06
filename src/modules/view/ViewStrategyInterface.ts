/**
 * @module ViewStrategyInterface
 */

/**
 * Abstract interface for view access strategies.
 * The distinction between #masterNode & #wrappingNode
 * is meant to allow shadow-DOM or similar implementations.
 * In those implementations, appending to the #masterNode won't work 
 */
abstract class ViewStrategyInterface {
    static readonly objectType: string = 'ViewStrategyInterface';
    
    #nodeName: string;
    #masterNode: unknown = null;
    #wrappingNode: unknown = null;
    
    constructor(tpl: any) {
        this.#nodeName = tpl.nodeName as string;
    }
    
    abstract setPresence(bool: boolean) : void
    
    abstract addEventListener(eventName: string, handler: (e: any) => void) : void

    get nodeName(): string {
        return this.#nodeName;
    }
    
    get masterNode(): any {
        return this.#masterNode;
    }
    
    set masterNode(node: any) {
        this.#masterNode = node;
    }
    
    get wrappingNode(): any {
        return this.#wrappingNode || this.#masterNode;
    }
    
    isShadowHost(): boolean {
        return false;
    }
    
    #isTextInput(): boolean {
        return false;
    }
    
    abstract getTextInputValue() : string
    
    abstract getChildNodeAtIndex(atIndex: number) : any | false
    
    abstract getTextContent() : string
    
    abstract setContent(value: string) : void
    
    abstract getContent() : string
    
    abstract setTextContent(text: string) : void
    
    abstract setNodeContent(contentAsString: string) : void
    
    abstract appendTextNode(text: string) : void
    
    abstract addChildNodeAt(childNode: HTMLElement, atIndex: number) : void
    
    abstract empty() : void
    
    abstract getMultilineContent(contentAsArray: string[], templateNodeName : string) : any
    
    abstract getFragmentFromContent(contentAsArray: string[], templateNodeName: string) : any
    
    abstract setContentFromArray(contentAsArray: string[], templateNodeName : string) : void
    
    abstract updateBGColor(color: string) : void
    
    /**
     * These methods are implemented as a reminder and a potentially needed fallback,
     * but in most cases of hiding/showing, we should prefer the reactive states-based mechanism:
     * states : [{hidden : 'hidden'}} will be automagically reflected on the DOM node
     */
    abstract hide() : void
    
    abstract show() : void
}

export default ViewStrategyInterface;