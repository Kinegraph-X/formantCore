/**
 * @module viewRef
 */
import {ViewTemplate} from '../template/TemplateFatory.js';
import {RootComponentView, ComponentView} from '../view/ComponentView.js';

export default class viewRef {
    /** @type {RootComponentView|ComponentView} */
    view = new RootComponentView(new ViewTemplate());
    constructor() {
        const self = this;
        Object.defineProperty(this, 'instance', {
            get() {
                return self.view;
            },
            /** @param {ComponentView} view */
            set(view) {
                self.view = view;
            }
        })
    }
    create() {
        return new viewRef().instance;
    }
}