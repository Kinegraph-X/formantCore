import {ComponentError} from '../error/Error.js';
import {Output, Component} from '../decorators.js';
import {ComponentTemplate, ViewTemplate} from '../template/TemplateFactory.js';
import CreateStyle from '../style/CreateStyle.js'
import {ComponentBase} from './Component.js'
import {ComponentView} from '../view/ComponentView'
import {EventEmitter} from '../eventEmitter/EventEmitter'
import Stream from '../reactivity/Stream';
export * from '../registryAccessors';

export {
    ComponentError,
    Output,
    Component,
    ComponentTemplate,
    ViewTemplate,
    CreateStyle,
    ComponentBase,
    ComponentView,
    EventEmitter,
    Stream
}