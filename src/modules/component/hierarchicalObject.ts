/**
 * @module Component
 */

import { compUIDGenerator } from '../UIDGenerator.js';



export class BaseHierarchicalObject {
    /** @type {string} */
    static objectType = 'HierarchicalObject';
    /** @type {string} */
    _UID : string;
    /** @type {Number} */
    key : number = 0;
    /** @type {HierarchicalObject[]} */
    children : HierarchicalObject[] = [];

    constructor() {
        this._UID = compUIDGenerator.newUID();
    }

    /**
     * 
     * @returns {string}
     */
    getType() {
        const ctor = this.constructor as unknown as {objectType : string};
        return ctor.objectType;
    }

    /**
     * 
     */
    getFirstChild() {
        return this.children[0];
    }
    
    /**
     * @param {number} idx
     */
    getChildAt(idx : number) {
        return this.children[idx];
    }
    
    /**
     * 
     */
    getLastChild() {
        return this.children[this.children.length - 1];
    }
    
    /**
     * @param {HierarchicalObject} child : an instance of another object of the same type
     */
    pushChild(child : HierarchicalObject) {
        child.parent = this;
        child.key = this.children.length;
        this.children.push(child);
        // this.onAddChild(child);
        return true;
    }
    
    /**
     * @param {HierarchicalObject} child : an instance of another object
     * @param {Number} atIndex : the required index to splice at
     */
    addChildAt(child : HierarchicalObject, atIndex : number) {
        if (atIndex >= this.children.length) {
            console.error(Object.getPrototypeOf(this).objectType, 'atIndex is out of bounds (array of children)');
            return;
        }
            
        child.parent = this;
        child.key = atIndex;
        this.children.splice(atIndex, 0, child);
        this.generateKeys(atIndex);
        // this.onAddChild(child, atIndex);
    }
    
    /**
     * @param {Number} atIndex : the required index to clear at
     */
    removeChildAt(atIndex : number) {
        if (atIndex >= this.children.length){
            console.error(Object.getPrototypeOf(this).objectType, 'childKey is out of bounds (array of children)');
            return;
        }
        var removedChild = this.children.splice(atIndex, 1);
        this.generateKeys(atIndex);
        // this.onRemoveChild(removedChild[0]);
    }
    
    /**
     * 
     */
    removeAllChildren() {
        // this._children.forEach(function(child) {
        // 	this.onRemoveChild(child);
        // }, this);
        this.children.length = 0;
        return true;
    }
    
    /**
     * @param {Number} atIndex : the first _key we need to invalidate
     */
    generateKeys(atIndex : number) {
        for (let i = atIndex || 0, l = this.children.length; i < l; i++) {
            this.children[i].key = i;
        }
    }
}


export class RootHierarchicalObject extends BaseHierarchicalObject {

}


export class HierarchicalObject extends BaseHierarchicalObject {
    
    /** @type {BaseHierarchicalObject} */
    parent : BaseHierarchicalObject = new RootHierarchicalObject();
    
    /**
     * @param {HierarchicalObject} parent
     */
    constructor(parent : HierarchicalObject) {
        super();
        this.parent = /** @type {HierarchicalObject} */ parent;
    }

    getSelfDepth() {
        let depth = 0, currentParent = this.parent;
        while (currentParent) {
            currentParent = (currentParent as HierarchicalObject).parent;
            depth++;
        }
        return depth;
    }
}

