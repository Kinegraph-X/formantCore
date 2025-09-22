/**
 * @module Orchestrator
 */

const Renderer = require('src/coreTest/Renderer');
const ComponentFactory = require('src/coreTest/ComponentFactory');
const ListBinder = require('src/coreTest/ListBinder');
const StreamFactory = require('src/coreTest/StreamFactory');
const ReactivityBinder = require('src/coreTest/ReactivityBinder');

class Orchestrator {
    constructor() {
        throw new Error("Orchestrator is static-only; do not instantiate.");
    }
}