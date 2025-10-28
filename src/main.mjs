/**
 * @module main
 */
import {ComponentDecorator, View, Output, Imperative} from './modules/decorators.js';
import CreateStyle from './modules/style/CreateStyle.js'
import {Component} from './modules/component/Component.js';
import EffectCtx from './modules/reactivity/EffectCtx.js';
import {WorkerWrapper} from './modules/worker/WorkerWrapper.js';
import {ComponentError} from './modules/error/Error.js';
import {Logger} from './modules/log/Logger.js';

export * from './modules/template/TemplateFactory.js';
export * from './modules/nativeTypesUtilities/StringUtilities.js';
export * from './modules/nativeTypesUtilities/BooleanUtilities.js';

/** @ts-ignore Virtual modules can't be statically resolved */
import autoImport from 'virtual:auto-import.js'
const componentTypes = autoImport.coreComponentLib;

const decorators = {ComponentDecorator, View, Output, Imperative};

export  {
    decorators,
    CreateStyle,
    Component,
    componentTypes,
    EffectCtx,
    WorkerWrapper,
    ComponentError,
    Logger,
};