/**
 * @module main
 */
import CreateStyle from './modules/style/CreateStyle.js'
import {ComponentWithView} from './modules/component/Component.js';
import EffectCtx from './modules/reactivity/EffectCtx';
import {WorkerWrapper} from './modules/worker/WorkerWrapper.js';
import {ComponentError} from './modules/error/Error.js';
import {Logger} from './modules/log/Logger.js';
import StringUtilities from './modules/nativeTypesUtilities/StringUtilities.js';
import Boolean from './modules/nativeTypesUtilities/BooleanUtilities.js';

export * from './modules/template/TemplateFactory.js'

export  {
    CreateStyle,
    ComponentWithView,
    EffectCtx,
    WorkerWrapper,
    ComponentError,
    Logger,
    StringUtilities,
    Boolean,
};