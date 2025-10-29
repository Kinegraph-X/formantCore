/**
 * @module main
 */
import CreateStyle from './modules/style/CreateStyle.js'
import {ComponentBase} from './modules/component/Component.js';
import EffectCtx from './modules/reactivity/EffectCtx.js';
import {WorkerWrapper} from './modules/worker/WorkerWrapper.js';
import {ComponentError} from './modules/error/Error.js';
import {Logger} from './modules/log/Logger.js';

export * from './modules/template/TemplateFactory.js';
export * from './modules/nativeTypesUtilities/StringUtilities.js';
export * from './modules/nativeTypesUtilities/BooleanUtilities.js';
export * from './modules/decorators';

/** @ts-ignore Virtual modules can't be statically resolved */
import autoImport from 'virtual:auto-import.js'
const componentTypes = autoImport.coreComponentLib;


export  {
    CreateStyle,
    ComponentBase,
    componentTypes,
    EffectCtx,
    WorkerWrapper,
    ComponentError,
    Logger,
};