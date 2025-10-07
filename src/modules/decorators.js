/**
 * @module decorators
 * These are theoritical TS decorators: decorators are transformed at build time
 */

/**
 * @typedef {import('./template/TemplateFactory.js').ComponentTemplateDef} ComponentTemplateDef
 * @typedef {import('./template/TemplateFactory.js').ViewTemplateDef} ViewTemplateDef
 */

function Component() {return /** @param {ComponentTemplateDef} target */ (target) => target};
function View() {return /** @param {ViewTemplateDef} target */ (target) => target};
function Output() {return /** @param {any} target */ (target) => {}};
function Imperative() {return /** @param {any} target */ (target) => {}};

export {
    Component,
    View,
    Output,
    Imperative
}