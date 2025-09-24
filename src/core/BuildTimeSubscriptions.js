/**
 * @module BuildTimeSubscriptions
 */

const {ReactivityQuery} = require('src/coreTest/TemplateFactory');
const ReactivityBinder = require('src/coreTest/ReactivityBinder');
const registries = require('src/coreTest/Registries');

const queries = {};

registries.reactOnSelf.get('UID123').push(new ReactivityQuery({
    from : 'action123',
    to : registries.imperatives['UID123'].streamName
}));

module.exports = queries;
