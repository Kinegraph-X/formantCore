/**
 * @module DOMViewStrategy
 */

import ViewStrategyInterface from '../view/ViewStrategyInterface.js';
import { HTMLCustomElement } from '../DOM/Factories.js';
import type { ViewTemplate } from '../template/TemplateFactory.js';

/**
 * DOM rendering strategy for component views.
 * Handles both standard HTML elements and custom elements with shadow DOM.
 */
class DOMViewStrategy extends ViewStrategyInterface  {
    static readonly objectType: string = 'DOMViewAPI';
    
    #isShadowHost: boolean = false;
    #nodeName: string;
    #masterNode: HTMLElement | HTMLCustomElement | null = null;
    #wrappingNode: ShadowRoot | null = null;
    #presenceAsAProp: 'inline' | 'block' | 'flex' | 'none' = 'flex';
    
    constructor(def: ViewTemplate) {
		super(def);
        this.#isShadowHost = def.isCustomElem;
        this.#nodeName = def.nodeName;
    }
    
    setPresence(bool: boolean): void {
        this.masterNode.style.display = bool ? this.#presenceAsAProp : 'none';
    }
    
    addEventListener(eventName: string, handler: (e: Event) => void): void {
        this.masterNode.addEventListener(eventName, handler);
    }

    get nodeName(): string {
        return this.#nodeName;
    }
    
    /**
     * NOTE: These getters seem redundant. Consider removing if not used elsewhere.
     */
    get HTMLElementMasterNode(): HTMLElement {
        return this.#masterNode as HTMLElement;
    }
    
    get customElementMasterNode(): HTMLCustomElement {
        return this.#masterNode as HTMLCustomElement;
    }
    
    get masterNode() {
        if (!this.isShadowHost()) {
            return this.HTMLElementMasterNode;
        } else {
            return this.customElementMasterNode;
        }
    }
    
    set masterNode(node: HTMLElement) {
        this.#masterNode = node;
        this.#wrappingNode = node.shadowRoot;
    }
    
    /**
     * Returns the wrapping node (ShadowRoot for custom elements, or the element itself)
     */
    get wrappingNode(): HTMLElement | HTMLCustomElement | ShadowRoot {
        return this.#wrappingNode || (this.#masterNode as HTMLElement | HTMLCustomElement);
    }

    isShadowHost(): boolean {
        return this.#isShadowHost;
    }
    
    #isTextInput(): boolean {
        return this.#nodeName.toUpperCase() === 'INPUT' || 
               this.#nodeName.toUpperCase() === 'TEXTAREA';
    }
    
    getTextInputValue(): string {
        if (!this.#isTextInput()) {
            throw new Error('Cannot call getTextInputValue on a non input node');
        }
        return (this.masterNode as HTMLInputElement | HTMLTextAreaElement).value;
    }
    
    getChildNodeAtIndex(atIndex: number): Element | false {
        if (this.masterNode.children[atIndex - 1]) {
            return this.masterNode.children[atIndex - 1];
        } else {
            return false;
        }
    }
    
    getTextContent(): string {
        // It may seem weird to return all the texts ignoring the real HTMLElements
        // Let's try this for now...
        let realTextContent = '';
        this.wrappingNode.childNodes.forEach((elem) => {
            if (elem instanceof Text) {
                realTextContent += elem.wholeText;
            }
        });
        return realTextContent;
    }
    
    setContent(value: string): void {
        if (this.#isTextInput()) {
            (this.masterNode as HTMLInputElement | HTMLTextAreaElement).value = value;
        } else {
            this.setNodeContent(value);
        }
    }
    
    getContent(): string {
        if (this.#isTextInput()) {
            return (this.masterNode as HTMLInputElement | HTMLTextAreaElement).value;
        } else {
            return this.getTextContent();
        }
    }
    
    setTextContent(text: string): void {
        this.wrappingNode.textContent = text;
    }
    
    setNodeContent(contentAsString: string): void {
        this.wrappingNode.innerHTML = contentAsString;
    }
    
    appendTextNode(text: string): void {
        const elem = document.createTextNode(text);
        this.wrappingNode.appendChild(elem);
    }
    
    addChildNodeAt(childNode: HTMLElement, atIndex: number): void {
        const lowerIndexChild = this.getChildNodeAtIndex(atIndex);
        if (lowerIndexChild) {
            lowerIndexChild.insertAdjacentElement('afterend', childNode);
        } else {
            this.wrappingNode.appendChild(childNode);
        }
    }
    
    empty(): void {
        this.wrappingNode.innerHTML = '';
    }
    
    /**
     * NOTE: These methods are commented out in original. 
     * Consider removing if not needed or re-implementing if needed.
     */
    getMultilineContent(contentAsArray: string[], templateNodeName : string): DocumentFragment {
        return this.getFragmentFromContent(contentAsArray, templateNodeName);
    }
    
    getFragmentFromContent(contentAsArray: string[], templateNodeName: string): DocumentFragment {
        const fragment = document.createDocumentFragment();
        contentAsArray.forEach((val: HTMLElement | string) => {
            const elem = document.createElement(templateNodeName);
            if (val instanceof HTMLElement) {
                elem.appendChild(val);
                fragment.appendChild(elem);
                return;
            }
            elem.innerHTML = val;
            fragment.appendChild(elem);
        });
        return fragment;
    }

    setContentFromArray(contentAsArray: string[], templateNodeName : string): void {
        this.empty();
        this.wrappingNode.appendChild(this.getMultilineContent(contentAsArray, templateNodeName));
    }
    
    updateBGColor(color: string): void {
        this.masterNode.style.backgroundColor = color;
    }
    
    /**
     * These methods are implemented as a reminder and a potentially needed fallback,
     * but in most cases of hiding/showing, we should prefer the reactive states-based mechanism:
     * states : [{hidden : 'hidden'}} will be automagically reflected on the DOM node
     */
    hide(): void {
        this.masterNode.hidden = true;
    }
    
    show(): void {
        this.masterNode.hidden = false;
    }
}

export default DOMViewStrategy;