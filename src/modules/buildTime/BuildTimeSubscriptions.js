/**
 * @module BuildTimeSubscriptions
 */

import {ReactivityQuery} from '../template/TemplateFactory';
import ReactivityBinder from '../reactivity/ReactivityBinder.js';
import registries from '../Registries';

const queries = {};

// registries.reactOnSelf.get('UID123').push(new ReactivityQuery({
//     from : 'action123',
//     to : registries.imperatives['UID123'].streamName
// }));

module.exports = queries;
