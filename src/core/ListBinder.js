/**
 * @module ListBinder
 */

/**
 * @typedef {import('src/coreTest/TemplateFactory').ComponentTemplate} ComponentTemplate
 * @typedef {import('src/coreTest/ReactiveDataset')} ReactiveDataset
 */


class ListBinder {
    constructor() {
        throw new Error("ListBinder is static-only; do not instantiate.");
    }
    /**
     * @param {ComponentWithView} component 
     * @param {ReactiveDatasetItem} itemFromStore 
     */
    bindListItem(component, itemFromStore) {
        for (var prop in itemFromStore) {
            if (!component.streams[prop])
                continue;
            Object.defineProperty(
                itemFromStore,
                prop,
                {
                    get : function() {return this.value}.bind(component.streams[prop]),
                    set : function(val) {this.value = val}.bind(component.streams[prop])
                }
            );
        }
    }
}