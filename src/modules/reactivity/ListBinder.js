/**
 * @module ListBinder
 */

/**
 * @typedef {import('../template/TemplateFactory').ComponentTemplate} ComponentTemplate
 * @typedef {import('../reactivity/Dataset').ReactiveDatasetItem} ReactiveDatasetItem
 */


class ListBinder {
    constructor() {
        throw new Error("ListBinder is static-only; do not instantiate.");
    }
    /**
     * @param {ComponentWithView} component 
     * @param {ReactiveDatasetItem} itemFromDataset 
     */
    bindListItem(component, itemFromDataset) {
        for (var prop in itemFromDataset) {
            if (!component.streams[prop])
                continue;
            Object.defineProperty(
                itemFromDataset,
                prop,
                {
                    get : function() {return this.value}.bind(component.streams[prop]),
                    set : function(val) {this.value = val}.bind(component.streams[prop])
                }
            );
        }
    }
}