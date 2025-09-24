/**
 * CreateStyle
 */

const Stylesheet = require('src/coreTest/styleManagement/Stylesheet');
const {styleUIDGenerator} = require('src/coreTest/UIDGenerator');

module.exports = (uniqueID, styles) => {
    return new Stylesheet(styles, uniqueID || 'stylesheet' + styleUIDGenerator.newUID());
}