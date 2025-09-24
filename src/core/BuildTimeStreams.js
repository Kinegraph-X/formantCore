/**
 * @module BuildTimeStreams
 */

const {Stream} = require('src/coreTest/CoreTypes');
const registries = require('src/coreTest/Registries');

const streams = {};

registries.streams.get('UID123').push(new Stream('action123', undefined));

module.exports = streams;