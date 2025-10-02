/**
 * @module ListBinder
 */

/**
 * @typedef {import('../template/TemplateFactory').ComponentTemplate} ComponentTemplate
 * @typedef {import('../reactivity/Stream').default<unknown>} Stream
 * typedef {import('../reactivity/Dataset').ReactiveDatasetItem} ReactiveDatasetItem
 */


class ListBinder {
    constructor() {
        throw new Error("ListBinder is static-only; do not instantiate.");
    }
    /**
     * @param {Map<string, Stream>} streams 
     * @param {{[keu: string]: unknown}} itemFromDataset (ReactiveDatasetItem)
     */
    static bindListItem(streams, itemFromDataset) {
        for (var prop in itemFromDataset) {
            if (!streams.get(prop))
                continue;
            Object.defineProperty(
                itemFromDataset,
                prop,
                {
                    get : (
                        () => {
                            const thisArg = /** @type {unknown} */ (this);
                            return /** @type {Stream} */ (thisArg).next;
                        }
                    ).bind(streams.get(prop)),
                    set : (
                        /**@param {unknown} val */
                        (val) => {
                            this.value = val;
                        }
                    ).bind(streams.get(prop))
                }
            );
        }
    }
}

export default ListBinder;